import React, { useState } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Send,
  UserRound,
  X,
  Zap,
} from 'lucide-react';

const question = {
  author: 'Madina Karimova',
  initial: 'M',
  grade: '9-sinf',
  topic: 'Temuriylar',
  text: 'Amir Temur o‘z davlatining poytaxti etib qaysi shaharni tanlagan?',
  answer: 'Samarqand',
  accepted: ['Samarqand', 'Samarkand'],
  explanation:
    'Amir Temur Samarqandni o‘z saltanatining poytaxtiga aylantirib, uni yirik siyosiy, iqtisodiy va madaniy markaz sifatida rivojlantirgan.',
  found: 128,
};

const topics = ['Hammasi', 'Qadimgi davr', "O'rta asrlar", 'Temuriylar'];
const sortOptions = ['Yangi', 'Mashhur', 'Hal qilmaganlarim'];
const subjectOptions = ["Qadimgi davr", "O'rta asrlar", 'Temuriylar'];

function normalizeAnswer(value) {
  return value
    .toLocaleLowerCase('uz')
    .replace(/[’‘`´]/g, "'")
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function editDistance(left, right) {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i += 1) {
    let diagonal = previous[0];
    previous[0] = i;
    for (let j = 1; j <= right.length; j += 1) {
      const above = previous[j];
      previous[j] = Math.min(
        previous[j] + 1,
        previous[j - 1] + 1,
        diagonal + (left[i - 1] === right[j - 1] ? 0 : 1),
      );
      diagonal = above;
    }
  }
  return previous[right.length];
}

function getAnswerMatch(value) {
  const normalized = normalizeAnswer(value);
  const accepted = question.accepted.map(normalizeAnswer);
  if (accepted.includes(normalized)) return 'correct';
  if (accepted.some((answer) => answer.length >= 5 && editDistance(normalized, answer) === 1)) {
    return 'correct';
  }
  if (accepted.some((answer) => {
    const distance = editDistance(normalized, answer);
    return distance >= 2 && distance <= 3;
  })) {
    return 'close';
  }
  return 'wrong';
}

export default function BilimdonlarPage({ onBack }) {
  const [xp, setXp] = useState(340);
  const [answer, setAnswer] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [firstTry, setFirstTry] = useState(true);
  const [result, setResult] = useState(null);
  const [solved, setSolved] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [drakoText, setDrakoText] = useState('Salom! Bugun bitta qiziqarli savol bor. Topib ko‘ramizmi?');
  const [activeTopic, setActiveTopic] = useState('Hammasi');
  const [activeSort, setActiveSort] = useState('Yangi');
  const [formOpen, setFormOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [formValues, setFormValues] = useState({
    text: '',
    answer: '',
    alternatives: '',
    topic: 'Temuriylar',
  });
  const [formError, setFormError] = useState('');

  const isAnswered = solved || revealed;
  const showQuestion = (activeTopic === 'Hammasi' || activeTopic === question.topic)
    && (activeSort !== 'Hal qilmaganlarim' || !isAnswered);

  const submitAnswer = (event) => {
    event.preventDefault();
    if (!answer.trim()) {
      setResult({ type: 'empty', message: 'Avval javobni yozing.' });
      return;
    }
    if (isAnswered) return;

    const match = getAnswerMatch(answer);
    if (match === 'correct') {
      const earned = firstTry ? 10 : 5;
      setXp((current) => current + earned);
      setResult({ type: 'correct', earned });
      setSolved(true);
      setFirstTry(false);
      setDrakoText('Barakalla! Tarixiy bilimlaringiz zo‘r ekan!');
      return;
    }
    if (match === 'close') {
      setResult({ type: 'close', message: "Yaqinroq! Imloni yoki yilni tekshirib ko'ring." });
      setFirstTry(false);
      setDrakoText('Juda yaqin keldingiz, yana bir bor o‘ylab ko‘ring!');
      return;
    }

    setAttempts((current) => current + 1);
    setFirstTry(false);
    setResult({ type: 'wrong', message: 'Bu emas. Yana urinib ko‘ring.' });
    setDrakoText('Mayli, yana urinib ko‘ring. Siz buni topa olasiz!');
  };

  const updateForm = (field, value) => {
    setFormValues((current) => ({ ...current, [field]: value }));
    setFormError('');
  };

  const submitQuestion = (event) => {
    event.preventDefault();
    const text = formValues.text.trim();
    const correctAnswer = formValues.answer.trim();
    if (text.length < 10 || text.length > 200) {
      setFormError('Savol 10–200 belgi orasida bo‘lishi kerak.');
      return;
    }
    if (!correctAnswer || correctAnswer.length > 60) {
      setFormError('To‘g‘ri javobni kiriting (ko‘pi bilan 60 belgi).');
      return;
    }
    if (formValues.alternatives.length > 120) {
      setFormError('Boshqa yozilishlar 120 belgidan oshmasligi kerak.');
      return;
    }

    setPendingCount((current) => current + 1);
    setFormValues({ text: '', answer: '', alternatives: '', topic: 'Temuriylar' });
    setFormError('');
    setFormOpen(false);
    setDrakoText('Rahmat! Drako savolingizni tekshiruvga yubordi.');
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-white px-4 pb-28 pt-7 text-[#1E293B] page-transition">
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Orqaga"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#475569]"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-[18px] font-medium leading-6">Bilimdonlar</h1>
          <p className="text-[12px] text-[#64748B]">O‘quvchilar savoli, sizning javobingiz</p>
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-full bg-[#FEF3C7] px-3 py-1.5 text-[13px] font-semibold text-[#A16207]">
          <Zap className="h-4 w-4 fill-current" />
          {xp} XP
        </div>
      </div>

      <section className="mb-4 rounded-xl bg-[#F8F7F2] p-3">
        <div className="flex items-start gap-2.5">
          <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-[#DCFCE7] text-[16px] font-bold text-[#15803D]">
            D
          </div>
          <p className="rounded-xl border border-[#E7E5DF] bg-white px-3 py-2 text-[13px] leading-5 text-[#475569]">
            {formOpen ? 'Ajoyib! Qiziqarli savolingizni boshqalar bilan ulashamiz.' : drakoText}
          </p>
        </div>
      </section>

      <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
        {topics.map((topic) => (
          <button
            key={topic}
            type="button"
            onClick={() => setActiveTopic(topic)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-[12px] transition ${
              activeTopic === topic
                ? 'border-[#F59E0B] bg-[#FBBF24] font-medium text-[#422006]'
                : 'border-[#E5E7EB] bg-white text-[#64748B]'
            }`}
          >
            {topic}
          </button>
        ))}
      </div>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {sortOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setActiveSort(option)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-[12px] transition ${
              activeSort === option
                ? 'border-[#F59E0B] bg-[#FBBF24] font-medium text-[#422006]'
                : 'border-[#E5E7EB] bg-white text-[#64748B]'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {showQuestion ? (
        <article
          key={attempts}
          className={`rounded-xl border p-3 ${
            isAnswered
              ? 'border-[#86EFAC] bg-[#F0FDF4]'
              : 'border-[#E5E7EB] bg-[#FDFCFA]'
          } ${result?.type === 'wrong' ? 'animate-shake' : ''}`}
        >
          <header className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EDE9FE] text-[12px] font-semibold text-[#6D28D9]">
              {question.initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium">{question.author}</p>
              <p className="text-[11px] text-[#64748B]">{question.grade}</p>
            </div>
            <span className="rounded-full bg-[#FEF3C7] px-2.5 py-1 text-[11px] font-medium text-[#92400E]">
              {question.topic}
            </span>
          </header>

          <p className="mb-2 text-[15px] font-medium leading-[1.5] text-[#1E293B]">{question.text}</p>
          <p className="mb-3 flex items-center gap-1.5 text-[12px] text-[#64748B]">
            <UserRound className="h-3.5 w-3.5" />
            {question.found} kishi topdi
          </p>

          {!isAnswered && (
            <form onSubmit={submitAnswer} className="flex gap-2">
              <input
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder="Javobingizni yozing"
                aria-label="Javobingizni yozing"
                className="min-w-0 flex-1 rounded-lg border border-[#D1D5DB] bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#D97706] focus:ring-2 focus:ring-[#FDE68A]"
              />
              <button
                type="submit"
                aria-label="Javobni yuborish"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F59E0B] text-white transition hover:bg-[#D97706]"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          )}

          {result && (
            <div
              role="status"
              className={`mt-2 rounded-lg px-3 py-2 text-[12px] ${
                result.type === 'correct'
                  ? 'bg-[#DCFCE7] text-[#166534]'
                  : result.type === 'close'
                    ? 'bg-[#FEF3C7] text-[#92400E]'
                    : result.type === 'wrong'
                      ? 'bg-[#FEE2E2] text-[#B91C1C]'
                      : 'bg-[#FEF3C7] text-[#92400E]'
              }`}
            >
              {result.type === 'correct' ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span className="flex-1">To‘g‘ri: {question.answer}</span>
                  <span className="font-semibold">+{result.earned} XP</span>
                </div>
              ) : (
                result.message
              )}
            </div>
          )}

          {!isAnswered && attempts >= 2 && (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="mt-2 text-[12px] font-medium text-[#A16207] underline underline-offset-2"
            >
              Javobni ko‘rish (ballsiz)
            </button>
          )}

          {isAnswered && (
            <div className="mt-3 rounded-lg bg-[#F0FDF4] p-3 text-[12px] leading-5 text-[#166534]">
              <p className="mb-1 flex items-center gap-1 font-semibold">
                <Check className="h-3.5 w-3.5" />
                Javob: {question.answer}
              </p>
              <p>{question.explanation}</p>
            </div>
          )}
        </article>
      ) : (
        <div className="rounded-xl border border-dashed border-[#D1D5DB] bg-[#F9FAFB] p-5 text-center text-[13px] text-[#64748B]">
          Bu mavzuda hozircha savol yo‘q.
        </div>
      )}

      {formOpen ? (
        <section className="mt-3 rounded-xl border border-[#E5E7EB] bg-[#FDFCFA] p-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[15px] font-medium">Yangi savol</h2>
            <button
              type="button"
              onClick={() => {
                setFormOpen(false);
                setFormError('');
              }}
              aria-label="Formani yopish"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F3F4F6]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={submitQuestion} className="space-y-2.5">
            <label className="block text-[12px] font-medium text-[#475569]">
              Savol
              <textarea
                value={formValues.text}
                onChange={(event) => updateForm('text', event.target.value)}
                maxLength={200}
                minLength={10}
                required
                rows={3}
                className="mt-1 w-full resize-y rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-[13px] font-normal outline-none focus:border-[#D97706]"
              />
            </label>
            <label className="block text-[12px] font-medium text-[#475569]">
              To‘g‘ri javob
              <input
                value={formValues.answer}
                onChange={(event) => updateForm('answer', event.target.value)}
                maxLength={60}
                required
                className="mt-1 w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-[13px] font-normal outline-none focus:border-[#D97706]"
              />
            </label>
            <label className="block text-[12px] font-medium text-[#475569]">
              Boshqa qabul qilinadigan yozilishlar (vergul bilan)
              <input
                value={formValues.alternatives}
                onChange={(event) => updateForm('alternatives', event.target.value)}
                maxLength={120}
                className="mt-1 w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-[13px] font-normal outline-none focus:border-[#D97706]"
              />
            </label>
            <label className="block text-[12px] font-medium text-[#475569]">
              Mavzu
              <select
                value={formValues.topic}
                onChange={(event) => updateForm('topic', event.target.value)}
                className="mt-1 w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-[13px] font-normal outline-none focus:border-[#D97706]"
              >
                {subjectOptions.map((subject) => <option key={subject}>{subject}</option>)}
              </select>
            </label>
            {formError && <p role="alert" className="text-[12px] text-[#B91C1C]">{formError}</p>}
            <button
              type="submit"
              className="w-full rounded-lg bg-[#F59E0B] px-3 py-2.5 text-[13px] font-semibold text-white hover:bg-[#D97706]"
            >
              Tekshiruvga yuborish
            </button>
            <p className="text-[11px] leading-4 text-[#64748B]">
              Savolingiz admin tekshiruvidan o‘tgach lentada chiqadi. Javobingiz boshqalarga ko‘rinmaydi.
            </p>
          </form>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => {
            setFormOpen(true);
            setDrakoText('Ajoyib! Qiziqarli savolingizni boshqalar bilan ulashamiz.');
          }}
          className="mt-3 w-full rounded-xl border border-dashed border-[#D1D5DB] bg-white py-3 text-[13px] font-medium text-[#475569] hover:border-[#F59E0B] hover:bg-[#FFFBEB]"
        >
          {pendingCount > 0
            ? `Tekshiruvda: ${pendingCount} ta savol. Yana qo‘shish`
            : '+ Savol qo‘shish'}
        </button>
      )}
    </main>
  );
}
