import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const PANEL_POS = new THREE.Vector3(-3.56, 33.15, -1.5)
const INTERACT_DIST = 1.2

let panelCerrado = null
let panelAbierto = null
let panelElectricoLoaded = false
let panelEstado = 'cerrado'
let panelSwapping = false
export let handNearPanelElectrico = false

function checkReady() {
  if (panelCerrado && panelAbierto) panelElectricoLoaded = true
}

export function initPanelElectrico(scene) {
  const loader = new GLTFLoader()

  const loadCerrado = new Promise((resolve) => {
    loader.load('/Modelos GLB/panel_electrico_cerrado.glb', (gltf) => {
      panelCerrado = gltf.scene
      panelCerrado.scale.set(1, 1, 1)
      panelCerrado.position.copy(PANEL_POS)
      panelCerrado.rotation.y = Math.PI
      panelCerrado.traverse(c => {
        if (c.isMesh) { c.castShadow = true; c.receiveShadow = true }
      })
      scene.add(panelCerrado)
      checkReady()
      resolve()
    }, undefined, () => {
      console.error('Error cargando panel cerrado')
      resolve()
    })
  })

  const loadAbierto = new Promise((resolve) => {
    loader.load('/Modelos GLB/panel_electrico_abierto.glb', (gltf) => {
      panelAbierto = gltf.scene
      panelAbierto.scale.set(1.15, 1.15, 1.15)
      panelAbierto.position.copy(PANEL_POS)
      panelAbierto.rotation.y = Math.PI
      panelAbierto.visible = false
      panelAbierto.traverse(c => {
        if (c.isMesh) { c.castShadow = true; c.receiveShadow = true }
      })
      scene.add(panelAbierto)
      checkReady()
      resolve()
    }, undefined, () => {
      console.error('Error cargando panel abierto')
      resolve()
    })
  })

  return Promise.all([loadCerrado, loadAbierto])
}

export function swapPanelElectrico() {
  if (!panelElectricoLoaded || panelSwapping) return
  panelSwapping = true

  if (panelEstado === 'cerrado') {
    panelCerrado.visible = false
    panelAbierto.visible = true
    panelEstado = 'abierto'
  } else {
    panelAbierto.visible = false
    panelCerrado.visible = true
    panelEstado = 'cerrado'
  }

  setTimeout(() => { panelSwapping = false }, 600)
}

export function checkHandNearPanel(leftWorldPos, rightWorldPos) {
  handNearPanelElectrico = Math.min(
    leftWorldPos.distanceTo(PANEL_POS),
    rightWorldPos.distanceTo(PANEL_POS)
  ) < INTERACT_DIST
}