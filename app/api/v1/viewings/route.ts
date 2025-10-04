import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

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
    const { property_id, scheduled_at, notes } = body;

    // Validate input
    if (!property_id || !scheduled_at) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Property ID and scheduled time are required' } },
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

    // Check if user already has a viewing scheduled for this property
    const existingViewing = await prisma.viewingScheduler.findFirst({
      where: {
        user_id: parseInt(userId),
        property_id: property_id,
        status: { in: ['scheduled', 'confirmed'] },
      },
    });

    if (existingViewing) {
      return NextResponse.json(
        { error: { code: 'DUPLICATE_VIEWING', message: 'You already have a viewing scheduled for this property' } },
        { status: 409 }
      );
    }

    // Create viewing
    const viewing = await prisma.viewingScheduler.create({
      data: {
        user_id: parseInt(userId),
        property_id: property_id,
        scheduled_at: new Date(scheduled_at),
        notes: notes || null,
      },
      include: {
        property: {
          select: {
            title: true,
            address: true,
            city: true,
          },
        },
      },
    });

    return NextResponse.json({
      viewing,
      message: 'Viewing scheduled successfully',
    });

  } catch (error) {
    console.error('Viewing creation error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while scheduling the viewing',
        },
      },
      { status: 500 }
    );
  }
}