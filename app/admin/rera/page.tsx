"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Search, CheckCircle, XCircle, FileText } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/lib/auth-context";

interface ReraRecord {
  id: number;
  registration_number: string;
  approval_status: string;
  complaint_history: any;
  project_timeline: any;
  approved_building_plans: string[];
  property: {
    id: number;
    title: string;
    address: string | null;
    city: string | null;
    rera_registered: boolean;
    creator: {
      id: number;
      first_name: string | null;
      last_name: string | null;
      email: string;
    };
  };
}

export default function AdminReraPage() {
  const { user: authUser } = useAuth();
  const [reraRecords, setReraRecords] = useState<ReraRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<ReraRecord | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    approval_status: '',
    registration_number: '',
    complaint_history: '',
    project_timeline: '',
    approved_building_plans: '',
  });

  useEffect(() => {
    if (authUser?.role === 'admin') {
      fetchReraRecords();
    }
  }, [authUser, searchTerm, statusFilter, currentPage]);

  const fetchReraRecords = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        search: searchTerm,
        status: statusFilter,
      });

      const response = await fetch(`/api/v1/admin/rera?${params}`);
      if (!response.ok) throw new Error('Failed to fetch RERA records');

      const data = await response.json();
      setReraRecords(data.reraRecords);
      setTotalPages(data.pagination.pages);
    } catch (err) {
      console.error('Failed to fetch RERA records:', err);
      setError('Failed to load RERA records');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRera = async () => {
    if (!selectedRecord) return;

    setActionLoading(true);
    try {
      const updateData = {
        id: selectedRecord.id,
        approval_status: formData.approval_status,
        registration_number: formData.registration_number,
        complaint_history: formData.complaint_history ? JSON.parse(formData.complaint_history) : undefined,
        project_timeline: formData.project_timeline ? JSON.parse(formData.project_timeline) : undefined,
        approved_building_plans: formData.approved_building_plans ? formData.approved_building_plans.split(',').map(s => s.trim()) : undefined,
      };

      const response = await fetch('/api/v1/admin/rera', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) throw new Error('Failed to update RERA record');

      setIsEditDialogOpen(false);
      fetchReraRecords();
    } catch (err) {
      console.error('Failed to update RERA record:', err);
      setError('Failed to update RERA record');
    } finally {
      setActionLoading(false);
    }
  };

  const openEditDialog = (record: ReraRecord) => {
    setSelectedRecord(record);
    setFormData({
      approval_status: record.approval_status,
      registration_number: record.registration_number,
      complaint_history: record.complaint_history ? JSON.stringify(record.complaint_history, null, 2) : '',
      project_timeline: record.project_timeline ? JSON.stringify(record.project_timeline, null, 2) : '',
      approved_building_plans: record.approved_building_plans.join(', '),
    });
    setIsEditDialogOpen(true);
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
            <h1 className="text-3xl font-bold mb-2">RERA Verification</h1>
            <p className="text-gray-600">Manage RERA compliance and verification</p>
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
                    placeholder="Search properties or registration numbers..."
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
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="not_registered">Not Registered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* RERA Records Table */}
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
                <Button onClick={fetchReraRecords} className="mt-4">Try Again</Button>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Registration Number</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reraRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{record.property.title}</div>
                            <div className="text-sm text-gray-500">
                              {record.property.address}, {record.property.city}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-sm">{record.registration_number}</div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              record.approval_status === 'approved'
                                ? 'default'
                                : record.approval_status === 'pending'
                                ? 'secondary'
                                : 'destructive'
                            }
                          >
                            {record.approval_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {record.property.creator.first_name} {record.property.creator.last_name}
                            </div>
                            <div className="text-sm text-gray-500">{record.property.creator.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(record)}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Review
                          </Button>
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

        {/* Edit RERA Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review RERA Compliance</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="approval_status">Approval Status</Label>
                <Select
                  value={formData.approval_status}
                  onValueChange={(value) => setFormData({ ...formData, approval_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="not_registered">Not Registered</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="registration_number">Registration Number</Label>
                <Input
                  id="registration_number"
                  value={formData.registration_number}
                  onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="complaint_history">Complaint History (JSON)</Label>
                <Textarea
                  id="complaint_history"
                  value={formData.complaint_history}
                  onChange={(e) => setFormData({ ...formData, complaint_history: e.target.value })}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="project_timeline">Project Timeline (JSON)</Label>
                <Textarea
                  id="project_timeline"
                  value={formData.project_timeline}
                  onChange={(e) => setFormData({ ...formData, project_timeline: e.target.value })}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="approved_building_plans">Approved Building Plans (comma-separated URLs)</Label>
                <Textarea
                  id="approved_building_plans"
                  value={formData.approved_building_plans}
                  onChange={(e) => setFormData({ ...formData, approved_building_plans: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateRera} disabled={actionLoading}>
                  {actionLoading ? 'Updating...' : 'Update RERA Record'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}