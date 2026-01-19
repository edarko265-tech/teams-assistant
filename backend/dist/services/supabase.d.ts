/**
 * Supabase Database Service
 * Handles all database operations using Supabase
 */
import { SupabaseClient } from '@supabase/supabase-js';
import { User, Channel, Chat, Message, UploadedFile } from '../types';
export declare const supabase: SupabaseClient;
export declare function getUser(userId: string): Promise<User | null>;
export declare function getUserByEmail(email: string): Promise<User | null>;
export declare function createOrUpdateUser(user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
}): Promise<User | null>;
export declare function getAllUsers(): Promise<User[]>;
export declare function getAllChannels(): Promise<Channel[]>;
export declare function getChannel(channelId: string): Promise<Channel | null>;
export declare function createChannel(name: string, description: string, createdBy: string): Promise<Channel | null>;
export declare function addChannelMember(channelId: string, userId: string): Promise<boolean>;
export declare function updateChannelAssistant(channelId: string, enabled: boolean): Promise<Channel | null>;
export declare function getChatsForUser(userId: string): Promise<Chat[]>;
export declare function getChat(chatId: string): Promise<Chat | null>;
export declare function createChat(participantIds: string[]): Promise<Chat | null>;
export declare function findExistingChat(userId1: string, userId2: string): Promise<Chat | null>;
export declare function getMessagesForChannel(channelId: string): Promise<Message[]>;
export declare function getMessagesForChat(chatId: string): Promise<Message[]>;
export declare function addMessage(content: string, senderId: string, options: {
    channelId?: string;
    chatId?: string;
    isAssistant?: boolean;
}): Promise<Message | null>;
export declare function getFilesForChannel(channelId: string): Promise<UploadedFile[]>;
export declare function addFile(name: string, size: number, mimeType: string, storagePath: string, content: string | undefined, uploadedBy: string, channelId: string): Promise<UploadedFile | null>;
export declare function getFile(fileId: string): Promise<UploadedFile | null>;
export declare function uploadFileToStorage(bucket: string, path: string, file: Buffer, contentType: string): Promise<string | null>;
export declare function getFileUrl(bucket: string, path: string): Promise<string | null>;
export declare function deleteFileFromStorage(bucket: string, path: string): Promise<boolean>;
export declare function initializeDatabase(): Promise<void>;
export default supabase;
//# sourceMappingURL=supabase.d.ts.map