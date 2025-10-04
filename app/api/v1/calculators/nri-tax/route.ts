import { NextRequest, NextResponse } from 'next/server';

interface NRITaxRequest {
  annualRentalIncome: number;
  propertyValue: number;
  holdingPeriodYears: number;
  isResidential: boolean;
  hasDTAA?: boolean; // Double Taxation Avoidance Agreement
  country: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: NRITaxRequest = await req.json();
    const {
      annualRentalIncome,
      propertyValue,
      holdingPeriodYears,
      isResidential,
      hasDTAA = false,
      country = 'other'
    } = body;

    // Validate inputs
    if (!annualRentalIncome || !propertyValue || !holdingPeriodYears) {
      return NextResponse.json(
        { error: 'Missing required fields: annualRentalIncome, propertyValue, holdingPeriodYears' },
        { status: 400 }
      );
    }

    if (annualRentalIncome < 0 || propertyValue <= 0 || holdingPeriodYears < 0) {
      return NextResponse.json(
        { error: 'Invalid input values' },
        { status: 400 }
      );
    }

    // Calculate rental income tax (30% for NRIs, plus surcharge)
    const standardDeduction = annualRentalIncome * 0.3; // 30% standard deduction
    const taxableRentalIncome = annualRentalIncome - standardDeduction;
    let rentalIncomeTax = taxableRentalIncome * 0.3; // 30% tax rate for NRIs

    // Add surcharge (10% for income > 50 lakhs)
    if (taxableRentalIncome > 5000000) {
      rentalIncomeTax += rentalIncomeTax * 0.1;
    }

    // Cess (4%)
    rentalIncomeTax += rentalIncomeTax * 0.04;

    // Capital gains tax calculation
    const capitalGain = propertyValue * (holdingPeriodYears >= 3 ? 0.2 : 0.3); // 20% LTCG or 30% STCG
    let capitalGainsTax = capitalGain;

    // Indexation benefit for long-term (not applicable for NRIs)
    // NRIs don't get indexation benefit

    // Surcharge on capital gains
    if (capitalGain > 5000000) {
      capitalGainsTax += capitalGainsTax * 0.1;
    }

    // Cess
    capitalGainsTax += capitalGainsTax * 0.04;

    // DTAA benefits (simplified)
    let dtaaReduction = 0;
    if (hasDTAA) {
      // Assume 50% reduction in some cases
      dtaaReduction = (rentalIncomeTax + capitalGainsTax) * 0.5;
    }

    const totalTax = rentalIncomeTax + capitalGainsTax - dtaaReduction;

    // TDS on rental income (31.2% for NRIs)
    const tdsRental = annualRentalIncome * 0.312;

    return NextResponse.json({
      rentalIncome: {
        grossIncome: annualRentalIncome,
        standardDeduction,
        taxableIncome: taxableRentalIncome,
        tax: Math.round(rentalIncomeTax),
      },
      capitalGains: {
        holdingPeriodYears,
        gainType: holdingPeriodYears >= 3 ? 'Long-term' : 'Short-term',
        gain: Math.round(capitalGain),
        tax: Math.round(capitalGainsTax),
      },
      dtaaBenefits: hasDTAA ? Math.round(dtaaReduction) : 0,
      totalTax: Math.round(totalTax),
      tdsRequired: Math.round(tdsRental),
      netIncome: Math.round(annualRentalIncome - tdsRental - totalTax),
      notes: [
        'TDS must be deducted at source on rental payments to NRIs',
        'Capital gains tax applies on sale of property',
        'DTAA benefits may reduce effective tax rate',
        'Consult chartered accountant for exact tax planning'
      ],
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}