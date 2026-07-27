import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { VOLTA_MARKETS } from '../../data/seedData';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, BarChart3, ShoppingBag, Store, MapPin, Award, Zap, DollarSign, Activity
} from 'lucide-react';

export const AdminAnalytics: React.FC = () => {
  const { orders, products, traders, riders } = useApp();

  // 1. Calculate orders & revenue per market
  const marketAnalyticsData = useMemo(() => {
    return VOLTA_MARKETS.map(market => {
      const marketOrders = orders.filter(o => o.marketId === market.id);
      const totalVolumeGhs = marketOrders.reduce((sum, o) => sum + o.totalGhs, 0);
      const totalItems = marketOrders.reduce((sum, o) => sum + o.items.reduce((iSum, item) => iSum + item.quantity, 0), 0);

      return {
        marketId: market.id,
        name: market.name.replace(' Market', ''),
        district: market.district,
        ordersCount: marketOrders.length,
        volumeGhs: totalVolumeGhs,
        itemsSold: totalItems,
        avgOrderValue: marketOrders.length > 0 ? totalVolumeGhs / marketOrders.length : 0
      };
    });
  }, [orders]);

  // 2. Top-performing products calculation
  const topProductsData = useMemo(() => {
    const productStatsMap: { [key: string]: { name: string; category: string; traderName: string; marketName: string; quantity: number; revenueGhs: number } } = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        if (!productStatsMap[item.productName]) {
          const market = VOLTA_MARKETS.find(m => m.id === order.marketId);
          productStatsMap[item.productName] = {
            name: item.productName,
            category: 'Produce',
            traderName: item.traderName,
            marketName: market ? market.name.replace(' Market', '') : 'Volta',
            quantity: 0,
            revenueGhs: 0
          };
        }
        productStatsMap[item.productName].quantity += item.quantity;
        productStatsMap[item.productName].revenueGhs += item.priceGhs * item.quantity;
      });
    });

    return Object.values(productStatsMap)
      .sort((a, b) => b.revenueGhs - a.revenueGhs)
      .slice(0, 6);
  }, [orders]);

  // 3. Category Revenue Breakdown
  const categoryData = useMemo(() => {
    const categoryStats: { [key: string]: number } = {
      'Produce & Grains': 0,
      'Fish & Seafood': 0,
      'Textiles & Kente': 0,
      'Vegetables & Spices': 0,
      'Oils & Provisions': 0
    };

    orders.forEach(order => {
      order.items.forEach(item => {
        const prod = products.find(p => p.id === item.productId || p.name === item.productName);
        const category = prod ? prod.category : 'Produce & Grains';
        categoryStats[category] = (categoryStats[category] || 0) + (item.priceGhs * item.quantity);
      });
    });

    const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'];

    return Object.entries(categoryStats).map(([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length]
    })).filter(c => c.value > 0);
  }, [orders, products]);

  // Total Summary
  const totalVolumeGhs = useMemo(() => orders.reduce((sum, o) => sum + o.totalGhs, 0), [orders]);
  const totalItemsSold = useMemo(() => orders.reduce((sum, o) => sum + o.items.reduce((iSum, item) => iSum + item.quantity, 0), 0), [orders]);
  const topMarket = useMemo(() => {
    if (marketAnalyticsData.length === 0) return 'Akatsi';
    const sorted = [...marketAnalyticsData].sort((a, b) => b.volumeGhs - a.volumeGhs);
    return sorted[0];
  }, [marketAnalyticsData]);

  return (
    <div className="space-y-6">
      
      {/* Overview Metric Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Market Volume</div>
            <div className="text-xl font-black text-white font-mono">₵{totalVolumeGhs.toFixed(2)}</div>
            <div className="text-[10px] text-emerald-400 font-semibold">+18.4% this week</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Produce Units Delivered</div>
            <div className="text-xl font-black text-white font-mono">{totalItemsSold} Units</div>
            <div className="text-[10px] text-slate-400 font-semibold">Across {orders.length} Completed Orders</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-3 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-xl">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Leading Market Hub</div>
            <div className="text-lg font-black text-white truncate max-w-[140px]">{topMarket.name}</div>
            <div className="text-[10px] text-amber-400 font-semibold font-mono">₵{topMarket.volumeGhs.toFixed(2)} volume</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Top Produce Item</div>
            <div className="text-sm font-black text-white truncate max-w-[140px]">
              {topProductsData[0]?.name || 'Akatsi Fine Gari'}
            </div>
            <div className="text-[10px] text-purple-300 font-semibold font-mono">
              {topProductsData[0]?.quantity || 0} units sold
            </div>
          </div>
        </div>

      </div>

      {/* Chart Row 1: Market Volume Bar Chart & Category Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Market Revenue & Orders Bar Chart */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-400" /> Regional Market Activity (Abor to Aflao)
              </h3>
              <p className="text-xs text-slate-400">
                Total dispatch volume (₵ GHS) and completed orders per Volta market hub
              </p>
            </div>
            <span className="text-[10px] font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-amber-400 font-bold">
              7 Active Markets
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marketAnalyticsData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  formatter={(value: any, name: any) => [
                    name === 'volumeGhs' ? `₵${Number(value).toFixed(2)}` : `${value} Orders`,
                    name === 'volumeGhs' ? 'Volume (GHS)' : 'Orders Count'
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="volumeGhs" name="Volume (GHS ₵)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                <Bar dataKey="ordersCount" name="Orders Count" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Pie Chart */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" /> Sales by Category
            </h3>
            <p className="text-xs text-slate-400">Volume distribution across produce categories</p>
          </div>

          <div className="h-52 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  formatter={(value: any) => [`₵${Number(value).toFixed(2)}`, 'Revenue']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            {categoryData.map(c => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-slate-300 font-medium truncate max-w-[130px]">{c.name}</span>
                </div>
                <span className="font-mono font-bold text-white">₵{c.value.toFixed(2)}</span>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Top Performing Products Leaderboard */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" /> Top Performing Hyperlocal Produce & Crafts
            </h3>
            <p className="text-xs text-slate-400">Best-selling items by revenue and quantity across Volta markets</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">Ranked by Revenue (GHS)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topProductsData.map((p, index) => (
            <div key={p.name} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-bl-lg font-mono">
                #{index + 1}
              </div>

              <div className="font-bold text-white text-sm truncate pr-8">{p.name}</div>
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-emerald-400" />
                <span className="truncate">{p.traderName} • {p.marketName}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Quantity Sold</span>
                  <strong className="text-slate-200">{p.quantity} Units</strong>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block uppercase">Total Revenue</span>
                  <strong className="text-amber-400 text-sm">₵{p.revenueGhs.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
