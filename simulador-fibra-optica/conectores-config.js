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
  }
]

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
  cameraNear: 0.01,
  cameraFar: 100,
  cameraFOV: 70
}

// Escala de modelos 3D
export const MODEL_SCALES = {
  building: { x: 1.8, y: 1.8, z: 1.8 },
  table: { x: 2.2, y: 2.2, z: 2.2 },
  cableFibra: { x: 0.018, y: 0.018, z: 0.018 },
  cable: { x: 0.05, y: 0.05, z: 0.05 }
}
// Rutas de modelos GLB
export const MODEL_PATHS = {
  building: '/Modelos GLB/old_city_building.glb',
  table: '/Modelos GLB/metal_table_asset.glb',
  cableFibra: '/Modelos GLB/custom_5g_fiber_cable.glb',
  panelPared: '/Modelos GLB/panelPared.glb',
  hands: '/Modelos GLB/hand-arm.glb',
  cable: '/Modelos GLB/wirewire.glb'
}