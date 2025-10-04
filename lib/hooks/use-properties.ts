import useSWR from "swr";
import type { PropertiesResponse, SearchPropertiesResponse, PropertyWithDetails, PropertyFilters, PaginationOptions } from "@/types/api";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useProperties(filters?: PropertyFilters, pagination?: PaginationOptions) {
  const queryParams = new URLSearchParams();

  // Add filters
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          queryParams.set(key, value.join(','));
        } else {
          queryParams.set(key, String(value));
        }
      }
    });
  }

  // Add pagination
  if (pagination) {
    if (pagination.page) queryParams.set('page', String(pagination.page));
    if (pagination.limit) queryParams.set('limit', String(pagination.limit));
    if (pagination.sortBy) queryParams.set('sortBy', String(pagination.sortBy));
    if (pagination.sortOrder) queryParams.set('sortOrder', String(pagination.sortOrder));
  }

  const queryString = queryParams.toString();
  const url = `/api/v1/properties${queryString ? `?${queryString}` : ""}`;

  const { data, error, isLoading, mutate } = useSWR<PropertiesResponse>(url, fetcher);

  return {
    properties: data?.properties || [],
    pagination: data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 },
    isLoading,
    error,
    mutate,
  };
}

export function useProperty(id: string | number) {
  const { data, error, isLoading } = useSWR<PropertyWithDetails>(
    id ? `/api/v1/properties/${id}` : null,
    fetcher
  );

  return {
    property: data,
    isLoading,
    error,
  };
}

export function useSearchProperties(query: string, filters?: PropertyFilters, pagination?: PaginationOptions) {
  const queryParams = new URLSearchParams();

  // Add search query
  if (query) {
    queryParams.set('q', query);
  }

  // Add filters
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          queryParams.set(key, value.join(','));
        } else {
          queryParams.set(key, String(value));
        }
      }
    });
  }

  // Add pagination
  if (pagination) {
    if (pagination.page) queryParams.set('page', String(pagination.page));
    if (pagination.limit) queryParams.set('limit', String(pagination.limit));
    if (pagination.sortBy) queryParams.set('sortBy', String(pagination.sortBy));
    if (pagination.sortOrder) queryParams.set('sortOrder', String(pagination.sortOrder));
  }

  const queryString = queryParams.toString();
  const url = queryString ? `/api/v1/properties/search?${queryString}` : null;

  const { data, error, isLoading, mutate } = useSWR<SearchPropertiesResponse>(url, fetcher);

  return {
    properties: data?.properties || [],
    pagination: data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 },
    searchQuery: data?.searchQuery,
    isLoading,
    error,
    mutate,
  };
}