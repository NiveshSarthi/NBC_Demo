import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Heart } from "lucide-react";
import Image from "next/image";

interface PropertyCardProps {
  property: any; // Property type from API
}

export function PropertyCard({ property }: PropertyCardProps) {
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
          className="absolute top-4 right-4 bg-white/20 hover:bg-white/30"
        >
          <Heart className="h-4 w-4 text-white" />
        </Button>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg line-clamp-2">{property.title}</h3>
          <span className="font-bold text-green-600 whitespace-nowrap ml-2">{displayPrice}</span>
        </div>
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="text-sm line-clamp-1">{location}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mb-4">
          {areaValue && <span>{areaValue.toLocaleString()} sq ft</span>}
          {property.bedrooms && <span>{property.bedrooms} BHK</span>}
          {roiPrediction && (
            <span className="text-green-600 font-medium">
              ROI: {Number(roiPrediction.predicted_value).toFixed(1)}%
            </span>
          )}
        </div>
        <Button className="w-full" asChild>
          <Link href={`/properties/${property.id}`}>View Details</Link>
        </Button>
      </CardContent>
    </Card>
  );
}