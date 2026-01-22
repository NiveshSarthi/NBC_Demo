import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyAccessToken } from '@/lib/auth';

// Get RERA compliance records for verification
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
    const status = searchParams.get('status'); // approved, pending, not_registered
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    let where: any = {};

    if (status) {
      where.approval_status = status;
    }

    if (search) {
      where.OR = [
        { registration_number: { contains: search, mode: 'insensitive' } },
        { property: { title: { contains: search, mode: 'insensitive' } } },
        { property: { creator: { first_name: { contains: search, mode: 'insensitive' } } } },
        { property: { creator: { last_name: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    const [reraRecords, total] = await Promise.all([
      prisma.reraCompliance.findMany({
        where,
        include: {
          property: {
            select: {
              id: true,
              title: true,
              address: true,
              city: true,
              rera_registered: true,
              creator: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  email: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.reraCompliance.count({ where }),
    ]);

    return NextResponse.json({
      reraRecords,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching RERA records:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update RERA compliance status
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
    const { id, approval_status, registration_number, complaint_history, project_timeline, approved_building_plans } = body;

    if (!id) {
      return NextResponse.json({ error: 'RERA record ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (approval_status !== undefined) updateData.approval_status = approval_status;
    if (registration_number !== undefined) updateData.registration_number = registration_number;
    if (complaint_history !== undefined) updateData.complaint_history = complaint_history;
    if (project_timeline !== undefined) updateData.project_timeline = project_timeline;
    if (approved_building_plans !== undefined) updateData.approved_building_plans = approved_building_plans;

    const reraRecord = await prisma.reraCompliance.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        property: {
          select: {
            id: true,
            title: true,
            rera_registered: true,
          },
        },
      },
    });

    // If approving, update the property's rera_registered status
    if (approval_status === 'approved') {
      await prisma.property.update({
        where: { id: reraRecord.property_id },
        data: { rera_registered: true },
      });
    }

    return NextResponse.json({
      reraRecord,
      message: 'RERA compliance updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating RERA compliance:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'RERA record not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}