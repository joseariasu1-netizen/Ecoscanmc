import { WasteAnalysisResult } from '../types';

export interface SamplePreset {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  thumbnail: string;
  analysis: WasteAnalysisResult;
}

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'preset-pet',
    name: 'Botella de Plástico (PET)',
    category: 'Aprovechable Limpio',
    thumbnail: '🧴',
    imageUrl: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?w=600&auto=format&fit=crop&q=80',
    analysis: {
      wasteName: 'Botella Plástica de Bebida (PET #1)',
      materialType: 'Polietileno Tereftalato (PET)',
      binType: 'blanca',
      binName: 'Caneca Blanca (Aprovechables Limpios)',
      binColorHex: '#ffffff',
      binDescription: 'Residuo aprovechable de alto valor para reciclaje. Debe estar limpio, sin líquidos y preferiblemente aplastado.',
      recyclabilityScore: 98,
      recyclabilityLevel: 'Alta',
      preparationSteps: [
        'Vaciar totalmente el contenido de líquido.',
        'Enjuagar brevemente para evitar malos olores o proliferación de hongos.',
        'Aplastar la botella de arriba hacia abajo para reducir su volumen.',
        'Volver a enroscar su tapa (también es reciclable PEAD/PP).'
      ],
      practicalTips: 'Conserva la etiqueta o retírala si es termoencogible. Entrégala en bolsa blanca a los recicladores de oficio de tu sector.',
      circularEconomyIdea: 'Se transforma en pellets de resina rPET para confeccionar camisetas deportivas, hilos o nuevas botellas grado alimentario.',
      environmentalSavings: {
        co2SavedGrams: 145,
        waterSavedLiters: 4.2,
        energySavedWh: 110,
      },
      ecoPoints: 35,
      confidenceScore: 0.98,
    },
  },
  {
    id: 'preset-organico',
    name: 'Cáscaras y Restos de Fruta',
    category: 'Orgánico Aprovechable',
    thumbnail: '🍏',
    imageUrl: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=600&auto=format&fit=crop&q=80',
    analysis: {
      wasteName: 'Cáscaras de Plátano y Manzana (Materia Orgánica)',
      materialType: 'Biomasa Vegetal Biodegradable',
      binType: 'verde',
      binName: 'Caneca Verde (Orgánicos Aprovechables)',
      binColorHex: '#16a34a',
      binDescription: 'Materia orgánica biodegradable apta para compostaje municipal o domiciliario y generación de abono natural.',
      recyclabilityScore: 92,
      recyclabilityLevel: 'Alta',
      preparationSteps: [
        'Separar de empaques plásticos, grapas o etiquetas adhesivas de frutas.',
        'Escurrir exceso de agua o líquidos antes de almacenar.',
        'Almacenar en un recipiente con tapa o bolsa compostable/verde.',
        'Llevar a la compostera comunitaria o caneca verde de recolección.'
      ],
      practicalTips: 'No mezclar con huesos grandes de animales, aceites usados ni heces de mascotas.',
      circularEconomyIdea: 'Tras 60 a 90 días en proceso de compostaje termofílico, se convierte en abono y humus fértil para agricultura urbana.',
      environmentalSavings: {
        co2SavedGrams: 280,
        waterSavedLiters: 1.5,
        energySavedWh: 40,
      },
      ecoPoints: 30,
      confidenceScore: 0.96,
    },
  },
  {
    id: 'preset-pizza',
    name: 'Caja de Pizza Grasosa',
    category: 'No Aprovechable',
    thumbnail: '🍕',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
    analysis: {
      wasteName: 'Caja de Cartón Contaminada con Grasa y Queso',
      materialType: 'Cartón Corrugado Impregnado con Grasa',
      binType: 'negra',
      binName: 'Caneca Negra (No Aprovechables / Ordinarios)',
      binColorHex: '#1f2937',
      binDescription: 'Las fibras de cartón impregnadas con aceite o restos orgánicos no pueden ser procesadas en los molinos de pulpa de papel.',
      recyclabilityScore: 15,
      recyclabilityLevel: 'No Reciclable',
      preparationSteps: [
        'Corta o separa la tapa superior limpia si no tiene grasa (esta parte SÍ va a la caneca blanca).',
        'La base grasosa con queso o salsa debe ir directamente a la caneca negra.',
        'Dóblala para que no ocupe espacio excesivo en la bolsa negra.'
      ],
      practicalTips: 'La grasa impide la separación hidromecánica de las fibras celulósicas. Recuerda: solo cartón limpio y seco en la caneca blanca.',
      circularEconomyIdea: 'Si se troza en pedacitos muy pequeños sin tintas tóxicas, puede usarse como fuente de carbono en lombricultura industrial.',
      environmentalSavings: {
        co2SavedGrams: 20,
        waterSavedLiters: 0,
        energySavedWh: 10,
      },
      ecoPoints: 15,
      confidenceScore: 0.94,
    },
  },
  {
    id: 'preset-vidrio',
    name: 'Botella de Vidrio Limpia',
    category: 'Aprovechable Limpio',
    thumbnail: '🍾',
    imageUrl: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?w=600&auto=format&fit=crop&q=80',
    analysis: {
      wasteName: 'Botella de Vidrio para Bebida',
      materialType: 'Vidrio Sílico-Sódico-Cálcico',
      binType: 'blanca',
      binName: 'Caneca Blanca (Aprovechables Limpios)',
      binColorHex: '#ffffff',
      binDescription: 'El vidrio es 100% e infinitamente reciclable sin perder ninguna de sus propiedades mecánicas ni pureza.',
      recyclabilityScore: 100,
      recyclabilityLevel: 'Alta',
      preparationSteps: [
        'Vaciar todo el contenido de bebida.',
        'Enjuagar y escurrir.',
        'Retirar la chapa o tapa metálica (la chapa también va a la blanca, pero separada).',
        'Depositar con cuidado en la caneca blanca sin romperla.'
      ],
      practicalTips: 'No mezclar con espejos, cerámica, bombillos ni vidrios planos de ventanas, ya que tienen diferente punto de fusión.',
      circularEconomyIdea: 'Se funde a 1.500°C para generar nuevas botellas idénticas ahorrando un 30% de energía frente al uso de arena de sílice virgen.',
      environmentalSavings: {
        co2SavedGrams: 310,
        waterSavedLiters: 12.0,
        energySavedWh: 250,
      },
      ecoPoints: 40,
      confidenceScore: 0.99,
    },
  },
  {
    id: 'preset-pila',
    name: 'Pilas Alcalinas / Baterías',
    category: 'Residuo Peligroso / Posconsumo',
    thumbnail: '🔋',
    imageUrl: 'https://images.unsplash.com/photo-1619725002198-6a689b72f41d?w=600&auto=format&fit=crop&q=80',
    analysis: {
      wasteName: 'Baterías Alcalinas AA / Litio',
      materialType: 'Químico Electrolítico / Metales Pesados (Zinc, Manganeso)',
      binType: 'roja_especial',
      binName: 'Caneca Roja / Contenedor Posconsumo Especial',
      binColorHex: '#dc2626',
      binDescription: 'Residuo peligroso y tóxico. NUNCA debe arrojarse a la basura común ni enterrarse, pues contamina miles de litros de agua subterránea.',
      recyclabilityScore: 75,
      recyclabilityLevel: 'Media',
      preparationSteps: [
        'Colocar cinta adhesiva transparente en los polos (+) y (-) para evitar cortocircuitos.',
        'Almacenar en un frasco plástico seco fuera del alcance de niños y mascotas.',
        'No golpear, calentar ni desarmar.',
        'Llevar a un contenedor posconsumo oficial "Pilas con el Ambiente" o punto de acopio RAEE.'
      ],
      practicalTips: 'Encuentra el contenedor rojo en centros comerciales, supermercados y estaciones de servicio.',
      circularEconomyIdea: 'Mediante procesos pirometalúrgicos e hidrometalúrgicos se recupera zinc, manganeso y acero para aleaciones industriales.',
      environmentalSavings: {
        co2SavedGrams: 450,
        waterSavedLiters: 175.0,
        energySavedWh: 400,
      },
      ecoPoints: 50,
      confidenceScore: 0.97,
      hazardWarning: 'Peligro de lixiviación de metales pesados altamente nocivos para la salud y el medio ambiente.',
    },
  },
  {
    id: 'preset-papas',
    name: 'Paquete de Papas Metalizado',
    category: 'No Aprovechable',
    thumbnail: '🥔',
    imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600&auto=format&fit=crop&q=80',
    analysis: {
      wasteName: 'Empaque Flexible Multicapa Metalizado (BOPP/Aluminio)',
      materialType: 'Polipropileno Biorientado Metalizado (Multicapa)',
      binType: 'negra',
      binName: 'Caneca Negra (No Aprovechables / Ordinarios)',
      binColorHex: '#1f2937',
      binDescription: 'Al combinar capas microscópicas de polímero y vapor de aluminio adheridas, la separación mecánica es inviable en plantas estándar.',
      recyclabilityScore: 20,
      recyclabilityLevel: 'Baja',
      preparationSteps: [
        'Consumir la totalidad del producto y sacudir migas de sal.',
        'Compactar enrollándolo o metiéndolo dentro de una "Botella de Amor" para madera plástica si existe ese programa en tu ciudad.',
        'De lo contrario, depositar en caneca negra.'
      ],
      practicalTips: 'Si tienes un proyecto de Botellas de Amor (ecoladrillos), puedes embutirlo bien seco junto a otros plásticos flexibles.',
      circularEconomyIdea: 'Triturado y termo-prensado con otros plásticos sirve para fabricar postes, parques infantiles y madera sintética resistente.',
      environmentalSavings: {
        co2SavedGrams: 35,
        waterSavedLiters: 0.5,
        energySavedWh: 15,
      },
      ecoPoints: 20,
      confidenceScore: 0.95,
    },
  },
];
