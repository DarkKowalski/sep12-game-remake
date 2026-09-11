import { onLocaleChange, t } from '../i18n'
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

export interface IntroOptions {
  /** True when the device is touch-first, so the hint matches the controls. */
  touch: boolean
  onBegin: () => void
}

export class Intro {
  private readonly root: HTMLElement
  private element: HTMLElement | null = null
  private step: 0 | 1 = 0
  private unsubscribe: (() => void) | null = null

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
  }

  private dismiss(): void {
    const element = this.element
    if (!element) return
    this.element = null
    this.unsubscribe?.()
    this.unsubscribe = null
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
      </div>`
  }

  private manifestoMarkup(): string {
    const s = t().intro
    const control = this.options.touch ? s.controlsTouch : s.controlsPointer

    return `
      <div class="overlay__inner">
        <p class="manifesto">${s.manifesto}</p>
        <p class="note">${control}</p>
        <button class="button button--primary" data-action="advance">${s.accept}</button>
        <p class="note">${s.quoteCredit}</p>
      </div>`
  }
}
