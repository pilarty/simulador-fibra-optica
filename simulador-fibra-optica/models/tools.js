import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MODEL_PATHS } from '../conectores-config.js'

const gltfLoader = new GLTFLoader()

// Variables globales para gestionar las herramientas
let pliersModel = null
let toolsPackModel = null

/**
 * Carga el modelo de alicates (pliers) sobre la mesa
 * @param {THREE.Scene} scene - Escena principal
 * @param {Array} interactableObjects - Array de objetos con los que se puede interactuar
 */
export function loadPliersOnTable(scene, interactableObjects) {
  return new Promise((resolve) => {
    gltfLoader.load(MODEL_PATHS.pliers, (gltf) => {
      pliersModel = gltf.scene.clone()
      
      // Posicionar sobre la mesa (ajustar según necesidad)
      pliersModel.position.set(1, 33.13, -13.5)
      pliersModel.scale.set(0.075, 0.075, 0.075)
      pliersModel.rotation.set(0, Math.PI / 4, 0)
      
      // Configurar material para visibilidad
      pliersModel.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
          
          // Marcar como interactuable
          child.userData.isPliers = true
          child.userData.interactable = true
          
          // Agregar al array de objetos interactuables
          interactableObjects.push(child)
        }
      })
      
      scene.add(pliersModel)
      console.log('✓ Alicates cargados sobre la mesa')
      console.log(`   Posición: X=${pliersModel.position.x}, Y=${pliersModel.position.y}, Z=${pliersModel.position.z}`)
      resolve()
    }, undefined, (error) => {
      console.error('✗ Error cargando alicates:', error)
      resolve()
    })
  })
}

/**
 * Carga el modelo de paquete de herramientas sobre la mesa
 * @param {THREE.Scene} scene - Escena principal
 * @param {Array} interactableObjects - Array de objetos con los que se puede interactuar
 */
export function loadToolsPackOnTable(scene, interactableObjects) {
  return new Promise((resolve) => {
    gltfLoader.load(MODEL_PATHS.toolsPack, (gltf) => {
      toolsPackModel = gltf.scene.clone()
      
      // Posicionar sobre la mesa (ajustar según necesidad)
      toolsPackModel.position.set(3.1, 33.13, -13.2)
      toolsPackModel.scale.set(0.02, 0.02, 0.02)
      toolsPackModel.rotation.set(0, 0, 0)
      
      // Configurar material para visibilidad
      toolsPackModel.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
          
          // Marcar como interactuable
          child.userData.isToolsPack = true
          child.userData.interactable = true
          
          // Agregar al array de objetos interactuables
          interactableObjects.push(child)
        }
      })
      
      scene.add(toolsPackModel)
      console.log('✓ Paquete de herramientas cargado sobre la mesa')
      console.log(`   Posición: X=${toolsPackModel.position.x}, Y=${toolsPackModel.position.y}, Z=${toolsPackModel.position.z}`)
      resolve()
    }, undefined, (error) => {
      console.error('✗ Error cargando paquete de herramientas:', error)
      resolve()
    })
  })
}

/**
 * Obtiene el modelo de alicates (para raycasting)
 */
export function getPliersModel() {
  return pliersModel
}

/**
 * Obtiene el modelo de paquete de herramientas (para raycasting)
 */
export function getToolsPackModel() {
  return toolsPackModel
}
