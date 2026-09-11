import type { Strings } from '../types'

/**
 * Español — Spanish, Spain.
 *
 * Peninsular usage ("ratón", not "mouse"). No regional aliases are declared
 * beyond Spain's own: the bare-language fallback already routes es-MX, es-AR
 * and the rest here, which is the right outcome until someone contributes a
 * Latin American file to sit alongside this one.
 */
const esES: Strings = {
  meta: {
    code: 'es-ES',
    name: 'Español',
    dir: 'ltr',
    aliases: ['es', 'es-es'],
  },

  document: {
    title: '12 de septiembre — Un mundo de juguete',
    description:
      'Una simulación sobre la guerra contra el terrorismo. Puedes disparar. O no. Un remake del newsgame de 2003 de Gonzalo Frasca.',
  },

  intro: {
    titleMain: '12 de septiembre',
    titleOrdinal: '',
    titleSub: 'Un mundo de juguete',
    begin: 'Empezar',
    credit:
      'Un remake del newsgame de 2003 de <strong>Gonzalo Frasca</strong>, publicado originalmente por <strong>Newsgaming.com</strong>. Esta versión es un homenaje no oficial.',
    manifesto: `Esto no es un juego.<br />
      No puedes ganar ni perder.<br /><br />
      Esto es una simulación.<br />
      No tiene final.<br />
      Ya ha empezado.<br /><br />
      Las reglas son mortalmente simples.<br />
      <em>Puedes disparar. O no.</em>`,
    controlsTouch: 'Toca y arrastra para apuntar. Levanta el dedo para disparar.',
    controlsPointer: 'Mueve el ratón para apuntar. Haz clic para disparar.',
    accept: 'Lo he entendido',
    quoteCredit: 'Texto citado del juego original de <strong>Gonzalo Frasca</strong>, 2003.',
  },

  hud: {
    menu: 'Menú',
    mute: 'Silenciar',
    unmute: 'Activar sonido',
    paused: 'En pausa',
    resume: 'Continuar',
    restart: 'Reiniciar el pueblo',
    about: 'Acerca del juego',
    back: 'Volver',
    language: 'Idioma',
    hintTouch: 'Arrastra para apuntar · suelta para disparar',
    hintPointer: 'Mueve para apuntar · haz clic para disparar',
    tally: {
      missilesFired: 'Misiles lanzados',
      killed: 'Personas muertas',
      radicalised: 'Dolientes radicalizados',
      civilians: 'Civiles ahora',
      terrorists: 'Terroristas ahora',
    },
  },

  about: {
    title: 'Acerca del juego',
    intro:
      '<em>September 12th: A Toy World</em> lo creó <strong>Gonzalo Frasca</strong> y lo publicó <strong>Newsgaming.com</strong> en 2003: uno de los primeros newsgames, una simulación hecha para defender una idea, no para ganarse.',
    rulesHeading: 'El argumento está en las reglas',
    rules: [
      'Un misil tarda <strong>dos segundos</strong> en caer. A quien apuntabas ya se ha ido.',
      'La explosión es <strong>más ancha que el espacio entre las personas</strong>. Tú no eliges quién muere.',
      'Todo civil que se arrodilla a llorar un cuerpo <strong>se levanta convertido en terrorista</strong>.',
    ],
    conclusion:
      'Así que disparar a terroristas produce más terroristas, sin falta. No hay puntuación ni final, porque no hacer nada es el único estado estable.',
    credit: 'Un homenaje no oficial.',
  },
}

export default esES
