import type { Strings } from '../types'

/**
 * اردو — Urdu, Pakistan.
 *
 * The third right-to-left locale, and the one with the most specific
 * requirements:
 *
 * - **Western digits, not Eastern.** Unlike Persian and Arabic, `ur-PK`
 *   resolves to the `latn` numbering system, so `toLocaleString('ur-PK')`
 *   renders the tally as 12, not ۱۲. The prose here matches that. (`ur-IN`
 *   would use `arabext` — another reason not to claim it as an alias without
 *   a file of its own.)
 * - **Nastaliq, not Naskh.** Urdu is set in a cascading calligraphic style
 *   that needs roughly double the line-height of Arabic; the stylesheet gives
 *   `:lang(ur)` its own rule. The font is whatever the system provides — see
 *   the note in styles.css about why none is bundled.
 * - Sentences end with the Urdu full stop ۔ (U+06D4), not a Latin period.
 * - Latin runs are wrapped in `<bdi>` so trailing punctuation stays put.
 *
 * "اصول مہلک حد تک سادہ ہیں" keeps the original's pun on *deadly*.
 */
const urPK: Strings = {
  meta: {
    code: 'ur-PK',
    name: 'اردو',
    dir: 'rtl',
    aliases: ['ur', 'ur-pk'],
  },

  document: {
    title: '12 ستمبر — ایک کھلونا دنیا',
    description:
      'دہشت گردی کے خلاف جنگ پر ایک سمیولیشن۔ آپ گولی چلا سکتے ہیں۔ یا نہیں۔ گونزالو فراسکا کے 2003 کے نیوز گیم کا ری میک۔',
  },

  intro: {
    titleMain: '12 ستمبر',
    titleOrdinal: '',
    titleSub: 'ایک کھلونا دنیا',
    begin: 'شروع کریں',
    credit:
      '<strong>گونزالو فراسکا</strong> کے 2003 کے نیوز گیم کا ری میک، جو اصل میں <strong><bdi>Newsgaming.com</bdi></strong> نے شائع کیا تھا۔ یہ نسخہ ایک غیر سرکاری خراجِ تحسین ہے۔',
    manifesto: `یہ کوئی کھیل نہیں۔<br />
      نہ آپ جیت سکتے ہیں، نہ ہار سکتے ہیں۔<br /><br />
      یہ ایک سمیولیشن ہے۔<br />
      اس کا کوئی انجام نہیں۔<br />
      اور یہ شروع ہو چکی ہے۔<br /><br />
      اصول مہلک حد تک سادہ ہیں۔<br />
      <em>آپ گولی چلا سکتے ہیں۔ یا نہیں۔</em>`,
    legendIntro: 'قصبے میں دو طرح کے لوگ چلتے پھرتے ہیں۔',
    legendCivilian: 'شہری',
    legendTerrorist: 'دہشت گرد',
    controlsTouch: 'نشانہ لینے کے لیے چھو کر گھسیٹیں، اور فائر کرنے کے لیے انگلی اٹھا لیں۔',
    controlsPointer: 'نشانہ لینے کے لیے ماؤس ہلائیں، اور فائر کرنے کے لیے کلک کریں۔',
    accept: 'سمجھ لیا',
    quoteCredit: 'متن <strong>گونزالو فراسکا</strong> کے 2003 کے اصل کھیل سے لیا گیا ہے۔',
  },

  hud: {
    menu: 'مینیو',
    mute: 'آواز بند',
    unmute: 'آواز چالو',
    paused: 'وقفہ',
    resume: 'جاری رکھیں',
    restart: 'قصبہ دوبارہ بنائیں',
    about: 'اس کھیل کے بارے میں',
    back: 'واپس',
    language: 'زبان',
    hintTouch: 'نشانہ لینے کے لیے گھسیٹیں · فائر کے لیے چھوڑ دیں',
    hintPointer: 'نشانہ لینے کے لیے ہلائیں · فائر کے لیے کلک کریں',
    tally: {
      missilesFired: 'داغے گئے میزائل',
      killed: 'ہلاک شدگان',
      radicalised: 'شدت پسند بننے والے سوگوار',
      civilians: 'موجودہ شہری',
      terrorists: 'موجودہ دہشت گرد',
    },
  },

  about: {
    title: 'اس کھیل کے بارے میں',
    intro:
      '«<bdi>September 12th: A Toy World</bdi>» <strong>گونزالو فراسکا</strong> نے بنایا اور <strong><bdi>Newsgaming.com</bdi></strong> نے 2003 میں شائع کیا — یہ ابتدائی نیوز گیمز میں سے ایک ہے: ایک سمیولیشن جو جیتنے کے لیے نہیں، بلکہ ایک بات کہنے کے لیے بنایا گیا۔',
    rulesHeading: 'بات اصولوں میں چھپی ہے',
    rules: [
      'میزائل کو گرنے میں <strong>دو سیکنڈ</strong> لگتے ہیں۔ تب تک جس پر آپ نے نشانہ لیا تھا، وہ آگے بڑھ چکا ہوتا ہے۔',
      'دھماکے کا دائرہ <strong>لوگوں کے درمیان فاصلے سے زیادہ چوڑا ہے</strong>۔ کون مرے گا، یہ آپ نہیں چنتے۔',
      'ہر وہ شہری جو کسی لاش پر گھٹنے ٹیک کر ماتم کرتا ہے، <strong>دہشت گرد بن کر اٹھتا ہے</strong>۔',
    ],
    conclusion:
      'چنانچہ دہشت گردوں پر گولی چلانا لازماً مزید دہشت گرد پیدا کرتا ہے۔ نہ کوئی اسکور ہے نہ کوئی انجام، کیونکہ واحد مستحکم حالت یہی ہے کہ کچھ نہ کیا جائے۔',
    credit: 'ایک غیر سرکاری خراجِ تحسین۔',
  },
}

export default urPK
