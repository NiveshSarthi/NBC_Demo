"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Heart,
  Settings,
  TrendingUp,
  Calendar,
  MapPin,
  Eye,
  MessageSquare,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { userApi, ApiError } from "@/lib/api";

interface DashboardStats {
  propertiesViewed: number;
  savedProperties: number;
  activeInquiries: number;
  portfolioValue: number;
}

interface Activity {
  id: string;
  action: string;
  icon: string;
  link: string;
  timeAgo: string;
  timestamp: string;
}

interface SavedProperty {
  id: number;
  title: string;
  price: number;
  city: string;
  state: string;
  ai_score?: number;
  images: Array<{ image_url: string }>;
}

interface DashboardData {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    avatarUrl?: string;
    createdAt?: string;
  };
  stats: DashboardStats;
  activities: Activity[];
  savedProperties: SavedProperty[];
}

export default function DashboardPage() {
  const { user: authUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !authUser) {
      router.push('/login');
      return;
    }

    if (authUser) {
      fetchDashboardData();
    }
  }, [authUser, authLoading, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [profileData, statsData, activityData, savedPropertiesData] = await Promise.all([
        userApi.getProfile(),
        userApi.getDashboardStats(),
        userApi.getActivity(5), // Get 5 recent activities
        userApi.getSavedProperties({ limit: 2 }), // Get 2 saved properties for preview
      ]);

      setData({
        user: profileData.user,
        stats: statsData.stats,
        activities: activityData.activities,
        savedProperties: savedPropertiesData.properties,
      });
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.code === 'UNAUTHORIZED') {
          router.push('/login');
        }
      } else {
        setError('Failed to load dashboard data');
      }
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

  const getActivityIcon = (iconName: string) => {
    switch (iconName) {
      case 'eye': return Eye;
      case 'heart': return Heart;
      case 'message-square': return MessageSquare;
      case 'trending-up': return TrendingUp;
      default: return Eye;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Alert className="max-w-md mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="text-center mt-4">
            <Button onClick={fetchDashboardData}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {data.user.firstName}!
          </h1>
          <p className="text-gray-600">Here's an overview of your account and recent activity.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
           <Card>
             <CardContent className="p-6 flex items-center">
               <div className="p-3 bg-blue-100 rounded-full mr-4">
                 <Eye className="h-6 w-6 text-blue-600" />
               </div>
               <div>
                 <div className="text-2xl font-bold">{data.stats.propertiesViewed}</div>
                 <div className="text-sm text-gray-600">Properties Viewed</div>
               </div>
             </CardContent>
           </Card>

           <Card>
             <CardContent className="p-6 flex items-center">
               <div className="p-3 bg-red-100 rounded-full mr-4">
                 <Heart className="h-6 w-6 text-red-600" />
               </div>
               <div>
                 <div className="text-2xl font-bold">{data.stats.savedProperties}</div>
                 <div className="text-sm text-gray-600">Saved Properties</div>
               </div>
             </CardContent>
           </Card>

           <Card>
             <CardContent className="p-6 flex items-center">
               <div className="p-3 bg-green-100 rounded-full mr-4">
                 <TrendingUp className="h-6 w-6 text-green-600" />
               </div>
               <div>
                 <div className="text-2xl font-bold">{formatCurrency(data.stats.portfolioValue)}</div>
                 <div className="text-sm text-gray-600">Portfolio Value</div>
               </div>
             </CardContent>
           </Card>

           <Card>
             <CardContent className="p-6 flex items-center">
               <div className="p-3 bg-orange-100 rounded-full mr-4">
                 <MessageSquare className="h-6 w-6 text-orange-600" />
               </div>
               <div>
                 <div className="text-2xl font-bold">{data.stats.activeInquiries}</div>
                 <div className="text-sm text-gray-600">Active Inquiries</div>
               </div>
             </CardContent>
           </Card>
         </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {data.activities.length > 0 ? (
                  <div className="space-y-4">
                    {data.activities.map((activity) => {
                      const IconComponent = getActivityIcon(activity.icon);
                      return (
                        <div key={activity.id} className="flex items-center p-4 border rounded-lg">
                          <div className="p-2 bg-blue-100 rounded-full mr-3">
                            <IconComponent className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{activity.action}</p>
                            <p className="text-sm text-gray-600">{activity.timeAgo}</p>
                          </div>
                          {activity.link && (
                            <Button variant="outline" size="sm" asChild>
                              <Link href={activity.link}>View</Link>
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No recent activity yet</p>
                    <p className="text-sm">Start exploring properties to see your activity here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Saved Properties Preview */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Saved Properties</CardTitle>
                <Button variant="outline" asChild>
                  <Link href="/saved-properties">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {data.savedProperties.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {data.savedProperties.map((property) => (
                      <div key={property.id} className="border rounded-lg p-4">
                        <div className="h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded mb-3 flex items-center justify-center">
                          {property.images.length > 0 ? (
                            <img
                              src={property.images[0].image_url}
                              alt={property.title}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <MapPin className="h-8 w-8 text-white" />
                          )}
                        </div>
                        <h4 className="font-semibold mb-1">{property.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {property.city}, {property.state} • {formatCurrency(property.price)}
                        </p>
                        <div className="flex justify-between items-center">
                          {property.ai_score && (
                            <Badge variant="secondary">Score: {property.ai_score}%</Badge>
                          )}
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/properties/${property.id}`}>View</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No saved properties yet</p>
                    <p className="text-sm">Start saving properties you're interested in</p>
                    <Button className="mt-4" asChild>
                      <Link href="/properties">Browse Properties</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    {data.user.avatarUrl ? (
                      <img
                        src={data.user.avatarUrl}
                        alt={`${data.user.firstName} ${data.user.lastName}`}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {data.user.firstName} {data.user.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Investor since {new Date(data.user.createdAt || Date.now()).getFullYear()}
                    </p>
                  </div>
                </div>
                <Button className="w-full mb-3" asChild>
                  <Link href="/profile">
                    <User className="h-4 w-4 mr-2" />
                    View Profile
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Account Settings
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/properties">
                    <MapPin className="h-4 w-4 mr-2" />
                    Browse Properties
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/saved-properties">
                    <Heart className="h-4 w-4 mr-2" />
                    Saved Properties
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/portfolio">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Investment Portfolio
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-full mr-3">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Property Viewing</p>
                      <p className="text-sm text-gray-600">Tomorrow, 2:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-full mr-3">
                      <MessageSquare className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Agent Follow-up</p>
                      <p className="text-sm text-gray-600">Friday, 10:00 AM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}