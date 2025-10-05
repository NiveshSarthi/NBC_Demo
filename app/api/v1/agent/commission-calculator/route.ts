import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

interface CommissionStructure {
  id: string;
  name: string;
  type: 'percentage' | 'fixed' | 'tiered';
  rate?: number;
  fixedAmount?: number;
  tiers?: Array<{
    minValue: number;
    maxValue?: number;
    rate: number;
  }>;
}

const COMMISSION_STRUCTURES: CommissionStructure[] = [
  {
    id: 'standard',
    name: 'Standard Commission',
    type: 'percentage',
    rate: 0.02 // 2%
  },
  {
    id: 'premium',
    name: 'Premium Commission',
    type: 'percentage',
    rate: 0.03 // 3%
  },
  {
    id: 'fixed',
    name: 'Fixed Commission',
    type: 'fixed',
    fixedAmount: 50000 // ₹50,000
  },
  {
    id: 'tiered',
    name: 'Tiered Commission',
    type: 'tiered',
    tiers: [
      { minValue: 0, maxValue: 5000000, rate: 0.015 }, // 1.5% for < ₹50L
      { minValue: 5000000, maxValue: 10000000, rate: 0.02 }, // 2% for ₹50L-₹1Cr
      { minValue: 10000000, rate: 0.025 } // 2.5% for > ₹1Cr
    ]
  }
];

export async function GET(request: NextRequest) {
  try {
    // Get user ID from middleware
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId || userRole !== 'agent') {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Agent access required' } },
        { status: 401 }
      );
    }

    const agentId = parseInt(userId, 10);
    const { searchParams } = new URL(request.url);
    const structureId = searchParams.get('structure') || 'standard';
    const propertyValue = parseFloat(searchParams.get('value') || '0');

    const structure = COMMISSION_STRUCTURES.find(s => s.id === structureId);
    if (!structure) {
      return NextResponse.json(
        { error: { code: 'INVALID_STRUCTURE', message: 'Invalid commission structure' } },
        { status: 400 }
      );
    }

    // Calculate commission based on structure
    let commission = 0;
    let breakdown: any[] = [];

    switch (structure.type) {
      case 'percentage':
        commission = propertyValue * (structure.rate || 0);
        breakdown = [{
          description: `${(structure.rate! * 100).toFixed(1)}% of ₹${propertyValue.toLocaleString('en-IN')}`,
          amount: commission
        }];
        break;

      case 'fixed':
        commission = structure.fixedAmount || 0;
        breakdown = [{
          description: `Fixed commission`,
          amount: commission
        }];
        break;

      case 'tiered':
        if (structure.tiers) {
          for (const tier of structure.tiers) {
            if (propertyValue >= tier.minValue &&
                (!tier.maxValue || propertyValue < tier.maxValue)) {
              commission = propertyValue * tier.rate;
              breakdown = [{
                description: `${(tier.rate * 100).toFixed(1)}% tier rate on ₹${propertyValue.toLocaleString('en-IN')}`,
                amount: commission
              }];
              break;
            }
          }
        }
        break;
    }

    // Get agent's recent deals for comparison
    const recentDeals = await prisma.property.findMany({
      where: {
        created_by: agentId,
        status: 'sold',
        updated_at: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
        }
      },
      select: {
        price: true,
        rent_amount: true,
        listing_type: true,
        title: true,
        updated_at: true
      },
      orderBy: {
        updated_at: 'desc'
      },
      take: 5
    });

    const averageCommission = recentDeals.reduce((total, deal) => {
      const value = deal.listing_type === 'sale'
        ? Number(deal.price || 0)
        : Number(deal.rent_amount || 0);
      return total + (value * 0.02); // Using standard 2% for average calculation
    }, 0) / Math.max(recentDeals.length, 1);

    return NextResponse.json({
      structure,
      propertyValue,
      commission,
      breakdown,
      comparison: {
        averageCommission,
        recentDealsCount: recentDeals.length
      },
      availableStructures: COMMISSION_STRUCTURES
    });
  } catch (error) {
    console.error('Commission calculator error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to calculate commission' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user ID from middleware
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId || userRole !== 'agent') {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Agent access required' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { propertyValue, structureId, notes } = body;

    if (!propertyValue || propertyValue <= 0) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'Valid property value required' } },
        { status: 400 }
      );
    }

    const structure = COMMISSION_STRUCTURES.find(s => s.id === structureId || 'standard');

    // Calculate commission
    let commission = 0;
    switch (structure?.type) {
      case 'percentage':
        commission = propertyValue * (structure.rate || 0);
        break;
      case 'fixed':
        commission = structure.fixedAmount || 0;
        break;
      case 'tiered':
        if (structure.tiers) {
          for (const tier of structure.tiers) {
            if (propertyValue >= tier.minValue &&
                (!tier.maxValue || propertyValue < tier.maxValue)) {
              commission = propertyValue * tier.rate;
              break;
            }
          }
        }
        break;
    }

    // Store commission calculation (you might want to create a commission_history table)
    const calculationResult = {
      propertyValue,
      structureId: structure?.id,
      structureName: structure?.name,
      commission,
      calculatedAt: new Date(),
      notes,
      agentId: parseInt(userId, 10)
    };

    return NextResponse.json({
      success: true,
      calculation: calculationResult
    });
  } catch (error) {
    console.error('Save commission calculation error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to save calculation' } },
      { status: 500 }
    );
  }
}