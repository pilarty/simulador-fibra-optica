import * as THREE from 'three'
import { setupAllModels } from './models/index.js'
import { STEPS, PHYSICS, LIGHTING, SCENE_CONFIG, MODEL_SCALES, TOOL_COLORS } from './conectores-config.js'
import { updateCable, checkHandNearCable } from './models/cable.js'
import { checkHandNearPanel, swapPanelElectrico } from './models/panelElectrico.js'

// ─────────────────────────────────────────────
// THREE.JS — Escena 3D
// ─────────────────────────────────────────────
const canvas = document.getElementById('c')
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true

const scene = new THREE.Scene()

// Cielo fotorrealista con gradiente
const skyColor = new THREE.Color(SCENE_CONFIG.backgroundColor)
scene.background = skyColor
scene.fog = new THREE.Fog(SCENE_CONFIG.fogColor, SCENE_CONFIG.fogNear, SCENE_CONFIG.fogFar)

// Agregar nubes realistas con geometría
const cloudGroup = new THREE.Group()
function createCloud(x, y, z, scale = 1) {
  const cloud = new THREE.Group()
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
    roughness: 1,
    metalness: 0
  })

  // Múltiples esferas para forma orgánica de nube
  const positions = [
    [0, 0, 0, 1],
    [0.8, 0.2, 0.3, 0.9],
    [-0.7, 0.1, -0.2, 0.85],
    [0.3, 0.5, 0.1, 0.7],
    [-0.4, -0.2, 0.4, 0.75]
  ]

  positions.forEach(([px, py, pz, s]) => {
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(s * scale, 12, 12),
      cloudMat
    )
    sphere.position.set(px * scale, py * scale, pz * scale)
    cloud.add(sphere)
  })

  cloud.position.set(x, y, z)
  return cloud
}

// Añadir varias nubes en el cielo
cloudGroup.add(createCloud(-20, 15, -40, 3))
cloudGroup.add(createCloud(25, 18, -50, 4))
cloudGroup.add(createCloud(-10, 20, -60, 3.5))
cloudGroup.add(createCloud(15, 16, -45, 2.5))
cloudGroup.add(createCloud(0, 22, -70, 5))
scene.add(cloudGroup)

// Sistema de primera persona
const camera = new THREE.PerspectiveCamera(
  SCENE_CONFIG.cameraFOV,
  1,
  SCENE_CONFIG.cameraNear,
  SCENE_CONFIG.cameraFar
)
scene.add(camera)

// Estado del jugador
const playerGroup = new THREE.Group()
playerGroup.position.set(0, 60, -8)
scene.add(playerGroup)

// Rotación de cámara
let yaw = 0
let pitch = 0

// Grupos de manos pegados a la cámara
const leftHandGroup = new THREE.Group()
const rightHandGroup = new THREE.Group()
camera.add(leftHandGroup)
camera.add(rightHandGroup)

leftHandGroup.position.set(-0.22, -0.25, -0.6)
rightHandGroup.position.set(0.22, -0.25, -0.6)

// Iluminación fotorrealista
scene.add(new THREE.AmbientLight(LIGHTING.ambientLight.color, LIGHTING.ambientLight.intensity))

// Sol principal con sombras suaves
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

// Luz hemisférica para simular cielo real
const skyLight = new THREE.HemisphereLight(LIGHTING.skyLight.skyColor, LIGHTING.skyLight.groundColor, LIGHTING.skyLight.intensity)
scene.add(skyLight)

// Luz de relleno sutil
const fillLight = new THREE.PointLight(LIGHTING.fillLight.color, LIGHTING.fillLight.intensity, LIGHTING.fillLight.distance)
fillLight.position.set(LIGHTING.fillLight.position.x, LIGHTING.fillLight.position.y, LIGHTING.fillLight.position.z)
scene.add(fillLight)

// Luz de acento para herramientas
const accentLight = new THREE.PointLight(TOOL_COLORS.pelacables, 0.0, 6)
accentLight.position.set(0, 1, 2)
scene.add(accentLight)

// ═════════════════════════════════════════════════
// CARGA DE MODELOS 3D
// ═════════════════════════════════════════════════

