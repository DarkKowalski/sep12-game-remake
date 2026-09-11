import { Group, type Material, type Mesh, type Object3D } from 'three'
import { AudioEngine } from './audio/audio'
import { Sfx } from './audio/sfx'
import { Loop } from './core/loop'
import { initI18n, t } from './i18n'
import { PointerInput } from './input/pointer'
import { AgentRenderer } from './render/agentRenderer'
import { BuildingRenderer } from './render/buildingRenderer'
import { Crosshair } from './render/crosshair'
import { Desert } from './render/desert'
import { Effects } from './render/effects'
import { GroundRenderer } from './render/ground'
import { PropRenderer } from './render/propRenderer'
import { Stage } from './render/scene'
import { DEFAULT_SEED } from './sim/config'
import { canFire, clampAim, launchMissile } from './sim/missiles'
import { World } from './sim/world'
import { Hud } from './ui/hud'
import { Intro } from './ui/intro'
import './ui/styles.css'

// Pick the player's language before anything renders a string.
initI18n()

const canvas = document.querySelector<HTMLCanvasElement>('#scene')!
const uiRoot = document.querySelector<HTMLElement>('#ui')!

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const isTouchDevice = window.matchMedia('(hover: none), (pointer: coarse)').matches

const world = new World(DEFAULT_SEED)
const stage = new Stage(canvas)
const audio = new AudioEngine()
const sfx = new Sfx(audio)

/** Everything that has to be rebuilt when the town is regenerated. */
interface Renderers {
  group: Group
  ground: GroundRenderer
  buildings: BuildingRenderer
  props: PropRenderer
  agents: AgentRenderer
  effects: Effects
}

let seed = DEFAULT_SEED
let renderers = createRenderers()
const crosshair = new Crosshair(stage.scene)

let elapsed = 0
let aiming = false

function createRenderers(): Renderers {
  const group = new Group()
  stage.scene.add(group)
  new Desert(group, seed)
  return {
    group,
    ground: new GroundRenderer(group, world.layout),
    buildings: new BuildingRenderer(group, world),
    props: new PropRenderer(group, world),
    agents: new AgentRenderer(group),
    effects: new Effects(group),
  }
}

function disposeRenderers(current: Renderers): void {
  stage.scene.remove(current.group)
  current.group.traverse((object: Object3D) => {
    const mesh = object as Mesh
    if (!mesh.isMesh) return
    mesh.geometry?.dispose()
    const material = mesh.material as Material | Material[]
    if (Array.isArray(material)) material.forEach((m) => m.dispose())
    else material?.dispose()
  })
}

// ------------------------------------------------------------------ events

world.bus.on('missileLaunched', () => {
  sfx.launch()
})

world.bus.on('missileImpact', ({ x, z }) => {
  renderers.effects.explosion(x, z)
  stage.rig.shake(1)
  hud.flash()
  sfx.impact()
})

world.bus.on('buildingDestroyed', ({ x, z, width, depth, height }) => {
  renderers.effects.collapseDust(x, z, width, depth, height)
  sfx.collapse()
})

world.bus.on('mourningBegan', () => {
  sfx.wail()
})

world.bus.on('radicalised', () => {
  sfx.radicalise()
})

// --------------------------------------------------------------- interface

const hud = new Hud(uiRoot, {
  onRestart: () => {
    seed = (Math.random() * 0xffffffff) >>> 0
    world.reset(seed)
    disposeRenderers(renderers)
    renderers = createRenderers()
    applyQuality()
  },
  onPauseChange: (paused) => {
    loop.setPaused(paused)
    pointer.enabled = !paused
    crosshair.setVisible(false)
    aiming = false
    document.body.classList.toggle('show-cursor', paused)
  },
  onToggleSound: () => {
    audio.unlock()
    return audio.toggleMuted()
  },
  isMuted: () => audio.isMuted,
  getStats: () => world.snapshot(),
})

const pointer = new PointerInput(canvas, stage.camera, {
  onAim: (x, z) => {
    const aim = clampAim(x, z)
    crosshair.setPosition(aim.x, aim.z)
  },
  onFire: (x, z) => {
    const aim = clampAim(x, z)
    launchMissile(world, aim.x, aim.z)
  },
  onCrosshairVisible: (visible) => {
    aiming = visible
    crosshair.setVisible(visible)
  },
  onFirstGesture: () => audio.unlock(),
})

const intro = new Intro(uiRoot, {
  touch: isTouchDevice,
  onBegin: () => {
    audio.unlock()
    pointer.enabled = true
    hud.setChromeVisible(true)
    document.body.classList.remove('show-cursor')
    hud.showHint(isTouchDevice ? t().hud.hintTouch : t().hud.hintPointer)
  },
})

// -------------------------------------------------------------------- loop

const loop = new Loop(
  (dt) => world.step(dt),
  (_alpha, frameDt) => {
    elapsed += frameDt

    renderers.agents.update(world, elapsed)
    renderers.buildings.update(world)
    renderers.props.update()
    renderers.ground.update(world)
    renderers.effects.update(world, frameDt, elapsed)

    crosshair.setArmed(canFire(world))
    crosshair.setVisible(aiming)
    crosshair.update(frameDt)

    stage.rig.update(frameDt, prefersReducedMotion)
    stage.render()

    watchQuality(frameDt)
  },
)

// ---------------------------------------------------------------- resizing

function resize(): void {
  const width = canvas.clientWidth || window.innerWidth
  const height = canvas.clientHeight || window.innerHeight
  stage.resize(width, height)
  pointer.refreshRect()
}

let resizePending = false
function scheduleResize(): void {
  if (resizePending) return
  resizePending = true
  requestAnimationFrame(() => {
    resizePending = false
    resize()
  })
}

window.addEventListener('resize', scheduleResize)
window.addEventListener('orientationchange', scheduleResize)
window.visualViewport?.addEventListener('resize', scheduleResize)
window.addEventListener('scroll', () => pointer.refreshRect(), { passive: true })

document.addEventListener('visibilitychange', () => {
  // Don't simulate an unseen town; also stops audio piling up in a background tab.
  if (document.hidden) loop.setPaused(true)
  else if (!document.querySelector('.panel')) loop.setPaused(false)
})

// ------------------------------------------------- adaptive quality control

let qualityTimer = 0
let qualityStep = 0

function applyQuality(): void {
  renderers.effects.particleScale = stage.quality.particles
}

function watchQuality(frameDt: number): void {
  qualityTimer += frameDt
  if (qualityTimer < 2.5 || qualityStep >= 2) return
  qualityTimer = 0

  // Only ever step down. Toggling back and forth is worse than a stable
  // lower setting, and the player would see the shadows popping.
  if (loop.smoothedFrameMs <= 26) return

  qualityStep++
  if (qualityStep === 1) {
    stage.setShadows(false)
  } else {
    stage.quality.particles = 0.4
    applyQuality()
  }
}

// ------------------------------------------------------------------ startup

applyQuality()
resize()
document.body.classList.add('show-cursor')
intro.show()
loop.start()
