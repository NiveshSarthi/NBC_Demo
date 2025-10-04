'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';

interface ROIResult {
  roi: number;
  annualROI: number;
  netProfit: number;
  finalValue: number;
  breakdown: Array<{
    year: number;
    value: number;
    annualReturn: number;
  }>;
}

export function ROICalculator() {
  const [formData, setFormData] = useState({
    initialInvestment: '',
    finalValue: '',
    investmentPeriodYears: '',
    annualRentalIncome: '',
    annualExpenses: '',
    vacancyRate: '',
    isCompound: true,
  });
  const [result, setResult] = useState<ROIResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/v1/calculators/roi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initialInvestment: parseFloat(formData.initialInvestment),
          finalValue: parseFloat(formData.finalValue),
          investmentPeriodYears: parseInt(formData.investmentPeriodYears),
          annualRentalIncome: parseFloat(formData.annualRentalIncome) || 0,
          annualExpenses: parseFloat(formData.annualExpenses) || 0,
          vacancyRate: parseFloat(formData.vacancyRate) || 0,
          isCompound: formData.isCompound,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate ROI');
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="initialInvestment">Initial Investment (₹)</Label>
            <Input
              id="initialInvestment"
              type="number"
              placeholder="1000000"
              value={formData.initialInvestment}
              onChange={(e) => handleInputChange('initialInvestment', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="finalValue">Final Value (₹)</Label>
            <Input
              id="finalValue"
              type="number"
              placeholder="1500000"
              value={formData.finalValue}
              onChange={(e) => handleInputChange('finalValue', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="period">Investment Period (Years)</Label>
            <Input
              id="period"
              type="number"
              placeholder="5"
              value={formData.investmentPeriodYears}
              onChange={(e) => handleInputChange('investmentPeriodYears', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="annualRentalIncome">Annual Rental Income (₹)</Label>
            <Input
              id="annualRentalIncome"
              type="number"
              placeholder="120000"
              value={formData.annualRentalIncome}
              onChange={(e) => handleInputChange('annualRentalIncome', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="annualExpenses">Annual Expenses (₹)</Label>
            <Input
              id="annualExpenses"
              type="number"
              placeholder="50000"
              value={formData.annualExpenses}
              onChange={(e) => handleInputChange('annualExpenses', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="vacancyRate">Vacancy Rate (%)</Label>
            <Input
              id="vacancyRate"
              type="number"
              step="0.1"
              placeholder="5.0"
              value={formData.vacancyRate}
              onChange={(e) => handleInputChange('vacancyRate', e.target.value)}
              min="0"
              max="100"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="compound"
            checked={formData.isCompound}
            onCheckedChange={(checked) => handleInputChange('isCompound', checked as boolean)}
          />
          <Label htmlFor="compound">Compound interest</Label>
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Calculating...' : 'Calculate ROI'}
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
              <CardTitle>ROI Calculation Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{result.roi}%</div>
                  <div className="text-sm text-gray-600">Total ROI</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{result.annualROI}%</div>
                  <div className="text-sm text-gray-600">Annual ROI</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">₹{result.netProfit.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Net Profit</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">₹{result.finalValue.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Final Value</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Year-wise Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Year</th>
                      <th className="text-right p-2">Value</th>
                      <th className="text-right p-2">Annual Return</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.breakdown.map((entry) => (
                      <tr key={entry.year} className="border-b">
                        <td className="p-2">{entry.year}</td>
                        <td className="text-right p-2">₹{entry.value.toLocaleString()}</td>
                        <td className="text-right p-2">{entry.annualReturn}%</td>
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