import { useEffect, useState } from 'react';
import './QuizDrakoBlink.css';

const frames = [
  '/drako-image/drako-quiz1.png',
  '/drako-image/drako-quiz2.png',
  '/drako-image/drako-quiz3.png',
];
const blinkSequence = [1, 2, 1, 0];
const blinkInterval = 3000;
const frameDuration = 80;

export default function QuizDrakoBlink() {
  const [visibleFrame, setVisibleFrame] = useState(0);

  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timeoutId;
    let sequenceIndex = 0;

    const showNextFrame = () => {
      setVisibleFrame(blinkSequence[sequenceIndex]);
      sequenceIndex += 1;

      const delay = sequenceIndex < blinkSequence.length
        ? frameDuration
        : blinkInterval - (blinkSequence.length - 1) * frameDuration;

      if (sequenceIndex === blinkSequence.length) sequenceIndex = 0;
      timeoutId = window.setTimeout(showNextFrame, delay);
    };

    const updateMotionPreference = () => {
      window.clearTimeout(timeoutId);
      sequenceIndex = 0;
      setVisibleFrame(0);
      if (!motionPreference.matches) timeoutId = window.setTimeout(showNextFrame, blinkInterval);
    };

    updateMotionPreference();
    motionPreference.addEventListener('change', updateMotionPreference);

    return () => {
      window.clearTimeout(timeoutId);
      motionPreference.removeEventListener('change', updateMotionPreference);
    };
  }, []);

  return (
    <div className="quiz-drako quiz-drako-blink" role="img" aria-label="Drako">
      {frames.map((src, index) => (
        <img
          key={src}
          src={src}
          alt=""
          aria-hidden="true"
          loading="eager"
          className={index === visibleFrame ? 'is-visible' : ''}
        />
      ))}
    </div>
  );
}
