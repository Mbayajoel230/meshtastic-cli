// Test 6c: Add inspector
import { createCliRenderer, BoxRenderable, TextRenderable, ScrollBoxRenderable, t, fg, bold } from "@opentui/core";
import { PacketInspector } from "./src/ui/inspector";

const theme = {
  bg: { primary: "#0a0e14", panel: "#0d1117" },
  fg: { primary: "#c5c8c6", accent: "#00ff9f", muted: "#3d444c", secondary: "#6e7681" },
  border: { normal: "#2d333b" },
};

async function test() {
  console.error("Test 6c: Creating renderer...");
  const renderer = await createCliRenderer({
    exitOnCtrlC: true,
    targetFps: 30,
    useKittyKeyboard: null,
    useMouse: false,
    useAlternateScreen: true,
  });
  renderer.setBackgroundColor(theme.bg.primary);

  console.error("Test 6c: Creating inspector...");
  const inspector = new PacketInspector(renderer);
  console.error("Test 6c: Inspector created");

  renderer.root.add(inspector.element);
  console.error("Test 6c: Inspector added to tree");

  setTimeout(() => process.exit(0), 2000);
}

test().catch(e => {
  console.error("Test 6c FAILED:", e.message);
  console.error(e.stack);
  process.exit(1);
});
