import React from 'react';
import { useApp } from '../../context/AppContext';
import { VOLTA_MARKETS } from '../../data/seedData';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, X, Truck, ShieldAlert } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { 
    cart, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart, 
    activeModal, 
    setActiveModal 
  } = useApp();

  if (activeModal !== 'CART') return null;

  const subtotalGhs = cart.reduce((acc, item) => acc + item.product.priceGhs * item.quantity, 0);
  const uniqueMarkets = Array.from(new Set(cart.map(item => item.product.marketId)));
  const deliveryFeeGhs = cart.length > 0 ? 12.0 + (uniqueMarkets.length - 1) * 6.0 : 0;
  const totalGhs = subtotalGhs + deliveryFeeGhs;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">Your Flash Cart Basket</h3>
            <span className="text-xs text-slate-400 font-mono">({cart.length} items)</span>
          </div>
          <button
            onClick={() => setActiveModal('NONE')}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-20 text-slate-500 space-y-3">
              <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="font-semibold text-slate-300">Your basket is empty</p>
              <p className="text-xs text-slate-500">
                Browse Volta market stalls (Akatsi Gari, Dabala Tilapia, Kente) to add produce!
              </p>
              <button
                onClick={() => setActiveModal('NONE')}
                className="mt-2 px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl"
              >
                Browse Stalls
              </button>
            </div>
          ) : (
            cart.map(item => {
              const marketName = VOLTA_MARKETS.find(m => m.id === item.product.marketId)?.name || item.product.marketId;
              return (
                <div
                  key={item.product.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex gap-3 items-center justify-between"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-lg object-cover bg-slate-900 flex-shrink-0"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-amber-400 font-bold uppercase">{marketName}</div>
                    <h4 className="font-bold text-white text-xs truncate">{item.product.name}</h4>
                    <div className="text-xs text-slate-400 mt-0.5 font-medium">
                      ₵{item.product.priceGhs.toFixed(2)} / {item.product.unit}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold text-white text-xs px-1 font-mono">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Total & Delete */}
                  <div className="text-right flex flex-col justify-between items-end h-full">
                    <div className="font-extrabold text-amber-400 text-sm font-mono">
                      ₵{(item.product.priceGhs * item.quantity).toFixed(2)}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 mt-2"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary & Checkout Trigger */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-slate-800 bg-slate-950 space-y-3">
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Items Subtotal:</span>
                <span className="font-semibold text-white font-mono">₵{subtotalGhs.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Volta Dispatch Delivery Fee:</span>
                <span className="font-semibold text-emerald-400 font-mono">₵{deliveryFeeGhs.toFixed(2)}</span>
              </div>
              {uniqueMarkets.length > 1 && (
                <div className="text-[10px] text-amber-400 bg-amber-500/10 p-1.5 rounded border border-amber-500/20 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 flex-shrink-0" />
                  <span>Multi-market order: Products picked from {uniqueMarkets.length} market hubs.</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800">
                <span>Total Amount:</span>
                <span className="text-amber-400 font-mono">₵{totalGhs.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={clearCart}
                className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Clear
              </button>
              <button
                onClick={() => setActiveModal('CHECKOUT')}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
