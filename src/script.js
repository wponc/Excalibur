import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

THREE.ColorManagement.enabled = false

/**
 * Base
 */
// Debug
// const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color( 0x473a4a );

const geometry = new THREE.PlaneGeometry(4.5,4, 300,300)

const count = geometry.attributes.position.count
const randoms = new Float32Array(count)

for(let i = 0; i < count; i++)
{
    randoms[i] = Math.random()
}

geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1))

let material;
const mesh = new THREE.Mesh(
    geometry,
    material = new THREE.ShaderMaterial({
        wireframe:true,
        uniforms:
        {
            uFrequency: { value: new THREE.Vector2(10,10) },
            uTime: { value: 0 },
            u_scroll: {type: 'f', value: 0.0}
        },
        vertexShader: `
        uniform vec2 uFrequency;
        uniform float uTime;

        varying vec2 vUv;
        varying float vElevation;

        void main()
        {
            vec4 modelPosition = modelMatrix * vec4(position, 1.0);

            float elevation = sin(modelPosition.x * uFrequency.x - uTime) * 0.075;
            elevation += sin(modelPosition.y * uFrequency.y - uTime) * 0.075;

            modelPosition.z += elevation;

            vec4 viewPosition = viewMatrix * modelPosition;
            vec4 projectedPosition = projectionMatrix * viewPosition;

            gl_Position = projectedPosition;

            vUv = uv;
            vElevation = elevation;
        }
        `,
        fragmentShader: `
        uniform vec3 uColor;
        uniform sampler2D uTexture;
        uniform float u_scroll;
        uniform float uTime;



        varying vec2 vUv;
        varying float vElevation;

        void main()
        {
            vec4 textureColor = texture2D(uTexture, vUv);
            textureColor.rgb *= vElevation * 2.0 + 0.65;
            // gl_FragColor = vec4(vUv, vUv.y + cos(uTime) , 1.0);
            gl_FragColor = vec4(vUv, vUv.y + cos(uTime) * 0.5 , 1.0);
        }
        `
    })
)
scene.add(mesh)
let scrollY;
window.addEventListener('scroll', () =>
{
    scrollY = window.scrollY
})

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
camera.position.z = 1
camera.position.y = -0.3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha:true
})
renderer.outputColorSpace = THREE.LinearSRGBColorSpace
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    material.uniforms.uTime.value = elapsedTime * 0.5
    material.uniforms.u_scroll.value = scrollY;
    // console.log(material.uniforms.u_scroll.value)

    // console.log(scrollY)


    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
