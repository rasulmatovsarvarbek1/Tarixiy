// ═══════════════════════════════════════════════════
// levelLessons.js — Level → darslar xaritasi
// 1 Level = 3 dars: 2 ta Jahon tarixi + 1 ta O'zbekiston tarixi
// ═══════════════════════════════════════════════════

export const MEDIEVAL_HISTORY_TEXT = `Ma'lumki, o'rta asrlar tarixi qadimgi va yangi zamon o'rtasida o'tgan butun boshli o'n asrni, ya'ni milodiy V asrning so'nggi qismidan to XV asrning so'ngiga qadar davom etgan juda ulkan va qiziqarli davrni qamrab oladi. Unda feodal jamiyatning qanday vujudga kelgani, qay tariqa rivoj topgani, xalq ommasi qanday yashagani va mehnat qilgani, ular o'z ozodliklari uchun olib borgan urushlarda o'z mustaqilliklarini qanday himoya qilganliklari haqida hikoya qilinadi.

O'rta asrlar jamiyati haqida. O'rta asrlar kishilik jamiyati Yevropada feodal, Osiyoda esa yer egaligi jamiyati deb ataladi.

«Feodal» atamasi lotincha «feod» so'zidan olingan. Ma'lum xizmat evaziga qirol tomonidan berilgan va meros bo'lib qoladigan yer-mulkka feod deyilgan. Feod egasi esa feodal deb aytilgan. Feodal jamiyati yer egaligiga asoslangan jamiyatdir.

Yevropada yer-mulk egasi feodal deb atalgan. Feodal o'z yerining bir qismini dehqonlarga chek yer qilib bo'lib bergan. Buning evaziga dehqonlar feodalning yerlarini ishlab berganlar. Dehqonlar o'zlariga berilgan chek yerlarida yetishtirgan hosildan ma'lum qismini feodalga soliq sifatida to'laganlar.

Feodal davri turli xalqlarda turlicha vaqtlarda tashkil topgan. Masalan, G'arbiy Yevropada V asr oxirlarida zaiflashgan G'arbiy Rim imperiyasi 476-yilda «varvarlar»ning qaqshatqich zarbasidan qulaganidan so'ng feodal davri vujudga kelgan.

Turli mamlakatlarda feodal davri hukm surgan davrlar ham turlicha bo'lgan.

Osiyoda yer egaligi jamiyati. Osiyoda (xususan, Vatanimiz hududida ham) yer egaligi Yevropadagidan farq qilgan. Osiyoda davlat hukmdori yerning oliy egasi hisoblangan. Yer maydonlarining ma'lum qismi bevosita davlat`;

export const LEVEL_LESSONS = {
  1: [
    { id: '1-1', type: 'jahon',      title: 'Kirish',  content: MEDIEVAL_HISTORY_TEXT },
    { id: '1-2', type: 'jahon',      title: 'Dars 2',  content: 'Tez orada...' },
    { id: '1-3', type: 'uzbekiston', title: 'Dars 3',  content: 'Tez orada...' },
  ],
};

/**
 * Berilgan levelId uchun darslarni qaytaradi.
 * Agar ma'lumot bo'lmasa, vaqtinchalik darslar to'plami qaytaradi (ilova qulamasligi uchun).
 */
export function getLessonsForLevel(levelId) {
  if (LEVEL_LESSONS[levelId]) {
    return LEVEL_LESSONS[levelId];
  }
  // Fallback: hali matn yozilmagan levellar uchun
  return [
    { id: `${levelId}-1`, type: 'jahon',      title: 'Dars 1', content: 'Tez orada...' },
    { id: `${levelId}-2`, type: 'jahon',      title: 'Dars 2', content: 'Tez orada...' },
    { id: `${levelId}-3`, type: 'uzbekiston', title: 'Dars 3', content: 'Tez orada...' },
  ];
}
