import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Flag,
  Send,
  UserRound,
  X,
  Zap,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const topics = ['Hammasi', 'Qadimgi davr', "O'rta asrlar", 'Temuriylar'];
const sortOptions = ['Yangi', 'Mashhur', 'Hal qilmaganlarim'];
const subjectOptions = ["Qadimgi davr", "O'rta asrlar", 'Temuriylar'];
const PAGE_SIZE = 20;
const NETWORK_ERROR = 'Internetga ulanib qayta urinib ko‘ring';

function getQuestionError(error) {
  const messages = {
    profil_yoq: 'Profilingiz topilmadi. Qayta kirib ko‘ring.',
    matn_uzunligi: 'Savol matni uzunligi talabga mos emas.',
    javob_uzunligi: 'Javob uzunligi talabga mos emas.',
    mavzu: 'Mavzuni tanlang.',
    izoh_uzunligi: 'Izoh 300 belgidan oshmasligi kerak.',
    manba_uzunligi: 'Manba 120 belgidan oshmasligi kerak.',
    variant_uzunligi: 'Har bir variant 60 belgidan oshmasligi kerak.',
    kunlik_limit: 'Bugun 3 ta savol qo‘shdingiz. Ertaga davom eting',
  };
  return messages[error] || 'Savol yuborilmadi. Qayta urinib ko‘ring.';
}

