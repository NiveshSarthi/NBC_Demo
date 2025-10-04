import { prisma } from '../database';
import { hashPassword } from '../auth';
import type { User, UserRole } from '@prisma/client';

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: UserRole;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  preferences?: object;
  investmentBudget?: number;
  preferredLocations?: string[];
}

export class UserModel {
  // Create a new user
  static async create(data: CreateUserData): Promise<User> {
    const hashedPassword = await hashPassword(data.password);

    return prisma.user.create({
      data: {
        email: data.email,
        password_hash: hashedPassword,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        role: data.role || 'user',
      },
    });
  }

  // Find user by email
  static async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  // Find user by ID
  static async findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  // Update user
  static async update(id: number, data: UpdateUserData): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
  }

  // Update password
  static async updatePassword(id: number, newPassword: string): Promise<User> {
    const hashedPassword = await hashPassword(newPassword);

    return prisma.user.update({
      where: { id },
      data: {
        password_hash: hashedPassword,
        updated_at: new Date(),
      },
    });
  }

  // Update last login
  static async updateLastLogin(id: number): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        last_login: new Date(),
      },
    });
  }

  // Verify email
  static async verifyEmail(id: number): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        email_verified: true,
        updated_at: new Date(),
      },
    });
  }

  // Verify phone
  static async verifyPhone(id: number): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        phone_verified: true,
        updated_at: new Date(),
      },
    });
  }

  // Delete user
  static async delete(id: number): Promise<User> {
    return prisma.user.delete({
      where: { id },
    });
  }

  // Get user profile with related data
  static async getProfile(id: number) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        phone: true,
        role: true,
        avatar_url: true,
        preferences: true,
        email_verified: true,
        phone_verified: true,
        investment_budget: true,
        preferred_locations: true,
        created_at: true,
        updated_at: true,
        last_login: true,
        _count: {
          select: {
            properties: true,
            inquiries: true,
          },
        },
      },
    });
  }

  // Search users (for admin)
  static async search(query: string, limit: number = 20, offset: number = 0) {
    return prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: query, mode: 'insensitive' } },
          { first_name: { contains: query, mode: 'insensitive' } },
          { last_name: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        created_at: true,
      },
      take: limit,
      skip: offset,
      orderBy: { created_at: 'desc' },
    });
  }
}