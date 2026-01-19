/**
 * TypeScript interfaces for Teams Assistant
 * These define the shape of all data models used in the application
 */
/**
 * Supported file MIME types
 */
export declare const SUPPORTED_MIME_TYPES: {
    readonly 'text/plain': {
        readonly extension: ".txt";
        readonly category: "text";
    };
    readonly 'text/markdown': {
        readonly extension: ".md";
        readonly category: "text";
    };
    readonly 'application/json': {
        readonly extension: ".json";
        readonly category: "text";
    };
    readonly 'text/csv': {
        readonly extension: ".csv";
        readonly category: "text";
    };
    readonly 'application/xml': {
        readonly extension: ".xml";
        readonly category: "text";
    };
    readonly 'text/xml': {
        readonly extension: ".xml";
        readonly category: "text";
    };
    readonly 'text/yaml': {
        readonly extension: ".yaml";
        readonly category: "text";
    };
    readonly 'application/x-yaml': {
        readonly extension: ".yml";
        readonly category: "text";
    };
    readonly 'application/pdf': {
        readonly extension: ".pdf";
        readonly category: "document";
    };
    readonly 'image/jpeg': {
        readonly extension: ".jpg";
        readonly category: "image";
    };
    readonly 'image/png': {
        readonly extension: ".png";
        readonly category: "image";
    };
    readonly 'image/gif': {
        readonly extension: ".gif";
        readonly category: "image";
    };
    readonly 'image/webp': {
        readonly extension: ".webp";
        readonly category: "image";
    };
    readonly 'image/svg+xml': {
        readonly extension: ".svg";
        readonly category: "image";
    };
    readonly 'application/zip': {
        readonly extension: ".zip";
        readonly category: "archive";
    };
    readonly 'application/x-zip-compressed': {
        readonly extension: ".zip";
        readonly category: "archive";
    };
    readonly 'application/x-rar-compressed': {
        readonly extension: ".rar";
        readonly category: "archive";
    };
    readonly 'application/gzip': {
        readonly extension: ".gz";
        readonly category: "archive";
    };
};
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
    content?: string;
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
//# sourceMappingURL=index.d.ts.map