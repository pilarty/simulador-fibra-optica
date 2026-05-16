import * as THREE from 'three'
import { LIGHTING, PHYSICS, SCENE_CONFIG } from './conectores-config.js'
import { loadBuilding } from './models/building.js'
import { loadCableFibra } from './models/cable-fibra.js'
import { getCableWorldPosition, initCable, setCablePosition } from './models/cable.js'
import { loadHands } from './models/hands.js'
import { checkHandNearPanel, initPanelElectrico, swapPanelElectrico } from './models/panelElectrico.js'
import { loadTable } from './models/table.js'

// ─────────────────────────────────────────────
// RENDERER Y ESCENA
// ─────────────────────────────────────────────
const canvas = document.getElementById('c')
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true

const scene = new THREE.Scene()
scene.background = new THREE.Color(SCENE_CONFIG.backgroundColor)
scene.fog = new THREE.Fog(SCENE_CONFIG.fogColor, SCENE_CONFIG.fogNear, SCENE_CONFIG.fogFar)

// ─────────────────────────────────────────────
// CÁMARA Y JUGADOR
// ─────────────────────────────────────────────
const camera = new THREE.PerspectiveCamera(SCENE_CONFIG.cameraFOV, 1, SCENE_CONFIG.cameraNear, SCENE_CONFIG.cameraFar)
scene.add(camera)

const playerGroup = new THREE.Group()
playerGroup.position.set(0, 60, -8)
scene.add(playerGroup)

let yaw = 0
let pitch = 0

// ─────────────────────────────────────────────
// MANOS
// ─────────────────────────────────────────────
const leftHandGroup = new THREE.Group()
const rightHandGroup = new THREE.Group()
camera.add(leftHandGroup)
camera.add(rightHandGroup)
leftHandGroup.position.set(-0.15, -0.25, -0.6)
rightHandGroup.position.set(0.15, -0.25, -0.6)

const leftBase = new THREE.Vector3(-0.15, -0.25, -0.6)
const rightBase = new THREE.Vector3(0.15, -0.25, -0.6)
const leftPos = leftBase.clone()
const rightPos = rightBase.clone()
const leftWorldPos = new THREE.Vector3()
const rightWorldPos = new THREE.Vector3()

// ─────────────────────────────────────────────
// ILUMINACIÓN
// ─────────────────────────────────────────────
scene.add(new THREE.AmbientLight(LIGHTING.ambientLight.color, LIGHTING.ambientLight.intensity))

const sunLight = new THREE.DirectionalLight(LIGHTING.sunLight.color, LIGHTING.sunLight.intensity)
sunLight.position.set(LIGHTING.sunLight.position.x, LIGHTING.sunLight.position.y, LIGHTING.sunLight.position.z)
sunLight.castShadow = true
sunLight.shadow.mapSize.width = LIGHTING.sunLight.shadowMapSize
sunLight.shadow.mapSize.height = LIGHTING.sunLight.shadowMapSize
sunLight.shadow.camera.left = -15
sunLight.shadow.camera.right = 15
sunLight.shadow.camera.top = 15
sunLight.shadow.camera.bottom = -15
sunLight.shadow.camera.near = 0.5
sunLight.shadow.camera.far = 100
sunLight.shadow.bias = -0.0001
sunLight.shadow.radius = LIGHTING.sunLight.shadowRadius
scene.add(sunLight)

const skyLight = new THREE.HemisphereLight(LIGHTING.skyLight.skyColor, LIGHTING.skyLight.groundColor, LIGHTING.skyLight.intensity)
scene.add(skyLight)

const fillLight = new THREE.PointLight(LIGHTING.fillLight.color, LIGHTING.fillLight.intensity, LIGHTING.fillLight.distance)
fillLight.position.set(LIGHTING.fillLight.position.x, LIGHTING.fillLight.position.y, LIGHTING.fillLight.position.z)
scene.add(fillLight)

// ─────────────────────────────────────────────
// NUBES
// ─────────────────────────────────────────────
function createCloud(x, y, z, scale = 1) {
  const cloud = new THREE.Group()
  const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, roughness: 1, metalness: 0 })
  const positions = [
    [0, 0, 0, 1], [0.8, 0.2, 0.3, 0.9], [-0.7, 0.1, -0.2, 0.85],
    [0.3, 0.5, 0.1, 0.7], [-0.4, -0.2, 0.4, 0.75]
  ]
  positions.forEach(([px, py, pz, s]) => {
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(s * scale, 12, 12), cloudMat)
    sphere.position.set(px * scale, py * scale, pz * scale)
    cloud.add(sphere)
  })
  cloud.position.set(x, y, z)
  return cloud
}

