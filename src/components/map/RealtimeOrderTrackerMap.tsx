import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { VOLTA_MARKETS } from '../../data/seedData';
import { Order, OrderStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  Navigation, 
  Bike, 
  MapPin, 
  Store, 
  Clock, 
  Compass, 
  LocateFixed, 
  Play, 
  Pause, 
  FastForward, 
  RotateCcw, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  Battery, 
  Signal, 
  Phone,
  Layers,
  Sparkles,
  Maximize2
} from 'lucide-react';

interface RealtimeOrderTrackerMapProps {
  order: Order;
  className?: string;
}

// Haversine distance formula in kilometers
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

// Generate realistic road waypoints between market origin and customer destination
function generateRouteWaypoints(
  startLat: number, 
  startLng: number, 
  endLat: number, 
  endLng: number, 
  stepsCount = 30
): { lat: number; lng: number }[] {
  const points: { lat: number; lng: number }[] = [];
  
  // Add slight organic road curve / detours representing Volta regional highway roads
  const midLat = (startLat + endLat) / 2 + (endLng - startLng) * 0.15;
  const midLng = (startLng + endLng) / 2 - (endLat - startLat) * 0.15;

  for (let i = 0; i <= stepsCount; i++) {
    const t = i / stepsCount;
    // Quadratic Bezier curve
    const lat = (1 - t) * (1 - t) * startLat + 2 * (1 - t) * t * midLat + t * t * endLat;
    const lng = (1 - t) * (1 - t) * startLng + 2 * (1 - t) * t * midLng + t * t * endLng;
    points.push({ lat, lng });
  }

  return points;
}

// Deterministic customer location based on digital address / order id if exact coords aren't provided
function getCustomerLocationForOrder(order: Order, marketLat: number, marketLng: number) {
  // Hash code from order code
  let hash = 0;
  for (let i = 0; i < order.id.length; i++) {
    hash = (hash << 5) - hash + order.id.charCodeAt(i);
    hash |= 0;
  }

  const offsetLat = (((Math.abs(hash) % 100) / 100) * 0.04 + 0.015) * (hash % 2 === 0 ? 1 : -1);
  const offsetLng = ((((Math.abs(hash) >> 2) % 100) / 100) * 0.04 + 0.015) * ((hash >> 1) % 2 === 0 ? 1 : -1);

  return {
    lat: marketLat + offsetLat,
    lng: marketLng + offsetLng
  };
}

