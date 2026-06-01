import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MODEL_PATHS, MODEL_SCALES } from '../conectores-config.js'

const gltfLoader = new GLTFLoader()

export function loadTable(scene, collisionObjects) {
  return new Promise((resolve) => {
    gltfLoader.load(MODEL_PATHS.table, (gltf) => {
      const table = gltf.scene
      table.scale.set(1.8, 1.8, 1.8)
      // Posicionar según especificaciones
      table.position.set(2, 31.57, -13)
      table.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
          collisionObjects.push(child)
        }
      })
      scene.add(table)
      console.log('✓ Mesa cargada en posición elevada')
      resolve()
    }, undefined, (error) => {
      console.error('✗ Error cargando mesa:', error)
      resolve()
    })
  })
}
