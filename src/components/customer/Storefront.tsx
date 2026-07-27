import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { VOLTA_MARKETS } from '../../data/seedData';
import { ProductCategory, Product, VoltaMarket } from '../../types';
import { ProductSearch } from './ProductSearch';
import { ProductDetailModal } from './ProductDetailModal';
import { MarketCarousel } from './MarketCarousel';
import { VoltaMarketsMap } from '../map/VoltaMarketsMap';
import { ProductDeliveryTrace } from '../common/ProductDeliveryTrace';
import { 
  Search, 
  ShoppingBag, 
  Star, 
  MapPin, 
  Check, 
  Sparkles, 
  Truck, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  Filter,
  Store,
  Building2,
  Eye,
  Compass,
  Map as MapIcon,
  Images,
  TrendingUp
} from 'lucide-react';

export const Storefront: React.FC = () => {
  const { 
    products, 
    selectedMarket, 
    setSelectedMarket, 
    addToCart, 
    setActiveModal, 
    orders, 
    setTrackingOrderId,
    setCurrentRole
  } = useApp();

  const [marketViewMode, setMarketViewMode] = useState<'MAP' | 'CAROUSEL'>('MAP');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTarget, setSearchTarget] = useState<'ALL' | 'NAME' | 'TRADER'>('ALL');
  const [selectedTrader, setSelectedTrader] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => set.add(p.category));
    const list = Array.from(set).sort();
    return ['ALL', ...list];
  }, [products]);

  // Extract unique trader store names
  const traderNames = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => set.add(p.traderName));
    return Array.from(set).sort();
  }, [products]);

  const filteredProducts = products.filter(p => {
    const matchesMarket = selectedMarket === 'ALL' || p.marketId === selectedMarket;
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesTrader = selectedTrader === 'ALL' || p.traderName === selectedTrader;

    const query = searchQuery.trim().toLowerCase();
    let matchesSearch = true;

    if (query) {
      if (searchTarget === 'NAME') {
        matchesSearch = p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query);
      } else if (searchTarget === 'TRADER') {
        matchesSearch = p.traderName.toLowerCase().includes(query);
      } else {
        matchesSearch = p.name.toLowerCase().includes(query) ||
                        p.traderName.toLowerCase().includes(query) ||
                        p.description.toLowerCase().includes(query);
      }
    }

    return matchesMarket && matchesCategory && matchesTrader && matchesSearch;
  });

  const matchedTradersCount = useMemo(() => {
    const set = new Set<string>();
    filteredProducts.forEach(p => set.add(p.traderName));
    return set.size;
  }, [filteredProducts]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSearchTarget('ALL');
    setSelectedTrader('ALL');
    setSelectedCategory('ALL');
    setSelectedMarket('ALL');
  };

  const activeCustomerOrders = orders.filter(
    o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
  );

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1500);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Active Delivery Progress Banner */}
      {activeCustomerOrders.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 text-slate-950 p-4 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-amber-300/40">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-950/20 rounded-xl">
              <Truck className="w-6 h-6 text-slate-950 animate-bounce" />
            </div>
            <div>
              <div className="font-black text-sm uppercase tracking-wider text-slate-900">
                Live Order Dispatch Active
              </div>
              <p className="text-xs font-semibold text-slate-900/90">
                Order #{activeCustomerOrders[0].orderCode} • Status: <span className="underline font-bold">{activeCustomerOrders[0].status.replace(/_/g, ' ')}</span> • Delivery PIN: <span className="font-mono bg-slate-950 text-amber-300 px-2 py-0.5 rounded font-black text-xs">{activeCustomerOrders[0].deliveryPin}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setTrackingOrderId(activeCustomerOrders[0].id);
              setActiveModal('TRACKING');
            }}
            className="w-full md:w-auto px-5 py-2.5 bg-slate-950 text-white hover:bg-slate-900 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Live Delivery Map & PIN Verification</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      )}

      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-10">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent z-10" />
        <img
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1600"
          alt="Volta Market"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative z-20 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Volta Region Direct Market Dispatch</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Fresh Produce & Authentic Goods from <span className="text-amber-400">Volta Markets</span> Delivered Fast
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Order directly from verified traders at <strong>Abor, Akatsi, Dabala, Mafi, Denu, Agbozume,</strong> and <strong>Aflao</strong> markets. Fast dispatch via verified local Okada & Aboboyaa riders.
          </p>

          {/* Quick Value Badges & Directory Button */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <button
              onClick={() => setCurrentRole('DIRECTORY')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl font-black transition-all flex items-center gap-2 shadow-lg"
            >
              <Compass className="w-4 h-4" />
              <span>Browse Master Items & Locations Directory</span>
            </button>

            <button
              onClick={() => setActiveModal('PRICE_TRENDS')}
              className="bg-slate-900/90 hover:bg-slate-800 border border-amber-500/40 text-amber-300 px-4 py-2 rounded-xl font-black transition-all flex items-center gap-2 shadow-lg"
            >
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>📈 30-Day Market Price Trends</span>
            </button>

            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Ghana Card Riders</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700">
              <MapPin className="w-4 h-4 text-sky-400" />
              <span>7 Market Locations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Market Showcase Section with View Mode Switcher */}
      <div className="space-y-4">
        <div className="bg-slate-900 border border-slate-800 p-2 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2 px-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <h3 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-400" />
              7 Volta Market Hubs (Abor, Akatsi, Dabala, Mafi, Denu, Agbozume, Aflao)
            </h3>
          </div>

          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setMarketViewMode('MAP')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                marketViewMode === 'MAP' 
                  ? 'bg-amber-500 text-slate-950 shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Interactive GPS Map</span>
            </button>
            <button
              onClick={() => setMarketViewMode('CAROUSEL')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                marketViewMode === 'CAROUSEL' 
                  ? 'bg-amber-500 text-slate-950 shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Images className="w-3.5 h-3.5" />
              <span>Stalls Showcase Gallery</span>
            </button>
          </div>
        </div>

        {marketViewMode === 'MAP' ? (
          <VoltaMarketsMap
            selectedMarket={selectedMarket}
            onSelectMarket={setSelectedMarket}
          />
        ) : (
          <MarketCarousel
            selectedMarket={selectedMarket}
            onSelectMarket={setSelectedMarket}
          />
        )}
      </div>

      {/* Market Selector Chips */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" />
            Explore Volta Market Hubs
          </h3>
          <span className="text-xs text-slate-400">Select market to filter produce & locate stall places</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => setSelectedMarket('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
              selectedMarket === 'ALL'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            All Markets
          </button>
          {VOLTA_MARKETS.map(m => (
            <button
              key={m.id}
              onClick={() => setSelectedMarket(m.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border flex items-center gap-2 ${
                selectedMarket === m.id
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-bold'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span>{m.name}</span>
              <span className="text-[10px] opacity-75 font-normal">({m.marketDays})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Market Info Spotlight Banner */}
      {selectedMarket !== 'ALL' && (() => {
        const activeMarketInfo = VOLTA_MARKETS.find(m => m.id === selectedMarket);
        if (!activeMarketInfo) return null;
        return (
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden animate-fadeIn">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="space-y-2 max-w-2xl relative z-10">
              <div className="flex items-center gap-2">
                <span className="bg-amber-500 text-slate-950 font-black text-[11px] px-2.5 py-0.5 rounded uppercase tracking-wider">
                  Active Market Spotlight
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {activeMarketInfo.district}
                </span>
              </div>
              
              <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                <span>{activeMarketInfo.name}</span>
                <span className="text-xs font-mono font-normal text-amber-400 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded">
                  📅 {activeMarketInfo.marketDays}
                </span>
              </h3>

              <div className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                <Building2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                <span>Specialization: {activeMarketInfo.specialization}</span>
              </div>

              <div className="text-xs text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 flex-shrink-0 text-amber-400" />
                <span>Location Landmark Place: <strong>{activeMarketInfo.markerLocationName}</strong></span>
              </div>

              <div className="pt-1 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-400 font-semibold">Famous Produce:</span>
                {activeMarketInfo.popularItems.map((item, idx) => (
                  <span key={idx} className="bg-slate-950 border border-slate-800 text-amber-300 text-[11px] px-2 py-0.5 rounded">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Market Image Preview Box */}
            <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden border border-slate-800 flex-shrink-0 relative group">
              <img
                src={activeMarketInfo.image}
                alt={activeMarketInfo.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-slate-950/30 flex items-end p-2">
                <span className="text-[10px] text-white font-bold bg-slate-950/80 px-2 py-0.5 rounded backdrop-blur">
                  {activeMarketInfo.name}
                </span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Global Product Search Component */}
      <ProductSearch
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchTarget={searchTarget}
        setSearchTarget={setSearchTarget}
        totalProductsCount={products.length}
        filteredCount={filteredProducts.length}
        matchedTradersCount={matchedTradersCount}
        traderNames={traderNames}
        selectedTrader={selectedTrader}
        setSelectedTrader={setSelectedTrader}
        onReset={handleResetFilters}
      />

      {/* Category Filter Pills */}
      <div className="flex items-center justify-between gap-4 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold whitespace-nowrap">
          <Filter className="w-4 h-4 text-emerald-400" /> Category:
        </div>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap border ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white border-emerald-500 font-bold shadow-md'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Catalog Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-slate-400">
            Showing <strong className="text-white">{filteredProducts.length}</strong> available products
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-slate-900 rounded-2xl border border-slate-800">
            <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="text-lg font-bold text-slate-300">No items found in this market category</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try selecting "All Markets" or clearing search filters to see items across Abor, Akatsi, Dabala, Mafi, Denu, Agbozume, and Aflao.
            </p>
            <button
              onClick={() => { setSelectedMarket('ALL'); setSelectedCategory('ALL'); setSearchQuery(''); }}
              className="mt-4 px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => {
              const marketObj = VOLTA_MARKETS.find(m => m.id === product.marketId);
              const isAdded = addedProductId === product.id;

              return (
                <div
                  key={product.id}
                  onClick={() => setModalProduct(product)}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-amber-500/50 transition-all flex flex-col justify-between group shadow-lg cursor-pointer"
                >
                  {/* Top Image & Badge */}
                  <div className="relative h-48 overflow-hidden bg-slate-950">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
                      <span className="bg-slate-950/80 backdrop-blur border border-slate-700 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow">
                        <MapPin className="w-3 h-3 text-amber-400" />
                        {marketObj?.name || product.marketId}
                      </span>
                      {/* Availability Status Badge */}
                      <span className={`backdrop-blur text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1.5 shadow border ${
                        product.stock > 5
                          ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40'
                          : product.stock > 0
                          ? 'bg-amber-950/90 text-amber-300 border-amber-500/40'
                          : 'bg-rose-950/90 text-rose-300 border-rose-500/40'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          product.stock > 5 ? 'bg-emerald-400' : product.stock > 0 ? 'bg-amber-400 animate-pulse' : 'bg-rose-400'
                        }`} />
                        {product.stock > 5 ? 'In Stock' : product.stock > 0 ? 'Limited Availability' : 'Out of Stock'}
                      </span>
                    </div>

                    <div className="absolute top-2.5 right-2.5 bg-slate-950/80 backdrop-blur border border-slate-700 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      {product.rating}
                    </div>

                    {/* Quick View Overlay Badge */}
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="bg-slate-950/90 text-amber-300 text-xs font-extrabold px-3 py-1.5 rounded-xl border border-amber-500/40 flex items-center gap-1.5 shadow-xl">
                        <Eye className="w-4 h-4 text-amber-400" /> View Stall Location & Details
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-400 uppercase tracking-wide">
                        <span>{product.category}</span>
                        <span className="text-slate-500 font-mono text-[10px] normal-case">{product.unit}</span>
                      </div>

                      <h4 className="font-bold text-white text-base leading-snug mt-1 line-clamp-2 group-hover:text-amber-300 transition-colors">
                        {product.name}
                      </h4>

                      {/* Stall Location in Market Place */}
                      <div className="mt-2 text-xs text-amber-400/90 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <span className="truncate font-semibold">
                          Place: {product.stallLocation || 'Market Center Stall'}
                        </span>
                      </div>

                      {/* Market Function & Usage */}
                      {product.itemFunction && (
                        <p className="text-[11px] text-slate-300 mt-1.5 bg-slate-950/40 p-2 rounded-lg border border-slate-800/50 line-clamp-2 leading-relaxed">
                          💡 <strong className="text-emerald-400">Function:</strong> {product.itemFunction}
                        </p>
                      )}

                      {/* Product -> Market -> Town -> Available Riders Trace Flow */}
                      <div className="mt-2">
                        <ProductDeliveryTrace productName={product.name} marketId={product.marketId} productImage={product.image} compact />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 space-y-3">
                      
                      {/* Trader Info */}
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTrader(product.traderName);
                            setSearchTarget('TRADER');
                          }}
                          className="truncate max-w-[170px] hover:text-amber-400 transition-colors text-left flex items-center gap-1 group/trader"
                          title={`Filter by ${product.traderName}`}
                        >
                          <Store className="w-3.5 h-3.5 text-emerald-400 group-hover/trader:text-amber-400 flex-shrink-0" />
                          <span className="truncate">
                            Trader: <strong className="text-slate-200 group-hover/trader:text-amber-300">{product.traderName}</strong>
                          </span>
                        </button>
                      </div>

                      {/* Price & Action */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">Price</div>
                          <div className="text-lg font-black text-amber-400">
                            ₵{product.priceGhs.toFixed(2)}
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
                            isAdded
                              ? 'bg-emerald-500 text-white'
                              : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-4 h-4" /> Added
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-4 h-4" /> Add
                            </>
                          )}
                        </button>
                      </div>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Quick View Modal */}
      <ProductDetailModal
        product={modalProduct}
        onClose={() => setModalProduct(null)}
        onAddToCart={(p, qty) => addToCart(p, qty)}
      />

    </div>
  );
};
