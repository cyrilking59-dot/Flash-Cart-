import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VOLTA_MARKETS } from '../../data/seedData';
import { AdminAnalytics } from './AdminAnalytics';
import { AdminPaymentsLedger } from './AdminPaymentsLedger';
import { 
  ShieldCheck, 
  Users, 
  Store, 
  Bike, 
  Package, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  FileText,
  BarChart3,
  CreditCard
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    traders, 
    riders, 
    orders, 
    products, 
    toggleRiderVerification 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'PAYMENTS' | 'RIDERS'>('PAYMENTS');

  const totalRevenueGhs = orders.reduce((sum, o) => sum + o.totalGhs, 0);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h2 className="text-2xl font-black text-white">System Admin & Market Control Panel</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Volta Region Regional Dispatch System Hub • Abor, Akatsi, Dabala, Mafi, Denu, Agbozume, Aflao
          </p>
        </div>

        <div className="bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 text-right">
          <div className="text-[10px] text-slate-400 uppercase font-bold">Total Platform Volume</div>
          <div className="text-xl font-black text-amber-400 font-mono">₵{totalRevenueGhs.toFixed(2)}</div>
        </div>
      </div>

      {/* Admin Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('PAYMENTS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'PAYMENTS'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" /> MoMo Payments & Financial Ledger
        </button>
        <button
          onClick={() => setActiveTab('ANALYTICS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'ANALYTICS'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Market Analytics & Insights
        </button>
        <button
          onClick={() => setActiveTab('RIDERS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'RIDERS'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Bike className="w-4 h-4" /> Rider Verification Audits ({riders.length})
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Store className="w-4 h-4 text-amber-400" /> Registered Traders
          </div>
          <div className="text-2xl font-black text-white font-mono">{traders.length}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Bike className="w-4 h-4 text-emerald-400" /> Verified Riders
          </div>
          <div className="text-2xl font-black text-white font-mono">{riders.filter(r => r.verified).length}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Package className="w-4 h-4 text-sky-400" /> Active Market Items
          </div>
          <div className="text-2xl font-black text-white font-mono">{products.length}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-rose-400" /> Total Orders
          </div>
          <div className="text-2xl font-black text-white font-mono">{orders.length}</div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'PAYMENTS' && <AdminPaymentsLedger />}
      {activeTab === 'ANALYTICS' && <AdminAnalytics />}

      {/* Rider Ghana Card Audits Tab */}
      {activeTab === 'RIDERS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Bike className="w-5 h-5 text-amber-400" /> Rider Verification & Ghana Card Compliance
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3">Rider Name</th>
                  <th className="p-3">Ghana Card Number</th>
                  <th className="p-3">Primary Market</th>
                  <th className="p-3">Vehicle</th>
                  <th className="p-3">Deliveries</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {riders.map(r => (
                  <tr key={r.id} className="hover:bg-slate-800/50">
                    <td className="p-3 font-bold text-white flex items-center gap-2">
                      <img src={r.passportPhoto} className="w-7 h-7 rounded-lg object-cover" alt={r.name} />
                      {r.name}
                    </td>
                    <td className="p-3 font-mono text-emerald-400">{r.ghanaCardNo}</td>
                    <td className="p-3 capitalize">{VOLTA_MARKETS.find(m => m.id === r.primaryMarket)?.name}</td>
                    <td className="p-3">{r.vehicleType.replace(/_/g, ' ')} ({r.vehiclePlate})</td>
                    <td className="p-3 font-bold">{r.totalDeliveries}</td>
                    <td className="p-3">
                      {r.verified ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="text-rose-400 font-bold flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Pending Audit
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => toggleRiderVerification(r.id)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold text-[10px]"
                      >
                        Toggle Verification
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
