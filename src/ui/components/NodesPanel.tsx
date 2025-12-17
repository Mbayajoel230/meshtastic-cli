import React from "react";
import { Box, Text } from "ink";
import { theme } from "../theme";
import type { NodeData } from "../../protocol/node-store";
import { formatNodeId } from "../../utils/hex";

interface NodesPanelProps {
  nodes: NodeData[];
  selectedIndex: number;
}

export function NodesPanel({ nodes, selectedIndex }: NodesPanelProps) {
  if (nodes.length === 0) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color={theme.fg.muted}>No nodes discovered yet</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" width="100%">
      {/* Header */}
      <Box paddingX={1}>
        <Text color={theme.fg.muted}>
          {"NAME".padEnd(12)}
          {"ID".padEnd(12)}
          {"HOPS".padEnd(6)}
          {"SNR".padEnd(8)}
          {"BATT".padEnd(8)}
          {"LAST HEARD"}
        </Text>
      </Box>

      {/* Node rows */}
      {nodes.slice(0, 30).map((node, i) => (
        <NodeRow
          key={node.num}
          node={node}
          isSelected={i === selectedIndex}
        />
      ))}
    </Box>
  );
}

interface NodeRowProps {
  node: NodeData;
  isSelected: boolean;
}

function NodeRow({ node, isSelected }: NodeRowProps) {
  const bgColor = isSelected ? theme.bg.selected : undefined;

  const name = node.shortName || node.longName?.slice(0, 10) || "???";
  const nodeId = formatNodeId(node.num);
  const hops = node.hopsAway !== undefined ? `${node.hopsAway}` : "-";
  const snr = node.snr !== undefined ? `${node.snr.toFixed(1)}dB` : "-";
  const battery = getBatteryDisplay(node.batteryLevel, node.voltage);
  const lastHeard = formatLastHeard(node.lastHeard);

  const nameColor = node.hopsAway === 0 ? theme.fg.accent : theme.fg.primary;

  return (
    <Box backgroundColor={bgColor} paddingX={1}>
      <Text color={nameColor}>{name.padEnd(12)}</Text>
      <Text color={theme.fg.muted}>{nodeId.padEnd(12)}</Text>
      <Text color={getHopsColor(node.hopsAway)}>{hops.padEnd(6)}</Text>
      <Text color={getSnrColor(node.snr)}>{snr.padEnd(8)}</Text>
      <Text color={getBatteryColor(node.batteryLevel)}>{battery.padEnd(8)}</Text>
      <Text color={theme.fg.secondary}>{lastHeard}</Text>
    </Box>
  );
}

function getBatteryDisplay(level?: number, voltage?: number): string {
  if (level !== undefined && level > 0) {
    return `${level}%`;
  }
  if (voltage !== undefined && voltage > 0) {
    return `${voltage.toFixed(1)}V`;
  }
  return "-";
}

function formatLastHeard(timestamp: number): string {
  if (!timestamp) return "never";

  const now = Date.now() / 1000;
  const diff = now - timestamp;

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function getHopsColor(hops?: number): string {
  if (hops === undefined) return theme.fg.muted;
  if (hops === 0) return theme.packet.direct;
  if (hops === 1) return theme.fg.accent;
  if (hops <= 3) return theme.packet.telemetry;
  return theme.packet.encrypted;
}

function getSnrColor(snr?: number): string {
  if (snr === undefined) return theme.fg.muted;
  if (snr >= 5) return theme.packet.direct;
  if (snr >= 0) return theme.fg.accent;
  if (snr >= -5) return theme.packet.telemetry;
  return theme.packet.encrypted;
}

function getBatteryColor(level?: number): string {
  if (level === undefined) return theme.fg.muted;
  if (level >= 50) return theme.packet.direct;
  if (level >= 20) return theme.packet.telemetry;
  return theme.packet.encrypted;
}
