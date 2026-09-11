import { BLAST, MISSILE, TOWN } from './config'
import { distanceSq } from './agents'
import { BuildingState, type Missile } from './types'
import type { World } from './world'

/**
 * One missile at a time, two seconds in the air.
 *
 * The delay is the mechanic. By the time it lands, whoever you aimed at has
 * walked on and someone else has walked in. You do not get to choose who dies,
 * only whether anyone does.
 */

export function canFire(world: World): boolean {
  return world.missiles.length < MISSILE.maxInFlight && world.reloadTimer <= 0
}

export function launchMissile(world: World, targetX: number, targetZ: number): boolean {
  if (!canFire(world)) return false

  // Comes in on a fixed diagonal so the trail is always readable against the
  // isometric camera, never straight down the view axis.
  const missile: Missile = {
    id: world.nextMissileId++,
    targetX,
    targetZ,
    startX: targetX - MISSILE.launchOffset,
    startY: MISSILE.launchAltitude,
    startZ: targetZ - MISSILE.launchOffset,
    t: 0,
    flightTime: MISSILE.flightTime,
  }

  world.missiles.push(missile)
  world.stats.missilesFired++
  world.bus.emit('missileLaunched', { x: targetX, z: targetZ })
  return true
}

export function updateMissiles(world: World, dt: number): void {
  if (world.reloadTimer > 0) {
    world.reloadTimer -= dt
    if (world.reloadTimer <= 0 && world.missiles.length === 0) {
      world.bus.emit('launcherReady', {})
    }
  }

  for (let i = world.missiles.length - 1; i >= 0; i--) {
    const m = world.missiles[i]!
    m.t += dt
    if (m.t < m.flightTime) continue

    world.missiles.splice(i, 1)
    detonate(world, m.targetX, m.targetZ)
    world.reloadTimer = MISSILE.reloadTime
  }
}

/** Current world-space position of a missile along its arc. */
export function missilePosition(m: Missile, out: { x: number; y: number; z: number }): void {
  const p = Math.min(1, m.t / m.flightTime)
  out.x = m.startX + (m.targetX - m.startX) * p
  out.z = m.startZ + (m.targetZ - m.startZ) * p
  // Slightly steepening descent reads better than a straight line.
  out.y = m.startY * (1 - p) ** 1.55
}

export function detonate(world: World, x: number, z: number): void {
  let killed = 0
  let buildingsHit = 0

  // People first: everyone inside the radius, terrorist or not.
  const killRadiusSq = BLAST.killRadius ** 2
  for (let i = world.agents.length - 1; i >= 0; i--) {
    const a = world.agents[i]!
    if (distanceSq(a.x, a.z, x, z) > killRadiusSq) continue
    world.killAgent(i)
    killed++
  }

  // Buildings: levelled if any part of the footprint is inside the radius.
  for (let i = 0; i < world.buildings.length; i++) {
    const b = world.buildings[i]!
    if (b.state === BuildingState.Rubble || b.state === BuildingState.Collapsing) continue
    if (!circleIntersectsBox(x, z, BLAST.buildingRadius, b.x, b.z, b.width, b.depth)) continue

    b.state = BuildingState.Collapsing
    b.timer = 0
    buildingsHit++
    world.bus.emit('buildingDestroyed', {
      x: b.x,
      z: b.z,
      width: b.width,
      depth: b.depth,
      height: b.height,
    })
  }

  // Props go too.
  const propRadiusSq = BLAST.buildingRadius ** 2
  for (let i = 0; i < world.props.length; i++) {
    const p = world.props[i]!
    if (p.destroyed) continue
    if (distanceSq(p.x, p.z, x, z) > propRadiusSq) continue
    p.destroyed = true
    p.timer = 0
  }

  world.craters.push({
    x,
    z,
    age: 0,
    radius: BLAST.killRadius * 0.85,
  })
  if (world.craters.length > 24) world.craters.shift()

  world.stats.killed += killed
  world.bus.emit('missileImpact', { x, z, killed, buildingsHit })
}

function circleIntersectsBox(
  cx: number,
  cz: number,
  r: number,
  bx: number,
  bz: number,
  width: number,
  depth: number,
): boolean {
  const nearestX = Math.max(bx - width / 2, Math.min(cx, bx + width / 2))
  const nearestZ = Math.max(bz - depth / 2, Math.min(cz, bz + depth / 2))
  return distanceSq(cx, cz, nearestX, nearestZ) <= r * r
}

/** Keep the aim point inside the playfield. */
export function clampAim(x: number, z: number): { x: number; z: number } {
  const limitX = TOWN.halfX + 8
  const limitZ = TOWN.halfZ + 8
  return {
    x: Math.max(-limitX, Math.min(limitX, x)),
    z: Math.max(-limitZ, Math.min(limitZ, z)),
  }
}
