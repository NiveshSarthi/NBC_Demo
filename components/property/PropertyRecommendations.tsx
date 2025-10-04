"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { MapPin, Bed, Bath, Square, TrendingUp } from "lucide-react";
import { propertyRecommender } from "@/lib/ai/property-recommender";

interface Property {
  id: number;
  title: string;
  price?: number;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  property_type: string;
  city?: string;
  state?: string;
  images?: { image_url: string; is_primary: boolean }[];
  predictions?: { prediction_type: string; predicted_value: number }[];
}

interface PropertyRecommendationsProps {
  currentProperty: Property;
  limit?: number;
}

export function PropertyRecommendations({ currentProperty, limit = 6 }: PropertyRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        setLoading(true);

        // Prepare user preferences from current property
        const userPrefs = {
          property_type: currentProperty.property_type,
          budget_min: currentProperty.price ? currentProperty.price * 0.8 : undefined, // ±20% range
          budget_max: currentProperty.price ? currentProperty.price * 1.2 : undefined,
          bedrooms: currentProperty.bedrooms,
          area_min: currentProperty.area ? currentProperty.area * 0.8 : undefined,
          area_max: currentProperty.area ? currentProperty.area * 1.2 : undefined,
          location: currentProperty.city || undefined,
        };

        // Fetch similar properties (excluding current property)
        const response = await fetch('/api/v1/properties/search', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch properties');
        }

        const data = await response.json();
        const allProperties = data.properties || [];

        // Filter out current property and limit results
        const similarProperties = allProperties
          .filter((prop: Property) => prop.id !== currentProperty.id)
          .slice(0, limit);

        setRecommendations(similarProperties);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [currentProperty, limit]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Properties Like This</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-32 bg-gray-200 animate-pulse" />
              <CardContent className="p-3">
                <div className="h-3 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 bg-gray-200 rounded animate-pulse mb-3 w-2/3" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || recommendations.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Properties Like This</h3>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">
              {error || "No similar properties found at the moment."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center">
        <TrendingUp className="h-5 w-5 mr-2" />
        Properties Like This
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((property) => (
          <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <div className="h-32 bg-gradient-to-br from-blue-400 to-blue-600 relative overflow-hidden">
                {property.images?.[0] ? (
                  <img
                    src={property.images[0].image_url}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-white text-xs">No Image</span>
                  </div>
                )}
              </div>
            </div>
            <CardContent className="p-3">
              <h4 className="font-medium text-sm line-clamp-2 mb-2">{property.title}</h4>
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="text-xs line-clamp-1">
                  {property.city}, {property.state}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-600 mb-2">
                {property.area && <span>{property.area} sq ft</span>}
                {property.bedrooms && <span>{property.bedrooms} BHK</span>}
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-green-600 text-sm">
                  ₹{property.price ? (property.price / 10000000).toFixed(1) + 'Cr' : 'Contact'}
                </span>
                {property.predictions?.find(p => p.prediction_type === 'roi_analysis') && (
                  <span className="text-green-600 font-medium text-xs">
                    ROI: {Number(property.predictions.find(p => p.prediction_type === 'roi_analysis')!.predicted_value).toFixed(1)}%
                  </span>
                )}
              </div>
              <Button className="w-full text-xs py-1 h-8" asChild>
                <Link href={`/properties/${property.id}`}>View Details</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="text-center">
        <Button variant="outline" asChild>
          <Link href={`/search?q=${encodeURIComponent(`similar to ${currentProperty.title}`)}`}>
            View More Similar Properties
          </Link>
        </Button>
      </div>
    </div>
  );
}