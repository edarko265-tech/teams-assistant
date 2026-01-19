/**
 * TypeScript interfaces for Teams Assistant Frontend
 * These mirror the backend types for consistency
 */

/**
 * Supported file MIME types
 */
export const SUPPORTED_FILE_TYPES = {
  // Text files
  '.txt': { mimeType: 'text/plain', category: 'text', icon: '📄' },
  '.md': { mimeType: 'text/markdown', category: 'text', icon: '📝' },
  '.json': { mimeType: 'application/json', category: 'text', icon: '📋' },
  '.csv': { mimeType: 'text/csv', category: 'text', icon: '📊' },
  '.xml': { mimeType: 'application/xml', category: 'text', icon: '📋' },
  '.yaml': { mimeType: 'text/yaml', category: 'text', icon: '⚙️' },
  '.yml': { mimeType: 'text/yaml', category: 'text', icon: '⚙️' },
  // PDFs
  '.pdf': { mimeType: 'application/pdf', category: 'document', icon: '📕' },
  // Images
  '.jpg': { mimeType: 'image/jpeg', category: 'image', icon: '🖼️' },
  '.jpeg': { mimeType: 'image/jpeg', category: 'image', icon: '🖼️' },
  '.png': { mimeType: 'image/png', category: 'image', icon: '🖼️' },
  '.gif': { mimeType: 'image/gif', category: 'image', icon: '🖼️' },
  '.webp': { mimeType: 'image/webp', category: 'image', icon: '🖼️' },
  '.svg': { mimeType: 'image/svg+xml', category: 'image', icon: '🖼️' },
  // Archives
  '.zip': { mimeType: 'application/zip', category: 'archive', icon: '📦' },
  '.rar': { mimeType: 'application/x-rar-compressed', category: 'archive', icon: '📦' },
  '.gz': { mimeType: 'application/gzip', category: 'archive', icon: '📦' },
} as const;

export type FileExtension = keyof typeof SUPPORTED_FILE_TYPES;
export type FileCategory = 'text' | 'document' | 'image' | 'archive';

/**
 * Get file info from extension
 */
export function getFileInfo(filename: string) {
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase() as FileExtension;
  return SUPPORTED_FILE_TYPES[ext] || { mimeType: 'application/octet-stream', category: 'unknown', icon: '📎' };
}

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
 * Auth session
 */
export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
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
  mimeType?: string;
  storagePath?: string;
  uploadedBy: User;
  uploadedAt: Date | string;
  content?: string;
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
  currentUser: User | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
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
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  setSelectedChannel: (id: string) => void;
  setSelectedChat: (id: string) => void;
  sendMessage: (content: string) => Promise<void>;
  askAssistant: (question: string) => Promise<void>;
  toggleAssistant: (enabled: boolean) => Promise<void>;
  uploadFile: (file: File) => Promise<void>;
  refreshMessages: () => Promise<void>;
  clearError: () => void;
}
