// Test 6a: Just create renderer in App context
import { createCliRenderer } from "@opentui/core";

async function test() {
  console.error("Test 6a: Creating renderer...");
  const renderer = await createCliRenderer({
    exitOnCtrlC: true,
    targetFps: 30,
    useKittyKeyboard: null,
    useMouse: false,
    useAlternateScreen: true,
  });
  console.error("Test 6a: Renderer created");
  renderer.setBackgroundColor("#0a0e14");
  console.error("Test 6a: Background set");

  setTimeout(() => process.exit(0), 2000);
}

test().catch(e => {
  console.error("Test 6a FAILED:", e.message);
  process.exit(1);
});
