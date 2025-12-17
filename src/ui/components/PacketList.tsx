import React from "react";
import { Box, Text } from "ink";
import { theme } from "../theme";
import type { DecodedPacket } from "../../protocol/decoder";
import type { NodeStore } from "../../protocol/node-store";
import { Mesh, Portnums } from "@meshtastic/protobufs";
import { formatNodeId } from "../../utils/hex";

interface PacketListProps {
  packets: DecodedPacket[];
  selectedIndex: number;
  nodeStore: NodeStore;
  height?: number;
}

export function PacketList({ packets, selectedIndex, nodeStore, height = 20 }: PacketListProps) {
  // Calculate visible window that keeps selection in view
  const visibleCount = Math.max(1, height - 2); // Account for borders

  // Calculate scroll offset to keep selection visible
  let startIndex = 0;
  if (packets.length > visibleCount) {
    // Keep selection in middle of viewport when possible
    const halfView = Math.floor(visibleCount / 2);
    startIndex = Math.max(0, Math.min(
      selectedIndex - halfView,
      packets.length - visibleCount
    ));
  }

  const visiblePackets = packets.slice(startIndex, startIndex + visibleCount);

  return (
    <Box flexDirection="column" width="100%">
      {visiblePackets.map((packet, i) => {
        const actualIndex = startIndex + i;
        const isSelected = actualIndex === selectedIndex;
        return (
          <PacketRow
            key={`${packet.id}-${actualIndex}`}
            packet={packet}
            nodeStore={nodeStore}
            isSelected={isSelected}
          />
        );
      })}
    </Box>
  );
}

interface PacketRowProps {
  packet: DecodedPacket;
  nodeStore: NodeStore;
  isSelected: boolean;
}

