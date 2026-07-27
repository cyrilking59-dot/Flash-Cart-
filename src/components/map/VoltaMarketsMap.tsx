import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { VOLTA_MARKETS } from '../../data/seedData';
import { VoltaMarket, VoltaMarketId } from '../../types';
import { useApp } from '../../context/AppContext';
import { ProductDeliveryTrace } from '../common/ProductDeliveryTrace';
import { 
  MapPin, 
  Navigation, 
  Store, 
  Sparkles, 
  Calendar, 
  Bike, 
  Users, 
  ShoppingBag, 
  Compass, 
  Layers, 
  Maximize2, 
  Check, 
  ArrowRight,
  Info,
  ShieldCheck,
  Building2,
  RefreshCw,
  LocateFixed
} from 'lucide-react';

interface VoltaMarketsMapProps {
  selectedMarket: VoltaMarketId | 'ALL';
  onSelectMarket: (marketId: VoltaMarketId | 'ALL') => void;
  className?: string;
  onNavigateToStorefront?: () => void;
}

// Calculate distance between two coordinates in kilometers using Haversine formula
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Preset locations in Volta region for distance calculation testing when geolocation is unavailable
const VOLTA_TOWNSHIPS = [
  { name: 'Sogakope Bridge', lat: 5.9989, lng: 0.5971 },
  { name: 'Ho Municipal Capital', lat: 6.6008, lng: 0.4713 },
  { name: 'Keta Lagoon Causeway', lat: 5.9179, lng: 0.9922 },
  { name: 'Ada Foah Ferry Landing', lat: 5.7833, lng: 0.6333 },
];

