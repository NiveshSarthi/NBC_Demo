import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const propertyType = searchParams.get('propertyType')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')

    // Build where clause
    const where: any = {
      status: 'active',
      latitude: { not: null },
      longitude: { not: null }
    }

    if (city) where.city = city
    if (propertyType) where.property_type = propertyType
    if (minPrice) where.price = { ...where.price, gte: parseInt(minPrice) }
    if (maxPrice) where.price = { ...where.price, lte: parseInt(maxPrice) }

    const properties = await prisma.property.findMany({
      where,
      include: {
        images: {
          where: { is_primary: true },
          take: 1,
          select: { image_url: true }
        }
      },
      take: 500 // Limit for performance
    })

    // Convert to GeoJSON
    const geoJson = {
      type: 'FeatureCollection',
      features: properties.map((property) => ({
        type: 'Feature',
        properties: {
          id: property.id,
          title: property.title,
          price: property.price,
          propertyType: property.property_type,
          city: property.city,
          state: property.state,
          area: property.area,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          description: property.description,
          featured: property.featured,
          imageUrl: property.images[0]?.image_url || null
        },
        geometry: {
          type: 'Point',
          coordinates: [
            Number(property.longitude),
            Number(property.latitude)
          ]
        }
      }))
    }

    return NextResponse.json(geoJson)

  } catch (error) {
    console.error('Error fetching properties for map:', error)
    return NextResponse.json(
      { error: 'Failed to fetch properties data' },
      { status: 500 }
    )
  }
}