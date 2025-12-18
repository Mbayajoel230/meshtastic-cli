# Meshtastic CLI Packet Viewer - Implementation Plan

## Overview
A cypherpunk-style terminal interface for viewing and inspecting Meshtastic mesh network packets in real-time, with Wireshark-like packet inspection capabilities.

## Tech Stack
- **Runtime**: Bun
- **Language**: TypeScript
- **TUI**: Ink (React for CLIs)
- **Protobufs**: @bufbuild/protobuf + protobuf-es
- **Serial**: serialport npm package

## Project Structure
```
cli-experimental/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                    # Entry point
│   ├── app.ts                      # Main application
│   │
│   ├── transport/
│   │   ├── types.ts                # Transport interface
│   │   ├── serial.ts               # USB Serial (115200 baud)
│   │   ├── tcp.ts                  # TCP/IP transport
│   │   └── framing.ts              # Frame parser [0x94][0xc3][len][payload]
│   │
│   ├── proto/
│   │   └── generated/              # protobuf-es generated code
│   │
│   ├── protocol/
│   │   ├── decoder.ts              # FromRadio packet decoding
│   │   ├── packet-store.ts         # Store raw + decoded packets
│   │   └── node-db.ts              # Track known nodes
│   │
│   ├── ui/
│   │   ├── theme.ts                # Cypherpunk color palette
│   │   ├── app-layout.ts           # Main layout manager
│   │   ├── components/
│   │   │   ├── PacketList.ts       # Scrolling packet list (left panel)
│   │   │   ├── NodeList.ts         # Known nodes (right panel)
│   │   │   ├── PacketInspector.ts  # Tabbed inspector (bottom)
│   │   │   ├── StatusBar.ts        # Connection/stats bar
│   │   │   ├── ChatInput.ts        # Send messages
│   │   │   └── Header.ts           # Title bar
│   │   │
│   │   ├── inspector/              # Wireshark-like views
│   │   │   ├── NormalizedView.ts   # Human-readable summary
│   │   │   ├── ProtobufView.ts     # Decoded proto tree
│   │   │   ├── HexView.ts          # Hex dump with highlighting
│   │   │   └── TabBar.ts           # Tab switching
│   │   │
│   │   └── formatters/
│   │       ├── message.ts          # TEXT_MESSAGE_APP
│   │       ├── position.ts         # POSITION_APP
│   │       ├── telemetry.ts        # TELEMETRY_APP
│   │       ├── nodeinfo.ts         # NODEINFO_APP
│   │       ├── routing.ts          # ROUTING_APP
│   │       └── generic.ts          # Fallback
│   │
│   └── utils/
│       ├── hex.ts                  # Hex formatting utilities
│       ├── proto-tree.ts           # Proto field tree builder
│       └── time.ts                 # Timestamp formatting
```

## UI Layout
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ▓▓▓ MESHTASTIC PACKET VIEWER ▓▓▓                   Connected: /dev/ttyUSB0  │
├───────────────────────────────────────────────────┬─────────────────────────┤
│ PACKET LOG                                        │ NODES                   │
│ ─────────────────────────────────────────────────│ ─────────────────────────│
│ [12:34:56] ◀ MSG !a1b2c3d4 "Hello mesh!"         │ ● Kevin  (!a1b2...)     │
│ [12:34:55] ◀ POS !b2c3d4e5 37.77° -122.4°        │ ○ John   (!b2c3...)     │
│ [12:34:54] ◀ TEL !c3d4e5f6 batt:87%              │ ○ Mike   (!c3d4...)     │
│ [12:34:53] ◀ RTE !a1b2c3d4 ACK #1234             │                         │
│ [12:34:52] ◀ ENC !d4e5f6a7 [encrypted 32 bytes]  │                         │
│►[12:34:51] ◀ MSG !e5f6a7b8 "test"       selected │                         │
├───────────────────────────────────────────────────┴─────────────────────────┤
│ [Normalized] [Protobuf] [Hex]                    ← Wireshark-style tabs     │
├─────────────────────────────────────────────────────────────────────────────┤
│ NORMALIZED VIEW                                                             │
│ Type: TEXT_MESSAGE  From: !e5f6a7b8 (Kevin)  To: broadcast  Channel: 0     │
│ Time: 12:34:51  ID: #5678  Hops: 3/7  RSSI: -92dBm  SNR: 8.5dB             │
│ Content: "test"                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Channel 0] > _                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ ▲TX:12 ▼RX:456 │ Nodes:8 │ [j/k]scroll [Tab]inspector [1-3]view [q]uit    │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Inspector Views (Wireshark-like)

