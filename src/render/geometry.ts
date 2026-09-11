import {
  BoxGeometry,
  BufferAttribute,
  type BufferGeometry,
  CapsuleGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  IcosahedronGeometry,
  Matrix4,
  SphereGeometry,
} from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/**
 * Every mesh in the game, assembled from primitives at startup.
 *
 * There are no model files and no textures. Multi-coloured objects bake their
 * colours into a vertex-colour attribute and merge into a single geometry, so
 * a whole palm tree or a whole person is one draw call in one InstancedMesh.
 */

/** Strip texture coords and bake a flat colour so geometries can be merged. */
function tint(geo: BufferGeometry, color: number): BufferGeometry {
  geo.deleteAttribute('uv')
  geo.deleteAttribute('uv1')
  const count = geo.getAttribute('position').count
  const c = new Color(color)
  const colors = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    colors[i * 3] = c.r
    colors[i * 3 + 1] = c.g
    colors[i * 3 + 2] = c.b
  }
  geo.setAttribute('color', new BufferAttribute(colors, 3))
  return geo
}

const mat = new Matrix4()
const mat2 = new Matrix4()

// ------------------------------------------------------------------ people

export const PERSON_HEIGHT = 2.5

/**
 * A person: capsule body, sphere head, a slab of shoulders to give the
 * silhouette something to read at distance.
 *
 * The head is baked at 45% brightness, so a single per-instance colour yields
 * a pale body with a dark head for civilians and a dark body with a darker
 * head for terrorists — two-tone figures out of one instanced draw call.
 */
export function createPersonGeometry(): BufferGeometry {
  const body = tint(new CapsuleGeometry(0.42, 1.14, 3, 7), 0xffffff)
  body.applyMatrix4(mat.makeTranslation(0, 0.99, 0))

  const head = tint(new SphereGeometry(0.34, 8, 6), 0x737373)
  head.applyMatrix4(mat.makeTranslation(0, 2.16, 0))

  const shoulders = tint(new BoxGeometry(0.9, 0.19, 0.48), 0xd9d9d9)
  shoulders.applyMatrix4(mat.makeTranslation(0, 1.71, 0))

  return mergeGeometries([body, shoulders, head], false)!
}

/** Rifle, pre-posed in the person's local space (held across the chest). */
export function createRifleGeometry(): BufferGeometry {
  const barrel = tint(new BoxGeometry(0.09, 0.09, 1.6), 0xffffff)
  const stock = tint(new BoxGeometry(0.12, 0.26, 0.42), 0xcfcfcf)
  stock.applyMatrix4(mat.makeTranslation(0, -0.07, -0.67))

  const merged = mergeGeometries([barrel, stock], false)!
  // Angled up and out from the right shoulder.
  mat.makeRotationX(-0.42)
  mat2.makeRotationY(0.34)
  merged.applyMatrix4(mat2.multiply(mat))
  merged.applyMatrix4(mat.makeTranslation(0.48, 1.46, 0.08))
  return merged
}

// --------------------------------------------------------------- buildings

/** Unit box with its base on y=0, so instance scale maps directly to size. */
export function createWallGeometry(): BufferGeometry {
  const geo = new BoxGeometry(1, 1, 1)
  geo.deleteAttribute('uv')
  geo.deleteAttribute('uv1')
  geo.applyMatrix4(mat.makeTranslation(0, 0.5, 0))
  return geo
}

/** Flat roof with a parapet lip — the local vernacular, and it reads well from above. */
export function createRoofGeometry(): BufferGeometry {
  const slab = tint(new BoxGeometry(1.06, 0.16, 1.06), 0xffffff)
  const lipN = tint(new BoxGeometry(1.1, 0.3, 0.09), 0xe0e0e0)
  lipN.applyMatrix4(mat.makeTranslation(0, 0.14, 0.505))
  const lipS = tint(new BoxGeometry(1.1, 0.3, 0.09), 0xe0e0e0)
  lipS.applyMatrix4(mat.makeTranslation(0, 0.14, -0.505))
  const lipE = tint(new BoxGeometry(0.09, 0.3, 1.1), 0xe0e0e0)
  lipE.applyMatrix4(mat.makeTranslation(0.505, 0.14, 0))
  const lipW = tint(new BoxGeometry(0.09, 0.3, 1.1), 0xe0e0e0)
  lipW.applyMatrix4(mat.makeTranslation(-0.505, 0.14, 0))

  return mergeGeometries([slab, lipN, lipS, lipE, lipW], false)!
}

/** Stair hut / water tank that sits on some roofs. */
export function createRoofHutGeometry(): BufferGeometry {
  const hut = tint(new BoxGeometry(0.34, 0.44, 0.34), 0xffffff)
  hut.applyMatrix4(mat.makeTranslation(0, 0.22, 0))
  const tank = tint(new CylinderGeometry(0.1, 0.1, 0.26, 6), 0x8c8c8c)
  tank.applyMatrix4(mat.makeTranslation(0.26, 0.13, -0.2))
  return mergeGeometries([hut, tank], false)!
}

