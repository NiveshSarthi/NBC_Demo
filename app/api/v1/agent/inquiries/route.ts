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
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {
      property: {
        created_by: agentId
      }
    };

    if (status !== 'all') {
      where.status = status;
    }

    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        include: {
          property: {
            select: {
              id: true,
              title: true,
              price: true,
              rent_amount: true,
              listing_type: true,
              city: true,
              images: {
                where: { is_primary: true },
                take: 1
              }
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.inquiry.count({ where })
    ]);

    const transformedInquiries = inquiries.map(inquiry => ({
      id: inquiry.id,
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
      message: inquiry.message,
      inquiryType: inquiry.inquiry_type,
      status: inquiry.status,
      response: inquiry.response,
      respondedAt: inquiry.responded_at,
      createdAt: inquiry.created_at,
      property: {
        id: inquiry.property.id,
        title: inquiry.property.title,
        price: inquiry.property.price,
        rentAmount: inquiry.property.rent_amount,
        listingType: inquiry.property.listing_type,
        city: inquiry.property.city,
        image: inquiry.property.images[0]?.image_url
      }
    }));

    return NextResponse.json({
      inquiries: transformedInquiries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Agent inquiries error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch inquiries' } },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const body = await request.json();
    const { inquiryId, response, status } = body;

    // Verify the inquiry belongs to agent's property
    const inquiry = await prisma.inquiry.findFirst({
      where: {
        id: inquiryId,
        property: {
          created_by: agentId
        }
      }
    });

    if (!inquiry) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Inquiry not found or not authorized' } },
        { status: 404 }
      );
    }

    const updateData: any = {
      responded_at: new Date()
    };

    if (response !== undefined) {
      updateData.response = response;
      updateData.responded_by = agentId;
    }

    if (status) {
      updateData.status = status;
    }

    const updatedInquiry = await prisma.inquiry.update({
      where: { id: inquiryId },
      data: updateData,
      include: {
        property: {
          select: {
            id: true,
            title: true,
            city: true
          }
        }
      }
    });

    return NextResponse.json({
      inquiry: {
        id: updatedInquiry.id,
        status: updatedInquiry.status,
        response: updatedInquiry.response,
        respondedAt: updatedInquiry.responded_at
      }
    });
  } catch (error) {
    console.error('Update inquiry error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update inquiry' } },
      { status: 500 }
    );
  }
}