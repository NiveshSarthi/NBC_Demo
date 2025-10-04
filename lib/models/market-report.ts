import { ObjectId } from 'mongodb';
import { getMongoDb } from '../database';

export type ReportType = 'quarterly' | 'monthly' | 'city_analysis' | 'sector_analysis' | 'investment_guide';
export type ReportFormat = 'pdf' | 'excel' | 'word';

export interface MarketReport {
  _id?: ObjectId;
  title: string;
  slug: string;
  description: string;
  type: ReportType;
  format: ReportFormat;
  fileUrl: string;
  fileSize: number; // in bytes
  thumbnailUrl?: string;
  categories: string[]; // e.g., ['delhi', 'residential', '2024']
  tags: string[];
  authorId: number;
  status: 'draft' | 'published';
  publishedAt?: Date;
  downloadCount: number;
  viewCount: number;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMarketReportData {
  title: string;
  description: string;
  type: ReportType;
  format: ReportFormat;
  fileUrl: string;
  fileSize: number;
  thumbnailUrl?: string;
  categories: string[];
  tags: string[];
  authorId: number;
  status?: 'draft' | 'published';
  publishedAt?: Date;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

export interface UpdateMarketReportData {
  title?: string;
  description?: string;
  type?: ReportType;
  format?: ReportFormat;
  fileUrl?: string;
  fileSize?: number;
  thumbnailUrl?: string;
  categories?: string[];
  tags?: string[];
  status?: 'draft' | 'published';
  publishedAt?: Date;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

export class MarketReportModel {
  private static readonly COLLECTION = 'market_reports';

  // Create a new market report
  static async create(data: CreateMarketReportData): Promise<MarketReport> {
    const db = await getMongoDb();
    const now = new Date();

    const report: MarketReport = {
      title: data.title,
      slug: this.generateSlug(data.title),
      description: data.description,
      type: data.type,
      format: data.format,
      fileUrl: data.fileUrl,
      fileSize: data.fileSize,
      thumbnailUrl: data.thumbnailUrl,
      categories: data.categories,
      tags: data.tags,
      authorId: data.authorId,
      status: data.status || 'draft',
      publishedAt: data.publishedAt,
      downloadCount: 0,
      viewCount: 0,
      seo: data.seo,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection(this.COLLECTION).insertOne(report);
    return { ...report, _id: result.insertedId };
  }

  // Find by ID
  static async findById(id: string): Promise<MarketReport | null> {
    const db = await getMongoDb();
    return db.collection(this.COLLECTION).findOne({ _id: new ObjectId(id) }) as Promise<MarketReport | null>;
  }

  // Find by slug
  static async findBySlug(slug: string): Promise<MarketReport | null> {
    const db = await getMongoDb();
    return db.collection(this.COLLECTION).findOne({ slug }) as Promise<MarketReport | null>;
  }

  // Update report
  static async update(id: string, data: UpdateMarketReportData): Promise<MarketReport | null> {
    const db = await getMongoDb();
    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    };

    if (data.title) {
      updateData.slug = this.generateSlug(data.title);
    }

    const result = await db.collection(this.COLLECTION).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    return result ? result.value as MarketReport : null;
  }

  // Delete report
  static async delete(id: string): Promise<boolean> {
    const db = await getMongoDb();
    const result = await db.collection(this.COLLECTION).deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  // Get published reports with pagination
  static async getPublishedReports(
    page: number = 1,
    limit: number = 10,
    type?: ReportType,
    category?: string
  ): Promise<{ reports: MarketReport[]; total: number }> {
    const db = await getMongoDb();
    const skip = (page - 1) * limit;

    const filter: any = { status: 'published' };
    if (type) {
      filter.type = type;
    }
    if (category) {
      filter.categories = category;
    }

    const reports = await db.collection(this.COLLECTION)
      .find(filter)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray() as MarketReport[];

    const total = await db.collection(this.COLLECTION).countDocuments(filter);

    return { reports, total };
  }

  // Get reports by author
  static async getReportsByAuthor(authorId: number, status?: 'draft' | 'published'): Promise<MarketReport[]> {
    const db = await getMongoDb();
    const filter: any = { authorId };
    if (status) {
      filter.status = status;
    }

    return db.collection(this.COLLECTION)
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray() as Promise<MarketReport[]>;
  }

  // Increment download count
  static async incrementDownloadCount(id: string): Promise<void> {
    const db = await getMongoDb();
    await db.collection(this.COLLECTION).updateOne(
      { _id: new ObjectId(id) },
      { $inc: { downloadCount: 1 } }
    );
  }

  // Increment view count
  static async incrementViewCount(id: string): Promise<void> {
    const db = await getMongoDb();
    await db.collection(this.COLLECTION).updateOne(
      { _id: new ObjectId(id) },
      { $inc: { viewCount: 1 } }
    );
  }

  // Search reports
  static async search(query: string, page: number = 1, limit: number = 10): Promise<{ reports: MarketReport[]; total: number }> {
    const db = await getMongoDb();
    const skip = (page - 1) * limit;

    const filter = {
      status: 'published',
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { categories: { $in: [new RegExp(query, 'i')] } },
        { tags: { $in: [new RegExp(query, 'i')] } },
      ],
    };

    const reports = await db.collection(this.COLLECTION)
      .find(filter)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray() as MarketReport[];

    const total = await db.collection(this.COLLECTION).countDocuments(filter);

    return { reports, total };
  }

  // Get popular reports
  static async getPopularReports(limit: number = 10): Promise<MarketReport[]> {
    const db = await getMongoDb();
    return db.collection(this.COLLECTION)
      .find({ status: 'published' })
      .sort({ downloadCount: -1 })
      .limit(limit)
      .toArray() as Promise<MarketReport[]>;
  }

  // Get reports by type
  static async getReportsByType(type: ReportType): Promise<MarketReport[]> {
    const db = await getMongoDb();
    return db.collection(this.COLLECTION)
      .find({ status: 'published', type })
      .sort({ publishedAt: -1 })
      .toArray() as Promise<MarketReport[]>;
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