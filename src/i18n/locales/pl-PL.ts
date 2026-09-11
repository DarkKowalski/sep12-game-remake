import type { Strings } from '../types'

/**
 * Polski — Polish.
 *
 * "Zasady są śmiertelnie proste" keeps the original's pun on *deadly*.
 *
 * Polish marks gender on past-tense verbs, so the rules are phrased in the
 * present ("w którą celujesz" rather than "celowałeś") to avoid assuming
 * anything about who is playing.
 */
const plPL: Strings = {
  meta: {
    code: 'pl-PL',
    name: 'Polski',
    dir: 'ltr',
    aliases: ['pl', 'pl-pl'],
  },

  document: {
    title: '12 września — Świat zabawek',
    description:
      'Symulacja o wojnie z terroryzmem. Możesz strzelać. Albo nie. Remake newsgame’u Gonzala Frasci z 2003 roku.',
  },

  intro: {
    titleMain: '12 września',
    titleOrdinal: '',
    titleSub: 'Świat zabawek',
    begin: 'Zacznij',
    credit:
      'Remake newsgame’u <strong>Gonzala Frasci</strong> z 2003 roku, pierwotnie opublikowanego przez <strong>Newsgaming.com</strong>. Ta wersja to nieoficjalny hołd.',
    manifesto: `To nie jest gra.<br />
      Nie możesz wygrać ani przegrać.<br /><br />
      To jest symulacja.<br />
      Nie ma końca.<br />
      Już się zaczęła.<br /><br />
      Zasady są śmiertelnie proste.<br />
      <em>Możesz strzelać. Albo nie.</em>`,
    legendIntro: 'Po miasteczku chodzą dwa rodzaje postaci.',
    legendCivilian: 'Cywil',
    legendTerrorist: 'Terrorysta',
    controlsTouch: 'Dotknij i przeciągnij, aby wycelować. Puść palec, aby strzelić.',
    controlsPointer: 'Poruszaj myszą, aby wycelować. Kliknij, aby strzelić.',
    accept: 'Rozumiem',
    quoteCredit:
      'Tekst zacytowany z oryginalnej gry <strong>Gonzala Frasci</strong>, 2003.',
  },

  hud: {
    menu: 'Menu',
    mute: 'Wycisz',
    unmute: 'Włącz dźwięk',
    paused: 'Wstrzymano',
    resume: 'Wznów',
    restart: 'Odbuduj miasteczko',
    about: 'O tej grze',
    back: 'Wstecz',
    language: 'Język',
    hintTouch: 'Przeciągnij, aby wycelować · puść, aby strzelić',
    hintPointer: 'Poruszaj, aby wycelować · kliknij, aby strzelić',
    tally: {
      missilesFired: 'Wystrzelone pociski',
      killed: 'Zabici ludzie',
      radicalised: 'Zradykalizowani żałobnicy',
      civilians: 'Cywile teraz',
      terrorists: 'Terroryści teraz',
    },
  },

  about: {
    title: 'O tej grze',
    intro:
      '<em>September 12th: A Toy World</em> stworzył <strong>Gonzalo Frasca</strong>, a wydało <strong>Newsgaming.com</strong> w 2003 roku — jedna z pierwszych gier newsowych: symulacja zbudowana po to, by postawić tezę, a nie po to, by ją wygrać.',
    rulesHeading: 'Teza tkwi w zasadach',
    rules: [
      'Pocisk leci <strong>dwie sekundy</strong>. Zanim spadnie, osoba, w którą celujesz, zdąży odejść.',
      'Wybuch jest <strong>szerszy niż odstęp między ludźmi</strong>. Nie wybierasz, kto zginie.',
      'Każdy cywil, który uklęknie nad ciałem, <strong>wstaje jako terrorysta</strong>.',
    ],
    conclusion:
      'Strzelanie do terrorystów niezawodnie tworzy więc kolejnych. Nie ma punktów ani zakończenia, bo jedynym stabilnym stanem jest nie robić nic.',
    credit: 'Nieoficjalny hołd.',
  },
}

export default plPL
