"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building,
  TrendingUp,
  Users,
  Calendar,
  Plus,
  Settings,
  AlertCircle,
  BarChart3,
  CheckCircle,
  Clock,
  Eye,
  Target,
  Megaphone,
  FileText,
  Activity
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface BuilderStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalRevenue: number;
  inquiriesThisMonth: number;
  propertiesSold: number;
  leadsThisMonth: number;
  activeLeads: number;
  activeCampaigns: number;
  totalCampaignReach: number;
}

interface Project {
  id: number;
  title: string;
  status: string;
  location: string;
  completionPercentage: number;
  inquiries: number;
  expectedCompletion: string;
}

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  budgetMin?: number;
  budgetMax?: number;
  preferredLocation?: string;
  requirements?: string;
  createdAt: string;
  property?: {
    title: string;
    city: string;
  };
}

interface Campaign {
  id: number;
  title: string;
  description?: string;
  type: string;
  status: string;
  budget?: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export default function BuilderDashboard() {
  const { user: authUser } = useAuth();
  const [stats, setStats] = useState<BuilderStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (authUser?.role === 'builder') {
      fetchBuilderData();
    }
  }, [authUser]);

  const fetchBuilderData = async () => {
    try {
      setLoading(true);
      // Mock data for builder dashboard
      const mockStats: BuilderStats = {
        totalProjects: 12,
        activeProjects: 8,
        completedProjects: 4,
        totalRevenue: 250000000, // 25 crores
        inquiriesThisMonth: 45,
        propertiesSold: 156,
        leadsThisMonth: 23,
        activeLeads: 67,
        activeCampaigns: 5,
        totalCampaignReach: 15420
      };

      const mockProjects: Project[] = [
        {
          id: 1,
          title: "Green Valley Residency",
          status: "under_construction",
          location: "Faridabad",
          completionPercentage: 75,
          inquiries: 12,
          expectedCompletion: "2025-06-01"
        },
        {
          id: 2,
          title: "Metro Heights Tower",
          status: "ready_to_move",
          location: "NCR",
          completionPercentage: 100,
          inquiries: 8,
          expectedCompletion: "2024-12-01"
        },
        {
          id: 3,
          title: "Lake View Villas",
          status: "new_launch",
          location: "Vrindavan",
          completionPercentage: 10,
          inquiries: 25,
          expectedCompletion: "2026-08-01"
        }
      ];

      const mockLeads: Lead[] = [
        {
          id: 1,
          name: "Rajesh Kumar",
          email: "rajesh.kumar@email.com",
          phone: "+91-9876543210",
          status: "qualified",
          source: "website",
          budgetMin: 5000000,
          budgetMax: 8000000,
          preferredLocation: "Faridabad",
          requirements: "3BHK apartment with parking",
          createdAt: "2024-10-01",
          property: {
            title: "Green Valley Residency",
            city: "Faridabad"
          }
        },
        {
          id: 2,
          name: "Priya Sharma",
          email: "priya.sharma@email.com",
          phone: "+91-9876543211",
          status: "contacted",
          source: "referral",
          budgetMin: 3000000,
          budgetMax: 5000000,
          preferredLocation: "Vrindavan",
          requirements: "2BHK villa with garden",
          createdAt: "2024-10-05"
        }
      ];

      const mockCampaigns: Campaign[] = [
        {
          id: 1,
          title: "Festival Offer 2024",
          description: "Special Diwali offers on all properties",
          type: "promotion",
          status: "active",
          budget: 50000,
          startDate: "2024-10-15",
          endDate: "2024-11-15",
          createdAt: "2024-10-01"
        },
        {
          id: 2,
          title: "Email Campaign - New Launches",
          description: "Promote new residential projects",
          type: "email",
          status: "active",
          budget: 25000,
          startDate: "2024-09-20",
          endDate: "2024-12-20",
          createdAt: "2024-09-15"
        }
      ];

      setStats(mockStats);
      setProjects(mockProjects);
      setLeads(mockLeads);
      setCampaigns(mockCampaigns);
    } catch (err) {
      console.error('Failed to fetch builder data:', err);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready_to_move': return 'bg-green-100 text-green-800';
      case 'under_construction': return 'bg-yellow-100 text-yellow-800';
      case 'new_launch': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready_to_move': return CheckCircle;
      case 'under_construction': return Clock;
      case 'new_launch': return Eye;
      default: return Building;
    }
  };

  if (!authUser || authUser.role !== 'builder') {
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
              <Button onClick={fetchBuilderData} className="mt-4">Try Again</Button>
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
          <h1 className="text-3xl font-bold mb-2">Builder Dashboard</h1>
          <p className="text-gray-600">Manage your projects and track performance</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 flex items-center">
              <div className="p-3 bg-blue-100 rounded-full mr-4">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalProjects}</div>
                <div className="text-sm text-gray-600">Total Projects</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center">
              <div className="p-3 bg-green-100 rounded-full mr-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center">
              <div className="p-3 bg-orange-100 rounded-full mr-4">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.activeLeads}</div>
                <div className="text-sm text-gray-600">Active Leads</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center">
              <div className="p-3 bg-purple-100 rounded-full mr-4">
                <Megaphone className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
                <div className="text-sm text-gray-600">Active Campaigns</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center">
              <div className="p-3 bg-indigo-100 rounded-full mr-4">
                <Target className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalCampaignReach.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Campaign Reach</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Projects Overview */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Active Projects</CardTitle>
                    <Button asChild>
                      <Link href="/builder/projects/new">
                        <Plus className="h-4 w-4 mr-2" />
                        New Project
                      </Link>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {projects.map((project) => {
                        const StatusIcon = getStatusIcon(project.status);
                        return (
                          <div key={project.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <StatusIcon className="h-5 w-5 text-gray-600" />
                                <div>
                                  <h4 className="font-semibold">{project.title}</h4>
                                  <p className="text-sm text-gray-600">{project.location}</p>
                                </div>
                              </div>
                              <Badge className={getStatusColor(project.status)}>
                                {project.status.replace('_', ' ')}
                              </Badge>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>{project.completionPercentage}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${project.completionPercentage}%` }}
                                ></div>
                              </div>
                            </div>

                            <div className="flex justify-between items-center mt-3 text-sm text-gray-600">
                              <span>{project.inquiries} inquiries</span>
                              <span>Expected: {new Date(project.expectedCompletion).toLocaleDateString()}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start" variant="outline" asChild>
                      <Link href="/builder/projects">
                        <Building className="h-4 w-4 mr-2" />
                        View All Projects
                      </Link>
                    </Button>
                    <Button className="w-full justify-start" variant="outline" asChild>
                      <Link href="/builder/analytics">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Analytics
                      </Link>
                    </Button>
                    <Button className="w-full justify-start" variant="outline" asChild>
                      <Link href="/builder/leads">
                        <Users className="h-4 w-4 mr-2" />
                        Manage Leads
                      </Link>
                    </Button>
                    <Button className="w-full justify-start" variant="outline" asChild>
                      <Link href="/builder/campaigns">
                        <Megaphone className="h-4 w-4 mr-2" />
                        Create Campaign
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Project Status Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Project Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Active Projects</span>
                      <span className="font-semibold">{stats.activeProjects}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Completed</span>
                      <span className="font-semibold">{stats.completedProjects}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">New Launches</span>
                      <span className="font-semibold">
                        {projects.filter(p => p.status === 'new_launch').length}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Project Management</CardTitle>
                <Button asChild>
                  <Link href="/builder/projects/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Project
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Project Management Coming Soon</h3>
                  <p className="text-gray-600">Full CRUD operations for project listings will be available here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leads" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Lead Management</CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Lead
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leads.map((lead) => (
                    <div key={lead.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{lead.name}</h4>
                          <p className="text-sm text-gray-600">{lead.email} • {lead.phone}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={lead.status === 'qualified' ? 'bg-green-100 text-green-800' :
                                          lead.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                                          'bg-gray-100 text-gray-800'}>
                            {lead.status}
                          </Badge>
                          <Badge variant="outline">{lead.source}</Badge>
                        </div>
                      </div>
                      {lead.property && (
                        <p className="text-sm text-gray-600 mb-2">
                          Interested in: {lead.property.title} ({lead.property.city})
                        </p>
                      )}
                      {lead.requirements && (
                        <p className="text-sm text-gray-600 mb-2">
                          Requirements: {lead.requirements}
                        </p>
                      )}
                      {lead.budgetMin && lead.budgetMax && (
                        <p className="text-sm text-gray-600">
                          Budget: {formatCurrency(lead.budgetMin)} - {formatCurrency(lead.budgetMax)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Promotional Campaigns</CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{campaign.title}</h4>
                          <p className="text-sm text-gray-600">{campaign.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                                          campaign.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                                          'bg-blue-100 text-blue-800'}>
                            {campaign.status}
                          </Badge>
                          <Badge variant="outline">{campaign.type}</Badge>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        {campaign.budget && (
                          <span>Budget: {formatCurrency(campaign.budget)}</span>
                        )}
                        {campaign.startDate && campaign.endDate && (
                          <span>
                            {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Revenue Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Revenue</span>
                      <span className="font-semibold text-green-600">{formatCurrency(stats.totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Properties Sold</span>
                      <span className="font-semibold">{stats.propertiesSold}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Avg. Property Value</span>
                      <span className="font-semibold">
                        {formatCurrency(Math.round(stats.totalRevenue / Math.max(stats.propertiesSold, 1)))}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Client Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Active Leads</span>
                      <span className="font-semibold">{stats.activeLeads}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">New Leads (This Month)</span>
                      <span className="font-semibold text-blue-600">{stats.leadsThisMonth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Campaign Reach</span>
                      <span className="font-semibold">{stats.totalCampaignReach.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Active Campaigns</span>
                      <span className="font-semibold">{stats.activeCampaigns}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}