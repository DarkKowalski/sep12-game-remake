import { BUILDING, PROPS, TOWN } from './config'
import type { Rng } from '../core/rng'
import { type Building, BuildingState, type Prop, PropKind } from './types'

/**
 * Procedural town layout. Deterministic for a given seed.
 *
 * The town is a grid of blocks separated by roads. The centre block is left
 * open as a market square — it becomes the place where crowds naturally
 * gather, which is exactly where a player is tempted to aim.
 */

export interface TownLayout {
  buildings: Building[]
  props: Prop[]
  /** Road centre-lines running across each axis, for the ground renderer. */
  roadLinesX: number[]
  roadLinesZ: number[]
  /** Cell centres that hold no buildings (plaza / vacant lots). */
  openSpaces: { x: number; z: number; radius: number }[]
}

/** Cell centres along one axis: with half=20 and cell=10 this is -15, -5, 5, 15. */
function cellCentres(half: number): number[] {
  const centres: number[] = []
  const count = Math.round((half * 2) / TOWN.cell)
  for (let i = 0; i < count; i++) centres.push(-half + TOWN.cell * (i + 0.5))
  return centres
}

/** Road centre-lines sit on the cell boundaries. */
function roadLines(half: number): number[] {
  const lines: number[] = []
  const count = Math.round((half * 2) / TOWN.cell)
  for (let i = 0; i <= count; i++) lines.push(-half + TOWN.cell * i)
  return lines
}

export function buildTown(rng: Rng): TownLayout {
  const centresX = cellCentres(TOWN.halfX)
  const centresZ = cellCentres(TOWN.halfZ)
  const buildings: Building[] = []
  const props: Prop[] = []
  const openSpaces: { x: number; z: number; radius: number }[] = []

  /** Buildable square inside each block, once the road is subtracted. */
  const lot = TOWN.cell - TOWN.roadWidth
  const midX = Math.floor((centresX.length - 1) / 2)
  const midZ = Math.floor((centresZ.length - 1) / 2)

  let buildingId = 0
  let propId = 0

  for (let ix = 0; ix < centresX.length; ix++) {
    for (let iz = 0; iz < centresZ.length; iz++) {
      const cx = centresX[ix]!
      const cz = centresZ[iz]!
      // The market square sits at the middle of town, and a second open lot
      // partway down the long axis so crowds have two places to gather.
      const isCentre = (ix === midX && iz === midZ) || (ix === midX && iz === midZ - 2)

      // The market square, plus a couple of vacant lots for variety.
      if (isCentre || rng.chance(0.1)) {
        openSpaces.push({ x: cx, z: cz, radius: lot / 2 })
        continue
      }

      // Divide the lot into a 1×1, 1×2, 2×1 or 2×2 arrangement of sub-lots.
      const cols = rng.chance(0.55) ? 2 : 1
      const rows = rng.chance(0.55) ? 2 : 1
      const subW = lot / cols
      const subD = lot / rows

      for (let sx = 0; sx < cols; sx++) {
        for (let sz = 0; sz < rows; sz++) {
          // Occasional gap between houses: a courtyard.
          if ((cols > 1 || rows > 1) && rng.chance(0.18)) continue

          const subCx = cx - lot / 2 + subW * (sx + 0.5)
          const subCz = cz - lot / 2 + subD * (sz + 0.5)

          const width = clamp(
            subW * rng.range(0.68, 0.94),
            BUILDING.minFootprint,
            BUILDING.maxFootprint,
          )
          const depth = clamp(
            subD * rng.range(0.68, 0.94),
            BUILDING.minFootprint,
            BUILDING.maxFootprint,
          )
          // Buildings shrink toward the outskirts; it reads as a denser core.
          const distanceFromCentre = Math.hypot(subCx / TOWN.halfX, subCz / TOWN.halfZ)
          const heightBias = 1 - Math.min(1, distanceFromCentre) * 0.45
          const height = clamp(
            rng.range(BUILDING.minHeight, BUILDING.maxHeight) * heightBias,
            BUILDING.minHeight,
            BUILDING.maxHeight,
          )

          const slackX = Math.max(0, subW - width) * 0.5
          const slackZ = Math.max(0, subD - depth) * 0.5

          buildings.push({
            id: buildingId++,
            x: subCx + rng.range(-slackX, slackX),
            z: subCz + rng.range(-slackZ, slackZ),
            width,
            depth,
            height,
            // A few degrees each, so every building shows two faces to a
            // camera square with the grid. Collision stays axis-aligned; at
            // this angle the error is under a tenth of a world unit.
            rotation: rng.range(-0.11, 0.11),
            tint: rng.int(0, 3),
            state: BuildingState.Intact,
            timer: 0,
          })
        }
      }
    }
  }

  // Palms line the roads; a few cluster in the open spaces.
  const linesX = roadLines(TOWN.halfX)
  const linesZ = roadLines(TOWN.halfZ)
  for (let i = 0; i < PROPS.palms; i++) {
    let x: number
    let z: number
    if (rng.chance(0.4) && openSpaces.length > 0) {
      const space = rng.pick(openSpaces)
      const a = rng.angle()
      const r = space.radius * rng.range(0.45, 0.95)
      x = space.x + Math.cos(a) * r
      z = space.z + Math.sin(a) * r
    } else if (rng.chance(0.5)) {
      x = rng.pick(linesX) + rng.range(-0.9, 0.9)
      z = rng.range(-TOWN.halfZ, TOWN.halfZ)
    } else {
      x = rng.range(-TOWN.halfX, TOWN.halfX)
      z = rng.pick(linesZ) + rng.range(-0.9, 0.9)
    }
    props.push({
      id: propId++,
      kind: PropKind.Palm,
      x,
      z,
      rotation: rng.angle(),
      scale: rng.range(0.8, 1.35),
      tint: rng.int(0, 2),
      destroyed: false,
      timer: 0,
    })
  }

  // Market stalls, concentrated in the square.
  for (let i = 0; i < PROPS.stalls; i++) {
    const space = openSpaces.length > 0 ? rng.pick(openSpaces) : { x: 0, z: 0, radius: 3 }
    const a = rng.angle()
    const r = space.radius * rng.range(0.15, 0.85)
    props.push({
      id: propId++,
      kind: PropKind.Stall,
      x: space.x + Math.cos(a) * r,
      z: space.z + Math.sin(a) * r,
      rotation: rng.chance(0.5) ? 0 : Math.PI / 2,
      scale: rng.range(0.85, 1.15),
      tint: rng.int(0, 3),
      destroyed: false,
      timer: 0,
    })
  }

  return { buildings, props, roadLinesX: linesX, roadLinesZ: linesZ, openSpaces }
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v
}
