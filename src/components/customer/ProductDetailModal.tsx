import React, { useState } from 'react';
import { Product, VoltaMarket } from '../../types';
import { VOLTA_MARKETS } from '../../data/seedData';
import { ProductDeliveryTrace } from '../common/ProductDeliveryTrace';
import { 
  X, 
  MapPin, 
  Store, 
  Star, 
  ShoppingBag, 
  Check, 
  Info, 
  Tag, 
  ShieldCheck, 
  Building2, 
  Flame, 
  Sparkles,
  PhoneCall
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const marketObj: VoltaMarket | undefined = VOLTA_MARKETS.find(m => m.id === product.marketId);

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-slate-950/70 hover:bg-slate-950 text-slate-300 hover:text-white rounded-full border border-slate-800 transition-all"
          title="Close product view"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Hero Image */}
        <div className="relative h-64 sm:h-72 bg-slate-950 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

          {/* Badges Overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500 text-slate-950 font-black text-xs px-3 py-1 rounded-lg flex items-center gap-1 shadow-lg">
                <MapPin className="w-3.5 h-3.5" />
                {marketObj?.name || product.marketId}
              </span>
              <span className="bg-slate-950/80 backdrop-blur text-emerald-400 font-bold text-xs px-2.5 py-1 rounded-lg border border-slate-800">
                {product.category}
              </span>
            </div>

            <div className="bg-slate-950/80 backdrop-blur text-amber-300 font-extrabold text-xs px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{product.rating}</span>
              <span className="text-slate-500 font-normal">({product.salesCount} sold)</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Title & Price */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {product.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <Store className="w-4 h-4 text-emerald-400" />
                Trader: <strong className="text-slate-200">{product.traderName}</strong>
              </p>
            </div>

            <div className="sm:text-right flex-shrink-0">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Unit Price</div>
              <div className="text-2xl font-black text-amber-400">
                ₵{product.priceGhs.toFixed(2)}
              </div>
              <div className="text-[11px] text-slate-400 font-medium">{product.unit}</div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-400" /> Item Overview
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
              {product.description}
            </p>
          </div>

          {/* Market Place Location & Market Function Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Stall Location in Market */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-amber-400" /> Stall Location in Market
              </div>
              <div className="text-xs font-bold text-white">
                {product.stallLocation || 'Central Trader Alley Stall'}
              </div>
              <p className="text-[11px] text-slate-400">
                {marketObj?.markerLocationName || 'Volta Region Market Hub'}
              </p>
            </div>

            {/* Item Function / Culinary & Trade Purpose */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Market Function & Usage
              </div>
              <div className="text-xs font-semibold text-emerald-300">
                {product.itemFunction || 'Authentic Volta local food staple & craft item'}
              </div>
              <p className="text-[11px] text-slate-400">
                Market Specialization: <span className="text-slate-300">{marketObj?.specialization}</span>
              </p>
            </div>

          </div>

          {/* Product -> Market -> Town -> Available Riders Trace Flow */}
          <ProductDeliveryTrace productName={product.name} marketId={product.marketId} />

          {/* Quantity Selector & Add to Cart Action */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
            
            {/* Quantity Control */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs text-slate-400 font-semibold">Quantity:</span>
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors flex items-center justify-center"
                >
                  -
                </button>
                <span className="w-10 text-center text-sm font-black text-amber-400">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAdd}
              disabled={added}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-xl ${
                added
                  ? 'bg-emerald-500 text-white'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-5 h-5" /> Added to Order Cart!
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" /> Add {quantity} to Cart (₵{(product.priceGhs * quantity).toFixed(2)})
                </>
              )}
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};