// Sistema de física
let verticalVelocity = 0
let isGrounded = false
const collisionObjects = []
const wallColliders = []
const wallVisuals = []

// Promesas de carga de modelos
setupAllModels(scene, leftHandGroup, rightHandGroup, collisionObjects).then((modelFuncs) => {
  console.log('✓ Todos los modelos cargados exitosamente')
  
  // Crear paredes personalizadas con collisión
  function createWall(minX, maxX, minY, maxY, minZ, maxZ) {
    const width = Math.abs(maxX - minX)
    const height = maxY - minY
    const depth = Math.abs(maxZ - minZ)
    
    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2
    const centerZ = (minZ + maxZ) / 2
    
    const wallGeom = new THREE.BoxGeometry(width, height, depth)
    const wallMat = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      colorWrite: false
    })
    const wall = new THREE.Mesh(wallGeom, wallMat)
    wall.position.set(centerX, centerY, centerZ)
    wall.castShadow = false
    wall.receiveShadow = false
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

// ── Herramientas y objetos 3D ──

// Array de herramientas interactuables
const tools = []

// Función para crear herramienta
function createTool(name, color, position, size = 0.15) {
  const geom = new THREE.BoxGeometry(size, size * 0.6, size)
  const mat = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.4,
    metalness: 0.3
  })
  const mesh = new THREE.Mesh(geom, mat)
  mesh.position.copy(position)
  mesh.castShadow = true
  mesh.receiveShadow = true
  mesh.userData.toolName = name
  mesh.userData.interactable = false
  scene.add(mesh)

  // Outline para indicar interactividad
  const outlineGeom = new THREE.BoxGeometry(size * 1.15, size * 0.7, size * 1.15)
  const outlineMat = new THREE.MeshBasicMaterial({
    color: 0x00ff88,
    transparent: true,
    opacity: 0,
    side: THREE.BackSide
  })
  const outline = new THREE.Mesh(outlineGeom, outlineMat)
  mesh.add(outline)
  mesh.userData.outline = outline

  tools.push(mesh)
  return mesh
}

// Crear herramientas en la mesa (distribuidas)
const pelacables = createTool('pelacables', TOOL_COLORS.pelacables, new THREE.Vector3(-0.6, 0.78, -0.3), 0.12)
const alcoholBottle = createTool('alcohol', TOOL_COLORS.alcohol, new THREE.Vector3(-0.3, 0.78, -0.3), 0.1)
const miller = createTool('miller', TOOL_COLORS.miller, new THREE.Vector3(0.0, 0.78, -0.3), 0.13)
const clivador = createTool('clivador', TOOL_COLORS.clivador, new THREE.Vector3(0.3, 0.78, -0.3), 0.18)
const connectorSCAPC = createTool('conector', TOOL_COLORS.conector, new THREE.Vector3(0.6, 0.78, -0.3), 0.12)
const crimp = createTool('crimp', TOOL_COLORS.crimp, new THREE.Vector3(-0.6, 0.78, 0.3), 0.14)
const inspector = createTool('inspector', TOOL_COLORS.inspector, new THREE.Vector3(-0.3, 0.78, 0.3), 0.15)

// Mapa de herramientas por nombre
const toolMap = {
  'pelacables': pelacables,
  'alcohol': alcoholBottle,
  'miller': miller,
  'clivador': clivador,
  'conector': connectorSCAPC,
  'crimp': crimp,
  'inspector': inspector
}

const HAND_TOOL_OFFSETS = {
  default: {
    position: new THREE.Vector3(0.06, -0.02, -0.04),
    rotation: new THREE.Euler(0.3, -0.8, -0.1),
    scale: 1.05
  }
}

const rightHandToolSlot = new THREE.Group()
rightHandGroup.add(rightHandToolSlot)

let equippedTool = null
let equippedToolView = null

function clearEquippedToolView() {
  if (!equippedToolView) return
  rightHandToolSlot.remove(equippedToolView)
  equippedToolView.traverse((child) => {
    if (!child.isMesh) return
    if (Array.isArray(child.material)) {
      child.material.forEach((mat) => mat?.dispose?.())
    } else {
      child.material?.dispose?.()
    }
  })
  equippedToolView = null
}

