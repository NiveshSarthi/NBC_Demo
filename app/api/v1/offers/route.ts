import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const now = new Date();

    const offers = await prisma.offer.findMany({
      where: {
        is_active: true,
        start_date: {
          lte: now,
        },
        OR: [
          {
            end_date: null,
          },
          {
            end_date: {
              gte: now,
            },
          },
        ],
      },
      orderBy: {
        priority: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: offers,
    });

  } catch (error) {
    console.error('Offers fetch error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching offers',
        },
      },
      { status: 500 }
    );
  }
}