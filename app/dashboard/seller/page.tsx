"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Building,
  TrendingUp,
  Users,
  Calendar,
  Plus,
  Settings,
  AlertCircle,
  BarChart3,
  Eye,
  MessageSquare,
  Edit,
  DollarSign
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface SellerStats {
  totalListings: number;
  activeListings: number;
  totalViews: number;
  totalInquiries: number;
  averageResponseTime: number;
  estimatedValue: number;
}

interface PropertyListing {
  id: number;
  title: string;
  price: number;
  location: string;
  status: string;
  views: number;
  inquiries: number;
  featured: boolean;
  listedDate: string;
}

interface Inquiry {
  id: number;
  propertyId: number;
  propertyTitle: string;
  buyerName: string;
  buyerEmail: string;
  message: string;
  inquiryDate: string;
  status: 'new' | 'responded' | 'closed';
}

export default function SellerDashboard() {
  const { user: authUser } = useAuth();
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [listings, setListings] = useState<PropertyListing[]>([]);
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authUser?.role === 'seller') {
      fetchSellerData();
    }
  }, [authUser]);

  const fetchSellerData = async () => {
    try {
      setLoading(true);
      // Mock data for seller dashboard
      const mockStats: SellerStats = {
        totalListings: 8,
        activeListings: 6,
        totalViews: 1247,
        totalInquiries: 34,
        averageResponseTime: 2.5, // hours
        estimatedValue: 120000000 // 12 crores
      };

      const mockListings: PropertyListing[] = [
        {
          id: 1,
          title: "4BHK Villa in Green Valley",
          price: 25000000,
          location: "Faridabad",
          status: "active",
          views: 156,
          inquiries: 8,
          featured: true,
          listedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString()
        },
        {
          id: 2,
          title: "3BHK Apartment in Metro Heights",
          price: 8500000,
          location: "NCR",
          status: "active",
          views: 89,
          inquiries: 5,
          featured: false,
          listedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString()
        },
        {
          id: 3,
          title: "Commercial Plot in Industrial Area",
          price: 45000000,
          location: "Vrindavan",
          status: "sold",
          views: 234,
          inquiries: 12,
          featured: true,
          listedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString()
        }
      ];

      const mockInquiries: Inquiry[] = [
        {
          id: 1,
          propertyId: 1,
          propertyTitle: "4BHK Villa in Green Valley",
          buyerName: "Rahul Verma",
          buyerEmail: "rahul.verma@email.com",
          message: "I'm interested in this property. Can we schedule a visit?",
          inquiryDate: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          status: 'new'
        },
        {
          id: 2,
          propertyId: 2,
          propertyTitle: "3BHK Apartment in Metro Heights",
          buyerName: "Priya Singh",
          buyerEmail: "priya.singh@email.com",
          message: "What are the maintenance charges for this property?",
          inquiryDate: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
          status: 'responded'
        }
      ];

      setStats(mockStats);
      setListings(mockListings);
      setRecentInquiries(mockInquiries);
    } catch (err) {
      console.error('Failed to fetch seller data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) { // 1 crore
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) { // 1 lakh
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
  };

  if (!authUser || authUser.role !== 'seller') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">{error || 'Failed to load dashboard'}</p>
              <Button onClick={fetchSellerData} className="mt-4">Try Again</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Seller Dashboard</h1>
          <p className="text-gray-600">Manage your property listings and track buyer interest</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 flex items-center">
              <div className="p-3 bg-blue-100 rounded-full mr-4">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalListings}</div>
                <div className="text-sm text-gray-600">Total Listings</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center">
              <div className="p-3 bg-green-100 rounded-full mr-4">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Views</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center">
              <div className="p-3 bg-orange-100 rounded-full mr-4">
                <MessageSquare className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalInquiries}</div>
                <div className="text-sm text-gray-600">Total Inquiries</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center">
              <div className="p-3 bg-purple-100 rounded-full mr-4">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{formatCurrency(stats.estimatedValue)}</div>
                <div className="text-sm text-gray-600">Portfolio Value</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Listings */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>My Property Listings</CardTitle>
                <Button asChild>
                  <Link href="/seller/listings/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Listing
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {listings.map((listing) => (
                    <div key={listing.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {listing.featured && (
                            <Badge variant="default" className="bg-yellow-500">Featured</Badge>
                          )}
                          <div>
                            <h4 className="font-semibold">{listing.title}</h4>
                            <p className="text-sm text-gray-600">{listing.location}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(listing.price)}</div>
                          <Badge variant={listing.status === 'active' ? 'default' : 'secondary'}>
                            {listing.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="block text-gray-500">Views</span>
                          <span className="font-medium">{listing.views}</span>
                        </div>
                        <div>
                          <span className="block text-gray-500">Inquiries</span>
                          <span className="font-medium">{listing.inquiries}</span>
                        </div>
                        <div>
                          <span className="block text-gray-500">Listed</span>
                          <span className="font-medium">
                            {new Date(listing.listedDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-end">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/seller/listings/${listing.id}/edit`}>
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Inquiries */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Inquiries</CardTitle>
                <Button variant="outline" asChild>
                  <Link href="/seller/inquiries">
                    View All
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentInquiries.map((inquiry) => (
                    <div key={inquiry.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{inquiry.propertyTitle}</h4>
                          <p className="text-sm text-gray-600">From: {inquiry.buyerName}</p>
                        </div>
                        <Badge variant={inquiry.status === 'new' ? 'destructive' : 'default'}>
                          {inquiry.status}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{inquiry.message}</p>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>{new Date(inquiry.inquiryDate).toLocaleString()}</span>
                        <Button variant="outline" size="sm">
                          Respond
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Active Listings</span>
                  <span className="font-semibold">{stats.activeListings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Avg. Response Time</span>
                  <span className="font-semibold">{stats.averageResponseTime}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Conversion Rate</span>
                  <span className="font-semibold">
                    {((stats.totalInquiries / stats.totalViews) * 100).toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/seller/listings">
                    <Building className="h-4 w-4 mr-2" />
                    Manage Listings
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/seller/inquiries">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    View Inquiries
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/seller/analytics">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/seller/schedule">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Visits
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Tips for Sellers */}
            <Card>
              <CardHeader>
                <CardTitle>Pro Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• High-quality photos increase views by 300%</li>
                  <li>• Respond to inquiries within 2 hours</li>
                  <li>• Complete property details attract serious buyers</li>
                  <li>• Schedule visits during buyer-preferred times</li>
                </ul>
              </CardContent>
            </Card>

            {/* Seller Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/seller/profile">
                    <Settings className="h-4 w-4 mr-2" />
                    Profile Settings
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}