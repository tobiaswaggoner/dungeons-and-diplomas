// =============================================================================
// Particle System - Handles all particle effects
// =============================================================================

import type { Particle, ParticleQuality, ParticleType } from './types';
import { PARTICLE_LIMITS } from './types';

/**
 * Particle colors configuration
 */
const PARTICLE_COLORS = {
  dust: ['#808080', '#909090', '#707070', '#A0A0A0'], // Gray dust
  spark: ['#FFD700', '#FFA500', '#FFFF00', '#FF8C00'], // Golden sparks
  damage: ['#FF0000', '#CC0000', '#FF3333', '#990000'], // Red damage
  glitter: ['#FFD700', '#FFFFFF', '#FFF8DC', '#FFFACD'], // Gold/white glitter
  roomReveal: ['#87CEEB', '#ADD8E6', '#B0E0E6', '#E0FFFF'] // Light blue reveal
};

/**
 * Main particle system class
 */
export class ParticleSystem {
  private particles: Particle[] = [];
  private quality: ParticleQuality = 'medium';

  /**
   * Set particle quality
   */
  setQuality(quality: ParticleQuality): void {
    this.quality = quality;
    // Remove excess particles if quality lowered
    const limit = PARTICLE_LIMITS[quality];
    if (this.particles.length > limit) {
      this.particles = this.particles.slice(0, limit);
    }
  }

  /**
   * Get current quality
   */
  getQuality(): ParticleQuality {
    return this.quality;
  }

  /**
   * Check if can spawn more particles
   */
  private canSpawn(): boolean {
    return this.particles.length < PARTICLE_LIMITS[this.quality];
  }

