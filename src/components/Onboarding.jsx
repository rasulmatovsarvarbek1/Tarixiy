import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const onboardingPages = [
  {
    image: '/drako-image/drako1.png',
    imageWidth: 300,
    imagePosition: 'translate-x-6',
    title: [
      { text: 'Drako', accent: true },
      { text: ' bilan tanishing' },
    ],
    description: "Tarixni oson, qiziqarli va o‘yin kabi o‘rgan. Men senga yo‘l ko‘rsataman!",
    animation: 'greet',
  },
  {
    image: '/drako-image/drako2.png',
    imageWidth: 290,
    imagePosition: '-translate-x-6 translate-y-3',
    title: [
      { text: 'Istalgan vaqt, ' },
      { text: 'istalgan joyda', accent: true },
    ],
    description: 'Qisqa darslar, kunlik quiz va reyting bilan tarixni har kuni bir necha daqiqada o‘rgan.',
    chips: [{ text: '📜 3 daqiqalik dars', position: 'top-right' }],
    animation: 'study',
  },
  {
    image: '/drako-image/drako3.png',
    imageWidth: 320,
    imagePosition: '',
    title: [
      { text: 'Har kuni ' },
      { text: 'yutuqqa', accent: true },
      { text: ' erish' },
    ],
    description: 'Streak yig‘, medallar och va reytingda yuqoriga chiq.',
    chips: [
      { text: '🔥 7 kunlik streak', position: 'left' },
      { text: '⭐ +50 XP', position: 'right' },
    ],
    animation: 'win',
  },
];

