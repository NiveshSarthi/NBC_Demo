import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { prisma } from '@/lib/database';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      payment_id
    } = body;

    // Verify payment signature
    const secret = process.env.RAZORPAY_KEY_SECRET || 'test_secret';
    const expectedSignature = createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Update payment status
    const payment = await prisma.payment.update({
      where: { id: parseInt(payment_id) },
      data: {
        status: 'completed',
        razorpay_payment_id,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      payment,
      message: 'Payment verified successfully',
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}