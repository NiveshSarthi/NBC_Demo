import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Get user ID from middleware
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } },
        { status: 401 }
      );
    }

    const userIdNum = parseInt(userId, 10);
    const applicationId = parseInt(id, 10);

    if (isNaN(applicationId)) {
      return NextResponse.json(
        { error: { code: 'INVALID_ID', message: 'Invalid application ID' } },
        { status: 400 }
      );
    }

    // Fetch loan application with relations
    const application = await prisma.loanApplication.findFirst({
      where: {
        id: applicationId,
        user_id: userIdNum, // Ensure user owns the application
      },
      include: {
        bank: true,
        property: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Loan application not found' } },
        { status: 404 }
      );
    }

    // Transform response
    const transformedApplication = {
      id: application.id,
      userId: application.user_id,
      propertyId: application.property_id,
      bankId: application.bank_id,
      loanAmount: application.loan_amount,
      status: application.status,
      documents: application.documents,
      createdAt: application.created_at,
      updatedAt: application.updated_at,
      bank: {
        id: application.bank.id,
        name: application.bank.name,
        logoUrl: application.bank.logo_url,
        contactInfo: application.bank.contact_info,
      },
      property: application.property ? {
        id: application.property.id,
        title: application.property.title,
        address: application.property.address,
      } : null,
    };

    return NextResponse.json({ application: transformedApplication });
  } catch (error) {
    console.error('Get loan application error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching the application',
        },
      },
      { status: 500 }
    );
  }
}