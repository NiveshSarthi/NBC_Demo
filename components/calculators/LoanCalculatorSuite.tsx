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

const DownPaymentCalculator = dynamic(() => import('@/components/calculators/DownPaymentCalculator').then(mod => ({ default: mod.DownPaymentCalculator })), {
  loading: () => <LoadingSpinner />,
});

const HomeInsuranceCalculator = dynamic(() => import('@/components/calculators/HomeInsuranceCalculator').then(mod => ({ default: mod.HomeInsuranceCalculator })), {
  loading: () => <LoadingSpinner />,
});

const MaintenanceCostEstimator = dynamic(() => import('@/components/calculators/MaintenanceCostEstimator').then(mod => ({ default: mod.MaintenanceCostEstimator })), {
  loading: () => <LoadingSpinner />,
});

const AppreciationPredictor = dynamic(() => import('@/components/calculators/AppreciationPredictor').then(mod => ({ default: mod.AppreciationPredictor })), {
  loading: () => <LoadingSpinner />,
});

const LoanApplicationForm = dynamic(() => import('@/components/loans/LoanApplicationForm').then(mod => ({ default: mod.default })), {
  loading: () => <LoadingSpinner />,
});

export function LoanCalculatorSuite() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Loan Calculator Suite</h2>
        <p className="text-gray-600">
          Comprehensive suite of financial calculators for real estate and loan planning
        </p>
      </div>

      <Tabs defaultValue="emi" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="emi">EMI Calculator</TabsTrigger>
          <TabsTrigger value="roi">ROI Calculator</TabsTrigger>
          <TabsTrigger value="eligibility">Home Loan Eligibility</TabsTrigger>
          <TabsTrigger value="stamp">Stamp Duty</TabsTrigger>
          <TabsTrigger value="nri">NRI Tax Calculator</TabsTrigger>
          <TabsTrigger value="downpayment">Down Payment</TabsTrigger>
          <TabsTrigger value="insurance">Home Insurance</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance Cost</TabsTrigger>
          <TabsTrigger value="appreciation">Appreciation Predictor</TabsTrigger>
          <TabsTrigger value="apply">Apply for Loan</TabsTrigger>
        </TabsList>

        <TabsContent value="emi">
          <Card>
            <CardHeader>
              <CardTitle>Advanced EMI Calculator</CardTitle>
              <CardDescription>
                Calculate EMI with amortization charts, prepayment analysis, tax benefits, affordability check, and scenario comparison
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

        <TabsContent value="downpayment">
          <Card>
            <CardHeader>
              <CardTitle>Down Payment Calculator</CardTitle>
              <CardDescription>
                Calculate down payment amount and loan amount for property purchase
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DownPaymentCalculator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insurance">
          <Card>
            <CardHeader>
              <CardTitle>Home Insurance Calculator</CardTitle>
              <CardDescription>
                Calculate home insurance premiums based on property value and coverage type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HomeInsuranceCalculator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Cost Estimator</CardTitle>
              <CardDescription>
                Estimate annual and monthly maintenance costs for your property
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MaintenanceCostEstimator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appreciation">
          <Card>
            <CardHeader>
              <CardTitle>Appreciation Predictor</CardTitle>
              <CardDescription>
                Predict property value appreciation over time with growth projections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AppreciationPredictor />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="apply">
          <Card>
            <CardHeader>
              <CardTitle>Apply for Loan</CardTitle>
              <CardDescription>
                Submit your loan application with document upload and eligibility check
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoanApplicationForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}