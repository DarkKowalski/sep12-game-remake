import { AGENT, MOURNING, TOWN } from './config'
import { type Agent, AgentState, BuildingState, type Corpse, Role } from './types'
import type { World } from './world'

/**
 * Crowd behaviour and — the part that matters — the mourning FSM.
 *
 *   Wander ──(a body appears nearby)──► SeekBody ──(arrives)──► Mourn
 *                                                                 │
 *          Converting ◄──────(stands up as a terrorist)───────────┘
 *
 * Only civilians grieve, and every civilian who grieves becomes a terrorist.
 * That single edge in the graph is the whole argument of the original game.
 */

const BOUNDS_X = TOWN.halfX + 5
const BOUNDS_Z = TOWN.halfZ + 5

export function updateAgents(world: World, dt: number): void {
  const agents = world.agents

  for (let i = 0; i < agents.length; i++) {
    const a = agents[i]!
    switch (a.state) {
      case AgentState.Wander:
        updateWander(world, a, dt)
        break
      case AgentState.SeekBody:
        updateSeekBody(world, a, dt)
        break
      case AgentState.Mourn:
        updateMourn(world, a, dt)
        break
      case AgentState.Converting:
        a.stateTimer -= dt
        if (a.stateTimer <= 0) enterWander(world, a)
        moveToward(world, a, a.targetX, a.targetZ, dt, 0.35)
        break
    }
  }

  applySeparation(agents, dt)
  resolveBuildingCollisions(world, dt)
}

// ---------------------------------------------------------------- states

function enterWander(world: World, a: Agent): void {
  a.state = AgentState.Wander
  a.corpseId = -1
  a.stateTimer = 0
  pickWanderTarget(world, a)
}

export function pickWanderTarget(world: World, a: Agent): void {
  const rng = world.rng
  // Bias destinations toward open spaces so crowds form in the square.
  if (world.layout.openSpaces.length > 0 && rng.chance(0.35)) {
    const space = rng.pick(world.layout.openSpaces)
    const angle = rng.angle()
    const r = space.radius * rng.range(0, 0.9)
    a.targetX = space.x + Math.cos(angle) * r
    a.targetZ = space.z + Math.sin(angle) * r
  } else {
    a.targetX = rng.range(-TOWN.halfX, TOWN.halfX)
    a.targetZ = rng.range(-TOWN.halfZ, TOWN.halfZ)
  }
  a.wanderTimer = rng.range(AGENT.wanderMin, AGENT.wanderMax)
}

function updateWander(world: World, a: Agent, dt: number): void {
  a.wanderTimer -= dt

  const arrived = distanceSq(a.x, a.z, a.targetX, a.targetZ) < AGENT.arriveRadius ** 2
  if (arrived || a.wanderTimer <= 0) pickWanderTarget(world, a)

  moveToward(world, a, a.targetX, a.targetZ, dt, 1)

  // Only the living, unradicalised population grieves.
  if (a.role === Role.Civilian) tryClaimCorpse(world, a)
}

function tryClaimCorpse(world: World, a: Agent): void {
  let best: Corpse | null = null
  let bestDist = MOURNING.callRadius ** 2

  for (let i = 0; i < world.corpses.length; i++) {
    const c = world.corpses[i]!
    if (c.claimed + c.mourned >= c.quota) continue
    const d = distanceSq(a.x, a.z, c.x, c.z)
    if (d < bestDist) {
      bestDist = d
      best = c
    }
  }

  if (!best) return
  best.claimed++
  a.corpseId = best.id
  a.state = AgentState.SeekBody
  a.stateTimer = 0
  world.bus.emit('mourningBegan', { x: best.x, z: best.z })
}

function updateSeekBody(world: World, a: Agent, dt: number): void {
  const corpse = world.corpseById(a.corpseId)
  if (!corpse) {
    enterWander(world, a)
    return
  }

  // Wedged behind a building, or the body is somewhere unreachable: give up
  // and hand the claim back so someone else — or the timeout — can clear it.
  a.stateTimer += dt
  if (a.stateTimer > MOURNING.seekTimeout) {
    abandonCorpse(world, a)
    return
  }

  // Mourners stand around the body rather than stacking on top of it.
  const spread = MOURNING.kneelRadius
  const slot = a.phase * Math.PI * 2
  const tx = corpse.x + Math.cos(slot) * spread
  const tz = corpse.z + Math.sin(slot) * spread

  moveToward(world, a, tx, tz, dt, AGENT.mournUrgency)

  if (distanceSq(a.x, a.z, corpse.x, corpse.z) < (spread * 1.6) ** 2) {
    a.state = AgentState.Mourn
    a.stateTimer = MOURNING.kneelDuration
    a.heading = Math.atan2(corpse.x - a.x, corpse.z - a.z)
  }
}

