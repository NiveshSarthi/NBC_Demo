"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, Search, CheckCircle, XCircle, Eye, Building } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/lib/auth-context";

interface Property {
  id: number;
  title: string;
  address: string | null;
  city: string | null;
  status: string;
  price: number | null;
  created_at: string;
  creator: {
    id: number;
    first_name: string | null;
    last_name: string | null;
    email: string;
    role: string;
  };
  location: {
    id: number;
    name: string;
  } | null;
  reraCompliance: {
    id: number;
    approval_status: string;
    registration_number: string;
  } | null;
  _count: {
    inquiries: number;
    property_reviews: number;
    saved_properties: number;
  };
}

export default function AdminPropertiesPage() {
  const { user: authUser } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [needsApproval, setNeedsApproval] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (authUser?.role === 'admin') {
      fetchProperties();
    }
  }, [authUser, searchTerm, statusFilter, needsApproval, currentPage]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        search: searchTerm,
        status: statusFilter,
        needs_approval: needsApproval.toString(),
      });

      const response = await fetch(`/api/v1/admin/properties?${params}`);
      if (!response.ok) throw new Error('Failed to fetch properties');

      const data = await response.json();
      setProperties(data.properties);
      setTotalPages(data.pagination.pages);
    } catch (err) {
      console.error('Failed to fetch properties:', err);
      setError('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyAction = async (propertyId: number, action: 'approve' | 'reject' | 'suspend') => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/v1/admin/properties', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: propertyId, action }),
      });

      if (!response.ok) throw new Error('Failed to update property');

      fetchProperties();
    } catch (err) {
      console.error('Failed to update property:', err);
      setError(`Failed to ${action} property`);
    } finally {
      setActionLoading(false);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Property Moderation</h1>
            <p className="text-gray-600">Review and moderate property listings</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search properties..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="rented">Rented</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant={needsApproval ? "default" : "outline"}
                onClick={() => setNeedsApproval(!needsApproval)}
              >
                Needs Approval Only
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Properties Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600">{error}</p>
                <Button onClick={fetchProperties} className="mt-4">Try Again</Button>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>RERA</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Inquiries</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {properties.map((property) => (
                      <TableRow key={property.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{property.title}</div>
                            <div className="text-sm text-gray-500">
                              {property.address}, {property.city}
                            </div>
                            <div className="text-xs text-gray-400">
                              Listed {new Date(property.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {property.creator.first_name} {property.creator.last_name}
                            </div>
                            <div className="text-sm text-gray-500">{property.creator.email}</div>
                            <Badge variant="outline" className="text-xs">
                              {property.creator.role}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              property.status === 'active'
                                ? 'default'
                                : property.status === 'inactive'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {property.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {property.reraCompliance ? (
                            <Badge
                              variant={
                                property.reraCompliance.approval_status === 'approved'
                                  ? 'default'
                                  : property.reraCompliance.approval_status === 'pending'
                                  ? 'secondary'
                                  : 'destructive'
                              }
                            >
                              {property.reraCompliance.approval_status}
                            </Badge>
                          ) : (
                            <Badge variant="outline">Not Registered</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {property.price ? `₹${property.price.toLocaleString()}` : 'N/A'}
                        </TableCell>
                        <TableCell>{property._count.inquiries}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedProperty(property)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Property Details</DialogTitle>
                                </DialogHeader>
                                {selectedProperty && (
                                  <div className="space-y-4">
                                    <div>
                                      <h3 className="font-semibold">{selectedProperty.title}</h3>
                                      <p className="text-gray-600">
                                        {selectedProperty.address}, {selectedProperty.city}
                                      </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <span className="font-medium">Price:</span>{' '}
                                        {selectedProperty.price ? `₹${selectedProperty.price.toLocaleString()}` : 'N/A'}
                                      </div>
                                      <div>
                                        <span className="font-medium">Status:</span>{' '}
                                        <Badge variant={selectedProperty.status === 'active' ? 'default' : 'secondary'}>
                                          {selectedProperty.status}
                                        </Badge>
                                      </div>
                                      <div>
                                        <span className="font-medium">Inquiries:</span>{' '}
                                        {selectedProperty._count.inquiries}
                                      </div>
                                      <div>
                                        <span className="font-medium">Reviews:</span>{' '}
                                        {selectedProperty._count.property_reviews}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>

                            {property.status === 'active' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handlePropertyAction(property.id, 'suspend')}
                                  disabled={actionLoading}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}

                            {property.status === 'inactive' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePropertyAction(property.id, 'approve')}
                                disabled={actionLoading}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="p-4 border-t">
                    <div className="flex justify-between items-center">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}