const accentStyle = {
  backgroundImage: 'linear-gradient(90deg, #F59E0B, #D97706)',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

function getSlideVariants(direction) {
  return {
    enter: { opacity: 0, x: direction > 0 ? 50 : -50 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: direction > 0 ? -50 : 50 },
  };
}

export default function Onboarding({ onComplete }) {
  const [pageIndex, setPageIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const prefersReducedMotion = useReducedMotion();
  const isLastPage = pageIndex === onboardingPages.length - 1;
  const page = onboardingPages[pageIndex];

  const goToPage = useCallback((nextIndex) => {
    if (nextIndex < 0 || nextIndex >= onboardingPages.length) return;
    setDirection(nextIndex > pageIndex ? 1 : -1);
    setPageIndex(nextIndex);
  }, [pageIndex]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowRight') goToPage(pageIndex + 1);
      if (event.key === 'ArrowLeft') goToPage(pageIndex - 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPage, pageIndex]);

  const handleDragEnd = (_, info) => {
    if (info.offset.x < -70) goToPage(pageIndex + 1);
    if (info.offset.x > 70) goToPage(pageIndex - 1);
  };

  const imageEntrance = page.animation === 'greet'
    ? { opacity: 0, y: 80, scale: 0.9 }
    : page.animation === 'study'
      ? { opacity: 0, x: -40 }
      : { opacity: 0, scale: 0.6, rotate: -3 };

  return (
    <main className="flex h-dvh w-full justify-center overflow-hidden bg-white text-gray-800">
      {onboardingPages.map(({ image }) => (
        <link key={image} rel="preload" as="image" href={image} />
      ))}
      <div className="flex h-full w-full max-w-md flex-col px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
        <header className="h-10 shrink-0" />

        <div className="relative min-h-0 flex-1">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.section
              key={pageIndex}
              custom={direction}
              variants={getSlideVariants(direction)}
              initial={prefersReducedMotion ? false : 'enter'}
              animate="center"
              exit="exit"
              transition={prefersReducedMotion ? { duration: 0.12 } : { duration: 0.32, ease: 'easeOut' }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.16}
              onDragEnd={handleDragEnd}
              aria-label={`${pageIndex + 1} / ${onboardingPages.length}`}
              className="absolute inset-0 flex flex-col"
            >
              <div className="shrink-0 pt-3 text-left">
                <motion.h1
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.35, delay: prefersReducedMotion ? 0 : 0.08 }}
                  className="text-3xl font-bold leading-tight tracking-tight text-[#1F2937] [@media(max-height:600px)]:text-2xl"
                >
                  {page.title.map((part, index) => (
                    <span key={`${part.text}-${index}`} style={part.accent ? accentStyle : undefined}>
                      {part.text}
                    </span>
                  ))}
                </motion.h1>
                <motion.p
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.35, delay: prefersReducedMotion ? 0 : 0.16 }}
                  className="mt-3 text-base leading-relaxed text-gray-500 [@media(max-height:600px)]:mt-2 [@media(max-height:600px)]:text-sm"
                >
                  {page.description}
                </motion.p>
              </div>

              <div className="relative flex min-h-0 flex-1 items-end justify-center pb-2">
                {page.animation === 'win' && (
                  <div className="pointer-events-none absolute inset-0">
                    {[0, 1, 2, 3, 4].map((sparkle) => (
                      <motion.span
                        key={sparkle}
                        aria-hidden="true"
                        className="absolute h-2 w-2 rounded-full bg-amber-400"
                        style={{
                          left: `${24 + sparkle * 12}%`,
                          top: `${25 + (sparkle % 2) * 13}%`,
                        }}
                        animate={prefersReducedMotion ? { opacity: 0.7 } : {
                          opacity: [0.25, 1, 0.25],
                          scale: [0.7, 1.25, 0.7],
                        }}
                        transition={{ duration: 1.8, repeat: Infinity, delay: sparkle * 0.22 }}
                      />
                    ))}
                  </div>
                )}

                {page.chips?.map((chip, index) => (
                  <motion.span
                    key={chip.text}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                    animate={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: [0, -4, 0] }}
                    transition={{
                      opacity: { duration: prefersReducedMotion ? 0 : 0.35, delay: prefersReducedMotion ? 0 : 0.2 + index * 0.14 },
                      y: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.55 + index * 0.14 },
                    }}
                    className={`absolute z-10 rounded-full border border-[#F3F4F6] bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-md ${
                      chip.position === 'top-right'
                        ? 'right-0 top-[22%]'
                        : chip.position === 'left'
                          ? 'left-0 top-[35%]'
                          : 'right-0 top-[23%]'
                    }`}
                  >
                    {chip.text}
                  </motion.span>
                ))}

                <motion.div
                  initial={prefersReducedMotion ? false : imageEntrance}
                  animate={{ opacity: 1, x: 0, y: 0, scale: page.animation === 'win' ? [1, 1.05, 1] : 1, rotate: 0 }}
                  transition={prefersReducedMotion ? { duration: 0 } : page.animation === 'greet'
                    ? { type: 'spring', stiffness: 150, damping: 13 }
                    : page.animation === 'win'
                      ? { type: 'spring', stiffness: 240, damping: 12 }
                      : { duration: 0.55, ease: 'easeOut' }}
                  className={`relative z-[1] flex w-full flex-col items-center ${page.imagePosition}`}
                >
                  <motion.img
                    src={page.image}
                    alt=""
                    width={1024}
                    height={1024}
                    draggable="false"
                    className="h-auto max-h-[min(44dvh,360px)] max-w-full select-none object-contain [@media(max-height:600px)]:max-h-[20dvh]"
                    style={{ width: `min(${page.imageWidth}px, 82vw)`, mixBlendMode: 'multiply' }}
                    animate={prefersReducedMotion ? { y: 0, rotate: 0 } : page.animation === 'greet'
                      ? { y: [0, -8, 0] }
                      : page.animation === 'study'
                        ? { rotate: [-2, 2, -2] }
                        : { y: [0, -5, 0], rotate: -3 }}
                    transition={{ duration: page.animation === 'study' ? 3.2 : 3, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <motion.div
                    aria-hidden="true"
                    className="mt-[-3px] h-4 w-40 rounded-full bg-black/10 blur-md"
                    animate={prefersReducedMotion ? { scale: 1 } : { scale: [1, 0.88, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </motion.div>
              </div>
            </motion.section>
          </AnimatePresence>
        </div>

        <footer className="shrink-0 pt-3">
          <div className="mb-5 flex h-2 items-center justify-center gap-2" aria-label="Onboarding progress">
            {onboardingPages.map((item, index) => (
              <span
                key={item.image}
                className={`h-2 rounded-full transition-all duration-300 ${
                  pageIndex === index
                    ? 'w-6 bg-gradient-to-r from-[#F59E0B] to-[#D97706]'
                    : 'w-2 bg-[#E5E7EB]'
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => (isLastPage ? onComplete() : goToPage(pageIndex + 1))}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#F59E0B] to-[#D97706] font-semibold text-white shadow-[0_10px_25px_-8px_rgba(217,119,6,0.5)] transition hover:brightness-105 active:scale-[0.98]"
          >
            {isLastPage ? 'Boshlash' : 'Keyingi'}
            <ArrowRight size={20} aria-hidden="true" />
          </button>
        </footer>
      </div>
    </main>
  );
}
