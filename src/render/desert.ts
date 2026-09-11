import {
  Color,
  IcosahedronGeometry,
  InstancedMesh,
  Matrix4,
  MeshLambertMaterial,
  type Object3D,
  Quaternion,
  SphereGeometry,
  Vector3,
} from 'three'
import { Rng } from '../core/rng'
import { TOWN } from '../sim/config'
import { PALETTE } from './materials'

const ROCKS = 150
const DUNES = 26

/**
 * Purely decorative desert outside the town.
 *
 * A portrait phone is much narrower than the town's projected footprint, so
 * fitting the town whole always leaves a band of ground above and below it.
 * Scattering rocks and low dunes out there turns that band from empty canvas
 * into landscape. None of it is simulated and none of it can be hit — it
 * exists only so the frame reads as a place.
 */
export class Desert {
  constructor(parent: Object3D, seed: number) {
    const rng = new Rng(seed ^ 0x5eed)
    const matrix = new Matrix4()
    const position = new Vector3()
    const quaternion = new Quaternion()
    const scale = new Vector3()
    const axisY = new Vector3(0, 1, 0)
    const color = new Color()

    const rockGeo = new IcosahedronGeometry(1, 0)
    rockGeo.deleteAttribute('uv')
    const rocks = new InstancedMesh(
      rockGeo,
      new MeshLambertMaterial({ color: 0xffffff, flatShading: true }),
      ROCKS,
    )
    rocks.castShadow = true
    rocks.receiveShadow = true
    rocks.frustumCulled = false

    for (let i = 0; i < ROCKS; i++) {
      // Anywhere in a disc around town, except on the town itself.
      const angle = rng.angle()
      const radius = TOWN.desertHalf * Math.sqrt(rng.range(0.04, 1))
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      if (Math.abs(x) < TOWN.halfX + 5 && Math.abs(z) < TOWN.halfZ + 5) {
        rocks.setMatrixAt(i, matrix.makeScale(0, 0, 0))
        continue
      }
      const size = rng.range(0.35, 1.5) * (1 + radius / 90)

      position.set(x, size * 0.25, z)
      quaternion.setFromAxisAngle(axisY, rng.angle())
      scale.set(size, size * rng.range(0.4, 0.75), size * rng.range(0.8, 1.25))
      matrix.compose(position, quaternion, scale)
      rocks.setMatrixAt(i, matrix)

      const v = rng.range(0.82, 1.05)
      rocks.setColorAt(i, color.setHex(PALETTE.rubble).multiplyScalar(v))
    }
    parent.add(rocks)

    // Low, wide mounds that give the horizon a silhouette. Sunk almost all the
    // way into the ground: any more and the sphere's rim reads as a hard-edged
    // plate lying on the sand rather than a rise in it.
    const duneGeo = new SphereGeometry(1, 16, 8)
    duneGeo.deleteAttribute('uv')
    const dunes = new InstancedMesh(
      duneGeo,
      new MeshLambertMaterial({ color: 0xffffff, flatShading: true }),
      DUNES,
    )
    dunes.receiveShadow = true
    dunes.frustumCulled = false

    for (let i = 0; i < DUNES; i++) {
      const angle = rng.angle()
      const inner = TOWN.halfZ + 25
      const radius = inner + (TOWN.desertHalf + 60 - inner) * Math.sqrt(rng.next())
      const width = rng.range(22, 58)
      const rise = width * 0.16

      position.set(Math.cos(angle) * radius, -rise * rng.range(0.72, 0.86), Math.sin(angle) * radius)
      quaternion.setFromAxisAngle(axisY, rng.angle())
      scale.set(width, rise, width * rng.range(0.6, 1.1))
      matrix.compose(position, quaternion, scale)
      dunes.setMatrixAt(i, matrix)

      const v = rng.range(0.97, 1.03)
      dunes.setColorAt(i, color.setHex(PALETTE.sand).multiplyScalar(v))
    }
    parent.add(dunes)
  }
}
