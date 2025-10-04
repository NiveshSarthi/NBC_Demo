'use client';

import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Lazy load the calculator suite
const LoanCalculatorSuite = dynamic(() => import('@/components/calculators/LoanCalculatorSuite').then(mod => ({ default: mod.LoanCalculatorSuite })), {
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

      <LoanCalculatorSuite />
    </div>
  );
}