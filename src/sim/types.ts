export enum Role {
  Civilian = 0,
  Terrorist = 1,
}

export enum AgentState {
  /** Ambling between random destinations. */
  Wander = 0,
  /** Hurrying toward a body to grieve over it. */
  SeekBody = 1,
  /** Kneeling beside the body. Ends in radicalisation. */
  Mourn = 2,
  /** Just stood up as a terrorist; brief visual flash. */
  Converting = 3,
}

export enum BuildingState {
  Intact = 0,
  Collapsing = 1,
  Rubble = 2,
  Rebuilding = 3,
}

export enum PropKind {
  Palm = 0,
  Stall = 1,
}

export interface Agent {
  id: number
  role: Role
  state: AgentState
  x: number
  z: number
  /** Current facing, radians. Smoothed toward the desired heading. */
  heading: number
  speed: number
  targetX: number
  targetZ: number
  wanderTimer: number
  /** Corpse being mourned, or -1. */
  corpseId: number
  stateTimer: number
  /** Walk-cycle phase, advanced by distance travelled. */
  gait: number
  /** Per-agent jitter so a crowd doesn't move in lockstep. */
  phase: number
}

export interface Corpse {
  id: number
  x: number
  z: number
  heading: number
  age: number
  /** Mourners currently assigned. Caps how many convert per death. */
  claimed: number
  /** Mourners that have finished kneeling. */
  mourned: number
  /** Total mourners this corpse will ever attract. */
  quota: number
}

export interface Building {
  id: number
  x: number
  z: number
  width: number
  depth: number
  height: number
  rotation: number
  /** Index into the wall palette, fixed for the building's lifetime. */
  tint: number
  state: BuildingState
  /** Seconds spent in the current state. */
  timer: number
}

export interface Prop {
  id: number
  kind: PropKind
  x: number
  z: number
  rotation: number
  scale: number
  tint: number
  destroyed: boolean
  timer: number
}

export interface Missile {
  id: number
  /** Impact point. */
  targetX: number
  targetZ: number
  startX: number
  startY: number
  startZ: number
  /** Seconds elapsed since launch. */
  t: number
  flightTime: number
}

export interface Crater {
  x: number
  z: number
  age: number
  radius: number
}

/** Read-only snapshot used by the HUD / debug overlay. */
export interface WorldStats {
  civilians: number
  terrorists: number
  corpses: number
  ruins: number
  missilesFired: number
  killed: number
  radicalised: number
}
