import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { VOLTA_MARKETS } from '../data/seedData';
import { VoltaMarketId, UserRole } from '../types';
import { 
  ShoppingBag, 
  Store, 
  Bike, 
  ShieldCheck, 
  FileText, 
  Sparkles, 
  Bell, 
  MapPin, 
  ChevronDown,
  CheckCircle2,
  X,
  Smartphone,
  Trash2,
  Compass,
  Users,
  TrendingUp
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentRole, 
    setCurrentRole, 
    selectedMarket, 
    setSelectedMarket, 
    cart, 
    notifications, 
    markNotificationAsRead,
    clearAllNotifications,
    setActiveModal,
    customer
  } = useApp();

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showMarketDropdown, setShowMarketDropdown] = useState(false);

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const unreadNotifs = notifications.filter(n => !n.read);

  const roles: { id: UserRole | 'REPORT'; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'CUSTOMER', label: 'Customer', icon: <ShoppingBag className="w-4 h-4" />, desc: 'Browse Volta markets & order produce' },
    { id: 'DIRECTORY', label: 'Items & Locations', icon: <Compass className="w-4 h-4" />, desc: 'Directory of all items, prices & market locations' },
    { id: 'SPACE', label: 'Market Space', icon: <Users className="w-4 h-4" />, desc: 'Market forum, trader notices & group deals' },
    { id: 'TRADER', label: 'Trader Store', icon: <Store className="w-4 h-4" />, desc: 'Manage stall, products & sales' },
    { id: 'RIDER', label: 'Rider Dispatch', icon: <Bike className="w-4 h-4" />, desc: 'First to accept order gets job' },
    { id: 'ADMIN', label: 'System Admin', icon: <ShieldCheck className="w-4 h-4" />, desc: 'Market oversight & rider verification' },
    { id: 'REPORT', label: 'Deliverables & ERD', icon: <FileText className="w-4 h-4" />, desc: 'Database schema, use-case & report' },
  ];

  const currentMarketName = selectedMarket === 'ALL' 
    ? 'All Volta Markets' 
    : VOLTA_MARKETS.find(m => m.id === selectedMarket)?.name || 'Select Market';

  return (
    <header id="flash-cart-navbar" className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-lg">
      {/* Top Banner with Role Quick Switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Logo & Brand */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-emerald-600 to-amber-400 p-0.5 shadow-md">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center font-black text-amber-400 text-xl tracking-wider">
                  ⚡FC
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                    Flash Cart <span className="text-amber-400 font-semibold text-xs px-2 py-0.5 bg-amber-400/10 border border-amber-400/20 rounded-full">Volta Region</span>
                  </h1>
                </div>
                <p className="text-xs text-slate-400">Hyperlocal Market E-Commerce & Rapid Dispatch</p>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={() => setActiveModal('AI_ASSISTANT')}
                className="p-2 text-amber-400 bg-amber-400/10 rounded-lg hover:bg-amber-400/20"
                title="AI Market Advisor"
              >
                <Sparkles className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveModal('CART')}
                className="relative p-2 text-slate-300 hover:text-white bg-slate-800 rounded-lg"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalCartItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {totalCartItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* System Role Selector */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar">
            {roles.map(r => {
              const active = currentRole === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setCurrentRole(r.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    active 
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                  title={r.desc}
                >
                  {r.icon}
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Sub-bar: Market Selector, Search/AI Helper & Actions */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Market Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMarketDropdown(!showMarketDropdown)}
              className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 px-3 py-1.5 rounded-lg text-slate-200 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold text-white">{currentMarketName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showMarketDropdown && (
              <div className="absolute left-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-50 p-2 space-y-1">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 px-2 py-1">
                  Select Volta Market Hub
                </div>
                <button
                  onClick={() => { setSelectedMarket('ALL'); setShowMarketDropdown(false); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium flex items-center justify-between ${
                    selectedMarket === 'ALL' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>All Markets Hub</span>
                  {selectedMarket === 'ALL' && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
                {VOLTA_MARKETS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => { setSelectedMarket(m.id as VoltaMarketId); setShowMarketDropdown(false); }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium flex items-center justify-between ${
                      selectedMarket === m.id ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="text-white font-medium">{m.name}</div>
                      <div className="text-[10px] text-slate-400">{m.district}</div>
                    </div>
                    {selectedMarket === m.id && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Info / Digital Address */}
          <div className="hidden lg:flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>MoMo: <strong className="text-slate-200">{customer.momoNumber}</strong> ({customer.momoNetwork})</span>
            </span>
            <span className="text-slate-600">•</span>
            <span>GhanaPost GPS: <strong className="text-emerald-400 font-mono">{customer.digitalAddress}</strong></span>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            
            {/* Price Trends Button */}
            <button
              onClick={() => setActiveModal('PRICE_TRENDS')}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm"
              title="View 30-Day Market Price Trends"
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Price Trends</span>
            </button>

            {/* AI Assistant Button */}
            <button
              onClick={() => setActiveModal('AI_ASSISTANT')}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 px-3 py-1.5 rounded-lg font-semibold transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Flash Cart AI</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="relative p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                    {unreadNotifs.length}
                  </span>
                )}
              </button>

              {/* Notification Panel */}
              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-3 max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                    <h3 className="font-semibold text-white flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-amber-400" />
                      In-App Dispatch Feed
                    </h3>
                    {notifications.length > 0 && (
                      <button 
                        onClick={clearAllNotifications}
                        className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Clear
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-slate-500">
                      No notifications yet. Place an order or dispatch a rider!
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationAsRead(n.id)}
                          className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                            !n.read 
                              ? 'bg-slate-800/90 border-amber-500/40' 
                              : 'bg-slate-950/60 border-slate-800 text-slate-400'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-amber-300 text-xs">{n.title}</span>
                            <span className="text-[10px] text-slate-500">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-xs text-slate-200 mt-1">{n.message}</p>
                          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                            <span className="uppercase px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">Target: {n.roleTarget}</span>
                            {!n.read && <span className="text-amber-400 font-semibold">• Unread</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Shopping Cart Drawer Trigger */}
            <button
              onClick={() => setActiveModal('CART')}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-bold shadow-md transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {totalCartItems > 0 && (
                <span className="bg-white text-emerald-950 font-black text-xs px-1.5 py-0.5 rounded-full">
                  {totalCartItems}
                </span>
              )}
            </button>

          </div>

        </div>

      </div>
    </header>
  );
};
