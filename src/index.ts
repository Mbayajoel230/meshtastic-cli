import React from "react";
import { render } from "ink";
import { PacketStore, NodeStore } from "./protocol";
import { App } from "./ui/App";

const ADDRESS = process.argv[2] || "192.168.0.123";

const packetStore = new PacketStore();
const nodeStore = new NodeStore();

const { waitUntilExit } = render(
  React.createElement(App, { address: ADDRESS, packetStore, nodeStore })
);

waitUntilExit().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});
