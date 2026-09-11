import type { Strings } from '../types'

/**
 * 한국어 — Korean.
 *
 * The manifesto keeps the original's flat declarative 해라체 rather than the
 * polite style used elsewhere in the interface: it is stating rules, not
 * addressing a customer. Korean marks work titles with 《》 rather than
 * italics, so the `<em>` the English copy uses is dropped here.
 */
const koKR: Strings = {
  meta: {
    code: 'ko-KR',
    name: '한국어',
    dir: 'ltr',
    aliases: ['ko', 'ko-kr'],
  },

  document: {
    title: '9월 12일 — 장난감 세계',
    description:
      '테러와의 전쟁에 관한 시뮬레이션. 쏠 수도 있고, 쏘지 않을 수도 있다. 곤살로 프라스카가 2003년에 만든 뉴스게임의 리메이크.',
  },

  intro: {
    titleMain: '9월 12일',
    titleOrdinal: '',
    titleSub: '장난감 세계',
    begin: '시작하기',
    credit:
      '<strong>곤살로 프라스카</strong>(Gonzalo Frasca)가 만들고 <strong>Newsgaming.com</strong>이 2003년에 공개한 뉴스게임의 리메이크입니다. 이 버전은 비공식 오마주입니다.',
    manifesto: `이것은 게임이 아니다.<br />
      이길 수도, 질 수도 없다.<br /><br />
      이것은 시뮬레이션이다.<br />
      끝이 없다.<br />
      이미 시작되었다.<br /><br />
      규칙은 지독하게 단순하다.<br />
      <em>쏘거나, 쏘지 않거나.</em>`,
    controlsTouch: '화면을 누른 채 끌어서 조준하고, 손을 떼면 발사합니다.',
    controlsPointer: '마우스를 움직여 조준하고, 클릭하면 발사합니다.',
    accept: '이해했습니다',
    quoteCredit: '<strong>곤살로 프라스카</strong>의 2003년 원작에서 인용한 문구입니다.',
  },

  hud: {
    menu: '메뉴',
    mute: '음소거',
    unmute: '음소거 해제',
    paused: '일시정지',
    resume: '계속하기',
    restart: '마을 초기화',
    about: '이 게임에 대하여',
    back: '뒤로',
    language: '언어',
    hintTouch: '끌어서 조준 · 놓아서 발사',
    hintPointer: '움직여 조준 · 클릭해서 발사',
    tally: {
      missilesFired: '발사한 미사일',
      killed: '사망자',
      radicalised: '급진화된 조문객',
      civilians: '현재 민간인',
      terrorists: '현재 테러리스트',
    },
  },

  about: {
    title: '이 게임에 대하여',
    intro:
      '《September 12th: A Toy World》는 <strong>곤살로 프라스카</strong>가 만들고 <strong>Newsgaming.com</strong>이 2003년에 공개했습니다. 가장 초기의 뉴스게임 중 하나로, 이기기 위해서가 아니라 주장을 펼치기 위해 만들어진 시뮬레이션입니다.',
    rulesHeading: '주장은 규칙 속에 있다',
    rules: [
      '미사일은 착탄까지 <strong>2초</strong>가 걸립니다. 그때쯤이면 조준했던 사람은 이미 걸어가 버렸습니다.',
      '폭발 범위는 <strong>사람과 사람 사이의 간격보다 넓습니다</strong>. 누가 죽을지 고를 수 없습니다.',
      '시신 앞에 무릎 꿇고 애도한 민간인은 <strong>일어설 때 테러리스트가 됩니다</strong>.',
    ],
    conclusion:
      '그래서 테러리스트를 쏘면 테러리스트가 더 늘어납니다. 점수도 결말도 없습니다. 아무것도 하지 않는 것만이 유일하게 안정된 상태이기 때문입니다.',
    credit: '비공식 오마주 작품입니다.',
  },
}

export default koKR
