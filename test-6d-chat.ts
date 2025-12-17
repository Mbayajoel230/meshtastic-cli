// Test 6d: Add chat panel
import { createCliRenderer } from "@opentui/core";
import { ChatPanel } from "./src/ui/chat";
import { NodeStore } from "./src/protocol";

async function test() {
  console.error("Test 6d: Creating renderer...");
  const renderer = await createCliRenderer({
    exitOnCtrlC: true,
    targetFps: 30,
    useKittyKeyboard: null,
    useMouse: false,
    useAlternateScreen: true,
  });

  console.error("Test 6d: Creating NodeStore...");
  const nodeStore = new NodeStore();

  console.error("Test 6d: Creating ChatPanel...");
  const chatPanel = new ChatPanel(renderer, nodeStore);
  console.error("Test 6d: ChatPanel created");

  renderer.root.add(chatPanel.element);
  console.error("Test 6d: ChatPanel added to tree");

  setTimeout(() => process.exit(0), 2000);
}

test().catch(e => {
  console.error("Test 6d FAILED:", e.message);
  console.error(e.stack);
  process.exit(1);
});
