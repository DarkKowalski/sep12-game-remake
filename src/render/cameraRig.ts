import { Box3, OrthographicCamera, Vector3 } from 'three'
import { BLAST, BUILDING, TOWN } from '../sim/config'

/**
 * Fixed orthographic camera that reorients itself to fill the viewport.
 *
 * There is deliberately no orbit, pan or pinch: camera gestures would fight
 * the aiming gesture on a touchscreen, and every part of the town has to stay
 * reachable, so nothing may ever be cropped.
 *
 * Filling the screen under that constraint is a shape problem, not a zoom
 * problem. The town is a long rectangle, and the rig searches a small set of
 * orientations for whichever one lays that rectangle most squarely over the
 * viewport — down the screen on a phone held upright, across it in landscape.
 */

/**
 * Candidate orientations, searched on every resize.
 *
 * Azimuths either align the town's long axis with a screen axis — which wastes
 * the least space, since a rotated rectangle needs a much bigger bounding box
 * than an aligned one — or skew it slightly for a more three-dimensional read.
 * Elevations stop at 44°, well short of overhead. Steeper angles fill more of
 * a phone screen but flatten the town into a map, and filling the screen is
 * not worth losing the third dimension — the town's long proportions do that
 * work instead. Individual buildings are rotated a few degrees each so they
 * show two faces even when the camera is square to the street grid; skewing
 * the camera instead would cost far more screen area, because rotating a long
 * rectangle inflates its bounding box fast.
 *
 * The rig tries every pairing and keeps whichever frames the town largest,
 * which lands on a steep portrait view down the length of the town and a
 * shallow landscape view across it, without any of that being hard-coded.
 */
const AZIMUTHS = [0, 12, 78, 90, 102, 168, 180, 192, 258, 270, 282, 348]
const ELEVATIONS = [28, 32, 36, 40, 44]

const DISTANCE = 260
const TARGET = new Vector3(0, 3, 0)

/** Breathing room around the town, in world units. */
const MARGIN = 2

export class CameraRig {
  readonly camera: OrthographicCamera

  private readonly viewDir = new Vector3()
  private readonly basePosition = new Vector3()
  private readonly bounds = new Box3(
    new Vector3(-TOWN.halfX - 2, 0, -TOWN.halfZ - 2),
    new Vector3(TOWN.halfX + 2, BUILDING.maxHeight + 1.5, TOWN.halfZ + 2),
  )
  private readonly corner = new Vector3()
  private readonly extent = { halfW: 1, halfH: 1, centreX: 0, centreY: 0 }

  /** Azimuth of the orientation currently in use, in degrees. */
  azimuth = 0

  private shakeTime = 0
  private shakeStrength = 0
  private readonly shakeOffset = new Vector3()

  constructor() {
    this.camera = new OrthographicCamera(-40, 40, 40, -40, 0.1, DISTANCE * 2.5)
    this.orient(AZIMUTHS[0]!, ELEVATIONS[0]!)
  }

  /**
   * Frame the town for the current viewport.
   *
   * Every candidate orientation is scored by how much of the screen the town
   * would actually occupy, and the winner is applied. Because nothing may be
   * cropped, the score is bounded by the worse of the two axes — so the search
   * naturally picks the orientation whose projected shape is closest to the
   * shape of the screen.
   */
  resize(width: number, height: number): void {
    const aspect = Math.max(width / Math.max(height, 1), 0.0001)

    let bestAzimuth = AZIMUTHS[0]!
    let bestElevation = ELEVATIONS[0]!
    let bestFill = -1

    for (const azimuth of AZIMUTHS) {
      for (const elevation of ELEVATIONS) {
        this.orient(azimuth, elevation)
        this.measure()

        // Fraction of the viewport the town covers once it is scaled to fit.
        const fit = Math.min(aspect / this.extent.halfW, 1 / this.extent.halfH)
        const fill = (this.extent.halfW * fit) / aspect + this.extent.halfH * fit

        if (fill > bestFill) {
          bestFill = fill
          bestAzimuth = azimuth
          bestElevation = elevation
        }
      }
    }

    this.orient(bestAzimuth, bestElevation)
    this.measure()
    this.azimuth = bestAzimuth

    let { halfW, halfH } = this.extent
    if (halfW / halfH < aspect) halfW = halfH * aspect
    else halfH = halfW / aspect

    this.camera.left = this.extent.centreX - halfW
    this.camera.right = this.extent.centreX + halfW
    this.camera.top = this.extent.centreY + halfH
    this.camera.bottom = this.extent.centreY - halfH
    this.camera.updateProjectionMatrix()
  }

  /** Project the town's bounding box into camera space. */
  private measure(): void {
    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity

    for (let i = 0; i < 8; i++) {
      this.corner.set(
        i & 1 ? this.bounds.max.x : this.bounds.min.x,
        i & 2 ? this.bounds.max.y : this.bounds.min.y,
        i & 4 ? this.bounds.max.z : this.bounds.min.z,
      )
      this.corner.applyMatrix4(this.camera.matrixWorldInverse)
      if (this.corner.x < minX) minX = this.corner.x
      if (this.corner.x > maxX) maxX = this.corner.x
      if (this.corner.y < minY) minY = this.corner.y
      if (this.corner.y > maxY) maxY = this.corner.y
    }

    this.extent.centreX = (minX + maxX) / 2
    this.extent.centreY = (minY + maxY) / 2
    this.extent.halfW = (maxX - minX) / 2 + MARGIN
    this.extent.halfH = (maxY - minY) / 2 + MARGIN
  }

  /** World units per CSS pixel — used to size the touch crosshair offset. */
  unitsPerPixel(viewportHeight: number): number {
    return (this.camera.top - this.camera.bottom) / Math.max(viewportHeight, 1)
  }

  shake(strength = 1): void {
    this.shakeStrength = Math.max(this.shakeStrength, strength)
    this.shakeTime = BLAST.shakeDuration
  }

  update(dt: number, reducedMotion: boolean): void {
    if (this.shakeTime <= 0) {
      if (!this.camera.position.equals(this.basePosition)) {
        this.camera.position.copy(this.basePosition)
        this.camera.lookAt(TARGET)
      }
      return
    }

    this.shakeTime -= dt
    const decay = Math.max(0, this.shakeTime / BLAST.shakeDuration)
    const amp =
      BLAST.shakeAmplitude * this.shakeStrength * decay * decay * (reducedMotion ? 0.25 : 1)
    const t = (BLAST.shakeDuration - this.shakeTime) * 42

    this.shakeOffset.set(
      Math.sin(t * 1.17) * amp,
      Math.sin(t * 1.63 + 1.1) * amp * 0.7,
      Math.cos(t * 0.93 + 0.4) * amp,
    )
    this.camera.position.copy(this.basePosition).add(this.shakeOffset)
    this.camera.lookAt(TARGET)

    if (this.shakeTime <= 0) this.shakeStrength = 0
  }

  private orient(azimuthDeg: number, elevationDeg: number): void {
    const a = (azimuthDeg * Math.PI) / 180
    const e = (elevationDeg * Math.PI) / 180
    const horizontal = Math.cos(e)
    this.viewDir.set(horizontal * Math.sin(a), Math.sin(e), horizontal * Math.cos(a))

    this.basePosition.copy(this.viewDir).multiplyScalar(DISTANCE).add(TARGET)
    this.camera.position.copy(this.basePosition)
    this.camera.lookAt(TARGET)
    this.camera.updateMatrixWorld()
  }
}
