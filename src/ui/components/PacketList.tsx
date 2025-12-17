import React from "react";
import { Box, Text } from "ink";
import { theme } from "../theme";
import type { DecodedPacket } from "../../protocol/decoder";
import type { NodeStore } from "../../protocol/node-store";
import { Mesh, Portnums, Telemetry } from "@meshtastic/protobufs";
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

    const payload = getPacketSummary(packet, nodeStore);

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
    const shortName = info.user?.shortName || `!${info.num.toString(16)}`;
    const longName = info.user?.longName || "";
    const hw = info.user?.hwModel !== undefined && info.user?.hwModel !== 0
      ? Mesh.HardwareModel[info.user.hwModel] || ""
      : "";
    const id = formatNodeId(info.num);
    const extra = [longName, hw].filter(Boolean).join(" | ");
    return (
      <Box backgroundColor={bgColor}>
        <Text color={theme.fg.muted}>[{time}] </Text>
        <Text color={theme.fg.secondary}>{"⚙"} </Text>
        <Text color={theme.packet.nodeinfo}>{"NODEINFO".padEnd(14)}</Text>
        <Text color={theme.fg.accent}>{shortName.padEnd(6)}</Text>
        <Text color={theme.fg.muted}>{id} </Text>
        <Text color={theme.fg.primary}>{extra}</Text>
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

function getPacketSummary(packet: DecodedPacket, nodeStore: NodeStore): string {
  if (!packet.payload) return "";

  // Text message
  if (typeof packet.payload === "string") {
    const text = packet.payload.slice(0, 40);
    return ` "${text}${packet.payload.length > 40 ? "..." : ""}"`;
  }

  if (typeof packet.payload !== "object") return "";

  // Routing (ACK/error)
  if (packet.portnum === Portnums.PortNum.ROUTING_APP) {
    const routing = packet.payload as { variant?: { case?: string; value?: number } };
    if (routing.variant?.case === "errorReason" && routing.variant.value !== undefined) {
      if (routing.variant.value === Mesh.Routing_Error.NONE) return " ACK";
      return ` ${Mesh.Routing_Error[routing.variant.value] || `ERROR_${routing.variant.value}`}`;
    }
    return "";
  }

  // Traceroute - show full route
  if (packet.portnum === Portnums.PortNum.TRACEROUTE_APP) {
    const route = (packet.payload as { route?: number[] }).route;
    if (route && route.length > 0) {
      const names = route.map((n) => nodeStore.getNodeName(n)).join(" → ");
      return ` [${names}]`;
    }
    return "";
  }

  // Position - show lat/lon
  if (packet.portnum === Portnums.PortNum.POSITION_APP) {
    const pos = packet.payload as Mesh.Position;
    if (pos.latitudeI != null && pos.longitudeI != null) {
      const lat = (pos.latitudeI / 1e7).toFixed(5);
      const lon = (pos.longitudeI / 1e7).toFixed(5);
      const alt = pos.altitude != null ? ` ${pos.altitude}m` : "";
      return ` ${lat}, ${lon}${alt}`;
    }
    return "";
  }

  // NodeInfo - show long name and hardware
  if (packet.portnum === Portnums.PortNum.NODEINFO_APP) {
    const user = packet.payload as Mesh.User;
    const parts: string[] = [];
    if (user.longName) parts.push(user.longName);
    if (user.hwModel !== undefined && user.hwModel !== 0) {
      parts.push(Mesh.HardwareModel[user.hwModel] || `HW_${user.hwModel}`);
    }
    return parts.length > 0 ? ` ${parts.join(" | ")}` : "";
  }

  // Telemetry - show device metrics
  if (packet.portnum === Portnums.PortNum.TELEMETRY_APP) {
    const telem = packet.payload as Telemetry.Telemetry;
    if (telem.variant.case === "deviceMetrics") {
      const dm = telem.variant.value as Telemetry.DeviceMetrics;
      const parts: string[] = [];
      if (dm.batteryLevel != null && dm.batteryLevel > 0) parts.push(`${dm.batteryLevel}%`);
      if (dm.voltage != null && dm.voltage > 0) parts.push(`${dm.voltage.toFixed(2)}V`);
      if (dm.channelUtilization != null) parts.push(`ch:${dm.channelUtilization.toFixed(1)}%`);
      if (dm.airUtilTx != null) parts.push(`tx:${dm.airUtilTx.toFixed(1)}%`);
      return parts.length > 0 ? ` ${parts.join(" ")}` : "";
    }
    if (telem.variant.case === "environmentMetrics") {
      const em = telem.variant.value as Telemetry.EnvironmentMetrics;
      const parts: string[] = [];
      if (em.temperature != null) parts.push(`${em.temperature.toFixed(1)}°C`);
      if (em.relativeHumidity != null) parts.push(`${em.relativeHumidity.toFixed(0)}%rh`);
      if (em.barometricPressure != null) parts.push(`${em.barometricPressure.toFixed(0)}hPa`);
      return parts.length > 0 ? ` ${parts.join(" ")}` : "";
    }
    if (telem.variant.case === "powerMetrics") {
      const pm = telem.variant.value as Telemetry.PowerMetrics;
      const parts: string[] = [];
      if (pm.ch1Voltage != null) parts.push(`ch1:${pm.ch1Voltage.toFixed(2)}V`);
      if (pm.ch1Current != null) parts.push(`${pm.ch1Current.toFixed(0)}mA`);
      return parts.length > 0 ? ` ${parts.join(" ")}` : "";
    }
    return ` ${telem.variant.case || "unknown"}`;
  }

  // Admin message
  if (packet.portnum === Portnums.PortNum.ADMIN_APP) {
    const admin = packet.payload as { variant?: { case?: string } };
    return admin.variant?.case ? ` ${admin.variant.case}` : "";
  }

  // Waypoint
  if (packet.portnum === Portnums.PortNum.WAYPOINT_APP) {
    const wp = packet.payload as { name?: string; description?: string };
    return wp.name ? ` ${wp.name}` : "";
  }

  // Range test
  if (packet.portnum === Portnums.PortNum.RANGE_TEST_APP) {
    const data = packet.payload as { data?: Uint8Array };
    if (data.data) {
      try {
        return ` "${new TextDecoder().decode(data.data).slice(0, 30)}"`;
      } catch {
        return "";
      }
    }
    return "";
  }

  // Store and forward
  if (packet.portnum === Portnums.PortNum.STORE_FORWARD_APP) {
    const sf = packet.payload as { variant?: { case?: string } };
    return sf.variant?.case ? ` ${sf.variant.case}` : "";
  }

  // Neighbor info
  if (packet.portnum === Portnums.PortNum.NEIGHBORINFO_APP) {
    const ni = packet.payload as { neighbors?: unknown[] };
    if (ni.neighbors) return ` ${ni.neighbors.length} neighbors`;
    return "";
  }

  return "";
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
