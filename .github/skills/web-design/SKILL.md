---
name: web-design
description: Tarixiy ilovasining mavjud ko'rinishini saqlaydigan reusable UI va CSS dizayn qoidalari.
---

# Tarixiy Web Design Skill

Bu loyiha uchun barcha UI, komponent va CSS vazifalarida ushbu reusable dizayn tizimiga amal qil.

## Maqsad

Mavjud loyiha uslubini buzmasdan, mobilga mos, aniq, sokin va premium ko'rinishli sahifalar yaratish. Dizayn faqat mavjud ranglar, radiuslar, bo'shliqlar, soyalar va responsiv sxemalar bilan saqlansin.

## Loyiha asoslari

- Ilova asosiy kengligi 430px bo'lgan mobil konteyner sifatida ishlaydi.
- `body` va `#root` minimal 100vh balandlikka ega, vertikal scroll body orqali amalga oshiriladi.
- Gorizontal scrollga yo'l qo'yilmaydi.
- Faqat ishlatilgan Tailwind utility va loyiha CSS sinflariga asoslaniladi.
- Yangi CSS yaratishdan oldin mavjud sinflar, ranglar, radiuslar va animatsiyalar qayta ishlatilsin.

## Rang tizimi

### Asosiy neytral ranglar

- Sahifa/fon: `#F8FAFC`
- Oq sirt: `#FFFFFF`
- Ikkilik fon: `#F1F5F9`
- Yengil kulrang: `#F3F4F6`, `#F6F1E9`, `#FBF7F2`
- Asosiy matn: `#1E293B`
- To'q matn: `#0F172A`
- Ikkinchi matn: `#334155`, `#475569`
- Sokin yordamchi matn: `#64748B`, `#94A3B8`
- Chegara: `#E2E8F0`, `#E5E7EB`, `#CBD5E1`

### Markaziy aksent ranglar

- Oltin: `#E8B84B`
- Oltin to'q: `#9A7A3B`
- Jigar/oranj: `#F97316`
- Ko'k: `#1E40AF`, `#2563EB`
- Yashil: `#1F7A45`, `#3F8F6F`, `#22C55E`
- Xato/qizil: `#DC2626`, `#EF4444`, `#B91C1C`
- Kitoblik qizil/qoramtir tema: `#0D1117`, `#161B22`, `#21262D`

Ranglar uchun mavjud Tailwind yoki aniq hex qiymatlaridan foydalanilsin. Tasodifiy rang, porloq neon, gradient yoki rang palitrasi kengaytirilmasin.

## Tipografiya

- Oddiy matn uchun tizim shriftidan foydalanilsin.
- Sarlavha: og'ir, odatda `font-bold` yoki `font-extrabold`.
- Bo'lim nomlari: ixcham, yuqori registr bilan va biroz tracking bilan berilishi mumkin.
- Yordamchi matn: odatda `text-xs` yoki `text-sm`.
- Kichik mobil ekranda sarlavha, tugma va kartochka matnlari ixcham va bir-biriga yaqin tursin.
- Matn raqam, telefon va dinamik qiymatlar bilan buzilsa `min-w-0`, `truncate`, `break-words` qo'llansin.

## Bo'shliqlar va qadoq

- Sahifa gorizontal qadoqlari odatda `px-3`, `px-4` yoki `px-5`.
- Vertikal bo'lim qadoqlari odatda `py-3`, `py-4`, `py-5` yoki `py-7`.
- Ichki kartochka qadoqlari odatda `p-3`, `p-4` yoki `p-5`.
- Elementlar orasidagi bo'shliq odatda `gap-2`, `gap-3`, `gap-4` va ularning responsiv ko'rinishi.
- Katta bo'limlar orasida `mb-3`, `mb-4`, `mb-5` yoki `space-y-*` ishlatilsin.

## Radius tizimi

- Kichik ikonka yoki badge: `rounded-lg`, odatda 8–12px.
- Tugma va maydon: `rounded-xl`, odatda 12–16px.
- Kartochka: `rounded-2xl`, odatda 16–20px.
- Hero, premium yoki alohida katta blok: `rounded-[30px]` yoki 28–30px.
- Dumaloq avatar, badge va indikator: `rounded-full`.

## Kartochka tuzilishi

