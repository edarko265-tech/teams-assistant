/**
 * TypeScript interfaces for Teams Assistant Frontend
 * These mirror the backend types for consistency
 */

/**
 * Represents a user in the system
 */
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

/**
 * Represents a channel (multi-user chat room)
 * Channels can have an AI assistant enabled
 */
export interface Channel {
  id: string;
  name: string;
  description: string;
  members: User[];
  assistantEnabled: boolean;
  files: UploadedFile[];
}

/**
 * Represents a 1-on-1 chat between exactly two users
 * Individual chats do NOT have AI assistant functionality
 */
export interface Chat {
  id: string;
  participants: User[];
}

/**
 * Represents a message in a channel or chat
 */
export interface Message {
  id: string;
  content: string;
  sender: User;
  timestamp: Date | string;
  channelId?: string;
  chatId?: string;
  isAssistant: boolean;
}

/**
 * Represents a file uploaded to a channel
 */
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  uploadedBy: User;
  uploadedAt: Date | string;
  content: string;
  channelId: string;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Type for the current conversation context
 */
export type ConversationType = 'channel' | 'chat';

/**
 * App state interface
 */
export interface AppState {
  currentUser: User;
  selectedChannelId?: string;
  selectedChatId?: string;
  channels: Channel[];
  chats: Chat[];
  messages: Message[];
  files: UploadedFile[];
  isLoading: boolean;
  error: string | null;
}

/**
 * App context actions
 */
export interface AppContextValue extends AppState {
  setSelectedChannel: (id: string) => void;
  setSelectedChat: (id: string) => void;
  sendMessage: (content: string) => Promise<void>;
  askAssistant: (question: string) => Promise<void>;
  toggleAssistant: (enabled: boolean) => Promise<void>;
  uploadFile: (name: string, content: string) => Promise<void>;
  refreshMessages: () => Promise<void>;
  clearError: () => void;
}
