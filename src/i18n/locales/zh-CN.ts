import type { Strings } from '../types'

/**
 * 简体中文 — Simplified Chinese.
 *
 * Notes for future editors:
 * - The manifesto is Gonzalo Frasca's text from the 2003 original. It is
 *   translated for sense, not word by word. "The rules are deadly simple"
 *   puns on "deadly"; 「简单得要命」 keeps that double meaning.
 * - Chinese has no italics, so the work's title uses 书名号《》rather than
 *   the `<em>` the English copy relies on.
 */
const zhCN: Strings = {
  meta: {
    code: 'zh-CN',
    name: '简体中文',
    dir: 'ltr',
    aliases: ['zh-hans', 'zh-cn', 'zh-sg', 'zh'],
  },

  document: {
    title: '9月12日 — 玩具世界',
    description:
      '一个关于反恐战争的模拟。你可以开火，也可以不开。冈萨洛·弗拉斯卡 2003 年新闻游戏的现代重制版。',
  },

  intro: {
    titleMain: '9月12日',
    // Chinese dates take no ordinal suffix.
    titleOrdinal: '',
    titleSub: '玩具世界',
    begin: '开始',
    credit:
      '这是 <strong>冈萨洛·弗拉斯卡</strong>（Gonzalo Frasca）2003 年新闻游戏的重制版，原作由 <strong>Newsgaming.com</strong> 发布。本版本为非官方致敬作品。',
    manifesto: `这不是一个游戏。<br />
      你无法取胜，也无法落败。<br /><br />
      这是一个模拟。<br />
      它没有结局。<br />
      它早已开始。<br /><br />
      规则简单得要命。<br />
      <em>你可以开火。也可以不开。</em>`,
    legendIntro: '镇上走着两种人。',
    legendCivilian: '平民',
    legendTerrorist: '恐怖分子',
    controlsTouch: '触摸并拖动来瞄准，松开手指开火。',
    controlsPointer: '移动鼠标瞄准，点击开火。',
    accept: '我明白了',
    quoteCredit: '文字引自 <strong>冈萨洛·弗拉斯卡</strong> 2003 年的原作。',
  },

  hud: {
    menu: '菜单',
    mute: '静音',
    unmute: '取消静音',
    paused: '已暂停',
    resume: '继续',
    restart: '重置小镇',
    about: '关于本作',
    back: '返回',
    language: '语言',
    hintTouch: '拖动瞄准 · 松手开火',
    hintPointer: '移动瞄准 · 点击开火',
    tally: {
      missilesFired: '发射的导弹',
      killed: '死亡人数',
      radicalised: '被激进化的哀悼者',
      civilians: '当前平民',
      terrorists: '当前恐怖分子',
    },
  },

  about: {
    title: '关于本作',
    intro:
      '《September 12th: A Toy World》（9月12日：玩具世界）由 <strong>冈萨洛·弗拉斯卡</strong> 制作，<strong>Newsgaming.com</strong> 于 2003 年发布——它是最早的新闻游戏之一：一个为了表达观点、而非为了取胜而造出来的模拟。',
    rulesHeading: '观点就藏在规则里',
    rules: [
      '导弹要飞 <strong>两秒</strong> 才落地。等它落下时，你瞄准的人早已走开。',
      '爆炸范围 <strong>比人与人之间的间隔更大</strong>。你无法选择谁会死。',
      '每一个跪下来为尸体哀悼的平民，<strong>都会站起来变成恐怖分子</strong>。',
    ],
    conclusion:
      '所以，向恐怖分子开火只会制造出更多恐怖分子。这里没有分数，也没有结局，因为什么都不做才是唯一稳定的状态。',
    credit: '非官方致敬作品。',
  },
}

export default zhCN
