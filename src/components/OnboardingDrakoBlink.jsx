import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './OnboardingDrakoBlink.css';

const frames = [
  '/drako-image/drako-page1.1.png',
  '/drako-image/drako-page1.2.png',
  '/drako-image/drako-page1.3.png',
];
const blinkSequence = [1, 2, 1, 0];
const blinkInterval = 2000;
const frameDuration = 80;

export default function OnboardingDrakoBlink({ prefersReducedMotion }) {
  const [visibleFrame, setVisibleFrame] = useState(0);

  useEffect(() => {
    frames.forEach((src) => {
      const image = new Image();
      image.src = src;
    });

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
    <motion.div
      className="onboarding-drako-blink"
      role="img"
      aria-label="Drako"
      animate={prefersReducedMotion ? { y: 0 } : { y: [0, -8, 0] }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      {frames.map((src, index) => (
        <img
          key={src}
          src={src}
          alt=""
          aria-hidden="true"
          draggable="false"
          loading="eager"
          className={index === visibleFrame ? 'is-visible' : ''}
        />
      ))}
    </motion.div>
  );
}
