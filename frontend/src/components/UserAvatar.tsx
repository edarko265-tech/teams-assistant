/**
 * UserAvatar Component
 * Modern avatar with gradient colors and status indicators
 * Inspired by modern collaboration tools
 */

import React from 'react';
import { User } from '../types';

interface UserAvatarProps {
  user: User | null | undefined;
  size?: 'small' | 'medium' | 'large';
  isAssistant?: boolean;
  status?: 'online' | 'away' | 'busy' | 'offline';
  showRing?: boolean;
}

// Modern gradient color pairs
const AVATAR_GRADIENTS = [
  ['#7c5cfc', '#a855f7'], // Purple
  ['#06b6d4', '#3b82f6'], // Cyan to Blue
  ['#f43f5e', '#ec4899'], // Rose to Pink
  ['#10b981', '#14b8a6'], // Emerald to Teal
  ['#f97316', '#eab308'], // Orange to Yellow
  ['#6366f1', '#8b5cf6'], // Indigo to Violet
  ['#ef4444', '#f97316'], // Red to Orange
  ['#84cc16', '#22c55e'], // Lime to Green
  ['#0ea5e9', '#6366f1'], // Sky to Indigo
  ['#d946ef', '#f43f5e'], // Fuchsia to Rose
];

/**
 * Get a deterministic gradient based on user ID
 */
function getAvatarGradient(userId: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index] as [string, string];
}

/**
 * Get initials from a name
 */
function getInitials(name: string): string {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Get size config
 */
function getSizeConfig(size: 'small' | 'medium' | 'large'): { 
  pixels: number; 
  fontSize: number;
  statusSize: number;
  borderRadius: number;
} {
  switch (size) {
    case 'small':
      return { pixels: 32, fontSize: 12, statusSize: 10, borderRadius: 10 };
    case 'medium':
      return { pixels: 40, fontSize: 14, statusSize: 12, borderRadius: 12 };
    case 'large':
      return { pixels: 48, fontSize: 16, statusSize: 14, borderRadius: 14 };
  }
}

/**
 * Get status color
 */
function getStatusColor(status?: string): string {
  switch (status) {
    case 'online': return 'var(--status-online)';
    case 'away': return 'var(--status-away)';
    case 'busy': return 'var(--status-busy)';
    case 'offline': return 'var(--status-offline)';
    default: return 'var(--status-offline)';
  }
}

export function UserAvatar({ 
  user, 
  size = 'medium', 
  isAssistant = false,
  status,
  showRing = false 
}: UserAvatarProps) {
  const config = getSizeConfig(size);
  const [gradientStart, gradientEnd] = isAssistant 
    ? ['hsl(246, 80%, 60%)', 'hsl(280, 75%, 55%)'] 
    : getAvatarGradient(user?.id || 'default');
  const initials = isAssistant ? '✨' : getInitials(user?.name || '?');
  const displayName = user?.name || 'User';

  return (
    <div
      className="user-avatar"
      style={{
        position: 'relative',
        flexShrink: 0,
      }}
    >
      {/* Glow ring for AI */}
      {(isAssistant || showRing) && (
        <div
          style={{
            position: 'absolute',
            inset: -2,
            borderRadius: config.borderRadius + 2,
            background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
            opacity: 0.5,
            filter: 'blur(4px)',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />
      )}
      
      {/* Avatar */}
      <div
        style={{
          position: 'relative',
          width: config.pixels,
          height: config.pixels,
          borderRadius: config.borderRadius,
          background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: `${config.fontSize}px`,
          fontWeight: 600,
          userSelect: 'none',
          boxShadow: isAssistant ? '0 4px 14px -3px rgba(124, 92, 252, 0.4)' : '0 2px 8px -2px rgba(0,0,0,0.15)',
        }}
        title={displayName}
      >
        {initials}
      </div>
      
      {/* Status indicator */}
      {status && (
        <div
          className={`status-indicator status-indicator-${size === 'large' ? 'md' : 'sm'}`}
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: config.statusSize,
            height: config.statusSize,
            borderRadius: '50%',
            backgroundColor: getStatusColor(status),
            border: '2px solid var(--sidebar-bg)',
          }}
        />
      )}
    </div>
  );
}

export default UserAvatar;
