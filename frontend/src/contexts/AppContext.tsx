/**
 * App Context - Global state management for Teams Assistant
 * Uses React Context API for state sharing across components
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import axios from 'axios';
import {
  User,
  Channel,
  Chat,
  Message,
  UploadedFile,
  AppContextValue,
  ApiResponse,
} from '../types';

// API base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Demo current user (Alice Johnson)
const CURRENT_USER: User = {
  id: 'user-1',
  name: 'Alice Johnson',
  email: 'alice.johnson@company.com',
};

// Create context with default values
const AppContext = createContext<AppContextValue | undefined>(undefined);

/**
 * App Provider component that wraps the entire application
 */
export function AppProvider({ children }: { children: ReactNode }) {
  // State
  const [currentUser] = useState<User>(CURRENT_USER);
  const [selectedChannelId, setSelectedChannelId] = useState<string | undefined>();
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all channels
   */
  const fetchChannels = useCallback(async () => {
    try {
      const response = await api.get<ApiResponse<Channel[]>>('/channels');
      if (response.data.success && response.data.data) {
        setChannels(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching channels:', err);
      setError('Failed to load channels');
    }
  }, []);

  /**
   * Fetch user's chats
   */
  const fetchChats = useCallback(async () => {
    try {
      const response = await api.get<ApiResponse<Chat[]>>('/chats', {
        params: { userId: currentUser.id },
      });
      if (response.data.success && response.data.data) {
        setChats(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching chats:', err);
      setError('Failed to load chats');
    }
  }, [currentUser.id]);

  /**
   * Fetch messages for current channel or chat
   */
  const fetchMessages = useCallback(async () => {
    const targetId = selectedChannelId || selectedChatId;
    if (!targetId) {
      setMessages([]);
      return;
    }

    try {
      const response = await api.get<ApiResponse<Message[]>>(`/messages/${targetId}`);
      if (response.data.success && response.data.data) {
        setMessages(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    }
  }, [selectedChannelId, selectedChatId]);

  /**
   * Fetch files for current channel
   */
  const fetchFiles = useCallback(async () => {
    if (!selectedChannelId) {
      setFiles([]);
      return;
    }

    try {
      const response = await api.get<ApiResponse<UploadedFile[]>>(`/files/${selectedChannelId}`);
      if (response.data.success && response.data.data) {
        setFiles(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching files:', err);
    }
  }, [selectedChannelId]);

  /**
   * Set selected channel (clears chat selection)
   */
  const setSelectedChannel = useCallback((id: string) => {
    setSelectedChannelId(id);
    setSelectedChatId(undefined);
    setMessages([]);
    setFiles([]);
  }, []);

  /**
   * Set selected chat (clears channel selection)
   */
  const setSelectedChat = useCallback((id: string) => {
    setSelectedChatId(id);
    setSelectedChannelId(undefined);
    setMessages([]);
    setFiles([]);
  }, []);

  /**
   * Send a message to the current channel or chat
   */
  const sendMessage = useCallback(async (content: string) => {
    const targetId = selectedChannelId || selectedChatId;
    if (!targetId || !content.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<ApiResponse<Message>>(`/messages/${targetId}`, {
        content,
        userId: currentUser.id,
      });

      if (response.data.success && response.data.data) {
        setMessages((prev) => [...prev, response.data.data!]);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }, [selectedChannelId, selectedChatId, currentUser.id]);

  /**
   * Ask the AI assistant a question (channels only)
   */
  const askAssistant = useCallback(async (question: string) => {
    if (!selectedChannelId || !question.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<ApiResponse<Message>>('/assistant/ask', {
        question,
        channelId: selectedChannelId,
        userId: currentUser.id,
      });

      if (response.data.success && response.data.data) {
        setMessages((prev) => [...prev, response.data.data!]);
      }
    } catch (err: any) {
      console.error('Error asking assistant:', err);
      const errorMessage = err.response?.data?.error || 'Failed to get assistant response';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [selectedChannelId, currentUser.id]);

  /**
   * Toggle AI assistant for current channel
   */
  const toggleAssistant = useCallback(async (enabled: boolean) => {
    if (!selectedChannelId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<ApiResponse<Channel>>(
        `/channels/${selectedChannelId}/toggle-assistant`,
        { enabled }
      );

      if (response.data.success && response.data.data) {
        setChannels((prev) =>
          prev.map((ch) =>
            ch.id === selectedChannelId ? { ...ch, assistantEnabled: enabled } : ch
          )
        );
      }
    } catch (err) {
      console.error('Error toggling assistant:', err);
      setError('Failed to toggle assistant');
    } finally {
      setIsLoading(false);
    }
  }, [selectedChannelId]);

  /**
   * Upload a file to the current channel
   */
  const uploadFile = useCallback(async (name: string, content: string) => {
    if (!selectedChannelId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<ApiResponse<UploadedFile>>(`/files/${selectedChannelId}`, {
        name,
        content,
        userId: currentUser.id,
      });

      if (response.data.success && response.data.data) {
        setFiles((prev) => [...prev, response.data.data!]);
      }
    } catch (err: any) {
      console.error('Error uploading file:', err);
      const errorMessage = err.response?.data?.error || 'Failed to upload file';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [selectedChannelId, currentUser.id]);

  /**
   * Refresh messages (for polling)
   */
  const refreshMessages = useCallback(async () => {
    await fetchMessages();
  }, [fetchMessages]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchChannels();
    fetchChats();
  }, [fetchChannels, fetchChats]);

  // Fetch messages when selection changes
  useEffect(() => {
    fetchMessages();
    fetchFiles();
  }, [fetchMessages, fetchFiles]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedChannelId || selectedChatId) {
        fetchMessages();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedChannelId, selectedChatId, fetchMessages]);

  // Select first channel by default
  useEffect(() => {
    if (channels.length > 0 && !selectedChannelId && !selectedChatId) {
      setSelectedChannelId(channels[0].id);
    }
  }, [channels, selectedChannelId, selectedChatId]);

  // Context value
  const value: AppContextValue = {
    currentUser,
    selectedChannelId,
    selectedChatId,
    channels,
    chats,
    messages,
    files,
    isLoading,
    error,
    setSelectedChannel,
    setSelectedChat,
    sendMessage,
    askAssistant,
    toggleAssistant,
    uploadFile,
    refreshMessages,
    clearError,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * Custom hook to use the app context
 */
export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
