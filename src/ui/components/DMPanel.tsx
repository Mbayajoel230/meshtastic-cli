import React, { useState, useEffect } from "react";
import { Box, Text } from "ink";
import { theme } from "../theme";
import type { DbMessage, DMConversation } from "../../db";
import type { NodeStore } from "../../protocol/node-store";
import { formatNodeId } from "../../utils/hex";

const MESSAGE_TIMEOUT_MS = 30000;

function AnimatedDots() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % 3);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <Text>
      {" "}
      <Text color={theme.fg.muted}>[</Text>
      <Text color={frame === 0 ? theme.fg.primary : theme.fg.muted}>.</Text>
      <Text color={frame === 1 ? theme.fg.primary : theme.fg.muted}>.</Text>
      <Text color={frame === 2 ? theme.fg.primary : theme.fg.muted}>.</Text>
      <Text color={theme.fg.muted}>]</Text>
    </Text>
  );
}

interface DMPanelProps {
  conversations: DMConversation[];
  messages: DbMessage[];
  selectedConvoIndex: number;
  selectedMessageIndex: number;
  inputFocused: boolean;
  input: string;
  nodeStore: NodeStore;
  myNodeNum: number;
  height: number;
  width: number;
  deleteConfirm?: boolean;
}

// Left panel width: star(1) + space(1) + name(6) + space(1) + id(9) = 18
const LEFT_PANEL_WIDTH = 20;

