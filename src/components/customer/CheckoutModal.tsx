import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod } from '../../types';
import { MoMoQRCodeGenerator } from './MoMoQRCodeGenerator';
import { 
  X, 
  MapPin, 
  Smartphone, 
  ShieldCheck, 
  CreditCard, 
  Banknote, 
  CheckCircle2, 
  Truck, 
  Lock,
  QrCode,
  Copy,
  Check,
  RefreshCw,
  ScanLine,
  Sparkles
} from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const { 
    cart, 
    customer, 
    placeOrder, 
    activeModal, 
    setActiveModal, 
    setTrackingOrderId 
  } = useApp();

  const [digitalAddress, setDigitalAddress] = useState(customer.digitalAddress || 'VR-0412-8821');
  const [deliveryAddress, setDeliveryAddress] = useState(customer.deliveryAddress || 'House #14, Near Akatsi Lorry Station');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('MTN_MOMO');
  const [momoNumber, setMomoNumber] = useState(customer.momoNumber || '0248881234');
  const [paymentMode, setPaymentMode] = useState<'PUSH' | 'QR_SCAN'>('PUSH');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCreated, setOrderCreated] = useState<any | null>(null);

  if (activeModal !== 'CHECKOUT') return null;

  const subtotalGhs = cart.reduce((acc, item) => acc + item.product.priceGhs * item.quantity, 0);
  const uniqueMarkets = Array.from(new Set(cart.map(item => item.product.marketId)));
  const deliveryFeeGhs = 12.0 + (uniqueMarkets.length - 1) * 6.0;
  const totalGhs = subtotalGhs + deliveryFeeGhs;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const newOrd = placeOrder({
        deliveryAddress,
        digitalAddress,
        paymentMethod,
        momoNumber
      });

      setIsSubmitting(false);
      if (newOrd) {
        setOrderCreated(newOrd);
      }
    }, 1200);
  };

  const paymentOptions: { id: PaymentMethod; label: string; icon: React.ReactNode; badge: string }[] = [
    { id: 'MTN_MOMO', label: 'MTN MoMo', icon: <Smartphone className="w-4 h-4 text-amber-400" />, badge: 'Instant Prompt' },
    { id: 'TELECEL_CASH', label: 'Telecel Cash', icon: <Smartphone className="w-4 h-4 text-rose-400" />, badge: 'Instant Prompt' },
    { id: 'AT_MONEY', label: 'AT Money', icon: <Smartphone className="w-4 h-4 text-sky-400" />, badge: 'Instant Prompt' },
    { id: 'CARD', label: 'Debit/Credit Card', icon: <CreditCard className="w-4 h-4 text-emerald-400" />, badge: 'Visa/Mastercard' },
    { id: 'COD', label: 'Cash on Delivery', icon: <Banknote className="w-4 h-4 text-amber-300" />, badge: 'Pay Rider' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">Secure Flash Cart Checkout</h3>
          </div>
          <button
            onClick={() => { setActiveModal('NONE'); setOrderCreated(null); }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form or Order Success Screen */}
        <div className="p-5 overflow-y-auto space-y-5">
          
          {orderCreated ? (
            /* Success State */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-xl font-extrabold text-white">Order Placed Successfully!</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Order Code: <strong className="text-amber-400 font-mono text-sm">{orderCreated.orderCode}</strong>
                </p>
              </div>

              {/* Delivery PIN Highlight */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 space-y-1">
                <div className="text-xs font-semibold text-amber-300">Your 4-Digit Rider Delivery Confirmation PIN</div>
                <div className="text-3xl font-black text-amber-400 font-mono tracking-widest">
                  {orderCreated.deliveryPin}
                </div>
                <p className="text-[11px] text-slate-300">
                  Provide this PIN to your assigned rider upon receiving your goods to release payment.
                </p>
              </div>

              <div className="text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800 text-left space-y-1 font-mono">
                <div>Delivery To: <span className="text-white">{orderCreated.deliveryAddress}</span></div>
                <div>Digital GPS: <span className="text-emerald-400">{orderCreated.digitalAddress}</span></div>
                <div>Total Paid: <span className="text-amber-400 font-bold">₵{orderCreated.totalGhs.toFixed(2)}</span></div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => {
                    setTrackingOrderId(orderCreated.id);
                    setActiveModal('TRACKING');
                    setOrderCreated(null);
                  }}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl shadow-lg text-xs flex items-center justify-center gap-2"
                >
                  <Truck className="w-4 h-4" />
                  <span>Open Live Rider Dispatch Tracker</span>
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleCheckoutSubmit} className="space-y-5">
              
              {/* Order Summary Box */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <div className="text-slate-400">Paying for {cart.length} produce item(s)</div>
                  <div className="text-white font-bold text-sm">Ghana Volta Regional Dispatch</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Total</div>
                  <div className="text-amber-400 font-black text-lg font-mono">₵{totalGhs.toFixed(2)}</div>
                </div>
              </div>

              {/* Delivery Address & GhanaPost Digital Address */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> Delivery Location Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      GhanaPost Digital Address
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. VR-0412-8821"
                      value={digitalAddress}
                      onChange={e => setDigitalAddress(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Recipient Phone
                    </label>
                    <input
                      type="text"
                      required
                      value={momoNumber}
                      onChange={e => setMomoNumber(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Street Address / Landmark
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="House number, landmark e.g., Opposite Akatsi Main Lorry Park"
                    value={deliveryAddress}
                    onChange={e => setDeliveryAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" /> Select Ghana Payment Gateway
                  </h4>

                  {['MTN_MOMO', 'TELECEL_CASH', 'AT_MONEY'].includes(paymentMethod) && (
                    <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setPaymentMode('PUSH')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          paymentMode === 'PUSH'
                            ? 'bg-amber-500 text-slate-950'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Push Prompt
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMode('QR_SCAN')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                          paymentMode === 'QR_SCAN'
                            ? 'bg-amber-500 text-slate-950'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <QrCode className="w-3 h-3" /> Scan QR
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {paymentOptions.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPaymentMethod(p.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                        paymentMethod === p.id
                          ? 'bg-amber-500/10 border-amber-400 text-white font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {p.icon}
                        <div>
                          <div className="text-xs font-semibold text-white">{p.label}</div>
                          <div className="text-[10px] text-slate-500">{p.badge}</div>
                        </div>
                      </div>
                      {paymentMethod === p.id && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Render Mobile Money Scan QR Generator or Push Prompt / Submit */}
              {['MTN_MOMO', 'TELECEL_CASH', 'AT_MONEY'].includes(paymentMethod) && paymentMode === 'QR_SCAN' ? (
                <MoMoQRCodeGenerator
                  paymentMethod={paymentMethod}
                  amountGhs={totalGhs}
                  customerPhone={momoNumber}
                  onPaymentApproved={() => {
                    setIsSubmitting(true);
                    setTimeout(() => {
                      const newOrd = placeOrder({
                        deliveryAddress,
                        digitalAddress,
                        paymentMethod,
                        momoNumber
                      });
                      setIsSubmitting(false);
                      if (newOrd) {
                        setOrderCreated(newOrd);
                      }
                    }, 500);
                  }}
                />
              ) : (
                /* Submit Button for Standard Push Prompt / Card / COD */
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm py-3 rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Processing Payment Prompt...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Confirm Order & Broadcast to Nearby Riders (₵{totalGhs.toFixed(2)})</span>
                    </>
                  )}
                </button>
              )}

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
