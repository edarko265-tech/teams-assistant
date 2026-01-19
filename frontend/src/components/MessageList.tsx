/**
 * MessageList Component
 * Displays all messages for the current channel or chat
 * Auto-scrolls to bottom when new messages arrive
 */

import React, { useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat';
import UserAvatar from './UserAvatar';

export function MessageList() {
  const { messages, currentUser, formatTimestamp } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="message-list message-list-empty">
        <div className="message-list-empty-content">
          <span className="message-list-empty-icon">💬</span>
          <p>No messages yet</p>
          <p className="message-list-empty-hint">Start a conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages.map((message, index) => {
        const isOwnMessage = message.sender.id === currentUser.id;
        const isAssistant = message.isAssistant;

        // Check if we should show the sender info (first message or different sender from previous)
        const showSenderInfo =
          index === 0 || messages[index - 1].sender.id !== message.sender.id;

        return (
          <div
            key={message.id}
            className={`message ${isOwnMessage ? 'message-own' : ''} ${
              isAssistant ? 'message-assistant' : ''
            } ${showSenderInfo ? 'message-with-sender' : ''}`}
          >
            {showSenderInfo && (
              <div className="message-header">
                <UserAvatar
                  user={message.sender}
                  size="medium"
                  isAssistant={isAssistant}
                />
                <div className="message-header-info">
                  <span className="message-sender">
                    {isAssistant ? '🤖 AI Assistant' : message.sender.name}
                  </span>
                  <span className="message-timestamp">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>
              </div>
            )}
            <div className="message-content">
              <div className="message-bubble">
                {message.content.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < message.content.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
              {!showSenderInfo && (
                <span className="message-timestamp-inline">
                  {formatTimestamp(message.timestamp)}
                </span>
              )}
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList;
