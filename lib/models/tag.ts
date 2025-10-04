import { ObjectId } from 'mongodb';
import { getMongoDb } from '../database';

export interface Tag {
  _id?: ObjectId;
  name: string;
  slug: string;
  postCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTagData {
  name: string;
}

export class TagModel {
  private static readonly COLLECTION = 'tags';

  // Create a new tag
  static async create(data: CreateTagData): Promise<Tag> {
    const db = await getMongoDb();
    const now = new Date();

    const tag: Tag = {
      name: data.name,
      slug: this.generateSlug(data.name),
      postCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection(this.COLLECTION).insertOne(tag);
    return { ...tag, _id: result.insertedId };
  }

  // Find by ID
  static async findById(id: string): Promise<Tag | null> {
    const db = await getMongoDb();
    return db.collection(this.COLLECTION).findOne({ _id: new ObjectId(id) }) as Promise<Tag | null>;
  }

  // Find by slug
  static async findBySlug(slug: string): Promise<Tag | null> {
    const db = await getMongoDb();
    return db.collection(this.COLLECTION).findOne({ slug }) as Promise<Tag | null>;
  }

  // Find by name
  static async findByName(name: string): Promise<Tag | null> {
    const db = await getMongoDb();
    return db.collection(this.COLLECTION).findOne({ name }) as Promise<Tag | null>;
  }

  // Delete tag
  static async delete(id: string): Promise<boolean> {
    const db = await getMongoDb();
    const result = await db.collection(this.COLLECTION).deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  // Get all tags
  static async getAll(): Promise<Tag[]> {
    const db = await getMongoDb();
    return db.collection(this.COLLECTION)
      .find({})
      .sort({ name: 1 })
      .toArray() as Promise<Tag[]>;
  }

  // Get popular tags
  static async getPopular(limit: number = 20): Promise<Tag[]> {
    const db = await getMongoDb();
    return db.collection(this.COLLECTION)
      .find({})
      .sort({ postCount: -1 })
      .limit(limit)
      .toArray() as Promise<Tag[]>;
  }

  // Increment post count
  static async incrementPostCount(slug: string): Promise<void> {
    const db = await getMongoDb();
    await db.collection(this.COLLECTION).updateOne(
      { slug },
      { $inc: { postCount: 1 } }
    );
  }

  // Decrement post count
  static async decrementPostCount(slug: string): Promise<void> {
    const db = await getMongoDb();
    await db.collection(this.COLLECTION).updateOne(
      { slug },
      { $inc: { postCount: -1 } }
    );
  }

  private static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}