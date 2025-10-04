"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

import {
  MapPin,
  Bed,
  Bath,
  Square,
  Heart,
  Share2,
  Phone,
  Mail,
  TrendingUp,
  Calendar,
  Award,
  Shield,
  Eye,
  Play,
  Smartphone
} from "lucide-react";

// Lazy load VirtualTourViewer
const VirtualTourViewer = dynamic(() => import("@/components/virtual-tour/VirtualTourViewer").then(mod => ({ default: mod.VirtualTourViewer })), {
  loading: () => <LoadingSpinner />,
});

// Lazy load AR Viewer
const PropertyARViewer = dynamic(() => import("@/components/ar/PropertyARViewer").then(mod => ({ default: mod.PropertyARViewer })), {
  loading: () => <LoadingSpinner />,
});

interface PropertyDetailClientProps {
  params: {
    id: string;
  };
}

export default function PropertyDetailClient({ params }: PropertyDetailClientProps) {
  const [showVirtualTour, setShowVirtualTour] = useState(false);
  const [showARViewer, setShowARViewer] = useState(false);

  // Mock virtual tour images - in real implementation, fetch from API
  const virtualTourImages = [
    '/api/placeholder/800/600', // Replace with actual tour images
    '/api/placeholder/800/600',
    '/api/placeholder/800/600',
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Image Gallery */}
      <div className="relative">
        <div className="h-96 bg-gradient-to-br from-blue-400 to-blue-600 relative">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute top-4 left-4">
            <Badge className="bg-orange-500 text-white">Premium Property</Badge>
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            <Button variant="secondary" size="icon">
              <Heart className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setShowVirtualTour(true)}
              title="Virtual Tour"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setShowARViewer(true)}
              title="AR View"
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Luxury 3BHK Villa</h1>
                    <div className="flex items-center text-gray-600 mb-4">
                      <MapPin className="h-4 w-4 mr-1" />
                      Sector 89, Faridabad, Haryana
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600">₹2.5Cr</div>
                    <div className="text-sm text-gray-600">₹2,083/sq ft</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <Bed className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <div className="font-semibold">3</div>
                    <div className="text-sm text-gray-600">Bedrooms</div>
                  </div>
                  <div className="text-center">
                    <Bath className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <div className="font-semibold">3</div>
                    <div className="text-sm text-gray-600">Bathrooms</div>
                  </div>
                  <div className="text-center">
                    <Square className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <div className="font-semibold">2,500</div>
                    <div className="text-sm text-gray-600">sq ft</div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button size="lg" className="flex-1">
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Agent
                  </Button>
                  <Button size="lg" variant="outline" className="flex-1">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Inquiry
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  This luxurious 3BHK villa in Sector 89, Faridabad offers modern amenities and premium finishes.
                  Located in a prime location with excellent connectivity to Delhi, this property is perfect for
                  families looking for a comfortable and stylish home. The villa features spacious rooms, modern
                  kitchen, and landscaped gardens.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm">RERA Approved</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm">Bank Approved</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>Amenities & Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    "Swimming Pool",
                    "Gym",
                    "Children's Play Area",
                    "24/7 Security",
                    "Power Backup",
                    "Parking",
                    "Garden",
                    "Modular Kitchen",
                    "Air Conditioning",
                    "Water Supply",
                    "Internet"
                  ].map((amenity) => (
                    <div key={amenity} className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Investment Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Investment Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Expected ROI</span>
                  <span className="font-semibold text-green-600">12% annually</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Rental Yield</span>
                  <span className="font-semibold">₹18,000/month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Break-even</span>
                  <span className="font-semibold">4 years</span>
                </div>
                <div className="border-t pt-4"></div>
                <div className="flex justify-between">
                  <span className="text-sm">5-year projection</span>
                  <span className="font-semibold text-green-600">₹4.2Cr</span>
                </div>
              </CardContent>
            </Card>

            {/* Agent Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Agent</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">RA</span>
                  </div>
                  <div>
                    <div className="font-semibold">Rajesh Kumar</div>
                    <div className="text-sm text-gray-600">Senior Property Consultant</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Now
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Property ID</span>
                  <span className="text-sm font-medium">NBC-{params.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Property Type</span>
                  <span className="text-sm font-medium">Residential</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge variant="secondary">Ready to Move</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Listed</span>
                  <span className="text-sm font-medium flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    2 days ago
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Furnishing</span>
                  <span className="text-sm font-medium">Semi-furnished</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Virtual Tour Modal */}
      {showVirtualTour && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <Suspense fallback={<LoadingSpinner />}>
              <VirtualTourViewer
                images={virtualTourImages}
                propertyTitle="Luxury 3BHK Villa"
                onClose={() => setShowVirtualTour(false)}
              />
            </Suspense>
          </div>
        </div>
      )}

      {/* AR Viewer Modal */}
      {showARViewer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 md:p-4">
          <div className="max-w-6xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
            <Suspense fallback={<LoadingSpinner />}>
              <PropertyARViewer
                propertyTitle="Luxury 3BHK Villa"
                propertyId={params.id}
                onClose={() => setShowARViewer(false)}
              />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
}