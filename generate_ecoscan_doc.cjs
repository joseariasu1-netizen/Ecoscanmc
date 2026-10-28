const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  Header,
  Footer,
  PageNumber
} = require('docx');

async function generateDocx() {
  console.log('Generando documento Word EcoScan...');

  const emeraldColor = '059669';
  const darkTeal = '064e3b';
  const slateDark = '1e293b';
  const slateMuted = '475569';
  const lightGrayBg = 'f8fafc';
  const borderGray = 'cbd5e1';

  const cellBorder = {
    top: { style: BorderStyle.SINGLE, size: 4, color: borderGray },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: borderGray },
    left: { style: BorderStyle.SINGLE, size: 4, color: borderGray },
    right: { style: BorderStyle.SINGLE, size: 4, color: borderGray },
  };

  const createHeading1 = (text) => new Paragraph({
    text: text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 180 },
    run: {
      color: darkTeal,
      bold: true,
      size: 32, // 16pt
      font: 'Arial',
    },
  });

  const createHeading2 = (text) => new Paragraph({
    text: text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 120 },
    run: {
      color: emeraldColor,
      bold: true,
      size: 26, // 13pt
      font: 'Arial',
    },
  });

  const createHeading3 = (text) => new Paragraph({
    text: text,
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 80 },
    run: {
      color: slateDark,
      bold: true,
      size: 22, // 11pt
      font: 'Arial',
    },
  });

  const createPara = (text, spacingAfter = 140) => new Paragraph({
    spacing: { after: spacingAfter, line: 276 },
    children: [
      new TextRun({
        text: text,
        font: 'Arial',
        size: 22, // 11pt
        color: slateDark,
      }),
    ],
  });

  const createBullet = (boldTitle, content) => new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 100, line: 260 },
    children: [
      new TextRun({
        text: boldTitle + ': ',
        bold: true,
        font: 'Arial',
        size: 22,
        color: slateDark,
      }),
      new TextRun({
        text: content,
        font: 'Arial',
        size: 22,
        color: slateDark,
      }),
    ],
  });

  const doc = new Document({
    creator: 'EcoScan Medellín Team',
    title: 'Proyecto EcoScan Medellín: Inteligencia Artificial y la Campaña «Mi Metro Cuadrado»',
    description: 'Documento Técnico y Metodológico Completo del Proyecto EcoScan',
    styles: {
      default: {
        document: {
          run: {
            font: 'Arial',
            size: 22,
            color: slateDark,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'EcoScan Medellín: Inteligencia Artificial y la Campaña «Mi Metro Cuadrado»',
                    size: 16,
                    color: slateMuted,
                    font: 'Arial',
                    italics: true,
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'Página ',
                    size: 16,
                    color: slateMuted,
                    font: 'Arial',
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 16,
                    color: slateMuted,
                    font: 'Arial',
                  }),
                  new TextRun({
                    text: ' de ',
                    size: 16,
                    color: slateMuted,
                    font: 'Arial',
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 16,
                    color: slateMuted,
                    font: 'Arial',
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // PORTADA
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 800, after: 120 },
            children: [
              new TextRun({
                text: 'MEDELLÍN CLIMATE WEEK 2026 – BIODIVERSITY',
                font: 'Arial',
                size: 20,
                bold: true,
                color: emeraldColor,
                tracking: 40,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: 'PROYECTO DE INVESTIGACIÓN, INNOVACIÓN CÍVICA Y TECNOLOGÍA AMBIENTAL',
                font: 'Arial',
                size: 18,
                color: slateMuted,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 200 },
            children: [
              new TextRun({
                text: 'EcoScan Medellín:\nInteligencia Artificial y la Campaña «Mi Metro Cuadrado»',
                font: 'Arial',
                size: 44, // 22pt
                bold: true,
                color: darkTeal,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
            children: [
              new TextRun({
                text: 'Solución basada en Visión Artificial y Gamificación Comunitaria para la Transformación de Hábitos de Separación en la Fuente y Recuperación del Espacio Público',
                font: 'Arial',
                size: 22,
                italics: true,
                color: slateMuted,
              }),
            ],
          }),

          // TABLA DE METADATOS DE PORTADA
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    borders: cellBorder,
                    shading: { fill: lightGrayBg, type: ShadingType.CLEAR },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: 'Integrantes del Equipo', bold: true, size: 20 })],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 70, type: WidthType.PERCENTAGE },
                    borders: cellBorder,
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'Antonella Osorio, Matías Aguirre y Juan José Maturana',
                            size: 20,
                            bold: true,
                            color: slateDark,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    borders: cellBorder,
                    shading: { fill: lightGrayBg, type: ShadingType.CLEAR },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: 'Institución / Comunidad Foco', bold: true, size: 20 })],
                      }),
                    ],
                  }),
                  new TableCell({
                    borders: cellBorder,
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'I.E. Rafael Uribe Uribe (Medellín, Antioquia)',
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    borders: cellBorder,
                    shading: { fill: lightGrayBg, type: ShadingType.CLEAR },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: 'Organizaciones Aliadas', bold: true, size: 20 })],
                      }),
                    ],
                  }),
                  new TableCell({
                    borders: cellBorder,
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'Fundación MAEX, Colegio San José de Las Vegas, Impact Hub Medellín, Socya, ACI Medellín, Alcaldía de Medellín (Distrito de Ciencia, Tecnología e Innovación)',
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    borders: cellBorder,
                    shading: { fill: lightGrayBg, type: ShadingType.CLEAR },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: 'Marco Normativo', bold: true, size: 20 })],
                      }),
                    ],
                  }),
                  new TableCell({
                    borders: cellBorder,
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'Resolución 2184 de 2019 (Código Nacional de Colores de Colombia) y Lineamientos Emvarias',
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    borders: cellBorder,
                    shading: { fill: lightGrayBg, type: ShadingType.CLEAR },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: 'ODS Vinculados', bold: true, size: 20 })],
                      }),
                    ],
                  }),
                  new TableCell({
                    borders: cellBorder,
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'ODS 11 (Ciudades y Comunidades Sostenibles), ODS 12 (Producción y Consumo Responsables), ODS 13 (Acción por el Clima)',
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({
            spacing: { before: 500, after: 100 },
            children: [new TextRun({ text: '' })],
            pageBreakBefore: true,
          }),

          // SECCIÓN 1: RESUMEN EJECUTIVO
          createHeading1('1. Resumen Ejecutivo'),
          createPara(
            'El proyecto «EcoScan Medellín: Inteligencia Artificial y la Campaña Mi Metro Cuadrado» es una iniciativa interdisciplinaria de innovación tecnológica y movilización ciudadana nacida en las aulas escolares de la I.E. Rafael Uribe Uribe. Su propósito fundamental es enfrentar la crisis de disposición final y aprovechamiento de residuos sólidos urbanos en el Valle de Aburrá, donde diariamente se generan más de 3.000 toneladas de residuos de las cuales menos del 20% son aprovechadas efectivamente.'
          ),
          createPara(
            'A través de una aplicación web progresiva (PWA) de alta velocidad que integra algoritmos de Visión Artificial basados en Inteligencia Artificial (Gemini Vision), el sistema permite a cualquier ciudadano fotografiar en tiempo real un residuo y recibir en menos de tres segundos la identificación exacta del material, el color normativo de la caneca según la Resolución 2184 de 2019 (blanca, verde, negra o ruta especial) y los pasos requeridos para su correcta entrega limpia y seca.'
          ),
          createPara(
            'Para trascender la teoría y superar la apatía, el proyecto se articula con la estrategia comunitaria «Mi Metro Cuadrado» y un sistema de gamificación que premia el reciclaje con EcoMonedas canjeables por beneficios ciudadanos reales (como pasajes del Metro de Medellín y visitas al Parque Explora). De este modo, EcoScan transforma la confusión ciudadana en orgullo cívico, dignifica la labor de los recicladores de oficio y previene la saturación del Relleno Sanitario La Pradera.'
          ),

          // SECCIÓN 2: PLANTEAMIENTO DEL PROBLEMA Y EL RETO
          createHeading1('2. Planteamiento del Problema: El Reto Ambiental'),
          createPara(
            'El Valle de Aburrá atraviesa una coyuntura ambiental crítica respecto a su metabolismo urbano y la gestión integral de residuos sólidos. Los elementos centrales que constituyen el problema son:'
          ),
          createBullet(
            'Volumen masivo y bajo aprovechamiento',
            'En el área metropolitana de Medellín se producen más de 3.000 toneladas de residuos cada día. A pesar de los esfuerzos institucionales, menos del 20% ingresa a cadenas formales de reciclaje y valorización, desaprovechando miles de toneladas de plástico, vidrio, cartón, metales y materia orgánica.'
          ),
          createBullet(
            'Confusión cognitiva generalizada en la ciudadanía',
            'La implementación del Código Nacional de Colores (Resolución 2184 de 2019) no ha permeado suficientemente las prácticas cotidianas. Los usuarios comúnmente dudan al clasificar envases de poliestireno (icopor), servilletas grasosas, cajas de pizza contaminadas, empaques metalizados de snacks o papel térmico. Esta confusión genera contaminación cruzada, invalidando lotes enteros de material reciclable.'
          ),
          createBullet(
            'Saturación del Relleno Sanitario La Pradera',
            'El vaso de disposición final Altair y las fases de contingencia en Donmatías se encuentran en niveles máximos de capacidad operativa. Enviar residuos potencialmente aprovechables al relleno acorta la vida útil del sistema y genera pasivos ambientales severos.'
          ),
          createBullet(
            'Impacto climático y proliferación de puntos críticos',
            'La descomposición anaeróbica de materia orgánica en rellenos sanitarios y botaderos a cielo abierto produce importantes emisiones de metano (CH4) y dióxido de carbono (CO2), incrementando la huella de carbono metropolitana. Asimismo, las esquinas barriales y espacios públicos de comunas como la Comuna 13 o la Comuna 7 sufren de acumulación indebida de basuras.'
          ),

          // SECCIÓN 3: PREGUNTA DE INDAGACIÓN Y JUSTIFICACIÓN
          createHeading1('3. Pregunta de Indagación y Justificación'),
          createPara('La investigación se formuló a partir del siguiente interrogante estructurador:'),
          new Paragraph({
            spacing: { before: 120, after: 180 },
            shading: { fill: lightGrayBg, type: ShadingType.CLEAR },
            borders: cellBorder,
            children: [
              new TextRun({
                text: '«¿Cómo puede la inteligencia artificial y la gamificación comunitaria incentivar la correcta separación en la fuente y la recuperación del espacio público en Medellín?»',
                font: 'Arial',
                size: 24,
                bold: true,
                color: darkTeal,
                italics: true,
              }),
            ],
          }),
          createPara(
            'Justificación: Los métodos clásicos de educación ambiental (folletos impresos, charlas magistrales obligatorias o campañas publicitarias estáticas) muestran rendimientos decrecientes y no acompañan al ciudadano en el momento exacto de la toma de decisión frente a la caneca. EcoScan interviene precisamente en ese «segundo crítico» mediante una herramienta de bolsillo, interactiva e intuitiva, combinando asistencia algorítmica con estímulos positivos tangibles.'
          ),

          // SECCIÓN 4: OBJETIVOS
          createHeading1('4. Objetivos del Proyecto'),
          createHeading2('4.1 Objetivo General'),
          createPara(
            'Desarrollar e implementar una solución integral basada en Inteligencia Artificial y gamificación comunitaria («EcoScan Medellín» y la campaña «Mi Metro Cuadrado») que oriente a la ciudadanía en la correcta separación en la fuente bajo la Resolución 2184 de 2019, recuperando el espacio público, fortaleciendo a los recicladores de oficio y reduciendo el tonelaje enviado al Relleno Sanitario La Pradera.'
          ),
          createHeading2('4.2 Objetivos Específicos'),
          createBullet(
            'OE1 (Tecnológico)',
            'Diseñar e integrar un motor de visión artificial multimodal que identifique con una certeza superior al 95% los residuos urbanos y dictamine el contenedor correspondiente (blanco, verde, negro o rojo/posconsumo).'
          ),
          createBullet(
            'OE2 (Comunitario)',
            'Activar la campaña cívica «Mi Metro Cuadrado» en la I.E. Rafael Uribe Uribe y su entorno comunal para empoderar a estudiantes y familias en el cuidado de su microentorno inmediato.'
          ),
          createBullet(
            'OE3 (Incentivos y Gamificación)',
            'Estructurar una economía ecológica basada en EcoMonedas/EcoPuntos que recompense las buenas prácticas ciudadanas con beneficios cívicos reales, como pasajes en el Sistema Metro y accesos culturales al Parque Explora.'
          ),
          createBullet(
            'OE4 (Veeduría y Datos)',
            'Habilitar un módulo georreferenciado de reporte de puntos críticos de basuras que alimente la toma de decisiones comunitarias y de las entidades de aseo (Emvarias).'
          ),
          createBullet(
            'OE5 (Impacto Climático)',
            'Cuantificar el ahorro ambiental directo en reducción de huella de carbono (g CO2), ahorro de agua (litros) y energía (Wh) generado por los hábitos de reciclaje de los usuarios.'
          ),

          // SECCIÓN 5: MARCO TEÓRICO Y NORMATIVO
          createHeading1('5. Marco Teórico, Conceptual y Normativo'),
          createHeading2('5.1 Marco Normativo Nacional y Local'),
          createBullet(
            'Resolución 2184 de 2019 (MinAmbiente)',
            'Establece el Código de Colores unificado en todo el territorio colombiano: CANECA BLANCA para residuos aprovechables limpios y secos (plástico, vidrio, metales, papel, cartón); CANECA VERDE para orgánicos aprovechables (restos de comida, podas, cáscaras); y CANECA NEGRA para no aprovechables (papel higiénico, servilletas, papeles contaminados, empaques metalizados).'
          ),
          createBullet(
            'Normatividad de Residuos Especiales y RAEE',
            'Resolución 1297 de 2010 y Ley 1672 de 2013 para la gestión de residuos de aparatos eléctricos y electrónicos, pilas, baterías y medicamentos vencidos a través de canales posconsumo y canecas rojas.'
          ),
          createBullet(
            'PGIRS Medellín (Plan de Gestión Integral de Residuos Sólidos)',
            'Instrumento de planeación municipal liderado por la Alcaldía de Medellín y ejecutado con Empresas Varias de Medellín (Emvarias).'
          ),
          createHeading2('5.2 Conceptos Clave'),
          createBullet(
            'Separación en la Fuente',
            'Clasificación inicial realizada por el generador (hogar, colegio, comercio) antes de que el residuo entre en contacto con contaminantes.'
          ),
          createBullet(
            'Economía Circular',
            'Modelo económico regenerativo enfocado en mantener el valor de los productos y materiales durante el mayor tiempo posible, minimizando residuos y extracciones vírgenes.'
          ),
          createBullet(
            'Reciclador de Oficio',
            'Actor fundamental de la cadena de valorización, reconocido por la jurisprudencia constitucional colombiana (Auto 275 de 2011) como sujeto de especial protección.'
          ),

          // SECCIÓN 6: METODOLOGÍA DETALLADA
          createHeading1('6. Metodología de Desarrollo y Ejecución'),
          createPara(
            'El proyecto adoptó un enfoque metodológico mixto que combina la Investigación-Acción Participativa (IAP) con la metodología de diseño e innovación tecnológica Design Thinking en cinco fases consecutivas:'
          ),
          createBullet(
            'Fase 1: Empatizar y Diagnosticar (La Ruta)',
            'Se llevaron a cabo jornadas de observación directa en las aulas y patios de la I.E. Rafael Uribe Uribe, junto con encuestas a 150 estudiantes y docentes. Se identificó que el 82% de los encuestados deseaba reciclar pero dudaba de la caneca adecuada para artículos cotidianos (cajas de jugo tetra pak, envases de yogur, servilletas). Esta evidencia orientó el desarrollo de una guía tecnológica instantánea.'
          ),
          createBullet(
            'Fase 2: Definición y Modelado Conceptual',
            'Se conceptualizó la arquitectura de la solución EcoScan integrada a la campaña «Mi Metro Cuadrado». Se determinó que la tecnología debía ser accesible vía navegador móvil sin descargas pesadas de tiendas de aplicaciones, garantizando equidad tecnológica para estudiantes de todos los estratos.'
          ),
          createBullet(
            'Fase 3: Idear y Prototipar la Tecnología (EcoScan PWA)',
            'Se construyó una Progressive Web App con React, TypeScript y Tailwind CSS, respaldada por un servidor Node.js/Express. Se configuró la API de Google Gemini (modelo gemini-3.1-flash-lite) con esquemas JSON estructurados para analizar imágenes en tiempo real y devolver diagnósticos normativos y consejos prácticos en menos de 3 segundos.'
          ),
          createBullet(
            'Fase 4: Campaña «Mi Metro Cuadrado» y Gamificación',
            'Se desplegó el sistema de recompensas donde cada residuo clasificado otorga entre 10 y 50 EcoPuntos/EcoMonedas. Los estudiantes registraron y apadrinaron microzonas escolares («su metro cuadrado»), manteniéndolas limpias y vigilando la correcta disposición comunitaria.'
          ),
          createBullet(
            'Fase 5: Evaluación y Medición de Impacto',
            'Se realizaron pruebas ciegas de usabilidad, validando la precisión del clasificador con muestras físicas de residuos habituales de la canasta escolar y familiar antioqueña.'
          ),

          // SECCIÓN 7: RESULTADOS ESPERADOS E INDICADORES
          createHeading1('7. Resultados Esperados y Métricas de Impacto'),
          createPara(
            'La implementación de EcoScan Medellín y la campaña «Mi Metro Cuadrado» proyecta los siguientes resultados medibles en la comunidad intervenida:'
          ),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    borders: cellBorder,
                    shading: { fill: lightGrayBg, type: ShadingType.CLEAR },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Dimensión', bold: true, size: 20 })] })],
                  }),
                  new TableCell({
                    width: { size: 45, type: WidthType.PERCENTAGE },
                    borders: cellBorder,
                    shading: { fill: lightGrayBg, type: ShadingType.CLEAR },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Resultado Esperado', bold: true, size: 20 })] })],
                  }),
                  new TableCell({
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    borders: cellBorder,
                    shading: { fill: lightGrayBg, type: ShadingType.CLEAR },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Indicador / Meta', bold: true, size: 20 })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    borders: cellBorder,
                    children: [new Paragraph({ children: [new TextRun({ text: 'Eficacia de IA', bold: true, size: 20 })] })],
                  }),
                  new TableCell({
                    borders: cellBorder,
                    children: [new Paragraph({ children: [new TextRun({ text: 'Clasificación precisa e instantánea de cualquier residuo fotografiado.', size: 20 })] })],
                  }),
                  new TableCell({
                    borders: cellBorder,
                    children: [new Paragraph({ children: [new TextRun({ text: '> 95% de precisión en tiempo de respuesta < 3 seg.', size: 20 })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    borders: cellBorder,
                    children: [new Paragraph({ children: [new TextRun({ text: 'Educación y Hábitos', bold: true, size: 20 })] })],
                  }),
                  new TableCell({
                    borders: cellBorder,
                    children: [new Paragraph({ children: [new TextRun({ text: 'Disminución drástica de errores y contaminación cruzada en canecas.', size: 20 })] })],
                  }),
                  new TableCell({
                    borders: cellBorder,
                    children: [new Paragraph({ children: [new TextRun({ text: 'Reducción > 70% en residuos mal dispuestos en la I.E.', size: 20 })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    borders: cellBorder,
                    children: [new Paragraph({ children: [new TextRun({ text: 'Aprovechamiento', bold: true, size: 20 })] })],
                  }),
                  new TableCell({
                    borders: cellBorder,
                    children: [new Paragraph({ children: [new TextRun({ text: 'Incremento de materiales limpios y secos entregados a recicladores.', size: 20 })] })],
                  }),
                  new TableCell({
                    borders: cellBorder,
                    children: [new Paragraph({ children: [new TextRun({ text: '+30% en volumen de material reciclable recuperado.', size: 20 })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    borders: cellBorder,
                    children: [new Paragraph({ children: [new TextRun({ text: 'Espacio Público', bold: true, size: 20 })] })],
                  }),
                  new TableCell({
                    borders: cellBorder,
                    children: [new Paragraph({ children: [new TextRun({ text: 'Adopción cívica activa de la campaña «Mi Metro Cuadrado».', size: 20 })] })],
                  }),
                  new TableCell({
                    borders: cellBorder,
                    children: [new Paragraph({ children: [new TextRun({ text: '> 500 estudiantes y vecinos comprometidos como líderes cívicos.', size: 20 })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    borders: cellBorder,
                    children: [new Paragraph({ children: [new TextRun({ text: 'Incentivos y Ciudad', bold: true, size: 20 })] })],
                  }),
                  new TableCell({
                    borders: cellBorder,
                    children: [new Paragraph({ children: [new TextRun({ text: 'Canje de EcoMonedas por viajes en Metro y visitas al Parque Explora.', size: 20 })] })],
                  }),
                  new TableCell({
                    borders: cellBorder,
                    children: [new Paragraph({ children: [new TextRun({ text: 'Articulación activa con programas de movilidad y cultura ambiental.', size: 20 })] })],
                  }),
                ],
              }),
            ],
          }),

          // SECCIÓN 8: APRENDIZAJES Y PROYECCIÓN
          createHeading1('8. Aprendizajes Significativos y Conclusiones'),
          createPara(
            'El desarrollo del proyecto generó valiosas reflexiones formativas, científicas y sociales en los integrantes del equipo:'
          ),
          createBullet(
            'El poder de la información en tiempo real',
            'Comprobar que más del 80% de los residuos aprovechables terminan en La Pradera no por maldad ni desinterés, sino por simple confusión ciudadana, demostró que la tecnología de bolsillo tiene un potencial transformador superior a la teoría abstracta.'
          ),
          createBullet(
            'La gamificación como motor cívico',
            'La combinación de reconocimiento instantáneo con estímulos reales (EcoMonedas por pasajes de Metro o entradas a Parque Explora) moviliza la voluntad ciudadana y crea hábitos duraderos en la juventud.'
          ),
          createBullet(
            'Co-creación y liderazgo desde el aula',
            'Aprender a investigar, programar y validar soluciones tecnológicas reales desde una institución educativa pública de Medellín demuestra que los estudiantes son agentes de cambio directo frente a la emergencia climática.'
          ),
          createBullet(
            'Dignificación del reciclador de oficio',
            'Separar bien en la fuente no es solo una acción ecológica; es un acto de justicia y solidaridad humana con quienes recorren a diario las calles de Medellín recuperando valor en la ciudad.'
          ),

          // SECCIÓN 9: REFERENCIAS Y ALIADOS
          createHeading1('9. Aliados Institucionales y Referencias'),
          createPara('El proyecto ha sido desarrollado y visibilizado gracias a la articulación con:'),
          createBullet('Fundación MAEX y Colegio San José de Las Vegas', 'Acompañamiento pedagógico y científico.'),
          createBullet('Medellín Climate Week – Biodiversity 2026', 'Espacio de presentación y divulgación metropolitana.'),
          createBullet('Impact Hub Medellín y Socya', 'Aceleración de impacto social y sostenibilidad circular.'),
          createBullet('ACI Medellín y Alcaldía de Medellín', 'Distrito de Ciencia, Tecnología e Innovación.'),
          createPara(
            'Referencias: Ministerio de Ambiente y Desarrollo Sostenible (Resolución 2184 de 2019); Empresas Varias de Medellín - Emvarias (Rutas y Puntos Limpios); Objetivos de Desarrollo Sostenible (PNUD ODS 11, 12, 13).'
          ),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.join(__dirname, 'public', 'Proyecto_EcoScan_Medellin_Completo.docx');
  fs.writeFileSync(outputPath, buffer);
  console.log('Documento creado exitosamente en:', outputPath);
  console.log('Tamaño del archivo:', (buffer.length / 1024).toFixed(1), 'KB');
}

generateDocx().catch((err) => {
  console.error('Error generando DOCX:', err);
  process.exit(1);
});
