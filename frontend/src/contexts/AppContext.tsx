/**
 * App Context - Global state management for Teams Assistant
 * Uses React Context API for state sharing across components
 * Includes authentication with Supabase
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
  AuthSession,
} from '../types';

// API base URL (port 5001 because macOS AirPlay uses 5000)
const API_BASE_URL = 'http://localhost:5001/api';

// Storage keys
const AUTH_STORAGE_KEY = 'teams_assistant_auth';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Load auth from localStorage
 */
function loadAuthFromStorage(): { user: User | null; session: AuthSession | null } {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      // Check if session is expired
      if (data.session?.expires_at && Date.now() / 1000 > data.session.expires_at) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return { user: null, session: null };
      }
      return data;
    }
  } catch (e) {
    console.error('Error loading auth from storage:', e);
  }
  return { user: null, session: null };
}

/**
 * Save auth to localStorage
 */
function saveAuthToStorage(user: User | null, session: AuthSession | null) {
  if (user && session) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, session }));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

// Create context with default values
const AppContext = createContext<AppContextValue | undefined>(undefined);

/**
 * App Provider component that wraps the entire application
 */
export function AppProvider({ children }: { children: ReactNode }) {
  // Load initial auth state from storage
  const initialAuth = loadAuthFromStorage();

  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(initialAuth.user);
  const [session, setSession] = useState<AuthSession | null>(initialAuth.session);
  const isAuthenticated = !!currentUser && !!session;

  // App state
  const [selectedChannelId, setSelectedChannelId] = useState<string | undefined>();
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set auth header when session changes
  useEffect(() => {
    if (session?.access_token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [session]);

  // ============================================================
  // Authentication Methods
  // ============================================================

  /**
   * Sign in with email and password
   */
  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<ApiResponse<{ user: User; session: AuthSession }>>('/auth/signin', {
        email,
        password,
      });

      if (response.data.success && response.data.data) {
        const { user, session: newSession } = response.data.data;
        setCurrentUser(user);
        setSession(newSession);
        saveAuthToStorage(user, newSession);
        console.log('✅ Signed in:', user.email);
      } else {
        throw new Error(response.data.error || 'Sign in failed');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Sign in failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Sign up with email, password, and name
   */
  const signUp = useCallback(async (email: string, password: string, name: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<ApiResponse<{ user: User; session: AuthSession }>>('/auth/signup', {
        email,
        password,
        name,
      });

      if (response.data.success && response.data.data) {
        const { user, session: newSession } = response.data.data;
        setCurrentUser(user);
        setSession(newSession);
        saveAuthToStorage(user, newSession);
        console.log('✅ Signed up:', user.email);
      } else {
        throw new Error(response.data.error || 'Sign up failed');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Sign up failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Sign out
   */
  const signOut = useCallback(async () => {
    setIsLoading(true);

    try {
      await api.post('/auth/signout');
    } catch (err) {
      console.error('Sign out error:', err);
    }

    // Clear state regardless of API call success
    setCurrentUser(null);
    setSession(null);
    setChannels([]);
    setChats([]);
    setMessages([]);
    setFiles([]);
    setSelectedChannelId(undefined);
    setSelectedChatId(undefined);
    saveAuthToStorage(null, null);
    setIsLoading(false);
    console.log('✅ Signed out');
  }, []);

  // ============================================================
  // Data Fetching Methods
  // ============================================================

  /**
   * Fetch all channels
   */
  const fetchChannels = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await api.get<ApiResponse<Channel[]>>('/channels');
      if (response.data.success && response.data.data) {
        setChannels(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching channels:', err);
      setError('Failed to load channels');
    }
  }, [isAuthenticated]);

  /**
   * Fetch user's chats
   */
  const fetchChats = useCallback(async () => {
    if (!isAuthenticated || !currentUser) return;

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
  }, [isAuthenticated, currentUser]);

  /**
   * Fetch messages for current channel or chat
   */
  const fetchMessages = useCallback(async () => {
    const targetId = selectedChannelId || selectedChatId;
    if (!targetId || !isAuthenticated) {
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
  }, [selectedChannelId, selectedChatId, isAuthenticated]);

  /**
   * Fetch files for current channel
   */
  const fetchFiles = useCallback(async () => {
    if (!selectedChannelId || !isAuthenticated) {
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
  }, [selectedChannelId, isAuthenticated]);

  // ============================================================
  // Action Methods
  // ============================================================

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
    if (!targetId || !content.trim() || !currentUser) return;

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
  }, [selectedChannelId, selectedChatId, currentUser]);

  /**
   * Ask the AI assistant a question (channels only)
   */
  const askAssistant = useCallback(async (question: string) => {
    if (!selectedChannelId || !question.trim() || !currentUser) return;

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
  }, [selectedChannelId, currentUser]);

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
  const uploadFile = useCallback(async (file: File) => {
    if (!selectedChannelId || !currentUser) return;

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', currentUser.id);

      const response = await api.post<ApiResponse<UploadedFile>>(
        `/files/${selectedChannelId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

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
  }, [selectedChannelId, currentUser]);

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

  // ============================================================
  // Effects
  // ============================================================

  // Initial data fetch when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchChannels();
      fetchChats();
    }
  }, [isAuthenticated, fetchChannels, fetchChats]);

  // Fetch messages when selection changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchMessages();
      fetchFiles();
    }
  }, [isAuthenticated, fetchMessages, fetchFiles]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      if (selectedChannelId || selectedChatId) {
        fetchMessages();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isAuthenticated, selectedChannelId, selectedChatId, fetchMessages]);

  // Select first channel by default
  useEffect(() => {
    if (isAuthenticated && channels.length > 0 && !selectedChannelId && !selectedChatId) {
      setSelectedChannelId(channels[0].id);
    }
  }, [isAuthenticated, channels, selectedChannelId, selectedChatId]);

  // Context value
  const value: AppContextValue = {
    currentUser,
    session,
    isAuthenticated,
    selectedChannelId,
    selectedChatId,
    channels,
    chats,
    messages,
    files,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
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
