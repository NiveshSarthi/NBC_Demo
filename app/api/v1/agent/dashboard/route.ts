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

    // Get current month date range
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get agent's properties
    const agentProperties = await prisma.property.findMany({
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
        status: true,
        inquiries_count: true,
        views_count: true,
        created_at: true,
        city: true
      }
    });

    // Get inquiries for agent's properties this month
    const monthlyInquiries = await prisma.inquiry.count({
      where: {
        property: {
          created_by: agentId
        },
        created_at: {
          gte: currentMonthStart,
          lte: currentMonthEnd
        }
      }
    });

    // Get total inquiries
    const totalInquiries = await prisma.inquiry.count({
      where: {
        property: {
          created_by: agentId
        }
      }
    });

    // Get scheduled visits (assuming inquiries with visit type)
    const scheduledVisits = await prisma.inquiry.count({
      where: {
        property: {
          created_by: agentId
        },
        inquiry_type: 'visit',
        status: { in: ['new', 'responded'] }
      }
    });

    // Calculate commission (mock calculation - in real app, this would be more complex)
    const commission = agentProperties.reduce((total, property) => {
      const propertyValue = property.listing_type === 'sale'
        ? Number(property.price || 0)
        : Number(property.rent_amount || 0);
      return total + (propertyValue * 0.02); // 2% commission rate
    }, 0);

    // Get recent clients (users who made inquiries)
    const recentClients = await prisma.inquiry.findMany({
      where: {
        property: {
          created_by: agentId
        }
      },
      select: {
        name: true,
        email: true,
        phone: true,
        created_at: true,
        inquiry_type: true,
        status: true,
        property: {
          select: {
            title: true,
            price: true,
            city: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 10
    });

    const dashboardData = {
      stats: {
        totalClients: new Set(recentClients.map(c => c.email)).size,
        activeListings: agentProperties.length,
        propertiesSold: agentProperties.filter(p => p.status === 'sold').length,
        totalCommission: commission,
        inquiriesThisMonth: monthlyInquiries,
        scheduledVisits: scheduledVisits
      },
      recentClients: recentClients.map(client => ({
        id: `${client.email}-${client.created_at.getTime()}`, // Simple ID generation
        name: client.name,
        email: client.email,
        phone: client.phone,
        budget: client.property?.price || 0,
        preferredLocation: client.property?.city || 'Unknown',
        lastContact: client.created_at.toISOString(),
        status: client.status === 'new' ? 'active' : client.status === 'responded' ? 'inactive' : 'closed'
      })),
      listings: agentProperties.map(property => ({
        id: property.id,
        propertyTitle: property.title || 'Untitled Property',
        price: property.price || property.rent_amount || 0,
        location: property.city || 'Unknown',
        status: property.status,
        inquiries: property.inquiries_count,
        views: property.views_count
      }))
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Agent dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}