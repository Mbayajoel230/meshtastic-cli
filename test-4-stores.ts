// Test 4: Stores
console.error("Test 4: Importing stores...");
import { PacketStore, NodeStore } from "./src/protocol";

console.error("Test 4: Creating PacketStore...");
const packetStore = new PacketStore();
console.error("Test 4: PacketStore created, count:", packetStore.count);

console.error("Test 4: Creating NodeStore...");
const nodeStore = new NodeStore();
console.error("Test 4: NodeStore created");

console.error("Test 4 PASSED");
