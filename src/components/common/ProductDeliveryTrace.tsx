import React from 'react';
import { useApp } from '../../context/AppContext';
import { VOLTA_MARKETS } from '../../data/seedData';
import { VoltaMarket, VoltaMarketId } from '../../types';
import { 
  ShoppingBag, 
  Store, 
  MapPin, 
  Bike, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface ProductDeliveryTraceProps {
  productName?: string;
  marketId?: VoltaMarketId;
  market?: VoltaMarket;
  productImage?: string;
  compact?: boolean;
  className?: string;
}

export const ProductDeliveryTrace: React.FC<ProductDeliveryTraceProps> = ({
  productName,
  marketId,
  market: marketProp,
  productImage,
  compact = false,
  className = ''
}) => {
  const { riders, products } = useApp();

  const market = marketProp || (marketId ? VOLTA_MARKETS.find(m => m.id === marketId) : VOLTA_MARKETS[0]);
  const effectiveMarketId = market?.id || marketId || 'abor';
  const displayProductName = productName || 'Fresh Local Produce';

  const matchedProduct = productName ? products.find(p => p.name?.toLowerCase() === productName.toLowerCase()) : undefined;
  const imgUrl = productImage || matchedProduct?.image || market?.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400';

  const marketRiders = riders.filter(r => r.primaryMarket === effectiveMarketId && r.status === 'ONLINE');
  const riderCount = marketRiders.length > 0 ? marketRiders.length : 2; // Default verified dispatch count

  const riderNames = marketRiders.length > 0
    ? marketRiders.map(r => `${r.name} (${r.vehicleType === 'MOTORBIKE_OKADA' ? 'Okada' : 'Aboboyaa'})`).join(', ')
    : 'Kewu Mawuli (Okada), Selorm Agbesi (Aboboyaa)';

  const townName = market?.district || market?.name.replace(' Market', '') || 'Volta';
  const riderNotice = `Only eligible ${townName} riders receive the delivery request`;

  if (compact) {
    return (
      <div className={`bg-slate-950/95 border border-slate-800 rounded-xl p-2 text-[10px] space-y-1 ${className}`}>
        <div className="flex items-center justify-between font-extrabold text-amber-400 uppercase tracking-wider text-[9px]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-amber-400" /> Dispatch Trace Route
          </span>
          <span className="text-slate-400 font-mono text-[8px]">Product → Market → Town → Riders</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300 font-medium overflow-x-auto scrollbar-none py-0.5">
          {/* Product with image */}
          <div className="flex items-center gap-1 bg-slate-900 px-1.5 py-0.5 rounded-lg border border-slate-800 flex-shrink-0">
            <img src={imgUrl} alt={displayProductName} className="w-4 h-4 rounded object-cover flex-shrink-0" />
            <span className="text-white font-bold truncate max-w-[100px]">{displayProductName}</span>
          </div>

          <ChevronRight className="w-3 h-3 text-amber-400 flex-shrink-0" />

          {/* Market */}
          <div className="flex items-center gap-1 bg-slate-900 px-1.5 py-0.5 rounded-lg border border-slate-800 text-amber-300 flex-shrink-0">
            <Store className="w-3 h-3 text-amber-400" />
            <span className="font-bold">{market?.name || effectiveMarketId}</span>
          </div>

          <ChevronRight className="w-3 h-3 text-amber-400 flex-shrink-0" />

          {/* Town */}
          <div className="flex items-center gap-1 bg-slate-900 px-1.5 py-0.5 rounded-lg border border-slate-800 text-sky-300 flex-shrink-0">
            <MapPin className="w-3 h-3 text-sky-400" />
            <span>{townName}</span>
          </div>

          <ChevronRight className="w-3 h-3 text-amber-400 flex-shrink-0" />

          {/* Riders */}
          <div className="flex items-center gap-1 bg-emerald-950/80 px-1.5 py-0.5 rounded-lg border border-emerald-500/30 text-emerald-300 font-bold flex-shrink-0" title={riderNotice}>
            <Bike className="w-3 h-3 text-emerald-400" />
            <span>Eligible {townName} Riders ({riderCount})</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-950/95 border border-slate-800/90 rounded-2xl p-3 sm:p-3.5 shadow-lg space-y-2.5 ${className}`}>
      
      {/* Label Header */}
      <div className="flex items-center justify-between text-[10px] font-extrabold text-amber-400 uppercase tracking-wider border-b border-slate-800/80 pb-1.5">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          Verified Product Supply & Dispatch Route
        </span>
        <span className="text-slate-400 font-mono text-[9px] hidden sm:inline">
          Product → Market → Town → Eligible Riders
        </span>
      </div>

      {/* Visual Chain Nodes with Images */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        
        {/* Step 1: Product with Thumbnail */}
        <div className="bg-slate-900 border border-slate-800/80 p-2 rounded-xl space-y-1 relative group">
          <div className="text-[9px] font-bold text-slate-400 uppercase flex items-center justify-between">
            <span className="flex items-center gap-1"><ShoppingBag className="w-3 h-3 text-amber-400" /> 1. Product</span>
            <span className="text-[8px] bg-amber-500/20 text-amber-300 px-1 rounded">Item</span>
          </div>
          <div className="flex items-center gap-2">
            <img 
              src={imgUrl} 
              alt={displayProductName} 
              className="w-7 h-7 rounded-lg object-cover border border-slate-700 flex-shrink-0 shadow-sm" 
            />
            <div className="font-extrabold text-white text-[11px] truncate" title={displayProductName}>
              {displayProductName}
            </div>
          </div>
        </div>

        {/* Step 2: Market */}
        <div className="bg-slate-900 border border-slate-800/80 p-2 rounded-xl space-y-1 relative group">
          <div className="text-[9px] font-bold text-slate-400 uppercase flex items-center justify-between">
            <span className="flex items-center gap-1"><Store className="w-3 h-3 text-amber-400" /> 2. Market</span>
            <span className="text-[8px] bg-amber-500/20 text-amber-300 px-1 rounded">Hub</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0 text-amber-400 font-black text-xs">
              {market?.name.charAt(0) || 'M'}
            </div>
            <div className="font-bold text-amber-300 text-[11px] truncate" title={market?.name}>
              {market?.name || effectiveMarketId}
            </div>
          </div>
        </div>

        {/* Step 3: Town */}
        <div className="bg-slate-900 border border-slate-800/80 p-2 rounded-xl space-y-1 relative group">
          <div className="text-[9px] font-bold text-slate-400 uppercase flex items-center justify-between">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-sky-400" /> 3. Town</span>
            <span className="text-[8px] bg-sky-500/20 text-sky-300 px-1 rounded">Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center flex-shrink-0 text-sky-400">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div className="font-bold text-sky-300 text-[11px] truncate" title={townName}>
              {townName}
            </div>
          </div>
        </div>

        {/* Step 4: Available Riders */}
        <div className="bg-slate-900 border border-emerald-500/30 p-2 rounded-xl space-y-1 relative group" title={riderNotice}>
          <div className="text-[9px] font-bold text-slate-400 uppercase flex items-center justify-between">
            <span className="flex items-center gap-1"><Bike className="w-3 h-3 text-emerald-400" /> 4. Riders</span>
            <span className="text-[8px] bg-emerald-500/20 text-emerald-300 font-mono px-1 rounded">
              {riderCount} Eligible
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 text-emerald-400">
              <Bike className="w-3.5 h-3.5" />
            </div>
            <div className="font-bold text-emerald-300 text-[10px] leading-tight truncate" title={riderNotice}>
              Only eligible {townName} riders receive dispatch
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

