/**
 * Centralized UI color constants
 *
 * Usage: import { COLORS } from '@/lib/ui/colors';
 */

export const COLORS = {
  // Status colors
  success: '#4CAF50',
  error: '#FF4444',
  warning: '#FFA500',

  // Gold/accent colors
  gold: '#FFD700',

  // Background colors
  background: {
    dark: '#1a1a2e',
    darker: '#0f0f1a',
    panel: '#1a1a1a',
    input: '#2a2a2a',
  },

  // Border colors
  border: {
    gold: '#8B7355',
    light: '#a08060',
    input: '#555',
  },

  // Text colors
  text: {
    primary: '#fff',
    secondary: '#ccc',
    muted: '#aaa',
  }
} as const;

export type Colors = typeof COLORS;
