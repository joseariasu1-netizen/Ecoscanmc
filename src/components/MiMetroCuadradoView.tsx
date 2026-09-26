import React, { useState } from 'react';
import {
  Coins,
  MapPin,
  Sparkles,
  Award,
  CheckCircle2,
  TreePine,
  Train,
  GraduationCap,
  Ticket,
  QrCode,
  Heart,
  Plus,
  Share2,
  Printer,
  ChevronRight,
  ShieldCheck,
  Building2,
  Flame,
  ArrowRight,
  TrendingUp,
  Camera,
  Calendar,
  Layers,
  Leaf,
  Users,
} from 'lucide-react';
import { IERafaelUribeUribeShield } from './IERafaelUribeUribeShield';
import { UserEcoProfile, SquareMeterPlot, MetroReward } from '../types';

interface MiMetroCuadradoViewProps {
  userProfile: UserEcoProfile;
  plots: SquareMeterPlot[];
  rewards: MetroReward[];
  onRedeemReward: (reward: MetroReward) => boolean;
  onAdoptPlot: (newPlot: Partial<SquareMeterPlot>) => void;
  onCleanPlot: (plotId: string) => void;
}

export const MiMetroCuadradoView: React.FC<MiMetroCuadradoViewProps> = ({
  userProfile,
  plots,
  rewards,
  onRedeemReward,
  onAdoptPlot,
  onCleanPlot,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'campaign' | 'wallet' | 'rewards' | 'my_plots' | 'certificate'>('campaign');
  
  // Modal for new plot adoption
  const [isAdoptModalOpen, setIsAdoptModalOpen] = useState<boolean>(false);
  const [plotName, setPlotName] = useState<string>('');
  const [plotLocation, setPlotLocation] = useState<string>('I.E. Rafael Uribe Uribe - Zona Patios');
  const [plotZoneType, setPlotZoneType] = useState<'colegio_uribe' | 'parque_barrial' | 'acera_comunitaria' | 'estacion_metro' | 'quebrada_verde'>('colegio_uribe');
  const [plotSquareMeters, setPlotSquareMeters] = useState<number>(2);
  const [plotPhoto, setPlotPhoto] = useState<string>('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80');

  // Selected reward details modal
  const [selectedReward, setSelectedReward] = useState<MetroReward | null>(null);
  const [activeVoucher, setActiveVoucher] = useState<{ title: string; code: string; date: string; sponsor: string } | null>(null);

  // Filter rewards category
  const [rewardCategoryFilter, setRewardCategoryFilter] = useState<string>('all');

  const filteredRewards = rewardCategoryFilter === 'all'
    ? rewards
    : rewards.filter((r) => r.category === rewardCategoryFilter);

  const handleAdoptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plotName) return;

    onAdoptPlot({
      name: plotName,
      locationDescription: plotLocation,
      zoneType: plotZoneType,
      zoneLabel:
        plotZoneType === 'colegio_uribe'
          ? 'I.E. Rafael Uribe Uribe'
          : plotZoneType === 'estacion_metro'
          ? 'Estación Metro Medellín'
          : plotZoneType === 'parque_barrial'
          ? 'Parque Barrial Medellín'
          : 'Acera Comunitaria',
      squareMeters: Number(plotSquareMeters) || 1,
      adopterName: userProfile.name,
      adopterRole: userProfile.institutionRole || 'Estudiante I.E. Rafael Uribe Uribe',
      status: 'limpio_y_cuidado',
      lastCleanedDate: new Date().toISOString(),
      cleaningsCount: 1,
      photoBeforeUrl: plotPhoto,
      photoAfterUrl: plotPhoto,
      coinsEarned: 100,
      verifiedByInstitution: true,
      latitude: 6.2518,
      longitude: -75.5925,
    });

    setIsAdoptModalOpen(false);
    setPlotName('');
  };

  const handleClaimReward = (reward: MetroReward) => {
    const success = onRedeemReward(reward);
    if (success) {
      const voucherCode = `METRO-${reward.category.slice(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
      setActiveVoucher({
        title: reward.title,
        code: voucherCode,
        date: new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }),
        sponsor: reward.sponsor,
      });
      setSelectedReward(null);
    }
  };

  const totalMetersInMedellin = plots.reduce((acc, p) => acc + (p.squareMeters || 1), 4850);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Institutional Hero Banner: Alcaldía de Medellín + I.E. Rafael Uribe Uribe */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-8 border border-emerald-500/30 shadow-xl">
        {/* Background glow & subtle patterns */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-5">
            {/* Escudo I.E. Rafael Uribe Uribe */}
            <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-lg shrink-0">
              <IERafaelUribeUribeShield size="lg" />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  Alcaldía de Medellín
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 text-[11px] font-bold uppercase tracking-wider">
                  I.E. Rafael Uribe Uribe
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white flex items-center gap-2">
                <span>Campaña</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-yellow-300">
                  Mi Metro Cuadrado
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed">
                ¡Medellín es nuestra casa común! Desde la <strong>I.E. Rafael Uribe Uribe</strong> lideramos la recuperación y cuidado de cada metro cuadrado de nuestra ciudad. Separa residuos, reporta puntos críticos y acumula <strong>EcoMonedas (🪙)</strong> canjeables por pasajes Cívica Metro, kits ecológicos y cultura.
              </p>
            </div>
          </div>

          {/* User EcoCoins Summary Card */}
          <div className="w-full lg:w-auto bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/20 shadow-inner flex sm:flex-col justify-between items-center sm:items-end gap-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-yellow-500 to-amber-300 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-yellow-500/30 text-xl animate-pulse">
                🪙
              </div>
              <div className="text-left sm:text-right">
                <div className="text-2xl sm:text-3xl font-black text-yellow-300 leading-none">
                  {userProfile.ecoCoins || userProfile.ecoPoints || 120}
                </div>
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  EcoMonedas Disponibles
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveSubTab('rewards')}
              className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Canjear Premios</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs within Mi Metro Cuadrado */}
        <div className="relative z-10 flex items-center gap-2 mt-6 pt-5 border-t border-white/10 overflow-x-auto pb-1">
          {[
            { id: 'campaign', label: 'La Campaña', icon: Sparkles },
            { id: 'wallet', label: 'Billetera & Ganancias', icon: Coins, count: `${userProfile.ecoCoins || 120} 🪙` },
            { id: 'rewards', label: 'Tienda de Recompensas', icon: Ticket, badge: 'Metro & Premios' },
            { id: 'my_plots', label: 'Metros Cuadrados Adoptados', icon: MapPin, count: plots.length },
            { id: 'certificate', label: 'Certificado de Guardián', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-md font-extrabold scale-102'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-white/20 text-white'}`}>
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-yellow-400 text-slate-950 font-extrabold uppercase">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-VIEW 1: La Campaña & Cómo Funciona */}
      {activeSubTab === 'campaign' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Key Impact Stats Bar Medellín */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                📐
              </div>
              <div>
                <div className="text-xl font-black text-slate-900">{totalMetersInMedellin.toLocaleString()} m²</div>
                <div className="text-[11px] text-slate-500 font-medium">Metros Limpios en Medellín</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 text-yellow-800 flex items-center justify-center font-bold">
                🪙
              </div>
              <div>
                <div className="text-xl font-black text-slate-900">42.800+</div>
                <div className="text-[11px] text-slate-500 font-medium">EcoMonedas Entregadas</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                🏫
              </div>
              <div>
                <div className="text-xl font-black text-slate-900">I.E. Rafael Uribe</div>
                <div className="text-[11px] text-slate-500 font-medium">Líder Comuna Medellín</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                🚇
              </div>
              <div>
                <div className="text-xl font-black text-slate-900">850+ Pasajes</div>
                <div className="text-[11px] text-slate-500 font-medium">Canjeados en Cívica Metro</div>
              </div>
            </div>
          </div>

          {/* Pillars of Mi Metro Cuadrado Campaign */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <span>¿Qué es la Campaña "Mi Metro Cuadrado"?</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Una iniciativa cívica y ambiental de la <strong>Alcaldía de Medellín</strong>, <strong>Emvarias</strong> y la <strong>I.E. Rafael Uribe Uribe</strong> para transformar el cuidado del espacio público.
                </p>
              </div>

              <button
                onClick={() => setIsAdoptModalOpen(true)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Adoptar Mi Metro Cuadrado (+100 🪙)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Step 1 */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-emerald-50/60 to-white border border-emerald-100 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-base shadow-sm">
                  1
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Adopta y Cuida tu Espacio</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Elige 1 o varios metros cuadrados en la I.E. Rafael Uribe Uribe, tu acera, la cuadra de tu barrio o el parque cercano en Medellín. Manténlo libre de basura y enverdece tu entorno.
                </p>
                <div className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                  <span>Recompensa:</span>
                  <span className="bg-emerald-100 px-2 py-0.5 rounded-full">+100 EcoMonedas</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-yellow-50/60 to-white border border-yellow-100 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-base shadow-sm">
                  2
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Separa Residuos y Reporta</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Usa el <strong>EcoScan IA</strong> para clasificar en caneca blanca, verde o negra. Si ves acumulación clandestina de escombros o basura en Medellín, genera un reporte georreferenciado.
                </p>
                <div className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
                  <span>Recompensa:</span>
                  <span className="bg-yellow-100 px-2 py-0.5 rounded-full">+30 a +60 EcoMonedas</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-teal-50/60 to-white border border-teal-100 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-base shadow-sm">
                  3
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Canjea en la Tienda Cívica</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tus monedas no son solo puntos: son saldo real canjeable por recargas en tu Tarjeta Cívica Metro, útiles escolares ecológicos, pases para el Parque Explora y siembra de árboles.
                </p>
                <div className="text-[11px] font-bold text-teal-800 flex items-center gap-1">
                  <span>Beneficios:</span>
                  <span className="bg-teal-100 px-2 py-0.5 rounded-full">Transporte & Cultura</span>
                </div>
              </div>
            </div>

            {/* Institutional Badge Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <IERafaelUribeUribeShield size="md" showText={true} />
                <div className="h-8 w-px bg-slate-200 hidden sm:block" />
                <div className="text-xs text-slate-600">
                  <span className="font-bold text-slate-900 block">Alianza Institucional y Ciudadana</span>
                  Proyecto Ambiental Escolar (PRAE) en articulación con la Secretaría de Medio Ambiente de Medellín.
                </div>
              </div>

              <button
                onClick={() => setActiveSubTab('certificate')}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Award className="w-4 h-4 text-yellow-400" />
                <span>Ver Mi Certificado Oficial</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: Billetera de Monedas (EcoMonedas / MetroMonedas) */}
      {activeSubTab === 'wallet' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Wallet Header Card */}
          <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-emerald-500/20 shadow-lg">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5" />
                  Billetera Digital Verde • I.E. Rafael Uribe Uribe
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl sm:text-5xl font-black text-yellow-300">
                    {userProfile.ecoCoins || 120}
                  </span>
                  <span className="text-xl font-bold text-slate-300">EcoMonedas (🪙)</span>
                </div>
                <p className="text-xs text-slate-300 max-w-lg">
                  Equivalente a aproximadamente <strong>{Math.floor((userProfile.ecoCoins || 120) / 100)} pasajes Cívica Metro</strong> o <strong>{Math.floor((userProfile.ecoCoins || 120) / 80)} plántulas nativas</strong> para siembra en Medellín.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveSubTab('rewards')}
                  className="px-5 py-2.5 bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Ir a Catálogo de Canjes</span>
                </button>
              </div>
            </div>
          </div>

          {/* How to Earn More Coins Matrix */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span>Tabla Oficial de Ganancia de EcoMonedas (Medellín)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">📸</span>
                  <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-full text-xs font-black">+30 🪙</span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs">Separar Residuos con IA</h4>
                <p className="text-[11px] text-slate-600">
                  Escanea con tu cámara y deposita en caneca blanca, verde o negra.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🚨</span>
                  <span className="px-2.5 py-1 bg-amber-600 text-white rounded-full text-xs font-black">+60 🪙</span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs">Reportar Basura en Vía Pública</h4>
                <p className="text-[11px] text-slate-600">
                  Foto y GPS de puntos críticos para despacho de cuadrillas de Emvarias.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">📐</span>
                  <span className="px-2.5 py-1 bg-teal-600 text-white rounded-full text-xs font-black">+100 🪙</span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs">Adoptar Mi Metro Cuadrado</h4>
                <p className="text-[11px] text-slate-600">
                  Registra tu metro cuadrado en la I.E. o tu barrio y mantenlo limpio (+40 por mantenimiento).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🗑️</span>
                  <span className="px-2.5 py-1 bg-blue-600 text-white rounded-full text-xs font-black">+45 🪙</span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs">Registrar Caneca Comunitaria</h4>
                <p className="text-[11px] text-slate-600">
                  Mapea puntos ecológicos o canecas públicas en Medellín para la comunidad.
                </p>
              </div>
            </div>
          </div>

          {/* User History of Rewards Redeemed */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center justify-between">
              <span>Mis Cupones y Canjes Realizados</span>
              <span className="text-xs font-normal text-slate-500">
                {userProfile.redeemedRewards?.length || 0} canjes
              </span>
            </h3>

            {(!userProfile.redeemedRewards || userProfile.redeemedRewards.length === 0) ? (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Ticket className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-600">Aún no has canjeado recompensas.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  ¡Acumula EcoMonedas y canjea pasajes Metro, útiles o entradas!
                </p>
                <button
                  onClick={() => setActiveSubTab('rewards')}
                  className="mt-3 px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
                >
                  Explorar Tienda
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {userProfile.redeemedRewards.map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="font-bold text-xs text-slate-900">{item.title}</div>
                      <div className="text-[10px] text-slate-500">Código: <span className="font-mono font-bold text-emerald-700">{item.redemptionCode}</span></div>
                      <div className="text-[10px] text-slate-400">{new Date(item.redeemedAt).toLocaleDateString()}</div>
                    </div>
                    <button
                      onClick={() =>
                        setActiveVoucher({
                          title: item.title,
                          code: item.redemptionCode,
                          date: new Date(item.redeemedAt).toLocaleDateString(),
                          sponsor: 'Alcaldía de Medellín / I.E. Rafael Uribe Uribe',
                        })
                      }
                      className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Ver Bono</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: Tienda de Recompensas de la Campaña */}
      {activeSubTab === 'rewards' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Categories Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'Todos los Premios', icon: Sparkles },
              { id: 'metro_transporte', label: 'Metro & Cívica', icon: Train },
              { id: 'educacion_uribe', label: 'I.E. Rafael Uribe Uribe', icon: GraduationCap },
              { id: 'cultura_medellin', label: 'Cultura Medellín', icon: Ticket },
              { id: 'ecologia_siembra', label: 'Siembra & Árboles', icon: TreePine },
            ].map((filter) => {
              const Icon = filter.icon;
              const isActive = rewardCategoryFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => setRewardCategoryFilter(filter.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-yellow-400' : 'text-slate-500'}`} />
                  <span>{filter.label}</span>
                </button>
              );
            })}
          </div>

          {/* Rewards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredRewards.map((reward) => {
              const currentCoins = userProfile.ecoCoins || 120;
              const canAfford = currentCoins >= reward.coinsCost;

              return (
                <div
                  key={reward.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 group-hover:scale-105 transition-transform flex items-center justify-center text-2xl shadow-inner">
                        {reward.icon}
                      </div>

                      <div className="flex flex-col items-end">
                        <span className="px-2.5 py-1 bg-yellow-100 text-yellow-900 border border-yellow-300/80 rounded-full text-xs font-black flex items-center gap-1">
                          <span>🪙 {reward.coinsCost}</span>
                          <span className="text-[10px] font-bold">Monedas</span>
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          {reward.stock} disponibles
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        {reward.sponsor}
                      </span>
                      <h3 className="font-extrabold text-slate-900 text-base mt-1.5 line-clamp-1">
                        {reward.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {reward.subtitle}
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {reward.description}
                    </p>

                    {/* Perks bullets */}
                    <div className="space-y-1 pt-1">
                      {reward.perks.slice(0, 2).map((perk, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{perk}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedReward(reward)}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 py-1.5 px-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      Detalles
                    </button>

                    <button
                      disabled={!canAfford}
                      onClick={() => handleClaimReward(reward)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                        canAfford
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white active:scale-95'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>{canAfford ? 'Canjear Ahora' : `Faltan ${reward.coinsCost - currentCoins} 🪙`}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: Metros Cuadrados Adoptados */}
      {activeSubTab === 'my_plots' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <span>Metros Cuadrados Protegidos en Medellín</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Espacios recuperados y apadrinados por estudiantes de la <strong>I.E. Rafael Uribe Uribe</strong> y la comunidad de Medellín.
              </p>
            </div>

            <button
              onClick={() => setIsAdoptModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Adoptar Nuevo Metro Cuadrado</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plots.map((plot) => (
              <div
                key={plot.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video bg-slate-100 overflow-hidden">
                    <img
                      src={plot.photoAfterUrl || plot.photoBeforeUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80'}
                      alt={plot.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
                      <span className="px-2.5 py-0.5 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-white border border-white/20">
                        {plot.zoneLabel}
                      </span>
                      <span className="px-2.5 py-0.5 bg-emerald-600 text-white rounded-full text-[10px] font-black shadow-xs">
                        {plot.squareMeters} m² Protegidos
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{plot.name}</h4>
                      {plot.verifiedByInstitution && (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded border border-emerald-200 shrink-0">
                          ✓ I.E. Uribe
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{plot.locationDescription}</span>
                    </p>

                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                      <span>Guardián: <strong className="text-slate-800">{plot.adopterName}</strong></span>
                      <span className="text-emerald-700 font-bold">+{plot.coinsEarned} 🪙 ganadas</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    onClick={() => onCleanPlot(plot.id)}
                    className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Registrar Mantenimiento (+40 🪙)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 5: Certificado Digital de Guardián Mi Metro Cuadrado */}
      {activeSubTab === 'certificate' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-emerald-500/40 shadow-xl max-w-3xl mx-auto space-y-6 relative overflow-hidden">
            {/* Certificate Decorative Guilloche Borders */}
            <div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-r from-emerald-600 via-yellow-400 to-teal-600" />
            <div className="absolute bottom-0 inset-x-0 h-3 bg-gradient-to-r from-teal-600 via-yellow-400 to-emerald-600" />

            {/* Institutional Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-5">
              <IERafaelUribeUribeShield size="lg" showText={true} />

              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                  ALCALDÍA DE MEDELLÍN
                </span>
                <span className="text-xs font-extrabold text-emerald-700">
                  SECRETARÍA DE MEDIO AMBIENTE
                </span>
              </div>
            </div>

            {/* Certificate Body */}
            <div className="text-center space-y-4 py-4">
              <div className="inline-block px-3 py-1 bg-yellow-100 text-yellow-900 border border-yellow-300 rounded-full text-xs font-black uppercase tracking-wider">
                CERTIFICADO OFICIAL DE ADOPCIÓN AMBIENTAL
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-900">
                Guardián de Mi Metro Cuadrado
              </h2>

              <p className="text-xs text-slate-500 italic max-w-md mx-auto">
                La Institución Educativa Rafael Uribe Uribe de Medellín y la Alcaldía de Medellín certifican que:
              </p>

              <div className="py-2">
                <div className="text-xl sm:text-2xl font-black text-emerald-800 tracking-tight border-b-2 border-emerald-600 inline-block px-6 pb-1">
                  {userProfile.name}
                </div>
                <div className="text-xs text-slate-600 mt-1 font-medium">
                  {userProfile.institutionRole || 'Estudiante / Guardián Ecológico Comuna Medellín'}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 max-w-xl mx-auto leading-relaxed">
                Ha participado activamente en la separación técnica de residuos con IA, reporte de puntos críticos y ha adoptado y protegido exitosamente <strong>{userProfile.adoptedSquareMeters || 4} metros cuadrados</strong> de espacio público en la ciudad de Medellín, acumulando un impacto verificado de <strong>{userProfile.ecoCoins || 120} EcoMonedas</strong>.
              </p>
            </div>

            {/* Certificate Signatures & QR */}
            <div className="grid grid-cols-3 gap-4 items-center pt-6 border-t border-slate-200 text-center">
              <div className="space-y-1">
                <div className="font-serif italic font-bold text-slate-800 text-xs sm:text-sm">Rectoría I.E.</div>
                <div className="h-0.5 w-24 bg-slate-300 mx-auto" />
                <div className="text-[10px] text-slate-500 font-semibold">I.E. Rafael Uribe Uribe</div>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-slate-100 border border-slate-300 rounded-xl flex items-center justify-center p-1 shadow-inner">
                  <QrCode className="w-10 h-10 text-slate-800" />
                </div>
                <span className="text-[9px] text-slate-400 mt-1 font-mono">VERIF: MED-2026-RU</span>
              </div>

              <div className="space-y-1">
                <div className="font-serif italic font-bold text-slate-800 text-xs sm:text-sm">Alcaldía de Medellín</div>
                <div className="h-0.5 w-24 bg-slate-300 mx-auto" />
                <div className="text-[10px] text-slate-500 font-semibold">Campaña Mi Metro Cuadrado</div>
              </div>
            </div>

            {/* Actions: Print & Share */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-yellow-400" />
                <span>Imprimir / Guardar PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Adoptar Nuevo Metro Cuadrado */}
      {isAdoptModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 border border-slate-200 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  📐
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Adoptar Mi Metro Cuadrado</h3>
                  <p className="text-xs text-slate-500">I.E. Rafael Uribe Uribe & Medellín</p>
                </div>
              </div>
              <button
                onClick={() => setIsAdoptModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdoptSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Nombre del Metro Cuadrado o Zona:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Jardín Frontal Bloque B - I.E. Rafael Uribe Uribe"
                  value={plotName}
                  onChange={(e) => setPlotName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    Tipo de Espacio:
                  </label>
                  <select
                    value={plotZoneType}
                    onChange={(e: any) => setPlotZoneType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                  >
                    <option value="colegio_uribe">I.E. Rafael Uribe Uribe</option>
                    <option value="acera_comunitaria">Acera / Frente de Casa</option>
                    <option value="parque_barrial">Parque Barrial Medellín</option>
                    <option value="estacion_metro">Cercanías Estación Metro</option>
                    <option value="quebrada_verde">Ronda de Quebrada / Verde</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    Área Aproximada:
                  </label>
                  <select
                    value={plotSquareMeters}
                    onChange={(e) => setPlotSquareMeters(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                  >
                    <option value={1}>1 Metro Cuadrado (1 m²)</option>
                    <option value={2}>2 Metros Cuadrados (2 m²)</option>
                    <option value={4}>4 Metros Cuadrados (4 m²)</option>
                    <option value={10}>10 Metros Cuadrados (10 m²)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Ubicación Exacta o Barrio en Medellín:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Carrera 87 con Calle 48, Robledo / San Javier"
                  value={plotLocation}
                  onChange={(e) => setPlotLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-emerald-900 font-semibold">
                    Recompensa instantánea por adopción:
                  </span>
                </div>
                <span className="font-black text-emerald-800 bg-white px-2.5 py-1 rounded-full border border-emerald-300">
                  +100 🪙 EcoMonedas
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdoptModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Confirmar Adopción (+100 🪙)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Voucher / Bono Generado al Canjear */}
      {activeVoucher && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-slate-200 shadow-2xl animate-scaleUp text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto text-3xl shadow-sm">
              🎉
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                ¡CANJE EXITOSO!
              </span>
              <h3 className="font-extrabold text-slate-900 text-lg">
                {activeVoucher.title}
              </h3>
              <p className="text-xs text-slate-500">
                Presenta este bono en el punto autorizado o taquilla del Metro de Medellín.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 shadow-inner">
              <div className="w-24 h-24 bg-white p-2 rounded-xl mx-auto flex items-center justify-center">
                <QrCode className="w-20 h-20 text-slate-900" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Código de Redención:</span>
                <span className="font-mono text-lg font-black text-yellow-300 tracking-wider">
                  {activeVoucher.code}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-white/10 pt-2">
                <span>Fecha: {activeVoucher.date}</span>
                <span>{activeVoucher.sponsor}</span>
              </div>
            </div>

            <button
              onClick={() => setActiveVoucher(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Cerrar y Guardar en Billetera
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
