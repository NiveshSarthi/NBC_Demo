import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { UserRole, LeadStatus } from '@prisma/client';
import { z } from 'zod';

const createLeadSchema = z.object({
  propertyId: z.number().optional(),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10),
  status: z.nativeEnum(LeadStatus).default(LeadStatus.new),
  source: z.enum(['website', 'referral', 'social_media', 'advertisement', 'cold_call', 'email_campaign', 'other']).default('website'),
  budgetMin: z.number().positive().optional(),
  budgetMax: z.number().positive().optional(),
  preferredLocation: z.string().optional(),
  requirements: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

const updateLeadSchema = createLeadSchema.partial().extend({
  assignedTo: z.number().optional(),
  nextFollowup: z.string().datetime().optional(),
});

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
    const source = searchParams.get('source');
    const assignedTo = searchParams.get('assignedTo');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where clause
    const where: any = {
      builder_id: userIdNum
    };

    if (status) {
      where.status = status;
    }

    if (source) {
      where.source = source;
    }

    if (assignedTo) {
      where.assigned_to = parseInt(assignedTo);
    }

    // Get leads with pagination
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          property: {
            select: {
              id: true,
              title: true,
              city: true,
              price: true
            }
          },
          assignee: {
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
      prisma.lead.count({ where })
    ]);

    // Transform response
    const transformedLeads = leads.map(lead => ({
      id: lead.id,
      property: lead.property ? {
        id: lead.property.id,
        title: lead.property.title,
        city: lead.property.city,
        price: lead.property.price
      } : null,
      userId: lead.user_id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      status: lead.status,
      source: lead.source,
      budgetMin: lead.budget_min,
      budgetMax: lead.budget_max,
      preferredLocation: lead.preferred_location,
      requirements: lead.requirements,
      notes: lead.notes,
      lastContacted: lead.last_contacted,
      nextFollowup: lead.next_followup,
      assignedTo: lead.assignee ? {
        id: lead.assignee.id,
        name: `${lead.assignee.first_name} ${lead.assignee.last_name}`.trim()
      } : null,
      tags: lead.tags,
      createdAt: lead.created_at,
      updatedAt: lead.updated_at
    }));

    return NextResponse.json({
      leads: transformedLeads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching builder leads:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch leads' } },
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
    const validationResult = createLeadSchema.safeParse(body);
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

    const leadData = validationResult.data;

    // If propertyId is provided, verify it belongs to the builder
    if (leadData.propertyId) {
      const property = await prisma.property.findFirst({
        where: {
          id: leadData.propertyId,
          builder_id: userIdNum
        }
      });

      if (!property) {
        return NextResponse.json(
          { error: { code: 'INVALID_PROPERTY', message: 'Property not found or access denied' } },
          { status: 400 }
        );
      }
    }

    // Create lead
    const lead = await prisma.lead.create({
      data: {
        ...leadData,
        builder_id: userIdNum,
        budget_min: leadData.budgetMin,
        budget_max: leadData.budgetMax,
        preferred_location: leadData.preferredLocation,
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            city: true,
            price: true
          }
        },
        assignee: {
          select: {
            id: true,
            first_name: true,
            last_name: true
          }
        }
      }
    });

    return NextResponse.json({
      lead: {
        id: lead.id,
        property: lead.property ? {
          id: lead.property.id,
          title: lead.property.title,
          city: lead.property.city,
          price: lead.property.price
        } : null,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        status: lead.status,
        source: lead.source,
        budgetMin: lead.budget_min,
        budgetMax: lead.budget_max,
        preferredLocation: lead.preferred_location,
        requirements: lead.requirements,
        notes: lead.notes,
        assignedTo: lead.assignee ? {
          id: lead.assignee.id,
          name: `${lead.assignee.first_name} ${lead.assignee.last_name}`.trim()
        } : null,
        tags: lead.tags,
        createdAt: lead.created_at
      },
      success: true,
      message: 'Lead created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating builder lead:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create lead' } },
      { status: 500 }
    );
  }
}