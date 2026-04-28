import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x1a1a2e)
scene.fog = new THREE.Fog(0x1a1a2e, 12, 25)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
document.body.appendChild(renderer.domElement)

// Camara principal (dentro de la cabeza)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 100)
scene.add(camera)

// Luces
scene.add(new THREE.AmbientLight(0xffffff, 0.6))
const dirLight = new THREE.DirectionalLight(0xffffff, 1)
dirLight.position.set(3, 8, 5)
dirLight.castShadow = true
scene.add(dirLight)
scene.add(new THREE.PointLight(0x7f77dd, 1.5, 10)).position.set(-2, 4, 2)

// Piso
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 30),
  new THREE.MeshLambertMaterial({ color: 0x0d0d1a })
)
floor.rotation.x = -Math.PI / 2
floor.receiveShadow = true
scene.add(floor)

// Escalera
const stepMat = new THREE.MeshLambertMaterial({ color: 0x534ab7 })
for (let i = 0; i < 10; i++) {
  const step = new THREE.Mesh(new THREE.BoxGeometry(3, 0.2, 0.5), stepMat)
  step.position.set(0, 0.1 + i * 0.2, -3 - i * 0.5)
  step.castShadow = true
  step.receiveShadow = true
  scene.add(step)
}

// Estado del personaje
const bodyGroup = new THREE.Group()
bodyGroup.position.set(-15, 0, 0)
scene.add(bodyGroup)

// Posicion de camara dentro de la cabeza (se ajusta cuando carga el modelo)
let headOffset = new THREE.Vector3(0, 1.6, 0)

// Rotacion de camara con mouse
let yaw = 0    // izquierda/derecha
let pitch = 0  // arriba/abajo

// Grupos de manos pegados a la camara
const leftGroup  = new THREE.Group()
const rightGroup = new THREE.Group()
camera.add(leftGroup)
camera.add(rightGroup)

leftGroup.position.set(-0.3, -0.3, -0.8)
rightGroup.position.set( 0.3, -0.3, -0.8)

// Cubo de debug para verificar que se renderiza algo
const debugCube = new THREE.Mesh(
  new THREE.BoxGeometry(0.1, 0.1, 0.1),
  new THREE.MeshBasicMaterial({ color: 0xff00ff })
)
debugCube.position.set(0, 0, 0.5)  // Más cerca del usuario (z positivo)
camera.add(debugCube)
console.log('Cubo de debug agregado en posición del usuario')

// Cargar modelo del cuerpo
const loader = new GLTFLoader()

// Cargar manos
console.log('Cargando manos...')
loader.load(
  '/Modelos GLB/hand-arm.glb',
  (gltf) => {
    console.log('✓ Manos cargadas correctamente')
    console.log('Estructura del modelo:', gltf.scene)
    
    const makeArm = (mirror) => {
      const model = gltf.scene.clone()
      
      // Log de la geometría
      let meshCount = 0
      model.traverse(child => {
        if (child.isMesh) {
          meshCount++
          child.castShadow = true
          console.log(`Malla ${meshCount}:`, child.name, { 
            geometry: child.geometry, 
            position: child.position 
          })
        }
      })
      console.log(`Total de mallas encontradas: ${meshCount}`)
      
      // Escala MUCHO más grande para debug
      const s = 0.1  // Muy grande para debug
      model.scale.set(s, s, s)
      if (mirror) model.scale.x = -s
      
      // Sin rotaciones complejas por ahora
      model.rotation.x = 0
      model.rotation.z = 0
      
      return model
    }
    
    const leftArm = makeArm(false)
    const rightArm = makeArm(true)
    
    leftGroup.add(leftArm)
    rightGroup.add(rightArm)
    
    console.log('✓ Brazos agregados')
    console.log('leftGroup children:', leftGroup.children.length)
    console.log('rightGroup children:', rightGroup.children.length)
  },
  (progress) => {
    console.log('Cargando manos:', (progress.loaded / progress.total * 100).toFixed(0) + '%')
  },
  (error) => { 
    console.error('✗ Error cargando manos:', error)
  }
)

// HUD
const hud = document.createElement('div')
hud.style.cssText = 'position:fixed;top:16px;left:16px;color:#aaa;font-size:13px;font-family:sans-serif;line-height:2;pointer-events:none;'
hud.innerHTML = `
  <span style="color:#7f77dd;font-weight:bold">Mouse</span> — mirar<br>
  <span style="color:#7f77dd;font-weight:bold">WASD</span> — mano izquierda<br>
  <span style="color:#7f77dd;font-weight:bold">Flechas</span> — mano derecha<br>
  <span style="color:#7f77dd;font-weight:bold">Click</span> — bloquear mouse
`
document.body.appendChild(hud)

// Pointer lock para mirar con el mouse
renderer.domElement.addEventListener('click', () => {
  renderer.domElement.requestPointerLock()
})

let mouseX = 0, mouseY = 0
document.addEventListener('mousemove', e => {
  if (document.pointerLockElement === renderer.domElement) {
    yaw   -= e.movementX * 0.002
    pitch -= e.movementY * 0.002
    pitch = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, pitch))
  } else {
    mouseX =  ((e.clientX / window.innerWidth)  * 2 - 1) * 0.25
    mouseY = -((e.clientY / window.innerHeight) * 2 - 1) * 0.2
  }
})

// Controles teclado
const keys = {}
window.addEventListener('keydown', e => { keys[e.code] = true; if(e.code==='Space') e.preventDefault() })
window.addEventListener('keyup',   e => keys[e.code] = false)

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

const leftBase  = new THREE.Vector3(-0.05, -0.25, -0.5)
const rightBase = new THREE.Vector3( 0.05, -0.25, -0.5)
const leftPos   = leftBase.clone()
const rightPos  = rightBase.clone()
const speed = 0.008

function animate() {
  requestAnimationFrame(animate)

  // Mover mano izquierda con WASD
  if (keys['KeyA']) leftPos.x -= speed
  if (keys['KeyD']) leftPos.x += speed
  if (keys['KeyW']) leftPos.y += speed
  if (keys['KeyS']) leftPos.y -= speed

  leftPos.x = Math.max(-0.35, Math.min(0.15, leftPos.x))
  leftPos.y = Math.max(-0.45, Math.min(-0.05, leftPos.y))

  // Mover mano derecha con flechas
  if (keys['ArrowLeft'])  rightPos.x -= speed
  if (keys['ArrowRight']) rightPos.x += speed
  if (keys['ArrowUp'])    rightPos.y += speed
  if (keys['ArrowDown'])  rightPos.y -= speed

  rightPos.x = Math.max(-0.15, Math.min(0.35, rightPos.x))
  rightPos.y = Math.max(-0.45, Math.min(-0.05, rightPos.y))

  leftGroup.position.lerp(leftPos, 0.18)
  rightGroup.position.lerp(rightPos, 0.18)

  leftGroup.rotation.z  =  (leftPos.x  - leftBase.x)  * 0.4
  rightGroup.rotation.z = -(rightPos.x - rightBase.x) * 0.4

  // Actualizar camara
  camera.position.copy(bodyGroup.position).add(headOffset)
  camera.rotation.order = 'YXZ'
  camera.rotation.y = yaw
  camera.rotation.x = pitch

  renderer.render(scene, camera)
}

animate()