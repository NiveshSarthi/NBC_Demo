'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Lazy load calculators
const EMICalculator = dynamic(() => import('@/components/calculators/EMICalculator').then(mod => ({ default: mod.EMICalculator })), {
  loading: () => <LoadingSpinner />,
});

const ROICalculator = dynamic(() => import('@/components/calculators/ROICalculator').then(mod => ({ default: mod.ROICalculator })), {
  loading: () => <LoadingSpinner />,
});

const HomeLoanEligibilityCalculator = dynamic(() => import('@/components/calculators/HomeLoanEligibilityCalculator').then(mod => ({ default: mod.HomeLoanEligibilityCalculator })), {
  loading: () => <LoadingSpinner />,
});

const StampDutyCalculator = dynamic(() => import('@/components/calculators/StampDutyCalculator').then(mod => ({ default: mod.StampDutyCalculator })), {
  loading: () => <LoadingSpinner />,
});

const NRITaxCalculator = dynamic(() => import('@/components/calculators/NRITaxCalculator').then(mod => ({ default: mod.NRITaxCalculator })), {
  loading: () => <LoadingSpinner />,
});

export default function CalculatorsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Financial Calculators</h1>
        <p className="text-gray-600">
          Comprehensive financial tools for real estate investment planning
        </p>
      </div>

      <Tabs defaultValue="emi" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="emi">EMI Calculator</TabsTrigger>
          <TabsTrigger value="roi">ROI Calculator</TabsTrigger>
          <TabsTrigger value="eligibility">Home Loan Eligibility</TabsTrigger>
          <TabsTrigger value="stamp">Stamp Duty</TabsTrigger>
          <TabsTrigger value="nri">NRI Tax Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="emi">
          <Card>
            <CardHeader>
              <CardTitle>EMI Calculator</CardTitle>
              <CardDescription>
                Calculate your monthly loan repayments and view amortization schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EMICalculator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roi">
          <Card>
            <CardHeader>
              <CardTitle>ROI Calculator</CardTitle>
              <CardDescription>
                Calculate return on investment for your property investments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ROICalculator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="eligibility">
          <Card>
            <CardHeader>
              <CardTitle>Home Loan Eligibility Calculator</CardTitle>
              <CardDescription>
                Check how much home loan you can afford based on your income
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HomeLoanEligibilityCalculator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stamp">
          <Card>
            <CardHeader>
              <CardTitle>Stamp Duty Calculator</CardTitle>
              <CardDescription>
                Calculate stamp duty and registration charges for property purchase
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StampDutyCalculator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nri">
          <Card>
            <CardHeader>
              <CardTitle>NRI Tax Calculator</CardTitle>
              <CardDescription>
                Calculate tax implications for NRI property investments in India
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NRITaxCalculator />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}