/**
 * A pile of rubble: five flattened rocks in a fixed arrangement, scaled to the
 * footprint of whatever building used to stand there.
 */
export function createRubbleGeometry(): BufferGeometry {
  const chunks: BufferGeometry[] = []
  const layout: [number, number, number, number][] = [
    [0, 0, 0.5, 1.0],
    [0.3, 0.26, 0.34, 0.78],
    [-0.28, 0.18, 0.3, 0.66],
    [0.18, -0.3, 0.26, 0.55],
    [-0.22, -0.24, 0.22, 0.9],
  ]
  for (let i = 0; i < layout.length; i++) {
    const [x, z, size, brightness] = layout[i]!
    const rock = tint(new IcosahedronGeometry(size, 0), grey(brightness))
    rock.applyMatrix4(mat.makeScale(1, 0.42, 1))
    rock.applyMatrix4(mat2.makeRotationY(i * 1.31))
    rock.applyMatrix4(mat.makeTranslation(x, size * 0.2, z))
    chunks.push(rock)
  }
  return mergeGeometries(chunks, false)!
}

// ------------------------------------------------------------------- props

/** Date palm: tapered trunk plus six drooping fronds. */
export function createPalmGeometry(): BufferGeometry {
  const parts: BufferGeometry[] = []

  const trunk = tint(new CylinderGeometry(0.11, 0.19, 3.1, 6), 0x8a6a45)
  trunk.applyMatrix4(mat.makeTranslation(0, 1.55, 0))
  parts.push(trunk)

  const crown = tint(new SphereGeometry(0.19, 6, 4), 0x6f5a3c)
  crown.applyMatrix4(mat.makeTranslation(0, 3.1, 0))
  parts.push(crown)

  const frondColors = [0x6f8f4a, 0x7e9b52, 0x5f7f42]
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2
    const frond = tint(new ConeGeometry(0.2, 1.5, 4), frondColors[i % 3]!)
    // Lay the cone on its side, droop it, then swing it around the crown.
    frond.applyMatrix4(mat.makeRotationZ(Math.PI / 2))
    frond.applyMatrix4(mat.makeTranslation(0.72, 0, 0))
    frond.applyMatrix4(mat.makeRotationZ(-0.34 + (i % 2) * 0.1))
    frond.applyMatrix4(mat.makeRotationY(a))
    frond.applyMatrix4(mat.makeTranslation(0, 3.08, 0))
    parts.push(frond)
  }

  return mergeGeometries(parts, false)!
}

/** Market stall frame: four posts and a counter. Fixed colour. */
export function createStallFrameGeometry(): BufferGeometry {
  const parts: BufferGeometry[] = []
  const postPositions: [number, number][] = [
    [-0.62, -0.42],
    [0.62, -0.42],
    [-0.62, 0.42],
    [0.62, 0.42],
  ]
  for (const [x, z] of postPositions) {
    const post = tint(new BoxGeometry(0.07, 1.25, 0.07), 0x8a7250)
    post.applyMatrix4(mat.makeTranslation(x, 0.62, z))
    parts.push(post)
  }
  const counter = tint(new BoxGeometry(1.4, 0.1, 0.62), 0xa08760)
  counter.applyMatrix4(mat.makeTranslation(0, 0.72, 0))
  parts.push(counter)

  const crate = tint(new BoxGeometry(0.3, 0.26, 0.3), 0x9c7f56)
  crate.applyMatrix4(mat.makeTranslation(-0.4, 0.13, 0.1))
  parts.push(crate)

  return mergeGeometries(parts, false)!
}

/** Stall canopy — tinted per instance. */
export function createStallCanopyGeometry(): BufferGeometry {
  const canopy = new BoxGeometry(1.55, 0.06, 1.1)
  canopy.deleteAttribute('uv')
  canopy.deleteAttribute('uv1')
  canopy.applyMatrix4(mat.makeRotationX(0.12))
  canopy.applyMatrix4(mat2.makeTranslation(0, 1.3, 0))
  return canopy
}

// ----------------------------------------------------------------- effects

export function createDebrisGeometry(): BufferGeometry {
  const geo = new BoxGeometry(0.36, 0.36, 0.36)
  geo.deleteAttribute('uv')
  geo.deleteAttribute('uv1')
  return geo
}

export function createSmokePuffGeometry(): BufferGeometry {
  const geo = new IcosahedronGeometry(1, 0)
  geo.deleteAttribute('uv')
  geo.deleteAttribute('uv1')
  return geo
}

function grey(v: number): number {
  const c = Math.max(0, Math.min(255, Math.round(v * 255)))
  return (c << 16) | (c << 8) | c
}
