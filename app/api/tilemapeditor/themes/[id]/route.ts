import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getTileTheme, updateTileTheme, deleteTileTheme } from '@/lib/tiletheme/db';
import { withErrorHandler } from '@/lib/api/errorHandler';

export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const theme = await getTileTheme(parseInt(id));

  if (!theme) {
    return NextResponse.json({ error: 'Theme not found' }, { status: 404 });
  }

  return NextResponse.json(theme);
}, 'fetch theme');

export const PUT = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const themeId = parseInt(id);
  const body = await request.json();

  const theme = await getTileTheme(themeId);
  if (!theme) {
    return NextResponse.json({ error: 'Theme not found' }, { status: 404 });
  }

  await updateTileTheme(themeId, body);

  // Invalidate cached theme data
  revalidatePath(`/api/theme/${themeId}`);

  const updatedTheme = await getTileTheme(themeId);
  return NextResponse.json(updatedTheme);
}, 'update theme');

export const DELETE = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const themeId = parseInt(id);

  await deleteTileTheme(themeId);

  // Invalidate cached theme data
  revalidatePath(`/api/theme/${themeId}`);

  return NextResponse.json({ success: true });
}, 'delete theme');
