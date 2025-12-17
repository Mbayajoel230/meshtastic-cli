import { HttpTransport } from "./transport";
import { decodeFromRadio, PacketStore } from "./protocol";
import { Portnums } from "@meshtastic/protobufs";

const ADDRESS = process.argv[2] || "192.168.0.123";

async function main() {
  console.log(`Connecting to ${ADDRESS}...`);

  const transport = await HttpTransport.create(ADDRESS);
  const store = new PacketStore();

  store.onPacket((packet) => {
    const time = packet.timestamp.toLocaleTimeString();

    if (packet.decodeError) {
      console.log(`[${time}] ERROR: ${packet.decodeError}`);
      return;
    }

    const fr = packet.fromRadio;
    if (!fr) return;

    const variantCase = fr.payloadVariant.case;

    if (variantCase === "packet" && packet.meshPacket) {
      const mp = packet.meshPacket;
      const from = `!${mp.from.toString(16).padStart(8, "0")}`;
      const to = mp.to === 0xffffffff ? "broadcast" : `!${mp.to.toString(16).padStart(8, "0")}`;
      const portName = packet.portnum !== undefined
        ? Portnums.PortNum[packet.portnum] || `PORT_${packet.portnum}`
        : "ENCRYPTED";

      let payloadStr = "";
      if (typeof packet.payload === "string") {
        payloadStr = ` "${packet.payload}"`;
      } else if (packet.payload instanceof Uint8Array) {
        payloadStr = ` [${packet.payload.length} bytes]`;
      }

      console.log(`[${time}] ${portName} ${from} → ${to}${payloadStr}`);
    } else if (variantCase) {
      console.log(`[${time}] ${variantCase.toUpperCase()}`);
    }
  });

  console.log("Listening for packets... (Ctrl+C to exit)\n");

  let lastStatus = "";
  for await (const output of transport.fromDevice) {
    if (output.type === "status") {
      const statusStr = `${output.status}${output.reason ? ` (${output.reason})` : ""}`;
      if (statusStr !== lastStatus) {
        console.log(`Status: ${statusStr}`);
        lastStatus = statusStr;
      }
    } else if (output.type === "packet") {
      const decoded = decodeFromRadio(output.data);
      store.add(decoded);
    }
  }
}

main().catch(console.error);
