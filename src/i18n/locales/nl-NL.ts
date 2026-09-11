import type { Strings } from '../types'

/**
 * Nederlands — Dutch.
 *
 * "De regels zijn dodelijk eenvoudig" keeps the original's pun on *deadly*.
 */
const nlNL: Strings = {
  meta: {
    code: 'nl-NL',
    name: 'Nederlands',
    dir: 'ltr',
    aliases: ['nl', 'nl-nl', 'nl-be'],
  },

  document: {
    title: '12 september — Een speelgoedwereld',
    description:
      'Een simulatie over de oorlog tegen het terrorisme. Je kunt schieten. Of niet. Een remake van de newsgame uit 2003 van Gonzalo Frasca.',
  },

  intro: {
    titleMain: '12 september',
    titleOrdinal: '',
    titleSub: 'Een speelgoedwereld',
    begin: 'Beginnen',
    credit:
      'Een remake van de newsgame uit 2003 van <strong>Gonzalo Frasca</strong>, oorspronkelijk uitgebracht door <strong>Newsgaming.com</strong>. Deze versie is een onofficieel eerbetoon.',
    manifesto: `Dit is geen spel.<br />
      Je kunt niet winnen en niet verliezen.<br /><br />
      Dit is een simulatie.<br />
      Ze heeft geen einde.<br />
      Ze is al begonnen.<br /><br />
      De regels zijn dodelijk eenvoudig.<br />
      <em>Je kunt schieten. Of niet.</em>`,
    controlsTouch: 'Raak aan en sleep om te richten. Laat los om te schieten.',
    controlsPointer: 'Beweeg de muis om te richten. Klik om te schieten.',
    accept: 'Ik begrijp het',
    quoteCredit:
      'Tekst geciteerd uit het originele spel van <strong>Gonzalo Frasca</strong>, 2003.',
  },

  hud: {
    menu: 'Menu',
    mute: 'Geluid uit',
    unmute: 'Geluid aan',
    paused: 'Gepauzeerd',
    resume: 'Hervatten',
    restart: 'Stad herbouwen',
    about: 'Over dit spel',
    back: 'Terug',
    language: 'Taal',
    hintTouch: 'Sleep om te richten · laat los om te schieten',
    hintPointer: 'Beweeg om te richten · klik om te schieten',
    tally: {
      missilesFired: 'Afgevuurde raketten',
      killed: 'Gedode mensen',
      radicalised: 'Geradicaliseerde rouwenden',
      civilians: 'Burgers nu',
      terrorists: 'Terroristen nu',
    },
  },

  about: {
    title: 'Over dit spel',
    intro:
      '<em>September 12th: A Toy World</em> is gemaakt door <strong>Gonzalo Frasca</strong> en in 2003 uitgebracht door <strong>Newsgaming.com</strong> — een van de eerste newsgames: een simulatie die is gebouwd om een punt te maken, niet om gewonnen te worden.',
    rulesHeading: 'Het argument zit in de regels',
    rules: [
      'Een raket doet er <strong>twee seconden</strong> over om te landen. Wie je in het vizier had, is dan allang doorgelopen.',
      'De explosie is <strong>breder dan de ruimte tussen mensen</strong>. Jij kiest niet wie er sterft.',
      'Elke burger die bij een lichaam knielt om te rouwen, <strong>staat op als terrorist</strong>.',
    ],
    conclusion:
      'Schieten op terroristen levert dus steevast meer terroristen op. Er is geen score en geen einde, want niets doen is de enige stabiele toestand.',
    credit: 'Een onofficieel eerbetoon.',
  },
}

export default nlNL
