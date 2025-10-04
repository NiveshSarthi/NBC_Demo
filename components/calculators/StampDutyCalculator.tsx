'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StampDutyResult {
  propertyValue: number;
  state: string;
  stampDuty: number;
  discount: number;
  finalStampDuty: number;
  registrationCharges: number;
  totalCharges: number;
  concessions: {
    firstTimeBuyer: boolean;
    withinFamily: boolean;
  };
}

export function StampDutyCalculator() {
  const [formData, setFormData] = useState({
    propertyValue: '',
    state: '',
    isFirstTimeBuyer: false,
    isWithinFamily: false,
  });
  const [result, setResult] = useState<StampDutyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/v1/calculators/stamp-duty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyValue: parseFloat(formData.propertyValue),
          state: formData.state,
          isFirstTimeBuyer: formData.isFirstTimeBuyer,
          isWithinFamily: formData.isWithinFamily,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate stamp duty');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Label htmlFor="state">State</Label>
            <Select onValueChange={(value) => handleInputChange('state', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="maharashtra">Maharashtra</SelectItem>
                <SelectItem value="delhi">Delhi</SelectItem>
                <SelectItem value="karnataka">Karnataka</SelectItem>
                <SelectItem value="tamilnadu">Tamil Nadu</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="firstTime"
              checked={formData.isFirstTimeBuyer}
              onCheckedChange={(checked) => handleInputChange('isFirstTimeBuyer', checked as boolean)}
            />
            <Label htmlFor="firstTime">First time buyer</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="family"
              checked={formData.isWithinFamily}
              onCheckedChange={(checked) => handleInputChange('isWithinFamily', checked as boolean)}
            />
            <Label htmlFor="family">Transfer within family</Label>
          </div>
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Calculating...' : 'Calculate Stamp Duty'}
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
              <CardTitle>Stamp Duty Calculation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">₹{result.finalStampDuty.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Stamp Duty</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">₹{result.registrationCharges.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Registration Charges</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">₹{result.totalCharges.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Charges</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}