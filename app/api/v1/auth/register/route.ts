import { NextRequest, NextResponse } from 'next/server';
import { registerSchema, hashPassword, generateEmailVerificationToken } from '@/lib/auth';
import { UserModel } from '@/lib/models/user';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = registerSchema.safeParse(body);
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

    const { email, password, firstName, lastName, phone } = validationResult.data;

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        {
          error: {
            code: 'USER_EXISTS',
            message: 'User with this email already exists',
          },
        },
        { status: 409 }
      );
    }

    // Create user
    const user = await UserModel.create({
      email,
      password,
      firstName,
      lastName,
      phone,
    });

    // Generate email verification token (placeholder - would send email in production)
    const emailVerificationToken = generateEmailVerificationToken(user.id);

    // Return user data (exclude sensitive info)
    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      role: user.role,
      emailVerified: user.email_verified,
      createdAt: user.created_at,
    };

    return NextResponse.json({
      user: userResponse,
      emailVerificationToken, // In production, this would be sent via email
      message: 'User registered successfully. Please check your email to verify your account.',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred during registration',
        },
      },
      { status: 500 }
    );
  }
}