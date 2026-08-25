import { EXRLoader } from 'three/addons/loaders/EXRLoader.js'
import { Reflector } from 'three/addons/objects/Reflector.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { AfterimagePass } from 'three/addons/postprocessing/AfterimagePass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import './style.css'
import * as THREE from 'three'


import { mountCaseStudy } from './case-study-template.js'
import {
  yasmunCaseStudy,
  handHeartCaseStudy,
  traDaMentorCaseStudy
} from './case-study-example.js'

import './case-study-template.css'

const munImageUrl = new URL(
  './assets/Youth-Ascendency-Model-Cover.png',
  import.meta.url
).href

const handHeartImageUrl = new URL(
  './assets/HAND-and-HEART-cover.png',
  import.meta.url
).href

const traDaMentorImageUrl = new URL(
  './assets/Tra-Da-Mentor-cover.png',
  import.meta.url
).href

const environmentUrl = new URL(
  './assets/enviroment-2.glb',
  import.meta.url
).href

const HOME_DESTINATIONS = [
  {label: 'Contact', page: 'contact'},
  {label: 'Work', page: 'work'},
  {label: 'About', page: 'about'},
]

const HOME_START_INDEX = 1
const HOME_ANGLE_STEP = THREE.MathUtils.degToRad(56)
const HOME_RADIUS_RATIO = 0.46
const HOME_EASE = 0.1
const TRANSITION_CLIP_SPEED = 1.25

const environmentExrUrl = new URL(
  './assets/overcast_soil_4k.exr',
  import.meta.url
).href

const workProjects = [
  {
    client: 'Youth Ascendency Model United Nations',
    title: 'How far can a formal organization push its visual language without losing trust?',
    image: munImageUrl,
    imageAlt: 'Youth Ascendency Model United Nations campaign',
    tags: ['Visual Identity', 'Campaign'],

    routeSlug: 'yasmun',
    caseStudy: yasmunCaseStudy
  },
  {
    client: 'HEART & HAND',
    title: 'typography became the visual language.',
    image: handHeartImageUrl,
    imageAlt: 'HEART & HAND campaign',
    tags: ['Visual Identity'],

    routeSlug: 'hand-heart',
    caseStudy: handHeartCaseStudy
  },
  {
    client: 'Tra Da Mentor',
    title: 'How can a website evolve from a collection of pages into a system that supports both its users and the organization behind it?',
    image: traDaMentorImageUrl,
    imageAlt: 'Tra Da Mentor digital experience',
    tags: ['Visual Identity', 'Digital Experience'],

    routeSlug: 'tra-da-mentor',
    caseStudy: traDaMentorCaseStudy
  }
]

const WORK_ENTRY_POSITION = -0.9
const WORK_ANGLE_STEP = THREE.MathUtils.degToRad(58)
const WORK_RADIUS_RATIO = 0.62
const WORK_EASE = 0.085

const SITE_PAGES = new Set(['home', 'about', 'work'])
const declaredInitialPage = document.body.dataset.initialPage
const initialPage = SITE_PAGES.has(declaredInitialPage)
  ? declaredInitialPage
  : 'home'
const initialCaseStudySlug =
  document.body.dataset.initialCaseStudy ?? null
const siteBaseUrl = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`
const siteUrl = (path = '') => new URL(
  `${siteBaseUrl}${path}`,
  window.location.origin
).href
const pageRoutes = {
  home: siteUrl(),
  about: siteUrl('about/'),
  work: siteUrl('work/')
}
const caseStudyRoutes = Object.fromEntries(
  workProjects.map((project) => [
    project.routeSlug,
    siteUrl(`work/${project.routeSlug}/`)
  ])
)

function getCaseStudySlugFromLocation() {
  const currentPath = window.location.pathname.replace(/\/+$/, '')

  return Object.entries(caseStudyRoutes).find(([, href]) => (
    new URL(href).pathname.replace(/\/+$/, '') === currentPath
  ))?.[0] ?? null
}

function getPageFromLocation() {
  const currentPath = window.location.pathname.replace(/\/+$/, '')

  return Object.entries(pageRoutes).find(([, href]) => (
    new URL(href).pathname.replace(/\/+$/, '') === currentPath
  ))?.[0] ?? null
}

let currentPage = initialPage
let isTransitioning = initialPage === 'home'
let isIntroTransition = initialPage === 'home'
let activeTransitionTargetPage = null

let mixer = null
let activeTransitionAction = null
let activeTransitionFinishHandler = null
let rippleShader = null
let clips = []
const tabletTrimmedClipBySource = new WeakMap()
const phoneAboutWorkTrimmedClipBySource = new WeakMap()
const phoneWorkAboutTrimmedClipBySource = new WeakMap()
let environmentScene = null

let planarWaterReflector = null
let planarReflectionFrame = 0
let planarReflectionHasRendered = false

function getRendererPixelRatio() {
  const maximumRatio = window.innerWidth <= 1024
    ? 1.25
    : 1.5

  return Math.min(window.devicePixelRatio, maximumRatio)
}

function getPlanarReflectionSize() {
  const qualityScale = window.innerWidth <= 1024
    ? 0.42
    : 0.5
  const scale =
    Math.min(window.devicePixelRatio, 1.25)
    * qualityScale

  return {
    width: Math.min(
      Math.max(Math.round(window.innerWidth * scale), 320),
      1024
    ),
    height: Math.min(
      Math.max(Math.round(window.innerHeight * scale), 320),
      1024
    )
  }
}

function resizePlanarWaterReflection() {
  if (!planarWaterReflector) return

  const { width, height } = getPlanarReflectionSize()

  planarWaterReflector.getRenderTarget().setSize(
    width,
    height
  )
  planarWaterReflector.forceUpdate = true
}
const loadingScreen = document.querySelector('.site-loader')

function hideLoadingScreen() {
  loadingScreen?.classList.add('is-hidden')
}

const mapNavigation = document.querySelector('.map-navigation')

mapNavigation.classList.add('is-transitioning')

const brandButton = document.querySelector(
  '.map-navigation__brand'
)

const leftNavigation = document.querySelector(
  '.map-navigation__side--left'
)

const rightNavigation = document.querySelector(
  '.map-navigation__side--right'
)

brandButton.append(createBrandMark())

const navButtons = document.querySelectorAll('[data-page]')

const mobileNavigation = document.querySelector(
  '.site-mobile-navigation'
)

const mobileMenuToggle = document.querySelector(
  '.site-mobile-navigation__toggle'
)

const mobileMenu = document.querySelector(
  '.site-mobile-menu'
)

const mobileMenuButtons = Array.from(
  mobileMenu.querySelectorAll('[data-page]')
)

let isMobileMenuOpen = false

function setMobileMenuOpen(open, restoreFocus = false) {
  isMobileMenuOpen = open

  mobileNavigation.classList.toggle('is-open', open)
  document.body.classList.toggle('is-site-menu-open', open)

  mobileMenuToggle.setAttribute(
    'aria-expanded',
    String(open)
  )

  mobileMenuToggle.setAttribute(
    'aria-label',
    open ? 'Close menu' : 'Open menu'
  )

  mobileMenu.setAttribute(
    'aria-hidden',
    String(!open)
  )

  if (open) {
    requestAnimationFrame(() => {
      mobileMenuButtons[0]?.focus()
    })
  } else if (restoreFocus) {
    mobileMenuToggle.focus()
  }
}

mobileMenuToggle.addEventListener('click', () => {
  setMobileMenuOpen(!isMobileMenuOpen)
})

mobileMenuButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setMobileMenuOpen(false)
  })
})

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && isMobileMenuOpen) {
    event.preventDefault()
    setMobileMenuOpen(false, true)
  }
})

const timer = new THREE.Timer()

// Scene
const scene = new THREE.Scene()

// Cool gray-green atmosphere shared by the shadows and water.
scene.background = new THREE.Color(0x596260)

// ---------- COOL AMBIENCE, DIRECTIONAL WARM LIGHTING ----------

// Brighter ambient illumination keeps shadowed surfaces readable.
const overcastAmbient = new THREE.HemisphereLight(
  0x82908c,
  0x596260,
  0.5
)

scene.add(overcastAmbient)

// High side-key for long diagonal shadows.
const warmKey = new THREE.DirectionalLight(
  0xff5a00,
  2.7
)

warmKey.position.set(-20, 35, 8)
warmKey.target.position.set(2, -3, -15)

warmKey.castShadow = true
warmKey.shadow.mapSize.set(1024, 1024)
warmKey.shadow.radius = 4
warmKey.shadow.camera.near = 0.5
warmKey.shadow.camera.far = 90
warmKey.shadow.camera.left = -28
warmKey.shadow.camera.right = 28
warmKey.shadow.camera.top = 28
warmKey.shadow.camera.bottom = -28
warmKey.shadow.bias = -0.00035
warmKey.shadow.normalBias = 0.035

scene.add(warmKey)
scene.add(warmKey.target)

// Neutral fill keeps the dark faces from becoming black.
const neutralFill = new THREE.DirectionalLight(
  0x879490,
  0.22
)

neutralFill.position.set(10, 7, 5)
neutralFill.target.position.set(0, -3, -15)

scene.add(neutralFill)
scene.add(neutralFill.target)

// Warm light across the introductory structures.
const introRightLight = new THREE.DirectionalLight(
  0xff6200,
  0.42
)

introRightLight.position.set(16, 10, -8)
introRightLight.target.position.set(0, -4, -18)

scene.add(introRightLight)
scene.add(introRightLight.target)

// Strong orange rim from behind.
const warmRim = new THREE.DirectionalLight(
  0xff4f00,
  1.35
)

warmRim.position.set(18, 12, -14)
warmRim.target.position.set(3, -1, -18)

scene.add(warmRim)
scene.add(warmRim.target)

// Second rim for the opposite silhouettes.
const amberRim = new THREE.DirectionalLight(
  0xff7000,
  1.05
)

amberRim.position.set(-18, 12, -14)
amberRim.target.position.set(-3, -1, -18)

scene.add(amberRim)
scene.add(amberRim.target)

// Focused bright area on the left-hand forms.
const warmPoolLeft = new THREE.SpotLight(
  0xff5900,
  26,
  75,
  THREE.MathUtils.degToRad(25),
  0.72,
  1.45
)

warmPoolLeft.position.set(-10, 15, 5)
warmPoolLeft.target.position.set(-4, -4, -15)

scene.add(warmPoolLeft)
scene.add(warmPoolLeft.target)

// Focused upper accent for the left arch on the home composition.
const warmArchAccent = new THREE.SpotLight(
  0xff6500,
  1200,
  95,
  THREE.MathUtils.degToRad(24),
  0.18,
  1.2
)

warmArchAccent.position.set(-9, 13, 2)
warmArchAccent.target.position.set(-4.5, 3.75, -15)

warmArchAccent.visible = false

scene.add(warmArchAccent)
scene.add(warmArchAccent.target)

// Focused lower accent for the circular arch on the About composition.
const warmLowerArchAccent = new THREE.SpotLight(
  0xff5900,
  1350,
  95,
  THREE.MathUtils.degToRad(26),
  0.24,
  1.2
)

warmLowerArchAccent.visible = false

scene.add(warmLowerArchAccent)
scene.add(warmLowerArchAccent.target)

// Focused bright area on the right-hand forms.
const warmPoolRight = new THREE.SpotLight(
  0xff4300,
  22,
  70,
  THREE.MathUtils.degToRad(22),
  0.78,
  1.5
)

warmPoolRight.position.set(13, 12, 2)
warmPoolRight.target.position.set(5, -4, -17)

scene.add(warmPoolRight)
scene.add(warmPoolRight.target)

// Three.js fallback camera
let camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)

camera.position.z = 5

// Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true
})

renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(getRendererPixelRatio())

renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.shadowMap.autoUpdate = false
renderer.shadowMap.needsUpdate = true

document.body.appendChild(renderer.domElement)

renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 0.55

// ---------- TRANSITION GHOST / TEMPORAL MOTION TRAIL ----------

const TRANSITION_GHOST_PIXEL_RATIO = 0.72
const TRANSITION_GHOST_DAMPING = 0.7
const TRANSITION_GHOST_STRENGTH = 0.6
const TRANSITION_ARCHITECTURE_MASK_LAYER = 1
const TRANSITION_ARCHITECTURE_MASK_RATIO = 0.5

const transitionArchitectureMaskMaterial =
  new THREE.MeshBasicMaterial({
    color: 0xffffff,
    toneMapped: false
  })
const transitionArchitectureMaskBackground =
  new THREE.Color(0x000000)

let transitionArchitectureMaskCurrent =
  new THREE.WebGLRenderTarget(1, 1, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    depthBuffer: true
  })
let transitionArchitectureMaskPrevious =
  transitionArchitectureMaskCurrent.clone()

function resizeTransitionArchitectureMasks() {
  const maskPixelRatio = Math.min(
    window.devicePixelRatio,
    1
  ) * TRANSITION_ARCHITECTURE_MASK_RATIO
  const width = Math.max(
    1,
    Math.round(window.innerWidth * maskPixelRatio)
  )
  const height = Math.max(
    1,
    Math.round(window.innerHeight * maskPixelRatio)
  )

  transitionArchitectureMaskCurrent.setSize(
    width,
    height
  )
  transitionArchitectureMaskPrevious.setSize(
    width,
    height
  )
}

resizeTransitionArchitectureMasks()

const transitionComposer = new EffectComposer(renderer)
const transitionRenderPass = new RenderPass(scene, camera)
const transitionAfterimagePass = new AfterimagePass(
  TRANSITION_GHOST_DAMPING
)
const transitionOutputPass = new OutputPass()

transitionAfterimagePass.uniforms.uGhostTime = {
  value: 0
}
transitionAfterimagePass.uniforms.uGhostStrength = {
  value: TRANSITION_GHOST_STRENGTH
}
transitionAfterimagePass.uniforms.uGhostDirection = {
  value: new THREE.Vector2(1, 0.08)
}
transitionAfterimagePass.uniforms.tArchitectureMask = {
  value: transitionArchitectureMaskPrevious.texture
}

transitionAfterimagePass.compFsMaterial.fragmentShader = `
uniform float damp;
uniform float uGhostTime;
uniform float uGhostStrength;
uniform vec2 uGhostDirection;
uniform sampler2D tOld;
uniform sampler2D tNew;
uniform sampler2D tArchitectureMask;

