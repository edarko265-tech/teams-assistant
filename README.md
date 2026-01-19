# Teams Assistant

A Microsoft Teams-like chat application with an AI assistant feature powered by OpenAI.

![Teams Assistant](https://img.shields.io/badge/version-1.0.0-blue)
![Node.js](https://img.shields.io/badge/node.js-18+-green)
![React](https://img.shields.io/badge/react-18+-blue)
![TypeScript](https://img.shields.io/badge/typescript-5+-blue)

## 🎯 Features

- **Channels** - Multi-user chat rooms with AI assistant support
- **Individual Chats** - 1-on-1 direct messaging (no AI assistant)
- **AI Assistant** - Ask questions about channel content using OpenAI (RAG pattern)
- **File Uploads** - Upload text files to channels for AI context
- **Real-time Updates** - Auto-refresh messages with polling
- **Teams-like UI** - Microsoft Teams-inspired design

## 🏗️ Architecture

```
teams-assistant/
├── backend/                 # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── index.ts        # Main server entry point
│   │   ├── routes/         # API route handlers
│   │   │   ├── channels.ts
│   │   │   ├── chats.ts
│   │   │   ├── messages.ts
│   │   │   ├── files.ts
│   │   │   └── assistant.ts
│   │   ├── services/
│   │   │   ├── storage.ts  # In-memory data storage
│   │   │   └── openai.ts   # OpenAI API integration
│   │   └── types/
│   │       └── index.ts    # TypeScript interfaces
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/               # React + TypeScript UI
    ├── src/
    │   ├── App.tsx
    │   ├── index.tsx
    │   ├── components/
    │   │   ├── Sidebar.tsx
    │   │   ├── ChatWindow.tsx
    │   │   ├── MessageList.tsx
    │   │   ├── MessageInput.tsx
    │   │   ├── AssistantToggle.tsx
    │   │   ├── FileUpload.tsx
    │   │   └── UserAvatar.tsx
    │   ├── contexts/
    │   │   └── AppContext.tsx
    │   ├── hooks/
    │   │   └── useChat.ts
    │   ├── styles/
    │   │   └── teams.css
    │   └── types/
    │       └── index.ts
    └── package.json
```

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key (for AI assistant feature)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/teams-assistant.git
cd teams-assistant
```

### 2. Set Up the Backend

```bash
cd backend
npm install

# Create .env file from example
cp .env.example .env

# Edit .env and add your OpenAI API key
# OPENAI_API_KEY=sk-your-api-key-here

# Start the development server
npm run dev
```

The backend will start on `http://localhost:5000`

### 3. Set Up the Frontend

```bash
cd frontend
npm install

# Start the development server
npm start
```

The frontend will start on `http://localhost:3000`

## 🔌 API Endpoints

### Channels

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/channels` | List all channels |
| GET | `/api/channels/:id` | Get channel details |
| POST | `/api/channels/:id/toggle-assistant` | Toggle AI assistant |

### Chats

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chats` | List user's chats |
| GET | `/api/chats/:id` | Get chat details |

### Messages

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/:id` | Get messages |
| POST | `/api/messages/:id` | Send a message |

### Files

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/files/:channelId` | Get channel files |
| POST | `/api/files/:channelId` | Upload a file |

### Assistant

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/assistant/ask` | Ask AI a question |
| GET | `/api/assistant/status` | Check AI status |

## 👥 Demo Users

The app comes pre-configured with demo data:

| User | Role |
|------|------|
| Alice Johnson | Current user (you) |
| Bob Smith | Team member |
| Charlie Brown | Team member |

### Demo Channels

- **#General** - All 3 members, AI assistant enabled
- **#Development** - Alice & Bob, AI assistant disabled

### Demo Chat

- Alice ↔ Bob - 1-on-1 direct message (no AI assistant)

## 🤖 AI Assistant

The AI assistant is available **only in channels** (not in individual chats).

### How it works:

1. Enable the assistant using the toggle in the channel header
2. Click "@Assistant" button in the message input
3. Type your question
4. The AI uses **RAG (Retrieval-Augmented Generation)**:
   - Last 20 messages from the channel
   - All uploaded files in the channel
5. The response appears as a message visible to all members

### Supported file types for AI context:
- `.txt`, `.md`, `.json`, `.csv`, `.xml`, `.yaml`, `.yml`

## ✅ Testing Checklist

- [ ] Can switch between channels and individual chats
- [ ] Can send messages in both channels and chats
- [ ] Assistant toggle only appears in channels
- [ ] Can toggle assistant on/off in a channel
- [ ] Can ask the assistant a question when enabled
- [ ] Assistant uses message history and files as context
- [ ] Assistant does NOT appear in individual chats
- [ ] Can upload a text file to a channel
- [ ] Can view uploaded files
- [ ] Messages auto-refresh (polling every 3 seconds)
- [ ] UI looks like Microsoft Teams

## 🎨 Design

The UI is inspired by Microsoft Teams with:

- **Teams Purple** (#6264A7) primary color
- **Segoe UI** font family
- **Three-column layout**: Sidebar | Chat | (optional details)
- **User avatars** with deterministic colors
- **Smooth transitions** and hover effects

## 🛠️ Tech Stack

### Backend
- Node.js
- Express.js
- TypeScript
- OpenAI SDK (v4+)
- In-memory storage (Map objects)

### Frontend
- React 18
- TypeScript
- Context API for state management
- Axios for HTTP requests
- CSS (no framework)

## 📝 Environment Variables

### Backend (.env)

```env
# Required: OpenAI API key for AI assistant
OPENAI_API_KEY=sk-your-api-key-here

# Optional: Server port (default: 5000)
PORT=5000
```

## 🔧 Development

### Backend Commands

```bash
npm run dev    # Start development server with hot reload
npm run build  # Build for production
npm start      # Run production build
```

### Frontend Commands

```bash
npm start      # Start development server
npm run build  # Build for production
npm test       # Run tests
```

## 📄 License

MIT License - feel free to use this project for learning and development.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

Built with ❤️ using React, Node.js, and OpenAI

---

## Previous Installation Notes (Archived)

### Installation (Legacy)
1. Clone the repository:
   ```bash
   git clone https://github.com/edarko265-tech/teams-assistant.git
   ```
2. Navigate into the cloned directory:
   ```bash
   cd teams-assistant
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```
4. Start the application:
   ```bash
   npm start
   ```

## Usage
- After starting the application, navigate to `http://localhost:3000` to access the chat application.
- Users can register and create their profiles.
- Create channels or start individual chats to interact with other users or the AI assistant.

## API Documentation
- **GET /api/channels**: Retrieve all channels.
- **POST /api/channels**: Create a new channel.
- **GET /api/messages**: Retrieve messages for a specific chat.
- **POST /api/messages**: Send a new message to a chat.

## Contributing
If you'd like to contribute to this project, please fork the repository and submit a pull request.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments
- AI Technologies used for the assistant functionality.
- Team collaboration and support.

## Contact
For any inquiries, please contact [your-email@example.com].

---

### Current Date and Time
This README was generated on 2026-01-19 15:48:17 UTC.