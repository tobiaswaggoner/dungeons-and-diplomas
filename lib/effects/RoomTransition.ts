// =============================================================================
// Room Transition System - Fade effect only on newly discovered room
// =============================================================================

import type { RoomTransition } from './types';

/**
 * Room transition manager - shows fade effect only on newly discovered rooms
 */
export class RoomTransitionSystem {
  private transition: RoomTransition | null = null;
  private enabled: boolean = true;
  private duration: number = 1.2; // Slower duration (1.2 seconds)

  /**
   * Enable or disable transitions
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.transition = null;
    }
  }

  /**
   * Check if transitions are enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Set transition duration
   */
  setDuration(seconds: number): void {
    this.duration = Math.max(0.1, Math.min(3, seconds));
  }

  /**
   * Start a room reveal transition (only for newly discovered rooms)
   * @param roomX - Room top-left X in pixels
   * @param roomY - Room top-left Y in pixels
   * @param roomWidth - Room width in pixels
   * @param roomHeight - Room height in pixels
   */
  startRoomReveal(
    roomX: number,
    roomY: number,
    roomWidth: number,
    roomHeight: number
  ): void {
    if (!this.enabled) return;

    // Random direction for visual variety
    const directions: Array<'left' | 'right' | 'up' | 'down'> = ['left', 'right', 'up', 'down'];
    const direction = directions[Math.floor(Math.random() * directions.length)];

    this.transition = {
      active: true,
      progress: 0,
      duration: this.duration,
      direction,
      fromRoomId: -1,
      toRoomId: -1,
      roomX,
      roomY,
      roomWidth,
      roomHeight
    };
  }

  /**
   * Legacy start method (kept for compatibility but does nothing now)
   */
  start(_fromRoomId: number, _toRoomId: number): void {
    // No longer used - black overlay only on room reveal now
  }

  /**
   * Update the transition
   */
  update(dt: number): void {
    if (!this.transition || !this.transition.active) return;

    this.transition.progress += dt / this.transition.duration;

    if (this.transition.progress >= 1) {
      this.transition.active = false;
      this.transition = null;
    }
  }

  /**
   * Check if transition is active
   */
  isActive(): boolean {
    return this.transition?.active ?? false;
  }

  /**
   * Get current transition progress (0-1)
   */
  getProgress(): number {
    return this.transition?.progress ?? 0;
  }

  /**
   * Get current direction
   */
  getDirection(): 'left' | 'right' | 'up' | 'down' | null {
    return this.transition?.direction ?? null;
  }

  /**
   * Render the transition overlay (only on the room area)
   * Starts fully black and reveals the room
   * @param ctx - Canvas context (should be in world-space, already translated by camera)
   */
  renderInWorldSpace(ctx: CanvasRenderingContext2D): void {
    if (!this.transition || !this.transition.active) return;

    const { progress, direction, roomX, roomY, roomWidth, roomHeight } = this.transition;

    // Ease out function for smooth reveal
    const eased = this.easeOutQuad(progress);

    ctx.save();

    // Draw sliding black overlay only on the room area
    ctx.fillStyle = '#000000';

    // Start fully covered (black), then reveal the room
    // progress 0 = fully black, progress 1 = fully revealed
    const coverProgress = 1 - eased; // 1 to 0 (black shrinks away)
    this.drawRoomReveal(ctx, roomX, roomY, roomWidth, roomHeight, direction, coverProgress);

    ctx.restore();
  }

  /**
   * Legacy render method (renders in screen space - no longer used for room transitions)
   */
  render(_ctx: CanvasRenderingContext2D, _width: number, _height: number): void {
    // No longer renders full-screen overlays
    // Use renderInWorldSpace instead
  }

  /**
   * Draw the reveal effect - black shrinks away from room
   * @param progress - 1 = fully black, 0 = fully revealed
   */
  private drawRoomReveal(
    ctx: CanvasRenderingContext2D,
    roomX: number,
    roomY: number,
    roomWidth: number,
    roomHeight: number,
    direction: 'left' | 'right' | 'up' | 'down',
    progress: number
  ): void {
    if (progress <= 0) return; // Fully revealed, nothing to draw

    let x = roomX;
    let y = roomY;
    let w = roomWidth;
    let h = roomHeight;

    // Black slides away in the given direction
    switch (direction) {
      case 'left':
        // Black shrinks from right to left
        w = roomWidth * progress;
        break;

      case 'right':
        // Black shrinks from left to right
        x = roomX + roomWidth * (1 - progress);
        w = roomWidth * progress;
        break;

      case 'up':
        // Black shrinks from bottom to top
        h = roomHeight * progress;
        break;

      case 'down':
        // Black shrinks from top to bottom
        y = roomY + roomHeight * (1 - progress);
        h = roomHeight * progress;
        break;
    }

    ctx.fillRect(x, y, w, h);
  }

  /**
   * Ease out quadratic function (fast start, slow end)
   */
  private easeOutQuad(t: number): number {
    return 1 - (1 - t) * (1 - t);
  }

  /**
   * Force stop the transition
   */
  stop(): void {
    this.transition = null;
  }
}

// Singleton instance
let roomTransitionInstance: RoomTransitionSystem | null = null;

/**
 * Get the global room transition instance
 */
export function getRoomTransition(): RoomTransitionSystem {
  if (!roomTransitionInstance) {
    roomTransitionInstance = new RoomTransitionSystem();
  }
  return roomTransitionInstance;
}
