import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, RotateCcw, Swords, Timer } from 'lucide-react';
import { useLanguage } from '../lib/language';

const GAME_QUESTIONS = [
  {
    question: 'Qadimgi Misrda podshohlar qanday atalgan?',
    options: ["Fir'avn", 'Xoqon', 'Shahanshoh'],
    answer: "Fir'avn",
  },
  {
    question: "Mixxat yozuvi qaysi qadimgi o'lkada paydo bo'lgan?",
    options: ["Ikki daryo oralig'i (Mesopotamiya)", 'Qadimgi Rim', 'Qadimgi Yunoniston'],
    answer: "Ikki daryo oralig'i (Mesopotamiya)",
  },
  {
    question: "Olimpiya o'yinlari ilk bor qaysi davlatda o'tkazilgan?",
    options: ['Qadimgi Yunoniston', 'Qadimgi Xitoy', 'Qadimgi Misr'],
    answer: 'Qadimgi Yunoniston',
  },
  {
    question: 'Buyuk Xitoy devori qanday maqsadda qurilgan?',
    options: [
      'Shimoldagi ko‘chmanchi qabilalardan himoyalanish uchun',
      'Savdo karvonlarini joylashtirish uchun',
      'Daryo suvini boshqarish uchun',
    ],
    answer: 'Shimoldagi ko‘chmanchi qabilalardan himoyalanish uchun',
  },
  {
    question: 'Qadimgi Rimda qonunlar yozib qo‘yilgan mashhur mis lavhalar nima deb atalgan?',
    options: ["O'n ikki jadval qonunlari", 'Hammurapi qonunlari', 'Avesto'],
    answer: "O'n ikki jadval qonunlari",
  },
  {
    question: "Qog'oz ixtiro qilingan qadimgi mamlakat qaysi?",
    options: ['Xitoy', 'Hindiston', 'Misr'],
    answer: 'Xitoy',
  },
  {
    question: "Qadimgi Baqtriya va So'g'diyona hududlari hozirgi qaysi mintaqaga to'g'ri keladi?",
    options: ['Markaziy Osiyo', 'Kichik Osiyo', 'Pireney yarimoroli'],
    answer: 'Markaziy Osiyo',
  },
  {
    question: '"Avesto" qaysi qadimiy dinning muqaddas kitobi hisoblanadi?',
    options: ['Zardushtiylik', 'Buddaviylik', 'Shintoizm'],
    answer: 'Zardushtiylik',
  },
  {
    question: "Qadimgi Hindistonda jamiyatning an'anaviy tabaqalari qanday nomlangan?",
    options: ['Varna va kastalar', 'Patritsiylar va plebeylar', 'Satraplar'],
    answer: 'Varna va kastalar',
  },
  {
    question: 'Qadimgi Dunyoning "Yetti mo\'jizasi"dan qaysi biri bugungi kungacha deyarli butun holda saqlanib qolgan?',
    options: ['Xeops piramidasi', 'Koloss Rodoslik', 'Artemida ibodatxonasi'],
    answer: 'Xeops piramidasi',
  },
];

const GAME_IMAGE_NAMES = [
  'kirish',
  'game-banner',
  'bg-arena',
  'knight1',
  'knight2',
  'knight3',
  'knight4',
  'drogon1',
  'drogon2',
  'drogon3',
  'drogon4',
];
let gameImagesPromise;

function preloadGameImages() {
  if (!gameImagesPromise) {
    gameImagesPromise = Promise.all(GAME_IMAGE_NAMES.map((name) => new Promise((resolve) => {
      const image = new Image();
      image.onload = resolve;
      image.onerror = () => {
        if (image.src.endsWith('.png')) {
          image.src = `/game-images/${name}.jpg`;
        } else {
          resolve();
        }
      };
      image.src = `/game-images/${name}.png`;
    })));
  }

  return gameImagesPromise;
}

function shuffleOptions(options, answer, answerPosition = Math.floor(Math.random() * options.length)) {
  const distractors = options.filter((option) => option !== answer);

  for (let index = distractors.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [distractors[index], distractors[swapIndex]] = [distractors[swapIndex], distractors[index]];
  }

  distractors.splice(answerPosition, 0, answer);
  return distractors;
}

