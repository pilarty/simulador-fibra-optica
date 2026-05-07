import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MODEL_PATHS, MODEL_SCALES } from '../conectores-config.js'

const gltfLoader = new GLTFLoader()

export function loadTable(scene, collisionObjects) {
  return new Promise((resolve) => {
    gltfLoader.load(MODEL_PATHS.table, (gltf) => {
      const table = gltf.scene
      table.scale.set(MODEL_SCALES.table.x, MODEL_SCALES.table.y, MODEL_SCALES.table.z)
      table.position.set(12, 1, -14)
      table.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
          collisionObjects.push(child)
        }
      })
      scene.add(table)
      console.log('✓ Mesa cargada')
      resolve()
    }, undefined, (error) => {
      console.error('✗ Error cargando mesa:', error)
      resolve()
    })
  })
}
