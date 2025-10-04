"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi, userApi } from "@/lib/api";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Fetch user profile from API
          const profileData = await userApi.getProfile();
          setUser({
            id: profileData.user.id.toString(),
            email: profileData.user.email,
            firstName: profileData.user.firstName,
            lastName: profileData.user.lastName,
            phone: profileData.user.phone,
          });
        } catch (error) {
          // Token might be invalid, remove it
          console.error('Failed to fetch user profile:', error);
          localStorage.removeItem("token");
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(email, password);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Login failed");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      setUser({
        id: data.user.id.toString(),
        email: data.user.email,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        phone: data.user.phone,
      });
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(userData);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Registration failed");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      setUser({
        id: data.user.id.toString(),
        email: data.user.email,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        phone: data.user.phone,
      });
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}