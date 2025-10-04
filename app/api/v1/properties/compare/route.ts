import { NextRequest, NextResponse } from 'next/server';
import { PropertyModel } from '@/lib/models/property';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');

    if (!idsParam) {
      return NextResponse.json(
        { error: { code: 'MISSING_IDS', message: 'Property IDs are required' } },
        { status: 400 }
      );
    }

    const ids = idsParam.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

    if (ids.length === 0) {
      return NextResponse.json(
        { error: { code: 'INVALID_IDS', message: 'Valid property IDs are required' } },
        { status: 400 }
      );
    }

    if (ids.length > 4) {
      return NextResponse.json(
        { error: { code: 'TOO_MANY_IDS', message: 'You can compare up to 4 properties at a time' } },
        { status: 400 }
      );
    }

    // Fetch properties by IDs
    const properties = [];
    for (const id of ids) {
      try {
        const property = await PropertyModel.getPropertyDetails(id);
        if (property) {
          properties.push(property);
        }
      } catch (error) {
        // Skip invalid properties
        console.warn(`Failed to fetch property ${id}:`, error);
      }
    }

    if (properties.length === 0) {
      return NextResponse.json(
        { error: { code: 'NO_PROPERTIES_FOUND', message: 'No valid properties found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ properties });

  } catch (error) {
    console.error('Property comparison fetch error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching properties for comparison',
        },
      },
      { status: 500 }
    );
  }
}