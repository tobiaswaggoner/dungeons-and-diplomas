/**
 * Level Distribution Utilities for Enemy Spawning
 *
 * Provides functions for generating enemy levels based on player ELO
 * using normal distribution and weighted random selection.
 */

import type { SeededRandom } from '../dungeon/SeededRandom';

/**
 * Generate a normally distributed random number around a mean with given standard deviation
 * Uses Box-Muller transform
 *
 * @param mean Center of the distribution
 * @param stdDev Standard deviation (spread)
 * @param rng Optional seeded random generator (for reproducible dungeons)
 * @returns Random number from normal distribution
 */
function randomNormal(mean: number, stdDev: number, rng?: SeededRandom): number {
  // Box-Muller transform
  const u1 = rng ? rng.next() : Math.random();
  const u2 = rng ? rng.next() : Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdDev + mean;
}

/**
 * Generate enemy level for normal (empty) rooms
 * Level 1-6 based on player's ELO in the subject
 *
 * @param playerElo Player's ELO in this subject (1-10)
 * @param rng Optional seeded random generator (for reproducible dungeons)
 * @returns Enemy level (1-6), clamped and rounded
 */
export function generateNormalRoomLevel(playerElo: number, rng?: SeededRandom): number {
  // Map player ELO (1-10) to target level range (1-6)
  // Player ELO 1 → target ~1-2
  // Player ELO 5 → target ~3-4
  // Player ELO 10 → target ~5-6
  const targetLevel = 1 + (playerElo - 1) * (5 / 9);

  // Standard deviation increases slightly with player ELO (more variety for advanced players)
  const stdDev = 1.0 + (playerElo / 10) * 0.5;

  // Generate level with normal distribution
  let level = Math.round(randomNormal(targetLevel, stdDev, rng));

  // Clamp to 1-6 range
  level = Math.max(1, Math.min(6, level));

  return level;
}

/**
 * Generate enemy level for combat rooms
 * High levels (6-10) with strong bias toward 8+
 *
 * @param guaranteeHard If true, guarantee level 8+
 * @param rng Optional seeded random generator (for reproducible dungeons)
 * @returns Enemy level (6-10)
 */
export function generateCombatRoomLevel(guaranteeHard: boolean = false, rng?: SeededRandom): number {
  if (guaranteeHard) {
    // Guaranteed hard enemy: Level 8-10 with bias toward 8
    const weights = [
      { level: 8, weight: 5 },
      { level: 9, weight: 3 },
      { level: 10, weight: 2 }
    ];

    const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
    let random = (rng ? rng.next() : Math.random()) * totalWeight;

    for (const w of weights) {
      random -= w.weight;
      if (random <= 0) return w.level;
    }
    return 8; // Fallback
  } else {
    // Non-guaranteed enemy: Level 6-10 with normal distribution around 8
    let level = Math.round(randomNormal(8, 1.5, rng));
    level = Math.max(6, Math.min(10, level));
    return level;
  }
}

/**
 * Calculate subject distribution based on inverse ELO
 * Weaker subjects get more enemies
 *
 * @param subjectElos Map of subject key to average ELO
 * @returns Map of subject key to spawn weight
 */
export function calculateSubjectWeights(subjectElos: { [key: string]: number }): { [key: string]: number } {
  const subjects = Object.keys(subjectElos);
  if (subjects.length === 0) return {};

  // Calculate inverse weights (lower ELO = higher weight)
  // Formula: weight = (11 - ELO) to ensure positive weights
  const weights: { [key: string]: number } = {};
  let totalWeight = 0;

  for (const subject of subjects) {
    const elo = subjectElos[subject];
    const weight = 11 - elo; // ELO 1 → weight 10, ELO 10 → weight 1
    weights[subject] = weight;
    totalWeight += weight;
  }

  // Normalize to probabilities (0-1)
  for (const subject of subjects) {
    weights[subject] = weights[subject] / totalWeight;
  }

  return weights;
}

/**
 * Select a subject based on weighted probabilities
 *
 * @param subjectWeights Map of subject key to probability (0-1)
 * @param rng Optional seeded random generator (for reproducible dungeons)
 * @returns Selected subject key
 */
