import { ObjectId } from 'mongodb';
import { getMongoDb } from '../database';

export interface Category {
  _id?: ObjectId;
  name: string;
  slug: string;
  description?: string;
  postCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
}

export class CategoryModel {
  private static readonly COLLECTION = 'categories';

  // Create a new category
  static async create(data: CreateCategoryData): Promise<Category> {
    const db = await getMongoDb();
    const now = new Date();

    const category: Category = {
      name: data.name,
      slug: this.generateSlug(data.name),
      description: data.description,
      postCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection(this.COLLECTION).insertOne(category);
    return { ...category, _id: result.insertedId };
  }

  // Find by ID
  static async findById(id: string): Promise<Category | null> {
    const db = await getMongoDb();
    return db.collection(this.COLLECTION).findOne({ _id: new ObjectId(id) }) as Promise<Category | null>;
  }

  // Find by slug
  static async findBySlug(slug: string): Promise<Category | null> {
    const db = await getMongoDb();
    return db.collection(this.COLLECTION).findOne({ slug }) as Promise<Category | null>;
  }

  // Find by name
  static async findByName(name: string): Promise<Category | null> {
    const db = await getMongoDb();
    return db.collection(this.COLLECTION).findOne({ name }) as Promise<Category | null>;
  }

  // Update category
  static async update(id: string, data: UpdateCategoryData): Promise<Category | null> {
    const db = await getMongoDb();
    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    };

    if (data.name) {
      updateData.slug = this.generateSlug(data.name);
    }

    const result = await db.collection(this.COLLECTION).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    return result ? result.value as Category : null;
  }

  // Delete category
  static async delete(id: string): Promise<boolean> {
    const db = await getMongoDb();
    const result = await db.collection(this.COLLECTION).deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  // Get all categories
  static async getAll(): Promise<Category[]> {
    const db = await getMongoDb();
    return db.collection(this.COLLECTION)
      .find({})
      .sort({ name: 1 })
      .toArray() as Promise<Category[]>;
  }

  // Get categories with post counts
  static async getWithPostCounts(): Promise<Category[]> {
    const db = await getMongoDb();
    return db.collection(this.COLLECTION)
      .find({})
      .sort({ postCount: -1 })
      .toArray() as Promise<Category[]>;
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