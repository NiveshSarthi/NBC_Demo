'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PropertyComparison } from '@/components/property/PropertyComparison';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

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

function ComparePageContent() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProperties = async () => {
      try {
        // Get property IDs from URL params
        const idsParam = searchParams.get('ids');
        if (!idsParam) {
          setError('No properties selected for comparison');
          setLoading(false);
          return;
        }

        const ids = idsParam.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

        if (ids.length === 0) {
          setError('Invalid property IDs');
          setLoading(false);
          return;
        }

        if (ids.length > 4) {
          setError('You can compare up to 4 properties at a time');
          setLoading(false);
          return;
        }

        // Fetch properties from API
        const response = await fetch(`/api/v1/properties/compare?ids=${ids.join(',')}`);
        if (!response.ok) {
          throw new Error('Failed to fetch properties');
        }
        const data = await response.json();
        const validProperties = data.properties || [];

        if (validProperties.length === 0) {
          setError('No valid properties found');
        } else {
          setProperties(validProperties);
        }
      } catch (err) {
        setError('Failed to load properties');
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading properties...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Comparison Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button asChild>
              <Link href="/properties">Browse Properties</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">No Properties to Compare</h2>
            <p className="text-gray-600 mb-4">Select properties to compare by clicking the "Compare" button on property cards.</p>
            <Button asChild>
              <Link href="/properties">Browse Properties</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PropertyComparison properties={properties} />
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    }>
      <ComparePageContent />
    </Suspense>
  );
}