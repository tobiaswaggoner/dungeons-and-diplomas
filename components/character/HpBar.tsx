'use client';

import { MEDIEVAL_COLORS, MEDIEVAL_STYLES, getHpGradient, getHpGlowColor } from '@/lib/ui/medieval-styles';

interface HpBarProps {
  currentHp: number;
  maxHp: number;
}

/**
 * HP Bar component showing player health in medieval metal frame style
 */
export function HpBar({ currentHp, maxHp }: HpBarProps) {
  const hpPercent = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));
  const gradient = getHpGradient(hpPercent);
  const glowColor = getHpGlowColor(hpPercent);

  return (
    <div style={{ marginBottom: '12px' }}>
      {/* HP Label */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '4px'
      }}>
        <span style={{
          ...MEDIEVAL_STYLES.barLabel,
          color: MEDIEVAL_COLORS.text.hp,
          fontSize: '12px',
        }}>
          HP
        </span>
        <span style={{
          ...MEDIEVAL_STYLES.barValue,
          fontSize: '12px',
        }}>
          {currentHp} / {maxHp}
        </span>
      </div>

      {/* Metal Frame HP Bar */}
      <div style={{
        width: '100%',
        height: '20px',
        ...MEDIEVAL_STYLES.barFrameSmall,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Inner shadow for depth */}
        <div style={{
          ...MEDIEVAL_STYLES.innerShadow,
          height: '2px',
        }} />

        {/* Fill bar with gradient */}
        <div style={{
          height: '100%',
          background: gradient,
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${hpPercent}%`,
          transition: 'width 0.3s ease-out, background 0.3s ease',
          boxShadow: `inset 0 1px 2px rgba(255, 255, 255, 0.3), 0 0 8px ${glowColor}80`
        }} />

        {/* Shine effect on fill */}
        <div style={{
          ...MEDIEVAL_STYLES.shineEffect,
          width: `${hpPercent}%`,
          height: '35%',
        }} />

        {/* Metal rivets */}
        <div style={{
          position: 'absolute',
          top: '2px',
          left: '2px',
          ...MEDIEVAL_STYLES.rivet,
          width: '3px',
          height: '3px',
        }} />
        <div style={{
          position: 'absolute',
          top: '2px',
          right: '2px',
          ...MEDIEVAL_STYLES.rivet,
          width: '3px',
          height: '3px',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '2px',
          left: '2px',
          ...MEDIEVAL_STYLES.rivet,
          width: '3px',
          height: '3px',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '2px',
          right: '2px',
          ...MEDIEVAL_STYLES.rivet,
          width: '3px',
          height: '3px',
        }} />

        {/* Low HP pulse effect */}
        {hpPercent <= 25 && (
          <>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 0, 0, 0.2)',
              animation: 'hpPulse 1s infinite'
            }} />
            <style jsx>{`
              @keyframes hpPulse {
                0%, 100% { opacity: 0.2; }
                50% { opacity: 0.5; }
              }
            `}</style>
          </>
        )}
      </div>
    </div>
  );
}
