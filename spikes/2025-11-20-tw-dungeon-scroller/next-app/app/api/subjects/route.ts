import { NextResponse } from 'next/server';
import { getAllSubjects } from '@/lib/db';

export async function GET() {
  try {
    const subjects = getAllSubjects();
    return NextResponse.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subjects' },
      { status: 500 }
    );
  }
}
