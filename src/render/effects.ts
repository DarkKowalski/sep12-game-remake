import {
  Color,
  ConeGeometry,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Quaternion,
  RingGeometry,
  type Object3D,
  SphereGeometry,
  Vector3,
} from 'three'
import { BLAST, MISSILE } from '../sim/config'
import { missilePosition } from '../sim/missiles'
import type { Missile } from '../sim/types'
import type { World } from '../sim/world'
import { createDebrisGeometry, createSmokePuffGeometry } from './geometry'
import { PALETTE } from './materials'

const MAX_SMOKE = 220
const MAX_DEBRIS = 110
const MAX_RINGS = 5

interface Puff {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  life: number
  maxLife: number
  size: number
  growth: number
  /** 0 = born as fire, 1 = born as cold dust. */
  cold: number
}

interface Chunk {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  rx: number
  ry: number
  spinX: number
  spinY: number
  life: number
  maxLife: number
  size: number
  shade: number
}

/**
 * Explosions, smoke, debris and the missile itself.
 *
 * Smoke and debris are opaque instanced meshes that fade by lerping toward the
 * haze colour and shrinking to nothing, rather than by alpha. The sky, the fog
 * and the sand are all within a few percent of each other, so it reads as a
 * dissolve — and it keeps hundreds of particles out of the transparency sort,
 * which is what makes this hold 60fps on a phone.
 */
export class Effects {
  private readonly smoke: InstancedMesh
  private readonly debris: InstancedMesh
  private readonly rings: Mesh[] = []
  private readonly ringLife: number[] = []
  private readonly flash: Mesh
  private readonly missile: Mesh
  private readonly targetRing: Mesh

  private readonly puffs: Puff[] = []
  private readonly chunks: Chunk[] = []

  private flashLife = 0
  private trailTimer = 0

  private readonly matrix = new Matrix4()
  private readonly position = new Vector3()
  private readonly quaternion = new Quaternion()
  private readonly scale = new Vector3()
  private readonly color = new Color()
  private readonly hazeColor = new Color(PALETTE.fog)
  private readonly fireCore = new Color(PALETTE.fireCore)
  private readonly fireMid = new Color(PALETTE.fireMid)
  private readonly fireEdge = new Color(PALETTE.fireEdge)
  private readonly smokeColor = new Color(PALETTE.smoke)
  private readonly missilePos = { x: 0, y: 0, z: 0 }
  private readonly missileAhead = { x: 0, y: 0, z: 0 }
  private readonly missileProbe: Missile = {
    id: -1,
    targetX: 0,
    targetZ: 0,
    startX: 0,
    startY: 0,
    startZ: 0,
    t: 0,
    flightTime: 1,
  }
  private readonly tumbleAxis = new Vector3(0.6, 0.5, 0.62).normalize()

  /** 0..1 multiplier applied to every particle burst. */
  particleScale = 1

  constructor(scene: Object3D) {
    this.smoke = new InstancedMesh(
      createSmokePuffGeometry(),
      new MeshLambertMaterial({ color: 0xffffff, flatShading: true }),
      MAX_SMOKE,
    )
    this.smoke.count = 0
    this.smoke.frustumCulled = false
    scene.add(this.smoke)

    this.debris = new InstancedMesh(
      createDebrisGeometry(),
      new MeshLambertMaterial({ color: 0xffffff, flatShading: true }),
      MAX_DEBRIS,
    )
    this.debris.count = 0
    this.debris.castShadow = true
    this.debris.frustumCulled = false
    scene.add(this.debris)

    const ringGeo = new RingGeometry(0.86, 1, 40)
    ringGeo.rotateX(-Math.PI / 2)
    for (let i = 0; i < MAX_RINGS; i++) {
      const ring = new Mesh(
        ringGeo,
        new MeshBasicMaterial({
          color: PALETTE.fireMid,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          toneMapped: false,
        }),
      )
      ring.visible = false
      ring.renderOrder = 5
      ring.position.y = 0.06
      scene.add(ring)
      this.rings.push(ring)
      this.ringLife.push(0)
    }

    this.flash = new Mesh(
      new SphereGeometry(1, 12, 8),
      new MeshBasicMaterial({
        color: PALETTE.fireCore,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        toneMapped: false,
      }),
    )
    this.flash.visible = false
    this.flash.renderOrder = 6
    scene.add(this.flash)

    const missileGeo = new ConeGeometry(0.26, 1.5, 6)
    missileGeo.rotateX(Math.PI / 2)
    this.missile = new Mesh(
      missileGeo,
      new MeshLambertMaterial({ color: 0x3c3831, flatShading: true }),
    )
    this.missile.visible = false
    this.missile.castShadow = true
    scene.add(this.missile)

    const targetGeo = new RingGeometry(0.82, 1, 32)
    targetGeo.rotateX(-Math.PI / 2)
    this.targetRing = new Mesh(
      targetGeo,
      new MeshBasicMaterial({
        color: PALETTE.crosshairArmed,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        toneMapped: false,
      }),
    )
    this.targetRing.visible = false
    this.targetRing.renderOrder = 4
    this.targetRing.position.y = 0.05
    scene.add(this.targetRing)
  }

