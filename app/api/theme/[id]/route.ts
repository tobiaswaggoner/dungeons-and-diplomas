import { NextRequest, NextResponse } from 'next/server';
import { getTileTheme, getTilesets } from '@/lib/tiletheme/db';
import { withErrorHandler } from '@/lib/api/errorHandler';

// Cache themes for 1 hour, revalidate on-demand when theme is updated
export const revalidate = 3600;

export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const themeId = parseInt(id, 10);

  if (isNaN(themeId)) {
    return NextResponse.json({ error: 'Invalid theme ID' }, { status: 400 });
  }

  const theme = await getTileTheme(themeId);

  if (!theme) {
    return NextResponse.json({ error: 'Theme not found' }, { status: 404 });
  }

  // Also return tilesets so the client can load the images
  const tilesets = await getTilesets();

  return NextResponse.json({ theme, tilesets });
}, 'fetch theme');
