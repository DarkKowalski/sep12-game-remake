/**
 * The shape every locale must satisfy.
 *
 * Declaring this as an interface rather than inferring it from the English
 * file is the point: a new locale that forgets a key, or drops one that was
 * later added, fails `pnpm typecheck` instead of silently rendering
 * `undefined` in front of a player.
 *
 * A few values contain inline markup (`<strong>`, `<em>`, `<br />`) because
 * the emphasis falls mid-sentence and splitting those into fragments would
 * make them untranslatable. Locale files are trusted, repo-authored content
 * and are the only thing interpolated into `innerHTML`; never put user input
 * or remotely-fetched text through them.
 */

export interface LocaleMeta {
  /** BCP 47 tag, e.g. "en", "pt-BR". Written to `<html lang>`. */
  code: string
  /** The language's own name, as shown in the language picker. */
  name: string
  /** Writing direction. Written to `<html dir>`. */
  dir: 'ltr' | 'rtl'
  /**
   * Other tags this locale serves, most specific first. Matched exactly or as
   * a prefix, so `zh-Hant` also claims `zh-Hant-HK`.
   *
   * This is what stops a browser requesting `zh-TW` from being handed
   * Simplified Chinese just because `zh-CN` happens to be registered first:
   * the Traditional locale claims `zh-Hant` and `zh-TW`, and the longest
   * matching alias wins.
   */
  aliases?: readonly string[]
}

export interface Strings {
  meta: LocaleMeta

  document: {
    title: string
    description: string
  }

  intro: {
    /** Title without its ordinal suffix — the suffix is raised typographically. */
    titleMain: string
    titleOrdinal: string
    titleSub: string
    begin: string
    credit: string
    /** Multi-line; contains `<br />` and one `<em>`. */
    manifesto: string
    /** One line introducing the two figures shown beneath it. */
    legendIntro: string
    legendCivilian: string
    legendTerrorist: string
    controlsTouch: string
    controlsPointer: string
    accept: string
    quoteCredit: string
  }

  hud: {
    menu: string
    mute: string
    unmute: string
    paused: string
    resume: string
    restart: string
    about: string
    back: string
    language: string
    hintTouch: string
    hintPointer: string
    tally: {
      missilesFired: string
      killed: string
      radicalised: string
      civilians: string
      terrorists: string
    }
  }

  about: {
    title: string
    /** Contains `<em>` for the work title and `<strong>` for its authors. */
    intro: string
    rulesHeading: string
    /** Any number of rules; the UI maps over whatever the locale provides. */
    rules: readonly string[]
    conclusion: string
    credit: string
  }
}
