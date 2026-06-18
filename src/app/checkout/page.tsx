'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripePromise } from '@/lib/stripe';

interface Address {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

interface CartItem {
  id: string;
  quantity: number;
  product: { title: string; price: number; images?: { url: string }[] };
  variant?: { name: string; price?: number } | null;
}

const SHIPPING_METHODS = [
  { id: 'standard', name: 'Standard Shipping', price: 5.99, days: '5-7 business days' },
  { id: 'express', name: 'Express Shipping', price: 12.99, days: '2-3 business days' },
  { id: 'nextday', name: 'Next-Day Delivery', price: 24.99, days: '1 business day' },
];

const STEPS = ['Address', 'Shipping', 'Payment', 'Review'];

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center mb-8">
      {STEPS.map((label, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;
        return (
          <div key={label} className="flex items-center flex-1">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isActive
                    ? 'bg-yellow-400 text-black'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {isCompleted ? '✓' : stepNum}
              </div>
              <span className={`ml-2 text-sm ${isActive ? 'font-bold text-black' : 'text-gray-500'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

interface OrderSummaryProps {
  cartItems: CartItem[];
  shippingMethod: string;
  giftWrap: boolean;
  totals: { subtotal: number; shippingCost: number; tax: number; total: number; giftWrapCost: number };
}

function OrderSummary({ cartItems, shippingMethod, giftWrap, totals }: OrderSummaryProps) {
  const shipping = SHIPPING_METHODS.find((m) => m.id === shippingMethod);
  return (
    <div className="bg-gray-50 border rounded-lg p-4 sticky top-4">
      <h3 className="font-bold text-lg mb-3">Order Summary</h3>
      <div className="space-y-2 text-sm max-h-48 overflow-y-auto mb-3">
        {cartItems.map((item) => (
          <div key={item.id} className="flex justify-between">
            <span className="truncate mr-2">
              {item.product.title}
              {item.variant ? ` (${item.variant.name})` : ''} x {item.quantity}
            </span>
            <span className="whitespace-nowrap">
              ${(Number(item.variant?.price ?? item.product.price) * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      <div className="border-t pt-2 space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>${totals.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping ({shipping?.name}):</span>
          <span>${totals.shippingCost.toFixed(2)}</span>
        </div>
        {giftWrap && (
          <div className="flex justify-between">
            <span>Gift Wrapping:</span>
            <span>$5.99</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Tax:</span>
          <span>${totals.tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
          <span>Total:</span>
          <span>${totals.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

function CheckoutForm() {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();

  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totals, setTotals] = useState({
    subtotal: 0,
    shippingCost: 5.99,
    tax: 0,
    total: 0,
    giftWrapCost: 0,
  });
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/addresses')
      .then((r) => r.json())
      .then((data) => {
        const addrs = data.addresses || data || [];
        setAddresses(addrs);
        const def = addrs.find((a: Address) => a.isDefault);
        if (def) setSelectedAddress(def.id);
        else if (addrs.length) setSelectedAddress(addrs[0].id);
      });
    fetch('/api/cart')
      .then((r) => r.json())
      .then((data) => {
        const items = (data.items || data.cart?.items || []).filter(
          (i: CartItem & { savedForLater?: boolean }) => !i.savedForLater
        );
        setCartItems(items);
      });
  }, []);

  useEffect(() => {
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + Number(item.variant?.price ?? item.product.price) * item.quantity;
    }, 0);
    const shippingCost = SHIPPING_METHODS.find((m) => m.id === shippingMethod)?.price ?? 5.99;
    const giftWrapCost = giftWrap ? 5.99 : 0;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = Math.round((subtotal + shippingCost + giftWrapCost + tax) * 100) / 100;
    setTotals({ subtotal, shippingCost, tax, total, giftWrapCost });
  }, [cartItems, shippingMethod, giftWrap]);

  const createPaymentIntent = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingAddressId: selectedAddress,
          shippingMethod,
          giftWrap,
          giftMessage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
      setTotals({
        subtotal: data.subtotal,
        shippingCost: data.shippingCost,
        tax: data.tax,
        total: data.total,
        giftWrapCost: giftWrap ? 5.99 : 0,
      });
      setStep(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Card element not found');

      const { error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });

      if (stripeError) throw new Error(stripeError.message || 'Payment failed');

      const res = await fetch('/api/checkout/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId,
          shippingAddressId: selectedAddress,
          shippingMethod,
          giftWrap,
          giftMessage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.push(`/checkout/confirmation?orderId=${data.order.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const selectedAddr = addresses.find((a) => a.id === selectedAddress);
  const selectedShipping = SHIPPING_METHODS.find((m) => m.id === shippingMethod)!;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <StepIndicator currentStep={step} />

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Select Shipping Address</h2>
              {addresses.length === 0 ? (
                <p>
                  No addresses found.{' '}
                  <a href="/account/addresses" className="text-blue-600 underline">
                    Add one
                  </a>
                </p>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`block p-4 border rounded-lg cursor-pointer transition ${
                        selectedAddress === addr.id
                          ? 'border-yellow-500 bg-yellow-50 shadow-sm'
                          : 'hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={addr.id}
                        checked={selectedAddress === addr.id}
                        onChange={() => setSelectedAddress(addr.id)}
                        className="mr-2"
                      />
                      <strong>{addr.name}</strong> — {addr.addressLine1}, {addr.city}, {addr.state}{' '}
                      {addr.zipCode}
                    </label>
                  ))}
                </div>
              )}
              <button
                onClick={() => setStep(2)}
                disabled={!selectedAddress}
                className="mt-6 bg-yellow-400 hover:bg-yellow-500 px-6 py-2 rounded font-semibold disabled:opacity-50"
              >
                Continue to Shipping
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Shipping Method</h2>
              <div className="space-y-3">
                {SHIPPING_METHODS.map((method) => (
                  <label
                    key={method.id}
                    className={`block p-4 border rounded-lg cursor-pointer transition ${
                      shippingMethod === method.id
                        ? 'border-yellow-500 bg-yellow-50 shadow-sm'
                        : 'hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      value={method.id}
                      checked={shippingMethod === method.id}
                      onChange={() => setShippingMethod(method.id)}
                      className="mr-2"
                    />
                    <strong>{method.name}</strong> — ${method.price.toFixed(2)} ({method.days})
                  </label>
                ))}
              </div>

              <div className="mt-6 p-4 border rounded-lg">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={giftWrap}
                    onChange={(e) => setGiftWrap(e.target.checked)}
                    className="mr-3 w-4 h-4"
                  />
                  <div>
                    <strong>🎁 Gift Wrapping</strong> — $5.99
                    <p className="text-sm text-gray-500">
                      Add premium gift wrapping with a personalized message
                    </p>
                  </div>
                </label>
                {giftWrap && (
                  <textarea
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    placeholder="Enter your gift message (optional)"
                    className="mt-3 w-full p-3 border rounded-lg text-sm"
                    rows={3}
                    maxLength={200}
                  />
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <button onClick={() => setStep(1)} className="px-6 py-2 border rounded hover:bg-gray-50">
                  Back
                </button>
                <button
                  onClick={createPaymentIntent}
                  disabled={loading}
                  className="bg-yellow-400 hover:bg-yellow-500 px-6 py-2 rounded font-semibold disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Continue to Payment'}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
              <div className="p-4 border rounded-lg">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#333',
                        '::placeholder': { color: '#aab7c4' },
                      },
                    },
                  }}
                />
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={() => setStep(2)} className="px-6 py-2 border rounded hover:bg-gray-50">
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="bg-yellow-400 hover:bg-yellow-500 px-6 py-2 rounded font-semibold"
                >
                  Review Order
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Review Your Order</h2>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">📍 Shipping Address</h3>
                  {selectedAddr && (
                    <p>
                      {selectedAddr.name}, {selectedAddr.addressLine1}, {selectedAddr.city},{' '}
                      {selectedAddr.state} {selectedAddr.zipCode}
                    </p>
                  )}
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">🚚 Shipping Method</h3>
                  <p>
                    {selectedShipping.name} — ${selectedShipping.price.toFixed(2)} (
                    {selectedShipping.days})
                  </p>
                </div>

                {giftWrap && (
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">🎁 Gift Wrapping</h3>
                    <p>Gift wrapping included ($5.99)</p>
                    {giftMessage && (
                      <p className="text-sm text-gray-600 mt-1">
                        Message: &quot;{giftMessage}&quot;
                      </p>
                    )}
                  </div>
                )}

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">📦 Items</h3>
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between py-1">
                      <span>
                        {item.product.title}{' '}
                        {item.variant ? `(${item.variant.name})` : ''} x {item.quantity}
                      </span>
                      <span>
                        $
                        {(Number(item.variant?.price ?? item.product.price) * item.quantity).toFixed(
                          2
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button onClick={() => setStep(3)} className="px-6 py-2 border rounded hover:bg-gray-50">
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="bg-yellow-400 hover:bg-yellow-500 px-8 py-3 rounded font-bold text-lg disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <OrderSummary
            cartItems={cartItems}
            shippingMethod={shippingMethod}
            giftWrap={giftWrap}
            totals={totals}
          />
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Elements stripe={getStripePromise()}>
      <CheckoutForm />
    </Elements>
  );
}
