import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from middleware
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId || userRole !== 'agent') {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Agent access required' } },
        { status: 401 }
      );
    }

    const agentId = parseInt(userId, 10);
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d'; // 7d, 30d, 90d, 1y

    // Parse period
    let days = 30;
    switch (period) {
      case '7d': days = 7; break;
      case '30d': days = 30; break;
      case '90d': days = 90; break;
      case '1y': days = 365; break;
    }

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get agent's properties metrics
    const properties = await prisma.property.findMany({
      where: {
        created_by: agentId,
        status: 'active'
      },
      select: {
        id: true,
        title: true,
        price: true,
        rent_amount: true,
        listing_type: true,
        views_count: true,
        inquiries_count: true,
        created_at: true
      }
    });

    // Get analytics data for the period
    const analytics = await prisma.analytic.findMany({
      where: {
        property: {
          created_by: agentId
        },
        timestamp: {
          gte: startDate
        }
      },
      select: {
        event_type: true,
        timestamp: true
      }
    });

    // Get inquiry response metrics
    const inquiries = await prisma.inquiry.findMany({
      where: {
        property: {
          created_by: agentId
        },
        created_at: {
          gte: startDate
        }
      },
      select: {
        status: true,
        responded_at: true,
        created_at: true
      }
    });

    // Calculate metrics
    const totalProperties = properties.length;
    const totalViews = properties.reduce((sum, p) => sum + p.views_count, 0);
    const totalInquiries = properties.reduce((sum, p) => sum + p.inquiries_count, 0);

    // Views by day
    const viewsByDay = analytics
      .filter(a => a.event_type === 'view')
      .reduce((acc, view) => {
        const date = view.timestamp.toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    // Inquiries by day
    const inquiriesByDay = analytics
      .filter(a => a.event_type === 'inquiry')
      .reduce((acc, inquiry) => {
        const date = inquiry.timestamp.toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    // Response time metrics
    const respondedInquiries = inquiries.filter(i => i.responded_at && i.status === 'responded');
    const averageResponseTime = respondedInquiries.length > 0
      ? respondedInquiries.reduce((sum, inquiry) => {
          const responseTime = inquiry.responded_at!.getTime() - inquiry.created_at.getTime();
          return sum + responseTime;
        }, 0) / respondedInquiries.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    // Conversion metrics
    const salesClosed = await prisma.property.count({
      where: {
        created_by: agentId,
        status: 'sold',
        updated_at: {
          gte: startDate
        }
      }
    });

    const conversionRate = totalInquiries > 0 ? (salesClosed / totalInquiries) * 100 : 0;

    // Revenue metrics
    const revenue = properties
      .filter(p => p.listing_type === 'sale')
      .reduce((sum, p) => sum + Number(p.price || 0), 0) * 0.02; // 2% commission

    // Top performing properties
    const topProperties = properties
      .map(p => ({
        id: p.id,
        title: p.title || 'Untitled',
        views: p.views_count,
        inquiries: p.inquiries_count,
        value: Number(p.price || p.rent_amount || 0)
      }))
      .sort((a, b) => b.inquiries - a.inquiries)
      .slice(0, 5);

    // Monthly trends (last 6 months)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i, 1);
      monthStart.setHours(0, 0, 0, 0);

      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1, 0);
      monthEnd.setHours(23, 59, 59, 999);

      const monthViews = analytics.filter(a =>
        a.event_type === 'view' &&
        a.timestamp >= monthStart &&
        a.timestamp <= monthEnd
      ).length;

      const monthInquiries = analytics.filter(a =>
        a.event_type === 'inquiry' &&
        a.timestamp >= monthStart &&
        a.timestamp <= monthEnd
      ).length;

      monthlyTrends.push({
        month: monthStart.toLocaleString('default', { month: 'short', year: 'numeric' }),
        views: monthViews,
        inquiries: monthInquiries
      });
    }

    return NextResponse.json({
      period,
      overview: {
        totalProperties,
        totalViews,
        totalInquiries,
        averageResponseTime: Number(averageResponseTime.toFixed(1)),
        conversionRate: Number(conversionRate.toFixed(2)),
        revenue: Number(revenue.toFixed(0))
      },
      trends: {
        viewsByDay: Object.entries(viewsByDay).map(([date, count]) => ({ date, count })),
        inquiriesByDay: Object.entries(inquiriesByDay).map(([date, count]) => ({ date, count })),
        monthlyTrends
      },
      topProperties,
      responseMetrics: {
        total: inquiries.length,
        responded: respondedInquiries.length,
        pending: inquiries.filter(i => i.status === 'new').length,
        averageResponseTime: Number(averageResponseTime.toFixed(1))
      }
    });
  } catch (error) {
    console.error('Performance metrics error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch performance metrics' } },
      { status: 500 }
    );
  }
}