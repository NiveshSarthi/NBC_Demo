import { NextRequest, NextResponse } from 'next/server';
import { PropertyModel } from '@/lib/models/property';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from middleware
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get user's saved properties
    const result = await PropertyModel.getSavedProperties(
      parseInt(userId),
      { page, limit }
    );

    return NextResponse.json(result);

  } catch (error) {
    console.error('Get saved properties error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching saved properties',
        },
      },
      { status: 500 }
    );
  }
}