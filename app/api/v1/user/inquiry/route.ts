import { NextRequest, NextResponse } from 'next/server';
import { createInquirySchema } from '@/lib/auth';
import { PropertyModel } from '@/lib/models/property';
import { prisma } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    // Get user ID from middleware (optional for anonymous)
    const userId = request.headers.get('x-user-id');
    const isAnonymous = !userId;

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

    // Initialize messages array with the initial message
    const initialMessage = {
      sender_id: isAnonymous ? null : parseInt(userId),
      content: message,
      timestamp: new Date().toISOString(),
      is_from_user: true,
    };

    // Create inquiry
    const inquiry = await prisma.inquiry.create({
      data: {
        property_id: propertyId,
        user_id: isAnonymous ? null : parseInt(userId),
        name: isAnonymous ? null : (name ?? null),
        email: isAnonymous ? null : (email ?? null),
        phone: isAnonymous ? null : (phone ?? null),
        message,
        inquiry_type: inquiryType,
        is_anonymous: isAnonymous,
        messages: [initialMessage],
      } as any,
    });

    // Track inquiry analytics (skip user_id for anonymous)
    if (!isAnonymous) {
      await PropertyModel.trackEvent(
        propertyId,
        'inquiry',
        parseInt(userId)
      );
    }

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