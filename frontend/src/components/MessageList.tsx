/**
 * MessageList Component
 * Modern message list with AI-styled bubbles and animations
 * Auto-scrolls to bottom when new messages arrive
 */

import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '../hooks/useChat';
import UserAvatar from './UserAvatar';

// Typing indicator component
function TypingIndicator({ name }: { name: string }) {
  return (
    <div className="typing-indicator-container animate-fade-in">
      <div className="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <span className="typing-indicator-text">{name} is typing...</span>
    </div>
  );
}

// Message reactions component
function MessageReactions({ reactions }: { reactions?: { emoji: string; count: number }[] }) {
  if (!reactions || reactions.length === 0) return null;
  
  return (
    <div className="message-reactions">
      {reactions.map((reaction, idx) => (
        <button key={idx} className="reaction-badge">
          <span>{reaction.emoji}</span>
          <span className="reaction-count">{reaction.count}</span>
        </button>
      ))}
    </div>
  );
}

export function MessageList() {
  const { messages, currentUser, formatTimestamp } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="message-list message-list-empty">
        <div className="message-list-empty-content animate-fade-in">
          <div className="message-list-empty-icon ai-glow">✨</div>
          <h3>Start a conversation</h3>
          <p className="message-list-empty-hint">
            Send a message to begin chatting with your team
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="message-list scrollbar-thin">
      {messages.map((message, index) => {
        const isOwnMessage = message.sender.id === currentUser?.id;
        const isAssistant = message.isAssistant;
        const isHovered = hoveredMessageId === message.id;

        // Check if we should show the sender info (first message or different sender from previous)
        const showSenderInfo =
          index === 0 || messages[index - 1].sender.id !== message.sender.id;
        
        // Determine animation delay based on index (for initial load)
        const animationDelay = index < 10 ? index * 50 : 0;

        return (
          <div
            key={message.id}
            className={`message animate-fade-in-left ${isOwnMessage ? 'message-own' : ''} ${
              isAssistant ? 'message-assistant' : ''
            } ${showSenderInfo ? 'message-with-sender' : ''}`}
            style={{ animationDelay: `${animationDelay}ms` }}
            onMouseEnter={() => setHoveredMessageId(message.id)}
            onMouseLeave={() => setHoveredMessageId(null)}
          >
            {showSenderInfo && (
              <div className="message-header">
                <UserAvatar
                  user={message.sender}
                  size="medium"
                  isAssistant={isAssistant}
                  status={isOwnMessage ? 'online' : undefined}
                />
                <div className="message-header-info">
                  <span className={`message-sender ${isAssistant ? 'ai-gradient-text' : ''}`}>
                    {isAssistant ? '✨ AI Assistant' : message.sender.name}
                  </span>
                  <span className="message-timestamp">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>
              </div>
            )}
            <div className="message-content">
              <div className={`message-bubble ${isAssistant ? 'ai-shimmer' : ''}`}>
                {message.content.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < message.content.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
              
              {/* Hover actions */}
              {isHovered && (
                <div className="message-actions animate-scale-in">
                  <button className="message-action-btn" title="React">😊</button>
                  <button className="message-action-btn" title="Reply">↩️</button>
                  <button className="message-action-btn" title="More">⋯</button>
                </div>
              )}
              
              {!showSenderInfo && (
                <span className="message-timestamp-inline">
                  {formatTimestamp(message.timestamp)}
                </span>
              )}
            </div>
            
            {/* Reactions (if any) */}
            <MessageReactions reactions={(message as any).reactions} />
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList;