export function selectWeightedSubject(subjectWeights: { [key: string]: number }, rng?: SeededRandom): string {
  const subjects = Object.keys(subjectWeights);
  if (subjects.length === 0) return 'mathe'; // Fallback

  let random = rng ? rng.next() : Math.random();

  for (const subject of subjects) {
    random -= subjectWeights[subject];
    if (random <= 0) return subject;
  }

  // Fallback to first subject
  return subjects[0];
}

/**
 * Configuration for a single enemy spawn
 */
export interface EnemySpawnConfig {
  tileX: number;
  tileY: number;
  roomIndex: number;
  level: number;
  subject: string;
  playerElo: number;
}

/**
 * Input parameters for enemy spawn calculation
 */
export interface SpawnCalculationInput {
  rooms: Array<{ x: number; y: number; width: number; height: number; type: string }>;
  dungeon: number[][];
  roomMap: number[][];
  dungeonWidth: number;
  dungeonHeight: number;
  playerRoomId: number;
  subjectWeights: { [key: string]: number };
  subjectElos: { [key: string]: number };
  tileFloorValue: number;
  spawnRng: SeededRandom;
}

/**
 * Pure function to calculate enemy spawn configurations
 *
 * This function determines WHERE enemies spawn and WHAT stats they have,
 * without actually creating Enemy objects or loading sprites.
 *
 * @param input All data needed to calculate spawns
 * @returns Array of spawn configurations
 */
export function calculateEnemySpawns(input: SpawnCalculationInput): EnemySpawnConfig[] {
  const {
    rooms,
    dungeon,
    roomMap,
    dungeonWidth,
    dungeonHeight,
    playerRoomId,
    subjectWeights,
    subjectElos,
    tileFloorValue,
    spawnRng
  } = input;

  const spawns: EnemySpawnConfig[] = [];

  for (let i = 0; i < rooms.length; i++) {
    // Skip player's starting room
    if (i === playerRoomId) {
      continue;
    }

    const room = rooms[i];

    // Collect floor tiles in this room
    const roomFloorTiles: { x: number; y: number }[] = [];
    for (let y = room.y; y < room.y + room.height; y++) {
      for (let x = room.x; x < room.x + room.width; x++) {
        if (y >= 0 && y < dungeonHeight && x >= 0 && x < dungeonWidth) {
          if (dungeon[y][x] === tileFloorValue && roomMap[y][x] === i) {
            roomFloorTiles.push({ x, y });
          }
        }
      }
    }

    if (roomFloorTiles.length === 0) continue;

    // Determine enemy count and level generation based on room type
    let enemyCount = 0;
    let levelGenerator: (index: number, subject: string) => number = () => 1;

    switch (room.type) {
      case 'treasure':
        // Treasure rooms: No enemies
        enemyCount = 0;
        break;

      case 'combat':
        // Combat rooms: 1-3 enemies, at least one level 8+
        enemyCount = spawnRng.nextInt(1, 4);
        levelGenerator = (index: number) => {
          // First enemy is guaranteed level 8+
          return generateCombatRoomLevel(index === 0, spawnRng);
        };
        break;

      case 'empty':
      default:
        // Normal rooms: 1 enemy, level 1-6 based on player ELO
        enemyCount = 1;
        levelGenerator = (_index: number, subject: string) => {
          const playerElo = subjectElos[subject] || 5;
          return generateNormalRoomLevel(playerElo, spawnRng);
        };
        break;
    }

    // Generate spawn configurations
    for (let enemyIndex = 0; enemyIndex < enemyCount; enemyIndex++) {
      // Select random spawn position
      const spawnPos = roomFloorTiles[spawnRng.nextIntMax(roomFloorTiles.length)];

      // Select subject (weighted by inverse ELO)
      const subject = selectWeightedSubject(subjectWeights, spawnRng);

      // Generate level based on room type
      const level = levelGenerator(enemyIndex, subject);

      spawns.push({
        tileX: spawnPos.x,
        tileY: spawnPos.y,
        roomIndex: i,
        level,
        subject,
        playerElo: subjectElos[subject] || 5
      });
    }
  }

  return spawns;
}
