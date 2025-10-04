import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

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

    const savedSearches = await prisma.savedSearch.findMany({
      where: { user_id: parseInt(userId) },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json(savedSearches);

  } catch (error) {
    console.error('Saved searches fetch error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching saved searches',
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user ID from middleware
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, search_query, filters, location_bounds, alert_enabled } = body;

    // Validate input
    if (!name) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Search name is required' } },
        { status: 400 }
      );
    }

    // Create saved search
    const savedSearch = await prisma.savedSearch.create({
      data: {
        user_id: parseInt(userId),
        name,
        search_query,
        filters: filters ? JSON.stringify(filters) : null,
        location_bounds: location_bounds ? JSON.stringify(location_bounds) : null,
        alert_enabled: alert_enabled || false,
      },
    });

    return NextResponse.json({
      savedSearch,
      message: 'Search saved successfully',
    });

  } catch (error) {
    console.error('Saved search creation error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while saving the search',
        },
      },
      { status: 500 }
    );
  }
}