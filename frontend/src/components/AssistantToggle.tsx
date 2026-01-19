/**
 * AssistantToggle Component
 * Toggle switch to enable/disable the AI assistant for a channel
 * Only visible in channels, not in individual chats
 */

import React from 'react';
import { useChat } from '../hooks/useChat';

export function AssistantToggle() {
  const { selectedChannel, canToggleAssistant, toggleAssistant, isLoading } = useChat();

  // Don't render if not in a channel
  if (!canToggleAssistant || !selectedChannel) {
    return null;
  }

  const isEnabled = selectedChannel.assistantEnabled;

  const handleToggle = async () => {
    if (!isLoading) {
      await toggleAssistant(!isEnabled);
    }
  };

  return (
    <div className="assistant-toggle">
      <span className="assistant-toggle-label">
        🤖 AI Assistant: {isEnabled ? 'On' : 'Off'}
      </span>
      <button
        className={`toggle-switch ${isEnabled ? 'toggle-switch-on' : ''}`}
        onClick={handleToggle}
        disabled={isLoading}
        aria-label={`Toggle AI Assistant ${isEnabled ? 'off' : 'on'}`}
        title={isEnabled ? 'Click to disable AI Assistant' : 'Click to enable AI Assistant'}
      >
        <span className="toggle-switch-slider" />
      </button>
    </div>
  );
}

export default AssistantToggle;
