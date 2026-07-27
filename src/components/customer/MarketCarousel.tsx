import React, { useState, useEffect, useRef } from 'react';
import { VOLTA_MARKETS } from '../../data/seedData';
import { VoltaMarket } from '../../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Building2, 
  Sparkles, 
  Calendar, 
  ShoppingBag, 
  Play, 
  Pause,
  Store,
  Tag
} from 'lucide-react';

interface MarketCarouselProps {
  selectedMarket: string;
  onSelectMarket: (marketId: string) => void;
}

export const MarketCarousel: React.FC<MarketCarouselProps> = ({
  selectedMarket,
  onSelectMarket,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync index if user selects market from external buttons
  useEffect(() => {
    if (selectedMarket !== 'ALL') {
      const idx = VOLTA_MARKETS.findIndex(m => m.id === selectedMarket);
      if (idx !== -1 && idx !== currentIndex) {
        setCurrentIndex(idx);
      }
    }
  }, [selectedMarket]);

  // Handle Autoplay timer
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayTimerRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % VOLTA_MARKETS.length);
      }, 5000);
    } else if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
    }

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [isAutoPlaying]);

  const currentMarket: VoltaMarket = VOLTA_MARKETS[currentIndex];

  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? VOLTA_MARKETS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % VOLTA_MARKETS.length);
  };

  const handleMarketClick = (marketId: string) => {
    onSelectMarket(marketId);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative my-6">
      
      {/* Header Banner */}
      <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
            <Store className="w-4 h-4 text-amber-400" />
            Volta Regional Market Hubs Gallery
          </h3>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            • 7 Authentic Market Environments & Stalls
          </span>
        </div>

        {/* Autoplay Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="text-xs text-slate-300 hover:text-amber-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5"
            title={isAutoPlaying ? "Pause slideshow" : "Play slideshow"}
          >
            {isAutoPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-bold">Autoplay On</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-bold">Paused</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Slide Stage */}
      <div className="relative h-[380px] sm:h-[420px] bg-slate-950 overflow-hidden group">
        
        {/* Background Image with Referrer Policy */}
        <img
          key={currentMarket.id}
          src={currentMarket.image}
          alt={currentMarket.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-all duration-700 ease-out transform scale-105 group-hover:scale-100"
        />

        {/* Gradient Overlays for Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent" />

        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-950/80 hover:bg-amber-500 text-white hover:text-slate-950 border border-slate-800 transition-all z-20 shadow-xl"
          title="Previous market stall"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-950/80 hover:bg-amber-500 text-white hover:text-slate-950 border border-slate-800 transition-all z-20 shadow-xl"
          title="Next market stall"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Slide Content Overlay */}
        <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end z-10 max-w-3xl">
          
          <div className="space-y-3 animate-fadeIn">
            
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-amber-500 text-slate-950 font-black text-xs px-3 py-1 rounded-lg flex items-center gap-1 shadow-lg">
                <MapPin className="w-3.5 h-3.5" />
                {currentMarket.district}
              </span>

              <span className="bg-slate-950/90 backdrop-blur text-amber-300 font-bold text-xs px-3 py-1 rounded-lg border border-slate-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                {currentMarket.marketDays}
              </span>
            </div>

            {/* Market Title */}
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight drop-shadow-md">
              {currentMarket.name}
            </h2>

            {/* Specialization & Location Landmark */}
            <div className="space-y-1">
              <div className="text-xs sm:text-sm font-extrabold text-emerald-400 flex items-start gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Specialization: {currentMarket.specialization}</span>
              </div>

              <div className="text-xs text-slate-300 flex items-start gap-1.5">
                <Building2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Landmark Place: <strong>{currentMarket.markerLocationName}</strong></span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 max-w-2xl leading-relaxed bg-slate-950/60 backdrop-blur p-3 rounded-xl border border-slate-800/80">
              {currentMarket.description}
            </p>

            {/* Popular Items & Action Button */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Tag className="w-3 h-3 text-amber-400" /> Key Items:
                </span>
                {currentMarket.popularItems.map((item, idx) => (
                  <span
                    key={idx}
                    className="bg-slate-950/90 border border-slate-800 text-amber-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-md"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <button
                onClick={() => handleMarketClick(currentMarket.id)}
                className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-xl ${
                  selectedMarket === currentMarket.id
                    ? 'bg-emerald-500 text-white ring-2 ring-emerald-400/50'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                {selectedMarket === currentMarket.id
                  ? 'Showing Produce for this Market'
                  : `Explore ${currentMarket.name} Stalls`}
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Bottom Thumbnail Selector Bar */}
      <div className="bg-slate-950 p-3 border-t border-slate-800 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 min-w-max">
          {VOLTA_MARKETS.map((market, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={market.id}
                onClick={() => setCurrentIndex(idx)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all border ${
                  isActive
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300 ring-1 ring-amber-500/50'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="w-7 h-7 rounded-lg overflow-hidden border border-slate-700 flex-shrink-0">
                  <img
                    src={market.image}
                    alt={market.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-left">
                  <div className="text-[11px] font-bold leading-none truncate max-w-[100px]">
                    {market.name.split(' ')[0]} Market
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5">
                    {market.district.split(' ')[0]}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
