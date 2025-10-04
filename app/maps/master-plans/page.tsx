'use client'

import { useState } from 'react'
import { BaseMap, GeoJSONLayer } from '@/components/maps'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
// Using buttons instead of tabs for city selection
import { MapPin, Building, Home, Factory, TreePine, Car, Zap } from 'lucide-react'
import L from 'leaflet'

// Mock master plan data for different cities
const masterPlans = {
  faridabad: {
    name: 'Faridabad Master Plan',
    center: [28.4089, 77.3064] as [number, number],
    zoom: 12,
    features: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            type: 'residential',
            name: 'Sector 15A Residential',
            area: '250 acres',
            completion: '2025'
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
            completion: '2024'
          },
          geometry: {
            type: 'Polygon',
            coordinates: [[[77.25, 28.35], [77.29, 28.35], [77.29, 28.39], [77.25, 28.39], [77.25, 28.35]]]
          }
        }
      ]
    }
  },
  dholera: {
    name: 'Dholera Master Plan',
    center: [22.2442, 72.1919] as [number, number],
    zoom: 11,
    features: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            type: 'smart_city',
            name: 'Dholera Smart City Phase 1',
            area: '500 acres',
            completion: '2026'
          },
          geometry: {
            type: 'Polygon',
            coordinates: [[[72.15, 22.20], [72.25, 22.20], [72.25, 22.28], [72.15, 22.28], [72.15, 22.20]]]
          }
        }
      ]
    }
  },
  ayodhya: {
    name: 'Ayodhya Master Plan',
    center: [26.7981, 82.1998] as [number, number],
    zoom: 12,
    features: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            type: 'tourism',
            name: 'Ram Janmabhoomi Development Zone',
            area: '150 acres',
            completion: '2025'
          },
          geometry: {
            type: 'Polygon',
            coordinates: [[[82.18, 26.78], [82.22, 26.78], [82.22, 26.82], [82.18, 26.82], [82.18, 26.78]]]
          }
        }
      ]
    }
  }
}

export default function MasterPlansPage() {
  const [selectedCity, setSelectedCity] = useState('faridabad')
  const [selectedFeature, setSelectedFeature] = useState<any>(null)

  const currentPlan = masterPlans[selectedCity as keyof typeof masterPlans]

  const getStyle = (feature: any) => {
    const type = feature.properties.type
    switch (type) {
      case 'residential':
        return { color: '#3b82f6', fillColor: '#3b82f6', weight: 2, opacity: 1, fillOpacity: 0.3 }
      case 'industrial':
        return { color: '#f59e0b', fillColor: '#f59e0b', weight: 2, opacity: 1, fillOpacity: 0.3 }
      case 'smart_city':
        return { color: '#10b981', fillColor: '#10b981', weight: 2, opacity: 1, fillOpacity: 0.3 }
      case 'tourism':
        return { color: '#8b5cf6', fillColor: '#8b5cf6', weight: 2, opacity: 1, fillOpacity: 0.3 }
      default:
        return { color: '#6b7280', fillColor: '#6b7280', weight: 2, opacity: 1, fillOpacity: 0.3 }
    }
  }

  const onEachFeature = (feature: any, layer: any) => {
    layer.bindPopup(`
      <div class="p-3 min-w-64">
        <h3 class="font-bold text-lg mb-2">${feature.properties.name}</h3>
        <div class="space-y-1 text-sm">
          <p><span class="font-medium">Type:</span> ${feature.properties.type.replace('_', ' ').toUpperCase()}</p>
          <p><span class="font-medium">Area:</span> ${feature.properties.area}</p>
          <p><span class="font-medium">Completion:</span> ${feature.properties.completion}</p>
        </div>
      </div>
    `)

    layer.on('click', () => {
      setSelectedFeature(feature.properties)
    })
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'residential': return <Home className="w-4 h-4" />
      case 'industrial': return <Factory className="w-4 h-4" />
      case 'smart_city': return <Zap className="w-4 h-4" />
      case 'tourism': return <TreePine className="w-4 h-4" />
      default: return <MapPin className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Master Plan Maps
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Explore detailed city master plans for India's emerging economic hubs.
            View residential zones, industrial areas, and infrastructure developments.
          </p>
        </div>
      </div>

      <div className="mb-6">
          <div className="flex gap-2 mb-6">
            {Object.keys(masterPlans).map((cityKey) => (
              <Button
                key={cityKey}
                variant={selectedCity === cityKey ? "default" : "outline"}
                onClick={() => setSelectedCity(cityKey)}
                className="capitalize"
              >
                {masterPlans[cityKey as keyof typeof masterPlans].name.replace(' Master Plan', '')}
              </Button>
            ))}
          </div>

          <div className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Map Section */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="w-5 h-5" />
                      {currentPlan.name}
                    </CardTitle>
                    <CardDescription>
                      Interactive master plan showing development zones and infrastructure
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <BaseMap
                      center={currentPlan.center}
                      zoom={currentPlan.zoom}
                      className="h-96 lg:h-[600px] w-full"
                    >
                      <GeoJSONLayer
                        data={currentPlan.features}
                        style={getStyle}
                        onEachFeature={onEachFeature}
                      />
                    </BaseMap>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Legend */}
                <Card>
                  <CardHeader>
                    <CardTitle>Development Zones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                        <span className="text-sm flex items-center gap-2">
                          <Home className="w-3 h-3" />
                          Residential
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                        <span className="text-sm flex items-center gap-2">
                          <Factory className="w-3 h-3" />
                          Industrial
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span className="text-sm flex items-center gap-2">
                          <Zap className="w-3 h-3" />
                          Smart City
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-purple-500 rounded"></div>
                        <span className="text-sm flex items-center gap-2">
                          <TreePine className="w-3 h-3" />
                          Tourism
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Selected Feature Info */}
                {selectedFeature && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {getIcon(selectedFeature.type)}
                        {selectedFeature.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Type</p>
                            <Badge variant="outline" className="mt-1">
                              {selectedFeature.type.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-gray-500">Area</p>
                            <p className="font-semibold">{selectedFeature.area}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Completion</p>
                            <p className="font-semibold">{selectedFeature.completion}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Status</p>
                            <Badge variant="secondary">Planned</Badge>
                          </div>
                        </div>
                        <Button className="w-full" size="sm">
                          <MapPin className="w-4 h-4 mr-2" />
                          View Properties
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Development Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Development Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Total Zones</p>
                          <p className="text-2xl font-bold">
                            {currentPlan.features.features.length}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Completion Year</p>
                          <p className="text-lg font-semibold">2025-2026</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        Download Master Plan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
      </div>
    </div>
  )
}