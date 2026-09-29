import React from 'react';

export default function ResourcesPage() {
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

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#0C0F18] text-white px-5 pt-8 pb-28">
      {/* 4 ta tugma: faqat nomi va rangi */}
      <div className="space-y-4">
        {resourceButtons.map((btn) => (
          <button
            key={btn.id}
            type="button"
            className="w-full py-5 px-6 rounded-2xl text-white text-lg font-bold text-center active:scale-[0.98] transition-all duration-150 cursor-pointer shadow-lg select-none"
            style={{
              background: btn.gradient,
              boxShadow: `0 6px 20px ${btn.glow}`,
            }}
          >
            {btn.title}
          </button>
        ))}
      </div>
    </div>
  );
}
