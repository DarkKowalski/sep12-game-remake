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
import { type Building, BuildingState } from '../sim/types'
import type { World } from '../sim/world'
import {
  createRoofGeometry,
  createRoofHutGeometry,
  createRubbleGeometry,
  createWallGeometry,
} from './geometry'
import { PALETTE } from './materials'

/**
 * Buildings and their ruins.
 *
 * Four instanced meshes cover the entire town: walls, roofs, rooftop huts and
 * rubble piles. Hidden instances are scaled to zero rather than compacted —
 * degenerate triangles are cheaper than rewriting the whole instance buffer.
 */
export class BuildingRenderer {
  private readonly walls: InstancedMesh
  private readonly roofs: InstancedMesh
  private readonly huts: InstancedMesh
  private readonly rubble: InstancedMesh

  private readonly matrix = new Matrix4()
  private readonly position = new Vector3()
  private readonly quaternion = new Quaternion()
  private readonly scale = new Vector3()
  private readonly axisY = new Vector3(0, 1, 0)
  private readonly color = new Color()

  constructor(scene: Object3D, world: World) {
    const count = world.buildings.length

    this.walls = new InstancedMesh(
      createWallGeometry(),
      new MeshLambertMaterial({ color: 0xffffff, flatShading: true }),
      count,
    )
    this.roofs = new InstancedMesh(
      createRoofGeometry(),
      new MeshLambertMaterial({ color: 0xffffff, vertexColors: true, flatShading: true }),
      count,
    )
    this.huts = new InstancedMesh(
      createRoofHutGeometry(),
      new MeshLambertMaterial({ color: 0xffffff, vertexColors: true, flatShading: true }),
      count,
    )
    this.rubble = new InstancedMesh(
      createRubbleGeometry(),
      new MeshLambertMaterial({ color: PALETTE.rubble, vertexColors: true, flatShading: true }),
      count,
    )

    for (const mesh of [this.walls, this.roofs, this.huts, this.rubble]) {
      mesh.castShadow = true
      mesh.receiveShadow = true
      mesh.frustumCulled = false
      scene.add(mesh)
    }

    // Colours are fixed for a building's lifetime; write them once.
    for (let i = 0; i < count; i++) {
      const b = world.buildings[i]!
      this.walls.setColorAt(i, this.color.setHex(PALETTE.wall[b.tint % PALETTE.wall.length]!))
      this.roofs.setColorAt(
        i,
        this.color.setHex(PALETTE.roof[(b.tint + b.id) % PALETTE.roof.length]!),
      )
      this.huts.setColorAt(i, this.color.setHex(PALETTE.wall[b.tint % PALETTE.wall.length]!))
    }
    if (this.walls.instanceColor) this.walls.instanceColor.needsUpdate = true
    if (this.roofs.instanceColor) this.roofs.instanceColor.needsUpdate = true
    if (this.huts.instanceColor) this.huts.instanceColor.needsUpdate = true

    this.update(world)
  }

  update(world: World): void {
    const buildings = world.buildings

    for (let i = 0; i < buildings.length; i++) {
      const b = buildings[i]!
      const standing = this.standingFactor(b)
      const ruined = this.ruinFactor(b)
      const height = b.height * standing

      this.quaternion.setFromAxisAngle(this.axisY, b.rotation)

      // Walls
      if (standing > 0.01) {
        this.position.set(b.x, 0, b.z)
        this.scale.set(b.width, height, b.depth)
      } else {
        this.scale.set(0, 0, 0)
        this.position.set(b.x, -50, b.z)
      }
      this.matrix.compose(this.position, this.quaternion, this.scale)
      this.walls.setMatrixAt(i, this.matrix)

      // Roof slab sits on top of whatever is left standing.
      if (standing > 0.01) {
        this.position.set(b.x, height, b.z)
        this.scale.set(b.width, 1, b.depth)
      } else {
        this.scale.set(0, 0, 0)
      }
      this.matrix.compose(this.position, this.quaternion, this.scale)
      this.roofs.setMatrixAt(i, this.matrix)

      // Roughly every third building gets a rooftop hut.
      if (standing > 0.01 && b.id % 3 === 0) {
        this.position.set(b.x, height + 0.18, b.z)
        this.scale.set(
          Math.min(b.width, b.depth) * 0.55,
          Math.min(b.width, b.depth) * 0.55,
          Math.min(b.width, b.depth) * 0.55,
        )
      } else {
        this.scale.set(0, 0, 0)
      }
      this.matrix.compose(this.position, this.quaternion, this.scale)
      this.huts.setMatrixAt(i, this.matrix)

      // Rubble
      if (ruined > 0.01) {
        this.position.set(b.x, 0, b.z)
        this.scale.set(
          (b.width / 1.35) * ruined,
          (0.7 + b.height * 0.05) * ruined,
          (b.depth / 1.35) * ruined,
        )
      } else {
        this.scale.set(0, 0, 0)
        this.position.set(b.x, -50, b.z)
      }
      this.matrix.compose(this.position, this.quaternion, this.scale)
      this.rubble.setMatrixAt(i, this.matrix)
    }

    this.walls.instanceMatrix.needsUpdate = true
    this.roofs.instanceMatrix.needsUpdate = true
    this.huts.instanceMatrix.needsUpdate = true
    this.rubble.instanceMatrix.needsUpdate = true
  }

  /** How much of the building is still standing, 0..1. */
  private standingFactor(b: Building): number {
    switch (b.state) {
      case BuildingState.Intact:
        return 1
      case BuildingState.Collapsing: {
        const t = Math.min(1, b.timer / BUILDING.collapseDuration)
        // Accelerating collapse — it hangs for a beat, then goes.
        return Math.max(0, 1 - t * t * t)
      }
      case BuildingState.Rubble:
        return 0
      case BuildingState.Rebuilding: {
        const t = Math.min(1, b.timer / BUILDING.rebuildDuration)
        return easeOutBack(t)
      }
    }
  }

  /** How much rubble is present, 0..1. */
  private ruinFactor(b: Building): number {
    switch (b.state) {
      case BuildingState.Intact:
        return 0
      case BuildingState.Collapsing:
        return Math.min(1, b.timer / BUILDING.collapseDuration)
      case BuildingState.Rubble:
        return 1
      case BuildingState.Rebuilding:
        return Math.max(0, 1 - Math.min(1, b.timer / (BUILDING.rebuildDuration * 0.7)))
    }
  }
}

function easeOutBack(t: number): number {
  const c1 = 1.4
  const c3 = c1 + 1
  const p = t - 1
  return Math.max(0, 1 + c3 * p * p * p + c1 * p * p)
}
