import { NextRequest, NextResponse } from 'next/server';
import { LocationModel } from '@/lib/models/location';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const filters: any = {};
    const pagination: any = {};

    // Extract filters
    const city = searchParams.get('city');
    if (city) filters.city = city;

    const state = searchParams.get('state');
    if (state) filters.state = state;

    const type = searchParams.get('type');
    if (type) filters.type = type;

    const tierClassification = searchParams.get('tierClassification');
    if (tierClassification) filters.tierClassification = tierClassification;

    // Extract pagination
    const page = searchParams.get('page');
    if (page) pagination.page = parseInt(page);

    const limit = searchParams.get('limit');
    if (limit) pagination.limit = parseInt(limit);

    const sortBy = searchParams.get('sortBy');
    if (sortBy) pagination.sortBy = sortBy as any;

    const sortOrder = searchParams.get('sortOrder');
    if (sortOrder) pagination.sortOrder = sortOrder as any;

    // Get locations
    const result = await LocationModel.findMany(filters, pagination);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Locations fetch error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching locations',
        },
      },
      { status: 500 }
    );
  }
}