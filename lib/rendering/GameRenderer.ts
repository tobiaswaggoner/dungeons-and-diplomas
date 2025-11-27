import type { TileType, Room, Shrine } from '../constants';
import type { Player } from '../enemy';
import { SpriteSheetLoader } from '../SpriteSheetLoader';
import { Enemy } from '../enemy';
import type { RenderMap, TileTheme } from '../tiletheme/types';
import { VisibilityCalculator } from '../visibility';
import { getTileRenderer } from './TileRenderer';
import { getContext2D } from './canvasUtils';
import { RENDER_COLORS } from '../ui/colors';

/**
 * Main game renderer that orchestrates all rendering passes.
 * Uses TileRenderer for tile-specific rendering operations.
 */
export class GameRenderer {
  private tileRenderer = getTileRenderer();
  private pulsePhase = 0;
  private shrineImage: HTMLImageElement | null = null;
  private shrineImageLoaded = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.shrineImage = new Image();
      this.shrineImage.onload = () => {
        this.shrineImageLoaded = true;
      };
      this.shrineImage.src = '/Assets/shrine.png';
    }
  }

  /**
   * Render all shrines visible in player's rooms
   */
  private renderShrines(
    ctx: CanvasRenderingContext2D,
    shrines: Shrine[],
    rooms: Room[],
    tileSize: number,
    playerRoomIds: Set<number>
  ): void {
    this.pulsePhase += 0.05;
    if (this.pulsePhase > Math.PI * 2) {
      this.pulsePhase = 0;
    }

    for (const shrine of shrines) {
      if (!rooms[shrine.roomId]?.visible) continue;

      const screenX = shrine.x * tileSize;
      const screenY = shrine.y * tileSize;
      const spriteSize = tileSize * 2;

      ctx.save();

      if (shrine.isActivated) {
        ctx.globalAlpha = 0.5;
        ctx.filter = 'grayscale(100%)';
      } else if (shrine.isActive) {
        ctx.shadowColor = '#ff4444';
        ctx.shadowBlur = 25;
      } else {
        const glowIntensity = 10 + Math.sin(this.pulsePhase) * 5;
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = glowIntensity;
      }

      if (this.shrineImageLoaded && this.shrineImage) {
        ctx.drawImage(this.shrineImage, screenX, screenY, spriteSize, spriteSize);
      }

      ctx.restore();
    }
  }

  /**
   * Render all enemies visible in player's rooms
   */
  private renderEnemies(
    ctx: CanvasRenderingContext2D,
    enemies: Enemy[],
    rooms: Room[],
    tileSize: number,
    player: Player,
    playerRoomIds: Set<number>
  ): void {
    for (const enemy of enemies) {
      enemy.draw(ctx, rooms, tileSize, player, playerRoomIds);
    }
  }

  /**
   * Render the player sprite
   */
  private renderPlayer(
    ctx: CanvasRenderingContext2D,
    playerSprite: SpriteSheetLoader | null,
    player: Player,
    tileSize: number
  ): void {
    playerSprite?.draw(ctx, player.x, player.y, tileSize, tileSize);
  }

  /**
   * Main render method - orchestrates all rendering passes
   */
  render(
    canvas: HTMLCanvasElement,
    player: Player,
    dungeon: TileType[][],
    roomMap: number[][],
    rooms: Room[],
    enemies: Enemy[],
    playerSprite: SpriteSheetLoader | null,
    tileSize: number,
    renderMap: RenderMap,
    doorStates: Map<string, boolean>,
    darkTheme: TileTheme | null,
    shrines: Shrine[] = []
  ) {
    const ctx = getContext2D(canvas);
    if (!ctx) {
      throw new Error('Failed to get 2D context from canvas');
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const dungeonWidth = renderMap.width;
    const dungeonHeight = renderMap.height;

    const camX = player.x + tileSize / 2 - canvas.width / 2;
    const camY = player.y + tileSize / 2 - canvas.height / 2;

    ctx.save();
    ctx.translate(-Math.floor(camX), -Math.floor(camY));

    ctx.fillStyle = RENDER_COLORS.BACKGROUND;
    ctx.fillRect(Math.floor(camX), Math.floor(camY), canvas.width, canvas.height);

    const startCol = Math.floor(camX / tileSize);
    const endCol = startCol + Math.ceil(canvas.width / tileSize) + 1;
    const startRow = Math.floor(camY / tileSize);
    const endRow = startRow + Math.ceil(canvas.height / tileSize) + 1;

    const playerRoomIds = VisibilityCalculator.getPlayerRoomIds(player, tileSize, roomMap, dungeonWidth, dungeonHeight);

    this.tileRenderer.renderTiles(
      ctx, dungeon, roomMap, rooms, enemies, tileSize, renderMap, doorStates, darkTheme,
      startCol, endCol, startRow, endRow, dungeonWidth, dungeonHeight
    );

    this.tileRenderer.renderFogOfWar(
      ctx, dungeon, roomMap, rooms, playerRoomIds, tileSize,
      startCol, endCol, startRow, endRow, dungeonWidth, dungeonHeight
    );

    this.renderShrines(ctx, shrines, rooms, tileSize, playerRoomIds);

    this.renderEnemies(ctx, enemies, rooms, tileSize, player, playerRoomIds);

    this.renderPlayer(ctx, playerSprite, player, tileSize);

    ctx.restore();
  }
}
