import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VOLTA_MARKETS } from '../../data/seedData';
import { VehicleType, VoltaMarketId } from '../../types';
import { RealtimeOrderTrackerMap } from '../map/RealtimeOrderTrackerMap';
import { 
  Bike, 
  Award, 
  Star, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  ShieldCheck, 
  Key, 
  DollarSign, 
  Clock, 
  Plus, 
  X, 
  Send,
  AlertCircle,
  CreditCard,
  Wallet,
  RefreshCw,
  Zap
} from 'lucide-react';

export const RiderPortal: React.FC = () => {
  const { 
    riders, 
    orders, 
    reviews, 
    acceptOrderAsRider, 
    updateOrderStatus, 
    confirmDeliveryWithPin, 
    registerRider 
  } = useApp();

  const activeRider = riders[0]; // Active demo rider (Kewu Mawuli)

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [pinInput, setPinInput] = useState<{ [orderId: string]: string }>({});
  const [pinResult, setPinResult] = useState<{ [orderId: string]: string }>({});
  const [isCashingOut, setIsCashingOut] = useState(false);
  const [cashoutMsg, setCashoutMsg] = useState<string | null>(null);

  const handleRiderCashout = () => {
    setIsCashingOut(true);
    setCashoutMsg(null);
    setTimeout(() => {
      setIsCashingOut(false);
      setCashoutMsg(`Delivery Fee payout of ₵${(activeRider?.earningsGhs || 0).toFixed(2)} successfully sent to MTN MoMo Wallet (${activeRider?.phone || '0248881234'})!`);
      setTimeout(() => setCashoutMsg(null), 5000);
    }, 1500);
  };

  // Rider Registration Form state
  const [rName, setRName] = useState('');
  const [rPhone, setRPhone] = useState('');
  const [rGhanaCard, setRGhanaCard] = useState('');
  const [rMarket, setRMarket] = useState<VoltaMarketId>('akatsi');
  const [rVehicle, setRVehicle] = useState<VehicleType>('MOTORBIKE_OKADA');
  const [rPlate, setRPlate] = useState('VR-1234-25');
  const [rLocation, setRLocation] = useState('Akatsi Main Lorry Park');
  const [rPhoto, setRPhoto] = useState('https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300');

  // Broadcast orders open for claims
  const broadcastOrders = orders.filter(
    o => o.status === 'BROADCAST_PENDING'
  );

  // Active orders assigned to this rider
  const riderActiveOrders = orders.filter(
    o => o.riderId === activeRider?.id && o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
  );

  // Delivered history
  const riderCompletedOrders = orders.filter(
    o => o.riderId === activeRider?.id && o.status === 'DELIVERED'
  );

  // Reviews for this rider
  const riderReviews = reviews.filter(r => r.riderId === activeRider?.id);

  const handleClaimOrder = (orderId: string) => {
    if (!activeRider) return;
    const claimed = acceptOrderAsRider(orderId, activeRider.id);
    if (!claimed) {
      alert('Order was claimed by another rider or updated!');
    }
  };

  const handleVerifyDeliveryPin = (orderId: string) => {
    const code = pinInput[orderId] || '';
    const res = confirmDeliveryWithPin(orderId, code);
    setPinResult(prev => ({ ...prev, [orderId]: res.message }));
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerRider({
      name: rName,
      phone: rPhone,
      ghanaCardNo: rGhanaCard,
      passportPhoto: rPhoto,
      primaryMarket: rMarket,
      locationDetails: rLocation,
      vehicleType: rVehicle,
      vehiclePlate: rPlate
    });
    setShowRegisterModal(false);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Rider Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={activeRider?.passportPhoto}
              alt={activeRider?.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
            />
            {activeRider?.isTopRated && (
              <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-1 rounded-full shadow" title="Top Rated Rider">
                <Award className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">{activeRider?.name}</h2>
              {activeRider?.verified && (
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Ghana Card Verified
                </span>
              )}
            </div>
            
            <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
              <span>Card No: <strong className="font-mono text-slate-200">{activeRider?.ghanaCardNo}</strong></span>
              <span>•</span>
              <span>Vehicle: <strong className="text-amber-400">{activeRider?.vehicleType.replace(/_/g, ' ')} ({activeRider?.vehiclePlate})</strong></span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {activeRider?.isTopRated && (
            <div className="bg-amber-500/10 border border-amber-500/30 px-3.5 py-2 rounded-xl text-amber-300 text-xs font-bold flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Top Rated Rider Status (4.8+ ★)</span>
            </div>
          )}
          <button
            onClick={() => setShowRegisterModal(true)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700"
          >
            + Register New Rider
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-md">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Wallet Earnings</div>
            <div className="text-xl font-black text-white font-mono">₵{activeRider?.earningsGhs.toFixed(2)}</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-md">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Completed Jobs</div>
            <div className="text-xl font-black text-white font-mono">{activeRider?.totalDeliveries} Deliveries</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-md">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <Star className="w-6 h-6 fill-amber-400" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Average Customer Rating</div>
            <div className="text-xl font-black text-amber-400 font-mono flex items-center gap-1">
              {activeRider?.rating} <span className="text-xs text-slate-400 font-normal">({activeRider?.reviewCount} reviews)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Broadcast Feed ("First Rider to Accept Gets Job!") */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400 animate-pulse" /> Live Order Broadcast Feed
          </h3>
          <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            ⚡ First to Accept Gets Order!
          </span>
        </div>

        {broadcastOrders.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 space-y-2">
            <Bike className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="font-bold text-slate-300">No open order broadcasts in market right now</div>
            <p className="text-xs text-slate-500">
              When a customer places an order in Akatsi, Dabala, or Aflao, it pops up here instantly!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {broadcastOrders.map(ord => {
              const marketName = VOLTA_MARKETS.find(m => m.id === ord.marketId)?.name || ord.marketId;
              return (
                <div
                  key={ord.id}
                  className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-5 space-y-4 shadow-xl"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded uppercase">
                        {marketName}
                      </span>
                      <h4 className="font-extrabold text-white text-base mt-1">Order #{ord.orderCode}</h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{ord.items.length} item(s) from stall</p>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Rider Earnings</div>
                      <div className="text-xl font-black text-amber-400 font-mono">₵{ord.deliveryFeeGhs.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 text-xs">
                    <div><strong className="text-slate-400">Customer:</strong> {ord.customerName} ({ord.customerPhone})</div>
                    <div><strong className="text-slate-400">Delivery Address:</strong> {ord.deliveryAddress}</div>
                    <div><strong className="text-slate-400">GhanaPost GPS:</strong> <span className="text-emerald-400 font-mono">{ord.digitalAddress}</span></div>
                  </div>

                  <button
                    onClick={() => handleClaimOrder(ord.id)}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Bike className="w-4 h-4" />
                    <span>CLAIM ORDER NOW (First Come, First Served)</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Deliveries Assigned to this Rider */}
      {riderActiveOrders.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <Bike className="w-5 h-5 text-emerald-400" /> My Active Deliveries
          </h3>

          <div className="space-y-4">
            {riderActiveOrders.map(ord => (
              <div
                key={ord.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-bold text-amber-400 font-mono">Order #{ord.orderCode}</span>
                    <h4 className="font-bold text-white text-sm">Status: <span className="text-emerald-400">{ord.status.replace(/_/g, ' ')}</span></h4>
                  </div>
                  <a
                    href={`tel:${ord.customerPhone}`}
                    className="self-start px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call Customer ({ord.customerPhone})
                  </a>
                </div>

                {/* Progress Buttons */}
                <div className="flex flex-wrap gap-2 text-xs font-bold">
                  <button
                    onClick={() => updateOrderStatus(ord.id, 'PICKING_UP')}
                    className={`px-3 py-2 rounded-xl transition-all ${ord.status === 'PICKING_UP' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'}`}
                  >
                    1. At Trader Stall (Picking)
                  </button>
                  <button
                    onClick={() => updateOrderStatus(ord.id, 'IN_TRANSIT')}
                    className={`px-3 py-2 rounded-xl transition-all ${ord.status === 'IN_TRANSIT' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'}`}
                  >
                    2. On the Way (In Transit)
                  </button>
                </div>

                {/* Real-time Rider GPS Navigation Map */}
                <RealtimeOrderTrackerMap order={ord} />

                {/* PIN Verification Section */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-amber-400" /> Enter Customer's 4-Digit Delivery Confirmation PIN
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="Ask customer for 4-digit PIN e.g., 4821"
                      value={pinInput[ord.id] || ''}
                      onChange={e => setPinInput({ ...pinInput, [ord.id]: e.target.value })}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white tracking-widest text-center"
                    />
                    <button
                      onClick={() => handleVerifyDeliveryPin(ord.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow"
                    >
                      Verify PIN & Complete
                    </button>
                  </div>

                  {pinResult[ord.id] && (
                    <div className="p-2 bg-slate-900 text-amber-300 text-xs font-semibold rounded border border-slate-800">
                      {pinResult[ord.id]}
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rider Delivery Fee & MoMo Earnings Ledger Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
              <Wallet className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs uppercase font-bold text-slate-400">Rider Dispatch Wallet</div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>MTN Mobile Money</span>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  Ghana Card Verified
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Phone: <strong className="text-amber-400 font-mono">{activeRider?.phone || '0248881234'}</strong> • Primary Market: <span className="text-slate-200 capitalize">{activeRider?.primaryMarket}</span>
              </p>
            </div>
          </div>

          <div className="text-left md:text-right space-y-1 w-full md:w-auto">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Unwithdrawn Delivery Fees</div>
            <div className="text-2xl font-black text-amber-400 font-mono">₵{(activeRider?.earningsGhs || 0).toFixed(2)}</div>
            <button
              onClick={handleRiderCashout}
              disabled={isCashingOut || (activeRider?.earningsGhs || 0) === 0}
              className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isCashingOut ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Payout in Progress...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Withdraw Earnings to MoMo
                </>
              )}
            </button>
          </div>
        </div>

        {cashoutMsg && (
          <div className="bg-emerald-950/80 border border-emerald-500/50 p-3.5 rounded-xl text-xs text-emerald-300 font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{cashoutMsg}</span>
          </div>
        )}

        {/* Completed Delivery Fee History Table */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4" /> Completed Delivery Fee Earnings History
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3">Order #</th>
                  <th className="p-3">Customer & Location</th>
                  <th className="p-3">Payment Gateway</th>
                  <th className="p-3 text-right">Fee Earned (₵)</th>
                  <th className="p-3 text-right">Payout Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {riderCompletedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-500 italic">
                      No completed deliveries recorded yet. Claim an open order from the broadcast feed above!
                    </td>
                  </tr>
                ) : (
                  riderCompletedOrders.map(ord => (
                    <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-mono font-bold text-amber-400">Order #{ord.orderCode}</td>
                      <td className="p-3">
                        <div className="font-semibold text-white">{ord.customerName}</div>
                        <div className="text-[10px] text-slate-400">{ord.deliveryAddress}</div>
                      </td>
                      <td className="p-3 font-mono text-[10px] text-slate-300">
                        {ord.paymentMethod.replace(/_/g, ' ')}
                      </td>
                      <td className="p-3 text-right font-mono font-black text-emerald-400">
                        ₵{ord.deliveryFeeGhs.toFixed(2)}
                      </td>
                      <td className="p-3 text-right">
                        <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Paid to MoMo
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Customer Ratings & Written Reviews for Rider */}
      <div className="space-y-4">
        <h3 className="font-bold text-white text-lg flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> Rider Reviews & Rating Records
        </h3>

        {riderReviews.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-500 text-xs">
            No customer written reviews recorded yet. Deliver orders to receive 1-5 star ratings!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {riderReviews.map(rev => (
              <div key={rev.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white text-xs">{rev.customerName}</div>
                  <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {rev.rating} Stars
                  </div>
                </div>
                <p className="text-xs text-slate-300 italic">"{rev.comment}"</p>
                <div className="text-[10px] text-slate-500">{new Date(rev.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Register Rider Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-white text-base">Rider Registration Form</h3>
              <button onClick={() => setShowRegisterModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kewu Mawuli"
                  value={rName}
                  onChange={e => setRName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Ghana Card Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GHA-728193810-4"
                  value={rGhanaCard}
                  onChange={e => setRGhanaCard(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Vehicle Type</label>
                  <select
                    value={rVehicle}
                    onChange={e => setRVehicle(e.target.value as VehicleType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="MOTORBIKE_OKADA">Okada Motorbike</option>
                    <option value="TRICYCLE_ABOBOYAA">Aboboyaa Tricycle</option>
                    <option value="BICYCLE">Bicycle</option>
                    <option value="VAN">Delivery Van</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Plate Number</label>
                  <input
                    type="text"
                    required
                    placeholder="VR-2481-24"
                    value={rPlate}
                    onChange={e => setRPlate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Primary Market Hub</label>
                <select
                  value={rMarket}
                  onChange={e => setRMarket(e.target.value as VoltaMarketId)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                >
                  {VOLTA_MARKETS.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="+233 24 123 4567"
                  value={rPhone}
                  onChange={e => setRPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow mt-2"
              >
                Submit & Verify Rider Profile
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
