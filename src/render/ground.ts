import {
  CircleGeometry,
  Color,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Object3D,
  PlaneGeometry,
  type BufferGeometry,
} from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { BLAST, TOWN } from '../sim/config'
import type { TownLayout } from '../sim/layout'
import type { World } from '../sim/world'
import { PALETTE } from './materials'

const MAX_CRATERS = 24

/**
 * The ground: sand, road grid, open squares, and the scorch marks left by
 * missiles. Craters fade by lerping toward the sand colour rather than by
 * alpha blending, which keeps them out of the transparency sort entirely.
 */
export class GroundRenderer {
  private readonly craters: InstancedMesh
  private readonly scorch: InstancedMesh
  private readonly matrix = new Matrix4()
  private readonly color = new Color()
  private readonly sandColor = new Color(PALETTE.sand)
  private readonly craterColor = new Color(PALETTE.crater)
  private readonly scorchColor = new Color(PALETTE.road).multiplyScalar(0.78)

  constructor(scene: Object3D, layout: TownLayout) {
    const ground = new Mesh(
      new PlaneGeometry(TOWN.groundHalf * 2, TOWN.groundHalf * 2),
      new MeshLambertMaterial({ color: PALETTE.sand }),
    )
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    const roads = buildRoadMesh(layout)
    if (roads) scene.add(roads)

    const squares = buildOpenSpaceMesh(layout)
    if (squares) scene.add(squares)

    const disc = new CircleGeometry(1, 18)
    disc.rotateX(-Math.PI / 2)

    this.scorch = new InstancedMesh(
      disc,
      new MeshBasicMaterial({ color: 0xffffff, toneMapped: false }),
      MAX_CRATERS,
    )
    this.scorch.count = 0
    this.scorch.frustumCulled = false
    this.scorch.renderOrder = 1
    scene.add(this.scorch)

    this.craters = new InstancedMesh(
      disc.clone(),
      new MeshBasicMaterial({ color: 0xffffff, toneMapped: false }),
      MAX_CRATERS,
    )
    this.craters.count = 0
    this.craters.frustumCulled = false
    this.craters.renderOrder = 2
    scene.add(this.craters)
  }

  update(world: World): void {
    const list = world.craters
    const n = Math.min(list.length, MAX_CRATERS)

    for (let i = 0; i < n; i++) {
      const c = list[i]!
      // Fresh marks are dark; they bleach back into the sand over ~26 s.
      const life = Math.min(1, c.age / BLAST.craterLifetime)
      const fade = life * life

      this.matrix.makeScale(c.radius * 1.65, 1, c.radius * 1.65)
      this.matrix.setPosition(c.x, 0.02, c.z)
      this.scorch.setMatrixAt(i, this.matrix)
      this.color.copy(this.scorchColor).lerp(this.sandColor, Math.min(1, fade * 1.1))
      this.scorch.setColorAt(i, this.color)

      this.matrix.makeScale(c.radius * 0.92, 1, c.radius * 0.92)
      this.matrix.setPosition(c.x, 0.035, c.z)
      this.craters.setMatrixAt(i, this.matrix)
      this.color.copy(this.craterColor).lerp(this.sandColor, fade)
      this.craters.setColorAt(i, this.color)
    }

    this.scorch.count = n
    this.craters.count = n
    if (n > 0) {
      this.scorch.instanceMatrix.needsUpdate = true
      this.craters.instanceMatrix.needsUpdate = true
      if (this.scorch.instanceColor) this.scorch.instanceColor.needsUpdate = true
      if (this.craters.instanceColor) this.craters.instanceColor.needsUpdate = true
    }
  }
}

/** All road strips merged into one mesh. */
function buildRoadMesh(layout: TownLayout): Mesh | null {
  const parts: BufferGeometry[] = []
  const spanX = TOWN.halfX * 2 + TOWN.roadWidth
  const spanZ = TOWN.halfZ * 2 + TOWN.roadWidth
  const helper = new Object3D()

  // Cross-streets, one per boundary along the long axis.
  for (const line of layout.roadLinesZ) {
    const road = new PlaneGeometry(spanX, TOWN.roadWidth)
    road.rotateX(-Math.PI / 2)
    helper.position.set(0, 0.012, line)
    helper.updateMatrix()
    road.applyMatrix4(helper.matrix)
    road.deleteAttribute('uv')
    parts.push(road)
  }

  // The long roads running the length of town.
  for (const line of layout.roadLinesX) {
    const road = new PlaneGeometry(TOWN.roadWidth, spanZ)
    road.rotateX(-Math.PI / 2)
    helper.position.set(line, 0.012, 0)
    helper.updateMatrix()
    road.applyMatrix4(helper.matrix)
    road.deleteAttribute('uv')
    parts.push(road)
  }

  if (parts.length === 0) return null
  const merged = mergeGeometries(parts, false)
  if (!merged) return null

  const mesh = new Mesh(merged, new MeshLambertMaterial({ color: PALETTE.road }))
  mesh.receiveShadow = true
  return mesh
}

/** Market square and vacant lots, a shade lighter than the roads. */
function buildOpenSpaceMesh(layout: TownLayout): Mesh | null {
  if (layout.openSpaces.length === 0) return null
  const parts: BufferGeometry[] = []
  const helper = new Object3D()

  for (const space of layout.openSpaces) {
    const size = space.radius * 2
    const plane = new PlaneGeometry(size, size)
    plane.rotateX(-Math.PI / 2)
    helper.position.set(space.x, 0.014, space.z)
    helper.updateMatrix()
    plane.applyMatrix4(helper.matrix)
    plane.deleteAttribute('uv')
    parts.push(plane)
  }

  const merged = mergeGeometries(parts, false)
  if (!merged) return null

  const mesh = new Mesh(merged, new MeshLambertMaterial({ color: PALETTE.plaza }))
  mesh.receiveShadow = true
  return mesh
}