varying vec2 vUv;

float ghostHash(float value) {
  return fract(sin(value * 127.1) * 43758.5453);
}

float organicRowNoise(float value) {
  float row = floor(value);
  float blend = fract(value);
  blend = blend * blend * (3.0 - 2.0 * blend);

  return mix(
    ghostHash(row),
    ghostHash(row + 1.0),
    blend
  );
}

vec2 safeGhostUv(vec2 uv) {
  return clamp(uv, vec2(0.002), vec2(0.998));
}

float temporalActivity(
  vec3 historicalColor,
  vec3 currentColor
) {
  float colorDifference = length(
    historicalColor - currentColor
  );

  return smoothstep(0.022, 0.29, colorDifference);
}

void main() {
  vec4 currentFrame = texture2D(tNew, vUv);

  float directionSign = sign(
    uGhostDirection.x + 0.0001
  );

  float broadVariation = organicRowNoise(
    vUv.y * 17.0 + 3.7
  );
  float fineVariation = organicRowNoise(
    vUv.y * 53.0 + 19.0
  );

  // Twice the previous spatial reach.
  float smearReach = mix(
    0.006,
    0.036,
    broadVariation
  ) * mix(0.82, 1.18, fineVariation);

  vec2 smearDirection = vec2(
    directionSign * smearReach,
    0.0
  );

  vec3 trailColor = vec3(0.0);
  float trailEnergy = 0.0;
  float totalWeight = 0.0;

  // Eighteen closely spaced history taps replace the six
  // visible exposure layers with a much softer continuous drag.
  for (int sampleIndex = 1; sampleIndex <= 18; sampleIndex++) {
    float sampleProgress =
      float(sampleIndex) / 12.0;
    float curvedProgress = pow(
      sampleProgress,
      1.08
    );
    float sampleWeight = mix(
      1.0,
      0.16,
      sampleProgress
    );

    vec4 historySample = texture2D(
      tOld,
      safeGhostUv(
        vUv + smearDirection * curvedProgress
      )
    );

    float activity = temporalActivity(
      historySample.rgb,
      currentFrame.rgb
    );

    float architectureSource = texture2D(
      tArchitectureMask,
      safeGhostUv(
        vUv + smearDirection * curvedProgress
      )
    ).r;

    // Only historical architecture pixels may seed a trail.
    // The resulting smear can extend over the sky, but the sky
    // itself can never be pulled back into the pillars.
    activity *= smoothstep(
      0.08,
      0.72,
      architectureSource
    );

    trailColor +=
      historySample.rgb
      * activity
      * sampleWeight;
    trailEnergy += activity * sampleWeight;
    totalWeight += sampleWeight;
  }

  vec3 ghostColor = trailColor / max(
    trailEnergy,
    0.0001
  );

  float normalizedTrailEnergy =
    trailEnergy / max(totalWeight, 0.0001);

  float organicFalloff = mix(
    0.8,
    1.0,
    broadVariation * fineVariation
  );

  float ghostAmount =
    uGhostStrength
    * damp
    * smoothstep(
      0.025,
      0.58,
      normalizedTrailEnergy
    )
    * organicFalloff;

  ghostColor.b *= 1.02;

  gl_FragColor = vec4(
    mix(currentFrame.rgb, ghostColor, ghostAmount),
    currentFrame.a
  );
}
`
transitionAfterimagePass.compFsMaterial.needsUpdate = true

transitionComposer.addPass(transitionRenderPass)
transitionComposer.addPass(transitionAfterimagePass)
transitionComposer.addPass(transitionOutputPass)
transitionComposer.setPixelRatio(
  Math.min(
    getRendererPixelRatio(),
    TRANSITION_GHOST_PIXEL_RATIO
  )
)
transitionComposer.setSize(
  window.innerWidth,
  window.innerHeight
)

let transitionGhostNeedsReset = true

function resetTransitionGhostHistory() {
  const previousRenderTarget = renderer.getRenderTarget()
  const previousClearColor = renderer.getClearColor(
    new THREE.Color()
  )
  const previousClearAlpha = renderer.getClearAlpha()

  renderer.setClearColor(0x000000, 1)

  renderer.setRenderTarget(
    transitionAfterimagePass._textureOld
  )
  renderer.clear()

  renderer.setRenderTarget(
    transitionAfterimagePass._textureComp
  )
  renderer.clear()

  renderer.setRenderTarget(
    transitionArchitectureMaskCurrent
  )
  renderer.clear()

  renderer.setRenderTarget(
    transitionArchitectureMaskPrevious
  )
  renderer.clear()

  renderer.setClearColor(
    previousClearColor,
    previousClearAlpha
  )
  renderer.setRenderTarget(previousRenderTarget)
  transitionGhostNeedsReset = false
}

function renderTransitionArchitectureMask() {
  if (!environmentScene) return

  const previousRenderTarget = renderer.getRenderTarget()
  const previousBackground = scene.background
  const previousOverrideMaterial = scene.overrideMaterial
  const previousCameraLayerMask = camera.layers.mask

  scene.background =
    transitionArchitectureMaskBackground
  scene.overrideMaterial =
    transitionArchitectureMaskMaterial
  camera.layers.set(
    TRANSITION_ARCHITECTURE_MASK_LAYER
  )

  renderer.setRenderTarget(
    transitionArchitectureMaskCurrent
  )
  renderer.clear()
  renderer.render(scene, camera)

  camera.layers.mask = previousCameraLayerMask
  scene.overrideMaterial = previousOverrideMaterial
  scene.background = previousBackground
  renderer.setRenderTarget(previousRenderTarget)

  transitionAfterimagePass.uniforms
    .tArchitectureMask.value =
      transitionArchitectureMaskPrevious.texture
}

function commitTransitionArchitectureMask() {
  const completedMask =
    transitionArchitectureMaskCurrent

  transitionArchitectureMaskCurrent =
    transitionArchitectureMaskPrevious
  transitionArchitectureMaskPrevious = completedMask
}

function prepareTransitionGhost(reverse) {
  const directionSign = reverse ? -1 : 1
  const direction =
    transitionAfterimagePass.uniforms
      .uGhostDirection.value

  // Keep the temporal drag horizontal on every device.
  direction.set(directionSign, 0)

  transitionGhostNeedsReset = true
}

// ---------- TYPOGRAPHY-ALIGNED STRIPE LIGHT ----------

const stripeLightSettings = {
  home: {
    color: 0xff5a00,
    intensity: 2300,
    angle: 58,
    distance: 18,
    sourceX: -5,
    sourceY: 6,
    targetX: 0,
    targetY: -1,
    waterStrength: 0.24,
    waterOffset: 0.2,
    gobo: 'home',
    penumbra: 0.025,
    decay: 1.25
  },
  about: {
    color: 0xff6200,
    intensity: 2300,
    angle: 60,
    distance: 14,
    sourceX: -5,
    sourceY: 6,
    targetX: 0,
    targetY: -0.5,
    waterStrength: 0.3,
    waterOffset: 1.7,
    gobo: 'about',
    penumbra: 0.025,
    decay: 1.25
  },
  work: {
    color: 0xff4d00,
    intensity: 2500,
    angle: 62,
    distance: 14,
    sourceX: -5,
    sourceY: 6,
    targetX: 0,
    targetY: -0.75,
    waterStrength: 0.34,
    waterOffset: 3.1,
    gobo: 'work',
    penumbra: 0.025,
    decay: 1.25
  }
}

function createStripeGoboTexture({
  rotation = -32,
  spacing = 150,
  bandWidth = 76,
  sharpEdges = false
} = {}) {
  const canvas = document.createElement('canvas')

  canvas.width = 512
  canvas.height = 512

  const context = canvas.getContext('2d')

  context.fillStyle = '#000'
  context.fillRect(0, 0, canvas.width, canvas.height)

  context.save()
  context.translate(canvas.width / 2, canvas.height / 2)
  context.rotate(THREE.MathUtils.degToRad(rotation))

  const stripePattern = [
    { gap: 0.6, weight: 1.8, opacity: 1 },
    { gap: 1.55, weight: 0.38, opacity: 0.7 },
    { gap: 0.78, weight: 0.92, opacity: 0.95 },
    { gap: 2.05, weight: 0.26, opacity: 0.62 },
    { gap: 0.52, weight: 1.32, opacity: 0.88 },
    { gap: 1.28, weight: 0.56, opacity: 0.78 }
  ]

  let stripeY = -620
  let stripeIndex = 0

  while (stripeY <= 620) {
    const stripe =
      stripePattern[stripeIndex % stripePattern.length]
    const currentBandWidth = bandWidth * stripe.weight
    const halfBandWidth = currentBandWidth / 2
    const gradient = context.createLinearGradient(
      0,
      stripeY - halfBandWidth,
      0,
      stripeY + halfBandWidth
    )

    if (sharpEdges) {
      gradient.addColorStop(0, '#000')
      gradient.addColorStop(0.08, '#000')
      gradient.addColorStop(0.17, '#fff')
      gradient.addColorStop(0.83, '#fff')
      gradient.addColorStop(0.92, '#000')
      gradient.addColorStop(1, '#000')
    } else {
      gradient.addColorStop(0, '#000')
      gradient.addColorStop(0.22, '#777')
      gradient.addColorStop(0.42, '#fff')
      gradient.addColorStop(0.58, '#fff')
      gradient.addColorStop(0.78, '#777')
      gradient.addColorStop(1, '#000')
    }

    context.fillStyle = gradient
    context.globalAlpha = stripe.opacity
    context.fillRect(
      -720,
      stripeY - halfBandWidth,
      1440,
      currentBandWidth
    )

    stripeY += spacing * stripe.gap
    stripeIndex += 1
  }

  context.globalAlpha = 1

  context.restore()

  const texture = new THREE.CanvasTexture(canvas)

  texture.colorSpace = THREE.SRGBColorSpace
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = true
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
  texture.needsUpdate = true

  return texture
}

const stripeGoboTexture = createStripeGoboTexture()
const homeStripeGoboTexture = createStripeGoboTexture({
  rotation: -38,
  spacing: 130,
  bandWidth: 72,
  sharpEdges: true
})
const aboutStripeGoboTexture = createStripeGoboTexture({
  rotation: -20,
  spacing: 115,
  bandWidth: 70,
  sharpEdges: true
})
const workStripeGoboTexture = createStripeGoboTexture({
  rotation: -42,
  spacing: 110,
  bandWidth: 66,
  sharpEdges: true
})

const stripeGoboTextures = {
  home: homeStripeGoboTexture,
  about: aboutStripeGoboTexture,
  work: workStripeGoboTexture
}

const stripeLight = new THREE.SpotLight(
  0xff5a00,
  1250,
  95,
  THREE.MathUtils.degToRad(34),
  0.12,
  1.6
)

stripeLight.name = 'Typography stripe projector'
stripeLight.map = stripeGoboTexture
stripeLight.castShadow = true
stripeLight.visible = false
stripeLight.shadow.mapSize.set(512, 512)
stripeLight.shadow.radius = 4
stripeLight.shadow.camera.near = 0.5
stripeLight.shadow.camera.far = 110
stripeLight.shadow.bias = -0.0003
stripeLight.shadow.normalBias = 0.025

scene.add(stripeLight)
scene.add(stripeLight.target)

const stripeCameraPosition = new THREE.Vector3()
const stripeCameraQuaternion = new THREE.Quaternion()
const stripeForward = new THREE.Vector3()
const stripeRight = new THREE.Vector3()
const stripeUp = new THREE.Vector3()
const stripeTargetPosition = new THREE.Vector3()
const stripeDrawingBufferSize = new THREE.Vector2()

function updateStripeLighting(page) {
  const settings = stripeLightSettings[page]

  const shouldShow = Boolean(
    settings &&
    !document.body.classList.contains('is-case-study')
  )

  stripeLight.visible = shouldShow

  const shouldShowArchAccent = shouldShow && page === 'home'
  warmArchAccent.visible = shouldShowArchAccent

  const shouldShowLowerArchAccent = shouldShow && page === 'about'
  warmLowerArchAccent.visible = shouldShowLowerArchAccent

  if (rippleShader) {
    rippleShader.uniforms.uStripeVisibility.value =
      shouldShow ? 1 : 0
  }

  if (!shouldShow) return

  const compactScale = responsiveState === 'desktop'
    ? 1
    : responsiveState === 'tablet'
      ? 0.82
      : 0.68

  camera.getWorldPosition(stripeCameraPosition)
  camera.getWorldQuaternion(stripeCameraQuaternion)

  stripeForward
    .set(0, 0, -1)
    .applyQuaternion(stripeCameraQuaternion)
    .normalize()

  stripeRight
    .set(1, 0, 0)
    .applyQuaternion(stripeCameraQuaternion)
    .normalize()

  stripeUp
    .set(0, 1, 0)
    .applyQuaternion(stripeCameraQuaternion)
    .normalize()

  stripeTargetPosition
    .copy(stripeCameraPosition)
    .addScaledVector(
      stripeForward,
      settings.distance * compactScale
    )
    .addScaledVector(
      stripeRight,
      settings.targetX * compactScale
    )
    .addScaledVector(
      stripeUp,
      settings.targetY * compactScale
    )

  stripeLight.position
    .copy(stripeCameraPosition)
    .addScaledVector(stripeForward, -2.5)
    .addScaledVector(
      stripeRight,
      settings.sourceX * compactScale
    )
    .addScaledVector(
      stripeUp,
      settings.sourceY * compactScale
    )

  stripeLight.target.position.copy(stripeTargetPosition)

  if (shouldShowArchAccent) {
    warmArchAccent.position
      .copy(stripeCameraPosition)
      .addScaledVector(stripeForward, -2)
      .addScaledVector(stripeRight, -3.5 * compactScale)
      .addScaledVector(stripeUp, 6.5 * compactScale)

    warmArchAccent.target.position
      .copy(stripeCameraPosition)
      .addScaledVector(stripeForward, 18 * compactScale)
      .addScaledVector(stripeRight, -3.25 * compactScale)
      .addScaledVector(stripeUp, 3.8 * compactScale)

    warmArchAccent.updateMatrixWorld()
    warmArchAccent.target.updateMatrixWorld()
  }

  if (shouldShowLowerArchAccent) {
    warmLowerArchAccent.position
      .copy(stripeCameraPosition)
      .addScaledVector(stripeForward, -2)
      .addScaledVector(stripeUp, 1.5 * compactScale)

    warmLowerArchAccent.target.position
      .copy(stripeCameraPosition)
      .addScaledVector(stripeForward, 16 * compactScale)
      .addScaledVector(stripeUp, -5.25 * compactScale)

    warmLowerArchAccent.updateMatrixWorld()
    warmLowerArchAccent.target.updateMatrixWorld()
  }

  stripeLight.color.setHex(settings.color)
  stripeLight.intensity = settings.intensity
  stripeLight.angle =
    THREE.MathUtils.degToRad(settings.angle)
  stripeLight.map =
    stripeGoboTextures[settings.gobo]
    ?? stripeGoboTexture
  stripeLight.penumbra = settings.penumbra ?? 0.12
  stripeLight.decay = settings.decay ?? 1.6

  stripeLight.updateMatrixWorld()
  stripeLight.target.updateMatrixWorld()
  stripeLight.shadow.needsUpdate = true
  renderer.shadowMap.needsUpdate = true

  if (rippleShader) {
    rippleShader.uniforms.uStripeColor.value.setHex(
      settings.color
    )

    rippleShader.uniforms.uStripeStrength.value =
      settings.waterStrength

    rippleShader.uniforms.uStripeOffset.value =
      settings.waterOffset

    renderer.getDrawingBufferSize(
      stripeDrawingBufferSize
    )

    rippleShader.uniforms.uStripeResolution.value.copy(
      stripeDrawingBufferSize
    )
  }

}

const pmremGenerator = new THREE.PMREMGenerator(renderer)
pmremGenerator.compileEquirectangularShader()

new EXRLoader()
  .setDataType(THREE.HalfFloatType)
  .load(
    environmentExrUrl,

    (exrTexture) => {
      exrTexture.mapping =
        THREE.EquirectangularReflectionMapping

      const neutralEnvironment =
        pmremGenerator.fromEquirectangular(
          exrTexture
        ).texture

      // Neutral lighting for all physical materials.
      scene.environment = neutralEnvironment
      scene.environmentIntensity = 0.38

      // Show the EXR through empty space while keeping the
      // water reflection capture on the cool base color.
      scene.background = exrTexture
      scene.backgroundIntensity = 0.88
      scene.backgroundBlurriness = 0.06
      scene.backgroundRotation.set(
        0,
        THREE.MathUtils.degToRad(-28),
        0
      )

      pmremGenerator.dispose()
    },

    undefined,

    (error) => {
      console.error('Unable to load EXR environment:', error)
      pmremGenerator.dispose()
    }
  )

// ---------- ABOUT STORY ----------

const aboutStory = document.createElement('main')

aboutStory.className = 'about-story'
aboutStory.setAttribute('aria-label', 'About')
aboutStory.hidden = true

aboutStory.innerHTML = `
  <section class="about-story__panel">
    <p class="about-story__text about-story__text--small">
      What if a design can...
    </p>
  </section>

  <section class="about-story__panel">
    <p class="about-story__text about-story__text--medium">
      ...be highly chaotic...
    </p>
  </section>

  <section class="about-story__panel">
    <p class="about-story__text about-story__text--medium">
      ...but incredibly structured<br>
      at the same time?
    </p>
  </section>

  <section class="about-story__panel">
    <h1 class="about-story__text about-story__statement">
      I've been trying to<br>
      answer that question<br>
      since high school.
    </h1>
  </section>

  <section
    class="about-story__panel about-story__panel--explanation"
  >
    <p class="about-story__text about-story__paragraph about-story__paragraph--top">
      Most of my projects begin as experiments, combining ideas
      that don't seem like they belong together&mdash;3D environments
      with editorial typography, interaction with storytelling,
      and physical space with digital interfaces.
    </p>

    <p class="about-story__text about-story__paragraph about-story__paragraph--bottom">
      Through rapid prototyping and iteration, those messy
      explorations gradually become structured experiences.
    </p>
  </section>
