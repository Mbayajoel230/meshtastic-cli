import React from "react";
import { Box, Text } from "ink";
import { theme } from "../theme";

type AppMode = "packets" | "nodes" | "chat";

interface HelpDialogProps {
  mode: AppMode;
}

const globalKeys = [
  { key: "1 / p", desc: "Packets view" },
  { key: "2 / n", desc: "Nodes view" },
  { key: "3 / c", desc: "Chat view" },
  { key: "q / Q", desc: "Quit" },
  { key: "Ctrl+C", desc: "Quit" },
  { key: "?", desc: "Toggle help" },
];

const packetKeys = [
  { key: "j / ↓", desc: "Next packet" },
  { key: "k / ↑", desc: "Previous packet" },
  { key: "Ctrl+d/PgDn", desc: "Page down" },
  { key: "Ctrl+u/PgUp", desc: "Page up" },
  { key: "g", desc: "First packet" },
  { key: "G", desc: "Last packet (resume autoscroll)" },
  { key: "h / ←", desc: "Previous inspector tab" },
  { key: "l / →", desc: "Next inspector tab" },
  { key: "Space", desc: "Scroll inspector down" },
  { key: "b", desc: "Scroll inspector up" },
  { key: "+", desc: "Expand inspector pane" },
  { key: "-", desc: "Shrink inspector pane" },
];

const nodeKeys = [
  { key: "j / ↓", desc: "Next node" },
  { key: "k / ↑", desc: "Previous node" },
  { key: "t", desc: "Traceroute to selected node" },
];

const chatKeys = [
  { key: "Tab", desc: "Next channel" },
  { key: "Enter", desc: "Send message" },
  { key: "Escape", desc: "Exit to packets" },
];

export function HelpDialog({ mode }: HelpDialogProps) {
  const modeKeys = mode === "packets" ? packetKeys
    : mode === "nodes" ? nodeKeys
    : chatKeys;

  const modeTitle = mode === "packets" ? "PACKETS"
    : mode === "nodes" ? "NODES"
    : "CHAT";

  return (
    <Box
      flexDirection="column"
      borderStyle="double"
      borderColor={theme.fg.accent}
      backgroundColor={theme.bg.primary}
      paddingX={2}
      paddingY={1}
    >
      <Box justifyContent="center" marginBottom={1}>
        <Text bold color={theme.fg.accent}>{"═══ KEYBOARD SHORTCUTS ═══"}</Text>
      </Box>

      <Box marginBottom={1}>
        <Text bold color={theme.data.channel}>GLOBAL</Text>
      </Box>
      {globalKeys.map(({ key, desc }) => (
        <Box key={key}>
          <Text color={theme.data.nodeFrom}>{key.padEnd(12)}</Text>
          <Text color={theme.fg.primary}>{desc}</Text>
        </Box>
      ))}

      <Box marginY={1}>
        <Text bold color={theme.data.channel}>{modeTitle} MODE</Text>
      </Box>
      {modeKeys.map(({ key, desc }) => (
        <Box key={key}>
          <Text color={theme.data.nodeFrom}>{key.padEnd(12)}</Text>
          <Text color={theme.fg.primary}>{desc}</Text>
        </Box>
      ))}

      <Box marginTop={1} justifyContent="center">
        <Text color={theme.fg.muted}>Press ? to close</Text>
      </Box>
    </Box>
  );
}
