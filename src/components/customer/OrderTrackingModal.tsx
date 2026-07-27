import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VOLTA_MARKETS } from '../../data/seedData';
import { OrderStatus } from '../../types';
import { RealtimeOrderTrackerMap } from '../map/RealtimeOrderTrackerMap';
import { 
  X, 
  Truck, 
  MapPin, 
  Phone, 
  Star, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Key, 
  Award, 
  MessageSquare, 
  Send 
} from 'lucide-react';

export const OrderTrackingModal: React.FC = () => {
  const { 
    orders, 
    trackingOrderId, 
    activeModal, 
    setActiveModal, 
    riders, 
    confirmDeliveryWithPin, 
    submitReview 
  } = useApp();

  const [pinInput, setPinInput] = useState('');
  const [pinMessage, setPinMessage] = useState<{ success: boolean; text: string } | null>(null);

  // Review Form state
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  if (activeModal !== 'TRACKING' || !trackingOrderId) return null;

  const order = orders.find(o => o.id === trackingOrderId);
  if (!order) return null;

  const assignedRider = order.riderId ? riders.find(r => r.id === order.riderId) : null;
  const marketObj = VOLTA_MARKETS.find(m => m.id === order.marketId);

  const steps: { status: OrderStatus; label: string; desc: string }[] = [
    { status: 'BROADCAST_PENDING', label: 'Broadcast Sent', desc: 'Alert sent to nearby riders in market' },
    { status: 'ACCEPTED_BY_RIDER', label: 'Rider Accepted', desc: 'Rider claimed job and heading to stall' },
    { status: 'PICKING_UP', label: 'Goods Pickup', desc: 'Rider inspecting & picking produce' },
    { status: 'IN_TRANSIT', label: 'En Route', desc: 'Rider navigating to digital GPS location' },
    { status: 'DELIVERED', label: 'Delivered', desc: 'PIN verified & payment released' },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'BROADCAST_PENDING': return 0;
      case 'ACCEPTED_BY_RIDER': return 1;
      case 'PICKING_UP': return 2;
      case 'IN_TRANSIT': return 3;
      case 'DELIVERED': return 4;
      default: return 0;
    }
  };

  const currentStepIndex = getStepIndex(order.status);

  const handleVerifyPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = confirmDeliveryWithPin(order.id, pinInput);
    setPinMessage({ success: res.success, text: res.message });
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignedRider) return;
    submitReview(order.id, assignedRider.id, rating, comment);
    setReviewSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-white text-base">Order Dispatch Progress</h3>
              <p className="text-[11px] text-slate-400 font-mono">
                #{order.orderCode} • {marketObj?.name || 'Volta Market'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal('NONE')}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6">
          
          {/* Order Status Progress Line */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="text-xs font-bold uppercase text-slate-400 mb-3">Live Dispatch Flow</div>
            <div className="grid grid-cols-5 gap-1 text-center">
              {steps.map((step, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                return (
                  <div key={step.status} className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border ${
                        isCurrent
                          ? 'bg-amber-500 text-slate-950 border-amber-300 ring-2 ring-amber-400/40'
                          : isPassed
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-slate-900 text-slate-600 border-slate-800'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span className={`text-[10px] font-semibold mt-1.5 line-clamp-1 ${isPassed ? 'text-white' : 'text-slate-500'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-Time Interactive Order Dispatch GPS Tracker Map */}
          <RealtimeOrderTrackerMap order={order} />

          {/* Assigned Rider Information Card */}
          {assignedRider ? (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase text-amber-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Assigned Volta Rider
                </div>
                {assignedRider.isTopRated && (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Award className="w-3 h-3 text-amber-400" /> Top Rated Rider
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={assignedRider.passportPhoto}
                  alt={assignedRider.name}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-700"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-white text-sm">{assignedRider.name}</h4>
                  <p className="text-xs text-slate-400">{assignedRider.vehicleType.replace(/_/g, ' ')} ({assignedRider.vehiclePlate})</p>
                  <div className="flex items-center gap-2 mt-1 text-xs">
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {assignedRider.rating}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">{assignedRider.totalDeliveries} Completed Deliveries</span>
                  </div>
                </div>

                <a
                  href={`tel:${assignedRider.phone}`}
                  className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow transition-colors flex items-center gap-1 text-xs font-bold"
                >
                  <Phone className="w-4 h-4" /> Call
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center space-y-2">
              <Clock className="w-8 h-8 text-amber-400 mx-auto animate-spin" />
              <div className="font-bold text-amber-300 text-sm">Broadcasting Order to Nearby Riders...</div>
              <p className="text-xs text-slate-300">
                In Volta Region, the <strong>first rider to accept</strong> claims the delivery! Stay on this screen.
              </p>
            </div>
          )}

          {/* Delivery Confirmation PIN Block */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase text-slate-300 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-amber-400" /> Delivery Confirmation Code
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold">GhanaPost GPS: {order.digitalAddress}</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-center space-y-1">
              <div className="text-[11px] text-slate-400">Share this code with your rider when goods arrive:</div>
              <div className="text-3xl font-black text-amber-400 font-mono tracking-widest">{order.deliveryPin}</div>
            </div>

            {/* Manual PIN Verification form (can also be triggered by customer directly or rider) */}
            {order.status !== 'DELIVERED' && (
              <form onSubmit={handleVerifyPinSubmit} className="pt-2 flex gap-2">
                <input
                  type="text"
                  maxLength={4}
                  placeholder="Enter 4-digit PIN to confirm receipt"
                  value={pinInput}
                  onChange={e => setPinInput(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white text-center tracking-widest focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow"
                >
                  Confirm Delivery
                </button>
              </form>
            )}

            {pinMessage && (
              <div className={`p-2.5 rounded-lg text-xs font-semibold ${pinMessage.success ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                {pinMessage.text}
              </div>
            )}
          </div>

          {/* Item Details */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase text-slate-400">Items Ordered</div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl divide-y divide-slate-800">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-3 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold text-white">{item.productName}</div>
                    <div className="text-[10px] text-slate-400">Qty: {item.quantity} ({item.unit}) • Stall: {item.traderName}</div>
                  </div>
                  <div className="font-mono font-bold text-amber-400">
                    ₵{(item.priceGhs * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Post Delivery Rider Rating & Written Review */}
          {order.status === 'DELIVERED' && assignedRider && (
            <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-emerald-500/10 border border-amber-500/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  Rate Rider {assignedRider.name}
                </h4>
                <span className="text-[10px] text-slate-400">Help select Top Rated Riders</span>
              </div>

              {reviewSubmitted ? (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs font-semibold text-center">
                  Thank you! Your 1–5 star review and rating have been recorded.
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-300 font-semibold">Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`p-1 rounded hover:scale-110 transition-transform ${
                            rating >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                          }`}
                        >
                          <Star className="w-5 h-5 fill-current" />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-amber-300 font-mono">({rating} Stars)</span>
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Write a review e.g., Fast delivery to Akatsi, very friendly rider..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />

                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2.5 rounded-xl shadow flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> Submit Rider Review & Rating
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
