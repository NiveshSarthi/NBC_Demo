import useSWR from "swr";

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
}

interface SavedProperty {
  id: string;
  propertyId: string;
  savedAt: string;
  property: {
    id: string;
    title: string;
    price: number;
    location: string;
    images: string[];
  };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useUserProfile() {
  const { data, error, isLoading, mutate } = useSWR<UserProfile>("/api/v1/user/profile", fetcher);

  return {
    profile: data,
    isLoading,
    error,
    mutate,
  };
}

export function useSavedProperties() {
  const { data, error, isLoading, mutate } = useSWR<{ savedProperties: SavedProperty[] }>(
    "/api/v1/user/saved-properties",
    fetcher
  );

  return {
    savedProperties: data?.savedProperties || [],
    isLoading,
    error,
    mutate,
  };
}

export async function saveProperty(propertyId: string) {
  const response = await fetch("/api/v1/user/save-property", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ propertyId }),
  });

  if (!response.ok) {
    throw new Error("Failed to save property");
  }

  return response.json();
}

export async function unsaveProperty(propertyId: string) {
  const response = await fetch(`/api/v1/user/save-property?propertyId=${propertyId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to unsave property");
  }

  return response.json();
}

export async function sendInquiry(propertyId: string, message: string) {
  const response = await fetch("/api/v1/user/inquiry", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ propertyId, message }),
  });

  if (!response.ok) {
    throw new Error("Failed to send inquiry");
  }

  return response.json();
}