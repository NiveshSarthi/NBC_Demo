'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AppreciationResult {
  currentValue: number;
  annualGrowthRate: number;
  periodYears: number;
  futureValue: number;
  totalAppreciation: number;
  breakdown: Array<{
    year: number;
    value: number;
    appreciation: number;
  }>;
}

export function AppreciationPredictor() {
  const [formData, setFormData] = useState({
    currentValue: '',
    annualGrowthRate: '',
    periodYears: '',
  });
  const [result, setResult] = useState<AppreciationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const currentValue = parseFloat(formData.currentValue);
      const annualGrowthRate = parseFloat(formData.annualGrowthRate);
      const periodYears = parseInt(formData.periodYears);

      if (currentValue <= 0 || annualGrowthRate < 0 || periodYears <= 0) {
        throw new Error('Invalid input values');
      }

      const growthFactor = 1 + (annualGrowthRate / 100);
      const futureValue = currentValue * Math.pow(growthFactor, periodYears);
      const totalAppreciation = futureValue - currentValue;

      const breakdown = [];
      for (let year = 1; year <= periodYears; year++) {
        const value = currentValue * Math.pow(growthFactor, year);
        const appreciation = value - currentValue;
        breakdown.push({
          year,
          value: Math.round(value * 100) / 100,
          appreciation: Math.round(appreciation * 100) / 100,
        });
      }

      setResult({
        currentValue,
        annualGrowthRate,
        periodYears,
        futureValue: Math.round(futureValue * 100) / 100,
        totalAppreciation: Math.round(totalAppreciation * 100) / 100,
        breakdown,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="currentValue">Current Property Value (₹)</Label>
            <Input
              id="currentValue"
              type="number"
              placeholder="5000000"
              value={formData.currentValue}
              onChange={(e) => handleInputChange('currentValue', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="annualGrowthRate">Annual Growth Rate (%)</Label>
            <Input
              id="annualGrowthRate"
              type="number"
              step="0.1"
              placeholder="5.0"
              value={formData.annualGrowthRate}
              onChange={(e) => handleInputChange('annualGrowthRate', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="periodYears">Prediction Period (Years)</Label>
            <Input
              id="periodYears"
              type="number"
              placeholder="10"
              value={formData.periodYears}
              onChange={(e) => handleInputChange('periodYears', e.target.value)}
              min="1"
              required
            />
          </div>
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Predicting...' : 'Predict Appreciation'}
        </Button>
      </form>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appreciation Prediction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">₹{result.futureValue.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Future Value</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">₹{result.totalAppreciation.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Appreciation</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{result.annualGrowthRate}%</div>
                  <div className="text-sm text-gray-600">Annual Growth</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{result.periodYears} years</div>
                  <div className="text-sm text-gray-600">Period</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Year-wise Projection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Year</th>
                      <th className="text-right p-2">Value</th>
                      <th className="text-right p-2">Appreciation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.breakdown.map((entry) => (
                      <tr key={entry.year} className="border-b">
                        <td className="p-2">Year {entry.year}</td>
                        <td className="text-right p-2">₹{entry.value.toLocaleString()}</td>
                        <td className="text-right p-2">₹{entry.appreciation.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}