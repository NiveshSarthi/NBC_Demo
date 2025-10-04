import { prisma } from '../database';
import type {
  Property,
  PropertyImage,
  Location,
  Analytic,
  AiPrediction,
  Inquiry,
  PropertyStatus,
  PropertyType,
  PriceUnit,
  AreaUnit,
  Furnishing,
  OwnershipType,
  PossessionStatus,
  EventType,
  ListingType,
  RentPeriod
} from '@prisma/client';

export interface CreatePropertyData {
  title: string;
  description?: string;
  propertyType: PropertyType;
  subType?: string;
  listingType?: ListingType;
  locationId?: number;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  price?: number;
  rentAmount?: number;
  rentPeriod?: RentPeriod;
  priceUnit?: PriceUnit;
  area?: number;
  areaUnit?: AreaUnit;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  floorNumber?: number;
  totalFloors?: number;
  yearBuilt?: number;
  furnishing?: Furnishing;
  amenities?: string[];
  features?: string[];
  reraRegistered?: boolean;
  reraNumber?: string;
  ownershipType?: OwnershipType;
  possessionStatus?: PossessionStatus;
  possessionDate?: Date;
  developerName?: string;
  projectName?: string;
  virtualTourUrl?: string;
  videoTourUrl?: string;
  religiousSignificance?: string;
  infrastructureImpact?: object;
  featured?: boolean;
  premiumListing?: boolean;
}

export interface UpdatePropertyData {
  title?: string;
  description?: string;
  propertyType?: PropertyType;
  subType?: string;
  listingType?: ListingType;
  locationId?: number;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  price?: number;
  rentAmount?: number;
  rentPeriod?: RentPeriod;
  priceUnit?: PriceUnit;
  area?: number;
  areaUnit?: AreaUnit;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  floorNumber?: number;
  totalFloors?: number;
  yearBuilt?: number;
  furnishing?: Furnishing;
  amenities?: string[];
  features?: string[];
  reraRegistered?: boolean;
  reraNumber?: string;
  ownershipType?: OwnershipType;
  possessionStatus?: PossessionStatus;
  possessionDate?: Date;
  developerName?: string;
  projectName?: string;
  virtualTourUrl?: string;
  videoTourUrl?: string;
  religiousSignificance?: string;
  infrastructureImpact?: object;
  featured?: boolean;
  premiumListing?: boolean;
}

export interface PropertyFilters {
  propertyType?: PropertyType;
  listingType?: ListingType;
  city?: string;
  state?: string;
  minPrice?: number;
  maxPrice?: number;
  minRentAmount?: number;
  maxRentAmount?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  furnishing?: Furnishing;
  amenities?: string[];
  featured?: boolean;
  status?: PropertyStatus;
  locationId?: number;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: 'price' | 'created_at' | 'area' | 'ai_score';
  sortOrder?: 'asc' | 'desc';
}

export class PropertyModel {
  // Create a new property
  static async create(data: CreatePropertyData, createdBy: number): Promise<Property> {
    // Validate that sale properties have price, rent have rent_amount
    if ((data.listingType === 'sale' || !data.listingType) && !data.price) {
      throw new Error('Price is required for sale listings');
    }
    if (data.listingType === 'rent' && !data.rentAmount) {
      throw new Error('Rent amount is required for rental listings');
    }

    return prisma.property.create({
      data: {
        title: data.title,
        description: data.description,
        property_type: data.propertyType,
        sub_type: data.subType,
        listing_type: data.listingType || 'sale',
        location_id: data.locationId,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        latitude: data.latitude,
        longitude: data.longitude,
        ...(data.price && { price: data.price }),
        ...(data.rentAmount && { rent_amount: data.rentAmount }),
        rent_period: data.rentPeriod || 'monthly',
        price_unit: data.priceUnit,
        area: data.area,
        area_unit: data.areaUnit,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        parking_spaces: data.parkingSpaces,
        floor_number: data.floorNumber,
        total_floors: data.totalFloors,
        year_built: data.yearBuilt,
        furnishing: data.furnishing,
        amenities: data.amenities,
        features: data.features,
        rera_registered: data.reraRegistered,
        rera_number: data.reraNumber,
        ownership_type: data.ownershipType,
        possession_status: data.possessionStatus,
        possession_date: data.possessionDate,
        developer_name: data.developerName,
        project_name: data.projectName,
        virtual_tour_url: data.virtualTourUrl,
        video_tour_url: data.videoTourUrl,
        religious_significance: data.religiousSignificance,
        infrastructure_impact: data.infrastructureImpact,
        featured: data.featured,
        premium_listing: data.premiumListing,
        created_by: createdBy,
      },
    });
  }

