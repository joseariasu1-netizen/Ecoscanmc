import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Calculator,
  TreePine,
  Droplets,
  Flame,
  Zap,
  Sparkles,
  CheckCircle2,
  Info,
  HelpCircle,
  Award,
} from 'lucide-react';

interface DirectoryItem {
  name: string;
  category: string;
  bin: 'blanca' | 'verde' | 'negra' | 'roja_especial';
  binName: string;
  tip: string;
}

const DIRECTORY_ITEMS: DirectoryItem[] = [
  { name: 'Botella de agua/refresco (PET)', category: 'Plásticos', bin: 'blanca', binName: 'Caneca Blanca', tip: 'Enjuagar, secar y aplastar con su tapa enroscada.' },
  { name: 'Envase de champú/detergente (PEAD)', category: 'Plásticos', bin: 'blanca', binName: 'Caneca Blanca', tip: 'Enjuagar para retirar residuos químicos de jabón.' },
  { name: 'Cáscaras de frutas y verduras', category: 'Orgánicos', bin: 'verde', binName: 'Caneca Verde', tip: 'Retirar adhesivos o etiquetas plásticas de frutas.' },
  { name: 'Restos de comida cocida', category: 'Orgánicos', bin: 'verde', binName: 'Caneca Verde', tip: 'Escurrir caldos o exceso de líquidos.' },
  { name: 'Papel higiénico y pañuelos faciales', category: 'Ordinarios', bin: 'negra', binName: 'Caneca Negra', tip: 'Material biológico no apto para reciclaje.' },
  { name: 'Servilletas de cocina usadas', category: 'Ordinarios', bin: 'negra', binName: 'Caneca Negra', tip: 'Contaminadas con grasa/humedad no se pueden reciclar.' },
  { name: 'Caja de pizza limpia (sin grasa)', category: 'Cartón', bin: 'blanca', binName: 'Caneca Blanca', tip: 'Si la tapa superior está limpia, recíclala en blanca.' },
  { name: 'Caja de pizza con grasa y queso', category: 'Ordinarios', bin: 'negra', binName: 'Caneca Negra', tip: 'La grasa arruina el molino de celulosa.' },
  { name: 'Botella de vino o cerveza de vidrio', category: 'Vidrio', bin: 'blanca', binName: 'Caneca Blanca', tip: 'Depositar sin quebrar y retirar chapa metálica.' },
  { name: 'Frascos de conservas o café de vidrio', category: 'Vidrio', bin: 'blanca', binName: 'Caneca Blanca', tip: 'Enjuagar y separar tapa metálica.' },
  { name: 'Lata de atún o verduras', category: 'Metales', bin: 'blanca', binName: 'Caneca Blanca', tip: 'Lavar con agua y jabón para retirar aceites.' },
  { name: 'Lata de refresco (Aluminio)', category: 'Metales', bin: 'blanca', binName: 'Caneca Blanca', tip: '100% reciclable infinita cantidad de veces.' },
  { name: 'Paquete de papas fritas metalizado', category: 'Ordinarios', bin: 'negra', binName: 'Caneca Negra', tip: 'Multicapa no separable en plantas convencionales.' },
  { name: 'Pilas y baterías AA, AAA, Botón', category: 'Peligrosos', bin: 'roja_especial', binName: 'Caneca Roja / Posconsumo', tip: 'Llevar a contenedor "Pilas con el Ambiente".' },
  { name: 'Bombillos fluorescentes / LED', category: 'Peligrosos', bin: 'roja_especial', binName: 'Caneca Roja / Posconsumo', tip: 'Contienen mercurio o circuitos electrónicos.' },
  { name: 'Medicamentos vencidos o tabletas', category: 'Peligrosos', bin: 'roja_especial', binName: 'Caneca Roja / Posconsumo', tip: 'Depositar en buzones "Punto Azul" en farmacias.' },
  { name: 'Icopor de empaque de electrodoméstico limpio', category: 'Plásticos', bin: 'blanca', binName: 'Caneca Blanca', tip: 'Poliestireno expandido limpio y sin grasa.' },
  { name: 'Icopor de comida rápida con grasa', category: 'Ordinarios', bin: 'negra', binName: 'Caneca Negra', tip: 'No reciclable si tiene salsa o grasa pegada.' },
  { name: 'Envase Tetra Pak (leche, jugo)', category: 'Cartón/Multicapa', bin: 'blanca', binName: 'Caneca Blanca', tip: 'Desdoblar esquinas, enjuagar y aplanar.' },
  { name: 'Colillas de cigarrillo', category: 'Ordinarios', bin: 'negra', binName: 'Caneca Negra', tip: 'Tóxicas, apagar bien antes de depositar.' },
  { name: 'Posos de café y bolsitas de té', category: 'Orgánicos', bin: 'verde', binName: 'Caneca Verde', tip: 'Excelente aporte de nitrógeno para compost.' },
  { name: 'Hojas secas y césped podado', category: 'Orgánicos', bin: 'verde', binName: 'Caneca Verde', tip: 'Aporte de carbono en pilas de abono.' },
];

