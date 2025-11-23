/**
 * Authentication API endpoints
 */

import { post } from './client';

export interface LoginRequest {
  username: string;
}

export interface LoginResponse {
  id: number;
  username: string;
  xp?: number;
}

export async function login(username: string): Promise<LoginResponse> {
  return post<LoginResponse>('/api/auth/login', { username });
}

export async function logout(): Promise<void> {
  await post<void>('/api/auth/logout', {});
}
