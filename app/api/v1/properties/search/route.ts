import { NextRequest, NextResponse } from 'next/server';
import { searchPropertySchema } from '@/lib/auth';
import { PropertyModel } from '@/lib/models/property';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract query parameter
    const query = searchParams.get('q') || '';

    // Parse other filters and pagination from query parameters
    const filters: any = {};
    const pagination: any = {};

    // Extract filters
    const propertyType = searchParams.get('propertyType');
    if (propertyType) filters.propertyType = propertyType;

    const city = searchParams.get('city');
    if (city) filters.city = city;

    const state = searchParams.get('state');
    if (state) filters.state = state;

    const minPrice = searchParams.get('minPrice');
    if (minPrice) filters.minPrice = parseFloat(minPrice);

    const maxPrice = searchParams.get('maxPrice');
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);

    const minArea = searchParams.get('minArea');
    if (minArea) filters.minArea = parseFloat(minArea);

    const maxArea = searchParams.get('maxArea');
    if (maxArea) filters.maxArea = parseFloat(maxArea);

    const bedrooms = searchParams.get('bedrooms');
    if (bedrooms) filters.bedrooms = parseInt(bedrooms);

    const bathrooms = searchParams.get('bathrooms');
    if (bathrooms) filters.bathrooms = parseInt(bathrooms);

    const furnishing = searchParams.get('furnishing');
    if (furnishing) filters.furnishing = furnishing;

    const amenities = searchParams.get('amenities');
    if (amenities) filters.amenities = amenities.split(',');

    const featured = searchParams.get('featured');
    if (featured !== null) filters.featured = featured === 'true';

    const locationId = searchParams.get('locationId');
    if (locationId) filters.locationId = parseInt(locationId);

    // Extract pagination
    const page = searchParams.get('page');
    if (page) pagination.page = parseInt(page);

    const limit = searchParams.get('limit');
    if (limit) pagination.limit = parseInt(limit);

    const sortBy = searchParams.get('sortBy');
    if (sortBy) pagination.sortBy = sortBy as any;

    const sortOrder = searchParams.get('sortOrder');
    if (sortOrder) pagination.sortOrder = sortOrder as any;

    // Validate the search request
    const validationResult = searchPropertySchema.safeParse({
      query,
      filters,
      pagination,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid search parameters',
            details: validationResult.error.issues,
          },
        },
        { status: 400 }
      );
    }

    // Perform search
    const result = await PropertyModel.search(
      validationResult.data.query,
      validationResult.data.filters || {},
      validationResult.data.pagination || {}
    );

    // Log search analytics (optional - for future enhancement)
    // You could track search queries here

    return NextResponse.json(result);

  } catch (error) {
    console.error('Property search error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while searching properties',
        },
      },
      { status: 500 }
    );
  }
}