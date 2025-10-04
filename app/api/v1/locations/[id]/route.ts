import { NextRequest, NextResponse } from 'next/server';
import { LocationModel } from '@/lib/models/location';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const locationId = parseInt(id);

    if (isNaN(locationId)) {
      return NextResponse.json(
        { error: { code: 'INVALID_ID', message: 'Invalid location ID' } },
        { status: 400 }
      );
    }

    // Parse query parameters for property filters
    const { searchParams } = new URL(request.url);
    const propertyFilters: any = {};
    const propertyPagination: any = {};

    // Property filters
    const minPrice = searchParams.get('minPrice');
    if (minPrice) propertyFilters.price = { gte: parseFloat(minPrice) };

    const maxPrice = searchParams.get('maxPrice');
    if (maxPrice) {
      propertyFilters.price = propertyFilters.price || {};
      propertyFilters.price.lte = parseFloat(maxPrice);
    }

    const propertyType = searchParams.get('propertyType');
    if (propertyType) propertyFilters.property_type = propertyType;

    const bedrooms = searchParams.get('bedrooms');
    if (bedrooms) propertyFilters.bedrooms = parseInt(bedrooms);

    // Property pagination
    const propertyPage = searchParams.get('propertyPage');
    if (propertyPage) {
      const page = parseInt(propertyPage);
      propertyPagination.skip = (page - 1) * (propertyPagination.limit || 10);
    }

    const propertyLimit = searchParams.get('propertyLimit');
    if (propertyLimit) {
      propertyPagination.limit = parseInt(propertyLimit);
    }

    // Get location with properties
    const location = await LocationModel.getLocationWithProperties(
      locationId,
      propertyFilters,
      propertyPagination
    );

    if (!location) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Location not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ location });

  } catch (error) {
    console.error('Location fetch error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching the location',
        },
      },
      { status: 500 }
    );
  }
}