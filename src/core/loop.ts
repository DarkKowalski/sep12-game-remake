import { SIM } from '../sim/config'

/**
 * Fixed-timestep game loop with a render callback.
 *
 * The simulation always advances in exact 1/60 s steps so it stays
 * deterministic and frame-rate independent; rendering happens once per
 * animation frame with an interpolation factor. Catch-up is capped so a
 * backgrounded tab doesn't try to simulate ten minutes in one frame.
 */
export class Loop {
  private rafId = 0
  private lastTime = 0
  private accumulator = 0
  private running = false
  private paused = false

  /** Exponentially smoothed frame time in ms, for the quality watchdog. */
  smoothedFrameMs = 16.7

  constructor(
    private readonly onStep: (dt: number) => void,
    private readonly onRender: (alpha: number, frameDt: number) => void,
  ) {}

  start(): void {
    if (this.running) return
    this.running = true
    this.lastTime = performance.now()
    this.accumulator = 0
    this.rafId = requestAnimationFrame(this.tick)
  }

  stop(): void {
    this.running = false
    cancelAnimationFrame(this.rafId)
  }

  setPaused(paused: boolean): void {
    if (this.paused === paused) return
    this.paused = paused
    // Drop the elapsed time so unpausing doesn't fast-forward the sim.
    this.lastTime = performance.now()
    this.accumulator = 0
  }

  get isPaused(): boolean {
    return this.paused
  }

  private tick = (now: number): void => {
    if (!this.running) return
    this.rafId = requestAnimationFrame(this.tick)

    const frameMs = Math.min(now - this.lastTime, 250)
    this.lastTime = now
    this.smoothedFrameMs += (frameMs - this.smoothedFrameMs) * 0.05

    const frameDt = frameMs / 1000

    if (!this.paused) {
      this.accumulator += frameDt
      let steps = 0
      while (this.accumulator >= SIM.fixedDt && steps < SIM.maxCatchUpSteps) {
        this.onStep(SIM.fixedDt)
        this.accumulator -= SIM.fixedDt
        steps++
      }
      // Ran out of budget: discard the backlog rather than spiralling.
      if (steps === SIM.maxCatchUpSteps) this.accumulator = 0
    }

    this.onRender(this.accumulator / SIM.fixedDt, frameDt)
  }
}
