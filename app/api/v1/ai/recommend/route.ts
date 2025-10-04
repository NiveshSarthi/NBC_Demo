import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Call Python ML service
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    const response = await fetch(`${mlServiceUrl}/api/v1/ai/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      // If ML service is not available, return mock data
      console.warn('ML service unavailable, returning fallback recommendations');
      return NextResponse.json({
        recommendations: generateFallbackRecommendations(body),
        total_found: 10,
        source: 'fallback'
      });
    }

    const data = await response.json();
    return NextResponse.json({
      ...data,
      source: 'ml-service'
    });

  } catch (error) {
    console.error('AI recommend API error:', error);

    // Return fallback recommendations on error
    return NextResponse.json({
      recommendations: generateFallbackRecommendations({}),
      total_found: 10,
      source: 'fallback',
      error: 'ML service temporarily unavailable'
    });
  }
}

// Fallback recommendation generator
function generateFallbackRecommendations(userPreferences: any) {
  const mockProperties = [
    {
      id: '1',
      title: 'Modern 3BHK Apartment',
      price: 8500000,
      location: 'Gurgaon',
      property_type: 'apartment',
      bedrooms: 3,
      bathrooms: 2,
      area_sqft: 1400,
      age_years: 2,
      distance_to_city_center: 8,
      distance_to_metro: 1.5,
      match_score: 85
    },
    {
      id: '2',
      title: 'Luxury Villa with Garden',
      price: 25000000,
      location: 'Noida',
      property_type: 'villa',
      bedrooms: 4,
      bathrooms: 3,
      area_sqft: 2800,
      age_years: 1,
      distance_to_city_center: 12,
      distance_to_metro: 2.8,
      match_score: 78
    },
    {
      id: '3',
      title: 'Commercial Office Space',
      price: 15000000,
      location: 'Delhi',
      property_type: 'office',
      bedrooms: 0,
      bathrooms: 2,
      area_sqft: 1200,
      age_years: 3,
      distance_to_city_center: 5,
      distance_to_metro: 0.8,
      match_score: 92
    },
    {
      id: '4',
      title: '2BHK Budget Apartment',
      price: 4500000,
      location: 'Faridabad',
      property_type: 'apartment',
      bedrooms: 2,
      bathrooms: 2,
      area_sqft: 950,
      age_years: 5,
      distance_to_city_center: 15,
      distance_to_metro: 3.2,
      match_score: 68
    },
    {
      id: '5',
      title: 'Penthouse with City View',
      price: 35000000,
      location: 'Gurgaon',
      property_type: 'apartment',
      bedrooms: 4,
      bathrooms: 4,
      area_sqft: 3200,
      age_years: 0,
      distance_to_city_center: 6,
      distance_to_metro: 1.2,
      match_score: 95
    }
  ];

  // Filter based on user preferences
  let filtered = mockProperties;

  if (userPreferences.budget_min) {
    filtered = filtered.filter(p => p.price >= userPreferences.budget_min);
  }

  if (userPreferences.budget_max) {
    filtered = filtered.filter(p => p.price <= userPreferences.budget_max);
  }

  if (userPreferences.property_type) {
    filtered = filtered.filter(p => p.property_type === userPreferences.property_type);
  }

  if (userPreferences.bedrooms) {
    filtered = filtered.filter(p => p.bedrooms >= userPreferences.bedrooms);
  }

  // Return top matches
  return filtered
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 10);
}