`

const footerLinks = {
  contact: 'mailto:YOUR_EMAIL',
  facebook: 'YOUR_FACEBOOK_URL',
  linkedin: 'YOUR_LINKEDIN_URL'
}

function createBrandMark() {
  const brand = document.createElement('span')

  brand.className = 'brand-mark'
  brand.textContent = 'THE ALTERNATE CLOUD'

  return brand
}

const visibleFooters = new Set()

const footerVisibilityObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        visibleFooters.add(entry.target)
      } else {
        visibleFooters.delete(entry.target)
      }
    })

    mapNavigation.classList.toggle(
      'is-footer-visible',
      visibleFooters.size > 0
    )
  },
  {
    threshold: 0.02
  }
)

function createSiteFooter({ contact, facebook, linkedin }) {
  const footer = document.createElement('footer')

  footer.className = 'site-footer'

  footer.innerHTML = `
    <a class="site-footer__cta" href="${contact}">
      <span class="site-footer__label">GET IN TOUCH</span>
      <span class="site-footer__arrow" aria-hidden="true">&rarr;</span>
    </a>

    <div class="site-footer__identity">
      <button
        class="site-footer__brand"
        type="button"
        aria-label="Return to home"
      ></button>

      <a
        class="social-link social-link--facebook"
        href="${facebook}"
        target="_blank"
        rel="noreferrer"
        aria-label="Facebook"
      >
        <span aria-hidden="true">f</span>
      </a>

      <a
        class="social-link social-link--linkedin"
        href="${linkedin}"
        target="_blank"
        rel="noreferrer"
        aria-label="LinkedIn"
      >
        <span aria-hidden="true">in</span>
      </a>
    </div>
  `

  const footerBrandButton = footer.querySelector(
    '.site-footer__brand'
  )

  footerBrandButton.append(createBrandMark())

  footerBrandButton.addEventListener('click', () => {
    const isCaseStudyOpen =
      document.body.classList.contains('is-case-study')

    if (isCaseStudyOpen) {
      closeCaseStudy('home')
      return
    }

    if (document.body.classList.contains('is-contact-open')) {
      closeContactPanel()

      if (currentPage !== 'home') {
        navigateTo('home')
      }

      return
    }

    if (currentPage === 'home') {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      })

      return
    }

    navigateTo('home')
  })

  footerVisibilityObserver.observe(footer)

  return footer
}

const contactPanel = document.createElement('aside')

contactPanel.className = 'contact-panel'
contactPanel.setAttribute('aria-label', 'Contact')
contactPanel.hidden = true

const contactBackButton = document.createElement('button')

contactBackButton.className = 'contact-panel__back'
contactBackButton.type = 'button'
contactBackButton.setAttribute(
  'aria-label',
  'Close contact and return to the previous page'
)
contactBackButton.textContent = '← Back'
contactBackButton.addEventListener(
  'click',
  closeContactPanel
)

contactPanel.append(contactBackButton)
contactPanel.append(createSiteFooter(footerLinks))

document.body.append(contactPanel)

let contactCloseTimer = null

function openContactPanel() {
  window.clearTimeout(contactCloseTimer)

  contactPanel.hidden = false
  document.body.classList.add('is-contact-open')

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      contactPanel.classList.add('is-visible')
    })
  })
}

function closeContactPanel() {
  contactPanel.classList.remove('is-visible')
  document.body.classList.remove('is-contact-open')

  window.clearTimeout(contactCloseTimer)

  contactCloseTimer = window.setTimeout(() => {
    contactPanel.hidden = true
  }, 850)
}

document.body.appendChild(aboutStory)

const aboutEnding = aboutStory.querySelector(
  '.about-story__panel--explanation'
)

aboutEnding.classList.add('footer-reveal__underlay')

aboutStory.append(createSiteFooter(footerLinks))

const homeStory =
document.createElement('main')

homeStory.className = 'home-landing'
homeStory.setAttribute('aria-label','choose a destination')
homeStory.hidden=true

homeStory.innerHTML = `
  <section class="home-landing__content">
    <div class="home-carousel">
      <div class="home-carousel__track">

      ${HOME_DESTINATIONS.map((destination, index) => `
          <button
            class="home-destination"
            type="button"
            data-home-destination="${index}"
            data-page="${destination.page}"
            tabindex ="-1"
          >
            ${destination.label}
          </button>
        `).join(' ')}
      </div>
    </div>

  </section>