function PacketRow({ packet, nodeStore, isSelected }: PacketRowProps) {
  const time = packet.timestamp.toLocaleTimeString("en-US", { hour12: false });
  const bgColor = isSelected ? theme.bg.selected : undefined;

  if (packet.decodeError) {
    return (
      <Box backgroundColor={bgColor}>
        <Text color={theme.fg.muted}>[{time}] </Text>
        <Text color={theme.packet.unknown}>ERROR </Text>
        <Text>{packet.decodeError}</Text>
      </Box>
    );
  }

  const fr = packet.fromRadio;
  if (!fr) {
    return (
      <Box backgroundColor={bgColor}>
        <Text color={theme.fg.muted}>[{time}] </Text>
        <Text color={theme.packet.unknown}>EMPTY</Text>
      </Box>
    );
  }

  const variantCase = fr.payloadVariant.case;

  if (variantCase === "packet" && packet.meshPacket) {
    const mp = packet.meshPacket;
    const fromName = nodeStore.getNodeName(mp.from);
    const toName = mp.to === 0xffffffff ? "^all" : nodeStore.getNodeName(mp.to);
    const portName = packet.portnum !== undefined
      ? Portnums.PortNum[packet.portnum]?.replace(/_APP$/, "") || `PORT_${packet.portnum}`
      : "ENCRYPTED";
    const color = getPortColor(packet.portnum);

    let payload = "";
    if (typeof packet.payload === "string") {
      payload = ` "${packet.payload.slice(0, 40)}${packet.payload.length > 40 ? "..." : ""}"`;
    } else if (packet.portnum === Portnums.PortNum.ROUTING_APP && packet.payload && typeof packet.payload === "object") {
      const routing = packet.payload as { variant?: { case?: string; value?: number } };
      if (routing.variant?.case === "errorReason" && routing.variant.value !== undefined) {
        const errorName = Mesh.Routing_Error[routing.variant.value] || `ERROR_${routing.variant.value}`;
        payload = routing.variant.value === Mesh.Routing_Error.NONE ? " ACK" : ` ${errorName}`;
      }
    } else if (packet.portnum === Portnums.PortNum.TRACEROUTE_APP && packet.payload && typeof packet.payload === "object") {
      const route = (packet.payload as { route?: number[] }).route;
      if (route && route.length > 0) {
        payload = ` via ${route.length} hop${route.length > 1 ? "s" : ""}`;
      }
    }

    return (
      <Box backgroundColor={bgColor}>
        <Text color={theme.fg.muted}>[{time}] </Text>
        <Text color={theme.fg.accent}>{"◀"} </Text>
        <Text color={color}>{portName.padEnd(14)}</Text>
        <Text color={theme.fg.secondary}>{fromName.padEnd(10)}</Text>
        <Text color={theme.fg.muted}> → </Text>
        <Text color={theme.fg.secondary}>{toName.padEnd(10)}</Text>
        <Text color={theme.fg.primary}>{payload}</Text>
      </Box>
    );
  }

  if (variantCase === "nodeInfo") {
    const info = fr.payloadVariant.value as Mesh.NodeInfo;
    const name = info.user?.shortName || info.user?.longName || `!${info.num.toString(16)}`;
    const id = formatNodeId(info.num);
    return (
      <Box backgroundColor={bgColor}>
        <Text color={theme.fg.muted}>[{time}] </Text>
        <Text color={theme.fg.secondary}>{"⚙"} </Text>
        <Text color={theme.packet.nodeinfo}>{"NODEINFO".padEnd(14)}</Text>
        <Text color={theme.fg.accent}>{name.padEnd(10)}</Text>
        <Text color={theme.fg.muted}>{id}</Text>
      </Box>
    );
  }

  if (variantCase === "myInfo") {
    const myInfo = fr.payloadVariant.value as Mesh.MyNodeInfo;
    const id = formatNodeId(myInfo.myNodeNum);
    return (
      <Box backgroundColor={bgColor}>
        <Text color={theme.fg.muted}>[{time}] </Text>
        <Text color={theme.fg.secondary}>{"⚙"} </Text>
        <Text color={theme.packet.direct}>{"MY_INFO".padEnd(14)}</Text>
        <Text color={theme.fg.accent}>{id}</Text>
      </Box>
    );
  }

  if (variantCase === "config") {
    const config = fr.payloadVariant.value as Mesh.Config;
    const configType = config.payloadVariant.case || "unknown";
    return (
      <Box backgroundColor={bgColor}>
        <Text color={theme.fg.muted}>[{time}] </Text>
        <Text color={theme.fg.secondary}>{"⚙"} </Text>
        <Text color={theme.packet.config}>{"CONFIG".padEnd(14)}</Text>
        <Text color={theme.fg.secondary}>{configType}</Text>
      </Box>
    );
  }

  if (variantCase === "moduleConfig") {
    const config = fr.payloadVariant.value as Mesh.ModuleConfig;
    const configType = config.payloadVariant.case || "unknown";
    return (
      <Box backgroundColor={bgColor}>
        <Text color={theme.fg.muted}>[{time}] </Text>
        <Text color={theme.fg.secondary}>{"⚙"} </Text>
        <Text color={theme.packet.config}>{"MODULE_CONFIG".padEnd(14)}</Text>
        <Text color={theme.fg.secondary}>{configType}</Text>
      </Box>
    );
  }

  if (variantCase === "channel") {
    const channel = fr.payloadVariant.value as Mesh.Channel;
    const name = channel.settings?.name || `Channel ${channel.index}`;
    return (
      <Box backgroundColor={bgColor}>
        <Text color={theme.fg.muted}>[{time}] </Text>
        <Text color={theme.fg.secondary}>{"⚙"} </Text>
        <Text color={theme.packet.config}>{"CHANNEL".padEnd(14)}</Text>
        <Text color={theme.fg.secondary}>#{channel.index} </Text>
        <Text color={theme.fg.muted}>{name}</Text>
      </Box>
    );
  }

  if (variantCase === "configCompleteId") {
    return (
      <Box backgroundColor={bgColor}>
        <Text color={theme.fg.muted}>[{time}] </Text>
        <Text color={theme.fg.secondary}>{"⚙"} </Text>
        <Text color={theme.packet.direct}>{"CONFIG_COMPLETE".padEnd(14)}</Text>
      </Box>
    );
  }

  if (variantCase) {
    return (
      <Box backgroundColor={bgColor}>
        <Text color={theme.fg.muted}>[{time}] </Text>
        <Text color={theme.fg.secondary}>{"⚙"} </Text>
        <Text color={theme.packet.unknown}>{variantCase.toUpperCase().padEnd(14)}</Text>
      </Box>
    );
  }

  return (
    <Box backgroundColor={bgColor}>
      <Text color={theme.fg.muted}>[{time}] </Text>
      <Text color={theme.fg.secondary}>{"?"} </Text>
      <Text color={theme.packet.unknown}>{"UNKNOWN".padEnd(14)}</Text>
    </Box>
  );
}

function getPortColor(portnum?: Portnums.PortNum): string {
  if (portnum === undefined) return theme.packet.encrypted;
  switch (portnum) {
    case Portnums.PortNum.TEXT_MESSAGE_APP: return theme.packet.message;
    case Portnums.PortNum.POSITION_APP: return theme.packet.position;
    case Portnums.PortNum.TELEMETRY_APP: return theme.packet.telemetry;
    case Portnums.PortNum.NODEINFO_APP: return theme.packet.nodeinfo;
    case Portnums.PortNum.ROUTING_APP: return theme.packet.routing;
    case Portnums.PortNum.TRACEROUTE_APP: return theme.packet.traceroute;
    default: return theme.packet.unknown;
  }
}
