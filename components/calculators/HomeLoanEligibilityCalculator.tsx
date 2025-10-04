'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EligibilityResult {
  eligibleAmount: number;
  estimatedPropertyValue: number;
  maxTenureYears: number;
  estimatedEMI: number;
  disposableIncome: number;
  emiAffordability: number;
  factors: {
    employmentType: string;
    cityMultiplier: number;
    dependentsAdjustment: number;
    existingLoansImpact: string;
  };
}

export function HomeLoanEligibilityCalculator() {
  const [formData, setFormData] = useState({
    monthlyIncome: '',
    monthlyObligations: '',
    dependents: '',
    age: '',
    employmentType: '',
    city: '',
    existingLoans: '',
  });
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/v1/calculators/home-loan-eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthlyIncome: parseFloat(formData.monthlyIncome),
          monthlyObligations: parseFloat(formData.monthlyObligations),
          dependents: parseInt(formData.dependents),
          age: parseInt(formData.age),
          employmentType: formData.employmentType,
          city: formData.city,
          existingLoans: parseFloat(formData.existingLoans) || 0,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate eligibility');
      }

      const data = await response.json();
      setResult(data);
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
            <Label htmlFor="monthlyIncome">Monthly Income (₹)</Label>
            <Input
              id="monthlyIncome"
              type="number"
              placeholder="50000"
              value={formData.monthlyIncome}
              onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="monthlyObligations">Monthly Obligations (₹)</Label>
            <Input
              id="monthlyObligations"
              type="number"
              placeholder="10000"
              value={formData.monthlyObligations}
              onChange={(e) => handleInputChange('monthlyObligations', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="dependents">Number of Dependents</Label>
            <Input
              id="dependents"
              type="number"
              placeholder="2"
              value={formData.dependents}
              onChange={(e) => handleInputChange('dependents', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              placeholder="35"
              value={formData.age}
              onChange={(e) => handleInputChange('age', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="employmentType">Employment Type</Label>
            <Select onValueChange={(value) => handleInputChange('employmentType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select employment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="salaried">Salaried</SelectItem>
                <SelectItem value="self-employed">Self-employed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Select onValueChange={(value) => handleInputChange('city', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mumbai">Mumbai</SelectItem>
                <SelectItem value="delhi">Delhi</SelectItem>
                <SelectItem value="bangalore">Bangalore</SelectItem>
                <SelectItem value="chennai">Chennai</SelectItem>
                <SelectItem value="pune">Pune</SelectItem>
                <SelectItem value="hyderabad">Hyderabad</SelectItem>
                <SelectItem value="kolkata">Kolkata</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="existingLoans">Existing Loan EMI (₹)</Label>
            <Input
              id="existingLoans"
              type="number"
              placeholder="0"
              value={formData.existingLoans}
              onChange={(e) => handleInputChange('existingLoans', e.target.value)}
            />
          </div>
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Calculating...' : 'Check Eligibility'}
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
              <CardTitle>Home Loan Eligibility Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">₹{result.eligibleAmount.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Eligible Loan Amount</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">₹{result.estimatedPropertyValue.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Estimated Property Value</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">₹{result.estimatedEMI.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Estimated Monthly EMI</div>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <p>Maximum Tenure: {result.maxTenureYears} years</p>
                <p>Disposable Income: ₹{result.disposableIncome.toLocaleString()}</p>
                <p>EMI Affordability: ₹{result.emiAffordability.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}