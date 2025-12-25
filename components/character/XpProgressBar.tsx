'use client';

import { MEDIEVAL_COLORS, MEDIEVAL_STYLES, getXpGradient } from '@/lib/ui/medieval-styles';

interface XpProgressBarProps {
  currentXp: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
}

/**
 * XP progress bar in medieval metal frame style
 */
export function XpProgressBar({ currentXp, xpForCurrentLevel, xpForNextLevel }: XpProgressBarProps) {
  const xpIntoLevel = currentXp - xpForCurrentLevel;
  const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
  const progressPercent = Math.max(0, Math.min(100, (xpIntoLevel / xpNeededForNextLevel) * 100));
  const gradient = getXpGradient();

  return (
    <div style={{
      marginBottom: '12px',
      paddingBottom: '12px',
    }}>
      {/* XP Label */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '4px'
      }}>
        <span style={{
          ...MEDIEVAL_STYLES.barLabel,
          color: MEDIEVAL_COLORS.text.xp,
          fontSize: '12px',
        }}>
          XP
        </span>
        <span style={{
          ...MEDIEVAL_STYLES.barValue,
          fontSize: '11px',
          color: MEDIEVAL_COLORS.text.secondary,
        }}>
          {xpIntoLevel} / {xpNeededForNextLevel}
        </span>
      </div>

      {/* Metal Frame XP Bar */}
      <div style={{
        width: '100%',
        height: '16px',
        ...MEDIEVAL_STYLES.barFrameSmall,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Inner shadow for depth */}
        <div style={{
          ...MEDIEVAL_STYLES.innerShadow,
          height: '2px',
        }} />

        {/* Fill bar with golden gradient */}
        <div style={{
          height: '100%',
          background: gradient,
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${progressPercent}%`,
          transition: 'width 0.5s ease-out',
          boxShadow: `inset 0 1px 2px rgba(255, 255, 255, 0.3), 0 0 8px ${MEDIEVAL_COLORS.xp.full}80`
        }} />

        {/* Shine effect on fill */}
        <div style={{
          ...MEDIEVAL_STYLES.shineEffect,
          width: `${progressPercent}%`,
          height: '35%',
        }} />

        {/* Metal rivets (smaller for XP bar) */}
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
        <div style={{
          position: 'absolute',
          bottom: '2px',
          left: '2px',
          ...MEDIEVAL_STYLES.rivet,
          width: '2px',
          height: '2px',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '2px',
          right: '2px',
          ...MEDIEVAL_STYLES.rivet,
          width: '2px',
          height: '2px',
        }} />
      </div>

      {/* Divider */}
      <div style={{
        ...MEDIEVAL_STYLES.divider,
        marginTop: '12px',
        marginBottom: '0',
      }} />
    </div>
  );
}
