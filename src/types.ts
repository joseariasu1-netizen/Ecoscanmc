export type BinType = 'blanca' | 'verde' | 'negra' | 'roja_especial';

export type RecyclabilityLevel = 'Alta' | 'Media' | 'Baja' | 'No Reciclable';

export interface WasteAnalysisResult {
  wasteName: string;
  materialType: string;
  binType: BinType;
  binName: string;
  binColorHex: string;
  binDescription: string;
  recyclabilityScore: number; // 0 - 100
  recyclabilityLevel: RecyclabilityLevel;
  preparationSteps: string[];
  practicalTips: string;
  circularEconomyIdea?: string;
  hazardWarning?: string;
  environmentalSavings: {
    co2SavedGrams: number;
    waterSavedLiters: number;
    energySavedWh: number;
  };
  ecoPoints: number;
  confidenceScore: number;
  detectedAt?: string;
}

export type ReportUrgency = 'baja' | 'media' | 'alta' | 'critica';
export type ReportStatus = 'pendiente' | 'en_revision' | 'en_ruta' | 'recolectado';
export type ReportCategory =
  | 'basura_desbordada'
  | 'escombros_construccion'
  | 'vertedero_clandestino'
  | 'muebles_voluminosos'
  | 'residuos_peligrosos'
  | 'alcantarilla_obstruida'
  | 'otro';

export interface CitizenReport {
  id: string;
  ticketCode: string;
  photoUrl: string;
  latitude: number;
  longitude: number;
  address: string;
  reference?: string;
  category: ReportCategory;
  categoryLabel: string;
  urgency: ReportUrgency;
  status: ReportStatus;
  notes: string;
  citizenName: string;
  citizenPhone?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolutionNote?: string;
  resolutionPhotoUrl?: string;
  upvotes: number;
}

export type CenterType = 'punto_limpio' | 'cooperativa' | 'posconsumo' | 'raee_pilas';

export interface RecycleCenter {
  id: string;
  name: string;
  type: CenterType;
  typeLabel: string;
  latitude: number;
  longitude: number;
  address: string;
  neighborhood?: string;
  schedule: string;
  acceptedMaterials: string[];
  phone: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  verified: boolean;
  notes?: string;
  distanceKm?: number;
}

export type BinCondition = 'excelente' | 'bueno' | 'regular' | 'dañada' | 'llena';

export interface PublicBin {
  id: string;
  type: BinType | 'estacion_ecologica';
  typeLabel: string;
  latitude: number;
  longitude: number;
  address: string;
  condition: BinCondition;
  photoUrl?: string;
  reportedBy: string;
  confirmationsCount: number;
  registeredAt: string;
  notes?: string;
  hasCapacity: boolean;
}

export interface UserEcoProfile {
  name: string;
  ecoPoints: number;
  ecoCoins: number; // Monedas ecológicas "EcoMonedas Uribeñas / MetroMonedas"
  scansCount: number;
  reportsCount: number;
  binsRegisteredCount: number;
  adoptedSquareMeters: number; // m² cuidados en la campaña Mi Metro Cuadrado
  co2PreventedKg: number;
  level: string;
  neighborhood: string;
  institutionRole: string; // Ej: "Estudiante I.E. Rafael Uribe Uribe"
  badges: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
  }>;
  redeemedRewards: Array<{
    id: string;
    rewardId: string;
    title: string;
    coinsSpent: number;
    redeemedAt: string;
    redemptionCode: string;
    status: 'activo' | 'canjeado';
  }>;
}

export type PlotStatus = 'limpio_y_cuidado' | 'en_mantenimiento' | 'recuperado';

export interface SquareMeterPlot {
  id: string;
  name: string;
  locationDescription: string;
  zoneType: 'colegio_uribe' | 'parque_barrial' | 'acera_comunitaria' | 'estacion_metro' | 'quebrada_verde';
  zoneLabel: string;
  latitude: number;
  longitude: number;
  squareMeters: number;
  adopterName: string;
  adopterRole: string;
  status: PlotStatus;
  lastCleanedDate: string;
  cleaningsCount: number;
  photoBeforeUrl?: string;
  photoAfterUrl?: string;
  coinsEarned: number;
  verifiedByInstitution: boolean;
}

export type RewardCategory = 'metro_transporte' | 'educacion_uribe' | 'cultura_medellin' | 'ecologia_siembra';

export interface MetroReward {
  id: string;
  title: string;
  subtitle: string;
  category: RewardCategory;
  categoryLabel: string;
  coinsCost: number;
  icon: string;
  description: string;
  sponsor: string;
  stock: number;
  perks: string[];
  redemptionInstructions: string;
}

export interface PlatformStats {
  totalScans: number;
  totalReports: number;
  resolvedReports: number;
  totalBins: number;
  totalCenters: number;
  totalSquareMetersAdopted: number;
  co2SavedKg: number;
  communityMembers: number;
  totalCoinsAwarded: number;
}

