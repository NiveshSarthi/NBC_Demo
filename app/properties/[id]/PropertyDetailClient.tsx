"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { SpecialHighlightBadge } from "@/components/property/SpecialHighlightBadge";
import type { Property } from "@prisma/client";
import { GiftPackShowcase, type GiftPackData } from "@/components/property/GiftPackShowcase";
import { TourType, TourData, detectTourType } from "@/components/virtual-tour/VirtualTourViewer";
import AIChatbot from "@/components/ai/AIChatbot";

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
  Smartphone,
  Camera,
  Video,
  Plane,
  Clock
} from "lucide-react";

// Lazy load VirtualTourViewer
const VirtualTourViewer = dynamic(() => import("@/components/virtual-tour/VirtualTourViewer").then(mod => ({ default: mod.VirtualTourViewer })), {
  loading: () => <LoadingSpinner />,
});

// Lazy load AR Viewer
const PropertyARViewer = dynamic(() => import("@/components/ar/PropertyARViewer").then(mod => ({ default: mod.PropertyARViewer })), {
  loading: () => <LoadingSpinner />,
});

// Lazy load AR Furniture Placer
const ARFurniturePlacer = dynamic(() => import("@/components/ar/ARFurniturePlacer").then(mod => ({ default: mod.ARFurniturePlacer })), {
  loading: () => <LoadingSpinner />,
});

// Lazy load BuilderProfile
const BuilderProfile = dynamic(() => import("@/components/builder/BuilderProfile").then(mod => ({ default: mod.BuilderProfile })), {
  loading: () => <LoadingSpinner />,
});

// Lazy load ReraComplianceModule
const ReraComplianceModule = dynamic(() => import("@/components/property/ReraComplianceModule").then(mod => ({ default: mod.default })), {
  loading: () => <LoadingSpinner />,
});

// Lazy load BuildingPlansViewer
const BuildingPlansViewer = dynamic(() => import("@/components/property/BuildingPlansViewer").then(mod => ({ default: mod.BuildingPlansViewer })), {
  loading: () => <LoadingSpinner />,
});

// Lazy load NeighborhoodAnalysisDashboard
const NeighborhoodAnalysisDashboard = dynamic(() => import("@/components/location/NeighborhoodAnalysisDashboard").then(mod => ({ default: mod.NeighborhoodAnalysisDashboard })), {
  loading: () => <LoadingSpinner />,
});

// Lazy load ConnectivityScoreCalculator
const ConnectivityScoreCalculator = dynamic(() => import("@/components/location/ConnectivityScoreCalculator").then(mod => ({ default: mod.default })), {
  loading: () => <LoadingSpinner />,
});

// Lazy load LocalityHighlights
const LocalityHighlights = dynamic(() => import("@/components/location/LocalityHighlights").then(mod => ({ default: mod.default })), {
  loading: () => <LoadingSpinner />,
});

// Lazy load EssentialServicesChecker
const EssentialServicesChecker = dynamic(() => import("@/components/location/EssentialServicesChecker").then(mod => ({ default: mod.EssentialServicesChecker })), {
  loading: () => <LoadingSpinner />,
});

// Lazy load AnonymousInquiryForm
const AnonymousInquiryForm = dynamic(() => import("@/components/inquiry/AnonymousInquiryForm").then(mod => ({ default: mod.AnonymousInquiryForm })), {
  loading: () => <LoadingSpinner />,
});

// Lazy load SmartCallButton
const SmartCallButton = dynamic(() => import("@/components/call/SmartCallButton").then(mod => ({ default: mod.default })), {
  loading: () => <LoadingSpinner />,
});

// Lazy load PropertyRecommendations
const PropertyRecommendations = dynamic(() => import("@/components/property/PropertyRecommendations").then(mod => ({ default: mod.PropertyRecommendations })), {
  loading: () => <LoadingSpinner />,
});

