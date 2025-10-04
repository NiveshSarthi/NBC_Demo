'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EMIResult {
  emi: number;
  totalAmount: number;
  totalInterest: number;
  schedule: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
}

export function EMICalculator() {
  const [formData, setFormData] = useState({
    principal: '',
    annualInterestRate: '',
    tenureMonths: '',
  });
  const [result, setResult] = useState<EMIResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/v1/calculators/emi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          principal: parseFloat(formData.principal),
          annualInterestRate: parseFloat(formData.annualInterestRate),
          tenureMonths: parseInt(formData.tenureMonths),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate EMI');
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="principal">Loan Amount (₹)</Label>
            <Input
              id="principal"
              type="number"
              placeholder="5000000"
              value={formData.principal}
              onChange={(e) => handleInputChange('principal', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="rate">Annual Interest Rate (%)</Label>
            <Input
              id="rate"
              type="number"
              step="0.01"
              placeholder="8.5"
              value={formData.annualInterestRate}
              onChange={(e) => handleInputChange('annualInterestRate', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="tenure">Loan Tenure (Months)</Label>
            <Input
              id="tenure"
              type="number"
              placeholder="240"
              value={formData.tenureMonths}
              onChange={(e) => handleInputChange('tenureMonths', e.target.value)}
              required
            />
          </div>
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Calculating...' : 'Calculate EMI'}
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
              <CardTitle>EMI Calculation Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">₹{result.emi.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Monthly EMI</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">₹{result.totalAmount.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Amount</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">₹{result.totalInterest.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Interest</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Amortization Schedule (First 12 Months)</CardTitle>
              <CardDescription>Monthly breakdown of payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Month</th>
                      <th className="text-right p-2">Payment</th>
                      <th className="text-right p-2">Principal</th>
                      <th className="text-right p-2">Interest</th>
                      <th className="text-right p-2">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.schedule.slice(0, 12).map((entry) => (
                      <tr key={entry.month} className="border-b">
                        <td className="p-2">{entry.month}</td>
                        <td className="text-right p-2">₹{entry.payment.toLocaleString()}</td>
                        <td className="text-right p-2">₹{entry.principal.toLocaleString()}</td>
                        <td className="text-right p-2">₹{entry.interest.toLocaleString()}</td>
                        <td className="text-right p-2">₹{entry.balance.toLocaleString()}</td>
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