const cloudGroup = new THREE.Group()
cloudGroup.add(createCloud(-20, 15, -40, 3))
cloudGroup.add(createCloud(25, 18, -50, 4))
cloudGroup.add(createCloud(-10, 20, -60, 3.5))
cloudGroup.add(createCloud(15, 16, -45, 2.5))
cloudGroup.add(createCloud(0, 22, -70, 5))
scene.add(cloudGroup)

// ─────────────────────────────────────────────
// FÍSICA Y COLISIÓN
// ─────────────────────────────────────────────
let verticalVelocity = 0
let isGrounded = false
const collisionObjects = []
const wallColliders = []
const wallVisuals = []

// ─────────────────────────────────────────────
// CARGA DE MODELOS
// ─────────────────────────────────────────────
Promise.all([
  loadBuilding(scene, collisionObjects),
  loadTable(scene, collisionObjects),
  loadCableFibra(scene),
  loadHands(scene, leftHandGroup, rightHandGroup)
]).then(async () => {
  await initCable(scene)
  await initPanelElectrico(scene)
  console.log('✓ Todos los modelos cargados exitosamente')

  function createWall(minX, maxX, minY, maxY, minZ, maxZ) {
    const width = Math.abs(maxX - minX)
    const height = maxY - minY
    const depth = Math.abs(maxZ - minZ)
    const wallGeom = new THREE.BoxGeometry(width, height, depth)
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.8, metalness: 0.1, transparent: true, opacity: 0 })
    const wall = new THREE.Mesh(wallGeom, wallMat)
    wall.position.set((minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2)
    wall.castShadow = true
    wall.receiveShadow = true
    scene.add(wall)
    wallColliders.push(wall)
    wallVisuals.push(wall)
    return wall
  }

  createWall(-1.18, -1.08, 30.16, 34.16, -0.71, -7.0)
  createWall(-1.18, -1.08, 30.16, 34.16, -8.8, -9.40)
  createWall(-5.55, -5.45, 30.16, 34.16, -0.71, -9.40)
  createWall(-5.55, -1.08, 30.16, 34.16, -0.76, -0.66)
  createWall(-5.55, -1.08, 30.16, 34.16, -9.45, -9.35)
})

// ─────────────────────────────────────────────
// CONTROLES
// ─────────────────────────────────────────────
canvas.addEventListener('click', () => canvas.requestPointerLock())

document.addEventListener('mousemove', e => {
  if (document.pointerLockElement === canvas) {
    yaw -= e.movementX * 0.002
    pitch -= e.movementY * 0.002
    pitch = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, pitch))
  }
})

const keys = {}
let debugMode = false
let cableAttached = false
let cableAttachedHand = null
let cableAttachOffset = new THREE.Vector3()
let cableCandidateHand = null
const CABLE_ATTACH_KEY = 'KeyG'
const CABLE_ATTACH_DIST = 1.2

window.addEventListener('keydown', e => {
  keys[e.code] = true

  if (e.code === 'Space' && isGrounded) {
    verticalVelocity = PHYSICS.jumpStrength
    isGrounded = false
  }
  if (e.code === 'KeyE') {
    e.preventDefault()
    swapPanelElectrico()
  }
  if (e.code === 'Digit1') {
    const pos = `X=${playerGroup.position.x.toFixed(2)} Y=${playerGroup.position.y.toFixed(2)} Z=${playerGroup.position.z.toFixed(2)}`
    console.log('POS', pos)
    let posDiv = document.getElementById('pos-debug')
    if (!posDiv) {
      posDiv = document.createElement('div')
      posDiv.id = 'pos-debug'
      posDiv.style.cssText = 'position:fixed;top:16px;right:320px;z-index:200;background:rgba(0,0,0,0.8);color:#00ff88;font-family:monospace;font-size:14px;padding:8px 12px;border-radius:4px;'
      document.body.appendChild(posDiv)
    }
    posDiv.textContent = pos
  }
  if (e.code === CABLE_ATTACH_KEY) {
    if (!cableAttached && cableCandidateHand) {
      cableAttached = true
      cableAttachedHand = cableCandidateHand
      const handPos = cableAttachedHand === 'left' ? leftWorldPos.clone() : rightWorldPos.clone()
      const cableWorldPos = new THREE.Vector3()
      if (getCableWorldPosition(cableWorldPos)) {
        cableAttachOffset.copy(cableWorldPos).sub(handPos)
      } else {
        cableAttachOffset.set(0, 0, 0)
      }
      console.log('G pressed: Cable enganchado a mano', cableAttachedHand)
    } else if (!cableAttached) {
      console.log('G pressed: mano no está cerca del cable o cable no visible')
    } else {
      cableAttached = false
      cableAttachedHand = null
      console.log('G pressed: cable liberado')
    }
  }

  if (e.code === 'Digit2') {
    debugMode = !debugMode
  }
})
window.addEventListener('keyup', e => keys[e.code] = false)

