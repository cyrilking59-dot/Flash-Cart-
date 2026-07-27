import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VOLTA_MARKETS } from '../../data/seedData';
import { 
  FileText, 
  Database, 
  GitFork, 
  CheckCircle2, 
  Layers, 
  Printer, 
  Table, 
  ShieldCheck, 
  Zap, 
  MapPin, 
  Bike, 
  Store, 
  ShoppingBag, 
  Smartphone,
  Eye
} from 'lucide-react';

export const ProjectReport: React.FC = () => {
  const { customers, traders, products, riders, orders, reviews } = useApp();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ERD' | 'FLOWCHART' | 'SCHEMA_INSPECTOR'>('OVERVIEW');
  const [selectedTable, setSelectedTable] = useState<string>('Orders');

  const databaseTables = [
    {
      name: 'Customers',
      fields: ['id (PK)', 'name', 'email', 'phone', 'digitalAddress', 'deliveryAddress', 'preferredMarket', 'momoNumber'],
      count: 1
    },
    {
      name: 'Traders',
      fields: ['id (PK)', 'name', 'shopName', 'phone', 'marketId (FK)', 'stallNumber', 'category', 'rating', 'totalSales', 'verified'],
      count: traders.length
    },
    {
      name: 'Markets',
      fields: ['id (PK)', 'name', 'district', 'description', 'marketDays', 'popularItems', 'coordinates'],
      count: VOLTA_MARKETS.length
    },
    {
      name: 'Products',
      fields: ['id (PK)', 'traderId (FK)', 'traderName', 'marketId (FK)', 'name', 'category', 'priceGhs', 'unit', 'stock', 'description', 'image'],
      count: products.length
    },
    {
      name: 'Riders',
      fields: ['id (PK)', 'name', 'phone', 'ghanaCardNo', 'passportPhoto', 'primaryMarket (FK)', 'locationDetails', 'vehicleType', 'verified', 'rating', 'isTopRated', 'totalDeliveries', 'earningsGhs'],
      count: riders.length
    },
    {
      name: 'Orders',
      fields: ['id (PK)', 'orderCode', 'customerId (FK)', 'marketId (FK)', 'subtotalGhs', 'deliveryFeeGhs', 'totalGhs', 'paymentMethod', 'paymentStatus', 'status', 'riderId (FK)', 'deliveryPin', 'createdAt'],
      count: orders.length
    },
    {
      name: 'OrderItems',
      fields: ['productId (FK)', 'productName', 'priceGhs', 'quantity', 'unit', 'traderId (FK)', 'traderName'],
      count: orders.reduce((sum, o) => sum + o.items.length, 0)
    },
    {
      name: 'Payments',
      fields: ['id (PK)', 'orderId (FK)', 'amountGhs', 'paymentMethod', 'momoNumber', 'status', 'releasedAt'],
      count: orders.length
    },
    {
      name: 'Reviews',
      fields: ['id (PK)', 'orderId (FK)', 'riderId (FK)', 'customerId (FK)', 'rating', 'comment', 'createdAt'],
      count: reviews.length
    },
    {
      name: 'Notifications',
      fields: ['id (PK)', 'roleTarget', 'userId', 'title', 'message', 'type', 'createdAt', 'read'],
      count: 5
    }
  ];

  return (
    <div className="space-y-8 pb-16 print:p-0 print:space-y-4">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:border-none print:bg-white print:text-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-400 print:text-amber-600" />
            <h2 className="text-2xl font-black text-white print:text-slate-900">Flash Cart Deliverables & Technical Report</h2>
          </div>
          <p className="text-xs text-slate-400 print:text-slate-600 mt-1">
            System Requirements, ER Diagram, Database Design, & Dispatch Flowcharts
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow flex items-center gap-2 print:hidden"
        >
          <Printer className="w-4 h-4" /> Print / Export Technical PDF
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar print:hidden">
        {[
          { id: 'OVERVIEW', label: '1. Problem & Requirements', icon: <Layers className="w-4 h-4" /> },
          { id: 'ERD', label: '2. Database ER Diagram', icon: <Database className="w-4 h-4" /> },
          { id: 'FLOWCHART', label: '3. Dispatch Flowchart & Use-Cases', icon: <GitFork className="w-4 h-4" /> },
          { id: 'SCHEMA_INSPECTOR', label: '4. Schema Data Inspector', icon: <Table className="w-4 h-4" /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: Problem Statement & Objectives */}
      {(activeTab === 'OVERVIEW' || window.matchMedia('print').matches) && (
        <div className="space-y-6">
          
          {/* Problem Statement Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" /> Problem Statement
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              In the Volta Region of Ghana, trade across major traditional markets—including <strong>Abor, Akatsi, Dabala, Mafi, Denu, Agbozume, and Aflao</strong>—remains largely physical and geographically constrained. Customers in nearby towns face high transportation costs and long transit delays to buy fresh produce (Akatsi Gari, Dabala Tilapia, Mafi Maize) or traditional Kente textiles. Furthermore, local Okada and Aboboyaa riders lack a centralized broadcast system to receive nearby delivery jobs automatically, leading to idle capacity and unverified delivery disputes.
            </p>
          </div>

          {/* Objectives */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Key System Objectives
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
              <li className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <strong className="text-white block">1. Hyperlocal Market Digitization:</strong>
                Enable traders across Abor, Akatsi, Dabala, Mafi, Denu, Agbozume, and Aflao to create stores and list products with AI description generators.
              </li>
              <li className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <strong className="text-white block">2. Fast Broadcast Dispatch:</strong>
                Broadcast new orders in real-time to nearby riders under a "First Rider to Accept Gets the Job" protocol.
              </li>
              <li className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <strong className="text-white block">3. Ghana Card Verification:</strong>
                Mandate Ghana Card verification and passport photos for all dispatch riders to build security and trust.
              </li>
              <li className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <strong className="text-white block">4. Secure Delivery PIN Release:</strong>
                Enforce a 4-digit PIN confirmation upon delivery to trigger instant Mobile Money payment settlement to traders and riders.
              </li>
            </ul>
          </div>

          {/* Functional & Non-Functional Requirements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
              <h4 className="font-bold text-white text-sm">Functional Requirements</h4>
              <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
                <li>Trader Store registration & stall management</li>
                <li>Product listing with Gemini AI pricing advisor</li>
                <li>GhanaPost Digital Address (e.g. VR-0412-8821) routing</li>
                <li>Mobile Money payment gateway (MTN MoMo, Telecel Cash)</li>
                <li>1-5 Star Rider Rating & Written Reviews</li>
                <li>Automated "Top Rated Rider" status badge computation</li>
              </ul>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
              <h4 className="font-bold text-white text-sm">Non-Functional Requirements</h4>
              <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
                <li>Real-time broadcast latency &lt; 2 seconds</li>
                <li>Mobile responsive design with Tailwind CSS</li>
                <li>High availability with cloud container hosting</li>
                <li>Data integrity and secure local/cloud persistence</li>
              </ul>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: Database ER Diagram */}
      {(activeTab === 'ERD' || window.matchMedia('print').matches) && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-amber-400" /> Interactive Database ER Diagram (Entity Relationship)
              </h3>
              <p className="text-xs text-slate-400">Database architecture for Flash Cart Volta Region Platform</p>
            </div>
          </div>

          {/* Visual ER Diagram Canvas */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 overflow-x-auto space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Entity 1: Customers */}
              <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-xl overflow-hidden shadow-lg">
                <div className="bg-emerald-600 text-white font-bold text-xs p-2.5 flex items-center justify-between">
                  <span>CUSTOMERS</span>
                  <span className="text-[10px] bg-slate-950 px-1.5 py-0.5 rounded">Table</span>
                </div>
                <div className="p-3 text-[11px] font-mono space-y-1 text-slate-300">
                  <div className="text-amber-400 font-bold">🔑 id (PK)</div>
                  <div>• name</div>
                  <div>• email</div>
                  <div>• phone</div>
                  <div className="text-emerald-400">• digitalAddress</div>
                  <div>• preferredMarket</div>
                </div>
              </div>

              {/* Entity 2: Orders */}
              <div className="bg-slate-900 border-2 border-amber-500/60 rounded-xl overflow-hidden shadow-lg">
                <div className="bg-amber-500 text-slate-950 font-bold text-xs p-2.5 flex items-center justify-between">
                  <span>ORDERS</span>
                  <span className="text-[10px] bg-slate-950 text-amber-300 px-1.5 py-0.5 rounded">Central Hub</span>
                </div>
                <div className="p-3 text-[11px] font-mono space-y-1 text-slate-300">
                  <div className="text-amber-400 font-bold">🔑 id (PK)</div>
                  <div>• orderCode</div>
                  <div>🔗 customerId (FK)</div>
                  <div>🔗 marketId (FK)</div>
                  <div>🔗 riderId (FK)</div>
                  <div className="text-amber-300 font-bold">• deliveryPin (4-digit)</div>
                  <div>• totalGhs</div>
                  <div>• status</div>
                </div>
              </div>

              {/* Entity 3: Riders */}
              <div className="bg-slate-900 border-2 border-sky-500/60 rounded-xl overflow-hidden shadow-lg">
                <div className="bg-sky-600 text-white font-bold text-xs p-2.5 flex items-center justify-between">
                  <span>RIDERS</span>
                  <span className="text-[10px] bg-slate-950 px-1.5 py-0.5 rounded">Table</span>
                </div>
                <div className="p-3 text-[11px] font-mono space-y-1 text-slate-300">
                  <div className="text-amber-400 font-bold">🔑 id (PK)</div>
                  <div>• name</div>
                  <div className="text-sky-300 font-bold">• ghanaCardNo</div>
                  <div>• passportPhoto</div>
                  <div>• vehicleType</div>
                  <div>• verified (boolean)</div>
                  <div className="text-amber-400">• rating (1-5 star)</div>
                  <div>• isTopRated</div>
                </div>
              </div>

              {/* Entity 4: Traders */}
              <div className="bg-slate-900 border-2 border-purple-500/60 rounded-xl overflow-hidden shadow-lg">
                <div className="bg-purple-600 text-white font-bold text-xs p-2.5 flex items-center justify-between">
                  <span>TRADERS</span>
                  <span className="text-[10px] bg-slate-950 px-1.5 py-0.5 rounded">Table</span>
                </div>
                <div className="p-3 text-[11px] font-mono space-y-1 text-slate-300">
                  <div className="text-amber-400 font-bold">🔑 id (PK)</div>
                  <div>• shopName</div>
                  <div>🔗 marketId (FK)</div>
                  <div>• stallNumber</div>
                  <div>• category</div>
                </div>
              </div>

              {/* Entity 5: Products */}
              <div className="bg-slate-900 border-2 border-rose-500/60 rounded-xl overflow-hidden shadow-lg">
                <div className="bg-rose-600 text-white font-bold text-xs p-2.5 flex items-center justify-between">
                  <span>PRODUCTS</span>
                  <span className="text-[10px] bg-slate-950 px-1.5 py-0.5 rounded">Table</span>
                </div>
                <div className="p-3 text-[11px] font-mono space-y-1 text-slate-300">
                  <div className="text-amber-400 font-bold">🔑 id (PK)</div>
                  <div>🔗 traderId (FK)</div>
                  <div>🔗 marketId (FK)</div>
                  <div>• name</div>
                  <div>• priceGhs</div>
                  <div>• unit</div>
                </div>
              </div>

              {/* Entity 6: Reviews */}
              <div className="bg-slate-900 border-2 border-teal-500/60 rounded-xl overflow-hidden shadow-lg">
                <div className="bg-teal-600 text-white font-bold text-xs p-2.5 flex items-center justify-between">
                  <span>REVIEWS</span>
                  <span className="text-[10px] bg-slate-950 px-1.5 py-0.5 rounded">Table</span>
                </div>
                <div className="p-3 text-[11px] font-mono space-y-1 text-slate-300">
                  <div className="text-amber-400 font-bold">🔑 id (PK)</div>
                  <div>🔗 orderId (FK)</div>
                  <div>🔗 riderId (FK)</div>
                  <div className="text-amber-300 font-bold">• rating (1-5)</div>
                  <div>• comment</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Flowchart & Use-case */}
      {(activeTab === 'FLOWCHART' || window.matchMedia('print').matches) && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <GitFork className="w-5 h-5 text-amber-400" /> Dispatch Workflow & Use-Case Diagram
          </h3>

          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6 text-xs text-slate-300">
            <div className="font-bold text-amber-400 text-sm">Sequence Flow: Customer Order to Rider Payment Release</div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center font-semibold">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center mx-auto">1</div>
                <div className="text-white font-bold">Customer Checkout</div>
                <p className="text-[10px] text-slate-400">Selects produce at Akatsi/Dabala, enters GhanaPost GPS and MoMo</p>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center mx-auto">2</div>
                <div className="text-white font-bold">Broadcast Alert</div>
                <p className="text-[10px] text-slate-400">Order broadcasted to nearby market riders in real-time</p>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <div className="w-7 h-7 rounded-full bg-sky-500 text-slate-950 font-black flex items-center justify-center mx-auto">3</div>
                <div className="text-white font-bold">First Rider Acceptance</div>
                <p className="text-[10px] text-slate-400">First rider to click 'Claim Order' gets assigned the job</p>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <div className="w-7 h-7 rounded-full bg-purple-500 text-slate-950 font-black flex items-center justify-center mx-auto">4</div>
                <div className="text-white font-bold">Pickup & Transit</div>
                <p className="text-[10px] text-slate-400">Rider picks produce from trader stall and navigates to customer</p>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <div className="w-7 h-7 rounded-full bg-emerald-400 text-slate-950 font-black flex items-center justify-center mx-auto">5</div>
                <div className="text-white font-bold">PIN & Funds Release</div>
                <p className="text-[10px] text-slate-400">Rider inputs 4-digit PIN. System releases funds and prompts review</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Schema Data Inspector */}
      {(activeTab === 'SCHEMA_INSPECTOR' || window.matchMedia('print').matches) && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Table className="w-5 h-5 text-amber-400" /> Database Schema Table Inspector
            </h3>
            <span className="text-xs text-slate-400">Showing live database entity structures</span>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {databaseTables.map(t => (
              <button
                key={t.name}
                onClick={() => setSelectedTable(t.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  selectedTable === t.name
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {t.name} ({t.count})
              </button>
            ))}
          </div>

          {/* Selected Table Fields */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 font-mono text-xs text-slate-300">
            <div className="text-amber-400 font-bold">Table: {selectedTable}</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
              {databaseTables.find(t => t.name === selectedTable)?.fields.map(f => (
                <div key={f} className="p-2 bg-slate-900 rounded border border-slate-800">
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
