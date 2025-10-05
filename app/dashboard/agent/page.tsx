"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  Building,
  TrendingUp,
  Calendar,
  Plus,
  Settings,
  AlertCircle,
  BarChart3,
  Phone,
  MessageSquare,
  DollarSign,
  Calculator,
  Eye,
  Mail,
  CheckCircle,
  Clock,
  XCircle,
  PieChart,
  TrendingDown,
  Target
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface AgentStats {
  totalClients: number;
  activeListings: number;
  propertiesSold: number;
  totalCommission: number;
  inquiriesThisMonth: number;
  scheduledVisits: number;
}

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  budget: number;
  preferredLocation: string;
  lastContact: string;
  status: 'active' | 'inactive' | 'closed';
}

interface Listing {
  id: number;
  propertyTitle: string;
  price: number;
  location: string;
  status: string;
  inquiries: number;
  views: number;
}

interface Inquiry {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  inquiryType: string;
  status: string;
  response?: string;
  respondedAt?: string;
  createdAt: string;
  property: {
    id: number;
    title: string;
    price?: number;
    rentAmount?: number;
    listingType: string;
    city: string;
    image?: string;
  };
}

interface CommissionCalculation {
  structure: string;
  propertyValue: number;
  commission: number;
  breakdown: Array<{
    description: string;
    amount: number;
  }>;
}

interface PerformanceMetrics {
  overview: {
    totalProperties: number;
    totalViews: number;
    totalInquiries: number;
    averageResponseTime: number;
    conversionRate: number;
    revenue: number;
  };
  trends: {
    monthlyTrends: Array<{
      month: string;
      views: number;
      inquiries: number;
    }>;
  };
  responseMetrics: {
    total: number;
    responded: number;
    pending: number;
    averageResponseTime: number;
  };
}

