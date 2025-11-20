import { NextResponse } from 'next/server';
import { getQuestionsWithEloBySubject } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');
    const userId = searchParams.get('userId');

    if (!subject || !userId) {
      return NextResponse.json(
        { error: 'Missing subject or userId parameter' },
        { status: 400 }
      );
    }

    const questions = getQuestionsWithEloBySubject(subject, parseInt(userId, 10));
    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error fetching questions with ELO:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}
