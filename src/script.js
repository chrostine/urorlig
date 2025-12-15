import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import GUI from 'lil-gui'

let navn = 'untouchable';

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Axes helper
// const axesHelper = new THREE.AxesHelper()
// scene.add(axesHelper)

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const matcapTexture = textureLoader.load('/textures/matcaps/7.png')
matcapTexture.colorSpace = THREE.SRGBColorSpace

/**
 * Fonts
 */

const fontLoader = new FontLoader()

/**
 * Object
 */

// Raycaster + mouse (til hover)
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

// Gem donuts så vi kan teste hover på dem
const donuts = []

// Track hvilken donut vi hover
let hoveredDonut = null

// Mousemove (opdater musens position i NDC)
window.addEventListener('mousemove', (event) =>
{
    mouse.x = (event.clientX / sizes.width) * 2 - 1
    mouse.y = -(event.clientY / sizes.height) * 2 + 1
})

fontLoader.load(
    '/fonts/helvetiker_regular.typeface.json',
    (font) =>
    {
        const textGeometry = new TextGeometry(
            navn,
            {
                font: font,
                size: 0.5,
                depth: 0.2,
                curveSegments: 5,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 4
            }
        )

        textGeometry.center()

        const material = new THREE.MeshMatcapMaterial({ matcap: matcapTexture })
        const text = new THREE.Mesh(textGeometry, material)
        scene.add(text)

        const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45)

        for (let i = 0; i < 300; i++)
        {
            const donut = new THREE.Mesh(donutGeometry, material)

            // ændrer posistion
            donut.position.x = (Math.random() - 0.5) * 20
            donut.position.y = (Math.random() - 0.5) * 20
            donut.position.z = (Math.random() - 0.5) * 20

            // ændrer rotation
            donut.rotation.x = Math.random() * Math.PI
            donut.rotation.y = Math.random() * Math.PI

            // ændrer størrelsen
            const scale = Math.random()
            donut.scale.set(scale, scale, scale)

            // data til smooth animation
            donut.userData.target = donut.position.clone()

            scene.add(donut)
            donuts.push(donut)
        }
    }
)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    controls.update()

    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(donuts)

    if (intersects.length > 0)
    {
        const donut = intersects[0].object

        if (donut !== hoveredDonut)
        {
            hoveredDonut = donut

            // sæt nyt target i tilfældig retning
            const power = 1.2
            donut.userData.target = donut.position.clone().add(
                new THREE.Vector3(
                    (Math.random() - 0.5) * power,
                    (Math.random() - 0.5) * power,
                    (Math.random() - 0.5) * power
                )
            )
        }
    }
    else
    {
        hoveredDonut = null
    }

    for (const donut of donuts)
    {
        donut.position.lerp(donut.userData.target, 0.05)
    }

    renderer.render(scene, camera)

    window.requestAnimationFrame(tick)
}

tick()