export default function AgentDashboard() {
  const { user: authUser } = useAuth();
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [commissionCalc, setCommissionCalc] = useState<CommissionCalculation | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Commission calculator state
  const [propertyValue, setPropertyValue] = useState<string>('');
  const [commissionStructure, setCommissionStructure] = useState<string>('standard');

  // Inquiry management state
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [inquiryResponse, setInquiryResponse] = useState<string>('');
  const [inquiryStatus, setInquiryStatus] = useState<string>('responded');

  useEffect(() => {
    if (authUser?.role === 'agent') {
      fetchDashboardData();
      fetchInquiries();
      fetchPerformanceMetrics();
    }
  }, [authUser]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/v1/agent/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setStats(data.stats);
      setClients(data.recentClients);
      setListings(data.listings);
    } catch (err) {
      console.error('Failed to fetch agent data:', err);
      setError('Failed to load dashboard data');
    }
  };

  const fetchInquiries = async () => {
    try {
      const response = await fetch('/api/v1/agent/inquiries', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setInquiries(data.inquiries);
      }
    } catch (err) {
      console.error('Failed to fetch inquiries:', err);
    }
  };

  const fetchPerformanceMetrics = async () => {
    try {
      const response = await fetch('/api/v1/agent/performance', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPerformanceMetrics(data);
      }
    } catch (err) {
      console.error('Failed to fetch performance metrics:', err);
    }
  };

  const calculateCommission = async () => {
    if (!propertyValue) return;

    try {
      const response = await fetch(`/api/v1/agent/commission-calculator?value=${propertyValue}&structure=${commissionStructure}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCommissionCalc(data);
      }
    } catch (err) {
      console.error('Failed to calculate commission:', err);
    }
  };

  const updateInquiry = async (inquiryId: number) => {
    try {
      const response = await fetch('/api/v1/agent/inquiries', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          inquiryId,
          response: inquiryResponse,
          status: inquiryStatus
        })
      });

      if (response.ok) {
        setSelectedInquiry(null);
        setInquiryResponse('');
        fetchInquiries(); // Refresh inquiries
      }
    } catch (err) {
      console.error('Failed to update inquiry:', err);
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

  if (!authUser || authUser.role !== 'agent') {
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
              <Button onClick={fetchDashboardData} className="mt-4">Try Again</Button>
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
          <h1 className="text-3xl font-bold mb-2">Agent Panel</h1>
          <p className="text-gray-600">Comprehensive property management, client tracking, and performance analytics</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
            <TabsTrigger value="commission">Commission</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6 flex items-center">
                  <div className="p-3 bg-blue-100 rounded-full mr-4">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats?.totalClients || 0}</div>
                    <div className="text-sm text-gray-600">Total Clients</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex items-center">
                  <div className="p-3 bg-green-100 rounded-full mr-4">
                    <Building className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats?.activeListings || 0}</div>
                    <div className="text-sm text-gray-600">Active Listings</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex items-center">
                  <div className="p-3 bg-purple-100 rounded-full mr-4">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{formatCurrency(stats?.totalCommission || 0)}</div>
                    <div className="text-sm text-gray-600">Total Commission</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex items-center">
                  <div className="p-3 bg-orange-100 rounded-full mr-4">
                    <MessageSquare className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats?.inquiriesThisMonth || 0}</div>
                    <div className="text-sm text-gray-600">Inquiries/Month</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Recent Clients */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Clients</CardTitle>
                  <Button asChild>
                    <Link href="/agent/clients">
                      View All
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {clients.slice(0, 5).map((client) => (
                      <div key={client.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{client.name}</h4>
                            <p className="text-sm text-gray-600">{client.email}</p>
                          </div>
                          <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                            {client.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Budget:</span>
                            <span className="ml-2 font-medium">{formatCurrency(client.budget)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Location:</span>
                            <span className="ml-2 font-medium">{client.preferredLocation}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Active Listings */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Active Listings</CardTitle>
                  <Button asChild>
                    <Link href="/agent/listings/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Listing
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {listings.slice(0, 5).map((listing) => (
                      <div key={listing.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{listing.propertyTitle}</h4>
                            <p className="text-sm text-gray-600">{listing.location}</p>
                          </div>
                          <Badge variant="default">{formatCurrency(listing.price)}</Badge>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{listing.inquiries} inquiries</span>
                          <span>{listing.views} views</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Property Portfolio Management</CardTitle>
                <p className="text-sm text-gray-600">Manage your property listings and track performance</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {listings.map((listing) => (
                    <div key={listing.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-lg">{listing.propertyTitle}</h4>
                          <p className="text-sm text-gray-600">{listing.location}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="default" className="mb-2">{formatCurrency(listing.price)}</Badge>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              {listing.views}
                            </Button>
                            <Button size="sm" variant="outline">
                              <Mail className="h-4 w-4 mr-1" />
                              {listing.inquiries}
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <Button size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Edit Listing
                        </Button>
                        <Button size="sm" variant="outline">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          View Analytics
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inquiries" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Inquiry Tracking</CardTitle>
                <p className="text-sm text-gray-600">Manage and respond to property inquiries</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inquiries.map((inquiry) => (
                    <div key={inquiry.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{inquiry.name}</h4>
                            <Badge variant={
                              inquiry.status === 'new' ? 'destructive' :
                              inquiry.status === 'responded' ? 'default' : 'secondary'
                            }>
                              {inquiry.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{inquiry.email} • {inquiry.phone}</p>
                          <p className="text-sm mb-2">{inquiry.message}</p>
                          <p className="text-xs text-gray-500">
                            Property: {inquiry.property.title} • {formatCurrency(inquiry.property.price || inquiry.property.rentAmount || 0)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => setSelectedInquiry(inquiry)}
                        >
                          Respond
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Response Modal */}
            {selectedInquiry && (
              <Card>
                <CardHeader>
                  <CardTitle>Respond to {selectedInquiry.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Response</label>
                    <Textarea
                      value={inquiryResponse}
                      onChange={(e) => setInquiryResponse(e.target.value)}
                      placeholder="Type your response..."
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <Select value={inquiryStatus} onValueChange={setInquiryStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="responded">Responded</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => updateInquiry(selectedInquiry.id)}>
                      Send Response
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedInquiry(null)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="commission" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Commission Calculator</CardTitle>
                <p className="text-sm text-gray-600">Calculate commissions with different structures</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Property Value (₹)</label>
                    <Input
                      type="number"
                      value={propertyValue}
                      onChange={(e) => setPropertyValue(e.target.value)}
                      placeholder="Enter property value"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Commission Structure</label>
                    <Select value={commissionStructure} onValueChange={setCommissionStructure}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard (2%)</SelectItem>
                        <SelectItem value="premium">Premium (3%)</SelectItem>
                        <SelectItem value="fixed">Fixed (₹50,000)</SelectItem>
                        <SelectItem value="tiered">Tiered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={calculateCommission} className="w-full">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Commission
                </Button>
              </CardContent>
            </Card>

            {commissionCalc && (
              <Card>
                <CardHeader>
                  <CardTitle>Commission Calculation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {formatCurrency(commissionCalc.commission)}
                      </div>
                      <p className="text-sm text-gray-600">Total Commission</p>
                    </div>
                    <div className="space-y-2">
                      {commissionCalc.breakdown.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.description}</span>
                          <span className="font-medium">{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {performanceMetrics && (
              <>
                <div className="grid md:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold">{performanceMetrics.overview.totalViews}</div>
                      <div className="text-sm text-gray-600">Total Views</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Mail className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold">{performanceMetrics.overview.totalInquiries}</div>
                      <div className="text-sm text-gray-600">Total Inquiries</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold">{performanceMetrics.overview.conversionRate}%</div>
                      <div className="text-sm text-gray-600">Conversion Rate</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold">{performanceMetrics.overview.averageResponseTime}h</div>
                      <div className="text-sm text-gray-600">Avg Response Time</div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {performanceMetrics.trends.monthlyTrends.map((trend, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="font-medium">{trend.month}</div>
                          <div className="flex gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {trend.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {trend.inquiries}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}