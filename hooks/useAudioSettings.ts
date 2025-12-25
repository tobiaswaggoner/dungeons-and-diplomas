import { useState, useEffect, useCallback } from 'react';

export interface AudioSettings {
  masterVolume: number;  // 0-100
  musicVolume: number;   // 0-100
  sfxVolume: number;     // 0-100
}

const DEFAULT_SETTINGS: AudioSettings = {
  masterVolume: 70,
  musicVolume: 50,
  sfxVolume: 70,
};

const STORAGE_KEY = 'dungeons-diplomas-audio-settings';

/**
 * Calculate effective volume (0-1 range) for a specific audio type
 * Combines master volume with type-specific volume
 */
export function calculateEffectiveVolume(
  masterVolume: number,
  typeVolume: number
): number {
  return (masterVolume / 100) * (typeVolume / 100);
}

/**
 * Hook for managing audio volume settings with localStorage persistence
 */
export function useAudioSettings() {
  const [settings, setSettings] = useState<AudioSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({
          masterVolume: parsed.masterVolume ?? DEFAULT_SETTINGS.masterVolume,
          musicVolume: parsed.musicVolume ?? DEFAULT_SETTINGS.musicVolume,
          sfxVolume: parsed.sfxVolume ?? DEFAULT_SETTINGS.sfxVolume,
        });
      }
    } catch (error) {
      console.warn('Failed to load audio settings:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save audio settings:', error);
    }
  }, [settings, isLoaded]);

  const setMasterVolume = useCallback((volume: number) => {
    setSettings(prev => ({ ...prev, masterVolume: Math.max(0, Math.min(100, volume)) }));
  }, []);

  const setMusicVolume = useCallback((volume: number) => {
    setSettings(prev => ({ ...prev, musicVolume: Math.max(0, Math.min(100, volume)) }));
  }, []);

  const setSfxVolume = useCallback((volume: number) => {
    setSettings(prev => ({ ...prev, sfxVolume: Math.max(0, Math.min(100, volume)) }));
  }, []);

  // Calculate effective volumes (0-1 range for audio APIs)
  const effectiveMusicVolume = calculateEffectiveVolume(settings.masterVolume, settings.musicVolume);
  const effectiveSfxVolume = calculateEffectiveVolume(settings.masterVolume, settings.sfxVolume);

  return {
    settings,
    setMasterVolume,
    setMusicVolume,
    setSfxVolume,
    effectiveMusicVolume,
    effectiveSfxVolume,
    isLoaded,
  };
}
