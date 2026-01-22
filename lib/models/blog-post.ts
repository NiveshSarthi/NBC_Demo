import { ObjectId } from 'mongodb';
import { getMongoDb } from '../database';

export interface BlogPost {
  _id?: ObjectId;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  authorId: number;
  categories: string[];
  tags: string[];
  status: 'draft' | 'published';
  featuredImage?: string;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  likeCount: number;
}

export interface CreateBlogPostData {
  title: string;
  content: string;
  excerpt: string;
  authorId: number;
  categories: string[];
  tags: string[];
  status?: 'draft' | 'published';
  featuredImage?: string;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  publishedAt?: Date;
}

export interface UpdateBlogPostData {
  title?: string;
  content?: string;
  excerpt?: string;
  categories?: string[];
  tags?: string[];
  status?: 'draft' | 'published';
  featuredImage?: string;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  publishedAt?: Date;
}

export class BlogPostModel {
  private static readonly COLLECTION = 'blog_posts';

  // Create a new blog post
  static async create(data: CreateBlogPostData): Promise<BlogPost> {
    const db = await getMongoDb();
    const now = new Date();

    const blogPost: BlogPost = {
      title: data.title,
      slug: this.generateSlug(data.title),
      content: data.content,
      excerpt: data.excerpt,
      authorId: data.authorId,
      categories: data.categories,
      tags: data.tags,
      status: data.status || 'draft',
      featuredImage: data.featuredImage,
      seo: data.seo,
      publishedAt: data.publishedAt,
      createdAt: now,
      updatedAt: now,
      viewCount: 0,
      likeCount: 0,
    };

    const result = await db.collection(this.COLLECTION).insertOne(blogPost);
    return { ...blogPost, _id: result.insertedId };
  }

  // Find by ID
  static async findById(id: string): Promise<BlogPost | null> {
    const db = await getMongoDb();
    return db.collection<BlogPost>(this.COLLECTION).findOne({ _id: new ObjectId(id) });
  }

  // Find by slug
  static async findBySlug(slug: string): Promise<BlogPost | null> {
    const db = await getMongoDb();
    return db.collection<BlogPost>(this.COLLECTION).findOne({ slug });
  }

  // Update blog post
  static async update(id: string, data: UpdateBlogPostData): Promise<BlogPost | null> {
    const db = await getMongoDb();
    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    };

    if (data.title) {
      updateData.slug = this.generateSlug(data.title);
    }

    const result = await db.collection<BlogPost>(this.COLLECTION).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    return result ?? null;
  }

  // Delete blog post
  static async delete(id: string): Promise<boolean> {
    const db = await getMongoDb();
    const result = await db.collection(this.COLLECTION).deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  // Get published posts with pagination
  static async getPublishedPosts(
    page: number = 1,
    limit: number = 10,
    category?: string,
    tag?: string
  ): Promise<{ posts: BlogPost[]; total: number }> {
    const db = await getMongoDb();
    const skip = (page - 1) * limit;

    const filter: any = { status: 'published' };
    if (category) {
      filter.categories = category;
    }
    if (tag) {
      filter.tags = tag;
    }

    const posts = await db.collection<BlogPost>(this.COLLECTION)
      .find(filter)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await db.collection<BlogPost>(this.COLLECTION).countDocuments(filter);

    return { posts, total };
  }

  // Increment view count
  static async incrementViewCount(id: string): Promise<void> {
    const db = await getMongoDb();
    await db.collection<BlogPost>(this.COLLECTION).updateOne(
      { _id: new ObjectId(id) },
      { $inc: { viewCount: 1 } }
    );
  }

  // Increment like count
  static async incrementLikeCount(id: string): Promise<void> {
    const db = await getMongoDb();
    await db.collection<BlogPost>(this.COLLECTION).updateOne(
      { _id: new ObjectId(id) },
      { $inc: { likeCount: 1 } }
    );
  }

  // Get posts by author
  static async getPostsByAuthor(authorId: number, status?: 'draft' | 'published'): Promise<BlogPost[]> {
    const db = await getMongoDb();
    const filter: any = { authorId };
    if (status) {
      filter.status = status;
    }

    return db.collection<BlogPost>(this.COLLECTION)
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
  }

  // Search posts
  static async search(query: string, page: number = 1, limit: number = 10): Promise<{ posts: BlogPost[]; total: number }> {
    const db = await getMongoDb();
    const skip = (page - 1) * limit;

    const filter = {
      status: 'published' as const,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { excerpt: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } },
      ],
    };

    const posts = await db.collection<BlogPost>(this.COLLECTION)
      .find(filter)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await db.collection<BlogPost>(this.COLLECTION).countDocuments(filter);

    return { posts, total };
  }

  // Get popular posts
  static async getPopularPosts(limit: number = 10): Promise<BlogPost[]> {
    const db = await getMongoDb();
    return db.collection<BlogPost>(this.COLLECTION)
      .find({ status: 'published' })
      .sort({ viewCount: -1 })
      .limit(limit)
      .toArray();
  }

  private static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}