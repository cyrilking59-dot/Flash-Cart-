import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VOLTA_MARKETS } from '../../data/seedData';
import { ProductCategory, Product, VoltaMarketId } from '../../types';
import { 
  Store, 
  Plus, 
  Trash2, 
  Sparkles, 
  MapPin, 
  DollarSign, 
  ShoppingBag, 
  CheckCircle2, 
  TrendingUp, 
  X,
  Package,
  Check,
  CreditCard,
  Wallet,
  Send,
  RefreshCw,
  Clock,
  Smartphone,
  ShieldCheck,
  ArrowUpRight
} from 'lucide-react';

export const TraderDashboard: React.FC = () => {
  const { 
    traders, 
    products, 
    addProduct, 
    deleteProduct, 
    registerTrader, 
    orders,
    selectedMarket,
    setActiveModal
  } = useApp();

  const currentTrader = traders[0]; // Active demo trader (Mama Adzo)

  const [activeTab, setActiveTab] = useState<'INVENTORY' | 'PAYMENTS'>('INVENTORY');
  const [isCashingOut, setIsCashingOut] = useState(false);
  const [cashoutMsg, setCashoutMsg] = useState<string | null>(null);

  // Add product form modal state
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState<ProductCategory>('Gari & Grains');
  const [prodMarket, setProdMarket] = useState<VoltaMarketId>(currentTrader?.marketId || 'akatsi');
  const [prodPrice, setProdPrice] = useState<number>(45.0);
  const [prodUnit, setProdUnit] = useState('Per Olonka (2.5kg)');
  const [prodStock, setProdStock] = useState<number>(50);
  const [prodDescription, setProdDescription] = useState('');
  const [prodImage, setProdImage] = useState('https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600');
  
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);

  // Registration modal for new trader
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regName, setRegName] = useState('');
  const [regShopName, setRegShopName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regMarket, setRegMarket] = useState<VoltaMarketId>('akatsi');
  const [regStall, setRegStall] = useState('Stall #24');
  const [regCategory, setRegCategory] = useState('Fresh Produce & Foodstuffs');

  const traderProducts = products.filter(p => p.traderId === currentTrader?.id);
  const traderOrders = orders.filter(o => o.items.some(i => i.traderId === currentTrader?.id));

  const totalEarningsGhs = traderOrders.reduce((sum, o) => {
    const itemSub = o.items.filter(i => i.traderId === currentTrader?.id).reduce((s, i) => s + i.priceGhs * i.quantity, 0);
    return sum + itemSub;
  }, 0);

  const netTraderEarningsGhs = totalEarningsGhs * 0.98;
  const platformFeeGhs = totalEarningsGhs * 0.02;

  const handleRequestCashout = () => {
    setIsCashingOut(true);
    setCashoutMsg(null);
    setTimeout(() => {
      setIsCashingOut(false);
      setCashoutMsg(`Instant Mobile Money Transfer of ₵${netTraderEarningsGhs.toFixed(2)} sent to MTN MoMo Wallet (${currentTrader?.phone || '0248881234'})!`);
      setTimeout(() => setCashoutMsg(null), 5000);
    }, 1500);
  };

  const handleGenerateAiDescription = async () => {
    if (!prodName) return;
    setIsGeneratingAi(true);
    setAiAdvice(null);

    const marketObj = VOLTA_MARKETS.find(m => m.id === prodMarket);
    try {
      const res = await fetch('/api/ai/product-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: prodName,
          category: prodCategory,
          marketName: marketObj?.name,
          unit: prodUnit,
          basePrice: prodPrice
        })
      });
      const data = await res.json();
      if (data.description) {
        setProdDescription(data.description);
      }
      if (data.priceAdvice) {
        setAiAdvice(data.priceAdvice);
      }
    } catch (e) {
      setProdDescription(`Fresh ${prodName} directly processed and supplied at ${marketObj?.name || 'Volta market'}. High quality and ready for fast delivery.`);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTrader) return;

    addProduct({
      traderId: currentTrader.id,
      traderName: currentTrader.shopName,
      marketId: prodMarket,
      name: prodName,
      category: prodCategory,
      priceGhs: Number(prodPrice),
      unit: prodUnit,
      stock: Number(prodStock),
      description: prodDescription || `Fresh ${prodName} from ${currentTrader.shopName}.`,
      image: prodImage
    });

    setShowAddProductModal(false);
    setProdName('');
    setProdDescription('');
  };

  const handleRegisterTraderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerTrader({
      name: regName,
      shopName: regShopName,
      phone: regPhone,
      marketId: regMarket,
      stallNumber: regStall,
      category: regCategory,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'
    });
    setShowRegisterModal(false);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Trader Stall Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentTrader?.avatar}
            alt={currentTrader?.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400/60 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">{currentTrader?.shopName}</h2>
              {currentTrader?.verified && (
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified Market Trader
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Owner: <strong className="text-slate-200">{currentTrader?.name}</strong> • Location: <span className="text-amber-400 font-semibold">{currentTrader?.stallNumber}</span> ({VOLTA_MARKETS.find(m => m.id === currentTrader?.marketId)?.name})
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setActiveModal('PRICE_TRENDS')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
          >
            <TrendingUp className="w-4 h-4 text-amber-400" /> Market Price Trends
          </button>
          <button
            onClick={() => setShowRegisterModal(true)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-colors"
          >
            + Register New Store/Shop
          </button>
          <button
            onClick={() => setShowAddProductModal(true)}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Upload New Product
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
            <div className="text-xs text-slate-400 font-medium">Total Shop Sales</div>
            <div className="text-xl font-black text-white font-mono">₵{totalEarningsGhs.toFixed(2)}</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-md">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Listed Products</div>
            <div className="text-xl font-black text-white font-mono">{traderProducts.length} Items</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-md">
          <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Store Orders Handled</div>
            <div className="text-xl font-black text-white font-mono">{traderOrders.length} Orders</div>
          </div>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('INVENTORY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'INVENTORY'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Store className="w-4 h-4" /> Stall Inventory ({traderProducts.length})
        </button>

        <button
          onClick={() => setActiveTab('PAYMENTS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'PAYMENTS'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" /> Sales & MoMo Payout Ledger
        </button>
      </div>

      {/* Listed Products Section */}
      {activeTab === 'INVENTORY' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <Store className="w-5 h-5 text-amber-400" /> My Stall Inventory & Products
            </h3>
            <span className="text-xs text-slate-400">Items visible in Volta Storefront</span>
          </div>

          {traderProducts.length === 0 ? (
            <div className="text-center py-12 bg-slate-900 rounded-2xl border border-slate-800 text-slate-500">
              No products uploaded yet. Click <strong>"Upload New Product"</strong> to list your Akatsi Gari, Tilapia, or Fabrics!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {traderProducts.map(p => (
                <div
                  key={p.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex gap-4 items-center justify-between shadow-md"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-20 h-20 rounded-xl object-cover bg-slate-950 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-amber-400 uppercase">{p.category}</div>
                    <h4 className="font-bold text-white text-sm truncate">{p.name}</h4>
                    <p className="text-xs text-slate-400">{p.unit} • Stock: <strong className="text-emerald-400">{p.stock}</strong></p>
                    <div className="text-sm font-black text-amber-400 font-mono mt-1">₵{p.priceGhs.toFixed(2)}</div>
                  </div>

                  <button
                    onClick={() => deleteProduct(p.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg"
                    title="Delete product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Shop Earnings & MoMo Payout Ledger */}
      {activeTab === 'PAYMENTS' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Active MoMo Account & Instant Cashout Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
                <Wallet className="w-8 h-8" />
              </div>
              <div>
                <div className="text-xs uppercase font-bold text-slate-400">MoMo Payout Wallet</div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <span>MTN Mobile Money</span>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Account Name: <strong className="text-slate-200">{currentTrader?.name}</strong> • Phone: <strong className="text-amber-400 font-mono">{currentTrader?.phone || '0248881234'}</strong>
                </p>
              </div>
            </div>

            <div className="text-left md:text-right w-full md:w-auto space-y-2">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">Net Balance Available</div>
                <div className="text-2xl font-black text-emerald-400 font-mono">₵{netTraderEarningsGhs.toFixed(2)}</div>
                <div className="text-[10px] text-slate-500">Gross ₵{totalEarningsGhs.toFixed(2)} - 2% fee (₵{platformFeeGhs.toFixed(2)})</div>
              </div>

              <button
                onClick={handleRequestCashout}
                disabled={isCashingOut || netTraderEarningsGhs === 0}
                className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isCashingOut ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Transferring to MoMo...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Request Instant MoMo Cashout
                  </>
                )}
              </button>
            </div>
          </div>

          {cashoutMsg && (
            <div className="bg-emerald-950/80 border border-emerald-500/50 p-4 rounded-xl text-xs text-emerald-300 font-bold flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>{cashoutMsg}</span>
            </div>
          )}

          {/* Sales Transactions Audit Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" /> Itemized Stall Sales & Payment Audit
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Order # & Date</th>
                    <th className="p-3">Items Purchased</th>
                    <th className="p-3">Payment Method</th>
                    <th className="p-3 text-right">Gross Subtotal (₵)</th>
                    <th className="p-3 text-right">Fee (2%)</th>
                    <th className="p-3 text-right">Net Payout (₵)</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {traderOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-500 italic">
                        No store sales recorded yet.
                      </td>
                    </tr>
                  ) : (
                    traderOrders.map(o => {
                      const stallSub = o.items
                        .filter(i => i.traderId === currentTrader?.id)
                        .reduce((sum, i) => sum + i.priceGhs * i.quantity, 0);
                      const stallNet = stallSub * 0.98;
                      const stallFee = stallSub * 0.02;

                      return (
                        <tr key={o.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3">
                            <div className="font-mono font-bold text-amber-400">Order #{o.id}</div>
                            <div className="text-[10px] text-slate-500">{new Date(o.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                          </td>
                          <td className="p-3">
                            {o.items.filter(i => i.traderId === currentTrader?.id).map((i, idx) => (
                              <div key={idx} className="text-xs text-white font-medium">
                                {i.quantity}x {i.productName} <span className="text-slate-500">(₵{i.priceGhs.toFixed(2)}/ea)</span>
                              </div>
                            ))}
                          </td>
                          <td className="p-3 font-mono text-[11px] text-slate-300">
                            {o.paymentMethod.replace(/_/g, ' ')}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-white">
                            ₵{stallSub.toFixed(2)}
                          </td>
                          <td className="p-3 text-right font-mono text-slate-400">
                            ₵{stallFee.toFixed(2)}
                          </td>
                          <td className="p-3 text-right font-mono font-black text-emerald-400">
                            ₵{stallNet.toFixed(2)}
                          </td>
                          <td className="p-3 text-right">
                            <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Settled
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* Upload Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-400" /> Upload Product to Flash Cart Market
              </h3>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="p-5 overflow-y-auto space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fine Sugar-Crisp Akatsi Gari"
                  value={prodName}
                  onChange={e => setProdName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Volta Market Location</label>
                  <select
                    value={prodMarket}
                    onChange={e => setProdMarket(e.target.value as VoltaMarketId)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {VOLTA_MARKETS.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={prodCategory}
                    onChange={e => setProdCategory(e.target.value as ProductCategory)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Gari & Grains">Gari & Grains</option>
                    <option value="Fresh Seafood & Fish">Fresh Seafood & Fish</option>
                    <option value="Kente & Textiles">Kente & Textiles</option>
                    <option value="Tubers & Plantain">Tubers & Plantain</option>
                    <option value="Vegetables & Spices">Vegetables & Spices</option>
                    <option value="Oils & Provisions">Oils & Provisions</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Price (GHS ₵)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={prodPrice}
                    onChange={e => setProdPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Per Olonka"
                    value={prodUnit}
                    onChange={e => setProdUnit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={e => setProdStock(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Gemini AI Product Description Generator */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">Description</label>
                  <button
                    type="button"
                    onClick={handleGenerateAiDescription}
                    disabled={isGeneratingAi || !prodName}
                    className="text-[11px] text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 disabled:opacity-50"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    {isGeneratingAi ? 'AI Writing Description...' : 'Generate AI Description'}
                  </button>
                </div>

                <textarea
                  rows={3}
                  placeholder="Enter details or click 'Generate AI Description'"
                  value={prodDescription}
                  onChange={e => setProdDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />

                {aiAdvice && (
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[11px] text-emerald-300 font-semibold">
                    💡 Gemini Market Pricing Insight: {aiAdvice}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-3 rounded-xl shadow-lg transition-all"
              >
                Save & Publish to Market
              </button>

            </form>

          </div>
        </div>
      )}

      {/* Register Trader Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-white text-base">Register Trader Account & Shop</h3>
              <button onClick={() => setShowRegisterModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterTraderSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Trader Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mama Adzo Akpene"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Store / Shop Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mama Adzo Gari Enterprise"
                  value={regShopName}
                  onChange={e => setRegShopName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Volta Market</label>
                  <select
                    value={regMarket}
                    onChange={e => setRegMarket(e.target.value as VoltaMarketId)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    {VOLTA_MARKETS.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Stall Number / Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Block C, Stall #14"
                    value={regStall}
                    onChange={e => setRegStall(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Contact Phone</label>
                <input
                  type="text"
                  required
                  placeholder="+233 24 123 4567"
                  value={regPhone}
                  onChange={e => setRegPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow mt-2"
              >
                Create Trader Stall Account
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
