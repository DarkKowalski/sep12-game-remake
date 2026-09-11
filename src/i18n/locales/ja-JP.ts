import type { Strings } from '../types'

/**
 * 日本語 — Japanese.
 *
 * The manifesto keeps the original's flat, declarative 常体 rather than
 * softening into 丁寧語: the text is stating rules, not addressing a customer.
 * The rest of the interface uses 丁寧語 as usual. Japanese has no italics, so
 * the work's title takes 二重鉤括弧『』 instead of the English `<em>`.
 */
const jaJP: Strings = {
  meta: {
    code: 'ja-JP',
    name: '日本語',
    dir: 'ltr',
    aliases: ['ja', 'ja-jp'],
  },

  document: {
    title: '9月12日 — おもちゃの世界',
    description:
      'テロとの戦いをめぐるシミュレーション。撃つこともできる。撃たないこともできる。ゴンサロ・フラスカによる2003年のニュースゲームのリメイク。',
  },

  intro: {
    titleMain: '9月12日',
    titleOrdinal: '',
    titleSub: 'おもちゃの世界',
    begin: 'はじめる',
    credit:
      '<strong>ゴンサロ・フラスカ</strong>（Gonzalo Frasca）が制作し、<strong>Newsgaming.com</strong> が2003年に公開したニュースゲームのリメイクです。本作は非公式のオマージュです。',
    manifesto: `これはゲームではない。<br />
      勝つこともできず、負けることもできない。<br /><br />
      これはシミュレーションだ。<br />
      終わりはない。<br />
      そしてすでに始まっている。<br /><br />
      ルールは恐ろしいほど単純だ。<br />
      <em>撃つか、撃たないか。</em>`,
    legendIntro: 'この町を歩いているのは二種類の人間だ。',
    legendCivilian: '民間人',
    legendTerrorist: 'テロリスト',
    controlsTouch: '画面に触れてドラッグで照準、指を離すと発射します。',
    controlsPointer: 'マウスを動かして照準、クリックで発射します。',
    accept: '理解した',
    quoteCredit:
      'テキストは <strong>ゴンサロ・フラスカ</strong> による2003年の原作からの引用です。',
  },

  hud: {
    menu: 'メニュー',
    mute: 'ミュート',
    unmute: 'ミュート解除',
    paused: '一時停止中',
    resume: '再開',
    restart: '町をやり直す',
    about: 'このゲームについて',
    back: '戻る',
    language: '言語',
    hintTouch: 'ドラッグで照準 · 離して発射',
    hintPointer: '動かして照準 · クリックで発射',
    tally: {
      missilesFired: '発射したミサイル',
      killed: '死亡者',
      radicalised: '過激化した弔問者',
      civilians: '現在の民間人',
      terrorists: '現在のテロリスト',
    },
  },

  about: {
    title: 'このゲームについて',
    intro:
      '『September 12th: A Toy World』は <strong>ゴンサロ・フラスカ</strong> が制作し、<strong>Newsgaming.com</strong> が2003年に公開しました。最初期のニュースゲームのひとつであり、勝つためではなく主張を伝えるために作られたシミュレーションです。',
    rulesHeading: '主張はルールのなかにある',
    rules: [
      'ミサイルは着弾までに <strong>2秒</strong> かかります。その頃には、狙った相手はもう歩き去っています。',
      '爆発の範囲は <strong>人と人の間隔よりも広い</strong>。誰が死ぬかを選ぶことはできません。',
      '遺体に膝をついて弔った民間人は、<strong>立ち上がるとテロリストになります</strong>。',
    ],
    conclusion:
      'つまり、テロリストを撃てば確実にテロリストが増えます。スコアも終わりもありません。何もしないことだけが、唯一の安定した状態だからです。',
    credit: '非公式のオマージュ作品です。',
  },
}

export default jaJP
