import { loadBuilding } from './building.js'
import { loadTable } from './table.js'
import { loadCableFibra } from './cable-fibra.js'
import { loadPanelPared } from './panel-pared.js'
import { loadHands } from './hands.js'
import { initCable, updateCable, checkHandNearCable, agarrarCable, soltarCable, mostrarCable } from './cable.js'
import { initPanelElectrico, checkHandNearPanel, swapPanelElectrico } from './panelElectrico.js'

// ═══════════════════════════════════════════════════════════════
// ORQUESTADOR CENTRAL DE MODELOS
// ═══════════════════════════════════════════════════════════════

export async function setupAllModels(scene, leftHandGroup, rightHandGroup, collisionObjects) {
  console.log('📦 Iniciando carga de modelos...')

  // Cargar modelos GLB en paralelo
  await Promise.all([
    loadBuilding(scene, collisionObjects),
    loadTable(scene, collisionObjects),
    loadCableFibra(scene),
    loadPanelPared(scene),
    loadHands(scene, leftHandGroup, rightHandGroup)
  ])

  // Inicializar módulos interactivos
  await initCable(scene, rightHandGroup)
  await initPanelElectrico(scene)

  console.log('✓ Todos los modelos cargados correctamente')
  
  return {
    updateCable,
    checkHandNearCable,
    agarrarCable,
    soltarCable,
    mostrarCable,
    checkHandNearPanel,
    swapPanelElectrico
  }
}
