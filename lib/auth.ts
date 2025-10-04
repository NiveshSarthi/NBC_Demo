import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import type { PropertyType, PriceUnit, AreaUnit, Furnishing, OwnershipType, PossessionStatus } from '@prisma/client';

// Enums
const ListingTypeEnum = z.enum(['sale', 'rent']);
const RentPeriodEnum = z.enum(['daily', 'monthly', 'yearly']);
type ListingType = z.infer<typeof ListingTypeEnum>;
type RentPeriod = z.infer<typeof RentPeriodEnum>;

// Validation schemas
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8),
});

// Property validation schemas
export const createPropertySchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  propertyType: z.enum(['residential', 'commercial', 'plot', 'religious']),
  subType: z.string().optional(),
  listingType: ListingTypeEnum.default('sale'),
  locationId: z.number().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  price: z.number().positive().optional(),
  rentAmount: z.number().positive().optional(),
  rentPeriod: RentPeriodEnum.default('monthly'),
  priceUnit: z.enum(['INR', 'USD']).default('INR'),
  area: z.number().positive().optional(),
  areaUnit: z.enum(['sqft', 'sqm', 'acre', 'hectare']).default('sqft'),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  parkingSpaces: z.number().int().min(0).optional(),
  floorNumber: z.number().int().min(0).optional(),
  totalFloors: z.number().int().min(0).optional(),
  yearBuilt: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  furnishing: z.enum(['unfurnished', 'semi_furnished', 'fully_furnished']).optional(),
  amenities: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  reraRegistered: z.boolean().default(false),
  reraNumber: z.string().optional(),
  ownershipType: z.enum(['freehold', 'leasehold', 'cooperative']).optional(),
  possessionStatus: z.enum(['ready_to_move', 'under_construction', 'new_launch']).optional(),
  possessionDate: z.string().datetime().optional(),
  developerName: z.string().optional(),
  projectName: z.string().optional(),
  virtualTourUrl: z.string().url().optional(),
  videoTourUrl: z.string().url().optional(),
  religiousSignificance: z.string().optional(),
  infrastructureImpact: z.any().optional(),
  featured: z.boolean().default(false),
  premiumListing: z.boolean().default(false),
});

export const updatePropertySchema = createPropertySchema.partial();

export const propertyFiltersSchema = z.object({
  propertyType: z.enum(['residential', 'commercial', 'plot', 'religious']).optional(),
  listingType: ListingTypeEnum.optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  minRentAmount: z.number().positive().optional(),
  maxRentAmount: z.number().positive().optional(),
  minArea: z.number().positive().optional(),
  maxArea: z.number().positive().optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  furnishing: z.enum(['unfurnished', 'semi_furnished', 'fully_furnished']).optional(),
  amenities: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  status: z.enum(['active', 'sold', 'rented', 'inactive']).optional(),
  locationId: z.number().optional(),
});

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['price', 'created_at', 'area', 'ai_score']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const searchPropertySchema = z.object({
  query: z.string().min(1),
  filters: propertyFiltersSchema.optional(),
  pagination: paginationSchema.optional(),
});

export const createInquirySchema = z.object({
  propertyId: z.number(),
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  message: z.string().min(1),
  inquiryType: z.enum(['general', 'price', 'availability', 'visit']).default('general'),
});

export const imageUploadSchema = z.object({
  propertyId: z.number(),
  altText: z.string().optional(),
  isPrimary: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
  imageType: z.enum(['exterior', 'interior', 'amenity', 'location', 'floor_plan']).optional(),
});

// Password utilities
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// JWT utilities
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';

export const generateAccessToken = (payload: object): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (payload: object): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid access token');
  }
};

export const verifyRefreshToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

// Generate secure tokens for password reset
export const generateResetToken = (): string => {
  return jwt.sign(
    { type: 'password_reset' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
};

export const verifyResetToken = (token: string): boolean => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.type === 'password_reset';
  } catch (error) {
    return false;
  }
};

// Email verification token
export const generateEmailVerificationToken = (userId: number): string => {
  return jwt.sign(
    { userId, type: 'email_verification' },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

export const verifyEmailVerificationToken = (token: string): number | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.type === 'email_verification') {
      return decoded.userId;
    }
    return null;
  } catch (error) {
    return null;
  }
};