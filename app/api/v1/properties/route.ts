import { NextRequest, NextResponse } from 'next/server';
import { createPropertySchema, propertyFiltersSchema, paginationSchema } from '@/lib/auth';
import { PropertyModel } from '@/lib/models/property';
import { imageUploadService } from '@/lib/upload';
import { prisma } from '@/lib/database';

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

    // Parse form data for file uploads
    const formData = await request.formData();

    // Extract property data
    const propertyData: any = {};
    const images: File[] = [];

    for (const [key, value] of formData.entries()) {
      if (key === 'images' && value instanceof File) {
        images.push(value);
      } else if (key === 'amenities' || key === 'features') {
        // Handle arrays
        propertyData[key] = value.toString().split(',');
      } else if (key === 'latitude' || key === 'longitude' || key === 'price' || key === 'rentAmount' || key === 'area' || key === 'bedrooms' || key === 'bathrooms' || key === 'parkingSpaces' || key === 'floorNumber' || key === 'totalFloors' || key === 'yearBuilt' || key === 'locationId') {
        // Convert to numbers
        propertyData[key] = parseFloat(value.toString()) || parseInt(value.toString());
      } else if (key === 'reraRegistered' || key === 'featured' || key === 'premiumListing') {
        // Convert to boolean
        propertyData[key] = value.toString().toLowerCase() === 'true';
      } else if (key === 'possessionDate') {
        // Convert to date
        const dateStr = value.toString();
        if (dateStr) {
          propertyData[key] = new Date(dateStr);
        }
      } else if (key === 'infrastructureImpact') {
        // Parse JSON
        try {
          propertyData[key] = JSON.parse(value.toString());
        } catch {
          propertyData[key] = {};
        }
      } else {
        propertyData[key] = value.toString();
      }
    }

    // Validate property data
    const validationResult = createPropertySchema.safeParse(propertyData);
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

    const data = validationResult.data;
    const { title, description, propertyType, subType, listingType, locationId, address, city, state,
            pincode, latitude, longitude, price, rentAmount, rentPeriod, priceUnit, area, areaUnit, bedrooms,
            bathrooms, parkingSpaces, floorNumber, totalFloors, yearBuilt, furnishing,
            amenities, features, reraRegistered, reraNumber, ownershipType, possessionStatus,
            developerName, projectName, virtualTourUrl, videoTourUrl,
            religiousSignificance, infrastructureImpact, featured, premiumListing } = data;

    // Convert possessionDate from string to Date if present
    const possessionDate = data.possessionDate ? new Date(data.possessionDate) : undefined;

    // Create property
    const property = await PropertyModel.create({
      title,
      description,
      propertyType,
      subType,
      listingType,
      locationId,
      address,
      city,
      state,
      pincode,
      latitude,
      longitude,
      price,
      rentAmount,
      rentPeriod,
      priceUnit,
      area,
      areaUnit,
      bedrooms,
      bathrooms,
      parkingSpaces,
      floorNumber,
      totalFloors,
      yearBuilt,
      furnishing,
      amenities,
      features,
      reraRegistered,
      reraNumber,
      ownershipType,
      possessionStatus,
      possessionDate,
      developerName,
      projectName,
      virtualTourUrl,
      videoTourUrl,
      religiousSignificance,
      infrastructureImpact,
      featured,
      premiumListing,
    }, parseInt(userId));

    // Upload images if provided
    if (images.length > 0) {
      const imagePromises = images.map(async (file, index) => {
        try {
          const buffer = Buffer.from(await file.arrayBuffer());

          // Use the correct method signature
          const uploadResult = await imageUploadService.uploadImage(buffer, `properties/${property.id}`);

          // Check if it's Cloudinary result or local result
          if ('original' in uploadResult) {
            // Cloudinary result
            await prisma.propertyImage.create({
              data: {
                property_id: property.id,
                image_url: uploadResult.original.secureUrl,
                alt_text: `${property.title} - Image ${index + 1}`,
                is_primary: index === 0,
                sort_order: index,
                image_type: 'exterior',
              },
            });
          } else {
            // Local result
            await prisma.propertyImage.create({
              data: {
                property_id: property.id,
                image_url: uploadResult.url,
                alt_text: `${property.title} - Image ${index + 1}`,
                is_primary: index === 0,
                sort_order: index,
                image_type: 'exterior',
              },
            });
          }
        } catch (error) {
          console.error('Failed to upload image:', error);
        }
      });

      await Promise.all(imagePromises);
    }

    // Fetch the complete property with images
    const completeProperty = await PropertyModel.findById(property.id);

    return NextResponse.json({
      property: completeProperty,
      message: 'Property created successfully',
    });

  } catch (error) {
    console.error('Property creation error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while creating the property',
        },
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const filters: any = {};
    const pagination: any = {};

    // Extract filters
    const propertyType = searchParams.get('propertyType');
    if (propertyType) filters.propertyType = propertyType;

    const city = searchParams.get('city');
    if (city) filters.city = city;

    const state = searchParams.get('state');
    if (state) filters.state = state;

    const minPrice = searchParams.get('minPrice');
    if (minPrice) filters.minPrice = parseFloat(minPrice);

    const maxPrice = searchParams.get('maxPrice');
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);

    const minArea = searchParams.get('minArea');
    if (minArea) filters.minArea = parseFloat(minArea);

    const maxArea = searchParams.get('maxArea');
    if (maxArea) filters.maxArea = parseFloat(maxArea);

    const bedrooms = searchParams.get('bedrooms');
    if (bedrooms) filters.bedrooms = parseInt(bedrooms);

    const bathrooms = searchParams.get('bathrooms');
    if (bathrooms) filters.bathrooms = parseInt(bathrooms);

    const furnishing = searchParams.get('furnishing');
    if (furnishing) filters.furnishing = furnishing;

    const amenities = searchParams.get('amenities');
    if (amenities) filters.amenities = amenities.split(',');

    const featured = searchParams.get('featured');
    if (featured !== null) filters.featured = featured === 'true';

    const locationId = searchParams.get('locationId');
    if (locationId) filters.locationId = parseInt(locationId);

    // Extract pagination
    const page = searchParams.get('page');
    if (page) pagination.page = parseInt(page);

    const limit = searchParams.get('limit');
    if (limit) pagination.limit = parseInt(limit);

    const sortBy = searchParams.get('sortBy');
    if (sortBy) pagination.sortBy = sortBy as any;

    const sortOrder = searchParams.get('sortOrder');
    if (sortOrder) pagination.sortOrder = sortOrder as any;

    // Validate filters and pagination
    const filtersValidation = propertyFiltersSchema.safeParse(filters);
    const paginationValidation = paginationSchema.safeParse(pagination);

    if (!filtersValidation.success || !paginationValidation.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: [
              ...(!filtersValidation.success ? filtersValidation.error.issues : []),
              ...(!paginationValidation.success ? paginationValidation.error.issues : []),
            ],
          },
        },
        { status: 400 }
      );
    }

    // Get properties
    const result = await PropertyModel.findMany(
      filtersValidation.data,
      paginationValidation.data
    );

    return NextResponse.json(result);

  } catch (error) {
    console.error('Property list error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching properties',
        },
      },
      { status: 500 }
    );
  }
}