  /**
   * Get a random color for particle type
   */
  private getRandomColor(type: ParticleType): string {
    const colors = PARTICLE_COLORS[type];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Spawn dust particles (when player walks)
   */
  spawnDust(x: number, y: number, count: number = 3): void {
    if (this.quality === 'off') return;

    // Adjust count based on quality
    const adjustedCount = Math.ceil(count * this.getQualityMultiplier());

    for (let i = 0; i < adjustedCount && this.canSpawn(); i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 20 + Math.random() * 30;

      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 10,
        vx: Math.cos(angle) * speed * 0.3,
        vy: -Math.random() * speed * 0.5 - 10, // Mostly upward
        life: 1,
        maxLife: 0.4 + Math.random() * 0.3,
        size: 2 + Math.random() * 3,
        color: this.getRandomColor('dust'),
        alpha: 0.6,
        type: 'dust',
        gravity: 50,
        friction: 0.95
      });
    }
  }

  /**
   * Spawn star-shaped sparks (on hit)
   */
  spawnSparks(x: number, y: number, count: number = 8): void {
    if (this.quality === 'off') return;

    const adjustedCount = Math.ceil(count * this.getQualityMultiplier());
    const angleStep = (Math.PI * 2) / adjustedCount;

    for (let i = 0; i < adjustedCount && this.canSpawn(); i++) {
      // Star-shaped: particles go outward in all directions
      const angle = angleStep * i + (Math.random() - 0.5) * 0.3;
      const speed = 100 + Math.random() * 150;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 0.3 + Math.random() * 0.2,
        size: 3 + Math.random() * 4,
        color: this.getRandomColor('spark'),
        alpha: 1,
        type: 'spark',
        gravity: 0,
        friction: 0.92
      });
    }
  }

  /**
   * Spawn damage particles (red, when player takes damage)
   */
  spawnDamage(x: number, y: number, count: number = 12): void {
    if (this.quality === 'off') return;

    const adjustedCount = Math.ceil(count * this.getQualityMultiplier());

    for (let i = 0; i < adjustedCount && this.canSpawn(); i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 120;

      this.particles.push({
        x: x + (Math.random() - 0.5) * 30,
        y: y + (Math.random() - 0.5) * 30,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 50, // Slight upward bias
        life: 1,
        maxLife: 0.4 + Math.random() * 0.3,
        size: 4 + Math.random() * 6,
        color: this.getRandomColor('damage'),
        alpha: 1,
        type: 'damage',
        gravity: 100,
        friction: 0.9
      });
    }
  }

  /**
   * Spawn item glitter (constant effect around items)
   */
  spawnGlitter(x: number, y: number, count: number = 1): void {
    if (this.quality === 'off') return;

    for (let i = 0; i < count && this.canSpawn(); i++) {
      const offsetX = (Math.random() - 0.5) * 40;
      const offsetY = (Math.random() - 0.5) * 40;

      this.particles.push({
        x: x + offsetX,
        y: y + offsetY,
        vx: (Math.random() - 0.5) * 10,
        vy: -20 - Math.random() * 20, // Float upward
        life: 1,
        maxLife: 0.8 + Math.random() * 0.4,
        size: 2 + Math.random() * 3,
        color: this.getRandomColor('glitter'),
        alpha: 0.8,
        type: 'glitter',
        gravity: -10, // Negative = floats up
        friction: 0.98
      });
    }
  }

  /**
   * Spawn room reveal particles (when discovering a new room)
   * Particles spawn only within the room bounds
   * @param roomX - Room top-left X in pixels
   * @param roomY - Room top-left Y in pixels
   * @param roomWidth - Room width in pixels
   * @param roomHeight - Room height in pixels
   * @param count - Number of particles to spawn
   */
  spawnRoomReveal(
    roomX: number,
    roomY: number,
    roomWidth: number,
    roomHeight: number,
    count: number = 15
  ): void {
    if (this.quality === 'off') return;

    const adjustedCount = Math.ceil(count * this.getQualityMultiplier());

    for (let i = 0; i < adjustedCount && this.canSpawn(); i++) {
      // Spawn particles within room bounds
      const x = roomX + Math.random() * roomWidth;
      const y = roomY + Math.random() * roomHeight;

      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 15,
        vy: -15 - Math.random() * 25, // Float upward slowly
        life: 1,
        maxLife: 1.5 + Math.random() * 1.0, // Longer life (1.5-2.5 seconds)
        size: 3 + Math.random() * 4,
        color: this.getRandomColor('roomReveal'),
        alpha: 0.7,
        type: 'roomReveal',
        gravity: -5, // Slowly float up
        friction: 0.97
      });
    }
  }

  /**
   * Get quality multiplier for particle count
   */
  private getQualityMultiplier(): number {
    switch (this.quality) {
      case 'off': return 0;
      case 'low': return 0.4;
      case 'medium': return 1;
      case 'high': return 2;
    }
  }

  /**
   * Update all particles
   */
  update(dt: number): void {
    if (this.quality === 'off') {
      this.particles = [];
      return;
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // Update velocity with gravity and friction
      if (p.gravity !== undefined) {
        p.vy += p.gravity * dt;
      }
      if (p.friction !== undefined) {
        p.vx *= p.friction;
        p.vy *= p.friction;
      }

      // Update position
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Update life
      p.life -= dt / p.maxLife;

      // Update alpha based on life
      p.alpha = Math.max(0, p.life);

      // Remove dead particles
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * Render all particles to canvas
   */
  render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    if (this.quality === 'off') return;

    ctx.save();

    for (const p of this.particles) {
      const screenX = p.x - cameraX;
      const screenY = p.y - cameraY;

      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.type === 'spark') {
        // Draw spark as a small star/cross shape
        this.drawSpark(ctx, screenX, screenY, p.size);
      } else {
        // Draw as circle
        ctx.beginPath();
        ctx.arc(screenX, screenY, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  /**
   * Draw a spark (small star shape)
   */
  private drawSpark(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    ctx.beginPath();
    // Draw a 4-pointed star
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const outerX = x + Math.cos(angle) * size;
      const outerY = y + Math.sin(angle) * size;
      const innerAngle = angle + Math.PI / 4;
      const innerX = x + Math.cos(innerAngle) * (size * 0.3);
      const innerY = y + Math.sin(innerAngle) * (size * 0.3);

      if (i === 0) {
        ctx.moveTo(outerX, outerY);
      } else {
        ctx.lineTo(outerX, outerY);
      }
      ctx.lineTo(innerX, innerY);
    }
    ctx.closePath();
    ctx.fill();
  }

  /**
   * Clear all particles
   */
  clear(): void {
    this.particles = [];
  }

  /**
   * Get particle count (for debugging)
   */
  getParticleCount(): number {
    return this.particles.length;
  }
}

// Singleton instance
let particleSystemInstance: ParticleSystem | null = null;

/**
 * Get the global particle system instance
 */
export function getParticleSystem(): ParticleSystem {
  if (!particleSystemInstance) {
    particleSystemInstance = new ParticleSystem();
  }
  return particleSystemInstance;
}
