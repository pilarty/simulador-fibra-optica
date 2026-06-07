import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MODEL_PATHS } from '../conectores-config.js'

const gltfLoader = new GLTFLoader()

// Variables globales para gestionar los guantes
let glovesModelOnTable = null
let glovesLeftHand = null
let glovesRightHand = null
let isWearingGloves = false

// Grupos de manos originales (para poder ocultarlos)
let originalLeftHandGroup = null
let originalRightHandGroup = null

/**
 * Carga el modelo de guantes sobre la mesa
 * @param {THREE.Scene} scene - Escena principal
 * @param {Array} interactableObjects - Array de objetos con los que se puede interactuar
 */
export function loadGlovesOnTable(scene, interactableObjects) {
  return new Promise((resolve) => {
    gltfLoader.load(MODEL_PATHS.gloves, (gltf) => {
      glovesModelOnTable = gltf.scene.clone()
      
      // Posicionar sobre la mesa (mesa está en 2, 31.57, -13)
      glovesModelOnTable.position.set(2, 34.12, -13)
      glovesModelOnTable.scale.set(0.01, 0.01, 0.01)
      glovesModelOnTable.rotation.y = Math.PI
      
      // Configurar material para visibilidad
      glovesModelOnTable.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
          
          // Marcar como interactuable
          child.userData.isGloves = true
          child.userData.interactable = true
          
          // Agregar al array de objetos interactuables
          interactableObjects.push(child)
        }
      })
      
      scene.add(glovesModelOnTable)
      console.log('✓ Guantes cargados sobre la mesa')
      console.log(`   Posición: X=${glovesModelOnTable.position.x}, Y=${glovesModelOnTable.position.y}, Z=${glovesModelOnTable.position.z}`)
      console.log(`   Meshes interactuables: ${interactableObjects.length}`)
      resolve()
    }, undefined, (error) => {
      console.error('✗ Error cargando guantes:', error)
      resolve()
    })
  })
}

/**
 * Reemplaza las manos actuales por guantes
 * @param {THREE.Group} leftHandGroup - Grupo de mano izquierda
 * @param {THREE.Group} rightHandGroup - Grupo de mano derecha
 */
export function equipGloves(leftHandGroup, rightHandGroup) {
  if (isWearingGloves) {
    console.log('⚠️ Ya estás usando guantes')
    return
  }

  // Guardar referencias
  originalLeftHandGroup = leftHandGroup
  originalRightHandGroup = rightHandGroup

  // Ocultar las manos originales
  const leftHandOriginal = leftHandGroup.getObjectByName('originalLeftHand')
  if (leftHandOriginal) {
    leftHandOriginal.visible = false
    console.log('✓ Mano izquierda original ocultada')
  }
  
  const rightHandOriginal = rightHandGroup.getObjectByName('originalRightHand')
  if (rightHandOriginal) {
    rightHandOriginal.visible = false
    console.log('✓ Mano derecha original ocultada')
  }

  // SOLUCIÓN TEMPORAL: Usar el mismo modelo de manos pero con color de guantes
  gltfLoader.load(MODEL_PATHS.hands, (gltf) => {
    console.log('📦 Usando hand-arm.glb con textura de guantes')
    
    // Función para aplicar material de guantes (color gris/azul)
    const applyGlovesMaterial = (object) => {
      object.traverse(child => {
        if (child.isMesh) {
          child.castShadow = false
          child.receiveShadow = false
          child.frustumCulled = false
          child.renderOrder = 999

          const materials = Array.isArray(child.material) ? child.material : [child.material]
          materials.forEach((material) => {
            if (!material) return
            
            // Cambiar el color a un tono de guantes (gris azulado)
            material.color = new THREE.Color(0x4a5f7a) // Color de guantes de trabajo
            material.transparent = false
            material.opacity = 1
            material.depthTest = false
            material.depthWrite = true
            material.side = THREE.FrontSide
            
            // Hacer más rugoso (menos brillante)
            if ('roughness' in material) material.roughness = 0.9
            if ('metalness' in material) material.metalness = 0
            
            material.needsUpdate = true
          })
        }
      })
    }
    
    // Agregar mano izquierda con apariencia de guante
    glovesLeftHand = gltf.scene.clone()
    glovesLeftHand.name = 'equippedLeftGlove'
    glovesLeftHand.scale.set(0.01, 0.01, 0.01)
    glovesLeftHand.rotation.x = -0.3
    glovesLeftHand.rotation.z = 0.3
    applyGlovesMaterial(glovesLeftHand)
    leftHandGroup.add(glovesLeftHand)

    // Agregar mano derecha con apariencia de guante (espejada)
    glovesRightHand = gltf.scene.clone()
    glovesRightHand.name = 'equippedRightGlove'
    glovesRightHand.scale.set(-0.01, 0.01, 0.01)
    glovesRightHand.rotation.x = -0.3
    glovesRightHand.rotation.z = -0.3
    applyGlovesMaterial(glovesRightHand)
    rightHandGroup.add(glovesRightHand)
    
    isWearingGloves = true
    if (glovesModelOnTable) glovesModelOnTable.visible = false
    console.log('✓ Guantes equipados correctamente (material aplicado)')
  }, undefined, (error) => {
    console.error('✗ Error cargando manos con guantes:', error)
  })
}

/**
 * Quita los guantes
 */
export function unequipGloves() {
  if (!isWearingGloves) {
    console.log('⚠️ No estás usando guantes')
    return
  }

  // Remover guantes de las manos
  if (glovesLeftHand) {
    originalLeftHandGroup.remove(glovesLeftHand)
    glovesLeftHand = null
  }
  if (glovesRightHand) {
    originalRightHandGroup.remove(glovesRightHand)
    glovesRightHand = null
  }
  
  // Mostrar manos originales
  const leftHandOriginal = originalLeftHandGroup.getObjectByName('originalLeftHand')
  if (leftHandOriginal) {
    leftHandOriginal.visible = true
  }
  
  const rightHandOriginal = originalRightHandGroup.getObjectByName('originalRightHand')
  if (rightHandOriginal) {
    rightHandOriginal.visible = true
  }

  // Mostrar guantes en la mesa
  if (glovesModelOnTable) {
    glovesModelOnTable.visible = true
  }

  isWearingGloves = false
  console.log('✓ Guantes removidos')
}

/**
 * Verifica si el jugador está usando guantes
 */
export function getIsWearingGloves() {
  return isWearingGloves
}

/**
 * Obtiene el modelo de guantes en la mesa (para raycasting)
 */
export function getGlovesModel() {
  return glovesModelOnTable
}