  // ------------------------------------------------------------- spawning

  explosion(x: number, z: number): void {
    const n = Math.round(70 * this.particleScale)
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.4
      const r = Math.random() ** 0.55
      const speed = 3.5 + r * 11
      this.spawnPuff({
        x: x + Math.cos(a) * r * 1.4,
        y: 0.3 + Math.random() * 1.6,
        z: z + Math.sin(a) * r * 1.4,
        vx: Math.cos(a) * speed,
        vy: 3 + Math.random() * 7,
        vz: Math.sin(a) * speed,
        maxLife: 1.5 + Math.random() * 2.6,
        size: 0.3 + Math.random() ** 2 * 1.5,
        growth: 2.2 + Math.random() * 2.8,
        cold: Math.random() * 0.25,
      })
    }

    const chunks = Math.round(34 * this.particleScale)
    for (let i = 0; i < chunks; i++) {
      const a = Math.random() * Math.PI * 2
      const speed = 5 + Math.random() * 14
      this.spawnChunk({
        x,
        y: 0.4,
        z,
        vx: Math.cos(a) * speed,
        vy: 6 + Math.random() * 11,
        vz: Math.sin(a) * speed,
        maxLife: 1.5 + Math.random() * 1.4,
        size: 0.4 + Math.random() * 0.9,
        shade: 0.62 + Math.random() * 0.45,
      })
    }

