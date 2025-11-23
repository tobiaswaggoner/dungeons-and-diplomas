/**
 * Questions API endpoints
 */

import { get } from './client';
import type { QuestionDatabase } from '../questions';

export async function getAllQuestions(): Promise<QuestionDatabase> {
  return get<QuestionDatabase>('/api/questions');
}

export async function getSubjects(): Promise<string[]> {
  return get<string[]>('/api/subjects');
}
