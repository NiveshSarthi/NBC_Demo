import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { prisma } from '@/lib/database';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'test_secret',
});

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { amount, paymentType, description, metadata } = body;

    // Validate inputs
    if (!amount || !paymentType) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, paymentType' },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const options = {
      amount: amount * 100, // Razorpay expects amount in paisa
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // Save payment record in database
    const payment = await prisma.payment.create({
      data: {
        user_id: parseInt(userId),
        amount: amount,
        payment_type: paymentType,
        razorpay_order_id: order.id,
        description,
        metadata,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      paymentId: payment.id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}