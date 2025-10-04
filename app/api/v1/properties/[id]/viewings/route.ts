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

    // Get user ID from middleware (optional - if not provided, return all viewings for the property)
    const userId = request.headers.get('x-user-id');

    const whereClause = userId
      ? { property_id: propertyId, user_id: parseInt(userId) }
      : { property_id: propertyId };

    const viewings = await prisma.viewingScheduler.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
        property: {
          select: {
            title: true,
            address: true,
            city: true,
          },
        },
      },
      orderBy: { scheduled_at: 'asc' },
    });

    return NextResponse.json(viewings);

  } catch (error) {
    console.error('Property viewings fetch error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching viewings',
        },
      },
      { status: 500 }
    );
  }
}