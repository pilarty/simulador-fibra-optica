import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MODEL_PATHS, MODEL_SCALES } from '../conectores-config.js'

const gltfLoader = new GLTFLoader()

export function loadBuilding(scene, collisionObjects) {
  return new Promise((resolve) => {
    gltfLoader.load(MODEL_PATHS.building, (gltf) => {
      const building = gltf.scene
      building.scale.set(MODEL_SCALES.building.x, MODEL_SCALES.building.y, MODEL_SCALES.building.z)
      building.position.set(0, 0, -8)
      building.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
          collisionObjects.push(child)
        }
      })
      scene.add(building)
      console.log('✓ Edificio cargado')
      resolve()
    }, undefined, (error) => {
      console.error('✗ Error cargando edificio:', error)
      resolve()
    })
  })
}
