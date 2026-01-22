import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

const updateProjectSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  propertyType: z.enum(['residential', 'commercial', 'plot', 'religious']).optional(),
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
  areaUnit: z.enum(['sqft', 'sqm', 'acre', 'hectare']).optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  possessionStatus: z.enum(['ready_to_move', 'under_construction', 'new_launch']).optional(),
  projectName: z.string().optional(),
  status: z.enum(['active', 'sold', 'rented', 'inactive']).optional(),
  featured: z.boolean().optional(),
  premiumListing: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const projectId = parseInt(id);

    // Get project with ownership check
    const project = await prisma.property.findFirst({
      where: {
        id: projectId,
        builder_id: userIdNum
      },
      include: {
        location: true,
        images: true,
        _count: {
          select: {
            inquiries: true,
            analytics: {
              where: {
                event_type: 'view'
              }
            }
          }
        }
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: { code: 'PROJECT_NOT_FOUND', message: 'Project not found or access denied' } },
        { status: 404 }
      );
    }

    // Transform response
    const transformedProject = {
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
      pincode: project.pincode,
      latitude: project.latitude,
      longitude: project.longitude,
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
      images: project.images.map(img => ({
        id: img.id,
        url: img.image_url,
        altText: img.alt_text,
        isPrimary: img.is_primary,
        sortOrder: img.sort_order,
        imageType: img.image_type
      })),
      analytics: {
        inquiries: project._count.inquiries,
        views: project._count.analytics
      }
    };

    return NextResponse.json({ project: transformedProject });

  } catch (error) {
    console.error('Error fetching builder project:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch project' } },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const projectId = parseInt(id);
    const body = await request.json();

    // Validate input
    const validationResult = updateProjectSchema.safeParse(body);
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

    const updateData = validationResult.data;

    // Check if project exists and belongs to builder
    const existingProject = await prisma.property.findFirst({
      where: {
        id: projectId,
        builder_id: userIdNum
      }
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: { code: 'PROJECT_NOT_FOUND', message: 'Project not found or access denied' } },
        { status: 404 }
      );
    }

    // Update project
    const updatedProject = await prisma.property.update({
      where: { id: projectId },
      data: updateData,
      include: {
        location: true
      }
    });

    return NextResponse.json({
      project: {
        id: updatedProject.id,
        slug: updatedProject.slug,
        title: updatedProject.title,
        description: updatedProject.description,
        propertyType: updatedProject.property_type,
        subType: updatedProject.sub_type,
        listingType: updatedProject.listing_type,
        location: updatedProject.location ? {
          name: updatedProject.location.name,
          city: updatedProject.location.city,
          state: updatedProject.location.state
        } : null,
        address: updatedProject.address,
        city: updatedProject.city,
        state: updatedProject.state,
        price: updatedProject.price,
        rentAmount: updatedProject.rent_amount,
        area: updatedProject.area,
        areaUnit: updatedProject.area_unit,
        bedrooms: updatedProject.bedrooms,
        bathrooms: updatedProject.bathrooms,
        possessionStatus: updatedProject.possession_status,
        projectName: updatedProject.project_name,
        status: updatedProject.status,
        featured: updatedProject.featured,
        premiumListing: updatedProject.premium_listing,
        updatedAt: updatedProject.updated_at
      },
      success: true,
      message: 'Project updated successfully'
    });

  } catch (error) {
    console.error('Error updating builder project:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update project' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const projectId = parseInt(id);

    // Check if project exists and belongs to builder
    const existingProject = await prisma.property.findFirst({
      where: {
        id: projectId,
        builder_id: userIdNum
      }
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: { code: 'PROJECT_NOT_FOUND', message: 'Project not found or access denied' } },
        { status: 404 }
      );
    }

    // Soft delete by setting status to inactive
    await prisma.property.update({
      where: { id: projectId },
      data: { status: 'inactive' }
    });

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting builder project:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to delete project' } },
      { status: 500 }
    );
  }
}