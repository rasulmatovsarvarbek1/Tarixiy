import { useEffect, useRef, useState } from "react";

const WORD = "Tarixiy";
const FIRST = WORD[0];
const REST = WORD.slice(1).split("");

const T_IN_MS = 800;
const REST_START_MS = 700;
const REST_STAGGER_MS = 80;
const REST_DUR_MS = 650;

const CSS = `
.tx-splash {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, #F8431A 0%, #F89B0C 100%);
  color: #fff;
  transition: transform 550ms cubic-bezier(0.7, 0, 0.3, 1);
  will-change: transform;
}
.tx-splash.tx-leaving {
  transform: translateY(-100%);
  pointer-events: none;
}
.tx-word {
  display: inline-flex;
  align-items: baseline;
  font-family: inherit;
  font-weight: 800;
  font-size: clamp(2.25rem, 11vw, 4.25rem);
  line-height: 1;
  letter-spacing: -0.02em;
  user-select: none;
}
.tx-first {
  position: relative;
  z-index: 2;
  display: inline-block;
  animation: tx-first-in ${T_IN_MS}ms cubic-bezier(0.2, 0.9, 0.3, 1.12) both;
}
.tx-rest {
  display: inline-flex;
  align-items: baseline;
  overflow: hidden;
  padding: 0.18em 0.06em 0.28em 0;
  margin: -0.18em -0.06em -0.28em -0.05em;
}
.tx-letter {
  display: inline-block;
  animation: tx-letter-out ${REST_DUR_MS}ms cubic-bezier(0.2, 0.85, 0.25, 1) both;
}
@keyframes tx-first-in {
  0%   { transform: translateX(-75vw); opacity: 0; }
  35%  { opacity: 1; }
  100% { transform: translateX(0); opacity: 1; }
}
@keyframes tx-letter-out {
  from { transform: translateX(var(--from)); }
  to   { transform: translateX(0); }
}
@media (prefers-reduced-motion: reduce) {
  .tx-first, .tx-letter { animation: none; }
  .tx-splash { transition: opacity 300ms ease; }
  .tx-splash.tx-leaving { transform: none; opacity: 0; }
}
`;

export default function SplashScreen({ onDone, holdMs = 2500, exitMs = 550 }) {
  const [leaving, setLeaving] = useState(false);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hold = reduce ? 900 : holdMs;
    const t1 = setTimeout(() => setLeaving(true), hold);
    const t2 = setTimeout(() => {
      document.documentElement.style.removeProperty("background");
      doneRef.current?.();
    }, hold + exitMs);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [holdMs, exitMs]);

  return (
    <div
      className={`tx-splash${leaving ? " tx-leaving" : ""}`}
      role="img"
      aria-label={WORD}
    >
      <style>{CSS}</style>
      <div className="tx-word" aria-hidden="true">
        <span className="tx-first">{FIRST}</span>
        <span className="tx-rest">
          {REST.map((ch, i) => (
            <span
              key={i}
              className="tx-letter"
              style={{
                "--from": `${-(i * 0.6 + 0.9)}em`,
                animationDelay: `${REST_START_MS + i * REST_STAGGER_MS}ms`,
              }}
            >
              {ch}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
