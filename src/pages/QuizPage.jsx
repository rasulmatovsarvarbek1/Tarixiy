import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Flame,
  History,
  X,
  Zap,
} from 'lucide-react';
import {
  getAttempts,
  getDailyQuestions,
  getTodayQuizDate,
  saveAttempt,
} from '../services/quizService';
import QuizDrakoBlink from '../components/QuizDrakoBlink';
import './QuizPage.css';

function formatDate(date) {
  const [year, month, day] = date.split('-').map(Number);
  const monthNames = [
    'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
    'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr',
  ];
  return `${day}-${monthNames[month - 1]} ${year}`;
}

function streakCount(attempts, today) {
  const completed = new Set(attempts.map((attempt) => attempt.date));
  const cursor = new Date(`${today}T12:00:00`);
  let count = 0;
  while (completed.has(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`)) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

function answerSnapshot(question, selectedIndex) {
  return {
    questionId: question.id,
    type: question.type,
    text: question.text,
    options: question.options,
    correctIndex: question.correctIndex,
    selectedIndex,
    explanation: question.explanation,
    unitId: question.unitId,
    lessonId: question.lessonId,
    difficulty: question.difficulty,
  };
}

function loadAttempts() {
  try {
    return { attempts: getAttempts(), error: '' };
  } catch (error) {
    console.error('Quiz tarixini yuklab bo‘lmadi:', error);
    return {
      attempts: [],
      error: 'Quiz tarixini yuklab bo‘lmadi. Brauzer xotirasini tekshiring.',
    };
  }
}

function Drako({ isCorrect }) {
  return (
    <img
      className="quiz-drako"
      src={isCorrect ? '/drako-image/drako1.png' : '/drako-image/drako-quizX.png'}
      alt="Drako"
    />
  );
}

function MiniProgress({ score, total }) {
  return (
    <span className="quiz-mini-progress" aria-label={`${score}/${total} to‘g‘ri javob`}>
      {Array.from({ length: total }, (_, index) => (
        <i key={index} className={index < score ? 'is-correct' : ''} />
      ))}
    </span>
  );
}

function AnswerReview({ answers }) {
  return (
    <div className="quiz-review-list">
      {answers.map((answer, index) => (
        <article className="quiz-review-card" key={`${answer.questionId}-${index}`}>
          <div className="quiz-review-heading">
            <span className="quiz-review-number">{index + 1}</span>
            <p>{answer.text}</p>
          </div>
          <p className="quiz-review-answer is-wrong">
            Sizning javobingiz: {answer.options[answer.selectedIndex]}
          </p>
          <p className="quiz-review-answer is-right">
            To‘g‘ri javob: {answer.options[answer.correctIndex]}
          </p>
          <p className="quiz-review-explanation">{answer.explanation}</p>
        </article>
      ))}
    </div>
  );
}

export default function QuizPage({ onNavigateHome }) {
  const today = getTodayQuizDate();
  const questions = useMemo(() => getDailyQuestions(today), [today]);
  const [attemptState, setAttemptState] = useState(loadAttempts);
  const { attempts, error: storageError } = attemptState;
  const [screen, setScreen] = useState('intro');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [questionSelections, setQuestionSelections] = useState({});
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [exitCountdown, setExitCountdown] = useState(3);

  const todayAttempt = attempts.find((attempt) => attempt.date === today);
  const question = questions[questionIndex];

  useEffect(() => {
    if (!showExitConfirm) return undefined;

    const intervalId = window.setInterval(() => {
      setExitCountdown((countdown) => {
        if (countdown <= 1) {
          window.clearInterval(intervalId);
          return 0;
        }
        return countdown - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [showExitConfirm]);

  const startQuiz = () => {
    setQuestionIndex(0);
    setSelectedIndex(null);
    setQuestionSelections({});
    setShowReview(false);
    setScreen('question');
  };

  const goToNextQuestion = () => {
    if (selectedIndex === null) return;
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((index) => index + 1);
      setSelectedIndex(null);
      return;
    }

    const answers = questions.map((item, index) => answerSnapshot(
      item,
      index === questionIndex ? selectedIndex : questionSelections[index],
    ));
    const score = answers.filter((answer) => answer.selectedIndex === answer.correctIndex).length;
    try {
      const saved = saveAttempt({ date: today, score, total: questions.length, answers });
      if (saved) awardXp(5);
      setAttemptState({ attempts: getAttempts(), error: '' });
      setScreen('result');
    } catch (error) {
      console.error('Quiz natijasini saqlab bo‘lmadi:', error);
      setAttemptState((previous) => ({
        ...previous,
        error: 'Natijani saqlab bo‘lmadi. Iltimos, qayta urinib ko‘ring.',
      }));
    }
  };

  const selectAnswer = (index) => {
    if (selectedIndex !== null) return;
    setSelectedIndex(index);
    setQuestionSelections((previous) => ({ ...previous, [questionIndex]: index }));
  };

  const historyAttempts = attempts.filter((attempt) => attempt.date < today);
  const incorrectAnswers = (todayAttempt?.answers || []).filter(
    (answer) => answer.selectedIndex !== answer.correctIndex,
  );
  const currentStreak = streakCount(attempts, today);

  if (showHistory) {
    return (
      <main className="quiz-page page-transition">
        <header className="quiz-topbar">
          <button className="quiz-icon-button" type="button" aria-label="Tarixdan qaytish" onClick={() => {
            if (selectedAttempt) {
              setSelectedAttempt(null);
            } else {
              setShowHistory(false);
            }
          }}>
            <ArrowLeft size={21} />
          </button>
          <div className="quiz-topbar-title">
            <span className="quiz-eyebrow">MINI-QUIZ</span>
            <h1>{selectedAttempt ? formatDate(selectedAttempt.date) : 'Quiz tarixi'}</h1>
          </div>
          <span className="quiz-topbar-spacer" />
        </header>

        {selectedAttempt ? (
          <section className="quiz-history-detail">
            <div className="quiz-history-score">
              <span>{selectedAttempt.score}/{selectedAttempt.total}</span>
              <MiniProgress score={selectedAttempt.score} total={selectedAttempt.total} />
            </div>
            <AnswerReview answers={selectedAttempt.answers || []} />
          </section>
        ) : (
          <section className="quiz-history-content">
            <p className="quiz-section-caption">Oldingi kunlardagi natijalaringiz</p>
            {historyAttempts.length === 0 ? (
              <div className="quiz-empty-state">
                <History size={28} />
                <strong>Hozircha tarix bo‘sh</strong>
                <span>Yechilgan quizlaringiz shu yerda ko‘rinadi.</span>
              </div>
            ) : historyAttempts.map((attempt) => (
              <button
                type="button"
                className="quiz-history-row"
                key={attempt.date}
                onClick={() => setSelectedAttempt(attempt)}
              >
                <span className="quiz-history-date-icon"><CalendarDays size={18} /></span>
                <span className="quiz-history-row-copy">
                  <strong>{formatDate(attempt.date)}</strong>
                  <MiniProgress score={attempt.score} total={attempt.total} />
                </span>
                <span className="quiz-history-result">{attempt.score}/{attempt.total}</span>
                <ChevronRight size={19} />
              </button>
            ))}
          </section>
        )}
      </main>
    );
  }

  if (screen === 'question') {
    return (
      <main className="quiz-page quiz-question-page page-transition">
        <header className="quiz-question-topbar">
          <div className="quiz-progress-track" aria-label={`Savol ${questionIndex + 1}, jami ${questions.length}`}>
            {questions.map((item, index) => (
              <span key={item.id} className={index <= questionIndex ? 'is-active' : ''} />
            ))}
          </div>
          <span className="quiz-question-count">{questionIndex + 1}/{questions.length}</span>
          <button className="quiz-icon-button quiz-close-button" type="button" aria-label="Yopish" onClick={() => {
            setExitCountdown(3);
            setShowExitConfirm(true);
          }}>
            <X size={21} />
          </button>
        </header>

        <section className="quiz-question-content">
          <div className="quiz-question-label"><span>BUGUNGI SAVOL</span><span>{question.type === 'tf' ? 'TO‘G‘RI / NOTO‘G‘RI' : question.type === 'year' ? 'YILNI TOPING' : 'TEST'}</span></div>
          <h1>{question.text}</h1>
          <div className="quiz-options">
            {question.options.map((option, index) => {
              const isSelected = selectedIndex === index;
              const isCorrect = selectedIndex !== null && index === question.correctIndex;
              const isWrong = isSelected && index !== question.correctIndex;
              return (
                <button
                  type="button"
                  className={`quiz-option${isCorrect ? ' is-correct' : ''}${isWrong ? ' is-wrong' : ''}`}
                  key={option}
                  disabled={selectedIndex !== null}
                  onClick={() => selectAnswer(index)}
                >
                  <span className="quiz-option-letter">{question.type === 'tf' ? (index === 0 ? '✓' : '×') : String.fromCharCode(65 + index)}</span>
                  <span>{option}</span>
                  {isCorrect && <Check size={19} />}
                  {isWrong && <X size={19} />}
                </button>
              );
            })}
          </div>
        </section>

        {selectedIndex !== null && (
          <section className={`quiz-feedback${selectedIndex === question.correctIndex ? ' is-correct' : ' is-wrong'}`}>
            <div className="quiz-feedback-mascot"><Drako isCorrect={selectedIndex === question.correctIndex} /></div>
            <div className="quiz-feedback-copy">
              <strong>{selectedIndex === question.correctIndex ? 'Ajoyib!' : 'To‘g‘ri javob'}</strong>
              <p>{question.explanation}</p>
              <button className="quiz-primary-button quiz-next-button" type="button" onClick={goToNextQuestion}>
                {questionIndex === questions.length - 1 ? 'Natijani ko‘rish' : 'Keyingi'}
                <ArrowRight size={18} />
              </button>
            </div>
          </section>
        )}
        {showExitConfirm && (
          createPortal(
            <div className="quiz-exit-overlay">
              <section
                className="quiz-exit-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="quiz-exit-title"
              >
                <h2 id="quiz-exit-title">Haqiqatdan ham chiqishni xohlaysizmi?</h2>
                <div className="quiz-exit-actions">
                  <button
                    className="quiz-exit-button quiz-exit-confirm"
                    type="button"
                    disabled={exitCountdown > 0}
                    onClick={onNavigateHome}
                  >
                    {exitCountdown > 0 && <span aria-live="polite">{exitCountdown}</span>}
                    HA
                  </button>
                  <button
                    className="quiz-exit-button quiz-exit-cancel"
                    type="button"
                    onClick={() => setShowExitConfirm(false)}
                  >
                    YO‘Q
                  </button>
                </div>
              </section>
            </div>,
            document.body,
          )
        )}
        {storageError && <p className="quiz-storage-error" role="alert">{storageError}</p>}
      </main>
    );
  }

  if (screen === 'result' && todayAttempt) {
    return (
      <main className="quiz-page page-transition">
        <header className="quiz-topbar">
          <span className="quiz-topbar-spacer" />
          <div className="quiz-topbar-title">
            <span className="quiz-eyebrow">BUGUNGI MINI-QUIZ</span>
            <h1>Natija</h1>
          </div>
          <span className="quiz-topbar-spacer" />
        </header>
        <section className="quiz-result-content">
          <div className="quiz-result-orbit"><Check size={33} /></div>
          <p className="quiz-result-kicker">Barakalla, yakunladingiz!</p>
          <h2>{todayAttempt.score}<span>/{todayAttempt.total}</span></h2>
          <div className="quiz-xp-pill"><Zap size={18} fill="currentColor" /> +5 XP</div>
          <div className="quiz-streak-card">
            <div className="quiz-streak-icon"><Flame size={23} fill="currentColor" /></div>
            <div><strong>{currentStreak} kunlik streak</strong><span>Har kuni quiz yechib davom eting</span></div>
            <span className="quiz-streak-dots">✦ ✦ ✦</span>
          </div>
          <div className="quiz-result-progress">
            <span>Bugungi natijangiz</span>
            <MiniProgress score={todayAttempt.score} total={todayAttempt.total} />
          </div>
          <div className="quiz-result-actions">
            <button type="button" className="quiz-primary-button" onClick={onNavigateHome}>Bosh sahifaga</button>
            <button type="button" className="quiz-secondary-button" onClick={() => setShowReview(true)}>
              Xatolarni ko‘rish <ArrowRight size={17} />
            </button>
          </div>
          {showReview && (
            <div className="quiz-review-section">
              <div className="quiz-inline-heading">
                <div><span className="quiz-eyebrow">TAKRORLASH</span><h3>Xatolar ustida ishlaymiz</h3></div>
                <button type="button" aria-label="Xatolarni yopish" onClick={() => setShowReview(false)}><X size={19} /></button>
              </div>
              {incorrectAnswers.length > 0
                ? <AnswerReview answers={incorrectAnswers} />
                : <p className="quiz-no-mistakes">Ajoyib! Barcha savollarga to‘g‘ri javob berdingiz.</p>}
            </div>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="quiz-page page-transition">
      <header className="quiz-topbar">
        <button className="quiz-icon-button" type="button" aria-label="Bosh sahifaga" onClick={onNavigateHome}>
          <ArrowLeft size={21} />
        </button>
        <div className="quiz-topbar-title">
          <span className="quiz-eyebrow">TARIXIY • HAR KUN YANGI</span>
          <h1>Kunlik quiz</h1>
        </div>
        <span className="quiz-topbar-spacer" />
      </header>

      <section className="quiz-intro-content">
        <div className="quiz-hero-card">
          <div className="quiz-hero-sparkle">✦</div>
          <div className="quiz-hero-copy">
            <span className="quiz-hero-tag"><Clock3 size={14} /> 2 DAQIQA</span>
            <h2>Bugungi mini-quiz</h2>
            <p>Bilimingizni sinab ko‘ring va streakni davom ettiring.</p>
          </div>
          <QuizDrakoBlink />
          <span className="quiz-hero-shape quiz-hero-shape-one" />
          <span className="quiz-hero-shape quiz-hero-shape-two" />
        </div>

        <div className="quiz-intro-stats">
          <span><Check size={16} /> 5 savol</span>
          <i />
          <span><Clock3 size={16} /> ~2 daqiqa</span>
          <i />
          <span><Zap size={16} /> +5 XP</span>
        </div>

        {todayAttempt ? (
          <div className="quiz-completed-card">
            <div className="quiz-completed-icon"><Check size={22} /></div>
            <div>
              <strong>Bugungi quiz bajarildi</strong>
              <p>{todayAttempt.score}/{todayAttempt.total}, +5 XP</p>
              <span>Yangi test ertaga</span>
            </div>
          </div>
        ) : (
          <button type="button" className="quiz-primary-button quiz-start-button" onClick={startQuiz} disabled={Boolean(storageError)}>
            Boshlaymiz <ArrowRight size={19} />
          </button>
        )}
        {storageError && <p className="quiz-storage-error" role="alert">{storageError}</p>}

        <button type="button" className="quiz-history-link" onClick={() => setShowHistory(true)}>
          <span className="quiz-history-link-icon"><History size={18} /></span>
          <span><strong>Tarix</strong><small>Oldingi kunlardagi natijalar</small></span>
          <ChevronRight size={19} />
        </button>
        <p className="quiz-daily-note"><span>✦</span> Har kuni yangi 5 ta savol</p>
      </section>
      <div className="quiz-footer-mark">TARIXIY <span>•</span> BILIM SARI HAR KUN</div>
    </main>
  );
}

// Hozirgi loyihada kunlik XP berish mexanizmi mavjud emas.
function awardXp() {}
