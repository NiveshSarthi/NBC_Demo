'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, School, Hospital, ShoppingCart, Train, TreePine, Church, CreditCard, Utensils, BarChart3 } from 'lucide-react';

// Dynamic import to avoid SSR issues with Leaflet
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
const LayersControl = dynamic(() => import('react-leaflet').then(mod => mod.LayersControl), { ssr: false });
const LayerGroup = dynamic(() => import('react-leaflet').then(mod => mod.LayerGroup), { ssr: false });

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

interface AmenityItem {
  name: string;
  distance: number;
  lat: number;
  lng: number;
  [key: string]: any;
}

interface Amenities {
  schools?: AmenityItem[];
  hospitals?: AmenityItem[];
  markets?: AmenityItem[];
  public_transport?: AmenityItem[];
  parks?: AmenityItem[];
  places_of_worship?: AmenityItem[];
  atms?: AmenityItem[];
  restaurants?: AmenityItem[];
}

interface NeighborhoodAnalysisDashboardProps {
  propertyLat: number;
  propertyLng: number;
  amenities: Amenities | null;
}

const amenityIcons = {
  schools: School,
  hospitals: Hospital,
  markets: ShoppingCart,
  public_transport: Train,
  parks: TreePine,
  places_of_worship: Church,
  atms: CreditCard,
  restaurants: Utensils,
};

const amenityColors = {
  schools: '#3b82f6',
  hospitals: '#ef4444',
  markets: '#10b981',
  public_transport: '#f59e0b',
  parks: '#22c55e',
  places_of_worship: '#8b5cf6',
  atms: '#06b6d4',
  restaurants: '#f97316',
};

export function NeighborhoodAnalysisDashboard({
  propertyLat,
  propertyLng,
  amenities
}: NeighborhoodAnalysisDashboardProps) {
  const [map, setMap] = useState<any>(null);
  const [activeLayers, setActiveLayers] = useState<Set<string>>(new Set([
    'schools', 'hospitals', 'markets', 'public_transport', 'parks', 'places_of_worship', 'atms', 'restaurants'
  ]));

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Generate summary statistics
  const generateSummary = () => {
    if (!amenities) return null;

    const summary: { [key: string]: { count: number; avgDistance: number; minDistance: number } } = {};

    Object.entries(amenities).forEach(([category, items]) => {
      if (!items || items.length === 0) return;

      const distances = items.map((item: AmenityItem) =>
        calculateDistance(propertyLat, propertyLng, item.lat, item.lng)
      );

      summary[category] = {
        count: items.length,
        avgDistance: distances.reduce((a: number, b: number) => a + b, 0) / distances.length,
        minDistance: Math.min(...distances),
      };
    });

    return summary;
  };

  const summary = generateSummary();

  // Toggle layer visibility
  const toggleLayer = (category: string) => {
    const newActiveLayers = new Set(activeLayers);
    if (newActiveLayers.has(category)) {
      newActiveLayers.delete(category);
    } else {
      newActiveLayers.add(category);
    }
    setActiveLayers(newActiveLayers);
  };

  const renderAmenityMarkers = (category: string, items: AmenityItem[]) => {
    if (!activeLayers.has(category)) return null;

    return items.map((item, index) => (
      <Marker
        key={`${category}-${index}`}
        position={[item.lat, item.lng]}
        icon={L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: ${amenityColors[category as keyof typeof amenityColors]}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
              ${getIconPath(category)}
            </svg>
          </div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        })}
      >
        <Popup>
          <div className="p-2">
            <h3 className="font-semibold">{item.name}</h3>
            <p className="text-sm text-gray-600">Distance: {item.distance?.toFixed(1)} km</p>
            {category === 'schools' && (
              <div className="text-sm">
                <p>Rating: {item.rating}/5</p>
                <p>Affiliation: {item.affiliation}</p>
              </div>
            )}
            {category === 'hospitals' && (
              <div className="text-sm">
                <p>Type: {item.type}</p>
                <p>Services: {item.services?.join(', ')}</p>
              </div>
            )}
            {category === 'restaurants' && (
              <div className="text-sm">
                <p>Cuisine: {item.cuisine}</p>
                <p>Rating: {item.rating}/5</p>
              </div>
            )}
            {category === 'atms' && (
              <div className="text-sm">
                <p>Bank: {item.bank}</p>
              </div>
            )}
          </div>
        </Popup>
      </Marker>
    ));
  };

  const getIconPath = (category: string) => {
    const iconPaths = {
      schools: '<path d="M12 2L2 7v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7L12 2z"/><path d="M9 10h6v6H9z"/>',
      hospitals: '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 14H7v-4h4v4zm6 0h-4v-4h4v4zm0-6H7V7h10v4z"/>',
      markets: '<path d="M7 4V2c0-.55.45-1 1-1h8c.55 0 1 .45 1 1v2h3c.55 0 1 .45 1 1v1c0 .55-.45 1-1 1h-.17l-1.83 11H7.83L6 8H5c-.55 0-1-.45-1-1V5c0-.55.45-1 1-1h3zM9 2v2h6V2H9z"/>',
      public_transport: '<path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zM8 10h8v2H8v-2z"/>',
      parks: '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>',
      places_of_worship: '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM9 9c0-1.66 1.34-3 3-3s3 1.34 3 3c0 1.66-1.34 3-3 3S9 10.66 9 9z"/>',
      atms: '<path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>',
      restaurants: '<path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v10c0 2.21 1.79 4 4 4v-2c-1.1 0-2-.9-2-2v-10c0-1.1-.9-2-2-2v2c1.1 0 2 .9 2 2z"/>',
    };
    return iconPaths[category as keyof typeof iconPaths] || '';
  };

  useEffect(() => {
    // Import Leaflet dynamically to avoid SSR issues
    import('leaflet').then(L => {
      // Fix default markers
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    });
  }, []);

  if (!amenities) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Neighborhood Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No amenities data available for this location.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Neighborhood Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Amenity Categories</h3>
            <div className="flex flex-wrap gap-2">
              {Object.keys(amenities).map(category => {
                const IconComponent = amenityIcons[category as keyof typeof amenityIcons];
                return (
                  <Button
                    key={category}
                    variant={activeLayers.has(category) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleLayer(category)}
                    className="flex items-center gap-1"
                  >
                    <IconComponent className="w-4 h-4" />
                    {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    {summary && summary[category] && (
                      <Badge variant="secondary" className="ml-1">
                        {summary[category].count}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="h-96 rounded-lg overflow-hidden border">
            <MapContainer
              center={[propertyLat, propertyLng]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              ref={setMap}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Property marker */}
              <Marker position={[propertyLat, propertyLng]}>
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold">Property Location</h3>
                  </div>
                </Popup>
              </Marker>

              {/* Amenity markers */}
              {Object.entries(amenities).map(([category, items]) =>
                items && renderAmenityMarkers(category, items)
              )}
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Summary Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(summary).map(([category, stats]) => {
                const IconComponent = amenityIcons[category as keyof typeof amenityIcons];
                return (
                  <div key={category} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <IconComponent className="w-5 h-5" style={{ color: amenityColors[category as keyof typeof amenityColors] }} />
                      <h4 className="font-semibold capitalize">{category.replace('_', ' ')}</h4>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p>Total: <span className="font-medium">{stats.count}</span></p>
                      <p>Avg Distance: <span className="font-medium">{stats.avgDistance.toFixed(1)} km</span></p>
                      <p>Nearest: <span className="font-medium">{stats.minDistance.toFixed(1)} km</span></p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}