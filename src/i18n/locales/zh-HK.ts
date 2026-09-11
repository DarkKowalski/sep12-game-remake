import type { Strings } from '../types'

/**
 * 繁體中文 — Traditional Chinese, Hong Kong conventions.
 *
 * Not a character-by-character conversion of the Simplified file: the wording
 * follows Hong Kong usage (滑鼠, 選單, 觸控, 甚麼) rather than mainland usage.
 * Running it through a Simplified-to-Traditional converter will produce
 * something readable but visibly foreign, so edit it as its own text.
 */
const zhHK: Strings = {
  meta: {
    code: 'zh-HK',
    name: '繁體中文',
    dir: 'ltr',
    aliases: ['zh-hant', 'zh-hk', 'zh-tw', 'zh-mo'],
  },

  document: {
    title: '9月12日 — 玩具世界',
    description:
      '一個關於反恐戰爭的模擬。你可以開火，也可以不開。岡薩洛·弗拉斯卡 2003 年新聞遊戲的現代重製版。',
  },

  intro: {
    titleMain: '9月12日',
    titleOrdinal: '',
    titleSub: '玩具世界',
    begin: '開始',
    credit:
      '這是 <strong>岡薩洛·弗拉斯卡</strong>（Gonzalo Frasca）2003 年新聞遊戲的重製版，原作由 <strong>Newsgaming.com</strong> 發佈。本版本為非官方致敬作品。',
    manifesto: `這不是一個遊戲。<br />
      你無法取勝，也無法落敗。<br /><br />
      這是一個模擬。<br />
      它沒有結局。<br />
      它早已開始。<br /><br />
      規則簡單得要命。<br />
      <em>你可以開火。也可以不開。</em>`,
    legendIntro: '鎮上走著兩種人。',
    legendCivilian: '平民',
    legendTerrorist: '恐怖分子',
    controlsTouch: '觸控並拖曳來瞄準，鬆開手指開火。',
    controlsPointer: '移動滑鼠瞄準，點擊開火。',
    accept: '我明白了',
    quoteCredit: '文字引自 <strong>岡薩洛·弗拉斯卡</strong> 2003 年的原作。',
  },

  hud: {
    menu: '選單',
    mute: '靜音',
    unmute: '取消靜音',
    paused: '已暫停',
    resume: '繼續',
    restart: '重置小鎮',
    about: '關於本作',
    back: '返回',
    language: '語言',
    hintTouch: '拖曳瞄準 · 鬆手開火',
    hintPointer: '移動瞄準 · 點擊開火',
    tally: {
      missilesFired: '發射的導彈',
      killed: '死亡人數',
      radicalised: '被激進化的哀悼者',
      civilians: '目前平民',
      terrorists: '目前恐怖分子',
    },
  },

  about: {
    title: '關於本作',
    intro:
      '《September 12th: A Toy World》（9月12日：玩具世界）由 <strong>岡薩洛·弗拉斯卡</strong> 製作，<strong>Newsgaming.com</strong> 於 2003 年發佈——它是最早的新聞遊戲之一：一個為了表達觀點、而非為了取勝而造出來的模擬。',
    rulesHeading: '觀點就藏在規則裡',
    rules: [
      '導彈要飛 <strong>兩秒</strong> 才落地。等它落下時，你瞄準的人早已走開。',
      '爆炸範圍 <strong>比人與人之間的間隔更大</strong>。你無法選擇誰會死。',
      '每一個跪下來為屍體哀悼的平民，<strong>都會站起來變成恐怖分子</strong>。',
    ],
    conclusion:
      '所以，向恐怖分子開火只會製造出更多恐怖分子。這裡沒有分數，也沒有結局，因為甚麼都不做才是唯一穩定的狀態。',
    credit: '非官方致敬作品。',
  },
}

export default zhHK
