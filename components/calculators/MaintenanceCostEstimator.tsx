'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MaintenanceCostResult {
  propertyValue: number;
  propertyType: string;
  areaSqFt: number;
  ageYears: number;
  annualMaintenanceCost: number;
  monthlyMaintenanceCost: number;
}

export function MaintenanceCostEstimator() {
  const [formData, setFormData] = useState({
    propertyValue: '',
    propertyType: '',
    areaSqFt: '',
    ageYears: '',
  });
  const [result, setResult] = useState<MaintenanceCostResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const propertyValue = parseFloat(formData.propertyValue);
      const propertyType = formData.propertyType;
      const areaSqFt = parseFloat(formData.areaSqFt);
      const ageYears = parseInt(formData.ageYears);

      if (propertyValue <= 0 || areaSqFt <= 0 || !propertyType) {
        throw new Error('Invalid input values');
      }

      // Base maintenance rate per sq ft per year
      const baseRatePerSqFt = propertyType === 'apartment' ? 15 : propertyType === 'villa' ? 25 : 20; // rupees per sq ft per year
      // Age multiplier
      const ageMultiplier = Math.max(0.8, 1 - (ageYears * 0.02)); // Older properties cost more

      const annualMaintenanceCost = areaSqFt * baseRatePerSqFt * ageMultiplier;
      const monthlyMaintenanceCost = annualMaintenanceCost / 12;

      setResult({
        propertyValue,
        propertyType,
        areaSqFt,
        ageYears,
        annualMaintenanceCost,
        monthlyMaintenanceCost,
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <Label htmlFor="propertyType">Property Type</Label>
            <Select onValueChange={(value) => handleInputChange('propertyType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="independent-house">Independent House</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="areaSqFt">Area (Sq Ft)</Label>
            <Input
              id="areaSqFt"
              type="number"
              placeholder="1200"
              value={formData.areaSqFt}
              onChange={(e) => handleInputChange('areaSqFt', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="ageYears">Age of Property (Years)</Label>
            <Input
              id="ageYears"
              type="number"
              placeholder="5"
              value={formData.ageYears}
              onChange={(e) => handleInputChange('ageYears', e.target.value)}
              min="0"
              required
            />
          </div>
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Estimating...' : 'Estimate Maintenance Cost'}
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
              <CardTitle>Maintenance Cost Estimate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">₹{result.annualMaintenanceCost.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Annual Cost</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">₹{result.monthlyMaintenanceCost.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Monthly Cost</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{result.areaSqFt} sq ft</div>
                  <div className="text-sm text-gray-600">Area</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{result.ageYears} years</div>
                  <div className="text-sm text-gray-600">Property Age</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}