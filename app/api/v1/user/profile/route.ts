import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/lib/models/user';
import { z } from 'zod';

const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  preferences: z.any().optional(),
  investmentBudget: z.number().positive().optional(),
  preferredLocations: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
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
    const profile = await UserModel.getProfile(userIdNum);

    if (!profile) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    // Transform snake_case to camelCase for response
    const transformedProfile = {
      id: profile.id,
      email: profile.email,
      firstName: profile.first_name,
      lastName: profile.last_name,
      phone: profile.phone,
      role: profile.role,
      avatarUrl: profile.avatar_url,
      preferences: profile.preferences,
      emailVerified: profile.email_verified,
      phoneVerified: profile.phone_verified,
      investmentBudget: profile.investment_budget,
      preferredLocations: profile.preferred_locations,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
      lastLogin: profile.last_login,
      _count: profile._count,
    };

    return NextResponse.json({ user: transformedProfile });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching profile',
        },
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const validationResult = updateProfileSchema.safeParse(body);
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

    const updateData = validationResult.data;

    // Update user profile
    const updatedUser = await UserModel.update(userIdNum, updateData);

    // Transform response
    const transformedUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      phone: updatedUser.phone,
      role: updatedUser.role,
      avatarUrl: updatedUser.avatar_url,
      preferences: updatedUser.preferences,
      emailVerified: updatedUser.email_verified,
      phoneVerified: updatedUser.phone_verified,
      investmentBudget: updatedUser.investment_budget,
      preferredLocations: updatedUser.preferred_locations,
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.updated_at,
      lastLogin: updatedUser.last_login,
    };

    return NextResponse.json({
      user: transformedUser,
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while updating profile',
        },
      },
      { status: 500 }
    );
  }
}