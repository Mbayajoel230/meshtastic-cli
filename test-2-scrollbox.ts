// Test 2: ScrollBoxRenderable
import { createCliRenderer, BoxRenderable, TextRenderable, ScrollBoxRenderable, t, fg } from "@opentui/core";

async function test() {
  console.error("Test 2: Creating renderer...");
  const renderer = await createCliRenderer({
    exitOnCtrlC: true,
    targetFps: 30,
    useKittyKeyboard: null,
    useMouse: false,
    useAlternateScreen: true,
  });
  console.error("Test 2: Renderer created");

  const scrollBox = new ScrollBoxRenderable(renderer, {
    id: "scroll",
    rootOptions: { backgroundColor: "#0a0e14", flexGrow: 1 },
    viewportOptions: { backgroundColor: "#0a0e14" },
    contentOptions: { backgroundColor: "#0a0e14" },
  });

  renderer.root.add(scrollBox);
  console.error("Test 2: ScrollBox added");

  // Add some content
  const row = new BoxRenderable(renderer, {
    id: "row-1",
    width: "100%",
    height: 1,
  });
  const text = new TextRenderable(renderer, {
    content: t`${fg("#00ff9f")("Test 2 - Row in ScrollBox")}`,
  });
  row.add(text);
  scrollBox.add(row);
  console.error("Test 2: Row added to ScrollBox");

  setTimeout(() => process.exit(0), 2000);
}

test().catch(e => {
  console.error("Test 2 FAILED:", e.message);
  process.exit(1);
});
