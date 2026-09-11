import {
  Color,
  Euler,
  InstancedMesh,
  Matrix4,
  MeshLambertMaterial,
  Quaternion,
  type Object3D,
  Vector3,
} from 'three'
import { MOURNING, POPULATION } from '../sim/config'
import { AgentState, Role, type Agent } from '../sim/types'
import type { World } from '../sim/world'
import { createPersonGeometry, createRifleGeometry } from './geometry'
import { PALETTE } from './materials'

const MAX_CORPSES = 80

/**
 * Everyone in town, living and dead, in a single instanced draw call — plus a
 * second one for the rifles that mark who is a terrorist.
 *
 * The read has to be instant and unambiguous: pale figures walking upright are
 * civilians; a figure kneeling by a body is grieving; the same figure standing
 * back up dark and armed is the cost of the shot you just took.
 */
export class AgentRenderer {
  private readonly people: InstancedMesh
  private readonly rifles: InstancedMesh

  private readonly matrix = new Matrix4()
  private readonly position = new Vector3()
  private readonly quaternion = new Quaternion()
  private readonly euler = new Euler(0, 0, 0, 'YXZ')
  private readonly scale = new Vector3(1, 1, 1)
  private readonly color = new Color()
  private readonly civilianColor = new Color()
  private readonly terroristColor = new Color(PALETTE.terroristBody)
  private readonly flashColor = new Color(PALETTE.blood)

  constructor(scene: Object3D) {
    const capacity = POPULATION.maxAgents + MAX_CORPSES

    this.people = new InstancedMesh(
      createPersonGeometry(),
      new MeshLambertMaterial({ color: 0xffffff, vertexColors: true, flatShading: true }),
      capacity,
    )
    this.people.castShadow = true
    this.people.receiveShadow = false
    this.people.frustumCulled = false
    this.people.count = 0
    scene.add(this.people)

    this.rifles = new InstancedMesh(
      createRifleGeometry(),
      new MeshLambertMaterial({ color: PALETTE.rifle, vertexColors: true, flatShading: true }),
      POPULATION.maxAgents,
    )
    this.rifles.castShadow = true
    this.rifles.frustumCulled = false
    this.rifles.count = 0
    scene.add(this.rifles)
  }

  update(world: World, time: number): void {
    let personIndex = 0
    let rifleIndex = 0

    const maxPeople = this.people.instanceMatrix.count
    for (let i = 0; i < world.agents.length && personIndex < maxPeople; i++) {
      const a = world.agents[i]!
      this.writeAgent(a, time)
      this.people.setMatrixAt(personIndex, this.matrix)
      this.people.setColorAt(personIndex, this.agentColor(a))
      personIndex++

      // The rifle rides the same transform as the person holding it.
      if (a.role === Role.Terrorist && rifleIndex < POPULATION.maxAgents) {
        this.rifles.setMatrixAt(rifleIndex, this.matrix)
        rifleIndex++
      }
    }

    // The dead, lying where they fell.
    const corpseCount = Math.min(world.corpses.length, MAX_CORPSES, maxPeople - personIndex)
    for (let i = 0; i < corpseCount; i++) {
      const c = world.corpses[i]!
      const sink = Math.max(0, (c.age - MOURNING.corpseLifetime + 3) / 3)
      this.euler.set(Math.PI / 2, c.heading, 0)
      this.quaternion.setFromEuler(this.euler)
      this.position.set(c.x, 0.42 - sink * 0.6, c.z)
      this.scale.set(1, 1, 1)
      this.matrix.compose(this.position, this.quaternion, this.scale)
      this.people.setMatrixAt(personIndex, this.matrix)
      this.people.setColorAt(personIndex, this.color.setHex(PALETTE.corpse))
      personIndex++
    }

    this.people.count = personIndex
    this.rifles.count = rifleIndex
    this.people.instanceMatrix.needsUpdate = true
    this.rifles.instanceMatrix.needsUpdate = true
    if (this.people.instanceColor) this.people.instanceColor.needsUpdate = true
  }

  /** Compose the transform for one living agent into `this.matrix`. */
  private writeAgent(a: Agent, time: number): void {
    if (a.state === AgentState.Mourn) {
      // Kneeling: folded down to half height and bowed hard over the body,
      // rocking slowly. It has to be unmistakable from a distance — if you
      // can't tell this figure is grieving, the game hasn't said anything.
      const settle = Math.min(1, (MOURNING.kneelDuration - a.stateTimer) / 0.6)
      const rock = Math.sin(time * 2.2 + a.phase * 7) * 0.12
      this.euler.set(0.86 * settle + rock * settle, a.heading, 0)
      this.quaternion.setFromEuler(this.euler)
      this.position.set(a.x, 0, a.z)
      const squash = 1 - 0.48 * settle
      this.scale.set(1, squash, 1)
    } else {
      // Walking: a small vertical bob and a matching roll, driven by distance
      // travelled rather than by time, so stopped agents stand still.
      const step = a.gait * 3.4
      const bob = Math.abs(Math.sin(step)) * 0.1
      const roll = Math.sin(step) * 0.08
      this.euler.set(0, a.heading, roll)
      this.quaternion.setFromEuler(this.euler)
      this.position.set(a.x, bob, a.z)
      this.scale.set(1, 1, 1)
    }
    this.matrix.compose(this.position, this.quaternion, this.scale)
  }

  private agentColor(a: Agent): Color {
    if (a.state === AgentState.Converting) {
      // Flash on standing up: the moment a mourner becomes a combatant.
      const t = Math.max(0, Math.min(1, a.stateTimer / MOURNING.conversionFlashDuration))
      return this.color.copy(this.terroristColor).lerp(this.flashColor, t * t)
    }
    if (a.role === Role.Terrorist) return this.color.copy(this.terroristColor)

    const palette = PALETTE.civilianAlt
    this.civilianColor.setHex(palette[a.id % palette.length]!)
    return this.color.copy(this.civilianColor)
  }
}
