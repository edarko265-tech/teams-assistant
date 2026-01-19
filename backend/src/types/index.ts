/**
 * TypeScript interfaces for Teams Assistant
 * These define the shape of all data models used in the application
 */

/**
 * Supported file MIME types
 */
export const SUPPORTED_MIME_TYPES = {
  // Text files (content stored in DB for AI context)
  'text/plain': { extension: '.txt', category: 'text' },
  'text/markdown': { extension: '.md', category: 'text' },
  'application/json': { extension: '.json', category: 'text' },
  'text/csv': { extension: '.csv', category: 'text' },
  'application/xml': { extension: '.xml', category: 'text' },
  'text/xml': { extension: '.xml', category: 'text' },
  'text/yaml': { extension: '.yaml', category: 'text' },
  'application/x-yaml': { extension: '.yml', category: 'text' },
  // PDFs (stored in storage, content extracted if possible)
  'application/pdf': { extension: '.pdf', category: 'document' },
  // Images (stored in storage only)
  'image/jpeg': { extension: '.jpg', category: 'image' },
  'image/png': { extension: '.png', category: 'image' },
  'image/gif': { extension: '.gif', category: 'image' },
  'image/webp': { extension: '.webp', category: 'image' },
  'image/svg+xml': { extension: '.svg', category: 'image' },
  // Archives (stored in storage only)
  'application/zip': { extension: '.zip', category: 'archive' },
  'application/x-zip-compressed': { extension: '.zip', category: 'archive' },
  'application/x-rar-compressed': { extension: '.rar', category: 'archive' },
  'application/gzip': { extension: '.gz', category: 'archive' },
} as const;

export type SupportedMimeType = keyof typeof SUPPORTED_MIME_TYPES;
export type FileCategory = 'text' | 'document' | 'image' | 'archive';

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
  timestamp: Date;
  channelId?: string;
  chatId?: string;
  isAssistant: boolean;
}

/**
 * Represents a file uploaded to a channel
 * Files are used as context for the AI assistant (RAG pattern)
 * Supports: text files, PDFs, images, and archives
 */
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  storagePath: string;
  uploadedBy: User;
  uploadedAt: Date;
  content?: string; // Only for text files
  channelId: string;
}

/**
 * Request body for sending a new message
 */
export interface SendMessageRequest {
  content: string;
  userId: string;
}

/**
 * Request body for asking the AI assistant
 */
export interface AskAssistantRequest {
  question: string;
  channelId: string;
  userId: string;
}

/**
 * Request body for toggling assistant
 */
export interface ToggleAssistantRequest {
  enabled: boolean;
}

/**
 * Request body for uploading a file
 */
export interface UploadFileRequest {
  name: string;
  content: string;
  userId: string;
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
 * Assistant message (used internally)
 */
export interface AssistantUser extends User {
  id: 'assistant';
  name: 'AI Assistant';
  email: 'assistant@teams.local';
}
