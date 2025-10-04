import { NextRequest, NextResponse } from 'next/server';
import { refreshTokenSchema, verifyRefreshToken, generateAccessToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = refreshTokenSchema.safeParse(body);
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

    const { refreshToken } = validationResult.data;

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_REFRESH_TOKEN',
            message: 'Invalid or expired refresh token',
          },
        },
        { status: 401 }
      );
    }

    // Generate new access token
    const newToken = generateAccessToken({
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    });

    return NextResponse.json({
      token: newToken,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred during token refresh',
        },
      },
      { status: 500 }
    );
  }
}