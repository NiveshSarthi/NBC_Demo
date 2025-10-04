import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { property_data, site_name, distance_to_site } = body;

    if (!property_data || !site_name) {
      return NextResponse.json(
        { error: 'Property data and site name are required' },
        { status: 400 }
      );
    }

    // Call Python ML service
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    const response = await fetch(`${mlServiceUrl}/api/v1/ai/religious-roi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ property_data, site_name, distance_to_site }),
    });

    if (!response.ok) {
      // If ML service is not available, return mock ROI calculation
      console.warn('ML service unavailable, returning fallback religious ROI');
      return NextResponse.json({
        ...generateFallbackReligiousROI(property_data, site_name, distance_to_site),
        source: 'fallback'
      });
    }

    const data = await response.json();
    return NextResponse.json({
      ...data,
      source: 'ml-service'
    });

  } catch (error) {
    console.error('Religious ROI API error:', error);

    // Return fallback calculation on error
    const { property_data, site_name, distance_to_site } = await request.json().catch(() => ({
      property_data: {},
      site_name: 'Unknown Temple',
      distance_to_site: 5
    }));

    return NextResponse.json({
      ...generateFallbackReligiousROI(property_data, site_name, distance_to_site),
      source: 'fallback',
      error: 'ML service temporarily unavailable'
    });
  }
}

// Fallback religious ROI calculator
function generateFallbackReligiousROI(propertyData: any, siteName: string, distanceToSite: number = 5) {
  // Mock religious site data
  const siteData = {
    annual_footfall: 5000000,
    peak_season_occupancy: 0.85,
    off_season_occupancy: 0.45
  };

  // Calculate occupancy based on distance
  const distanceFactor = Math.max(0, 1 - (distanceToSite / 50)); // Impact decreases with distance
  const occupancyRate = (siteData.peak_season_occupancy * 0.6 + siteData.off_season_occupancy * 0.4) * distanceFactor;

  // Calculate rental income
  const monthlyRental = (propertyData.area_sqft || 1000) * 0.004; // 0.4% of property value monthly

  // Tourism premium
  const tourismPremium = 1 + (siteData.annual_footfall / 10000000) * 0.5;

  // Operating costs (30% of rental income)
  const operatingCosts = monthlyRental * 0.3;

  // Net operating income
  const noi = (monthlyRental * occupancyRate * tourismPremium) - operatingCosts;

  // ROI calculation
  const totalInvestment = (propertyData.area_sqft || 1000) * 3000; // Assuming 3000/sqft
  const annualRoi = (noi * 12) / totalInvestment * 100;
  const breakEvenYears = noi > 0 ? totalInvestment / (noi * 12) : null;

  return {
    occupancy_rate: Math.round(occupancyRate * 100) / 100,
    monthly_rental: Math.round(monthlyRental * 100) / 100,
    tourism_premium: Math.round(tourismPremium * 100) / 100,
    annual_roi_percent: Math.round(annualRoi * 100) / 100,
    break_even_years: breakEvenYears ? Math.round(breakEvenYears * 100) / 100 : null,
    confidence: 0.75
  };
}