import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database';

const loanApplicationSchema = z.object({
  bank_id: z.number().int().positive(),
  property_id: z.number().int().positive().optional(),
  loan_amount: z.number().positive(),
  documents: z.array(z.any()).optional(), // array of document objects
});

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
    const body = await request.json();

    // Validate input
    const validationResult = loanApplicationSchema.safeParse(body);
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

    const { bank_id, property_id, loan_amount, documents } = validationResult.data;

    // Create loan application
    const loanApplication = await prisma.loanApplication.create({
      data: {
        user_id: userIdNum,
        bank_id,
        property_id,
        loan_amount,
        status: 'draft',
        documents: documents || [],
      },
    });

    return NextResponse.json({
      application: loanApplication,
      message: 'Loan application submitted successfully',
    });
  } catch (error) {
    console.error('Loan application error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while submitting the application',
        },
      },
      { status: 500 }
    );
  }
}