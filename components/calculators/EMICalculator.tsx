'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import jsPDF from 'jspdf';

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
    calcMethod: 'standard',
    monthlyIncome: '',
    extraPayment: '',
    extraPaymentFreq: 'monthly',
  });
  const [result, setResult] = useState<EMIResult | null>(null);
  const [prepaymentResult, setPrepaymentResult] = useState<EMIResult | null>(null);
  const [scenarios, setScenarios] = useState<Array<{ name: string; result: EMIResult; formData: any }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const principal = parseFloat(formData.principal);
      const rate = parseFloat(formData.annualInterestRate);
      const tenure = parseInt(formData.tenureMonths);

      const emi = calculateEMI(principal, rate, tenure, formData.calcMethod);
      const schedule = generateSchedule(principal, emi, rate, tenure);
      const totalAmount = emi * tenure;
      const totalInterest = totalAmount - principal;

      const data = {
        emi,
        totalAmount,
        totalInterest,
        schedule,
      };
      setResult(data);

      // Calculate prepayment if extra payment is set
      if (formData.extraPayment) {
        const extra = parseFloat(formData.extraPayment);
        const prepaymentSchedule = generateSchedule(principal, emi, rate, tenure, extra, formData.extraPaymentFreq);
        const prepaymentTotal = prepaymentSchedule.reduce((sum, entry) => sum + entry.payment, 0);
        const prepaymentInterest = prepaymentTotal - principal;
        setPrepaymentResult({
          emi,
          totalAmount: prepaymentTotal,
          totalInterest: prepaymentInterest,
          schedule: prepaymentSchedule,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateEMI = (principal: number, rate: number, tenure: number, method: string = 'standard') => {
    const monthlyRate = rate / 100 / 12;
    let emi = 0;
    if (method === 'standard') {
      emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);
    } else if (method === 'reducing') {
      // Reducing balance method
      emi = principal * (monthlyRate / (1 - Math.pow(1 + monthlyRate, -tenure)));
    }
    return emi;
  };

  const generateSchedule = (principal: number, emi: number, rate: number, tenure: number, extraPayment: number = 0, extraFreq: string = 'monthly') => {
    const monthlyRate = rate / 100 / 12;
    let balance = principal;
    const schedule = [];
    for (let month = 1; month <= tenure; month++) {
      const interest = balance * monthlyRate;
      const principalPayment = emi - interest;
      balance = Math.max(0, balance - principalPayment);
      if (extraFreq === 'monthly' && extraPayment > 0) {
        balance -= extraPayment;
      } else if (extraFreq === 'yearly' && month % 12 === 0 && extraPayment > 0) {
        balance -= extraPayment;
      }
      schedule.push({
        month,
        payment: emi,
        principal: principalPayment,
        interest,
        balance,
      });
      if (balance <= 0) break;
    }
    return schedule;
  };

  const calculateTaxBenefit = (principal: number) => {
    // Assuming 80C max 1.5L, 24B max 2L interest
    const principalDeduction = Math.min(principal, 150000);
    const interestDeduction = 200000; // Max for 24B
    const taxSavings80C = principalDeduction * 0.3; // Assuming 30% tax slab
    const taxSavings24B = interestDeduction * 0.3;
    return { principalDeduction, interestDeduction, taxSavings80C, taxSavings24B };
  };

  const checkAffordability = (emi: number, income: number) => {
    const ratio = (emi / income) * 100;
    return { ratio, isAffordable: ratio < 30 };
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="calcMethod">Calculation Method</Label>
            <Select value={formData.calcMethod} onValueChange={(value) => handleInputChange('calcMethod', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard EMI</SelectItem>
                <SelectItem value="reducing">Reducing Balance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="monthlyIncome">Monthly Income (₹)</Label>
            <Input
              id="monthlyIncome"
              type="number"
              placeholder="100000"
              value={formData.monthlyIncome}
              onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="extraPayment">Extra Payment (₹)</Label>
            <Input
              id="extraPayment"
              type="number"
              placeholder="10000"
              value={formData.extraPayment}
              onChange={(e) => handleInputChange('extraPayment', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="extraPaymentFreq">Extra Payment Frequency</Label>
            <Select value={formData.extraPaymentFreq} onValueChange={(value) => handleInputChange('extraPaymentFreq', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
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
        <div id="emi-results" className="space-y-4">
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
              <CardTitle>Amortization Schedule</CardTitle>
              <CardDescription>Visual and tabular breakdown of payments</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="chart" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="chart">Chart View</TabsTrigger>
                  <TabsTrigger value="table">Table View</TabsTrigger>
                </TabsList>
                <TabsContent value="chart">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={result.schedule.slice(0, 60)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`₹${(value as number)?.toLocaleString() ?? ''}`, '']} />
                      <Legend />
                      <Area type="monotone" dataKey="principal" stackId="1" stroke="#8884d8" fill="#8884d8" />
                      <Area type="monotone" dataKey="interest" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                    </AreaChart>
                  </ResponsiveContainer>
                </TabsContent>
                <TabsContent value="table">
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
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {prepaymentResult && (
            <Card>
              <CardHeader>
                <CardTitle>Prepayment Impact</CardTitle>
                <CardDescription>Effect of extra payments on loan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">₹{prepaymentResult.totalInterest.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Interest Saved</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{Math.ceil(prepaymentResult.schedule.length / 12)} Years</div>
                    <div className="text-sm text-gray-600">Time Saved</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">₹{((result?.totalAmount || 0) - prepaymentResult.totalAmount).toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Amount Saved</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Tax Benefits</CardTitle>
              <CardDescription>80C and 24B deductions</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const taxBenefits = calculateTaxBenefit(parseFloat(formData.principal));
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold">Section 80C (Principal)</h4>
                      <p>Deduction: ₹{taxBenefits.principalDeduction.toLocaleString()}</p>
                      <p>Tax Savings: ₹{taxBenefits.taxSavings80C.toLocaleString()}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Section 24B (Interest)</h4>
                      <p>Deduction: ₹{taxBenefits.interestDeduction.toLocaleString()}</p>
                      <p>Tax Savings: ₹{taxBenefits.taxSavings24B.toLocaleString()}</p>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {formData.monthlyIncome && (
            <Card>
              <CardHeader>
                <CardTitle>Affordability Check</CardTitle>
                <CardDescription>EMI vs Income ratio</CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const affordability = checkAffordability(result?.emi || 0, parseFloat(formData.monthlyIncome));
                  return (
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-2">{affordability.ratio.toFixed(1)}%</div>
                      <div className="text-sm text-gray-600">EMI to Income Ratio</div>
                      <div className={`mt-2 p-2 rounded ${affordability.isAffordable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {affordability.isAffordable ? 'Affordable' : 'Not Affordable (Should be <30%)'}
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          <div className="flex gap-4">
            <Button onClick={() => {
              const name = prompt('Enter scenario name:');
              if (name && result) {
                setScenarios(prev => [...prev, { name, result, formData }]);
              }
            }}>
              Save Scenario
            </Button>
            <Button variant="outline" onClick={() => {
              const doc = new jsPDF();
              doc.text(`EMI Calculation Results`, 20, 20);
              doc.text(`EMI: ₹${result?.emi.toLocaleString()}`, 20, 40);
              doc.text(`Total Amount: ₹${result?.totalAmount.toLocaleString()}`, 20, 50);
              doc.text(`Total Interest: ₹${result?.totalInterest.toLocaleString()}`, 20, 60);
              doc.save('emi-calculation.pdf');
            }}>
              Export as PDF
            </Button>
            <Button variant="outline" onClick={() => {
              navigator.share({
                title: 'EMI Calculation',
                text: `EMI: ₹${result?.emi.toLocaleString()}, Total: ₹${result?.totalAmount.toLocaleString()}`,
                url: window.location.href,
              }).catch(() => { });
            }}>
              Share
            </Button>
          </div>

          {scenarios.length > 0 && (
            <Card id="comparison">
              <CardHeader>
                <CardTitle>Scenario Comparison</CardTitle>
                <CardDescription>Compare different loan scenarios</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Scenario</th>
                        <th className="text-right p-2">EMI</th>
                        <th className="text-right p-2">Total Amount</th>
                        <th className="text-right p-2">Total Interest</th>
                        <th className="text-right p-2">Rate</th>
                        <th className="text-right p-2">Tenure</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scenarios.map((scenario, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{scenario.name}</td>
                          <td className="text-right p-2">₹{scenario.result.emi.toLocaleString()}</td>
                          <td className="text-right p-2">₹{scenario.result.totalAmount.toLocaleString()}</td>
                          <td className="text-right p-2">₹{scenario.result.totalInterest.toLocaleString()}</td>
                          <td className="text-right p-2">{scenario.formData.annualInterestRate}%</td>
                          <td className="text-right p-2">{scenario.formData.tenureMonths} months</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}