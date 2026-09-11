import type { Strings } from '../types'

/**
 * עברית — Hebrew.
 *
 * Right-to-left, but unlike Arabic and Persian it uses Western digits, so the
 * prose here keeps 2003 and 12 rather than switching numeral sets —
 * `toLocaleString('he-IL')` agrees.
 *
 * Verbs are in the plural imperative (גררו, הרימו). Hebrew marks gender on the
 * singular imperative, and the plural is the usual way interface copy avoids
 * assuming anything about who is playing.
 *
 * "טרוריסטים" rather than "מחבלים": the latter carries a specific local
 * political charge that the original's generic desert town does not.
 *
 * Latin runs are wrapped in `<bdi>` so trailing punctuation stays put.
 */
const heIL: Strings = {
  meta: {
    code: 'he-IL',
    name: 'עברית',
    dir: 'rtl',
    // "iw" is the deprecated ISO code for Hebrew, still emitted by some older
    // platforms; claiming it costs nothing and saves those users a fallback.
    aliases: ['he', 'he-il', 'iw'],
  },

  document: {
    title: '12 בספטמבר — עולם של צעצוע',
    description:
      'סימולציה על המלחמה בטרור. אפשר לירות. או לא. גרסה מחודשת למשחק החדשותי של גונזלו פראסקה משנת 2003.',
  },

  intro: {
    titleMain: '12 בספטמבר',
    titleOrdinal: '',
    titleSub: 'עולם של צעצוע',
    begin: 'התחלה',
    credit:
      'גרסה מחודשת למשחק החדשותי של <strong>גונזלו פראסקה</strong> משנת 2003, שפורסם במקור באתר <strong><bdi>Newsgaming.com</bdi></strong>. גרסה זו היא מחווה לא רשמית.',
    manifesto: `זה לא משחק.<br />
      אי אפשר לנצח ואי אפשר להפסיד.<br /><br />
      זו סימולציה.<br />
      אין לה סוף.<br />
      והיא כבר התחילה.<br /><br />
      הכללים פשוטים עד מוות.<br />
      <em>אפשר לירות. או לא.</em>`,
    controlsTouch: 'געו וגררו כדי לכוון. הרימו את האצבע כדי לירות.',
    controlsPointer: 'הזיזו את העכבר כדי לכוון. לחצו כדי לירות.',
    accept: 'הבנתי',
    quoteCredit:
      'הטקסט מצוטט מהמשחק המקורי של <strong>גונזלו פראסקה</strong>, 2003.',
  },

  hud: {
    menu: 'תפריט',
    mute: 'השתקה',
    unmute: 'ביטול השתקה',
    paused: 'מושהה',
    resume: 'המשך',
    restart: 'בנייה מחדש של העיירה',
    about: 'על המשחק',
    back: 'חזרה',
    language: 'שפה',
    hintTouch: 'גררו כדי לכוון · שחררו כדי לירות',
    hintPointer: 'הזיזו כדי לכוון · לחצו כדי לירות',
    tally: {
      missilesFired: 'טילים ששוגרו',
      killed: 'הרוגים',
      radicalised: 'מתאבלים שהוקצנו',
      civilians: 'אזרחים כעת',
      terrorists: 'טרוריסטים כעת',
    },
  },

  about: {
    title: 'על המשחק',
    intro:
      '"<bdi>September 12th: A Toy World</bdi>" נוצר על ידי <strong>גונזלו פראסקה</strong> ופורסם באתר <strong><bdi>Newsgaming.com</bdi></strong> בשנת 2003 — אחד ממשחקי החדשות הראשונים: סימולציה שנבנתה כדי לטעון טענה, לא כדי לנצח בה.',
    rulesHeading: 'הטענה נמצאת בכללים',
    rules: [
      'לטיל לוקח <strong>שתי שניות</strong> לנחות. עד שהוא נוחת, מי שכיוונתם אליו כבר הלך משם.',
      'רדיוס הפיצוץ <strong>רחב מהמרווח שבין האנשים</strong>. אתם לא בוחרים מי מת.',
      'כל אזרח שכורע לבכות על גופה <strong>קם ממנה כטרוריסט</strong>.',
    ],
    conclusion:
      'לכן ירי בטרוריסטים מייצר עוד טרוריסטים, בלי יוצא מן הכלל. אין ניקוד ואין סוף, כי לא לעשות דבר הוא המצב היציב היחיד.',
    credit: 'מחווה לא רשמית.',
  },
}

export default heIL
