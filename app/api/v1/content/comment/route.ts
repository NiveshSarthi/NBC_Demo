import { NextRequest, NextResponse } from 'next/server';
import { CommentModel, CreateCommentData } from '@/lib/models/comment';

// POST /api/v1/content/comment - Create a new comment
export async function POST(request: NextRequest) {
  try {
    const body: CreateCommentData = await request.json();

    // Validate required fields
    if (!body.postId || !body.authorName || !body.content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Basic content validation (prevent empty or too short comments)
    if (body.content.trim().length < 10) {
      return NextResponse.json(
        { error: 'Comment must be at least 10 characters long' },
        { status: 400 }
      );
    }

    // If user is authenticated, get their info from headers
    const userId = request.headers.get('x-user-id');
    if (userId) {
      body.authorId = parseInt(userId);
    }

    // Create the comment
    const comment = await CommentModel.create(body);

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}