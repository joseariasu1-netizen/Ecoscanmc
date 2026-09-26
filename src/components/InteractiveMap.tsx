import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Layers,
  Filter,
  Plus,
  Navigation,
  Phone,
  MessageCircle,
  ExternalLink,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Building2,
  Trash2,
} from 'lucide-react';
import { RecycleCenter, PublicBin, CitizenReport } from '../types';

interface InteractiveMapProps {
  centers: RecycleCenter[];
  bins: PublicBin[];
  reports: CitizenReport[];
  onOpenRegisterBinModal: (coords?: { lat: number; lng: number }) => void;
  onOpenReportModal: () => void;
  userCoords: { lat: number; lng: number };
  setUserCoords: (coords: { lat: number; lng: number }) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  centers,
  bins,
  reports,
  onOpenRegisterBinModal,
  onOpenReportModal,
  userCoords,
  setUserCoords,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Layer switches
  const [showCenters, setShowCenters] = useState<boolean>(true);
  const [showBins, setShowBins] = useState<boolean>(true);
  const [showReports, setShowReports] = useState<boolean>(true);
  const [materialFilter, setMaterialFilter] = useState<string>('todos');
  const [selectedCenter, setSelectedCenter] = useState<RecycleCenter | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Distance calculator helper
  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(2));
  };

  // Compute distances for centers
  const centersWithDistance = centers.map((c) => ({
    ...c,
    distanceKm: calculateDistanceKm(userCoords.lat, userCoords.lng, c.latitude, c.longitude),
  })).sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userCoords.lat, userCoords.lng],
        zoom: 13,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Clean OpenStreetMap Tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Context click on map to register bin at exact spot
      map.on('contextmenu', (e: L.LeafletMouseEvent) => {
        onOpenRegisterBinModal({ lat: e.latlng.lat, lng: e.latlng.lng });
      });

      markersLayerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      // Map cleanup if component unmounts completely
    };
  }, []);

  // Update Markers whenever filters, layers or data change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerGroupRef.current) return;

    markersLayerGroupRef.current.clearLayers();

    // 1. User GPS Marker
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div style="position: relative; width: 24px; height: 24px;">
          <div style="position: absolute; inset: 0; background-color: #3b82f6; border-radius: 9999px; opacity: 0.3; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; inset: 3px; background-color: #2563eb; border: 2.5px solid #ffffff; border-radius: 9999px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    L.marker([userCoords.lat, userCoords.lng], { icon: userIcon })
      .bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; padding: 2px;">
          <strong style="color: #1e3a8a;">Tu Ubicación Actual</strong>
          <div style="color: #64748b; font-size: 11px;">Radio de búsqueda activo</div>
        </div>
      `)
      .addTo(markersLayerGroupRef.current);

    // 2. Capa A: Centros de Acopio y Reciclaje
    if (showCenters) {
      const filteredCenters = materialFilter === 'todos'
        ? centers
        : centers.filter((c) =>
            c.acceptedMaterials.some((m) =>
              m.toLowerCase().includes(materialFilter.toLowerCase())
            )
          );

      filteredCenters.forEach((center) => {
        const centerIcon = L.divIcon({
          className: 'center-marker',
          html: `
            <div style="background-color: #0284c7; color: white; width: 34px; height: 34px; border-radius: 12px; border: 2px solid white; box-shadow: 0 4px 10px rgba(2, 132, 199, 0.4); display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold;">
              ♻️
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        const marker = L.marker([center.latitude, center.longitude], { icon: centerIcon });
        const distance = calculateDistanceKm(userCoords.lat, userCoords.lng, center.latitude, center.longitude);

        const popupContent = `
          <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 230px; padding: 4px;">
            <div style="font-size: 10px; font-weight: 700; color: #0284c7; text-transform: uppercase; margin-bottom: 2px;">
              ${center.typeLabel}
            </div>
            <h4 style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 0 0 6px 0; line-height: 1.2;">
              ${center.name}
            </h4>
            <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">
              📍 <strong>Dirección:</strong> ${center.address} (${distance} km)
            </div>
            <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">
              🕒 <strong>Horario:</strong> ${center.schedule}
            </div>
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 6px; margin-bottom: 8px; font-size: 10.5px; color: #166534;">
              <strong>Materiales aceptados:</strong> ${center.acceptedMaterials.join(', ')}
            </div>
            <div style="display: flex; gap: 6px;">
              ${
                center.whatsapp
                  ? `<a href="https://wa.me/${center.whatsapp.replace(/[^0-9]/g, '')}" target="_blank" style="flex: 1; text-align: center; background: #22c55e; color: white; padding: 5px 8px; border-radius: 6px; text-decoration: none; font-size: 11px; font-weight: 700;">WhatsApp</a>`
                  : ''
              }
              <a href="https://www.google.com/maps/dir/?api=1&destination=${center.latitude},${center.longitude}" target="_blank" style="flex: 1; text-align: center; background: #0f172a; color: white; padding: 5px 8px; border-radius: 6px; text-decoration: none; font-size: 11px; font-weight: 700;">Cómo Llegar</a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.addTo(markersLayerGroupRef.current!);
      });
    }

    // 3. Capa B: Red Comunitaria de Canecas Públicas
    if (showBins) {
      bins.forEach((bin) => {
        let bgColor = '#10b981';
        let binEmoji = '💚';
        if (bin.type === 'blanca') {
          bgColor = '#64748b';
          binEmoji = '🤍';
        } else if (bin.type === 'negra') {
          bgColor = '#1e293b';
          binEmoji = '🖤';
        } else if (bin.type === 'roja_especial') {
          bgColor = '#ef4444';
          binEmoji = '🛑';
        } else if (bin.type === 'estacion_ecologica') {
          bgColor = '#059669';
          binEmoji = '♻️';
        }

        const binIcon = L.divIcon({
          className: 'bin-marker',
          html: `
            <div style="background-color: ${bgColor}; color: white; width: 28px; height: 28px; border-radius: 9999px; border: 2px solid white; box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25); display: flex; align-items: center; justify-content: center; font-size: 13px;">
              ${binEmoji}
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([bin.latitude, bin.longitude], { icon: binIcon });
        const popupContent = `
          <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 200px; padding: 4px;">
            <div style="font-size: 10px; font-weight: 700; color: #059669; text-transform: uppercase; margin-bottom: 2px;">
              Caneca Comunitaria
            </div>
            <h4 style="font-size: 13px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0;">
              ${bin.typeLabel}
            </h4>
            <div style="font-size: 11px; color: #475569; margin-bottom: 3px;">
              📍 ${bin.address}
            </div>
            <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">
              ✨ <strong>Estado:</strong> ${bin.condition} | 👤 <strong>Por:</strong> ${bin.reportedBy}
            </div>
            ${bin.notes ? `<div style="font-size: 11px; color: #64748b; font-style: italic; margin-bottom: 6px;">"${bin.notes}"</div>` : ''}
            <a href="https://www.google.com/maps/dir/?api=1&destination=${bin.latitude},${bin.longitude}" target="_blank" style="display: block; text-align: center; background: #059669; color: white; padding: 4px 8px; border-radius: 6px; text-decoration: none; font-size: 11px; font-weight: 700;">
              Guiar hasta aquí
            </a>
          </div>
        `;
        marker.bindPopup(popupContent);
        marker.addTo(markersLayerGroupRef.current!);
      });
    }

    // 4. Capa C: Reportes Ciudadanos de Basura
    if (showReports) {
      reports
        .filter((r) => r.status !== 'recolectado')
        .forEach((rep) => {
          const repColor = rep.urgency === 'critica' ? '#dc2626' : rep.urgency === 'alta' ? '#ea580c' : '#f59e0b';
          const repIcon = L.divIcon({
            className: 'report-marker',
            html: `
              <div style="background-color: ${repColor}; color: white; width: 30px; height: 30px; border-radius: 8px; border: 2px solid white; box-shadow: 0 3px 8px rgba(220, 38, 38, 0.4); display: flex; align-items: center; justify-content: center; font-size: 14px;">
                ⚠️
              </div>
            `,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          });

          const marker = L.marker([rep.latitude, rep.longitude], { icon: repIcon });
          const popupContent = `
            <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 220px; padding: 4px;">
              <div style="display: flex; justify-content: space-between; font-size: 10px; font-weight: 700; color: #dc2626; margin-bottom: 2px;">
                <span>ALERTA DE BASURA</span>
                <span style="background: #fee2e2; padding: 1px 4px; border-radius: 4px; text-transform: uppercase;">${rep.urgency}</span>
              </div>
              <h4 style="font-size: 13px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0;">
                ${rep.categoryLabel}
              </h4>
              <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">
                📍 ${rep.address}
              </div>
              <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
                Ticket: <strong>${rep.ticketCode}</strong> (${rep.upvotes} apoyos)
              </div>
              <a href="https://www.google.com/maps/dir/?api=1&destination=${rep.latitude},${rep.longitude}" target="_blank" style="display: block; text-align: center; background: #dc2626; color: white; padding: 4px 8px; border-radius: 6px; text-decoration: none; font-size: 11px; font-weight: 700;">
                Ver Ubicación en Mapa
              </a>
            </div>
          `;
          marker.bindPopup(popupContent);
          marker.addTo(markersLayerGroupRef.current!);
        });
    }
  }, [showCenters, showBins, showReports, materialFilter, centers, bins, reports, userCoords]);

  const handleCenterUserGPS = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(newCoords);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([newCoords.lat, newCoords.lng], 14, { duration: 1.2 });
        }
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true }
    );
  };

  const handleFocusCenter = (center: RecycleCenter) => {
    setSelectedCenter(center);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([center.latitude, center.longitude], 16, { duration: 1 });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-md shadow-slate-200/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-sky-50 text-sky-800 rounded-full text-xs font-bold border border-sky-200 mb-1">
            <Compass className="w-3.5 h-3.5 text-sky-600" />
            <span>Geolocalización OpenStreetMap & Leaflet</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Mapa de Centros de Acopio y Red de Canecas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Descubre dónde entregar tus reciclables limpios, puntos posconsumo y canecas públicas verificadas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-map-my-gps"
            onClick={handleCenterUserGPS}
            disabled={isLocating}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 transition-colors"
          >
            <Navigation className="w-3.5 h-3.5 text-blue-600" />
            <span>{isLocating ? 'Obteniendo GPS...' : 'Mi Ubicación'}</span>
          </button>

          <button
            id="btn-register-bin-map"
            onClick={() => onOpenRegisterBinModal(userCoords)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Caneca</span>
          </button>
        </div>
      </div>

      {/* Layer Toggles & Material Filter Bar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Layer Switches */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold uppercase text-slate-400 hidden sm:inline">Capas:</span>

          <button
            onClick={() => setShowCenters(!showCenters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              showCenters
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <span>♻️</span>
            <span>Centros de Acopio ({centers.length})</span>
          </button>

          <button
            onClick={() => setShowBins(!showBins)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              showBins
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <span>🗑️</span>
            <span>Canecas Públicas ({bins.length})</span>
          </button>

          <button
            onClick={() => setShowReports(!showReports)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              showReports
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <span>⚠️</span>
            <span>Reportes Vía Pública ({reports.filter((r) => r.status !== 'recolectado').length})</span>
          </button>
        </div>

        {/* Material Filter */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={materialFilter}
            onChange={(e) => setMaterialFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white focus:ring-2 focus:ring-emerald-500"
          >
            <option value="todos">Todos los Materiales</option>
            <option value="plástico">Plásticos (PET, PEAD)</option>
            <option value="vidrio">Vidrio</option>
            <option value="cartón">Papel y Cartón</option>
            <option value="orgánico">Materia Orgánica</option>
            <option value="raee">Pilas / Electrónicos (RAEE)</option>
            <option value="aceite">Aceite Usado</option>
          </select>
        </div>
      </div>

      {/* Main Map + Side Directory Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Leaflet Map Canvas */}
        <div className="lg:col-span-2 bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 shadow-xl relative min-h-[460px] h-[520px]">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Quick Help Overlay */}
          <div className="absolute bottom-3 left-3 z-[400] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 text-[11px] font-medium text-slate-700 shadow-md flex items-center gap-2">
            <span>💡 Clic derecho en el mapa para registrar caneca en esa coordenada.</span>
          </div>
        </div>

        {/* Nearest Recycling Centers Directory */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-md flex flex-col justify-between max-h-[520px] overflow-hidden">
          <div className="space-y-3 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>Puntos Limpios Cercanos</span>
              </h3>
              <span className="text-xs text-slate-400 font-medium">Por proximidad GPS</span>
            </div>

            {/* List */}
            <div className="space-y-2.5 overflow-y-auto pr-1 flex-1 max-h-[400px]">
              {centersWithDistance.map((center) => (
                <div
                  key={center.id}
                  onClick={() => handleFocusCenter(center)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left space-y-2 ${
                    selectedCenter?.id === center.id
                      ? 'bg-sky-50/80 border-sky-400 shadow-xs'
                      : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-sky-700 block">
                        {center.typeLabel}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900 line-clamp-1">
                        {center.name}
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 text-[10px] font-extrabold rounded-full shrink-0">
                      {center.distanceKm} km
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="line-clamp-1">{center.address}</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {center.acceptedMaterials.slice(0, 3).map((mat, i) => (
                      <span
                        key={i}
                        className="text-[9px] px-1.5 py-0.5 bg-white rounded border border-slate-200 text-slate-600 font-medium"
                      >
                        {mat}
                      </span>
                    ))}
                    {center.acceptedMaterials.length > 3 && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-slate-200 rounded text-slate-600">
                        +{center.acceptedMaterials.length - 3} más
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 text-xs">
                    {center.whatsapp && (
                      <a
                        href={`https://wa.me/${center.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold hover:underline"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${center.latitude},${center.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-[11px] text-slate-700 font-bold hover:underline ml-auto"
                    >
                      <span>Ruta GPS</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
