import { onLocaleChange, t } from '../i18n'
import { FigureShowcase } from '../render/figureShowcase'
import { bindLanguageSelect, languageSelectMarkup } from './languageSelect'

/**
 * Title and manifesto screens.
 *
 * The manifesto is quoted from the 2003 original, credited on the same screen.
 * It isn't decoration: it's the game telling you the rules before you play,
 * and it is the reason the shoot button feels the way it does.
 */

const RETICLE_SVG = `
<svg class="reticle" viewBox="0 0 100 100" aria-hidden="true">
  <circle cx="50" cy="50" r="30" fill="none" stroke="#2b2520" stroke-width="3" />
  <circle cx="50" cy="50" r="4" fill="#a8321f" />
  <g stroke="#2b2520" stroke-width="3" stroke-linecap="round">
    <path d="M50 6v20M50 74v20M6 50h20M74 50h20" />
  </g>
</svg>`

/** Octicon mark. "GitHub" is a proper noun, so neither it nor the icon needs
 *  translating — which keeps this link out of all nineteen locale files. */
const GITHUB_LINK = `
<a class="source-link" href="https://github.com/DarkKowalski/sep12-game-remake"
   target="_blank" rel="noopener noreferrer">
  <svg class="source-link__mark" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
      0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01
      1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95
      0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27
      2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82
      2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0
      .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
  </svg>
  <span>GitHub</span>
</a>`

export interface IntroOptions {
  /** True when the device is touch-first, so the hint matches the controls. */
  touch: boolean
  /** Holds the figures in a single pose instead of turning them. */
  reducedMotion: boolean
  onBegin: () => void
}

export class Intro {
  private readonly root: HTMLElement
  private element: HTMLElement | null = null
  private step: 0 | 1 = 0
  private unsubscribe: (() => void) | null = null
  private showcase: FigureShowcase | null = null

  constructor(
    root: HTMLElement,
    private readonly options: IntroOptions,
  ) {
    this.root = root
  }

  show(): void {
    this.step = 0
    // Redraw the screen you are reading when the language changes under it.
    this.unsubscribe = onLocaleChange(() => this.render())

    // The backdrop is created once and is opaque from its very first paint.
    // Fading it in, or tearing it down and rebuilding it between screens,
    // both let a frame of the town show through before the player has been
    // told the rules — which is exactly the wrong first impression.
    const overlay = document.createElement('div')
    overlay.className = 'overlay'
    this.root.appendChild(overlay)
    this.element = overlay

    this.render()
  }

  private render(): void {
    const overlay = this.element
    if (!overlay) return

    // Swap the contents in place; only the inner block animates.
    overlay.innerHTML = this.step === 0 ? this.titleMarkup() : this.manifestoMarkup()

    const advance = overlay.querySelector<HTMLButtonElement>('[data-action="advance"]')
    advance?.addEventListener('click', () => {
      if (this.step === 0) {
        this.step = 1
        this.render()
      } else {
        this.dismiss()
      }
    })

    bindLanguageSelect(overlay)
    this.mountShowcase(overlay)
  }

  /**
   * Move the live canvas into the freshly rendered markup.
   *
   * render() replaces innerHTML, which detaches the canvas — so it is
   * re-parented rather than rebuilt. Recreating it would throw away and
   * reacquire a WebGL context on every language change.
   */
  private mountShowcase(overlay: HTMLElement): void {
    const stage = overlay.querySelector('[data-figure-stage]')
    if (!stage) {
      this.showcase?.stop()
      return
    }
    stage.appendChild(this.showcase!.canvas)
    this.showcase!.start()
  }

  private dismiss(): void {
    const element = this.element
    if (!element) return
    this.element = null
    this.unsubscribe?.()
    this.unsubscribe = null
    // Hand the WebGL context back; the game is about to want the GPU.
    this.showcase?.dispose()
    this.showcase = null
    element.classList.add('leaving')
    element.addEventListener('animationend', () => element.remove(), { once: true })
    // Belt and braces in case the animation is suppressed.
    window.setTimeout(() => element.remove(), 600)
    this.options.onBegin()
  }

  private titleMarkup(): string {
    const s = t().intro
    return `
      <div class="overlay__inner">
        ${RETICLE_SVG}
        <h1 class="title">
          ${s.titleMain}<span class="title__ordinal">${s.titleOrdinal}</span>
          <span class="title__sub">${s.titleSub}</span>
        </h1>
        <div class="intro-actions">
          <button class="button button--primary" data-action="advance">${s.begin}</button>
          ${languageSelectMarkup('sep12-language-intro', 'inline')}
        </div>
        <p class="note">${s.credit}</p>
        ${GITHUB_LINK}
      </div>`
  }

  /**
   * The two figures, so you can read the town the moment it appears.
   *
   * Both are rendered live from the game's own geometry rather than drawn, so
   * the legend cannot drift from what you are about to see. If WebGL is
   * unavailable the legend is dropped rather than left as an empty gap.
   */
  private legendMarkup(): string {
    const s = t().intro
    this.showcase ??= new FigureShowcase(this.options.reducedMotion)
    if (!this.showcase.available) return ''

    // The canvas draws each figure centred in its half, so these two equal
    // caption columns sit under them at any width.
    return `
      <div class="legend">
        <p class="legend__intro">${s.legendIntro}</p>
        <div class="legend__stage" data-figure-stage></div>
        <div class="legend__labels">
          <span class="legend__label">${s.legendCivilian}</span>
          <span class="legend__label legend__label--armed">${s.legendTerrorist}</span>
        </div>
      </div>`
  }

  private manifestoMarkup(): string {
    const s = t().intro
    const control = this.options.touch ? s.controlsTouch : s.controlsPointer

    return `
      <div class="overlay__inner">
        <p class="manifesto">${s.manifesto}</p>
        ${this.legendMarkup()}
        <p class="note">${control}</p>
        <button class="button button--primary" data-action="advance">${s.accept}</button>
        <p class="note">${s.quoteCredit}</p>
      </div>`
  }
}
