'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, CreditCard, Star, Building, TrendingUp } from 'lucide-react';
import { PaymentButton } from '@/components/payments/PaymentButton';

const paymentPlans = [
  {
    id: 'premium_listing',
    name: 'Premium Listing',
    price: 2500,
    duration: '30 days',
    icon: Star,
    description: 'Get featured placement and priority visibility',
    features: [
      'Featured on homepage',
      'Priority in search results',
      'Enhanced property card',
      'Analytics dashboard access',
      'Email marketing support'
    ]
  },
  {
    id: 'commercial_premium',
    name: 'Commercial Premium',
    price: 5000,
    duration: '60 days',
    icon: Building,
    description: 'Advanced features for commercial properties',
    features: [
      'All premium listing features',
      'Virtual tour integration',
      'Lead generation tools',
      'Advanced analytics',
      'Dedicated account manager'
    ]
  },
  {
    id: 'marketplace_subscription',
    name: 'Marketplace Subscription',
    price: 15000,
    duration: '1 year',
    icon: TrendingUp,
    description: 'Full access to marketplace features',
    features: [
      'Unlimited property listings',
      'Advanced filtering options',
      'Bulk upload capabilities',
      'API access',
      'White-label options',
      'Priority support'
    ]
  }
];

export default function PaymentsPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handlePaymentSuccess = (payment: any) => {
    console.log('Payment successful:', payment);
    // Handle success - redirect to success page, update user status, etc.
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment failed:', error);
    // Handle error - show error message, retry options, etc.
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Upgrade Your Experience</h1>
        <p className="text-muted-foreground">
          Choose the perfect plan to boost your property visibility and access premium features
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {paymentPlans.map((plan) => {
          const Icon = plan.icon;
          return (
            <Card
              key={plan.id}
              className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedPlan === plan.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
              }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-3xl font-bold">₹{plan.price.toLocaleString()}</span>
                  <span className="text-muted-foreground">/ {plan.duration}</span>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="border-t pt-4"></div>

                <div className="space-y-3">
                  <Button
                    className="w-full"
                    variant={selectedPlan === plan.id ? "default" : "outline"}
                  >
                    {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                  </Button>

                  {selectedPlan === plan.id && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Complete Payment
                      </h4>
                      <PaymentButton
                        amount={plan.price}
                        paymentType={plan.id}
                        description={`Payment for ${plan.name}`}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payment Information */}
      <div className="mt-12 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Secure Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2">Payment Methods</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Credit/Debit Cards (Visa, MasterCard, RuPay)</li>
                  <li>• Net Banking</li>
                  <li>• UPI (Google Pay, PhonePe, Paytm)</li>
                  <li>• Wallets</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Security & Support</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• 256-bit SSL encryption</li>
                  <li>• PCI DSS compliant</li>
                  <li>• Instant payment confirmation</li>
                  <li>• 24/7 customer support</li>
                </ul>
              </div>
            </div>

            <div className="border-t my-6"></div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 text-blue-900">Need Help?</h4>
              <p className="text-sm text-blue-800">
                Contact our support team at{' '}
                <a href="mailto:support@nextboomcity.com" className="underline">
                  support@nextboomcity.com
                </a>{' '}
                or call us at +91-1800-XXX-XXXX for any payment-related queries.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}