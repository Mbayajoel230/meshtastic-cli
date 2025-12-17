import React from "react";
import { Box, Text } from "ink";
import { theme } from "../theme";
import type { DecodedPacket } from "../../protocol/decoder";
import { Portnums } from "@meshtastic/protobufs";

interface PacketInspectorProps {
  packet?: DecodedPacket;
}

export function PacketInspector({ packet }: PacketInspectorProps) {
  if (!packet) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color={theme.fg.muted}>No packet selected</Text>
      </Box>
    );
  }

  const mp = packet.meshPacket;
  const fr = packet.fromRadio;

  return (
    <Box flexDirection="column" padding={1} width="100%">
      <Text color={theme.fg.accent} bold>Packet Inspector</Text>
      <Text> </Text>

      {/* Basic info */}
      <Box>
        <Text color={theme.fg.muted}>ID: </Text>
        <Text color={theme.fg.primary}>{packet.id}</Text>
        <Text color={theme.fg.muted}>  Time: </Text>
        <Text color={theme.fg.primary}>{packet.timestamp.toLocaleTimeString()}</Text>
      </Box>

      {mp && (
        <>
          <Box>
            <Text color={theme.fg.muted}>From: </Text>
            <Text color={theme.fg.primary}>!{mp.from.toString(16).padStart(8, "0")}</Text>
            <Text color={theme.fg.muted}>  To: </Text>
            <Text color={theme.fg.primary}>
              {mp.to === 0xffffffff ? "BROADCAST" : `!${mp.to.toString(16).padStart(8, "0")}`}
            </Text>
          </Box>

          <Box>
            <Text color={theme.fg.muted}>Channel: </Text>
            <Text color={theme.fg.primary}>{mp.channel}</Text>
            {mp.rxSnr !== undefined && (
              <>
                <Text color={theme.fg.muted}>  SNR: </Text>
                <Text color={theme.fg.primary}>{mp.rxSnr.toFixed(1)} dB</Text>
              </>
            )}
            {mp.rxRssi !== undefined && (
              <>
                <Text color={theme.fg.muted}>  RSSI: </Text>
                <Text color={theme.fg.primary}>{mp.rxRssi} dBm</Text>
              </>
            )}
          </Box>

          {mp.hopStart !== undefined && mp.hopLimit !== undefined && (
            <Box>
              <Text color={theme.fg.muted}>Hops: </Text>
              <Text color={theme.fg.primary}>{mp.hopStart - mp.hopLimit} / {mp.hopStart}</Text>
            </Box>
          )}
        </>
      )}

      {packet.portnum !== undefined && (
        <Box>
          <Text color={theme.fg.muted}>Port: </Text>
          <Text color={theme.fg.primary}>
            {Portnums.PortNum[packet.portnum] || `UNKNOWN (${packet.portnum})`}
          </Text>
        </Box>
      )}

      {/* Payload preview */}
      {packet.payload && (
        <Box marginTop={1}>
          <Text color={theme.fg.muted}>Payload: </Text>
          <Text color={theme.fg.secondary}>
            {typeof packet.payload === "string"
              ? `"${packet.payload.slice(0, 60)}${packet.payload.length > 60 ? "..." : ""}"`
              : JSON.stringify(packet.payload).slice(0, 80)}
          </Text>
        </Box>
      )}

      {/* FromRadio variant info */}
      {fr && fr.payloadVariant.case && fr.payloadVariant.case !== "packet" && (
        <Box marginTop={1}>
          <Text color={theme.fg.muted}>Type: </Text>
          <Text color={theme.fg.accent}>{fr.payloadVariant.case}</Text>
        </Box>
      )}

      {packet.decodeError && (
        <Box marginTop={1}>
          <Text color={theme.packet.encrypted}>Error: {packet.decodeError}</Text>
        </Box>
      )}
    </Box>
  );
}