function GameImage({ name, alt, className = '', style = {} }) {
  const [extension, setExtension] = useState('png');
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    <img
      src={`/game-images/${name}.${extension}`}
      alt={alt}
      className={className}
      style={style}
      onError={() => {
        if (extension === 'png') setExtension('jpg');
        else setFailed(true);
      }}
    />
  );
}

function GameCard({ onPlay }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
      <GameImage
        name="game-banner"
        alt="Ritser va Ajdar o‘yini"
        className="h-44 w-full object-cover"
      />
      <div className="flex items-center justify-between gap-3 p-4">
        <h2 className="min-w-0 text-base font-bold text-[#0F172A]">Ritser va Ajdar</h2>
        <button
          type="button"
          onClick={onPlay}
          className="shrink-0 rounded-xl bg-[#1F7A45] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#176238] active:scale-[0.98]"
        >
          O‘ynash
        </button>
      </div>
    </article>
  );
}

function HealthPanel({ label, health, align = 'left' }) {
  return (
    <div className={`w-[36%] rounded-xl border border-white/15 bg-slate-950/75 p-2 text-white shadow-lg backdrop-blur-sm ${align === 'right' ? 'text-right' : ''}`}>
      <div className="flex items-center justify-between gap-1 text-[10px] font-extrabold tracking-wider">
        {align === 'right' && <span className="text-rose-300">{health}/10</span>}
        <span>{label}</span>
        {align !== 'right' && <span className="text-emerald-300">{health}/10</span>}
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/20">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${align === 'right' ? 'ml-auto bg-rose-500' : 'bg-emerald-400'}`}
          style={{ width: `${health * 10}%` }}
        />
      </div>
    </div>
  );
}

function ArenaEffects({ action }) {
  if (action === 'knight-attack') {
    return (
      <>
        <div className="arena-flash arena-flash-dragon" />
        <svg className="lightning-effect" viewBox="0 0 120 180" aria-hidden="true">
          <path d="M66 4 25 94h29l-9 80 51-105H66z" />
        </svg>
      </>
    );
  }

  if (action === 'dragon-attack') {
    return (
      <>
        <div className="arena-flash arena-flash-knight" />
        <svg className="fire-effect" viewBox="0 0 300 120" aria-hidden="true">
          <path d="M300 60C235 4 164 5 88 34c34 3 48 10 66 23-38-11-89-8-142 3 53 11 104 14 142 3-18 13-32 20-66 23 76 29 147 30 212-26Z" />
          <path className="fire-core" d="M300 60c-66-26-123-22-191 0 68 22 125 26 191 0Z" />
        </svg>
      </>
    );
  }

  return null;
}

function getWinner(knightHealth, dragonHealth, correctAnswers) {
  if (dragonHealth === 0) return 'knight';
  if (knightHealth === 0) return 'dragon';
  if (knightHealth !== dragonHealth) return knightHealth > dragonHealth ? 'knight' : 'dragon';
  return correctAnswers >= GAME_QUESTIONS.length / 2 ? 'knight' : 'dragon';
}

