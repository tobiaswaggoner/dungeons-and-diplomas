/**
 * Highscore-related database operations
 */
import { getDatabase } from './connection';

export interface Highscore {
  id: number;
  user_id: number;
  username: string;
  score: number;
  enemies_defeated: number;
  rooms_explored: number;
  xp_gained: number;
  max_combo: number;
  play_time_seconds: number;
  created_at: string;
}

export interface HighscoreEntry {
  user_id: number;
  score: number;
  enemies_defeated: number;
  rooms_explored: number;
  xp_gained: number;
  max_combo: number;
  play_time_seconds: number;
}

/**
 * Save a new highscore entry
 */
export function saveHighscore(entry: HighscoreEntry): Highscore {
  const db = getDatabase();

  const result = db.prepare(`
    INSERT INTO highscores (user_id, score, enemies_defeated, rooms_explored, xp_gained, max_combo, play_time_seconds)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    entry.user_id,
    entry.score,
    entry.enemies_defeated,
    entry.rooms_explored,
    entry.xp_gained,
    entry.max_combo,
    entry.play_time_seconds
  );

  // Get the inserted highscore with username
  return db.prepare(`
    SELECT h.*, u.username
    FROM highscores h
    JOIN users u ON h.user_id = u.id
    WHERE h.id = ?
  `).get(result.lastInsertRowid) as Highscore;
}

/**
 * Get top highscores (default: top 10)
 */
export function getTopHighscores(limit: number = 10): Highscore[] {
  const db = getDatabase();

  return db.prepare(`
    SELECT h.*, u.username
    FROM highscores h
    JOIN users u ON h.user_id = u.id
    ORDER BY h.score DESC
    LIMIT ?
  `).all(limit) as Highscore[];
}

/**
 * Get highscores for a specific user
 */
export function getUserHighscores(userId: number, limit: number = 10): Highscore[] {
  const db = getDatabase();

  return db.prepare(`
    SELECT h.*, u.username
    FROM highscores h
    JOIN users u ON h.user_id = u.id
    WHERE h.user_id = ?
    ORDER BY h.score DESC
    LIMIT ?
  `).all(userId, limit) as Highscore[];
}

/**
 * Get the rank of a specific score
 */
export function getScoreRank(score: number): number {
  const db = getDatabase();

  const result = db.prepare(`
    SELECT COUNT(*) + 1 as rank
    FROM highscores
    WHERE score > ?
  `).get(score) as { rank: number };

  return result.rank;
}

/**
 * Check if a score is a new personal best for a user
 */
export function isPersonalBest(userId: number, score: number): boolean {
  const db = getDatabase();

  const result = db.prepare(`
    SELECT MAX(score) as best_score
    FROM highscores
    WHERE user_id = ?
  `).get(userId) as { best_score: number | null };

  return result.best_score === null || score > result.best_score;
}

/**
 * Calculate score from game stats
 * Formula: XP + (enemies × 100) + (rooms × 50) + (max_combo × 25)
 */
export function calculateScore(stats: {
  xpGained: number;
  enemiesDefeated: number;
  roomsExplored: number;
  maxCombo: number;
}): number {
  return (
    stats.xpGained +
    stats.enemiesDefeated * 100 +
    stats.roomsExplored * 50 +
    stats.maxCombo * 25
  );
}