    this.spawnRing(x, z)
    this.flash.position.set(x, 1.6, z)
    this.flashLife = 1
  }

  /** Dust kicked up where a building comes down. */
  collapseDust(x: number, z: number, width: number, depth: number, height: number): void {
    const n = Math.round(14 * this.particleScale)
    for (let i = 0; i < n; i++) {
      this.spawnPuff({
        x: x + (Math.random() - 0.5) * width,
        y: Math.random() * height * 0.4,
        z: z + (Math.random() - 0.5) * depth,
        vx: (Math.random() - 0.5) * 3,
        vy: 1 + Math.random() * 2.5,
        vz: (Math.random() - 0.5) * 3,
        maxLife: 1.8 + Math.random() * 1.8,
        size: 0.7 + Math.random() * 1.2,
        growth: 1.4,
        cold: 1,
      })
    }
  }

  // -------------------------------------------------------------- updates

  update(world: World, dt: number, elapsed: number): void {
    this.updateMissile(world, dt, elapsed)
    this.updatePuffs(dt)
    this.updateChunks(dt)
    this.updateRings(dt)
    this.updateFlash(dt)
  }

  private updateMissile(world: World, dt: number, elapsed: number): void {
    const m = world.missiles[0]
    if (!m) {
      this.missile.visible = false
      this.targetRing.visible = false
      return
    }

    missilePosition(m, this.missilePos)
    this.missile.position.set(this.missilePos.x, this.missilePos.y, this.missilePos.z)

    // Point the nose down the flight path: sample a point slightly ahead.
    Object.assign(this.missileProbe, m)
    this.missileProbe.t = Math.min(m.flightTime, m.t + 0.05)
    missilePosition(this.missileProbe, this.missileAhead)
    this.missile.lookAt(this.missileAhead.x, this.missileAhead.y, this.missileAhead.z)
    this.missile.visible = true

    // Target marker: a ring that tightens and pulses faster as impact nears.
    const p = Math.min(1, m.t / m.flightTime)
    const mat = this.targetRing.material as MeshBasicMaterial
    const radius = BLAST.killRadius * (1.9 - 0.9 * p)
    this.targetRing.visible = true
    this.targetRing.position.set(m.targetX, 0.05, m.targetZ)
    this.targetRing.scale.set(radius, 1, radius)
    mat.opacity = 0.28 + 0.32 * Math.abs(Math.sin(elapsed * (5 + 12 * p)))

    // Exhaust trail.
    this.trailTimer -= dt
    if (this.trailTimer <= 0 && this.missilePos.y > 0.5) {
      this.trailTimer = 0.035
      this.spawnPuff({
        x: this.missilePos.x,
        y: this.missilePos.y,
        z: this.missilePos.z,
        vx: (Math.random() - 0.5) * 0.8,
        vy: 0.4,
        vz: (Math.random() - 0.5) * 0.8,
        maxLife: 1.1 + Math.random() * 0.7,
        size: 0.24 + Math.random() * 0.2,
        growth: 1.5,
        cold: 0.85,
      })
    }
  }

  private updatePuffs(dt: number): void {
    let index = 0
    for (let i = this.puffs.length - 1; i >= 0; i--) {
      const p = this.puffs[i]!
      p.life -= dt
      if (p.life <= 0) {
        this.puffs.splice(i, 1)
        continue
      }

      p.x += p.vx * dt
      p.y += p.vy * dt
      p.z += p.vz * dt
      // Drag plus buoyancy: the plume slows, then climbs.
      const drag = Math.exp(-2.4 * dt)
      p.vx *= drag
      p.vz *= drag
      p.vy = p.vy * drag + 2.6 * dt
      if (p.y < 0.2) {
        p.y = 0.2
        p.vy = Math.abs(p.vy) * 0.3
      }
    }

    const count = Math.min(this.puffs.length, MAX_SMOKE)
    for (let i = 0; i < count; i++) {
      const p = this.puffs[i]!
      const age = 1 - p.life / p.maxLife

      // Colour: fire → smoke → haze. Cold particles skip the fire stage.
      if (age < 0.12 && p.cold < 0.5) {
        this.color.copy(this.fireCore).lerp(this.fireMid, age / 0.12)
      } else if (age < 0.3 && p.cold < 0.5) {
        this.color.copy(this.fireMid).lerp(this.fireEdge, (age - 0.12) / 0.18)
      } else {
        const t = p.cold >= 0.5 ? age : (age - 0.3) / 0.7
        this.color.copy(p.cold >= 0.5 ? this.smokeColor : this.fireEdge)
        this.color.lerp(this.smokeColor, Math.min(1, t * 1.4))
      }
      // Dissolve into the haze over the last third of the life.
      const dissolve = Math.max(0, (age - 0.55) / 0.45)
      this.color.lerp(this.hazeColor, dissolve * dissolve)

      const size = p.size * (1 + age * p.growth) * (1 - dissolve * 0.55)
      this.position.set(p.x, p.y, p.z)
      this.quaternion.set(0, 0, 0, 1)
      this.scale.set(size, size * 0.88, size)
      this.matrix.compose(this.position, this.quaternion, this.scale)
      this.smoke.setMatrixAt(index, this.matrix)
      this.smoke.setColorAt(index, this.color)
      index++
    }

    this.smoke.count = index
    if (index > 0) {
      this.smoke.instanceMatrix.needsUpdate = true
      if (this.smoke.instanceColor) this.smoke.instanceColor.needsUpdate = true
    }
  }

  private updateChunks(dt: number): void {
    for (let i = this.chunks.length - 1; i >= 0; i--) {
      const c = this.chunks[i]!
      c.life -= dt
      if (c.life <= 0) {
        this.chunks.splice(i, 1)
        continue
      }
      c.vy -= 24 * dt
      c.x += c.vx * dt
      c.y += c.vy * dt
      c.z += c.vz * dt
      c.rx += c.spinX * dt
      c.ry += c.spinY * dt
      if (c.y < 0.12) {
        c.y = 0.12
        c.vy *= -0.32
        c.vx *= 0.62
        c.vz *= 0.62
        c.spinX *= 0.5
        c.spinY *= 0.5
      }
    }

    const count = Math.min(this.chunks.length, MAX_DEBRIS)
    for (let i = 0; i < count; i++) {
      const c = this.chunks[i]!
      const age = 1 - c.life / c.maxLife
      const shrink = Math.max(0, 1 - Math.max(0, (age - 0.7) / 0.3))
      this.position.set(c.x, c.y, c.z)
      this.quaternion.setFromAxisAngle(this.tumbleAxis, c.rx + c.ry)
      const s = c.size * shrink
      this.scale.set(s, s, s)
      this.matrix.compose(this.position, this.quaternion, this.scale)
      this.debris.setMatrixAt(i, this.matrix)
      this.color.setHex(PALETTE.rubble).multiplyScalar(c.shade)
      this.debris.setColorAt(i, this.color)
    }

    this.debris.count = count
    if (count > 0) {
      this.debris.instanceMatrix.needsUpdate = true
      if (this.debris.instanceColor) this.debris.instanceColor.needsUpdate = true
    }
  }

  private updateRings(dt: number): void {
    for (let i = 0; i < this.rings.length; i++) {
      const previous = this.ringLife[i]!
      if (previous <= 0) continue
      const life = previous - dt / 0.85
      this.ringLife[i] = Math.max(0, life)
      const ring = this.rings[i]!
      if (life <= 0) {
        ring.visible = false
        continue
      }
      const grow = 1 - life
      const radius = 1.2 + grow * BLAST.visualRadius
      ring.scale.set(radius, 1, radius)
      ;(ring.material as MeshBasicMaterial).opacity = life * life * 0.8
    }
  }

  private updateFlash(dt: number): void {
    if (this.flashLife <= 0) {
      this.flash.visible = false
      return
    }
    this.flashLife -= dt / 0.34
    const life = Math.max(0, this.flashLife)
    this.flash.visible = life > 0
    const s = (1 - life) * BLAST.killRadius * 1.15 + 0.6
    this.flash.scale.setScalar(s)
    ;(this.flash.material as MeshBasicMaterial).opacity = life * 0.92
  }

  // -------------------------------------------------------------- helpers

  private spawnPuff(init: Omit<Puff, 'life'>): void {
    if (this.puffs.length >= MAX_SMOKE) this.puffs.shift()
    this.puffs.push({ ...init, life: init.maxLife })
  }

  private spawnChunk(
    init: Omit<Chunk, 'life' | 'rx' | 'ry' | 'spinX' | 'spinY'>,
  ): void {
    if (this.chunks.length >= MAX_DEBRIS) this.chunks.shift()
    this.chunks.push({
      ...init,
      life: init.maxLife,
      rx: Math.random() * Math.PI,
      ry: Math.random() * Math.PI,
      spinX: (Math.random() - 0.5) * 14,
      spinY: (Math.random() - 0.5) * 14,
    })
  }

  private spawnRing(x: number, z: number): void {
    let slot = this.ringLife.indexOf(0)
    if (slot < 0) slot = 0
    const ring = this.rings[slot]!
    ring.position.set(x, 0.06, z)
    ring.visible = true
    this.ringLife[slot] = 1
  }
}

/** Where the missile currently is, for the audio panner and camera cues. */
export function missileAltitudeFraction(world: World): number {
  const m = world.missiles[0]
  if (!m) return 0
  return 1 - Math.min(1, m.t / MISSILE.flightTime)
}