- Oq yoki yengil kulrang kartochka asosiy sirt.
- Chegara odatda `border border-[#E2E8F0]` yoki loyihaga mos `#E9E2D8`.
- Yengil shadow: `shadow-sm`.
- Muhim hero kartochka: kuchliroq gradient/shadow va kontrasli oq matn.
- Kartochka ichida chapda ikonka/holat marker, o'ngda ma'lumot yoki chevron bo'lsin.
- Qulflangan holat uchun kulranglash, opacity va Lock belgisi ishlatilsin.
- Muvaffaqiyat uchun yumshoq yashil; ogohlantirish uchun sariq; xato uchun yumshoq qizil fon.

## Tugmalar

- Asosiy tugma: oltin `#E8B84B` yoki yashil `#1F7A45`.
- Ikkinchi tugma: oq/yengil fon, chegara va to'q matn.
- Modal, saqlash va asosiy harakat tugmalari `w-full` bo'lishi mumkin.
- Bosish va hoverda kichik `scale`, fon yoki soya o'zgarishi bo'lsin.
- `disabled` holatida opacity pasaytirilsin va kursor `not-allowed` yoki `wait` bo'lsin.
- Tugma ichida faqat bir asosiy amaliyot bo'lsin.

## Ikonkalar

- `lucide-react` ikonkalari standart ishlatilsin.
- Kichik ikonka odatda 16–18px.
- Kartochka ikonkasi odatda 20–24px.
- Ikonka konteyneri 40–56px, odatda yumaloq-burchakli va och yengil fonli.

## Animatsiya va interaksiya

- Sahifa: `pageEnter 320ms` yoki `bookPageTurn 450ms`, cubic-bezier `0.22, 1, 0.36, 1`.
- Kichik UI o'tishlari: 140–250ms.
- Bosish holati: `scale(0.98)` yoki `scale(0.99)`.
- Qulflangan karta: mavjud `animate-shake` qoidasi ishlatilsin.
- Doimiy attention animatsiyasi faqat mavjud Drako, sparkle yoki cheklangan elementlar uchun ishlatilsin.
- `prefers-reduced-motion: reduce` rejimida animatsiyalar deyarli o'chirilsin.

## Responsive va mobil

- Mobil birinchi: kontent avval 430px konteynerga moslanadi.
- Telefon `<=375px`: padding, gap, icon va fontlarni bir pog'ona kichraytirish.
- Juda kichik `<=320px`: ikonka 32–36px, matn 13–17px oralig'ida va satr to'lib ketmasligi kerak.
- Modal: kichik ekranda pastdan, keng ekranda markazdan ochiladi.
- Fixed elementlar, bottom nav va input barlar xavfsiz plyushli scrollga mos bo'lsin.
- `100dvh`, `dvh/svh` kabi zamonaviy viewport birliklari ishlatilsin.

## Scrollbar

- Scrollbar kengligi 7px.
- Track: `#F1F5F9`.
- Thumb: `#CBD5E1`, radius `4px`.
- Hover: `#E8B84B`.

## Dark/system tema

- Tizim rejimi faqat mavjud `data-app-theme="system"` logikasidan foydalanilsin.
- Dark fon: `#111827`.
- Dark sirt: `#1F2937`.
- Dark asosiy matn: `#F3F4F6`.
- Dark yordamchi matn: `#CBD5E1`.
- Dark chegara: `#374151`.
- Boshqa yangi dark palitra yoki random qora qiymatlar qo'shilmasin.

## Kodlash qoidalari

- Dizaynni HTML markup emas, mavjud komponent va class strukturasiga moslashgan holda o'zgartirish.
- CSSni qisqa, specific va loyihadagi aniq nomlash bilan yozish.
- Bir xil uslub uchun CSSni takrorlamasdan, mavjud utility yoki CSS o'zgaruvchilaridan foydalanish.
- Interaksiya uchun `active`, `hover`, `disabled`, `focus` holatlari berish.
- Foydalanuvchi tanlamasin yoki seleksiya o'chirilmagan bo'lsa, imkoniyatiga qarab `select-none` ishlatish.
- `dangerouslySetInnerHTML` ishlatilmasin.
- Matn va variantlarni oddiy React text sifatida chiqarish.
- Tarmoq, server va cache sababli yuklanish, bo'sh, xato holatlari aniq ko'rsatiladi.
- Mavjud animatsiya va Drako komponentlariga tegilmasin; ulardan mavjud joylashuvda foydalanilsin.
- Boshqa sahifalarning rang, layout yoki funkcional qismlarini o'zgartirmasdan, faqat vazifa berilgan UI qismini loyihaga moslashtirish.
