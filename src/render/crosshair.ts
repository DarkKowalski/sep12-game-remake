import {
  BoxGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  RingGeometry,
  type Object3D,
} from 'three'
import { BLAST } from '../sim/config'
import { PALETTE } from './materials'

/**
 * The crosshair, drawn flat on the ground so it lands exactly where the
 * missile will.
 *
 * The faint outer ring is the kill radius. The original game didn't show it;
 * this remake does, because on a small screen you otherwise can't tell that
 * the people either side of your target are inside the blast. Showing it
 * doesn't soften the game — it means every civilian you kill was visibly
 * inside the circle when you chose to fire.
 */
export class Crosshair {
  private readonly group = new Group()
  private readonly armMaterial: MeshBasicMaterial
  private readonly ringMaterial: MeshBasicMaterial
  private readonly dot: Mesh

  private visible = false
  private armed = true
  private opacity = 0
  private pulse = 0

  constructor(scene: Object3D) {
    this.armMaterial = new MeshBasicMaterial({
      color: PALETTE.crosshairArmed,
      transparent: true,
      opacity: 0,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    })
    this.ringMaterial = new MeshBasicMaterial({
      color: PALETTE.crosshairArmed,
      transparent: true,
      opacity: 0,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    })

    // Four arms with a gap in the middle.
    const armLength = 1.7
    const armThickness = 0.16
    const gap = 0.75
    const offsets: [number, number, number, number][] = [
      [0, gap + armLength / 2, armThickness, armLength],
      [0, -(gap + armLength / 2), armThickness, armLength],
      [gap + armLength / 2, 0, armLength, armThickness],
      [-(gap + armLength / 2), 0, armLength, armThickness],
    ]
    for (const [x, z, w, d] of offsets) {
      const arm = new Mesh(new BoxGeometry(w, 0.02, d), this.armMaterial)
      arm.position.set(x, 0.08, z)
      arm.renderOrder = 20
      this.group.add(arm)
    }

    // Inner reticle.
    const inner = new RingGeometry(0.6, 0.74, 28)
    inner.rotateX(-Math.PI / 2)
    const innerRing = new Mesh(inner, this.armMaterial)
    innerRing.position.y = 0.08
    innerRing.renderOrder = 20
    this.group.add(innerRing)

    this.dot = new Mesh(new BoxGeometry(0.18, 0.02, 0.18), this.armMaterial)
    this.dot.position.y = 0.09
    this.dot.renderOrder = 21
    this.group.add(this.dot)

    // Blast radius.
    const blast = new RingGeometry(BLAST.killRadius - 0.14, BLAST.killRadius, 56)
    blast.rotateX(-Math.PI / 2)
    const blastRing = new Mesh(blast, this.ringMaterial)
    blastRing.position.y = 0.07
    blastRing.renderOrder = 19
    this.group.add(blastRing)

    this.group.visible = false
    scene.add(this.group)
  }

  setPosition(x: number, z: number): void {
    this.group.position.set(x, 0, z)
  }

  setVisible(visible: boolean): void {
    this.visible = visible
  }

  setArmed(armed: boolean): void {
    this.armed = armed
  }

  update(dt: number): void {
    const target = this.visible ? 1 : 0
    this.opacity += (target - this.opacity) * Math.min(1, dt * 14)
    this.group.visible = this.opacity > 0.01

    this.pulse += dt
    const breathe = this.armed ? 0.92 + Math.sin(this.pulse * 3.4) * 0.08 : 0.55

    this.armMaterial.opacity = this.opacity * breathe
    this.armMaterial.color.setHex(this.armed ? PALETTE.crosshairArmed : PALETTE.crosshair)
    this.ringMaterial.opacity = this.opacity * (this.armed ? 0.4 : 0.14)
    this.ringMaterial.color.setHex(this.armed ? PALETTE.crosshairArmed : PALETTE.crosshair)

    const scale = this.armed ? 1 : 0.82
    this.group.scale.setScalar(scale + (1 - this.opacity) * 0.25)
    this.dot.visible = this.armed
  }
}