`

document.body.append(homeStory)

const homeDestinationButtons = Array.from(
  homeStory.querySelectorAll('[data-home-destination]')
)

let homeTargetPosition = HOME_START_INDEX
let homeRenderedPosition = HOME_START_INDEX
let homeAnimationFrame = null
let homeSnapTimer = null

function renderHomeCarousel(position) {
  const nearestIndex = Math.round(position)
  const isCompact = window.innerWidth < 1200
  const radius = window.innerWidth * HOME_RADIUS_RATIO
  const archDepth = Math.min(window.innerWidth * 0.11, 210)
  const angleStep =
    (Math.PI * 2) / homeDestinationButtons.length
  const verticalSpacing = Math.min(
    window.innerHeight * 0.16,
    responsiveState === 'phone' ? 128 : 156
  )

  homeDestinationButtons.forEach((button, index) => {
    const offset = index - position
    const distance = Math.abs(offset)
    const angle = offset * angleStep
    const translateX = isCompact
      ? 0
      : Math.sin(angle) * radius
    const translateY = isCompact
      ? offset * verticalSpacing
      : (1 - Math.cos(angle)) * archDepth
    const translateZ = isCompact
      ? 0
      : (Math.cos(angle) - 1) * radius * 0.2
    const rotateZ = isCompact
      ? 0
      : Math.sin(angle) * 30
    const centerAmount = THREE.MathUtils.clamp(
      1 - distance,
      0,
      1
    )
    const scale = THREE.MathUtils.lerp(
      isCompact ? 0.48 : 0.46,
      1,
      centerAmount
    )
    const opacity = THREE.MathUtils.lerp(
      0.74,
      1,
      centerAmount
    )
    const isCentered = index === nearestIndex

    button.style.transform = `
      translate(-50%, -50%)
      translate3d(
        ${translateX}px,
        ${translateY}px,
        ${translateZ}px
      )
      rotateZ(${rotateZ}deg)
      scale(${scale})
    `
    button.style.setProperty('--home-item-opacity', opacity)
    button.style.zIndex = String(
      100 - Math.round(distance * 10)
    )
    button.classList.toggle('is-center', isCentered)
    button.tabIndex = isCentered ? 0 : -1
  })
}
function animateHomeCarousel() {
  homeAnimationFrame = null

  if (homeStory.hidden) return

  const difference = homeTargetPosition - homeRenderedPosition

  if (Math.abs(difference) < 0.0005) {
    homeRenderedPosition = homeTargetPosition
  } else {
    homeRenderedPosition += difference * HOME_EASE
  }

  renderHomeCarousel(homeRenderedPosition)

  if (homeRenderedPosition !== homeTargetPosition) {
    homeAnimationFrame = requestAnimationFrame(
      animateHomeCarousel
    )
  }
}

function scheduleHomeCarouselUpdate() {
  if (homeStory.hidden || homeAnimationFrame !== null) return

  homeAnimationFrame = requestAnimationFrame(
    animateHomeCarousel
  )
}

function getResponsiveState() {
  const width = window.innerWidth

  if (width < 768) {
    return 'phone'
  }

  if (width < 1200) {
    return 'tablet'
  }

  return 'desktop'
}

let responsiveState = getResponsiveState()
let responsiveOrientation = getViewportOrientation()
let responsiveSceneResetTimer = null

function getViewportOrientation() {
  return window.innerWidth >= window.innerHeight
    ? 'landscape'
    : 'portrait'
}

function applyResponsiveScenePose(page = currentPage) {
  if (!mixer || !clips.length || !environmentScene) return

  const poseByPage = {
    home: { clip: 'home-to-about', time: 'start' },
    about: { clip: 'home-to-about', time: 'end' },
    work: { clip: 'home-to-work', time: 'end' }
  }

  const pose = poseByPage[page]
  if (!pose) return

  const responsiveClipName =
    `${responsiveState} ${pose.clip}`.trim().toLowerCase()

  const clip = clips.find(
    candidate =>
      candidate.name.trim().toLowerCase()
      === responsiveClipName
  )

  if (!clip) {
    console.error(
      `Animation "${responsiveClipName}" not found`
    )
    return
  }

  mixer.stopAllAction()

  const action = mixer.clipAction(clip)
  action.reset()
  action.enabled = true
  action.setEffectiveWeight(1)
  action.setEffectiveTimeScale(1)
  action.setLoop(THREE.LoopOnce, 1)
  action.clampWhenFinished = true
  action.time = pose.time === 'end' ? clip.duration : 0
  action.play()
  action.paused = true

  activeTransitionAction = action
  mixer.update(0)

  if (planarWaterReflector) {
    planarWaterReflector.forceUpdate = true
  }

  transitionGhostNeedsReset = true
}

function scheduleResponsiveScenePoseReset() {
  window.clearTimeout(responsiveSceneResetTimer)

  responsiveSceneResetTimer = window.setTimeout(() => {
    if (isTransitioning) {
      scheduleResponsiveScenePoseReset()
      return
    }

    updateResponsiveCamera()
    applyResponsiveScenePose()
  }, 140)
}

function updateResponsiveCamera() {
  responsiveState = getResponsiveState()

  if (environmentScene) {
    const nextCamera = environmentScene.getObjectByName(
      `Camera-${responsiveState}`
    )

    if (nextCamera?.isCamera) {
      camera = nextCamera
    } else {
      console.error(
        `Camera-${responsiveState} was not found`
      )
    }
  }

  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
}

function resetSceneForResponsiveViewport() {
  // Before the GLB exists there is no responsive animation to cancel.
  if (!environmentScene || !mixer) {
    updateResponsiveCamera()
    return
  }

  const destinationPage =
    activeTransitionTargetPage
    ?? (isIntroTransition ? 'home' : currentPage)

  if (activeTransitionFinishHandler) {
    mixer.removeEventListener(
      'finished',
      activeTransitionFinishHandler
    )
    activeTransitionFinishHandler = null
  }

  activeTransitionAction?.stop()
  mixer.stopAllAction()

  currentPage = destinationPage
  activeTransitionTargetPage = null
  isTransitioning = false
  isIntroTransition = false

  updateResponsiveCamera()
  applyResponsiveScenePose(currentPage)

  mapNavigation.classList.add('is-ready')

  if (!document.body.classList.contains('is-case-study')) {
    showPageContent(currentPage)
    updateNavigation()
  }
}

function enforceResponsiveCameraInvariant() {
  if (!environmentScene) return

  const viewportState = getResponsiveState()
  const expectedCamera = environmentScene.getObjectByName(
    `Camera-${viewportState}`
  )

  if (!expectedCamera?.isCamera) return

  if (
    responsiveState !== viewportState
    || camera !== expectedCamera
  ) {
    resetSceneForResponsiveViewport()
  }
}

function setHomeDestination(index) {
  homeTargetPosition = THREE.MathUtils.clamp(
    index,
    0,
    homeDestinationButtons.length - 1
  )

  scheduleHomeCarouselUpdate()
}

function openHomeDestination(page) {
  if (page === 'contact') {
    openContactPanel()
    return
  }

  navigateTo(page)
}

function handleHomeWheel(event) {
  if (
    currentPage !== 'home' ||
    isTransitioning ||
    homeStory.hidden
  ) {
    return
  }

  const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
    ? event.deltaX
    : event.deltaY

  if (Math.abs(delta) < 1) return

  event.preventDefault()

  homeTargetPosition = THREE.MathUtils.clamp(
    homeTargetPosition + delta / 520,
    0,
    homeDestinationButtons.length - 1
  )

  scheduleHomeCarouselUpdate()

  window.clearTimeout(homeSnapTimer)

  homeSnapTimer = window.setTimeout(() => {
    setHomeDestination(Math.round(homeTargetPosition))
  }, 140)
}

window.addEventListener(
  'wheel',
  handleHomeWheel,
  { passive: false }
)

homeDestinationButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    if (isTransitioning) return

    const isPreciselyCentered =
      Math.abs(homeRenderedPosition - index) < 0.02 &&
      Math.abs(homeTargetPosition - index) < 0.02

    if (!isPreciselyCentered) {
      setHomeDestination(index)
      return
    }

    openHomeDestination(button.dataset.page)
  })

  button.addEventListener('keydown', (event) => {
    if (
      event.key === 'ArrowLeft' ||
      event.key === 'ArrowUp'
    ) {
      event.preventDefault()
      setHomeDestination(Math.round(homeTargetPosition) - 1)
    }

    if (
      event.key === 'ArrowRight' ||
      event.key === 'ArrowDown'
    ) {
      event.preventDefault()
      setHomeDestination(Math.round(homeTargetPosition) + 1)
    }
  })
})

const workStory = document.createElement('main')

workStory.className = 'work-story'
workStory.setAttribute('aria-label', 'Selected work')
workStory.hidden = true

const workCarousel = document.createElement('section')
workCarousel.className = 'work-carousel'

workCarousel.style.setProperty(
  '--project-count',
  workProjects.length
)

workCarousel.innerHTML = `
  <div class="work-carousel__stage">
    <div class="work-carousel__track">
      ${workProjects.map((project, index) => `
           <article
              class="work-card"
              data-work-card
              data-index="${index}"
              tabindex="0"
            >
            <img
              class ="work-card__image"
              src="${project.image}"
              alt="${project.imageAlt}"
            >

          <div class="work-card__content">
            <p class="work-card__client">${project.client}</p>
            <h2 class="work-card__title">${project.title}</h2>

            <ul class="work-card__tags" aria-label="Project categories">
              ${project.tags.map(tag => `
                <li class="work-card__tag">${tag}</li>
              `).join('')}
            </ul>
          </div>
        </article>
      `).join('')}
    </div>
  </div>
