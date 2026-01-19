/**
 * MessageInput Component
 * Modern message input with rich controls and AI assistant integration
 * Includes emoji, attachment, and @Assistant functionality
 */

import React, { useState, useRef, useCallback, KeyboardEvent } from 'react';
import { useChat } from '../hooks/useChat';

interface AssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (question: string) => void;
  isLoading: boolean;
}

function AssistantModal({ isOpen, onClose, onSubmit, isLoading }: AssistantModalProps) {
  const [question, setQuestion] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (question.trim() && !isLoading) {
      onSubmit(question);
      setQuestion('');
      onClose();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal assistant-modal animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header ai-gradient">
          <h3>✨ Ask AI Assistant</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          <p className="assistant-modal-hint">
            Ask a question about the channel's messages and files. The AI will
            analyze the conversation history to provide helpful answers.
          </p>
          <textarea
            ref={inputRef}
            className="assistant-modal-input"
            placeholder="What would you like to know?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            disabled={isLoading}
          />
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button
            className="btn btn-primary ai-gradient"
            onClick={handleSubmit}
            disabled={!question.trim() || isLoading}
          >
            {isLoading ? 'Asking...' : 'Ask'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function MessageInput() {
  const { sendMessage, askAssistant, isAssistantAvailable, isLoading } = useChat();
  const [message, setMessage] = useState('');
  const [showAssistantModal, setShowAssistantModal] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    adjustTextareaHeight();
  };

  const handleSend = async () => {
    if (message.trim() && !isLoading) {
      await sendMessage(message);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAskAssistant = async (question: string) => {
    await askAssistant(question);
  };

  return (
    <div className="message-input-container">
      <div className="message-input-wrapper">
        {/* Left side actions */}
        <div className="message-input-left-actions">
          <button className="input-action-btn" title="Add attachment">
            <span>+</span>
          </button>
        </div>
        
        <div className="message-input-divider"></div>
        
        <textarea
          ref={textareaRef}
          className="message-input"
          placeholder="Type a message..."
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isLoading}
        />
        
        {/* Right side actions */}
        <div className="message-input-right-actions">
          <button className="input-action-btn" title="Add emoji">
            😊
          </button>
          <button className="input-action-btn" title="GIF">
            🎞️
          </button>
          {isAssistantAvailable && (
            <button
              className="btn btn-assistant ai-glow"
              onClick={() => setShowAssistantModal(true)}
              title="Ask AI Assistant"
              disabled={isLoading}
            >
              ✨ AI
            </button>
          )}
          <button
            className="btn btn-send"
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
            title="Send message"
          >
            {isLoading ? (
              <span className="btn-send-loading">⏳</span>
            ) : (
              <span className="btn-send-icon">➤</span>
            )}
          </button>
        </div>
      </div>
      <div className="message-input-hint">
        <span>Press <kbd>Enter</kbd> to send</span>
        <span className="hint-divider">•</span>
        <span><kbd>Shift + Enter</kbd> for new line</span>
      </div>

      <AssistantModal
        isOpen={showAssistantModal}
        onClose={() => setShowAssistantModal(false)}
        onSubmit={handleAskAssistant}
        isLoading={isLoading}
      />
    </div>
  );
}

export default MessageInput;
