'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface HomeInsuranceResult {
  propertyValue: number;
  coverageType: string;
  sumInsured: number;
  annualPremium: number;
  monthlyPremium: number;
}

export function HomeInsuranceCalculator() {
  const [formData, setFormData] = useState({
    propertyValue: '',
    coverageType: '',
    tenureYears: '1',
  });
  const [result, setResult] = useState<HomeInsuranceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const propertyValue = parseFloat(formData.propertyValue);
      const coverageType = formData.coverageType;
      const tenureYears = parseInt(formData.tenureYears);

      if (propertyValue <= 0 || !coverageType) {
        throw new Error('Invalid input values');
      }

      // Simple calculation: rate per thousand based on coverage type
      const ratePerThousand = coverageType === 'basic' ? 2 : coverageType === 'comprehensive' ? 4 : 3; // rupees per thousand
      const sumInsured = propertyValue;
      const annualPremium = (sumInsured / 1000) * ratePerThousand;
      const monthlyPremium = annualPremium / 12;

      setResult({
        propertyValue,
        coverageType,
        sumInsured,
        annualPremium,
        monthlyPremium,
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
            <Label htmlFor="propertyValue">Property Value (₹)</Label>
            <Input
              id="propertyValue"
              type="number"
              placeholder="5000000"
              value={formData.propertyValue}
              onChange={(e) => handleInputChange('propertyValue', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="coverageType">Coverage Type</Label>
            <Select onValueChange={(value) => handleInputChange('coverageType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select coverage type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic Coverage</SelectItem>
                <SelectItem value="standard">Standard Coverage</SelectItem>
                <SelectItem value="comprehensive">Comprehensive Coverage</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="tenureYears">Tenure (Years)</Label>
            <Select onValueChange={(value) => handleInputChange('tenureYears', value)}>
              <SelectTrigger>
                <SelectValue placeholder="1" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Year</SelectItem>
                <SelectItem value="2">2 Years</SelectItem>
                <SelectItem value="3">3 Years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Calculating...' : 'Calculate Insurance Premium'}
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
              <CardTitle>Home Insurance Calculation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">₹{result.propertyValue.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Property Value</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">₹{result.sumInsured.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Sum Insured</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">₹{result.annualPremium.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Annual Premium</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">₹{result.monthlyPremium.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Monthly Premium</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}