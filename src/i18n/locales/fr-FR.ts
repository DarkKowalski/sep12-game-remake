import type { Strings } from '../types'

/**
 * Français — French.
 *
 * French typography puts a narrow no-break space before the colon; the
 * U+00A0 characters in this file are deliberate, not stray whitespace.
 * "Les règles sont d'une simplicité mortelle" keeps the original's pun on
 * *deadly*, which reads as both "extremely" and "lethally".
 */
const frFR: Strings = {
  meta: {
    code: 'fr-FR',
    name: 'Français',
    dir: 'ltr',
    aliases: ['fr', 'fr-fr', 'fr-be', 'fr-ch', 'fr-ca'],
  },

  document: {
    title: '12 septembre — Un monde de jouets',
    description:
      'Une simulation sur la guerre contre le terrorisme. Vous pouvez tirer. Ou non. Un remake du newsgame de 2003 de Gonzalo Frasca.',
  },

  intro: {
    titleMain: '12 septembre',
    titleOrdinal: '',
    titleSub: 'Un monde de jouets',
    begin: 'Commencer',
    credit:
      'Un remake du newsgame de 2003 de <strong>Gonzalo Frasca</strong>, publié à l’origine par <strong>Newsgaming.com</strong>. Cette version est un hommage non officiel.',
    manifesto: `Ceci n’est pas un jeu.<br />
      Vous ne pouvez ni gagner ni perdre.<br /><br />
      Ceci est une simulation.<br />
      Elle n’a pas de fin.<br />
      Elle a déjà commencé.<br /><br />
      Les règles sont d’une simplicité mortelle.<br />
      <em>Vous pouvez tirer. Ou non.</em>`,
    legendIntro: 'Deux sortes de silhouettes parcourent la ville.',
    legendCivilian: 'Civil',
    legendTerrorist: 'Terroriste',
    controlsTouch: 'Touchez et faites glisser pour viser. Relâchez pour tirer.',
    controlsPointer: 'Déplacez la souris pour viser. Cliquez pour tirer.',
    accept: 'J’ai compris',
    quoteCredit: 'Texte cité du jeu original de <strong>Gonzalo Frasca</strong>, 2003.',
  },

  hud: {
    menu: 'Menu',
    mute: 'Couper le son',
    unmute: 'Activer le son',
    paused: 'En pause',
    resume: 'Reprendre',
    restart: 'Réinitialiser la ville',
    about: 'À propos du jeu',
    back: 'Retour',
    language: 'Langue',
    hintTouch: 'Glissez pour viser · relâchez pour tirer',
    hintPointer: 'Déplacez pour viser · cliquez pour tirer',
    tally: {
      missilesFired: 'Missiles tirés',
      killed: 'Personnes tuées',
      radicalised: 'Endeuillés radicalisés',
      civilians: 'Civils actuels',
      terrorists: 'Terroristes actuels',
    },
  },

  about: {
    title: 'À propos du jeu',
    intro:
      '<em>September 12th: A Toy World</em> a été créé par <strong>Gonzalo Frasca</strong> et publié par <strong>Newsgaming.com</strong> en 2003 — l’un des tout premiers newsgames : une simulation conçue pour défendre une idée, non pour être gagnée.',
    rulesHeading: 'L’argument est dans les règles',
    rules: [
      'Un missile met <strong>deux secondes</strong> à retomber. Celui que vous visiez est déjà parti.',
      'Le souffle est <strong>plus large que l’écart entre les gens</strong>. Vous ne choisissez pas qui meurt.',
      'Chaque civil qui s’agenouille pour pleurer un corps <strong>se relève en terroriste</strong>.',
    ],
    conclusion:
      'Tirer sur des terroristes en produit donc immanquablement davantage. Il n’y a ni score ni fin, car ne rien faire est le seul état stable.',
    credit: 'Un hommage non officiel.',
  },
}

export default frFR
