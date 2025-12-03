'use client';

import { useState } from 'react';
import GameOverlay from './GameOverlay';
import { COLORS } from '@/lib/ui/colors';
import type { AudioSettings } from '@/hooks/useAudioSettings';

interface OptionsMenuProps {
  settings: AudioSettings;
  onMasterVolumeChange: (value: number) => void;
  onMusicVolumeChange: (value: number) => void;
  onSfxVolumeChange: (value: number) => void;
  onBack: () => void;
}

interface VolumeSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  icon: string;
}

function VolumeSlider({ label, value, onChange, icon }: VolumeSliderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    onChange(Math.round(percentage));
  };

  const handleThumbMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);

    const track = e.currentTarget.parentElement!;
    const rect = track.getBoundingClientRect();

    const handleMove = (moveEvent: MouseEvent) => {
      const x = moveEvent.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      onChange(Math.round(percentage));
    };

    const handleUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      width: '450px',
    }}>
      {/* Icon */}
      <div style={{
        fontSize: '24px',
        width: '32px',
        textAlign: 'center',
        userSelect: 'none',
      }}>
        {icon}
      </div>

      {/* Label */}
      <div style={{
        width: '80px',
        fontSize: '18px',
        fontWeight: 600,
        color: COLORS.text.primary,
        userSelect: 'none',
      }}>
        {label}
      </div>

      {/* Slider Track */}
      <div
        onClick={handleTrackClick}
        style={{
          width: '200px',
          height: '16px',
          backgroundColor: '#333',
          borderRadius: '8px',
          position: 'relative',
          cursor: 'pointer',
          border: `2px solid ${isDragging ? COLORS.gold : '#555'}`,
          boxSizing: 'border-box',
        }}
      >
        {/* Filled Track */}
        <div
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            height: '100%',
            width: `${value}%`,
            backgroundColor: COLORS.gold,
            borderRadius: '6px',
            pointerEvents: 'none',
          }}
        />

        {/* Slider Thumb */}
        <div
          onMouseDown={handleThumbMouseDown}
          style={{
            position: 'absolute',
            top: '50%',
            left: `${value}%`,
            transform: 'translate(-50%, -50%)',
            width: '22px',
            height: '22px',
            backgroundColor: COLORS.gold,
            borderRadius: '50%',
            border: '3px solid #fff',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.5)',
            cursor: isDragging ? 'grabbing' : 'grab',
            zIndex: 1,
          }}
        />
      </div>

      {/* Value Display */}
      <div style={{
        width: '45px',
        fontSize: '18px',
        fontWeight: 600,
        color: COLORS.gold,
        textAlign: 'right',
        userSelect: 'none',
      }}>
        {value}%
      </div>
    </div>
  );
}

export default function OptionsMenu({
  settings,
  onMasterVolumeChange,
  onMusicVolumeChange,
  onSfxVolumeChange,
  onBack,
}: OptionsMenuProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <GameOverlay
      backgroundColor="rgba(0, 0, 0, 0.9)"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        animation: 'optionsFadeIn 0.2s ease-out',
      }}
    >
      {/* Title */}
      <div
        style={{
          fontSize: '56px',
          fontWeight: 900,
          color: COLORS.gold,
          textShadow: '0 0 20px rgba(255, 215, 0, 0.5), 4px 4px 8px rgba(0, 0, 0, 0.9)',
          marginBottom: '50px',
          userSelect: 'none',
          letterSpacing: '6px',
        }}
      >
        OPTIONEN
      </div>

      {/* Audio Section */}
      <div
        style={{
          backgroundColor: 'rgba(30, 30, 30, 0.8)',
          border: `2px solid ${COLORS.border.gold}`,
          borderRadius: '12px',
          padding: '30px 40px',
          marginBottom: '40px',
        }}
      >
        <div
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: COLORS.text.primary,
            marginBottom: '30px',
            textAlign: 'center',
            userSelect: 'none',
          }}
        >
          Audio
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '25px',
        }}>
          <VolumeSlider
            label="Gesamt"
            icon="🔊"
            value={settings.masterVolume}
            onChange={onMasterVolumeChange}
          />
          <VolumeSlider
            label="Musik"
            icon="🎵"
            value={settings.musicVolume}
            onChange={onMusicVolumeChange}
          />
          <VolumeSlider
            label="Effekte"
            icon="👣"
            value={settings.sfxVolume}
            onChange={onSfxVolumeChange}
          />
        </div>
      </div>

      {/* Back Button */}
      <button
        onClick={onBack}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: '200px',
          padding: '14px 40px',
          fontSize: '22px',
          fontWeight: 600,
          color: isHovered ? '#000' : '#fff',
          backgroundColor: isHovered ? COLORS.gold : 'transparent',
          border: `3px solid ${COLORS.gold}`,
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          userSelect: 'none',
        }}
      >
        Zurück
      </button>

      <style jsx>{`
        @keyframes optionsFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </GameOverlay>
  );
}
