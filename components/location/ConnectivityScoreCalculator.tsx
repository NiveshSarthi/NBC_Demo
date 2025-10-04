'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Cpu, Building2, Clock, Train, Truck } from 'lucide-react';

interface ConnectivityScoreData {
  it_parks_distance: number;
  business_hubs_distance: number;
  average_commute_time_minutes: number;
  public_transport_rating: number;
  road_infrastructure_quality: number;
}

interface ConnectivityScoreCalculatorProps {
  connectivityScore: ConnectivityScoreData | null;
}

const ConnectivityScoreCalculator: React.FC<ConnectivityScoreCalculatorProps> = ({
  connectivityScore
}) => {
  if (!connectivityScore) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Connectivity Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No connectivity data available for this location.</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate individual scores (0-100)
  const calculateDistanceScore = (distance: number): number => {
    // Lower distance = higher score, max 10km
    return Math.max(0, 100 - (distance * 10));
  };

  const calculateCommuteScore = (minutes: number): number => {
    // Lower time = higher score, max 60 minutes
    return Math.max(0, 100 - (minutes * 100 / 60));
  };

  const calculateRatingScore = (rating: number): number => {
    // Assuming rating is 0-5 scale
    return (rating / 5) * 100;
  };

  const itParksScore = calculateDistanceScore(connectivityScore.it_parks_distance);
  const businessHubsScore = calculateDistanceScore(connectivityScore.business_hubs_distance);
  const commuteScore = calculateCommuteScore(connectivityScore.average_commute_time_minutes);
  const publicTransportScore = calculateRatingScore(connectivityScore.public_transport_rating);
  const roadQualityScore = calculateRatingScore(connectivityScore.road_infrastructure_quality);

  // Overall score as average
  const overallScore = Math.round(
    (itParksScore + businessHubsScore + commuteScore + publicTransportScore + roadQualityScore) / 5
  );

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number): string => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const metrics = [
    {
      icon: Cpu,
      label: 'IT Parks Distance',
      value: `${connectivityScore.it_parks_distance.toFixed(1)} km`,
      score: itParksScore,
    },
    {
      icon: Building2,
      label: 'Business Hubs Distance',
      value: `${connectivityScore.business_hubs_distance.toFixed(1)} km`,
      score: businessHubsScore,
    },
    {
      icon: Clock,
      label: 'Average Commute Time',
      value: `${connectivityScore.average_commute_time_minutes} min`,
      score: commuteScore,
    },
    {
      icon: Train,
      label: 'Public Transport Rating',
      value: `${connectivityScore.public_transport_rating.toFixed(1)}/5`,
      score: publicTransportScore,
    },
    {
      icon: Truck,
      label: 'Road Infrastructure Quality',
      value: `${connectivityScore.road_infrastructure_quality.toFixed(1)}/5`,
      score: roadQualityScore,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Connectivity Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Overall Score */}
        <div className="text-center mb-6">
          <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
            {overallScore}
          </div>
          <div className="text-sm text-gray-600">Overall Connectivity Score</div>
          <Badge variant="outline" className="mt-2">
            {overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Good' : 'Needs Improvement'}
          </Badge>
        </div>

        {/* Individual Metrics */}
        <div className="space-y-4">
          {metrics.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-4 h-4" />
                    <span className="text-sm font-medium">{metric.label}</span>
                  </div>
                  <span className="text-sm text-gray-600">{metric.value}</span>
                </div>
                <Progress
                  value={metric.score}
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Score: {Math.round(metric.score)}</span>
                  <span className={getScoreColor(metric.score)}>
                    {metric.score >= 80 ? 'Excellent' : metric.score >= 60 ? 'Good' : 'Poor'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Traffic Indicators */}
        {connectivityScore.average_commute_time_minutes > 30 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">High Traffic Area</span>
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              Average commute time exceeds 30 minutes, indicating potential traffic congestion.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConnectivityScoreCalculator;