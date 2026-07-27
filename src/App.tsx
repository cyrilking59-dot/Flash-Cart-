import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Storefront } from './components/customer/Storefront';
import { CartDrawer } from './components/customer/CartDrawer';
import { CheckoutModal } from './components/customer/CheckoutModal';
import { OrderTrackingModal } from './components/customer/OrderTrackingModal';
import { TraderDashboard } from './components/trader/TraderDashboard';
import { RiderPortal } from './components/rider/RiderPortal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ProjectReport } from './components/report/ProjectReport';
import { ItemsDirectory } from './components/directory/ItemsDirectory';
import { MarketSpace } from './components/space/MarketSpace';
import { AIAssistantModal } from './components/ai/AIAssistantModal';
import { MarketPriceTrendModal } from './components/common/MarketPriceTrendModal';
import { VOLTA_MARKETS } from './data/seedData';
import { MapPin, Heart } from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentRole } = useApp();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentRole === 'CUSTOMER' && <Storefront />}
        {currentRole === 'DIRECTORY' && <ItemsDirectory />}
        {currentRole === 'SPACE' && <MarketSpace />}
        {currentRole === 'TRADER' && <TraderDashboard />}
        {currentRole === 'RIDER' && <RiderPortal />}
        {currentRole === 'ADMIN' && <AdminDashboard />}
        {currentRole === 'REPORT' && <ProjectReport />}
      </main>

      {/* Global Modals & Drawers */}
      <CartDrawer />
      <CheckoutModal />
      <OrderTrackingModal />
      <AIAssistantModal />
      <MarketPriceTrendModal />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 text-slate-500 text-xs py-8 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-900 pb-4">
            <div>
              <div className="text-white font-extrabold text-sm flex items-center gap-1.5">
                ⚡ Flash Cart <span className="text-amber-400">Volta Region</span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                Hyperlocal Market E-Commerce & Rapid Dispatch Platform
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-400 font-semibold text-[11px]">Market Hubs:</span>
              {VOLTA_MARKETS.map(m => (
                <span key={m.id} className="bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-mono">
                  {m.name.replace(' Market', '')}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-500">
            <div>© 2026 Flash Cart Volta Region. Ghana Card & GhanaPost GPS Verified Dispatch.</div>
            <div className="flex items-center gap-1 text-slate-400">
              Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Abor, Akatsi, Dabala, Mafi, Denu, Agbozume, & Aflao markets.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
