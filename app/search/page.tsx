"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, MapPin, Filter, X, Loader2, GitCompare, Save, Bell } from "lucide-react";
import { useSearchProperties } from "@/lib/hooks/use-properties";
import { PropertyFilters, PaginationOptions } from "@/types/api";
import { PricePrediction } from "@/components/property/PricePrediction";
import { useAuth } from "@/lib/auth-context";
import { apiRequest } from "@/lib/api";
import Head from "next/head";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [searchInput, setSearchInput] = useState(searchParams.get("q") || "");
  const [debouncedSearchInput, setDebouncedSearchInput] = useState(searchInput);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [saveSearchOpen, setSaveSearchOpen] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState("");
  const [saveSearchLoading, setSaveSearchLoading] = useState(false);
  const [alertEnabled, setAlertEnabled] = useState(false);

  // Compare functionality
  const [compareList, setCompareList] = useState<number[]>([]);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem('compareProperties') || '[]');
    setCompareList(list);
  }, []);

  const updateSearchParams = useCallback((updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) newParams.delete(key);
      else newParams.set(key, value);
    });
    router.push(`/search?${newParams.toString()}`, { scroll: false });
  }, [searchParams, router]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchInput(searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Update URL when debounced search changes
  useEffect(() => {
    if (debouncedSearchInput !== searchParams.get("q")) {
      updateSearchParams({ q: debouncedSearchInput || null, page: "1" });
    }
  }, [debouncedSearchInput, searchParams, updateSearchParams]);

  // Parse URL params into filters and pagination
  const filters: PropertyFilters = useMemo(() => ({
    propertyType: searchParams.get("propertyType") || undefined,
    city: searchParams.get("city") || undefined,
    state: searchParams.get("state") || undefined,
    minPrice: searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined,
    maxPrice: searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined,
    minArea: searchParams.get("minArea") ? parseFloat(searchParams.get("minArea")!) : undefined,
    maxArea: searchParams.get("maxArea") ? parseFloat(searchParams.get("maxArea")!) : undefined,
    bedrooms: searchParams.get("bedrooms") ? parseInt(searchParams.get("bedrooms")!) : undefined,
    bathrooms: searchParams.get("bathrooms") ? parseInt(searchParams.get("bathrooms")!) : undefined,
    furnishing: searchParams.get("furnishing") || undefined,
    amenities: searchParams.get("amenities") ? searchParams.get("amenities")!.split(',') : undefined,
    featured: searchParams.get("featured") === "true" ? true : undefined,
    locationId: searchParams.get("locationId") ? parseInt(searchParams.get("locationId")!) : undefined,
  }), [searchParams]);

  const pagination: PaginationOptions = useMemo(() => ({
    page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
    limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 20,
    sortBy: (searchParams.get("sortBy") as any) || "created_at",
    sortOrder: (searchParams.get("sortOrder") as any) || "desc",
  }), [searchParams]);

  const { properties, pagination: apiPagination, smartSuggestions, parsedQuery, isLoading, error } = useSearchProperties(debouncedSearchInput, filters, pagination);

  // Update search input when URL changes
  useEffect(() => {
    setSearchInput(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearchInputChange = (value: string) => {
    setSearchInput(value);
  };

  const handleSortChange = (sortBy: string) => {
    const [field, order] = sortBy.split('-');
    updateSearchParams({ sortBy: field, sortOrder: order, page: "1" });
  };

  const handlePageChange = (page: number) => {
    updateSearchParams({ page: page.toString() });
  };

  const toggleCompare = (propertyId: number) => {
    const currentList = JSON.parse(localStorage.getItem('compareProperties') || '[]');
    let newList;

    if (currentList.includes(propertyId)) {
      newList = currentList.filter((id: number) => id !== propertyId);
    } else {
      if (currentList.length >= 4) {
        alert('You can compare up to 4 properties at a time.');
        return;
      }
      newList = [...currentList, propertyId];
    }

    localStorage.setItem('compareProperties', JSON.stringify(newList));
    setCompareList(newList);
  };

  const handleSaveSearch = async () => {
    if (!user) return;

    try {
      setSaveSearchLoading(true);
      await apiRequest('/saved-searches', {
        method: 'POST',
        body: JSON.stringify({
          name: saveSearchName,
          search_query: searchInput,
          filters,
          location_bounds: null, // Could be extended for map bounds
          alert_enabled: alertEnabled,
        }),
      });

      setSaveSearchOpen(false);
      setSaveSearchName("");
      setAlertEnabled(false);
      // Could show a success toast here
    } catch (error) {
      console.error('Error saving search:', error);
      // Could show an error toast here
    } finally {
      setSaveSearchLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>{searchInput ? `Search Results for "${searchInput}"` : "Search Properties"} - NextBoomCity</title>
        <meta name="description" content={searchInput ? `Find properties matching "${searchInput}". ${apiPagination.total} results found.` : "Search and discover real estate properties in India."} />
        <meta name="robots" content="index, follow" />
      </Head>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search properties, locations, or cities..."
                    value={searchInput}
                    onChange={(e) => handleSearchInputChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                {user && (
                  <Dialog open={saveSearchOpen} onOpenChange={setSaveSearchOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Save className="h-4 w-4 mr-2" />
                        Save Search
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Save This Search</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="search-name">Search Name</Label>
                          <Input
                            id="search-name"
                            placeholder="e.g., 3BHK in Delhi under 1Cr"
                            value={saveSearchName}
                            onChange={(e) => setSaveSearchName(e.target.value)}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="alerts"
                            checked={alertEnabled}
                            onChange={(e) => setAlertEnabled(e.target.checked)}
                            className="rounded"
                          />
                          <Label htmlFor="alerts" className="flex items-center">
                            <Bell className="h-4 w-4 mr-1" />
                            Enable price drop alerts
                          </Label>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setSaveSearchOpen(false)}>
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSaveSearch}
                            disabled={!saveSearchName.trim() || saveSearchLoading}
                          >
                            {saveSearchLoading ? 'Saving...' : 'Save Search'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Filter Properties</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Property Type</Label>
                        <Select
                          value={filters.propertyType || "all"}
                          onValueChange={(value) => updateSearchParams({ propertyType: value === "all" ? null : value, page: "1" })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Any type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any type</SelectItem>
                            <SelectItem value="residential">Residential</SelectItem>
                            <SelectItem value="commercial">Commercial</SelectItem>
                            <SelectItem value="plot">Plot</SelectItem>
                            <SelectItem value="religious">Religious</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Min Price (₹)</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={filters.minPrice || ""}
                          onChange={(e) => updateSearchParams({ minPrice: e.target.value || null, page: "1" })}
                        />
                      </div>
                      <div>
                        <Label>Max Price (₹)</Label>
                        <Input
                          type="number"
                          placeholder="No limit"
                          value={filters.maxPrice || ""}
                          onChange={(e) => updateSearchParams({ maxPrice: e.target.value || null, page: "1" })}
                        />
                      </div>
                      <div>
                        <Label>Bedrooms</Label>
                        <Select
                          value={filters.bedrooms?.toString() || "all"}
                          onValueChange={(value) => updateSearchParams({ bedrooms: value === "all" ? null : value, page: "1" })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any</SelectItem>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => {
                          updateSearchParams({
                            propertyType: null,
                            minPrice: null,
                            maxPrice: null,
                            bedrooms: null,
                            page: "1"
                          });
                          setFiltersOpen(false);
                        }}>
                          Clear All
                        </Button>
                        <Button onClick={() => setFiltersOpen(false)}>
                          Apply Filters
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Select value={`${pagination.sortBy}-${pagination.sortOrder}`} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at-desc">Newest First</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="ai_score-desc">Highest AI Score</SelectItem>
                    <SelectItem value="area-desc">Largest Area</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Search Results Header */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold mb-2">Search Results</h1>
                  {searchInput && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Results for:</span>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        "{searchInput}"
                        <Link href="/search" className="ml-1 hover:text-red-600">
                          <X className="h-3 w-3" />
                        </Link>
                      </Badge>
                    </div>
                  )}
                  {parsedQuery && parsedQuery.appliedFilters && parsedQuery.appliedFilters.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">AI Applied Filters:</span> {parsedQuery.appliedFilters.join(', ')}
                    </div>
                  )}
                </div>
                <div className="text-gray-600">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    `${apiPagination.total} properties found`
                  )}
                </div>
              </div>
            </div>

            {/* AI Suggestions */}
            {smartSuggestions && smartSuggestions.length > 0 && !isLoading && (
              <div className="mt-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-blue-900">AI Suggestions</h3>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {smartSuggestions.map((suggestion: any, index: number) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-blue-200">
                        <h4 className="font-medium text-sm text-gray-900 mb-2">{suggestion.label}</h4>
                        <div className="space-y-1">
                          {suggestion.options.slice(0, 3).map((option: any, optIndex: number) => (
                            <button
                              key={optIndex}
                              onClick={() => {
                                if (suggestion.type === 'budget') {
                                  updateSearchParams({
                                    minPrice: option.minPrice?.toString(),
                                    maxPrice: option.maxPrice?.toString(),
                                    page: "1"
                                  });
                                } else if (suggestion.type === 'location') {
                                  updateSearchParams({ city: option.value, page: "1" });
                                } else if (suggestion.type === 'property_type') {
                                  updateSearchParams({ propertyType: option.value, page: "1" });
                                } else if (suggestion.type === 'amenities') {
                                  const currentAmenities = filters.amenities || [];
                                  if (!currentAmenities.includes(option.value)) {
                                    updateSearchParams({
                                      amenities: [...currentAmenities, option.value].join(','),
                                      page: "1"
                                    });
                                  }
                                }
                              }}
                              className="w-full text-left text-xs text-blue-700 hover:text-blue-900 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Loading State */}
          {isLoading && (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-48 bg-gray-200 animate-pulse" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse mb-3" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse mb-4" />
                    <div className="h-6 bg-gray-200 rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold text-red-600 mb-2">Error loading properties</h3>
              <p className="text-gray-600 mb-6">
                {error.message || "Something went wrong. Please try again."}
              </p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          )}

          {/* Search Results */}
          {!isLoading && !error && properties.length > 0 && (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {properties.map((property) => (
                <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 relative">
                      {property.featured && (
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-orange-500">Premium</Badge>
                        </div>
                      )}
                      {property.images?.[0] && (
                        <img
                          src={property.images[0].image_url}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{property.title}</h3>
                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      {property.location?.city}, {property.location?.state}
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mb-4">
                      <span>{property.area ? Number(property.area) : 'N/A'} sq ft</span>
                      <span>{property.bedrooms} BHK</span>
                      <span className="text-green-600 font-medium">
                        ROI: {property.predictions?.find(p => p.prediction_type === 'roi_analysis')?.predicted_value ? Number(property.predictions.find(p => p.prediction_type === 'roi_analysis')!.predicted_value) : 'N/A'}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-bold text-green-600">
                        ₹{property.price ? Number(property.price).toLocaleString('en-IN') : 'N/A'}
                      </span>
                      <Badge variant="outline">{property.property_type}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={compareList.includes(property.id) ? "default" : "outline"}
                        onClick={() => toggleCompare(property.id)}
                        className="flex items-center gap-1"
                      >
                        <GitCompare className="h-4 w-4" />
                        {compareList.includes(property.id) ? 'Remove' : 'Compare'}
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href={`/properties/${property.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* No Results State */}
          {!isLoading && !error && properties.length === 0 && (
            <div className="space-y-8">
              <div className="text-center py-8">
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found in this area</h3>
                <p className="text-gray-600 mb-6">
                  This might be a developing area. Check out our AI-powered price predictions below, or try adjusting your search criteria.
                </p>
                <Button asChild>
                  <Link href="/properties">Browse All Properties</Link>
                </Button>
              </div>

              {/* Price Predictions */}
              <div className="max-w-2xl mx-auto">
                <PricePrediction
                  location={filters.city || searchInput}
                  propertyType={filters.propertyType}
                  bedrooms={filters.bedrooms}
                />
              </div>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && apiPagination.totalPages > 1 && (
            <div className="mt-12">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (apiPagination.page > 1) handlePageChange(apiPagination.page - 1);
                      }}
                      className={apiPagination.page <= 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  {Array.from({ length: apiPagination.totalPages }, (_, i) => i + 1)
                    .filter(page => page >= Math.max(1, apiPagination.page - 2) && page <= Math.min(apiPagination.totalPages, apiPagination.page + 2))
                    .map(page => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={page === apiPagination.page}
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(page);
                          }}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                  {apiPagination.page + 2 < apiPagination.totalPages && (
                    <PaginationItem>
                      <PaginationLink href="#">...</PaginationLink>
                    </PaginationItem>
                  )}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (apiPagination.page < apiPagination.totalPages) handlePageChange(apiPagination.page + 1);
                      }}
                      className={apiPagination.page >= apiPagination.totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </>
  );
}