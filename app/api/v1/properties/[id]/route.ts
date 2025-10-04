import { NextRequest, NextResponse } from 'next/server';
import { updatePropertySchema } from '@/lib/auth';
import { PropertyModel } from '@/lib/models/property';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    let property = null;

    // First try to parse as ID
    const propertyId = parseInt(id);
    if (!isNaN(propertyId)) {
      property = await PropertyModel.getPropertyDetails(propertyId);
    }

    // If not found by ID, try as slug
    if (!property) {
      property = await PropertyModel.findBySlug(id);
    }

    if (!property) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Property not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ property });

  } catch (error) {
    console.error('Property fetch error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching the property',
        },
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const propertyId = parseInt(id);
    if (isNaN(propertyId)) {
      return NextResponse.json(
        { error: { code: 'INVALID_ID', message: 'Invalid property ID' } },
        { status: 400 }
      );
    }

    // Get user ID from middleware
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Check if property exists and user owns it
    const existingProperty = await PropertyModel.findById(propertyId);
    if (!existingProperty) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Property not found' } },
        { status: 404 }
      );
    }

    // Check ownership
    if (existingProperty.created_by !== parseInt(userId)) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'You can only edit your own properties' } },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate input
    const validationResult = updatePropertySchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid property data',
            details: validationResult.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Convert possessionDate if present
    const processedUpdateData: any = { ...updateData };
    if (updateData.possessionDate) {
      processedUpdateData.possessionDate = new Date(updateData.possessionDate);
    }

    // Update property
    const updatedProperty = await PropertyModel.update(propertyId, processedUpdateData);

    return NextResponse.json({
      property: updatedProperty,
      message: 'Property updated successfully',
    });

  } catch (error) {
    console.error('Property update error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while updating the property',
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const propertyId = parseInt(id);
    if (isNaN(propertyId)) {
      return NextResponse.json(
        { error: { code: 'INVALID_ID', message: 'Invalid property ID' } },
        { status: 400 }
      );
    }

    // Get user ID from middleware
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Check if property exists and user owns it
    const existingProperty = await PropertyModel.findById(propertyId);
    if (!existingProperty) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Property not found' } },
        { status: 404 }
      );
    }

    // Check ownership
    if (existingProperty.created_by !== parseInt(userId)) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'You can only delete your own properties' } },
        { status: 403 }
      );
    }

    // Soft delete property
    await PropertyModel.softDelete(propertyId);

    return NextResponse.json({
      message: 'Property deleted successfully',
    });

  } catch (error) {
    console.error('Property delete error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while deleting the property',
        },
      },
      { status: 500 }
    );
  }
}