export const RealtimeOrderTrackerMap: React.FC<RealtimeOrderTrackerMapProps> = ({
  order,
  className = ''
}) => {
  const { riders, updateOrderStatus } = useApp();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Leaflet Layer References
  const riderMarkerRef = useRef<L.Marker | null>(null);
  const marketMarkerRef = useRef<L.Marker | null>(null);
  const customerMarkerRef = useRef<L.Marker | null>(null);
  const completedPolylineRef = useRef<L.Polyline | null>(null);
  const remainingPolylineRef = useRef<L.Polyline | null>(null);

  // Find Market & Rider Object
  const marketObj = VOLTA_MARKETS.find(m => m.id === order.marketId) || VOLTA_MARKETS[0];
  const assignedRider = order.riderId ? riders.find(r => r.id === order.riderId) : null;

  // Origin & Destination Coords
  const originCoords = marketObj.coordinates;
  const destinationCoords = React.useMemo(() => {
    return getCustomerLocationForOrder(order, originCoords.lat, originCoords.lng);
  }, [order, originCoords]);

  // Route Waypoints
  const waypoints = React.useMemo(() => {
    return generateRouteWaypoints(
      originCoords.lat, 
      originCoords.lng, 
      destinationCoords.lat, 
      destinationCoords.lng, 
      35
    );
  }, [originCoords, destinationCoords]);

  // Real-Time Motion State
  const [progressIndex, setProgressIndex] = useState<number>(() => {
    if (order.status === 'DELIVERED') return waypoints.length - 1;
    if (order.status === 'BROADCAST_PENDING') return 0;
    if (order.status === 'ACCEPTED_BY_RIDER') return 2;
    if (order.status === 'PICKING_UP') return 5;
    if (order.status === 'IN_TRANSIT') return 12;
    return 0;
  });

  const [isSimulating, setIsSimulating] = useState<boolean>(
    order.status === 'IN_TRANSIT' || order.status === 'ACCEPTED_BY_RIDER' || order.status === 'PICKING_UP'
  );
  const [simSpeed, setSimSpeed] = useState<number>(1); // 1x, 2x, 5x
  const [mapStyle, setMapStyle] = useState<'DARK' | 'LIGHT' | 'SATELLITE'>('DARK');
  const [followRider, setFollowRider] = useState<boolean>(true);
  const [speedKmh, setSpeedKmh] = useState<number>(34);

  // Current Rider Position
  const currentRiderPos = waypoints[Math.min(progressIndex, waypoints.length - 1)];

  // Distance & ETA Calculations
  const distanceRemainingKm = calculateHaversineDistance(
    currentRiderPos.lat,
    currentRiderPos.lng,
    destinationCoords.lat,
    destinationCoords.lng
  );

  const totalDistanceKm = calculateHaversineDistance(
    originCoords.lat,
    originCoords.lng,
    destinationCoords.lat,
    destinationCoords.lng
  );

  const etaMinutes = Math.max(1, Math.ceil((distanceRemainingKm / (speedKmh || 30)) * 60));

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Center map halfway between origin & destination
    const centerLat = (originCoords.lat + destinationCoords.lat) / 2;
    const centerLng = (originCoords.lng + destinationCoords.lng) / 2;

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: 13,
      zoomControl: false,
      attributionControl: false
    });

    mapInstanceRef.current = map;
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Initial Tile Layer
    const tileUrl = mapStyle === 'DARK'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : mapStyle === 'SATELLITE'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    L.tileLayer(tileUrl, { maxZoom: 18, subdomains: 'abcd' }).addTo(map);

    // 1. Market Origin Marker
    const marketIconHtml = `
      <div class="relative flex items-center justify-center">
        <div class="absolute -inset-2 bg-amber-500/20 rounded-full blur-sm"></div>
        <div class="relative w-9 h-9 bg-slate-950 text-amber-400 border-2 border-amber-500 rounded-xl flex items-center justify-center shadow-2xl font-black text-xs">
          🏪
        </div>
      </div>
    `;

    const marketIcon = L.divIcon({
      html: marketIconHtml,
      className: 'custom-map-icon',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -20]
    });

    marketMarkerRef.current = L.marker([originCoords.lat, originCoords.lng], { icon: marketIcon })
      .addTo(map)
      .bindPopup(`
        <div class="p-1 font-sans text-xs text-slate-900">
          <div class="font-extrabold text-amber-800 uppercase tracking-wider text-[10px]">Origin Market Hub</div>
          <div class="font-black text-sm text-slate-950">${marketObj.name}</div>
          <div class="text-[11px] text-slate-600 mt-0.5">${marketObj.markerLocationName}</div>
          <div class="mt-2 bg-amber-50 border border-amber-200 p-1.5 rounded text-[10px] text-amber-900 font-medium">
            📦 Goods packed & verified at stall
          </div>
        </div>
      `);

    // 2. Customer Destination Marker
    const customerIconHtml = `
      <div class="relative flex items-center justify-center">
        <div class="absolute -inset-2 bg-sky-500/30 rounded-full blur-sm"></div>
        <div class="relative w-9 h-9 bg-slate-950 text-sky-400 border-2 border-sky-400 rounded-xl flex items-center justify-center shadow-2xl font-black text-xs">
          📍
        </div>
      </div>
    `;

    const customerIcon = L.divIcon({
      html: customerIconHtml,
      className: 'custom-map-icon',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -20]
    });

    customerMarkerRef.current = L.marker([destinationCoords.lat, destinationCoords.lng], { icon: customerIcon })
      .addTo(map)
      .bindPopup(`
        <div class="p-1 font-sans text-xs text-slate-900">
          <div class="font-extrabold text-sky-800 uppercase tracking-wider text-[10px]">Delivery Destination</div>
          <div class="font-black text-sm text-slate-950">${order.customerName}</div>
          <div class="text-[11px] font-bold text-emerald-700 mt-0.5">GPS: ${order.digitalAddress}</div>
          <div class="text-[10px] text-slate-600">${order.deliveryAddress}</div>
        </div>
      `);

    // 3. Moving Rider Marker
    const riderVehicleLabel = assignedRider?.vehicleType === 'TRICYCLE_ABOBOYAA' ? '🛺 Aboboyaa' : '🏍️ Okada';
    const riderIconHtml = `
      <div class="relative flex items-center justify-center">
        <div class="absolute -inset-3 bg-emerald-500/40 rounded-full animate-ping"></div>
        <div class="relative w-10 h-10 bg-emerald-500 text-slate-950 ring-4 ring-emerald-300/60 rounded-full flex items-center justify-center shadow-2xl font-black text-sm">
          ${assignedRider?.vehicleType === 'TRICYCLE_ABOBOYAA' ? '🛺' : '🏍️'}
        </div>
      </div>
    `;

    const riderIcon = L.divIcon({
      html: riderIconHtml,
      className: 'custom-rider-icon',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -22]
    });

    riderMarkerRef.current = L.marker([currentRiderPos.lat, currentRiderPos.lng], { icon: riderIcon })
      .addTo(map)
      .bindPopup(`
        <div class="p-1 font-sans text-xs text-slate-900">
          <div class="font-extrabold text-emerald-800 uppercase tracking-wider text-[10px]">Active Dispatch Rider</div>
          <div class="font-black text-sm text-slate-950">${assignedRider?.name || 'Volta Dispatch Rider'}</div>
          <div class="text-[11px] text-slate-600">${riderVehicleLabel} (${assignedRider?.vehiclePlate || 'VR-OK-2026'})</div>
          <div class="mt-2 bg-emerald-50 border border-emerald-200 p-1.5 rounded text-[10px] text-emerald-900 font-bold flex justify-between">
            <span>⚡ Live GPS Telemetry</span>
            <span>${speedKmh} km/h</span>
          </div>
        </div>
      `);

    // 4. Draw Polylines (Completed vs Remaining)
    const completedPath = waypoints.slice(0, Math.max(1, progressIndex + 1)).map(w => [w.lat, w.lng] as [number, number]);
    const remainingPath = waypoints.slice(progressIndex).map(w => [w.lat, w.lng] as [number, number]);

    completedPolylineRef.current = L.polyline(completedPath, {
      color: '#10b981', // Emerald green
      weight: 5,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    remainingPolylineRef.current = L.polyline(remainingPath, {
      color: '#f59e0b', // Amber
      weight: 4,
      dashArray: '8, 8',
      opacity: 0.7,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // Fit bounds to fit route
    const bounds = L.latLngBounds(waypoints.map(w => [w.lat, w.lng]));
    map.fitBounds(bounds, { padding: [40, 40] });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map style when changed
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    // Clear tile layers and apply new tile layer
    mapInstanceRef.current.eachLayer(layer => {
      if (layer instanceof L.TileLayer) {
        mapInstanceRef.current?.removeLayer(layer);
      }
    });

    const tileUrl = mapStyle === 'DARK'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : mapStyle === 'SATELLITE'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    L.tileLayer(tileUrl, { maxZoom: 18, subdomains: 'abcd' }).addTo(mapInstanceRef.current);
  }, [mapStyle]);

  // Real-time Motion Interval Simulation Effect
  useEffect(() => {
    if (!isSimulating || order.status === 'DELIVERED') return;

    const intervalTimeMs = Math.max(300, 1500 / simSpeed);

    const interval = setInterval(() => {
      setProgressIndex(prevIndex => {
        const nextIndex = prevIndex + 1;

        if (nextIndex >= waypoints.length) {
          setIsSimulating(false);
          // Auto-update order status to DELIVERED or IN_TRANSIT if reached end
          if (order.status !== 'DELIVERED') {
            updateOrderStatus(order.id, 'IN_TRANSIT');
          }
          return waypoints.length - 1;
        }

        // Fluctuate speed realistically
        const randomSpeed = Math.floor(28 + Math.random() * 18);
        setSpeedKmh(randomSpeed);

        // Advance Order status according to progress position
        const progressPercentage = (nextIndex / waypoints.length) * 100;

        if (progressPercentage >= 15 && progressPercentage < 30 && order.status === 'ACCEPTED_BY_RIDER') {
          updateOrderStatus(order.id, 'PICKING_UP');
        } else if (progressPercentage >= 30 && (order.status === 'ACCEPTED_BY_RIDER' || order.status === 'PICKING_UP')) {
          updateOrderStatus(order.id, 'IN_TRANSIT');
        }

        return nextIndex;
      });
    }, intervalTimeMs);

    return () => clearInterval(interval);
  }, [isSimulating, simSpeed, waypoints, order.status]);

  // Update Leaflet layers when progressIndex or position updates
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const targetPos = waypoints[Math.min(progressIndex, waypoints.length - 1)];

    // 1. Move Rider Marker
    if (riderMarkerRef.current) {
      riderMarkerRef.current.setLatLng([targetPos.lat, targetPos.lng]);
    }

    // 2. Update Polylines
    const completedPath = waypoints.slice(0, Math.max(1, progressIndex + 1)).map(w => [w.lat, w.lng] as [number, number]);
    const remainingPath = waypoints.slice(progressIndex).map(w => [w.lat, w.lng] as [number, number]);

    if (completedPolylineRef.current) {
      completedPolylineRef.current.setLatLngs(completedPath);
    }
    if (remainingPolylineRef.current) {
      remainingPolylineRef.current.setLatLngs(remainingPath);
    }

    // 3. Pan Camera if Follow Rider is enabled
    if (followRider && mapInstanceRef.current) {
      mapInstanceRef.current.panTo([targetPos.lat, targetPos.lng], { animate: true, duration: 0.8 });
    }
  }, [progressIndex, waypoints, followRider]);

  // Handlers for interactive controls
  const handleFocusRider = () => {
    setFollowRider(true);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([currentRiderPos.lat, currentRiderPos.lng], 15, { duration: 1 });
    }
  };

  const handleCenterRoute = () => {
    setFollowRider(false);
    if (mapInstanceRef.current) {
      const bounds = L.latLngBounds(waypoints.map(w => [w.lat, w.lng]));
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
    }
  };

  const handleResetMovement = () => {
    setProgressIndex(0);
    setIsSimulating(true);
    if (order.status !== 'DELIVERED') {
      updateOrderStatus(order.id, 'ACCEPTED_BY_RIDER');
    }
  };

  return (
    <div className={`bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl space-y-0 ${className}`}>
      
      {/* Live Telemetry Header Bar */}
      <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        
        {/* Status Indicator */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <span className="w-3 h-3 bg-emerald-500 rounded-full inline-block animate-ping absolute" />
            <span className="w-3 h-3 bg-emerald-500 rounded-full inline-block relative" />
          </div>
          <div>
            <div className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>Real-Time GPS Order Tracker</span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full">
                Active Telemetry
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              {order.status === 'DELIVERED' 
                ? '✅ Rider arrived at customer doorstep' 
                : order.status === 'BROADCAST_PENDING'
                ? '📡 Broadcasting order to nearby riders in market...'
                : `🏍️ ${assignedRider?.name || 'Rider'} is ${order.status.replace(/_/g, ' ').toLowerCase()}`
              }
            </div>
          </div>
        </div>

        {/* Live Metrics Pills */}
        <div className="flex items-center gap-2 flex-wrap text-xs font-mono font-bold">
          
          <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-amber-400 flex items-center gap-1.5 shadow-inner">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>ETA: {etaMinutes} min{etaMinutes > 1 ? 's' : ''}</span>
          </div>

          <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-sky-300 flex items-center gap-1.5 shadow-inner">
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            <span>{distanceRemainingKm.toFixed(2)} km left</span>
          </div>

          <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-emerald-400 flex items-center gap-1.5 shadow-inner">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>{speedKmh} km/h</span>
          </div>

        </div>

      </div>

      {/* Main Map Canvas Area */}
      <div className="relative h-[320px] sm:h-[380px] bg-slate-950 overflow-hidden">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Top-Right Controls */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
          
          {/* Map Style Selector */}
          <div className="bg-slate-950/90 border border-slate-800 p-1 rounded-xl backdrop-blur shadow-2xl flex flex-col gap-1">
            <button
              onClick={() => setMapStyle('DARK')}
              className={`p-1.5 rounded-lg text-[10px] font-bold transition-colors ${
                mapStyle === 'DARK' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
              title="Dark Map Theme"
            >
              Dark
            </button>
            <button
              onClick={() => setMapStyle('LIGHT')}
              className={`p-1.5 rounded-lg text-[10px] font-bold transition-colors ${
                mapStyle === 'LIGHT' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
              title="Street Map Theme"
            >
              Street
            </button>
            <button
              onClick={() => setMapStyle('SATELLITE')}
              className={`p-1.5 rounded-lg text-[10px] font-bold transition-colors ${
                mapStyle === 'SATELLITE' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
              title="Satellite View"
            >
              Sat
            </button>
          </div>

        </div>

        {/* Floating Bottom-Left Camera Controls */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2">
          
          <button
            onClick={handleFocusRider}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border backdrop-blur shadow-xl flex items-center gap-1.5 ${
              followRider 
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold ring-2 ring-emerald-400/50' 
                : 'bg-slate-950/90 text-slate-200 border-slate-800 hover:bg-slate-900'
            }`}
          >
            <LocateFixed className="w-3.5 h-3.5" />
            <span>Lock Rider</span>
          </button>

          <button
            onClick={handleCenterRoute}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-950/90 border border-slate-800 text-slate-200 hover:bg-slate-900 transition-all backdrop-blur shadow-xl flex items-center gap-1.5"
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Center Route</span>
          </button>

        </div>

        {/* Floating Bottom-Right Simulation Playback Controls */}
        <div className="absolute bottom-3 right-3 z-10 bg-slate-950/90 border border-slate-800 p-1.5 rounded-2xl backdrop-blur shadow-2xl flex items-center gap-1.5">
          
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`p-2 rounded-xl text-xs font-bold transition-all ${
              isSimulating 
                ? 'bg-amber-500 text-slate-950' 
                : 'bg-slate-900 text-slate-200 hover:bg-slate-800'
            }`}
            title={isSimulating ? 'Pause Motion Simulation' : 'Play Motion Simulation'}
          >
            {isSimulating ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          {/* Speed Multiplier Buttons */}
          <button
            onClick={() => setSimSpeed(1)}
            className={`px-2 py-1 rounded-lg text-[10px] font-extrabold font-mono transition-colors ${
              simSpeed === 1 ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            1x
          </button>
          <button
            onClick={() => setSimSpeed(2)}
            className={`px-2 py-1 rounded-lg text-[10px] font-extrabold font-mono transition-colors ${
              simSpeed === 2 ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            2x
          </button>
          <button
            onClick={() => setSimSpeed(5)}
            className={`px-2 py-1 rounded-lg text-[10px] font-extrabold font-mono transition-colors ${
              simSpeed === 5 ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            5x
          </button>

          <div className="w-px h-4 bg-slate-800" />

          <button
            onClick={handleResetMovement}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-colors"
            title="Reset Movement to Start"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

        </div>

      </div>

      {/* Footer Dispatch Telemetry & Signal Status */}
      <div className="bg-slate-900 px-4 py-2.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-emerald-400 font-bold">
            <Signal className="w-3.5 h-3.5" />
            <span>GPS Signal: 100%</span>
          </div>
          <div className="flex items-center gap-1 text-sky-400 font-bold">
            <Battery className="w-3.5 h-3.5" />
            <span>Rider Device: 88%</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-mono text-[11px]">
            Route: <strong className="text-amber-300">{marketObj.name.split(' ')[0]} Hub</strong> ➔ <strong className="text-sky-300">{order.digitalAddress}</strong>
          </span>
        </div>

      </div>

    </div>
  );
};
