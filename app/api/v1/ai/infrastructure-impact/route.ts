import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('property_id');
    const infrastructureType = searchParams.get('infrastructure_type') || 'metro';
    const distanceKm = parseFloat(searchParams.get('distance_km') || '5');
    const projectPhase = searchParams.get('project_phase') || 'operational';

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }

    // Call Python ML service
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    const response = await fetch(
      `${mlServiceUrl}/api/v1/ai/infrastructure-impact?property_id=${propertyId}&infrastructure_type=${infrastructureType}&distance_km=${distanceKm}&project_phase=${projectPhase}`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      // If ML service is not available, return mock impact analysis
      console.warn('ML service unavailable, returning fallback infrastructure impact');
      return NextResponse.json({
        ...generateFallbackInfrastructureImpact(propertyId, infrastructureType, distanceKm, projectPhase),
        source: 'fallback'
      });
    }

    const data = await response.json();
    return NextResponse.json({
      ...data,
      source: 'ml-service'
    });

  } catch (error) {
    console.error('Infrastructure impact API error:', error);

    // Return fallback analysis on error
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('property_id') || 'default';
    const infrastructureType = searchParams.get('infrastructure_type') || 'metro';
    const distanceKm = parseFloat(searchParams.get('distance_km') || '5');
    const projectPhase = searchParams.get('project_phase') || 'operational';

    return NextResponse.json({
      ...generateFallbackInfrastructureImpact(propertyId, infrastructureType, distanceKm, projectPhase),
      source: 'fallback',
      error: 'ML service temporarily unavailable'
    });
  }
}

// Fallback infrastructure impact generator
function generateFallbackInfrastructureImpact(
  propertyId: string,
  infrastructureType: string,
  distanceKm: number,
  projectPhase: string
) {
  // Calculate impact based on distance and project phase
  const baseImpact = 1.0;
  const distanceFactor = Math.max(0, 1 - (distanceKm / 10)); // Impact decreases with distance
  const phaseMultiplier = { planning: 0.3, construction: 0.7, operational: 1.0 }[projectPhase] || 0.5;

  const impactScore = baseImpact * distanceFactor * phaseMultiplier * 100;

  // Generate appreciation curve
  const months = 60;
  const appreciationCurve = [];
  const now = new Date();

  for (let month = 1; month <= months; month++) {
    const date = new Date(now);
    date.setMonth(now.getMonth() + month);

    // S-curve growth model
    const growth = impactScore * (1 - Math.exp(-month / 24)) / 100;

    appreciationCurve.push({
      month: month,
      appreciation_percent: Math.round(growth * 100) / 100
    });
  }

  return {
    distance_km: distanceKm,
    impact_score: Math.round(impactScore * 100) / 100,
    predicted_appreciation: appreciationCurve,
    confidence: 0.85
  };
}