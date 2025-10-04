import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const postId = parseInt(id);
    if (isNaN(postId)) {
      return NextResponse.json(
        { error: { code: 'INVALID_ID', message: 'Invalid post ID' } },
        { status: 400 }
      );
    }

    // Get user ID from middleware
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content } = body;

    // Validate input
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Reply content is required' } },
        { status: 400 }
      );
    }

    // Check if post exists
    const post = await prisma.communityForumPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Forum post not found' } },
        { status: 404 }
      );
    }

    // Get current replies
    const currentReplies = post.replies ? JSON.parse(post.replies as string) : [];

    // Add new reply
    const newReply = {
      user_id: parseInt(userId),
      content: content.trim(),
      created_at: new Date().toISOString(),
    };

    const updatedReplies = [...currentReplies, newReply];

    // Update post with new reply
    await prisma.communityForumPost.update({
      where: { id: postId },
      data: {
        replies: JSON.stringify(updatedReplies),
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      reply: newReply,
      message: 'Reply added successfully',
    });

  } catch (error) {
    console.error('Reply creation error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while creating the reply',
        },
      },
      { status: 500 }
    );
  }
}