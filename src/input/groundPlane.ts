import type { Camera } from 'three'
import { Vector3 } from 'three'

/**
 * Screen coordinates → the y=0 ground plane.
 *
 * Plain ray/plane algebra rather than a Raycaster: there is exactly one plane
 * to test against, and this runs on every pointermove.
 */
export class GroundProjector {
  private readonly point = new Vector3()
  private readonly direction = new Vector3()
  private readonly result = { x: 0, z: 0 }

  /**
   * @param clientX  pointer x in CSS pixels, relative to the viewport
   * @param clientY  pointer y in CSS pixels, relative to the viewport
   * @param rect     the canvas bounding box
   */
  project(
    clientX: number,
    clientY: number,
    rect: DOMRect,
    camera: Camera,
  ): { x: number; z: number } {
    const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1
    const ndcY = -(((clientY - rect.top) / rect.height) * 2 - 1)

    this.point.set(ndcX, ndcY, -1).unproject(camera)
    this.direction.set(0, 0, -1).applyQuaternion(camera.quaternion).normalize()

    // Camera never looks along the horizon, so dir.y is comfortably non-zero.
    const t = this.direction.y === 0 ? 0 : -this.point.y / this.direction.y
    this.result.x = this.point.x + this.direction.x * t
    this.result.z = this.point.z + this.direction.z * t
    return this.result
  }
}