### Tab 1: Normalized View
Human-readable summary of the packet:
```
Type: TEXT_MESSAGE_APP (1)
From: !e5f6a7b8 "Kevin Hester"
To:   broadcast (0xffffffff)
Channel: 0 (Primary)
Packet ID: #5678
Hop Limit: 3/7
Want ACK: false

Reception:
  Time: 2024-01-15 12:34:51
  RSSI: -92 dBm
  SNR: 8.5 dB

Payload:
  "test"
```

### Tab 2: Protobuf View
Structured tree showing decoded protobuf fields:
```
FromRadio
├─ id: 12345
└─ packet: MeshPacket
   ├─ from: 3857246136 (0xe5f6a7b8)
   ├─ to: 4294967295 (broadcast)
   ├─ channel: 0
   ├─ id: 5678
   ├─ hop_limit: 3
   ├─ want_ack: false
   ├─ rx_time: 1705326891
   ├─ rx_rssi: -92
   ├─ rx_snr: 8.5
   └─ decoded: Data
      ├─ portnum: TEXT_MESSAGE_APP (1)
      └─ payload: "test" (4 bytes)
```

### Tab 3: Hex View (with highlighting)
Raw bytes with protobuf field boundaries highlighted:
```
Offset   00 01 02 03 04 05 06 07  08 09 0A 0B 0C 0D 0E 0F   ASCII
──────────────────────────────────────────────────────────────────
0000     08 39 30 12 2A 08 B8 A7  F6 E5 10 FF FF FF FF 18   .90.*...........
         ── id ── ── packet.from ─ ── packet.to ──── ──
0010     00 20 AE 2C 28 03 30 00  3D 8B 5B E9 65 45 A8 FF   . .,(.0.=.[.eE..
         ch id    hop want rx_time─────── rx_rssi ──
0020     FF FF 4D 00 00 08 41 52  01 0A 04 74 65 73 74      ..M...AR...test
         ────── rx_snr decoded portnum payload ────
```

## Color Theme (Cypherpunk)
```typescript
const theme = {
  bg: { primary: "#0a0e14", panel: "#0d1117" },
  fg: { primary: "#c5c8c6", accent: "#00ff9f", muted: "#6e7681" },
  packet: {
    message: "#00ff9f",   // Green
    position: "#00bfff",  // Cyan
    telemetry: "#ff9f00", // Orange
    nodeinfo: "#bf00ff",  // Purple
    routing: "#666666",   // Gray
    encrypted: "#ff0040", // Red
    unknown: "#404040",   // Dark gray
  },
  hex: {
    field1: "#7aa2f7",    // Blue
    field2: "#9ece6a",    // Green
    field3: "#f7768e",    // Pink
    field4: "#bb9af7",    // Purple
    ascii: "#565f89",     // Dim
  }
}
```

## Implementation Phases

### Phase 1: Project Setup
- Initialize package.json with dependencies
- Configure tsconfig.json for Bun
- Use @meshtastic/protobufs for protocol buffers
- Basic serial framing parser

### Phase 2: Transport Layer
- Serial transport with connection handling
- TCP transport for WiFi nodes
- FromRadio/ToRadio packet encoding/decoding
- Packet store (keeps raw bytes + decoded)

### Phase 3: UI Foundation
- OpenTUI renderer setup with theme
- Main layout with panels (PacketList, NodeList, Inspector)
- Header and StatusBar components
- Keyboard navigation (j/k scroll, Tab focus, q quit)

### Phase 4: Packet Display
- PacketList with scrolling (ScrollBoxRenderable)
- Formatters for each packet type
- Color coding by portnum
- Handle encrypted packets gracefully

### Phase 5: Inspector Views
- TabBar for view switching
- NormalizedView - human readable
- ProtobufView - decoded tree structure
- HexView - hex dump with field highlighting

### Phase 6: Chat & Polish
- ChatInput for sending messages
- Node database updates
- Error handling and reconnection
- ASCII art header

## Serial Protocol
```
Frame: [0x94][0xc3][MSB_LEN][LSB_LEN][PROTOBUF_PAYLOAD]
Baud:  115200
```

## Dependencies
```json
{
  "dependencies": {
    "@opentui/core": "file:../opentui/packages/core",
    "@bufbuild/protobuf": "^2.0.0",
    "serialport": "^12.0.0"
  },
  "devDependencies": {
    "@bufbuild/protoc-gen-es": "^2.0.0",
    "@types/bun": "latest",
    "typescript": "^5.0.0"
  }
}
```
