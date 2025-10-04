import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const propertyId = parseInt(id);
    if (isNaN(propertyId)) {
      return NextResponse.json(
        { error: { code: 'INVALID_ID', message: 'Invalid property ID' } },
        { status: 400 }
      );
    }

    const reviews = await prisma.propertyReview.findMany({
      where: { property_id: propertyId },
      include: {
        user: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json(reviews);

  } catch (error) {
    console.error('Reviews fetch error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching reviews',
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const propertyId = parseInt(id);
    if (isNaN(propertyId)) {
      return NextResponse.json(
        { error: { code: 'INVALID_ID', message: 'Invalid property ID' } },
        { status: 400 }
      );
    }

    // Get user ID from middleware
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { rating, review_text } = body;

    // Validate input
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Rating must be between 1 and 5' } },
        { status: 400 }
      );
    }

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Property not found' } },
        { status: 404 }
      );
    }

    // Check if user already reviewed this property
    const existingReview = await prisma.propertyReview.findFirst({
      where: {
        user_id: parseInt(userId),
        property_id: propertyId,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: { code: 'DUPLICATE_REVIEW', message: 'You have already reviewed this property' } },
        { status: 409 }
      );
    }

    // Create review
    const review = await prisma.propertyReview.create({
      data: {
        user_id: parseInt(userId),
        property_id: propertyId,
        rating,
        review_text: review_text || null,
      },
      include: {
        user: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
      },
    });

    return NextResponse.json({
      review,
      message: 'Review submitted successfully',
    });

  } catch (error) {
    console.error('Review creation error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while creating the review',
        },
      },
      { status: 500 }
    );
  }
}