'use client'

import { useEffect, useState } from 'react'
import { BaseMap, GeoJSONLayer } from '@/components/maps'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, TrendingUp, BarChart3, RefreshCw } from 'lucide-react'
import type L from 'leaflet'

// Mock growth rate data for Indian cities
const growthData = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        city: 'Faridabad',
        growthRate: 15.2,
        color: '#ff0000' // High growth - red
      },
      geometry: {
        type: 'Point',
        coordinates: [77.3064, 28.4089]
      }
    },
    {
      type: 'Feature',
      properties: {
        city: 'Dholera',
        growthRate: 18.7,
        color: '#ff0000'
      },
      geometry: {
        type: 'Point',
        coordinates: [72.1919, 22.2442]
      }
    },
    {
      type: 'Feature',
      properties: {
        city: 'Ayodhya',
        growthRate: 12.3,
        color: '#ff6600' // Medium-high growth - orange
      },
      geometry: {
        type: 'Point',
        coordinates: [82.1998, 26.7981]
      }
    },
    {
      type: 'Feature',
      properties: {
        city: 'Vrindavan',
        growthRate: 9.8,
        color: '#ffcc00' // Medium growth - yellow
      },
      geometry: {
        type: 'Point',
        coordinates: [77.6982, 27.5811]
      }
    },
    {
      type: 'Feature',
      properties: {
        city: 'Greater Noida',
        growthRate: 8.5,
        color: '#ffff00'
      },
      geometry: {
        type: 'Point',
        coordinates: [77.5360, 28.4744]
      }
    },
    // Add more cities...
  ]
}

export default function GrowthHeatmapPage() {
  const [selectedCity, setSelectedCity] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const getColor = (growthRate: number) => {
    if (growthRate >= 15) return '#ff0000' // Red - very high
    if (growthRate >= 12) return '#ff6600' // Orange - high
    if (growthRate >= 9) return '#ffcc00'  // Yellow - medium
    if (growthRate >= 6) return '#99ff00'  // Light green - low-medium
    return '#00ff00' // Green - low
  }

  const onEachFeature = (feature: any, layer: any) => {
    layer.bindPopup(`
      <div class="p-2">
        <h3 class="font-bold text-lg">${feature.properties.city}</h3>
        <p class="text-sm">Growth Rate: <span class="font-semibold">${feature.properties.growthRate}%</span></p>
        <p class="text-xs text-gray-600 mt-1">Annual property value increase</p>
      </div>
    `)

    layer.on('click', () => {
      setSelectedCity(feature.properties)
    })
  }

  const pointToLayer = (feature: any, latlng: any) => {
    const color = getColor(feature.properties.growthRate)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require('leaflet')
    return L.circleMarker(latlng, {
      color: color,
      fillColor: color,
      fillOpacity: 0.8,
      radius: Math.max(8, feature.properties.growthRate / 2), // Size based on growth rate
      weight: 2
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            All-India Growth Heatmap
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Visualize property growth rates across India's emerging markets.
            Red indicates highest growth potential, green shows moderate growth.
          </p>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-sm">15%+ Annual Growth</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              <span className="text-sm">12-15% Annual Growth</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">9-12% Annual Growth</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-300 rounded-full"></div>
              <span className="text-sm">6-9% Annual Growth</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-sm">0-6% Annual Growth</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Growth Rate Map
                </CardTitle>
                <CardDescription>
                  Interactive map showing annual property growth rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BaseMap
                  center={[20.5937, 78.9629]}
                  zoom={5}
                  className="h-96 lg:h-[600px] w-full"
                >
                  <GeoJSONLayer
                    data={growthData}
                    pointToLayer={pointToLayer}
                    onEachFeature={onEachFeature}
                  />
                </BaseMap>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected City Info */}
            {selectedCity && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {selectedCity.city}
                    <Badge variant="secondary">
                      {selectedCity.growthRate}% Growth
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Annual Growth</p>
                        <p className="font-semibold">{selectedCity.growthRate}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">5-Year Projection</p>
                        <p className="font-semibold">{(selectedCity.growthRate * 5).toFixed(1)}%</p>
                      </div>
                    </div>
                    <Button className="w-full" size="sm">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      View Properties
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Growing Cities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Top Growing Cities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {growthData.features
                    .sort((a: any, b: any) => b.properties.growthRate - a.properties.growthRate)
                    .slice(0, 5)
                    .map((city: any, index: number) => (
                      <div
                        key={city.properties.city}
                        className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedCity(city.properties)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-500">
                            #{index + 1}
                          </span>
                          <span className="font-medium">{city.properties.city}</span>
                        </div>
                        <Badge variant="outline">
                          {city.properties.growthRate}%
                        </Badge>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>

            {/* Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Map Controls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setIsLoading(true)}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh Data
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    Export Map
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}