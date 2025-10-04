import { prisma } from '../database';
import type { Builder, Property } from '@prisma/client';

export class BuilderModel {
  // Find builder by ID with related properties
  static async getBuilderDetails(id: number): Promise<Builder & { properties: Property[] } | null> {
    return prisma.builder.findUnique({
      where: { id },
      include: {
        properties: {
          where: { status: 'active' },
          include: {
            location: true,
            images: {
              where: { is_primary: true },
              take: 1,
            },
          },
          orderBy: { created_at: 'desc' },
        },
      },
    });
  }

  // Find builder by ID
  static async findById(id: number): Promise<Builder | null> {
    return prisma.builder.findUnique({
      where: { id },
    });
  }

  // Get all builders (for admin or listing purposes)
  static async findMany(options: { page?: number; limit?: number } = {}) {
    const { page = 1, limit = 20 } = options;

    const [builders, total] = await Promise.all([
      prisma.builder.findMany({
        include: {
          _count: {
            select: { properties: true },
          },
        },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.builder.count(),
    ]);

    return {
      builders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}