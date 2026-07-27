import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { VOLTA_MARKETS } from '../../data/seedData';
import { Product, VoltaMarketId, VoltaMarket } from '../../types';
import { ProductDeliveryTrace } from '../common/ProductDeliveryTrace';
import { VoltaMarketsMap } from '../map/VoltaMarketsMap';
import { MarketPriceTrendVisualizer } from '../common/MarketPriceTrendVisualizer';
import { 
  MapPin, 
  Search, 
  Filter, 
  ShoppingBag, 
  Check, 
  Store, 
  Building2, 
  Calendar, 
  DollarSign, 
  Sparkles, 
  List, 
  Grid, 
  Map as MapIcon, 
  ArrowUpDown, 
  ChevronRight, 
  Info, 
  Star, 
  Truck, 
  Compass, 
  ShieldCheck,
  X,
  TrendingUp
} from 'lucide-react';

export const ItemsDirectory: React.FC = () => {
  const { 
    products, 
    selectedMarket, 
    setSelectedMarket, 
    addToCart, 
    traders 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [marketFilter, setMarketFilter] = useState<string>('ALL');
  const [sortOption, setSortOption] = useState<'PRICE_ASC' | 'PRICE_DESC' | 'NAME' | 'POPULARITY'>('POPULARITY');
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE' | 'MARKETS' | 'TRENDS'>('GRID');
  
  const [selectedProductModal, setSelectedProductModal] = useState<Product | null>(null);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  // Extract categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => set.add(p.category));
    return ['ALL', ...Array.from(set).sort()];
  }, [products]);

  // Max price among products
  const absoluteMaxPrice = useMemo(() => {
    if (products.length === 0) return 500;
    return Math.max(...products.map(p => p.priceGhs));
  }, [products]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.traderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.stallLocation && p.stallLocation.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.itemFunction && p.itemFunction.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
      const matchesMarket = marketFilter === 'ALL' || p.marketId === marketFilter;
      const matchesPrice = p.priceGhs <= maxPrice;

      return matchesSearch && matchesCategory && matchesMarket && matchesPrice;
    }).sort((a, b) => {
      if (sortOption === 'PRICE_ASC') return a.priceGhs - b.priceGhs;
      if (sortOption === 'PRICE_DESC') return b.priceGhs - a.priceGhs;
      if (sortOption === 'NAME') return a.name.localeCompare(b.name);
      return b.salesCount - a.salesCount; // Popularity
    });
  }, [products, searchQuery, categoryFilter, marketFilter, maxPrice, sortOption]);

  const handleAddToCart = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    addToCart(product, 1);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1500);
  };

  const getMarketInfo = (marketId: VoltaMarketId): VoltaMarket | undefined => {
    return VOLTA_MARKETS.find(m => m.id === marketId);
  };

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      
      {/* Page Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent z-10" />
        <img
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1600"
          alt="Volta Market Directory"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative z-20 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-full text-xs font-semibold">
            <Compass className="w-3.5 h-3.5" />
            <span>Official Volta Market Goods & Price Directory</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Market Items, Prices & Exact Locations
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Browse live prices, stall landmarks, market days, and district locations for Akatsi Gari, Agbozume Kente, Dabala Tilapia, Aflao Marine Fish, and Mafi Grains across all 7 Volta Region market hubs.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-amber-300 font-medium">
            <span className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <strong>{products.length} Total Listed Items</strong>
            </span>
            <span className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <strong>7 Regional Market Hubs</strong>
            </span>
            <span className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
              <Store className="w-4 h-4 text-sky-400" />
              <strong>{traders.length} Verified Traders</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        
        {/* Top Search Input & View Toggles */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search items, prices, markets, stall numbers..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View Mode Switches & Sort */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setViewMode('GRID')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'GRID' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
                title="Cards Grid View"
              >
                <Grid className="w-3.5 h-3.5" /> Grid
              </button>
              <button
                onClick={() => setViewMode('TABLE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'TABLE' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
                title="Detailed Price & Location Table"
              >
                <List className="w-3.5 h-3.5" /> Price Table
              </button>
              <button
                onClick={() => setViewMode('MARKETS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'MARKETS' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
                title="Market Location Directory"
              >
                <MapIcon className="w-3.5 h-3.5" /> Market Map
              </button>
              <button
                onClick={() => setViewMode('TRENDS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'TRENDS' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
                title="30-Day Market Price Trends"
              >
                <TrendingUp className="w-3.5 h-3.5" /> Price Trends
              </button>
            </div>

            <select
              value={sortOption}
              onChange={e => setSortOption(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="POPULARITY">Sort by Popularity</option>
              <option value="PRICE_ASC">Price: Low to High</option>
              <option value="PRICE_DESC">Price: High to Low</option>
              <option value="NAME">Name: A-Z</option>
            </select>

          </div>
        </div>

        {/* Filter Dropdowns & Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 border-t border-slate-800/80 pt-3">
          
          {/* Market Location Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-400" /> Market Location
            </label>
            <select
              value={marketFilter}
              onChange={e => setMarketFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All 7 Volta Market Locations</option>
              {VOLTA_MARKETS.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.district})
                </option>
              ))}
            </select>
          </div>

          {/* Product Category Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-amber-400" /> Category
            </label>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c === 'ALL' ? 'All Product Categories' : c}</option>
              ))}
            </select>
          </div>

          {/* Maximum Price Filter */}
          <div>
            <div className="flex items-center justify-between text-[10px] font-bold uppercase mb-1">
              <span className="text-slate-400 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-amber-400" /> Max Price Limit
              </span>
              <span className="text-amber-400 font-mono">₵{maxPrice.toFixed(0)}</span>
            </div>
            <input
              type="range"
              min={10}
              max={absoluteMaxPrice}
              step={5}
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-full accent-amber-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
            />
          </div>

        </div>

      </div>

      {/* Results Count Banner */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div>
          Showing <strong className="text-white font-mono">{filteredProducts.length}</strong> items matching filters
        </div>
        {(searchQuery || categoryFilter !== 'ALL' || marketFilter !== 'ALL' || maxPrice < absoluteMaxPrice) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setCategoryFilter('ALL');
              setMarketFilter('ALL');
              setMaxPrice(absoluteMaxPrice);
            }}
            className="text-amber-400 hover:underline font-bold text-[11px]"
          >
            Reset All Filters
          </button>
        )}
      </div>

      {/* VIEW MODE A: ITEM CARDS GRID */}
      {viewMode === 'GRID' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 space-y-2">
              <p className="text-sm font-semibold text-slate-300">No market items match your filter criteria.</p>
              <p className="text-xs">Try searching for "Gari", "Tilapia", "Kente", or adjusting your price slider.</p>
            </div>
          ) : (
            filteredProducts.map(product => {
              const market = getMarketInfo(product.marketId);
              return (
                <div
                  key={product.id}
                  onClick={() => setSelectedProductModal(product)}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-amber-500/50 transition-all duration-300 group flex flex-col justify-between cursor-pointer shadow-lg hover:shadow-2xl"
                >
                  {/* Card Image Header */}
                  <div className="relative h-44 bg-slate-950 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                    
                    {/* Market Location Badge */}
                    <div className="absolute top-2.5 left-2.5 bg-slate-950/90 backdrop-blur border border-slate-800 text-amber-300 text-[10px] font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow">
                      <MapPin className="w-3 h-3 text-amber-400 flex-shrink-0" />
                      <span>{market?.name || product.marketId}</span>
                    </div>

                    {/* Stock Status Badge */}
                    <div className={`absolute top-2.5 right-2.5 backdrop-blur text-[10px] font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow border ${
                      product.stock > 5
                        ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40'
                        : product.stock > 0
                        ? 'bg-amber-950/90 text-amber-300 border-amber-500/40'
                        : 'bg-rose-950/90 text-rose-300 border-rose-500/40'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        product.stock > 5 ? 'bg-emerald-400' : product.stock > 0 ? 'bg-amber-400 animate-pulse' : 'bg-rose-400'
                      }`} />
                      <span>{product.stock > 5 ? 'In Stock' : product.stock > 0 ? 'Limited Availability' : 'Out of Stock'}</span>
                    </div>

                    {/* Price Badge */}
                    <div className="absolute bottom-2.5 right-2.5 bg-amber-500 text-slate-950 font-black font-mono text-sm px-3 py-1 rounded-xl shadow-lg">
                      ₵{product.priceGhs.toFixed(2)}
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">
                        {product.category}
                      </div>
                      <h4 className="text-sm font-extrabold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                        {product.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {product.description}
                      </p>
                    </div>

                    {/* Location & Stall Landmark Info */}
                    <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-2.5 space-y-1 text-[11px]">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Store className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span className="truncate font-medium">{product.traderName}</span>
                      </div>
                      {product.stallLocation && (
                        <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                          <Building2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                          <span className="truncate">{product.stallLocation}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                        <Calendar className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                        <span className="truncate">{market?.marketDays || 'Daily Market'}</span>
                      </div>

                      {/* Product -> Market -> Town -> Available Riders Trace Flow */}
                      <div className="pt-1">
                        <ProductDeliveryTrace productName={product.name} marketId={product.marketId} productImage={product.image} compact />
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-1 flex items-center justify-between gap-2">
                      <div className="text-[11px] text-slate-400 font-mono">
                        Unit: <strong className="text-slate-200">{product.unit}</strong>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(product, e)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                          addedProductId === product.id
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                        }`}
                      >
                        {addedProductId === product.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Added!
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5" /> Add (₵{product.priceGhs.toFixed(2)})
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW MODE B: DETAILED PRICE & LOCATION TABLE */}
      {viewMode === 'TABLE' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3">Item & Category</th>
                  <th className="p-3">Price & Unit</th>
                  <th className="p-3">Market Location</th>
                  <th className="p-3">Stall & Landmark</th>
                  <th className="p-3">Trader / Merchant</th>
                  <th className="p-3">Market Days</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-500 italic">
                      No market items match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(product => {
                    const market = getMarketInfo(product.marketId);
                    return (
                      <tr 
                        key={product.id} 
                        onClick={() => setSelectedProductModal(product)}
                        className="hover:bg-slate-800/50 transition-colors cursor-pointer"
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-10 h-10 rounded-lg object-cover bg-slate-950 flex-shrink-0"
                            />
                            <div>
                              <div className="font-extrabold text-white text-xs">{product.name}</div>
                              <div className="text-[10px] text-amber-400 uppercase font-semibold">{product.category}</div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3">
                          <div className="font-black text-amber-400 font-mono text-sm">₵{product.priceGhs.toFixed(2)}</div>
                          <div className="text-[10px] text-slate-400">{product.unit}</div>
                          <div className="mt-1">
                            <span className={`inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded border ${
                              product.stock > 5
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'
                                : product.stock > 0
                                ? 'bg-amber-950/80 text-amber-300 border-amber-500/30'
                                : 'bg-rose-950/80 text-rose-300 border-rose-500/30'
                            }`}>
                              <span className={`w-1 h-1 rounded-full ${
                                product.stock > 5 ? 'bg-emerald-400' : product.stock > 0 ? 'bg-amber-400' : 'bg-rose-400'
                              }`} />
                              {product.stock > 5 ? 'In Stock' : product.stock > 0 ? 'Limited Availability' : 'Out of Stock'}
                            </span>
                          </div>
                        </td>

                        <td className="p-3">
                          <div className="font-bold text-white flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-amber-400" /> {market?.name}
                          </div>
                          <div className="text-[10px] text-slate-400">{market?.district}</div>
                        </td>

                        <td className="p-3">
                          <div className="text-slate-200 text-xs font-medium">{product.stallLocation || 'Central Market Square'}</div>
                          <div className="text-[10px] text-slate-500">{market?.markerLocationName}</div>
                        </td>

                        <td className="p-3">
                          <div className="text-white font-semibold">{product.traderName}</div>
                          <div className="text-[10px] text-emerald-400">Verified Market Stall</div>
                        </td>

                        <td className="p-3 text-[11px] text-slate-300">
                          {market?.marketDays}
                        </td>

                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={(e) => handleAddToCart(product, e)}
                            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] px-3 py-1.5 rounded-lg shadow transition-all inline-flex items-center gap-1"
                          >
                            <ShoppingBag className="w-3 h-3" /> Buy Now
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW MODE C: MARKET HUB LOCATION MAP & ITEMS DIRECTORY */}
      {viewMode === 'MARKETS' && (
        <div className="space-y-6">
          <VoltaMarketsMap
            selectedMarket={marketFilter as any}
            onSelectMarket={(mId) => {
              setMarketFilter(mId);
              if (mId !== 'ALL') {
                setSelectedMarket(mId);
              }
            }}
          />

          {VOLTA_MARKETS.map(market => {
            const marketProducts = products.filter(p => p.marketId === market.id);
            return (
              <div 
                key={market.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4"
              >
                {/* Market Location Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={market.image}
                      alt={market.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover bg-slate-950 border border-slate-800 flex-shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-white">{market.name}</h3>
                        <span className="text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold px-2 py-0.5 rounded-full">
                          {market.district}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{market.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 text-amber-300">
                          <MapPin className="w-3.5 h-3.5 text-amber-400" /> {market.markerLocationName}
                        </span>
                        <span className="flex items-center gap-1 text-sky-300">
                          <Calendar className="w-3.5 h-3.5 text-sky-400" /> {market.marketDays}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedMarket(market.id);
                      setMarketFilter(market.id);
                      setViewMode('GRID');
                    }}
                    className="bg-slate-950 hover:bg-slate-800 text-amber-400 border border-slate-800 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0"
                  >
                    <span>View All {marketProducts.length} Items</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Items Available at this Exact Market Location */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-400" /> Featured Produce & Items at {market.name}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {marketProducts.map(prod => (
                      <div
                        key={prod.id}
                        onClick={() => setSelectedProductModal(prod)}
                        className="bg-slate-950 border border-slate-800/80 p-3 rounded-xl flex items-center gap-3 hover:border-amber-500/40 transition-all cursor-pointer"
                      >
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-12 h-12 rounded-lg object-cover bg-slate-900 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white truncate">{prod.name}</div>
                          <div className="text-[10px] text-slate-400 truncate">{prod.stallLocation || 'Market Stall'}</div>
                          <div className="text-xs font-black text-amber-400 font-mono mt-0.5">₵{prod.priceGhs.toFixed(2)}</div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleAddToCart(prod, e)}
                          className="p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-black flex-shrink-0"
                          title="Add to cart"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE D: MARKET PRICE TRENDS VISUALIZER */}
      {viewMode === 'TRENDS' && (
        <MarketPriceTrendVisualizer />
      )}

      {/* QUICK PRODUCT & LOCATION DETAILS MODAL */}
      {selectedProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-fadeIn space-y-4 p-6 relative">
            
            <button
              onClick={() => setSelectedProductModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 bg-slate-950 rounded-full border border-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex gap-4">
              <img
                src={selectedProductModal.image}
                alt={selectedProductModal.name}
                className="w-28 h-28 rounded-2xl object-cover bg-slate-950 border border-slate-800 flex-shrink-0"
              />
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded">
                    {selectedProductModal.category}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded border ${
                    selectedProductModal.stock > 5
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'
                      : selectedProductModal.stock > 0
                      ? 'bg-amber-950/80 text-amber-300 border-amber-500/30'
                      : 'bg-rose-950/80 text-rose-300 border-rose-500/30'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      selectedProductModal.stock > 5 ? 'bg-emerald-400' : selectedProductModal.stock > 0 ? 'bg-amber-400' : 'bg-rose-400'
                    }`} />
                    {selectedProductModal.stock > 5 ? 'In Stock' : selectedProductModal.stock > 0 ? 'Limited Availability' : 'Out of Stock'}
                  </span>
                </div>
                <h3 className="text-lg font-black text-white">{selectedProductModal.name}</h3>
                <div className="text-xl font-black text-amber-400 font-mono">
                  ₵{selectedProductModal.priceGhs.toFixed(2)} <span className="text-xs text-slate-400 font-sans font-normal">/ {selectedProductModal.unit}</span>
                </div>
              </div>
            </div>

            {/* Description & Function */}
            <div className="space-y-2 text-xs text-slate-300 bg-slate-950 border border-slate-800 p-3.5 rounded-2xl">
              <p>{selectedProductModal.description}</p>
              {selectedProductModal.itemFunction && (
                <div className="text-[11px] text-amber-300 font-medium pt-1 border-t border-slate-800/80">
                  💡 <strong>Item Function / Usage:</strong> {selectedProductModal.itemFunction}
                </div>
              )}
            </div>

            {/* Location & Merchant Details */}
            <div className="space-y-2 text-xs">
              <h5 className="font-bold text-white uppercase text-[10px] tracking-wider text-slate-400">
                Exact Location & Stall Info
              </h5>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
                  <div className="text-slate-400 text-[10px]">Market Hub</div>
                  <div className="font-bold text-amber-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {getMarketInfo(selectedProductModal.marketId)?.name}
                  </div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
                  <div className="text-slate-400 text-[10px]">Stall Location</div>
                  <div className="font-bold text-white flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-emerald-400" /> {selectedProductModal.stallLocation || 'Main Section'}
                  </div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
                  <div className="text-slate-400 text-[10px]">Merchant Name</div>
                  <div className="font-bold text-white flex items-center gap-1">
                    <Store className="w-3 h-3 text-sky-400" /> {selectedProductModal.traderName}
                  </div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
                  <div className="text-slate-400 text-[10px]">Market Days</div>
                  <div className="font-bold text-slate-200 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-purple-400" /> {getMarketInfo(selectedProductModal.marketId)?.marketDays}
                  </div>
                </div>
              </div>
            </div>

            {/* Product -> Market -> Town -> Available Riders Trace */}
            <ProductDeliveryTrace 
              productName={selectedProductModal.name} 
              marketId={selectedProductModal.marketId} 
              productImage={selectedProductModal.image} 
            />

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => {
                  addToCart(selectedProductModal, 1);
                  setSelectedProductModal(null);
                }}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add Item to Order (₵{selectedProductModal.priceGhs.toFixed(2)})</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
