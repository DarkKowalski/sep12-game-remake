import type { Strings } from '../types'

/**
 * Italiano — Italian.
 *
 * "Le regole sono di una semplicità mortale" keeps the original's pun, where
 * *mortale* reads as both "extreme" and "lethal".
 */
const itIT: Strings = {
  meta: {
    code: 'it-IT',
    name: 'Italiano',
    dir: 'ltr',
    aliases: ['it', 'it-it', 'it-ch'],
  },

  document: {
    title: '12 settembre — Un mondo giocattolo',
    description:
      'Una simulazione sulla guerra al terrorismo. Puoi sparare. Oppure no. Un remake del newsgame del 2003 di Gonzalo Frasca.',
  },

  intro: {
    titleMain: '12 settembre',
    titleOrdinal: '',
    titleSub: 'Un mondo giocattolo',
    begin: 'Inizia',
    credit:
      'Un remake del newsgame del 2003 di <strong>Gonzalo Frasca</strong>, pubblicato originariamente da <strong>Newsgaming.com</strong>. Questa versione è un omaggio non ufficiale.',
    manifesto: `Questo non è un gioco.<br />
      Non puoi vincere e non puoi perdere.<br /><br />
      Questa è una simulazione.<br />
      Non ha una fine.<br />
      È già cominciata.<br /><br />
      Le regole sono di una semplicità mortale.<br />
      <em>Puoi sparare. Oppure no.</em>`,
    legendIntro: 'Per la città camminano due tipi di figure.',
    legendCivilian: 'Civile',
    legendTerrorist: 'Terrorista',
    controlsTouch: 'Tocca e trascina per mirare. Solleva il dito per sparare.',
    controlsPointer: 'Muovi il mouse per mirare. Clicca per sparare.',
    accept: 'Ho capito',
    quoteCredit:
      'Testo citato dal gioco originale di <strong>Gonzalo Frasca</strong>, 2003.',
  },

  hud: {
    menu: 'Menu',
    mute: 'Disattiva audio',
    unmute: 'Attiva audio',
    paused: 'In pausa',
    resume: 'Riprendi',
    restart: 'Ricostruisci la città',
    about: 'Informazioni sul gioco',
    back: 'Indietro',
    language: 'Lingua',
    hintTouch: 'Trascina per mirare · rilascia per sparare',
    hintPointer: 'Muovi per mirare · clicca per sparare',
    tally: {
      missilesFired: 'Missili lanciati',
      killed: 'Persone uccise',
      radicalised: 'Persone in lutto radicalizzate',
      civilians: 'Civili ora',
      terrorists: 'Terroristi ora',
    },
  },

  about: {
    title: 'Informazioni sul gioco',
    intro:
      '<em>September 12th: A Toy World</em> è stato creato da <strong>Gonzalo Frasca</strong> e pubblicato da <strong>Newsgaming.com</strong> nel 2003 — uno dei primi newsgame: una simulazione costruita per sostenere una tesi, non per essere vinta.',
    rulesHeading: 'La tesi sta nelle regole',
    rules: [
      'Un missile impiega <strong>due secondi</strong> a cadere. Chi avevi preso di mira se n’è già andato.',
      'L’esplosione è <strong>più larga della distanza tra le persone</strong>. Non scegli tu chi muore.',
      'Ogni civile che si inginocchia a piangere un corpo <strong>si rialza terrorista</strong>.',
    ],
    conclusion:
      'Sparare ai terroristi ne produce quindi immancabilmente altri. Non c’è punteggio né finale, perché non fare nulla è l’unico stato stabile.',
    credit: 'Un omaggio non ufficiale.',
  },
}

export default itIT
