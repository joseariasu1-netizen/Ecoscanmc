import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser with support for high-res base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Never cache API responses or dynamic pages
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Lazy/Safe Gemini AI Client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// In-Memory Database / Persistent Cache for Medellín & I.E. Rafael Uribe Uribe
let citizenReports = [
  {
    id: 'rep-001',
    ticketCode: 'MED-2026-9041',
    photoUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600&auto=format&fit=crop&q=80',
    latitude: 6.2735,
    longitude: -75.5912,
    address: 'Carrera 87 # 78-45, Robledo',
    reference: 'Cerca a la I.E. Rafael Uribe Uribe',
    category: 'basura_desbordada',
    categoryLabel: 'Basura Desbordada en Espacio Público',
    urgency: 'alta',
    status: 'en_ruta',
    notes: 'Acumulación de bolsas plásticas en la acera frente al sendero peatonal. Requiere apoyo de cuadrilla Emvarias.',
    citizenName: 'Santiago Restrepo - I.E. Rafael Uribe Uribe',
    citizenPhone: '+57 314 555 7890',
    createdAt: '2026-08-25T14:30:00.000Z',
    updatedAt: '2026-08-26T08:15:00.000Z',
    upvotes: 18,
  },
  {
    id: 'rep-002',
    ticketCode: 'MED-2026-8812',
    photoUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=80',
    latitude: 6.2524,
    longitude: -75.6185,
    address: 'Calle 44 con Carrera 99, San Javier (Comuna 13)',
    reference: 'Salida de la Estación San Javier del Metro',
    category: 'escombros_construccion',
    categoryLabel: 'Escombros de Construcción sin Recoger',
    urgency: 'critica',
    status: 'pendiente',
    notes: 'Bultos de ladrillos y tejas arrojados clandestinamente en la acera peatonal de acceso al Metrocable.',
    citizenName: 'Camila Henao - Guardiana Metro Cuadrado',
    citizenPhone: '+57 310 987 6543',
    createdAt: '2026-08-26T02:10:00.000Z',
    updatedAt: '2026-08-26T02:10:00.000Z',
    upvotes: 24,
  },
  {
    id: 'rep-003',
    ticketCode: 'MED-2026-7640',
    photoUrl: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?w=600&auto=format&fit=crop&q=80',
    latitude: 6.2486,
    longitude: -75.5902,
    address: 'Av. Nutibara con Circular 4ta, Laureles',
    reference: 'Frente al Parque de Laureles',
    category: 'muebles_voluminosos',
    categoryLabel: 'Muebles y Colchones en Vía Pública',
    urgency: 'media',
    status: 'recolectado',
    notes: 'Colchón viejo y silla de madera abandonados en el separador verde.',
    citizenName: 'Mateo Arango',
    createdAt: '2026-08-23T11:00:00.000Z',
    updatedAt: '2026-08-24T16:45:00.000Z',
    resolvedAt: '2026-08-24T16:45:00.000Z',
    resolutionNote: 'Cuadrilla "Línea Naranja Emvarias" realizó el levantamiento de material voluminoso.',
    resolutionPhotoUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80',
    upvotes: 11,
  },
];

