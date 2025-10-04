import { NextRequest, NextResponse } from 'next/server';

interface ROIRequest {
  initialInvestment: number;
  finalValue: number;
  investmentPeriodYears: number;
  isCompound?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const body: ROIRequest = await req.json();
    const { initialInvestment, finalValue, investmentPeriodYears, isCompound = true } = body;

    // Validate inputs
    if (!initialInvestment || !finalValue || !investmentPeriodYears) {
      return NextResponse.json(
        { error: 'Missing required fields: initialInvestment, finalValue, investmentPeriodYears' },
        { status: 400 }
      );
    }

    if (initialInvestment <= 0 || finalValue < 0 || investmentPeriodYears <= 0) {
      return NextResponse.json(
        { error: 'Invalid input values' },
        { status: 400 }
      );
    }

    const netProfit = finalValue - initialInvestment;
    let roi;

    if (isCompound) {
      // Compounded annual growth rate
      roi = (Math.pow(finalValue / initialInvestment, 1 / investmentPeriodYears) - 1) * 100;
    } else {
      // Simple ROI
      roi = (netProfit / initialInvestment) * 100;
    }

    const annualROI = roi / investmentPeriodYears;

    // Breakdown by year
    const breakdown = [];
    let currentValue = initialInvestment;

    for (let year = 1; year <= investmentPeriodYears; year++) {
      if (isCompound) {
        currentValue *= (1 + roi / 100);
      } else {
        currentValue += netProfit / investmentPeriodYears;
      }

      breakdown.push({
        year,
        value: Math.round(currentValue * 100) / 100,
        annualReturn: Math.round((annualROI) * 100) / 100,
      });
    }

    return NextResponse.json({
      roi: Math.round(roi * 100) / 100,
      annualROI: Math.round(annualROI * 100) / 100,
      netProfit: Math.round(netProfit * 100) / 100,
      finalValue: Math.round(finalValue * 100) / 100,
      breakdown,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}