export const VoltaMarketsMap: React.FC<VoltaMarketsMapProps> = ({
  selectedMarket,
  onSelectMarket,
  className = '',
  onNavigateToStorefront
}) => {
  const { traders, riders, products } = useApp();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [marketId: string]: L.Marker }>({});
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [activeMarketId, setActiveMarketId] = useState<VoltaMarketId | 'ALL'>(
    selectedMarket !== 'ALL' ? selectedMarket : 'akatsi'
  );
  const [mapStyle, setMapStyle] = useState<'DARK' | 'LIGHT' | 'SATELLITE'>('DARK');
  const [tileLayerInstance, setTileLayerInstance] = useState<L.TileLayer | null>(null);

  // User Geolocation State
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number; locationName?: string } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Active Market details
  const activeMarket = VOLTA_MARKETS.find(m => m.id === activeMarketId) || VOLTA_MARKETS[0];

  // Market stats calculation
  const marketStats = React.useMemo(() => {
    const stats: { [key: string]: { tradersCount: number; ridersCount: number; productsCount: number } } = {};
    VOLTA_MARKETS.forEach(m => {
      const marketTraders = traders.filter(t => t.marketId === m.id).length;
      const marketRiders = riders.filter(r => r.assignedMarketId === m.id && r.status === 'ONLINE').length;
      const marketProds = products.filter(p => p.marketId === m.id).length;
      stats[m.id] = {
        tradersCount: marketTraders || 3,
        ridersCount: marketRiders || 2,
        productsCount: marketProds || 4
      };
    });
    return stats;
  }, [traders, riders, products]);

  // Handle market selection
  const handleMarketSelect = (marketId: VoltaMarketId | 'ALL') => {
    setActiveMarketId(marketId);
    onSelectMarket(marketId);

    if (mapInstanceRef.current && marketId !== 'ALL') {
      const target = VOLTA_MARKETS.find(m => m.id === marketId);
      if (target) {
        mapInstanceRef.current.flyTo([target.coordinates.lat, target.coordinates.lng], 12, {
          duration: 1.2
        });
        
        // Open Leaflet popup
        const marker = markersRef.current[marketId];
        if (marker) {
          marker.openPopup();
        }
      }
    } else if (mapInstanceRef.current && marketId === 'ALL') {
      // Fit bounds to show all 7 markets
      const bounds = L.latLngBounds(VOLTA_MARKETS.map(m => [m.coordinates.lat, m.coordinates.lng]));
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  // Sync external prop selectedMarket
  useEffect(() => {
    if (selectedMarket !== 'ALL' && selectedMarket !== activeMarketId) {
      setActiveMarketId(selectedMarket);
    }
  }, [selectedMarket]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy existing map if initialized
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Default center around Volta Region (between Akatsi, Dabala, and Ketu)
    const map = L.map(mapContainerRef.current, {
      center: [6.0900, 0.8800],
      zoom: 10,
      zoomControl: false,
      attributionControl: false
    });

    mapInstanceRef.current = map;

    // Add Zoom Control at top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Initial tile layer setup
    const tileUrl = mapStyle === 'DARK'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : mapStyle === 'SATELLITE'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const layer = L.tileLayer(tileUrl, {
      maxZoom: 18,
      subdomains: 'abcd',
    }).addTo(map);

    setTileLayerInstance(layer);

    // Create markers for the 7 Volta markets
    VOLTA_MARKETS.forEach(market => {
      const isSelected = market.id === activeMarketId;
      const stats = marketStats[market.id] || { tradersCount: 3, ridersCount: 2, productsCount: 4 };

      // Custom DivIcon HTML
      const customIconHtml = `
        <div class="relative group cursor-pointer">
          <div class="absolute -inset-2 bg-amber-500/30 rounded-full blur-md group-hover:opacity-100 transition-opacity opacity-75 ${isSelected ? 'animate-ping' : ''}"></div>
          <div class="relative w-9 h-9 rounded-xl ${isSelected ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-400/50 scale-110' : 'bg-slate-950 text-amber-400 border-2 border-amber-500/80 hover:bg-amber-500 hover:text-slate-950'} flex items-center justify-center font-black shadow-2xl transition-all">
            <span class="text-xs tracking-tighter">${market.name.substring(0, 2).toUpperCase()}</span>
          </div>
          <div class="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-950/90 text-slate-100 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-slate-800 shadow-xl pointer-events-none">
            ${market.name.replace(' Market', '')}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: customIconHtml,
        className: 'custom-market-pin',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -20]
      });

      // Popup Content HTML
      const popupHtml = `
        <div class="p-1 max-w-[220px] font-sans text-slate-900">
          <div class="rounded-lg overflow-hidden mb-2 border border-slate-200">
            <img src="${market.image}" alt="${market.name}" class="w-full h-20 object-cover" />
          </div>
          <div class="text-[10px] font-bold uppercase tracking-wider text-amber-700">${market.district}</div>
          <h4 class="font-black text-sm text-slate-950 leading-tight mb-1">${market.name}</h4>
          <p class="text-[11px] text-slate-600 line-clamp-2 mb-2">${market.specialization}</p>
          
          <div class="bg-amber-50 rounded p-1.5 border border-amber-200/80 text-[10px] space-y-1 mb-2">
            <div class="flex items-center justify-between text-amber-900 font-bold">
              <span>🗓 ${market.marketDays}</span>
            </div>
            <div class="flex items-center justify-between text-slate-700">
              <span>🛍 ${stats.tradersCount} Traders</span>
              <span>🏍 ${stats.ridersCount} Dispatch Riders</span>
            </div>
          </div>

          <button id="btn-select-market-${market.id}" class="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-1.5 px-2 rounded-lg transition-colors flex items-center justify-center gap-1">
            Explore ${market.name.split(' ')[0]} Produce
          </button>
        </div>
      `;

      const marker = L.marker([market.coordinates.lat, market.coordinates.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(popupHtml, { maxWidth: 240, className: 'volta-market-popup' });

      marker.on('click', () => {
        setActiveMarketId(market.id);
        onSelectMarket(market.id);
      });

      // Attach button listener after popup opens
      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-select-market-${market.id}`);
        if (btn) {
          btn.onclick = () => {
            handleMarketSelect(market.id);
            if (onNavigateToStorefront) {
              onNavigateToStorefront();
            }
          };
        }
      });

      markersRef.current[market.id] = marker;
    });

    // Fit bounds to show all markers initially
    const bounds = L.latLngBounds(VOLTA_MARKETS.map(m => [m.coordinates.lat, m.coordinates.lng]));
    map.fitBounds(bounds, { padding: [40, 40] });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle tile style changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerInstance) return;

    mapInstanceRef.current.removeLayer(tileLayerInstance);

    const tileUrl = mapStyle === 'DARK'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : mapStyle === 'SATELLITE'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const newLayer = L.tileLayer(tileUrl, {
      maxZoom: 18,
      subdomains: 'abcd',
    }).addTo(mapInstanceRef.current);

    setTileLayerInstance(newLayer);
  }, [mapStyle]);

  // User Geolocation Handler
  const handleLocateUser = () => {
    setGeoLoading(true);
    setGeoError(null);

    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      setGeoLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const coords = { lat: latitude, lng: longitude, locationName: 'Your Current Position' };
        setUserCoords(coords);
        setGeoLoading(false);

        if (mapInstanceRef.current) {
          // Remove old user marker
          if (userMarkerRef.current) {
            userMarkerRef.current.remove();
          }

          const userIconHtml = `
            <div class="relative flex items-center justify-center">
              <div class="absolute w-8 h-8 bg-sky-500/40 rounded-full animate-ping"></div>
              <div class="relative w-7 h-7 bg-sky-500 text-white rounded-full border-2 border-white flex items-center justify-center shadow-2xl">
                <div class="w-2.5 h-2.5 bg-white rounded-full"></div>
              </div>
            </div>
          `;

          const userIcon = L.divIcon({
            html: userIconHtml,
            className: 'custom-user-pin',
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });

          const userMarker = L.marker([latitude, longitude], { icon: userIcon })
            .addTo(mapInstanceRef.current)
            .bindPopup(`
              <div class="p-2 text-slate-900 font-sans text-xs">
                <div class="font-extrabold text-sky-700 flex items-center gap-1">
                  <span>📍 Your Geolocation</span>
                </div>
                <div class="text-[11px] text-slate-600 mt-1">
                  Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}
                </div>
              </div>
            `);

          userMarkerRef.current = userMarker;

          // Pan to user location & fit bounds to include nearest market
          mapInstanceRef.current.flyTo([latitude, longitude], 11, { duration: 1.5 });
          userMarker.openPopup();
        }
      },
      (error) => {
        setGeoLoading(false);
        setGeoError('Location permission was denied or unavailable in preview container. Use preset positions below.');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Preset location handler for distance testing
  const handleSelectPresetLocation = (preset: { name: string; lat: number; lng: number }) => {
    const coords = { lat: preset.lat, lng: preset.lng, locationName: preset.name };
    setUserCoords(coords);
    setGeoError(null);

    if (mapInstanceRef.current) {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }

      const userIconHtml = `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 bg-sky-500/40 rounded-full animate-ping"></div>
          <div class="relative w-7 h-7 bg-sky-500 text-white rounded-full border-2 border-white flex items-center justify-center shadow-2xl">
            <div class="w-2.5 h-2.5 bg-white rounded-full"></div>
          </div>
        </div>
      `;

      const userIcon = L.divIcon({
        html: userIconHtml,
        className: 'custom-user-pin',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const userMarker = L.marker([preset.lat, preset.lng], { icon: userIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div class="p-2 text-slate-900 font-sans text-xs">
            <div class="font-extrabold text-sky-700 flex items-center gap-1">
              <span>📍 Simulated Location: ${preset.name}</span>
            </div>
          </div>
        `);

      userMarkerRef.current = userMarker;
      mapInstanceRef.current.flyTo([preset.lat, preset.lng], 11, { duration: 1.2 });
      userMarker.openPopup();
    }
  };

  // Calculated market distances from user
  const marketDistances = React.useMemo(() => {
    if (!userCoords) return null;
    return VOLTA_MARKETS.map(m => {
      const distKm = calculateHaversineDistance(userCoords.lat, userCoords.lng, m.coordinates.lat, m.coordinates.lng);
      return { market: m, distKm };
    }).sort((a, b) => a.distKm - b.distKm);
  }, [userCoords]);

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-0 ${className}`}>
      
      {/* Top Map Header Control Bar */}
      <div className="bg-slate-950 px-4 sm:px-6 py-4 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
            <Navigation className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                Volta Regional Markets Interactive Map
              </h3>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[10px] px-2 py-0.5 rounded-full font-bold">
                7 Geolocation Hubs
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive GPS markers for Abor, Akatsi, Dabala, Mafi, Denu, Agbozume, & Aflao markets
            </p>
          </div>
        </div>

        {/* Map Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Tile Layer Selector */}
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setMapStyle('DARK')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                mapStyle === 'DARK' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => setMapStyle('LIGHT')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                mapStyle === 'LIGHT' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Street
            </button>
            <button
              onClick={() => setMapStyle('SATELLITE')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                mapStyle === 'SATELLITE' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Satellite
            </button>
          </div>

          {/* User Geolocation Button */}
          <button
            onClick={handleLocateUser}
            disabled={geoLoading}
            className="bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/40 text-sky-300 font-bold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
            title="Detect current GPS position and calculate market distances"
          >
            <LocateFixed className={`w-3.5 h-3.5 ${geoLoading ? 'animate-spin text-sky-400' : ''}`} />
            <span>{geoLoading ? 'Detecting GPS...' : 'Find My Distance'}</span>
          </button>

          {/* Fit All Markets Button */}
          <button
            onClick={() => handleMarketSelect('ALL')}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1"
            title="Reset map view to show all 7 markets"
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Fit All Markets</span>
          </button>

        </div>

      </div>

      {/* Quick Market Navigation Chips Bar */}
      <div className="bg-slate-950/80 px-4 py-2 border-b border-slate-800/80 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 min-w-max">
          <span className="text-[11px] font-extrabold uppercase text-slate-400 flex items-center gap-1 mr-1">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            Select Market:
          </span>

          <button
            onClick={() => handleMarketSelect('ALL')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
              activeMarketId === 'ALL'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            🌐 All 7 Markets
          </button>

          {VOLTA_MARKETS.map(market => {
            const isSelected = activeMarketId === market.id;
            return (
              <button
                key={market.id}
                onClick={() => handleMarketSelect(market.id as VoltaMarketId)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-105'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-amber-500/50 hover:text-white'
                }`}
              >
                <MapPin className={`w-3 h-3 ${isSelected ? 'text-slate-950' : 'text-amber-400'}`} />
                <span>{market.name.replace(' Market', '')}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Map Stage Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[440px]">
        
        {/* Left / Top Map Container */}
        <div className="lg:col-span-8 relative bg-slate-950 h-[380px] sm:h-[460px] lg:h-auto overflow-hidden">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Floating Geolocation Status / Notice Overlay */}
          {geoError && (
            <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-10 max-w-sm bg-slate-950/95 border border-amber-500/40 p-2.5 rounded-xl text-xs text-amber-300 space-y-1.5 backdrop-blur shadow-2xl">
              <div className="font-extrabold flex items-center gap-1 text-amber-400">
                <Info className="w-4 h-4 flex-shrink-0" />
                <span>Geolocation Distance Finder</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-tight">{geoError}</p>
              
              <div className="pt-1 border-t border-slate-800">
                <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase">Simulate Distance from Volta Town:</div>
                <div className="flex flex-wrap gap-1">
                  {VOLTA_TOWNSHIPS.map((town, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectPresetLocation(town)}
                      className="bg-slate-900 hover:bg-amber-500 hover:text-slate-950 border border-slate-800 text-[10px] font-semibold px-2 py-0.5 rounded text-slate-300 transition-colors"
                    >
                      {town.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Legend Overlay */}
          <div className="absolute top-3 left-3 z-10 bg-slate-950/90 border border-slate-800 p-2 rounded-xl text-[10px] space-y-1 text-slate-300 backdrop-blur pointer-events-none hidden sm:block">
            <div className="font-extrabold text-amber-400 uppercase tracking-wider text-[9px]">Map Key</div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block"></span>
              <span>Market Hub Location</span>
            </div>
            {userCoords && (
              <div className="flex items-center gap-1.5 text-sky-300">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span>
                <span>{userCoords.locationName || 'Your Location'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Detail Sidebar */}
        <div className="lg:col-span-4 bg-slate-950 border-t lg:border-t-0 lg:border-l border-slate-800 p-5 flex flex-col justify-between space-y-4">
          
          <div className="space-y-4">
            
            {/* Market Selected Badge & Image */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 group">
              <img
                src={activeMarket.image}
                alt={activeMarket.name}
                referrerPolicy="no-referrer"
                className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              
              <div className="absolute top-2 left-2 flex items-center gap-1.5">
                <span className="bg-amber-500 text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-md shadow-lg">
                  {activeMarket.district}
                </span>
              </div>

              <div className="absolute bottom-2 left-3 right-3">
                <h4 className="text-base font-black text-white leading-tight drop-shadow">
                  {activeMarket.name}
                </h4>
                <div className="text-[11px] text-amber-300 font-bold flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{activeMarket.marketDays}</span>
                </div>
              </div>
            </div>

            {/* Specialization & Landmark Details */}
            <div className="space-y-2 bg-slate-900 p-3 rounded-2xl border border-slate-800/80">
              <div className="text-xs font-extrabold text-emerald-400 flex items-start gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{activeMarket.specialization}</span>
              </div>

              <div className="text-xs text-slate-300 flex items-start gap-1.5">
                <Building2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Landmark: <strong className="text-slate-200">{activeMarket.markerLocationName}</strong></span>
              </div>
            </div>

            {/* Popular Produce Items Tags */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                Popular Regional Produce:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeMarket.popularItems.map((item, idx) => (
                  <span
                    key={idx}
                    className="bg-slate-900 border border-slate-800 text-amber-200 text-xs font-bold px-2.5 py-1 rounded-lg"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Market Supply & Dispatch Route Trace Widget */}
            <div className="pt-1">
              <ProductDeliveryTrace market={activeMarket} compact />
            </div>

            {/* Distance Matrix if Geolocation is active */}
            {marketDistances && (
              <div className="bg-sky-950/40 border border-sky-500/30 p-3 rounded-2xl space-y-2">
                <div className="text-xs font-black text-sky-300 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1"><Navigation className="w-3.5 h-3.5 text-sky-400" /> Proximity Matrix</span>
                  <span className="text-[10px] text-sky-400 font-mono">GPS Calculated</span>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto pr-1 text-xs">
                  {marketDistances.map(({ market, distKm }) => (
                    <div
                      key={market.id}
                      onClick={() => handleMarketSelect(market.id as VoltaMarketId)}
                      className={`flex items-center justify-between p-1.5 rounded-lg cursor-pointer transition-colors ${
                        activeMarketId === market.id ? 'bg-sky-500/20 text-white font-bold border border-sky-500/40' : 'text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <span className="truncate max-w-[140px]">{market.name.replace(' Market', '')}</span>
                      <span className="font-mono text-[11px] text-amber-400">{distKm} km</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-900">
            <button
              onClick={() => {
                onSelectMarket(activeMarket.id);
                if (onNavigateToStorefront) {
                  onNavigateToStorefront();
                }
              }}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-3 px-4 rounded-xl transition-all shadow-xl flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Show {activeMarket.name.split(' ')[0]} Produce in Storefront</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
