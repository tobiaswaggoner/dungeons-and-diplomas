import { useState, useCallback, useMemo, useEffect, useRef } from 'react';

/**
 * Combo tier definitions based on consecutive enemy defeats
 * Visual effects intensify with each tier
 */
export type ComboTier = 'none' | 'bronze' | 'silver' | 'gold' | 'legendary';

export interface ComboState {
  /** Current number of enemies defeated in a row */
  count: number;
  /** Whether combo is active (count >= 3) */
  isActive: boolean;
  /** Bonus damage from combo: (count - 2) * 2 when count >= 3 */
  damageBonus: number;
  /** Visual tier for UI effects */
  tier: ComboTier;
  /** Time remaining on combo timer (seconds) */
  timeRemaining: number;
  /** Total duration of current combo timer (seconds) */
  timerDuration: number;
}

/**
 * Get the visual tier based on combo count
 */
function getComboTier(count: number): ComboTier {
  if (count < 3) return 'none';
  if (count <= 4) return 'bronze';  // x3-x4: Simple white text, light sway
  if (count <= 7) return 'silver';  // x5-x7: Gold text, stronger sway, glow
  if (count <= 9) return 'gold';    // x8-x9: Orange/red text, pulse, particles
  return 'legendary';               // x10+: Rainbow effect, strong pulse, flame aura
}

/**
 * Calculate damage bonus from combo
 * Bonus starts at combo 3: +2 damage per combo level
 * Example: x5 combo = (5-2) * 2 = +6 damage
 */
function calculateComboDamageBonus(count: number): number {
  if (count < 3) return 0;
  return (count - 2) * 2;
}

/**
 * Calculate combo timer duration based on combo count
 * Higher combos = less time to maintain
 * x3 = 30s, x10+ = 10s (linear interpolation between)
 */
function calculateTimerDuration(count: number): number {
  if (count < 3) return 0;
  // Linear interpolation: x3 = 30s, x10 = 10s
  // Formula: 30 - (count - 3) * (20 / 7) = 30 - (count - 3) * 2.857
  const duration = 30 - (count - 3) * (20 / 7);
  return Math.max(10, Math.round(duration));
}

interface UseComboOptions {
  /** When true, timer runs at 50% speed (during combat) */
  inCombat?: boolean;
}

/**
 * Hook to track combo of consecutive flawless enemy defeats
 *
 * Features:
 * - Combo only increments on flawless victories (no wrong answers)
 * - Timer starts when combo reaches 3+
 * - Higher combos = shorter timer (x3=30s, x10=10s)
 * - Timer resets on each new flawless victory
 * - Combo resets if timer expires or on wrong answer
 * - Timer slows down by 50% during combat
 *
 * Usage:
 * - Call incrementCombo() when an enemy is defeated flawlessly
 * - Call resetCombo() when player dies, new dungeon, wrong answer, or timer expires
 * - Use damageBonus in DamageCalculator
 * - Use isActive, tier, timeRemaining for visual display
 */
export function useCombo({ inCombat = false }: UseComboOptions = {}) {
  const [count, setCount] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerDuration, setTimerDuration] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Clear the combo timer
   */
  const clearComboTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /**
   * Start or restart the combo timer
   */
  const startComboTimer = useCallback((newCount: number) => {
    clearComboTimer();

    if (newCount < 3) {
      setTimeRemaining(0);
      setTimerDuration(0);
      setIsTimerActive(false);
      return;
    }

    const duration = calculateTimerDuration(newCount);
    setTimerDuration(duration);
    setTimeRemaining(duration);
    setIsTimerActive(true);
  }, [clearComboTimer]);

  // Handle timer countdown in a separate effect that reacts to inCombat changes
  useEffect(() => {
    if (!isTimerActive) {
      return;
    }

    // Timer runs at 50% speed during combat (2000ms interval instead of 1000ms)
    const intervalMs = inCombat ? 2000 : 1000;

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Timer expired - reset combo
          clearComboTimer();
          setCount(0);
          setTimerDuration(0);
          setIsTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, intervalMs);

    return () => clearComboTimer();
  }, [isTimerActive, inCombat, clearComboTimer]);

  /**
   * Increment combo count when an enemy is defeated flawlessly
   */
  const incrementCombo = useCallback(() => {
    setCount(prev => {
      const newCount = prev + 1;
      // Track max combo achieved
      setMaxCombo(max => Math.max(max, newCount));
      // Start or restart timer when reaching 3+
      startComboTimer(newCount);
      return newCount;
    });
  }, [startComboTimer]);

  /**
   * Reset combo to 0 (on player death, new dungeon, wrong answer, or timer expires)
   * Does NOT reset maxCombo - that's preserved for highscore tracking
   */
  const resetCombo = useCallback(() => {
    clearComboTimer();
    setCount(0);
    setTimeRemaining(0);
    setTimerDuration(0);
    setIsTimerActive(false);
  }, [clearComboTimer]);

  /**
   * Reset max combo (called when starting a completely new game session)
   */
  const resetMaxCombo = useCallback(() => {
    setMaxCombo(0);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => clearComboTimer();
  }, [clearComboTimer]);

  /**
   * Derived state computed from count
   */
  const comboState: ComboState = useMemo(() => ({
    count,
    isActive: count >= 3,
    damageBonus: calculateComboDamageBonus(count),
    tier: getComboTier(count),
    timeRemaining,
    timerDuration
  }), [count, timeRemaining, timerDuration]);

  return {
    ...comboState,
    maxCombo,
    incrementCombo,
    resetCombo,
    resetMaxCombo
  };
}
