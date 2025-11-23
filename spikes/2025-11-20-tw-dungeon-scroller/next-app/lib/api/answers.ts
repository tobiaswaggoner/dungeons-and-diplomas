/**
 * Answers API endpoints
 */

import { post } from './client';

export interface AnswerLogEntry {
  user_id: number;
  question_id: number;
  selected_answer_index: number;
  is_correct: boolean;
  answer_time_ms: number;
  timeout_occurred: boolean;
}

export interface LogAnswerResponse {
  success: boolean;
}

export async function logAnswer(entry: AnswerLogEntry): Promise<LogAnswerResponse> {
  return post<LogAnswerResponse>('/api/answers', entry);
}
