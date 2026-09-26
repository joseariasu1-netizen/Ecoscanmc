import React, { useState } from 'react';
import { X, Trash2, MapPin, Camera, Sparkles, CheckCircle2, Navigation, Upload } from 'lucide-react';
import { BinType, BinCondition, PublicBin } from '../types';

interface RegisterBinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBinRegistered: (bin: PublicBin) => void;
  initialCoords?: { lat: number; lng: number };
}

export const RegisterBinModal: React.FC<RegisterBinModalProps> = ({
  isOpen,
  onClose,
  onBinRegistered,
  initialCoords,
}) => {
  const [type, setType] = useState<BinType | 'estacion_ecologica'>('estacion_ecologica');
  const [condition, setCondition] = useState<BinCondition>('excelente');
  const [latitude, setLatitude] = useState<number>(initialCoords?.lat || 6.2738);
  const [longitude, setLongitude] = useState<number>(initialCoords?.lng || -75.5915);
  const [address, setAddress] = useState<string>('Robledo / I.E. Rafael Uribe Uribe, Medellín');
  const [photoUrl, setPhotoUrl] = useState<string>(
    'https://images.unsplash.com/photo-1528190336454-13cd56b45b5a?w=600&auto=format&fit=crop&q=80'
  );
  const [reportedBy, setReportedBy] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGetGPS = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setAddress(`Ubicación GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true }
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

    const typeLabels: { [key: string]: string } = {
      estacion_ecologica: 'Estación Ecológica (Trío Blanca/Verde/Negra)',
      blanca: 'Caneca Blanca (Aprovechables Limpios)',
      verde: 'Caneca Verde (Orgánicos Aprovechables)',
      negra: 'Caneca Negra (No Aprovechables / Ordinarios)',
      roja_especial: 'Punto Especial Posconsumo Pilas y Bombillos',
    };

    try {
      const response = await fetch('/api/bins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          typeLabel: typeLabels[type],
          latitude,
          longitude,
          address,
          condition,
          photoUrl,
          reportedBy: reportedBy.trim() || 'Ciudadano Consciente',
          notes,
        }),
      });

      const data = await response.json();
      if (response.ok && data.bin) {
        onBinRegistered(data.bin);
      } else {
        throw new Error(data.error || 'Error al registrar caneca');
      }
    } catch (err) {
      const localBin: PublicBin = {
        id: `bin-${Date.now()}`,
        type,
        typeLabel: typeLabels[type] || 'Caneca Pública Comunitaria',
        latitude,
        longitude,
        address,
        condition,
        photoUrl,
        reportedBy: reportedBy.trim() || 'Ciudadano Consciente',
        confirmationsCount: 1,
        registeredAt: new Date().toISOString(),
        notes,
        hasCapacity: true,
      };
      onBinRegistered(localBin);
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative my-8">
        <button
          id="btn-close-register-bin-modal"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Red Comunitaria de Canecas</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Registrar Nueva Caneca o Punto Limpio
            </h2>
            <p className="text-xs text-slate-500">
              Mapea contenedores y estaciones públicas para que otros ciudadanos puedan separar sus residuos.
            </p>
          </div>

          {/* Type of Bin */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-slate-700 block">
              Tipo de Caneca / Estación:
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="estacion_ecologica">♻️ Estación Ecológica Completa (Blanca / Verde / Negra)</option>
              <option value="blanca">🤍 Caneca Blanca (Aprovechables / Reciclables)</option>
              <option value="verde">💚 Caneca Verde (Orgánicos / Compostables)</option>
              <option value="negra">🖤 Caneca Negra (No Aprovechables / Ordinarios)</option>
              <option value="roja_especial">🛑 Punto Especial (Pilas / Bombillos / RAEE)</option>
            </select>
          </div>

          {/* Condition */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-slate-700 block">
              Estado Físico Actual:
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['excelente', 'bueno', 'regular', 'llena'] as BinCondition[]).map((cond) => (
                <button
                  key={cond}
                  type="button"
                  onClick={() => setCondition(cond)}
                  className={`py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                    condition === cond
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>

          {/* Location & GPS */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase text-slate-700">
                Ubicación / Dirección:
              </label>
              <button
                type="button"
                onClick={handleGetGPS}
                className="flex items-center gap-1 text-xs text-emerald-700 font-bold hover:underline"
              >
                <Navigation className="w-3 h-3" />
                <span>{isLocating ? 'Cargando GPS...' : 'Usar mi GPS'}</span>
              </button>
            </div>
            <input
              type="text"
              required
              placeholder="Ej. Parque de la 93, junto al sendero"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Photo */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-700 block">
              Foto de la Caneca:
            </label>
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-video max-h-36 bg-slate-100 shadow-xs">
              <img src={photoUrl} alt="Foto de caneca" className="w-full h-full object-cover" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold cursor-pointer transition-colors text-center">
                <Camera className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tomar Foto</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </label>

              <label className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-colors text-center">
                <Upload className="w-3.5 h-3.5 text-slate-600" />
                <span>De Galería</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </label>
            </div>
          </div>

          {/* User identifier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Tu Alias / Nombre"
              value={reportedBy}
              onChange={(e) => setReportedBy(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="text"
              placeholder="Observación (opcional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            id="btn-confirm-register-bin"
            disabled={isSubmitting}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? 'Guardando en la Red...' : 'Guardar y Publicar en el Mapa'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
