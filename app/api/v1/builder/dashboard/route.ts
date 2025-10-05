import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { UserRole } from '@prisma/client';

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

    // Get user with role check
    const user = await prisma.user.findUnique({
      where: { id: userIdNum }
    });

    if (!user || user.role !== UserRole.builder) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Access denied. Builder role required.' } },
        { status: 403 }
      );
    }

    // Get builder record
    const builder = await prisma.builder.findFirst({
      where: { id: userIdNum }
    });

    if (!builder) {
      return NextResponse.json(
        { error: { code: 'BUILDER_NOT_FOUND', message: 'Builder profile not found' } },
        { status: 404 }
      );
    }

    // Get current month date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get project statistics
    const [totalProjects, activeProjects, completedProjects] = await Promise.all([
      prisma.property.count({
        where: { builder_id: builder.id }
      }),
      prisma.property.count({
        where: {
          builder_id: builder.id,
          status: { in: ['active', 'rented'] }
        }
      }),
      prisma.property.count({
        where: {
          builder_id: builder.id,
          status: 'sold'
        }
      })
    ]);

    // Get revenue from sold properties (simplified calculation)
    const soldProperties = await prisma.property.findMany({
      where: {
        builder_id: builder.id,
        status: 'sold'
      },
      select: { price: true }
    });

    const totalRevenue = soldProperties.reduce((sum, prop) => sum + Number(prop.price || 0), 0);

    // Get inquiries this month
    const inquiriesThisMonth = await prisma.inquiry.count({
      where: {
        property: {
          builder_id: builder.id
        },
        created_at: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    });

    // Get units sold (properties marked as sold)
    const propertiesSold = soldProperties.length;

    // Get lead statistics
    const leadsThisMonth = await prisma.lead.count({
      where: {
        builder_id: builder.id,
        created_at: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    });

    const activeLeads = await prisma.lead.count({
      where: {
        builder_id: builder.id,
        status: { in: ['new', 'contacted', 'qualified', 'proposal_sent', 'negotiation'] }
      }
    });

    // Get campaign statistics
    const activeCampaigns = await prisma.campaign.count({
      where: {
        builder_id: builder.id,
        status: 'active'
      }
    });

    const campaignMetrics = await prisma.campaign.findMany({
      where: { builder_id: builder.id },
      select: { metrics: true }
    });

    // Calculate total campaign reach (simplified)
    const totalCampaignReach = campaignMetrics.reduce((sum, campaign) => {
      const metrics = campaign.metrics as any;
      return sum + (metrics?.reach || 0);
    }, 0);

    return NextResponse.json({
      stats: {
        totalProjects,
        activeProjects,
        completedProjects,
        totalRevenue,
        inquiriesThisMonth,
        propertiesSold,
        leadsThisMonth,
        activeLeads,
        activeCampaigns,
        totalCampaignReach
      },
      builder: {
        name: builder.name,
        ratings: builder.ratings,
        deliveryTrackRecord: builder.delivery_track_record
      }
    });

  } catch (error) {
    console.error('Error fetching builder dashboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}