function unequipTool() {
  if (!equippedTool) return
  equippedTool.visible = true
  equippedTool.userData.isEquipped = false
  clearEquippedToolView()
  equippedTool = null
}

function equipTool(tool) {
  if (!tool) return
  if (equippedTool === tool) return

  if (equippedTool) {
    unequipTool()
  }

  const viewMesh = new THREE.Mesh(tool.geometry.clone(), tool.material.clone())
  viewMesh.castShadow = false
  viewMesh.receiveShadow = false
  viewMesh.renderOrder = 998

  const offset = HAND_TOOL_OFFSETS[tool.userData.toolName] || HAND_TOOL_OFFSETS.default
  viewMesh.position.copy(offset.position)
  viewMesh.rotation.copy(offset.rotation)
  viewMesh.scale.setScalar(offset.scale)

  rightHandToolSlot.add(viewMesh)
  equippedToolView = viewMesh

  tool.visible = false
  tool.userData.isEquipped = true
  equippedTool = tool
}

// Partículas de brillo (para feedback OK)
const particleCount = 80
const particleGeo = new THREE.BufferGeometry()
const positions = new Float32Array(particleCount * 3)
for (let i = 0; i < particleCount * 3; i++) positions[i] = (Math.random() - 0.5) * 0.01
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
const particleMat = new THREE.PointsMaterial({ color: 0x00ff88, size: 0.03, transparent: true, opacity: 0 })
const particles = new THREE.Points(particleGeo, particleMat)
particles.position.set(0, 0.9, 0)
scene.add(particles)

// ── Controles ──

// Pointer lock para mirar con el mouse
canvas.addEventListener('click', () => {
  canvas.requestPointerLock()
})

document.addEventListener('mousemove', e => {
  if (document.pointerLockElement === canvas) {
    yaw -= e.movementX * 0.002
    pitch -= e.movementY * 0.002
    pitch = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, pitch))
  }
})

// Controles de teclado
const keys = {}
let debugMode = false

