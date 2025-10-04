'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from '@/components/upload/FileUpload';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Bank {
  id: number;
  name: string;
  interest_rates: any;
  eligibility_criteria: any;
  logo_url: string;
  contact_info: any;
}

interface DocumentFile {
  type: 'id' | 'salary' | 'proof';
  file: File;
}

export default function LoanApplicationForm() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [loanAmount, setLoanAmount] = useState<string>('');
  const [income, setIncome] = useState<string>('');
  const [creditScore, setCreditScore] = useState<string>('');
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [preQualificationScore, setPreQualificationScore] = useState<number>(0);
  const [approvalChance, setApprovalChance] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch banks from API
    fetch('/api/v1/banks')
      .then(res => res.json())
      .then(data => setBanks(data))
      .catch(err => console.error('Failed to fetch banks', err));
  }, []);

  const calculatePreQualification = () => {
    const incomeNum = parseFloat(income);
    const creditNum = parseInt(creditScore);
    if (incomeNum && creditNum) {
      // Simple scoring logic
      let score = 0;
      if (incomeNum > 100000) score += 40;
      else if (incomeNum > 50000) score += 20;
      if (creditNum > 750) score += 60;
      else if (creditNum > 600) score += 30;
      setPreQualificationScore(score);
    }
  };

  const calculateEligibility = () => {
    const bank = banks.find(b => b.id.toString() === selectedBank);
    if (bank && preQualificationScore) {
      // Mock eligibility calculation based on criteria
      const criteria = bank.eligibility_criteria;
      let chance = 0;
      if (parseFloat(income) >= criteria.min_income) chance += 50;
      if (parseInt(creditScore) >= criteria.min_credit_score) chance += 50;
      setApprovalChance(Math.min(100, chance * (preQualificationScore / 100)));
    }
  };

  const handleDocumentUpload = (files: File[], type: 'id' | 'salary' | 'proof') => {
    const newDocs = files.map(file => ({ type, file }));
    setDocuments(prev => [...prev, ...newDocs]);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('bank_id', selectedBank);
    formData.append('loan_amount', loanAmount);
    // Add other fields and documents

    try {
      const response = await fetch('/api/v1/loans', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        alert('Application submitted successfully');
      } else {
        alert('Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Loan Application</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="bank">Select Bank</Label>
            <Select value={selectedBank} onValueChange={setSelectedBank}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a bank" />
              </SelectTrigger>
              <SelectContent>
                {banks.map(bank => (
                  <SelectItem key={bank.id} value={bank.id.toString()}>
                    {bank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="loanAmount">Loan Amount (INR)</Label>
            <Input
              id="loanAmount"
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="income">Annual Income (INR)</Label>
              <Input
                id="income"
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="creditScore">Credit Score</Label>
              <Input
                id="creditScore"
                type="number"
                value={creditScore}
                onChange={(e) => setCreditScore(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={calculatePreQualification}>Check Pre-Qualification</Button>
          {preQualificationScore > 0 && (
            <Progress value={preQualificationScore} className="w-full" />
          )}
        </CardContent>
      </Card>

      {selectedBank && (
        <Card>
          <CardHeader>
            <CardTitle>Eligibility Calculator</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={calculateEligibility}>Calculate Approval Chance</Button>
            {approvalChance > 0 && (
              <Alert>
                <AlertDescription>
                  Approval Chance: {approvalChance.toFixed(1)}%
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Interest Rate Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {banks.map(bank => (
              <div key={bank.id} className="flex justify-between p-2 border rounded">
                <span>{bank.name}</span>
                <span>{bank.interest_rates?.home_loan || 'N/A'}%</span>
                <span>Up to 30 years</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Document Upload</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>ID Proof</Label>
            <FileUpload
              onUpload={(files) => handleDocumentUpload(files, 'id')}
              accept=".jpg,.png,.pdf"
            />
          </div>
          <div>
            <Label>Salary Proof</Label>
            <FileUpload
              onUpload={(files) => handleDocumentUpload(files, 'salary')}
              accept=".jpg,.png,.pdf"
            />
          </div>
          <div>
            <Label>Property Proof</Label>
            <FileUpload
              onUpload={(files) => handleDocumentUpload(files, 'proof')}
              accept=".jpg,.png,.pdf"
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Application'}
      </Button>
    </div>
  );
}