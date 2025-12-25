'use client';

import { MEDIEVAL_COLORS, MEDIEVAL_STYLES } from '@/lib/ui/medieval-styles';

interface CharacterHeaderProps {
  username: string;
  level: number;
}

/**
 * Character header showing username and level in medieval style
 */
export function CharacterHeader({ username, level }: CharacterHeaderProps) {
  return (
    <>
      {/* Metal plate nameplate */}
      <div style={{
        position: 'relative',
        marginBottom: '12px',
        padding: '8px 12px',
        ...MEDIEVAL_STYLES.barFrameSmall,
        textAlign: 'center',
      }}>
        {/* Username */}
        <div style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: MEDIEVAL_COLORS.text.gold,
          textShadow: `0 0 10px ${MEDIEVAL_COLORS.text.gold}60, 2px 2px 4px rgba(0, 0, 0, 0.9)`,
          letterSpacing: '1px',
        }}>
          {username}
        </div>

        {/* Level Display */}
        <div style={{
          fontSize: '13px',
          fontWeight: 'bold',
          color: MEDIEVAL_COLORS.text.secondary,
          marginTop: '4px',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          textShadow: '1px 1px 3px rgba(0, 0, 0, 0.9)',
        }}>
          Level {level}
        </div>

        {/* Decorative rivets on nameplate */}
        <div style={{
          position: 'absolute',
          top: '4px',
          left: '4px',
          ...MEDIEVAL_STYLES.rivet,
        }} />
        <div style={{
          position: 'absolute',
          top: '4px',
          right: '4px',
          ...MEDIEVAL_STYLES.rivet,
        }} />
        <div style={{
          position: 'absolute',
          bottom: '4px',
          left: '4px',
          ...MEDIEVAL_STYLES.rivet,
        }} />
        <div style={{
          position: 'absolute',
          bottom: '4px',
          right: '4px',
          ...MEDIEVAL_STYLES.rivet,
        }} />
      </div>

      {/* Divider */}
      <div style={{
        ...MEDIEVAL_STYLES.divider,
        marginBottom: '8px',
      }} />
    </>
  );
}
