"use strict";
/**
 * In-memory storage service for Teams Assistant
 * Uses Map objects to store all data for demo purposes
 * Initialized with sample users, channels, chats, and messages
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.files = exports.messages = exports.chats = exports.channels = exports.users = void 0;
exports.getUser = getUser;
exports.getAllUsers = getAllUsers;
exports.getChannel = getChannel;
exports.getAllChannels = getAllChannels;
exports.getChat = getChat;
exports.getChatsForUser = getChatsForUser;
exports.getMessagesFor = getMessagesFor;
exports.getLastMessages = getLastMessages;
exports.addMessage = addMessage;
exports.getFilesForChannel = getFilesForChannel;
exports.addFile = addFile;
exports.toggleChannelAssistant = toggleChannelAssistant;
exports.generateId = generateId;
// ============================================================
// Demo Users
// ============================================================
exports.users = new Map();
const demoUsers = [
    {
        id: 'user-1',
        name: 'Alice Johnson',
        email: 'alice.johnson@company.com',
    },
    {
        id: 'user-2',
        name: 'Bob Smith',
        email: 'bob.smith@company.com',
    },
    {
        id: 'user-3',
        name: 'Charlie Brown',
        email: 'charlie.brown@company.com',
    },
];
// Initialize users
demoUsers.forEach((user) => exports.users.set(user.id, user));
// ============================================================
// Demo Channels
// ============================================================
exports.channels = new Map();
const demoChannels = [
    {
        id: 'channel-general',
        name: 'General',
        description: 'General discussion for the whole team',
        members: [
            exports.users.get('user-1'),
            exports.users.get('user-2'),
            exports.users.get('user-3'),
        ],
        assistantEnabled: true,
        files: [],
    },
    {
        id: 'channel-development',
        name: 'Development',
        description: 'Technical discussions and code reviews',
        members: [exports.users.get('user-1'), exports.users.get('user-2')],
        assistantEnabled: false,
        files: [],
    },
];
// Initialize channels
demoChannels.forEach((channel) => exports.channels.set(channel.id, channel));
// ============================================================
// Demo Chats (1-on-1)
// ============================================================
exports.chats = new Map();
const demoChats = [
    {
        id: 'chat-alice-bob',
        participants: [exports.users.get('user-1'), exports.users.get('user-2')],
    },
];
// Initialize chats
demoChats.forEach((chat) => exports.chats.set(chat.id, chat));
// ============================================================
// Demo Messages
// ============================================================
exports.messages = new Map();
// Helper function to create timestamps in the past
const hoursAgo = (hours) => {
    const date = new Date();
    date.setHours(date.getHours() - hours);
    return date;
};
const demoMessages = [
    // General channel messages
    {
        id: 'msg-1',
        content: 'Good morning team! 👋 How is everyone doing today?',
        sender: exports.users.get('user-1'),
        timestamp: hoursAgo(48),
        channelId: 'channel-general',
        isAssistant: false,
    },
    {
        id: 'msg-2',
        content: 'Morning Alice! Doing great, just finished my coffee ☕',
        sender: exports.users.get('user-2'),
        timestamp: hoursAgo(47),
        channelId: 'channel-general',
        isAssistant: false,
    },
    {
        id: 'msg-3',
        content: "Hey everyone! Ready for the sprint planning later today.",
        sender: exports.users.get('user-3'),
        timestamp: hoursAgo(46),
        channelId: 'channel-general',
        isAssistant: false,
    },
    {
        id: 'msg-4',
        content: "Don't forget we have the quarterly review meeting at 2 PM. Please prepare your updates!",
        sender: exports.users.get('user-1'),
        timestamp: hoursAgo(24),
        channelId: 'channel-general',
        isAssistant: false,
    },
    {
        id: 'msg-5',
        content: 'Thanks for the reminder Alice! I\'ll have my slides ready.',
        sender: exports.users.get('user-2'),
        timestamp: hoursAgo(23),
        channelId: 'channel-general',
        isAssistant: false,
    },
    // Development channel messages
    {
        id: 'msg-6',
        content: 'I pushed the new authentication module to the feature branch. Can someone review it?',
        sender: exports.users.get('user-2'),
        timestamp: hoursAgo(72),
        channelId: 'channel-development',
        isAssistant: false,
    },
    {
        id: 'msg-7',
        content: "I'll take a look at it this afternoon, Bob. Which branch is it on?",
        sender: exports.users.get('user-1'),
        timestamp: hoursAgo(71),
        channelId: 'channel-development',
        isAssistant: false,
    },
    {
        id: 'msg-8',
        content: "It's on `feature/auth-v2`. I also added unit tests for the main flows.",
        sender: exports.users.get('user-2'),
        timestamp: hoursAgo(70),
        channelId: 'channel-development',
        isAssistant: false,
    },
    {
        id: 'msg-9',
        content: 'Great work! The code looks clean. I left a few comments about error handling.',
        sender: exports.users.get('user-1'),
        timestamp: hoursAgo(48),
        channelId: 'channel-development',
        isAssistant: false,
    },
    // 1-on-1 chat messages (Alice ↔ Bob)
    {
        id: 'msg-10',
        content: 'Hey Bob, do you have time for a quick sync about the project timeline?',
        sender: exports.users.get('user-1'),
        timestamp: hoursAgo(5),
        chatId: 'chat-alice-bob',
        isAssistant: false,
    },
    {
        id: 'msg-11',
        content: 'Sure Alice! How about in 30 minutes?',
        sender: exports.users.get('user-2'),
        timestamp: hoursAgo(4),
        chatId: 'chat-alice-bob',
        isAssistant: false,
    },
    {
        id: 'msg-12',
        content: "Perfect, I'll send you a meeting invite. Thanks!",
        sender: exports.users.get('user-1'),
        timestamp: hoursAgo(3),
        chatId: 'chat-alice-bob',
        isAssistant: false,
    },
];
// Initialize messages
demoMessages.forEach((message) => exports.messages.set(message.id, message));
// ============================================================
// Demo Files
// ============================================================
exports.files = new Map();
const demoFiles = [
    {
        id: 'file-1',
        name: 'project-guidelines.md',
        size: 1250,
        mimeType: 'text/markdown',
        storagePath: 'demo/project-guidelines.md',
        uploadedBy: exports.users.get('user-1'),
        uploadedAt: hoursAgo(168), // 1 week ago
        content: `# Project Guidelines

## Code Standards
- Use TypeScript for all new code
- Follow ESLint configuration
- Write unit tests for all business logic
- Document public APIs with JSDoc comments

## Git Workflow
- Create feature branches from main
- Use conventional commits
- Require PR reviews before merging
- Squash commits when merging

## Sprint Process
- 2-week sprints
- Daily standups at 9:30 AM
- Sprint planning on Mondays
- Retrospectives on Fridays`,
        channelId: 'channel-general',
    },
    {
        id: 'file-2',
        name: 'meeting-notes.txt',
        size: 450,
        mimeType: 'text/plain',
        storagePath: 'demo/meeting-notes.txt',
        uploadedBy: exports.users.get('user-3'),
        uploadedAt: hoursAgo(24),
        content: `Meeting Notes - January 18, 2026

Attendees: Alice, Bob, Charlie

Topics Discussed:
1. Q1 roadmap priorities
2. New feature requests from customers
3. Technical debt reduction plan

Action Items:
- Alice: Finalize roadmap document
- Bob: Create technical debt tickets
- Charlie: Schedule customer feedback sessions

Next Meeting: January 25, 2026`,
        channelId: 'channel-general',
    },
];
// Initialize files and add to channels
demoFiles.forEach((file) => {
    exports.files.set(file.id, file);
    const channel = exports.channels.get(file.channelId);
    if (channel) {
        channel.files.push(file);
    }
});
// ============================================================
// Storage Helper Functions
// ============================================================
/**
 * Get a user by ID
 */