function KnightDragonGame({ onBack, onRestart, sessionKey }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [knightHealth, setKnightHealth] = useState(10);
  const [dragonHealth, setDragonHealth] = useState(10);
  const [secondsLeft, setSecondsLeft] = useState(15);
  const [phase, setPhase] = useState('intro');
  const [action, setAction] = useState('idle');
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [result, setResult] = useState(null);
  const [answerOptions, setAnswerOptions] = useState(() => (
    shuffleOptions(GAME_QUESTIONS[0].options, GAME_QUESTIONS[0].answer)
  ));
  const phaseRef = useRef('playing');
  const phaseTimeoutRef = useRef(null);
  const loadingRunRef = useRef(0);
  const swordAudioRef = useRef(null);
  const swordStopTimeoutRef = useRef(null);
  const question = GAME_QUESTIONS[questionIndex];

  const changePhase = useCallback((nextPhase) => {
    phaseRef.current = nextPhase;
    setPhase(nextPhase);
  }, []);

  useEffect(() => {
    swordAudioRef.current = new Audio('/game-sounds/sword-slash.mp3');
    swordAudioRef.current.load();
  }, []);

  const playSwordSlash = useCallback(() => {
    if (!swordAudioRef.current) {
      swordAudioRef.current = new Audio('/game-sounds/sword-slash.mp3');
    }

    const swordAudio = swordAudioRef.current;
    if (swordStopTimeoutRef.current) {
      window.clearTimeout(swordStopTimeoutRef.current);
    }

    swordAudio.pause();
    swordAudio.currentTime = 0;
    swordAudio.play().catch(() => {});

    swordStopTimeoutRef.current = window.setTimeout(() => {
      swordAudio.pause();
      swordAudio.currentTime = 0;
      swordStopTimeoutRef.current = null;
    }, 1500);
  }, []);

  useEffect(() => {
    if (phase !== 'playing') return undefined;
    const intervalId = window.setInterval(() => {
      setSecondsLeft((remaining) => Math.max(0, remaining - 1));
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [phase, questionIndex, sessionKey]);

  useEffect(() => () => {
    loadingRunRef.current += 1;
    if (phaseTimeoutRef.current) window.clearTimeout(phaseTimeoutRef.current);
    if (swordStopTimeoutRef.current) window.clearTimeout(swordStopTimeoutRef.current);
    if (swordAudioRef.current) {
      swordAudioRef.current.pause();
      swordAudioRef.current.currentTime = 0;
    }
  }, []);

  const startGame = async () => {
    const loadingRun = loadingRunRef.current + 1;
    loadingRunRef.current = loadingRun;
    changePhase('loading');
    await Promise.all([
      preloadGameImages(),
      new Promise((resolve) => window.setTimeout(resolve, 3000)),
    ]);
    if (loadingRunRef.current !== loadingRun) return;
    setSecondsLeft(15);
    setAction('idle');
    changePhase('playing');
  };

  const resolveAnswer = useCallback((answer, timedOut = false) => {
    if (phaseRef.current !== 'playing') return;

    setSelectedAnswer(answer);
    changePhase('resolving');
    const correct = !timedOut && answer === question.answer;
    const nextCorrectAnswers = correctAnswers + (correct ? 1 : 0);
    const nextIncorrectAnswers = incorrectAnswers + (correct ? 0 : 1);
    const nextKnightHealth = Math.max(0, knightHealth - (correct ? 0 : 1));
    const nextDragonHealth = Math.max(0, dragonHealth - (correct ? 1 : 0));
    const lastQuestion = questionIndex === GAME_QUESTIONS.length - 1;
    const finished = nextKnightHealth === 0 || nextDragonHealth === 0 || lastQuestion;

    setCorrectAnswers(nextCorrectAnswers);
    setIncorrectAnswers(nextIncorrectAnswers);
    setKnightHealth(nextKnightHealth);
    setDragonHealth(nextDragonHealth);
    setAction(correct ? 'knight-attack' : 'dragon-attack');
    if (correct) playSwordSlash();

    const advanceAfterAnimation = () => {
      if (finished) {
        const winner = getWinner(nextKnightHealth, nextDragonHealth, nextCorrectAnswers);
        setAction(winner === 'knight' ? 'knight-victory' : 'dragon-victory');
        setResult({
          winner,
          correct: nextCorrectAnswers,
          incorrect: nextIncorrectAnswers,
          unanswered: GAME_QUESTIONS.length - nextCorrectAnswers - nextIncorrectAnswers,
        });
        changePhase('finished');
        return;
      }

      const nextQuestion = GAME_QUESTIONS[questionIndex + 1];
      const nextAnswerPosition = (answerOptions.indexOf(question.answer) + 1) % nextQuestion.options.length;
      setAnswerOptions(shuffleOptions(nextQuestion.options, nextQuestion.answer, nextAnswerPosition));
      setQuestionIndex((index) => index + 1);
      setSelectedAnswer(null);
      setSecondsLeft(15);
      setAction('idle');
      changePhase('playing');
    };

    phaseTimeoutRef.current = window.setTimeout(advanceAfterAnimation, 1100);
  }, [
    answerOptions,
    changePhase,
    correctAnswers,
    dragonHealth,
    incorrectAnswers,
    knightHealth,
    playSwordSlash,
    question.answer,
    questionIndex,
  ]);

  useEffect(() => {
    if (phase === 'playing' && secondsLeft === 0) {
      resolveAnswer(null, true);
    }
  }, [phase, secondsLeft, resolveAnswer]);

  const knightImage = action === 'knight-victory'
    ? 'knight4'
    : action === 'knight-attack'
      ? 'knight2'
      : action === 'dragon-attack'
        ? 'knight3'
        : 'knight1';
  const dragonImage = action === 'dragon-victory'
    ? 'drogon4'
    : action === 'dragon-attack'
      ? 'drogon2'
      : action === 'knight-attack'
        ? 'drogon3'
        : 'drogon1';

  if (phase === 'intro') {
    return (
      <div
        className="fixed inset-0 z-[110] flex h-[100dvh] flex-col items-center justify-between overflow-hidden bg-[#F8FAFC] px-5 text-[#0F172A]"
        style={{
          paddingTop: 'max(16px, env(safe-area-inset-top))',
          paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        }}
      >
        <h1 className="shrink-0 pt-3 text-center text-3xl font-black tracking-tight text-[#0F172A]">
          Ritser va Ajdar
        </h1>
        <GameImage
          name="kirish"
          alt="Ritser va Ajdar"
          className="min-h-0 w-full flex-1 object-contain py-5"
        />
        <button
          type="button"
          onClick={startGame}
          className="w-full shrink-0 rounded-2xl bg-[#1F7A45] px-5 py-4 text-lg font-extrabold text-white shadow-lg transition-colors hover:bg-[#176238] active:scale-[0.98]"
        >
          Boshlash
        </button>
      </div>
    );
  }

  if (phase === 'loading') {
    return (
      <div className="fixed inset-0 z-[110] flex h-[100dvh] items-center justify-center bg-[#3D4337]">
        <div
          role="status"
          aria-label="Yuklanmoqda"
          className="h-12 w-12 animate-spin rounded-full border-[5px] border-white/25 border-t-white"
        />
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex h-[100dvh] flex-col gap-2 overflow-hidden bg-[#F8FAFC] px-3 text-[#0F172A]"
      style={{
        paddingTop: 'max(8px, env(safe-area-inset-top))',
        paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
      }}
    >
      <style>{`
        @keyframes game-knight-strike { 0%, 100% { transform: translateX(0) scale(1); } 38% { transform: translateX(20px) scale(1.06); } }
        @keyframes game-dragon-strike { 0%, 100% { transform: translateX(0) scale(1); } 38% { transform: translateX(-18px) scale(1.05); } }
        @keyframes game-hurt { 0%, 100% { transform: translateX(0); filter: none; } 20%, 60% { transform: translateX(-7px); filter: brightness(1.8) saturate(1.5); } 40%, 80% { transform: translateX(7px); filter: brightness(1.8) saturate(1.5); } }
        @keyframes game-dragon-hurt { 0%, 100% { transform: translateX(0); filter: none; } 20%, 60% { transform: translateX(-7px); filter: brightness(1.8) saturate(1.5); } 40%, 80% { transform: translateX(7px); filter: brightness(1.8) saturate(1.5); } }
        @keyframes game-lightning { 0% { opacity: 0; transform: scale(.4); } 20% { opacity: 1; transform: scale(1.15); } 40% { opacity: .8; transform: scale(.9); } 100% { opacity: 0; transform: scale(1); } }
        @keyframes game-fire { 0% { opacity: 0; transform: scaleX(.1); } 25% { opacity: 1; transform: scaleX(1.05); } 100% { opacity: 0; transform: scaleX(1); } }
        @keyframes game-flash { 0%, 100% { opacity: 0; } 25%, 55% { opacity: .55; } }
        .knight-attack { animation: game-knight-strike .65s ease-out; }
        .dragon-attack { animation: game-dragon-strike .65s ease-out; }
        .knight-hurt { animation: game-hurt .55s ease-out; }
        .dragon-hurt { animation: game-dragon-hurt .55s ease-out; }
        .lightning-effect { position: absolute; z-index: 20; left: 52%; top: 24%; width: 23%; height: 43%; fill: #fff6a5; filter: drop-shadow(0 0 10px #fef08a) drop-shadow(0 0 22px #38bdf8); animation: game-lightning .7s ease-out both; }
        .fire-effect { position: absolute; z-index: 20; left: 17%; top: 43%; width: 42%; height: 26%; overflow: visible; fill: #f97316; filter: drop-shadow(0 0 10px #fb923c) drop-shadow(0 0 20px #ef4444); transform-origin: right center; animation: game-fire .75s ease-out both; }
        .fire-core { fill: #fde68a; }
        .arena-flash { position: absolute; z-index: 15; inset: 0; pointer-events: none; background: radial-gradient(ellipse at center, rgba(248, 60, 35, .52), transparent 68%); animation: game-flash .5s ease-out both; }
        .arena-flash-dragon { clip-path: ellipse(38% 55% at 76% 57%); }
        .arena-flash-knight { clip-path: ellipse(38% 55% at 25% 57%); }
        @media (prefers-reduced-motion: reduce) {
          .knight-attack, .dragon-attack, .knight-hurt, .dragon-hurt, .lightning-effect, .fire-effect, .arena-flash { animation-duration: .01ms !important; }
        }
      `}</style>

      <div className="flex shrink-0 items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-xl px-2 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 active:scale-[0.98]"
        >
          <ArrowLeft size={18} />
          Ortga
        </button>
        <span className="text-xs font-bold tracking-wide text-slate-500">
          SAVOL {questionIndex + 1}/{GAME_QUESTIONS.length}
        </span>
      </div>

      <section className="relative isolate min-h-0 flex-[4] overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-lg">
        <GameImage
          name="bg-arena"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ zIndex: 0 }}
        />
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-slate-950/30 via-transparent to-slate-950/80" />

        <div className="absolute inset-x-2 top-2 z-30 flex items-start justify-between gap-1">
          <HealthPanel label="RITSER" health={knightHealth} />
          <div className="flex min-w-[52px] flex-col items-center rounded-xl border border-white/15 bg-slate-950/80 px-2 py-1.5 text-white shadow-lg backdrop-blur-sm">
            <Timer size={15} className={secondsLeft <= 5 && phase === 'playing' ? 'animate-pulse text-rose-300' : 'text-amber-300'} />
            <span className={`mt-0.5 text-lg font-black leading-none ${secondsLeft <= 5 && phase === 'playing' ? 'text-rose-300' : ''}`}>{secondsLeft}</span>
          </div>
          <HealthPanel label="DRAGON" health={dragonHealth} align="right" />
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 h-[58%]">
          <div className="absolute bottom-0 left-0 h-[88%] w-[45%]">
            <GameImage
              name={knightImage}
              alt="Ritser"
              className={`h-full w-full object-contain object-bottom ${action === 'knight-attack' ? 'knight-attack' : action === 'dragon-attack' ? 'knight-hurt' : ''}`}
            />
          </div>
          <div className="absolute bottom-0 right-0 h-[88%] w-[45%]">
            <GameImage
              name={dragonImage}
              alt="Ajdar"
              className={`h-full w-full object-contain object-bottom ${action === 'dragon-attack' ? 'dragon-attack' : action === 'knight-attack' ? 'dragon-hurt' : ''}`}
            />
          </div>
        </div>
        <ArenaEffects action={action} />

      </section>

      <section className="flex min-h-0 flex-[5] flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-3 shadow-sm">
        <div className="mb-1.5 flex shrink-0 items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-[#9A7A3B]">
          <Swords size={16} />
          Tarix jangi
        </div>
        <h1 className="shrink-0 text-sm font-extrabold leading-snug text-[#0F172A]">{question.question}</h1>
        <div className="mt-2 flex min-h-0 flex-1 flex-col gap-2">
          {answerOptions.map((option, index) => (
            (() => {
              const isSelected = selectedAnswer === option;
              const isCorrect = phase === 'resolving' && option === question.answer;
              const isIncorrect = isSelected && option !== question.answer;
              const optionStateClass = isCorrect
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                : isIncorrect
                  ? 'border-rose-300 bg-rose-50 text-rose-700'
                  : 'border-slate-200 bg-slate-50 text-slate-700';

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => resolveAnswer(option)}
                  disabled={phase !== 'playing'}
                  className={`flex h-[56px] w-full shrink-0 items-center gap-3 rounded-xl border px-3 text-left text-[15px] font-semibold transition-colors active:scale-[0.99] disabled:cursor-wait ${optionStateClass}`}
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-extrabold shadow-sm ${isCorrect ? 'text-emerald-700' : isIncorrect ? 'text-rose-700' : 'text-sky-600'}`}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="min-w-0 break-words">{option}</span>
                </button>
              );
            })()
          ))}
        </div>
      </section>

      {result && phase === 'finished' && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-white/70 bg-white text-center shadow-2xl">
            <div className="bg-gradient-to-br from-slate-900 to-slate-700 px-5 pb-4 pt-5 text-white">
              <GameImage
                name={result.winner === 'knight' ? 'knight4' : 'drogon4'}
                alt={result.winner === 'knight' ? 'G‘olib ritser' : 'G‘olib ajdar'}
                className="mx-auto h-36 w-40 object-contain"
              />
              <p className="mt-1 text-xs font-bold uppercase tracking-[.18em] text-amber-300">Jang yakunlandi</p>
              <h2 className="mt-1 text-2xl font-black">
                {result.winner === 'knight' ? 'Ritser g‘olib!' : 'Ajdar g‘olib!'}
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-2 px-4 py-5">
              <div className="rounded-xl bg-emerald-50 p-2">
                <div className="text-xl font-black text-emerald-700">{result.correct}</div>
                <div className="text-[11px] font-semibold text-slate-600">To‘g‘ri</div>
              </div>
              <div className="rounded-xl bg-rose-50 p-2">
                <div className="text-xl font-black text-rose-700">{result.incorrect}</div>
                <div className="text-[11px] font-semibold text-slate-600">Noto‘g‘ri</div>
              </div>
              <div className="rounded-xl bg-slate-100 p-2">
                <div className="text-xl font-black text-slate-700">{result.unanswered}</div>
                <div className="text-[11px] font-semibold text-slate-600">Javobsiz</div>
              </div>
            </div>
            <p className="pb-4 text-xs font-medium text-slate-500">Jami {GAME_QUESTIONS.length} ta savol</p>
            <div className="flex gap-2 px-4 pb-4">
              <button
                type="button"
                onClick={onRestart}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1F7A45] px-3 py-3 text-sm font-bold text-white transition-colors hover:bg-[#176238] active:scale-[0.98]"
              >
                <RotateCcw size={16} />
                Qayta o‘ynash
              </button>
              <button
                type="button"
                onClick={onBack}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 active:scale-[0.98]"
              >
                Ortga qaytish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResourcesPage({ onGamesOpenChange }) {
  const { t } = useLanguage();
  const [showGames, setShowGames] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameSession, setGameSession] = useState(0);

  useEffect(() => {
    preloadGameImages();
  }, []);

  useEffect(() => {
    onGamesOpenChange?.(showGames || isPlaying);
  }, [showGames, isPlaying, onGamesOpenChange]);
  const resourceButtons = [
    {
      id: 'games',
      title: "O'yinlar",
      gradient: 'linear-gradient(135deg, #1E78FF 0%, #0D52BD 100%)',
      glow: 'rgba(30, 120, 255, 0.25)',
    },
    {
      id: 'stages',
      title: 'Bosqichlar',
      gradient: 'linear-gradient(135deg, #E65100 0%, #BF360C 100%)',
      glow: 'rgba(230, 81, 0, 0.25)',
    },
    {
      id: 'books',
      title: 'Kitoblar',
      gradient: 'linear-gradient(135deg, #7B1FA2 0%, #4A148C 100%)',
      glow: 'rgba(123, 31, 162, 0.25)',
    },
    {
      id: 'podcasts',
      title: 'Podcastlar',
      gradient: 'linear-gradient(135deg, #00897B 0%, #004D40 100%)',
      glow: 'rgba(0, 137, 123, 0.25)',
    },
  ];

  if (isPlaying) {
    return (
      <KnightDragonGame
        key={gameSession}
        sessionKey={gameSession}
        onBack={() => setIsPlaying(false)}
        onRestart={() => setGameSession((session) => session + 1)}
      />
    );
  }

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-white text-[#1E293B] px-5 pt-8 pb-28">
      {showGames ? (
        <div>
          <button
            type="button"
            onClick={() => setShowGames(false)}
            className="mb-4 flex items-center gap-1 rounded-xl px-2 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 active:scale-[0.98]"
          >
            <ArrowLeft size={18} />
            Resurslar
          </button>
          <GameCard
            onPlay={() => {
              preloadGameImages();
              setGameSession((session) => session + 1);
              setIsPlaying(true);
            }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {resourceButtons.map((btn) => (
            <button
              key={btn.id}
              type="button"
              onClick={btn.id === 'games' ? () => setShowGames(true) : undefined}
              className="w-full cursor-pointer rounded-2xl px-6 py-5 text-center text-lg font-bold text-white shadow-lg transition-transform duration-150 active:scale-[0.98] select-none"
              style={{
                background: btn.gradient,
                boxShadow: `0 6px 20px ${btn.glow}`,
              }}
            >
              {t(btn.title)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
