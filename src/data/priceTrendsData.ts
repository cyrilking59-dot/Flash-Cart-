import { VoltaMarketId } from '../types';

export interface DailyPricePoint {
  date: string;          // e.g. "Jun 27", "Jun 28", ... "Jul 26"
  dayOffset: number;     // -29 to 0
  avgPriceGhs: number;   // Region-wide average
  akatsi: number;
  dabala: number;
  abor: number;
  mafi: number;
  denu: number;
  aflao: number;
  agbozume: number;
  orderVolume: number;   // Number of orders logged on this day
  eventNote?: string;    // Market day note e.g. "Major Akatsi Market Day Harvest"
}

export interface EssentialCommodityTrend {
  id: string;
  name: string;
  category: string;
  unit: string;
  icon: string;
  primaryMarketId: VoltaMarketId;
  primaryMarketName: string;
  image: string;
  currentAvgPrice: number;
  lowestPriceMarket: string;
  lowestPriceGhs: number;
  highestPriceMarket: string;
  highestPriceGhs: number;
  change30dPct: number; // e.g. -5.4 or +8.2
  volatility: 'LOW' | 'MODERATE' | 'HIGH';
  buyingRecommendation: string;
  seasonalityFactor: string;
  dailyData: DailyPricePoint[];
  historicalOrders: {
    orderCode: string;
    date: string;
    marketName: string;
    traderName: string;
    unitPriceGhs: number;
    qty: number;
    totalGhs: number;
  }[];
}

// Generate realistic 30-day dates leading up to today (July 26, 2026)
export const generate30DayDates = (): { dateStr: string; dayOffset: number }[] => {
  const dates: { dateStr: string; dayOffset: number }[] = [];
  const today = new Date('2026-07-26T00:00:00');

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    const day = d.getDate();
    dates.push({
      dateStr: `${month} ${day < 10 ? '0' + day : day}`,
      dayOffset: -i
    });
  }
  return dates;
};

const DATES = generate30DayDates();

// 1. Fresh Organic Red Tomatoes (Per Paint Rubber)
const tomatoesDailyData: DailyPricePoint[] = DATES.map(({ dateStr, dayOffset }, idx) => {
  // Sinusoidal trend representing harvest cycle + market day spikes
  const base = 48;
  const cycle = Math.sin((idx / 29) * Math.PI * 2) * 5; 
  const noise = (Math.sin(idx * 3) * 1.5);
  const avg = Math.round((base + cycle + noise) * 10) / 10;

  // Specific market day events
  let note: string | undefined = undefined;
  if (idx === 4) note = "Abor Vegetable Market Surge";
  if (idx === 12) note = "Rainfall Delay at Aflao Border";
  if (idx === 20) note = "Akatsi Major Market Day Influx";
  if (idx === 28) note = "Denu Fresh Coastal Crop Harvest";

  return {
    date: dateStr,
    dayOffset,
    avgPriceGhs: avg,
    akatsi: Math.round((avg + 1.5) * 10) / 10,
    dabala: Math.round((avg - 1.0) * 10) / 10,
    abor: Math.round((avg - 3.2) * 10) / 10, // Abor is cheapest for vegetables
    mafi: Math.round((avg + 0.8) * 10) / 10,
    denu: Math.round((avg - 0.5) * 10) / 10,
    aflao: Math.round((avg + 3.0) * 10) / 10, // Aflao border higher due to cross-border demand
    agbozume: Math.round((avg + 0.2) * 10) / 10,
    orderVolume: 12 + Math.floor(Math.sin(idx) * 8 + 10),
    eventNote: note
  };
});

// 2. Fresh Akatsi Pona Yam Tubers (Per 3 Tubers)
const yamsDailyData: DailyPricePoint[] = DATES.map(({ dateStr, dayOffset }, idx) => {
  const base = 78;
  // New yam harvest entering Volta region reduces price over 30 days
  const trend = - (idx / 29) * 8; 
  const fluctuation = Math.cos(idx * 0.8) * 2;
  const avg = Math.round((base + trend + fluctuation) * 10) / 10;

  let note: string | undefined = undefined;
  if (idx === 3) note = "Early Pona Yam Season Inflow";
  if (idx === 15) note = "Akatsi Yam Depot Direct Baling";
  if (idx === 27) note = "Peak Farm Gate Harvest";

  return {
    date: dateStr,
    dayOffset,
    avgPriceGhs: avg,
    akatsi: Math.round((avg - 4.0) * 10) / 10, // Akatsi is cheapest for Pona Yams
    dabala: Math.round((avg + 1.2) * 10) / 10,
    abor: Math.round((avg - 1.5) * 10) / 10,
    mafi: Math.round((avg - 2.8) * 10) / 10,
    denu: Math.round((avg + 2.5) * 10) / 10,
    aflao: Math.round((avg + 4.5) * 10) / 10,
    agbozume: Math.round((avg + 1.0) * 10) / 10,
    orderVolume: 15 + Math.floor(Math.cos(idx) * 6 + 8),
    eventNote: note
  };
});

// 3. Fine Akatsi & Abor Yellow Gari (Per Olonka - 2.5kg)
const gariDailyData: DailyPricePoint[] = DATES.map(({ dateStr, dayOffset }, idx) => {
  // Gari prices remain very stable in Volta, minor processing cost shifts
  const base = 42;
  const microTrend = (Math.sin(idx * 0.4) * 1.8);
  const avg = Math.round((base + microTrend) * 10) / 10;

  let note: string | undefined = undefined;
  if (idx === 8) note = "Abor Gari Processing Baling Day";
  if (idx === 22) note = "Akatsi Gari Shed Bulk Distribution";

  return {
    date: dateStr,
    dayOffset,
    avgPriceGhs: avg,
    akatsi: Math.round((avg - 2.0) * 10) / 10,
    dabala: Math.round((avg + 1.0) * 10) / 10,
    abor: Math.round((avg - 3.5) * 10) / 10, // Abor processed gari cheapest
    mafi: Math.round((avg - 1.0) * 10) / 10,
    denu: Math.round((avg + 2.0) * 10) / 10,
    aflao: Math.round((avg + 3.2) * 10) / 10,
    agbozume: Math.round((avg + 0.5) * 10) / 10,
    orderVolume: 28 + Math.floor(Math.sin(idx * 2) * 10),
    eventNote: note
  };
});

// 4. Fresh Volta River Tilapia (Per 3 Large Pieces)
const tilapiaDailyData: DailyPricePoint[] = DATES.map(({ dateStr, dayOffset }, idx) => {
  const base = 125;
  const catchVariation = Math.sin(idx * 0.5) * 6;
  const avg = Math.round((base + catchVariation) * 10) / 10;

  let note: string | undefined = undefined;
  if (idx === 7) note = "Dabala River High Net Catch";
  if (idx === 21) note = "Volta Estuary Harvest Peak";

  return {
    date: dateStr,
    dayOffset,
    avgPriceGhs: avg,
    akatsi: Math.round((avg + 3.0) * 10) / 10,
    dabala: Math.round((avg - 8.5) * 10) / 10, // Dabala River Landing cheapest for Tilapia
    abor: Math.round((avg + 1.5) * 10) / 10,
    mafi: Math.round((avg - 2.0) * 10) / 10,
    denu: Math.round((avg + 4.0) * 10) / 10,
    aflao: Math.round((avg + 6.0) * 10) / 10,
    agbozume: Math.round((avg + 3.5) * 10) / 10,
    orderVolume: 18 + Math.floor(Math.sin(idx) * 7),
    eventNote: note
  };
});

// 5. Denu & Keta Local Shallots & Spices (Per Paint Rubber)
const shallotsDailyData: DailyPricePoint[] = DATES.map(({ dateStr, dayOffset }, idx) => {
  const base = 52;
  const trend = (idx / 29) * 4; // Gradual demand increase
  const noise = Math.sin(idx * 0.7) * 2;
  const avg = Math.round((base + trend + noise) * 10) / 10;

  return {
    date: dateStr,
    dayOffset,
    avgPriceGhs: avg,
    akatsi: Math.round((avg + 1.0) * 10) / 10,
    dabala: Math.round((avg + 0.5) * 10) / 10,
    abor: Math.round((avg - 1.5) * 10) / 10,
    mafi: Math.round((avg + 2.0) * 10) / 10,
    denu: Math.round((avg - 4.5) * 10) / 10, // Denu coastal shallots cheapest
    aflao: Math.round((avg + 2.5) * 10) / 10,
    agbozume: Math.round((avg - 2.0) * 10) / 10,
    orderVolume: 14 + Math.floor(Math.cos(idx) * 5),
    eventNote: idx === 18 ? "Denu Shallot Harvest Baling" : undefined
  };
});

// 6. Pure Zomi Red Palm Oil (Per 1.5 Liter Bottle)
const palmOilDailyData: DailyPricePoint[] = DATES.map(({ dateStr, dayOffset }, idx) => {
  const base = 58;
  const shift = Math.cos(idx * 0.3) * 2.5;
  const avg = Math.round((base + shift) * 10) / 10;

  return {
    date: dateStr,
    dayOffset,
    avgPriceGhs: avg,
    akatsi: Math.round((avg + 0.5) * 10) / 10,
    dabala: Math.round((avg - 1.0) * 10) / 10,
    abor: Math.round((avg - 1.8) * 10) / 10,
    mafi: Math.round((avg - 3.8) * 10) / 10, // Mafi Kumase pressing hub cheapest
    denu: Math.round((avg + 1.2) * 10) / 10,
    aflao: Math.round((avg + 2.8) * 10) / 10,
    agbozume: Math.round((avg - 1.5) * 10) / 10,
    orderVolume: 22 + Math.floor(Math.sin(idx) * 9),
    eventNote: idx === 11 ? "Mafi Kumase Palm Oil Pressing" : undefined
  };
});

export const ESSENTIAL_COMMODITY_TRENDS: EssentialCommodityTrend[] = [
  {
    id: 'comm-tomatoes',
    name: 'Fresh Organic Red Tomatoes',
    category: 'Vegetables & Spices',
    unit: 'Per Paint Rubber Bucket',
    icon: '🍅',
    primaryMarketId: 'abor',
    primaryMarketName: 'Abor Market Produce Hub',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=600',
    currentAvgPrice: 45.0,
    lowestPriceMarket: 'Abor Market',
    lowestPriceGhs: 38.0,
    highestPriceMarket: 'Aflao Border Market',
    highestPriceGhs: 51.5,
    change30dPct: -6.2,
    volatility: 'MODERATE',
    buyingRecommendation: 'Best prices on Wednesdays & Saturdays at Abor Market Day. Expect 8% savings when ordering in bulk.',
    seasonalityFactor: 'Volta coastal vegetable harvest in full yield. Abundant supply from Abor and Keta farmlands.',
    dailyData: tomatoesDailyData,
    historicalOrders: [
      { orderCode: 'FC-VR-8910', date: 'Jul 26, 2026', marketName: 'Abor Market', traderName: 'Afiwa Mawusi', unitPriceGhs: 38.0, qty: 2, totalGhs: 76.0 },
      { orderCode: 'FC-VR-8842', date: 'Jul 22, 2026', marketName: 'Akatsi Main Market', traderName: 'Mama Adzo Akpene', unitPriceGhs: 44.0, qty: 1, totalGhs: 44.0 },
      { orderCode: 'FC-VR-8711', date: 'Jul 18, 2026', marketName: 'Denu Central Market', traderName: 'Ablavi Denu', unitPriceGhs: 42.5, qty: 3, totalGhs: 127.5 },
      { orderCode: 'FC-VR-8604', date: 'Jul 12, 2026', marketName: 'Aflao Border Market', traderName: 'Kofi Mensah', unitPriceGhs: 49.0, qty: 1, totalGhs: 49.0 },
      { orderCode: 'FC-VR-8520', date: 'Jul 05, 2026', marketName: 'Abor Market', traderName: 'Afiwa Mawusi', unitPriceGhs: 41.0, qty: 2, totalGhs: 82.0 }
    ]
  },
  {
    id: 'comm-yams',
    name: 'Fresh Akatsi Pona Yam Tubers',
    category: 'Tubers & Plantain',
    unit: 'Per 3 Large Tubers',
    icon: '🍠',
    primaryMarketId: 'akatsi',
    primaryMarketName: 'Akatsi Yam Depot Gate 2',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=600',
    currentAvgPrice: 72.0,
    lowestPriceMarket: 'Akatsi Main Market',
    lowestPriceGhs: 65.0,
    highestPriceMarket: 'Aflao Border Market',
    highestPriceGhs: 79.5,
    change30dPct: -9.8,
    volatility: 'MODERATE',
    buyingRecommendation: 'Prices have dropped 9.8% over 30 days due to fresh farm harvests arriving at Akatsi Yam Yard.',
    seasonalityFactor: 'Early Pona yam harvesting peak in Akatsi South and Central Tongu districts.',
    dailyData: yamsDailyData,
    historicalOrders: [
      { orderCode: 'FC-VR-8912', date: 'Jul 26, 2026', marketName: 'Akatsi Main Market', traderName: 'Mama Adzo Akpene', unitPriceGhs: 65.0, qty: 2, totalGhs: 130.0 },
      { orderCode: 'FC-VR-8805', date: 'Jul 20, 2026', marketName: 'Mafi Kumase Market', traderName: 'Koku Agbesi', unitPriceGhs: 68.0, qty: 1, totalGhs: 68.0 },
      { orderCode: 'FC-VR-8690', date: 'Jul 14, 2026', marketName: 'Dabala Market', traderName: 'Togbe Kpodo', unitPriceGhs: 74.0, qty: 3, totalGhs: 222.0 },
      { orderCode: 'FC-VR-8540', date: 'Jul 06, 2026', marketName: 'Akatsi Main Market', traderName: 'Mama Adzo Akpene', unitPriceGhs: 76.0, qty: 2, totalGhs: 152.0 }
    ]
  },
  {
    id: 'comm-gari',
    name: 'Premium Akatsi Yellow Gari',
    category: 'Gari & Grains',
    unit: 'Per Olonka (2.5kg)',
    icon: '🌾',
    primaryMarketId: 'akatsi',
    primaryMarketName: 'Akatsi Cassava Processing Shed',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600',
    currentAvgPrice: 41.5,
    lowestPriceMarket: 'Abor Market',
    lowestPriceGhs: 37.0,
    highestPriceMarket: 'Aflao Border Market',
    highestPriceGhs: 45.0,
    change30dPct: -1.2,
    volatility: 'LOW',
    buyingRecommendation: 'Highly stable price commodity. Abor and Akatsi markets offer lowest direct-from-processor rates.',
    seasonalityFactor: 'Year-round active cassava harvesting and roasting in Keta and Akatsi South municipalities.',
    dailyData: gariDailyData,
    historicalOrders: [
      { orderCode: 'FC-VR-8910', date: 'Jul 26, 2026', marketName: 'Akatsi Main Market', traderName: 'Mama Adzo Akpene', unitPriceGhs: 40.0, qty: 2, totalGhs: 80.0 },
      { orderCode: 'FC-VR-8877', date: 'Jul 23, 2026', marketName: 'Abor Market', traderName: 'Afiwa Mawusi', unitPriceGhs: 37.5, qty: 4, totalGhs: 150.0 },
      { orderCode: 'FC-VR-8750', date: 'Jul 16, 2026', marketName: 'Mafi Kumase Market', traderName: 'Koku Agbesi', unitPriceGhs: 41.0, qty: 1, totalGhs: 41.0 }
    ]
  },
  {
    id: 'comm-tilapia',
    name: 'Fresh Volta River Tilapia (Jumbo)',
    category: 'Fresh Seafood & Fish',
    unit: 'Per 3 Large Pieces',
    icon: '🐟',
    primaryMarketId: 'dabala',
    primaryMarketName: 'Dabala River Bridge Landing Pier',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=600',
    currentAvgPrice: 122.0,
    lowestPriceMarket: 'Dabala Market',
    lowestPriceGhs: 112.0,
    highestPriceMarket: 'Aflao Border Market',
    highestPriceGhs: 130.0,
    change30dPct: +2.8,
    volatility: 'MODERATE',
    buyingRecommendation: 'Thursdays at Dabala River Landing offer fresh morning nets straight from local fishermen at GHS 112.00.',
    seasonalityFactor: 'Volta River water levels optimal for artisanal cage and netting harvest.',
    dailyData: tilapiaDailyData,
    historicalOrders: [
      { orderCode: 'FC-VR-8910', date: 'Jul 26, 2026', marketName: 'Dabala Market', traderName: 'Togbe Kpodo', unitPriceGhs: 115.0, qty: 1, totalGhs: 115.0 },
      { orderCode: 'FC-VR-8822', date: 'Jul 21, 2026', marketName: 'Dabala Market', traderName: 'Togbe Kpodo', unitPriceGhs: 112.0, qty: 2, totalGhs: 224.0 },
      { orderCode: 'FC-VR-8630', date: 'Jul 10, 2026', marketName: 'Akatsi Main Market', traderName: 'Mama Adzo Akpene', unitPriceGhs: 125.0, qty: 1, totalGhs: 125.0 }
    ]
  },
  {
    id: 'comm-shallots',
    name: 'Organic Local Shallots & Spices',
    category: 'Vegetables & Spices',
    unit: 'Per Paint Rubber Bucket',
    icon: '🧅',
    primaryMarketId: 'denu',
    primaryMarketName: 'Denu Coastal Shallot Farms',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=600',
    currentAvgPrice: 55.0,
    lowestPriceMarket: 'Denu Central Market',
    lowestPriceGhs: 48.0,
    highestPriceMarket: 'Mafi Kumase Market',
    highestPriceGhs: 58.0,
    change30dPct: +5.4,
    volatility: 'MODERATE',
    buyingRecommendation: 'Denu and Agbozume markets provide freshest shallot bulbs directly dried along coastal beds.',
    seasonalityFactor: 'High demand for coastal shallots in local shito and stew processing enterprises.',
    dailyData: shallotsDailyData,
    historicalOrders: [
      { orderCode: 'FC-VR-8902', date: 'Jul 25, 2026', marketName: 'Denu Central Market', traderName: 'Ablavi Denu', unitPriceGhs: 48.0, qty: 2, totalGhs: 96.0 },
      { orderCode: 'FC-VR-8790', date: 'Jul 19, 2026', marketName: 'Agbozume Market', traderName: 'Esi Agbotui', unitPriceGhs: 51.0, qty: 1, totalGhs: 51.0 }
    ]
  },
  {
    id: 'comm-palmoil',
    name: 'Pure Zomi Red Palm Oil',
    category: 'Oils & Provisions',
    unit: 'Per 1.5 Liter Bottle',
    icon: '🌴',
    primaryMarketId: 'mafi',
    primaryMarketName: 'Mafi Kumase Agribusiness Depot',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=600',
    currentAvgPrice: 57.5,
    lowestPriceMarket: 'Mafi Kumase Market',
    lowestPriceGhs: 52.0,
    highestPriceMarket: 'Aflao Border Market',
    highestPriceGhs: 61.0,
    change30dPct: -0.8,
    volatility: 'LOW',
    buyingRecommendation: 'Mafi Kumase pressers offer authentic unadulterated red palm oil with rich zomi aroma.',
    seasonalityFactor: 'Palm fruit milling in Central Tongu maintaining steady production output.',
    dailyData: palmOilDailyData,
    historicalOrders: [
      { orderCode: 'FC-VR-8899', date: 'Jul 24, 2026', marketName: 'Mafi Kumase Market', traderName: 'Koku Agbesi', unitPriceGhs: 52.0, qty: 2, totalGhs: 104.0 },
      { orderCode: 'FC-VR-8720', date: 'Jul 15, 2026', marketName: 'Abor Market', traderName: 'Afiwa Mawusi', unitPriceGhs: 55.0, qty: 1, totalGhs: 55.0 }
    ]
  }
];
