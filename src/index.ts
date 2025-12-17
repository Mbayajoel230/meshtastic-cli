import { HttpTransport } from "./transport";
import { PacketStore } from "./protocol";
import { App } from "./ui/app";

const ADDRESS = process.argv[2] || "192.168.0.123";

async function main() {
  const transport = await HttpTransport.create(ADDRESS);
  const store = new PacketStore();
  const app = new App(transport, store);
  await app.start();
}

main().catch((e) => {
  console.error("Failed to start:", e.message);
  process.exit(1);
});
