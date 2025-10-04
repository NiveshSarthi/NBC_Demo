import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress as ProgressUI } from '@/components/ui/progress';

interface LocalityHighlightsProps {
  localityHighlights?: {
    safety_score?: number;
    air_quality_index?: number;
    water_supply_reliability?: number;
    electricity_supply_reliability?: number;
    best_features?: string[];
    future_development_plans?: string[];
    property_appreciation_trends?: Array<{
      year: number;
      percentage: number;
    }>;
  };
}

const LocalityHighlights: React.FC<LocalityHighlightsProps> = ({ localityHighlights }) => {
  if (!localityHighlights) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Locality Highlights</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No locality highlights available.</p>
        </CardContent>
      </Card>
    );
  }

  const { safety_score, air_quality_index, water_supply_reliability, electricity_supply_reliability, best_features, future_development_plans, property_appreciation_trends } = localityHighlights;

  const getSafetyColor = (score?: number) => {
    if (!score) return 'gray';
    if (score >= 8) return 'green';
    if (score >= 6) return 'yellow';
    return 'red';
  };

  const getAQIColor = (aqi?: number) => {
    if (!aqi) return 'gray';
    if (aqi <= 50) return 'green';
    if (aqi <= 100) return 'yellow';
    if (aqi <= 150) return 'orange';
    return 'red';
  };

  const getReliabilityStatus = (reliability?: number) => {
    if (!reliability) return { color: 'gray', status: 'Unknown' };
    if (reliability >= 9) return { color: 'green', status: 'Excellent' };
    if (reliability >= 7) return { color: 'yellow', status: 'Good' };
    if (reliability >= 5) return { color: 'orange', status: 'Fair' };
    return { color: 'red', status: 'Poor' };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Locality Highlights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Safety Score */}
        {safety_score && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Safety Score</h3>
            <div className="flex items-center space-x-2">
              <Badge variant={getSafetyColor(safety_score) === 'green' ? 'default' : getSafetyColor(safety_score) === 'yellow' ? 'secondary' : 'destructive'}>
                {safety_score}/10
              </Badge>
              <span>Low Crime Rate</span>
            </div>
          </div>
        )}

        {/* Air Quality Index */}
        {air_quality_index && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Air Quality Index (AQI)</h3>
            <div className="flex items-center space-x-2">
              <Badge variant={getAQIColor(air_quality_index) === 'green' ? 'default' : getAQIColor(air_quality_index) === 'yellow' ? 'secondary' : 'destructive'}>
                {air_quality_index}
              </Badge>
              <span>
                {air_quality_index <= 50 ? 'Good' : air_quality_index <= 100 ? 'Moderate' : air_quality_index <= 150 ? 'Unhealthy for Sensitive Groups' : 'Unhealthy'}
              </span>
            </div>
          </div>
        )}

        {/* Water Supply Reliability */}
        {water_supply_reliability && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Water Supply Reliability</h3>
            <ProgressUI value={water_supply_reliability * 10} className="w-full" />
            <div className="flex justify-between items-center mt-1">
              <span>{getReliabilityStatus(water_supply_reliability).status}</span>
              <span>{water_supply_reliability}/10</span>
            </div>
          </div>
        )}

        {/* Electricity Supply Reliability */}
        {electricity_supply_reliability && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Electricity Supply Reliability</h3>
            <ProgressUI value={electricity_supply_reliability * 10} className="w-full" />
            <div className="flex justify-between items-center mt-1">
              <span>{getReliabilityStatus(electricity_supply_reliability).status}</span>
              <span>{electricity_supply_reliability}/10</span>
            </div>
          </div>
        )}

        {/* Best Features */}
        {best_features && best_features.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Best Features</h3>
            <div className="flex flex-wrap gap-2">
              {best_features.map((feature, index) => (
                <Badge key={index} variant="outline">{feature}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Future Development Plans */}
        {future_development_plans && future_development_plans.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Future Development Plans</h3>
            <ul className="list-disc list-inside space-y-1">
              {future_development_plans.map((plan, index) => (
                <li key={index}>{plan}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Property Appreciation Trends */}
        {property_appreciation_trends && property_appreciation_trends.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Property Appreciation Trends</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={property_appreciation_trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="percentage" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LocalityHighlights;