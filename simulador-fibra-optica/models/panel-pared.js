import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MODEL_PATHS } from '../conectores-config.js'

const gltfLoader = new GLTFLoader()

export function loadPanelPared(scene) {
  return new Promise((resolve) => {
    gltfLoader.load(MODEL_PATHS.panelPared, (gltf) => {
      const panel = gltf.scene
      panel.scale.set(1, 1, 1)
      panel.position.set(-3.56, 33.15, -0.88)
      panel.rotation.y = Math.PI
      panel.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })
      scene.add(panel)
      console.log('✓ Panel de pared cargado')
      resolve()
    }, undefined, (error) => {
      console.error('✗ Error cargando panel de pared:', error)
      resolve()
    })
  })
}