function getUser(id) {
    return exports.users.get(id);
}
/**
 * Get all users
 */
function getAllUsers() {
    return Array.from(exports.users.values());
}
/**
 * Get a channel by ID
 */
function getChannel(id) {
    return exports.channels.get(id);
}
/**
 * Get all channels
 */
function getAllChannels() {
    return Array.from(exports.channels.values());
}
/**
 * Get a chat by ID
 */
function getChat(id) {
    return exports.chats.get(id);
}
/**
 * Get all chats for a user
 */
function getChatsForUser(userId) {
    return Array.from(exports.chats.values()).filter((chat) => chat.participants.some((p) => p.id === userId));
}
/**
 * Get messages for a channel or chat
 */
function getMessagesFor(channelOrChatId) {
    return Array.from(exports.messages.values())
        .filter((msg) => msg.channelId === channelOrChatId || msg.chatId === channelOrChatId)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}
/**
 * Get last N messages for a channel (used for AI context)
 */
function getLastMessages(channelId, count) {
    const channelMessages = getMessagesFor(channelId);
    return channelMessages.slice(-count);
}
/**
 * Add a new message
 */
function addMessage(message) {
    exports.messages.set(message.id, message);
    return message;
}
/**
 * Get files for a channel
 */
function getFilesForChannel(channelId) {
    return Array.from(exports.files.values()).filter((file) => file.channelId === channelId);
}
/**
 * Add a file to a channel
 */
function addFile(file) {
    exports.files.set(file.id, file);
    const channel = exports.channels.get(file.channelId);
    if (channel) {
        channel.files.push(file);
    }
    return file;
}
/**
 * Toggle assistant for a channel
 */
function toggleChannelAssistant(channelId, enabled) {
    const channel = exports.channels.get(channelId);
    if (channel) {
        channel.assistantEnabled = enabled;
    }
    return channel;
}
/**
 * Generate a unique ID
 */
function generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
// Log storage initialization
console.log('📦 Storage initialized with demo data:');
console.log(`   - ${exports.users.size} users`);
console.log(`   - ${exports.channels.size} channels`);
console.log(`   - ${exports.chats.size} chats`);
console.log(`   - ${exports.messages.size} messages`);
console.log(`   - ${exports.files.size} files`);
//# sourceMappingURL=storage.js.map