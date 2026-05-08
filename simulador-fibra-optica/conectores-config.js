// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN CONECTORES - Datos y Constantes
// ═══════════════════════════════════════════════════════════════

// Array de los 8 pasos del simulador
export const STEPS = [
  {
    id: 0,
    title: 'Preparar el cable',
    desc: 'Retirar protección exterior',
    instruction: 'Retirar la cubierta exterior del cable drop',
    detail: 'Usando el pelacables, retirar 4 cm de cubierta exterior del cable FTTH (drop). Exponer el buffer de 900µm o el hilo de fibra con cubierta de 250µm. No dañar el kevlar.',
    tip: 'Siempre pelá en dirección contraria al cuerpo. El kevlar (fibra amarilla) podés cortarlo con tijera.',
    tool: 'pelacables',
    color: 0x00d4ff,
    feedbackOk: '¡Cubierta retirada correctamente! Se expusieron 4 cm de buffer sin daños.',
    feedbackErr: 'Cuidado: pelaste demasiado rápido y podrías haber dañado el buffer interno.'
  },
  {
    id: 1,
    title: 'Limpiar con alcohol',
    desc: 'Desengrase de la fibra',
    instruction: 'Limpiar la fibra con alcohol isopropílico 99%',
    detail: 'Humedecer una toallita sin pelusa con alcohol isopropílico al 99% y limpiar el tramo de fibra pelada con un movimiento en una sola dirección (no vaivén). Esperar 5 segundos a que seque.',
    tip: 'Nunca reutilices la misma sección de toallita. La suciedad (aceites, polvo) arruina el empalme.',
    tool: 'alcohol',
    color: 0x88eeff,
    feedbackOk: '¡Fibra limpia! Sin residuos ni grasas. Lista para el pelado fino.',
    feedbackErr: 'La fibra quedó con residuos. Un movimiento de vaivén redeposita la suciedad.'
  },
  {
    id: 2,
    title: 'Pelar el buffer',
    desc: 'Exponer la fibra desnuda 125µm',
    instruction: 'Pelar el buffer de 250µm para exponer la fibra desnuda',
    detail: 'Usar el pelador de precisión (Miller) calibrado para 250µm. Retirar exactamente 3 cm de buffer. La fibra desnuda debe ser transparente, sin marcas ni rallones. Diámetro: 125µm.',
    tip: 'Si la fibra aparece opaca o blancuzca, tiene micro-roturas. Descartala y volvé a pelar desde atrás.',
    tool: 'miller',
    color: 0xffffff,
    feedbackOk: 'Fibra desnuda de 125µm expuesta sin defectos. Transparente y uniforme.',
    feedbackErr: 'Se detectaron marcas en la fibra. El pelador puede estar desajustado o sucio.'
  },
  {
    id: 3,
    title: 'Limpiar de nuevo',
    desc: 'Segunda limpieza post-pelado',
    instruction: 'Segunda limpieza con alcohol sobre la fibra desnuda',
    detail: 'Repetir la limpieza con alcohol sobre la fibra desnuda de 125µm. Esta vez con mucho más cuidado: la fibra desnuda es extremadamente frágil. Un movimiento en una sola dirección.',
    tip: 'En este punto la fibra puede romperse con 500g de fuerza lateral. Tratala como si fuera un cabello de vidrio.',
    tool: 'alcohol',
    color: 0x88eeff,
    feedbackOk: '¡Excelente! Fibra desnuda limpia y lista para el clivado.',
    feedbackErr: 'Movimiento incorrecto. Sobre fibra desnuda siempre en una sola dirección.'
  },
  {
    id: 4,
    title: 'Clivar la fibra',
    desc: 'Corte perpendicular con clivador',
    instruction: 'Cortar la fibra con el clivador a 90°',
    detail: 'Colocar la fibra en el clivador a la marca de 1.5 cm (para conector SC). Cerrar la tapa suavemente, el clivador hace el corte automáticamente. El ángulo debe ser < 0.5° respecto a la perpendicular.',
    tip: 'Nunca soplés la fibra cortada. Los residuos de fibra de vidrio son invisibles y peligrosos. Depositá el fragmento en el contenedor de desechos.',
    tool: 'clivador',
    color: 0xffaa00,
    feedbackOk: '¡Corte perfecto! Cara plana a 0.2°. Apta para inserción en el conector.',
    feedbackErr: 'Corte oblicuo detectado (> 1°). Generará reflexión y pérdida de inserción. Repetir.'
  },
  {
    id: 5,
    title: 'Insertar en el conector',
    desc: 'Fibra dentro del ferrule SC/APC',
    instruction: 'Insertar la fibra desnuda en el conector SC/APC (verde)',
    detail: 'Alinear la fibra con el ferrule de zirconia del conector SC/APC. Insertar con movimiento recto y firme hasta sentir que toca el fondo. La fibra debe sobresalir levemente por la cara del ferrule.',
    tip: 'El conector SC/APC es VERDE (8° de ángulo). No confundir con SC/UPC que es AZUL (cara plana). ¡Son incompatibles!',
    tool: 'conector',
    color: 0x00cc55,
    feedbackOk: '¡Insertado! La fibra llegó al fondo del ferrule. Se ve sobresalir 0.1mm.',
    feedbackErr: 'La fibra no llegó al fondo. Reintentar con movimiento más firme y recto.'
  },
  {
    id: 6,
    title: 'Fijar el conector',
    desc: 'Cerrar y asegurar el cuerpo',
    instruction: 'Cerrar la pestaña de retención y deslizar el seguro del conector',
    detail: 'Cerrar el crimp del cuerpo del conector sobre el buffer/cubierta. Deslizar el seguro azul (boot) hasta que encaje. En conectores de campo con adhesivo, aplicar el activador y esperar 60 segundos.',
    tip: 'El crimp debe sujetar el cable, no la fibra desnuda. Si el cable se mueve al tirar suavemente, el crimp está mal posicionado.',
    tool: 'crimp',
    color: 0x4488ff,
    feedbackOk: 'Conector fijado correctamente. El cable no se mueve bajo tracción suave.',
    feedbackErr: 'El crimp quedó posicionado sobre la fibra desnuda. Rehacer.'
  },
  {
    id: 7,
    title: 'Inspeccionar la cara',
    desc: 'Video-inspector o microscopio 200x',
    instruction: 'Verificar la cara del ferrule con video-inspector',
    detail: 'Conectar el video-inspector al adaptador SC. La cara del ferrule debe verse sin: rayaduras en el núcleo (zona central 9µm), polvo, fracturas o chips. Evaluar según IEC 61300-3-35.',
    tip: 'Zona A (núcleo 0-25µm): CERO defectos tolerados. Zona B (25-120µm): mínimos. Si la cara está sucia, limpiar con lapicera limpiadora y re-inspeccionar.',
    tool: 'inspector',
    color: 0xff6b00,
    feedbackOk: '¡Cara aprobada! Zona A sin defectos. Pérdida de inserción estimada: < 0.3 dB.',
    feedbackErr: 'Rasguño en zona A del núcleo. Limpiar la cara con lapicera y re-inspeccionar antes de instalar.'
  }
]

