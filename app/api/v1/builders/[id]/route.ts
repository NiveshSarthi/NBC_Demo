import { NextRequest, NextResponse } from 'next/server';
import { BuilderModel } from '@/lib/models/builder';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const builderId = parseInt(id);
    if (isNaN(builderId)) {
      return NextResponse.json(
        { error: { code: 'INVALID_ID', message: 'Invalid builder ID' } },
        { status: 400 }
      );
    }

    const builder = await BuilderModel.getBuilderDetails(builderId);
    if (!builder) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Builder not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ builder });

  } catch (error) {
    console.error('Builder fetch error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching the builder',
        },
      },
      { status: 500 }
    );
  }
}