/**
 * Sidebar Component
 * Displays list of channels and individual chats
 * Allows switching between conversations
 */

import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import UserAvatar from './UserAvatar';

export function Sidebar() {
  const {
    currentUser,
    channels,
    chats,
    selectedChannelId,
    selectedChatId,
    setSelectedChannel,
    setSelectedChat,
  } = useAppContext();

  return (
    <aside className="sidebar">
      {/* Header with current user */}
      <div className="sidebar-header">
        <div className="sidebar-user">
          <UserAvatar user={currentUser} size="medium" />
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{currentUser.name}</span>
            <span className="sidebar-user-status">🟢 Available</span>
          </div>
        </div>
      </div>

      {/* Channels section */}
      <div className="sidebar-section">
        <h3 className="sidebar-section-title">
          <span className="sidebar-section-icon">📢</span>
          Channels
        </h3>
        <ul className="sidebar-list">
          {channels.map((channel) => (
            <li
              key={channel.id}
              className={`sidebar-item ${
                selectedChannelId === channel.id ? 'sidebar-item-active' : ''
              }`}
              onClick={() => setSelectedChannel(channel.id)}
            >
              <span className="sidebar-item-icon">#</span>
              <span className="sidebar-item-name">{channel.name}</span>
              {channel.assistantEnabled && (
                <span className="sidebar-item-badge" title="AI Assistant enabled">
                  🤖
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Chats section */}
      <div className="sidebar-section">
        <h3 className="sidebar-section-title">
          <span className="sidebar-section-icon">💬</span>
          Chats
        </h3>
        <ul className="sidebar-list">
          {chats.map((chat) => {
            // Get the other participant
            const otherParticipant = chat.participants.find(
              (p) => p.id !== currentUser.id
            );
            if (!otherParticipant) return null;

            return (
              <li
                key={chat.id}
                className={`sidebar-item ${
                  selectedChatId === chat.id ? 'sidebar-item-active' : ''
                }`}
                onClick={() => setSelectedChat(chat.id)}
              >
                <UserAvatar user={otherParticipant} size="small" />
                <span className="sidebar-item-name">{otherParticipant.name}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* App info */}
      <div className="sidebar-footer">
        <span className="sidebar-app-name">Teams Assistant</span>
        <span className="sidebar-app-version">v1.0.0</span>
      </div>
    </aside>
  );
}

export default Sidebar;
