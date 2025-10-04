import { NextRequest, NextResponse } from 'next/server';
import { searchPropertySchema } from '@/lib/auth';
import { PropertyModel } from '@/lib/models/property';
import { nlpSearchProcessor, ParsedQuery } from '@/lib/ai/nlp-search';

// Helper function to generate smart filter suggestions
function generateSmartSuggestions(parsedQuery: ParsedQuery, currentFilters: any): any[] {
  const suggestions = [];

  // Suggest budget ranges if not specified
  if (!parsedQuery.budget_min && !parsedQuery.budget_max && !currentFilters.minPrice && !currentFilters.maxPrice) {
    if (parsedQuery.property_type === 'apartment' || parsedQuery.property_type === 'flat') {
      suggestions.push({
        type: 'budget',
        label: 'Budget ranges for apartments',
        options: [
          { label: 'Under ₹50L', minPrice: 0, maxPrice: 5000000 },
          { label: '₹50L - ₹1Cr', minPrice: 5000000, maxPrice: 10000000 },
          { label: '₹1Cr - ₹2Cr', minPrice: 10000000, maxPrice: 20000000 }
        ]
      });
    }
  }

  // Suggest nearby locations if location found
  if (parsedQuery.location) {
    const nearbyLocations = getNearbyLocations(parsedQuery.location);
    if (nearbyLocations.length > 0) {
      suggestions.push({
        type: 'location',
        label: `Areas near ${parsedQuery.location}`,
        options: nearbyLocations.map(loc => ({ label: loc, value: loc }))
      });
    }
  }

  // Suggest property types if not specified
  if (!parsedQuery.property_type && !currentFilters.propertyType) {
    suggestions.push({
      type: 'property_type',
      label: 'Popular property types',
      options: [
        { label: 'Apartments', value: 'residential' },
        { label: 'Villas', value: 'residential' },
        { label: 'Plots', value: 'plot' },
        { label: 'Commercial', value: 'commercial' }
      ]
    });
  }

  // Suggest amenities based on property type
  if (parsedQuery.property_type && (!parsedQuery.amenities || parsedQuery.amenities.length === 0)) {
    const amenitySuggestions = getAmenitySuggestions(parsedQuery.property_type);
    if (amenitySuggestions.length > 0) {
      suggestions.push({
        type: 'amenities',
        label: 'Popular amenities',
        options: amenitySuggestions.map(amenity => ({ label: amenity, value: amenity }))
      });
    }
  }

  return suggestions;
}

// Helper to get nearby locations (mock implementation)
function getNearbyLocations(location: string): string[] {
  const locationMap: { [key: string]: string[] } = {
    'delhi': ['Noida', 'Gurgaon', 'Faridabad', 'Ghaziabad'],
    'mumbai': ['Thane', 'Navi Mumbai', 'Andheri', 'Bandra'],
    'bangalore': ['Whitefield', 'Electronic City', 'HSR Layout', 'Koramangala'],
    'chennai': ['T. Nagar', 'Adyar', 'Anna Nagar', 'Velachery'],
    'pune': ['Koregaon Park', 'Kharadi', 'Wakad', 'Hinjewadi']
  };
  return locationMap[location.toLowerCase()] || [];
}

// Helper to get amenity suggestions
function getAmenitySuggestions(propertyType: string): string[] {
  if (propertyType === 'residential' || propertyType === 'apartment') {
    return ['parking', 'gym', 'swimming pool', 'security', 'garden'];
  }
  if (propertyType === 'commercial') {
    return ['parking', 'security', 'power backup', 'lift', 'conference room'];
  }
  return ['parking', 'security'];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract query parameter
    const query = searchParams.get('q') || '';

    // Parse other filters and pagination from query parameters
    const filters: any = {};
    const pagination: any = {};
    let smartSuggestions: any[] = [];

    // Parse natural language query for intelligent filters
    let parsedQuery: ParsedQuery | null = null;
    if (query.trim()) {
      parsedQuery = nlpSearchProcessor.parseQuery(query);

      // Apply NLP extracted filters
      if (parsedQuery.property_type) filters.propertyType = parsedQuery.property_type;
      if (parsedQuery.location) filters.city = parsedQuery.location;
      if (parsedQuery.bedrooms) filters.bedrooms = parsedQuery.bedrooms;
      if (parsedQuery.bathrooms) filters.bathrooms = parsedQuery.bathrooms;
      if (parsedQuery.budget_min) filters.minPrice = parsedQuery.budget_min;
      if (parsedQuery.budget_max) filters.maxPrice = parsedQuery.budget_max;
      if (parsedQuery.area_min) filters.minArea = parsedQuery.area_min;
      if (parsedQuery.area_max) filters.maxArea = parsedQuery.area_max;
      if (parsedQuery.amenities && parsedQuery.amenities.length > 0) filters.amenities = parsedQuery.amenities;

      // Generate smart suggestions for additional filters
      smartSuggestions = generateSmartSuggestions(parsedQuery, filters);
    }

    // Extract additional filters from URL params (these override NLP if explicitly set)
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

    // Validate the search request
    const validationResult = searchPropertySchema.safeParse({
      query,
      filters,
      pagination,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid search parameters',
            details: validationResult.error.issues,
          },
        },
        { status: 400 }
      );
    }

    // Perform search
    const result = await PropertyModel.search(
      validationResult.data.query,
      validationResult.data.filters || {},
      validationResult.data.pagination || {}
    );

    // Log search analytics (optional - for future enhancement)
    // You could track search queries here

    return NextResponse.json({
      ...result,
      smartSuggestions,
      parsedQuery: parsedQuery ? {
        ...parsedQuery,
        appliedFilters: Object.keys(filters).filter(key =>
          filters[key] !== undefined && filters[key] !== null
        )
      } : null
    });

  } catch (error) {
    console.error('Property search error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while searching properties',
        },
      },
      { status: 500 }
    );
  }
}