let publicBins = [
  {
    id: 'bin-001',
    type: 'estacion_ecologica',
    typeLabel: 'Punto Ecológico I.E. Rafael Uribe Uribe (Blanca/Verde/Negra)',
    latitude: 6.2738,
    longitude: -75.5915,
    address: 'I.E. Rafael Uribe Uribe, Patio Central, Robledo',
    condition: 'excelente',
    photoUrl: 'https://images.unsplash.com/photo-1528190336454-13cd56b45b5a?w=600&auto=format&fit=crop&q=80',
    reportedBy: 'Comité Ambiental I.E. Rafael Uribe Uribe',
    confirmationsCount: 45,
    registeredAt: '2026-08-10T10:00:00.000Z',
    notes: 'Estación escolar con separación técnica para plástico PET de refrigerios y papel de archivo.',
    hasCapacity: true,
  },
  {
    id: 'bin-002',
    type: 'blanca',
    typeLabel: 'Caneca Blanca (Aprovechables Limpios)',
    latitude: 6.2520,
    longitude: -75.6178,
    address: 'Plazoleta Externa Estación Metro San Javier',
    condition: 'bueno',
    photoUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&auto=format&fit=crop&q=80',
    reportedBy: 'Cultura Metro Medellín',
    confirmationsCount: 38,
    registeredAt: '2026-08-12T14:20:00.000Z',
    notes: 'Para botellas plásticas PET, latas de aluminio y envases Tetra Pak limpios.',
    hasCapacity: true,
  },
  {
    id: 'bin-003',
    type: 'verde',
    typeLabel: 'Caneca Verde (Orgánicos y Compostaje)',
    latitude: 6.2415,
    longitude: -75.5780,
    address: 'Parques del Río Medellín, Costado Occidental',
    condition: 'excelente',
    photoUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80',
    reportedBy: 'Alcaldía de Medellín - Mi Metro Cuadrado',
    confirmationsCount: 29,
    registeredAt: '2026-08-14T09:00:00.000Z',
    notes: 'Para cáscaras de frutas de visitantes y residuos orgánicos del corredor biológico.',
    hasCapacity: true,
  },
  {
    id: 'bin-004',
    type: 'roja_especial',
    typeLabel: 'Punto Especial Posconsumo Pilas y Baterías',
    latitude: 6.2330,
    longitude: -75.6020,
    address: 'Centro Comercial Los Molinos, Entrada Principal',
    condition: 'excelente',
    photoUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&auto=format&fit=crop&q=80',
    reportedBy: 'Pilas con el Ambiente Medellín',
    confirmationsCount: 52,
    registeredAt: '2026-08-01T08:00:00.000Z',
    notes: 'Contenedor seguro para baterías AA, litio, celulares en desuso y cargadores.',
    hasCapacity: true,
  },
];

const recycleCenters = [
  {
    id: 'cent-001',
    name: 'RECIMED - Cooperativa de Recicladores de Medellín',
    type: 'cooperativa',
    typeLabel: 'Cooperativa de Recicladores de Oficio de Medellín',
    latitude: 6.2460,
    longitude: -75.5680,
    address: 'Calle 50 (Colombia) # 43-22, Centro Medellín',
    neighborhood: 'La Candelaria / Centro',
    schedule: 'Lunes a Sábado: 7:00 AM - 5:30 PM',
    acceptedMaterials: ['Plástico PET', 'Plástico PEAD', 'Cartón Corrugado', 'Archivo Blanco', 'Aluminio', 'Vidrio Limpio', 'Chatarra'],
    phone: '+57 (604) 444-3210',
    whatsapp: '+57 314 888 2211',
    email: 'contacto@recimed.org.co',
    website: 'https://recimed.org.co',
    verified: true,
    notes: 'Organización oficial de recuperadores ambientales de Medellín con pago de tarifa justa.',
  },
  {
    id: 'cent-002',
    name: 'Punto Naranja Emvarias - Parque Explora & Zona Norte',
    type: 'punto_limpio',
    typeLabel: 'Punto Limpio Autorizado Emvarias Medellín',
    latitude: 6.2708,
    longitude: -75.5654,
    address: 'Carrera 52 # 73-75, Aranjuez / Explora',
    neighborhood: 'Zona Norte / Aranjuez',
    schedule: 'Lunes a Domingo: 8:00 AM - 6:00 PM',
    acceptedMaterials: ['Plásticos', 'Vidrio', 'Metales', 'Aceite de cocina usado', 'Empaques Tetra Pak', 'RAEE pequeños'],
    phone: '+57 (604) 511-7777',
    whatsapp: '+57 321 999 0011',
    verified: true,
    notes: 'Punto Naranja oficial de Empresas Varias de Medellín con pesaje digital y canje de puntos.',
  },
  {
    id: 'cent-003',
    name: 'Centro de Acopio y Posconsumo RAEE Medellín Occidente',
    type: 'raee_pilas',
    typeLabel: 'Centro de Disposición Segura RAEE & Electrónicos',
    latitude: 6.2420,
    longitude: -75.5940,
    address: 'Circular 73 # 39B-15, Laureles',
    neighborhood: 'Laureles - Estadio',
    schedule: 'Lunes a Viernes: 8:30 AM - 5:30 PM | Sábados: 9:00 AM - 1:00 PM',
    acceptedMaterials: ['Pilas y Baterías', 'Portátiles y Monitores', 'Cables y Transformadores', 'Bombillos LED y Fluorescentes'],
    phone: '+57 (604) 312-8900',
    whatsapp: '+57 318 666 4433',
    verified: true,
    notes: 'Certificación de aprovechamiento de metales raros y desensamble sin contaminación de aguas.',
  },
  {
    id: 'cent-004',
    name: 'Vivero & Estación de Compostaje Comunal Robledo',
    type: 'punto_limpio',
    typeLabel: 'Estación de Compostaje Comunitario & Huerta',
    latitude: 6.2750,
    longitude: -75.5930,
    address: 'Calle 76 # 85-30, Robledo',
    neighborhood: 'Robledo / Comuna 7',
    schedule: 'Martes a Domingo: 8:00 AM - 4:00 PM',
    acceptedMaterials: ['Restos de poda', 'Cáscaras de frutas y verduras', 'Posos de café', 'Hojarasca seca'],
    phone: '+57 (604) 234-5678',
    whatsapp: '+57 311 777 8899',
    verified: true,
    notes: 'Vinculado a los proyectos de agricultura urbana de la I.E. Rafael Uribe Uribe y líderes comunitarios.',
  },
];