function updateMourn(world: World, a: Agent, dt: number): void {
  const corpse = world.corpseById(a.corpseId)
  a.stateTimer -= dt
  if (a.stateTimer > 0) return

  // Stands up radicalised. This is the only way terrorists are created.
  a.role = Role.Terrorist
  a.speed = AGENT.terroristSpeed
  a.state = AgentState.Converting
  a.stateTimer = MOURNING.conversionFlashDuration
  a.corpseId = -1

  if (corpse) {
    corpse.claimed = Math.max(0, corpse.claimed - 1)
    corpse.mourned++
  }

  pickWanderTarget(world, a)
  world.stats.radicalised++
  world.bus.emit('radicalised', { x: a.x, z: a.z })
}

/** Stop grieving over a body and hand its claim back. */
function abandonCorpse(world: World, a: Agent): void {
  const corpse = world.corpseById(a.corpseId)
  if (corpse) corpse.claimed = Math.max(0, corpse.claimed - 1)
  enterWander(world, a)
}

/** Release a mourner whose body was removed from under them. */
export function releaseCorpseClaims(world: World, corpseId: number): void {
  for (let i = 0; i < world.agents.length; i++) {
    const a = world.agents[i]!
    if (a.corpseId === corpseId) enterWander(world, a)
  }
}

// ---------------------------------------------------------------- motion

function moveToward(
  world: World,
  a: Agent,
  tx: number,
  tz: number,
  dt: number,
  speedScale: number,
): void {
  let dx = tx - a.x
  let dz = tz - a.z
  const dist = Math.hypot(dx, dz)
  if (dist < 1e-4) return
  dx /= dist
  dz /= dist

  // Gentle wobble so the crowd doesn't march in straight lines.
  const wobble = Math.sin(world.time * 1.3 + a.phase * 12) * 0.18
  const cos = Math.cos(wobble)
  const sin = Math.sin(wobble)
  const sx = dx * cos - dz * sin
  const sz = dx * sin + dz * cos

  const speed = a.speed * speedScale
  const step = Math.min(speed * dt, dist)
  a.x += sx * step
  a.z += sz * step
  a.gait += step

  turnToward(a, Math.atan2(sx, sz), dt)
  clampToBounds(a)
}

function turnToward(a: Agent, desired: number, dt: number): void {
  let delta = desired - a.heading
  while (delta > Math.PI) delta -= Math.PI * 2
  while (delta < -Math.PI) delta += Math.PI * 2
  const maxTurn = AGENT.turnRate * dt
  a.heading += Math.max(-maxTurn, Math.min(maxTurn, delta))
}

function clampToBounds(a: Agent): void {
  if (a.x < -BOUNDS_X) a.x = -BOUNDS_X
  else if (a.x > BOUNDS_X) a.x = BOUNDS_X
  if (a.z < -BOUNDS_Z) a.z = -BOUNDS_Z
  else if (a.z > BOUNDS_Z) a.z = BOUNDS_Z
}

/** Symmetric push-apart. Each pair is visited once. */
function applySeparation(agents: Agent[], dt: number): void {
  const r = AGENT.separationRadius
  const rSq = r * r
  const strength = AGENT.separationForce * dt

  for (let i = 0; i < agents.length; i++) {
    const a = agents[i]!
    // Kneeling mourners hold their place around the body.
    const aFixed = a.state === AgentState.Mourn
    for (let j = i + 1; j < agents.length; j++) {
      const b = agents[j]!
      const dx = b.x - a.x
      const dz = b.z - a.z
      const dSq = dx * dx + dz * dz
      if (dSq >= rSq || dSq < 1e-6) continue

      const d = Math.sqrt(dSq)
      const push = ((r - d) / r) * strength
      const nx = (dx / d) * push
      const nz = (dz / d) * push
      const bFixed = b.state === AgentState.Mourn

      if (!aFixed) {
        a.x -= nx
        a.z -= nz
      }
      if (!bFixed) {
        b.x += nx
        b.z += nz
      }
    }
  }
}

/** Push agents out of standing buildings. Rubble is walkable. */
function resolveBuildingCollisions(world: World, _dt: number): void {
  const agents = world.agents
  const buildings = world.buildings
  const pad = AGENT.radius

  for (let i = 0; i < agents.length; i++) {
    const a = agents[i]!
    for (let j = 0; j < buildings.length; j++) {
      const b = buildings[j]!
      if (b.state === BuildingState.Rubble) continue

      const hw = b.width * 0.5 + pad
      const hd = b.depth * 0.5 + pad
      const dx = a.x - b.x
      const dz = a.z - b.z
      if (Math.abs(dx) >= hw || Math.abs(dz) >= hd) continue

      const penX = hw - Math.abs(dx)
      const penZ = hd - Math.abs(dz)
      if (penX < penZ) a.x += dx >= 0 ? penX : -penX
      else a.z += dz >= 0 ? penZ : -penZ
    }
  }
}

export function distanceSq(ax: number, az: number, bx: number, bz: number): number {
  const dx = ax - bx
  const dz = az - bz
  return dx * dx + dz * dz
}
