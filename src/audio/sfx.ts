import { MISSILE } from '../sim/config'
import type { AudioEngine } from './audio'

/**
 * The five sounds in the game, all synthesized:
 *
 *   launch      a hard noise burst with a rising filter — the shot leaving
 *   incoming    a falling whistle for the two seconds you can't take it back
 *   impact      sub-bass thump plus a filtered noise tail
 *   wail        a detuned, vibrato'd tone — someone grieving
 *   radicalise  a short dry hit as a mourner stands up armed
 */
export class Sfx {
  private incomingNodes: { osc: OscillatorNode; gain: GainNode } | null = null

  constructor(private readonly engine: AudioEngine) {}

  launch(): void {
    const ctx = this.engine.ctx
    const out = this.engine.out
    if (!ctx || !out) return
    const t = ctx.currentTime

    const source = this.engine.createNoiseSource()
    if (!source) return
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.Q.value = 1.4
    filter.frequency.setValueAtTime(260, t)
    filter.frequency.exponentialRampToValueAtTime(2600, t + 0.28)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.5, t + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5)

    source.connect(filter).connect(gain).connect(out)
    source.start(t)
    source.stop(t + 0.55)

    // A little body under the hiss.
    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(120, t)
    osc.frequency.exponentialRampToValueAtTime(420, t + 0.3)
    const oscGain = ctx.createGain()
    oscGain.gain.setValueAtTime(0.0001, t)
    oscGain.gain.exponentialRampToValueAtTime(0.18, t + 0.03)
    oscGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.42)
    osc.connect(oscGain).connect(out)
    osc.start(t)
    osc.stop(t + 0.45)

    this.startIncoming()
  }

  /** The descending whistle that runs for the whole flight. */
  private startIncoming(): void {
    const ctx = this.engine.ctx
    const out = this.engine.out
    if (!ctx || !out) return
    this.stopIncoming()

    const t = ctx.currentTime
    const end = t + MISSILE.flightTime

    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(1750, t + 0.25)
    osc.frequency.exponentialRampToValueAtTime(430, end)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.075, t + 0.5)
    gain.gain.exponentialRampToValueAtTime(0.16, end)

    osc.connect(gain).connect(out)
    osc.start(t)
    osc.stop(end + 0.05)
    this.incomingNodes = { osc, gain }
  }

  private stopIncoming(): void {
    const ctx = this.engine.ctx
    if (!ctx || !this.incomingNodes) return
    const { osc, gain } = this.incomingNodes
    const t = ctx.currentTime
    try {
      gain.gain.cancelScheduledValues(t)
      gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), t)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05)
      osc.stop(t + 0.06)
    } catch {
      // Already stopped; nothing to do.
    }
    this.incomingNodes = null
  }

  impact(): void {
    this.stopIncoming()
    const ctx = this.engine.ctx
    const out = this.engine.out
    if (!ctx || !out) return
    const t = ctx.currentTime

    // Sub-bass thump.
    const sub = ctx.createOscillator()
    sub.type = 'sine'
    sub.frequency.setValueAtTime(110, t)
    sub.frequency.exponentialRampToValueAtTime(26, t + 0.6)
    const subGain = ctx.createGain()
    subGain.gain.setValueAtTime(0.9, t)
    subGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.1)
    sub.connect(subGain).connect(out)
    sub.start(t)
    sub.stop(t + 1.15)

    // Debris tail.
    const source = this.engine.createNoiseSource()
    if (source) {
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(5200, t)
      filter.frequency.exponentialRampToValueAtTime(180, t + 1.5)
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.75, t)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.7)
      source.connect(filter).connect(gain).connect(out)
      source.start(t)
      source.stop(t + 1.75)
    }
  }

  /** Grief. Deliberately human-shaped against all the mechanical noise. */
  wail(): void {
    const ctx = this.engine.ctx
    const out = this.engine.out
    if (!ctx || !out) return
    const t = ctx.currentTime + Math.random() * 0.35

    const base = 300 + Math.random() * 130
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.12, t + 0.35)
    gain.gain.setValueAtTime(0.12, t + 0.9)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.1)

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.Q.value = 4
    filter.frequency.setValueAtTime(base * 2.4, t)
    filter.frequency.linearRampToValueAtTime(base * 1.5, t + 2)
    filter.connect(gain).connect(out)

    // Vibrato shared by both voices.
    const lfo = ctx.createOscillator()
    lfo.frequency.value = 5.2
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 7
    lfo.connect(lfoGain)
    lfo.start(t)
    lfo.stop(t + 2.2)

    for (const detune of [0, 7]) {
      const osc = ctx.createOscillator()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(base, t)
      osc.frequency.linearRampToValueAtTime(base * 0.82, t + 2)
      osc.detune.value = detune
      lfoGain.connect(osc.frequency)
      osc.connect(filter)
      osc.start(t)
      osc.stop(t + 2.2)
    }
  }

  /** The moment a mourner stands up as a combatant. */
  radicalise(): void {
    const ctx = this.engine.ctx
    const out = this.engine.out
    if (!ctx || !out) return
    const t = ctx.currentTime

    const osc = ctx.createOscillator()
    osc.type = 'square'
    osc.frequency.setValueAtTime(190, t)
    osc.frequency.exponentialRampToValueAtTime(62, t + 0.34)

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 900

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.22, t + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45)

    osc.connect(filter).connect(gain).connect(out)
    osc.start(t)
    osc.stop(t + 0.5)
  }

  /** A building coming down. */
  collapse(): void {
    const ctx = this.engine.ctx
    const out = this.engine.out
    if (!ctx || !out) return
    const source = this.engine.createNoiseSource()
    if (!source) return
    const t = ctx.currentTime + Math.random() * 0.25

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(900, t)
    filter.frequency.exponentialRampToValueAtTime(140, t + 0.9)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.2, t + 0.08)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.1)

    source.connect(filter).connect(gain).connect(out)
    source.start(t)
    source.stop(t + 1.15)
  }
}
