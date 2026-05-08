import { loadBuilding } from './building.js'
import { loadTable } from './table.js'
import { loadCableFibra } from './cable-fibra.js'
import { loadHands } from './hands.js'
import { initCable, updateCable, checkHandNearCable, agarrarCable, soltarCable, mostrarCable } from './cable.js'
import { initPanelElectrico, checkHandNearPanel, swapPanelElectrico } from './panelElectrico.js'

// ═══════════════════════════════════════════════════════════════
// ORQUESTADOR CENTRAL DE MODELOS
// ═══════════════════════════════════════════════════════════════

export async function setupAllModels(scene, leftHandGroup, rightHandGroup, collisionObjects) {
  console.log('📦 Iniciando carga de modelos...')

  // Priorizar manos para mostrar feedback visual rápido al iniciar.
  await loadHands(scene, leftHandGroup, rightHandGroup)

  // Cargar resto de modelos GLB en paralelo
  await Promise.all([
    loadBuilding(scene, collisionObjects),
    loadTable(scene, collisionObjects),
    loadCableFibra(scene)
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
