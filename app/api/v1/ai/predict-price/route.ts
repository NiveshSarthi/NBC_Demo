import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { property_id, months_ahead = 24 } = body;

    if (!property_id) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }

    // Call Python ML service
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    const response = await fetch(`${mlServiceUrl}/api/v1/ai/predict-price`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ property_id, months_ahead }),
    });

    if (!response.ok) {
      // If ML service is not available, return mock prediction
      console.warn('ML service unavailable, returning fallback price prediction');
      return NextResponse.json({
        current_prediction: generateFallbackPrediction(property_id),
        forecast: generateFallbackForecast(property_id, months_ahead),
        source: 'fallback'
      });
    }

    const data = await response.json();
    return NextResponse.json({
      ...data,
      source: 'ml-service'
    });

  } catch (error) {
    console.error('Price prediction API error:', error);

    // Return fallback prediction on error
    const { property_id = 'default', months_ahead = 24 } = await request.json().catch(() => ({}));

    return NextResponse.json({
      current_prediction: generateFallbackPrediction(property_id),
      forecast: generateFallbackForecast(property_id, months_ahead),
      source: 'fallback',
      error: 'ML service temporarily unavailable'
    });
  }
}

// Fallback prediction generator
function generateFallbackPrediction(propertyId: string): number {
  // Generate a realistic price based on property ID hash
  const hash = propertyId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const basePrice = 5000000; // 50 lakhs base
  const variation = (hash % 100) / 100; // 0-1 variation
  return Math.round(basePrice * (1 + variation * 2)); // 50 lakhs to 150 lakhs
}

// Fallback forecast generator
function generateFallbackForecast(propertyId: string, monthsAhead: number) {
  const currentPrice = generateFallbackPrediction(propertyId);
  const forecast = [];
  const now = new Date();

  // Simple growth model with seasonal variation
  for (let i = 1; i <= monthsAhead; i++) {
    const date = new Date(now);
    date.setMonth(now.getMonth() + i);

    // Base growth rate of 1% per month with some randomness
    const growthRate = 0.01 + (Math.sin(i / 12 * 2 * Math.PI) * 0.005); // Seasonal component
    const randomFactor = 1 + (Math.random() - 0.5) * 0.02; // Random variation
    const predictedPrice = currentPrice * Math.pow(1 + growthRate, i) * randomFactor;

    forecast.push({
      date: date.toISOString().split('T')[0],
      predicted_price: Math.round(predictedPrice),
      confidence_lower: Math.round(predictedPrice * 0.9),
      confidence_upper: Math.round(predictedPrice * 1.1)
    });
  }

  return forecast;
}