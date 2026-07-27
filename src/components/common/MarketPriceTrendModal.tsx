import React from 'react';
import { useApp } from '../../context/AppContext';
import { MarketPriceTrendVisualizer } from './MarketPriceTrendVisualizer';
import { X, TrendingUp } from 'lucide-react';

export const MarketPriceTrendModal: React.FC = () => {
  const { activeModal, setActiveModal } = useApp();

  if (activeModal !== 'PRICE_TRENDS') return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl space-y-0 my-auto relative max-h-[92vh] flex flex-col">
        
        {/* Sticky Close Header */}
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between z-10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm sm:text-base flex items-center gap-2">
                Essential Goods Market Price Trend (30 Days)
              </h3>
              <p className="text-xs text-slate-400">
                Data derived from historical customer orders across Volta Region market hubs
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal('NONE')}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-colors"
            title="Close Price Trends"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Visualizer Body */}
        <div className="overflow-y-auto p-2 sm:p-4 flex-1">
          <MarketPriceTrendVisualizer />
        </div>

      </div>

    </div>
  );
};
