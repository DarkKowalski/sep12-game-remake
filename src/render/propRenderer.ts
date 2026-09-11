import {
  Color,
  InstancedMesh,
  Matrix4,
  MeshLambertMaterial,
  Quaternion,
  type Object3D,
  Vector3,
} from 'three'
import { BUILDING } from '../sim/config'
import { type Prop, PropKind } from '../sim/types'
import type { World } from '../sim/world'
import {
  createPalmGeometry,
  createStallCanopyGeometry,
  createStallFrameGeometry,
} from './geometry'
import { PALETTE } from './materials'

/**
 * Palms and market stalls. Blown flat by a nearby blast, they grow back on the
 * same timer as the buildings — the town always repairs itself, which is part
 * of why nothing you do here ever ends.
 */
export class PropRenderer {
  private readonly palms: InstancedMesh
  private readonly frames: InstancedMesh
  private readonly canopies: InstancedMesh

  /** Direct references; the prop list never changes shape after layout. */
  private readonly palmProps: Prop[] = []
  private readonly stallProps: Prop[] = []

  private readonly matrix = new Matrix4()
  private readonly position = new Vector3()
  private readonly quaternion = new Quaternion()
  private readonly scale = new Vector3()
  private readonly axisY = new Vector3(0, 1, 0)
  private readonly color = new Color()

  constructor(scene: Object3D, world: World) {
    for (const p of world.props) {
      if (p.kind === PropKind.Palm) this.palmProps.push(p)
      else this.stallProps.push(p)
    }

    this.palms = new InstancedMesh(
      createPalmGeometry(),
      new MeshLambertMaterial({ color: 0xffffff, vertexColors: true, flatShading: true }),
      Math.max(1, this.palmProps.length),
    )
    this.frames = new InstancedMesh(
      createStallFrameGeometry(),
      new MeshLambertMaterial({ color: 0xffffff, vertexColors: true, flatShading: true }),
      Math.max(1, this.stallProps.length),
    )
    this.canopies = new InstancedMesh(
      createStallCanopyGeometry(),
      new MeshLambertMaterial({ color: 0xffffff, flatShading: true }),
      Math.max(1, this.stallProps.length),
    )

    for (const mesh of [this.palms, this.frames, this.canopies]) {
      mesh.castShadow = true
      mesh.receiveShadow = true
      mesh.frustumCulled = false
      scene.add(mesh)
    }

    // Per-instance tints, written once.
    this.palmProps.forEach((p, i) => {
      // Subtle brightness variation so the grove doesn't look cloned.
      const v = 0.86 + (p.tint % 3) * 0.09
      this.palms.setColorAt(i, this.color.setRGB(v, v, v))
    })
    this.stallProps.forEach((p, i) => {
      this.frames.setColorAt(i, this.color.setRGB(1, 1, 1))
      this.canopies.setColorAt(
        i,
        this.color.setHex(PALETTE.stallCanopy[p.tint % PALETTE.stallCanopy.length]!),
      )
    })
    for (const mesh of [this.palms, this.frames, this.canopies]) {
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    }

    this.update()
  }

  update(): void {
    for (let i = 0; i < this.palmProps.length; i++) {
      const p = this.palmProps[i]!
      this.writeMatrix(p)
      this.palms.setMatrixAt(i, this.matrix)
    }

    for (let i = 0; i < this.stallProps.length; i++) {
      const p = this.stallProps[i]!
      this.writeMatrix(p)
      this.frames.setMatrixAt(i, this.matrix)
      this.canopies.setMatrixAt(i, this.matrix)
    }

    this.palms.instanceMatrix.needsUpdate = true
    this.frames.instanceMatrix.needsUpdate = true
    this.canopies.instanceMatrix.needsUpdate = true
  }

  private writeMatrix(p: Prop): void {
    const s = p.scale * growth(p.destroyed, p.timer)
    this.position.set(p.x, 0, p.z)
    this.quaternion.setFromAxisAngle(this.axisY, p.rotation)
    this.scale.set(s, s, s)
    this.matrix.compose(this.position, this.quaternion, this.scale)
  }
}

/** 0 while destroyed, easing back to 1 as it regrows. */
function growth(destroyed: boolean, timer: number): number {
  if (!destroyed) return 1
  if (timer < BUILDING.rebuildDelay) return 0
  const t = Math.min(1, (timer - BUILDING.rebuildDelay) / BUILDING.rebuildDuration)
  return t * t * (3 - 2 * t)
}