`
  workStory.append(
    workCarousel,
    createSiteFooter(footerLinks)
  )

  document.body.append(workStory)

  const caseStudyRoot = document.createElement('div')

  caseStudyRoot.className = 'case-study-root'
  caseStudyRoot.hidden = true

  document.body.append(caseStudyRoot)

  let caseStudyReturnScrollY = 0

  const workCards = Array.from(
  workStory.querySelectorAll('[data-work-card]')
)

workCards.forEach((card, index) => {
  function openActiveProject() {
    if (!card.classList.contains('is-active')) return

    const study = workProjects[index].caseStudy

    if (study) {
      openCaseStudy(study)
    }
  }

  card.addEventListener('click', openActiveProject)

  card.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return

    event.preventDefault()
    openActiveProject()
  })
})

let workAnimationFrame = null
let workTargetPosition = 0
let workRenderedPosition = 0

function getWorkScrollPosition() {
  const carouselBounds = workCarousel.getBoundingClientRect()

  const scrollDistance = Math.max(
    workCarousel.offsetHeight - window.innerHeight,
    1
  )

  const progress = THREE.MathUtils.clamp(
    -carouselBounds.top / scrollDistance,
    0,
    1
  )

  return progress * (workCards.length - 1)
}

function renderWorkCarousel(position) {
  const activeIndex = Math.round(position)
  const isCompact = window.innerWidth < 1200

  const radius = isCompact
    ? window.innerHeight * 0.7
    : window.innerWidth * WORK_RADIUS_RATIO

  const angleStep = isCompact
    ? THREE.MathUtils.degToRad(44)
    : WORK_ANGLE_STEP

  workCards.forEach((card, index) => {
    const offset = index - position
    const angle = offset * angleStep
    const distance = Math.abs(offset)

    const translateX = isCompact
      ? 0
      : Math.sin(angle) * radius
    const translateY = isCompact
      ? Math.sin(angle) * radius
      : 0
    const translateZ =
      (Math.cos(angle) - 1) * radius
    const rotateX = isCompact
      ? THREE.MathUtils.radToDeg(angle) * 0.18
      : 0
    const rotateY = isCompact
      ? 0
      : -THREE.MathUtils.radToDeg(angle)

    const opacity = THREE.MathUtils.clamp(
      1.35 - distance * 0.5,
      0,
      1
    )

    const isActive = index === activeIndex

    card.style.transform = `
      translate(-50%, -50%)
      translate3d(
        ${translateX}px,
        ${translateY}px,
        ${translateZ}px
      )
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
    `

    card.style.opacity = opacity

    card.style.zIndex = String(
      1000 - Math.round(distance * 100)
    )

    card.classList.toggle('is-active', isActive)
    card.tabIndex = isActive ? 0 : -1
    card.setAttribute('aria-hidden', String(!isActive))
  })
}

function animateWorkCarousel() {
  workAnimationFrame = null

  if (workStory.hidden) return

  const difference =
    workTargetPosition - workRenderedPosition

  if (Math.abs(difference) < 0.0005) {
    workRenderedPosition = workTargetPosition
  } else {
    workRenderedPosition += difference * WORK_EASE
  }

  renderWorkCarousel(workRenderedPosition)

  if (workRenderedPosition !== workTargetPosition) {
    workAnimationFrame =
      requestAnimationFrame(animateWorkCarousel)
  }
}

function scheduleWorkCarouselUpdate() {
  if (workStory.hidden) return

  workTargetPosition = getWorkScrollPosition()

  if (workAnimationFrame === null) {
    workAnimationFrame =
      requestAnimationFrame(animateWorkCarousel)
  }
}

window.addEventListener(
  'scroll',
  scheduleWorkCarouselUpdate,
  { passive: true }
)

function showPageContent(page) {
  const showHome = page === 'home'
  const showAbout = page === 'about'
  const showWork = page === 'work'

  updateStripeLighting(
    page ?? activeTransitionTargetPage ?? currentPage
  )

  homeStory.classList.remove('is-visible')

  homeStory.hidden = !showHome
  aboutStory.hidden = !showAbout
  workStory.hidden = !showWork

  document.body.classList.toggle('is-home', showHome)
  document.body.classList.toggle('is-about', showAbout)
  document.body.classList.toggle('is-work', showWork)

  if (showHome) {
    homeTargetPosition = HOME_START_INDEX
    homeRenderedPosition = HOME_START_INDEX
    renderHomeCarousel(HOME_START_INDEX)

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        homeStory.classList.add('is-visible')
      })
    })
  }

  if (showAbout || showWork) {
    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto'
      })

      if (showAbout) {
        aboutStory.classList.remove('is-entering')

        // Restart the entrance animation every time About opens.
        void aboutStory.offsetWidth

        aboutStory.classList.add('is-entering')
      }

      
      if (showWork) {
            workStory.classList.remove('is-entering')

      // Restart the fade/rise every time Work opens.
      void workStory.offsetWidth

      workStory.classList.add('is-entering')
      if (workAnimationFrame !== null) {
        cancelAnimationFrame(workAnimationFrame)
        workAnimationFrame = null
      }

      workTargetPosition = 0
      workRenderedPosition = WORK_ENTRY_POSITION

      renderWorkCarousel(workRenderedPosition)

      workAnimationFrame =
        requestAnimationFrame(animateWorkCarousel)
      }
    })
  }
}

function openCaseStudy(
  study,
  preserveReturnScroll = false,
  updateHistory = true
) {
  if (!preserveReturnScroll) {
    caseStudyReturnScrollY = window.scrollY
  }

  showPageContent(null)

  mapNavigation.hidden = true
  caseStudyRoot.hidden = false

  document.body.classList.add('is-case-study')

  if (updateHistory) {
    const project = workProjects.find(
      candidate => candidate.caseStudy === study
    )

    if (project) {
      window.history.pushState(
        { page: 'work', caseStudy: project.routeSlug },
        '',
        caseStudyRoutes[project.routeSlug]
      )
    }
  }

  mountCaseStudy(caseStudyRoot, study, {
    onBack: () => closeCaseStudy('work'),

    onNavigate: (targetPage) => {
      closeCaseStudy(targetPage)
    },

    onNext: (nextProject) => {
      const nextStudy = workProjects.find(
        (project) =>
          project.caseStudy?.slug === nextProject.slug
      )?.caseStudy

      if (nextStudy) {
        openCaseStudy(nextStudy, true)
        return
      }

      closeCaseStudy('work')
    },

    createFooter: () => createSiteFooter(footerLinks)
  })
}

function closeCaseStudy(
  targetPage = 'work',
  updateHistory = true
) {
  if (
    updateHistory
    && (targetPage === 'work' || targetPage === 'contact')
  ) {
    window.history.replaceState(
      { page: 'work' },
      '',
      pageRoutes.work
    )
  }

  caseStudyRoot.hidden = true
  caseStudyRoot.replaceChildren()

  mapNavigation.hidden = false

  document.body.classList.remove('is-case-study')

  if (targetPage === 'contact') {
    openHomeDestination('contact')
    return
  }

  if (targetPage !== 'work') {
    navigateTo(targetPage)
    return
  }

  showPageContent('work')

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.scrollTo({
        top: caseStudyReturnScrollY,
        left: 0,
        behavior: 'auto'
      })

      scheduleWorkCarouselUpdate()
    })
  })
}

function syncSiteRouteFromLocation() {
  if (isTransitioning) {
    window.setTimeout(syncSiteRouteFromLocation, 80)
    return
  }

  const routeSlug = getCaseStudySlugFromLocation()
  const isCaseStudyOpen =
    document.body.classList.contains('is-case-study')

  if (routeSlug) {
    const project = workProjects.find(
      candidate => candidate.routeSlug === routeSlug
    )

    if (project) {
      if (currentPage !== 'work') {
        currentPage = 'work'
        updateResponsiveCamera()
        applyResponsiveScenePose('work')
        showLightsForState('work')
        showPageContent('work')
        updateNavigation()
      }

      openCaseStudy(project.caseStudy, true, false)
    }

    return
  }

  if (isCaseStudyOpen) {
    closeCaseStudy('work', false)
  }

  const routePage = getPageFromLocation()

  if (routePage && routePage !== currentPage) {
    navigateTo(routePage, false)
  }
}

window.addEventListener('popstate', syncSiteRouteFromLocation)

// GLB Loader
const loader = new GLTFLoader()

console.log('MODEL URL:', environmentUrl)

loader.load(
  environmentUrl,

  //temporary
  (gltf) => {
    environmentScene = gltf.scene
    scene.add(gltf.scene)

  gltf.scene.traverse((object) => {
    if (object.isMesh) {
      console.log('GLB mesh:', object.name)

      if (object.name !== 'Cube') {
        object.layers.enable(
          TRANSITION_ARCHITECTURE_MASK_LAYER
        )
      }
    }
  })

  const hiddenObjects = new Set([
    'Home-pillar-1',
    'Home-pillar-2',
    'Home-pillar-3',
    'Home-pillar-4'
  ])

  gltf.scene.traverse((object) => {
    if (hiddenObjects.has(object.name)) {
      object.visible = false
    }
  })

    gltf.scene.traverse((object) => {
  if (object.isMesh) {
    object.castShadow = true
    object.receiveShadow = true

    const objectMaterials = Array.isArray(object.material)
      ? object.material
      : [object.material]

    objectMaterials.forEach((material) => {
      if (
        (material?.isMeshStandardMaterial
          || material?.isMeshPhysicalMaterial)
        && material.emissive
        && !material.emissiveMap
        && material.emissive.getHex() === 0
      ) {
        material.emissive.set(0x34403e)
        material.emissiveIntensity = 0.35
        material.envMapIntensity = Math.min(
          material.envMapIntensity ?? 1,
          0.55
        )
      }
    })
  }

  if (object.isLight) {
    object.visible = true

    if (object.castShadow && object.shadow) {
      object.shadow.mapSize.set(1024, 1024)
      object.shadow.radius = 4
    }

    console.log(
      'Imported light:',
      object.name,
      object.type,
      object.intensity
    )
  }
})

    const rippleMesh = gltf.scene.getObjectByName('Cube')

  if (rippleMesh?.isMesh) {
    const rippleMaterials = Array.isArray(rippleMesh.material)
      ? rippleMesh.material
      : [rippleMesh.material]

    const rippleMaterial =
      rippleMaterials.find(
        material => material.name === 'Material.004'
      ) ?? rippleMaterials[0]

    rippleMesh.castShadow = false
    rippleMesh.receiveShadow = true

if (rippleMaterial.isMeshPhysicalMaterial) {
  // Match the cool atmosphere in unlit water areas.
  rippleMaterial.color.set(0x28302e)

  // Cool lift that remains underneath the warm light bands.
  rippleMaterial.emissive.set(0x121716)
  rippleMaterial.emissiveIntensity = 0.18

  rippleMaterial.metalness = 0
  rippleMaterial.roughness = 0.19

  // Soft, controlled reflections like the reference.
  rippleMaterial.clearcoat = 1
  rippleMaterial.clearcoatRoughness = 0.1
  rippleMaterial.envMapIntensity = 0.42

  rippleMaterial.ior = 1.333

  // Keep some depth without allowing the warm scene
  // to colour the entire surface.
  rippleMaterial.transmission = 0
  rippleMaterial.thickness = 0.015

  // Keep transmitted and reflected depth cool as well.
  rippleMaterial.attenuationColor.set(0x28302e)
  rippleMaterial.attenuationDistance = 1000

  rippleMaterial.specularIntensity = 0.9
  rippleMaterial.specularColor.set(0xbfcac7)

  rippleMaterial.opacity = 0.18
  rippleMaterial.transparent = true
  rippleMaterial.depthWrite = false
  rippleMaterial.side = THREE.FrontSide
  rippleMaterial.needsUpdate = true
}

// Camera-matched planar reflection keeps every object aligned
// with its reflected position on the horizontal water surface.
gltf.scene.updateWorldMatrix(true, true)

const waterBounds =
  new THREE.Box3().setFromObject(rippleMesh)

const waterCenter = new THREE.Vector3()
const waterSize = new THREE.Vector3()

waterBounds.getCenter(waterCenter)
waterBounds.getSize(waterSize)

const waterSurfaceY = waterBounds.max.y
const reflectionSize = getPlanarReflectionSize()
const planarReflectionShader = {
  ...Reflector.ReflectorShader,
  name: 'RippledPlanarWaterReflection',
  uniforms: {
    ...Reflector.ReflectorShader.uniforms,
    uRippleTime: { value: 0 },
    uRippleStrength: { value: 0.0032 }
  },
  fragmentShader: Reflector.ReflectorShader.fragmentShader
    .replace(
      'uniform sampler2D tDiffuse;',
      `
