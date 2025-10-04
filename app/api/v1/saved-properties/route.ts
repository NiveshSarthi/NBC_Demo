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

    const savedProperties = await prisma.savedProperty.findMany({
      where: { user_id: parseInt(userId) },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            address: true,
            city: true,
            price: true,
            rent_amount: true,
            price_unit: true,
            listing_type: true,
            property_type: true,
            bedrooms: true,
            bathrooms: true,
            area: true,
            area_unit: true,
            images: {
              select: {
                image_url: true,
                is_primary: true,
              },
              where: { is_primary: true },
              take: 1,
            },
          },
        },
      },
      orderBy: { added_at: 'desc' },
    });

    return NextResponse.json(savedProperties);

  } catch (error) {
    console.error('Saved properties fetch error:', error);
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
    const { property_id, shared_with, is_public } = body;

    // Validate input
    if (!property_id) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Property ID is required' } },
        { status: 400 }
      );
    }

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: property_id },
    });

    if (!property) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Property not found' } },
        { status: 404 }
      );
    }

    // Check if already saved
    const existingSave = await prisma.savedProperty.findFirst({
      where: {
        user_id: parseInt(userId),
        property_id: property_id,
      },
    });

    if (existingSave) {
      return NextResponse.json(
        { error: { code: 'ALREADY_SAVED', message: 'Property already saved to wishlist' } },
        { status: 409 }
      );
    }

    // Save property
    const savedProperty = await prisma.savedProperty.create({
      data: {
        user_id: parseInt(userId),
        property_id: property_id,
        shared_with: shared_with || [],
        is_public: is_public || false,
      },
    });

    return NextResponse.json({
      savedProperty,
      message: 'Property added to wishlist',
    });

  } catch (error) {
    console.error('Saved property creation error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while saving the property',
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
    const propertyId = searchParams.get('property_id');

    if (!propertyId) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Property ID is required' } },
        { status: 400 }
      );
    }

    // Delete saved property
    await prisma.savedProperty.deleteMany({
      where: {
        user_id: parseInt(userId),
        property_id: parseInt(propertyId),
      },
    });

    return NextResponse.json({
      message: 'Property removed from wishlist',
    });

  } catch (error) {
    console.error('Saved property deletion error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while removing the property',
        },
      },
      { status: 500 }
    );
  }
}