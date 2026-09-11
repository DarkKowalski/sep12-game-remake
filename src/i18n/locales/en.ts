import type { Strings } from '../types'

/**
 * English — the source locale and the fallback.
 *
 * To add a language, copy this file, translate the values, and register it in
 * `src/i18n/index.ts`. Nothing else needs to change.
 *
 * The manifesto and the About copy are quoted from or paraphrase Gonzalo
 * Frasca's 2003 original; translate them for sense rather than literally, and
 * keep the attribution intact.
 */
const en: Strings = {
  meta: {
    code: 'en',
    name: 'English',
    dir: 'ltr',
    aliases: ['en'],
  },

  document: {
    title: 'September 12th — A Toy World',
    description:
      'A simulation about the war on terror. You can shoot. Or not. A modern remake of the 2003 newsgame by Gonzalo Frasca.',
  },

  intro: {
    titleMain: 'September 12',
    titleOrdinal: 'th',
    titleSub: 'A toy world',
    begin: 'Begin',
    credit:
      'A remake of the 2003 newsgame by <strong>Gonzalo Frasca</strong>, originally published by <strong>Newsgaming.com</strong>. This version is an unofficial homage.',
    manifesto: `This is not a game.<br />
      You can't win and you can't lose.<br /><br />
      This is a simulation.<br />
      It has no ending.<br />
      It has already begun.<br /><br />
      The rules are deadly simple.<br />
      <em>You can shoot. Or not.</em>`,
    legendIntro: 'Two kinds of figure walk the town.',
    legendCivilian: 'Civilian',
    legendTerrorist: 'Terrorist',
    controlsTouch: 'Touch and drag to aim. Lift your finger to fire.',
    controlsPointer: 'Move the mouse to aim. Click to fire.',
    accept: 'I understand',
    quoteCredit:
      'Text quoted from the original game by <strong>Gonzalo Frasca</strong>, 2003.',
  },

  hud: {
    menu: 'Menu',
    mute: 'Mute',
    unmute: 'Unmute',
    paused: 'Paused',
    resume: 'Resume',
    restart: 'Restart the town',
    about: 'About this game',
    back: 'Back',
    language: 'Language',
    hintTouch: 'Drag to aim · release to fire',
    hintPointer: 'Move to aim · click to fire',
    tally: {
      missilesFired: 'Missiles fired',
      killed: 'People killed',
      radicalised: 'Mourners radicalised',
      civilians: 'Civilians now',
      terrorists: 'Terrorists now',
    },
  },

  about: {
    title: 'About this game',
    intro:
      '<em>September 12th: A Toy World</em> was made by <strong>Gonzalo Frasca</strong> and published by <strong>Newsgaming.com</strong> in 2003 — one of the first newsgames: a simulation built to make an argument rather than to be won.',
    rulesHeading: 'The argument is in the rules',
    rules: [
      'A missile takes <strong>two seconds</strong> to land. Whoever you aimed at has walked on by then.',
      'The blast is <strong>wider than the gap between people</strong>. You do not choose who dies.',
      'Every civilian who kneels to grieve over a body <strong>stands back up as a terrorist</strong>.',
    ],
    conclusion:
      'So shooting at terrorists reliably produces more of them. There is no score and no ending, because doing nothing is the only stable state.',
    credit: 'An unofficial homage.',
  },
}

export default en
