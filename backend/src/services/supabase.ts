/**
 * Supabase Database Service
 * Handles all database operations using Supabase
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, Channel, Chat, Message, UploadedFile } from '../types';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseKey = supabaseServiceKey || supabaseAnonKey || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase credentials not configured. Using fallback mode.');
} else if (!supabaseServiceKey) {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY not set. Using anon key; RLS may block writes.');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

// ============================================================
// Database Types (matching Supabase schema)
// ============================================================

interface DbUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

interface DbChannel {
  id: string;
  name: string;
  description: string;
  assistant_enabled: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface DbChannelMember {
  channel_id: string;
  user_id: string;
  joined_at: string;
}

interface DbChat {
  id: string;
  created_at: string;
}

interface DbChatParticipant {
  chat_id: string;
  user_id: string;
  joined_at: string;
}

interface DbMessage {
  id: string;
  content: string;
  sender_id: string;
  channel_id?: string;
  chat_id?: string;
  is_assistant: boolean;
  created_at: string;
}

interface DbFile {
  id: string;
  name: string;
  size: number;
  mime_type: string;
  storage_path: string;
  content?: string;
  uploaded_by: string;
  channel_id: string;
  created_at: string;
}

// ============================================================
// Helper Functions
// ============================================================

function dbUserToUser(dbUser: DbUser): User {
  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    avatar: dbUser.avatar_url,
  };
}

async function getUserById(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return dbUserToUser(data);
}

// ============================================================
// User Operations
// ============================================================

export async function getUser(userId: string): Promise<User | null> {
  return getUserById(userId);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !data) return null;
  return dbUserToUser(data);
}

export async function createOrUpdateUser(user: { id: string; email: string; name: string; avatar?: string }): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating/updating user:', error);
    return null;
  }
  return dbUserToUser(data);
}

export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('name');

  if (error || !data) return [];
  return data.map(dbUserToUser);
}

// ============================================================
// Channel Operations
// ============================================================

export async function getAllChannels(): Promise<Channel[]> {
  const { data: channels, error } = await supabase
    .from('channels')
    .select('*')
    .order('name');

  if (error || !channels) return [];

  // Get members and files for each channel
  const result: Channel[] = [];
  for (const channel of channels) {
    const members = await getChannelMembers(channel.id);
    const files = await getFilesForChannel(channel.id);
    result.push({
      id: channel.id,
      name: channel.name,
      description: channel.description,
      assistantEnabled: channel.assistant_enabled,
      members,
      files,
    });
  }
  return result;
}

export async function getChannel(channelId: string): Promise<Channel | null> {
  const { data, error } = await supabase
    .from('channels')
    .select('*')
    .eq('id', channelId)
    .single();

  if (error || !data) return null;

  const members = await getChannelMembers(channelId);
  const files = await getFilesForChannel(channelId);

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    assistantEnabled: data.assistant_enabled,
    members,
    files,
  };
}

async function getChannelMembers(channelId: string): Promise<User[]> {
  const { data, error } = await supabase
    .from('channel_members')
    .select('user_id')
    .eq('channel_id', channelId);

  if (error || !data) return [];

  const members: User[] = [];
  for (const member of data) {
    const user = await getUserById(member.user_id);
    if (user) members.push(user);
  }
  return members;
}

export async function createChannel(
  name: string,
  description: string,
  createdBy: string
): Promise<Channel | null> {
  const { data, error } = await supabase
    .from('channels')
    .insert({
      name,
      description,
      created_by: createdBy,
      assistant_enabled: false,
    })
    .select()
    .single();

  if (error || !data) {
    console.error('Error creating channel:', error);
    return null;
  }

  // Add creator as member
  await addChannelMember(data.id, createdBy);

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    assistantEnabled: data.assistant_enabled,
    members: [],
    files: [],
  };
}

export async function addChannelMember(channelId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('channel_members')
    .upsert({ channel_id: channelId, user_id: userId });

  return !error;
}

export async function updateChannelAssistant(channelId: string, enabled: boolean): Promise<Channel | null> {
  const { data, error } = await supabase
    .from('channels')
    .update({ assistant_enabled: enabled, updated_at: new Date().toISOString() })
    .eq('id', channelId)
    .select()
    .single();

  if (error || !data) return null;

  return getChannel(channelId);
}

// ============================================================
// Chat Operations
// ============================================================

export async function getChatsForUser(userId: string): Promise<Chat[]> {
  const { data: participations, error } = await supabase
    .from('chat_participants')
    .select('chat_id')
    .eq('user_id', userId);

  if (error || !participations) return [];

  const chats: Chat[] = [];
  for (const p of participations) {
    const chat = await getChat(p.chat_id);
    if (chat) chats.push(chat);
  }
  return chats;
}

export async function getChat(chatId: string): Promise<Chat | null> {
  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .eq('id', chatId)
    .single();

  if (error || !data) return null;

  const participants = await getChatParticipants(chatId);

  return {
    id: data.id,
    participants,
  };
}

async function getChatParticipants(chatId: string): Promise<User[]> {
  const { data, error } = await supabase
    .from('chat_participants')
    .select('user_id')
    .eq('chat_id', chatId);

  if (error || !data) return [];

  const participants: User[] = [];
  for (const p of data) {
    const user = await getUserById(p.user_id);
    if (user) participants.push(user);
  }
  return participants;
}

export async function createChat(participantIds: string[]): Promise<Chat | null> {
  const { data, error } = await supabase
    .from('chats')
    .insert({})
    .select()
    .single();

  if (error || !data) {
    console.error('Error creating chat:', error);
    return null;
  }

  // Add participants
  for (const participantId of participantIds) {
    await supabase
      .from('chat_participants')
      .insert({ chat_id: data.id, user_id: participantId });
  }

  return getChat(data.id);
}

export async function findExistingChat(userId1: string, userId2: string): Promise<Chat | null> {
  // Find chats where both users are participants
  const { data: user1Chats } = await supabase
    .from('chat_participants')
    .select('chat_id')
    .eq('user_id', userId1);

  if (!user1Chats) return null;

  for (const { chat_id } of user1Chats) {
    const { data: participants } = await supabase
      .from('chat_participants')
      .select('user_id')
      .eq('chat_id', chat_id);

    if (participants && participants.length === 2) {
      const ids = participants.map((p) => p.user_id);
      if (ids.includes(userId1) && ids.includes(userId2)) {
        return getChat(chat_id);
      }
    }
  }
  return null;
}

// ============================================================
// Message Operations
// ============================================================

export async function getMessagesForChannel(channelId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('channel_id', channelId)
    .order('created_at', { ascending: true });

  if (error || !data) return [];

  const messages: Message[] = [];
  for (const msg of data) {
    const sender = await getUserById(msg.sender_id);
    if (sender) {
      messages.push({
        id: msg.id,
        content: msg.content,
        sender,
        timestamp: new Date(msg.created_at),
        channelId: msg.channel_id,
        isAssistant: msg.is_assistant,
      });
    }
  }
  return messages;
}

export async function getMessagesForChat(chatId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });

  if (error || !data) return [];

  const messages: Message[] = [];
  for (const msg of data) {
    const sender = await getUserById(msg.sender_id);
    if (sender) {
      messages.push({
        id: msg.id,
        content: msg.content,
        sender,
        timestamp: new Date(msg.created_at),
        chatId: msg.chat_id,
        isAssistant: msg.is_assistant,
      });
    }
  }
  return messages;
}

export async function addMessage(
  content: string,
  senderId: string,
  options: { channelId?: string; chatId?: string; isAssistant?: boolean }
): Promise<Message | null> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      content,
      sender_id: senderId,
      channel_id: options.channelId,
      chat_id: options.chatId,
      is_assistant: options.isAssistant || false,
    })
    .select()
    .single();

  if (error || !data) {
    console.error('Error adding message:', error);
    return null;
  }

  const sender = await getUserById(senderId);
  if (!sender) return null;

  return {
    id: data.id,
    content: data.content,
    sender,
    timestamp: new Date(data.created_at),
    channelId: data.channel_id,
    chatId: data.chat_id,
    isAssistant: data.is_assistant,
  };
}

// ============================================================
// File Operations
// ============================================================

export async function getFilesForChannel(channelId: string): Promise<UploadedFile[]> {
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('channel_id', channelId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  const files: UploadedFile[] = [];
  for (const file of data) {
    const uploadedBy = await getUserById(file.uploaded_by);
    if (uploadedBy) {
      files.push({
        id: file.id,
        name: file.name,
        size: file.size,
        mimeType: file.mime_type,
        storagePath: file.storage_path,
        content: file.content,
        uploadedBy,
        uploadedAt: new Date(file.created_at),
        channelId: file.channel_id,
      });
    }
  }
  return files;
}

export async function addFile(
  name: string,
  size: number,
  mimeType: string,
  storagePath: string,
  content: string | undefined,
  uploadedBy: string,
  channelId: string
): Promise<UploadedFile | null> {
  const { data, error } = await supabase
    .from('files')
    .insert({
      name,
      size,
      mime_type: mimeType,
      storage_path: storagePath,
      content,
      uploaded_by: uploadedBy,
      channel_id: channelId,
    })
    .select()
    .single();

  if (error || !data) {
    console.error('Error adding file:', error);
    return null;
  }

  const uploader = await getUserById(uploadedBy);
  if (!uploader) return null;

  return {
    id: data.id,
    name: data.name,
    size: data.size,
    mimeType: data.mime_type,
    storagePath: data.storage_path,
    content: data.content,
    uploadedBy: uploader,
    uploadedAt: new Date(data.created_at),
    channelId: data.channel_id,
  };
}

export async function getFile(fileId: string): Promise<UploadedFile | null> {
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('id', fileId)
    .single();

  if (error || !data) return null;

  const uploadedBy = await getUserById(data.uploaded_by);
  if (!uploadedBy) return null;

  return {
    id: data.id,
    name: data.name,
    size: data.size,
    mimeType: data.mime_type,
    storagePath: data.storage_path,
    content: data.content,
    uploadedBy,
    uploadedAt: new Date(data.created_at),
    channelId: data.channel_id,
  };
}

// ============================================================
// File Storage Operations (Supabase Storage)
// ============================================================

export async function uploadFileToStorage(
  bucket: string,
  path: string,
  file: Buffer,
  contentType: string
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType,
      upsert: true,
    });

  if (error) {
    console.error('Error uploading to storage:', error);
    return null;
  }

  return data.path;
}

export async function getFileUrl(bucket: string, path: string): Promise<string | null> {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteFileFromStorage(bucket: string, path: string): Promise<boolean> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  return !error;
}

// ============================================================
// Initialize Database (create tables if needed)
// ============================================================

export async function initializeDatabase(): Promise<void> {
  console.log('🔌 Connecting to Supabase...');
  
  // Test connection
  const { data, error } = await supabase.from('users').select('count').limit(1);
  
  if (error) {
    console.log('⚠️ Database tables may not exist yet. Please run the SQL migration.');
    console.log('   See: backend/src/database/schema.sql');
  } else {
    console.log('✅ Supabase connected successfully');
  }
}

export default supabase;