// Metros Cuadrados Adoptados en Medellín (Campaña Mi Metro Cuadrado)
let squareMeterPlots = [
  {
    id: 'plot-001',
    name: 'Jardín Frontal & Zona de Patios - I.E. Rafael Uribe Uribe',
    locationDescription: 'Carrera 87 # 78-45, Robledo, Medellín',
    zoneType: 'colegio_uribe',
    zoneLabel: 'I.E. Rafael Uribe Uribe',
    latitude: 6.2738,
    longitude: -75.5915,
    squareMeters: 12,
    adopterName: 'Estudiantes Grado 10°A - PRAE Uribe',
    adopterRole: 'Estudiantes I.E. Rafael Uribe Uribe',
    status: 'limpio_y_cuidado',
    lastCleanedDate: '2026-08-25T10:00:00.000Z',
    cleaningsCount: 8,
    photoBeforeUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80',
    photoAfterUrl: 'https://images.unsplash.com/photo-1528190336454-13cd56b45b5a?w=600&auto=format&fit=crop&q=80',
    coinsEarned: 320,
    verifiedByInstitution: true,
  },
  {
    id: 'plot-002',
    name: 'Acera & Corredor Verde Plazoleta Metro San Javier',
    locationDescription: 'Calle 44 San Juan con Cra 99, San Javier',
    zoneType: 'estacion_metro',
    zoneLabel: 'Estación Metro San Javier',
    latitude: 6.2524,
    longitude: -75.6185,
    squareMeters: 8,
    adopterName: 'Valentina Restrepo & Colectivo Juvenil',
    adopterRole: 'Guardiana Mi Metro Cuadrado Medellín',
    status: 'limpio_y_cuidado',
    lastCleanedDate: '2026-08-26T07:30:00.000Z',
    cleaningsCount: 5,
    photoBeforeUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=80',
    photoAfterUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&auto=format&fit=crop&q=80',
    coinsEarned: 240,
    verifiedByInstitution: true,
  },
  {
    id: 'plot-003',
    name: 'Parque Infantil y Zona Verde de Robledo Palenque',
    locationDescription: 'Calle 79 con Carrera 84, Robledo',
    zoneType: 'parque_barrial',
    zoneLabel: 'Parque Barrial Robledo',
    latitude: 6.2760,
    longitude: -75.5890,
    squareMeters: 15,
    adopterName: 'Comunidad Vecinal Robledo & I.E. Uribe',
    adopterRole: 'Junta de Acción Comunal',
    status: 'limpio_y_cuidado',
    lastCleanedDate: '2026-08-24T16:00:00.000Z',
    cleaningsCount: 6,
    photoBeforeUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600&auto=format&fit=crop&q=80',
    photoAfterUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80',
    coinsEarned: 410,
    verifiedByInstitution: true,
  },
];

