import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MODEL_PATHS, MODEL_SCALES } from '../conectores-config.js'

const PANEL_POS = new THREE.Vector3(-3.005, 33.25, -0.88)
const CABLE_OFFSET = -1

const gltfLoader = new GLTFLoader()
let cableObject = null

export function initCable(scene) {
  return new Promise((resolve) => {
    gltfLoader.load(MODEL_PATHS.cable, (gltf) => {
      cableObject = gltf.scene
      cableObject.scale.set(MODEL_SCALES.cable.x, MODEL_SCALES.cable.y, MODEL_SCALES.cable.z)
      cableObject.position.set(PANEL_POS.x, PANEL_POS.y, PANEL_POS.z + CABLE_OFFSET)
      cableObject.rotation.set(Math.PI / 2, 0, Math.PI / 2)
      cableObject.visible = false
      cableObject.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })
      scene.add(cableObject)
      console.log('✓ Cable cargado en posición del panel eléctrico')
      resolve()
    }, undefined, (error) => {
      console.error('✗ Error cargando cable:', error)
      resolve()
    })
  })
}

export function setCableVisible(visible) {
  if (cableObject) cableObject.visible = visible
}

export function setCablePosition(position) {
  if (cableObject) cableObject.position.copy(position)
}

export function getCableWorldPosition(target) {
  if (!cableObject) return false
  cableObject.getWorldPosition(target)
  return true
}

// Offset desde el origen del modelo hasta la punta donde se puede colocar otro objeto.
export const CABLE_TIP_OFFSET = new THREE.Vector3(0, 0, -0.6)

export function getCableTipWorldPosition(target) {
  if (!cableObject) return false
  const local = CABLE_TIP_OFFSET.clone()
  cableObject.localToWorld(local)
  target.copy(local)
  return true
}


