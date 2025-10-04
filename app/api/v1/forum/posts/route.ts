import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('property_id');

    const whereClause = propertyId ? { property_id: parseInt(propertyId) } : {};

    const posts = await prisma.communityForumPost.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
        property: {
          select: {
            title: true,
            address: true,
            city: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json(posts);

  } catch (error) {
    console.error('Forum posts fetch error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching forum posts',
        },
      },
      { status: 500 }
    );
  }
}

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
    const { title, content, property_id } = body;

    // Validate input
    if (!title || !content) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Title and content are required' } },
        { status: 400 }
      );
    }

    // Check if property exists if property_id is provided
    if (property_id) {
      const property = await prisma.property.findUnique({
        where: { id: property_id },
      });
      if (!property) {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Property not found' } },
          { status: 404 }
        );
      }
    }

    // Create post
    const post = await prisma.communityForumPost.create({
      data: {
        user_id: parseInt(userId),
        title,
        content,
        property_id: property_id || null,
      },
      include: {
        user: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
        property: {
          select: {
            title: true,
            address: true,
            city: true,
          },
        },
      },
    });

    return NextResponse.json({
      post,
      message: 'Post created successfully',
    });

  } catch (error) {
    console.error('Forum post creation error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while creating the post',
        },
      },
      { status: 500 }
    );
  }
}