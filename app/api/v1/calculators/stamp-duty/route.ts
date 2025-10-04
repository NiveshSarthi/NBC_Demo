import { NextRequest, NextResponse } from 'next/server';

interface StampDutyRequest {
  propertyValue: number;
  state: string;
  isFirstTimeBuyer?: boolean;
  isWithinFamily?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const body: StampDutyRequest = await req.json();
    const { propertyValue, state, isFirstTimeBuyer = false, isWithinFamily = false } = body;

    // Validate inputs
    if (!propertyValue || !state) {
      return NextResponse.json(
        { error: 'Missing required fields: propertyValue, state' },
        { status: 400 }
      );
    }

    if (propertyValue <= 0) {
      return NextResponse.json(
        { error: 'Invalid property value' },
        { status: 400 }
      );
    }

    // Stamp duty rates by state (simplified, actual rates vary)
    const stampDutyRates: { [key: string]: { rate: number; slabs?: { min: number; max: number; rate: number }[] } } = {
      maharashtra: {
        rate: 0.05, // 5%
        slabs: [
          { min: 0, max: 3000000, rate: 0.025 }, // 2.5% up to 30 lakhs
          { min: 3000000, max: 7500000, rate: 0.0375 }, // 3.75% for 30-75 lakhs
          { min: 7500000, max: Infinity, rate: 0.05 }, // 5% above 75 lakhs
        ]
      },
      delhi: {
        rate: 0.06, // 6%
        slabs: [
          { min: 0, max: 6000000, rate: 0.04 }, // 4% up to 60 lakhs
          { min: 6000000, max: Infinity, rate: 0.06 }, // 6% above 60 lakhs
        ]
      },
      karnataka: {
        rate: 0.05, // 5%
        slabs: [
          { min: 0, max: 4500000, rate: 0.0325 }, // 3.25% up to 45 lakhs
          { min: 4500000, max: Infinity, rate: 0.05 }, // 5% above 45 lakhs
        ]
      },
      tamilnadu: {
        rate: 0.07, // 7%
        slabs: [
          { min: 0, max: 2000000, rate: 0.0425 }, // 4.25% up to 20 lakhs
          { min: 2000000, max: 4000000, rate: 0.06 }, // 6% for 20-40 lakhs
          { min: 4000000, max: Infinity, rate: 0.07 }, // 7% above 40 lakhs
        ]
      },
      // Default for other states
      default: { rate: 0.05 }
    };

    const stateData = stampDutyRates[state.toLowerCase()] || stampDutyRates.default;
    let stampDuty = 0;

    if (stateData.slabs) {
      // Calculate based on slabs
      for (const slab of stateData.slabs) {
        if (propertyValue > slab.min) {
          const taxableAmount = Math.min(propertyValue - slab.min, slab.max - slab.min);
          stampDuty += taxableAmount * slab.rate;
        }
      }
    } else {
      stampDuty = propertyValue * stateData.rate;
    }

    // Apply concessions
    let discount = 0;
    if (isFirstTimeBuyer && ['maharashtra', 'delhi', 'karnataka'].includes(state.toLowerCase())) {
      discount = stampDuty * 0.15; // 15% discount for first-time buyers in some states
    }

    if (isWithinFamily) {
      discount = stampDuty * 0.5; // 50% discount for family transfers
    }

    const finalStampDuty = Math.max(stampDuty - discount, 0);

    // Registration charges (typically 1% of property value)
    const registrationCharges = propertyValue * 0.01;

    return NextResponse.json({
      propertyValue,
      state,
      stampDuty: Math.round(stampDuty),
      discount: Math.round(discount),
      finalStampDuty: Math.round(finalStampDuty),
      registrationCharges: Math.round(registrationCharges),
      totalCharges: Math.round(finalStampDuty + registrationCharges),
      concessions: {
        firstTimeBuyer: isFirstTimeBuyer,
        withinFamily: isWithinFamily,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}