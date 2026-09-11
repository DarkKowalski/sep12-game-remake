import { describe, expect, it } from 'vitest'
import { Rng } from '../src/core/rng'
import { buildTown } from '../src/sim/layout'
import { BLAST, BUILDING, MOURNING, POPULATION, SIM } from '../src/sim/config'
import { canFire, detonate, launchMissile } from '../src/sim/missiles'
import { BuildingState, Role } from '../src/sim/types'
import { World } from '../src/sim/world'

/** Advance the simulation by `seconds` of wall-clock time. */
function run(world: World, seconds: number): void {
  const steps = Math.round(seconds / SIM.fixedDt)
  for (let i = 0; i < steps; i++) world.step(SIM.fixedDt)
}

describe('town generation', () => {
  it('is deterministic for a given seed', () => {
    const a = buildTown(new Rng(1234))
    const b = buildTown(new Rng(1234))
    expect(a.buildings.length).toBe(b.buildings.length)
    expect(a.buildings.map((x) => [x.x, x.z, x.height])).toEqual(
      b.buildings.map((x) => [x.x, x.z, x.height]),
    )
  })

  it('produces a populated town with an open square', () => {
    const layout = buildTown(new Rng(7))
    expect(layout.buildings.length).toBeGreaterThan(15)
    expect(layout.openSpaces.length).toBeGreaterThan(0)
  })
})

describe('blast', () => {
  it('kills everyone inside the radius and nobody outside it', () => {
    const world = new World(42)
    world.agents.length = 0

    world.spawnAgent(Role.Civilian)
    world.spawnAgent(Role.Civilian)
    world.spawnAgent(Role.Terrorist)

    // Two just inside the radius, one comfortably outside.
    world.agents[0]!.x = 0
    world.agents[0]!.z = 0
    world.agents[1]!.x = BLAST.killRadius - 0.5
    world.agents[1]!.z = 0
    world.agents[2]!.x = BLAST.killRadius + 3
    world.agents[2]!.z = 0

    detonate(world, 0, 0)

    expect(world.agents.length).toBe(1)
    expect(world.agents[0]!.role).toBe(Role.Terrorist)
    expect(world.corpses.length).toBe(2)
    expect(world.stats.killed).toBe(2)
  })

  it('levels buildings whose footprint overlaps the radius', () => {
    const world = new World(42)
    const target = world.buildings[0]!
    detonate(world, target.x, target.z)
    expect(target.state).toBe(BuildingState.Collapsing)
  })

  it('leaves a scorch mark that eventually expires', () => {
    const world = new World(42)
    detonate(world, 0, 0)
    expect(world.craters.length).toBe(1)
    run(world, BLAST.craterLifetime + 1)
    expect(world.craters.length).toBe(0)
  })
})

describe('mourning', () => {
  it('turns a mourner into a terrorist and clears the body', () => {
    const world = new World(99)
    const terroristsBefore = world.countRole(Role.Terrorist)

    detonate(world, 0, 0)
    expect(world.corpses.length).toBeGreaterThan(0)

    // Long enough for every mourner to walk over, kneel and stand back up,
    // and for any body nobody came to to time out.
    run(world, 110)

    expect(world.stats.radicalised).toBeGreaterThan(0)
    expect(world.countRole(Role.Terrorist)).toBeGreaterThan(terroristsBefore)
    expect(world.corpses.length).toBe(0)
  })

  it('never recruits more mourners than the corpse quota', () => {
    const world = new World(5)
    detonate(world, 0, 0)
    const quota = world.corpses.reduce((sum, c) => sum + c.quota, 0)
    run(world, 90)
    expect(world.stats.radicalised).toBeLessThanOrEqual(quota)
  })

  it('does nothing at all if you never shoot', () => {
    const world = new World(2024)
    run(world, 120)
    expect(world.stats.radicalised).toBe(0)
    expect(world.stats.killed).toBe(0)
    expect(world.countRole(Role.Terrorist)).toBe(POPULATION.terrorists)
  })
})

describe('missiles', () => {
  it('allows only one in flight, and reloads after impact', () => {
    const world = new World(11)
    expect(canFire(world)).toBe(true)
    expect(launchMissile(world, 0, 0)).toBe(true)
    expect(launchMissile(world, 5, 5)).toBe(false)

    run(world, 2.1)
    expect(world.missiles.length).toBe(0)
    expect(world.stats.missilesFired).toBe(1)

    run(world, 1)
    expect(canFire(world)).toBe(true)
  })

  it('detonates where it was aimed, not where it was launched from', () => {
    const world = new World(11)
    launchMissile(world, 8, -6)
    run(world, 2.1)
    expect(world.craters[0]!.x).toBeCloseTo(8, 5)
    expect(world.craters[0]!.z).toBeCloseTo(-6, 5)
  })
})

describe('the town repairs itself', () => {
  it('rebuilds rubble on a timer', () => {
    const world = new World(3)
    const target = world.buildings[0]!
    detonate(world, target.x, target.z)

    run(world, BUILDING.collapseDuration + 0.2)
    expect(target.state).toBe(BuildingState.Rubble)

    run(world, BUILDING.rebuildDelay + BUILDING.rebuildDuration + 0.5)
    expect(target.state).toBe(BuildingState.Intact)
  })

  it('refills the civilian population after a massacre', () => {
    const world = new World(77)
    for (let i = 0; i < 6; i++) detonate(world, i * 4 - 10, 0)
    const survivors = world.countRole(Role.Civilian)

    run(world, MOURNING.corpseLifetime + 90)
    expect(world.countRole(Role.Civilian)).toBeGreaterThan(survivors)
  })
})
