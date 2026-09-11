import { EventBus, type GameEvents } from '../core/events'
import { Rng } from '../core/rng'
import { pickWanderTarget, releaseCorpseClaims, updateAgents } from './agents'
import { AGENT, BLAST, BUILDING, DEFAULT_SEED, MOURNING, POPULATION, TOWN } from './config'
import { buildTown, type TownLayout } from './layout'
import { updateMissiles } from './missiles'
import {
  type Agent,
  AgentState,
  type Building,
  BuildingState,
  type Corpse,
  type Crater,
  type Missile,
  type Prop,
  Role,
  type WorldStats,
} from './types'

/**
 * The whole simulation. No three.js, no DOM — just numbers advancing on a
 * fixed timestep, so the same seed and the same inputs always produce the
 * same town. Rendering reads this; it never writes to it.
 */
export class World {
  readonly bus = new EventBus<GameEvents>()

  rng!: Rng
  layout!: TownLayout
  agents!: Agent[]
  corpses!: Corpse[]
  buildings!: Building[]
  props!: Prop[]
  missiles!: Missile[]
  craters!: Crater[]

  time = 0
  reloadTimer = 0
  nextAgentId = 0
  nextCorpseId = 0
  nextMissileId = 0
  private respawnTimer = 0

  stats: WorldStats = {
    civilians: 0,
    terrorists: 0,
    corpses: 0,
    ruins: 0,
    missilesFired: 0,
    killed: 0,
    radicalised: 0,
  }

  constructor(seed: number = DEFAULT_SEED) {
    this.reset(seed)
  }

  reset(seed: number = DEFAULT_SEED): void {
    this.rng = new Rng(seed)
    this.layout = buildTown(this.rng)
    this.buildings = this.layout.buildings
    this.props = this.layout.props
    this.agents = []
    this.corpses = []
    this.missiles = []
    this.craters = []
    this.time = 0
    this.reloadTimer = 0
    this.respawnTimer = 0
    this.nextAgentId = 0
    this.nextCorpseId = 0
    this.nextMissileId = 0
    this.stats = {
      civilians: 0,
      terrorists: 0,
      corpses: 0,
      ruins: 0,
      missilesFired: 0,
      killed: 0,
      radicalised: 0,
    }

    for (let i = 0; i < POPULATION.civilians; i++) this.spawnAgent(Role.Civilian)
    for (let i = 0; i < POPULATION.terrorists; i++) this.spawnAgent(Role.Terrorist)

    this.bus.emit('worldReset', {})
  }

  // ------------------------------------------------------------ stepping

  step(dt: number): void {
    this.time += dt
    updateAgents(this, dt)
    updateMissiles(this, dt)
    this.updateCorpses(dt)
    this.updateBuildings(dt)
    this.updateProps(dt)
    this.updateCraters(dt)
    this.updateRepopulation(dt)
  }

  private updateCorpses(dt: number): void {
    for (let i = this.corpses.length - 1; i >= 0; i--) {
      const c = this.corpses[i]!
      c.age += dt

      // A body is only cleared once nobody is still grieving over it — either
      // its mourners are all radicalised, or nobody ever came.
      const done = c.mourned >= c.quota || c.age > MOURNING.corpseLifetime
      if (done && c.claimed <= 0) {
        this.corpses.splice(i, 1)
        releaseCorpseClaims(this, c.id)
      }
    }
  }

  private updateBuildings(dt: number): void {
    for (let i = 0; i < this.buildings.length; i++) {
      const b = this.buildings[i]!
      if (b.state === BuildingState.Intact) continue

      b.timer += dt
      switch (b.state) {
        case BuildingState.Collapsing:
          if (b.timer >= BUILDING.collapseDuration) {
            b.state = BuildingState.Rubble
            b.timer = 0
          }
          break
        case BuildingState.Rubble:
          if (b.timer >= BUILDING.rebuildDelay) {
            b.state = BuildingState.Rebuilding
            b.timer = 0
          }
          break
        case BuildingState.Rebuilding:
          if (b.timer >= BUILDING.rebuildDuration) {
            b.state = BuildingState.Intact
            b.timer = 0
            this.bus.emit('buildingRebuilt', { x: b.x, z: b.z })
          }
          break
      }
    }
  }

  private updateProps(dt: number): void {
    const regrow = BUILDING.rebuildDelay + BUILDING.rebuildDuration
    for (let i = 0; i < this.props.length; i++) {
      const p = this.props[i]!
      if (!p.destroyed) continue
      p.timer += dt
      if (p.timer >= regrow) {
        p.destroyed = false
        p.timer = 0
      }
    }
  }

  private updateCraters(dt: number): void {
    for (let i = this.craters.length - 1; i >= 0; i--) {
      const c = this.craters[i]!
      c.age += dt
      if (c.age > BLAST.craterLifetime) this.craters.splice(i, 1)
    }
  }

