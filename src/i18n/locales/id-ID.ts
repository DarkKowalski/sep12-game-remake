import type { Strings } from '../types'

/**
 * Bahasa Indonesia — Indonesian.
 *
 * "Aturannya sederhana sampai mematikan" keeps the original's pun: simple to
 * the point of being lethal.
 *
 * The player is addressed as "kamu" rather than "Anda" — the manifesto is
 * stating rules flatly, and the formal pronoun would make it sound like a
 * terms-of-service notice.
 */
const idID: Strings = {
  meta: {
    code: 'id-ID',
    name: 'Bahasa Indonesia',
    dir: 'ltr',
    // "in" is the deprecated ISO code for Indonesian, still emitted by some
    // older platforms — the same situation as "iw" for Hebrew.
    aliases: ['id', 'id-id', 'in'],
  },

  document: {
    title: '12 September — Sebuah dunia mainan',
    description:
      'Simulasi tentang perang melawan teror. Kamu bisa menembak. Atau tidak. Remake dari newsgame tahun 2003 karya Gonzalo Frasca.',
  },

  intro: {
    titleMain: '12 September',
    titleOrdinal: '',
    titleSub: 'Sebuah dunia mainan',
    begin: 'Mulai',
    credit:
      'Remake dari newsgame tahun 2003 karya <strong>Gonzalo Frasca</strong>, yang semula diterbitkan oleh <strong>Newsgaming.com</strong>. Versi ini adalah penghormatan tidak resmi.',
    manifesto: `Ini bukan permainan.<br />
      Kamu tidak bisa menang dan tidak bisa kalah.<br /><br />
      Ini sebuah simulasi.<br />
      Tidak ada akhirnya.<br />
      Dan sudah dimulai.<br /><br />
      Aturannya sederhana sampai mematikan.<br />
      <em>Kamu bisa menembak. Atau tidak.</em>`,
    legendIntro: 'Ada dua jenis sosok yang berjalan di kota ini.',
    legendCivilian: 'Warga sipil',
    legendTerrorist: 'Teroris',
    controlsTouch: 'Sentuh dan seret untuk membidik. Angkat jari untuk menembak.',
    controlsPointer: 'Gerakkan mouse untuk membidik. Klik untuk menembak.',
    accept: 'Saya mengerti',
    quoteCredit:
      'Teks dikutip dari permainan asli karya <strong>Gonzalo Frasca</strong>, 2003.',
  },

  hud: {
    menu: 'Menu',
    mute: 'Bisukan',
    unmute: 'Nyalakan suara',
    paused: 'Dijeda',
    resume: 'Lanjutkan',
    restart: 'Bangun ulang kota',
    about: 'Tentang permainan ini',
    back: 'Kembali',
    language: 'Bahasa',
    hintTouch: 'Seret untuk membidik · lepas untuk menembak',
    hintPointer: 'Gerakkan untuk membidik · klik untuk menembak',
    tally: {
      missilesFired: 'Rudal ditembakkan',
      killed: 'Orang tewas',
      radicalised: 'Pelayat yang diradikalisasi',
      civilians: 'Warga sipil saat ini',
      terrorists: 'Teroris saat ini',
    },
  },

  about: {
    title: 'Tentang permainan ini',
    intro:
      '<em>September 12th: A Toy World</em> dibuat oleh <strong>Gonzalo Frasca</strong> dan diterbitkan oleh <strong>Newsgaming.com</strong> pada 2003 — salah satu newsgame pertama: simulasi yang dibangun untuk menyampaikan sebuah argumen, bukan untuk dimenangkan.',
    rulesHeading: 'Argumennya ada di dalam aturan',
    rules: [
      'Rudal butuh <strong>dua detik</strong> untuk jatuh. Saat itu tiba, orang yang kamu bidik sudah berjalan pergi.',
      'Ledakannya <strong>lebih lebar daripada jarak antarorang</strong>. Kamu tidak memilih siapa yang mati.',
      'Setiap warga sipil yang berlutut meratapi jenazah <strong>bangkit sebagai teroris</strong>.',
    ],
    conclusion:
      'Jadi menembaki teroris justru selalu menghasilkan lebih banyak teroris. Tidak ada skor dan tidak ada akhir, karena tidak melakukan apa-apa adalah satu-satunya keadaan yang stabil.',
    credit: 'Penghormatan tidak resmi.',
  },
}

export default idID
