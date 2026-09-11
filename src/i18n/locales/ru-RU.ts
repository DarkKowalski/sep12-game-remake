import type { Strings } from '../types'

/**
 * Русский — Russian.
 *
 * "Правила убийственно просты" keeps the original's pun: *убийственно* means
 * both "extremely" and, literally, "murderously". Interface strings avoid
 * gendered past-tense forms — "Понятно" rather than "Я понял" — so the text
 * doesn't assume anything about who is playing.
 */
const ruRU: Strings = {
  meta: {
    code: 'ru-RU',
    name: 'Русский',
    dir: 'ltr',
    aliases: ['ru', 'ru-ru', 'ru-by', 'ru-kz'],
  },

  document: {
    title: '12 сентября — Игрушечный мир',
    description:
      'Симуляция о войне с терроризмом. Вы можете стрелять. Или нет. Ремейк ньюсгейма Гонсало Фраски 2003 года.',
  },

  intro: {
    titleMain: '12 сентября',
    titleOrdinal: '',
    titleSub: 'Игрушечный мир',
    begin: 'Начать',
    credit:
      'Ремейк ньюсгейма <strong>Гонсало Фраски</strong> (Gonzalo Frasca) 2003 года, впервые опубликованного на <strong>Newsgaming.com</strong>. Эта версия — неофициальный оммаж.',
    manifesto: `Это не игра.<br />
      Вы не можете выиграть и не можете проиграть.<br /><br />
      Это симуляция.<br />
      У неё нет конца.<br />
      Она уже началась.<br /><br />
      Правила убийственно просты.<br />
      <em>Вы можете стрелять. Или нет.</em>`,
    controlsTouch: 'Коснитесь и ведите пальцем, чтобы прицелиться. Отпустите — выстрел.',
    controlsPointer: 'Двигайте мышь, чтобы прицелиться. Щёлкните — выстрел.',
    accept: 'Понятно',
    quoteCredit:
      'Текст процитирован из оригинальной игры <strong>Гонсало Фраски</strong>, 2003.',
  },

  hud: {
    menu: 'Меню',
    mute: 'Выключить звук',
    unmute: 'Включить звук',
    paused: 'Пауза',
    resume: 'Продолжить',
    restart: 'Перестроить город',
    about: 'Об игре',
    back: 'Назад',
    language: 'Язык',
    hintTouch: 'Ведите, чтобы прицелиться · отпустите — выстрел',
    hintPointer: 'Двигайте, чтобы прицелиться · щёлкните — выстрел',
    tally: {
      missilesFired: 'Выпущено ракет',
      killed: 'Погибло людей',
      radicalised: 'Радикализировано скорбящих',
      civilians: 'Мирных жителей сейчас',
      terrorists: 'Террористов сейчас',
    },
  },

  about: {
    title: 'Об игре',
    intro:
      '<em>September 12th: A Toy World</em> создал <strong>Гонсало Фраска</strong>, игра вышла на <strong>Newsgaming.com</strong> в 2003 году — один из первых ньюсгеймов: симуляция, созданная не для победы, а чтобы высказать мысль.',
    rulesHeading: 'Мысль заложена в правилах',
    rules: [
      'Ракета летит <strong>две секунды</strong>. К моменту попадания тот, в кого вы целились, уже ушёл.',
      'Радиус взрыва <strong>шире, чем расстояние между людьми</strong>. Вы не выбираете, кто погибнет.',
      'Каждый мирный житель, опустившийся на колени над телом, <strong>поднимается террористом</strong>.',
    ],
    conclusion:
      'Поэтому стрельба по террористам неизменно порождает новых. Здесь нет ни очков, ни финала, потому что единственное устойчивое состояние — не делать ничего.',
    credit: 'Неофициальный оммаж.',
  },
}

export default ruRU
