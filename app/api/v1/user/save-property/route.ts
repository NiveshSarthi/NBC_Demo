import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PropertyModel } from '@/lib/models/property';

const savePropertySchema = z.object({
  propertyId: z.number(),
});

export async function POST(request: NextRequest) {
  try {
    // Get user ID from middleware
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validationResult = savePropertySchema.safeParse(body);
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

    const { propertyId } = validationResult.data;

    // Check if property exists
    const property = await PropertyModel.findById(propertyId);
    if (!property) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Property not found' } },
        { status: 404 }
      );
    }

    // Toggle save status
    const isSaved = await PropertyModel.toggleSaveProperty(parseInt(userId), propertyId);

    return NextResponse.json({
      success: true,
      saved: isSaved,
      message: isSaved ? 'Property saved successfully' : 'Property unsaved successfully',
    });

  } catch (error) {
    console.error('Save property error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while saving the property',
        },
      },
      { status: 500 }
    );
  }
}
