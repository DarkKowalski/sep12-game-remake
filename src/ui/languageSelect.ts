import { availableLocales, rememberLocale, t } from '../i18n'

/**
 * The language picker, shared by the title screen and the pause menu.
 *
 * A native `<select>` on purpose: it gets the platform's own scrolling picker
 * on a phone, keyboard support and screen-reader labelling for free. Every
 * option is written in its own language, so you can find yours without being
 * able to read the one currently selected.
 */

export type LanguageSelectVariant = 'panel' | 'inline'

export function languageSelectMarkup(id: string, variant: LanguageSelectVariant): string {
  const current = t().meta.code
  const options = availableLocales()
    .map(
      (locale) =>
        `<option value="${locale.code}" lang="${locale.code}"` +
        `${locale.code === current ? ' selected' : ''}>${locale.name}</option>`,
    )
    .join('')

  // The wrapper exists so the chevron can be drawn over the select: native
  // dropdown arrows can't be restyled, so the built-in one is switched off
  // and replaced with one that matches the page.
  return `
    <div class="language language--${variant}">
      <label class="language__label" for="${id}">${t().hud.language}</label>
      <span class="language__control">
        <select class="language__select" id="${id}" data-action="language">${options}</select>
      </span>
    </div>`
}

/**
 * Wire the picker up. Screens redraw themselves through `onLocaleChange`
 * rather than being called back from here, so changing language on the title
 * screen also relabels the HUD sitting behind it.
 */
export function bindLanguageSelect(root: ParentNode): void {
  const select = root.querySelector<HTMLSelectElement>('[data-action="language"]')
  select?.addEventListener('change', (event) => {
    rememberLocale((event.target as HTMLSelectElement).value)
  })
}
