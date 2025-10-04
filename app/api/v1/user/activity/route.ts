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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get recent activity from analytics
    const activities = await prisma.analytic.findMany({
      where: {
        user_id: parseInt(userId),
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            price: true,
            city: true,
            state: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });

    // Transform the data to match dashboard expectations
    const transformedActivities = activities.map(activity => {
      const timeAgo = getTimeAgo(activity.timestamp);

      let action = '';
      let icon = '';
      let link = '';

      switch (activity.event_type) {
        case 'view':
          action = `Viewed ${activity.property?.title || 'a property'}`;
          icon = 'eye';
          link = `/properties/${activity.property?.id}`;
          break;
        case 'save':
          action = `Saved ${activity.property?.title || 'a property'}`;
          icon = 'heart';
          link = `/properties/${activity.property?.id}`;
          break;
        case 'inquiry':
          action = `Made inquiry about ${activity.property?.title || 'a property'}`;
          icon = 'message-square';
          link = `/properties/${activity.property?.id}`;
          break;
        case 'share':
          action = `Shared ${activity.property?.title || 'a property'}`;
          icon = 'share';
          link = `/properties/${activity.property?.id}`;
          break;
        default:
          action = `${activity.event_type} activity`;
          icon = 'activity';
          link = activity.property?.id ? `/properties/${activity.property?.id}` : '';
      }

      return {
        id: activity.id,
        action,
        icon,
        link,
        timeAgo,
        timestamp: activity.timestamp,
      };
    });

    return NextResponse.json({
      activities: transformedActivities,
      total: transformedActivities.length,
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching user activity',
        },
      },
      { status: 500 }
    );
  }
}

// Helper function to format time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return date.toLocaleDateString();
}