export const EcoGuideView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [familyMembers, setFamilyMembers] = useState<number>(3);
  const [recyclingRate, setRecyclingRate] = useState<number>(75); // %

  const filteredDirectory = DIRECTORY_ITEMS.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.binName.toLowerCase().includes(q)
    );
  });

  // Calculate annual savings based on family size and recycling %
  const yearlyWasteKg = familyMembers * 365 * 1.1; // avg 1.1 kg/person/day
  const yearlyRecycledKg = (yearlyWasteKg * (recyclingRate / 100)).toFixed(0);
  const co2SavedYearKg = ((Number(yearlyRecycledKg) * 1.45)).toFixed(1);
  const waterSavedYearLiters = ((Number(yearlyRecycledKg) * 18.2)).toFixed(0);
  const treesSavedYear = ((Number(yearlyRecycledKg) * 0.018)).toFixed(1);
  const energySavedKwh = ((Number(yearlyRecycledKg) * 2.8)).toFixed(0);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-700 via-emerald-700 to-green-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Guía Oficial y Pedagogía Ciudadana</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold">
          Código Oficial de Colores y Calculadora de Impacto
        </h1>
        <p className="text-teal-100 text-xs sm:text-sm max-w-2xl">
          Aprende el estándar nacional de separación en la fuente (Resolución 2184) y calcula la huella positiva de tu hogar.
        </p>
      </div>

      {/* Official 4 Bins Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Caneca Blanca */}
        <div className="bg-white rounded-3xl p-5 border-2 border-slate-300 shadow-md flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-300 flex items-center justify-center text-xl shadow-xs">
              🤍
            </div>
            <h3 className="font-black text-base text-slate-900">Caneca Blanca</h3>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 text-slate-800 rounded-full inline-block border border-slate-200">
              Aprovechables Limpios
            </span>
            <ul className="text-xs text-slate-600 space-y-1 pt-1 list-disc list-inside">
              <li>Plásticos (PET, PEAD, bolsas limpias)</li>
              <li>Botellas y frascos de vidrio</li>
              <li>Metales (latas de aluminio y conservas)</li>
              <li>Papel y cartón secos y limpios</li>
              <li>Tetra Pak desdoblado</li>
            </ul>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-700 font-medium border border-slate-200">
            ✨ <strong>Regla de oro:</strong> Entregar siempre limpios y completamente secos.
          </div>
        </div>

        {/* Caneca Verde */}
        <div className="bg-white rounded-3xl p-5 border-2 border-emerald-500 shadow-md flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-xl shadow-xs">
              💚
            </div>
            <h3 className="font-black text-base text-emerald-900">Caneca Verde</h3>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-full inline-block border border-emerald-200">
              Orgánicos Aprovechables
            </span>
            <ul className="text-xs text-slate-600 space-y-1 pt-1 list-disc list-inside">
              <li>Restos de comida cruda y cocida</li>
              <li>Cáscaras de frutas, verduras y huevos</li>
              <li>Posos y filtros de café</li>
              <li>Poda de jardín y hojas secas</li>
              <li>Huesos pequeños y espinas</li>
            </ul>
          </div>
          <div className="p-2.5 bg-emerald-50 rounded-xl text-[11px] text-emerald-900 font-medium border border-emerald-200">
            🌱 <strong>Destino:</strong> Plantas de compostaje, lombricultura y abono.
          </div>
        </div>

        {/* Caneca Negra */}
        <div className="bg-white rounded-3xl p-5 border-2 border-slate-800 shadow-md flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl shadow-xs">
              🖤
            </div>
            <h3 className="font-black text-base text-slate-900">Caneca Negra</h3>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-900 text-white rounded-full inline-block">
              No Aprovechables
            </span>
            <ul className="text-xs text-slate-600 space-y-1 pt-1 list-disc list-inside">
              <li>Papel higiénico y toallas higiénicas</li>
              <li>Servilletas usadas con grasa</li>
              <li>Cartones impregnados de comida</li>
              <li>Empaques metalizados de snacks</li>
              <li>Colillas de cigarrillo e icopor sucio</li>
            </ul>
          </div>
          <div className="p-2.5 bg-slate-100 rounded-xl text-[11px] text-slate-800 font-medium border border-slate-200">
            🚛 <strong>Destino:</strong> Relleno sanitario municipal.
          </div>
        </div>

        {/* Caneca Roja / Especial */}
        <div className="bg-white rounded-3xl p-5 border-2 border-red-500 shadow-md flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-red-100 border border-red-300 flex items-center justify-center text-xl shadow-xs">
              🛑
            </div>
            <h3 className="font-black text-base text-red-900">Caneca Roja / Posconsumo</h3>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-red-100 text-red-900 rounded-full inline-block border border-red-200">
              Peligrosos / RAEE
            </span>
            <ul className="text-xs text-slate-600 space-y-1 pt-1 list-disc list-inside">
              <li>Pilas y acumuladores de litio</li>
              <li>Bombillos ahorradores y tubos LED</li>
              <li>Medicamentos vencidos</li>
              <li>Envases de insecticidas o químicos</li>
              <li>Cables, celulares y cargadores</li>
            </ul>
          </div>
          <div className="p-2.5 bg-red-50 rounded-xl text-[11px] text-red-900 font-medium border border-red-200">
            ⚠️ <strong>Destino:</strong> Puntos autorizados de posconsumo.
          </div>
        </div>
      </div>

      {/* Interactive Environmental Impact Calculator */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg space-y-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Calculadora de Impacto Ambiental en tu Hogar
            </h2>
            <p className="text-xs text-slate-500">
              Simula tu impacto ecológico al separar correctamente los residuos durante un año.
            </p>
          </div>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-800">
              <span>Personas en tu hogar:</span>
              <span className="text-emerald-700 font-extrabold text-sm">{familyMembers} personas</span>
            </div>
            <input
              type="range"
              min={1}
              max={8}
              value={familyMembers}
              onChange={(e) => setFamilyMembers(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>1 (Individual)</span>
              <span>4 (Familia)</span>
              <span>8 (Comunidad)</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-800">
              <span>Hábito de separación en la fuente:</span>
              <span className="text-emerald-700 font-extrabold text-sm">{recyclingRate}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={recyclingRate}
              onChange={(e) => setRecyclingRate(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>10% (Ocasional)</span>
              <span>50% (Básico)</span>
              <span>100% (Cero Basura)</span>
            </div>
          </div>
        </div>

        {/* Result Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center space-y-1">
            <Flame className="w-5 h-5 text-emerald-600 mx-auto" />
            <div className="text-xl sm:text-2xl font-black text-slate-900">{co2SavedYearKg} kg</div>
            <div className="text-[11px] text-emerald-800 font-bold">CO₂ Anual Prevenido</div>
          </div>

          <div className="bg-sky-50 border border-sky-200 p-4 rounded-2xl text-center space-y-1">
            <Droplets className="w-5 h-5 text-sky-600 mx-auto" />
            <div className="text-xl sm:text-2xl font-black text-slate-900">{waterSavedYearLiters} L</div>
            <div className="text-[11px] text-sky-800 font-bold">Agua Ahorrada al Año</div>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-center space-y-1">
            <TreePine className="w-5 h-5 text-amber-600 mx-auto" />
            <div className="text-xl sm:text-2xl font-black text-slate-900">{treesSavedYear}</div>
            <div className="text-[11px] text-amber-800 font-bold">Árboles Preservados</div>
          </div>

          <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl text-center space-y-1">
            <Zap className="w-5 h-5 text-purple-600 mx-auto" />
            <div className="text-xl sm:text-2xl font-black text-slate-900">{energySavedKwh} kWh</div>
            <div className="text-[11px] text-purple-800 font-bold">Energía Ahorrada</div>
          </div>
        </div>
      </div>

      {/* Searchable Directory "¿Dónde boto esto?" */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Search className="w-5 h-5 text-emerald-600" />
              <span>Directorio Rápido: ¿Dónde boto esto?</span>
            </h2>
            <p className="text-xs text-slate-500">
              Escribe cualquier objeto común para saber al instante en qué caneca colocarlo.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar residuo (ej. pizza, pila, lata)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {filteredDirectory.map((item, idx) => {
            const isWhite = item.bin === 'blanca';
            const isGreen = item.bin === 'verde';
            const isBlack = item.bin === 'negra';
            const isRed = item.bin === 'roja_especial';

            return (
              <div
                key={idx}
                className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-emerald-300 transition-all space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{item.name}</h4>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                      isWhite
                        ? 'bg-slate-200 text-slate-800'
                        : isGreen
                        ? 'bg-emerald-100 text-emerald-800'
                        : isBlack
                        ? 'bg-slate-900 text-white'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.binName}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium">{item.category}</div>
                <p className="text-[11px] text-slate-600 leading-snug">{item.tip}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
