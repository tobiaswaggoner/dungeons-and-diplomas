/**
 * Shrine collision detection
 *
 * Checks if an entity collides with any shrine in the dungeon.
 */
import { SHRINE_HITBOX_SIZE, PLAYER_SIZE } from '../constants';
import type { Shrine } from '../constants';

/**
 * Check if an entity at the given position collides with any shrine
 *
 * @param x X position in pixels
 * @param y Y position in pixels
 * @param tileSize Size of each tile in pixels
 * @param shrines Array of shrines to check
 * @returns true if collision detected, false otherwise
 */
export function checkShrineCollision(
  x: number,
  y: number,
  tileSize: number,
  shrines: Shrine[]
): boolean {
  if (!shrines || shrines.length === 0) return false;

  // Entity center position in tiles
  const entityCenterX = (x + tileSize / 2) / tileSize;
  const entityCenterY = (y + tileSize / 2) / tileSize;

  // Player hitbox radius (half of player size)
  const playerRadius = PLAYER_SIZE / 2;

  // Shrine hitbox radius
  const shrineRadius = SHRINE_HITBOX_SIZE / 2;

  // Combined radius for circle-circle collision
  const collisionRadius = playerRadius + shrineRadius;

  for (const shrine of shrines) {
    // Calculate distance between entity and shrine centers
    const dx = entityCenterX - shrine.x;
    const dy = entityCenterY - shrine.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Check if within collision radius
    if (distance < collisionRadius) {
      return true;
    }
  }

  return false;
}
