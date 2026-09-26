/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { WasteScanner } from './components/WasteScanner';
import { CitizenReportsView } from './components/CitizenReportsView';
import { CitizenReportModal } from './components/CitizenReportModal';
import { InteractiveMap } from './components/InteractiveMap';
import { RegisterBinModal } from './components/RegisterBinModal';
import { EcoGuideView } from './components/EcoGuideView';
import { MiMetroCuadradoView } from './components/MiMetroCuadradoView';
import { IERafaelUribeUribeShield } from './components/IERafaelUribeUribeShield';
import {
  CitizenReport,
  PublicBin,
  RecycleCenter,
  UserEcoProfile,
  WasteAnalysisResult,
  ReportStatus,
  SquareMeterPlot,
  MetroReward,
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('scanner');

  // User Profile & Gamification state with EcoCoins
  const [userProfile, setUserProfile] = useState<UserEcoProfile>(() => {
    try {
      const saved = localStorage.getItem('ecoscan_user_profile_medellin');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      name: 'Valentina Restrepo',
      school: 'I.E. Rafael Uribe Uribe (Medellín)',
      grade: '10°A - Semillero Ambiental',
      ecoPoints: 340,
      ecoCoins: 280, // Monedas canjeables por pasajes Metro, kits escolares Uribe, etc.
      scansCount: 6,
      reportsCount: 2,
      binsRegisteredCount: 1,
      adoptedSquareMeters: 2,
      co2PreventedKg: 6.4,
      level: 'Guardián Metro Cuadrado',
      badges: [
        { id: 'b1', name: 'Primer Escaneo', description: 'Identificaste tu primer residuo con IA', icon: '🌱', unlocked: true },
        { id: 'b2', name: 'Guardián Uribe Uribe', description: 'Representante ecológico de la I.E. Rafael Uribe Uribe', icon: '🏫', unlocked: true },
        { id: 'b3', name: 'Mi Metro Cuadrado', description: 'Adoptaste y limpiaste tu primer metro² en Medellín', icon: '🟩', unlocked: true },
        { id: 'b4', name: 'Cultura Metro', description: 'Canjeaste pasajes Cívica con EcoMonedas', icon: '🚇', unlocked: true },
      ],
    };
  });

  // User GPS coords (Default: Medellín, Comuna 7 Robledo / I.E. Rafael Uribe Uribe)
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({
    lat: 6.2738,
    lng: -75.5915,
  });

  // Main Data States
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [bins, setBins] = useState<PublicBin[]>([]);
  const [centers, setCenters] = useState<RecycleCenter[]>([]);
  const [plots, setPlots] = useState<SquareMeterPlot[]>([]);
  const [rewards, setRewards] = useState<MetroReward[]>([]);

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isRegisterBinModalOpen, setIsRegisterBinModalOpen] = useState<boolean>(false);
  const [registerBinInitialCoords, setRegisterBinInitialCoords] = useState<{ lat: number; lng: number } | undefined>(undefined);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  // Save profile to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ecoscan_user_profile_medellin', JSON.stringify(userProfile));
    } catch (e) {}
  }, [userProfile]);

  // Fetch initial data from Express backend
  useEffect(() => {
    // 1. Get GPS if allowed
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {},
        { timeout: 8000 }
      );
    }

    // 2. Fetch Reports
    fetch('/api/reports')
      .then((res) => res.json())
      .then((data) => {
        if (data.reports) setReports(data.reports);
      })
      .catch((err) => console.log('Fetch reports err:', err));

    // 3. Fetch Bins
    fetch('/api/bins')
      .then((res) => res.json())
      .then((data) => {
        if (data.bins) setBins(data.bins);
      })
      .catch((err) => console.log('Fetch bins err:', err));

    // 4. Fetch Centers
    fetch('/api/centers')
      .then((res) => res.json())
      .then((data) => {
        if (data.centers) setCenters(data.centers);
      })
      .catch((err) => console.log('Fetch centers err:', err));

    // 5. Fetch Metro Cuadrado Plots
    fetch('/api/metro-cuadrado/plots')
      .then((res) => res.json())
      .then((data) => {
        if (data.plots) setPlots(data.plots);
      })
      .catch((err) => console.log('Fetch plots err:', err));

    // 6. Fetch Rewards Catalog
    fetch('/api/rewards')
      .then((res) => res.json())
      .then((data) => {
        if (data.rewards) setRewards(data.rewards);
      })
      .catch((err) => console.log('Fetch rewards err:', err));
  }, []);

  // Handlers for Waste Scanner (Awards Points + EcoCoins)
  const handleScanCompleted = (result: WasteAnalysisResult) => {
    const earnedPoints = result.ecoPoints || 25;
    const earnedCoins = earnedPoints; // 1 punto = 1 moneda ecológica

    setUserProfile((prev) => {
      const newPoints = prev.ecoPoints + earnedPoints;
      const newCoins = (prev.ecoCoins || 0) + earnedCoins;
      const newScans = prev.scansCount + 1;
      let newLevel = prev.level;
      if (newPoints > 500) newLevel = 'Líder Ambiental Medellín';
      else if (newPoints > 200) newLevel = 'Guardián Metro Cuadrado';

      return {
        ...prev,
        ecoPoints: newPoints,
        ecoCoins: newCoins,
        scansCount: newScans,
        level: newLevel,
        co2PreventedKg: Number((prev.co2PreventedKg + (result.environmentalSavings?.co2SavedGrams || 120) / 1000).toFixed(2)),
      };
    });
    showToast(`🪙 ¡Ganaste +${earnedCoins} EcoMonedas y +${earnedPoints} EcoPuntos por separar este residuo!`);
  };

  // Handlers for Citizen Reports (Awards Points + EcoCoins)
  const handleReportCreated = (newReport: CitizenReport) => {
    setReports((prev) => [newReport, ...prev]);
    setUserProfile((prev) => ({
      ...prev,
      reportsCount: prev.reportsCount + 1,
      ecoPoints: prev.ecoPoints + 50,
      ecoCoins: (prev.ecoCoins || 0) + 50,
    }));
    showToast(`¡Reporte ${newReport.ticketCode} registrado en Medellín! Ganaste +50 EcoMonedas 🪙`);
  };

  // Handlers for Public Bins (Awards Points + EcoCoins)
  const handleBinRegistered = (newBin: PublicBin) => {
    setBins((prev) => [newBin, ...prev]);
    setUserProfile((prev) => ({
      ...prev,
      binsRegisteredCount: prev.binsRegisteredCount + 1,
      ecoPoints: prev.ecoPoints + 40,
      ecoCoins: (prev.ecoCoins || 0) + 40,
    }));
    showToast('¡Caneca comunitaria guardada! Ganaste +40 EcoMonedas 🪙 para canjear pasajes.');
  };

  // Handlers for Mi Metro Cuadrado: Adopting a Plot
  const handleAdoptPlot = async (newPlotData: Partial<SquareMeterPlot>) => {
    try {
      const res = await fetch('/api/metro-cuadrado/plots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlotData),
      });
      const data = await res.json();
      if (data.plot) {
        setPlots((prev) => [data.plot, ...prev]);
        setUserProfile((prev) => ({
          ...prev,
          ecoCoins: (prev.ecoCoins || 0) + 100,
          ecoPoints: prev.ecoPoints + 100,
          adoptedSquareMeters: (prev.adoptedSquareMeters || 0) + (data.plot.squareMeters || 1),
        }));
        showToast('🎉 ¡Adoptaste tu Metro Cuadrado! Ganaste +100 EcoMonedas 🪙');
      }
    } catch (err) {
      console.error('Error adopting plot:', err);
    }
  };

  // Handlers for Mi Metro Cuadrado: Cleaning a Plot
  const handleCleanPlot = async (plotId: string) => {
    try {
      const res = await fetch(`/api/metro-cuadrado/plots/${plotId}/clean`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.plot) {
        setPlots((prev) => prev.map((p) => (p.id === plotId ? data.plot : p)));
        setUserProfile((prev) => ({
          ...prev,
          ecoCoins: (prev.ecoCoins || 0) + 40,
          ecoPoints: prev.ecoPoints + 40,
          co2PreventedKg: Number((prev.co2PreventedKg + 1.2).toFixed(2)),
        }));
        showToast('🧹 ¡Jornada de limpieza registrada! Ganaste +40 EcoMonedas 🪙');
      }
    } catch (err) {
      console.error('Error cleaning plot:', err);
    }
  };

  // Handlers for Mi Metro Cuadrado: Redeeming Rewards
  const handleRedeemReward = async (rewardId: string, cost: number): Promise<boolean> => {
    const currentCoins = userProfile.ecoCoins || 0;
    if (currentCoins < cost) {
      showToast('❌ Saldo insuficiente de EcoMonedas.');
      return false;
    }

    try {
      const res = await fetch('/api/rewards/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardId, userCoins: currentCoins }),
      });
      const data = await res.json();

      if (data.success) {
        setUserProfile((prev) => ({
          ...prev,
          ecoCoins: (prev.ecoCoins || 0) - cost,
        }));
        setRewards((prev) =>
          prev.map((r) => (r.id === rewardId ? { ...r, stock: Math.max(0, r.stock - 1) } : r))
        );
        showToast(`🎟️ ¡Canje exitoso! Código: ${data.voucher.redemptionCode}`);
        return true;
      } else {
        showToast(`❌ ${data.error || 'Error al canjear'}`);
        return false;
      }
    } catch (err) {
      console.error('Error redeeming reward:', err);
      // Fallback local redemption
      setUserProfile((prev) => ({
        ...prev,
        ecoCoins: Math.max(0, (prev.ecoCoins || 0) - cost),
      }));
      showToast('🎟️ ¡Bono canjeado con éxito!');
      return true;
    }
  };

  const handleUpdateReportStatus = async (id: string, newStatus: ReportStatus, note?: string) => {
    try {
      await fetch(`/api/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, resolutionNote: note }),
      });
    } catch (e) {}

    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: newStatus,
              resolutionNote: note || r.resolutionNote,
              resolvedAt: newStatus === 'recolectado' ? new Date().toISOString() : r.resolvedAt,
            }
          : r
      )
    );
    showToast(`Estado de reporte actualizado a "${newStatus.replace('_', ' ')}".`);
  };

  const handleUpvoteReport = async (id: string) => {
    try {
      await fetch(`/api/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upvote: true }),
      });
    } catch (e) {}

    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, upvotes: (r.upvotes || 0) + 1 } : r))
    );
    showToast('Apoyo registrado en Medellín. Prioridad comunitaria aumentada.');
  };

  const handleOpenRegisterBinWithCoords = (coords?: { lat: number; lng: number }) => {
    setRegisterBinInitialCoords(coords || userCoords);
    setIsRegisterBinModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-yellow-400/50 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-bounce">
          <span className="text-yellow-400 font-bold">✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userProfile={userProfile}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6 space-y-6">
        {/* TAB 1: Waste Scanner with AI Vision */}
        {activeTab === 'scanner' && (
          <WasteScanner
            onScanCompleted={handleScanCompleted}
            userProfile={userProfile}
          />
        )}

        {/* TAB 2: Campaña Alcaldía de Medellín - Mi Metro Cuadrado */}
        {activeTab === 'metro' && (
          <MiMetroCuadradoView
            userProfile={userProfile}
            plots={plots}
            rewards={rewards}
            onAdoptPlot={handleAdoptPlot}
            onCleanPlot={handleCleanPlot}
            onRedeemReward={handleRedeemReward}
          />
        )}

        {/* TAB 3: Citizen Reports & Dashboard Medellín */}
        {activeTab === 'reports' && (
          <CitizenReportsView
            reports={reports}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onUpdateReportStatus={handleUpdateReportStatus}
            onUpvoteReport={handleUpvoteReport}
          />
        )}

        {/* TAB 4: Interactive Map & Community Bins Medellín */}
        {activeTab === 'map' && (
          <InteractiveMap
            centers={centers}
            bins={bins}
            reports={reports}
            onOpenRegisterBinModal={handleOpenRegisterBinWithCoords}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            userCoords={userCoords}
            setUserCoords={setUserCoords}
          />
        )}

        {/* TAB 5: Educational Guide & Impact Calculator */}
        {activeTab === 'guide' && <EcoGuideView />}
      </main>

      {/* Modals */}
      <CitizenReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onReportCreated={handleReportCreated}
        userCoords={userCoords}
      />

      <RegisterBinModal
        isOpen={isRegisterBinModalOpen}
        onClose={() => setIsRegisterBinModalOpen(false)}
        onBinRegistered={handleBinRegistered}
        initialCoords={registerBinInitialCoords}
      />

      {/* Institutional Footer */}
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Institution Brand */}
            <div className="flex items-center gap-3">
              <IERafaelUribeUribeShield size="lg" />
              <div>
                <h4 className="text-white font-black text-sm tracking-tight">
                  I.E. Rafael Uribe Uribe
                </h4>
                <p className="text-xs text-slate-400">
                  Medellín, Colombia • Proyecto Ambiental Escolar (PRAE)
                </p>
                <p className="text-[11px] text-yellow-400 font-bold mt-0.5 tracking-wide">
                  "Dios, Ciencia y Labor" • Medellín
                </p>
              </div>
            </div>

            {/* Campaign info */}
            <div className="text-center md:text-left bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <div className="flex items-center justify-center md:justify-start gap-2 text-yellow-400 font-bold text-xs">
                <span>🏙️</span>
                <span>Campaña Alcaldía de Medellín</span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                <strong>Mi Metro Cuadrado:</strong> Cada metro limpio y protegido suma a la transformación ecológica de Medellín.
              </p>
            </div>

            {/* Tech badges & standard */}
            <div className="flex flex-col items-center md:items-end text-xs text-slate-400 gap-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 font-bold rounded border border-emerald-700/50">
                  Código de Colores Oficial
                </span>
                <span className="px-2 py-0.5 bg-amber-950 text-amber-300 font-bold rounded border border-amber-700/50">
                  EcoMonedas Medellín
                </span>
              </div>
              <p className="text-[11px] text-slate-500 text-center md:text-right">
                PWA con Inteligencia Artificial Gemini Vision & Georreferenciación
              </p>
            </div>
          </div>

          <div className="border-t border-slate-800/80 mt-6 pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <span>© 2026 I.E. Rafael Uribe Uribe & Alcaldía de Medellín. Todos los derechos reservados.</span>
            <div className="flex items-center gap-4">
              <span>Resolución MinAmbiente 2184/2019</span>
              <span>•</span>
              <span>Economía Circular & Cívica Metro</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

