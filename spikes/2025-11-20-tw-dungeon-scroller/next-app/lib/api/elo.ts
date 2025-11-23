/**
 * ELO API endpoints
 */

import { get } from './client';

export interface SubjectEloScore {
  subjectKey: string;
  subjectName: string;
  averageElo: number;
}

export async function getSessionElo(userId: number): Promise<SubjectEloScore[]> {
  return get<SubjectEloScore[]>(`/api/session-elo?userId=${userId}`);
}
