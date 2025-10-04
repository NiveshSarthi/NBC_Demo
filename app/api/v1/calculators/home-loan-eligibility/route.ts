import { NextRequest, NextResponse } from 'next/server';

interface EligibilityRequest {
  monthlyIncome: number;
  monthlyObligations: number;
  dependents: number;
  age: number;
  employmentType: 'salaried' | 'self-employed';
  city: string;
  existingLoans?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body: EligibilityRequest = await req.json();
    const {
      monthlyIncome,
      monthlyObligations,
      dependents,
      age,
      employmentType,
      city,
      existingLoans = 0,
    } = body;

    // Validate inputs
    if (!monthlyIncome || !monthlyObligations || !dependents || !age || !employmentType || !city) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (monthlyIncome <= 0 || monthlyObligations < 0 || dependents < 0 || age < 21 || age > 65) {
      return NextResponse.json(
        { error: 'Invalid input values' },
        { status: 400 }
      );
    }

    // Calculate disposable income
    const disposableIncome = monthlyIncome - monthlyObligations;

    // EMI affordability (typically 50-60% of disposable income for housing)
    const emiAffordability = disposableIncome * 0.5;

    // Age-based loan tenure (max 65 years)
    const maxTenureYears = Math.min(65 - age, 30);

    // City-based property value limits (approximate for major cities)
    const cityMultipliers: { [key: string]: number } = {
      mumbai: 1.2,
      delhi: 1.1,
      bangalore: 1.0,
      chennai: 0.9,
      pune: 0.8,
      hyderabad: 0.85,
      kolkata: 0.75,
    };

    const baseMultiplier = cityMultipliers[city.toLowerCase()] || 1.0;

    // Base eligible amount (income-based)
    let eligibleAmount = disposableIncome * 60 * maxTenureYears;

    // Apply city multiplier for property value
    eligibleAmount *= baseMultiplier;

    // Adjust for employment type
    if (employmentType === 'self-employed') {
      eligibleAmount *= 0.8; // Lower for self-employed
    }

    // Adjust for existing loans
    if (existingLoans > 0) {
      eligibleAmount -= existingLoans * 5; // Rough estimate
    }

    // Adjust for dependents (higher family size reduces eligibility)
    if (dependents > 2) {
      eligibleAmount *= 0.85;
    }

    // Maximum loan amount (typically 80-90% of property value)
    const maxLoanAmount = Math.min(eligibleAmount, 10000000); // Cap at 1 crore for safety

    // Estimated property value (loan amount / 0.8)
    const estimatedPropertyValue = maxLoanAmount / 0.8;

    // Estimated EMI at current rates (assuming 8-9% interest)
    const assumedRate = 8.5;
    const monthlyRate = assumedRate / 100 / 12;
    const estimatedEMI = maxLoanAmount * monthlyRate * Math.pow(1 + monthlyRate, maxTenureYears * 12) /
                         (Math.pow(1 + monthlyRate, maxTenureYears * 12) - 1);

    return NextResponse.json({
      eligibleAmount: Math.round(maxLoanAmount),
      estimatedPropertyValue: Math.round(estimatedPropertyValue),
      maxTenureYears,
      estimatedEMI: Math.round(estimatedEMI),
      disposableIncome: Math.round(disposableIncome),
      emiAffordability: Math.round(emiAffordability),
      factors: {
        employmentType,
        cityMultiplier: baseMultiplier,
        dependentsAdjustment: dependents > 2 ? 0.85 : 1.0,
        existingLoansImpact: existingLoans > 0 ? 'Reduced by existing obligations' : 'No impact',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}