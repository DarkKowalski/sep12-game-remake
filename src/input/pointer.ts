import type { Camera } from 'three'
import { TOWN } from '../sim/config'
import { GroundProjector } from './groundPlane'

/** Releasing this far outside the town cancels the shot instead of firing. */
const CANCEL_MARGIN = 12

export interface PointerHandlers {
  /** The aim point moved. */
  onAim: (x: number, z: number) => void
  /** Fire a missile at this point. */
  onFire: (x: number, z: number) => void
  /** Show or hide the crosshair. */
  onCrosshairVisible: (visible: boolean) => void
  /** The first real user gesture — used to unlock audio. */
  onFirstGesture: () => void
}

/**
 * One Pointer Events path for mouse, touch and pen.
 *
 * Mouse: the crosshair tracks the cursor and a press fires immediately.
 *
 * Touch: pressing summons the crosshair directly under the finger, dragging
 * repositions it, and lifting fires. That extra beat between touching and
 * firing matters — it makes shooting a decision rather than a reflex, which is
 * the whole point of the game.
 */
export class PointerInput {
  enabled = false

  private readonly projector = new GroundProjector()
  private activePointerId: number | null = null
  private isTouch = false
  private aimX = 0
  private aimZ = 0
  private hasAim = false
  private gestureSent = false
  private rect: DOMRect

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly camera: Camera,
    private readonly handlers: PointerHandlers,
  ) {
    this.rect = canvas.getBoundingClientRect()

    canvas.addEventListener('pointerdown', this.onPointerDown)
    canvas.addEventListener('pointermove', this.onPointerMove)
    canvas.addEventListener('pointerup', this.onPointerUp)
    canvas.addEventListener('pointercancel', this.onPointerCancel)
    canvas.addEventListener('pointerleave', this.onPointerLeave)
    // Long-press context menus and iOS text callouts have no place here.
    canvas.addEventListener('contextmenu', (event) => event.preventDefault())
  }

  /** Call after any resize so projection stays accurate. */
  refreshRect(): void {
    this.rect = this.canvas.getBoundingClientRect()
  }

  /** Current aim point, or null if the player isn't aiming. */
  get aim(): { x: number; z: number } | null {
    return this.hasAim ? { x: this.aimX, z: this.aimZ } : null
  }

  private onPointerDown = (event: PointerEvent): void => {
    if (!this.enabled) return
    if (event.button !== 0 && event.pointerType === 'mouse') return
    if (this.activePointerId !== null) return

    this.notifyFirstGesture()

    this.activePointerId = event.pointerId
    this.isTouch = event.pointerType !== 'mouse'
    this.canvas.setPointerCapture(event.pointerId)

    this.updateAim(event)

    if (this.isTouch) {
      // Touch: aim now, fire on release.
      this.handlers.onCrosshairVisible(!this.inCancelZone())
    } else {
      // Mouse: a click is the shot.
      if (!this.inCancelZone()) this.handlers.onFire(this.aimX, this.aimZ)
    }
  }

  private onPointerMove = (event: PointerEvent): void => {
    if (!this.enabled) return

    if (this.activePointerId !== null && event.pointerId !== this.activePointerId) return
    // Hovering mouse: keep the crosshair under the cursor without pressing.
    if (this.activePointerId === null && event.pointerType !== 'mouse') return

    this.updateAim(event)
    this.handlers.onCrosshairVisible(!this.inCancelZone())
  }

  private onPointerUp = (event: PointerEvent): void => {
    if (event.pointerId !== this.activePointerId) return
    this.release(event.pointerId)

    if (!this.enabled) return
    if (this.isTouch) {
      if (this.inCancelZone()) {
        this.handlers.onCrosshairVisible(false)
      } else {
        this.handlers.onFire(this.aimX, this.aimZ)
        // The crosshair lingers a moment so you see where the shot went.
        this.handlers.onCrosshairVisible(true)
        window.setTimeout(() => {
          if (this.activePointerId === null && this.isTouch) {
            this.handlers.onCrosshairVisible(false)
          }
        }, 450)
      }
    }
  }

  private onPointerCancel = (event: PointerEvent): void => {
    if (event.pointerId !== this.activePointerId) return
    this.release(event.pointerId)
    if (this.isTouch) this.handlers.onCrosshairVisible(false)
  }

  private onPointerLeave = (event: PointerEvent): void => {
    if (event.pointerType === 'mouse' && this.activePointerId === null) {
      this.hasAim = false
      this.handlers.onCrosshairVisible(false)
    }
  }

  private release(pointerId: number): void {
    this.activePointerId = null
    if (this.canvas.hasPointerCapture(pointerId)) {
      this.canvas.releasePointerCapture(pointerId)
    }
  }

  private updateAim(event: PointerEvent): void {
    // The aim point sits exactly under the pointer — no thumb offset. The
    // crosshair is drawn large enough to read around a fingertip, and an
    // offset makes it much harder to judge who is inside the blast radius.
    const ground = this.projector.project(event.clientX, event.clientY, this.rect, this.camera)
    this.aimX = ground.x
    this.aimZ = ground.z
    this.hasAim = true
    this.handlers.onAim(this.aimX, this.aimZ)
  }

  private inCancelZone(): boolean {
    return (
      Math.abs(this.aimX) > TOWN.halfX + CANCEL_MARGIN ||
      Math.abs(this.aimZ) > TOWN.halfZ + CANCEL_MARGIN
    )
  }

  private notifyFirstGesture(): void {
    if (this.gestureSent) return
    this.gestureSent = true
    this.handlers.onFirstGesture()
  }
}
