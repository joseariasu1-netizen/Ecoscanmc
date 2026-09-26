import React, { useState, useEffect } from 'react';
import {
  Camera,
  AlertTriangle,
  MapPin,
  BookOpen,
  Award,
  Download,
  Wifi,
  WifiOff,
  Sparkles,
  Layers,
  Coins,
  Square,
} from 'lucide-react';
import { IERafaelUribeUribeShield } from './IERafaelUribeUribeShield';
import { UserEcoProfile } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userProfile: UserEcoProfile;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userProfile,
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const navItems = [
    { id: 'scanner', label: 'Ecoscan IA', icon: Camera, badge: 'Visión' },
    { id: 'metro', label: 'Mi Metro Cuadrado', icon: Coins, badge: 'Medellín' },
    { id: 'reports', label: 'Reportes Medellín', icon: AlertTriangle },
    { id: 'map', label: 'Mapa & Canecas', icon: MapPin },
    { id: 'guide', label: 'Guía & Calculadora', icon: BookOpen },
  ];

  const currentCoins = userProfile.ecoCoins || userProfile.ecoPoints || 120;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Institutional Shield & Brand: I.E. Rafael Uribe Uribe - Medellín */}
          <div
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group"
            onClick={() => setActiveTab('scanner')}
            title="I.E. Rafael Uribe Uribe - Medellín & Campaña Mi Metro Cuadrado"
          >
            {/* Escudo Oficial I.E. Rafael Uribe Uribe */}
            <div className="shrink-0 p-0.5 rounded-xl transition-transform group-hover:scale-105">
              <IERafaelUribeUribeShield size="md" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 leading-tight">
                  I.E. Rafael Uribe Uribe
                </span>
                <span className="hidden md:inline-block px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 rounded border border-emerald-300">
                  Medellín
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 -mt-0.5">
                <span className="font-semibold text-emerald-700">EcoScan</span>
                <span>•</span>
                <span className="hidden sm:inline">Campaña Mi Metro Cuadrado</span>
                <span className="sm:hidden">Mi Metro²</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/70">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isSpecialMetro = item.id === 'metro';
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? isSpecialMetro
                        ? 'bg-slate-900 text-yellow-300 shadow-xs font-extrabold'
                        : 'bg-white text-emerald-700 shadow-xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? (isSpecialMetro ? 'text-yellow-400' : 'text-emerald-600') : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-black ${
                      isSpecialMetro
                        ? 'bg-yellow-400 text-slate-950 uppercase'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right actions: Online indicator, EcoCoins, PWA Install, Architecture docs */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Online/Offline Status Indicator */}
            <div
              className={`hidden md:flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border ${
                isOnline
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-700'
                  : 'bg-amber-50 border-amber-200 text-amber-700'
              }`}
              title={isOnline ? 'Conexión en línea activa' : 'Modo fuera de línea'}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3 text-emerald-600" />
                  <span className="font-semibold">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-amber-600" />
                  <span className="font-semibold">Offline</span>
                </>
              )}
            </div>

            {/* EcoCoins Badge / Button (Click opens Mi Metro Cuadrado wallet) */}
            <button
              id="btn-navbar-ecocoins"
              onClick={() => setActiveTab('metro')}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-yellow-100 hover:from-amber-100 hover:to-yellow-200 border border-yellow-300 px-2.5 py-1 rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer"
              title="Ver mi Billetera de EcoMonedas y Premios Metro Cuadrado"
            >
              <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs shadow-xs">
                🪙
              </div>
              <div className="flex flex-col text-left leading-none">
                <span className="text-xs font-black text-amber-950">{currentCoins}</span>
                <span className="text-[9px] text-amber-800 font-bold uppercase">Monedas</span>
              </div>
            </button>

            {/* PWA Install Button */}
            {isInstallable && (
              <button
                id="btn-install-pwa"
                onClick={handleInstallPWA}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Instalar</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden flex items-center justify-between py-1.5 border-t border-slate-100 gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isSpecialMetro = item.id === 'metro';
            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? isSpecialMetro
                      ? 'text-yellow-700 font-black bg-amber-50'
                      : 'text-emerald-700 font-black bg-emerald-50'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 mb-0.5 ${isActive ? (isSpecialMetro ? 'text-amber-600' : 'text-emerald-600') : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

