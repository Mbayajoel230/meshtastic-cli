// Test 6: Full app startup
import { HttpTransport } from "./src/transport";
import { PacketStore, NodeStore } from "./src/protocol";
import { App } from "./src/ui/app";

async function test() {
  console.error("Test 6: Creating transport...");
  const transport = await HttpTransport.create("192.168.0.123");
  console.error("Test 6: Transport created");

  console.error("Test 6: Creating stores...");
  const packetStore = new PacketStore();
  const nodeStore = new NodeStore();
  console.error("Test 6: Stores created");

  console.error("Test 6: Creating App...");
  const app = new App(transport, packetStore, nodeStore);
  console.error("Test 6: App created");

  console.error("Test 6: Starting App...");
  await app.start();
  console.error("Test 6: App started");

  setTimeout(() => process.exit(0), 3000);
}

test().catch(e => {
  console.error("Test 6 FAILED:", e.message);
  console.error(e.stack);
  process.exit(1);
});
