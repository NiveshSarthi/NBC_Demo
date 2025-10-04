import { NextRequest, NextResponse } from 'next/server';
import { BlogPostModel, UpdateBlogPostData } from '@/lib/models/blog-post';
import { CommentModel } from '@/lib/models/comment';

// GET /api/v1/content/posts/[slug] - Get individual blog post
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

    const post = await BlogPostModel.findBySlug(slug);

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await BlogPostModel.incrementViewCount(post._id!.toString());

    // Get approved comments
    const commentCount = await CommentModel.getApprovedCountByPostId(post._id!.toString());
    const comments = await CommentModel.getApprovedByPostId(post._id!.toString());

    return NextResponse.json({
      ...post,
      commentCount,
      comments,
    });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/v1/content/posts/[slug] - Update blog post
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const slug = params.slug;
    const post = await BlogPostModel.findBySlug(slug);

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if user can update this post (owner or admin)
    if (post.authorId !== parseInt(userId) && userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body: UpdateBlogPostData = await request.json();
    const updatedPost = await BlogPostModel.update(post._id!.toString(), body);

    if (!updatedPost) {
      return NextResponse.json(
        { error: 'Failed to update post' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/content/posts/[slug] - Delete blog post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const slug = params.slug;
    const post = await BlogPostModel.findBySlug(slug);

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if user can delete this post (owner or admin)
    if (post.authorId !== parseInt(userId) && userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const deleted = await BlogPostModel.delete(post._id!.toString());

    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete post' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}