/**
 * Highscore API client functions
 */
import { get, post } from './client';

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

export interface SaveHighscoreRequest {
  user_id: number;
  enemies_defeated: number;
  rooms_explored: number;
  xp_gained: number;
  max_combo: number;
  play_time_seconds: number;
}

export interface SaveHighscoreResponse {
  highscore: Highscore;
  rank: number;
  isNewPersonalBest: boolean;
  score: number;
}

export interface GetHighscoresResponse {
  highscores: Highscore[];
}

/**
 * Get top highscores
 */
export async function getTopHighscores(limit: number = 10): Promise<Highscore[]> {
  const response = await get<GetHighscoresResponse>(`/api/highscores?limit=${limit}`);
  return response.highscores;
}

/**
 * Get highscores for a specific user
 */
export async function getUserHighscores(userId: number, limit: number = 10): Promise<Highscore[]> {
  const response = await get<GetHighscoresResponse>(`/api/highscores?userId=${userId}&limit=${limit}`);
  return response.highscores;
}

/**
 * Save a new highscore
 */
export async function saveHighscore(data: SaveHighscoreRequest): Promise<SaveHighscoreResponse> {
  return post<SaveHighscoreResponse>('/api/highscores', data);
}