uniform sampler2D tDiffuse;
uniform float uRippleTime;
uniform float uRippleStrength;
      `
    )
    .replace(
      'vec4 base = texture2DProj( tDiffuse, vUv );',
      `
vec2 projectedUv =
  vUv.xy / max(vUv.w, 0.0001);

float reflectionGust =
  0.55 + 0.45 * sin(
    uRippleTime * 0.13
    + sin(projectedUv.x * 17.0) * 1.7
    - cos(projectedUv.y * 11.0) * 1.2
  );

vec2 reflectionDomain = projectedUv + vec2(
  sin(projectedUv.y * 31.0 - uRippleTime * 0.17),
  cos(projectedUv.x * 23.0 + uRippleTime * 0.11)
) * 0.018;

vec2 reflectionRipple = vec2(
  sin(
    reflectionDomain.y * 157.0
    + sin(reflectionDomain.x * 39.0
      + uRippleTime * 0.21) * 3.2
    + uRippleTime * 0.67
  )
    + sin(
      (reflectionDomain.x + reflectionDomain.y) * 97.0
      - uRippleTime * 0.29
    ) * 0.72,
  cos(
    reflectionDomain.x * 133.0
    - sin(reflectionDomain.y * 47.0
      - uRippleTime * 0.16) * 2.7
    - uRippleTime * 0.51
  )
    + sin(
      reflectionDomain.y * 79.0
      + reflectionDomain.x * 53.0
      + uRippleTime * 0.23
    ) * 0.66
) * uRippleStrength * mix(0.62, 1.38, reflectionGust);



vec4 rippledReflectionUv = vUv;
rippledReflectionUv.xy += reflectionRipple * vUv.w;

vec4 base = texture2DProj(
  tDiffuse,
  rippledReflectionUv
);

// Gather nearby warm highlights to create a restrained
// halo around illuminated pillars in the reflection.
vec2 reflectionGlowOffset = vec2(0.0045) * vUv.w;

vec3 reflectionGlowSample = (
  texture2DProj(
    tDiffuse,
    rippledReflectionUv
      + vec4(reflectionGlowOffset.x, 0.0, 0.0, 0.0)
  ).rgb
  + texture2DProj(
    tDiffuse,
    rippledReflectionUv
      - vec4(reflectionGlowOffset.x, 0.0, 0.0, 0.0)
  ).rgb
  + texture2DProj(
    tDiffuse,
    rippledReflectionUv
      + vec4(0.0, reflectionGlowOffset.y, 0.0, 0.0)
  ).rgb
  + texture2DProj(
    tDiffuse,
    rippledReflectionUv
      - vec4(0.0, reflectionGlowOffset.y, 0.0, 0.0)
  ).rgb
) * 0.25;

float reflectionGlowLuma = dot(
  reflectionGlowSample,
  vec3(0.2126, 0.7152, 0.0722)
);

float reflectionGlowWarmth = max(
  reflectionGlowSample.r
    - max(
      reflectionGlowSample.g * 0.72,
      reflectionGlowSample.b
    ),
  0.0
);

float reflectionGlowMask =
  smoothstep(0.1, 0.55, reflectionGlowLuma)
  * smoothstep(0.012, 0.2, reflectionGlowWarmth);

vec3 contrastedReflection = smoothstep(
  vec3(0.035),
  vec3(0.76),
  base.rgb
);

base.rgb = mix(
  base.rgb,
  contrastedReflection,
  0.78
);

// Dark charcoal water preserves silhouettes and warm highlights
// without reading as a bright or transparent mirror.
base.rgb = mix(
  vec3(0.018, 0.022, 0.021),
  base.rgb * 0.56,
  0.84
);

