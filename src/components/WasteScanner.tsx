import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Droplets,
  Zap,
  Info,
  History,
  CheckSquare,
  Square,
  Award,
  Trash2,
  ArrowRight,
  HelpCircle,
  Video,
  VideoOff,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WasteAnalysisResult, UserEcoProfile } from '../types';
import { SAMPLE_PRESETS, SamplePreset } from '../data/mockPresets';

interface WasteScannerProps {
  onScanCompleted: (result: WasteAnalysisResult) => void;
  userProfile: UserEcoProfile;
}

export const WasteScanner: React.FC<WasteScannerProps> = ({
  onScanCompleted,
  userProfile,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<WasteAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [preparationChecked, setPreparationChecked] = useState<{ [key: number]: boolean }>({});
  const [pointsClaimed, setPointsClaimed] = useState<boolean>(false);
  const [scanHistory, setScanHistory] = useState<WasteAnalysisResult[]>([]);
  const [userHint, setUserHint] = useState<string>('');

  // Camera state for live webcam
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [permissionGuidanceOpen, setPermissionGuidanceOpen] = useState<boolean>(false);
  const [permissionErrorDetail, setPermissionErrorDetail] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);

  // Load scan history from localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('ecoscan_history');
      if (savedHistory) {
        setScanHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error('Error loading history:', e);
    }
  }, []);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async (overrideFacing?: 'environment' | 'user') => {
    const targetFacing = overrideFacing || cameraFacing;
    setErrorMessage(null);
    setPermissionErrorDetail(null);
    setPermissionGuidanceOpen(false);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage(
        'Tu navegador o el entorno actual no soporta captura de video en vivo (WebRTC). Puedes usar la cámara del dispositivo o subir una foto.'
      );
      setPermissionGuidanceOpen(true);
      return;
    }

    // Stop any existing stream before re-requesting
    stopCamera();

    try {
      let stream: MediaStream;
      try {
        // Attempt 1: with preferred facingMode and ideal resolution
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: targetFacing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (firstErr) {
        // Attempt 2: with simple video constraint fallback
        console.warn('Attempting basic video fallback after:', firstErr);
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch((e) => console.warn('Video play warning:', e));
      }
    } catch (err: any) {
      console.error('Error opening camera:', err);
      setIsCameraActive(false);

      const errName = err?.name || '';
      const errMsg = err?.message || '';

      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError' || errMsg.includes('denied') || errMsg.includes('not allowed')) {
        setPermissionErrorDetail(
          'El acceso a la cámara fue denegado o bloqueado por los permisos del navegador.'
        );
        setErrorMessage(
          'Permiso de cámara denegado. Puedes habilitarlo en los ajustes del navegador o utilizar la cámara nativa del sistema.'
        );
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        setPermissionErrorDetail('No se encontró ninguna cámara disponible en tu equipo.');
        setErrorMessage('No se detectó ninguna cámara física disponible en este dispositivo.');
      } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
        setPermissionErrorDetail('La cámara ya está siendo utilizada por otra aplicación o pestaña.');
        setErrorMessage('La cámara está ocupada por otra app. Cierra otras aplicaciones que la usen.');
      } else {
        setPermissionErrorDetail('No fue posible inicializar el flujo de video en vivo.');
        setErrorMessage('No se pudo acceder a la cámara en vivo. Puedes tomar la foto con la cámara del dispositivo.');
      }
      setPermissionGuidanceOpen(true);
    }
  };

  const toggleCameraFacing = async () => {
    const newFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(newFacing);
    if (isCameraActive) {
      await startCamera(newFacing);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      try {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => {
          track.stop();
        });
      } catch (e) {
        console.error('Error stopping track:', e);
      }
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Helper to resize/compress photos before sending to Gemini Vision
  // Kept well under Cloud Run payload limits (< 1.5MB base64 string)
  const resizeImageIfNeeded = (dataUrl: string, maxWidth = 1024, maxHeight = 1024): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        // Use 0.8 quality to ensure crisp recognition while keeping size ~150KB-400KB
        resolve(canvas.toDataURL('image/jpeg', 0.80));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  const capturePhotoFromCamera = async () => {
    if (!videoRef.current) return;
    try {
      const canvas = document.createElement('canvas');
      const maxDim = 1024;
      let w = videoRef.current.videoWidth || 640;
      let h = videoRef.current.videoHeight || 480;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', 0.80);
        stopCamera();
        processImageAnalysis(base64);
      }
    } catch (e) {
      console.error('Error capturing photo from canvas:', e);
      stopCamera();
    }
  };

  const triggerNativeCamera = () => {
    stopCamera();
    setErrorMessage(null);
    nativeCameraInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawBase64 = event.target?.result as string;
      const optimizedBase64 = await resizeImageIfNeeded(rawBase64);
      processImageAnalysis(optimizedBase64);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSelectPreset = (preset: SamplePreset) => {
    stopCamera();
    setSelectedImage(preset.imageUrl);
    setErrorMessage(null);
    setAnalysisResult(preset.analysis);
    setPreparationChecked({});
    setPointsClaimed(false);
    onScanCompleted(preset.analysis);
    saveToHistory(preset.analysis);
  };

  // Defensive JSON parser that strips markdown fences, conversational text,
  // leading/trailing prose or HTML wrappers before attempting JSON.parse.
  const parseJsonDefensively = <T = any>(rawInput: string): T => {
    if (!rawInput || typeof rawInput !== 'string') {
      throw new Error('Respuesta vacía o formato inválido recibido.');
    }

    let text = rawInput.trim();

    // 1. Strip Markdown code fences if present (```json ... ``` or ``` ...)
    if (text.includes('```')) {
      const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (codeBlockMatch && codeBlockMatch[1]) {
        text = codeBlockMatch[1].trim();
      } else {
        text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      }
    }

    // 2. Try direct parse first if it looks clean
    try {
      return JSON.parse(text) as T;
    } catch {
      // Proceed to extract candidate JSON object or array bounds
    }

    // 3. Scan for outer JSON object {...} or array [...]
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');

    let candidateSubstring = '';

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      if (firstBracket !== -1 && firstBracket < firstBrace && lastBracket > lastBrace) {
        candidateSubstring = text.slice(firstBracket, lastBracket + 1);
      } else {
        candidateSubstring = text.slice(firstBrace, lastBrace + 1);
      }
    } else if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      candidateSubstring = text.slice(firstBracket, lastBracket + 1);
    }

    if (candidateSubstring) {
      try {
        return JSON.parse(candidateSubstring) as T;
      } catch (nestedErr) {
        // Attempt minor cleanup: trailing commas
        const cleaned = candidateSubstring
          .replace(/,\s*([}\]])/g, '$1');
        try {
          return JSON.parse(cleaned) as T;
        } catch {
          // Fall through
        }
      }
    }

    // If completely unparseable, throw descriptive error
    throw new Error('No se pudo encontrar una estructura JSON válida en la respuesta.');
  };

  const processImageAnalysis = async (base64Image: string, customPrompt?: string) => {
    setSelectedImage(base64Image);
    setIsAnalyzing(true);
    setErrorMessage(null);
    setAnalysisResult(null);
    setPreparationChecked({});
    setPointsClaimed(false);

    const activePrompt = customPrompt !== undefined ? customPrompt : userHint;

    try {
      const response = await fetch('/api/classify-waste', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          imageBase64: base64Image,
          mimeType: 'image/jpeg',
          userPrompt: activePrompt.trim() || undefined,
        }),
      });

      const rawText = await response.text();
      let resData: any = null;
      try {
        resData = parseJsonDefensively(rawText);
      } catch (jsonErr) {
        console.error('Non-JSON response received:', rawText.slice(0, 300));
        if (response.status === 413 || rawText.includes('too large') || rawText.includes('Payload')) {
          throw new Error('La imagen capturada es demasiado pesada para la red. Intenta tomarla de nuevo para que se optimice automáticamente.');
        } else if (response.status === 504 || rawText.includes('Gateway') || rawText.includes('Timeout')) {
          throw new Error('El servidor tardó en responder. Por favor presiona "Reintentar".');
        } else {
          throw new Error('La conexión temporalmente no pudo procesar la solicitud. Por favor intenta de nuevo.');
        }
      }

      if (response.ok && resData.data) {
        setAnalysisResult(resData.data);
        onScanCompleted(resData.data);
        saveToHistory(resData.data);
      } else {
        let msg = 'No se pudo clasificar el residuo con la imagen actual.';
        if (resData.error && typeof resData.error === 'string') {
          msg = resData.error;
        } else if (resData.details) {
          if (typeof resData.details === 'string') {
            try {
              const parsed = JSON.parse(resData.details);
              msg = parsed.error?.message || parsed.message || resData.details;
            } catch {
              msg = resData.details;
            }
          } else if (typeof resData.details === 'object') {
            msg = resData.details.error?.message || resData.details.message || JSON.stringify(resData.details);
          }
        }
        throw new Error(msg);
      }
    } catch (err: any) {
      console.error('Error analizando imagen:', err);
      let displayError = err?.message;
      if (typeof displayError !== 'string' || displayError === '[object Object]') {
        displayError = 'No fue posible identificar con certeza el residuo en la imagen. Intenta con mejor iluminación, enfocando más de cerca o agregando una pista rápida.';
      }
      setErrorMessage(displayError);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveToHistory = (item: WasteAnalysisResult) => {
    setScanHistory((prev) => {
      const updated = [item, ...prev.filter((x) => x.wasteName !== item.wasteName)].slice(0, 10);
      try {
        localStorage.setItem('ecoscan_history', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleClaimPoints = () => {
    if (!analysisResult || pointsClaimed) return;
    setPointsClaimed(true);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#16a34a', '#22c55e', '#3b82f6', '#f59e0b', '#ffffff'],
      });
    } catch (e) {}
  };

  const togglePreparationStep = (index: number) => {
    setPreparationChecked((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Visual helper for bin color badge styling
  const getBinVisualConfig = (binType: string) => {
    switch (binType) {
      case 'blanca':
        return {
          bgColor: 'bg-white',
          borderColor: 'border-slate-300',
          textColor: 'text-slate-900',
          badgeBg: 'bg-slate-100 text-slate-900 border border-slate-300',
          bannerBg: 'bg-gradient-to-r from-slate-800 to-slate-900 text-white',
          accent: 'Aprovechables Limpios (Plástico, Vidrio, Cartón, Metal)',
          icon: '🤍',
        };
      case 'verde':
        return {
          bgColor: 'bg-emerald-500',
          borderColor: 'border-emerald-600',
          textColor: 'text-white',
          badgeBg: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
          bannerBg: 'bg-gradient-to-r from-emerald-600 to-green-700 text-white',
          accent: 'Orgánicos Aprovechables (Comida, Cáscaras, Poda)',
          icon: '💚',
        };
      case 'negra':
        return {
          bgColor: 'bg-slate-900',
          borderColor: 'border-slate-950',
          textColor: 'text-white',
          badgeBg: 'bg-slate-200 text-slate-900 border border-slate-400',
          bannerBg: 'bg-gradient-to-r from-slate-900 to-black text-white',
          accent: 'No Aprovechables / Ordinarios (Servilletas, Icopor, Grasos)',
          icon: '🖤',
        };
      case 'roja_especial':
      default:
        return {
          bgColor: 'bg-red-600',
          borderColor: 'border-red-700',
          textColor: 'text-white',
          badgeBg: 'bg-red-100 text-red-900 border border-red-300',
          bannerBg: 'bg-gradient-to-r from-red-600 to-rose-700 text-white',
          accent: 'Residuos Peligrosos / Especiales / Posconsumo / RAEE',
          icon: '🛑',
        };
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-900/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold text-emerald-100 border border-white/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Módulo de Visión Artificial Gemini 3.8</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Reconocimiento y Separación Inteligente de Residuos
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base max-w-2xl">
            Toma o sube una foto de cualquier residuo. Nuestra IA identificará el material,
            la caneca oficial correspondiente según el código de colores, el modo de preparación y el impacto ambiental.
          </p>
        </div>
      </div>

      {/* Main Scanner Card & Controls */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-md shadow-slate-200/40 space-y-6">
        {/* Hidden inputs for gallery upload and native camera capture */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
        <input
          ref={nativeCameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Active Camera View */}
        {isCameraActive ? (
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video max-h-[420px] flex items-center justify-center border-2 border-emerald-500 shadow-inner">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Live scanning overlay line */}
            <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-pulse" />

            {/* Top camera controls: camera mode badge and switch lens button */}
            <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-none">
              <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-semibold text-white border border-white/20 pointer-events-auto flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Cámara en Vivo ({cameraFacing === 'environment' ? 'Trasera' : 'Frontal'})</span>
              </span>

              <button
                type="button"
                onClick={toggleCameraFacing}
                className="p-2.5 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white rounded-full transition-colors pointer-events-auto border border-white/20 shadow-md"
                title="Cambiar lente (Frontal / Trasera)"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-3 px-4">
              <button
                id="btn-capture-camera"
                onClick={capturePhotoFromCamera}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-full shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                <Camera className="w-5 h-5" />
                <span>Capturar Foto</span>
              </button>
              <button
                id="btn-stop-camera"
                onClick={stopCamera}
                className="p-3 bg-slate-800/80 hover:bg-slate-700 text-white rounded-full transition-colors cursor-pointer"
                title="Cerrar cámara"
              >
                <VideoOff className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          /* Upload & Camera Action Buttons Grid */
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Option 1: Live Webcam / Stream */}
            <button
              id="btn-open-camera"
              onClick={() => startCamera()}
              className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-emerald-400 bg-emerald-50/40 hover:bg-emerald-50/80 transition-all group text-center cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-2.5 shadow-md group-hover:scale-105 transition-transform">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Cámara en Vivo</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Visor interactivo con captura directa
              </p>
            </button>

            {/* Option 2: Native Device Camera (works 100% on phones and iframes) */}
            <button
              id="btn-native-camera"
              onClick={triggerNativeCamera}
              className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-teal-400 bg-teal-50/40 hover:bg-teal-50/80 transition-all group text-center cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center mb-2.5 shadow-md group-hover:scale-105 transition-transform">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Tomar Foto (Móvil)</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Abre la app de cámara de tu teléfono
              </p>
            </button>

            {/* Option 3: Gallery Upload */}
            <button
              id="btn-upload-gallery"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/60 hover:bg-slate-100/80 transition-all group text-center cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-white flex items-center justify-center mb-2.5 shadow-md group-hover:scale-105 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Subir desde Galería</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Archivos JPG, PNG, WEBP
              </p>
            </button>
          </div>
        )}

        {/* Permission Guidance Banner when camera fails or is blocked */}
        {permissionGuidanceOpen && (
          <div className="p-4 bg-amber-50/90 border border-amber-300/80 rounded-2xl space-y-3 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  📷
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-amber-900">
                    Permiso de Cámara Restringido o No Disponible
                  </h4>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    {permissionErrorDetail || 'El navegador no autorizó el acceso a la cámara en vivo.'}
                  </p>
                  <p className="text-[11px] text-amber-700">
                    💡 <strong>Cómo solucionarlo:</strong> Si estás en el navegador, haz clic en el icono de <strong>candado 🔒</strong> o <strong>ajustes de sitio</strong> en la barra de direcciones y activa <strong>"Permitir Cámara"</strong>. También puedes usar las alternativas directas a continuación:
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPermissionGuidanceOpen(false)}
                className="text-amber-700 hover:text-amber-900 text-xs font-bold p-1 rounded-md hover:bg-amber-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-200/70">
              <button
                id="btn-fallback-native-camera"
                onClick={triggerNativeCamera}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Usar Cámara del Sistema / Móvil</span>
              </button>
              <button
                id="btn-fallback-gallery"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Seleccionar Foto de Archivo</span>
              </button>
              <button
                id="btn-retry-camera"
                onClick={() => startCamera()}
                className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-semibold transition-colors cursor-pointer ml-auto"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reintentar Permiso</span>
              </button>
            </div>
          </div>
        )}

        {/* Optional context hint to guide recognition */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="input-user-hint" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span>💡 ¿Deseas agregar una pista o detalle para ayudar a la IA?</span>
              <span className="text-[10px] font-normal text-slate-500">(Opcional)</span>
            </label>
            {userHint && (
              <button
                type="button"
                onClick={() => setUserHint('')}
                className="text-[10px] text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
              >
                Limpiar pista
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <input
              id="input-user-hint"
              type="text"
              value={userHint}
              onChange={(e) => setUserHint(e.target.value)}
              placeholder="Ej: cáscara de banano, lata de cerveza, pila AA, vaso de yogur, servilleta con grasa..."
              className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
            {selectedImage && !isAnalyzing && (
              <button
                type="button"
                onClick={() => processImageAnalysis(selectedImage)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer"
              >
                Reanalizar
              </button>
            )}
          </div>
          {/* Quick chip buttons */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[10px] text-slate-400 self-center mr-0.5">Pistas rápidas:</span>
            {[
              { label: '🍎 Orgánico / Comida', hint: 'residuo orgánico / resto de comida o cáscara' },
              { label: '🧴 Plástico Limpio', hint: 'envase o botella de plástico limpia' },
              { label: '🥫 Lata / Metal', hint: 'lata de metal o aluminio' },
              { label: '🍾 Vidrio', hint: 'botella o frasco de vidrio' },
              { label: '📦 Cartón / Papel', hint: 'papel o cartón limpio y seco' },
              { label: '🔋 Pila / RAEE', hint: 'pila, batería o residuo electrónico' },
              { label: '🧻 Servilleta / Ordinario', hint: 'servilleta usada o papel con grasa' },
            ].map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => {
                  setUserHint(chip.hint);
                  if (selectedImage && !isAnalyzing) {
                    processImageAnalysis(selectedImage, chip.hint);
                  }
                }}
                className={`text-[11px] px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                  userHint === chip.hint
                    ? 'bg-emerald-100 border-emerald-400 text-emerald-800 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generic Error message */}
        {errorMessage && !permissionGuidanceOpen && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-amber-50 border border-amber-300 rounded-2xl text-amber-900 text-sm shadow-xs">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-amber-950">Aviso de Reconocimiento:</span>
                <p className="text-xs text-amber-800">{errorMessage}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              {selectedImage && (
                <button
                  type="button"
                  onClick={() => processImageAnalysis(selectedImage)}
                  className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Reintentar
                </button>
              )}
              <button
                onClick={() => setErrorMessage(null)}
                className="text-amber-600 hover:text-amber-900 text-xs font-bold p-1 rounded-md hover:bg-amber-100 cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Quick Sample Presets (for fast evaluation) */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              O prueba un residuo de muestra al instante:
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {SAMPLE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                id={`preset-${preset.id}`}
                onClick={() => handleSelectPreset(preset)}
                className="flex flex-col items-center p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 bg-slate-50/80 hover:bg-emerald-50/50 transition-all text-center group"
              >
                <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                  {preset.thumbnail}
                </span>
                <span className="text-xs font-semibold text-slate-800 line-clamp-1">
                  {preset.name}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {preset.category}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Analyzing Loading Animation */}
      {isAnalyzing && (
        <div className="bg-white rounded-3xl p-8 border border-emerald-200 text-center shadow-lg space-y-4 animate-pulse">
          <div className="relative w-20 h-20 mx-auto">
            <div className="w-20 h-20 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-emerald-600 animate-bounce" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">
              Analizando estructura del residuo con IA...
            </h3>
            <p className="text-xs text-slate-500">
              Evaluando composición química, porcentaje de reciclabilidad y caneca oficial
            </p>
          </div>
        </div>
      )}

      {/* Analysis Result Display */}
      {analysisResult && !isAnalyzing && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden space-y-0 transition-all">
          {/* Top Banner indicating the official Bin */}
          {(() => {
            const config = getBinVisualConfig(analysisResult.binType);
            return (
              <div className={`p-6 ${config.bannerBg} relative overflow-hidden`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/30 backdrop-blur-sm rounded-full text-xs font-semibold tracking-wide uppercase">
                      <span>{config.icon}</span>
                      <span>{analysisResult.binName}</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                      {analysisResult.wasteName}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-200 font-medium">
                      {analysisResult.materialType}
                    </p>
                  </div>

                  {/* Recyclability Score Pill */}
                  <div className="flex flex-col items-start sm:items-end bg-black/20 backdrop-blur-md p-3 rounded-2xl border border-white/20">
                    <div className="text-xs font-semibold text-white/80 uppercase">
                      Reciclabilidad
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-white">
                        {analysisResult.recyclabilityScore}%
                      </span>
                      <span className="text-xs font-bold text-emerald-300">
                        ({analysisResult.recyclabilityLevel})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          <div className="p-6 sm:p-8 space-y-6">
            {/* Scanned Image and Bin Explanation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* Photo preview */}
              {selectedImage && (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm aspect-square md:aspect-auto md:h-52 bg-slate-100">
                  <img
                    src={selectedImage}
                    alt="Residuo analizado"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 backdrop-blur-sm text-[11px] text-white rounded-md">
                    IA Confianza: {(analysisResult.confidenceScore * 100).toFixed(0)}%
                  </div>
                </div>
              )}

              {/* Description & Hazard Warnings */}
              <div className="md:col-span-2 space-y-3">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                    <Info className="w-4 h-4 text-emerald-600" />
                    <span>¿Por qué va en esta caneca?</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {analysisResult.binDescription}
                  </p>
                </div>

                {analysisResult.hazardWarning && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-900 text-xs font-medium">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{analysisResult.hazardWarning}</span>
                  </div>
                )}

                {analysisResult.circularEconomyIdea && (
                  <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-emerald-950 text-xs">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold text-emerald-900">Potencial de Economía Circular:</strong>{' '}
                      {analysisResult.circularEconomyIdea}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Preparation Steps Checklist */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                <span>Pasos de Preparación para Disposición Correcta:</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {analysisResult.preparationSteps.map((step, idx) => {
                  const isChecked = !!preparationChecked[idx];
                  return (
                    <button
                      key={idx}
                      onClick={() => togglePreparationStep(idx)}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                        isChecked
                          ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 font-medium'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/80'
                      }`}
                    >
                      {isChecked ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                      )}
                      <span className="text-xs sm:text-sm">{step}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Environmental Savings Metrics */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                Ahorro Ambiental Estimado con este Reciclaje:
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-emerald-50 border border-emerald-200/80 p-3 sm:p-4 rounded-2xl text-center space-y-1">
                  <Flame className="w-5 h-5 text-emerald-600 mx-auto" />
                  <div className="text-lg sm:text-2xl font-black text-slate-900">
                    {analysisResult.environmentalSavings.co2SavedGrams}g
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-600 font-medium">
                    CO₂ Prevenido
                  </div>
                </div>

                <div className="bg-sky-50 border border-sky-200/80 p-3 sm:p-4 rounded-2xl text-center space-y-1">
                  <Droplets className="w-5 h-5 text-sky-600 mx-auto" />
                  <div className="text-lg sm:text-2xl font-black text-slate-900">
                    {analysisResult.environmentalSavings.waterSavedLiters} L
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-600 font-medium">
                    Agua Conservada
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200/80 p-3 sm:p-4 rounded-2xl text-center space-y-1">
                  <Zap className="w-5 h-5 text-amber-600 mx-auto" />
                  <div className="text-lg sm:text-2xl font-black text-slate-900">
                    {analysisResult.environmentalSavings.energySavedWh} Wh
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-600 font-medium">
                    Energía Ahorrada
                  </div>
                </div>
              </div>
            </div>

            {/* Points & EcoMonedas Action bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-100 border border-yellow-300 text-amber-900 flex items-center justify-center font-black text-base shadow-xs">
                  🪙 +{analysisResult.ecoPoints}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span>EcoMonedas & EcoPuntos Ganados</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-yellow-100 text-yellow-800 rounded font-bold">Medellín</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Canjeables por pasajes Cívica Metro, kits I.E. Rafael Uribe y siembra de árboles
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  id="btn-claim-points"
                  onClick={handleClaimPoints}
                  disabled={pointsClaimed}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-sm shadow-md transition-all ${
                    pointsClaimed
                      ? 'bg-amber-100 text-amber-900 border border-amber-300 cursor-default'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>{pointsClaimed ? '¡Monedas y Puntos Acreditados! 🪙' : 'Reclamar Monedas y Puntos'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Scan History */}
      {scanHistory.length > 0 && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-600" />
              <span>Historial de Escaneos Recientes</span>
            </h3>
            <span className="text-xs text-slate-400">Guardado localmente</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {scanHistory.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setAnalysisResult(item)}
                className="p-3 rounded-2xl border border-slate-200 hover:border-emerald-400 bg-slate-50/60 hover:bg-emerald-50/30 transition-all cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 line-clamp-1">
                    {item.wasteName}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      item.binType === 'blanca'
                        ? 'bg-slate-200 text-slate-800'
                        : item.binType === 'verde'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.binType === 'negra'
                        ? 'bg-slate-900 text-white'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.binType}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 line-clamp-1">{item.materialType}</div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                  <span>Reciclabilidad: {item.recyclabilityScore}%</span>
                  <span className="text-emerald-600 font-bold">+{item.ecoPoints} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
