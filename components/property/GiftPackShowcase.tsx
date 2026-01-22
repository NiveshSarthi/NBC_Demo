"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Gift,
  ChevronDown,
  ChevronUp,
  Camera,
  DollarSign,
  FileText,
  Tag
} from "lucide-react";

export interface GiftInclusion {
  name: string;
  value: number;
  description?: string;
}

export interface Offer {
  id: number;
  title: string;
  description?: string;
  image_url: string;
  link_url?: string;
  type: string;
  is_active: boolean;
}

export interface GiftPackData {
  inclusions?: GiftInclusion[];
  images?: string[];
  terms?: string;
  offers?: Offer[];
}

interface GiftPackShowcaseProps {
  giftPack: GiftPackData | string | null;
}

export function GiftPackShowcase({ giftPack }: GiftPackShowcaseProps) {
  const [showTerms, setShowTerms] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  if (!giftPack) return null;

  // Handle case where giftPack might be a JSON string
  let parsedGiftPack: GiftPackData;
  try {
    parsedGiftPack = typeof giftPack === 'string' ? JSON.parse(giftPack) : giftPack;
  } catch {
    parsedGiftPack = {};
  }

  const { inclusions = [], images = [], terms, offers = [] } = parsedGiftPack;

  const totalValue = inclusions.reduce((sum, item) => sum + (item.value || 0), 0);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, imageUrl: string) => {
    if (failedImages.has(imageUrl)) return;

    setFailedImages(prev => new Set(prev).add(imageUrl));
    const target = e.target as HTMLImageElement;
    target.src = `data:image/svg+xml;base64,${btoa(`
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="sans-serif" font-size="16">
          Image not available
        </text>
      </svg>
    `)}`;
  };

  return (
    <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center text-2xl text-yellow-800">
          <Gift className="h-8 w-8 mr-3 text-yellow-600" />
          Gift Pack Showcase
        </CardTitle>
        <p className="text-yellow-700 mt-2">
          Complimentary value additions with your property purchase
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Estimated Gift Value */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <DollarSign className="h-6 w-6 text-yellow-600 mr-2" />
            <span className="text-sm font-medium text-yellow-700">Estimated Gift Value</span>
          </div>
          <div className="text-3xl font-bold text-yellow-600">
            ₹{totalValue.toLocaleString()}
          </div>
        </div>

        {/* Inclusions List */}
        {inclusions.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
              <Gift className="h-5 w-5 mr-2" />
              What's Included
            </h3>
            <div className="grid gap-3">
              {inclusions.map((item, index) => (
                <div
                  key={index}
                  className="bg-white/80 rounded-lg p-4 border border-yellow-200 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{item.name}</h4>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                    </div>
                    <Badge variant="secondary" className="bg-yellow-500 text-white ml-4">
                      ₹{item.value.toLocaleString()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Visual Gallery */}
        {images.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
              <Camera className="h-5 w-5 mr-2" />
              Gift Gallery
            </h3>
            <div className="space-y-4">
              {/* Main Image */}
              <Dialog open={galleryModalOpen} onOpenChange={setGalleryModalOpen}>
                <DialogTrigger asChild>
                  <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-pointer group">
                    <img
                      src={images[selectedImageIndex]}
                      alt={`Gift pack item ${selectedImageIndex + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => handleImageError(e, images[selectedImageIndex])}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-30 rounded-lg">
                      <span className="text-white font-semibold">Click to enlarge</span>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>Gift Gallery</DialogTitle>
                  </DialogHeader>
                  <div className="relative">
                    <img
                      src={images[selectedImageIndex]}
                      alt={`Gift pack item ${selectedImageIndex + 1}`}
                      className="w-full h-auto max-h-[60vh] object-contain"
                      onError={(e) => handleImageError(e, images[selectedImageIndex])}
                    />
                    {images.length > 1 && (
                      <div className="flex justify-center gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                        >
                          Previous
                        </Button>
                        <span className="self-center text-sm text-gray-600">
                          {selectedImageIndex + 1} of {images.length}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${selectedImageIndex === index
                        ? 'border-yellow-500'
                        : 'border-gray-200'
                        }`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => handleImageError(e, image)}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Special Offers */}
        {offers.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
              <Tag className="h-5 w-5 mr-2" />
              Special Offers
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="bg-white/80 rounded-lg p-4 border border-yellow-200 shadow-sm"
                >
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-gray-800">{offer.title}</h4>
                      {offer.description && (
                        <p className="text-sm text-gray-600 mt-1">{offer.description}</p>
                      )}
                    </div>
                    {offer.image_url && (
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={offer.image_url}
                          alt={offer.title}
                          className="w-full h-full object-cover"
                          onError={(e) => handleImageError(e, offer.image_url)}
                        />
                      </div>
                    )}
                    {offer.link_url && (
                      <Link
                        href={offer.link_url}
                        className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                      >
                        Learn More
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Terms and Conditions */}
        {terms && (
          <div>
            <Button
              variant="outline"
              onClick={() => setShowTerms(!showTerms)}
              className="w-full justify-between border-yellow-300 text-yellow-700 hover:bg-yellow-50"
            >
              <span className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Terms and Conditions
              </span>
              {showTerms ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {showTerms && (
              <div className="mt-4 bg-white/80 rounded-lg p-4 border border-yellow-200">
                <div
                  className="text-sm text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: terms }}
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}