import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

// Mock market comparison data
const mockMarketComparison = [
  {
    city: 'Faridabad',
    currentPrice: 4500,
    yearOverYearGrowth: 18.2,
    projectedGrowth5Year: 92.0,
    totalProperties: 1250,
    avgRentalYield: 4.8,
    infrastructureScore: 8.5,
    investmentScore: 8.2,
    riskLevel: 'Medium',
    marketMaturity: 'Mature'
  },
  {
    city: 'Dholera',
    currentPrice: 3900,
    yearOverYearGrowth: 25.8,
    projectedGrowth5Year: 133.0,
    totalProperties: 340,
    avgRentalYield: 3.2,
    infrastructureScore: 9.2,
    investmentScore: 9.5,
    riskLevel: 'Low',
    marketMaturity: 'Emerging'
  },
  {
    city: 'Ayodhya',
    currentPrice: 4100,
    yearOverYearGrowth: 20.6,
    projectedGrowth5Year: 118.0,
    totalProperties: 890,
    avgRentalYield: 4.1,
    infrastructureScore: 8.8,
    investmentScore: 9.0,
    riskLevel: 'Medium',
    marketMaturity: 'Growing'
  },
  {
    city: 'Vrindavan',
    currentPrice: 3600,
    yearOverYearGrowth: 20.0,
    projectedGrowth5Year: 105.0,
    totalProperties: 675,
    avgRentalYield: 5.2,
    infrastructureScore: 7.9,
    investmentScore: 8.8,
    riskLevel: 'Medium-Low',
    marketMaturity: 'Developing'
  },
  {
    city: 'Greater Noida',
    currentPrice: 4200,
    yearOverYearGrowth: 15.5,
    projectedGrowth5Year: 85.0,
    totalProperties: 1580,
    avgRentalYield: 4.6,
    infrastructureScore: 8.7,
    investmentScore: 8.0,
    riskLevel: 'Low',
    marketMaturity: 'Established'
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sortBy = searchParams.get('sortBy') || 'investmentScore'
    const order = searchParams.get('order') || 'desc'
    const limit = parseInt(searchParams.get('limit') || '10')

    // In production, this would aggregate data from properties and analytics tables
    let data = [...mockMarketComparison]

    // Sort data
    data.sort((a: any, b: any) => {
      const aVal = a[sortBy]
      const bVal = b[sortBy]

      if (order === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    // Limit results
    data = data.slice(0, limit)

    // Calculate summary statistics
    const summary = {
      totalCities: mockMarketComparison.length,
      avgGrowth: mockMarketComparison.reduce((sum, city) => sum + city.yearOverYearGrowth, 0) / mockMarketComparison.length,
      avgPrice: mockMarketComparison.reduce((sum, city) => sum + city.currentPrice, 0) / mockMarketComparison.length,
      topPerformer: mockMarketComparison.reduce((prev, current) =>
        prev.investmentScore > current.investmentScore ? prev : current
      ).city,
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json({
      comparison: data,
      summary,
      metadata: {
        sortedBy: sortBy,
        order: order,
        limit: limit,
        unit: 'INR per sq ft',
        metrics: [
          'currentPrice',
          'yearOverYearGrowth',
          'projectedGrowth5Year',
          'investmentScore',
          'infrastructureScore',
          'avgRentalYield'
        ]
      }
    })

  } catch (error) {
    console.error('Error fetching market comparison:', error)
    return NextResponse.json(
      { error: 'Failed to fetch market comparison data' },
      { status: 500 }
    )
  }
}