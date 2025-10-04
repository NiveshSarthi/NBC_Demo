'use client';

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Search, Filter, Loader2, AlertCircle } from "lucide-react";

// Add line-clamp utilities if not available
const styles = `
  .line-clamp-1 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
  }
  .line-clamp-2 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}
import { useProperties, useSearchProperties } from "@/lib/hooks/use-properties";
import type { PropertyFilters, PaginationOptions } from "@/types/api";
import dynamic from 'next/dynamic';

// Lazy load components for better performance
const PropertyCard = dynamic(() => import('@/components/properties/PropertyCard').then(mod => ({ default: mod.PropertyCard })), {
  loading: () => (
    <div className="animate-pulse">
      <div className="bg-gray-200 h-48 rounded-t-lg"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-8 bg-gray-200 rounded"></div>
      </div>
    </div>
  )
});

export default function PropertiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [pagination, setPagination] = useState<PaginationOptions>({ page: 1, limit: 12 });
  const [sortBy, setSortBy] = useState<'price' | 'created_at' | 'area' | 'ai_score'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isSearching, setIsSearching] = useState(false);

  // Read URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const listingType = urlParams.get('listing_type');
    const city = urlParams.get('location');
    const propertyType = urlParams.get('type');

    const newFilters: PropertyFilters = {};

    if (listingType) {
      newFilters.listingType = listingType as 'sale' | 'rent';
    }
    if (city) {
      newFilters.city = city;
    }
    if (propertyType) {
      newFilters.propertyType = propertyType as any;
    }

    if (Object.keys(newFilters).length > 0) {
      setFilters(newFilters);
    }
  }, []);

  // Determine if we should use search or regular properties
  const shouldUseSearch = searchQuery.trim().length > 0 || isSearching;

  const {
    properties: searchResults,
    pagination: searchPagination,
    isLoading: searchLoading,
    error: searchError,
  } = useSearchProperties(
    shouldUseSearch ? searchQuery : "",
    filters,
    { ...pagination, sortBy, sortOrder }
  );

  const {
    properties: regularProperties,
    pagination: regularPagination,
    isLoading: regularLoading,
    error: regularError,
  } = useProperties(
    shouldUseSearch ? undefined : filters,
    shouldUseSearch ? undefined : { ...pagination, sortBy, sortOrder }
  );

  const properties = shouldUseSearch ? searchResults : regularProperties;
  const paginationData = shouldUseSearch ? searchPagination : regularPagination;
  const isLoading = shouldUseSearch ? searchLoading : regularLoading;
  const error = shouldUseSearch ? searchError : regularError;

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      setPagination(prev => ({ ...prev, page: 1 }));
    } else {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const handleFilterChange = useCallback((filterKey: keyof PropertyFilters, value: string | number | boolean | string[] | undefined) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value === 'all' ? undefined : value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
    setIsSearching(false);
  }, []);

  const handleSortChange = useCallback((value: string) => {
    if (value === 'newest') {
      setSortBy('created_at');
      setSortOrder('desc');
    } else if (value === 'price-low') {
      setSortBy('price');
      setSortOrder('asc');
    } else if (value === 'price-high') {
      setSortBy('price');
      setSortOrder('desc');
    } else if (value === 'roi') {
      setSortBy('ai_score');
      setSortOrder('desc');
    }
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Properties</h1>
              <p className="text-gray-600">Discover your perfect investment opportunity</p>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search properties..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8"
                  onClick={handleSearch}
                  disabled={isLoading}
                >
                  {isLoading && isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Listing Type</label>
                    <Select onValueChange={(value: string) => handleFilterChange('listingType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Listings" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Listings</SelectItem>
                        <SelectItem value="sale">For Sale</SelectItem>
                        <SelectItem value="rent">For Rent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Property Type</label>
                    <Select onValueChange={(value: string) => handleFilterChange('propertyType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="plots">Plots & Land</SelectItem>
                        <SelectItem value="religious">Religious</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Location</label>
                    <Select onValueChange={(value: string) => handleFilterChange('city', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Locations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        <SelectItem value="Mumbai">Mumbai</SelectItem>
                        <SelectItem value="Delhi">Delhi</SelectItem>
                        <SelectItem value="Bangalore">Bangalore</SelectItem>
                        <SelectItem value="Chennai">Chennai</SelectItem>
                        <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                        <SelectItem value="Kolkata">Kolkata</SelectItem>
                        <SelectItem value="Ahmedabad">Ahmedabad</SelectItem>
                        <SelectItem value="Panaji">Goa</SelectItem>
                        <SelectItem value="faridabad">Faridabad</SelectItem>
                        <SelectItem value="dholera">Dholera</SelectItem>
                        <SelectItem value="vrindavan">Vrindavan</SelectItem>
                        <SelectItem value="ayodhya">Ayodhya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Price/Rent Range</label>
                    <Select onValueChange={(value: string) => {
                      if (value === '0-50') {
                        handleFilterChange('minPrice', 0);
                        handleFilterChange('maxPrice', 5000000);
                      } else if (value === '50-1cr') {
                        handleFilterChange('minPrice', 5000000);
                        handleFilterChange('maxPrice', 10000000);
                      } else if (value === '1cr-5cr') {
                        handleFilterChange('minPrice', 10000000);
                        handleFilterChange('maxPrice', 50000000);
                      } else if (value === '5cr+') {
                        handleFilterChange('minPrice', 50000000);
                        handleFilterChange('maxPrice', undefined);
                      } else {
                        handleFilterChange('minPrice', undefined);
                        handleFilterChange('maxPrice', undefined);
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any Price" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Price</SelectItem>
                        <SelectItem value="0-50">₹0 - ₹50L</SelectItem>
                        <SelectItem value="50-1cr">₹50L - ₹1Cr</SelectItem>
                        <SelectItem value="1cr-5cr">₹1Cr - ₹5Cr</SelectItem>
                        <SelectItem value="5cr+">₹5Cr+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Area (sq ft)</label>
                    <Select onValueChange={(value: string) => {
                      if (value === '0-1000') {
                        handleFilterChange('minArea', 0);
                        handleFilterChange('maxArea', 1000);
                      } else if (value === '1000-5000') {
                        handleFilterChange('minArea', 1000);
                        handleFilterChange('maxArea', 5000);
                      } else if (value === '5000+') {
                        handleFilterChange('minArea', 5000);
                        handleFilterChange('maxArea', undefined);
                      } else {
                        handleFilterChange('minArea', undefined);
                        handleFilterChange('maxArea', undefined);
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any Size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Size</SelectItem>
                        <SelectItem value="0-1000">0 - 1,000</SelectItem>
                        <SelectItem value="1000-5000">1,000 - 5,000</SelectItem>
                        <SelectItem value="5000+">5,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full">Apply Filters</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Properties Grid */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                {isLoading ? (
                  "Loading properties..."
                ) : (
                  `Showing ${(paginationData.page - 1) * paginationData.limit + 1}-${Math.min(paginationData.page * paginationData.limit, paginationData.total)} of ${paginationData.total} properties`
                )}
              </p>
              <Select defaultValue="newest" onValueChange={handleSortChange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="roi">Highest ROI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading properties...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="flex justify-center items-center py-12">
                <AlertCircle className="h-8 w-8 text-red-600" />
                <span className="ml-2 text-red-600">Failed to load properties. Please try again.</span>
              </div>
            )}

            {/* Properties Grid */}
            {!isLoading && !error && properties.length > 0 && (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}

            {/* No Results - Show Demo Rental Properties */}
            {!isLoading && !error && properties.length === 0 && filters.listingType === 'rent' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Demo Rental Properties</h3>
                  <p className="text-gray-500">Sample rental properties for demonstration</p>
                </div>

                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* Demo Rental Property 1 */}
                  <PropertyCard key="demo-rent-1" property={{
                    id: 'demo-rent-1',
                    title: 'Luxury Beach Villa for Rent in Calangute',
                    description: 'Stunning beachfront villa available for monthly rental with modern amenities and panoramic ocean views.',
                    property_type: 'residential',
                    listing_type: 'rent',
                    sub_type: 'Villa',
                    city: 'Panaji',
                    state: 'Goa',
                    address: 'Calangute Beach, North Goa',
                    pincode: '403516',
                    latitude: 15.5405,
                    longitude: 73.7551,
                    price: null,
                    rent_amount: 85000,
                    rent_period: 'monthly',
                    price_unit: 'INR',
                    area: 2500,
                    area_unit: 'sqft',
                    bedrooms: 4,
                    bathrooms: 4,
                    parking_spaces: 2,
                    floor_number: null,
                    total_floors: null,
                    year_built: 2018,
                    furnishing: 'fully_furnished',
                    amenities: ['Private Beach Access', 'Swimming Pool', 'Garden', 'Gym', 'Security', 'Power Backup', 'Housekeeping'],
                    features: ['Ocean View', 'Private Terrace', 'Modular Kitchen', 'Air Conditioning', 'WiFi'],
                    rera_registered: true,
                    rera_number: 'GA/67890/2018',
                    ownership_type: 'freehold',
                    possession_status: 'ready_to_move',
                    developer_name: 'Goa Villas',
                    project_name: 'Calangute Paradise',
                    ai_score: 8.7,
                    featured: false,
                    premium_listing: true,
                    images: [{
                      id: '1',
                      property_id: 'demo-rent-1',
                      image_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=1',
                      alt_text: 'Beach villa exterior',
                      is_primary: true,
                      sort_order: 0,
                      image_type: 'exterior'
                    }],
                    predictions: [{
                      id: '1',
                      property_id: 'demo-rent-1',
                      prediction_type: 'roi_analysis',
                      predicted_value: 4.5,
                      confidence_score: 85,
                      valid_until: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
                      factors: { location_growth: 20, market_demand: 25, infrastructure: 30 }
                    }]
                  }} />

                  {/* Demo Rental Property 2 */}
                  <PropertyCard key="demo-rent-2" property={{
                    id: 'demo-rent-2',
                    title: 'Modern 3BHK Apartment for Rent in Mumbai',
                    description: 'Contemporary apartment in prime Mumbai location with excellent connectivity and modern amenities.',
                    property_type: 'residential',
                    listing_type: 'rent',
                    sub_type: 'Apartment',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    address: 'Bandra West, Mumbai',
                    pincode: '400050',
                    latitude: 19.0544,
                    longitude: 72.8402,
                    price: null,
                    rent_amount: 125000,
                    rent_period: 'monthly',
                    price_unit: 'INR',
                    area: 1500,
                    area_unit: 'sqft',
                    bedrooms: 3,
                    bathrooms: 2,
                    parking_spaces: 1,
                    floor_number: 12,
                    total_floors: 25,
                    year_built: 2020,
                    furnishing: 'semi_furnished',
                    amenities: ['Swimming Pool', 'Gym', 'Security', 'Power Backup', 'Lift'],
                    features: ['Sea Facing', 'Modular Kitchen', 'Air Conditioning'],
                    rera_registered: true,
                    rera_number: 'MH/12345/2020',
                    ownership_type: 'freehold',
                    possession_status: 'ready_to_move',
                    developer_name: 'Prestige Group',
                    project_name: 'Bandra Heights',
                    ai_score: 9.2,
                    featured: true,
                    premium_listing: false,
                    images: [{
                      id: '2',
                      property_id: 'demo-rent-2',
                      image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=2',
                      alt_text: 'Modern apartment',
                      is_primary: true,
                      sort_order: 0,
                      image_type: 'interior'
                    }],
                    predictions: [{
                      id: '2',
                      property_id: 'demo-rent-2',
                      prediction_type: 'roi_analysis',
                      predicted_value: 3.2,
                      confidence_score: 88,
                      valid_until: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
                      factors: { location_growth: 15, market_demand: 30, infrastructure: 25 }
                    }]
                  }} />

                  {/* Demo Rental Property 3 */}
                  <PropertyCard key="demo-rent-3" property={{
                    id: 'demo-rent-3',
                    title: 'Spacious Office Space for Rent in Delhi',
                    description: 'Prime commercial office space in Connaught Place with excellent metro connectivity.',
                    property_type: 'commercial',
                    listing_type: 'rent',
                    sub_type: 'Office Space',
                    city: 'Delhi',
                    state: 'Delhi',
                    address: 'Connaught Place, Delhi',
                    pincode: '110001',
                    latitude: 28.6304,
                    longitude: 77.2177,
                    price: null,
                    rent_amount: 250000,
                    rent_period: 'monthly',
                    price_unit: 'INR',
                    area: 3000,
                    area_unit: 'sqft',
                    bedrooms: null,
                    bathrooms: 4,
                    parking_spaces: 5,
                    floor_number: 8,
                    total_floors: 15,
                    year_built: 2015,
                    furnishing: 'fully_furnished',
                    amenities: ['High-speed Internet', 'Conference Room', 'Reception', 'Security', 'Power Backup', 'Lift', 'Parking'],
                    features: ['Corner Office', 'Panoramic Views', 'Central AC', 'False Ceiling'],
                    rera_registered: true,
                    rera_number: 'DL/23456/2015',
                    ownership_type: 'leasehold',
                    possession_status: 'ready_to_move',
                    developer_name: 'DLF Limited',
                    project_name: 'Connaught Plaza',
                    ai_score: 8.8,
                    featured: false,
                    premium_listing: true,
                    images: [{
                      id: '3',
                      property_id: 'demo-rent-3',
                      image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=3',
                      alt_text: 'Office space',
                      is_primary: true,
                      sort_order: 0,
                      image_type: 'interior'
                    }],
                    predictions: [{
                      id: '3',
                      property_id: 'demo-rent-3',
                      prediction_type: 'roi_analysis',
                      predicted_value: 4.1,
                      confidence_score: 82,
                      valid_until: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
                      factors: { location_growth: 20, market_demand: 35, infrastructure: 40 }
                    }]
                  }} />
                </div>
              </div>
            )}

            {/* No Results */}
            {!isLoading && !error && properties.length === 0 && filters.listingType !== 'rent' && (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No properties found</h3>
                  <p className="text-gray-500">Try adjusting your filters or search terms.</p>
                </div>
              </div>
            )}

            {/* Pagination */}
            {paginationData.totalPages > 1 && (
              <div className="mt-12">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (paginationData.page > 1) {
                            handlePageChange(paginationData.page - 1);
                          }
                        }}
                        className={paginationData.page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>

                    {/* Generate page numbers */}
                    {Array.from({ length: Math.min(5, paginationData.totalPages) }, (_, i) => {
                      let pageNumber;
                      if (paginationData.totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (paginationData.page <= 3) {
                        pageNumber = i + 1;
                      } else if (paginationData.page >= paginationData.totalPages - 2) {
                        pageNumber = paginationData.totalPages - 4 + i;
                      } else {
                        pageNumber = paginationData.page - 2 + i;
                      }

                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            href="#"
                            isActive={pageNumber === paginationData.page}
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(pageNumber);
                            }}
                            className="cursor-pointer"
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    {paginationData.totalPages > 5 && paginationData.page < paginationData.totalPages - 2 && (
                      <>
                        <PaginationItem>
                          <PaginationLink href="#" className="pointer-events-none">...</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(paginationData.totalPages);
                            }}
                            className="cursor-pointer"
                          >
                            {paginationData.totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (paginationData.page < paginationData.totalPages) {
                            handlePageChange(paginationData.page + 1);
                          }
                        }}
                        className={paginationData.page >= paginationData.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}