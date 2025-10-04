'use client'

import { BaseMap, GeoJSONLayer, PropertyMarker } from '@/components/maps'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Church, Users, TrendingUp } from 'lucide-react'
import L from 'leaflet'

// Mock religious tourism data
const religiousSites = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        name: 'Ram Janmabhoomi Temple',
        city: 'Ayodhya',
        type: 'hindu',
        visitors: '5M+',
        significance: 'Birthplace of Lord Rama'
      },
      geometry: {
        type: 'Point',
        coordinates: [82.1998, 26.7981]
      }
    },
    {
      type: 'Feature',
      properties: {
        name: 'Krishna Balaram Temple',
        city: 'Vrindavan',
        type: 'hindu',
        visitors: '2M+',
        significance: 'Dedicated to Krishna and Balarama'
      },
      geometry: {
        type: 'Point',
        coordinates: [77.6982, 27.5811]
      }
    },
    {
      type: 'Feature',
      properties: {
        name: 'Banke Bihari Temple',
        city: 'Vrindavan',
        type: 'hindu',
        visitors: '3M+',
        significance: 'Famous Krishna temple'
      },
      geometry: {
        type: 'Point',
        coordinates: [77.7000, 27.5800]
      }
    }
  ]
}

export default function ReligiousTourismPage() {
  const onEachFeature = (feature: any, layer: any) => {
    layer.bindPopup(`
      <div class="p-3 min-w-64">
        <h3 class="font-bold text-lg mb-2">${feature.properties.name}</h3>
        <p class="text-sm text-gray-600 mb-2">${feature.properties.city}</p>
        <div class="space-y-1 text-sm">
          <p><span class="font-medium">Significance:</span> ${feature.properties.significance}</p>
          <p><span class="font-medium">Annual Visitors:</span> ${feature.properties.visitors}</p>
          <p><span class="font-medium">Type:</span> ${feature.properties.type.toUpperCase()}</p>
        </div>
      </div>
    `)
  }

  const pointToLayer = (feature: any, latlng: any) => {
    return L.circleMarker(latlng, {
      color: '#8b5cf6',
      fillColor: '#8b5cf6',
      fillOpacity: 0.8,
      radius: 12,
      weight: 2
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Religious Tourism Corridor
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Explore sacred sites and pilgrimage destinations driving real estate development across India's spiritual landscape.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Church className="w-5 h-5" />
                  Religious Tourism Map
                </CardTitle>
                <CardDescription>
                  Major pilgrimage sites and religious tourism destinations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BaseMap
                  center={[26.7981, 82.1998]}
                  zoom={8}
                  className="h-96 lg:h-[600px] w-full"
                >
                  <GeoJSONLayer
                    data={religiousSites}
                    pointToLayer={pointToLayer}
                    onEachFeature={onEachFeature}
                  />
                </BaseMap>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Site Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Major Sites
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {religiousSites.features.map((site: any, index: number) => (
                    <div key={index} className="p-3 border rounded-lg hover:bg-gray-50">
                      <h4 className="font-semibold">{site.properties.name}</h4>
                      <p className="text-sm text-gray-600">{site.properties.city}</p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline">{site.properties.visitors} visitors</Badge>
                        <Badge variant="secondary">{site.properties.type}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tourism Impact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Tourism Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Annual Pilgrims</p>
                      <p className="text-2xl font-bold">50M+</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Economic Impact</p>
                      <p className="text-2xl font-bold">₹25K Cr</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Religious tourism drives infrastructure development and real estate growth in sacred cities.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}