  // Find property by ID
  static async findById(id: number): Promise<Property | null> {
    return prisma.property.findUnique({
      where: { id },
      include: {
        location: true,
        creator: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone: true,
            avatar_url: true,
          },
        },
        images: {
          orderBy: { sort_order: 'asc' },
        },
        predictions: true,
      },
    });
  }

  // Get property with full details for public view
  static async getPropertyDetails(id: number): Promise<Property | null> {
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        location: true,
        creator: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone: true,
            avatar_url: true,
          },
        },
        images: {
          orderBy: { sort_order: 'asc' },
        },
        predictions: true,
      },
    });

    if (property) {
      // Track view
      await this.trackView(id, null); // null for anonymous views
    }

    return property;
  }

  // Update property
  static async update(id: number, data: UpdatePropertyData): Promise<Property> {
    return prisma.property.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.propertyType && { property_type: data.propertyType }),
        ...(data.subType !== undefined && { sub_type: data.subType }),
        ...(data.listingType && { listing_type: data.listingType }),
        ...(data.locationId !== undefined && { location_id: data.locationId }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.state !== undefined && { state: data.state }),
        ...(data.pincode !== undefined && { pincode: data.pincode }),
        ...(data.latitude !== undefined && { latitude: data.latitude }),
        ...(data.longitude !== undefined && { longitude: data.longitude }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.rentAmount !== undefined && { rent_amount: data.rentAmount }),
        ...(data.rentPeriod && { rent_period: data.rentPeriod }),
        ...(data.priceUnit && { price_unit: data.priceUnit }),
        ...(data.area !== undefined && { area: data.area }),
        ...(data.areaUnit && { area_unit: data.areaUnit }),
        ...(data.bedrooms !== undefined && { bedrooms: data.bedrooms }),
        ...(data.bathrooms !== undefined && { bathrooms: data.bathrooms }),
        ...(data.parkingSpaces !== undefined && { parking_spaces: data.parkingSpaces }),
        ...(data.floorNumber !== undefined && { floor_number: data.floorNumber }),
        ...(data.totalFloors !== undefined && { total_floors: data.totalFloors }),
        ...(data.yearBuilt !== undefined && { year_built: data.yearBuilt }),
        ...(data.furnishing && { furnishing: data.furnishing }),
        ...(data.amenities !== undefined && { amenities: data.amenities }),
        ...(data.features !== undefined && { features: data.features }),
        ...(data.reraRegistered !== undefined && { rera_registered: data.reraRegistered }),
        ...(data.reraNumber !== undefined && { rera_number: data.reraNumber }),
        ...(data.ownershipType && { ownership_type: data.ownershipType }),
        ...(data.possessionStatus && { possession_status: data.possessionStatus }),
        ...(data.possessionDate !== undefined && { possession_date: data.possessionDate }),
        ...(data.developerName !== undefined && { developer_name: data.developerName }),
        ...(data.projectName !== undefined && { project_name: data.projectName }),
        ...(data.virtualTourUrl !== undefined && { virtual_tour_url: data.virtualTourUrl }),
        ...(data.videoTourUrl !== undefined && { video_tour_url: data.videoTourUrl }),
        ...(data.religiousSignificance !== undefined && { religious_significance: data.religiousSignificance }),
        ...(data.infrastructureImpact !== undefined && { infrastructure_impact: data.infrastructureImpact }),
        ...(data.featured !== undefined && { featured: data.featured }),
        ...(data.premiumListing !== undefined && { premium_listing: data.premiumListing }),
        updated_at: new Date(),
      },
    });
  }

  // Soft delete property
  static async softDelete(id: number): Promise<Property> {
    return prisma.property.update({
      where: { id },
      data: {
        status: 'inactive',
        updated_at: new Date(),
      },
    });
  }

  // List properties with filters and pagination
  static async findMany(
    filters: PropertyFilters = {},
    pagination: PaginationOptions = {},
    includeAnalytics: boolean = false
  ) {
    const { page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'desc' } = pagination;

    const where: any = {
      status: 'active', // Only active properties by default
    };

    // Apply filters
    if (filters.propertyType) where.property_type = filters.propertyType;
    if (filters.listingType) where.listing_type = filters.listingType;
    if (filters.city) where.city = { contains: filters.city, mode: 'insensitive' };
    if (filters.state) where.state = { contains: filters.state, mode: 'insensitive' };
    if (filters.minPrice || filters.maxPrice) {
      where.price = {};
      if (filters.minPrice) where.price.gte = filters.minPrice;
      if (filters.maxPrice) where.price.lte = filters.maxPrice;
    }
    if (filters.minRentAmount || filters.maxRentAmount) {
      where.rent_amount = {};
      if (filters.minRentAmount) where.rent_amount.gte = filters.minRentAmount;
      if (filters.maxRentAmount) where.rent_amount.lte = filters.maxRentAmount;
    }
    if (filters.minArea || filters.maxArea) {
      where.area = {};
      if (filters.minArea) where.area.gte = filters.minArea;
      if (filters.maxArea) where.area.lte = filters.maxArea;
    }
    if (filters.bedrooms) where.bedrooms = filters.bedrooms;
    if (filters.bathrooms) where.bathrooms = filters.bathrooms;
    if (filters.furnishing) where.furnishing = filters.furnishing;
    if (filters.featured !== undefined) where.featured = filters.featured;
    if (filters.status) where.status = filters.status;
    if (filters.locationId) where.location_id = filters.locationId;

    // Amenities filter (property must have all specified amenities)
    if (filters.amenities && filters.amenities.length > 0) {
      where.amenities = {
        hasEvery: filters.amenities,
      };
    }

    // Build orderBy
    const orderBy: any[] = [];

    // Always sort featured properties first, then by the selected field
    orderBy.push({ featured: 'desc' });
    orderBy.push({ [sortBy]: sortOrder });

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          location: true,
          creator: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              avatar_url: true,
            },
          },
          images: {
            where: { is_primary: true },
            take: 1,
          },
          predictions: includeAnalytics,
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.property.count({ where }),
    ]);

    return {
      properties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Search properties (NLP-powered search)
  static async search(
    query: string,
    filters: PropertyFilters = {},
    pagination: PaginationOptions = {}
  ) {
    // For now, implement basic text search
    // In future, integrate with AI/ML for NLP search
    const searchFilters = { ...filters };

    const where: any = {
      status: 'active',
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { address: { contains: query, mode: 'insensitive' } },
        { city: { contains: query, mode: 'insensitive' } },
        { state: { contains: query, mode: 'insensitive' } },
        { sub_type: { contains: query, mode: 'insensitive' } },
        { developer_name: { contains: query, mode: 'insensitive' } },
        { project_name: { contains: query, mode: 'insensitive' } },
      ],
    };

    // Apply additional filters
    if (searchFilters.propertyType) where.property_type = searchFilters.propertyType;
    if (searchFilters.listingType) where.listing_type = searchFilters.listingType;
    if (searchFilters.city) where.city = { contains: searchFilters.city, mode: 'insensitive' };
    if (searchFilters.state) where.state = { contains: searchFilters.state, mode: 'insensitive' };
    if (searchFilters.minPrice || searchFilters.maxPrice) {
      where.price = {};
      if (searchFilters.minPrice) where.price.gte = searchFilters.minPrice;
      if (searchFilters.maxPrice) where.price.lte = searchFilters.maxPrice;
    }
    if (searchFilters.minRentAmount || searchFilters.maxRentAmount) {
      where.rent_amount = {};
      if (searchFilters.minRentAmount) where.rent_amount.gte = searchFilters.minRentAmount;
      if (searchFilters.maxRentAmount) where.rent_amount.lte = searchFilters.maxRentAmount;
    }
    if (searchFilters.minArea || searchFilters.maxArea) {
      where.area = {};
      if (searchFilters.minArea) where.area.gte = searchFilters.minArea;
      if (searchFilters.maxArea) where.area.lte = searchFilters.maxArea;
    }
    if (searchFilters.bedrooms) where.bedrooms = searchFilters.bedrooms;
    if (searchFilters.bathrooms) where.bathrooms = searchFilters.bathrooms;
    if (searchFilters.furnishing) where.furnishing = searchFilters.furnishing;
    if (searchFilters.featured !== undefined) where.featured = searchFilters.featured;
    if (searchFilters.locationId) where.location_id = searchFilters.locationId;

    if (searchFilters.amenities && searchFilters.amenities.length > 0) {
      where.amenities = {
        hasEvery: searchFilters.amenities,
      };
    }

    const { page = 1, limit = 20, sortBy = 'ai_score', sortOrder = 'desc' } = pagination;

    const orderBy: any[] = [];
    orderBy.push({ featured: 'desc' });
    orderBy.push({ [sortBy]: sortOrder });

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          location: true,
          creator: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              avatar_url: true,
            },
          },
          images: {
            where: { is_primary: true },
            take: 1,
          },
          predictions: true,
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.property.count({ where }),
    ]);

    return {
      properties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      searchQuery: query,
    };
  }

  // Track property view
  static async trackView(propertyId: number, userId: number | null, sessionId?: string, ipAddress?: string): Promise<void> {
    // Increment view count
    await prisma.property.update({
      where: { id: propertyId },
      data: {
        views_count: { increment: 1 },
      },
    });

    // Create analytics record
    await prisma.analytic.create({
      data: {
        property_id: propertyId,
        event_type: 'view',
        user_id: userId,
        session_id: sessionId,
        ip_address: ipAddress,
      },
    });
  }

  // Track other analytics events
  static async trackEvent(
    propertyId: number,
    eventType: EventType,
    userId: number | null,
    sessionId?: string,
    ipAddress?: string,
    referrerUrl?: string,
    userAgent?: string
  ): Promise<void> {
    if (eventType === 'inquiry') {
      await prisma.property.update({
        where: { id: propertyId },
        data: {
          inquiries_count: { increment: 1 },
        },
      });
    }

    await prisma.analytic.create({
      data: {
        property_id: propertyId,
        event_type: eventType,
        user_id: userId,
        session_id: sessionId,
        ip_address: ipAddress,
        referrer_url: referrerUrl,
        user_agent: userAgent,
      },
    });
  }

  // Get user's saved properties
  static async getSavedProperties(userId: number, pagination: PaginationOptions = {}) {
    const { page = 1, limit = 20 } = pagination;

    // Get property IDs that user has saved
    const savedEvents = await prisma.analytic.findMany({
      where: {
        user_id: userId,
        event_type: 'save',
      },
      select: {
        property_id: true,
      },
      distinct: ['property_id'],
      orderBy: {
        timestamp: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const propertyIds = savedEvents.map(event => event.property_id).filter(Boolean) as number[];

    if (propertyIds.length === 0) {
      return {
        properties: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where: {
          id: { in: propertyIds },
          status: 'active',
        },
        include: {
          location: true,
          creator: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              avatar_url: true,
            },
          },
          images: {
            where: { is_primary: true },
            take: 1,
          },
        },
        orderBy: {
          updated_at: 'desc',
        },
      }),
      prisma.analytic.count({
        where: {
          user_id: userId,
          event_type: 'save',
          property_id: { not: null },
        },
      }),
    ]);

    return {
      properties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Save/unsave property for user
  static async toggleSaveProperty(userId: number, propertyId: number): Promise<boolean> {
    // Check if already saved
    const existingSave = await prisma.analytic.findFirst({
      where: {
        user_id: userId,
        property_id: propertyId,
        event_type: 'save',
      },
    });

    if (existingSave) {
      // Unsave - delete the save event
      await prisma.analytic.delete({
        where: { id: existingSave.id },
      });
      return false; // Now unsaved
    } else {
      // Save - create save event
      await prisma.analytic.create({
        data: {
          property_id: propertyId,
          event_type: 'save',
          user_id: userId,
        },
      });
      return true; // Now saved
    }
  }

  // Check if property is saved by user
  static async isPropertySaved(userId: number, propertyId: number): Promise<boolean> {
    const saveEvent = await prisma.analytic.findFirst({
      where: {
        user_id: userId,
        property_id: propertyId,
        event_type: 'save',
      },
    });
    return !!saveEvent;
  }

  // Get properties by location
  static async getPropertiesByLocation(locationId: number, pagination: PaginationOptions = {}) {
    return this.findMany({ locationId }, pagination);
  }

  // Get analytics for property
  static async getPropertyAnalytics(propertyId: number, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const analytics = await prisma.analytic.groupBy({
      by: ['event_type'],
      where: {
        property_id: propertyId,
        timestamp: {
          gte: startDate,
        },
      },
      _count: {
        event_type: true,
      },
    });

    const inquiryCount = await prisma.inquiry.count({
      where: {
        property_id: propertyId,
        created_at: {
          gte: startDate,
        },
      },
    });

    return {
      views: analytics.find(a => a.event_type === 'view')?._count.event_type || 0,
      inquiries: inquiryCount,
      saves: analytics.find(a => a.event_type === 'save')?._count.event_type || 0,
      shares: analytics.find(a => a.event_type === 'share')?._count.event_type || 0,
      contacts: analytics.find(a => a.event_type === 'contact')?._count.event_type || 0,
      period: `${days} days`,
    };
  }

  // Get featured properties
  static async getFeaturedProperties(limit: number = 10) {
    return prisma.property.findMany({
      where: {
        featured: true,
        status: 'active',
      },
      include: {
        location: true,
        images: {
          where: { is_primary: true },
          take: 1,
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      take: limit,
    });
  }

  // Update property analytics counters
  static async updateAnalyticsCounters(propertyId: number): Promise<void> {
    const [viewCount, inquiryCount] = await Promise.all([
      prisma.analytic.count({
        where: {
          property_id: propertyId,
          event_type: 'view',
        },
      }),
      prisma.inquiry.count({
        where: {
          property_id: propertyId,
        },
      }),
    ]);

    await prisma.property.update({
      where: { id: propertyId },
      data: {
        views_count: viewCount,
        inquiries_count: inquiryCount,
      },
    });
  }
}