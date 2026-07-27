import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod } from '../../types';
import { 
  DollarSign, 
  QrCode, 
  Smartphone, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ArrowUpRight, 
  RefreshCw, 
  Send,
  Zap,
  Building2,
  Lock,
  Wallet
} from 'lucide-react';

export const AdminPaymentsLedger: React.FC = () => {
  const { orders, traders, riders } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGateway, setSelectedGateway] = useState<string>('ALL');
  const [payoutFilter, setPayoutFilter] = useState<'ALL' | 'SETTLED' | 'PENDING'>('ALL');
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [batchSuccessMsg, setBatchSuccessMsg] = useState<string | null>(null);

  // Financial Calculations
  const totalVolumeGhs = useMemo(() => orders.reduce((sum, o) => sum + o.totalGhs, 0), [orders]);
  const totalDeliveryFees = useMemo(() => orders.reduce((sum, o) => sum + o.deliveryFeeGhs, 0), [orders]);
  const totalItemsSubtotal = useMemo(() => orders.reduce((sum, o) => sum + o.subtotalGhs, 0), [orders]);
  
  // Platform 2% Service Fee
  const platformCommissionGhs = useMemo(() => totalItemsSubtotal * 0.02, [totalItemsSubtotal]);
  const netTraderPayoutsGhs = useMemo(() => totalItemsSubtotal * 0.98, [totalItemsSubtotal]);

  // Breakdown by Gateway
  const gatewayBreakdown = useMemo(() => {
    const map: { [key in PaymentMethod]?: { count: number; volumeGhs: number } } = {};
    orders.forEach(o => {
      if (!map[o.paymentMethod]) {
        map[o.paymentMethod] = { count: 0, volumeGhs: 0 };
      }
      map[o.paymentMethod]!.count += 1;
      map[o.paymentMethod]!.volumeGhs += o.totalGhs;
    });
    return map;
  }, [orders]);

  // Simulated transaction log list generated from orders
  const transactions = useMemo(() => {
    return orders.map((o, idx) => {
      const isQr = idx % 2 === 0; // Simulate alternating between QR Scan and Push Prompt
      const isSettled = o.status === 'DELIVERED' || idx % 3 !== 0;
      return {
        id: `TXN-VR-${100000 + idx * 47}`,
        orderId: o.id,
        marketId: o.marketId,
        date: o.createdAt,
        customerName: o.customerName,
        customerPhone: o.momoNumber || o.customerPhone,
        paymentMethod: o.paymentMethod,
        mode: isQr ? 'Scan-to-Pay QR' : 'USSD Push Prompt',
        grossAmountGhs: o.totalGhs,
        subtotalGhs: o.subtotalGhs,
        deliveryFeeGhs: o.deliveryFeeGhs,
        commissionGhs: o.subtotalGhs * 0.02,
        traderPayoutGhs: o.subtotalGhs * 0.98,
        status: isSettled ? 'SETTLED' : 'PENDING',
        settlementRef: isSettled ? `GHIPSS-${99000 + idx * 83}` : 'PENDING_BATCH'
      };
    });
  }, [orders]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = 
        t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.customerPhone.includes(searchTerm) ||
        t.customerName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGateway = selectedGateway === 'ALL' || t.paymentMethod === selectedGateway;
      const matchesPayout = payoutFilter === 'ALL' || t.status === payoutFilter;

      return matchesSearch && matchesGateway && matchesPayout;
    });
  }, [transactions, searchTerm, selectedGateway, payoutFilter]);

  const handleBatchPayout = () => {
    setIsProcessingBatch(true);
    setBatchSuccessMsg(null);
    setTimeout(() => {
      setIsProcessingBatch(false);
      setBatchSuccessMsg(`Successfully processed GhIPSS batch MoMo payout of ₵${netTraderPayoutsGhs.toFixed(2)} to ${traders.length} Volta Market traders & ${riders.length} dispatch riders!`);
      setTimeout(() => setBatchSuccessMsg(null), 5000);
    }, 1800);
  };

  const getGatewayBadge = (method: PaymentMethod) => {
    switch (method) {
      case 'MTN_MOMO':
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded">MTN MoMo</span>;
      case 'TELECEL_CASH':
        return <span className="bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-bold px-2 py-0.5 rounded">Telecel Cash</span>;
      case 'AT_MONEY':
        return <span className="bg-sky-500/10 text-sky-400 border border-sky-500/30 text-[10px] font-bold px-2 py-0.5 rounded">AT Money</span>;
      case 'CARD':
        return <span className="bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[10px] font-bold px-2 py-0.5 rounded">Bank Card</span>;
      case 'COD':
        return <span className="bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">Cash on Delivery</span>;
      default:
        return <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded">{method}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Financial Overview Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
            <span>Gross Platform Volume</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            ₵{totalVolumeGhs.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400">
            Across {orders.length} total orders
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
            <span>Trader Net Payouts (98%)</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            ₵{netTraderPayoutsGhs.toFixed(2)}
          </div>
          <div className="text-[11px] text-emerald-300/80">
            Disbursed to market stall accounts
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
            <span>Rider Delivery Fees</span>
            <Zap className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-sky-400 font-mono">
            ₵{totalDeliveryFees.toFixed(2)}
          </div>
          <div className="text-[11px] text-sky-300/80">
            100% passed to verified dispatch riders
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
            <span>Platform Commission (2%)</span>
            <Building2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400 font-mono">
            ₵{platformCommissionGhs.toFixed(2)}
          </div>
          <div className="text-[11px] text-purple-300/80">
            Volta Flash Cart operating revenue
          </div>
        </div>

      </div>

      {/* Gateway Revenue Breakdown Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-amber-400" /> Ghana Mobile Money Gateway Distribution
            </h3>
            <p className="text-xs text-slate-400">
              Live processing metrics across MTN Mobile Money, Telecel Cash, AT Money, and Cards
            </p>
          </div>

          <button
            onClick={handleBatchPayout}
            disabled={isProcessingBatch}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isProcessingBatch ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Processing Batch MoMo Payout...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Trigger GhIPSS MoMo Payout to Traders
              </>
            )}
          </button>
        </div>

        {batchSuccessMsg && (
          <div className="bg-emerald-950/80 border border-emerald-500/50 p-3.5 rounded-xl text-xs text-emerald-300 font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{batchSuccessMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          
          <div className="bg-slate-950 border border-amber-500/30 p-3.5 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-xs text-amber-400 font-bold">
              <span>MTN Mobile Money</span>
              <span className="font-mono text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded">*170#</span>
            </div>
            <div className="text-lg font-black text-white font-mono">
              ₵{(gatewayBreakdown['MTN_MOMO']?.volumeGhs || 0).toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-400">
              {gatewayBreakdown['MTN_MOMO']?.count || 0} Transactions processed
            </div>
          </div>

          <div className="bg-slate-950 border border-rose-500/30 p-3.5 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-xs text-rose-400 font-bold">
              <span>Telecel Cash</span>
              <span className="font-mono text-[10px] bg-rose-500/20 px-1.5 py-0.5 rounded">*110#</span>
            </div>
            <div className="text-lg font-black text-white font-mono">
              ₵{(gatewayBreakdown['TELECEL_CASH']?.volumeGhs || 0).toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-400">
              {gatewayBreakdown['TELECEL_CASH']?.count || 0} Transactions processed
            </div>
          </div>

          <div className="bg-slate-950 border border-sky-500/30 p-3.5 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-xs text-sky-400 font-bold">
              <span>AT Money</span>
              <span className="font-mono text-[10px] bg-sky-500/20 px-1.5 py-0.5 rounded">*718#</span>
            </div>
            <div className="text-lg font-black text-white font-mono">
              ₵{(gatewayBreakdown['AT_MONEY']?.volumeGhs || 0).toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-400">
              {gatewayBreakdown['AT_MONEY']?.count || 0} Transactions processed
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
              <span>Cash on Delivery / Card</span>
              <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">COD/Card</span>
            </div>
            <div className="text-lg font-black text-white font-mono">
              ₵{((gatewayBreakdown['COD']?.volumeGhs || 0) + (gatewayBreakdown['CARD']?.volumeGhs || 0)).toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-400">
              {((gatewayBreakdown['COD']?.count || 0) + (gatewayBreakdown['CARD']?.count || 0))} Transactions processed
            </div>
          </div>

        </div>
      </div>

      {/* Transaction Filter & Search Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Ref ID, Phone, Customer..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Gateway & Status Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={selectedGateway}
              onChange={e => setSelectedGateway(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Payment Gateways</option>
              <option value="MTN_MOMO">MTN Mobile Money</option>
              <option value="TELECEL_CASH">Telecel Cash</option>
              <option value="AT_MONEY">AT Money</option>
              <option value="CARD">Bank Card</option>
              <option value="COD">Cash on Delivery</option>
            </select>

            <select
              value={payoutFilter}
              onChange={e => setPayoutFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Settlement Statuses</option>
              <option value="SETTLED">Settled to MoMo</option>
              <option value="PENDING">Pending Batch</option>
            </select>
          </div>

        </div>

        {/* Financial Transactions Audit Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="p-3">Txn Ref & Order ID</th>
                <th className="p-3">Customer / Phone</th>
                <th className="p-3">Gateway</th>
                <th className="p-3">Mode</th>
                <th className="p-3 text-right">Gross (₵)</th>
                <th className="p-3 text-right">Comm (2%)</th>
                <th className="p-3 text-right">Net Trader (₵)</th>
                <th className="p-3">Settlement Ref</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-slate-500 italic">
                    No transaction records match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(t => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3">
                      <div className="font-mono font-bold text-amber-400">{t.id}</div>
                      <div className="text-[10px] text-slate-500">Order #{t.orderId}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-white">{t.customerName}</div>
                      <div className="font-mono text-[11px] text-slate-400">{t.customerPhone}</div>
                    </td>
                    <td className="p-3">
                      {getGatewayBadge(t.paymentMethod)}
                    </td>
                    <td className="p-3">
                      <span className="text-[11px] text-slate-300 font-medium flex items-center gap-1">
                        {t.mode.includes('QR') ? (
                          <QrCode className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        {t.mode}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-black text-white">
                      ₵{t.grossAmountGhs.toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-mono text-purple-400">
                      ₵{t.commissionGhs.toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-400">
                      ₵{t.traderPayoutGhs.toFixed(2)}
                    </td>
                    <td className="p-3 font-mono text-[10px] text-slate-400">
                      {t.settlementRef}
                    </td>
                    <td className="p-3 text-right">
                      {t.status === 'SETTLED' ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Settled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3 text-amber-400" /> Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
