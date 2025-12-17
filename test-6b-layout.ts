// Test 6b: Create layout components
import { createCliRenderer, BoxRenderable, TextRenderable, ScrollBoxRenderable, t, fg, bold } from "@opentui/core";

const theme = {
  bg: { primary: "#0a0e14", panel: "#0d1117" },
  fg: { primary: "#c5c8c6", accent: "#00ff9f", muted: "#3d444c", secondary: "#6e7681" },
  border: { normal: "#2d333b" },
};

async function test() {
  console.error("Test 6b: Creating renderer...");
  const renderer = await createCliRenderer({
    exitOnCtrlC: true,
    targetFps: 30,
    useKittyKeyboard: null,
    useMouse: false,
    useAlternateScreen: true,
  });
  renderer.setBackgroundColor(theme.bg.primary);
  console.error("Test 6b: Renderer created");

  // Header
  console.error("Test 6b: Creating header...");
  const header = new BoxRenderable(renderer, {
    id: "header",
    width: "100%",
    height: 3,
    backgroundColor: theme.bg.panel,
    border: true,
    borderColor: theme.border.normal,
  });
  const title = new TextRenderable(renderer, {
    content: t`${bold(fg(theme.fg.accent)("TEST"))}`,
  });
  header.add(title);
  console.error("Test 6b: Header created");

  // Mode container
  console.error("Test 6b: Creating modeContainer...");
  const modeContainer = new BoxRenderable(renderer, {
    id: "mode-container",
    width: "100%",
    flexGrow: 1,
    flexDirection: "column",
  });
  console.error("Test 6b: modeContainer created");

  // Status bar
  console.error("Test 6b: Creating statusBar...");
  const statusBar = new BoxRenderable(renderer, {
    id: "status-bar",
    width: "100%",
    height: 1,
    backgroundColor: theme.bg.panel,
  });
  const statusText = new TextRenderable(renderer, {
    content: t`${fg(theme.fg.secondary)("Status")}`,
  });
  statusBar.add(statusText);
  console.error("Test 6b: statusBar created");

  // Packet list (ScrollBox)
  console.error("Test 6b: Creating packetList...");
  const packetList = new ScrollBoxRenderable(renderer, {
    id: "packet-list",
    rootOptions: {
      backgroundColor: theme.bg.panel,
      border: true,
      borderColor: theme.border.normal,
      flexGrow: 1,
    },
    viewportOptions: { backgroundColor: theme.bg.primary },
    contentOptions: { backgroundColor: theme.bg.primary },
  });
  console.error("Test 6b: packetList created");

  // Add to tree
  console.error("Test 6b: Adding to render tree...");
  modeContainer.add(packetList);
  renderer.root.add(header);
  renderer.root.add(modeContainer);
  renderer.root.add(statusBar);
  console.error("Test 6b: Render tree complete");

  setTimeout(() => process.exit(0), 2000);
}

test().catch(e => {
  console.error("Test 6b FAILED:", e.message);
  console.error(e.stack);
  process.exit(1);
});
