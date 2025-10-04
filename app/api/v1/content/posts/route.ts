import { NextRequest, NextResponse } from 'next/server';
import { BlogPostModel, CreateBlogPostData } from '@/lib/models/blog-post';
import { CategoryModel } from '@/lib/models/category';
import { TagModel } from '@/lib/models/tag';

// GET /api/v1/content/posts - Get paginated blog posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category') || undefined;
    const tag = searchParams.get('tag') || undefined;
    const search = searchParams.get('search') || undefined;

    let posts;
    let total;

    if (search) {
      // Search posts
      const result = await BlogPostModel.search(search, page, limit);
      posts = result.posts;
      total = result.total;
    } else {
      // Get paginated posts
      const result = await BlogPostModel.getPublishedPosts(page, limit, category, tag);
      posts = result.posts;
      total = result.total;
    }

    // Get categories and tags for filtering
    const categories = await CategoryModel.getWithPostCounts();
    const tags = await TagModel.getPopular(20);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      filters: {
        categories,
        tags,
      },
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/v1/content/posts - Create a new blog post
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: CreateBlogPostData = await request.json();

    // Validate required fields
    if (!body.title || !body.content || !body.excerpt || !body.authorId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the author is the current user or admin
    if (body.authorId !== parseInt(userId) && userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Create the blog post
    const blogPost = await BlogPostModel.create(body);

    // Update category and tag counts
    if (body.categories && body.categories.length > 0) {
      for (const categoryName of body.categories) {
        let category = await CategoryModel.findByName(categoryName);
        if (!category) {
          category = await CategoryModel.create({ name: categoryName });
        }
        await CategoryModel.incrementPostCount(category.slug);
      }
    }

    if (body.tags && body.tags.length > 0) {
      for (const tagName of body.tags) {
        let tag = await TagModel.findByName(tagName);
        if (!tag) {
          await TagModel.create({ name: tagName });
        }
        await TagModel.incrementPostCount(tagName.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'));
      }
    }

    return NextResponse.json(blogPost, { status: 201 });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}