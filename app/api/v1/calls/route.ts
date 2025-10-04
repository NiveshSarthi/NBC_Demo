import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { propertyId, agentId, userId, scheduledAt } = body;

    if (!propertyId || !agentId || !scheduledAt) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Missing required fields: propertyId, agentId, scheduledAt',
          },
        },
        { status: 400 }
      );
    }

    // Create the call
    const call = await prisma.call.create({
      data: {
        property_id: propertyId,
        agent_id: agentId,
        user_id: userId || null,
        call_type: 'masked', // Default for scheduled
        status: 'scheduled',
        scheduled_at: new Date(scheduledAt),
      },
    });

    return NextResponse.json({
      success: true,
      call: {
        id: call.id,
        propertyId: call.property_id,
        agentId: call.agent_id,
        userId: call.user_id,
        callType: call.call_type,
        status: call.status,
        scheduledAt: call.scheduled_at,
        createdAt: call.created_at,
      },
      message: 'Call scheduled successfully',
    });
  } catch (error) {
    console.error('Error scheduling call:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while scheduling the call',
        },
      },
      { status: 500 }
    );
  }
}