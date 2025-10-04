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

    const viewings = await prisma.viewingScheduler.findMany({
      where: { user_id: parseInt(userId) },
      include: {
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
    console.error('User viewings fetch error:', error);
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