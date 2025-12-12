'use client';

import { useState } from 'react';
import { MEDIEVAL_COLORS, MEDIEVAL_STYLES } from '@/lib/ui/medieval-styles';

interface ActionButtonsProps {
  onRestart: () => void;
  onSkills: () => void;
  onLogout: () => void;
  onSettings?: () => void;
}

interface ActionButtonProps {
  onClick: () => void;
  title: string;
  icon: string;
  accentColor: string;
}

/**
 * Single action button with medieval metal style
 */
function ActionButton({ onClick, title, icon, accentColor }: ActionButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        flex: 1,
        padding: '6px 8px',
        fontSize: '12px',
        fontWeight: 'bold',
        color: isHovered ? accentColor : MEDIEVAL_COLORS.text.secondary,
        ...MEDIEVAL_STYLES.button,
        borderColor: isHovered ? accentColor : MEDIEVAL_COLORS.frame.border,
        boxShadow: isHovered
          ? `inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 0 8px ${accentColor}40`
          : MEDIEVAL_STYLES.button.boxShadow,
        position: 'relative',
      }}
    >
      {/* Small rivets */}
      <div style={{
        position: 'absolute',
        top: '2px',
        left: '2px',
        ...MEDIEVAL_STYLES.rivet,
        width: '2px',
        height: '2px',
      }} />
      <div style={{
        position: 'absolute',
        top: '2px',
        right: '2px',
        ...MEDIEVAL_STYLES.rivet,
        width: '2px',
        height: '2px',
      }} />
      {icon}
    </button>
  );
}

/**
 * Action buttons row in medieval metal frame style
 */
export function ActionButtons({ onRestart, onSkills, onLogout, onSettings }: ActionButtonsProps) {
  return (
    <div style={{ marginTop: '4px' }}>
      {/* Divider */}
      <div style={{
        ...MEDIEVAL_STYLES.divider,
        marginBottom: '8px',
      }} />

      <div style={{
        display: 'flex',
        gap: '6px',
      }}>
        <ActionButton
          onClick={onRestart}
          title="Restart"
          icon="R"
          accentColor={MEDIEVAL_COLORS.mastery.master}
        />
        <ActionButton
          onClick={onSkills}
          title="Skills"
          icon="S"
          accentColor={MEDIEVAL_COLORS.mastery.advanced}
        />
        {onSettings && (
          <ActionButton
            onClick={onSettings}
            title="Einstellungen"
            icon="⚙"
            accentColor={MEDIEVAL_COLORS.text.primary}
          />
        )}
        <ActionButton
          onClick={onLogout}
          title="Logout"
          icon="X"
          accentColor="#f44336"
        />
      </div>
    </div>
  );
}
