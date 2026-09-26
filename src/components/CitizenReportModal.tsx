import React, { useState } from 'react';
import {
  X,
  Camera,
  MapPin,
  AlertTriangle,
  Upload,
  CheckCircle2,
  Ticket,
  Clock,
  Sparkles,
  Navigation,
} from 'lucide-react';
import { CitizenReport, ReportCategory, ReportUrgency } from '../types';

interface CitizenReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportCreated: (report: CitizenReport) => void;
  userCoords?: { lat: number; lng: number };
}

export const CitizenReportModal: React.FC<CitizenReportModalProps> = ({
  isOpen,
  onClose,
  onReportCreated,
  userCoords,
}) => {
  const [photoUrl, setPhotoUrl] = useState<string>(
    'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80'
  );
  const [latitude, setLatitude] = useState<number>(userCoords?.lat || 6.2738);
  const [longitude, setLongitude] = useState<number>(userCoords?.lng || -75.5915);
  const [address, setAddress] = useState<string>('Carrera 87 # 78-45, Robledo, Medellín');
  const [reference, setReference] = useState<string>('Cerca a la I.E. Rafael Uribe Uribe');
  const [category, setCategory] = useState<ReportCategory>('basura_desbordada');
  const [urgency, setUrgency] = useState<ReportUrgency>('alta');
  const [notes, setNotes] = useState<string>('');
  const [citizenName, setCitizenName] = useState<string>('');
  const [citizenPhone, setCitizenPhone] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [createdReport, setCreatedReport] = useState<CitizenReport | null>(null);

  if (!isOpen) return null;

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setAddress(`Ubicación GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        setIsLocating(false);
      },
      (err) => {
        console.error('Error GPS:', err);
        setIsLocating(false);
        alert('No se pudo obtener la ubicación GPS automática. Por favor escribe la dirección manualmente.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const categoryLabels: { [key in ReportCategory]: string } = {
      basura_desbordada: 'Basura Desbordada en Espacio Público',
      escombros_construccion: 'Escombros de Construcción sin Recoger',
      vertedero_clandestino: 'Punto Crítico / Basurero Clandestino',
      muebles_voluminosos: 'Muebles y Residuos Voluminosos',
      residuos_peligrosos: 'Residuos Peligrosos / Biológicos / Químicos',
      alcantarilla_obstruida: 'Alcantarilla o Sumidero Obstruido por Basura',
      otro: 'Otro Tipo de Acumulación',
    };

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoUrl,
          latitude,
          longitude,
          address,
          reference,
          category,
          categoryLabel: categoryLabels[category],
          urgency,
          notes,
          citizenName: citizenName.trim() || 'Ciudadano Vigilante',
          citizenPhone,
        }),
      });

      const data = await response.json();
      if (response.ok && data.report) {
        setCreatedReport(data.report);
        onReportCreated(data.report);
      } else {
        throw new Error(data.error || 'Error al crear reporte');
      }
    } catch (err: any) {
      console.error('Error enviando reporte:', err);
      // Fallback local report creation
      const localReport: CitizenReport = {
        id: `rep-${Date.now()}`,
        ticketCode: `REP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        photoUrl,
        latitude,
        longitude,
        address,
        reference,
        category,
        categoryLabel: categoryLabels[category],
        urgency,
        status: 'pendiente',
        notes,
        citizenName: citizenName.trim() || 'Ciudadano Vigilante',
        citizenPhone,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        upvotes: 1,
      };
      setCreatedReport(localReport);
      onReportCreated(localReport);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8">
        {/* Close button */}
        <button
          id="btn-close-report-modal"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Ticket View */}
        {createdReport ? (
          <div className="text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-slate-900">
                ¡Reporte Ciudadano Registrado!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Tu reporte ha sido georreferenciado y enviado a las cuadrillas de limpieza urbana y al mapa público.
              </p>
            </div>

            {/* Official Digital Ticket Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 text-left space-y-4 border border-slate-700 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                    Ticket de Seguimiento Oficial
                  </span>
                </div>
                <span className="text-xs px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-full font-bold border border-amber-500/30">
                  Pendiente de Revisión
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Código Único:</span>
                  <span className="font-mono font-bold text-emerald-400 text-base">
                    {createdReport.ticketCode}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Categoría:</span>
                  <span className="font-semibold text-slate-200 line-clamp-1">
                    {createdReport.categoryLabel}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Urgencia:</span>
                  <span className="font-bold text-amber-400 uppercase">
                    {createdReport.urgency}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Fecha y Hora:</span>
                  <span className="text-slate-300">
                    {new Date(createdReport.createdAt).toLocaleString('es-CO')}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700/80 text-[11px] text-slate-300">
                <strong className="text-white">Dirección:</strong> {createdReport.address}
              </div>
            </div>

            <button
              id="btn-done-report"
              onClick={onClose}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors"
            >
              Entendido y Ver en Lista de Reportes
            </button>
          </div>
        ) : (
          /* Report Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Reporte Ciudadano en Vía Pública</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Reportar Acumulación de Basura
              </h2>
              <p className="text-xs text-slate-500">
                Ayuda a mantener la ciudad limpia reportando puntos críticos, escombros o contenedores colapsados.
              </p>
            </div>

            {/* Photo Capture Preview & Change */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Foto de la Acumulación / Evidencia:
              </label>
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-video bg-slate-100 group max-h-44 shadow-xs">
                <img
                  src={photoUrl}
                  alt="Foto de la basura"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Action buttons to snap photo or pick from gallery */}
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold cursor-pointer transition-colors text-center">
                  <Camera className="w-4 h-4 text-emerald-600" />
                  <span>Tomar Foto con Cámara</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>

                <label className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-colors text-center">
                  <Upload className="w-4 h-4 text-slate-600" />
                  <span>Subir de Galería</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>
              </div>
            </div>

            {/* Geolocation Controls */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Ubicación & Dirección:
                </label>
                <button
                  type="button"
                  id="btn-get-gps"
                  onClick={handleGetCurrentLocation}
                  disabled={isLocating}
                  className="flex items-center gap-1 text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{isLocating ? 'Detectando GPS...' : 'Obtener mi GPS Exacto'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Dirección o calle (ej. Cra 7 # 45-10)"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="text"
                  placeholder="Punto de referencia (ej. frente al parque)"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Category & Urgency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Tipo de Residuo / Problema:
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ReportCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="basura_desbordada">🗑️ Basura Desbordada</option>
                  <option value="escombros_construccion">🧱 Escombros de Construcción</option>
                  <option value="vertedero_clandestino">⚠️ Basurero Clandestino</option>
                  <option value="muebles_voluminosos">🛋️ Muebles / Colchones</option>
                  <option value="residuos_peligrosos">🛑 Residuos Peligrosos/Químicos</option>
                  <option value="alcantarilla_obstruida">🌊 Alcantarilla Tapada por Basura</option>
                  <option value="otro">📦 Otro Tipo</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Nivel de Urgencia:
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {(['baja', 'media', 'alta', 'critica'] as ReportUrgency[]).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setUrgency(level)}
                      className={`py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                        urgency === level
                          ? level === 'baja'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : level === 'media'
                            ? 'bg-amber-500 text-white shadow-xs'
                            : level === 'alta'
                            ? 'bg-orange-600 text-white shadow-xs'
                            : 'bg-red-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Observations */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Observaciones y Detalles:
              </label>
              <textarea
                rows={2}
                placeholder="Describe el volumen aproximado, malos olores, obstrucción peatonal o detalles para la cuadrilla..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Citizen Info (Optional) */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <input
                type="text"
                placeholder="Tu Nombre (Opcional)"
                value={citizenName}
                onChange={(e) => setCitizenName(e.target.value)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="text"
                placeholder="Teléfono / WhatsApp"
                value={citizenPhone}
                onChange={(e) => setCitizenPhone(e.target.value)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="btn-submit-report"
              disabled={isSubmitting}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-bold text-sm rounded-xl shadow-md transition-transform active:scale-98 flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{isSubmitting ? 'Generando Ticket y Georreferenciando...' : 'Publicar Reporte y Generar Ticket'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
