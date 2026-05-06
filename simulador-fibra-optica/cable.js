import * as THREE from 'three'

// ════════════════════════════════════════════════
//  CONFIGURACIÓN — ajustá estos valores
// ════════════════════════════════════════════════

// Posición donde sobresale el cable del panel
const CABLE_POS = new THREE.Vector3(-3.56, 33.0, 1.5)

// Distancia máxima de la mano para agarrar
const GRAB_DIST = 0.8

// ════════════════════════════════════════════════
//  ESTADO INTERNO
// ════════════════════════════════════════════════
let cableCorto    = null
let cableLargo    = null
let cableAgarrado = false
let cableSoltado  = false
let handGroupRef  = null
let sceneRef      = null

export let handNearCable = false

// ════════════════════════════════════════════════
//  MATERIALES
// ════════════════════════════════════════════════
const matCuerpo = new THREE.MeshStandardMaterial({
  color: 0x111111,
  roughness: 0.8,
  metalness: 0.1
})

const matPunta = new THREE.MeshStandardMaterial({
  color: 0x222222,
  roughness: 0.3,
  metalness: 0.8,
  emissive: new THREE.Color(0x00aaff),
  emissiveIntensity: 0.5
})

// ════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════
export function initCable(scene, rightHandGroup) {
  sceneRef     = scene
  handGroupRef = rightHandGroup

  const group = new THREE.Group()

  // Cuerpo del cable corto
  const cuerpo = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.018, 0.25, 12),
    matCuerpo
  )
  cuerpo.rotation.x = Math.PI / 2
  cuerpo.position.set(0, 0, 0.12)
  group.add(cuerpo)

  // Manga de goma
  const manga = new THREE.Mesh(
    new THREE.CylinderGeometry(0.026, 0.022, 0.06, 12),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.95 })
  )
  manga.rotation.x = Math.PI / 2
  manga.position.set(0, 0, -0.02)
  group.add(manga)

  // Conector en la punta
  const conector = new THREE.Mesh(
    new THREE.CylinderGeometry(0.028, 0.028, 0.07, 12),
    matPunta
  )
  conector.rotation.x = Math.PI / 2
  conector.position.set(0, 0, 0.28)
  group.add(conector)

  // Anillo decorativo
  const anillo = new THREE.Mesh(
    new THREE.TorusGeometry(0.028, 0.005, 8, 20),
    matPunta
  )
  anillo.position.set(0, 0, 0.26)
  group.add(anillo)

  group.position.copy(CABLE_POS)
  group.visible = false

  scene.add(group)
  cableCorto = group

  console.log('✓ Cable corto creado')
  return Promise.resolve()
}

// ════════════════════════════════════════════════
//  MOSTRAR / OCULTAR
// ════════════════════════════════════════════════
export function mostrarCable(visible) {
  if (!cableCorto) return
  if (!cableAgarrado && !cableSoltado) {
    cableCorto.visible = visible
  }
}

// ════════════════════════════════════════════════
//  AGARRAR
// ════════════════════════════════════════════════
export function agarrarCable() {
  if (!cableCorto || cableAgarrado || cableSoltado || !handNearCable) return

  cableAgarrado = true

  sceneRef.remove(cableCorto)
  cableCorto.position.set(0.05, -0.08, -0.12)
  cableCorto.rotation.set(0.3, 0, 0)
  handGroupRef.add(cableCorto)
  cableCorto.visible = true

  console.log('✓ Cable agarrado')
}

// ════════════════════════════════════════════════
//  SOLTAR
// ════════════════════════════════════════════════
export function soltarCable() {
  if (!cableAgarrado) return

  cableAgarrado = false
  cableSoltado  = true

  handGroupRef.remove(cableCorto)
  cableCorto.visible = false

  const worldPos = new THREE.Vector3()
  handGroupRef.getWorldPosition(worldPos)

  crearCableLargo(worldPos)

  console.log('✓ Cable soltado')
}

// ════════════════════════════════════════════════
//  CABLE LARGO PROCEDURAL
// ════════════════════════════════════════════════
function crearCableLargo(posicionMano) {
  if (cableLargo) return

  const group = new THREE.Group()

  // Cuerpo largo
  const cuerpo = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 3, 12),
    matCuerpo
  )
  cuerpo.rotation.z = Math.PI / 2
  cuerpo.position.set(1.5, 0, 0)
  group.add(cuerpo)

  // Manga izquierda
  const mangaIzq = new THREE.Mesh(
    new THREE.CylinderGeometry(0.022, 0.018, 0.1, 12),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.95 })
  )
  mangaIzq.rotation.z = Math.PI / 2
  mangaIzq.position.set(0.05, 0, 0)
  group.add(mangaIzq)

  // Conector derecho
  const conector = new THREE.Mesh(
    new THREE.CylinderGeometry(0.028, 0.028, 0.08, 12),
    matPunta
  )
  conector.rotation.z = Math.PI / 2
  conector.position.set(3.04, 0, 0)
  group.add(conector)

  // Anillo decorativo
  const anillo = new THREE.Mesh(
    new THREE.TorusGeometry(0.028, 0.005, 8, 20),
    matPunta
  )
  anillo.position.set(3.0, 0, 0)
  anillo.rotation.y = Math.PI / 2
  group.add(anillo)

  group.position.set(posicionMano.x, posicionMano.y - 1.0, posicionMano.z)

  sceneRef.add(group)
  cableLargo = group

  console.log('✓ Cable largo creado en', group.position)
}

// ════════════════════════════════════════════════
//  DETECCIÓN DE PROXIMIDAD
// ════════════════════════════════════════════════
export function checkHandNearCable(leftWorldPos, rightWorldPos) {
  if (!cableCorto || cableAgarrado || cableSoltado || !cableCorto.visible) {
    handNearCable = false
    return
  }

  const dLeft  = leftWorldPos.distanceTo(CABLE_POS)
  const dRight = rightWorldPos.distanceTo(CABLE_POS)
  handNearCable = Math.min(dLeft, dRight) < GRAB_DIST
}

// ════════════════════════════════════════════════
//  ANIMACIÓN
// ════════════════════════════════════════════════
export function updateCable(t) {
  if (cableCorto && cableCorto.visible) {
    const intensity = 0.3 + Math.sin(t * 3) * 0.2
    cableCorto.traverse(c => {
      if (c.isMesh && c.material.emissive) {
        c.material.emissiveIntensity = intensity
      }
    })
  }

  if (cableLargo) {
    const intensity = 0.3 + Math.sin(t * 2.5) * 0.15
    cableLargo.traverse(c => {
      if (c.isMesh && c.material.emissive) {
        c.material.emissiveIntensity = intensity
      }
    })
  }
}