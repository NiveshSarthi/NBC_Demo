import { NextRequest, NextResponse } from 'next/server';

interface EMIRequest {
  principal: number;
  annualInterestRate: number;
  tenureMonths: number;
}

interface AmortizationEntry {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export async function POST(req: NextRequest) {
  try {
    const body: EMIRequest = await req.json();
    const { principal, annualInterestRate, tenureMonths } = body;

    // Validate inputs
    if (!principal || !annualInterestRate || !tenureMonths) {
      return NextResponse.json(
        { error: 'Missing required fields: principal, annualInterestRate, tenureMonths' },
        { status: 400 }
      );
    }

    if (principal <= 0 || annualInterestRate < 0 || tenureMonths <= 0) {
      return NextResponse.json(
        { error: 'Invalid input values' },
        { status: 400 }
      );
    }

    // Convert annual rate to monthly
    const monthlyRate = annualInterestRate / 100 / 12;

    // EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) /
                (Math.pow(1 + monthlyRate, tenureMonths) - 1);

    const totalAmount = emi * tenureMonths;
    const totalInterest = totalAmount - principal;

    // Generate amortization schedule
    const schedule: AmortizationEntry[] = [];
    let balance = principal;

    for (let month = 1; month <= tenureMonths; month++) {
      const interest = balance * monthlyRate;
      const principalPayment = emi - interest;
      balance -= principalPayment;

      schedule.push({
        month,
        payment: Math.round(emi * 100) / 100,
        principal: Math.round(principalPayment * 100) / 100,
        interest: Math.round(interest * 100) / 100,
        balance: Math.round(Math.max(balance, 0) * 100) / 100,
      });
    }

    return NextResponse.json({
      emi: Math.round(emi * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      schedule,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}