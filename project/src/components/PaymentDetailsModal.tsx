import { X, CreditCard } from 'lucide-react';
import { useState } from 'react';
import { Payment } from '../types/database';

interface PaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderAmount: number;
  onPaymentSuccess: (payment: Payment) => void;
}

export function PaymentDetailsModal({
  isOpen,
  onClose,
  orderId,
  orderAmount,
  onPaymentSuccess,
}: PaymentDetailsModalProps) {
  const [paymentMode, setPaymentMode] = useState<
    'credit_card' | 'debit_card' | 'upi' | 'net_banking' | 'cash_on_delivery'
  >('credit_card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
  });
  const [loading, setLoading] = useState(false);

  async function handlePayment() {
    setLoading(true);

    const payment: Payment = {
      payment_id: `PAY-${Date.now()}`,
      order_id: orderId,
      customer_id: '',
      payment_mode: paymentMode,
      payment_date: new Date().toISOString(),
      amount: orderAmount,
      status: 'completed',
      created_at: new Date().toISOString(),
    };

    setTimeout(() => {
      onPaymentSuccess(payment);
      setLoading(false);
      onClose();
    }, 1000);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg">
            <p className="text-sm text-orange-100 mb-1">Order Total</p>
            <p className="text-3xl font-bold">₹{orderAmount.toFixed(2)}</p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 block">
              Payment Method
            </label>
            {[
              { value: 'credit_card' as const, label: 'Credit Card' },
              { value: 'debit_card' as const, label: 'Debit Card' },
              { value: 'upi' as const, label: 'UPI' },
              { value: 'net_banking' as const, label: 'Net Banking' },
              { value: 'cash_on_delivery' as const, label: 'Cash on Delivery' },
            ].map((method) => (
              <label key={method.value} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  value={method.value}
                  checked={paymentMode === method.value}
                  onChange={(e) =>
                    setPaymentMode(e.target.value as typeof paymentMode)
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">
                  {method.label}
                </span>
              </label>
            ))}
          </div>

          {paymentMode !== 'cash_on_delivery' &&
            paymentMode !== 'upi' &&
            paymentMode !== 'net_banking' && (
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardDetails.cardName}
                    onChange={(e) =>
                      setCardDetails({
                        ...cardDetails,
                        cardName: e.target.value,
                      })
                    }
                    placeholder="John Doe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardDetails.cardNumber}
                    onChange={(e) =>
                      setCardDetails({
                        ...cardDetails,
                        cardNumber: e.target.value.replace(/\s/g, '').slice(0, 16),
                      })
                    }
                    placeholder="1234 5678 9012 3456"
                    maxLength={16}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Expiry (MM/YY)
                    </label>
                    <input
                      type="text"
                      value={cardDetails.expiry}
                      onChange={(e) =>
                        setCardDetails({
                          ...cardDetails,
                          expiry: e.target.value.slice(0, 5),
                        })
                      }
                      placeholder="12/25"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={cardDetails.cvv}
                      onChange={(e) =>
                        setCardDetails({
                          ...cardDetails,
                          cvv: e.target.value.slice(0, 3),
                        })
                      }
                      placeholder="123"
                      maxLength={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 font-medium"
          >
            <CreditCard className="w-5 h-5" />
            <span>{loading ? 'Processing...' : 'Complete Payment'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
