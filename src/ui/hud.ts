import { onLocaleChange, t } from '../i18n'
import type { WorldStats } from '../sim/types'
import { bindLanguageSelect, languageSelectMarkup } from './languageSelect'

const ICON_MENU = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`
const ICON_SOUND_ON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>`
const ICON_SOUND_OFF = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="m16 9 5 6M21 9l-5 6"/></svg>`

export interface HudCallbacks {
  onRestart: () => void
  /** Called whenever the menu opens or closes, so the loop can pause. */
  onPauseChange: (paused: boolean) => void
  onToggleSound: () => boolean
  isMuted: () => boolean
  getStats: () => WorldStats
}

/**
 * Deliberately almost nothing.
 *
 * The original has no score, no timer and no objective, and adding any would
 * turn a simulation into a game with a win condition. The tally of what you've
 * done is here, but you have to open the menu to look at it.
 */
export class Hud {
  private readonly corner: HTMLElement
  private readonly soundButton: HTMLButtonElement
  private readonly menuButton: HTMLButtonElement
  private readonly flashLayer: HTMLElement
  private panel: HTMLElement | null = null
  private hint: HTMLElement | null = null
  private showAbout = false

  constructor(
    private readonly root: HTMLElement,
    private readonly callbacks: HudCallbacks,
  ) {
    this.corner = document.createElement('div')
    this.corner.className = 'hud-corner'

    this.soundButton = document.createElement('button')
    this.soundButton.className = 'icon-button'
    this.soundButton.type = 'button'
    this.soundButton.addEventListener('click', () => {
      this.callbacks.onToggleSound()
      this.syncSoundIcon()
    })

    this.menuButton = document.createElement('button')
    this.menuButton.className = 'icon-button'
    this.menuButton.type = 'button'
    this.menuButton.setAttribute('aria-label', t().hud.menu)
    this.menuButton.innerHTML = ICON_MENU
    this.menuButton.addEventListener('click', () => this.openPanel())

    this.corner.append(this.soundButton, this.menuButton)
    this.root.appendChild(this.corner)
    this.syncSoundIcon()

    this.flashLayer = document.createElement('div')
    this.flashLayer.className = 'flash'
    this.root.appendChild(this.flashLayer)

    this.corner.hidden = true

    // The corner buttons are built once, so their labels have to be refreshed
    // whenever the language changes — including from the title screen's picker.
    onLocaleChange(() => this.syncLocale())
  }

  private syncLocale(): void {
    this.syncSoundIcon()
    this.menuButton.setAttribute('aria-label', t().hud.menu)
    if (this.panel) this.renderPanel()
  }

  setChromeVisible(visible: boolean): void {
    this.corner.hidden = !visible
  }

  /** Sync the blast flash with the explosion in the scene. */
  flash(): void {
    this.flashLayer.classList.remove('fire')
    // Force a reflow so the animation restarts on rapid consecutive blasts.
    void this.flashLayer.offsetWidth
    this.flashLayer.classList.add('fire')
  }

  showHint(text: string, durationMs = 5200): void {
    this.hint?.remove()
    const hint = document.createElement('div')
    hint.className = 'hint'
    hint.textContent = text
    this.root.appendChild(hint)
    this.hint = hint

    window.setTimeout(() => {
      if (this.hint !== hint) return
      hint.classList.add('leaving')
      window.setTimeout(() => hint.remove(), 700)
      this.hint = null
    }, durationMs)
  }

  private syncSoundIcon(): void {
    const muted = this.callbacks.isMuted()
    this.soundButton.innerHTML = muted ? ICON_SOUND_OFF : ICON_SOUND_ON
    this.soundButton.setAttribute('aria-label', muted ? t().hud.unmute : t().hud.mute)
  }

  private openPanel(): void {
    if (this.panel) return
    this.showAbout = false
    this.callbacks.onPauseChange(true)
    this.renderPanel()
  }

  private closePanel(): void {
    this.panel?.remove()
    this.panel = null
    this.callbacks.onPauseChange(false)
  }

  private renderPanel(): void {
    this.panel?.remove()

    const panel = document.createElement('div')
    panel.className = 'panel'
    panel.innerHTML = this.showAbout ? this.aboutMarkup() : this.menuMarkup()

    panel.addEventListener('click', (event) => {
      // Clicking the backdrop resumes.
      if (event.target === panel) this.closePanel()
    })

    panel.querySelector('[data-action="resume"]')?.addEventListener('click', () => {
      this.closePanel()
    })
    panel.querySelector('[data-action="restart"]')?.addEventListener('click', () => {
      this.callbacks.onRestart()
      this.closePanel()
    })
    panel.querySelector('[data-action="about"]')?.addEventListener('click', () => {
      this.showAbout = true
      this.renderPanel()
    })
    panel.querySelector('[data-action="back"]')?.addEventListener('click', () => {
      this.showAbout = false
      this.renderPanel()
    })
    bindLanguageSelect(panel)

    this.root.appendChild(panel)
    this.panel = panel
  }

  private menuMarkup(): string {
    const stats = this.callbacks.getStats()
    const ui = t().hud
    const label = ui.tally
    // Numbers are formatted for the active locale: digits, grouping and
    // numerals all differ between languages.
    const n = (value: number) => value.toLocaleString(t().meta.code)

    return `
      <div class="panel__card" role="dialog" aria-label="${ui.menu}">
        <h2 class="panel__title">${ui.paused}</h2>
        <div class="panel__actions">
          <button class="button" data-action="resume">${ui.resume}</button>
          <button class="button" data-action="restart">${ui.restart}</button>
          <button class="button button--ghost" data-action="about">${ui.about}</button>
        </div>
        <dl class="tally">
          <dt>${label.missilesFired}</dt><dd>${n(stats.missilesFired)}</dd>
          <dt>${label.killed}</dt><dd>${n(stats.killed)}</dd>
          <dt>${label.radicalised}</dt><dd>${n(stats.radicalised)}</dd>
          <dt>${label.civilians}</dt><dd>${n(stats.civilians)}</dd>
          <dt>${label.terrorists}</dt><dd>${n(stats.terrorists)}</dd>
        </dl>
        ${languageSelectMarkup('sep12-language-menu', 'panel')}
      </div>`
  }

  private aboutMarkup(): string {
    const s = t().about
    const rules = s.rules.map((rule) => `<li>${rule}</li>`).join('')

    return `
      <div class="panel__card" role="dialog" aria-label="${s.title}">
        <h2 class="panel__title">${s.title}</h2>
        <div class="panel__body">
          <p>${s.intro}</p>
          <h3 class="panel__heading">${s.rulesHeading}</h3>
          <ul class="panel__rules">${rules}</ul>
          <p>${s.conclusion}</p>
        </div>
        <p class="panel__credit">${s.credit}</p>
        <div class="panel__actions">
          <button class="button" data-action="back">${t().hud.back}</button>
        </div>
      </div>`
  }
}
