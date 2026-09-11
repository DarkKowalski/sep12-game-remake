/**
 * Seeded PRNG (mulberry32). The simulation never touches Math.random, so a
 * given seed always produces the same town and the same unit-test outcomes.
 */
export class Rng {
  private state: number

  constructor(seed: number) {
    this.state = seed >>> 0
  }

  /** Uniform in [0, 1). */
  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0
    let t = this.state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  /** Uniform in [min, max). */
  range(min: number, max: number): number {
    return min + this.next() * (max - min)
  }

  /** Integer in [min, max]. */
  int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1))
  }

  /** True with probability p. */
  chance(p: number): boolean {
    return this.next() < p
  }

  pick<T>(items: readonly T[]): T {
    return items[Math.floor(this.next() * items.length)]!
  }

  /** Uniform angle in [0, 2π). */
  angle(): number {
    return this.next() * Math.PI * 2
  }

  fork(salt: number): Rng {
    return new Rng((this.state ^ Math.imul(salt, 0x9e3779b1)) >>> 0)
  }
}
