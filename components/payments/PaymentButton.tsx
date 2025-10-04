'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, CheckCircle } from 'lucide-react';

interface PaymentButtonProps {
  amount: number;
  paymentType: string;
  description?: string;
  onSuccess?: (payment: any) => void;
  onError?: (error: any) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function PaymentButton({
  amount,
  paymentType,
  description,
  onSuccess,
  onError,
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Create payment order
      const response = await fetch('/api/v1/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Adjust based on your auth
        },
        body: JSON.stringify({
          amount,
          paymentType,
          description,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment order');
      }

      const { orderId, amount: orderAmount, currency, paymentId, razorpayKeyId } = await response.json();

      // Initialize Razorpay
      const options = {
        key: razorpayKeyId,
        amount: orderAmount,
        currency,
        order_id: orderId,
        name: 'NextBoomCity',
        description: description || 'Payment for premium services',
        handler: async (response: any) => {
          // Verify payment
          try {
            const verifyResponse = await fetch('/api/v1/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: orderId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                payment_id: paymentId,
              }),
            });

            if (verifyResponse.ok) {
              setSuccess(true);
              onSuccess?.(response);
              // Redirect to success page
              window.location.href = `/payments/success?payment_id=${response.razorpay_payment_id}&order_id=${orderId}&amount=${orderAmount}`;
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (verifyError) {
            setError('Payment verification failed');
            onError?.(verifyError);
          }
        },
        prefill: {
          email: '', // Would get from user context
          contact: '', // Would get from user context
        },
        theme: {
          color: '#3B82F6',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handlePayment}
        disabled={loading}
        className="w-full"
        size="lg"
      >
        <CreditCard className="w-4 h-4 mr-2" />
        {loading ? 'Processing...' : `Pay ₹${amount}`}
      </Button>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Payment successful! Your transaction has been completed.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}