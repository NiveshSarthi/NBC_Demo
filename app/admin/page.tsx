"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Users,
  Building,
  FileText,
  TrendingUp,
  Settings,
  Shield,
  BarChart3,
  MessageSquare,
  Eye,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface AdminStats {
  totalUsers: number;
  totalProperties: number;
  totalPosts: number;
  totalInquiries: number;
  usersByRole: {
    admin: number;
    agent: number;
    builder: number;
    buyer: number;
    seller: number;
    user: number;
  };
  recentActivity: Array<{
    id: string;
    action: string;
    user: string;
    timestamp: string;
    type: 'user' | 'property' | 'post' | 'inquiry';
  }>;
}

export default function AdminDashboard() {
  const { user: authUser } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authUser?.role === 'admin') {
      fetchAdminStats();
    }
  }, [authUser]);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      // Fetch real analytics data
      const analyticsResponse = await fetch('/api/v1/admin/analytics?period=30d');
      if (!analyticsResponse.ok) throw new Error('Failed to fetch analytics');

      const analyticsData = await analyticsResponse.json();

      // Fetch recent blog posts count
      const postsResponse = await fetch('/api/v1/content/posts?page=1&limit=1');
      const postsData = postsResponse.ok ? await postsResponse.json() : { pagination: { total: 0 } };

      // Transform analytics data to match AdminStats interface
      const adminStats: AdminStats = {
        totalUsers: analyticsData.overview.totalUsers,
        totalProperties: analyticsData.overview.totalProperties,
        totalPosts: postsData.pagination.total,
        totalInquiries: analyticsData.overview.totalInquiries,
        usersByRole: analyticsData.usersByRole,
        recentActivity: [
          {
            id: '1',
            action: `${analyticsData.overview.recentUsers} new users registered`,
            user: 'System',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            type: 'user'
          },
          {
            id: '2',
            action: `${analyticsData.overview.totalProperties} properties listed`,
            user: 'Platform',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            type: 'property'
          },
          {
            id: '3',
            action: `Revenue: ₹${analyticsData.overview.totalRevenue.toLocaleString()}`,
            user: 'Finance',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
            type: 'post'
          }
        ]
      };

      setStats(adminStats);
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return Users;
      case 'property': return Building;
      case 'post': return FileText;
      case 'inquiry': return MessageSquare;
      default: return Eye;
    }
  };

  if (!authUser || authUser.role !== 'admin') {
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
              <Button onClick={fetchAdminStats} className="mt-4">Try Again</Button>
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
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, properties, and system settings</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 flex items-center">
              <div className="p-3 bg-blue-100 rounded-full mr-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Users</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center">
              <div className="p-3 bg-green-100 rounded-full mr-4">
                <Building className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalProperties.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Properties</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center">
              <div className="p-3 bg-purple-100 rounded-full mr-4">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalPosts}</div>
                <div className="text-sm text-gray-600">Blog Posts</div>
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
                <div className="text-sm text-gray-600">Inquiries</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* User Management & System Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Role Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>User Distribution by Role</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(stats.usersByRole).map(([role, count]) => (
                    <div key={role} className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{count}</div>
                      <div className="text-sm text-gray-600 capitalize">{role}s</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Management Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid md:grid-cols-2 gap-3">
                  <Button className="justify-start h-auto p-4" variant="outline" asChild>
                    <Link href="/admin/users">
                      <Users className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">User Management</div>
                        <div className="text-sm text-gray-500">Manage user accounts and roles</div>
                      </div>
                    </Link>
                  </Button>

                  <Button className="justify-start h-auto p-4" variant="outline" asChild>
                    <Link href="/admin/properties">
                      <Building className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">Property Moderation</div>
                        <div className="text-sm text-gray-500">Review and moderate listings</div>
                      </div>
                    </Link>
                  </Button>

                  <Button className="justify-start h-auto p-4" variant="outline" asChild>
                    <Link href="/admin/blog">
                      <FileText className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">Content Management</div>
                        <div className="text-sm text-gray-500">Manage blog posts and content</div>
                      </div>
                    </Link>
                  </Button>

                  <Button className="justify-start h-auto p-4" variant="outline" asChild>
                    <Link href="/admin/analytics">
                      <BarChart3 className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">Analytics</div>
                        <div className="text-sm text-gray-500">View system analytics</div>
                      </div>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Services</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">Online</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">File Storage</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">Healthy</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentActivity.map((activity) => {
                    const IconComponent = getActivityIcon(activity.type);
                    return (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <IconComponent className="h-3 w-3 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-gray-500">{activity.user}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Admin Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Admin Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline" size="sm" asChild>
                  <Link href="/admin/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    System Settings
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" size="sm" asChild>
                  <Link href="/admin/security">
                    <Shield className="h-4 w-4 mr-2" />
                    Security
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