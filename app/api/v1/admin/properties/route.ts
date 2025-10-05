import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAccessToken } from '@/lib/auth';

const prisma = new PrismaClient();

// Get properties for admin moderation
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const needsApproval = searchParams.get('needs_approval') === 'true';

    const skip = (page - 1) * limit;

    let where: any = {};

    if (status) {
      where.status = status;
    }

    if (needsApproval) {
      // Properties that need approval (newly created, pending review)
      where.status = 'active'; // Only active properties need approval workflow
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { creator: { first_name: { contains: search, mode: 'insensitive' } } },
        { creator: { last_name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              role: true,
            },
          },
          location: {
            select: {
              id: true,
              name: true,
            },
          },
          reraCompliance: {
            select: {
              id: true,
              approval_status: true,
              registration_number: true,
            },
          },
          _count: {
            select: {
              inquiries: true,
              property_reviews: true,
              saved_properties: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.property.count({ where }),
    ]);

    return NextResponse.json({
      properties,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Approve or reject property
export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { id, action, reason } = body; // action: 'approve', 'reject', 'suspend'

    if (!id || !action) {
      return NextResponse.json({ error: 'Property ID and action are required' }, { status: 400 });
    }

    let statusUpdate: any = {};

    switch (action) {
      case 'approve':
        statusUpdate.status = 'active';
        break;
      case 'reject':
        statusUpdate.status = 'inactive';
        break;
      case 'suspend':
        statusUpdate.status = 'inactive';
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const property = await prisma.property.update({
      where: { id: parseInt(id) },
      data: statusUpdate,
      include: {
        creator: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    });

    // Log the admin action
    await prisma.analytic.create({
      data: {
        property_id: parseInt(id),
        user_id: decoded.id,
        event_type: 'view', // Using 'view' as it's the closest event type for admin actions
        session_id: `admin_action_${action}`,
        ip_address: 'admin',
        user_agent: 'admin_panel',
        referrer_url: `/admin/properties?action=${action}`,
        timestamp: new Date(),
      },
    });

    return NextResponse.json({
      property,
      action,
      message: `Property ${action}d successfully`,
    });
  } catch (error: any) {
    console.error('Error updating property status:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}