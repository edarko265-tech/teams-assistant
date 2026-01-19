/**
 * ChatWindow Component
 * Main chat area with header, message list, and input
 */

import React from 'react';
import { useChat } from '../hooks/useChat';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import AssistantToggle from './AssistantToggle';
import FileUpload from './FileUpload';
import UserAvatar from './UserAvatar';

export function ChatWindow() {
  const {
    conversationName,
    isChannel,
    selectedChannel,
    chatPartner,
    channelMembers,
    error,
    clearError,
  } = useChat();

  // No conversation selected
  if (!conversationName) {
    return (
      <main className="chat-window chat-window-empty">
        <div className="chat-window-empty-content">
          <span className="chat-window-empty-icon">💬</span>
          <h2>Select a conversation</h2>
          <p>Choose a channel or chat from the sidebar to start messaging</p>
        </div>
      </main>
    );
  }

  return (
    <main className="chat-window">
      {/* Header */}
      <header className="chat-header">
        <div className="chat-header-left">
          {isChannel ? (
            <>
              <span className="chat-header-icon">#</span>
              <div className="chat-header-info">
                <h2 className="chat-header-name">{conversationName}</h2>
                {selectedChannel && (
                  <span className="chat-header-description">
                    {selectedChannel.description}
                  </span>
                )}
              </div>
            </>
          ) : (
            <>
              {chatPartner && <UserAvatar user={chatPartner} size="medium" />}
              <div className="chat-header-info">
                <h2 className="chat-header-name">{conversationName}</h2>
                <span className="chat-header-status">Direct message</span>
              </div>
            </>
          )}
        </div>
        <div className="chat-header-right">
          {isChannel && (
            <>
              <FileUpload />
              <AssistantToggle />
            </>
          )}
          {/* Members indicator */}
          {isChannel && channelMembers.length > 0 && (
            <div className="chat-header-members" title="Channel members">
              <span className="chat-header-members-icon">👥</span>
              <span className="chat-header-members-count">
                {channelMembers.length}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="chat-error-banner">
          <span className="chat-error-icon">⚠️</span>
          <span className="chat-error-message">{error}</span>
          <button className="chat-error-dismiss" onClick={clearError}>
            ✕
          </button>
        </div>
      )}

      {/* Messages */}
      <MessageList />

      {/* Input */}
      <footer className="chat-footer">
        <MessageInput />
      </footer>
    </main>
  );
}

export default ChatWindow;
