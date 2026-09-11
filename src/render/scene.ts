import {
  AmbientLight,
  Color,
  DirectionalLight,
  Fog,
  HemisphereLight,
  PCFShadowMap,
  PCFSoftShadowMap,
  Scene,
  WebGLRenderer,
} from 'three'
import { CameraRig } from './cameraRig'
import { PALETTE } from './materials'

/** Sun placement, relative to wherever the camera ends up looking from. */
const SUN_OFFSET_DEG = -56
const SUN_ELEVATION_DEG = 56
const SUN_DISTANCE = 110

export interface QualitySettings {
  shadows: boolean
  /** 0..1 multiplier on particle counts. */
  particles: number
  pixelRatioCap: number
}

/**
 * Renderer, scene graph root and lighting.
 *
 * One shadow-casting directional light plus a hemisphere fill. No post-
 * processing: on a mid-range phone the difference between this and a bloom
 * pass is the difference between 60fps and 30fps, and flat-shaded low-poly
 * doesn't need it.
 */
export class Stage {
  readonly renderer: WebGLRenderer
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  readonly sun: DirectionalLight

  quality: QualitySettings

  private readonly hemi: HemisphereLight
  private readonly ambient: AmbientLight
  private width = 1
  private height = 1

  constructor(canvas: HTMLCanvasElement) {
    const dpr = window.devicePixelRatio || 1
    const lowPower = isLikelyMobile()

    this.quality = {
      shadows: true,
      particles: lowPower ? 0.6 : 1,
      pixelRatioCap: lowPower ? 2 : 2,
    }

    this.renderer = new WebGLRenderer({
      canvas,
      // At dpr ≥ 1.5 the extra samples are invisible and cost real frames.
      antialias: dpr < 1.5,
      powerPreference: 'high-performance',
      alpha: false,
      stencil: false,
    })
    this.renderer.setPixelRatio(Math.min(dpr, this.quality.pixelRatioCap))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = lowPower ? PCFShadowMap : PCFSoftShadowMap

    this.scene.background = new Color(PALETTE.sky)
    // The camera sits 260 units out and the town spans ±45 around that, so fog
    // has to start past 305 or it bleaches the far half of the town instead of
    // just softening the horizon.
    this.scene.fog = new Fog(PALETTE.fog, 330, 570)

    // Fill stays low so form comes from the sun and its shadows, but it is
    // warm: the camera reorients per viewport and often ends up looking at the
    // shaded side of the buildings, and a neutral fill turns those walls a
    // cold grey that reads nothing like sun-baked plaster.
    this.hemi = new HemisphereLight(0xffeccb, 0xc9a978, 0.66)
    this.hemi.position.set(0, 40, 0)
    this.scene.add(this.hemi)

    this.ambient = new AmbientLight(0xffe8c6, 0.2)
    this.scene.add(this.ambient)

    // Position is set in resize(), relative to whichever way the camera ended
    // up facing — see placeSun().
    this.sun = new DirectionalLight(0xfff0cf, 1.7)
    this.sun.castShadow = true
    this.sun.shadow.mapSize.set(lowPower ? 1024 : 2048, lowPower ? 1024 : 2048)
    this.sun.shadow.camera.near = 1
    this.sun.shadow.camera.far = 190
    this.sun.shadow.camera.left = -78
    this.sun.shadow.camera.right = 78
    this.sun.shadow.camera.top = 78
    this.sun.shadow.camera.bottom = -78
    this.sun.shadow.bias = -0.0008
    this.sun.shadow.normalBias = 0.03
    this.scene.add(this.sun)
    this.scene.add(this.sun.target)
  }

  get camera() {
    return this.rig.camera
  }

  resize(width: number, height: number): void {
    this.width = Math.max(1, Math.floor(width))
    this.height = Math.max(1, Math.floor(height))
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.quality.pixelRatioCap))
    this.renderer.setSize(this.width, this.height, false)
    this.rig.resize(this.width, this.height)
    this.placeSun()
  }

  /**
   * Keep the sun at a fixed angle to the camera rather than to the world.
   *
   * The rig reorients itself to fit the viewport, so a world-anchored sun ends
   * up lighting whichever side of the buildings the player cannot see, leaving
   * every visible wall flat and grey. Offsetting it from the camera's own
   * azimuth means the near faces always catch some direct light and shadows
   * always fall the same way on screen, in any orientation.
   */
  private placeSun(): void {
    const azimuth = ((this.rig.azimuth + SUN_OFFSET_DEG) * Math.PI) / 180
    const elevation = (SUN_ELEVATION_DEG * Math.PI) / 180
    const horizontal = Math.cos(elevation) * SUN_DISTANCE
    this.sun.position.set(
      Math.sin(azimuth) * horizontal,
      Math.sin(elevation) * SUN_DISTANCE,
      Math.cos(azimuth) * horizontal,
    )
  }

  get viewportWidth(): number {
    return this.width
  }

  get viewportHeight(): number {
    return this.height
  }

  setShadows(enabled: boolean): void {
    if (this.quality.shadows === enabled) return
    this.quality.shadows = enabled
    this.sun.castShadow = enabled
    this.renderer.shadowMap.enabled = enabled
    this.renderer.shadowMap.needsUpdate = true
    // Without shadows the scene reads flat, so lift the fill a little.
    this.ambient.intensity = enabled ? 0.2 : 0.3
    this.hemi.intensity = enabled ? 0.66 : 0.88
  }

  render(): void {
    this.renderer.render(this.scene, this.camera)
  }

  dispose(): void {
    this.renderer.dispose()
  }
}

function isLikelyMobile(): boolean {
  if (typeof navigator === 'undefined') return false
  const uaData = (navigator as Navigator & { userAgentData?: { mobile?: boolean } }).userAgentData
  if (uaData && typeof uaData.mobile === 'boolean') return uaData.mobile
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
}
