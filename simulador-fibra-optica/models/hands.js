import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MODEL_PATHS } from '../conectores-config.js'

const gltfLoader = new GLTFLoader()

export function loadHands(scene, leftHandGroup, rightHandGroup) {
  return new Promise((resolve) => {
    gltfLoader.load(MODEL_PATHS.hands, (gltf) => {
      const hands = gltf.scene
      hands.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true
        }
      })

      // Agregar mano izquierda
      const leftHand = hands.clone()
      leftHand.scale.set(0.01, 0.01, 0.01)
      leftHand.rotation.x = -0.3
      leftHand.rotation.z = 0.3
      leftHandGroup.add(leftHand)

      // Agregar mano derecha (espejada)
      const rightHand = hands.clone()
      rightHand.scale.set(-0.01, 0.01, 0.01)
      rightHand.rotation.x = -0.3
      rightHand.rotation.z = -0.3
      rightHandGroup.add(rightHand)

      console.log('✓ Manos cargadas exitosamente')
      resolve()
    }, undefined, (error) => {
      console.error('✗ Error cargando manos:', error)
      resolve()
    })
  })
}
