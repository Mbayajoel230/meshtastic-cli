import type { DecodedPacket } from "./decoder";

export class PacketStore {
  private packets: DecodedPacket[] = [];
  private maxSize = 1000;
  private listeners: Array<(packet: DecodedPacket) => void> = [];

  add(packet: DecodedPacket) {
    this.packets.push(packet);
    if (this.packets.length > this.maxSize) {
      this.packets.shift();
    }
    for (const listener of this.listeners) {
      listener(packet);
    }
  }

  getAll(): DecodedPacket[] {
    return [...this.packets];
  }

  get(id: number): DecodedPacket | undefined {
    return this.packets.find((p) => p.id === id);
  }

  onPacket(listener: (packet: DecodedPacket) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const idx = this.listeners.indexOf(listener);
      if (idx !== -1) this.listeners.splice(idx, 1);
    };
  }

  clear() {
    this.packets = [];
  }

  get count(): number {
    return this.packets.length;
  }
}
