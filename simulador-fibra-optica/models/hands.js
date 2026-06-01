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
          child.castShadow = false
          child.receiveShadow = false
          child.frustumCulled = false
          child.renderOrder = 999

          const materials = Array.isArray(child.material) ? child.material : [child.material]
          materials.forEach((material) => {
            if (!material) return
            
            // Configuración mejorada para materiales opacos y sólidos
            material.transparent = false
            material.opacity = 1
            material.alphaTest = 0
            material.alphaMap = null
            material.blending = THREE.NormalBlending
            material.side = THREE.FrontSide // FrontSide para mejor rendimiento
            
            // Configuración especial para FPS viewmodels (manos en primera persona)
            // depthTest=false evita que se crucen con el entorno
            // depthWrite=true permite que las partes de la mano se rendericen correctamente entre sí
            material.depthTest = false
            material.depthWrite = true
            
            // Desactivar efectos de transmisión/transparencia avanzados
            if ('transmission' in material) material.transmission = 0
            if ('thickness' in material) material.thickness = 0
            if ('attenuationDistance' in material) material.attenuationDistance = Infinity
            if ('ior' in material) material.ior = 1.5
            
            // Configuración PBR mejorada para piel
            if ('metalness' in material) material.metalness = 0
            if ('roughness' in material) material.roughness = 0.8 // Piel más natural (menos brillante)
            if ('envMapIntensity' in material) material.envMapIntensity = 0.3 // Reflejo sutil
            if ('emissiveIntensity' in material) material.emissiveIntensity = 0
            
            // Mejorar iluminación
            material.flatShading = false
            if ('vertexColors' in material) material.vertexColors = false
            
            material.needsUpdate = true
          })
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
