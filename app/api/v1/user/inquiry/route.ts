import { NextRequest, NextResponse } from 'next/server';
import { createInquirySchema } from '@/lib/auth';
import { PropertyModel } from '@/lib/models/property';
import { prisma } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    // Get user ID from middleware
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validationResult = createInquirySchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid inquiry data',
            details: validationResult.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const { propertyId, name, email, phone, message, inquiryType } = validationResult.data;

    // Check if property exists
    const property = await PropertyModel.findById(propertyId);
    if (!property) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Property not found' } },
        { status: 404 }
      );
    }

    // Create inquiry
    const inquiry = await prisma.inquiry.create({
      data: {
        property_id: propertyId,
        user_id: parseInt(userId),
        name,
        email,
        phone,
        message,
        inquiry_type: inquiryType,
      },
    });

    // Track inquiry analytics
    await PropertyModel.trackEvent(
      propertyId,
      'inquiry',
      parseInt(userId)
    );

    return NextResponse.json({
      inquiry: {
        id: inquiry.id,
        propertyId: inquiry.property_id,
        name: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone,
        message: inquiry.message,
        inquiryType: inquiry.inquiry_type,
        status: inquiry.status,
        createdAt: inquiry.created_at,
      },
      message: 'Inquiry submitted successfully',
    });

  } catch (error) {
    console.error('Inquiry creation error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while submitting the inquiry',
        },
      },
      { status: 500 }
    );
  }
}