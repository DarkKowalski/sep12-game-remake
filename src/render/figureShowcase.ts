import {
  Color,
  DirectionalLight,
  Euler,
  Group,
  HemisphereLight,
  Mesh,
  MeshLambertMaterial,
  OrthographicCamera,
  PCFSoftShadowMap,
  PlaneGeometry,
  Scene,
  ShadowMaterial,
  Vector3,
  WebGLRenderer,
} from 'three'
import { AGENT } from '../sim/config'
import { createPersonGeometry, createRifleGeometry } from './geometry'
import { PALETTE } from './materials'

/**
 * The two figures on the intro screen, walking, so you can read the town the
 * moment it appears.
 *
 * Everything here is borrowed from the game rather than approximated: the same
 * geometry and palette, the same walk cycle from agentRenderer, the same
 * per-role speeds from sim/config, and a camera at the same tilt the game
 * settles on. A hand-made illustration would quietly stop matching the moment
 * anyone touched the person geometry, and a legend that disagrees with the
 * game is worse than no legend.
 *
 * Both share one canvas and one WebGL context. Two canvases would mean two
 * contexts on top of the game's own, against a browser limit of roughly
 * sixteen — and one animation loop is easier to stop cleanly than two. Each
 * figure is centred in its half of the canvas so the captions beneath, laid
 * out as two equal columns, line up with them at any width.
 */

/**
 * Camera tilt. The rig caps itself at 44° so the town never flattens into a
 * map; matching it here means these figures are lit and foreshortened exactly
 * as they will be on the sand a moment later.
 */
const ELEVATION_DEG = 44

/** Sun offset from the camera, as placeSun() uses in the scene. */
const SUN_OFFSET_DEG = -56
const SUN_ELEVATION_DEG = 56

/** Walking three-quarters on, so the rifle reads as a silhouette. */
const BASE_HEADING = 0.62

/** Matches agentRenderer: gait advances with distance, not time. */
const STEP_FREQUENCY = 3.4
const BOB_HEIGHT = 0.1
const ROLL_AMOUNT = 0.08

const ASPECT = 2.5
const HALF_HEIGHT = 1.34
const LOOK_HEIGHT = 1.12

export class FigureShowcase {
  readonly canvas = document.createElement('canvas')
  /** False when WebGL is unavailable; the caller then drops the legend. */
  readonly available: boolean

