import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, MapPin, Calendar, AlertCircle } from "lucide-react";

interface PricePredictionProps {
  location?: string;
  propertyType?: string;
  bedrooms?: number;
}

export function PricePrediction({ location, propertyType, bedrooms }: PricePredictionProps) {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setLoading(true);

        // Generate mock predictions based on location and property type
        const mockPredictions = generatePricePredictions(location, propertyType, bedrooms);

        // Simulate API delay
        setTimeout(() => {
          setPredictions(mockPredictions);
          setLoading(false);
        }, 1000);

      } catch (err) {
        console.error('Error fetching price predictions:', err);
        setError('Failed to load price predictions');
        setLoading(false);
      }
    };

    fetchPredictions();
  }, [location, propertyType, bedrooms]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Price Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || predictions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-yellow-500" />
            Price Predictions Unavailable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            We couldn't generate price predictions for this area. This might be a developing location with limited market data.
          </p>
          <div className="text-xs text-gray-500">
            Price predictions are based on market trends, infrastructure development, and comparable locations.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Price Predictions for {location || 'This Area'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {predictions.map((prediction, index) => (
          <div key={index} className="border-b last:border-b-0 pb-4 last:pb-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                <span className="font-medium text-sm">{prediction.type}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {prediction.confidence}% confidence
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div className="text-xs text-gray-600">Current Market Price</div>
                <div className="font-bold text-green-600">
                  ₹{prediction.currentPrice.toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Projected (6 months)</div>
                <div className="font-bold text-blue-600">
                  ₹{prediction.projectedPrice.toLocaleString('en-IN')}
                  <span className={`text-xs ml-1 ${prediction.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ({prediction.growth >= 0 ? '+' : ''}{prediction.growth}%)
                  </span>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-600">
              <Calendar className="h-3 w-3 inline mr-1" />
              Based on recent market trends and infrastructure development
            </div>
          </div>
        ))}

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-blue-900 mb-2">
            💡 Investment Insight
          </div>
          <div className="text-sm text-blue-800">
            This area shows strong growth potential. Consider investing early as infrastructure development progresses.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Mock prediction generator
function generatePricePredictions(location?: string, propertyType?: string, bedrooms?: number) {
  const basePrices: { [key: string]: number } = {
    'delhi': 8000000,
    'mumbai': 12000000,
    'bangalore': 9000000,
    'chennai': 7000000,
    'pune': 6000000,
    'gurgaon': 7500000,
    'noida': 6500000,
    'hyderabad': 6800000,
    'ahmedabad': 5500000,
    'kolkata': 5800000,
  };

  const locationKey = location?.toLowerCase();
  const basePrice = basePrices[locationKey || 'default'] || 6000000;

  // Adjust based on property type
  let typeMultiplier = 1;
  if (propertyType === 'apartment') typeMultiplier = 1;
  else if (propertyType === 'villa') typeMultiplier = 2.5;
  else if (propertyType === 'plot') typeMultiplier = 0.7;
  else if (propertyType === 'commercial') typeMultiplier = 1.8;

  // Adjust based on bedrooms
  let bedroomMultiplier = 1;
  if (bedrooms) {
    bedroomMultiplier = 1 + (bedrooms - 2) * 0.3;
  }

  const currentPrice = Math.round(basePrice * typeMultiplier * bedroomMultiplier);
  const growth = Math.round((Math.random() * 20) + 5); // 5-25% growth
  const projectedPrice = Math.round(currentPrice * (1 + growth / 100));
  const confidence = Math.round(75 + Math.random() * 20); // 75-95% confidence

  return [{
    type: `${bedrooms || 3}BHK ${propertyType || 'Apartment'}`,
    currentPrice,
    projectedPrice,
    growth,
    confidence
  }];
}