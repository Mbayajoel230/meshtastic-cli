import React from "react";
import { render } from "ink";
import { HttpTransport } from "./transport";
import { PacketStore, NodeStore } from "./protocol";
import { App } from "./ui/App";

const ADDRESS = process.argv[2] || "192.168.0.123";

async function main() {
  const transport = await HttpTransport.create(ADDRESS);
  const packetStore = new PacketStore();
  const nodeStore = new NodeStore();

  const { waitUntilExit } = render(
    React.createElement(App, { transport, packetStore, nodeStore })
  );

  await waitUntilExit();
}

main().catch((e) => {
  console.error("Failed to start:", e.message);
  process.exit(1);
});
