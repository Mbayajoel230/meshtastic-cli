import { HttpTransport } from "./transport";
import { PacketStore, NodeStore } from "./protocol";
import { App } from "./ui/app";

const ADDRESS = process.argv[2] || "192.168.0.123";

async function main() {
  try {
    const transport = await HttpTransport.create(ADDRESS);
    const packetStore = new PacketStore();
    const nodeStore = new NodeStore();
    const app = new App(transport, packetStore, nodeStore);
    await app.start();
  } catch (e) {
    // Write to a file since console might be broken
    const fs = await import("fs");
    fs.writeFileSync("/tmp/meshtastic-error.log", `${e}\n${(e as Error).stack}`);
    throw e;
  }
}

main().catch((e) => {
  console.error("Failed to start:", e.message);
  process.exit(1);
});