// ─────────────────────────────────────────────
// DEBUG PANEL
// ─────────────────────────────────────────────
const debugPanel = document.createElement('div')
debugPanel.id = 'debug-panel'
debugPanel.style.cssText = `
  position: fixed; top: 16px; right: 16px; z-index: 200;
  background: rgba(0,0,0,0.9); color: #00ff88;
  font-family: monospace; font-size: 12px;
  padding: 12px 16px; border: 1px solid #00ff88;
  border-radius: 4px; line-height: 1.6; display: none; max-width: 350px;
`
debugPanel.innerHTML = `
  <div style="color:#ff6b00;margin-bottom:8px;font-weight:bold;">== DEBUG MODE ==</div>
  <div id="debug-pos">Posición: --</div>
  <div id="debug-angle">Ángulo: --</div>
  <div id="debug-look">Mirando a: --</div>
  <div style="color:#aaa;margin-top:8px;font-size:11px;">Presiona 2 para cerrar</div>
`
document.body.appendChild(debugPanel)

// ─────────────────────────────────────────────
// RESIZE
// ─────────────────────────────────────────────
function resize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}
window.addEventListener('resize', resize)
resize()

// ─────────────────────────────────────────────
// RENDER LOOP
// ─────────────────────────────────────────────
const clock = new THREE.Clock()

