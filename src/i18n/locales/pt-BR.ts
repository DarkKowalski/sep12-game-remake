import type { Strings } from '../types'

/**
 * Português (Brasil) — Brazilian Portuguese.
 *
 * Brazilian usage throughout: "mouse" rather than "rato", "você" rather than
 * "tu". "As regras são mortalmente simples" keeps the original's pun, where
 * *mortalmente* reads as both "extremely" and "lethally".
 */
const ptBR: Strings = {
  meta: {
    code: 'pt-BR',
    name: 'Português',
    dir: 'ltr',
    aliases: ['pt-br', 'pt'],
  },

  document: {
    title: '12 de setembro — Um mundo de brinquedo',
    description:
      'Uma simulação sobre a guerra ao terror. Você pode atirar. Ou não. Um remake do newsgame de 2003 de Gonzalo Frasca.',
  },

  intro: {
    titleMain: '12 de setembro',
    titleOrdinal: '',
    titleSub: 'Um mundo de brinquedo',
    begin: 'Começar',
    credit:
      'Um remake do newsgame de 2003 de <strong>Gonzalo Frasca</strong>, publicado originalmente pela <strong>Newsgaming.com</strong>. Esta versão é uma homenagem não oficial.',
    manifesto: `Isto não é um jogo.<br />
      Você não pode vencer nem perder.<br /><br />
      Isto é uma simulação.<br />
      Não tem fim.<br />
      Já começou.<br /><br />
      As regras são mortalmente simples.<br />
      <em>Você pode atirar. Ou não.</em>`,
    legendIntro: 'Dois tipos de figura caminham pela cidade.',
    legendCivilian: 'Civil',
    legendTerrorist: 'Terrorista',
    controlsTouch: 'Toque e arraste para mirar. Solte o dedo para atirar.',
    controlsPointer: 'Mova o mouse para mirar. Clique para atirar.',
    accept: 'Entendi',
    quoteCredit: 'Texto citado do jogo original de <strong>Gonzalo Frasca</strong>, 2003.',
  },

  hud: {
    menu: 'Menu',
    mute: 'Silenciar',
    unmute: 'Ativar som',
    paused: 'Pausado',
    resume: 'Continuar',
    restart: 'Recomeçar a cidade',
    about: 'Sobre este jogo',
    back: 'Voltar',
    language: 'Idioma',
    hintTouch: 'Arraste para mirar · solte para atirar',
    hintPointer: 'Mova para mirar · clique para atirar',
    tally: {
      missilesFired: 'Mísseis lançados',
      killed: 'Pessoas mortas',
      radicalised: 'Enlutados radicalizados',
      civilians: 'Civis agora',
      terrorists: 'Terroristas agora',
    },
  },

  about: {
    title: 'Sobre este jogo',
    intro:
      '<em>September 12th: A Toy World</em> foi criado por <strong>Gonzalo Frasca</strong> e publicado pela <strong>Newsgaming.com</strong> em 2003 — um dos primeiros newsgames: uma simulação feita para defender um argumento, não para ser vencida.',
    rulesHeading: 'O argumento está nas regras',
    rules: [
      'Um míssil leva <strong>dois segundos</strong> para cair. Quem você mirou já saiu de lá.',
      'A explosão é <strong>mais larga que o espaço entre as pessoas</strong>. Você não escolhe quem morre.',
      'Todo civil que se ajoelha para chorar um corpo <strong>se levanta como terrorista</strong>.',
    ],
    conclusion:
      'Então atirar em terroristas produz mais terroristas, sem falta. Não há pontuação nem final, porque não fazer nada é o único estado estável.',
    credit: 'Uma homenagem não oficial.',
  },
}

export default ptBR