  /**
   * The town slowly refills with civilians walking in from the edges. Without
   * this the world just empties out; with it, the population stays roughly
   * constant while the terrorist share of it only ever climbs.
   */
  private updateRepopulation(dt: number): void {
    const civilians = this.countRole(Role.Civilian)
    if (civilians >= POPULATION.civilians || this.agents.length >= POPULATION.maxAgents) {
      this.respawnTimer = 0
      return
    }

    this.respawnTimer -= dt
    if (this.respawnTimer > 0) return
    this.respawnTimer = this.rng.range(3.5, 8)
    this.spawnAgent(Role.Civilian, true)
  }

  // ------------------------------------------------------------ entities

  spawnAgent(role: Role, fromEdge = false): Agent {
    const pos = fromEdge ? this.edgePosition() : this.freePosition()
    const agent: Agent = {
      id: this.nextAgentId++,
      role,
      state: AgentState.Wander,
      x: pos.x,
      z: pos.z,
      heading: this.rng.angle(),
      speed: role === Role.Terrorist ? AGENT.terroristSpeed : AGENT.civilianSpeed,
      targetX: pos.x,
      targetZ: pos.z,
      wanderTimer: 0,
      corpseId: -1,
      stateTimer: 0,
      gait: this.rng.range(0, 10),
      phase: this.rng.next(),
    }
    pickWanderTarget(this, agent)
    this.agents.push(agent)
    return agent
  }

  /** Remove an agent by index and leave a body behind. */
  killAgent(index: number): void {
    const a = this.agents[index]!

    // If they were mid-grief, free the claim so the body can still be cleared.
    if (a.corpseId >= 0) {
      const c = this.corpseById(a.corpseId)
      if (c) c.claimed = Math.max(0, c.claimed - 1)
    }

    this.agents.splice(index, 1)
    this.corpses.push({
      id: this.nextCorpseId++,
      x: a.x,
      z: a.z,
      heading: a.heading,
      age: 0,
      claimed: 0,
      mourned: 0,
      quota: this.rng.int(MOURNING.minMourners, MOURNING.maxMourners),
    })
    this.bus.emit('personKilled', { x: a.x, z: a.z })
  }

  corpseById(id: number): Corpse | undefined {
    if (id < 0) return undefined
    for (let i = 0; i < this.corpses.length; i++) {
      if (this.corpses[i]!.id === id) return this.corpses[i]
    }
    return undefined
  }

  countRole(role: Role): number {
    let n = 0
    for (let i = 0; i < this.agents.length; i++) if (this.agents[i]!.role === role) n++
    return n
  }

  /** Live counts for the debug overlay. Cheap enough to call per frame. */
  snapshot(): WorldStats {
    let civilians = 0
    let terrorists = 0
    for (let i = 0; i < this.agents.length; i++) {
      if (this.agents[i]!.role === Role.Terrorist) terrorists++
      else civilians++
    }
    let ruins = 0
    for (let i = 0; i < this.buildings.length; i++) {
      const s = this.buildings[i]!.state
      if (s === BuildingState.Rubble || s === BuildingState.Collapsing) ruins++
    }
    this.stats.civilians = civilians
    this.stats.terrorists = terrorists
    this.stats.corpses = this.corpses.length
    this.stats.ruins = ruins
    return this.stats
  }

  // ------------------------------------------------------------ helpers

  /** A spot inside town that isn't inside a standing building. */
  private freePosition(): { x: number; z: number } {
    for (let attempt = 0; attempt < 40; attempt++) {
      const x = this.rng.range(-TOWN.halfX, TOWN.halfX)
      const z = this.rng.range(-TOWN.halfZ, TOWN.halfZ)
      if (!this.insideBuilding(x, z)) return { x, z }
    }
    return { x: 0, z: 0 }
  }

  /** Walks in from a random edge of the map. */
  private edgePosition(): { x: number; z: number } {
    const edgeX = TOWN.halfX + 4
    const edgeZ = TOWN.halfZ + 4
    switch (this.rng.int(0, 3)) {
      case 0:
        return { x: this.rng.range(-edgeX, edgeX), z: -edgeZ }
      case 1:
        return { x: this.rng.range(-edgeX, edgeX), z: edgeZ }
      case 2:
        return { x: -edgeX, z: this.rng.range(-edgeZ, edgeZ) }
      default:
        return { x: edgeX, z: this.rng.range(-edgeZ, edgeZ) }
    }
  }

  private insideBuilding(x: number, z: number): boolean {
    const pad = AGENT.radius + 0.3
    for (let i = 0; i < this.buildings.length; i++) {
      const b = this.buildings[i]!
      if (b.state === BuildingState.Rubble) continue
      if (
        Math.abs(x - b.x) < b.width * 0.5 + pad &&
        Math.abs(z - b.z) < b.depth * 0.5 + pad
      ) {
        return true
      }
    }
    return false
  }
}
