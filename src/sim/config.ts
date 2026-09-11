/**
 * Every tunable in the toy world lives here.
 *
 * The numbers are not arbitrary — they encode the original game's argument.
 * The blast radius is large relative to the spacing between people, and the
 * missile's flight time is long relative to how far a person walks in that
 * time. Together those two facts guarantee collateral damage. Loosen either
 * one and the game stops making its point.
 */

/**
 * World units. The town occupies [-halfX, +halfX] × [-halfZ, +halfZ].
 *
 * The town is deliberately a long rectangle rather than a square. A square
 * town projects to a shape whose width:height ratio is 1/sin(elevation) — at
 * best 1:1, looking straight down. A portrait phone is roughly 0.46:1, so a
 * square town scaled to fit the width can never occupy more than about 46% of
 * the screen height, no matter how the camera is tilted. Stretching the town
 * along one axis and letting the camera put that axis down the long side of
 * the screen is the only way the map fills a phone.
 */
export const TOWN = {
  /** Half-extent across the short axis: 4 blocks. */
  halfX: 20,
  /** Half-extent along the long axis: 8 blocks. */
  halfZ: 40,
  /** Size of one city block, including the road around it. */
  cell: 10,
  /** Width of the roads between blocks. */
  roadWidth: 2.8,
  /** Ground plane extends far past the town so its edge is never visible. */
  groundHalf: 420,
  /** Desert scatter (rocks, scrub, dunes) fills the frame out to here. */
  desertHalf: 150,
} as const

export const SIM = {
  /** Fixed simulation step. The sim is deterministic at this rate. */
  fixedDt: 1 / 60,
  /** Never simulate more than this many steps in one frame (tab-restore guard). */
  maxCatchUpSteps: 5,
} as const

export const POPULATION = {
  civilians: 54,
  terrorists: 6,
  /** Hard ceiling so a pathological player can't melt a phone. */
  maxAgents: 260,
} as const

export const AGENT = {
  // People are deliberately oversized relative to the buildings. At a zoom
  // that fits the whole town on a phone, anatomically-scaled figures are four
  // pixels tall and the game becomes unreadable — and the people are the
  // entire point. Toy scale, toy world.
  radius: 0.62,
  height: 2.5,
  /** Civilians amble; terrorists patrol slightly faster. */
  civilianSpeed: 1.8,
  terroristSpeed: 2.3,
  /** Speed multiplier while hurrying toward a body to mourn. */
  mournUrgency: 1.6,
  /** How hard agents push out of each other. */
  separationRadius: 1.6,
  separationForce: 4.0,
  /** Steering: how fast heading can change, radians/second. */
  turnRate: 3.2,
  /** Seconds between picking a new wander destination. */
  wanderMin: 1.6,
  wanderMax: 4.5,
  /** Distance at which a wander target counts as reached. */
  arriveRadius: 0.7,
} as const

export const MOURNING = {
  /** How far a civilian will travel to grieve over a body. */
  callRadius: 22,
  /** Mourners recruited per corpse. Each one becomes a terrorist. */
  minMourners: 1,
  maxMourners: 3,
  /** How close a mourner kneels to the body. */
  kneelRadius: 1.9,
  /** Seconds spent kneeling before standing up radicalised. */
  kneelDuration: 5.0,
  /** Seconds a body lies unattended before it fades (no mourner in range). */
  corpseLifetime: 45,
  /** Post-conversion grace period: a fresh terrorist won't immediately re-mourn. */
  conversionFlashDuration: 1.2,
  /**
   * Give up walking to a body after this long. Without it, a mourner wedged
   * behind a building would hold its claim forever and the body would never
   * be cleared — one stuck agent quietly freezing part of the simulation.
   */
  seekTimeout: 20,
} as const

export const MISSILE = {
  /** Seconds from launch to impact. The whole game is in this delay. */
  flightTime: 2.0,
  /** Altitude the missile is released from. */
  launchAltitude: 55,
  /** Horizontal offset of the launch point from the target (comes in at an angle). */
  launchOffset: 26,
  /** Only one missile may be in the air at a time. */
  maxInFlight: 1,
  /** Forced delay after an impact before the launcher is ready again. */
  reloadTime: 0.6,
} as const

export const BLAST = {
  /** Anyone inside this radius of the impact dies. */
  killRadius: 5.5,
  /** Buildings whose centre is inside this radius are levelled. */
  buildingRadius: 7.0,
  /** Visual shockwave reaches this far. */
  visualRadius: 11.0,
  /** Seconds the scorch mark stays on the ground. */
  craterLifetime: 26,
  /** Screen shake magnitude and decay. */
  shakeAmplitude: 0.85,
  shakeDuration: 0.9,
} as const

export const BUILDING = {
  /** Seconds of rubble before the town rebuilds. */
  rebuildDelay: 30,
  /** Seconds the rebuild animation takes. */
  rebuildDuration: 2.2,
  /** Seconds a building takes to collapse into rubble. */
  collapseDuration: 0.7,
  minFootprint: 3.2,
  maxFootprint: 6.2,
  minHeight: 3.8,
  maxHeight: 10.5,
} as const

export const PROPS = {
  palms: 38,
  stalls: 20,
} as const

/** Default world seed. Same seed ⇒ same town, every load. */
export const DEFAULT_SEED = 0x53455031 // "SEP1"
