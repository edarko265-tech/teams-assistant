/**
 * Sidebar Component
 * Modern dark-themed sidebar with AI branding
 * Displays channels, chats, and user profile
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
    signOut,
  } = useAppContext();

  return (
    <aside className="sidebar scrollbar-thin">
      {/* Header with Brand */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            🤖
          </div>
          <div className="sidebar-brand-text">
            <h1 className="sidebar-brand-title">TeamSpace</h1>
            <p className="sidebar-brand-subtitle">AI-Powered Collaboration</p>
          </div>
        </div>
        
        {/* User Profile */}
        <div className="sidebar-user">
          <UserAvatar user={currentUser} size="medium" />
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{currentUser?.name || 'User'}</span>
            <span className="sidebar-user-status">Online</span>
          </div>
          <button 
            className="btn-signout" 
            onClick={signOut}
            title="Sign out"
          >
            🚪
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="sidebar-search">
        <div className="sidebar-search-wrapper">
          <span className="sidebar-search-icon">🔍</span>
          <input 
            type="text" 
            className="sidebar-search-input"
            placeholder="Search messages..."
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="sidebar-quick-actions">
        <button className="sidebar-quick-btn">
          📹 Meet
        </button>
        <button className="sidebar-quick-btn">
          📅 Schedule
        </button>
      </div>

      {/* Channels section */}
      <div className="sidebar-section scrollbar-thin">
        <h3 className="sidebar-section-title">
          <span>Channels</span>
          <button className="sidebar-section-action" title="Add channel">
            ➕
          </button>
        </h3>
        <ul className="sidebar-list">
          {channels.map((channel) => (
            <li
              key={channel.id}
              className={`sidebar-item animate-fade-in ${
                selectedChannelId === channel.id ? 'sidebar-item-active' : ''
              }`}
              onClick={() => setSelectedChannel(channel.id)}
            >
              <span className="sidebar-item-icon">#</span>
              <span className="sidebar-item-name">{channel.name}</span>
              {channel.assistantEnabled && (
                <span className="sidebar-item-badge badge-ai" title="AI Assistant enabled">
                  AI
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Direct Messages section */}
      <div className="sidebar-section scrollbar-thin">
        <h3 className="sidebar-section-title">
          <span>Direct Messages</span>
          <button className="sidebar-section-action" title="New message">
            ➕
          </button>
        </h3>
        <ul className="sidebar-list">
          {chats.map((chat) => {
            // Get the other participant
            const otherParticipant = chat.participants.find(
              (p) => p.id !== currentUser?.id
            );
            if (!otherParticipant) return null;

            return (
              <li
                key={chat.id}
                className={`sidebar-item animate-fade-in ${
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

      {/* Footer */}
      <div className="sidebar-footer">
        <span className="sidebar-app-name" style={{ color: 'var(--sidebar-fg)', opacity: 0.7 }}>
          Teams Assistant
        </span>
        <span className="sidebar-app-version" style={{ color: 'var(--sidebar-fg)', opacity: 0.5 }}>
          v1.0.0
        </span>
      </div>
    </aside>
  );
}

export default Sidebar;
