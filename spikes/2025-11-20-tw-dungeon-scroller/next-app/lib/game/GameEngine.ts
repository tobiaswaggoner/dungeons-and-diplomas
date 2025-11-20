import {
  DUNGEON_WIDTH,
  DUNGEON_HEIGHT,
  TILE,
  DIRECTION,
  ANIMATION,
  PLAYER_SPEED_TILES,
  PLAYER_SIZE
} from '../constants';
import type { TileType, Player, Room } from '../constants';
import { SpriteSheetLoader } from '../SpriteSheetLoader';
import { Enemy } from '../Enemy';

export class GameEngine {
  public checkCollision(
    x: number,
    y: number,
    tileSize: number,
    dungeon: TileType[][]
  ): boolean {
    const playerSize = tileSize * PLAYER_SIZE;
    const margin = (tileSize - playerSize) / 2;

    const left = x + margin;
    const right = x + tileSize - margin;
    const top = y + margin;
    const bottom = y + tileSize - margin;

    const points = [
      { x: left, y: top },
      { x: right, y: top },
      { x: left, y: bottom },
      { x: right, y: bottom }
    ];

    for (let p of points) {
      const tileX = Math.floor(p.x / tileSize);
      const tileY = Math.floor(p.y / tileSize);

      if (tileX < 0 || tileX >= DUNGEON_WIDTH || tileY < 0 || tileY >= DUNGEON_HEIGHT) {
        return true;
      }

      if (dungeon[tileY][tileX] === TILE.WALL || dungeon[tileY][tileX] === TILE.EMPTY) {
        return true;
      }
    }
    return false;
  }

  public updateFogOfWar(
    player: Player,
    tileSize: number,
    roomMap: number[][],
    rooms: Room[]
  ) {
    const playerTileX = Math.floor((player.x + tileSize / 2) / tileSize);
    const playerTileY = Math.floor((player.y + tileSize / 2) / tileSize);

    if (playerTileX >= 0 && playerTileX < DUNGEON_WIDTH && playerTileY >= 0 && playerTileY < DUNGEON_HEIGHT) {
      const roomId = roomMap[playerTileY][playerTileX];
      if (roomId >= 0 && rooms[roomId] && !rooms[roomId].visible) {
        rooms[roomId].visible = true;
      }
    }
  }

  public updatePlayer(
    dt: number,
    player: Player,
    keys: any,
    tileSize: number,
    dungeon: TileType[][],
    roomMap: number[][],
    rooms: Room[],
    playerSprite: SpriteSheetLoader | null,
    inCombat: boolean
  ) {
    if (inCombat) return;

    let dx = 0;
    let dy = 0;

    if (keys.ArrowUp || keys.w) dy -= 1;
    if (keys.ArrowDown || keys.s) dy += 1;
    if (keys.ArrowLeft || keys.a) dx -= 1;
    if (keys.ArrowRight || keys.d) dx += 1;

    player.isMoving = (dx !== 0 || dy !== 0);

    if (player.isMoving) {
      const length = Math.sqrt(dx * dx + dy * dy);
      const currentSpeed = PLAYER_SPEED_TILES * tileSize;
      dx = dx / length * currentSpeed * dt;
      dy = dy / length * currentSpeed * dt;

      const newX = player.x + dx;
      const newY = player.y + dy;

      if (!this.checkCollision(newX, player.y, tileSize, dungeon)) {
        player.x = newX;
      }
      if (!this.checkCollision(player.x, newY, tileSize, dungeon)) {
        player.y = newY;
      }

      if (Math.abs(dx) > Math.abs(dy)) {
        player.direction = dx > 0 ? DIRECTION.RIGHT : DIRECTION.LEFT;
      } else {
        player.direction = dy > 0 ? DIRECTION.DOWN : DIRECTION.UP;
      }

      playerSprite?.playAnimation(player.direction, ANIMATION.RUN);
      this.updateFogOfWar(player, tileSize, roomMap, rooms);

      // Open doors
      const pTileX = Math.floor((player.x + tileSize / 2) / tileSize);
      const pTileY = Math.floor((player.y + tileSize / 2) / tileSize);

      if (pTileX >= 0 && pTileX < DUNGEON_WIDTH && pTileY >= 0 && pTileY < DUNGEON_HEIGHT) {
        if (dungeon[pTileY][pTileX] === TILE.DOOR) {
          dungeon[pTileY][pTileX] = TILE.FLOOR;
        }
      }
    } else {
      playerSprite?.playAnimation(player.direction, ANIMATION.IDLE);
    }

    playerSprite?.update(dt);
  }

  public updateEnemies(
    dt: number,
    enemies: Enemy[],
    player: Player,
    tileSize: number,
    rooms: Room[],
    dungeon: TileType[][],
    roomMap: number[][],
    startCombat: (enemy: Enemy) => void,
    inCombat: boolean
  ) {
    for (const enemy of enemies) {
      enemy.update(
        dt,
        player,
        tileSize,
        rooms,
        dungeon,
        roomMap,
        startCombat,
        inCombat
      );
    }
  }
}