// Catálogo de Recompensas de la Campaña Mi Metro Cuadrado & Alcaldía de Medellín
const metroRewards = [
  {
    id: 'rew-cívica-01',
    title: 'Recarga Cívica Metro de Medellín (2 Viajes)',
    subtitle: 'Pasajes para Metro, Tranvía, Metroplús o Metrocable',
    category: 'metro_transporte',
    categoryLabel: 'Metro de Medellín',
    coinsCost: 150,
    icon: '🚇',
    description: 'Bono digital válido para recarga de 2 pasajes en tu tarjeta Cívica personal en cualquier estación del Metro de Medellín.',
    sponsor: 'Metro de Medellín & Alcaldía',
    stock: 120,
    perks: ['Válido en toda la red metro', 'Sin fecha de caducidad', 'Apoya la movilidad limpia'],
    redemptionInstructions: 'Presenta el código QR en las taquillas de las estaciones San Antonio, San Javier, Estadio o Robledo.',
  },
  {
    id: 'rew-school-02',
    title: 'Kit Escolar Ecológico I.E. Rafael Uribe Uribe',
    subtitle: 'Cuadernos de caña de azúcar, termo reutilizable y lapiceros biodegradables',
    category: 'educacion_uribe',
    categoryLabel: 'I.E. Rafael Uribe Uribe',
    coinsCost: 180,
    icon: '🎒',
    description: 'Kit estudiantil institucional conmemorativo con el escudo oficial de la I.E. Rafael Uribe Uribe y elementos 100% amigables con el medio ambiente.',
    sponsor: 'I.E. Rafael Uribe Uribe - PRAE',
    stock: 65,
    perks: ['Cuadernos 100% fibra de bagazo de caña', 'Termo de aluminio libre de BPA', 'Lápiz con semillas para plantar'],
    redemptionInstructions: 'Reclama tu kit en la oficina de Coordinación / PRAE de la I.E. Rafael Uribe Uribe de Medellín.',
  },
  {
    id: 'rew-explora-03',
    title: 'Entrada 2x1 Parque Explora o Planetario de Medellín',
    subtitle: 'Acceso a salas interactivas de ciencia, acuario y biodiversidad',
    category: 'cultura_medellin',
    categoryLabel: 'Cultura & Ciencia Medellín',
    coinsCost: 220,
    icon: '🔬',
    description: 'Pase promocional para vivir una experiencia científica y ambiental en el Parque Explora o en el domo del Planetario de Medellín.',
    sponsor: 'Secretaría de Cultura & Parque Explora',
    stock: 45,
    perks: ['Entrada para 2 personas', 'Acceso al acuario de agua dulce', 'Talleres experimentales'],
    redemptionInstructions: 'Canjea en la taquilla principal del Parque Explora mostrando el código del bono generado.',
  },
  {
    id: 'rew-tree-04',
    title: 'Adopción de Plántula Nativa (Guayacán Amarillo / Casco de Vaca)',
    subtitle: 'Árbol nativo para siembra comunitaria en Medellín',
    category: 'ecologia_siembra',
    categoryLabel: 'Siembra & Enverdecimiento',
    coinsCost: 100,
    icon: '🌳',
    description: 'Plántula lista para plantar en tu jardín, frente de casa o en la jornada comunitaria de reforestación de la I.E. Rafael Uribe Uribe.',
    sponsor: 'Jardín Botánico de Medellín & Secretaría de Medio Ambiente',
    stock: 90,
    perks: ['Incluye abono orgánico y compost', 'Guía de siembra y riego', 'Placa conmemorativa con tu nombre'],
    redemptionInstructions: 'Recoge tu plántula en el vivero escolar de la I.E. Rafael Uribe o en el Punto Naranja Emvarias.',
  },
  {
    id: 'rew-cafeteria-05',
    title: 'Bono Refrigerio Saludable Cafetería Institucional',
    subtitle: 'Jugo natural de fruta fresca y snack saludable',
    category: 'educacion_uribe',
    categoryLabel: 'Bienestar Estudiantil',
    coinsCost: 90,
    icon: '🥪',
    description: 'Disfruta de un refrigerio saludable y nutritivo en la cafetería de la I.E. Rafael Uribe Uribe o en cafeterías aliadas.',
    sponsor: 'I.E. Rafael Uribe Uribe',
    stock: 150,
    perks: ['100% natural', 'Envases compostables', 'Opción vegetariana'],
    redemptionInstructions: 'Muestra el código en la cafetería escolar durante el descanso.',
  },
];


