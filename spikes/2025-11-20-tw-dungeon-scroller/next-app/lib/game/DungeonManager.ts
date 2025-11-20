import {
  DUNGEON_WIDTH,
  DUNGEON_HEIGHT,
  TILE,
  DIRECTION,
  ANIMATION,
  PLAYER_MAX_HP
} from '../constants';
import type { TileType, TileVariant, Room } from '../constants';
import type { Player } from '../Enemy';
import {
  createEmptyDungeon,
  generateTileVariants,
  generateRooms,
  connectRooms,
  addWalls
} from '../dungeon/generation';
import { SpriteSheetLoader } from '../SpriteSheetLoader';
import { Enemy } from '../Enemy';

export class DungeonManager {
  public dungeon: TileType[][] = [];
  public tileVariants: TileVariant[][] = [];
  public rooms: Room[] = [];
  public roomMap: number[][] = [];
  public player: Player;
  public enemies: Enemy[] = [];
  public playerSprite: SpriteSheetLoader | null = null;
  public tileSize: number = 64;

  constructor(player: Player) {
    this.player = player;
  }

  async initialize(availableSubjects: string[]) {
    // Load player sprite
    const playerSprite = new SpriteSheetLoader('player');
    await playerSprite.load();
    playerSprite.playAnimation(DIRECTION.DOWN, ANIMATION.IDLE);
    this.playerSprite = playerSprite;

    // Generate initial dungeon
    await this.generateNewDungeon(availableSubjects);
  }

  async generateNewDungeon(availableSubjects: string[]) {
    this.dungeon = createEmptyDungeon();
    this.tileVariants = generateTileVariants();

    // Initialize roomMap
    this.roomMap = [];
    for (let y = 0; y < DUNGEON_HEIGHT; y++) {
      this.roomMap[y] = [];
      for (let x = 0; x < DUNGEON_WIDTH; x++) {
        this.roomMap[y][x] = -1;
      }
    }

    this.rooms = generateRooms(this.dungeon, this.roomMap);
    connectRooms(this.dungeon, this.roomMap, this.rooms);
    addWalls(this.dungeon);

    this.spawnPlayer();
    await this.spawnEnemies(availableSubjects);

    // Reset player HP
    this.player.hp = PLAYER_MAX_HP;
  }

  private spawnPlayer() {
    const validSpawnPoints: { x: number; y: number }[] = [];

    for (let y = 0; y < DUNGEON_HEIGHT; y++) {
      for (let x = 0; x < DUNGEON_WIDTH; x++) {
        if (this.dungeon[y][x] === TILE.FLOOR) {
          validSpawnPoints.push({ x, y });
        }
      }
    }

    if (validSpawnPoints.length > 0) {
      const spawnPoint = validSpawnPoints[Math.floor(Math.random() * validSpawnPoints.length)];
      this.player.x = spawnPoint.x * this.tileSize;
      this.player.y = spawnPoint.y * this.tileSize;

      // Make all rooms invisible first
      for (const room of this.rooms) {
        room.visible = false;
      }

      // Then make only the player's starting room visible
      const roomId = this.roomMap[spawnPoint.y][spawnPoint.x];
      if (roomId >= 0 && this.rooms[roomId]) {
        this.rooms[roomId].visible = true;
      }
    }
  }

  private async spawnEnemies(availableSubjects: string[]) {
    this.enemies = [];

    // Get player's current room
    const playerTileX = Math.floor((this.player.x + this.tileSize / 2) / this.tileSize);
    const playerTileY = Math.floor((this.player.y + this.tileSize / 2) / this.tileSize);
    const playerRoomId = this.roomMap[playerTileY]?.[playerTileX] ?? -1;

    for (let i = 0; i < this.rooms.length; i++) {
      // Skip player's starting room
      if (i === playerRoomId) {
        continue;
      }

      const room = this.rooms[i];
      const roomFloorTiles: { x: number; y: number }[] = [];

      for (let y = room.y; y < room.y + room.height; y++) {
        for (let x = room.x; x < room.x + room.width; x++) {
          if (y >= 0 && y < DUNGEON_HEIGHT && x >= 0 && x < DUNGEON_WIDTH) {
            if (this.dungeon[y][x] === TILE.FLOOR && this.roomMap[y][x] === i) {
              roomFloorTiles.push({ x, y });
            }
          }
        }
      }

      if (roomFloorTiles.length > 0) {
        const spawnPos = roomFloorTiles[Math.floor(Math.random() * roomFloorTiles.length)];
        const level = Math.floor(Math.random() * 10) + 1;
        const subject = availableSubjects.length > 0
          ? availableSubjects[Math.floor(Math.random() * availableSubjects.length)]
          : 'mathe';

        const enemy = new Enemy(
          spawnPos.x * this.tileSize,
          spawnPos.y * this.tileSize,
          'goblin',
          i,
          level,
          subject
        );
        await enemy.load();
        this.enemies.push(enemy);
      }
    }
  }
}
