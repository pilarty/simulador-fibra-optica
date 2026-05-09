import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const CABLE_POS = new THREE.Vector3(-1.72, 33.15, -2.10)

let cableModel = null

export function initCable(scene) {
  return new Promise((resolve) => {
    const loader = new GLTFLoader()
    loader.load('/Modelos GLB/cable.glb', (gltf) => {
      cableModel = gltf.scene
      cableModel.scale.set(1, 1, 1)
      cableModel.position.copy(CABLE_POS)
      cableModel.visible = false
      cableModel.traverse(c => {
        if (c.isMesh) { c.castShadow = true; c.receiveShadow = true }
      })
      scene.add(cableModel)
      console.log('✓ Cable GLB cargado')
      resolve()
    }, undefined, (err) => {
      console.error('✗ Error cargando cable:', err)
      resolve()
    })
  })
}

export function mostrarCable(visible) {
  if (!cableModel) return
  cableModel.visible = visible
}