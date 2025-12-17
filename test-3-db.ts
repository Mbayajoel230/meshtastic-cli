// Test 3: Database
console.error("Test 3: Importing db...");
import * as db from "./src/db";

console.error("Test 3: DB imported");
console.error("Test 3: Packet count:", db.getPacketCount());
console.error("Test 3: Node count:", db.getAllNodes().length);
console.error("Test 3 PASSED");