export function DMPanel({
  conversations,
  messages,
  selectedConvoIndex,
  selectedMessageIndex,
  inputFocused,
  input,
  nodeStore,
  myNodeNum,
  height,
  width,
  deleteConfirm,
}: DMPanelProps) {
  const selectedConvo = conversations[selectedConvoIndex];
  const listFocused = selectedMessageIndex < 0 && !inputFocused && !deleteConfirm;

  // Calculate scroll offset for conversation list
  const listHeight = height - 2; // Account for header
  let convoScrollOffset = 0;
  if (conversations.length > listHeight) {
    const halfView = Math.floor(listHeight / 2);
    convoScrollOffset = Math.max(0, Math.min(
      selectedConvoIndex - halfView,
      conversations.length - listHeight
    ));
  }
  const visibleConvos = conversations.slice(convoScrollOffset, convoScrollOffset + listHeight);

  // Right panel dimensions
  const rightPanelWidth = width - LEFT_PANEL_WIDTH - 3; // 3 for borders/padding
  const chatHeight = height - 4; // Header, input area

  // Calculate scroll offset for messages
  const visibleMsgCount = chatHeight;
  let msgScrollOffset = 0;
  if (messages.length > visibleMsgCount) {
    if (selectedMessageIndex < 0) {
      msgScrollOffset = Math.max(0, messages.length - visibleMsgCount);
    } else {
      const halfView = Math.floor(visibleMsgCount / 2);
      msgScrollOffset = Math.max(0, Math.min(
        selectedMessageIndex - halfView,
        messages.length - visibleMsgCount
      ));
    }
  }
  const visibleMessages = messages.slice(msgScrollOffset, msgScrollOffset + visibleMsgCount);

  return (
    <Box flexDirection="row" width="100%" height={height}>
      {/* Left panel - Conversation list */}
      <Box
        flexDirection="column"
        width={LEFT_PANEL_WIDTH}
        borderStyle="single"
        borderColor={listFocused ? theme.border.focused : theme.border.normal}
        borderRight
        borderTop={false}
        borderBottom={false}
        borderLeft={false}
      >
        {/* List header */}
        <Box paddingX={1}>
          <Text color={theme.fg.accent} bold>DMs</Text>
          <Text color={theme.fg.muted}> ({conversations.length})</Text>
        </Box>

        {/* Conversation list */}
        {conversations.length === 0 ? (
          <Box paddingX={1} flexDirection="column">
            <Text color={theme.fg.muted}>No DMs</Text>
            <Text color={theme.fg.secondary}>'d' on node</Text>
          </Box>
        ) : (
          visibleConvos.map((convo, i) => {
            const actualIndex = convoScrollOffset + i;
            const isSelected = actualIndex === selectedConvoIndex;
            const isActive = actualIndex === selectedConvoIndex && listFocused;
            const node = nodeStore.getNode(convo.nodeNum);
            const shortName = node?.shortName || "???";
            const isFavorite = node?.isFavorite || false;
            const shortId = formatNodeId(convo.nodeNum).slice(0, 8); // !abcd1234

            return (
              <Box
                key={convo.nodeNum}
                backgroundColor={isActive ? theme.bg.selected : undefined}
                paddingX={1}
              >
                <Text color="#ffcc00">{isFavorite ? "★" : " "}</Text>
                <Text color={isSelected ? theme.fg.accent : theme.fg.primary}>{shortName.slice(0, 5).padEnd(6)}</Text>
                <Text color={theme.fg.muted}>{shortId}</Text>
                {convo.unreadCount > 0 && <Text color={theme.status.online}> •</Text>}
              </Box>
            );
          })
        )}
      </Box>

      {/* Right panel - Chat */}
      <Box flexDirection="column" flexGrow={1}>
        {/* Chat header */}
        <Box paddingX={1}>
          {deleteConfirm && selectedConvo ? (
            <>
              <Text color={theme.status.offline} bold>Delete conversation with {nodeStore.getNodeName(selectedConvo.nodeNum)}?</Text>
              <Text color={theme.fg.muted}> (y/n)</Text>
            </>
          ) : selectedConvo ? (
            <>
              <Text color={theme.fg.accent} bold>{nodeStore.getNodeName(selectedConvo.nodeNum)}</Text>
              <Text color={theme.fg.muted}> {formatNodeId(selectedConvo.nodeNum)}</Text>
            </>
          ) : (
            <Text color={theme.fg.muted}>Select a conversation (j/k, Enter)</Text>
          )}
        </Box>

        {/* Messages */}
        <Box height={chatHeight} flexDirection="column" paddingX={1}>
          {!selectedConvo ? (
            <Text color={theme.fg.muted}>Press 'd' on a node to start a DM</Text>
          ) : messages.length === 0 ? (
            <Text color={theme.fg.muted}>No messages yet. Start the conversation!</Text>
          ) : (
            visibleMessages.map((msg, i) => {
              const actualIndex = msgScrollOffset + i;
              return (
                <MessageRow
                  key={msg.id ?? `${msg.packetId}-${i}`}
                  message={msg}
                  nodeStore={nodeStore}
                  isOwn={msg.fromNode === myNodeNum}
                  isSelected={actualIndex === selectedMessageIndex && !inputFocused}
                  textWidth={rightPanelWidth - 25}
                />
              );
            })
          )}
        </Box>

        {/* Input */}
        <Box
          paddingX={1}
          borderStyle="single"
          borderColor={inputFocused ? theme.border.focused : theme.border.normal}
          borderTop
          borderBottom={false}
          borderLeft={false}
          borderRight={false}
        >
          <Text color={inputFocused ? theme.fg.accent : theme.fg.muted}>{">"} </Text>
          <Text color={theme.fg.primary}>{input}</Text>
          {inputFocused ? (
            <Text color={theme.fg.accent}>█</Text>
          ) : selectedConvo ? (
            <Text color={theme.fg.muted}> (Enter to type, # to delete convo)</Text>
          ) : (
            <Text color={theme.fg.muted}> (Select a conversation)</Text>
          )}
        </Box>
      </Box>
    </Box>
  );
}

interface MessageRowProps {
  message: DbMessage;
  nodeStore: NodeStore;
  isOwn: boolean;
  isSelected: boolean;
  textWidth: number;
}

function MessageRow({ message, nodeStore, isOwn, isSelected, textWidth }: MessageRowProps) {
  const fromName = nodeStore.getNodeName(message.fromNode);
  const time = new Date(message.timestamp * 1000).toLocaleTimeString("en-US", { hour12: false });
  const nameColor = isOwn ? theme.fg.accent : theme.packet.position;
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (message.status !== "pending" || !isOwn) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [message.status, isOwn]);

  const getStatusIndicator = () => {
    if (!isOwn) return null;
    switch (message.status) {
      case "pending": {
        const elapsed = now - message.timestamp * 1000;
        if (elapsed > MESSAGE_TIMEOUT_MS) {
          return (
            <Text>
              {" "}<Text color={theme.fg.muted}>[</Text>
              <Text color={theme.status.offline}>✗</Text>
              <Text color={theme.fg.muted}>]</Text>
            </Text>
          );
        }
        return <AnimatedDots />;
      }
      case "acked":
        return (
          <Text>
            {" "}<Text color={theme.fg.muted}>[</Text>
            <Text color={theme.status.online}>✓</Text>
            <Text color={theme.fg.muted}>]</Text>
          </Text>
        );
      case "error":
        return (
          <Text>
            {" "}<Text color={theme.fg.muted}>[</Text>
            <Text color={theme.status.offline}>✗</Text>
            <Text color={theme.fg.muted}>]</Text>
          </Text>
        );
      default:
        return null;
    }
  };

  const maxLen = Math.max(10, textWidth);
  const displayText = message.text.length > maxLen
    ? message.text.slice(0, maxLen - 3) + "..."
    : message.text;

  return (
    <Box backgroundColor={isSelected ? theme.bg.selected : undefined}>
      <Text wrap="truncate">
        <Text color={theme.fg.muted}>[{time}] </Text>
        <Text color={nameColor}>{fromName.slice(0, 8).padEnd(9)}</Text>
        <Text color={theme.fg.primary}>{displayText}</Text>
        {getStatusIndicator()}
      </Text>
    </Box>
  );
}
