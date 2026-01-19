/**
 * In-memory storage service for Teams Assistant
 * Uses Map objects to store all data for demo purposes
 * Initialized with sample users, channels, chats, and messages
 */
import { User, Channel, Chat, Message, UploadedFile } from '../types';
export declare const users: Map<string, User>;
export declare const channels: Map<string, Channel>;
export declare const chats: Map<string, Chat>;
export declare const messages: Map<string, Message>;
export declare const files: Map<string, UploadedFile>;
/**
 * Get a user by ID
 */
export declare function getUser(id: string): User | undefined;
/**
 * Get all users
 */
export declare function getAllUsers(): User[];
/**
 * Get a channel by ID
 */
export declare function getChannel(id: string): Channel | undefined;
/**
 * Get all channels
 */
export declare function getAllChannels(): Channel[];
/**
 * Get a chat by ID
 */
export declare function getChat(id: string): Chat | undefined;
/**
 * Get all chats for a user
 */
export declare function getChatsForUser(userId: string): Chat[];
/**
 * Get messages for a channel or chat
 */
export declare function getMessagesFor(channelOrChatId: string): Message[];
/**
 * Get last N messages for a channel (used for AI context)
 */
export declare function getLastMessages(channelId: string, count: number): Message[];
/**
 * Add a new message
 */
export declare function addMessage(message: Message): Message;
/**
 * Get files for a channel
 */
export declare function getFilesForChannel(channelId: string): UploadedFile[];
/**
 * Add a file to a channel
 */
export declare function addFile(file: UploadedFile): UploadedFile;
/**
 * Toggle assistant for a channel
 */
export declare function toggleChannelAssistant(channelId: string, enabled: boolean): Channel | undefined;
/**
 * Generate a unique ID
 */
export declare function generateId(prefix: string): string;
//# sourceMappingURL=storage.d.ts.map