function animate() {
  requestAnimationFrame(animate)
  const t = clock.getElapsedTime()

  const playerSpeed = PHYSICS.playerSpeed
  const playerRadius = PHYSICS.playerRadius

  function tryMove(deltaX, deltaZ) {
    const newPos = new THREE.Vector3(
      playerGroup.position.x + deltaX,
      playerGroup.position.y,
      playerGroup.position.z + deltaZ
    )
    const playerBox = new THREE.Box3().setFromCenterAndSize(newPos, new THREE.Vector3(playerRadius * 2, 2, playerRadius * 2))
    for (let wall of wallColliders) {
      if (playerBox.intersectsBox(new THREE.Box3().setFromObject(wall))) return false
    }
    playerGroup.position.x = newPos.x
    playerGroup.position.z = newPos.z
    return true
  }

  if (keys['KeyW']) tryMove(-Math.sin(yaw) * playerSpeed, -Math.cos(yaw) * playerSpeed)
  if (keys['KeyS']) tryMove( Math.sin(yaw) * playerSpeed,  Math.cos(yaw) * playerSpeed)
  if (keys['KeyA']) tryMove(-Math.cos(yaw) * playerSpeed,  Math.sin(yaw) * playerSpeed)
  if (keys['KeyD']) tryMove( Math.cos(yaw) * playerSpeed, -Math.sin(yaw) * playerSpeed)

  // Gravedad
  verticalVelocity += PHYSICS.gravity
  playerGroup.position.y += verticalVelocity

  const raycaster = new THREE.Raycaster(playerGroup.position.clone(), new THREE.Vector3(0, -1, 0), 0, 2.5)
  const intersects = raycaster.intersectObjects(collisionObjects, true)
  if (intersects.length > 0) {
    const groundHeight = intersects[0].point.y
    if (playerGroup.position.y <= groundHeight + PHYSICS.playerHeight) {
      playerGroup.position.y = groundHeight + PHYSICS.playerHeight
      verticalVelocity = 0
      isGrounded = true
    }
  } else {
    isGrounded = false
  }

  // Resetear si cae al vacío
  if (playerGroup.position.y < -10) {
    playerGroup.position.set(0, 44, -8)
    verticalVelocity = 0
  }

  // Noclip
  if (keys['ShiftLeft'])   { playerGroup.position.y -= playerSpeed * 0.5; verticalVelocity = 0; isGrounded = false }
  if (keys['ControlLeft']) { playerGroup.position.y += playerSpeed * 0.5; verticalVelocity = 0; isGrounded = false }

  // Mano izquierda
  if (keys['KeyJ']) leftPos.x -= PHYSICS.handSpeed
  if (keys['KeyL']) leftPos.x += PHYSICS.handSpeed
  if (keys['KeyI']) leftPos.z -= PHYSICS.handSpeed
  if (keys['KeyK']) leftPos.z += PHYSICS.handSpeed
  if (keys['KeyU']) leftPos.y -= PHYSICS.handSpeed * 0.8
  if (keys['KeyO']) leftPos.y += PHYSICS.handSpeed * 0.8
  leftPos.x = Math.max(-0.5, Math.min(0.3, leftPos.x))
  leftPos.y = Math.max(-0.6, Math.min(0.1, leftPos.y))
  leftPos.z = Math.max(-1.2, Math.min(-0.1, leftPos.z))

  // Mano derecha
  if (keys['ArrowLeft'])  rightPos.x -= PHYSICS.handSpeed
  if (keys['ArrowRight']) rightPos.x += PHYSICS.handSpeed
  if (keys['ArrowUp'])    rightPos.z -= PHYSICS.handSpeed
  if (keys['ArrowDown'])  rightPos.z += PHYSICS.handSpeed
  if (keys['PageDown'])   rightPos.y -= PHYSICS.handSpeed * 0.8
  if (keys['PageUp'])     rightPos.y += PHYSICS.handSpeed * 0.8
  rightPos.x = Math.max(-0.3, Math.min(0.5, rightPos.x))
  rightPos.y = Math.max(-0.6, Math.min(0.1, rightPos.y))
  rightPos.z = Math.max(-1.2, Math.min(-0.1, rightPos.z))

  leftHandGroup.position.lerp(leftPos, 0.2)
  rightHandGroup.position.lerp(rightPos, 0.2)
  leftHandGroup.rotation.z  =  (leftPos.x  - leftBase.x)  * 0.5
  rightHandGroup.rotation.z = -(rightPos.x - rightBase.x) * 0.5

  // Detección de proximidad
  leftHandGroup.getWorldPosition(leftWorldPos)
  rightHandGroup.getWorldPosition(rightWorldPos)

  const cableWorldPos = new THREE.Vector3()
  if (getCableWorldPosition(cableWorldPos)) {
    const leftDist = leftWorldPos.distanceTo(cableWorldPos)
    const rightDist = rightWorldPos.distanceTo(cableWorldPos)
    const nearestDist = Math.min(leftDist, rightDist)
    cableCandidateHand = nearestDist < CABLE_ATTACH_DIST ? (leftDist <= rightDist ? 'left' : 'right') : null
  } else {
    cableCandidateHand = null
  }

  if (cableAttached && cableAttachedHand) {
    const handPos = cableAttachedHand === 'left' ? leftWorldPos : rightWorldPos
    const targetPos = handPos.clone().add(cableAttachOffset)
    setCablePosition(targetPos)
  }

  checkHandNearPanel(leftWorldPos, rightWorldPos)

  // Cámara
  camera.position.copy(playerGroup.position)
  camera.position.y += 0.8
  camera.rotation.order = 'YXZ'
  camera.rotation.y = yaw
  camera.rotation.x = pitch

  // Debug
  if (debugMode) {
    debugPanel.style.display = 'block'
    const pos = playerGroup.position
    document.getElementById('debug-pos').textContent = `Posición: X=${pos.x.toFixed(2)} Y=${pos.y.toFixed(2)} Z=${pos.z.toFixed(2)}`
    document.getElementById('debug-angle').textContent = `Ángulo: Yaw=${(yaw * 180 / Math.PI).toFixed(0)}° Pitch=${(pitch * 180 / Math.PI).toFixed(0)}°`
    const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion)
    const hits = new THREE.Raycaster(camera.position, dir).intersectObjects(collisionObjects, true)
    if (hits.length > 0) {
      const h = hits[0]
      document.getElementById('debug-look').textContent = `Mirando a: X=${h.point.x.toFixed(2)} Y=${h.point.y.toFixed(2)} Z=${h.point.z.toFixed(2)} (Dist: ${h.distance.toFixed(2)}m)`
    } else {
      const far = camera.position.clone().add(dir.clone().multiplyScalar(10))
      document.getElementById('debug-look').textContent = `Mirando a: X=${far.x.toFixed(2)} Y=${far.y.toFixed(2)} Z=${far.z.toFixed(2)} (Vacío)`
    }
  } else {
    debugPanel.style.display = 'none'
  }

  wallVisuals.forEach(wall => wall.material.opacity = debugMode ? 0.6 : 0)

  // Pulsación de luces
  fillLight.intensity = 0.6 + Math.sin(t * 1.4 + 1) * 0.15

  renderer.render(scene, camera)
}

animate()