// -------------------------------------------------------------
// API ENDPOINTS
// -------------------------------------------------------------

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 2. Classify Waste with Computer Vision / Gemini API
app.post('/api/classify-waste', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', userPrompt = '' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'La imagen base64 es obligatoria.' });
    }

    // Extract exact MIME type and clean base64 data
    let finalMimeType = mimeType;
    if (imageBase64.startsWith('data:')) {
      const match = imageBase64.match(/^data:([^;]+);base64,/);
      if (match && match[1]) {
        finalMimeType = match[1];
      }
    }
    finalMimeType = (finalMimeType || 'image/jpeg').toLowerCase();
    if (finalMimeType === 'image/jpg') {
      finalMimeType = 'image/jpeg';
    }
    const cleanBase64 = imageBase64.includes(';base64,')
      ? imageBase64.split(';base64,')[1].trim()
      : imageBase64.trim();

    const ai = getGeminiClient();

    if (ai) {
      const systemInstruction = `
Eres un Ingeniero Ambiental experto en Visión Artificial, Economía Circular y Gestión Integral de Residuos Urbanos bajo el CÓDIGO OFICIAL NACIONAL DE COLORES DE COLOMBIA (Resolución 2184 de 2019) y la normativa de Medellín (Emvarias).

TU TAREA PRINCIPAL:
1. Analiza cuidadosamente la imagen e IDENTIFICA EL OBJETO O RESIDUO PRINCIPAL en primer plano.
2. Ignora las manos de las personas, mesas, pisos, fondos o paredes. Concéntrate en el residuo específico.
3. Si el usuario proporcionó una pista o descripción textual, úsala como contexto prioritario para desambiguar el material.
4. NUNCA asumas por defecto que el objeto es una botella de plástico. Identifica con exactitud lo que ves:
   - ¿Es una fruta, verdura, comida, cáscara, hueso, borra de café, poda? -> CANECA VERDE (Orgánicos aprovechables).
   - ¿Es una pila, batería, cable, cargador, bombillo, medicamento, aerosol tóxico, jeringa? -> CANECA ROJA / ESPECIAL (Peligrosos / RAEE / Posconsumo).
   - ¿Es servilleta usada, papel higiénico, cartón/papel grasoso o sucio (caja de pizza sucia), paquete metalizado de papas fritas/snacks, colilla, icopor con grasa, plástico sucio de un solo uso? -> CANECA NEGRA (No aprovechables / ordinarios).
   - ¿Es una botella plástica limpia, vaso desechable limpio, lata de gaseosa/cerveza de aluminio, lata de atún limpia, caja de cartón limpia, periódico, botella o frasco de vidrio limpio, Tetra Pak escurrido? -> CANECA BLANCA (Aprovechables limpios).

REGLAS DE CLASIFICACIÓN DE CANECAS:
- "blanca": CANECA BLANCA (Residuos Aprovechables Limpios y Secos: plástico, vidrio, metales, papel y cartón limpios).
- "verde": CANECA VERDE (Residuos Orgánicos Aprovechables: restos de comida, cáscaras de frutas/verduras, posos de café, podas, jardinería).
- "negra": CANECA NEGRA (Residuos No Aprovechables: papel higiénico, servilletas usadas, papeles y cartones contaminados con grasa/comida, envolturas metalizadas de snacks, colillas, icopor sucio).
- "roja_especial": CANECA ROJA / ESPECIAL (Residuos Peligrosos, Posconsumo y RAEE: pilas, baterías, bombillos ahorradores, cables, electrónicos, medicamentos vencidos, envases de agroquímicos/aerosoles).

Calcula con precisión técnica:
- wasteName: Nombre común preciso en español del residuo (ej. "Cáscara de Plátano", "Lata de Cerveza de Aluminio", "Batería AA Alcalina", "Servilleta de Papel Usada", "Envase de Yogur", "Caja de Pizza con Grasa").
- materialType: Tipo técnico de material (ej. "Materia orgánica vegetal", "Aluminio 100% reciclable", "Dióxido de manganeso y zinc", "Celulosa contaminada", "Polipropileno PP #5").
- recyclabilityScore: 0 a 100.
- recyclabilityLevel: "Alta", "Media", "Baja" o "No Reciclable".
- preparationSteps: 2 a 4 pasos lógicos y accionables.
- environmentalSavings: { co2SavedGrams, waterSavedLiters, energySavedWh }.
- ecoPoints: entre 10 y 50 según el impacto.
`;

      const prompt = `Analiza detalladamente esta fotografía. Identifica con exactitud el objeto u objeto residual en la imagen y clasifícalo en su caneca correspondiente según la Resolución 2184 de Colombia. ${userPrompt ? `Contexto o aclaración proporcionada por el usuario: "${userPrompt}"` : ''}`;

      const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
      let lastError: any = null;
      let response: any = null;

      for (const modelCandidate of modelsToTry) {
        try {
          response = await ai.models.generateContent({
            model: modelCandidate,
            contents: {
              parts: [
                {
                  inlineData: {
                    data: cleanBase64,
                    mimeType: finalMimeType,
                  },
                },
                {
                  text: prompt,
                },
              ],
            },
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  wasteName: { type: Type.STRING, description: 'Nombre descriptivo y exacto del residuo en español' },
                  materialType: { type: Type.STRING, description: 'Tipo específico de material' },
                  binType: {
                    type: Type.STRING,
                    description: 'Estrictamente: "blanca", "verde", "negra" o "roja_especial"',
                  },
                  binName: { type: Type.STRING, description: 'Nombre formal de la caneca' },
                  binColorHex: { type: Type.STRING, description: 'Código hex representativo (#FFFFFF, #16a34a, #1f2937, #dc2626)' },
                  binDescription: { type: Type.STRING, description: 'Por qué va en esta caneca' },
                  recyclabilityScore: { type: Type.NUMBER, description: 'Puntaje de 0 a 100 de reciclabilidad o aprovechamiento' },
                  recyclabilityLevel: { type: Type.STRING, description: 'Alta, Media, Baja o No Reciclable' },
                  preparationSteps: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '2 a 4 pasos de preparación'
                  },
                  practicalTips: { type: Type.STRING, description: 'Consejo práctico ciudadano' },
                  circularEconomyIdea: { type: Type.STRING, description: 'Idea de economía circular' },
                  hazardWarning: { type: Type.STRING, description: 'Advertencia si aplica' },
                  environmentalSavings: {
                    type: Type.OBJECT,
                    properties: {
                      co2SavedGrams: { type: Type.NUMBER },
                      waterSavedLiters: { type: Type.NUMBER },
                      energySavedWh: { type: Type.NUMBER }
                    },
                    required: ['co2SavedGrams', 'waterSavedLiters', 'energySavedWh']
                  },
                  ecoPoints: { type: Type.NUMBER },
                  confidenceScore: { type: Type.NUMBER }
                },
                required: [
                  'wasteName',
                  'materialType',
                  'binType',
                  'binName',
                  'binColorHex',
                  'binDescription',
                  'recyclabilityScore',
                  'recyclabilityLevel',
                  'preparationSteps',
                  'practicalTips',
                  'environmentalSavings',
                  'ecoPoints',
                  'confidenceScore'
                ],
              },
            },
          });

          if (response && response.text) {
            break;
          }
        } catch (modelErr: any) {
          console.warn(`Intento con modelo ${modelCandidate} falló:`, modelErr.message);
          lastError = modelErr;
          // Small pause before trying next candidate
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }

      if (!response || !response.text) {
        throw lastError || new Error('No se obtuvo respuesta del servicio de visión artificial.');
      }

      let responseText = response.text.trim();
      if (responseText.startsWith('```json')) {
        responseText = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (responseText.startsWith('```')) {
        responseText = responseText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsedData = JSON.parse(responseText);
      parsedData.detectedAt = new Date().toISOString();
      return res.json({ success: true, data: parsedData, source: 'gemini-vision' });
    } else {
      return res.status(500).json({
        error: 'El servicio de IA no está configurado (falta GEMINI_API_KEY).',
      });
    }
  } catch (error: any) {
    console.error('Error en /api/classify-waste:', error);
    return res.status(500).json({
      error: 'No se pudo clasificar el residuo en la imagen.',
      details: error.message || 'Error de procesamiento',
    });
  }
});

