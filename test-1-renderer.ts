// Test 1: Just the renderer
import { createCliRenderer, BoxRenderable, TextRenderable, t, fg } from "@opentui/core";

async function test() {
  console.error("Test 1: Creating renderer...");
  const renderer = await createCliRenderer({
    exitOnCtrlC: true,
    targetFps: 30,
    useKittyKeyboard: null,
    useMouse: false,
    useAlternateScreen: true,
  });
  console.error("Test 1: Renderer created");

  const box = new BoxRenderable(renderer, {
    id: "test",
    width: "100%",
    height: 3,
    backgroundColor: "#0a0e14",
  });

  const text = new TextRenderable(renderer, {
    content: t`${fg("#00ff9f")("Test 1 passed!")}`,
  });

  box.add(text);
  renderer.root.add(box);
  console.error("Test 1: Layout added");

  setTimeout(() => process.exit(0), 2000);
}

test().catch(e => {
  console.error("Test 1 FAILED:", e.message);
  process.exit(1);
});
