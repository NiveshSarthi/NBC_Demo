import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from middleware
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } },
        { status: 401 }
      );
    }

    const userIdNum = parseInt(userId, 10);

    // Get counts in parallel for better performance
    const [
      viewCount,
      savedCount,
      inquiryCount,
      portfolioValue,
    ] = await Promise.all([
      // Total property views by user
      prisma.analytic.count({
        where: {
          user_id: userIdNum,
          event_type: 'view',
        },
      }),

      // Total saved properties
      prisma.analytic.count({
        where: {
          user_id: userIdNum,
          event_type: 'save',
        },
      }),

      // Active inquiries (not responded or closed)
      prisma.inquiry.count({
        where: {
          user_id: userIdNum,
          status: { in: ['new', 'responded'] }, // Exclude closed
        },
      }),

      // Calculate portfolio value (sum of prices of saved properties)
      // For now, we'll use saved properties as portfolio. In future, this could be investment-specific.
      calculatePortfolioValue(userIdNum),
    ]);

    return NextResponse.json({
      stats: {
        propertiesViewed: viewCount,
        savedProperties: savedCount,
        activeInquiries: inquiryCount,
        portfolioValue: portfolioValue,
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching dashboard stats',
        },
      },
      { status: 500 }
    );
  }
}

// Calculate portfolio value based on saved properties
async function calculatePortfolioValue(userId: number): Promise<number> {
  try {
    // Get all saved property IDs
    const savedEvents = await prisma.analytic.findMany({
      where: {
        user_id: userId,
        event_type: 'save',
      },
      select: {
        property_id: true,
      },
      distinct: ['property_id'],
    });

    const propertyIds = savedEvents
      .map(event => event.property_id)
      .filter(Boolean) as number[];

    if (propertyIds.length === 0) {
      return 0;
    }

    // Sum the prices of saved properties
    const result = await prisma.property.aggregate({
      where: {
        id: { in: propertyIds },
        status: 'active',
      },
      _sum: {
        price: true,
      },
    });

    return Number(result._sum.price) || 0;
  } catch (error) {
    console.error('Error calculating portfolio value:', error);
    return 0; // Return 0 on error rather than failing the whole request
  }
}