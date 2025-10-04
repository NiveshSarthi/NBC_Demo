import type { Property, PropertyImage, Location, AiPrediction } from '@prisma/client';

export interface PropertyWithDetails extends Property {
  location?: Location | null;
  creator?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string | null;
    avatar_url?: string | null;
  } | null;
  images: PropertyImage[];
  predictions?: AiPrediction[];
}

export interface PropertiesResponse {
  properties: PropertyWithDetails[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SearchPropertiesResponse extends PropertiesResponse {
  searchQuery: string;
  smartSuggestions?: any[];
  parsedQuery?: any;
}

export interface PropertyFilters {
  propertyType?: string;
  listingType?: string;
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
  furnishing?: string;
  amenities?: string[];
  featured?: boolean;
  locationId?: number;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: 'price' | 'created_at' | 'area' | 'ai_score';
  sortOrder?: 'asc' | 'desc';
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: any[];
  };
}