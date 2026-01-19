# Continue Teams Assistant Project - Prompt for Personal Device

## Context for GitHub Copilot

I have a Teams Assistant project that has been fully coded but not yet tested. The project is a Microsoft Teams-like chat application with AI assistant capabilities. All source files have been created and I need help to:

1. **Install dependencies and run the application**
2. **Test all features**
3. **Fix any bugs that arise**

---

## Project Overview

**Teams Assistant** is a chat application with:
- **Channels** (multi-user) with optional AI assistant
- **Individual Chats** (1-on-1) without AI assistant
- **File uploads** for AI context (RAG pattern)
- **OpenAI integration** for answering questions based on channel content

---

## Project Structure (Already Created)

```
teams-assistant/
├── backend/                      # Node.js + Express + TypeScript
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── src/
│       ├── index.ts              # Main Express server
│       ├── types/index.ts        # TypeScript interfaces
│       ├── services/
│       │   ├── storage.ts        # In-memory storage with demo data
│       │   └── openai.ts         # OpenAI API integration
│       └── routes/
│           ├── channels.ts
│           ├── chats.ts
│           ├── messages.ts
│           ├── files.ts
│           └── assistant.ts
│
├── frontend/                     # React + TypeScript
│   ├── package.json
│   ├── tsconfig.json
│   ├── public/index.html
│   └── src/
│       ├── index.tsx
│       ├── App.tsx
│       ├── types/index.ts
│       ├── contexts/AppContext.tsx
│       ├── hooks/useChat.ts
│       ├── styles/teams.css
│       └── components/
│           ├── Sidebar.tsx
│           ├── ChatWindow.tsx
│           ├── MessageList.tsx
│           ├── MessageInput.tsx
│           ├── AssistantToggle.tsx
│           ├── FileUpload.tsx
│           └── UserAvatar.tsx
│
├── README.md
├── COPILOT_PROMPT.md
└── CONTINUE_ON_PERSONAL_DEVICE.md (this file)
```

---

## What I Need Help With

### Step 1: Prerequisites
Make sure I have installed:
- Node.js 18+ (https://nodejs.org)
- npm (comes with Node.js)

### Step 2: Backend Setup
```bash
cd backend
npm install
# Create .env file with my OpenAI API key
npm run dev
```

### Step 3: Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Step 4: Testing Checklist
- [ ] Backend starts on http://localhost:5000
- [ ] Frontend starts on http://localhost:3000
- [ ] Can switch between channels and chats
- [ ] Can send messages
- [ ] AI Assistant toggle works in channels
- [ ] Can ask AI questions (requires OpenAI API key)
- [ ] Can upload files to channels
- [ ] Messages auto-refresh

---

## Known Issue: Missing useChat.ts Hook

**IMPORTANT**: The `useChat.ts` hook file may not have been created. If you get import errors, please create this file:

**File: `frontend/src/hooks/useChat.ts`**

```typescript
/**
 * useChat Custom Hook
 * Provides chat-related functionality and computed values
 */

import { useMemo, useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { User, Channel, Chat } from '../types';

export function useChat() {
  const context = useAppContext();
  const {
    currentUser,
    selectedChannelId,
    selectedChatId,
    channels,
    chats,
    messages,
    files,
    isLoading,
    error,
    sendMessage,
    askAssistant,
    toggleAssistant,
    uploadFile,
    clearError,
  } = context;

  // Get the selected channel
  const selectedChannel = useMemo(() => {
    if (!selectedChannelId) return undefined;
    return channels.find((ch) => ch.id === selectedChannelId);
  }, [selectedChannelId, channels]);

  // Get the selected chat
  const selectedChat = useMemo(() => {
    if (!selectedChatId) return undefined;
    return chats.find((ch) => ch.id === selectedChatId);
  }, [selectedChatId, chats]);

  // Check if we're in a channel (vs individual chat)
  const isChannel = !!selectedChannelId;

  // Check if assistant is available (only in channels with assistant enabled)
  const isAssistantAvailable = useMemo(() => {
    return isChannel && selectedChannel?.assistantEnabled === true;
  }, [isChannel, selectedChannel]);

  // Check if we can toggle assistant (only in channels)
  const canToggleAssistant = isChannel;

  // Check if we can upload files (only in channels)
  const canUploadFiles = isChannel;

  // Get the conversation name
  const conversationName = useMemo(() => {
    if (selectedChannel) {
      return selectedChannel.name;
    }
    if (selectedChat) {
      const otherParticipant = selectedChat.participants.find(
        (p) => p.id !== currentUser.id
      );
      return otherParticipant?.name || 'Chat';
    }
    return '';
  }, [selectedChannel, selectedChat, currentUser.id]);

  // Get the chat partner (for 1-on-1 chats)
  const chatPartner = useMemo((): User | undefined => {
    if (!selectedChat) return undefined;
    return selectedChat.participants.find((p) => p.id !== currentUser.id);
  }, [selectedChat, currentUser.id]);

  // Get channel members
  const channelMembers = useMemo((): User[] => {
    return selectedChannel?.members || [];
  }, [selectedChannel]);

  /**
   * Format a timestamp for display
   */
  const formatTimestamp = useCallback((timestamp: Date | string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    if (diffDays === 0) {
      return timeStr;
    } else if (diffDays === 1) {
      return `Yesterday at ${timeStr}`;
    } else if (diffDays < 7) {
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      return `${dayName} at ${timeStr}`;
    } else {
      const dateStr = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      return `${dateStr} at ${timeStr}`;
    }
  }, []);

  /**
   * Format file size for display
   */
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }, []);

  return {
    // State
    currentUser,
    messages,
    files,
    isLoading,
    error,

    // Selection
    selectedChannel,
    selectedChat,
    isChannel,
    conversationName,
    chatPartner,
    channelMembers,

    // Assistant
    isAssistantAvailable,
    canToggleAssistant,

    // Files
    canUploadFiles,

    // Actions
    sendMessage,
    askAssistant,
    toggleAssistant,
    uploadFile,
    clearError,

    // Formatters
    formatTimestamp,
    formatFileSize,
  };
}

export default useChat;
```

---

## Environment Setup

Create `backend/.env` file:
```
OPENAI_API_KEY=sk-your-openai-api-key-here
PORT=5000
```

---

## Quick Commands

```bash
# Terminal 1 - Backend
cd teams-assistant/backend
npm install
npm run dev

# Terminal 2 - Frontend  
cd teams-assistant/frontend
npm install
npm start
```

---

## If You Encounter Errors

Tell Copilot:
> "I'm getting this error: [paste error]. Please help me fix it."

Common issues:
1. **Missing dependencies** - Run `npm install` in both backend and frontend
2. **Port already in use** - Kill the process or change PORT in .env
3. **TypeScript errors** - May need to fix type definitions
4. **CORS errors** - Backend must be running on port 5000
5. **OpenAI errors** - Check your API key in .env file

---

## Demo Data

The app includes:
- **3 Users**: Alice Johnson (you), Bob Smith, Charlie Brown
- **2 Channels**: #General (AI enabled), #Development (AI disabled)
- **1 Chat**: Alice ↔ Bob direct message
- **Sample messages** in each conversation
- **2 sample files** in #General channel

---

## Goal

Get the application running and test all features. The AI assistant should:
1. Only appear in channels (not individual chats)
2. Use channel messages and files as context
3. Answer questions about channel content

Good luck! 🚀
