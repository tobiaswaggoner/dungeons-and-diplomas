import { NextResponse } from 'next/server';
import { getSessionEloScores } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    const scores = getSessionEloScores(parseInt(userId, 10));
    return NextResponse.json(scores);
  } catch (error) {
    console.error('Error fetching session ELO:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session ELO' },
      { status: 500 }
    );
  }
}
