/**
 * Shrine Interaction Hook
 *
 * Handles shrine proximity detection and interaction:
 * - Checks if player is within interaction range of a shrine
 * - Handles E-key and click interaction
 * - Triggers shrine activation
 */
import { useCallback, useEffect, useState, useRef } from 'react';
import type { Shrine } from '@/lib/constants';
import { SHRINE_INTERACTION_RADIUS } from '@/lib/constants';
import type { Player } from '@/lib/enemy';
import type { DungeonManager } from '@/lib/game/DungeonManager';

export interface ShrineProximityState {
  isInRange: boolean;
  nearestShrine: Shrine | null;
  distance: number;
}

interface UseShrineProps {
  playerRef: React.MutableRefObject<Player>;
  dungeonManagerRef: React.MutableRefObject<DungeonManager | null>;
  inCombatRef: React.MutableRefObject<boolean>;
  gamePausedRef: React.MutableRefObject<boolean>;
  onShrineActivated?: (shrine: Shrine) => void;
}

/**
 * Check proximity to shrines
 */
function checkShrineProximity(
  playerX: number,
  playerY: number,
  shrines: Shrine[],
  tileSize: number
): ShrineProximityState {
  let nearest: Shrine | null = null;
  let minDistance = Infinity;

  // Convert player position from pixels to tiles
  const playerTileX = playerX / tileSize + 0.5;
  const playerTileY = playerY / tileSize + 0.5;

  for (const shrine of shrines) {
    // Skip already activated or currently active shrines
    if (shrine.isActivated || shrine.isActive) continue;

    const dx = playerTileX - shrine.x;
    const dy = playerTileY - shrine.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < minDistance) {
      minDistance = distance;
      nearest = shrine;
    }
  }

  return {
    isInRange: minDistance <= SHRINE_INTERACTION_RADIUS,
    nearestShrine: minDistance <= SHRINE_INTERACTION_RADIUS ? nearest : null,
    distance: minDistance
  };
}

/**
 * Convert canvas coordinates to world coordinates
 */
function canvasToWorldCoords(
  canvasX: number,
  canvasY: number,
  cameraX: number,
  cameraY: number,
  tileSize: number
): { worldX: number; worldY: number } {
  return {
    worldX: (canvasX / tileSize) + cameraX,
    worldY: (canvasY / tileSize) + cameraY
  };
}

/**
 * Find shrine at a given world position
 */
function findShrineAtPosition(
  worldX: number,
  worldY: number,
  shrines: Shrine[]
): Shrine | null {
  const SHRINE_HITBOX_SIZE = 1.5;

  for (const shrine of shrines) {
    const dx = Math.abs(worldX - shrine.x);
    const dy = Math.abs(worldY - shrine.y);

    if (dx < SHRINE_HITBOX_SIZE / 2 && dy < SHRINE_HITBOX_SIZE / 2) {
      return shrine;
    }
  }
  return null;
}

export function useShrine({
  playerRef,
  dungeonManagerRef,
  inCombatRef,
  gamePausedRef,
  onShrineActivated
}: UseShrineProps) {
  const [proximityState, setProximityState] = useState<ShrineProximityState>({
    isInRange: false,
    nearestShrine: null,
    distance: Infinity
  });

  // Ref to track last check to avoid too frequent updates
  const lastCheckRef = useRef(0);
  const CHECK_INTERVAL = 100; // ms

  /**
   * Check if we can interact with a shrine
   */
  const canInteract = useCallback(() => {
    return (
      !inCombatRef.current &&
      !gamePausedRef.current
    );
  }, [inCombatRef, gamePausedRef]);

  /**
   * Activate a shrine
   */
  const activateShrine = useCallback((shrine: Shrine) => {
    if (shrine.isActivated || shrine.isActive) return;
    if (!canInteract()) return;

    console.log('Shrine activated:', shrine.id);
    
    // Mark shrine as active
    shrine.isActive = true;

    // Trigger callback
    onShrineActivated?.(shrine);
  }, [canInteract, onShrineActivated]);

  /**
   * Handle E-key interaction
   */
  const handleKeyInteraction = useCallback(() => {
    if (!canInteract()) return;

    const manager = dungeonManagerRef.current;
    if (!manager) return;

    const proximity = checkShrineProximity(
      playerRef.current.x,
      playerRef.current.y,
      manager.shrines,
      manager.tileSize
    );

    if (proximity.isInRange && proximity.nearestShrine) {
      activateShrine(proximity.nearestShrine);
    }
  }, [playerRef, dungeonManagerRef, canInteract, activateShrine]);

  /**
   * Handle click interaction on canvas
   */
  const handleCanvasClick = useCallback((
    canvasX: number,
    canvasY: number,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    if (!canInteract()) return;

    const manager = dungeonManagerRef.current;
    if (!manager) return;

    const tileSize = manager.tileSize;
    const player = playerRef.current;

    // Calculate camera offset
    const cameraX = (player.x + tileSize / 2 - canvasWidth / 2) / tileSize;
    const cameraY = (player.y + tileSize / 2 - canvasHeight / 2) / tileSize;

    const { worldX, worldY } = canvasToWorldCoords(
      canvasX,
      canvasY,
      cameraX,
      cameraY,
      tileSize
    );

    // Find clicked shrine
    const clickedShrine = findShrineAtPosition(worldX, worldY, manager.shrines);

    if (clickedShrine && !clickedShrine.isActivated && !clickedShrine.isActive) {
      // Check if player is in range
      const playerTileX = player.x / tileSize + 0.5;
      const playerTileY = player.y / tileSize + 0.5;
      const dx = playerTileX - clickedShrine.x;
      const dy = playerTileY - clickedShrine.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= SHRINE_INTERACTION_RADIUS) {
        activateShrine(clickedShrine);
      } else {
        console.log('Shrine too far away:', distance.toFixed(2), 'tiles');
      }
    }
  }, [playerRef, dungeonManagerRef, canInteract, activateShrine]);

  /**
   * Update proximity state periodically
   */
  const updateProximity = useCallback(() => {
    const now = Date.now();
    if (now - lastCheckRef.current < CHECK_INTERVAL) return;
    lastCheckRef.current = now;

    const manager = dungeonManagerRef.current;
    if (!manager) return;

    const newState = checkShrineProximity(
      playerRef.current.x,
      playerRef.current.y,
      manager.shrines,
      manager.tileSize
    );

    // Only update if changed
    if (
      newState.isInRange !== proximityState.isInRange ||
      newState.nearestShrine?.id !== proximityState.nearestShrine?.id
    ) {
      setProximityState(newState);
    }
  }, [playerRef, dungeonManagerRef, proximityState]);

  // Set up E-key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'e' || e.key === 'E') {
        handleKeyInteraction();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyInteraction]);

  return {
    proximityState,
    updateProximity,
    handleCanvasClick,
    handleKeyInteraction
  };
}