// Lazy load PropertyReviews
const PropertyReviews = dynamic(() => import("@/components/property/PropertyReviews").then(mod => ({ default: mod.PropertyReviews })), {
  loading: () => <LoadingSpinner />,
});

// Lazy load CommunityForum
const CommunityForum = dynamic(() => import("@/components/property/CommunityForum").then(mod => ({ default: mod.CommunityForum })), {
  loading: () => <LoadingSpinner />,
});

// Lazy load ViewingScheduler
const ViewingScheduler = dynamic(() => import("@/components/property/ViewingScheduler").then(mod => ({ default: mod.ViewingScheduler })), {
  loading: () => <LoadingSpinner />,
});

interface PropertyDetailClientProps {
  params: {
    id: string;
  };
}

interface PropertyData extends Property {
  builder?: any;
  images?: any[];
  predictions?: any[];
  reraCompliance?: any;
}

interface BuilderData {
  id: number;
  name: string;
  history: string;
  past_projects: any[];
  delivery_track_record: any;
  ratings: number;
  financial_stability: any;
  awards: string[];
  created_at: string;
  updated_at: string;
  properties: any[];
}

export default function PropertyDetailClient({ params }: PropertyDetailClientProps) {
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [builder, setBuilder] = useState<BuilderData | null>(null);
  const [location, setLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeVirtualTab, setActiveVirtualTab] = useState<string>("overview");
  const [showVirtualTour, setShowVirtualTour] = useState(false);
  const [showARViewer, setShowARViewer] = useState(false);
  const [showARFurniturePlacer, setShowARFurniturePlacer] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const propertyResponse = await fetch(`/api/v1/properties/${params.id}`);
        if (propertyResponse.ok) {
          const propertyData = await propertyResponse.json();
          setProperty(propertyData.property);

          // If property has builder_id, fetch builder data
          if (propertyData.property.builder_id) {
            const builderResponse = await fetch(`/api/v1/builders/${propertyData.property.builder_id}`);
            if (builderResponse.ok) {
              const builderData = await builderResponse.json();
              setBuilder(builderData.builder);
            }
          }

          // If property has location_id, fetch location data
          if (propertyData.property.location_id) {
            const locationResponse = await fetch(`/api/v1/locations/${propertyData.property.location_id}`);
            if (locationResponse.ok) {
              const locationData = await locationResponse.json();
              setLocation(locationData.location);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching property data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!property) {
    return <div>Property not found</div>;
  }

  // Mock virtual tour images - in real implementation, fetch from API
  const virtualTourImages = [
    '/api/placeholder/800/600', // Replace with actual tour images
    '/api/placeholder/800/600',
    '/api/placeholder/800/600',
  ];

  // Get available virtual experiences
  const getVirtualExperiences = () => {
    const experiences: { id: string; title: string; type: TourType; url?: string; icon: any }[] = [];

    if (property.virtual_tour_url) {
      experiences.push({
        id: 'panoramic',
        title: '360° Virtual Tour',
        type: TourType.PANORAMIC_360,
        url: property.virtual_tour_url,
        icon: Eye
      });
    }

    if (property.video_tour_url) {
      experiences.push({
        id: 'video',
        title: 'Video Walkthrough',
        type: TourType.VIDEO_WALKTHROUGH,
        url: property.video_tour_url,
        icon: Video
      });
    }

    if (property.drone_footage_url) {
      experiences.push({
        id: 'drone',
        title: 'Drone Footage',
        type: TourType.DRONE_FOOTAGE,
        url: property.drone_footage_url,
        icon: Plane
      });
    }

    if (property.time_lapse_url) {
      experiences.push({
        id: 'timelapse',
        title: 'Construction Time-lapse',
        type: TourType.TIME_LAPSE,
        url: property.time_lapse_url,
        icon: Clock
      });
    }

    if (virtualTourImages.length > 0) {
      experiences.push({
        id: 'gallery',
        title: 'Photo Gallery',
        type: TourType.IMAGE_GALLERY,
        icon: Camera
      });
    }

    return experiences;
  };

  const virtualExperiences = getVirtualExperiences();

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
                    <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
                    <div className="flex items-center text-gray-600 mb-4">
                      <MapPin className="h-4 w-4 mr-1" />
                      {property.address || `${property.city}, ${property.state}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600">
                      ₹{property.price ? (Number(property.price) / 10000000).toFixed(1) + 'Cr' : 'Contact for Price'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {property.area && property.price ? `₹${Math.round(Number(property.price) / Number(property.area))}/sq ft` : ''}
                    </div>
                    <SpecialHighlightBadge property={property} />
                  </div>
                </div>

                {/* Gift Pack Showcase */}
                {property.gift_pack && (
                  <div className="mt-6">
                    <GiftPackShowcase giftPack={property.gift_pack as unknown as GiftPackData} />
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <Bed className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <div className="font-semibold">{property.bedrooms || '-'}</div>
                    <div className="text-sm text-gray-600">Bedrooms</div>
                  </div>
                  <div className="text-center">
                    <Bath className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <div className="font-semibold">{property.bathrooms || '-'}</div>
                    <div className="text-sm text-gray-600">Bathrooms</div>
                  </div>
                  <div className="text-center">
                    <Square className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <div className="font-semibold">{property.area ? property.area.toString() : '-'}</div>
                    <div className="text-sm text-gray-600">{property.area_unit || 'sq ft'}</div>
                  </div>
                </div>

                <Suspense fallback={<LoadingSpinner />}>
                  <AnonymousInquiryForm propertyId={property.id} />
                </Suspense>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {property.description || 'No description available for this property.'}
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

            {/* Virtual Experiences */}
            {virtualExperiences.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Virtual Property Experience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeVirtualTab} onValueChange={setActiveVirtualTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                      {virtualExperiences.map((experience) => {
                        const IconComponent = experience.icon;
                        return (
                          <TabsTrigger
                            key={experience.id}
                            value={experience.id}
                            className="flex items-center gap-1 text-xs"
                          >
                            <IconComponent className="h-3 w-3" />
                            <span className="hidden sm:inline">{experience.title}</span>
                            <span className="sm:hidden">{experience.id.slice(0, 4)}</span>
                          </TabsTrigger>
                        );
                      })}
                      <TabsTrigger value="ar" className="flex items-center gap-1 text-xs">
                        <Smartphone className="h-3 w-3" />
                        <span className="hidden sm:inline">AR View</span>
                        <span className="sm:hidden">AR</span>
                      </TabsTrigger>
                      <TabsTrigger value="furniture" className="flex items-center gap-1 text-xs">
                        <Play className="h-3 w-3" />
                        <span className="hidden sm:inline">AR Furniture</span>
                        <span className="sm:hidden">Design</span>
                      </TabsTrigger>
                    </TabsList>

                    {virtualExperiences.map((experience) => (
                      <TabsContent key={experience.id} value={experience.id} className="mt-4">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h4 className="text-lg font-semibold">{experience.title}</h4>
                            <Button
                              onClick={() => {
                                // For now, we'll use a modal approach. In a full implementation, this would render inline
                                setShowVirtualTour(true);
                              }}
                              className="flex items-center gap-2"
                            >
                              <Play className="h-4 w-4" />
                              Start Experience
                            </Button>
                          </div>
                          <div className="bg-gray-100 rounded-lg p-4 text-center">
                            <experience.icon className="h-12 w-12 mx-auto mb-2 text-gray-600" />
                            <p className="text-sm text-gray-600">
                              {experience.type === TourType.PANORAMIC_360 && "Explore the property with interactive 360° panoramic views"}
                              {experience.type === TourType.VIDEO_WALKTHROUGH && "Watch a guided video walkthrough of the property"}
                              {experience.type === TourType.DRONE_FOOTAGE && "See aerial drone footage of the property and surroundings"}
                              {experience.type === TourType.TIME_LAPSE && "Watch the construction progress time-lapse"}
                              {experience.type === TourType.IMAGE_GALLERY && "Browse through high-quality property images"}
                            </p>
                          </div>
                        </div>
                      </TabsContent>
                    ))}

                    <TabsContent value="ar" className="mt-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-lg font-semibold">Augmented Reality View</h4>
                          <Button
                            onClick={() => setShowARViewer(true)}
                            className="flex items-center gap-2"
                          >
                            <Smartphone className="h-4 w-4" />
                            Launch AR
                          </Button>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                          <Smartphone className="h-12 w-12 mx-auto mb-2 text-blue-600" />
                          <p className="text-sm text-blue-700">
                            Experience the property in augmented reality. Point your camera at a flat surface to place the 3D model.
                          </p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="furniture" className="mt-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-lg font-semibold">AR Furniture Placer</h4>
                          <Button
                            onClick={() => setShowARFurniturePlacer(true)}
                            className="flex items-center gap-2"
                          >
                            <Play className="h-4 w-4" />
                            Design Space
                          </Button>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                          <Play className="h-12 w-12 mx-auto mb-2 text-green-600" />
                          <p className="text-sm text-green-700">
                            Design your ideal space by placing virtual furniture in augmented reality.
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}

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

            {/* Property Reviews */}
            <Suspense fallback={<LoadingSpinner />}>
              <PropertyReviews propertyId={property.id} />
            </Suspense>

            {/* Community Forum */}
            <Suspense fallback={<LoadingSpinner />}>
              <CommunityForum propertyId={property.id} />
            </Suspense>

            {/* Viewing Scheduler */}
            <Suspense fallback={<LoadingSpinner />}>
              <ViewingScheduler propertyId={property.id} />
            </Suspense>

            {/* Builder Profile */}
            {builder && (
              <Card>
                <CardHeader>
                  <CardTitle>About the Builder</CardTitle>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<LoadingSpinner />}>
                    <BuilderProfile builder={builder} />
                  </Suspense>
                </CardContent>
              </Card>
            )}

            {/* RERA Compliance */}
            <Suspense fallback={<LoadingSpinner />}>
              <ReraComplianceModule reraCompliance={property.reraCompliance} />
            </Suspense>

            {/* Floor Plans & Layouts */}
            <Suspense fallback={<LoadingSpinner />}>
              <BuildingPlansViewer
                floorPlanUrl={property.floor_plan_url || undefined}
                threeDTourUrl={property.three_d_tour_url || undefined}
                vastuCompliant={property.vastu_compliant ?? undefined}
                orientation={property.orientation || undefined}
                carpetArea={property.carpet_area ? Number(property.carpet_area) : undefined}
                builtUpArea={property.built_up_area ? Number(property.built_up_area) : undefined}
                areaUnit={property.area_unit || undefined}
                propertyTitle={property.title}
              />
            </Suspense>

            {/* Neighborhood Analysis */}
            {location && (
              <div className="space-y-6">
                <Suspense fallback={<LoadingSpinner />}>
                  <NeighborhoodAnalysisDashboard
                    propertyLat={location.latitude || 0}
                    propertyLng={location.longitude || 0}
                    amenities={location.amenities}
                  />
                </Suspense>

                <Suspense fallback={<LoadingSpinner />}>
                  <ConnectivityScoreCalculator
                    connectivityScore={location.connectivity_score}
                  />
                </Suspense>

                <Suspense fallback={<LoadingSpinner />}>
                  <LocalityHighlights
                    localityHighlights={location.locality_highlights}
                  />
                </Suspense>

                <Suspense fallback={<LoadingSpinner />}>
                  <EssentialServicesChecker
                    data={location.essential_services}
                  />
                </Suspense>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Investment Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  AI Investment Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Investment Score */}
                {(() => {
                  const investmentScorePrediction = property.predictions?.find((p: any) => p.prediction_type === 'investment_score');
                  const scoreData = investmentScorePrediction?.predicted_value ? JSON.parse(investmentScorePrediction.predicted_value) : null;

                  if (scoreData) {
                    return (
                      <>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold">Investment Score</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 h-3 bg-gray-200 rounded-full">
                                <div
                                  className={`h-full rounded-full ${scoreData.total_score >= 80 ? 'bg-green-500' :
                                    scoreData.total_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                  style={{ width: `${Math.min(scoreData.total_score, 100)}%` }}
                                ></div>
                              </div>
                              <span className={`font-bold text-lg ${scoreData.total_score >= 80 ? 'text-green-600' :
                                scoreData.total_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                {scoreData.total_score.toFixed(1)}/100
                              </span>
                            </div>
                          </div>

                          <div className="text-center">
                            <Badge variant="secondary" className={`text-sm ${scoreData.recommendation === 'Strong Buy' ? 'bg-green-100 text-green-800' :
                              scoreData.recommendation === 'Buy' ? 'bg-blue-100 text-blue-800' :
                                scoreData.recommendation === 'Hold' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                              }`}>
                              {scoreData.recommendation}
                            </Badge>
                          </div>
                        </div>

                        {/* Score Breakdown */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm text-gray-700">Score Breakdown</h4>
                          {scoreData.breakdown && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Appreciation Potential</span>
                                <span className="font-medium">{scoreData.breakdown.appreciation_potential.toFixed(1)}/100</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Rental Yield</span>
                                <span className="font-medium">{scoreData.breakdown.rental_yield.toFixed(1)}%</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Location Growth</span>
                                <span className="font-medium">{scoreData.breakdown.location_growth.toFixed(1)}/100</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Infrastructure Impact</span>
                                <span className="font-medium">{scoreData.breakdown.infrastructure_impact.toFixed(1)}/100</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Liquidity Score</span>
                                <span className="font-medium">{scoreData.breakdown.liquidity_score}/100</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    );
                  } else {
                    // Fallback static data
                    return (
                      <>
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
                      </>
                    );
                  }
                })()}
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
                  <Suspense fallback={<LoadingSpinner />}>
                    <SmartCallButton
                      propertyId={property.id}
                      agentId={property.created_by || 1}
                    />
                  </Suspense>
                  <Suspense fallback={<LoadingSpinner />}>
                    <AnonymousInquiryForm propertyId={property.id} />
                  </Suspense>
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

        {/* Property Recommendations */}
        <div className="container mx-auto px-4 py-8">
          <Suspense fallback={<LoadingSpinner />}>
            <PropertyRecommendations
              currentProperty={{
                ...property,
                price: property.price ? Number(property.price) : undefined,
                area: property.area ? Number(property.area) : undefined,
              } as any}
            />
          </Suspense>
        </div>
      </div>

      {/* Virtual Tour Modal */}
      {showVirtualTour && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <Suspense fallback={<LoadingSpinner />}>
              <VirtualTourViewer
                tourData={{
                  type: detectTourType(property),
                  url: property.virtual_tour_url || property.video_tour_url || property.drone_footage_url || property.time_lapse_url || undefined,
                  images: virtualTourImages
                }}
                propertyTitle={property.title}
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
                propertyTitle={property.title}
                propertyId={params.id}
                onClose={() => setShowARViewer(false)}
              />
            </Suspense>
          </div>
        </div>
      )}

      {/* AR Furniture Placer Modal */}
      {showARFurniturePlacer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 md:p-4">
          <div className="max-w-6xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
            <Suspense fallback={<LoadingSpinner />}>
              <ARFurniturePlacer
                propertyTitle={property.title}
                propertyId={params.id}
                onClose={() => setShowARFurniturePlacer(false)}
              />
            </Suspense>
          </div>
        </div>
      )}

      {/* AI Chatbot */}
      <AIChatbot />
    </div>
  );
}