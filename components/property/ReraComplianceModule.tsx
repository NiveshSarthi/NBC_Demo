'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Clock, XCircle, ExternalLink, FileText, Calendar } from 'lucide-react';

interface Complaint {
  date: string;
  type: string;
  status: string;
}

interface Milestone {
  date: string;
  event: string;
  completed: boolean;
}

interface ReraComplianceData {
  id: number;
  registration_number: string;
  approval_status: 'approved' | 'pending' | 'not_registered';
  complaint_history: Complaint[];
  project_timeline: Milestone[];
  approved_building_plans: string[];
}

interface ReraComplianceModuleProps {
  reraCompliance: ReraComplianceData | null;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    case 'not_registered':
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'approved':
      return <CheckCircle className="w-4 h-4" />;
    case 'pending':
      return <Clock className="w-4 h-4" />;
    case 'not_registered':
      return <XCircle className="w-4 h-4" />;
    default:
      return null;
  }
};

const ReraComplianceModule: React.FC<ReraComplianceModuleProps> = ({ reraCompliance }) => {
  if (!reraCompliance) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            RERA Compliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              RERA compliance information is not available for this property.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const { registration_number, approval_status, complaint_history, project_timeline, approved_building_plans } = reraCompliance;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          RERA Compliance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Registration Number and Status */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Registration Number</p>
            <p className="text-lg font-semibold">{registration_number}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${getStatusColor(approval_status)} flex items-center gap-1`}>
              {getStatusIcon(approval_status)}
              {approval_status.replace('_', ' ').toUpperCase()}
            </Badge>
            <Button variant="outline" size="sm" asChild>
              <Link href={`https://maharera.maharashtra.gov.in/search-your-project`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Verify
              </Link>
            </Button>
          </div>
        </div>

        {/* Complaint History */}
        {complaint_history && complaint_history.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">Complaint History</h4>
            <div className="space-y-2">
              {complaint_history.map((complaint, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{complaint.type}</p>
                    <p className="text-xs text-muted-foreground">{complaint.date}</p>
                  </div>
                  <Badge variant={complaint.status === 'resolved' ? 'default' : 'secondary'}>
                    {complaint.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Project Timeline */}
        {project_timeline && project_timeline.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Project Timeline
            </h4>
            <div className="space-y-2">
              {project_timeline.map((milestone, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${milestone.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{milestone.event}</p>
                    <p className="text-xs text-muted-foreground">{milestone.date}</p>
                  </div>
                  <Badge variant={milestone.completed ? 'default' : 'outline'}>
                    {milestone.completed ? 'Completed' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Approved Building Plans */}
        {approved_building_plans && approved_building_plans.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">Approved Building Plans</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {approved_building_plans.map((plan, index) => (
                <div key={index} className="relative">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center" asChild>
                    <Link href={plan} target="_blank" rel="noopener noreferrer">
                      <FileText className="w-6 h-6 mb-1" />
                      <span className="text-xs">Plan {index + 1}</span>
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReraComplianceModule;