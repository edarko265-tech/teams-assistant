/**
 * UserAvatar Component
 * Displays user's initials in a colored circle (Teams-style)
 * Color is deterministic based on user ID
 */

import React from 'react';
import { User } from '../types';

interface UserAvatarProps {
  user: User;
  size?: 'small' | 'medium' | 'large';
  isAssistant?: boolean;
}

// Avatar colors - Teams-inspired palette
const AVATAR_COLORS = [
  '#6264A7', // Teams purple
  '#E74856', // Red
  '#0078D4', // Blue
  '#107C10', // Green
  '#FFB900', // Yellow
  '#00B7C3', // Teal
  '#8764B8', // Purple
  '#E3008C', // Pink
  '#498205', // Dark green
  '#DA3B01', // Orange
];

/**
 * Get a deterministic color based on user ID
 */
function getAvatarColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
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
 * Get size in pixels
 */
function getSizePixels(size: 'small' | 'medium' | 'large'): number {
  switch (size) {
    case 'small':
      return 28;
    case 'medium':
      return 36;
    case 'large':
      return 48;
  }
}

export function UserAvatar({ user, size = 'medium', isAssistant = false }: UserAvatarProps) {
  const sizePixels = getSizePixels(size);
  const backgroundColor = isAssistant ? '#6264A7' : getAvatarColor(user.id);
  const initials = isAssistant ? '🤖' : getInitials(user.name);
  const fontSize = isAssistant ? sizePixels * 0.5 : sizePixels * 0.4;

  return (
    <div
      className="user-avatar"
      style={{
        width: sizePixels,
        height: sizePixels,
        borderRadius: '50%',
        backgroundColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: `${fontSize}px`,
        fontWeight: 600,
        flexShrink: 0,
        userSelect: 'none',
      }}
      title={user.name}
    >
      {initials}
    </div>
  );
}

export default UserAvatar;
