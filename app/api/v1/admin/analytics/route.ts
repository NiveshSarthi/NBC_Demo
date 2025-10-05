import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAccessToken } from '@/lib/auth';

const prisma = new PrismaClient();

// Get comprehensive analytics data
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d'; // 7d, 30d, 90d, 1y

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get basic counts
    const [
      totalUsers,
      totalProperties,
      totalInquiries,
      totalPayments,
      totalRevenue,
      usersByRole,
      recentUsers,
      propertyStatusCounts,
      inquiryStatusCounts,
      paymentsByType,
      topProperties,
      leadsBySource,
      conversionRates,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Total properties
      prisma.property.count(),

      // Total inquiries
      prisma.inquiry.count({
        where: { created_at: { gte: startDate } },
      }),

      // Total payments
      prisma.payment.count({
        where: { created_at: { gte: startDate } },
      }),

      // Total revenue
      prisma.payment.aggregate({
        where: {
          status: 'completed',
          created_at: { gte: startDate },
        },
        _sum: { amount: true },
      }),

      // Users by role
      prisma.user.groupBy({
        by: ['role'],
        _count: { role: true },
      }),

      // Recent users (last 30 days)
      prisma.user.count({
        where: { created_at: { gte: startDate } },
      }),

      // Property status counts
      prisma.property.groupBy({
        by: ['status'],
        _count: { status: true },
      }),

      // Inquiry status counts
      prisma.inquiry.groupBy({
        by: ['status'],
        _count: { status: true },
        where: { created_at: { gte: startDate } },
      }),

      // Payments by type
      prisma.payment.groupBy({
        by: ['payment_type'],
        _count: { payment_type: true },
        _sum: { amount: true },
        where: {
          status: 'completed',
          created_at: { gte: startDate },
        },
      }),

      // Top properties by views/inquiries
      prisma.property.findMany({
        take: 10,
        select: {
          id: true,
          title: true,
          views_count: true,
          inquiries_count: true,
          price: true,
          status: true,
        },
        orderBy: { views_count: 'desc' },
      }),

      // Leads by source (from analytics events)
      prisma.analytic.groupBy({
        by: ['event_type'],
        _count: { event_type: true },
        where: {
          timestamp: { gte: startDate },
          event_type: { in: ['inquiry', 'save', 'contact'] },
        },
      }),

      // Conversion rates (simplified)
      prisma.analytic.groupBy({
        by: ['event_type'],
        _count: { event_type: true },
        where: { timestamp: { gte: startDate } },
      }),
    ]);

    // Calculate conversion metrics
    const viewCount = conversionRates.find(c => c.event_type === 'view')?._count?.event_type || 0;
    const inquiryCount = conversionRates.find(c => c.event_type === 'inquiry')?._count?.event_type || 0;
    const saveCount = conversionRates.find(c => c.event_type === 'save')?._count?.event_type || 0;
    const contactCount = conversionRates.find(c => c.event_type === 'contact')?._count?.event_type || 0;

    const conversionRate = viewCount > 0 ? ((inquiryCount + contactCount) / viewCount * 100) : 0;

    // Format the response
    const analytics = {
      overview: {
        totalUsers,
        totalProperties,
        totalInquiries,
        totalPayments,
        totalRevenue: totalRevenue._sum?.amount || 0,
        recentUsers,
        conversionRate: Math.round(conversionRate * 100) / 100,
      },
      usersByRole: usersByRole.reduce((acc, curr) => {
        acc[curr.role] = curr._count.role;
        return acc;
      }, {} as Record<string, number>),
      propertyStatus: propertyStatusCounts.reduce((acc, curr) => {
        acc[curr.status] = curr._count.status;
        return acc;
      }, {} as Record<string, number>),
      inquiryStatus: inquiryStatusCounts.reduce((acc, curr) => {
        acc[curr.status] = curr._count.status;
        return acc;
      }, {} as Record<string, number>),
      paymentsByType: paymentsByType.reduce((acc, curr) => {
        acc[curr.payment_type] = {
          count: curr._count.payment_type,
          revenue: curr._sum.amount || 0,
        };
        return acc;
      }, {} as Record<string, { count: number; revenue: number }>),
      topProperties,
      leadsBySource: leadsBySource.reduce((acc, curr) => {
        acc[curr.event_type] = curr._count.event_type;
        return acc;
      }, {} as Record<string, number>),
      period,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}