// 3. Citizen Reports Routes
app.get('/api/reports', (req, res) => {
  const { status, urgency, category } = req.query;
  let filtered = [...citizenReports];

  if (status && status !== 'todos') {
    filtered = filtered.filter((r) => r.status === status);
  }
  if (urgency && urgency !== 'todas') {
    filtered = filtered.filter((r) => r.urgency === urgency);
  }
  if (category && category !== 'todas') {
    filtered = filtered.filter((r) => r.category === category);
  }

  // Sort by createdAt descending
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ success: true, reports: filtered, count: filtered.length });
});

app.post('/api/reports', (req, res) => {
  try {
    const {
      photoUrl,
      latitude,
      longitude,
      address,
      reference,
      category,
      categoryLabel,
      urgency,
      notes,
      citizenName,
      citizenPhone,
    } = req.body;

    if (!latitude || !longitude || !category) {
      return res.status(400).json({ error: 'Faltan campos obligatorios para el reporte.' });
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newReport = {
      id: `rep-${Date.now()}`,
      ticketCode: `REP-2026-${randomNum}`,
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80',
      latitude: Number(latitude),
      longitude: Number(longitude),
      address: address || 'Ubicación geolocalizada por GPS',
      reference: reference || '',
      category,
      categoryLabel: categoryLabel || 'Reporte de Basura en Vía Pública',
      urgency: urgency || 'media',
      status: 'pendiente',
      notes: notes || '',
      citizenName: citizenName || 'Ciudadano Anónimo',
      citizenPhone: citizenPhone || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      upvotes: 1,
    };

    citizenReports.unshift(newReport);

    res.status(201).json({
      success: true,
      message: 'Reporte registrado exitosamente. Se ha generado tu ticket de seguimiento.',
      report: newReport,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al registrar el reporte', details: err.message });
  }
});

app.patch('/api/reports/:id', (req, res) => {
  const { id } = req.params;
  const { status, resolutionNote, resolutionPhotoUrl, upvote } = req.body;

  const reportIndex = citizenReports.findIndex((r) => r.id === id);
  if (reportIndex === -1) {
    return res.status(404).json({ error: 'Reporte no encontrado' });
  }

  const current = citizenReports[reportIndex];

  if (upvote) {
    current.upvotes = (current.upvotes || 0) + 1;
    current.updatedAt = new Date().toISOString();
    return res.json({ success: true, report: current });
  }

  if (status) {
    current.status = status;
    if (status === 'recolectado') {
      current.resolvedAt = new Date().toISOString();
    }
  }

  if (resolutionNote) {
    current.resolutionNote = resolutionNote;
  }
  if (resolutionPhotoUrl) {
    current.resolutionPhotoUrl = resolutionPhotoUrl;
  }

  current.updatedAt = new Date().toISOString();
  citizenReports[reportIndex] = current;

  res.json({ success: true, message: 'Reporte actualizado', report: current });
});

// 4. Public Bins Routes
app.get('/api/bins', (req, res) => {
  res.json({ success: true, bins: publicBins, count: publicBins.length });
});

app.post('/api/bins', (req, res) => {
  try {
    const { type, typeLabel, latitude, longitude, address, condition, photoUrl, reportedBy, notes } = req.body;

    if (!latitude || !longitude || !type) {
      return res.status(400).json({ error: 'Coordenadas y tipo de caneca requeridos.' });
    }

    const newBin = {
      id: `bin-${Date.now()}`,
      type,
      typeLabel: typeLabel || 'Caneca Pública Comunitaria',
      latitude: Number(latitude),
      longitude: Number(longitude),
      address: address || 'Ubicación GPS registrada',
      condition: condition || 'bueno',
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1528190336454-13cd56b45b5a?w=600&auto=format&fit=crop&q=80',
      reportedBy: reportedBy || 'Ciudadano Consciente',
      confirmationsCount: 1,
      registeredAt: new Date().toISOString(),
      notes: notes || '',
      hasCapacity: true,
    };

    publicBins.push(newBin);

    res.status(201).json({
      success: true,
      message: 'Caneca registrada con éxito en la red comunitaria.',
      bin: newBin,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al registrar la caneca', details: err.message });
  }
});

app.post('/api/bins/:id/confirm', (req, res) => {
  const { id } = req.params;
  const bin = publicBins.find((b) => b.id === id);
  if (!bin) {
    return res.status(404).json({ error: 'Caneca no encontrada' });
  }
  bin.confirmationsCount += 1;
  res.json({ success: true, confirmationsCount: bin.confirmationsCount });
});

// 5. Recycling Centers Route
app.get('/api/centers', (req, res) => {
  const { material } = req.query;
  let list = [...recycleCenters];

  if (material && material !== 'todos') {
    list = list.filter((c) =>
      c.acceptedMaterials.some((m) => m.toLowerCase().includes((material as string).toLowerCase()))
    );
  }

  res.json({ success: true, centers: list, count: list.length });
});

// 6. Campaña Mi Metro Cuadrado Plots Routes
app.get('/api/metro-cuadrado/plots', (req, res) => {
  res.json({ success: true, plots: squareMeterPlots, count: squareMeterPlots.length });
});

app.post('/api/metro-cuadrado/plots', (req, res) => {
  try {
    const {
      name,
      locationDescription,
      zoneType,
      zoneLabel,
      squareMeters,
      adopterName,
      adopterRole,
      photoBeforeUrl,
      latitude,
      longitude,
    } = req.body;

    if (!name || !locationDescription) {
      return res.status(400).json({ error: 'Nombre y ubicación del metro cuadrado son obligatorios.' });
    }

    const newPlot = {
      id: `plot-${Date.now()}`,
      name,
      locationDescription,
      zoneType: zoneType || 'colegio_uribe',
      zoneLabel: zoneLabel || 'I.E. Rafael Uribe Uribe',
      latitude: latitude ? Number(latitude) : 6.2738,
      longitude: longitude ? Number(longitude) : -75.5915,
      squareMeters: Number(squareMeters) || 1,
      adopterName: adopterName || 'Estudiante I.E. Rafael Uribe Uribe',
      adopterRole: adopterRole || 'Guardián Ambiental Medellín',
      status: 'limpio_y_cuidado',
      lastCleanedDate: new Date().toISOString(),
      cleaningsCount: 1,
      photoBeforeUrl: photoBeforeUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80',
      photoAfterUrl: photoBeforeUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80',
      coinsEarned: 100,
      verifiedByInstitution: true,
    };

    squareMeterPlots.unshift(newPlot);

    res.status(201).json({
      success: true,
      message: '¡Metro Cuadrado adoptado con éxito! Se han acreditado +100 EcoMonedas.',
      plot: newPlot,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al registrar metro cuadrado', details: err.message });
  }
});

app.post('/api/metro-cuadrado/plots/:id/clean', (req, res) => {
  const { id } = req.params;
  const plot = squareMeterPlots.find((p) => p.id === id);
  if (!plot) {
    return res.status(404).json({ error: 'Metro cuadrado no encontrado.' });
  }

  plot.cleaningsCount += 1;
  plot.coinsEarned += 40;
  plot.lastCleanedDate = new Date().toISOString();
  plot.status = 'limpio_y_cuidado';

  res.json({
    success: true,
    message: '¡Mantenimiento de metro cuadrado registrado! +40 EcoMonedas ganadas.',
    plot,
  });
});

// 7. Rewards Catalog & Redemption Routes
app.get('/api/rewards', (req, res) => {
  res.json({ success: true, rewards: metroRewards, count: metroRewards.length });
});

app.post('/api/rewards/redeem', (req, res) => {
  try {
    const { rewardId, userCoins } = req.body;
    const reward = metroRewards.find((r) => r.id === rewardId);
    if (!reward) {
      return res.status(404).json({ error: 'Recompensa no encontrada.' });
    }

    if (userCoins < reward.coinsCost) {
      return res.status(400).json({ error: 'Saldo insuficiente de EcoMonedas.' });
    }

    if (reward.stock <= 0) {
      return res.status(400).json({ error: 'Recompensa agotada temporalmente.' });
    }

    reward.stock -= 1;
    const randomCode = `MED-${reward.category.slice(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

    res.json({
      success: true,
      message: '¡Recompensa canjeada con éxito!',
      voucher: {
        rewardId: reward.id,
        title: reward.title,
        coinsSpent: reward.coinsCost,
        redeemedAt: new Date().toISOString(),
        redemptionCode: randomCode,
        sponsor: reward.sponsor,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al procesar el canje', details: err.message });
  }
});

// 8. Platform Global Stats Route
app.get('/api/stats', (req, res) => {
  const resolved = citizenReports.filter((r) => r.status === 'recolectado').length;
  const totalMeters = squareMeterPlots.reduce((acc, p) => acc + (p.squareMeters || 1), 4850);
  res.json({
    success: true,
    stats: {
      totalScans: 14820,
      totalReports: citizenReports.length + 312,
      resolvedReports: resolved + 284,
      totalBins: publicBins.length + 84,
      totalCenters: recycleCenters.length + 42,
      totalSquareMetersAdopted: totalMeters,
      co2SavedKg: 1845.6,
      communityMembers: 3290,
      totalCoinsAwarded: 48950,
    },
  });
});

// -------------------------------------------------------------
// VITE MIDDLEWARE & STATIC SERVING
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EcoScan Backend Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
