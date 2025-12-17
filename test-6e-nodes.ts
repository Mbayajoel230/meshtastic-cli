// Test 6e: Add nodes panel
import { createCliRenderer } from "@opentui/core";
import { NodesPanel } from "./src/ui/nodes";
import { NodeStore } from "./src/protocol";

async function test() {
  console.error("Test 6e: Creating renderer...");
  const renderer = await createCliRenderer({
    exitOnCtrlC: true,
    targetFps: 30,
    useKittyKeyboard: null,
    useMouse: false,
    useAlternateScreen: true,
  });

  console.error("Test 6e: Creating NodeStore...");
  const nodeStore = new NodeStore();

  console.error("Test 6e: Creating NodesPanel...");
  const nodesPanel = new NodesPanel(renderer, nodeStore);
  console.error("Test 6e: NodesPanel created");

  renderer.root.add(nodesPanel.element);
  console.error("Test 6e: NodesPanel added to tree");

  setTimeout(() => process.exit(0), 2000);
}

test().catch(e => {
  console.error("Test 6e FAILED:", e.message);
  console.error(e.stack);
  process.exit(1);
});
