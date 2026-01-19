/**
 * In-memory storage service for Teams Assistant
 * Uses Map objects to store all data for demo purposes
 * Initialized with sample users, channels, chats, and messages
 */

import { User, Channel, Chat, Message, UploadedFile } from '../types';

// ============================================================
// Demo Users
// ============================================================
export const users: Map<string, User> = new Map();

const demoUsers: User[] = [
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
demoUsers.forEach((user) => users.set(user.id, user));

// ============================================================
// Demo Channels
// ============================================================
export const channels: Map<string, Channel> = new Map();

const demoChannels: Channel[] = [
  {
    id: 'channel-general',
    name: 'General',
    description: 'General discussion for the whole team',
    members: [
      users.get('user-1')!,
      users.get('user-2')!,
      users.get('user-3')!,
    ],
    assistantEnabled: true,
    files: [],
  },
  {
    id: 'channel-development',
    name: 'Development',
    description: 'Technical discussions and code reviews',
    members: [users.get('user-1')!, users.get('user-2')!],
    assistantEnabled: false,
    files: [],
  },
];

// Initialize channels
demoChannels.forEach((channel) => channels.set(channel.id, channel));

// ============================================================
// Demo Chats (1-on-1)
// ============================================================
export const chats: Map<string, Chat> = new Map();

const demoChats: Chat[] = [
  {
    id: 'chat-alice-bob',
    participants: [users.get('user-1')!, users.get('user-2')!],
  },
];

// Initialize chats
demoChats.forEach((chat) => chats.set(chat.id, chat));

// ============================================================
// Demo Messages
// ============================================================
export const messages: Map<string, Message> = new Map();

// Helper function to create timestamps in the past
const hoursAgo = (hours: number): Date => {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date;
};

const demoMessages: Message[] = [
  // General channel messages
  {
    id: 'msg-1',
    content: 'Good morning team! 👋 How is everyone doing today?',
    sender: users.get('user-1')!,
    timestamp: hoursAgo(48),
    channelId: 'channel-general',
    isAssistant: false,
  },
  {
    id: 'msg-2',
    content: 'Morning Alice! Doing great, just finished my coffee ☕',
    sender: users.get('user-2')!,
    timestamp: hoursAgo(47),
    channelId: 'channel-general',
    isAssistant: false,
  },
  {
    id: 'msg-3',
    content: "Hey everyone! Ready for the sprint planning later today.",
    sender: users.get('user-3')!,
    timestamp: hoursAgo(46),
    channelId: 'channel-general',
    isAssistant: false,
  },
  {
    id: 'msg-4',
    content:
      "Don't forget we have the quarterly review meeting at 2 PM. Please prepare your updates!",
    sender: users.get('user-1')!,
    timestamp: hoursAgo(24),
    channelId: 'channel-general',
    isAssistant: false,
  },
  {
    id: 'msg-5',
    content: 'Thanks for the reminder Alice! I\'ll have my slides ready.',
    sender: users.get('user-2')!,
    timestamp: hoursAgo(23),
    channelId: 'channel-general',
    isAssistant: false,
  },

  // Development channel messages
  {
    id: 'msg-6',
    content:
      'I pushed the new authentication module to the feature branch. Can someone review it?',
    sender: users.get('user-2')!,
    timestamp: hoursAgo(72),
    channelId: 'channel-development',
    isAssistant: false,
  },
  {
    id: 'msg-7',
    content:
      "I'll take a look at it this afternoon, Bob. Which branch is it on?",
    sender: users.get('user-1')!,
    timestamp: hoursAgo(71),
    channelId: 'channel-development',
    isAssistant: false,
  },
  {
    id: 'msg-8',
    content:
      "It's on `feature/auth-v2`. I also added unit tests for the main flows.",
    sender: users.get('user-2')!,
    timestamp: hoursAgo(70),
    channelId: 'channel-development',
    isAssistant: false,
  },
  {
    id: 'msg-9',
    content:
      'Great work! The code looks clean. I left a few comments about error handling.',
    sender: users.get('user-1')!,
    timestamp: hoursAgo(48),
    channelId: 'channel-development',
    isAssistant: false,
  },

  // 1-on-1 chat messages (Alice ↔ Bob)
  {
    id: 'msg-10',
    content:
      'Hey Bob, do you have time for a quick sync about the project timeline?',
    sender: users.get('user-1')!,
    timestamp: hoursAgo(5),
    chatId: 'chat-alice-bob',
    isAssistant: false,
  },
  {
    id: 'msg-11',
    content: 'Sure Alice! How about in 30 minutes?',
    sender: users.get('user-2')!,
    timestamp: hoursAgo(4),
    chatId: 'chat-alice-bob',
    isAssistant: false,
  },
  {
    id: 'msg-12',
    content: "Perfect, I'll send you a meeting invite. Thanks!",
    sender: users.get('user-1')!,
    timestamp: hoursAgo(3),
    chatId: 'chat-alice-bob',
    isAssistant: false,
  },
];

// Initialize messages
demoMessages.forEach((message) => messages.set(message.id, message));

// ============================================================
// Demo Files
// ============================================================
export const files: Map<string, UploadedFile> = new Map();

const demoFiles: UploadedFile[] = [
  {
    id: 'file-1',
    name: 'project-guidelines.md',
    size: 1250,
    mimeType: 'text/markdown',
    storagePath: 'demo/project-guidelines.md',
    uploadedBy: users.get('user-1')!,
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
    uploadedBy: users.get('user-3')!,
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
  files.set(file.id, file);
  const channel = channels.get(file.channelId);
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
export function getUser(id: string): User | undefined {
  return users.get(id);
}

/**
 * Get all users
 */
export function getAllUsers(): User[] {
  return Array.from(users.values());
}

/**
 * Get a channel by ID
 */
export function getChannel(id: string): Channel | undefined {
  return channels.get(id);
}

/**
 * Get all channels
 */
export function getAllChannels(): Channel[] {
  return Array.from(channels.values());
}

/**
 * Get a chat by ID
 */
export function getChat(id: string): Chat | undefined {
  return chats.get(id);
}

/**
 * Get all chats for a user
 */
export function getChatsForUser(userId: string): Chat[] {
  return Array.from(chats.values()).filter((chat) =>
    chat.participants.some((p) => p.id === userId)
  );
}

/**
 * Get messages for a channel or chat
 */
export function getMessagesFor(channelOrChatId: string): Message[] {
  return Array.from(messages.values())
    .filter(
      (msg) =>
        msg.channelId === channelOrChatId || msg.chatId === channelOrChatId
    )
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

/**
 * Get last N messages for a channel (used for AI context)
 */
export function getLastMessages(channelId: string, count: number): Message[] {
  const channelMessages = getMessagesFor(channelId);
  return channelMessages.slice(-count);
}

/**
 * Add a new message
 */
export function addMessage(message: Message): Message {
  messages.set(message.id, message);
  return message;
}

/**
 * Get files for a channel
 */
export function getFilesForChannel(channelId: string): UploadedFile[] {
  return Array.from(files.values()).filter(
    (file) => file.channelId === channelId
  );
}

/**
 * Add a file to a channel
 */
export function addFile(file: UploadedFile): UploadedFile {
  files.set(file.id, file);
  const channel = channels.get(file.channelId);
  if (channel) {
    channel.files.push(file);
  }
  return file;
}

/**
 * Toggle assistant for a channel
 */
export function toggleChannelAssistant(
  channelId: string,
  enabled: boolean
): Channel | undefined {
  const channel = channels.get(channelId);
  if (channel) {
    channel.assistantEnabled = enabled;
  }
  return channel;
}

/**
 * Generate a unique ID
 */
export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Log storage initialization
console.log('📦 Storage initialized with demo data:');
console.log(`   - ${users.size} users`);
console.log(`   - ${channels.size} channels`);
console.log(`   - ${chats.size} chats`);
console.log(`   - ${messages.size} messages`);
console.log(`   - ${files.size} files`);
