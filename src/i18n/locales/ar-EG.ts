import type { Strings } from '../types'

/**
 * العربية — Arabic, Egyptian conventions.
 *
 * The first right-to-left locale, so a few things differ from every other file:
 *
 * - `dir: 'rtl'` flips the whole interface. The stylesheet uses logical
 *   properties, so the HUD buttons, list bullets and the picker's chevron all
 *   move to the other side on their own.
 * - Latin runs are wrapped in `<bdi>`. Without isolation, a Latin word at the
 *   end of an Arabic sentence drags the following full stop to the wrong side
 *   — the bidi algorithm has no way to know the punctuation belongs to the
 *   Arabic, not the Latin.
 * - Numerals are Eastern Arabic (٢٠٠٣), matching what `toLocaleString('ar-EG')`
 *   produces for the tally, so the prose and the counters agree.
 * - Egyptian month naming (سبتمبر), not the Levantine أيلول.
 * - Arabic has no italics, so the work's title takes «guillemets» and the
 *   stylesheet suppresses the slant for `:lang(ar)`.
 */
const arEG: Strings = {
  meta: {
    code: 'ar-EG',
    name: 'العربية',
    dir: 'rtl',
    aliases: ['ar', 'ar-eg'],
  },

  document: {
    title: '١٢ سبتمبر — عالم اللعب',
    description:
      'محاكاة عن الحرب على الإرهاب. يمكنك أن تطلق النار. أو لا. إعادة صنع للعبة الإخبارية التي أنشأها غونزالو فراسكا عام ٢٠٠٣.',
  },

  intro: {
    titleMain: '١٢ سبتمبر',
    titleOrdinal: '',
    titleSub: 'عالم اللعب',
    begin: 'ابدأ',
    credit:
      'إعادة صنع للعبة الإخبارية التي أنشأها <strong>غونزالو فراسكا</strong>، ونشرها في الأصل موقع <strong><bdi>Newsgaming.com</bdi></strong> عام ٢٠٠٣. هذه النسخة تحية غير رسمية.',
    manifesto: `هذه ليست لعبة.<br />
      لا يمكنك أن تفوز ولا أن تخسر.<br /><br />
      هذه محاكاة.<br />
      ليس لها نهاية.<br />
      وقد بدأت بالفعل.<br /><br />
      القواعد بسيطة إلى حدٍّ قاتل.<br />
      <em>يمكنك أن تطلق النار. أو لا.</em>`,
    legendIntro: 'يتجوّل في البلدة نوعان من الناس.',
    legendCivilian: 'مدني',
    legendTerrorist: 'إرهابي',
    controlsTouch: 'المس واسحب للتصويب، وارفع إصبعك لإطلاق النار.',
    controlsPointer: 'حرّك الفأرة للتصويب، وانقر لإطلاق النار.',
    accept: 'فهمت',
    quoteCredit: 'النص مقتبس من اللعبة الأصلية لـ<strong>غونزالو فراسكا</strong>، ٢٠٠٣.',
  },

  hud: {
    menu: 'القائمة',
    mute: 'كتم الصوت',
    unmute: 'إلغاء كتم الصوت',
    paused: 'متوقفة مؤقتًا',
    resume: 'متابعة',
    restart: 'إعادة بناء البلدة',
    about: 'عن هذه اللعبة',
    back: 'رجوع',
    language: 'اللغة',
    hintTouch: 'اسحب للتصويب · ارفع إصبعك لإطلاق النار',
    hintPointer: 'حرّك للتصويب · انقر لإطلاق النار',
    tally: {
      missilesFired: 'الصواريخ المُطلَقة',
      killed: 'القتلى',
      radicalised: 'المشيّعون المتطرّفون',
      civilians: 'المدنيون الآن',
      terrorists: 'الإرهابيون الآن',
    },
  },

  about: {
    title: 'عن هذه اللعبة',
    intro:
      '«<bdi>September 12th: A Toy World</bdi>» من صنع <strong>غونزالو فراسكا</strong>، ونشرها موقع <strong><bdi>Newsgaming.com</bdi></strong> عام ٢٠٠٣ — وهي من أوائل الألعاب الإخبارية: محاكاة صُنعت لتطرح فكرة، لا ليُنتصر فيها.',
    rulesHeading: 'الفكرة كامنة في القواعد',
    rules: [
      'يستغرق الصاروخ <strong>ثانيتين</strong> حتى يسقط. وحين يسقط يكون من صوّبت نحوه قد مضى في طريقه.',
      'نطاق الانفجار <strong>أوسع من المسافة بين الناس</strong>. أنت لا تختار من يموت.',
      'كل مدني يركع حزنًا على جثة <strong>ينهض إرهابيًّا</strong>.',
    ],
    conclusion:
      'ولذلك فإن إطلاق النار على الإرهابيين يُنتج إرهابيين أكثر، بلا استثناء. لا توجد نقاط ولا نهاية، لأن ألا تفعل شيئًا هو الحالة المستقرة الوحيدة.',
    credit: 'تحية غير رسمية.',
  },
}

export default arEG
