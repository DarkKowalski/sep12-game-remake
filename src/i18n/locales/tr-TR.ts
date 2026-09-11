import type { Strings } from '../types'

/**
 * Türkçe — Turkish.
 *
 * "Kurallar ölümcül derecede basit" keeps the original's pun on *deadly*.
 * Proper nouns take an apostrophe before their suffixes: Frasca’nın.
 */
const trTR: Strings = {
  meta: {
    code: 'tr-TR',
    name: 'Türkçe',
    dir: 'ltr',
    aliases: ['tr', 'tr-tr', 'tr-cy'],
  },

  document: {
    title: '12 Eylül — Bir oyuncak dünya',
    description:
      'Terörle savaş üzerine bir simülasyon. Ateş edebilirsin. Ya da etmezsin. Gonzalo Frasca’nın 2003 tarihli haber oyununun yeniden yapımı.',
  },

  intro: {
    titleMain: '12 Eylül',
    titleOrdinal: '',
    titleSub: 'Bir oyuncak dünya',
    begin: 'Başla',
    credit:
      '<strong>Gonzalo Frasca</strong>’nın 2003 tarihli haber oyununun yeniden yapımı; özgün hâli <strong>Newsgaming.com</strong> tarafından yayımlandı. Bu sürüm resmî olmayan bir saygı duruşudur.',
    manifesto: `Bu bir oyun değil.<br />
      Ne kazanabilirsin ne de kaybedebilirsin.<br /><br />
      Bu bir simülasyon.<br />
      Sonu yok.<br />
      Çoktan başladı.<br /><br />
      Kurallar ölümcül derecede basit.<br />
      <em>Ateş edebilirsin. Ya da etmezsin.</em>`,
    controlsTouch: 'Nişan almak için dokunup sürükleyin. Ateş etmek için parmağınızı kaldırın.',
    controlsPointer: 'Nişan almak için fareyi hareket ettirin. Ateş etmek için tıklayın.',
    accept: 'Anladım',
    quoteCredit:
      'Metin, <strong>Gonzalo Frasca</strong>’nın 2003 tarihli özgün oyunundan alıntıdır.',
  },

  hud: {
    menu: 'Menü',
    mute: 'Sesi kapat',
    unmute: 'Sesi aç',
    paused: 'Duraklatıldı',
    resume: 'Devam et',
    restart: 'Kasabayı sıfırla',
    about: 'Bu oyun hakkında',
    back: 'Geri',
    language: 'Dil',
    hintTouch: 'Nişan almak için sürükleyin · ateş etmek için bırakın',
    hintPointer: 'Nişan almak için hareket ettirin · ateş etmek için tıklayın',
    tally: {
      missilesFired: 'Atılan füzeler',
      killed: 'Ölen insanlar',
      radicalised: 'Radikalleşen yas tutanlar',
      civilians: 'Şu anki siviller',
      terrorists: 'Şu anki teröristler',
    },
  },

  about: {
    title: 'Bu oyun hakkında',
    intro:
      '<em>September 12th: A Toy World</em>, <strong>Gonzalo Frasca</strong> tarafından yapıldı ve 2003’te <strong>Newsgaming.com</strong> tarafından yayımlandı — ilk haber oyunlarından biri: kazanılmak için değil, bir savı ortaya koymak için kurulmuş bir simülasyon.',
    rulesHeading: 'Sav, kuralların içinde',
    rules: [
      'Bir füzenin düşmesi <strong>iki saniye</strong> sürer. O ana kadar nişan aldığınız kişi çoktan uzaklaşmıştır.',
      'Patlama <strong>insanlar arasındaki mesafeden daha geniştir</strong>. Kimin öleceğini siz seçmezsiniz.',
      'Bir cesedin başında diz çöküp yas tutan her sivil, <strong>ayağa terörist olarak kalkar</strong>.',
    ],
    conclusion:
      'Yani teröristlere ateş etmek hiç şaşmadan daha fazla terörist üretir. Puan da yok, son da yok; çünkü tek istikrarlı durum hiçbir şey yapmamaktır.',
    credit: 'Resmî olmayan bir saygı duruşu.',
  },
}

export default trTR
