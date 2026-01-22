import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

// Mock master plan data - in a real app, this would come from the database
const mockMasterPlans: Record<string, any> = {
  faridabad: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          type: 'residential',
          name: 'Sector 15A Residential',
          area: '250 acres',
          completion: '2025',
          status: 'under_development'
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[[77.28, 28.38], [77.32, 28.38], [77.32, 28.42], [77.28, 28.42], [77.28, 28.38]]]
        }
      },
      {
        type: 'Feature',
        properties: {
          type: 'industrial',
          name: 'Sector 25 Industrial Zone',
          area: '180 acres',
          completion: '2024',
          status: 'completed'
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[[77.25, 28.35], [77.29, 28.35], [77.29, 28.39], [77.25, 28.39], [77.25, 28.35]]]
        }
      }
    ]
  },
  dholera: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          type: 'smart_city',
          name: 'Dholera Smart City Phase 1',
          area: '500 acres',
          completion: '2026',
          status: 'planned'
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[[72.15, 22.20], [72.25, 22.20], [72.25, 22.28], [72.15, 22.28], [72.15, 22.20]]]
        }
      }
    ]
  },
  ayodhya: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          type: 'tourism',
          name: 'Ram Janmabhoomi Development Zone',
          area: '150 acres',
          completion: '2025',
          status: 'under_development'
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[[82.18, 26.78], [82.22, 26.78], [82.22, 26.82], [82.18, 26.82], [82.18, 26.78]]]
        }
      }
    ]
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ city: string }> }
) {
  try {
    const { city: rawCity } = await params
    const city = rawCity.toLowerCase()

    // Try to get from database first
    const location = await prisma.location.findFirst({
      where: {
        city: { equals: city, mode: 'insensitive' }
      },
      select: {
        master_plan_data: true,
        master_plan_url: true
      }
    })

    if (location?.master_plan_data) {
      return NextResponse.json(location.master_plan_data)
    }

    // Fallback to mock data
    const mockData = mockMasterPlans[city]
    if (!mockData) {
      return NextResponse.json(
        { error: 'Master plan not found for this city' },
        { status: 404 }
      )
    }

    return NextResponse.json(mockData)

  } catch (error) {
    console.error('Error fetching master plan:', error)
    return NextResponse.json(
      { error: 'Failed to fetch master plan data' },
      { status: 500 }
    )
  }
}