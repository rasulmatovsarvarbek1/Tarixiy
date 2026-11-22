import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Clock3, X, Zap } from 'lucide-react';
import {
  clearQuizSession,
  getStoredQuizSession,
  storeQuizSession,
  testBoshlash,
  testHolat,
  testJavob,
  testTugat,
  kunlikTestHolati,
  imtihonHolati,
} from '../services/quizService';
import { refreshHolat } from '../lib/faollik';
import QuizDrakoBlink from '../components/QuizDrakoBlink';
import './QuizPage.css';

function xatoXabari(error) {
  if (error === 'kut') return 'Juda ko‘p urinish, biroz kuting';
  if (error === 'savol_yoq' || error === 'savol_yetarli_emas') return 'Bu mavzu uchun savollar hali tayyor emas';
  return 'Internetga ulanib qayta urinib ko‘ring';
}

export default function QuizPage({
  onNavigateHome,
  tur: initialTur = 'kunlik',
  darsId = null,
  levelId = null,
}) {
  const tur = initialTur;
  const [screen, setScreen] = useState('intro');
  const [sessionId, setSessionId] = useState(() => getStoredQuizSession());
  const [active, setActive] = useState(null);
  const [selected, setSelected] = useState(null);
  const [answerResult, setAnswerResult] = useState(null);
  const [remaining, setRemaining] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [daily, setDaily] = useState(null);
  const [examStatus, setExamStatus] = useState(null);
  const stoppedRef = useRef(false);

  const refreshXp = () => {
    void refreshHolat().catch(() => {});
  };

  useEffect(() => {
    let activeRequest = true;
    if (tur === 'kunlik') {
      kunlikTestHolati()
        .then((data) => activeRequest && setDaily(data))
        .catch(() => activeRequest && setDaily(null));
    }
    if (tur === 'imtihon' && levelId) {
      imtihonHolati(levelId)
        .then((data) => activeRequest && setExamStatus(data))
        .catch(() => activeRequest && setError('Internetga ulanib qayta urinib ko‘ring'));
    }
    return () => { activeRequest = false; };
  }, [tur, levelId]);

  useEffect(() => {
    if (!sessionId) return;
    let activeRequest = true;
    testHolat(sessionId)
      .then((data) => {
        if (!activeRequest) return;
        if (data?.ok && data.tugadi) {
          clearQuizSession();
          setSessionId(null);
          setResult(data.natija);
          setScreen('result');
          refreshXp();
        } else if (data?.ok) {
          setActive(data);
          setRemaining(Number(data.qolgan_soniya) || 0);
          setScreen('question');
        } else {
          clearQuizSession();
          setSessionId(null);
          setError(xatoXabari(data?.xato));
        }
      })
      .catch(() => activeRequest && setError('Internetga ulanib qayta urinib ko‘ring'));
    return () => { activeRequest = false; };
  }, [sessionId]);

  useEffect(() => {
    if (screen !== 'question' || !active || remaining <= 0 || answerResult) return undefined;
    const timer = window.setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          void submitAnswer(-1);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [screen, active?.savol?.id, remaining, answerResult]);

  useEffect(() => {
    if (tur !== 'imtihon' || screen !== 'question') return undefined;
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') void stopExam();
    };
    const onPop = () => void stopExam();
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('popstate', onPop);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('popstate', onPop);
    };
  }, [tur, screen, sessionId]);

  useEffect(() => {
    if (tur !== 'imtihon' || screen !== 'question') return undefined;
    const prevent = (event) => event.preventDefault();
    const oldUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = 'none';
    document.addEventListener('contextmenu', prevent);
    document.addEventListener('copy', prevent);
    document.addEventListener('cut', prevent);
    document.addEventListener('selectstart', prevent);
    return () => {
      document.body.style.userSelect = oldUserSelect;
      document.removeEventListener('contextmenu', prevent);
      document.removeEventListener('copy', prevent);
      document.removeEventListener('cut', prevent);
      document.removeEventListener('selectstart', prevent);
    };
  }, [tur, screen]);

  const startTest = async () => {
    if (loading) return;
    setLoading(true);
    setError('');
    setAnswerResult(null);
    setSelected(null);
    try {
      const data = await testBoshlash({ tur, darsId, levelId });
      if (!data?.ok) {
        setError(xatoXabari(data?.xato));
        setScreen('intro');
        return;
      }
      if (data.tugadi) {
        setResult(data.natija);
        setScreen('result');
        refreshXp();
        return;
      }
      storeQuizSession(data.sessiya_id);
      setSessionId(data.sessiya_id);
      setActive(data);
      setRemaining(Number(data.qolgan_soniya) || 0);
      setScreen('question');
    } catch {
      setError('Internetga ulanib qayta urinib ko‘ring');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (variant) => {
    if (!sessionId || !active?.savol || loading) return;
    setLoading(true);
    setError('');
    try {
      const data = await testJavob({
        sessiyaId: sessionId,
        savolId: active.savol.id,
        variant,
      });
      if (!data?.ok) {
        setError(xatoXabari(data?.xato));
        return;
      }
      setAnswerResult(data);
      refreshXp();
      if (data.tugadi) {
        clearQuizSession();
        setResult(data.natija);
        setSessionId(null);
      }
    } catch {
      setError('Internetga ulanib qayta urinib ko‘ring');
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (variant) => {
    if (selected !== null || answerResult || loading) return;
    setSelected(variant);
  };

  const goNext = () => {
    if (!answerResult) return;
    if (answerResult.tugadi) {
      setScreen('result');
      return;
    }
    if (answerResult.keyingi?.savol) {
      setActive((previous) => ({
        ...previous,
        joriy: answerResult.keyingi.joriy,
        qolgan_soniya: answerResult.keyingi.qolgan_soniya,
        savol: answerResult.keyingi.savol,
      }));
      setRemaining(Number(answerResult.keyingi.qolgan_soniya) || 0);
      setSelected(null);
      setAnswerResult(null);
    }
  };

  const stopExam = async () => {
    if (stoppedRef.current || !sessionId) return;
    stoppedRef.current = true;
    try {
      await testTugat(sessionId);
    } catch {
      // Foydalanuvchi xabari asosiy holatda saqlanadi.
    }
    clearQuizSession();
    setSessionId(null);
    setResult({ bekor: true });
    setScreen('stopped');
  };

  if (screen === 'stopped') {
    return (
      <main className="quiz-page page-transition">
        <section className="quiz-result-content">
          <h2>Imtihon to‘xtatildi</h2>
          <button type="button" className="quiz-primary-button" onClick={onNavigateHome}>Bosh sahifaga</button>
        </section>
      </main>
    );
  }

  if (screen === 'result' && result) {
    const passed = result.otdi;
    return (
      <main className="quiz-page page-transition">
        <header className="quiz-topbar">
          <span className="quiz-topbar-spacer" />
          <div className="quiz-topbar-title"><span className="quiz-eyebrow">NATIJA</span><h1>Test yakuni</h1></div>
          <span className="quiz-topbar-spacer" />
        </header>
        <section className="quiz-result-content">
          <div className="quiz-result-orbit"><Check size={33} /></div>
          <h2>{Number(result.foiz) || 0}<span>%</span></h2>
          <p className="quiz-result-kicker">{result.togri_soni}/{result.jami} to‘g‘ri javob</p>
          {Number(result.xp_jami) > 0 && <div className="quiz-xp-pill"><Zap size={18} fill="currentColor" /> +{result.xp_jami} XP</div>}
          {tur === 'imtihon' && (
            <p className="quiz-no-mistakes">{passed ? 'O‘tdi' : 'O‘tmadi, qayta urinib ko‘ring'}</p>
          )}
          <div className="quiz-result-actions">
            <button type="button" className="quiz-primary-button" onClick={onNavigateHome}>Bosh sahifaga</button>
            {!passed && (
              <button type="button" className="quiz-secondary-button" onClick={() => { setScreen('intro'); setResult(null); }}>Qayta urinish</button>
            )}
          </div>
        </section>
      </main>
    );
  }

  if (screen === 'question' && active?.savol) {
    const question = active.savol;
    const total = active.jami || 10;
    const current = Number(active.joriy) || 0;
    const submitted = Boolean(answerResult);
    return (
      <main className="quiz-page quiz-question-page page-transition">
        <header className="quiz-question-topbar">
          <div className="quiz-progress-track" aria-label={`Savol ${current + 1}, jami ${total}`}>
            {Array.from({ length: total }, (_, index) => (
              <span key={index} className={index <= current ? 'is-active' : ''} />
            ))}
          </div>
          <span className="quiz-question-count">{current + 1}/{total}</span>
          <span className="quiz-question-count"><Clock3 size={15} /> {remaining}s</span>
        </header>
        <section className="quiz-question-content">
          <h1>{question.matn}</h1>
          <div className="quiz-options">
            {(question.variantlar || []).map((variant) => {
              const isSelected = selected === variant.i;
              const isCorrect = submitted && answerResult.togri_variant === variant.i;
              const isWrong = submitted && isSelected && answerResult.togri_variant !== variant.i;
              return (
                <button
                  type="button"
                  className={`quiz-option${isCorrect ? ' is-correct' : ''}${isWrong ? ' is-wrong' : ''}`}
                  key={variant.i}
                  disabled={selected !== null || submitted || loading}
                  onClick={() => selectAnswer(variant.i)}
                >
                  <span className="quiz-option-letter">{String.fromCharCode(65 + variant.i)}</span>
                  <span>{variant.t}</span>
                  {isCorrect && <Check size={19} />}
                  {isWrong && <X size={19} />}
                </button>
              );
            })}
          </div>
          {selected !== null && !submitted && (
            <button type="button" className="quiz-primary-button quiz-next-button" disabled={loading} onClick={() => submitAnswer(selected)}>
              Javob berish
            </button>
          )}
        </section>
        {submitted && (
          <section className={`quiz-feedback${answerResult.togri ? ' is-correct' : ' is-wrong'}`}>
            <div className="quiz-feedback-copy">
              <strong>{answerResult.togri ? 'To‘g‘ri!' : (answerResult.vaqt_tugadi ? 'Vaqt tugadi' : 'Xato')}</strong>
              {answerResult.izoh && <p>{answerResult.izoh}</p>}
              {Number(answerResult.xp) > 0 && <p>+{answerResult.xp} XP</p>}
              <button className="quiz-primary-button quiz-next-button" type="button" onClick={goNext}>
                {answerResult.tugadi ? 'Natijani ko‘rish' : 'Keyingi'} <ArrowRight size={18} />
              </button>
            </div>
          </section>
        )}
        {error && <p className="quiz-storage-error" role="alert">{error}</p>}
      </main>
    );
  }

  return (
    <main className="quiz-page page-transition">
      <header className="quiz-topbar">
        <button className="quiz-icon-button" type="button" aria-label="Bosh sahifaga" onClick={onNavigateHome}><ArrowLeft size={21} /></button>
        <div className="quiz-topbar-title">
          <span className="quiz-eyebrow">{tur === 'imtihon' ? 'UNIT IMTIHONI' : tur === 'mini' ? 'DARS MINI-TESTI' : 'TARIXIY • HAR KUN YANGI'}</span>
          <h1>{tur === 'imtihon' ? 'Imtihon' : tur === 'mini' ? 'Mini-test' : 'Kunlik quiz'}</h1>
        </div>
        <span className="quiz-topbar-spacer" />
      </header>
      <section className="quiz-intro-content">
        {tur === 'imtihon' && examStatus && (
          <div className="quiz-completed-card">
            <div><strong>Eng yaxshi natija: {Number(examStatus.eng_yaxshi_foiz) || 0}%</strong><p>O‘tish: {Number(examStatus.otish_foiz) || 95}%</p></div>
          </div>
        )}
        {tur === 'imtihon' && examStatus?.tayyor === false ? (
          <p className="quiz-storage-error" role="status">Imtihon savollari tayyorlanmoqda</p>
        ) : (
          <>
            <div className="quiz-hero-card">
              <div className="quiz-hero-sparkle">✦</div>
              <div className="quiz-hero-copy">
                <span className="quiz-hero-tag"><Clock3 size={14} /> 2 DAQIQA</span>
                <h2>{tur === 'imtihon' ? 'Unit imtihoni' : tur === 'mini' ? 'Mini-test' : 'Bugungi mini-quiz'}</h2>
                <p>{tur === 'imtihon' ? 'Vaqt ichida savollarga javob bering.' : 'Bilimingizni sinab ko‘ring.'}</p>
              </div>
              <QuizDrakoBlink />
              <span className="quiz-hero-shape quiz-hero-shape-one" />
              <span className="quiz-hero-shape quiz-hero-shape-two" />
            </div>
            {tur === 'kunlik' && (
              <div className="quiz-intro-stats">
                <span><Check size={16} /> 10 savol</span>
                <i />
                <span><Clock3 size={16} /> ~2 daqiqa</span>
                <i />
                <span><Zap size={16} /> XP</span>
              </div>
            )}
            <button type="button" className="quiz-primary-button quiz-start-button" onClick={startTest} disabled={loading || (tur === 'imtihon' && examStatus?.tayyor === false)}>
              {loading ? 'Yuklanmoqda...' : 'Boshlaymiz'} <ArrowRight size={19} />
            </button>
            {tur === 'kunlik' && (
              <button type="button" className="quiz-history-link" aria-label="Quiz tarixi">
                <span className="quiz-history-link-icon"><Clock3 size={18} /></span>
                <span><strong>Tarix</strong><small>Oldingi kunlardagi natijalar</small></span>
                <ArrowRight size={19} />
              </button>
            )}
            {tur === 'kunlik' && (
              <p className="quiz-daily-note"><span>✦</span> Har kuni yangi 10 ta savol</p>
            )}
            <div className="quiz-footer-mark">TARIXIY <span>•</span> BILIM SARI HAR KUN</div>
          </>
        )}
        {error && <p className="quiz-storage-error" role="alert">{error}</p>}
      </section>
    </main>
  );
}
