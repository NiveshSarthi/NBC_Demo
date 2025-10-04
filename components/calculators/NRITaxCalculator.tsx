'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface NRITaxResult {
  rentalIncome: {
    grossIncome: number;
    standardDeduction: number;
    taxableIncome: number;
    tax: number;
  };
  capitalGains: {
    holdingPeriodYears: number;
    gainType: string;
    gain: number;
    tax: number;
  };
  dtaaBenefits: number;
  totalTax: number;
  tdsRequired: number;
  netIncome: number;
  notes: string[];
}

export function NRITaxCalculator() {
  const [formData, setFormData] = useState({
    annualRentalIncome: '',
    propertyValue: '',
    holdingPeriodYears: '',
    isResidential: true,
    hasDTAA: false,
    country: '',
  });
  const [result, setResult] = useState<NRITaxResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/v1/calculators/nri-tax', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          annualRentalIncome: parseFloat(formData.annualRentalIncome),
          propertyValue: parseFloat(formData.propertyValue),
          holdingPeriodYears: parseInt(formData.holdingPeriodYears),
          isResidential: formData.isResidential,
          hasDTAA: formData.hasDTAA,
          country: formData.country,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate NRI tax');
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
            <Label htmlFor="rentalIncome">Annual Rental Income (₹)</Label>
            <Input
              id="rentalIncome"
              type="number"
              placeholder="500000"
              value={formData.annualRentalIncome}
              onChange={(e) => handleInputChange('annualRentalIncome', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="propertyValue">Property Value (₹)</Label>
            <Input
              id="propertyValue"
              type="number"
              placeholder="10000000"
              value={formData.propertyValue}
              onChange={(e) => handleInputChange('propertyValue', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="holdingPeriod">Holding Period (Years)</Label>
            <Input
              id="holdingPeriod"
              type="number"
              placeholder="5"
              value={formData.holdingPeriodYears}
              onChange={(e) => handleInputChange('holdingPeriodYears', e.target.value)}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="residential"
              checked={formData.isResidential}
              onCheckedChange={(checked) => handleInputChange('isResidential', checked as boolean)}
            />
            <Label htmlFor="residential">Residential Property</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="dtaa"
              checked={formData.hasDTAA}
              onCheckedChange={(checked) => handleInputChange('hasDTAA', checked as boolean)}
            />
            <Label htmlFor="dtaa">DTAA Benefits Available</Label>
          </div>
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Calculating...' : 'Calculate NRI Tax'}
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
              <CardTitle>NRI Tax Calculation Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">₹{result.totalTax.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Tax</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">₹{result.tdsRequired.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">TDS Required</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">₹{result.netIncome.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Net Income</div>
                </div>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                {result.notes.map((note, index) => (
                  <p key={index}>• {note}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}