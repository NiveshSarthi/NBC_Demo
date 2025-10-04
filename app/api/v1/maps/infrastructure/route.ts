import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

// Mock infrastructure data - in a real app, this would come from the database
const mockInfrastructureData = {
  type: 'FeatureCollection',
  features: [
    // Expressways
    {
      type: 'Feature',
      properties: {
        type: 'expressway',
        name: 'Delhi-Mumbai Expressway',
        status: 'under_construction',
        completion_year: 2025,
        length_km: 1385,
        color: '#ef4444'
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [77.2167, 28.6667], // Delhi
          [75.8577, 22.7196], // Indore
          [72.5714, 23.0225], // Ahmedabad
          [72.8777, 19.0760]  // Mumbai
        ]
      }
    },
    // Airports
    {
      type: 'Feature',
      properties: {
        type: 'airport',
        name: 'Indira Gandhi International Airport',
        city: 'Delhi',
        status: 'operational',
        passenger_capacity: 100000000,
        color: '#3b82f6'
      },
      geometry: {
        type: 'Point',
        coordinates: [77.1031, 28.5562]
      }
    },
    {
      type: 'Feature',
      properties: {
        type: 'airport',
        name: 'Chhatrapati Shivaji Maharaj International Airport',
        city: 'Mumbai',
        status: 'operational',
        passenger_capacity: 95000000,
        color: '#3b82f6'
      },
      geometry: {
        type: 'Point',
        coordinates: [72.8679, 19.0896]
      }
    },
    {
      type: 'Feature',
      properties: {
        type: 'airport',
        name: 'Sardar Vallabhbhai Patel International Airport',
        city: 'Ahmedabad',
        status: 'operational',
        passenger_capacity: 15000000,
        color: '#3b82f6'
      },
      geometry: {
        type: 'Point',
        coordinates: [72.6358, 23.0737]
      }
    },
    // Metro lines (simplified)
    {
      type: 'Feature',
      properties: {
        type: 'metro',
        name: 'Delhi Metro Yellow Line',
        status: 'operational',
        length_km: 49.02,
        color: '#eab308'
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [77.2167, 28.6667], // Kashmere Gate
          [77.2244, 28.6358], // Chandni Chowk
          [77.2162, 28.6139]  // Chawri Bazar
        ]
      }
    }
  ]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // expressway, airport, metro, all

    // Use mock data for now (in production, this would come from database)
    let infrastructureData = mockInfrastructureData

    // Filter by type if specified
    if (type && type !== 'all') {
      infrastructureData = {
        ...mockInfrastructureData,
        features: mockInfrastructureData.features.filter(feature =>
          feature.properties.type === type
        )
      }
    }

    return NextResponse.json(infrastructureData)

  } catch (error) {
    console.error('Error fetching infrastructure data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch infrastructure data' },
      { status: 500 }
    )
  }
}