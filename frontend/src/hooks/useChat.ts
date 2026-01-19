/**
 * useChat Hook - Custom hook for chat functionality
 * Provides helper functions and computed values for the chat interface
 */

import { useMemo, useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Channel, Chat, User } from '../types';

/**
 * Custom hook that provides chat-related utilities
 */
export function useChat() {
  const {
    currentUser,
    selectedChannelId,
    selectedChatId,
    channels,
    chats,
    messages,
    files,
    isLoading,
    error,
    sendMessage,
    askAssistant,
    toggleAssistant,
    uploadFile,
    refreshMessages,
    clearError,
  } = useAppContext();

  /**
   * Get the currently selected channel
   */
  const selectedChannel = useMemo<Channel | undefined>(() => {
    if (!selectedChannelId) return undefined;
    return channels.find((ch) => ch.id === selectedChannelId);
  }, [selectedChannelId, channels]);

  /**
   * Get the currently selected chat
   */
  const selectedChat = useMemo<Chat | undefined>(() => {
    if (!selectedChatId) return undefined;
    return chats.find((ch) => ch.id === selectedChatId);
  }, [selectedChatId, chats]);

  /**
   * Check if we're in a channel or chat
   */
  const isChannel = useMemo(() => !!selectedChannelId, [selectedChannelId]);
  const isChat = useMemo(() => !!selectedChatId, [selectedChatId]);

  /**
   * Get the conversation name
   */
  const conversationName = useMemo(() => {
    if (selectedChannel) {
      return selectedChannel.name;
    }
    if (selectedChat) {
      // Get the other participant's name
      const otherParticipant = selectedChat.participants.find(
        (p) => p.id !== currentUser.id
      );
      return otherParticipant?.name || 'Chat';
    }
    return '';
  }, [selectedChannel, selectedChat, currentUser.id]);

  /**
   * Check if assistant is available (only in channels with assistantEnabled)
   */
  const isAssistantAvailable = useMemo(() => {
    return isChannel && selectedChannel?.assistantEnabled === true;
  }, [isChannel, selectedChannel]);

  /**
   * Check if assistant can be toggled (only in channels)
   */
  const canToggleAssistant = useMemo(() => {
    return isChannel;
  }, [isChannel]);

  /**
   * Check if files can be uploaded (only in channels)
   */
  const canUploadFiles = useMemo(() => {
    return isChannel;
  }, [isChannel]);

  /**
   * Get the other participant in a chat
   */
  const chatPartner = useMemo<User | undefined>(() => {
    if (!selectedChat) return undefined;
    return selectedChat.participants.find((p) => p.id !== currentUser.id);
  }, [selectedChat, currentUser.id]);

  /**
   * Get members of the current channel
   */
  const channelMembers = useMemo<User[]>(() => {
    if (!selectedChannel) return [];
    return selectedChannel.members;
  }, [selectedChannel]);

  /**
   * Send a message with validation
   */
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;
      await sendMessage(content);
    },
    [sendMessage]
  );

  /**
   * Ask assistant with validation
   */
  const handleAskAssistant = useCallback(
    async (question: string) => {
      if (!question.trim() || !isAssistantAvailable) return;
      await askAssistant(question);
    },
    [askAssistant, isAssistantAvailable]
  );

  /**
   * Toggle assistant with validation
   */
  const handleToggleAssistant = useCallback(
    async (enabled: boolean) => {
      if (!canToggleAssistant) return;
      await toggleAssistant(enabled);
    },
    [toggleAssistant, canToggleAssistant]
  );

  /**
   * Upload file with validation
   */
  const handleUploadFile = useCallback(
    async (name: string, content: string) => {
      if (!canUploadFiles) return;
      await uploadFile(name, content);
    },
    [uploadFile, canUploadFiles]
  );

  /**
   * Format a timestamp for display
   */
  const formatTimestamp = useCallback((timestamp: Date | string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    const timeStr = date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    if (diffDays === 0) {
      return timeStr;
    } else if (diffDays === 1) {
      return `Yesterday at ${timeStr}`;
    } else if (diffDays < 7) {
      const dayName = date.toLocaleDateString([], { weekday: 'long' });
      return `${dayName} at ${timeStr}`;
    } else {
      const dateStr = date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
      });
      return `${dateStr} at ${timeStr}`;
    }
  }, []);

  /**
   * Format file size for display
   */
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }, []);

  return {
    // State
    currentUser,
    selectedChannel,
    selectedChat,
    messages,
    files,
    isLoading,
    error,

    // Computed
    isChannel,
    isChat,
    conversationName,
    isAssistantAvailable,
    canToggleAssistant,
    canUploadFiles,
    chatPartner,
    channelMembers,

    // Actions
    sendMessage: handleSendMessage,
    askAssistant: handleAskAssistant,
    toggleAssistant: handleToggleAssistant,
    uploadFile: handleUploadFile,
    refreshMessages,
    clearError,

    // Utilities
    formatTimestamp,
    formatFileSize,
  };
}

export default useChat;
