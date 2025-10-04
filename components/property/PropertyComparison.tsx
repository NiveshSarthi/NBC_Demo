'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, MapPin, Building, Calendar, TrendingUp } from 'lucide-react';

interface Property {
  id: number;
  title: string;
  price?: number;
  rent_amount?: number;
  rent_period?: string;
  listing_type?: string;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  features?: string[];
  developer_name?: string;
  project_name?: string;
  city?: string;
  state?: string;
  images?: Array<{ image_url: string; alt_text?: string; is_primary?: boolean }>;
  predictions?: Array<{ prediction_type: string; predicted_value: any }>;
  rera_registered?: boolean;
  rera_number?: string;
  possession_status?: string;
  year_built?: number;
}

interface PropertyComparisonProps {
  properties: Property[];
}

export function PropertyComparison({ properties }: PropertyComparisonProps) {
  const [selectedProperties, setSelectedProperties] = useState<Property[]>(properties);

  // Limit to 4 properties
  const displayProperties = selectedProperties.slice(0, 4);

  // Common amenities across all properties for comparison
  const allAmenities = Array.from(
    new Set(displayProperties.flatMap(p => p.amenities || []))
  ).sort();

  // Calculate price per sqft
  const getPricePerSqft = (property: Property) => {
    const price = property.listing_type === 'rent' ? property.rent_amount : property.price;
    const area = property.area;
    if (!price || !area) return null;
    return price / area;
  };

  // Get investment score
  const getInvestmentScore = (property: Property) => {
    const prediction = property.predictions?.find(p => p.prediction_type === 'investment_score');
    return prediction ? Number(prediction.predicted_value) : null;
  };

  // Get ROI prediction
  const getROI = (property: Property) => {
    const prediction = property.predictions?.find(p => p.prediction_type === 'roi_analysis');
    return prediction ? Number(prediction.predicted_value) : null;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Property Comparison</h1>
        <p className="text-gray-600">Compare up to 4 properties side by side</p>
      </div>

      {/* Property Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {displayProperties.map((property) => {
          const primaryImage = property.images?.find(img => img.is_primary) || property.images?.[0];
          const price = property.listing_type === 'rent' ? property.rent_amount : property.price;
          const investmentScore = getInvestmentScore(property);

          return (
            <Card key={property.id} className="overflow-hidden">
              <div className="relative h-48">
                {primaryImage ? (
                  <Image
                    src={primaryImage.image_url}
                    alt={primaryImage.alt_text || property.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{property.title}</h3>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="line-clamp-1">{property.city}, {property.state}</span>
                  </div>
                  <div className="font-bold text-green-600 text-lg">
                    {price ? formatCurrency(price) : 'Price on Request'}
                    {property.listing_type === 'rent' && property.rent_period && (
                      <span className="text-sm font-normal">/{property.rent_period}</span>
                    )}
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{property.area} sq ft</span>
                    <span>{property.bedrooms} BHK</span>
                  </div>
                  {investmentScore && (
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      <span className="text-sm">Score: {investmentScore.toFixed(0)}/100</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Comparison Tables */}
      <div className="space-y-6">
        {/* Price Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Price Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Metric</th>
                    {displayProperties.map((property) => (
                      <th key={property.id} className="text-center p-2 min-w-[150px]">
                        {property.title.split(' ').slice(0, 2).join(' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2 font-medium">Price/Sqft</td>
                    {displayProperties.map((property) => {
                      const pricePerSqft = getPricePerSqft(property);
                      return (
                        <td key={property.id} className="text-center p-2">
                          {pricePerSqft ? formatCurrency(pricePerSqft) : 'N/A'}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">Total Price</td>
                    {displayProperties.map((property) => {
                      const price = property.listing_type === 'rent' ? property.rent_amount : property.price;
                      return (
                        <td key={property.id} className="text-center p-2">
                          {price ? formatCurrency(price) : 'Price on Request'}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">ROI Prediction</td>
                    {displayProperties.map((property) => {
                      const roi = getROI(property);
                      return (
                        <td key={property.id} className="text-center p-2">
                          {roi ? `${roi.toFixed(1)}%` : 'N/A'}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Amenities Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Amenities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Amenity</th>
                    {displayProperties.map((property) => (
                      <th key={property.id} className="text-center p-2 min-w-[150px]">
                        {property.title.split(' ').slice(0, 2).join(' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allAmenities.map((amenity) => (
                    <tr key={amenity} className="border-b">
                      <td className="p-2 font-medium">{amenity}</td>
                      {displayProperties.map((property) => {
                        const hasAmenity = property.amenities?.includes(amenity);
                        return (
                          <td key={property.id} className="text-center p-2">
                            {hasAmenity ? (
                              <Check className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-red-500 mx-auto" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Property Details Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Detail</th>
                    {displayProperties.map((property) => (
                      <th key={property.id} className="text-center p-2 min-w-[150px]">
                        {property.title.split(' ').slice(0, 2).join(' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2 font-medium">Developer</td>
                    {displayProperties.map((property) => (
                      <td key={property.id} className="text-center p-2">
                        {property.developer_name || 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">Project</td>
                    {displayProperties.map((property) => (
                      <td key={property.id} className="text-center p-2">
                        {property.project_name || 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">RERA Registered</td>
                    {displayProperties.map((property) => (
                      <td key={property.id} className="text-center p-2">
                        {property.rera_registered ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Yes {property.rera_number && `(${property.rera_number})`}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700">
                            No
                          </Badge>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">Possession Status</td>
                    {displayProperties.map((property) => (
                      <td key={property.id} className="text-center p-2">
                        {property.possession_status || 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">Year Built</td>
                    {displayProperties.map((property) => (
                      <td key={property.id} className="text-center p-2">
                        {property.year_built || 'N/A'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Key Features */}
        <Card>
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {displayProperties.map((property) => (
                <div key={property.id} className="space-y-2">
                  <h4 className="font-semibold text-center">{property.title.split(' ').slice(0, 3).join(' ')}</h4>
                  <div className="space-y-1">
                    {property.features?.slice(0, 5).map((feature, index) => (
                      <Badge key={index} variant="secondary" className="mr-1 mb-1">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}