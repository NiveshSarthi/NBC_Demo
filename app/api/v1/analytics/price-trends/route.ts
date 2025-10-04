import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

// Mock price trend data - in production this would be aggregated from property data
const mockPriceTrends = {
  faridabad: [
    { year: '2020', price: 2500 },
    { year: '2021', price: 2800 },
    { year: '2022', price: 3200 },
    { year: '2023', price: 3800 },
    { year: '2024', price: 4500 },
    { year: '2025', price: 5200, projected: true },
    { year: '2026', price: 6000, projected: true },
    { year: '2027', price: 6800, projected: true },
  ],
  dholera: [
    { year: '2020', price: 1800 },
    { year: '2021', price: 2100 },
    { year: '2022', price: 2500 },
    { year: '2023', price: 3100 },
    { year: '2024', price: 3900 },
    { year: '2025', price: 4800, projected: true },
    { year: '2026', price: 5800, projected: true },
    { year: '2027', price: 7000, projected: true },
  ],
  ayodhya: [
    { year: '2020', price: 2200 },
    { year: '2021', price: 2400 },
    { year: '2022', price: 2800 },
    { year: '2023', price: 3400 },
    { year: '2024', price: 4100 },
    { year: '2025', price: 4900, projected: true },
    { year: '2026', price: 5800, projected: true },
    { year: '2027', price: 6700, projected: true },
  ],
  vrindavan: [
    { year: '2020', price: 2000 },
    { year: '2021', price: 2200 },
    { year: '2022', price: 2600 },
    { year: '2023', price: 3000 },
    { year: '2024', price: 3600 },
    { year: '2025', price: 4200, projected: true },
    { year: '2026', price: 4900, projected: true },
    { year: '2027', price: 5600, projected: true },
  ]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const years = searchParams.get('years') || '5'

    // If specific city requested
    if (city) {
      const cityKey = city.toLowerCase()
      const cityData = mockPriceTrends[cityKey as keyof typeof mockPriceTrends]

      if (!cityData) {
        return NextResponse.json(
          { error: 'Price trends not found for this city' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        city: city,
        data: cityData,
        metadata: {
          years: parseInt(years),
          unit: 'INR per sq ft',
          lastUpdated: new Date().toISOString()
        }
      })
    }

    // Return all cities data for comparison
    const allData = Object.entries(mockPriceTrends).map(([cityName, data]) => ({
      city: cityName,
      data: data,
      currentPrice: data.find(d => !d.projected)?.price || 0,
      projectedGrowth: data.filter(d => d.projected).length > 0 ?
        ((data[data.length - 1].price - (data.find(d => !d.projected)?.price || 0)) /
         (data.find(d => !d.projected)?.price || 1)) * 100 : 0
    }))

    return NextResponse.json({
      trends: allData,
      metadata: {
        totalCities: allData.length,
        years: parseInt(years),
        unit: 'INR per sq ft',
        lastUpdated: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error fetching price trends:', error)
    return NextResponse.json(
      { error: 'Failed to fetch price trends data' },
      { status: 500 }
    )
  }
}