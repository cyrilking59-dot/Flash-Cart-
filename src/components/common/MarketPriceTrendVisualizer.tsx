import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line 
} from 'recharts';
import { ESSENTIAL_COMMODITY_TRENDS, EssentialCommodityTrend, DailyPricePoint } from '../../data/priceTrendsData';
import { VOLTA_MARKETS } from '../../data/seedData';
import { VoltaMarketId } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  DollarSign, 
  Calendar, 
  Store, 
  Sparkles, 
  Info, 
  ArrowRight, 
  ShoppingBag, 
  CheckCircle2, 
  Filter, 
  BarChart3, 
  Layers, 
  AlertCircle,
  Zap,
  Tag
} from 'lucide-react';

interface MarketPriceTrendVisualizerProps {
  initialCommodityId?: string;
  className?: string;
  compact?: boolean;
}

export const MarketPriceTrendVisualizer: React.FC<MarketPriceTrendVisualizerProps> = ({
  initialCommodityId = 'comm-tomatoes',
  className = '',
  compact = false
}) => {
  const { products, addToCart, setSelectedMarket, setCurrentRole } = useApp();

  const [selectedCommodityId, setSelectedCommodityId] = useState<string>(initialCommodityId);
  const [timeframeDays, setTimeframeDays] = useState<7 | 14 | 30>(30);
  const [marketFilter, setMarketFilter] = useState<VoltaMarketId | 'ALL'>('ALL');
  const [chartType, setChartType] = useState<'AREA' | 'LINE'>('AREA');
  const [activeTab, setActiveTab] = useState<'CHART' | 'COMPARISON' | 'ORDERS'>('CHART');

  // Selected Commodity Object
  const commodity = ESSENTIAL_COMMODITY_TRENDS.find(c => c.id === selectedCommodityId) || ESSENTIAL_COMMODITY_TRENDS[0];

  // Slice daily data according to selected timeframe (7, 14, or 30 days)
  const filteredDailyData = React.useMemo(() => {
    return commodity.dailyData.slice(30 - timeframeDays);
  }, [commodity, timeframeDays]);

  // Calculate statistics for the selected timeframe
  const stats = React.useMemo(() => {
    if (!filteredDailyData.length) return { avg: 0, min: 0, max: 0, changePct: 0 };
    
    const prices = filteredDailyData.map(d => {
      if (marketFilter === 'ALL') return d.avgPriceGhs;
      return d[marketFilter] || d.avgPriceGhs;
    });

    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    const avg = Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 10) / 10;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const changePct = Math.round(((lastPrice - firstPrice) / firstPrice) * 100 * 10) / 10;

    return { avg, min, max, changePct, startPrice: firstPrice, endPrice: lastPrice };
  }, [filteredDailyData, marketFilter]);

  // Find matching store product to allow direct Add-to-Cart
  const matchingProduct = React.useMemo(() => {
    return products.find(p => 
      p.name.toLowerCase().includes(commodity.name.toLowerCase().split(' ')[1] || 'tomato') ||
      p.category === commodity.category
    );
  }, [products, commodity]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: DailyPricePoint = payload[0].payload;
      return (
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 font-sans z-50">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1 gap-4">
            <span className="font-extrabold text-amber-400 font-mono">{label} (2026)</span>
            {data.eventNote && (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-1.5 py-0.5 rounded font-bold">
                {data.eventNote}
              </span>
            )}
          </div>

          <div className="space-y-1 font-mono">
            <div className="flex items-center justify-between gap-4 text-white">
              <span className="text-slate-400">Regional Avg:</span>
              <span className="font-black text-amber-400">GHS {data.avgPriceGhs.toFixed(2)}</span>
            </div>

            {marketFilter !== 'ALL' ? (
              <div className="flex items-center justify-between gap-4 text-emerald-400 font-bold border-t border-slate-800/80 pt-1">
                <span className="capitalize">{marketFilter} Market:</span>
                <span>GHS {(data[marketFilter] || data.avgPriceGhs).toFixed(2)}</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-slate-300 border-t border-slate-900 pt-1">
                <div>Abor: <strong className="text-emerald-400">GHS {data.abor}</strong></div>
                <div>Akatsi: <strong className="text-amber-300">GHS {data.akatsi}</strong></div>
                <div>Dabala: <strong className="text-sky-300">GHS {data.dabala}</strong></div>
                <div>Mafi: <strong className="text-purple-300">GHS {data.mafi}</strong></div>
              </div>
            )}

            <div className="text-[10px] text-slate-500 pt-0.5 flex justify-between">
              <span>Logged Orders:</span>
              <span className="text-slate-300 font-bold">{data.orderVolume} orders</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const handleBuyNow = () => {
    if (matchingProduct) {
      addToCart(matchingProduct, 1);
    } else {
      setSelectedMarket(commodity.primaryMarketId);
      setCurrentRole('CUSTOMER');
    }
  };

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl text-slate-100 ${className}`}>
      
      {/* Header Banner */}
      <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{commodity.icon}</span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Volta Market Price Trend Index
              <span className="bg-amber-400/10 text-amber-400 border border-amber-400/20 text-xs px-2.5 py-0.5 rounded-full font-mono font-bold">
                30-Day Analysis
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Real-time historical commodity pricing aggregated across Akatsi, Abor, Dabala, Mafi, Denu, Agbozume, and Aflao markets based on actual customer transactions.
          </p>
        </div>

        {/* Commodity Switcher Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 lg:pb-0">
          {ESSENTIAL_COMMODITY_TRENDS.map(item => (
            <button
              key={item.id}
              onClick={() => setSelectedCommodityId(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap border ${
                selectedCommodityId === item.id
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg font-black'
                  : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.name.split(' ')[1] || item.name}</span>
            </button>
          ))}
        </div>

      </div>

      {/* Primary Visualizer Controls Bar */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Navigation Tabs */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
          <button
            onClick={() => setActiveTab('CHART')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'CHART'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>30-Day Trend Chart</span>
          </button>

          <button
            onClick={() => setActiveTab('COMPARISON')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'COMPARISON'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Market Hub Comparison</span>
          </button>

          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'ORDERS'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Logged Orders ({commodity.historicalOrders.length})</span>
          </button>
        </div>

        {/* Timeframe & Market Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Timeframe selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1 font-mono">
            <button
              onClick={() => setTimeframeDays(7)}
              className={`px-2.5 py-1 rounded-lg font-bold ${
                timeframeDays === 7 ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeframeDays(14)}
              className={`px-2.5 py-1 rounded-lg font-bold ${
                timeframeDays === 14 ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              14 Days
            </button>
            <button
              onClick={() => setTimeframeDays(30)}
              className={`px-2.5 py-1 rounded-lg font-bold ${
                timeframeDays === 30 ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              30 Days
            </button>
          </div>

          {/* Market Dropdown Filter */}
          <select
            value={marketFilter}
            onChange={(e) => setMarketFilter(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 text-slate-200 px-3 py-1.5 rounded-xl font-medium focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">🌐 All Volta Markets Avg</option>
            {VOLTA_MARKETS.map(m => (
              <option key={m.id} value={m.id}>
                📍 {m.name}
              </option>
            ))}
          </select>

        </div>

      </div>

      {/* Commodity Headline Metrics Grid */}
      <div className="p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/60 border-b border-slate-800">
        
        {/* Metric 1: Current Avg Price */}
        <div className="bg-slate-950 border border-slate-800/80 p-3.5 rounded-xl space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Avg Price ({timeframeDays}d)</span>
            <Tag className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
            GHS {stats.avg.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            Unit: {commodity.unit}
          </div>
        </div>

        {/* Metric 2: 30-Day Variance */}
        <div className="bg-slate-950 border border-slate-800/80 p-3.5 rounded-xl space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>{timeframeDays}-Day Trend</span>
            {stats.changePct < 0 ? (
              <TrendingDown className="w-4 h-4 text-emerald-400" />
            ) : stats.changePct > 0 ? (
              <TrendingUp className="w-4 h-4 text-rose-400" />
            ) : (
              <Minus className="w-4 h-4 text-slate-400" />
            )}
          </div>
          <div className={`text-xl sm:text-2xl font-black font-mono flex items-center gap-1 ${
            stats.changePct < 0 ? 'text-emerald-400' : stats.changePct > 0 ? 'text-rose-400' : 'text-slate-300'
          }`}>
            <span>{stats.changePct > 0 ? `+${stats.changePct}%` : `${stats.changePct}%`}</span>
          </div>
          <div className="text-[10px] text-slate-500">
            {stats.changePct < 0 ? 'Price lowered (Customer Savings)' : 'Slight seasonal demand surge'}
          </div>
        </div>

        {/* Metric 3: Price Range */}
        <div className="bg-slate-950 border border-slate-800/80 p-3.5 rounded-xl space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Price Range</span>
            <Zap className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-100 font-mono">
            GHS {stats.min.toFixed(0)} - {stats.max.toFixed(0)}
          </div>
          <div className="text-[10px] text-slate-500">
            Low: GHS {stats.min.toFixed(2)} | High: GHS {stats.max.toFixed(2)}
          </div>
        </div>

        {/* Metric 4: Cheapest Market Hub */}
        <div className="bg-slate-950 border border-amber-500/30 p-3.5 rounded-xl space-y-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-bl">
            BEST VALUE
          </div>
          <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Cheapest Market</span>
          </div>
          <div className="text-sm sm:text-base font-extrabold text-white truncate">
            {commodity.lowestPriceMarket}
          </div>
          <div className="text-xs font-mono font-bold text-emerald-400">
            GHS {commodity.lowestPriceGhs.toFixed(2)} / unit
          </div>
        </div>

      </div>

      {/* Main Tab Content */}
      <div className="p-4 sm:p-6">
        
        {/* TAB 1: RECHARTS 30-DAY HISTORICAL TREND CHART */}
        {activeTab === 'CHART' && (
          <div className="space-y-6">
            
            {/* Chart Canvas */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse" />
                  <span className="font-extrabold text-white uppercase tracking-wider">
                    {commodity.name} Price Progression (GHS)
                  </span>
                </div>

                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <button
                    onClick={() => setChartType('AREA')}
                    className={`px-2 py-0.5 rounded ${chartType === 'AREA' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                  >
                    Area
                  </button>
                  <button
                    onClick={() => setChartType('LINE')}
                    className={`px-2 py-0.5 rounded ${chartType === 'LINE' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                  >
                    Line
                  </button>
                </div>
              </div>

              <div className="h-[280px] sm:h-[340px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'AREA' ? (
                    <AreaChart data={filteredDailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                        </linearGradient>
                        <linearGradient id="colorFiltered" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.5}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#64748b" domain={['dataMin - 3', 'dataMax + 3']} tick={{ fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      
                      <Area 
                        type="monotone" 
                        dataKey={marketFilter === 'ALL' ? 'avgPriceGhs' : marketFilter} 
                        name={marketFilter === 'ALL' ? 'Volta Regional Average (GHS)' : `${marketFilter.toUpperCase()} Market Price (GHS)`}
                        stroke={marketFilter === 'ALL' ? '#f59e0b' : '#10b981'} 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill={marketFilter === 'ALL' ? 'url(#colorAvg)' : 'url(#colorFiltered)'} 
                      />
                    </AreaChart>
                  ) : (
                    <LineChart data={filteredDailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#64748b" domain={['dataMin - 3', 'dataMax + 3']} tick={{ fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      
                      <Line type="monotone" dataKey="abor" name="Abor Market" stroke="#10b981" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="akatsi" name="Akatsi Market" stroke="#f59e0b" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="dabala" name="Dabala Market" stroke="#38bdf8" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="mafi" name="Mafi Market" stroke="#a855f7" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="aflao" name="Aflao Market" stroke="#f43f5e" strokeWidth={2} dot={false} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>

            </div>

            {/* AI Buying Advice & Seasonality Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Smart Buyer Recommendation</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {commodity.buyingRecommendation}
                </p>
                <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">Volatility: <strong className="text-amber-300">{commodity.volatility}</strong></span>
                  <button 
                    onClick={handleBuyNow}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 shadow-md"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Order at GHS {commodity.lowestPriceGhs.toFixed(2)}</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="text-xs font-bold text-sky-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Info className="w-4 h-4 text-sky-400" />
                  <span>Regional Harvest & Supply Dynamics</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {commodity.seasonalityFactor}
                </p>
                <div className="pt-2 border-t border-slate-900 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Primary Production Hub:</span>
                  <span className="font-bold text-slate-200">{commodity.primaryMarketName}</span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: MARKET HUB COMPARISON TABLE */}
        {activeTab === 'COMPARISON' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-amber-400" />
                  Current Prices Across All 7 Volta Markets
                </h3>
                <p className="text-xs text-slate-400">Comparing current prices vs 30-day average for {commodity.name}</p>
              </div>

              <div className="text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-bold">
                Unit: {commodity.unit}
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 border-b border-slate-800 text-[11px] uppercase text-slate-400 font-extrabold font-mono">
                    <tr>
                      <th className="p-3">Volta Market Hub</th>
                      <th className="p-3">District</th>
                      <th className="p-3">Current Price</th>
                      <th className="p-3">30-Day Avg</th>
                      <th className="p-3">Price Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {VOLTA_MARKETS.map(market => {
                      const latestPoint = commodity.dailyData[commodity.dailyData.length - 1];
                      const currentPrice = (latestPoint as any)[market.id] || commodity.currentAvgPrice;
                      const isCheapest = market.name.toLowerCase().includes(commodity.lowestPriceMarket.toLowerCase().split(' ')[0]);

                      return (
                        <tr key={market.id} className="hover:bg-slate-900/60 transition-colors">
                          <td className="p-3 font-bold text-white flex items-center gap-2">
                            <span>📍 {market.name}</span>
                            {isCheapest && (
                              <span className="bg-emerald-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                                Lowest
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-slate-400">{market.district}</td>
                          <td className="p-3 font-mono font-black text-amber-400 text-sm">
                            GHS {currentPrice.toFixed(2)}
                          </td>
                          <td className="p-3 font-mono text-slate-400">
                            GHS {commodity.currentAvgPrice.toFixed(2)}
                          </td>
                          <td className="p-3">
                            {currentPrice < commodity.currentAvgPrice ? (
                              <span className="text-emerald-400 font-bold flex items-center gap-1">
                                <TrendingDown className="w-3.5 h-3.5" />
                                {Math.round(((commodity.currentAvgPrice - currentPrice) / commodity.currentAvgPrice) * 100)}% Cheaper
                              </span>
                            ) : currentPrice > commodity.currentAvgPrice ? (
                              <span className="text-amber-400 font-bold flex items-center gap-1">
                                <TrendingUp className="w-3.5 h-3.5" />
                                {Math.round(((currentPrice - commodity.currentAvgPrice) / commodity.currentAvgPrice) * 100)}% Premium
                              </span>
                            ) : (
                              <span className="text-slate-400 font-bold">Standard Avg</span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedMarket(market.id);
                                setCurrentRole('CUSTOMER');
                              }}
                              className="bg-slate-900 border border-slate-800 hover:border-amber-500 hover:text-amber-400 text-slate-300 px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
                            >
                              Browse Market
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LOGGED HISTORICAL ORDERS */}
        {activeTab === 'ORDERS' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-400" />
                Actual Transaction Ledger Supporting {commodity.name}
              </h3>
              <p className="text-xs text-slate-400">Historical customer orders completed in the last 30 days in Volta region</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 border-b border-slate-800 text-[11px] uppercase text-slate-400 font-extrabold font-mono">
                    <tr>
                      <th className="p-3">Order Code</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Market</th>
                      <th className="p-3">Trader Enterprise</th>
                      <th className="p-3">Unit Price Paid</th>
                      <th className="p-3">Qty</th>
                      <th className="p-3 text-right">Total (GHS)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 font-mono">
                    {commodity.historicalOrders.map((ord, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/60 transition-colors">
                        <td className="p-3 font-extrabold text-amber-400">{ord.orderCode}</td>
                        <td className="p-3 text-slate-300">{ord.date}</td>
                        <td className="p-3 font-bold text-white">{ord.marketName}</td>
                        <td className="p-3 text-slate-300">{ord.traderName}</td>
                        <td className="p-3 text-emerald-400 font-black">GHS {ord.unitPriceGhs.toFixed(2)}</td>
                        <td className="p-3 text-slate-300">{ord.qty}</td>
                        <td className="p-3 text-right font-black text-white">GHS {ord.totalGhs.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