// Rutas de modelos GLB
export const MODEL_PATHS = {
  building: '/Modelos GLB/old_city_building.glb',
  table: '/Modelos GLB/metal_table_asset.glb',
  cableFibra: '/Modelos GLB/custom_5g_fiber_cable.glb',
  panelPared: '/Modelos GLB/panelPared.glb',
  hands: '/Modelos GLB/hand-arm.glb'
}

// Configuración de física
export const PHYSICS = {
  gravity: -0.02,
  jumpStrength: 0.35,
  playerRadius: 0.4,
  playerHeight: 1.6,
  playerSpeed: 0.15,
  interactDistance: 0.35,
  handSpeed: 0.012
}

// Configuración de iluminación
export const LIGHTING = {
  ambientLight: { color: 0xffffff, intensity: 0.5 },
  sunLight: {
    color: 0xfffaeb,
    intensity: 2.5,
    position: { x: 20, y: 30, z: 15 },
    shadowMapSize: 4096,
    shadowRadius: 2
  },
  skyLight: { skyColor: 0x87ceeb, groundColor: 0xd4d4d4, intensity: 0.8 },
  fillLight: { color: 0xffffff, intensity: 0.4, distance: 15, position: { x: -5, y: 3, z: 5 } },
  accentLight: { color: 0xff6b00, intensity: 0.0, distance: 6 }
}

// Configuración de escena
export const SCENE_CONFIG = {
  fogColor: 0xb8d4e8,
  fogNear: 30,
  fogFar: 100,
  backgroundColor: 0x87ceeb,
  cameraNear: 0.05,
  cameraFar: 100,
  cameraFOV: 70
}

// Escala de modelos 3D
export const MODEL_SCALES = {
  building: { x: 1.8, y: 1.8, z: 1.8 },
  table: { x: 2.2, y: 2.2, z: 2.2 },
  cableFibra: { x: 0.018, y: 0.018, z: 0.018 }
}

// Colores de herramientas
export const TOOL_COLORS = {
  pelacables: 0x00d4ff,
  alcohol: 0x88eeff,
  miller: 0xdddddd,
  clivador: 0xffaa00,
  conector: 0x00cc55,
  crimp: 0x4488ff,
  inspector: 0xff6b00
}
