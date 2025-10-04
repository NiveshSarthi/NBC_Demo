import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const metric = searchParams.get('metric') || 'growth_rate' // growth_rate, price, investment_score

    // Get location data with growth rates
    const locations = await prisma.location.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
        growth_rate: { not: null }
      },
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
        latitude: true,
        longitude: true,
        growth_rate: true,
        population: true,
        investment_potential: true
      }
    })

    // Convert to GeoJSON with heatmap data
    const geoJson = {
      type: 'FeatureCollection',
      features: locations.map((location) => {
        let value = 0
        let color = '#6b7280' // Default gray

        switch (metric) {
          case 'growth_rate':
            value = Number(location.growth_rate)
            if (value >= 15) color = '#dc2626' // Red - very high
            else if (value >= 12) color = '#ea580c' // Orange - high
            else if (value >= 9) color = '#ca8a04' // Yellow - medium
            else if (value >= 6) color = '#65a30d' // Light green - low-medium
            else color = '#16a34a' // Green - low
            break
          case 'investment_score':
            value = Number(location.investment_potential) * 10 // Convert to percentage-like
            if (value >= 8) color = '#dc2626'
            else if (value >= 7) color = '#ea580c'
            else if (value >= 6) color = '#ca8a04'
            else if (value >= 5) color = '#65a30d'
            else color = '#16a34a'
            break
          default:
            value = Number(location.growth_rate)
            color = '#3b82f6'
        }

        return {
          type: 'Feature',
          properties: {
            id: location.id,
            name: location.name,
            city: location.city,
            state: location.state,
            value: value,
            color: color,
            population: location.population ? Number(location.population) : null,
            metric: metric
          },
          geometry: {
            type: 'Point',
            coordinates: [
              Number(location.longitude),
              Number(location.latitude)
            ]
          }
        }
      })
    }

    return NextResponse.json(geoJson)

  } catch (error) {
    console.error('Error fetching heatmap data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch heatmap data' },
      { status: 500 }
    )
  }
}