  private renderer: WebGLRenderer | null = null
  private readonly scene = new Scene()
  private readonly camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 60)
  private readonly civilian: Group
  private readonly terrorist: Group
  private readonly ground: Mesh
  private readonly disposables: { dispose(): void }[] = []
  private readonly euler = new Euler(0, 0, 0, 'YXZ')

  private rafId = 0
  private startedAt = 0
  private observer: ResizeObserver | null = null

  constructor(private readonly reducedMotion: boolean) {
    this.canvas.className = 'legend__canvas'
    // The captions beneath carry the meaning; the canvas is decoration to a
    // screen reader.
    this.canvas.setAttribute('aria-hidden', 'true')

    try {
      this.renderer = new WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        antialias: true,
      })
    } catch {
      this.available = false
      this.civilian = new Group()
      this.terrorist = new Group()
      this.ground = new Mesh()
      return
    }

    this.available = true
    this.renderer.setClearAlpha(0)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = PCFSoftShadowMap

    // Slightly lifted from the game's values: these sit on a pale panel rather
    // than against sand, and have to read at thumbnail size.
    this.scene.add(new HemisphereLight(0xffeccb, 0xc9a978, 0.78))

    const sun = new DirectionalLight(0xfff0cf, 1.85)
    const azimuth = (SUN_OFFSET_DEG * Math.PI) / 180
    const elevation = (SUN_ELEVATION_DEG * Math.PI) / 180
    const horizontal = Math.cos(elevation) * 9
    sun.position.set(
      Math.sin(azimuth) * horizontal,
      Math.sin(elevation) * 9,
      Math.cos(azimuth) * horizontal,
    )
    sun.castShadow = true
    sun.shadow.mapSize.set(1024, 1024)
    sun.shadow.camera.near = 0.5
    sun.shadow.camera.far = 24
    sun.shadow.camera.left = -6
    sun.shadow.camera.right = 6
    sun.shadow.camera.top = 6
    sun.shadow.camera.bottom = -6
    sun.shadow.normalBias = 0.03
    this.scene.add(sun)

    // Shadow-only ground: catches the cast shadows so the figures are standing
    // on something, while leaving the canvas transparent everywhere else.
    const groundGeometry = new PlaneGeometry(40, 40)
    const groundMaterial = new ShadowMaterial({ opacity: 0.24 })
    this.disposables.push(groundGeometry, groundMaterial)
    this.ground = new Mesh(groundGeometry, groundMaterial)
    this.ground.rotation.x = -Math.PI / 2
    this.ground.receiveShadow = true
    this.scene.add(this.ground)

    const person = createPersonGeometry()
    const rifle = createRifleGeometry()
    this.disposables.push(person, rifle)

    this.civilian = this.buildFigure(person, PALETTE.civilianAlt[0]!)
    this.terrorist = this.buildFigure(person, PALETTE.terroristBody)

    const rifleMaterial = new MeshLambertMaterial({
      color: PALETTE.rifle,
      vertexColors: true,
      flatShading: true,
    })
    this.disposables.push(rifleMaterial)
    const armed = new Mesh(rifle, rifleMaterial)
    armed.castShadow = true
    this.terrorist.children[0]!.add(armed)

    this.scene.add(this.civilian, this.terrorist)
    this.orientCamera()
    this.resize()
  }

  /** Begin animating. Safe to call when already running. */
  start(): void {
    if (!this.renderer) return

    // Always re-lay out first: this also runs after a language change, which
    // can flip the writing direction without resizing anything.
    this.resize()
    if (this.rafId) return

    if (!this.observer) {
      this.observer = new ResizeObserver(() => this.resize())
      this.observer.observe(this.canvas)
    }

    if (this.reducedMotion) {
      // A held mid-stride pose rather than a loop nobody asked to see move.
      this.pose(0.42)
      this.renderer.render(this.scene, this.camera)
      return
    }

    this.startedAt = performance.now()
    this.rafId = requestAnimationFrame(this.frame)
  }

  /** Stop animating but keep the context, so it can start again cheaply. */
  stop(): void {
    if (!this.rafId) return
    cancelAnimationFrame(this.rafId)
    this.rafId = 0
  }

  /** Release the WebGL context. The showcase is unusable afterwards. */
  dispose(): void {
    this.stop()
    this.observer?.disconnect()
    this.observer = null
    for (const item of this.disposables) item.dispose()
    this.disposables.length = 0
    this.renderer?.dispose()
    this.renderer?.forceContextLoss()
    this.renderer = null
  }

  // ------------------------------------------------------------- internals

  private buildFigure(
    geometry: ReturnType<typeof createPersonGeometry>,
    color: number,
  ): Group {
    const material = new MeshLambertMaterial({
      color: new Color(color),
      vertexColors: true,
      flatShading: true,
    })
    this.disposables.push(material)

    const mesh = new Mesh(geometry, material)
    mesh.castShadow = true

    // An inner group carries the heading and roll so the outer one can hold
    // the vertical bob without the two transforms fighting each other.
    const body = new Group()
    body.add(mesh)
    const root = new Group()
    root.add(body)
    return root
  }

  private frame = (now: number): void => {
    if (!this.renderer) return
    this.rafId = requestAnimationFrame(this.frame)
    this.pose((now - this.startedAt) / 1000)
    this.renderer.render(this.scene, this.camera)
  }

  /**
   * The game's walk cycle, driven the same way: gait accumulates with distance
   * travelled, so the terrorist's faster patrol speed gives a faster step.
   */
  private pose(elapsed: number): void {
    const figures = [this.civilian, this.terrorist]
    const speeds = [AGENT.civilianSpeed, AGENT.terroristSpeed]

    for (let i = 0; i < figures.length; i++) {
      const step = elapsed * speeds[i]! * STEP_FREQUENCY
      // Same weave the wander steering produces, so they don't march in place.
      const heading = BASE_HEADING + Math.sin(elapsed * 1.3 + i * 2.1) * 0.3

      this.euler.set(0, heading, Math.sin(step) * ROLL_AMOUNT)
      const body = figures[i]!.children[0]!
      body.quaternion.setFromEuler(this.euler)
      figures[i]!.position.y = Math.abs(Math.sin(step)) * BOB_HEIGHT
    }
  }

  private orientCamera(): void {
    const elevation = (ELEVATION_DEG * Math.PI) / 180
    const target = new Vector3(0, LOOK_HEIGHT, 0)
    this.camera.position
      .set(0, Math.sin(elevation), Math.cos(elevation))
      .multiplyScalar(24)
      .add(target)
    this.camera.lookAt(target)
    this.camera.updateMatrixWorld()
  }

  private resize(): void {
    if (!this.renderer) return

    const cssWidth = this.canvas.clientWidth || 232
    const width = Math.max(1, Math.round(cssWidth))
    const height = Math.max(1, Math.round(width / ASPECT))

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    this.renderer.setSize(width, height, false)

    const halfWidth = HALF_HEIGHT * ASPECT
    this.camera.left = -halfWidth
    this.camera.right = halfWidth
    this.camera.top = HALF_HEIGHT
    this.camera.bottom = -HALF_HEIGHT
    this.camera.updateProjectionMatrix()

    // Centre of each half, so the captions below line up under the figures.
    //
    // The order follows the writing direction. The captions are laid out as a
    // grid and so reverse themselves in a right-to-left locale, but WebGL has
    // no notion of direction and would keep drawing the civilian on the left —
    // which silently labels the pale figure "terrorist" and the armed one
    // "civilian". Of all the places to get that backwards, this is the worst.
    const flip = document.documentElement.dir === 'rtl' ? -1 : 1
    this.civilian.position.x = (-halfWidth / 2) * flip
    this.terrorist.position.x = (halfWidth / 2) * flip

    if (this.rafId === 0) this.renderer.render(this.scene, this.camera)
  }
}