export default function BilimdonlarPage({ onBack }) {
  const [xp, setXp] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [pageError, setPageError] = useState('');
  const [retryToken, setRetryToken] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState({});
  const [submittingId, setSubmittingId] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [report, setReport] = useState(null);
  const [reportedIds, setReportedIds] = useState([]);
  const [drakoText, setDrakoText] = useState('Salom! Bugun bitta qiziqarli savol bor. Topib ko‘ramizmi?');
  const [activeTopic, setActiveTopic] = useState('Hammasi');
  const [activeSort, setActiveSort] = useState('Yangi');
  const [formOpen, setFormOpen] = useState(false);
  const [myQuestionsOpen, setMyQuestionsOpen] = useState(false);
  const [myQuestions, setMyQuestions] = useState([]);
  const [myQuestionsLoading, setMyQuestionsLoading] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formValues, setFormValues] = useState({
    text: '',
    answer: '',
    variants: ['', '', '', '', ''],
    topic: 'Temuriylar',
    explanation: '',
    source: '',
    anonymous: false,
  });
  const [formError, setFormError] = useState('');
  const listRequest = useRef(0);

  const pendingCount = myQuestions.filter((item) => item.holat === 'tekshiruvda').length;

  const callRpc = async (functionName, params = {}) => {
    if (!supabase) throw new Error(NETWORK_ERROR);
    const { data, error } = await supabase.rpc(functionName, params);
    if (error) throw error;
    return data;
  };

  const showRpcError = (error) => {
    console.error('Bilimdonlar RPC so‘rovi bajarilmadi:', error);
    setPageError(NETWORK_ERROR);
  };

  const loadXp = async () => {
    try {
      const data = await callRpc('holat_olish');
      const status = Array.isArray(data) ? data[0] : data;
      if (Number.isFinite(Number(status?.xp))) setXp(Number(status.xp));
      setPageError('');
    } catch (error) {
      showRpcError(error);
    }
  };

  const loadMyQuestions = async () => {
    try {
      const data = await callRpc('mening_savollarim');
      setMyQuestions(Array.isArray(data) ? data : []);
      setPageError('');
    } catch (error) {
      showRpcError(error);
    } finally {
      setMyQuestionsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const checkSession = async () => {
      try {
        if (!supabase) throw new Error(NETWORK_ERROR);
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!data.session) {
          window.location.replace('/');
          return;
        }
        if (active) setSessionReady(true);
      } catch (error) {
        if (active) {
          setHasLoaded(true);
          setListLoading(false);
          showRpcError(error);
        }
      }
    };
    void checkSession();
    return () => {
      active = false;
    };
  }, [retryToken]);

  useEffect(() => {
    if (!sessionReady) return undefined;
    const requestId = ++listRequest.current;
    const loadQuestions = async () => {
      try {
        const data = await callRpc('savollar_lentasi', {
          p_mavzu: activeTopic === 'Hammasi' ? null : activeTopic,
          p_tartib: activeSort === 'Mashhur' ? 'mashhur' : 'yangi',
          p_yechilmagan: activeSort === 'Hal qilmaganlarim',
          p_limit: PAGE_SIZE,
          p_offset: 0,
        });
        if (requestId !== listRequest.current) return;
        const items = Array.isArray(data) ? data : [];
        setQuestions(items);
        setHasMore(items.length === PAGE_SIZE);
        setHasLoaded(true);
        setPageError('');
      } catch (error) {
        if (requestId === listRequest.current) {
          setHasLoaded(true);
          showRpcError(error);
        }
      } finally {
        if (requestId === listRequest.current) setListLoading(false);
      }
    };
    void loadQuestions();
    return () => {
      if (requestId === listRequest.current) listRequest.current += 1;
    };
  }, [sessionReady, activeTopic, activeSort, retryToken]);

  useEffect(() => {
    if (!sessionReady) return;
    void loadXp();
    void loadMyQuestions();
  }, [sessionReady, retryToken]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    const requestId = ++listRequest.current;
    setLoadingMore(true);
    try {
      const data = await callRpc('savollar_lentasi', {
        p_mavzu: activeTopic === 'Hammasi' ? null : activeTopic,
        p_tartib: activeSort === 'Mashhur' ? 'mashhur' : 'yangi',
        p_yechilmagan: activeSort === 'Hal qilmaganlarim',
        p_limit: PAGE_SIZE,
        p_offset: questions.length,
      });
      if (requestId !== listRequest.current) return;
      const items = Array.isArray(data) ? data : [];
      setQuestions((current) => [...current, ...items]);
      setHasMore(items.length === PAGE_SIZE);
      setPageError('');
    } catch (error) {
      if (requestId === listRequest.current) showRpcError(error);
    } finally {
      if (requestId === listRequest.current) setLoadingMore(false);
    }
  };

  const updateQuestion = (id, fields) => {
    setQuestions((current) => current.map((item) => (
      item.id === id ? { ...item, ...fields } : item
    )));
  };

  const submitAnswer = async (event, question) => {
    event.preventDefault();
    const answer = (answers[question.id] || '').trim();
    if (!answer) {
      setResults((current) => ({
        ...current,
        [question.id]: { type: 'empty', message: 'Avval javobni yozing.' },
      }));
      return;
    }
    if (question.mening_holatim || submittingId) return;
    setSubmittingId(question.id);
    try {
      const data = await callRpc('savol_tekshir', {
        p_savol_id: question.id,
        p_javob: answer,
      });
      if (!data?.ok) {
        const messages = {
          topilmadi: 'Savol topilmadi.',
          oz_savoli: 'O‘z savolingizga javob bera olmaysiz.',
          bosh: 'Avval javobni yozing.',
          kut: 'Juda ko‘p urinish, bir soatdan keyin urinib ko‘ring',
        };
        setResults((current) => ({
          ...current,
          [question.id]: { type: 'error', message: messages[data?.xato] || 'Javob yuborilmadi.' },
        }));
        return;
      }
      setPageError('');
      if (data.natija === 'togri') {
        setResults((current) => ({ ...current, [question.id]: { type: 'correct', data } }));
        updateQuestion(question.id, {
          mening_holatim: 'topdi',
          togri_javob: data.togri_javob,
          izoh: data.izoh,
          topdi_soni: data.topdi_soni,
          xato_urinishlar: data.xato_urinishlar,
        });
        setDrakoText('Barakalla! Tarixiy bilimlaringiz zo‘r ekan!');
        await loadXp();
      } else if (data.natija === 'allaqachon') {
        setResults((current) => ({ ...current, [question.id]: { type: 'already', data } }));
        updateQuestion(question.id, {
          mening_holatim: 'topdi',
          togri_javob: data.togri_javob || question.togri_javob,
          izoh: data.izoh || question.izoh,
          topdi_soni: data.topdi_soni,
          xato_urinishlar: data.xato_urinishlar,
        });
      } else if (data.natija === 'yaqin') {
        setResults((current) => ({
          ...current,
          [question.id]: { type: 'close', message: "Yaqinroq! Imloni yoki yilni tekshirib ko'ring." },
        }));
        updateQuestion(question.id, { xato_urinishlar: data.xato_urinishlar });
        setDrakoText('Juda yaqin keldingiz, yana bir bor o‘ylab ko‘ring!');
      } else {
        setResults((current) => ({
          ...current,
          [question.id]: { type: 'wrong', message: 'Bu emas. Yana urinib ko‘ring.' },
        }));
        updateQuestion(question.id, { xato_urinishlar: data.xato_urinishlar });
        setDrakoText('Mayli, yana urinib ko‘ring. Siz buni topa olasiz!');
      }
    } catch (error) {
      showRpcError(error);
      setResults((current) => ({
        ...current,
        [question.id]: { type: 'error', message: NETWORK_ERROR },
      }));
    } finally {
      setSubmittingId(null);
    }
  };

  const revealAnswer = async (question) => {
    setViewingId(question.id);
    try {
      const data = await callRpc('javobni_korish', { p_savol_id: question.id });
      if (!data?.ok) {
        setResults((current) => ({
          ...current,
          [question.id]: { type: 'error', message: data?.xato === 'erta' ? 'Javobni ko‘rish uchun yana urinib ko‘ring.' : 'Javob ko‘rsatilmadi.' },
        }));
        return;
      }
      setResults((current) => ({ ...current, [question.id]: { type: 'revealed', data } }));
      updateQuestion(question.id, {
        mening_holatim: data.holat || 'korildi',
        togri_javob: data.togri_javob,
        izoh: data.izoh,
      });
      setPageError('');
    } catch (error) {
      showRpcError(error);
    } finally {
      setViewingId(null);
    }
  };

  const submitReport = async (event) => {
    event.preventDefault();
    if (!report || !report.reason.trim()) return;
    setReport((current) => ({ ...current, submitting: true, error: '' }));
    try {
      const data = await callRpc('shikoyat_qil', {
        p_savol_id: report.id,
        p_sabab: report.reason.trim(),
      });
      if (!data?.ok) {
        setReport((current) => ({
          ...current,
          submitting: false,
          error: data?.xato || 'Shikoyat yuborilmadi. Qayta urinib ko‘ring.',
        }));
        return;
      }
      setReportedIds((current) => [...current, report.id]);
      setReport(null);
      setPageError('');
    } catch (error) {
      showRpcError(error);
      setReport((current) => ({
        ...current,
        submitting: false,
        error: NETWORK_ERROR,
      }));
    }
  };

  const updateForm = (field, value) => {
    setFormValues((current) => ({ ...current, [field]: value }));
    setFormError('');
  };

  const submitQuestion = async (event) => {
    event.preventDefault();
    if (formSubmitting) return;
    setFormSubmitting(true);
    setFormError('');
    try {
      const data = await callRpc('savol_qosh', {
        p_matn: formValues.text.trim(),
        p_javob: formValues.answer.trim(),
        p_variantlar: formValues.variants.map((variant) => variant.trim()),
        p_mavzu: formValues.topic,
        p_izoh: formValues.explanation.trim(),
        p_manba: formValues.source.trim(),
        p_anonim: formValues.anonymous,
      });
      if (!data?.ok) {
        setFormError(getQuestionError(data?.xato));
        return;
      }
      setFormValues({
        text: '',
        answer: '',
        variants: ['', '', '', '', ''],
        topic: 'Temuriylar',
        explanation: '',
        source: '',
        anonymous: false,
      });
      setFormError('');
      setFormOpen(false);
      setDrakoText('Savolingiz tekshiruvga yuborildi');
      setMyQuestionsLoading(true);
      await loadMyQuestions();
    } catch (error) {
      showRpcError(error);
      setFormError(NETWORK_ERROR);
    } finally {
      setFormSubmitting(false);
    }
  };

  const statusLabels = {
    tekshiruvda: 'Tekshiruvda',
    chop_etildi: 'Chop etildi',
    rad_etildi: 'Rad etildi',
    yashirilgan: 'Yashirilgan',
  };

  const retryLoading = () => {
    setPageError('');
    setListLoading(true);
    setLoadingMore(false);
    setMyQuestionsLoading(true);
    setRetryToken((current) => current + 1);
  };

  const selectTopic = (topic) => {
    if (topic === activeTopic) return;
    setListLoading(true);
    setLoadingMore(false);
    setActiveTopic(topic);
  };

  const selectSort = (sort) => {
    if (sort === activeSort) return;
    setListLoading(true);
    setLoadingMore(false);
    setActiveSort(sort);
  };

  const renderQuestion = (question) => {
    const result = results[question.id];
    const isAnswered = Boolean(question.mening_holatim);
    const answerText = result?.data?.togri_javob || question.togri_javob;
    const explanation = result?.data?.izoh || question.izoh;
    const author = question.muallif || 'O‘quvchi';
    const initial = [...author.trim()][0]?.toLocaleUpperCase('uz') || 'O';
    const grade = question.sinf
      ? (String(question.sinf).includes('sinf') ? question.sinf : `${question.sinf}-sinf`)
      : '';
    const statusClass = question.mening_holatim === 'topdi'
      ? 'border-[#86EFAC] bg-[#F0FDF4]'
      : question.mening_holatim === 'korildi'
        ? 'border-[#D1D5DB] bg-[#F3F4F6]'
        : 'border-[#E5E7EB] bg-[#FDFCFA]';

    return (
      <article
        key={question.id}
        className={`rounded-xl border p-3 ${statusClass} ${
          result?.type === 'wrong' || result?.type === 'close' ? 'animate-shake' : ''
        }`}
      >
        <header className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EDE9FE] text-[12px] font-semibold text-[#6D28D9]">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium">{author}</p>
            <p className="text-[11px] text-[#64748B]">{grade}</p>
          </div>
          <span className="rounded-full bg-[#FEF3C7] px-2.5 py-1 text-[11px] font-medium text-[#92400E]">
            {question.mavzu}
          </span>
        </header>

        <p className="mb-2 text-[15px] font-medium leading-[1.5] text-[#1E293B]">{question.matn}</p>
        <p className="mb-3 flex items-center gap-1.5 text-[12px] text-[#64748B]">
          <UserRound className="h-3.5 w-3.5" />
          {question.topdi_soni || 0} kishi topdi
        </p>

        {!isAnswered && (
          <form onSubmit={(event) => void submitAnswer(event, question)} className="flex gap-2">
            <input
              value={answers[question.id] || ''}
              onChange={(event) => {
                const value = event.target.value;
                setAnswers((current) => ({ ...current, [question.id]: value }));
              }}
              placeholder="Javobingizni yozing"
              aria-label="Javobingizni yozing"
              className="min-w-0 flex-1 rounded-lg border border-[#D1D5DB] bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#D97706] focus:ring-2 focus:ring-[#FDE68A]"
            />
            <button
              type="submit"
              aria-label="Javobni yuborish"
              disabled={submittingId === question.id}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F59E0B] text-white transition hover:bg-[#D97706] disabled:cursor-not-allowed disabled:opacity-60"
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
                  : result.type === 'wrong' || result.type === 'error'
                    ? 'bg-[#FEE2E2] text-[#B91C1C]'
                    : 'bg-[#FEF3C7] text-[#92400E]'
            }`}
          >
            {result.type === 'correct' ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span className="flex-1">To‘g‘ri: {result.data.togri_javob}</span>
                <span className="font-semibold">
                  {result.data.ball === 0 ? 'Ball berilmadi (kunlik chegara)' : `+${result.data.ball} XP`}
                </span>
              </div>
            ) : result.type === 'already' ? (
              'Bu savolni avval topgansiz.'
            ) : result.type === 'revealed' ? (
              'Ball berilmadi'
            ) : (
              result.message
            )}
          </div>
        )}

        {!isAnswered && (question.xato_urinishlar || 0) >= 2 && (
          <button
            type="button"
            onClick={() => void revealAnswer(question)}
            disabled={viewingId === question.id}
            className="mt-2 text-[12px] font-medium text-[#A16207] underline underline-offset-2 disabled:opacity-60"
          >
            Javobni ko‘rish (ballsiz)
          </button>
        )}

        {isAnswered && (
          <div className={`mt-3 rounded-lg p-3 text-[12px] leading-5 ${
            question.mening_holatim === 'topdi'
              ? 'bg-[#F0FDF4] text-[#166534]'
              : 'bg-[#E5E7EB] text-[#475569]'
          }`}>
            <p className="mb-1 flex items-center gap-1 font-semibold">
              <Check className="h-3.5 w-3.5" />
              Javob: {answerText}
              {question.mening_holatim === 'korildi' && <span> · Ball berilmadi</span>}
            </p>
            <p>{explanation}</p>
          </div>
        )}

        {reportedIds.includes(question.id) ? (
          <p className="mt-2 text-[11px] text-[#64748B]">Shikoyat yuborildi</p>
        ) : report?.id === question.id ? (
          <form onSubmit={(event) => void submitReport(event)} className="mt-2 space-y-2">
            <textarea
              value={report.reason}
              onChange={(event) => setReport((current) => ({ ...current, reason: event.target.value }))}
              maxLength={200}
              required
              rows={2}
              placeholder="Shikoyat sababi"
              aria-label="Shikoyat sababi"
              className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-[12px] outline-none focus:border-[#D97706]"
            />
            {report.error && <p role="alert" className="text-[11px] text-[#B91C1C]">{report.error}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setReport(null)} className="text-[11px] text-[#64748B]">Bekor qilish</button>
              <button type="submit" disabled={report.submitting} className="rounded-md bg-[#F59E0B] px-2.5 py-1 text-[11px] font-medium text-white disabled:opacity-60">
                Yuborish
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setReport({ id: question.id, reason: '', error: '', submitting: false })}
            className="mt-2 inline-flex items-center gap-1 text-[11px] text-[#64748B] hover:text-[#B91C1C]"
          >
            <Flag className="h-3 w-3" />
            Shikoyat
          </button>
        )}
      </article>
    );
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
          {xp ?? '...'} XP
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
      {pageError && (
        <div role="alert" className="mb-3 flex items-center justify-between gap-3 rounded-lg bg-[#FEF2F2] px-3 py-2 text-[12px] text-[#B91C1C]">
          <span>{pageError}</span>
          <button type="button" onClick={retryLoading} className="shrink-0 font-semibold underline">
            Qayta urinish
          </button>
        </div>
      )}

      <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
        {topics.map((topic) => (
          <button
            key={topic}
            type="button"
            onClick={() => selectTopic(topic)}
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
            onClick={() => selectSort(option)}
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

      {!hasLoaded && listLoading ? (
        <div aria-label="Yuklanmoqda" aria-busy="true" className="space-y-3">
          {[0, 1].map((item) => (
            <div key={item} className="animate-pulse rounded-xl border border-[#E5E7EB] bg-[#FDFCFA] p-3">
              <div className="mb-3 h-7 w-32 rounded bg-[#E5E7EB]" />
              <div className="mb-2 h-4 w-full rounded bg-[#E5E7EB]" />
              <div className="h-4 w-2/3 rounded bg-[#E5E7EB]" />
            </div>
          ))}
          <p className="text-center text-[12px] text-[#64748B]">Yuklanmoqda</p>
        </div>
      ) : questions.length > 0 ? (
        <section className="space-y-3" aria-busy={listLoading}>
          {listLoading && <p className="text-[11px] text-[#64748B]">Yangilanmoqda...</p>}
          {questions.map(renderQuestion)}
          {hasMore && (
            <button
              type="button"
              onClick={() => void loadMore()}
              disabled={loadingMore || listLoading}
              className="w-full rounded-lg border border-[#E5E7EB] bg-white py-2.5 text-[12px] font-medium text-[#475569] disabled:opacity-60"
            >
              {loadingMore ? 'Yuklanmoqda...' : 'Yana ko‘rsatish'}
            </button>
          )}
        </section>
      ) : hasLoaded && !pageError ? (
        <div className="rounded-xl border border-dashed border-[#D1D5DB] bg-[#F9FAFB] p-5 text-center text-[13px] text-[#64748B]">
          Bu mavzuda hozircha savol yo‘q.
        </div>
      ) : null}

      <section className="mt-3">
        <button
          type="button"
          onClick={() => {
            const opening = !myQuestionsOpen;
            setMyQuestionsOpen(opening);
            if (opening) {
              setMyQuestionsLoading(true);
              void loadMyQuestions();
            }
          }}
          className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-left text-[12px] font-medium text-[#475569]"
        >
          <span>Mening savollarim</span>
          <span className="float-right text-[#A16207]">Tekshiruvda: {pendingCount} ta savol</span>
        </button>
        {myQuestionsOpen && (
          <div className="mt-2 space-y-2">
            {myQuestionsLoading ? (
              <p className="rounded-lg bg-[#F9FAFB] p-3 text-[12px] text-[#64748B]">Yuklanmoqda...</p>
            ) : myQuestions.length === 0 ? (
              <p className="rounded-lg bg-[#F9FAFB] p-3 text-[12px] text-[#64748B]">Hozircha savollaringiz yo‘q.</p>
            ) : myQuestions.map((item) => (
              <article key={item.id} className="rounded-lg border border-[#E5E7EB] bg-[#FDFCFA] p-3">
                <p className="text-[13px] font-medium text-[#1E293B]">{item.matn}</p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#64748B]">
                  <span>{item.mavzu} · {statusLabels[item.holat] || item.holat}</span>
                  <span>{item.topdi_soni || 0} kishi topdi · {item.olgan_xp || 0} XP</span>
                </div>
                {item.holat === 'rad_etildi' && item.rad_sababi && (
                  <p className="mt-2 text-[12px] text-[#B91C1C]">Rad etish sababi: {item.rad_sababi}</p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

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
            <fieldset className="space-y-2">
              <legend className="text-[12px] font-medium text-[#475569]">Variantlar</legend>
              {formValues.variants.map((variant, index) => (
                <input
                  key={index}
                  value={variant}
                  onChange={(event) => {
                    const value = event.target.value;
                    setFormValues((current) => ({
                      ...current,
                      variants: current.variants.map((item, itemIndex) => (
                        itemIndex === index ? value : item
                      )),
                    }));
                    setFormError('');
                  }}
                  maxLength={60}
                  aria-label={`Variant ${index + 1}`}
                  placeholder={`Variant ${index + 1}`}
                  className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-[13px] font-normal outline-none focus:border-[#D97706]"
                />
              ))}
            </fieldset>
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
            <label className="block text-[12px] font-medium text-[#475569]">
              Izoh
              <textarea
                value={formValues.explanation}
                onChange={(event) => updateForm('explanation', event.target.value)}
                maxLength={300}
                rows={2}
                className="mt-1 w-full resize-y rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-[13px] font-normal outline-none focus:border-[#D97706]"
              />
            </label>
            <label className="block text-[12px] font-medium text-[#475569]">
              Manba
              <input
                value={formValues.source}
                onChange={(event) => updateForm('source', event.target.value)}
                maxLength={120}
                className="mt-1 w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-[13px] font-normal outline-none focus:border-[#D97706]"
              />
            </label>
            <label className="flex items-center gap-2 text-[12px] font-medium text-[#475569]">
              <input
                type="checkbox"
                checked={formValues.anonymous}
                onChange={(event) => updateForm('anonymous', event.target.checked)}
                className="h-4 w-4 accent-[#F59E0B]"
              />
              Anonim
            </label>
            {formError && <p role="alert" className="text-[12px] text-[#B91C1C]">{formError}</p>}
            <button
              type="submit"
              disabled={formSubmitting}
              className="w-full rounded-lg bg-[#F59E0B] px-3 py-2.5 text-[13px] font-semibold text-white hover:bg-[#D97706] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {formSubmitting ? 'Yuborilmoqda...' : 'Tekshiruvga yuborish'}
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