window.addEventListener('keydown', e => {
  keys[e.code] = true
  if (e.code === 'Space' && isGrounded) {
    verticalVelocity = PHYSICS.jumpStrength
    isGrounded = false
  }
  if (e.code === 'KeyE') {
    e.preventDefault()
    if (canInteract && nearbyTool) {
      equipTool(nearbyTool)
      performInteraction()
    } else if (equippedTool) {
      unequipTool()
    }
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
  if (e.code === 'Digit2') {
    debugMode = !debugMode
  }
})
window.addEventListener('keyup', e => keys[e.code] = false)

// Crear panel de debug
const debugPanel = document.createElement('div')
debugPanel.id = 'debug-panel'
debugPanel.style.cssText = `
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 200;
  background: rgba(0, 0, 0, 0.9);
  color: #00ff88;
  font-family: monospace;
  font-size: 12px;
  padding: 12px 16px;
  border: 1px solid #00ff88;
  border-radius: 4px;
  line-height: 1.6;
  display: none;
  max-width: 350px;
`
debugPanel.innerHTML = `
  <div style="color: #ff6b00; margin-bottom: 8px; font-weight: bold;">== DEBUG MODE ==</div>
  <div id="debug-pos">Posición: --</div>
  <div id="debug-angle">Ángulo: --</div>
  <div id="debug-look">Mirando a: --</div>
  <div style="color: #aaa; margin-top: 8px; font-size: 11px;">Presiona 2 para cerrar</div>
`
document.body.appendChild(debugPanel)

// Posiciones de las manos
const leftBase = new THREE.Vector3(-0.22, -0.25, -0.6)
const rightBase = new THREE.Vector3(0.22, -0.25, -0.6)
const leftPos = leftBase.clone()
const rightPos = rightBase.clone()

// ── Resize handler ──
function resize() {
  const W = window.innerWidth
  const H = window.innerHeight
  camera.aspect = W / H
  camera.updateProjectionMatrix()
  renderer.setSize(W, H)
}
window.addEventListener('resize', resize)
resize()

// ─────────────────────────────────────────────
// LÓGICA DEL SIMULADOR
// ─────────────────────────────────────────────
let currentStep = 0
let animatingParticles = false
let particleVelocities = []
let particleLife = 0

// Inicializar velocidades de partículas
for (let i = 0; i < particleCount; i++) {
  particleVelocities.push(new THREE.Vector3(
    (Math.random() - 0.5) * 0.04,
    Math.random() * 0.05 + 0.01,
    (Math.random() - 0.5) * 0.04
  ))
}

function updateScene() {
  const s = STEPS[currentStep]

  // Color de la luz de acento según la herramienta
  fillLight.color.setHex(s.color)
  accentLight.color.setHex(s.color)
  accentLight.intensity = 0.6

  // Hacer solo la herramienta del paso actual interactuable
  tools.forEach(tool => {
    tool.userData.interactable = (tool.userData.toolName === s.tool)
    if (tool.visible) {
      tool.userData.outline.material.opacity = 0
    }
  })

  // Resaltar herramienta activa con luz pulsante
  if (toolMap[s.tool]) {
    const toolPos = toolMap[s.tool].position
    accentLight.position.set(toolPos.x, toolPos.y + 0.5, toolPos.z)
  }
}

// Sistema de detección de interacción
let nearbyTool = null
let canInteract = false

function checkInteraction() {
  nearbyTool = null
  canInteract = false

  const leftWorldPos = new THREE.Vector3()
  const rightWorldPos = new THREE.Vector3()
  leftHandGroup.getWorldPosition(leftWorldPos)
  rightHandGroup.getWorldPosition(rightWorldPos)

  const interactDistance = PHYSICS.interactDistance

  // Verificar cada herramienta
  tools.forEach(tool => {
    if (!tool.visible || !tool.userData.interactable) {
      tool.userData.outline.material.opacity = 0
      return
    }

    const distLeft = leftWorldPos.distanceTo(tool.position)
    const distRight = rightWorldPos.distanceTo(tool.position)
    const minDist = Math.min(distLeft, distRight)

    if (minDist < interactDistance) {
      nearbyTool = tool
      const pulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.5
      tool.userData.outline.material.opacity = pulse
      canInteract = true
    } else {
      tool.userData.outline.material.opacity = 0
    }
  })

  // Verificar panel eléctrico
  checkHandNearPanel(leftWorldPos, rightWorldPos)
}

function showFeedback(ok) {
  const fb = document.getElementById('feedback')
  if (!fb) return
  
  document.getElementById('fb-icon').textContent = ok ? '✅' : '⚠️'
  document.getElementById('fb-title').textContent = ok ? '¡Correcto!' : 'Advertencia'
  document.getElementById('fb-title').className = `feedback-title ${ok ? 'ok' : 'err'}`
  document.getElementById('fb-msg').textContent = ok
    ? STEPS[currentStep].feedbackOk
    : STEPS[currentStep].feedbackErr

  const fbBtn = document.getElementById('fb-btn')
  if (fbBtn) {
    fbBtn.textContent = ok ? 'Continuar →' : 'Reintentar'
    fbBtn.onclick = () => {
      fb.classList.remove('visible')
      if (ok) advanceStep()
    }
  }
  fb.classList.add('visible')

  if (ok) triggerParticles()
}

function triggerParticles() {
  const pos = particleGeo.getAttribute('position')
  for (let i = 0; i < particleCount; i++) {
    pos.setXYZ(i, 0, 0, 0)
  }
  pos.needsUpdate = true
  particleMat.opacity = 1
  animatingParticles = true
  particleLife = 1
}

function advanceStep() {
  unequipTool()
  currentStep++
  if (currentStep >= STEPS.length) {
    document.getElementById('progress-fill').style.width = '100%'
    setTimeout(() => {
      const complete = document.getElementById('complete-screen')
      if (complete) complete.classList.add('visible')
    }, 400)
    return
  }
  updateScene()
}

function performInteraction() {
  const correctTool = STEPS[currentStep].tool
  if (equippedTool && equippedTool.userData.toolName === correctTool) {
    const success = Math.random() > 0.15
    showFeedback(success)
  }
}

// Restart
window.restartSim = () => {
  unequipTool()
  currentStep = 0
  const complete = document.getElementById('complete-screen')
  if (complete) complete.classList.remove('visible')
  updateScene()
}

updateScene()

// ─────────────────────────────────────────────
// RENDER LOOP
// ─────────────────────────────────────────────
const clock = new THREE.Clock()

function animate() {
  requestAnimationFrame(animate)
  const t = clock.getElapsedTime()

  // Mover jugador con WASD (con colisión horizontal)
  const playerSpeed = PHYSICS.playerSpeed
  const playerRadius = PHYSICS.playerRadius
  
  function tryMove(deltaX, deltaZ) {
    const newPos = new THREE.Vector3(
      playerGroup.position.x + deltaX,
      playerGroup.position.y,
      playerGroup.position.z + deltaZ
    )
    
    const playerBox = new THREE.Box3().setFromCenterAndSize(
      newPos,
      new THREE.Vector3(playerRadius * 2, 2, playerRadius * 2)
    )
    
    for (let wall of wallColliders) {
      const wallBox = new THREE.Box3().setFromObject(wall)
      if (playerBox.intersectsBox(wallBox)) {
        return false
      }
    }
    
    playerGroup.position.x = newPos.x
    playerGroup.position.z = newPos.z
    return true
  }
  
  if (keys['KeyW']) {
    tryMove(-Math.sin(yaw) * playerSpeed, -Math.cos(yaw) * playerSpeed)
  }
  if (keys['KeyS']) {
    tryMove(Math.sin(yaw) * playerSpeed, Math.cos(yaw) * playerSpeed)
  }
  if (keys['KeyA']) {
    tryMove(-Math.cos(yaw) * playerSpeed, Math.sin(yaw) * playerSpeed)
  }
  if (keys['KeyD']) {
    tryMove(Math.cos(yaw) * playerSpeed, -Math.sin(yaw) * playerSpeed)
  }

  // Sistema de gravedad y detección de suelo
  verticalVelocity += PHYSICS.gravity
  playerGroup.position.y += verticalVelocity

  const raycaster = new THREE.Raycaster(
    new THREE.Vector3(playerGroup.position.x, playerGroup.position.y, playerGroup.position.z),
    new THREE.Vector3(0, -1, 0),
    0,
    2.5
  )

  const intersects = raycaster.intersectObjects(collisionObjects, true)
  
  if (intersects.length > 0) {
    const groundHeight = intersects[0].point.y
    const playerHeight = PHYSICS.playerHeight
    
    if (playerGroup.position.y <= groundHeight + playerHeight) {
      playerGroup.position.y = groundHeight + playerHeight
      verticalVelocity = 0
      isGrounded = true
    }
  } else {
    isGrounded = false
  }

  if (playerGroup.position.y < -10) {
    playerGroup.position.set(0, 44, -8)
    verticalVelocity = 0
  }

  // Modo noclip con Shift/Ctrl
  if (keys['ShiftLeft']) {
    playerGroup.position.y -= playerSpeed * 0.5
    verticalVelocity = 0
    isGrounded = false
  }
  if (keys['ControlLeft']) {
    playerGroup.position.y += playerSpeed * 0.5
    verticalVelocity = 0
    isGrounded = false
  }

  // Mover mano izquierda con IJKL
  if (keys['KeyJ']) leftPos.x -= PHYSICS.handSpeed
  if (keys['KeyL']) leftPos.x += PHYSICS.handSpeed
  if (keys['KeyI']) leftPos.z -= PHYSICS.handSpeed
  if (keys['KeyK']) leftPos.z += PHYSICS.handSpeed
  if (keys['KeyU']) leftPos.y -= PHYSICS.handSpeed * 0.8
  if (keys['KeyO']) leftPos.y += PHYSICS.handSpeed * 0.8

  leftPos.x = Math.max(-0.55, Math.min(-0.02, leftPos.x))
  leftPos.y = Math.max(-0.6, Math.min(0.1, leftPos.y))
  leftPos.z = Math.max(-1.2, Math.min(-0.1, leftPos.z))

  // Mover mano derecha con flechas
  if (keys['ArrowLeft']) rightPos.x -= PHYSICS.handSpeed
  if (keys['ArrowRight']) rightPos.x += PHYSICS.handSpeed
  if (keys['ArrowUp']) rightPos.z -= PHYSICS.handSpeed
  if (keys['ArrowDown']) rightPos.z += PHYSICS.handSpeed
  if (keys['PageDown']) rightPos.y -= PHYSICS.handSpeed * 0.8
  if (keys['PageUp']) rightPos.y += PHYSICS.handSpeed * 0.8

  rightPos.x = Math.max(0.02, Math.min(0.55, rightPos.x))
  rightPos.y = Math.max(-0.6, Math.min(0.1, rightPos.y))
  rightPos.z = Math.max(-1.2, Math.min(-0.1, rightPos.z))

  // Interpolar posiciones de manos
  leftHandGroup.position.lerp(leftPos, 0.2)
  rightHandGroup.position.lerp(rightPos, 0.2)

  // Rotación natural de las manos
  leftHandGroup.rotation.z = (leftPos.x - leftBase.x) * 0.5
  rightHandGroup.rotation.z = -(rightPos.x - rightBase.x) * 0.5

  // Actualizar cámara en primera persona
  camera.position.copy(playerGroup.position)
  camera.position.y += 0.8
  camera.rotation.order = 'YXZ'
  camera.rotation.y = yaw
  camera.rotation.x = pitch

  // Actualizar panel de debug
  if (debugMode) {
    debugPanel.style.display = 'block'
    const pos = playerGroup.position
    document.getElementById('debug-pos').textContent = 
      `Posición: X=${pos.x.toFixed(2)} Y=${pos.y.toFixed(2)} Z=${pos.z.toFixed(2)}`
    
    document.getElementById('debug-angle').textContent = 
      `Ángulo: Yaw=${(yaw * 180 / Math.PI).toFixed(0)}° Pitch=${(pitch * 180 / Math.PI).toFixed(0)}°`
    
    const direction = new THREE.Vector3(0, 0, -1)
    direction.applyQuaternion(camera.quaternion)
    const rc = new THREE.Raycaster(camera.position, direction)
    const hits = rc.intersectObjects(collisionObjects, true)
    let lookText = 'Mirando al vacío'
    
    if (hits.length > 0) {
      const hit = hits[0]
      lookText = `Mirando a: X=${hit.point.x.toFixed(2)} Y=${hit.point.y.toFixed(2)} Z=${hit.point.z.toFixed(2)} (Dist: ${hit.distance.toFixed(2)}m)`
    } else {
      const far = camera.position.clone().add(direction.clone().multiplyScalar(10))
      lookText = `Mirando a: X=${far.x.toFixed(2)} Y=${far.y.toFixed(2)} Z=${far.z.toFixed(2)} (Vacío)`
    }
    
    document.getElementById('debug-look').textContent = lookText
  } else {
    debugPanel.style.display = 'none'
  }

  wallVisuals.forEach(wall => {
    wall.material.colorWrite = debugMode
    wall.material.depthWrite = debugMode
    wall.material.opacity = debugMode ? 0.6 : 0
  })

  // Sistema de detección de interacción
  checkInteraction()

  // Pulsación de luces
  accentLight.intensity = 0.4 + Math.sin(t * 2.2) * 0.2
  fillLight.intensity = 0.6 + Math.sin(t * 1.4 + 1) * 0.15

  // Partículas de celebración
  if (animatingParticles) {
    const pos = particleGeo.getAttribute('position')
    particleLife -= 0.016
    particleMat.opacity = Math.max(0, particleLife)
    for (let i = 0; i < particleCount; i++) {
      const v = particleVelocities[i]
      pos.setXYZ(i,
        pos.getX(i) + v.x,
        pos.getY(i) + v.y,
        pos.getZ(i) + v.z
      )
      v.y -= 0.001
    }
    pos.needsUpdate = true
    if (particleLife <= 0) animatingParticles = false
  }

  renderer.render(scene, camera)
}

animate()
