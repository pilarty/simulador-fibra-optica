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
      glovesModelOnTable.position.set(2, 33.12, -13)
      glovesModelOnTable.scale.set(0.45, 0.45, 0.45)
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

  // Guardar referencias a las manos originales
  originalLeftHandGroup = leftHandGroup
  originalRightHandGroup = rightHandGroup

  // Ocultar manos originales
  leftHandGroup.traverse(child => {
    if (child.isMesh) child.visible = false
  })
  rightHandGroup.traverse(child => {
    if (child.isMesh) child.visible = false
  })

  // Cargar y agregar los guantes a las manos
  gltfLoader.load(MODEL_PATHS.gloves, (gltf) => {
    // Guante izquierdo
    glovesLeftHand = gltf.scene.clone()
    glovesLeftHand.scale.set(0.03, 0.03, 0.03)
    // Prueba diferentes rotaciones - ajustables con teclado
    glovesLeftHand.rotation.x = 0
    glovesLeftHand.rotation.y = 0
    glovesLeftHand.rotation.z = 0
    glovesLeftHand.position.set(0, 0, 0)
    
    glovesLeftHand.traverse(child => {
      if (child.isMesh) {
        child.castShadow = false
        child.receiveShadow = false
        child.frustumCulled = false
        child.renderOrder = 999
        
        // Configuración de material opaco
        const materials = Array.isArray(child.material) ? child.material : [child.material]
        materials.forEach((material) => {
          if (!material) return
          material.transparent = false
          material.opacity = 1
          // Configuración FPS viewmodel: depthTest=false para no cruzarse con entorno
          material.depthTest = false
          material.depthWrite = true
          material.side = THREE.FrontSide
          material.needsUpdate = true
        })
      }
    })
    
    leftHandGroup.add(glovesLeftHand)

    // Guante derecho (espejado)
    glovesRightHand = gltf.scene.clone()
    glovesRightHand.scale.set(-0.03, 0.03, 0.03)
    // Prueba diferentes rotaciones - ajustables con teclado
    glovesRightHand.rotation.x = 0
    glovesRightHand.rotation.y = 0
    glovesRightHand.rotation.z = 0
    glovesRightHand.position.set(0, 0, 0)
    
    glovesRightHand.traverse(child => {
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
          // Configuración FPS viewmodel: depthTest=false para no cruzarse con entorno
          material.depthTest = false
          material.depthWrite = true
          material.side = THREE.FrontSide
          material.needsUpdate = true
        })
      }
    })
    
    rightHandGroup.add(glovesRightHand)
    
    isWearingGloves = true
    
    // Remover los guantes de la mesa
    if (glovesModelOnTable) {
      glovesModelOnTable.visible = false
    }
    
    // Agregar controles de teclado para ajustar guantes
    console.log('✓ Guantes equipados')
    console.log('🎮 Controles de ajuste:')
    console.log('   Numpad 4/6 - Rotar X')
    console.log('   Numpad 8/2 - Rotar Y')
    console.log('   Numpad 7/9 - Rotar Z')
    console.log('   Numpad +/- - Mover Y')
    console.log('   Numpad * - Mostrar valores actuales')
    
    window.addEventListener('keydown', (e) => {
      if (!isWearingGloves) return
      
      const step = 0.05 // 5 grados
      const posStep = 0.01
      
      switch(e.code) {
        case 'Numpad4':
          glovesLeftHand.rotation.x -= step
          glovesRightHand.rotation.x -= step
          console.log(`Rotation X: ${glovesLeftHand.rotation.x.toFixed(2)}`)
          break
        case 'Numpad6':
          glovesLeftHand.rotation.x += step
          glovesRightHand.rotation.x += step
          console.log(`Rotation X: ${glovesLeftHand.rotation.x.toFixed(2)}`)
          break
        case 'Numpad8':
          glovesLeftHand.rotation.y += step
          glovesRightHand.rotation.y += step
          console.log(`Rotation Y: ${glovesLeftHand.rotation.y.toFixed(2)}`)
          break
        case 'Numpad2':
          glovesLeftHand.rotation.y -= step
          glovesRightHand.rotation.y -= step
          console.log(`Rotation Y: ${glovesLeftHand.rotation.y.toFixed(2)}`)
          break
        case 'Numpad7':
          glovesLeftHand.rotation.z -= step
          glovesRightHand.rotation.z += step // Invertido para el derecho
          console.log(`Rotation Z: ${glovesLeftHand.rotation.z.toFixed(2)}`)
          break
        case 'Numpad9':
          glovesLeftHand.rotation.z += step
          glovesRightHand.rotation.z -= step // Invertido para el derecho
          console.log(`Rotation Z: ${glovesLeftHand.rotation.z.toFixed(2)}`)
          break
        case 'NumpadAdd':
          glovesLeftHand.position.y += posStep
          glovesRightHand.position.y += posStep
          console.log(`Position Y: ${glovesLeftHand.position.y.toFixed(2)}`)
          break
        case 'NumpadSubtract':
          glovesLeftHand.position.y -= posStep
          glovesRightHand.position.y -= posStep
          console.log(`Position Y: ${glovesLeftHand.position.y.toFixed(2)}`)
          break
        case 'NumpadMultiply':
          console.log('📊 Valores actuales de guantes:')
          console.log(`   Rotation: X=${glovesLeftHand.rotation.x.toFixed(2)}, Y=${glovesLeftHand.rotation.y.toFixed(2)}, Z=${glovesLeftHand.rotation.z.toFixed(2)}`)
          console.log(`   Position: X=${glovesLeftHand.position.x.toFixed(2)}, Y=${glovesLeftHand.position.y.toFixed(2)}, Z=${glovesLeftHand.position.z.toFixed(2)}`)
          console.log(`   Scale: ${glovesLeftHand.scale.x}`)
          break
      }
    })
  }, undefined, (error) => {
    console.error('✗ Error equipando guantes:', error)
  })
}

/**
 * Quita los guantes y restaura las manos originales
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

  // Mostrar manos originales nuevamente
  originalLeftHandGroup.traverse(child => {
    if (child.isMesh) child.visible = true
  })
  originalRightHandGroup.traverse(child => {
    if (child.isMesh) child.visible = true
  })

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
