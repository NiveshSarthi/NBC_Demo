import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { property_data, current_price } = body;

    if (!property_data || !current_price) {
      return NextResponse.json(
        { error: 'Property data and current price are required' },
        { status: 400 }
      );
    }

    // Call Python ML service
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    const response = await fetch(`${mlServiceUrl}/api/v1/ai/investment-score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ property_data, current_price }),
    });

    if (!response.ok) {
      // If ML service is not available, return mock investment score
      console.warn('ML service unavailable, returning fallback investment score');
      return NextResponse.json({
        ...generateFallbackInvestmentScore(property_data, current_price),
        source: 'fallback'
      });
    }

    const data = await response.json();
    return NextResponse.json({
      ...data,
      source: 'ml-service'
    });

  } catch (error) {
    console.error('Investment score API error:', error);

    // Return fallback score on error
    const { property_data, current_price } = await request.json().catch(() => ({ property_data: {}, current_price: 0 }));

    return NextResponse.json({
      ...generateFallbackInvestmentScore(property_data, current_price),
      source: 'fallback',
      error: 'ML service temporarily unavailable'
    });
  }
}

// Fallback investment score generator
function generateFallbackInvestmentScore(propertyData: any, currentPrice: number) {
  // Calculate various factors
  const appreciationPotential = Math.min(100, Math.max(0, (10 - (propertyData.age_years || 5)) * 5 + (10 - (propertyData.distance_to_city_center || 5)) * 3));
  const rentalYield = ((propertyData.area_sqft || 1000) * 0.004) / currentPrice * 100; // 0.4% of property value monthly
  const locationGrowth = Math.min(100, Math.max(0, (10 - (propertyData.distance_to_city_center || 5)) * 10));
  const infrastructureImpact = Math.min(100, Math.max(0, (5 - (propertyData.distance_to_metro || 2)) * 20));
  const liquidityScore = 75; // Mock score
  const riskScore = Math.min(100, (propertyData.age_years || 5) * 3);

  // Weighted average
  const weights = [0.4, 0.2, 0.15, 0.1, 0.1, 0.05];
  const scores = [appreciationPotential, rentalYield, locationGrowth, infrastructureImpact, liquidityScore, riskScore];
  const finalScore = scores.reduce((sum, score, index) => sum + score * weights[index], 0);

  const recommendation = finalScore > 80 ? "Strong Buy" : finalScore > 60 ? "Buy" : finalScore > 40 ? "Hold" : "Avoid";

  return {
    total_score: Math.round(finalScore * 100) / 100,
    breakdown: {
      appreciation_potential: Math.round(appreciationPotential * 100) / 100,
      rental_yield: Math.round(rentalYield * 100) / 100,
      location_growth: Math.round(locationGrowth * 100) / 100,
      infrastructure_impact: Math.round(infrastructureImpact * 100) / 100,
      liquidity_score: liquidityScore,
      risk_score: Math.round(riskScore * 100) / 100
    },
    recommendation: recommendation
  };
}