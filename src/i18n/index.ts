import arEG from './locales/ar-EG'
import deDE from './locales/de-DE'
import en from './locales/en'
import esES from './locales/es-ES'
import faIR from './locales/fa-IR'
import frFR from './locales/fr-FR'
import heIL from './locales/he-IL'
import idID from './locales/id-ID'
import itIT from './locales/it-IT'
import jaJP from './locales/ja-JP'
import koKR from './locales/ko-KR'
import nlNL from './locales/nl-NL'
import plPL from './locales/pl-PL'
import ptBR from './locales/pt-BR'
import ruRU from './locales/ru-RU'
import trTR from './locales/tr-TR'
import urPK from './locales/ur-PK'
import zhCN from './locales/zh-CN'
import zhHK from './locales/zh-HK'
import type { Strings } from './types'

export type { Strings, LocaleMeta } from './types'

/**
 * Localisation.
 *
 * Every player-visible string comes from here, so adding a language is: copy
 * `locales/en.ts`, translate it, and add one line to `LOCALES` below. No
 * component changes, no key hunting.
 *
 * `t()` returns the whole string tree rather than taking a dotted key, so
 * `t().hud.resume` is checked by the compiler — a typo or a renamed key is a
 * build error rather than a blank label found by a player.
 */

export const FALLBACK_LOCALE = 'en'

/** Register new locales here. Order sets the language picker's order. */
const LOCALES: Record<string, Strings> = {
  en,
  'zh-CN': zhCN,
  'zh-HK': zhHK,
  'ja-JP': jaJP,
  'ko-KR': koKR,
  'fr-FR': frFR,
  'de-DE': deDE,
  'nl-NL': nlNL,
  'es-ES': esES,
  'it-IT': itIT,
  'pt-BR': ptBR,
  'pl-PL': plPL,
  'ru-RU': ruRU,
  'tr-TR': trTR,
  'id-ID': idID,
  'ar-EG': arEG,
  'he-IL': heIL,
  'fa-IR': faIR,
  'ur-PK': urPK,
}

let active: Strings = en

const listeners = new Set<() => void>()

/**
 * Re-render when the language changes.
 *
 * Any screen that is already on display has to redraw itself, and the screen
 * holding the picker is not necessarily the only one affected — changing
 * language on the title screen also restyles the HUD's button labels behind
 * it. Subscribing here keeps those screens from having to know about each
 * other. Returns an unsubscribe function.
 */
export function onLocaleChange(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function t(): Strings {
  return active
}

export function availableLocales(): LocaleSummary[] {
  return Object.values(LOCALES).map((strings) => ({ ...strings.meta }))
}

export interface LocaleSummary {
  code: string
  name: string
  dir: 'ltr' | 'rtl'
}

/**
 * Best available match for the browser's preferred languages.
 *
 * Each requested tag is tried in turn against, in order: an exact locale code,
 * the declared aliases (longest match wins, so `zh-Hant` beats `zh`), and
 * finally the bare language subtag. The alias step is what makes script
 * variants land correctly instead of on whichever locale was registered first.
 */
export function resolveLocale(preferred: readonly string[]): string {
  const codes = Object.keys(LOCALES)

  for (const requested of preferred) {
    const tag = requested.toLowerCase()

    const exact = codes.find((code) => code.toLowerCase() === tag)
    if (exact) return exact

    let bestCode: string | null = null
    let bestLength = -1
    for (const code of codes) {
      for (const alias of LOCALES[code]!.meta.aliases ?? []) {
        const candidate = alias.toLowerCase()
        // Exact, or a prefix on a subtag boundary: "zh-hant" serves "zh-hant-hk".
        if (tag !== candidate && !tag.startsWith(`${candidate}-`)) continue
        if (candidate.length > bestLength) {
          bestLength = candidate.length
          bestCode = code
        }
      }
    }
    if (bestCode) return bestCode

    const base = tag.split('-')[0]
    const partial = codes.find((code) => code.toLowerCase().split('-')[0] === base)
    if (partial) return partial
  }

  return FALLBACK_LOCALE
}

/** Switch language and update the document's language, direction and title. */
export function setLocale(code: string): void {
  const next = LOCALES[code] ?? LOCALES[FALLBACK_LOCALE]!
  if (next === active) return
  active = next
  applyToDocument()
  for (const listener of listeners) listener()
}

/** Detect the player's language once at startup. */
export function initI18n(): void {
  const preferred =
    typeof navigator === 'undefined'
      ? []
      : navigator.languages?.length
        ? navigator.languages
        : [navigator.language]

  // Assign directly rather than via setLocale: that call is a no-op when the
  // detected language is already the default, and the document still needs its
  // lang, dir and title applied.
  const code = readStoredLocale() ?? resolveLocale(preferred)
  active = LOCALES[code] ?? LOCALES[FALLBACK_LOCALE]!
  applyToDocument()
}

/** A language the player has chosen explicitly wins over browser detection. */
export function rememberLocale(code: string): void {
  try {
    localStorage.setItem('sep12:locale', code)
  } catch {
    // Private browsing or storage disabled: detection still works per session.
  }
  setLocale(code)
}

function readStoredLocale(): string | null {
  try {
    const code = localStorage.getItem('sep12:locale')
    return code && LOCALES[code] ? code : null
  } catch {
    return null
  }
}

function applyToDocument(): void {
  if (typeof document === 'undefined') return
  document.documentElement.lang = active.meta.code
  document.documentElement.dir = active.meta.dir
  document.title = active.document.title

  const description = document.querySelector('meta[name="description"]')
  description?.setAttribute('content', active.document.description)
}
