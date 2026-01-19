# GitHub Copilot Prompt for Building Teams Assistant Application

## Project Structure
- `/backend`  
  - Contains the backend application.  
- `/frontend`  
  - Contains the frontend application.

## Backend Requirements
- **Language**: Node.js
- **Framework**: Express
- **TypeScript**: Yes

### Data Models
- **User**: Represents the users in the application.  
- **Channel**: Represents the conversation channels.  
- **Chat**: Represents individual chats.  
- **Message**: Represents messages exchanged in chats.  
- **UploadedFile**: Represents files uploaded by users.  

## API Endpoints
- **Channels**:  
  - `GET /api/channels`  
  - `POST /api/channels`
- **Chats**:  
  - `GET /api/chats`  
  - `POST /api/chats`
- **Messages**:  
  - `GET /api/messages`  
  - `POST /api/messages`
- **Files**:  
  - `POST /api/files`  
- **Assistant**:  
  - `POST /api/assistant`

## OpenAI Integration Details  
- Use OpenAI API for AI assistant functionalities.
- Handle sessions per channel for multi-user interactions.

## UI Components
- **Sidebar**: For channel and user navigation.
- **ChatWindow**: Displays the active chat.
- **MessageList**: Lists all messages in the chat.
- **MessageInput**: Input field for composing messages.
- **AssistantToggle**: Toggles the AI assistant on/off.
- **FileUpload**: Allows users to upload files.
- **UserAvatar**: Displays user avatars in the interface.

## Styling Requirements
- Ensure a Teams-like appearance  
- Use similar color schemes, margins, and fonts as Microsoft Teams.

## Business Logic
- The AI assistant should function only in channels, not in individual chats.

## Step-by-Step File Generation Order
1. Set up the backend application and create the folder structure.
2. Implement data models in TypeScript.
3. Create API endpoints.
4. Set up the frontend with React and TypeScript.
5. Construct the UI components.
6. Integrate OpenAI. 

## Testing Instructions
- Write unit tests for all API endpoints.
- Ensure UI components are tested with Jest and React Testing Library.
- Validate AI assistant functionalities through integration tests.

---