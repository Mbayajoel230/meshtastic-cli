import type { DeviceOutput, DeviceStatus, Transport } from "./types";

const POLL_INTERVAL_MS = 2000;
const TIMEOUT_MS = 5000;

export class HttpTransport implements Transport {
  private url: string;
  private running = false;
  private outputs: DeviceOutput[] = [];
  private resolvers: Array<(value: IteratorResult<DeviceOutput>) => void> = [];
  private lastStatus: DeviceStatus = "disconnected";

  constructor(url: string) {
    this.url = url.replace(/\/$/, "");
  }

  static async create(address: string, tls = false): Promise<HttpTransport> {
    const url = `${tls ? "https" : "http"}://${address}`;
    await fetch(`${url}/api/v1/fromradio`, {
      method: "GET",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const transport = new HttpTransport(url);
    transport.startPolling();
    return transport;
  }

  private startPolling() {
    this.running = true;
    this.emit({ type: "status", status: "connecting" });
    this.poll();
  }

  private async poll() {
    while (this.running) {
      try {
        const response = await fetch(`${this.url}/api/v1/fromradio?all=false`, {
          method: "GET",
          headers: { Accept: "application/x-protobuf" },
          signal: AbortSignal.timeout(TIMEOUT_MS),
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        this.emit({ type: "status", status: "connected" });

        const buffer = await response.arrayBuffer();
        if (buffer.byteLength > 0) {
          const data = new Uint8Array(buffer);
          this.emit({ type: "packet", data, raw: data });
        }
      } catch (e) {
        if (this.running) {
          this.emit({
            type: "status",
            status: "disconnected",
            reason: e instanceof Error ? e.message : "unknown",
          });
        }
      }
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }
  }

  private emit(output: DeviceOutput) {
    if (output.type === "status") {
      if (output.status === this.lastStatus) return;
      this.lastStatus = output.status;
    }
    const resolver = this.resolvers.shift();
    if (resolver) {
      resolver({ value: output, done: false });
    } else {
      this.outputs.push(output);
    }
  }

  get fromDevice(): AsyncIterable<DeviceOutput> {
    const self = this;
    return {
      [Symbol.asyncIterator]() {
        return {
          next(): Promise<IteratorResult<DeviceOutput>> {
            const queued = self.outputs.shift();
            if (queued) return Promise.resolve({ value: queued, done: false });
            if (!self.running) return Promise.resolve({ value: undefined as any, done: true });
            return new Promise((resolve) => self.resolvers.push(resolve));
          },
        };
      },
    };
  }

  async send(data: Uint8Array): Promise<void> {
    const response = await fetch(`${this.url}/api/v1/toradio`, {
      method: "PUT",
      headers: { "Content-Type": "application/x-protobuf" },
      body: data,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
  }

  async disconnect(): Promise<void> {
    this.running = false;
    this.emit({ type: "status", status: "disconnected", reason: "user" });
    for (const resolver of this.resolvers) {
      resolver({ value: undefined as any, done: true });
    }
    this.resolvers = [];
  }
}
