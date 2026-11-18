import React, { useRef, useState } from 'react';
import { Award, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../lib/language';
import './RegisterWizard.css';

const BOT_USERNAME = (import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'tarixiycheck_bot')
  .replace(/^@/, '')
  .trim();
const BOT_URL = `https://t.me/${BOT_USERNAME}?start=kirish`;

export default function RegisterWizard({
  mode = 'code',
  initialSelection,
  error = '',
  busy = false,
  onLogin,
  onSubmitCode,
  onSelectionComplete,
}) {
  const { t } = useLanguage();
  const [code, setCode] = useState('');
  const [selection, setSelection] = useState(initialSelection || { sinf: 9, yonalish: 'maktab' });
  const busyRef = useRef(false);

  const submitCode = async (event) => {
    event?.preventDefault();
    if (busyRef.current || code.length !== 6) return;
    busyRef.current = true;
    try {
      await onSubmitCode(code);
    } finally {
      busyRef.current = false;
    }
  };

  if (mode === 'selection') {
    return (
      <div className="step2-card">
        <h1 className="mb-1 text-center text-xl font-bold text-slate-900">{t('Sinf va Yo‘nalish')}</h1>
        <p className="mb-5 text-center text-sm text-slate-500">
          {t('O‘zingizga mos sinf va o‘rganish dasturini tanlang')}
        </p>

        <div className="grid grid-cols-3 gap-2">
          {[6, 7, 8, 9, 10, 11].map((grade) => (
            <button
              key={grade}
              type="button"
              onClick={() => setSelection({ sinf: grade, yonalish: 'maktab' })}
              aria-pressed={selection.yonalish === 'maktab' && selection.sinf === grade}
              className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                selection.yonalish === 'maktab' && selection.sinf === grade
                  ? 'border-amber-600 bg-amber-50 text-amber-800'
                  : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}
            >
              {grade}-sinf
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setSelection({ sinf: null, yonalish: 'dtm' })}
          aria-pressed={selection.yonalish === 'dtm'}
          className={`mt-4 flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
            selection.yonalish === 'dtm'
              ? 'border-amber-600 bg-amber-50'
              : 'border-slate-200 bg-white'
          }`}
        >
          <span className={`rounded-xl p-2 ${selection.yonalish === 'dtm' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
            <Award className="h-5 w-5" />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-semibold text-slate-900">BMBA / DTM</span>
            <span className="mt-1 block text-xs text-slate-500">{t('BMBA / DTM sertifikat imtihoni')}</span>
          </span>
          {selection.yonalish === 'dtm' && <CheckCircle2 className="h-5 w-5 text-amber-600" />}
        </button>

        {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
        <button
          type="button"
          disabled={busy}
          onClick={() => onSelectionComplete(selection)}
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 font-semibold text-white shadow-md disabled:opacity-60"
        >
          <span>{busy ? 'Saqlanmoqda...' : 'Davom etish'}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <section className="w-full max-w-sm rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_15px_35px_-5px_rgba(0,0,0,0.08)] sm:p-8">
      <h1 className="text-center text-2xl font-bold tracking-tight text-slate-900">Tarixiy&apos;ga kirish</h1>
      <p className="mt-3 text-center text-sm leading-relaxed text-slate-600">
        1. Botni oching. 2. /start yozing. 3. Olingan 6 xonali kodni kiriting.
      </p>

      <ol className="mt-6 space-y-3 text-sm text-slate-700">
        <li className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-800">1</span>
          <a
            href={BOT_URL}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-amber-800 underline underline-offset-2"
          >
            Telegram botni oching
          </a>
        </li>
        <li className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-800">2</span>
          <span>Botga /start yozing va 6 xonali kodni oling</span>
        </li>
        <li className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-800">3</span>
          <label htmlFor="telegram-login-code">Kodni kiriting</label>
        </li>
      </ol>

      <form className="mt-5 space-y-3" onSubmit={submitCode}>
        <input
          id="telegram-login-code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          value={code}
          onChange={(event) => {
            setCode(event.target.value.replace(/\D/g, '').slice(0, 6));
          }}
          placeholder="123456"
          aria-label="6 xonali kod"
          aria-describedby={error ? 'telegram-login-error' : undefined}
          className="h-14 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-center text-2xl font-bold tracking-[0.35em] text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
        />
        {error && (
          <p id="telegram-login-error" role="alert" className="text-center text-sm text-red-600">
            {error}
          </p>
        )}
        {error && (
          <a href={BOT_URL} target="_blank" rel="noreferrer" className="block text-center text-sm font-medium text-amber-800 underline underline-offset-2">
            Botdan yangi kod oling · Botni ochish
          </a>
        )}
        <button
          type="submit"
          disabled={busy || code.length !== 6}
          aria-busy={busy}
          aria-label={busy ? 'Tekshirilmoqda' : undefined}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 font-semibold text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-55"
        >
          {busy ? (
            <div
              className="dots"
              aria-hidden="true"
              style={{
                '--size': '32px',
                '--dot-size': '4px',
                '--dot-count': 6,
                '--color': '#fff',
                '--speed': '1s',
                '--spread': '60deg',
              }}
            >
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <div key={index} className="dot" style={{ '--i': index }} />
              ))}
            </div>
          ) : (
            <>
              Kirish
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {onLogin && (
        <button
          type="button"
          onClick={onLogin}
          className="mt-5 flex w-full items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-amber-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Tanlovga qaytish
        </button>
      )}
    </section>
  );
}
