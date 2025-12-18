import React from "react";
import { render } from "ink";
import { PacketStore, NodeStore } from "./protocol";
import { App } from "./ui/App";
import { initDb, clearDb, getDbPath } from "./db";

// Parse CLI arguments
const args = process.argv.slice(2);
let address = "192.168.0.123";
let skipConfig = false;
let session = "default";
let clearSession = false;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === "--skip-config") {
    skipConfig = true;
  } else if (arg === "--session" || arg === "-s") {
    session = args[++i] || "default";
  } else if (arg === "--clear") {
    clearSession = true;
  } else if (arg === "--help" || arg === "-h") {
    console.log(`
Meshtastic CLI Viewer

Usage: meshtastic-cli [address] [options]

Arguments:
  address            Device address (default: 192.168.0.123)

Options:
  --session, -s      Session name for database (default: default)
  --clear            Clear the database for the session and exit
  --skip-config      Skip loading device configuration on startup (faster connect)
  --help, -h         Show this help message
`);
    process.exit(0);
  } else if (!arg.startsWith("-")) {
    address = arg;
  }
}

// Handle --clear option
if (clearSession) {
  const dbPath = getDbPath(session);
  clearDb(session);
  console.log(`Cleared database for session "${session}" (${dbPath})`);
  process.exit(0);
}

// Initialize database
initDb(session);

const packetStore = new PacketStore();
const nodeStore = new NodeStore();

const { waitUntilExit } = render(
  React.createElement(App, {
    address,
    packetStore,
    nodeStore,
    skipConfig,
  })
);

waitUntilExit().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});
