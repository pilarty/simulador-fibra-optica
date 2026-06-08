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

  // Cargar el modelo de UN SOLO guante y clonarlo para cada mano
  gltfLoader.load(MODEL_PATHS.singleGlove, (gltf) => {
    console.log('📦 Cargando modelo gloves.glb (un solo guante)')
    
    const gloveModel = gltf.scene
    
    // Configurar materiales igual que las manos para evitar traspaso
    gloveModel.traverse(child => {
      if (child.isMesh) {
        child.castShadow = false
        child.receiveShadow = false
        child.frustumCulled = false
        child.renderOrder = 999

        const materials = Array.isArray(child.material) ? child.material : [child.material]
        materials.forEach((material) => {
          if (!material) return
          material.transparent = false
          material.opacity = 1
          material.depthTest = false  // Evita traspasar el entorno
          material.depthWrite = true
          material.side = THREE.FrontSide
          material.needsUpdate = true
        })
      }
    })
    
    // Guante izquierdo - usar misma configuración que las manos
    glovesLeftHand = gloveModel.clone()
    glovesLeftHand.name = 'equippedLeftGlove'
    glovesLeftHand.scale.set(1.0, 1.0, 1.0)  // Ajustado para coincidir con manos
    glovesLeftHand.rotation.x = -0.3
    glovesLeftHand.rotation.z = 0.3
    leftHandGroup.add(glovesLeftHand)
    console.log('✓ Guante izquierdo equipado')

    // Guante derecho - espejar en X
    glovesRightHand = gloveModel.clone()
    glovesRightHand.name = 'equippedRightGlove'
    glovesRightHand.scale.set(-1.0, 1.0, 1.0)  // Espejado en X, ajustado para coincidir
    glovesRightHand.rotation.x = -0.3
    glovesRightHand.rotation.z = -0.3
    rightHandGroup.add(glovesRightHand)
    console.log('✓ Guante derecho equipado (espejado)')
    
    isWearingGloves = true
    if (glovesModelOnTable) glovesModelOnTable.visible = false
    console.log('✓ Guantes equipados correctamente')
    
    // DEBUG: Agregar control de teclado para alternar visibilidad y comparar
    console.log('🔍 DEBUG: Presiona la tecla "G" para alternar entre manos y guantes')
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyG') {
        if (!glovesLeftHand || !glovesRightHand) return
        
        const leftHandOriginal = originalLeftHandGroup.getObjectByName('originalLeftHand')
        const rightHandOriginal = originalRightHandGroup.getObjectByName('originalRightHand')
        
        // Alternar visibilidad
        if (glovesLeftHand.visible) {
          // Mostrar manos originales, ocultar guantes
          glovesLeftHand.visible = false
          glovesRightHand.visible = false
          if (leftHandOriginal) leftHandOriginal.visible = true
          if (rightHandOriginal) rightHandOriginal.visible = true
          console.log('👋 Mostrando MANOS originales')
        } else {
          // Mostrar guantes, ocultar manos
          glovesLeftHand.visible = true
          glovesRightHand.visible = true
          if (leftHandOriginal) leftHandOriginal.visible = false
          if (rightHandOriginal) rightHandOriginal.visible = false
          console.log('🧤 Mostrando GUANTES')
        }
      }
    })
  }, undefined, (error) => {
    console.error('✗ Error cargando guantes:', error)
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