base.rgb +=
  vec3(1.0, 0.22, 0.03)
  * reflectionGlowMask
  * 0.28;
      `
    )
}

planarWaterReflector = new Reflector(
  new THREE.PlaneGeometry(
    waterSize.x * 1.02,
    waterSize.z * 1.02
  ),
  {
    clipBias: 0.003,
    textureWidth: reflectionSize.width,
    textureHeight: reflectionSize.height,
    color: 0x46504d,
    multisample: 0,
    shader: planarReflectionShader
  }
)

planarWaterReflector.position.set(
  waterCenter.x,
  waterSurfaceY + 0.002,
  waterCenter.z
)
planarWaterReflector.rotation.x = -Math.PI / 2
planarWaterReflector.renderOrder = -1
planarWaterReflector.name = 'Planar water reflection'

const renderPlanarReflection =
  planarWaterReflector.onBeforeRender

planarWaterReflector.onBeforeRender = function (...args) {
  planarReflectionFrame += 1

  const updateInterval = isTransitioning ? 1 : 8
  const shouldRefresh =
    !planarReflectionHasRendered
    || this.forceUpdate
    || planarReflectionFrame % updateInterval === 0

  if (!shouldRefresh) return

  renderPlanarReflection.call(this, ...args)
  planarReflectionHasRendered = true
  this.forceUpdate = false
}

scene.add(planarWaterReflector)

const rippleWaterOverlay = new THREE.Mesh(
  new THREE.PlaneGeometry(
    waterSize.x * 1.02,
    waterSize.z * 1.02
  ),
  rippleMaterial
)

rippleWaterOverlay.position.set(
  waterCenter.x,
  waterSurfaceY + 0.004,
  waterCenter.z
)
rippleWaterOverlay.rotation.x = -Math.PI / 2
rippleWaterOverlay.renderOrder = 1
rippleWaterOverlay.receiveShadow = true
rippleWaterOverlay.name = 'Ripple water overlay'

scene.add(rippleWaterOverlay)
rippleMesh.visible = false
  
    rippleMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.uRippleTime = { value: 0 }
      shader.uniforms.uRippleScale = { value: 0.9 }
      shader.uniforms.uRippleStrength = { value: 0.72 }
      shader.uniforms.uRippleSpeed = { value: 0.82 }
      shader.uniforms.uStripeVisibility = { value: 0 }
      shader.uniforms.uStripeStrength = { value: 0.18 }
      shader.uniforms.uStripeOffset = { value: 0.2 }
      shader.uniforms.uStripeColor = {
        value: new THREE.Color(0xff5a00)
      }
      shader.uniforms.uStripeResolution = {
        value: renderer.getDrawingBufferSize(
          new THREE.Vector2()
        )
      }
      shader.uniforms.uCoolWaterColor = {
        value: new THREE.Color(0x28302e)
      }
      shader.uniforms.uCoolWaterMix = { value: 0.72 }

      rippleShader = shader

      requestAnimationFrame(() => {
        updateStripeLighting(currentPage)
      })

      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          `
  #include <common>

  varying vec3 vRippleWorldPosition;
  varying vec3 vRippleObjectNormal;
          `
        )
        .replace(
          '#include <begin_vertex>',
          `
  #include <begin_vertex>

  vRippleWorldPosition =
    (modelMatrix * vec4(transformed, 1.0)).xyz;

  vRippleObjectNormal = normal;
          `
        )

      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          `
  #include <common>

  uniform float uRippleTime;
  uniform float uRippleScale;
  uniform float uRippleStrength;
  uniform float uRippleSpeed;
  uniform float uStripeVisibility;
  uniform float uStripeStrength;
  uniform float uStripeOffset;
  uniform vec3 uStripeColor;
  uniform vec2 uStripeResolution;
  uniform vec3 uCoolWaterColor;
  uniform float uCoolWaterMix;

  varying vec3 vRippleWorldPosition;
  varying vec3 vRippleObjectNormal;
          `
        )
        .replace(
          '#include <normal_fragment_maps>',
          `
  #include <normal_fragment_maps>

vec2 baseRipplePosition =
  vRippleWorldPosition.xz * uRippleScale;

float rippleTime =
  uRippleTime * uRippleSpeed;

// Warp the coordinates so the waves do not repeat evenly.
vec2 rippleWarp = vec2(
  sin(baseRipplePosition.y * 0.21 + rippleTime * 0.17)
    + sin(baseRipplePosition.x * 0.37 - rippleTime * 0.08)
    + sin(
      (baseRipplePosition.x + baseRipplePosition.y) * 0.51
      + sin(baseRipplePosition.y * 0.19
        - rippleTime * 0.14) * 1.8
      + rippleTime * 0.23
    ) * 0.55,

  cos(baseRipplePosition.x * 0.18 - rippleTime * 0.12)
    + sin(baseRipplePosition.y * 0.29 + rippleTime * 0.09)
    + cos(
      (baseRipplePosition.x - baseRipplePosition.y) * 0.43
      + rippleTime * 0.19
    ) * 0.48
) * 0.67;

vec2 ripplePosition =
  baseRipplePosition + rippleWarp;

vec2 directionA = normalize(vec2(1.0, 0.22));
vec2 directionB = normalize(vec2(-0.37, 1.0));
vec2 directionC = normalize(vec2(0.74, -0.61));
vec2 directionD = normalize(vec2(-0.86, -0.28));

float ripplePhaseA =
  dot(ripplePosition, directionA) * 0.62
  + rippleTime * 0.51;

float ripplePhaseB =
  dot(ripplePosition, directionB) * 0.91
  - rippleTime * 0.34
  + 1.3;

float ripplePhaseC =
  dot(ripplePosition, directionC) * 1.37
  + rippleTime * 0.19
  + sin(ripplePhaseA * 0.41) * 0.7;

float ripplePhaseD =
  dot(ripplePosition, directionD) * 2.23
  - rippleTime * 0.59
  + 2.4;

vec2 rippleSlope =
  directionA * cos(ripplePhaseA) * 0.43
  + directionB * cos(ripplePhaseB) * 0.25
  + directionC * cos(ripplePhaseC) * 0.15
  + directionD * cos(ripplePhaseD) * 0.06;

// Create irregular calm and rough regions.
float variationA =
  0.5 + 0.5 * sin(
    baseRipplePosition.x * 0.13
    + baseRipplePosition.y * 0.09
    - rippleTime * 0.11
  );

float variationB =
  0.5 + 0.5 * cos(
    baseRipplePosition.x * 0.07
    - baseRipplePosition.y * 0.17
    + rippleTime * 0.06
  );

float broadVariation =
  mix(0.2, 1.55, variationA * variationB);

float volatility =
  0.5 + 0.5 * sin(
    baseRipplePosition.x * 0.23
    - baseRipplePosition.y * 0.31
    + rippleTime * 0.27
    + sin(rippleTime * 0.11) * 2.0
  );

vec2 smallRipples = vec2(
  sin(
    ripplePosition.y * 3.7
    + ripplePosition.x * 1.3
    + rippleTime * 0.93
  ),
  cos(
    ripplePosition.x * 4.1
    - ripplePosition.y * 1.7
    - rippleTime * 0.78
  )
) * mix(0.025, 0.065, volatility);

vec2 crossRipples = vec2(
  sin(
    (ripplePosition.x - ripplePosition.y) * 6.3
    + rippleTime * 1.17
  ),
  cos(
    (ripplePosition.x + ripplePosition.y) * 5.6
    - rippleTime * 1.04
  )
) * 0.026;

rippleSlope =
  rippleSlope
    * broadVariation
    * mix(0.72, 1.28, volatility)
  + smallRipples
  + crossRipples;

roughnessFactor = clamp(
  roughnessFactor
    + (0.7 - broadVariation) * 0.09,
  0.07,
  0.32
);

