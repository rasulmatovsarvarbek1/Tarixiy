import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
  {
    question: 'Amir Temur qaysi shaharda tug‘ilgan?',
    options: ['Shahrisabz', 'Samarqand', 'Buxoro'],
    answer: 'Shahrisabz',
  },
  {
    question: 'Amir Temur davlati poytaxti qaysi shahar bo‘lgan?',
    options: ['Samarqand', 'Xiva', 'Toshkent'],
    answer: 'Samarqand',
  },
  {
    question: 'Temuriylar sulolasining mashhur hukmdori Mirzo Ulug‘bek qaysi fan bilan shug‘ullangan?',
    options: ['Astronomiya', 'Kimyo', 'Fizika'],
    answer: 'Astronomiya',
  },
  {
    question: 'Zahiriddin Muhammad Bobur Hindistonda qaysi sulolaga asos solgan?',
    options: ['Boburlar sulolasi', 'Guptalar sulolasi', 'Mavriylar sulolasi'],
    answer: 'Boburlar sulolasi',
  },
  {
    question: 'To‘maris kim bo‘lgan?',
    options: ['Massagetlar malikasi', 'Qadimgi Misr malika', 'Rim imperatori'],
    answer: 'Massagetlar malikasi',
  },
  {
    question: 'Spartak qaysi davlatda qullar qo‘zg‘olonini boshqargan?',
    options: ['Qadimgi Rim', 'Qadimgi Yunoniston', 'Fors imperiyasi'],
    answer: 'Qadimgi Rim',
  },
  {
    question: 'Qadimgi Yunonistonning mashhur faylasufi Aleksandr Makedonskiyga ustozlik qilgan?',
    options: ['Aristotel', 'Pifagor', 'Gippokrat'],
    answer: 'Aristotel',
  },
  {
    question: 'Jaloliddin Manguberdi qaysi sulolaning so‘nggi sultonlaridan biri bo‘lgan?',
    options: ['Xorazmshohlar', 'Somoniylar', 'Qoraxoniylar'],
    answer: 'Xorazmshohlar',
  },
  {
    question: 'Samarqanddagi Ulug‘bek rasadxonasining asosiy yo‘nalishi nima bo‘lgan?',
    options: ['Osmon jismlarini kuzatish', 'Suv kashf qilish', 'O‘simlik yetishtirish'],
    answer: 'Osmon jismlarini kuzatish',
  },
  {
    question: 'Buyuk Ipak yo‘li asosan nima uchun xizmat qilgan?',
    options: ['Savdo va madaniy aloqa', 'Faqat harbiy yurish', 'Faollarni joylashtirish'],
    answer: 'Savdo va madaniy aloqa',
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

function shuffleOptions(options) {
  const shuffled = [...options];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
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
          <defs>
            <linearGradient id="dragon-fire-shell" x1="100%" y1="50%" x2="0%" y2="50%">
              <stop offset="0%" stopColor="#FFF3A6" />
              <stop offset="28%" stopColor="#FDBA3B" />
              <stop offset="68%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#DC2626" />
            </linearGradient>
            <linearGradient id="dragon-fire-core" x1="100%" y1="50%" x2="0%" y2="50%">
              <stop offset="0%" stopColor="#FFFDE7" />
              <stop offset="42%" stopColor="#FDE68A" />
              <stop offset="100%" stopColor="#F97316" />
            </linearGradient>
          </defs>
          <path
            className="fire-shell"
            d="M298 57C276 49 267 34 244 38c-17-16-37-23-59-9-18-19-43-15-62 5-23-13-48-2-63 15C37 47 15 53 2 60c20 8 40 14 61 9 16 22 39 30 64 13 19 18 45 12 64-7 25 7 47-2 64-9 18 5 31-2 43-6Z"
          />
          <path
            className="fire-core"
            d="M297 59c-28-7-48-16-71-9-21-13-44-13-63 0-23-8-51-3-74 10-24 2-43 1-64 1 22 7 41 9 64 5 21 12 47 16 72 3 24 8 45 1 66-4 27 5 49-1 70-6Z"
          />
          <g className="fire-sparks">
            <circle cx="45" cy="38" r="3" />
            <circle cx="82" cy="91" r="2.5" />
            <circle cx="132" cy="24" r="2" />
            <circle cx="176" cy="96" r="2.5" />
            <circle cx="222" cy="35" r="2" />
          </g>
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
    shuffleOptions(GAME_QUESTIONS[0].options)
  ));
  const phaseRef = useRef('playing');
  const phaseTimeoutRef = useRef(null);
  const loadingRunRef = useRef(0);
  const swordAudioRef = useRef(null);
  const swordStopTimeoutRef = useRef(null);
  const hornAudioRef = useRef(null);
  const dragonAudioContextRef = useRef(null);
  const question = GAME_QUESTIONS[questionIndex];

  const changePhase = useCallback((nextPhase) => {
    phaseRef.current = nextPhase;
    setPhase(nextPhase);
  }, []);

  useEffect(() => {
    swordAudioRef.current = new Audio('/game-sounds/sword-slash.mp3');
    swordAudioRef.current.preload = 'auto';
    swordAudioRef.current.volume = 1;
    swordAudioRef.current.load();

    hornAudioRef.current = new Audio('/game-sounds/horn.mp3');
    hornAudioRef.current.preload = 'auto';
    hornAudioRef.current.volume = 1;
    hornAudioRef.current.load();
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
    swordAudio.currentTime = 0.45;
    swordAudio.volume = 1;
    swordAudio.play().catch((error) => {
      console.error('Qilich ovozini qo‘yib bo‘lmadi:', error);
    });

    swordStopTimeoutRef.current = window.setTimeout(() => {
      swordAudio.pause();
      swordAudio.currentTime = 0;
      swordStopTimeoutRef.current = null;
    }, 900);
  }, []);

  const getDragonAudioContext = useCallback(() => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!dragonAudioContextRef.current) {
      dragonAudioContextRef.current = new AudioContextClass();
    }

    return dragonAudioContextRef.current;
  }, []);

  const playDragonRoar = useCallback(async () => {
    const context = getDragonAudioContext();
    if (!context) {
      console.error('Ajdarho ovozi uchun Web Audio API mavjud emas.');
      return;
    }
    if (context.state === 'suspended') {
      try {
        await context.resume();
      } catch (error) {
        console.error('Ajdarho ovozini yoqib bo‘lmadi:', error);
        return;
      }
    }

    const duration = 2;
    const now = context.currentTime;
    const mainOscillator = context.createOscillator();
    const subOscillator = context.createOscillator();
    const lfo = context.createOscillator();
    const fmGain = context.createGain();
    const tremoloGain = context.createGain();
    const mainGain = context.createGain();
    const filter = context.createBiquadFilter();
    const shaper = context.createWaveShaper();

    mainOscillator.type = 'sawtooth';
    mainOscillator.frequency.setValueAtTime(130, now);
    mainOscillator.frequency.exponentialRampToValueAtTime(155, now + 1);
    mainOscillator.frequency.exponentialRampToValueAtTime(55, now + duration);

    subOscillator.type = 'square';
    subOscillator.frequency.setValueAtTime(65, now);
    subOscillator.frequency.exponentialRampToValueAtTime(28, now + duration);

    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(31, now);
    lfo.frequency.linearRampToValueAtTime(28, now + 0.8);
    lfo.frequency.linearRampToValueAtTime(35, now + duration);
    fmGain.gain.setValueAtTime(40, now);
    tremoloGain.gain.setValueAtTime(0.09, now);

    lfo.connect(fmGain);
    fmGain.connect(mainOscillator.frequency);
    fmGain.connect(subOscillator.frequency);
    lfo.connect(tremoloGain);
    tremoloGain.connect(mainGain.gain);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, now);
    filter.frequency.exponentialRampToValueAtTime(220, now + duration);
    filter.Q.value = 4;

    const curve = new Float32Array(1024);
    for (let index = 0; index < curve.length; index += 1) {
      const x = (index * 2) / (curve.length - 1) - 1;
      curve[index] = Math.tanh(2.8 * x);
    }
    shaper.curve = curve;
    shaper.oversample = '4x';

    mainGain.gain.setValueAtTime(0.0001, now);
    mainGain.gain.exponentialRampToValueAtTime(0.8, now + 0.08);
    mainGain.gain.setValueAtTime(0.8, now + 1.4);
    mainGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    mainOscillator.connect(filter);
    subOscillator.connect(filter);
    filter.connect(shaper);
    shaper.connect(mainGain);
    mainGain.connect(context.destination);

    mainOscillator.start(now);
    subOscillator.start(now);
    lfo.start(now);
    mainOscillator.stop(now + duration);
    subOscillator.stop(now + duration);
    lfo.stop(now + duration);
  }, [getDragonAudioContext]);

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
    if (hornAudioRef.current) {
      hornAudioRef.current.pause();
      hornAudioRef.current.currentTime = 0;
    }
    if (dragonAudioContextRef.current) {
      dragonAudioContextRef.current.close().catch(() => {});
    }
  }, []);

  const startGame = async () => {
    const audioContext = getDragonAudioContext();
    if (audioContext?.state === 'suspended') {
      audioContext.resume().catch((error) => {
        console.error('O‘yin ovozini yoqib bo‘lmadi:', error);
      });
    }

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

    const hornAudio = hornAudioRef.current;
    if (hornAudio) {
      hornAudio.pause();
      hornAudio.currentTime = 0;
      hornAudio.volume = 1;
      hornAudio.play().catch((error) => {
        console.error('Jang karnayi ovozini qo‘yib bo‘lmadi:', error);
      });
    }
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
    if (!correct) playDragonRoar();

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
      setAnswerOptions(shuffleOptions(nextQuestion.options));
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
    playDragonRoar,
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

  const resultModal = result && phase === 'finished'
    ? createPortal(
      <div
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100dvh',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px',
          overflow: 'hidden',
          background: 'rgba(15, 23, 42, 0.68)',
          backdropFilter: 'blur(3px)',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: 'min(calc(100vw - 24px), 384px)',
            maxHeight: 'calc(100dvh - 24px)',
            overflowY: 'auto',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            background: '#FFFFFF',
            textAlign: 'center',
            boxShadow: '0 24px 80px rgba(15, 23, 42, 0.38)',
            margin: 0,
            flex: '0 1 auto',
            boxSizing: 'border-box',
          }}
        >
          <div className="bg-gradient-to-br from-slate-900 to-slate-700 px-4 pb-3 pt-3 text-white">
            <GameImage
              name={result.winner === 'knight' ? 'knight4' : 'drogon4'}
              alt={result.winner === 'knight' ? 'G‘olib ritser' : 'G‘olib ajdar'}
              className="mx-auto h-20 w-24 object-contain sm:h-28 sm:w-32"
            />
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[.18em] text-amber-300">Jang yakunlandi</p>
            <h2 className="mt-1 text-xl font-black leading-tight">
              {result.winner === 'knight' ? 'Ritser g‘olib!' : 'Ajdar g‘olib!'}
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-2 px-3 py-3">
            <div className="rounded-xl bg-emerald-50 px-1 py-2">
              <div className="text-lg font-black text-emerald-700">{result.correct}</div>
              <div className="text-[10px] font-semibold text-slate-600">To‘g‘ri</div>
            </div>
            <div className="rounded-xl bg-rose-50 px-1 py-2">
              <div className="text-lg font-black text-rose-700">{result.incorrect}</div>
              <div className="text-[10px] font-semibold text-slate-600">Noto‘g‘ri</div>
            </div>
            <div className="rounded-xl bg-slate-100 px-1 py-2">
              <div className="text-lg font-black text-slate-700">{result.unanswered}</div>
              <div className="text-[10px] font-semibold text-slate-600">Javobsiz</div>
            </div>
          </div>
          <p className="pb-2 text-[11px] font-medium text-slate-500">Jami {GAME_QUESTIONS.length} ta savol</p>
          <div className="flex gap-2 px-3 pb-3">
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
      </div>,
      document.body,
    )
    : null;

  if (phase === 'intro') {
    return (
      <div
        className="fixed inset-0 z-[110] flex h-[100dvh] flex-col items-center justify-between overflow-hidden bg-[#F8FAFC] px-5 text-[#0F172A]"
        style={{
          paddingTop: 'max(16px, env(safe-area-inset-top))',
          paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        }}
      >
        <div className="relative flex w-full shrink-0 items-center justify-center pt-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="Ortga qaytish"
            className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-slate-600 transition-colors hover:bg-slate-100 active:scale-[0.98]"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-center text-3xl font-black tracking-tight text-[#0F172A]">
            Ritser va Ajdar
          </h1>
        </div>
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
        @keyframes game-hurt { 0%, 100% { transform: translateX(0); filter: none; } 20%, 60% { transform: translateX(-7px); filter: brightness(1.15) sepia(1) saturate(5) hue-rotate(320deg) drop-shadow(0 0 12px rgba(239, 68, 68, .75)); } 40%, 80% { transform: translateX(7px); filter: brightness(1.15) sepia(1) saturate(5) hue-rotate(320deg) drop-shadow(0 0 12px rgba(239, 68, 68, .75)); } }
        @keyframes game-dragon-hurt { 0%, 100% { transform: translateX(0); filter: none; } 20%, 60% { transform: translateX(-7px); filter: brightness(1.8) saturate(1.5); } 40%, 80% { transform: translateX(7px); filter: brightness(1.8) saturate(1.5); } }
        @keyframes game-lightning { 0% { opacity: 0; transform: scale(.4); } 20% { opacity: 1; transform: scale(1.15); } 40% { opacity: .8; transform: scale(.9); } 100% { opacity: 0; transform: scale(1); } }
        @keyframes game-fire { 0% { opacity: 0; transform: scale(.08, .72); } 12% { opacity: 1; } 48% { transform: scale(1.05, 1.08); } 100% { opacity: 0; transform: scale(1, .86); } }
        @keyframes game-flash { 0%, 100% { opacity: 0; } 25%, 55% { opacity: .55; } }
        @keyframes game-fire-spark { 0%, 100% { opacity: 0; transform: scale(.2); } 30% { opacity: 1; transform: scale(1.35); } 70% { opacity: .8; transform: scale(.8); } }
        .knight-attack { animation: game-knight-strike .65s ease-out; }
        .dragon-attack { animation: game-dragon-strike .65s ease-out; }
        .knight-hurt { animation: game-hurt .55s ease-out; }
        .dragon-hurt { animation: game-dragon-hurt .55s ease-out; }
        .lightning-effect { position: absolute; z-index: 20; left: 52%; top: 24%; width: 23%; height: 43%; fill: #fff6a5; filter: drop-shadow(0 0 10px #fef08a) drop-shadow(0 0 22px #38bdf8); animation: game-lightning .7s ease-out both; }
        .fire-effect { position: absolute; z-index: 20; left: 24%; top: 68%; width: 32%; height: 20%; overflow: visible; transform-origin: right center; animation: game-fire .75s ease-out both; }
        .fire-shell { fill: url(#dragon-fire-shell); filter: drop-shadow(0 0 7px rgba(249, 115, 22, .95)) drop-shadow(0 0 15px rgba(220, 38, 38, .72)); }
        .fire-core { fill: url(#dragon-fire-core); filter: drop-shadow(0 0 5px rgba(255, 237, 130, .95)); }
        .fire-sparks circle { fill: #FFF3A6; filter: drop-shadow(0 0 4px #FBBF24); transform-box: fill-box; transform-origin: center; animation: game-fire-spark .55s ease-out both; }
        .fire-sparks circle:nth-child(2) { animation-delay: 50ms; }
        .fire-sparks circle:nth-child(3) { animation-delay: 90ms; }
        .fire-sparks circle:nth-child(4) { animation-delay: 30ms; }
        .fire-sparks circle:nth-child(5) { animation-delay: 70ms; }
        .arena-flash { position: absolute; z-index: 15; inset: 0; pointer-events: none; background: radial-gradient(ellipse at center, rgba(248, 60, 35, .52), transparent 68%); animation: game-flash .5s ease-out both; }
        .arena-flash-dragon { clip-path: ellipse(38% 55% at 76% 57%); }
        .arena-flash-knight { clip-path: ellipse(14% 20% at 30% 78%); background: radial-gradient(ellipse at 30% 78%, rgba(248, 60, 35, .8), transparent 24%); }
        @media (prefers-reduced-motion: reduce) {
          .knight-attack, .dragon-attack, .knight-hurt, .dragon-hurt, .lightning-effect, .fire-effect, .fire-sparks circle, .arena-flash { animation-duration: .01ms !important; }
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
                  onClick={() => {
                    if (option === question.answer) playSwordSlash();
                    resolveAnswer(option);
                  }}
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

      {resultModal}
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
