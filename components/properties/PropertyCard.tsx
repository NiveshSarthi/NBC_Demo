'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Heart, GitCompare } from "lucide-react";
import Image from "next/image";
import { AnonymousInquiryForm } from "@/components/inquiry/AnonymousInquiryForm";
import SmartCallButton from "@/components/call/SmartCallButton";
import dynamic from 'next/dynamic';
import { useRouter } from "next/navigation";

const SpecialHighlightBadge = dynamic(() => import('@/components/property/SpecialHighlightBadge').then(({ SpecialHighlightBadge }) => SpecialHighlightBadge), { ssr: false });
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiRequest } from "@/lib/api";

interface PropertyCardProps {
  property: any; // Property type from API
}

export function PropertyCard({ property }: PropertyCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isInCompare, setIsInCompare] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Check if property is in compare list
    const compareList = JSON.parse(localStorage.getItem('compareProperties') || '[]');
    setIsInCompare(compareList.includes(property.id));
  }, [property.id]);

  useEffect(() => {
    // Check if property is saved (if user is logged in)
    if (user) {
      checkIfSaved();
    }
  }, [user, property.id]);

  const checkIfSaved = async () => {
    try {
      // This would ideally have an endpoint to check if saved, but for now we'll assume it's not
      // Could implement a GET /saved-properties with property_id filter
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const toggleCompare = () => {
    const compareList = JSON.parse(localStorage.getItem('compareProperties') || '[]');
    let newList;

    if (isInCompare) {
      // Remove from compare
      newList = compareList.filter((id: number) => id !== property.id);
    } else {
      // Add to compare (limit to 4)
      if (compareList.length >= 4) {
        alert('You can compare up to 4 properties at a time.');
        return;
      }
      newList = [...compareList, property.id];
    }

    localStorage.setItem('compareProperties', JSON.stringify(newList));
    setIsInCompare(!isInCompare);
  };

  const toggleSave = async () => {
    if (!user) {
      // Redirect to login or show login prompt
      router.push('/login');
      return;
    }

    try {
      setSaving(true);
      if (isSaved) {
        // Remove from wishlist
        await apiRequest(`/saved-properties?property_id=${property.id}`, {
          method: 'DELETE',
        });
        setIsSaved(false);
      } else {
        // Add to wishlist
        await apiRequest('/saved-properties', {
          method: 'POST',
          body: JSON.stringify({
            property_id: property.id,
            shared_with: [],
            is_public: false,
          }),
        });
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      // Could show error toast
    } finally {
      setSaving(false);
    }
  };

  const primaryImage = property.images.find((img: any) => img.is_primary) || property.images[0];
  const location = `${property.city}${property.state ? `, ${property.state}` : ''}`;
  const isRental = (property as any).listing_type === 'rent';
  const priceValue = isRental ? Number((property as any).rent_amount) : Number(property.price);
  const priceInCr = priceValue / 10000000; // Convert to crores
  const displayPrice = isRental ?
    `₹${priceValue.toLocaleString()}/${(property as any).rent_period === 'yearly' ? 'year' : (property as any).rent_period === 'daily' ? 'day' : 'month'}` :
    (priceInCr >= 1 ? `₹${priceInCr.toFixed(1)}Cr` : `₹${(priceValue / 100000).toFixed(1)}L`);
  const areaValue = property.area ? Number(property.area) : null;

  // Find ROI prediction
  const roiPrediction = property.predictions?.find((p: any) => p.prediction_type === 'roi_analysis');

  // Find investment score prediction
  const investmentScorePrediction = property.predictions?.find((p: any) => p.prediction_type === 'investment_score');
  const investmentScore = investmentScorePrediction?.predicted_value ? Number(investmentScorePrediction.predicted_value) : null;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        {primaryImage ? (
          <Image
            src={primaryImage.image_url}
            alt={primaryImage.alt_text || property.title}
            width={400}
            height={192}
            className="h-48 w-full object-cover"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
        ) : (
          <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
            <span className="text-white text-sm">No Image</span>
          </div>
        )}
        {property.premium_listing && (
          <div className="absolute top-4 left-4">
            <Badge className="bg-orange-500">Premium</Badge>
          </div>
        )}
        {property.featured && (
          <div className="absolute top-4 left-20">
            <Badge className="bg-green-500">Featured</Badge>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-4 right-4 bg-white/20 hover:bg-white/30 ${saving ? 'opacity-50' : ''}`}
          onClick={toggleSave}
          disabled={saving}
        >
          <Heart className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : 'text-white'}`} />
        </Button>
      </div>
      <CardContent className="p-4">
        <SpecialHighlightBadge property={property} />
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg line-clamp-2">{property.title}</h3>
          <span className="font-bold text-green-600 whitespace-nowrap ml-2">{displayPrice}</span>
        </div>
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="text-sm line-clamp-1">{location}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          {areaValue && <span>{areaValue.toLocaleString()} sq ft</span>}
          {property.bedrooms && <span>{property.bedrooms} BHK</span>}
          {roiPrediction && (
            <span className="text-green-600 font-medium">
              ROI: {Number(roiPrediction.predicted_value).toFixed(1)}%
            </span>
          )}
        </div>
        {investmentScore && (
          <div className="flex justify-between items-center text-xs text-gray-600 mb-3">
            <span>Investment Score:</span>
            <div className="flex items-center">
              <div className={`w-16 h-2 bg-gray-200 rounded-full mr-2`}>
                <div
                  className={`h-full rounded-full ${
                    investmentScore >= 80 ? 'bg-green-500' :
                    investmentScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(investmentScore, 100)}%` }}
                ></div>
              </div>
              <span className={`font-medium ${
                investmentScore >= 80 ? 'text-green-600' :
                investmentScore >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {investmentScore.toFixed(0)}/100
              </span>
            </div>
          </div>
        )}
        <div className="space-y-2">
          <SmartCallButton
            propertyId={property.id}
            agentId={property.created_by || 1}
          />
          <AnonymousInquiryForm propertyId={property.id} />
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={isInCompare ? "default" : "outline"}
              onClick={toggleCompare}
              className="flex items-center gap-1"
            >
              <GitCompare className="h-4 w-4" />
              {isInCompare ? 'Remove' : 'Compare'}
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/properties/${property.id}`}>View Details</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}