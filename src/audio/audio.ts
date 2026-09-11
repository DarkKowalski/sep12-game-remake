/**
 * Audio engine. No files: every sound is synthesized from oscillators and a
 * single shared noise buffer, which keeps the whole game a few hundred KB.
 *
 * The context is created lazily and resumed on the first user gesture, because
 * iOS Safari will not start one otherwise.
 */
export class AudioEngine {
  private context: AudioContext | null = null
  private master: GainNode | null = null
  private noise: AudioBuffer | null = null
  private muted = false

  constructor() {
    this.muted = localStorage.getItem('sep12:muted') === '1'
  }

  /** Safe to call repeatedly; only the first call does anything. */
  unlock(): void {
    if (!this.context) {
      const Ctor =
        window.AudioContext ??
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return

      setPlaybackAudioSession()
      this.context = new Ctor()
      this.master = this.context.createGain()
      this.master.gain.value = this.muted ? 0 : 0.55
      this.master.connect(this.context.destination)
      this.noise = createNoiseBuffer(this.context)
    }
    if (this.context.state === 'suspended') void this.context.resume()
  }

  get ready(): boolean {
    return this.context !== null && this.context.state === 'running'
  }

  get isMuted(): boolean {
    return this.muted
  }

  setMuted(muted: boolean): void {
    this.muted = muted
    localStorage.setItem('sep12:muted', muted ? '1' : '0')
    if (this.master && this.context) {
      this.master.gain.cancelScheduledValues(this.context.currentTime)
      this.master.gain.setTargetAtTime(muted ? 0 : 0.55, this.context.currentTime, 0.05)
    }
  }

  toggleMuted(): boolean {
    this.setMuted(!this.muted)
    return this.muted
  }

  get ctx(): AudioContext | null {
    return this.context
  }

  get out(): GainNode | null {
    return this.master
  }

  get noiseBuffer(): AudioBuffer | null {
    return this.noise
  }

  get now(): number {
    return this.context?.currentTime ?? 0
  }

  /** A noise source wired through a filter, ready to be started. */
  createNoiseSource(): AudioBufferSourceNode | null {
    if (!this.context || !this.noise) return null
    const source = this.context.createBufferSource()
    source.buffer = this.noise
    source.loop = true
    return source
  }
}

interface AudioSessionLike {
  type: 'auto' | 'playback' | 'transient' | 'transient-solo' | 'ambient' | 'play-and-record'
}

/**
 * Opt into the 'playback' audio session (iOS 16.4+, Safari).
 *
 * By default a web page's audio is treated as 'auto', which on iOS means the
 * hardware ringer switch silences it — a phone in silent mode would play the
 * game mute with no indication why. 'playback' declares this as media the user
 * asked for, so it plays through the switch like a video or a music app.
 *
 * Set before the AudioContext is created; ignored everywhere else.
 */
function setPlaybackAudioSession(): void {
  const session = (navigator as Navigator & { audioSession?: AudioSessionLike }).audioSession
  if (!session) return
  try {
    session.type = 'playback'
  } catch {
    // Older or partial implementations: fall back to the default session.
  }
}

function createNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * 2)
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  // Deterministic noise — no reason to pull on Math.random here.
  let seed = 0x1f2e3d4c
  for (let i = 0; i < length; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    data[i] = (seed / 2147483648 - 1) * 0.6
  }
  return buffer
}
