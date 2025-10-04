'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DownPaymentResult {
  propertyPrice: number;
  downPaymentPercentage: number;
  downPaymentAmount: number;
  loanAmount: number;
}

export function DownPaymentCalculator() {
  const [formData, setFormData] = useState({
    propertyPrice: '',
    downPaymentPercentage: '',
  });
  const [result, setResult] = useState<DownPaymentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const propertyPrice = parseFloat(formData.propertyPrice);
      const downPaymentPercentage = parseFloat(formData.downPaymentPercentage);

      if (propertyPrice <= 0 || downPaymentPercentage <= 0 || downPaymentPercentage > 100) {
        throw new Error('Invalid input values');
      }

      const downPaymentAmount = (propertyPrice * downPaymentPercentage) / 100;
      const loanAmount = propertyPrice - downPaymentAmount;

      setResult({
        propertyPrice,
        downPaymentPercentage,
        downPaymentAmount,
        loanAmount,
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="propertyPrice">Property Price (₹)</Label>
            <Input
              id="propertyPrice"
              type="number"
              placeholder="5000000"
              value={formData.propertyPrice}
              onChange={(e) => handleInputChange('propertyPrice', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="downPaymentPercentage">Down Payment Percentage (%)</Label>
            <Input
              id="downPaymentPercentage"
              type="number"
              placeholder="20"
              value={formData.downPaymentPercentage}
              onChange={(e) => handleInputChange('downPaymentPercentage', e.target.value)}
              min="0"
              max="100"
              required
            />
          </div>
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Calculating...' : 'Calculate Down Payment'}
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
              <CardTitle>Down Payment Calculation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">₹{result.propertyPrice.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Property Price</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{result.downPaymentPercentage}%</div>
                  <div className="text-sm text-gray-600">Down Payment %</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">₹{result.downPaymentAmount.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Down Payment Amount</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">₹{result.loanAmount.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Loan Amount</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}