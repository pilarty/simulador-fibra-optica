import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MODEL_PATHS, MODEL_SCALES } from '../conectores-config.js'

const gltfLoader = new GLTFLoader()

export function loadCableFibra(scene) {
  return new Promise((resolve) => {
    gltfLoader.load(MODEL_PATHS.cableFibra, (gltf) => {
      const cable = gltf.scene
      cable.scale.set(MODEL_SCALES.cableFibra.x, MODEL_SCALES.cableFibra.y, MODEL_SCALES.cableFibra.z)
      cable.position.set(12, 25, -14)
      cable.rotation.z = Math.PI / 2
      cable.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })
      scene.add(cable)
      console.log('✓ Cable de fibra cargado')
      resolve()
    }, undefined, (error) => {
      console.error('✗ Error cargando cable de fibra:', error)
      resolve()
    })
  })
}
