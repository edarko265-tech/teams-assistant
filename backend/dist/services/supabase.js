"use strict";
/**
 * Supabase Database Service
 * Handles all database operations using Supabase
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
exports.getUser = getUser;
exports.getUserByEmail = getUserByEmail;
exports.createOrUpdateUser = createOrUpdateUser;
exports.getAllUsers = getAllUsers;
exports.getAllChannels = getAllChannels;
exports.getChannel = getChannel;
exports.createChannel = createChannel;
exports.addChannelMember = addChannelMember;
exports.updateChannelAssistant = updateChannelAssistant;
exports.getChatsForUser = getChatsForUser;
exports.getChat = getChat;
exports.createChat = createChat;
exports.findExistingChat = findExistingChat;
exports.getMessagesForChannel = getMessagesForChannel;
exports.getMessagesForChat = getMessagesForChat;
exports.addMessage = addMessage;
exports.getFilesForChannel = getFilesForChannel;
exports.addFile = addFile;
exports.getFile = getFile;
exports.uploadFileToStorage = uploadFileToStorage;
exports.getFileUrl = getFileUrl;
exports.deleteFileFromStorage = deleteFileFromStorage;
exports.initializeDatabase = initializeDatabase;
const supabase_js_1 = require("@supabase/supabase-js");
// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseKey = supabaseServiceKey || supabaseAnonKey || '';
if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Supabase credentials not configured. Using fallback mode.');
}
else if (!supabaseServiceKey) {
    console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY not set. Using anon key; RLS may block writes.');
}
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
// ============================================================
// Helper Functions
// ============================================================
function dbUserToUser(dbUser) {
    return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        avatar: dbUser.avatar_url,
    };
}
async function getUserById(userId) {
    const { data, error } = await exports.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
    if (error || !data)
        return null;
    return dbUserToUser(data);
}
// ============================================================
// User Operations
// ============================================================
async function getUser(userId) {
    return getUserById(userId);
}
async function getUserByEmail(email) {
    const { data, error } = await exports.supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
    if (error || !data)
        return null;
    return dbUserToUser(data);
}
async function createOrUpdateUser(user) {
    const { data, error } = await exports.supabase
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
async function getAllUsers() {
    const { data, error } = await exports.supabase
        .from('users')
        .select('*')
        .order('name');
    if (error || !data)
        return [];
    return data.map(dbUserToUser);
}
// ============================================================
// Channel Operations
// ============================================================
async function getAllChannels() {
    const { data: channels, error } = await exports.supabase
        .from('channels')
        .select('*')
        .order('name');
    if (error || !channels)
        return [];
    // Get members and files for each channel
    const result = [];
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
async function getChannel(channelId) {
    const { data, error } = await exports.supabase
        .from('channels')
        .select('*')
        .eq('id', channelId)
        .single();
    if (error || !data)
        return null;
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
async function getChannelMembers(channelId) {
    const { data, error } = await exports.supabase
        .from('channel_members')
        .select('user_id')
        .eq('channel_id', channelId);
    if (error || !data)
        return [];
    const members = [];
    for (const member of data) {
        const user = await getUserById(member.user_id);
        if (user)
            members.push(user);
    }
    return members;
}
async function createChannel(name, description, createdBy) {
    const { data, error } = await exports.supabase
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
async function addChannelMember(channelId, userId) {
    const { error } = await exports.supabase
        .from('channel_members')
        .upsert({ channel_id: channelId, user_id: userId });
    return !error;
}
async function updateChannelAssistant(channelId, enabled) {
    const { data, error } = await exports.supabase
        .from('channels')
        .update({ assistant_enabled: enabled, updated_at: new Date().toISOString() })
        .eq('id', channelId)
        .select()
        .single();
    if (error || !data)
        return null;
    return getChannel(channelId);
}
// ============================================================
// Chat Operations
// ============================================================
async function getChatsForUser(userId) {
    const { data: participations, error } = await exports.supabase
        .from('chat_participants')
        .select('chat_id')
        .eq('user_id', userId);
    if (error || !participations)
        return [];
    const chats = [];
    for (const p of participations) {
        const chat = await getChat(p.chat_id);
        if (chat)
            chats.push(chat);
    }
    return chats;
}
async function getChat(chatId) {
    const { data, error } = await exports.supabase
        .from('chats')
        .select('*')
        .eq('id', chatId)
        .single();
    if (error || !data)
        return null;
    const participants = await getChatParticipants(chatId);
    return {
        id: data.id,
        participants,
    };
}
async function getChatParticipants(chatId) {
    const { data, error } = await exports.supabase
        .from('chat_participants')
        .select('user_id')
        .eq('chat_id', chatId);
    if (error || !data)
        return [];
    const participants = [];
    for (const p of data) {
        const user = await getUserById(p.user_id);
        if (user)
            participants.push(user);
    }
    return participants;
}
async function createChat(participantIds) {
    const { data, error } = await exports.supabase
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
        await exports.supabase
            .from('chat_participants')
            .insert({ chat_id: data.id, user_id: participantId });
    }
    return getChat(data.id);
}
async function findExistingChat(userId1, userId2) {
    // Find chats where both users are participants
    const { data: user1Chats } = await exports.supabase
        .from('chat_participants')
        .select('chat_id')
        .eq('user_id', userId1);
    if (!user1Chats)
        return null;
    for (const { chat_id } of user1Chats) {
        const { data: participants } = await exports.supabase
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
async function getMessagesForChannel(channelId) {
    const { data, error } = await exports.supabase
        .from('messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true });
    if (error || !data)
        return [];
    const messages = [];
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
async function getMessagesForChat(chatId) {
    const { data, error } = await exports.supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });
    if (error || !data)
        return [];
    const messages = [];
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
async function addMessage(content, senderId, options) {
    const { data, error } = await exports.supabase
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
    if (!sender)
        return null;
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
async function getFilesForChannel(channelId) {
    const { data, error } = await exports.supabase
        .from('files')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: false });
    if (error || !data)
        return [];
    const files = [];
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
async function addFile(name, size, mimeType, storagePath, content, uploadedBy, channelId) {
    const { data, error } = await exports.supabase
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
    if (!uploader)
        return null;
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
async function getFile(fileId) {
    const { data, error } = await exports.supabase
        .from('files')
        .select('*')
        .eq('id', fileId)
        .single();
    if (error || !data)
        return null;
    const uploadedBy = await getUserById(data.uploaded_by);
    if (!uploadedBy)
        return null;
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
async function uploadFileToStorage(bucket, path, file, contentType) {
    const { data, error } = await exports.supabase.storage
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
async function getFileUrl(bucket, path) {
    const { data } = exports.supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
}
async function deleteFileFromStorage(bucket, path) {
    const { error } = await exports.supabase.storage.from(bucket).remove([path]);
    return !error;
}
// ============================================================
// Initialize Database (create tables if needed)
// ============================================================
async function initializeDatabase() {
    console.log('🔌 Connecting to Supabase...');
    // Test connection
    const { data, error } = await exports.supabase.from('users').select('count').limit(1);
    if (error) {
        console.log('⚠️ Database tables may not exist yet. Please run the SQL migration.');
        console.log('   See: backend/src/database/schema.sql');
    }
    else {
        console.log('✅ Supabase connected successfully');
    }
}
exports.default = exports.supabase;
//# sourceMappingURL=supabase.js.map