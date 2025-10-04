import { prisma } from '../database';
import type { Location } from '@prisma/client';

export interface LocationFilters {
  city?: string;
  state?: string;
  type?: 'primary' | 'secondary' | 'emerging';
  tierClassification?: 'tier1' | 'tier2' | 'tier3';
}

export interface LocationPagination {
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'population' | 'growth_rate' | 'investment_potential';
  sortOrder?: 'asc' | 'desc';
}

export class LocationModel {
  // Find location by ID
  static async findById(id: number): Promise<Location | null> {
    return prisma.location.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            properties: {
              where: { status: 'active' },
            },
          },
        },
      },
    });
  }

  // Get all locations with filters and pagination
  static async findMany(
    filters: LocationFilters = {},
    pagination: LocationPagination = {}
  ) {
    const { page = 1, limit = 20, sortBy = 'name', sortOrder = 'asc' } = pagination;

    const where: any = {};

    // Apply filters
    if (filters.city) where.city = { contains: filters.city, mode: 'insensitive' };
    if (filters.state) where.state = { contains: filters.state, mode: 'insensitive' };
    if (filters.type) where.type = filters.type;
    if (filters.tierClassification) where.tier_classification = filters.tierClassification;

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [locations, total] = await Promise.all([
      prisma.location.findMany({
        where,
        include: {
          _count: {
            select: {
              properties: {
                where: { status: 'active' },
              },
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.location.count({ where }),
    ]);

    return {
      locations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get location with properties
  static async getLocationWithProperties(
    id: number,
    propertyFilters: any = {},
    propertyPagination: any = {}
  ) {
    const location = await prisma.location.findUnique({
      where: { id },
      include: {
        properties: {
          where: {
            status: 'active',
            ...propertyFilters,
          },
          include: {
            images: {
              where: { is_primary: true },
              take: 1,
            },
            creator: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                avatar_url: true,
              },
            },
          },
          orderBy: { created_at: 'desc' },
          skip: propertyPagination.skip || 0,
          take: propertyPagination.limit || 10,
        },
        _count: {
          select: {
            properties: {
              where: { status: 'active' },
            },
          },
        },
      },
    });

    if (!location) return null;

    const totalProperties = location._count.properties;

    return {
      ...location,
      properties: {
        items: location.properties,
        total: totalProperties,
        page: Math.floor((propertyPagination.skip || 0) / (propertyPagination.limit || 10)) + 1,
        limit: propertyPagination.limit || 10,
        totalPages: Math.ceil(totalProperties / (propertyPagination.limit || 10)),
      },
    };
  }

  // Get popular locations (by property count)
  static async getPopularLocations(limit: number = 10) {
    return prisma.location.findMany({
      include: {
        _count: {
          select: {
            properties: {
              where: { status: 'active' },
            },
          },
        },
      },
      orderBy: {
        properties: {
          _count: 'desc',
        },
      },
      take: limit,
    });
  }

  // Search locations
  static async search(query: string, limit: number = 10) {
    return prisma.location.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { city: { contains: query, mode: 'insensitive' } },
          { state: { contains: query, mode: 'insensitive' } },
          { district: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        _count: {
          select: {
            properties: {
              where: { status: 'active' },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
      take: limit,
    });
  }
}