import { NextRequest, NextResponse } from 'next/server';
import { forgotPasswordSchema, generateResetToken } from '@/lib/auth';
import { UserModel } from '@/lib/models/user';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = forgotPasswordSchema.safeParse(body);
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

    const { email } = validationResult.data;

    // Find user by email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.',
      });
    }

    // Generate reset token
    const resetToken = generateResetToken();

    // In a real application, you would:
    // 1. Store the reset token in the database with expiration
    // 2. Send an email with the reset link containing the token
    // For now, we'll just return the token for development purposes

    return NextResponse.json({
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent.',
      resetToken, // Remove this in production - only for development
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while processing your request',
        },
      },
      { status: 500 }
    );
  }
}