vec3 rippleWorldNormal = normalize(
  vec3(
    -rippleSlope.x * uRippleStrength,
    1.0,
    -rippleSlope.y * uRippleStrength
  )
);

  vec3 rippleViewNormal = normalize(
    mat3(viewMatrix) * rippleWorldNormal
  );

  // Apply ripples only to upward-facing surfaces.
  float rippleMask = smoothstep(
    0.42,
    0.78,
    abs(normalize(vRippleObjectNormal).y)
  );

  normal = normalize(
    mix(normal, rippleViewNormal, rippleMask)
  );
          `
        )
        .replace(
          '#include <emissivemap_fragment>',
          `
  #include <emissivemap_fragment>

  // Screen-aligned light bands remain centered beneath the
  // HTML typography while the world-space ripple gently
  // breaks up their otherwise perfect edges.
  vec2 stripeScreenUv =
    gl_FragCoord.xy / max(
      uStripeResolution,
      vec2(1.0)
    );

  float stripePhase =
    dot(
      stripeScreenUv,
      normalize(vec2(1.0, 0.72))
    ) * 28.0
    + uStripeOffset
    + sin(
      vRippleWorldPosition.x * 0.28
      + vRippleWorldPosition.z * 0.16
      + uRippleTime * 0.08
    ) * 0.22;

  float irregularStripePhase =
    stripePhase
    + sin(stripePhase * 0.37 + 0.8) * 1.45
    + sin(stripePhase * 0.13 - 1.6) * 2.1;

  float wideStripeBand = pow(
    max(sin(irregularStripePhase), 0.0),
    3.2
  );

  float thinStripeBand = pow(
    max(sin(
      irregularStripePhase * 1.73 + 2.4
    ), 0.0),
    19.0
  );

  float stripeWeightVariation =
    0.58 + 0.42 * sin(
      irregularStripePhase * 0.21
      + vRippleWorldPosition.x * 0.08
    );

  float stripeBand = clamp(
    wideStripeBand * stripeWeightVariation
    + thinStripeBand * 0.72,
    0.0,
    1.0
  );

  vec2 stripeCenter =
    (stripeScreenUv - vec2(0.5, 0.3))
    * vec2(0.9, 1.55);

  float stripeCompositionMask =
    1.0 - smoothstep(
      0.34,
      0.78,
      length(stripeCenter)
    );

  float stripeSurfaceVariation =
    0.84 + 0.16 * sin(
      vRippleWorldPosition.x * 0.42
      - vRippleWorldPosition.z * 0.31
      + uRippleTime * 0.12
    );

  totalEmissiveRadiance +=
    uStripeColor
    * stripeBand
    * stripeCompositionMask
    * stripeSurfaceVariation
    * uStripeStrength
    * uStripeVisibility;
          `
        )
        .replace(
          '#include <opaque_fragment>',
          `
  float warmStripeProtection = clamp(
    stripeBand
    * stripeCompositionMask
    * uStripeVisibility
    * 2.4,
    0.0,
    1.0
  );

  float coolWaterMix = mix(
    uCoolWaterMix,
    0.14,
    warmStripeProtection
  );

  float waterLuminance = dot(
    outgoingLight,
    vec3(0.2126, 0.7152, 0.0722)
  );

  vec3 coolWaterResponse = mix(
    uCoolWaterColor
      * (0.72 + waterLuminance * 0.85),
    vec3(waterLuminance),
    0.28
  );

  outgoingLight = mix(
    outgoingLight,
    coolWaterResponse,
    coolWaterMix
  );

  diffuseColor.a = mix(
    0.18,
    0.26,
    warmStripeProtection
  );

  #include <opaque_fragment>
          `
        )
    }

    rippleMaterial.customProgramCacheKey = () =>
      'portfolio-ripple-v14'

    rippleMaterial.needsUpdate = true
  } else {
    console.warn('Ripple mesh "Cube" was not found')
  }

    mixer = new THREE.AnimationMixer(gltf.scene)
    clips = gltf.animations

    console.log('GLB loaded:', gltf)
    console.log('Animations:', gltf.animations)
    console.log(
      'Animation names:',
      gltf.animations.map(clip => clip.name)
    )
    console.log('Cameras:', gltf.cameras)

    updateResponsiveCamera()

    console.log(
      `Using ${responsiveState} camera:`,
      camera
    )

//IMPORTING LIGHTS
  const importedLights = []

  gltf.scene.traverse(object => {
    if (object.isLight) {
      importedLights.push(object)

      const importedColorHsl = { h: 0, s: 0, l: 0 }

      object.color.getHSL(importedColorHsl)

      const isWarmImportedLight =
        importedColorHsl.s > 0.08
        && (
          importedColorHsl.h < 0.16
          || importedColorHsl.h > 0.96
        )

      if (isWarmImportedLight) {
        object.color.setHSL(
          0.055,
          Math.max(importedColorHsl.s, 0.92),
          importedColorHsl.l
        )
      }
    }
  })

  console.table(
    importedLights.map(light => ({
      name: light.name,
      type: light.type,
      intensity: light.intensity
    }))
  )

//Conditional light visibility
function showLightsForState(state) {
  const activePrefix = state.toLowerCase()

  importedLights.forEach(light => {
    const lightName = light.name.toLowerCase()

    const belongsToPage =
      lightName.startsWith('intro-') ||
      lightName.startsWith('home-') ||
      lightName.startsWith('about-') ||
      lightName.startsWith('work-')

    if (!belongsToPage) {
      // Keep global lights such as Sun active
      light.visible = true
      return
    }

    light.visible = lightName.startsWith(
      `${activePrefix}-`
    )
  })
}



// INTRO / DIRECT PAGE ENTRY
    hideLoadingScreen()

    const finishInitialPage = () => {
      currentPage = initialPage
      isIntroTransition = false
      isTransitioning = false
      activeTransitionTargetPage = null

      updateResponsiveCamera()
      applyResponsiveScenePose(currentPage)
      showLightsForState(currentPage)

      mapNavigation.classList.add('is-ready')

      showPageContent(currentPage)
      updateNavigation()

      if (initialCaseStudySlug) {
        const project = workProjects.find(
          candidate => candidate.routeSlug === initialCaseStudySlug
        )

        if (project) {
          openCaseStudy(project.caseStudy, true, false)
        }
      }
    }

    if (initialPage === 'home') {
      playTransition(
        'intro-to-home',
        false,
        finishInitialPage
      )
    } else {
      finishInitialPage()
    }
  }
)


const navigationByPage = {
  home: {
    left: {
      label: 'About',
      page: 'about'
    },

    right: {
      label: 'Work',
      page: 'work'
    }
  },

  about: {
    left: {
      label: 'Work',
      page: 'work'
    },

    right: {
      label: 'Contact',
      page: 'contact'
    }
  },

  work: {
    left: {
      label: 'About',
      page: 'about'
    },
    right: {
      label: 'Contact',
      page: 'contact'
    }
  }
}

const transitionMap = {
  'home-about': {
    clip: 'home-to-about',
    reverse: false
  },

  'about-home': {
    clip: 'home-to-about',
    reverse: true
  },

  'home-work': {
    clip: 'home-to-work',
    reverse: false
  },

  'work-home': {
    clip: 'home-to-work',
    reverse: true
  },

  'about-work': {
    clip: 'about-to-work',
    reverse: false
  },

  'work-about': {
    clip: 'about-to-work',
    reverse: true
  }
}

function playTransition(name, reverse = false, onFinished = null) {
  if (!mixer) {
    console.error('Animation mixer is not ready')
    onFinished?.()
    return false
  }

  const responsiveClipName =
    `${responsiveState} ${name}`.trim().toLowerCase()

  const clip = clips.find(
    clip =>
      clip.name.trim().toLowerCase() === responsiveClipName
  )

  if (!clip) {
    console.error(
      `Animation "${responsiveClipName}" not found`
    )
    onFinished?.()
    return false
  }

  if (activeTransitionFinishHandler) {
    mixer.removeEventListener(
      'finished',
      activeTransitionFinishHandler
    )
    activeTransitionFinishHandler = null
  }

  // Never leave a clamped action from another responsive camera active.
  mixer.stopAllAction()

  let playbackClip = clip

  if (
    responsiveState === 'tablet'
    && name === 'about-to-work'
  ) {
    playbackClip =
      tabletTrimmedClipBySource.get(clip)

    if (!playbackClip) {
      playbackClip = clip.clone()
      playbackClip.name =
        `${clip.name}-trimmed-last-2s`
      playbackClip.duration = Math.max(
        clip.duration - 2,
        0.001
      )

      tabletTrimmedClipBySource.set(
        clip,
        playbackClip
      )
    }
  }

  if (
    responsiveState === 'phone'
    && name === 'about-to-work'
    && !reverse
  ) {
    playbackClip =
      phoneAboutWorkTrimmedClipBySource.get(clip)

    if (!playbackClip) {
      playbackClip = clip.clone()
      playbackClip.name =
        `${clip.name}-trimmed-last-4.5s`
      playbackClip.duration = Math.max(
        clip.duration - 4.5,
        0.001
      )

      phoneAboutWorkTrimmedClipBySource.set(
        clip,
        playbackClip
      )
    }
  }

  if (
    responsiveState === 'phone'
    && name === 'about-to-work'
    && reverse
  ) {
    playbackClip =
      phoneWorkAboutTrimmedClipBySource.get(clip)

    if (!playbackClip) {
      playbackClip = clip.clone()
      playbackClip.name =
        `${clip.name}-phone-reverse-trimmed-first-4s`
      playbackClip.duration = Math.max(
        clip.duration - 4,
        0.001
      )

      phoneWorkAboutTrimmedClipBySource.set(
        clip,
        playbackClip
      )
    }
  }

  const action = mixer.clipAction(playbackClip)

  activeTransitionAction = action
  prepareTransitionGhost(reverse)

  action.reset()
  action.enabled = true
  action.paused = false
  action.setLoop(THREE.LoopOnce, 1)
  action.clampWhenFinished = true

  if (reverse) {
    action.time = playbackClip.duration
    action.setEffectiveTimeScale(
      -TRANSITION_CLIP_SPEED
    )
  } else {
    action.time = 0
    action.setEffectiveTimeScale(
      TRANSITION_CLIP_SPEED
    )
  }

  const handleFinished = (event) => {
    if (event.action !== action) return

    mixer.removeEventListener('finished', handleFinished)

    if (activeTransitionFinishHandler === handleFinished) {
      activeTransitionFinishHandler = null
    }

    if (onFinished) {
      onFinished()
    }
  }

  activeTransitionFinishHandler = handleFinished
  mixer.addEventListener('finished', handleFinished)

  action.play()
  return true
}

function navigateTo(targetPage, updateHistory = true) {
  if (isTransitioning) return
  if (targetPage === currentPage) return

  // A route may start immediately after crossing a breakpoint. Rebind the
  // responsive camera and pose before resolving the responsive clip name.
  const routeResponsiveState = getResponsiveState()

  if (responsiveState !== routeResponsiveState) {
    updateResponsiveCamera()
    applyResponsiveScenePose(currentPage)
  }

  const key = `${currentPage}-${targetPage}`
  const transition = transitionMap[key]

  if (!transition) {
    console.error(`No transition found: ${key}`)
    return
  }

  isTransitioning = true
  activeTransitionTargetPage = targetPage

  // Hide the current page content while the environment moves.
  showPageContent(null)
  updateNavigation()

  playTransition(
    transition.clip,
    transition.reverse,
    () => {
      currentPage = targetPage
      activeTransitionTargetPage = null
      isTransitioning = false

      if (updateHistory) {
        window.history.pushState(
          { page: currentPage },
          '',
          pageRoutes[currentPage]
        )
      }

      // If the viewport changed while the clip was playing, commit the
      // destination on the newly appropriate camera before rendering UI.
      if (responsiveState !== getResponsiveState()) {
        updateResponsiveCamera()
        applyResponsiveScenePose(currentPage)
      }

      // The camera is now stationary at its destination.
      showPageContent(currentPage)
      updateNavigation()

    }
  )
}

function updateNavigation() {
  mapNavigation.classList.toggle(
    'is-transitioning',
    isTransitioning
  )

  mobileNavigation.classList.toggle(
    'is-transitioning',
    isTransitioning
  )

  const navigation = navigationByPage[currentPage]

  if (navigation) {
    leftNavigation.textContent = navigation.left.label
    leftNavigation.dataset.page = navigation.left.page

    rightNavigation.textContent = navigation.right.label
    rightNavigation.dataset.page = navigation.right.page
  }

  navButtons.forEach((button) => {
    const targetPage = button.dataset.page
    const isCurrentPage = targetPage === currentPage

    button.disabled = isTransitioning || isCurrentPage

    if (isCurrentPage) {
      button.setAttribute('aria-current', 'page')
    } else {
      button.removeAttribute('aria-current')
    }
  })
}

navButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const targetPage = button.dataset.page

    if (targetPage === 'contact') {
      openContactPanel()
      return
    }

    if (document.body.classList.contains('is-contact-open')) {
      closeContactPanel()
    }

    navigateTo(targetPage)
  })
})

function animate(time) {
  requestAnimationFrame(animate)

  // Resize events can be coalesced or missed while DevTools/device emulation
  // changes the viewport. Enforce the camera-to-breakpoint mapping before
  // advancing or rendering any animation frame.
  enforceResponsiveCameraInvariant()

  timer.update(time)

  const delta = timer.getDelta()

  if (rippleShader) {
    rippleShader.uniforms.uRippleTime.value += delta
  }

  if (planarWaterReflector) {
    planarWaterReflector.material.uniforms
      .uRippleTime.value += delta * 0.45
  }

  if (mixer) {
    mixer.update(delta)
  }

  if (isTransitioning && stripeLight.visible) {
    updateStripeLighting(
      activeTransitionTargetPage ?? currentPage
    )
  }

  if (isTransitioning && !isIntroTransition) {
    renderer.shadowMap.needsUpdate = true

    if (transitionGhostNeedsReset) {
      resetTransitionGhostHistory()
    }

    renderTransitionArchitectureMask()

    transitionRenderPass.camera = camera
    transitionAfterimagePass.uniforms
      .uGhostTime.value += delta

    transitionComposer.render(delta)
    commitTransitionArchitectureMask()
  } else {
    renderer.render(scene, camera)
  }
}

animate()

// Resize
window.addEventListener('resize', () => {
  const nextResponsiveState = getResponsiveState()
  const nextOrientation = getViewportOrientation()

  const hasMajorViewportChange =
    responsiveState !== nextResponsiveState
    || responsiveOrientation !== nextOrientation

  if (hasMajorViewportChange) {
    // Breakpoint changes are atomic: discard the old viewport's in-flight
    // clip and sample the destination on the newly selected camera now.
    resetSceneForResponsiveViewport()
  } else {
    updateResponsiveCamera()
  }

  responsiveOrientation = nextOrientation

  if (isMobileMenuOpen && responsiveState === 'desktop') {
    setMobileMenuOpen(false, false)
  }

  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(getRendererPixelRatio())
  resizePlanarWaterReflection()

  transitionComposer.setPixelRatio(
    Math.min(
      getRendererPixelRatio(),
      TRANSITION_GHOST_PIXEL_RATIO
    )
  )
  transitionComposer.setSize(
    window.innerWidth,
    window.innerHeight
  )
  resizeTransitionArchitectureMasks()
  transitionGhostNeedsReset = true

  updateStripeLighting(currentPage)

  scheduleWorkCarouselUpdate()
  if (!homeStory.hidden) {
    renderHomeCarousel(homeRenderedPosition)
  }

  if (hasMajorViewportChange && !environmentScene) {
    // The GLB loader will bind the correct responsive camera once ready.
    responsiveState = nextResponsiveState
  }
})
