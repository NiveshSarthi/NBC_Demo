import { ObjectId } from 'mongodb';
import { getMongoDb } from '../database';

export interface Comment {
  _id?: ObjectId;
  postId: string; // BlogPost _id
  authorId?: number; // User id, null for anonymous
  authorName: string;
  authorEmail?: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  parentId?: string; // For nested comments
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCommentData {
  postId: string;
  authorId?: number;
  authorName: string;
  authorEmail?: string;
  content: string;
  parentId?: string;
}

export interface UpdateCommentData {
  content?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export class CommentModel {
  private static readonly COLLECTION = 'comments';

  // Create a new comment
  static async create(data: CreateCommentData): Promise<Comment> {
    const db = await getMongoDb();
    const now = new Date();

    const comment: Comment = {
      postId: data.postId,
      authorId: data.authorId,
      authorName: data.authorName,
      authorEmail: data.authorEmail,
      content: data.content,
      status: 'pending',
      parentId: data.parentId,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection(this.COLLECTION).insertOne(comment);
    return { ...comment, _id: result.insertedId };
  }

  // Find by ID
  static async findById(id: string): Promise<Comment | null> {
    const db = await getMongoDb();
    return db.collection(this.COLLECTION).findOne({ _id: new ObjectId(id) }) as Promise<Comment | null>;
  }

  // Update comment
  static async update(id: string, data: UpdateCommentData): Promise<Comment | null> {
    const db = await getMongoDb();
    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    const result = await db.collection(this.COLLECTION).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    return result ? result.value as Comment : null;
  }

  // Delete comment
  static async delete(id: string): Promise<boolean> {
    const db = await getMongoDb();
    const result = await db.collection(this.COLLECTION).deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  // Get comments for a post
  static async getByPostId(postId: string, status?: 'pending' | 'approved' | 'rejected'): Promise<Comment[]> {
    const db = await getMongoDb();
    const filter: any = { postId };
    if (status) {
      filter.status = status;
    }

    return db.collection(this.COLLECTION)
      .find(filter)
      .sort({ createdAt: 1 })
      .toArray() as Promise<Comment[]>;
  }

  // Get approved comments for a post (for frontend)
  static async getApprovedByPostId(postId: string): Promise<Comment[]> {
    return this.getByPostId(postId, 'approved');
  }

  // Get pending comments (for moderation)
  static async getPending(): Promise<Comment[]> {
    const db = await getMongoDb();
    return db.collection(this.COLLECTION)
      .find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .toArray() as Promise<Comment[]>;
  }

  // Approve comment
  static async approve(id: string): Promise<Comment | null> {
    return this.update(id, { status: 'approved' });
  }

  // Reject comment
  static async reject(id: string): Promise<Comment | null> {
    return this.update(id, { status: 'rejected' });
  }

  // Get comment count for a post
  static async getCountByPostId(postId: string, status?: 'pending' | 'approved' | 'rejected'): Promise<number> {
    const db = await getMongoDb();
    const filter: any = { postId };
    if (status) {
      filter.status = status;
    }

    return db.collection(this.COLLECTION).countDocuments(filter);
  }

  // Get approved comment count for a post
  static async getApprovedCountByPostId(postId: string): Promise<number> {
    return this.getCountByPostId(postId, 'approved');
  }
}