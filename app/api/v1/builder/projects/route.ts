import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

const createProjectSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  propertyType: z.enum(['residential', 'commercial', 'plot', 'religious']),
  subType: z.string().optional(),
  locationId: z.number().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  price: z.number().positive().optional(),
  area: z.number().positive().optional(),
  areaUnit: z.enum(['sqft', 'sqm', 'acre', 'hectare']).default('sqft'),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  possessionStatus: z.enum(['ready_to_move', 'under_construction', 'new_launch']).optional(),
  projectName: z.string().optional(),
  featured: z.boolean().default(false),
  premiumListing: z.boolean().default(false),
});

const updateProjectSchema = createProjectSchema.partial();

export async function GET(request: NextRequest) {
  try {
    // Get user ID from middleware
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } },
        { status: 401 }
      );
    }

    const userIdNum = parseInt(userId, 10);

    // Get user with role check
    const user = await prisma.user.findUnique({
      where: { id: userIdNum }
    });

    if (!user || user.role !== UserRole.builder) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Access denied. Builder role required.' } },
        { status: 403 }
      );
    }

    // Get builder record
    const builder = await prisma.builder.findFirst({
      where: { id: userIdNum }
    });

    if (!builder) {
      return NextResponse.json(
        { error: { code: 'BUILDER_NOT_FOUND', message: 'Builder profile not found' } },
        { status: 404 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where clause
    const where: any = {
      builder_id: builder.id
    };

    if (status) {
      where.status = status;
    }

    // Get projects with pagination
    const [projects, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          location: true,
          _count: {
            select: {
              inquiries: true,
              images: true,
              analytics: {
                where: {
                  event_type: 'view'
                }
              }
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.property.count({ where })
    ]);

    // Transform response
    const transformedProjects = projects.map(project => ({
      id: project.id,
      slug: project.slug,
      title: project.title,
      description: project.description,
      propertyType: project.property_type,
      subType: project.sub_type,
      listingType: project.listing_type,
      location: project.location ? {
        name: project.location.name,
        city: project.location.city,
        state: project.location.state
      } : null,
      address: project.address,
      city: project.city,
      state: project.state,
      price: project.price,
      rentAmount: project.rent_amount,
      area: project.area,
      areaUnit: project.area_unit,
      bedrooms: project.bedrooms,
      bathrooms: project.bathrooms,
      possessionStatus: project.possession_status,
      projectName: project.project_name,
      status: project.status,
      featured: project.featured,
      premiumListing: project.premium_listing,
      viewsCount: project.views_count,
      inquiriesCount: project.inquiries_count,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
      analytics: {
        inquiries: project._count.inquiries,
        images: project._count.images,
        views: project._count.analytics
      }
    }));

    return NextResponse.json({
      projects: transformedProjects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching builder projects:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch projects' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user ID from middleware
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } },
        { status: 401 }
      );
    }

    const userIdNum = parseInt(userId, 10);

    // Get user with role check
    const user = await prisma.user.findUnique({
      where: { id: userIdNum }
    });

    if (!user || user.role !== UserRole.builder) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Access denied. Builder role required.' } },
        { status: 403 }
      );
    }

    // Get builder record
    const builder = await prisma.builder.findFirst({
      where: { id: userIdNum }
    });

    if (!builder) {
      return NextResponse.json(
        { error: { code: 'BUILDER_NOT_FOUND', message: 'Builder profile not found' } },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate input
    const validationResult = createProjectSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: validationResult.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const projectData = validationResult.data;

    // Create project
    const project = await prisma.property.create({
      data: {
        ...projectData,
        created_by: userIdNum,
        builder_id: builder.id
      },
      include: {
        location: true
      }
    });

    return NextResponse.json({
      project: {
        id: project.id,
        slug: project.slug,
        title: project.title,
        description: project.description,
        propertyType: project.property_type,
        subType: project.sub_type,
        listingType: project.listing_type,
        location: project.location ? {
          name: project.location.name,
          city: project.location.city,
          state: project.location.state
        } : null,
        address: project.address,
        city: project.city,
        state: project.state,
        price: project.price,
        rentAmount: project.rent_amount,
        area: project.area,
        areaUnit: project.area_unit,
        bedrooms: project.bedrooms,
        bathrooms: project.bathrooms,
        possessionStatus: project.possession_status,
        projectName: project.project_name,
        status: project.status,
        featured: project.featured,
        premiumListing: project.premium_listing,
        createdAt: project.created_at,
        updatedAt: project.updated_at
      },
      success: true,
      message: 'Project created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating builder project:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create project' } },
      { status: 500 }
    );
  }
}