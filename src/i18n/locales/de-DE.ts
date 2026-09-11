import type { Strings } from '../types'

/**
 * Deutsch — German.
 *
 * The player is addressed as "du" rather than "Sie": the manifesto is a set of
 * rules stated flatly, and the formal register would make it sound like terms
 * and conditions. German compounds run long — "Radikalisierte Trauernde",
 * "Stadt zurücksetzen" — so this is the locale most likely to expose a layout
 * that only ever had English in it.
 */
const deDE: Strings = {
  meta: {
    code: 'de-DE',
    name: 'Deutsch',
    dir: 'ltr',
    aliases: ['de', 'de-de', 'de-at', 'de-ch'],
  },

  document: {
    title: '12. September — Eine Spielzeugwelt',
    description:
      'Eine Simulation über den Krieg gegen den Terror. Du kannst schießen. Oder nicht. Ein Remake des Newsgames von Gonzalo Frasca aus dem Jahr 2003.',
  },

  intro: {
    titleMain: '12. September',
    titleOrdinal: '',
    titleSub: 'Eine Spielzeugwelt',
    begin: 'Beginnen',
    credit:
      'Ein Remake des Newsgames von <strong>Gonzalo Frasca</strong> aus dem Jahr 2003, ursprünglich veröffentlicht von <strong>Newsgaming.com</strong>. Diese Fassung ist eine inoffizielle Hommage.',
    manifesto: `Das ist kein Spiel.<br />
      Du kannst nicht gewinnen und nicht verlieren.<br /><br />
      Das ist eine Simulation.<br />
      Sie hat kein Ende.<br />
      Sie hat längst begonnen.<br /><br />
      Die Regeln sind tödlich einfach.<br />
      <em>Du kannst schießen. Oder nicht.</em>`,
    legendIntro: 'Zwei Arten von Figuren laufen durch die Stadt.',
    legendCivilian: 'Zivilist',
    legendTerrorist: 'Terrorist',
    controlsTouch: 'Zum Zielen berühren und ziehen. Zum Feuern loslassen.',
    controlsPointer: 'Zum Zielen die Maus bewegen. Zum Feuern klicken.',
    accept: 'Ich habe verstanden',
    quoteCredit:
      'Text zitiert aus dem Originalspiel von <strong>Gonzalo Frasca</strong>, 2003.',
  },

  hud: {
    menu: 'Menü',
    mute: 'Stummschalten',
    unmute: 'Ton einschalten',
    paused: 'Pausiert',
    resume: 'Fortsetzen',
    restart: 'Stadt zurücksetzen',
    about: 'Über dieses Spiel',
    back: 'Zurück',
    language: 'Sprache',
    hintTouch: 'Ziehen zum Zielen · loslassen zum Feuern',
    hintPointer: 'Bewegen zum Zielen · klicken zum Feuern',
    tally: {
      missilesFired: 'Abgefeuerte Raketen',
      killed: 'Getötete Menschen',
      radicalised: 'Radikalisierte Trauernde',
      civilians: 'Zivilisten jetzt',
      terrorists: 'Terroristen jetzt',
    },
  },

  about: {
    title: 'Über dieses Spiel',
    intro:
      '<em>September 12th: A Toy World</em> stammt von <strong>Gonzalo Frasca</strong> und erschien 2003 bei <strong>Newsgaming.com</strong> — eines der ersten Newsgames: eine Simulation, die ein Argument vorbringen soll, statt gewonnen zu werden.',
    rulesHeading: 'Das Argument steckt in den Regeln',
    rules: [
      'Eine Rakete braucht <strong>zwei Sekunden</strong> bis zum Einschlag. Wen du anvisiert hast, ist dann längst weitergegangen.',
      'Die Explosion ist <strong>breiter als der Abstand zwischen den Menschen</strong>. Du entscheidest nicht, wer stirbt.',
      'Jeder Zivilist, der an einer Leiche niederkniet, <strong>steht als Terrorist wieder auf</strong>.',
    ],
    conclusion:
      'Auf Terroristen zu schießen bringt also zuverlässig mehr davon hervor. Es gibt keine Punkte und kein Ende, denn nichts zu tun ist der einzige stabile Zustand.',
    credit: 'Eine inoffizielle Hommage.',
  },
}

export default deDE
