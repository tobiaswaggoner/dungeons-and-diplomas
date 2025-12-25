// =============================================================================
// Screen Shake System
// =============================================================================

import type { ScreenShake } from './types';

/**
 * Screen shake manager
 */
export class ScreenShakeSystem {
  private shake: ScreenShake | null = null;
  private enabled: boolean = true;

  /**
   * Enable or disable screen shake
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.shake = null;
    }
  }

  /**
   * Check if screen shake is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Trigger a screen shake effect
   * @param intensity - Shake intensity in pixels (default: 5 for subtle)
   * @param duration - Shake duration in seconds (default: 0.3)
   */
  trigger(intensity: number = 5, duration: number = 0.3): void {
    if (!this.enabled) return;

    // Don't override a stronger shake
    if (this.shake && this.shake.intensity > intensity && this.shake.elapsed < this.shake.duration * 0.5) {
      return;
    }

    this.shake = {
      intensity,
      duration,
      elapsed: 0,
      offsetX: 0,
      offsetY: 0
    };
  }

  /**
   * Trigger subtle shake (for player damage)
   */
  triggerSubtle(): void {
    this.trigger(4, 0.25);
  }

  /**
   * Trigger medium shake (for critical hits)
   */
  triggerMedium(): void {
    this.trigger(8, 0.35);
  }

  /**
   * Trigger strong shake (for special events)
   */
  triggerStrong(): void {
    this.trigger(12, 0.5);
  }

  /**
   * Update the screen shake state
   */
  update(dt: number): void {
    if (!this.shake) return;

    this.shake.elapsed += dt;

    if (this.shake.elapsed >= this.shake.duration) {
      this.shake = null;
      return;
    }

    // Calculate shake progress (0-1)
    const progress = this.shake.elapsed / this.shake.duration;

    // Ease out - shake gets weaker over time
    const easeOut = 1 - progress;
    const currentIntensity = this.shake.intensity * easeOut;

    // Random offset with high frequency oscillation
    const frequency = 30; // Higher = more rapid shaking
    const time = this.shake.elapsed * frequency;

    // Use sin/cos for smooth oscillation with some randomness
    this.shake.offsetX = Math.sin(time * 2.5) * currentIntensity * (0.8 + Math.random() * 0.4);
    this.shake.offsetY = Math.cos(time * 3.1) * currentIntensity * (0.8 + Math.random() * 0.4);
  }

  /**
   * Get current shake offset
   */
  getOffset(): { x: number; y: number } {
    if (!this.shake) {
      return { x: 0, y: 0 };
    }
    return {
      x: Math.round(this.shake.offsetX),
      y: Math.round(this.shake.offsetY)
    };
  }

  /**
   * Check if currently shaking
   */
  isShaking(): boolean {
    return this.shake !== null;
  }

  /**
   * Stop any active shake
   */
  stop(): void {
    this.shake = null;
  }
}

// Singleton instance
let screenShakeInstance: ScreenShakeSystem | null = null;

/**
 * Get the global screen shake instance
 */
export function getScreenShake(): ScreenShakeSystem {
  if (!screenShakeInstance) {
    screenShakeInstance = new ScreenShakeSystem();
  }
  return screenShakeInstance;
}
