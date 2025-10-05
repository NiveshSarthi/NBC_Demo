import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { UserRole, CampaignStatus, CampaignType } from '@prisma/client';
import { z } from 'zod';

const createCampaignSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.nativeEnum(CampaignType),
  status: z.nativeEnum(CampaignStatus).default(CampaignStatus.draft),
  targetAudience: z.any().optional(), // JSON object for targeting filters
  budget: z.number().positive().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  content: z.any().optional(), // JSON object for campaign content
});

const updateCampaignSchema = createCampaignSchema.partial();

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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where clause
    const where: any = {
      builder_id: userIdNum
    };

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    // Get campaigns with pagination
    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              first_name: true,
              last_name: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.campaign.count({ where })
    ]);

    // Transform response
    const transformedCampaigns = campaigns.map(campaign => ({
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      type: campaign.type,
      status: campaign.status,
      targetAudience: campaign.target_audience,
      budget: campaign.budget,
      startDate: campaign.start_date,
      endDate: campaign.end_date,
      content: campaign.content,
      metrics: campaign.metrics,
      createdBy: {
        id: campaign.creator.id,
        name: `${campaign.creator.first_name} ${campaign.creator.last_name}`.trim()
      },
      createdAt: campaign.created_at,
      updatedAt: campaign.updated_at
    }));

    return NextResponse.json({
      campaigns: transformedCampaigns,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching builder campaigns:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch campaigns' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();

    // Validate input
    const validationResult = createCampaignSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: validationResult.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const campaignData = validationResult.data;

    // Create campaign
    const campaign = await prisma.campaign.create({
      data: {
        ...campaignData,
        builder_id: userIdNum,
        created_by: userIdNum,
        target_audience: campaignData.targetAudience,
        start_date: campaignData.startDate ? new Date(campaignData.startDate) : null,
        end_date: campaignData.endDate ? new Date(campaignData.endDate) : null,
      },
      include: {
        creator: {
          select: {
            id: true,
            first_name: true,
            last_name: true
          }
        }
      }
    });

    return NextResponse.json({
      campaign: {
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        type: campaign.type,
        status: campaign.status,
        targetAudience: campaign.target_audience,
        budget: campaign.budget,
        startDate: campaign.start_date,
        endDate: campaign.end_date,
        content: campaign.content,
        metrics: campaign.metrics,
        createdBy: {
          id: campaign.creator.id,
          name: `${campaign.creator.first_name} ${campaign.creator.last_name}`.trim()
        },
        createdAt: campaign.created_at
      },
      success: true,
      message: 'Campaign created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating builder campaign:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create campaign' } },
      { status: 500 }
    );
  }
}