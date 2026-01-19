/**
 * TypeScript interfaces for Teams Assistant
 * These define the shape of all data models used in the application
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
  timestamp: Date;
  channelId?: string;
  chatId?: string;
  isAssistant: boolean;
}

/**
 * Represents a file uploaded to a channel
 * Files are used as context for the AI assistant (RAG pattern)
 */
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  uploadedBy: User;
  uploadedAt: Date;
  content: string;
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
