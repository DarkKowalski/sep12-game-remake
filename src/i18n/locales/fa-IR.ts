import type { Strings } from '../types'

/**
 * فارسی — Persian.
 *
 * The second right-to-left locale, and it is not simply Arabic in another
 * vocabulary:
 *
 * - Persian digits (۱۲۳) are a different Unicode block from Arabic's (١٢٣).
 *   `toLocaleString('fa-IR')` produces the Persian set, and the prose here
 *   matches it, so the counters and the text agree.
 * - The zero-width non-joiners in می‌توانی and اسباب‌بازی are required
 *   orthography, not stray invisible characters. Don't let an editor strip
 *   them.
 * - Latin runs are wrapped in `<bdi>` for the same reason as in Arabic:
 *   without isolation, trailing punctuation jumps to the wrong end.
 * - No italics, so the work's title takes «guillemets» and the stylesheet
 *   suppresses the slant for `:lang(fa)`.
 *
 * `fa-AF` (Dari) is not claimed as an alias, though the bare-language fallback
 * still routes it here — better Persian than English until someone contributes
 * a Dari file to sit alongside this one.
 */
const faIR: Strings = {
  meta: {
    code: 'fa-IR',
    name: 'فارسی',
    dir: 'rtl',
    aliases: ['fa', 'fa-ir'],
  },

  document: {
    title: '۱۲ سپتامبر — دنیای اسباب‌بازی',
    description:
      'شبیه‌سازی‌ای دربارهٔ جنگ با تروریسم. می‌توانی شلیک کنی. یا نکنی. بازسازی بازی خبری گونزالو فراسکا در سال ۲۰۰۳.',
  },

  intro: {
    titleMain: '۱۲ سپتامبر',
    titleOrdinal: '',
    titleSub: 'دنیای اسباب‌بازی',
    begin: 'شروع',
    credit:
      'بازسازی بازی خبریِ <strong>گونزالو فراسکا</strong> در سال ۲۰۰۳ که در اصل <strong><bdi>Newsgaming.com</bdi></strong> آن را منتشر کرد. این نسخه ادای احترامی غیررسمی است.',
    manifesto: `این یک بازی نیست.<br />
      نه می‌توانی ببری و نه می‌توانی ببازی.<br /><br />
      این یک شبیه‌سازی است.<br />
      پایانی ندارد.<br />
      و از پیش آغاز شده است.<br /><br />
      قاعده‌ها به‌طرز مرگباری ساده‌اند.<br />
      <em>می‌توانی شلیک کنی. یا نکنی.</em>`,
    controlsTouch: 'برای نشانه‌گیری لمس کن و بکش؛ با برداشتن انگشت شلیک می‌شود.',
    controlsPointer: 'برای نشانه‌گیری ماوس را حرکت بده؛ با کلیک شلیک می‌شود.',
    accept: 'فهمیدم',
    quoteCredit: 'متن برگرفته از بازی اصلی <strong>گونزالو فراسکا</strong>، ۲۰۰۳.',
  },

  hud: {
    menu: 'منو',
    mute: 'بی‌صدا',
    unmute: 'باصدا',
    paused: 'متوقف',
    resume: 'ادامه',
    restart: 'بازسازی شهر',
    about: 'دربارهٔ این بازی',
    back: 'بازگشت',
    language: 'زبان',
    hintTouch: 'بکش تا نشانه بگیری · رها کن تا شلیک شود',
    hintPointer: 'حرکت بده تا نشانه بگیری · کلیک کن تا شلیک شود',
    tally: {
      missilesFired: 'موشک‌های شلیک‌شده',
      killed: 'کشته‌شدگان',
      radicalised: 'سوگوارانِ رادیکال‌شده',
      civilians: 'غیرنظامیان کنونی',
      terrorists: 'تروریست‌های کنونی',
    },
  },

  about: {
    title: 'دربارهٔ این بازی',
    intro:
      '«<bdi>September 12th: A Toy World</bdi>» ساختهٔ <strong>گونزالو فراسکا</strong> است و <strong><bdi>Newsgaming.com</bdi></strong> آن را در سال ۲۰۰۳ منتشر کرد — یکی از نخستین بازی‌های خبری: شبیه‌سازی‌ای که ساخته شده تا حرفی بزند، نه اینکه در آن برنده شوی.',
    rulesHeading: 'حرف در قاعده‌ها نهفته است',
    rules: [
      'موشک <strong>دو ثانیه</strong> طول می‌کشد تا فرود بیاید. تا آن لحظه کسی که نشانه گرفته بودی رفته است.',
      'دامنهٔ انفجار <strong>از فاصلهٔ میان آدم‌ها بیشتر است</strong>. تو انتخاب نمی‌کنی چه کسی بمیرد.',
      'هر غیرنظامی که بر پیکری زانو بزند، <strong>تروریست برمی‌خیزد</strong>.',
    ],
    conclusion:
      'پس شلیک به تروریست‌ها بی‌کم‌وکاست تروریست بیشتری می‌سازد. نه امتیازی هست و نه پایانی، چون تنها حالت پایدار این است که هیچ کاری نکنی.',
    credit: 'ادای احترامی غیررسمی.',
  },
}

export default faIR
