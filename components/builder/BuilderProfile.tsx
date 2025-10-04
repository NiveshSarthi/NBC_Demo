import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Trophy, TrendingUp, CheckCircle, Building2 } from 'lucide-react';

interface PastProject {
  name: string;
  completion_date: string;
  location: string;
}

interface DeliveryTrackRecord {
  completed_projects_count: number;
  on_time_delivery_rate: number;
  customer_satisfaction_rating: number;
}

interface FinancialStability {
  revenue: number;
  profit_margin: number;
  debt_ratio: number;
}

interface Builder {
  id: number;
  name: string;
  history: string;
  past_projects: PastProject[];
  delivery_track_record: DeliveryTrackRecord;
  ratings: number;
  financial_stability: FinancialStability;
  awards: string[];
  created_at: string;
  updated_at: string;
  properties: any[]; // Related properties
}

interface BuilderProfileProps {
  builder: Builder;
}

export function BuilderProfile({ builder }: BuilderProfileProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            {builder.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            {renderStars(builder.ratings)}
            <span className="text-sm text-gray-600">({builder.ratings.toFixed(1)})</span>
            <Badge variant="secondary" className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Verified
            </Badge>
          </div>
          <p className="text-gray-700">{builder.history}</p>
        </CardContent>
      </Card>

      {/* Delivery Track Record */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Track Record</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {builder.delivery_track_record.completed_projects_count}
              </div>
              <div className="text-sm text-gray-600">Completed Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {builder.delivery_track_record.on_time_delivery_rate}%
              </div>
              <div className="text-sm text-gray-600">On-Time Delivery</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {builder.delivery_track_record.customer_satisfaction_rating}/5
              </div>
              <div className="text-sm text-gray-600">Customer Satisfaction</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Stability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Financial Stability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ₹{builder.financial_stability.revenue.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Annual Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {builder.financial_stability.profit_margin}%
              </div>
              <div className="text-sm text-gray-600">Profit Margin</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {builder.financial_stability.debt_ratio}%
              </div>
              <div className="text-sm text-gray-600">Debt Ratio</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Past Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {builder.past_projects.map((project, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{project.name}</div>
                  <div className="text-sm text-gray-600">{project.location}</div>
                </div>
                <div className="text-sm text-gray-500">
                  Completed: {new Date(project.completion_date).getFullYear()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Awards and Certifications */}
      {builder.awards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Awards & Certifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {builder.awards.map((award, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  <Trophy className="w-3 h-3" />
                  {award}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Properties by this Builder */}
      {builder.properties.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Properties by {builder.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              {builder.properties.length} active {builder.properties.length === 1 ? 'property' : 'properties'} available
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}