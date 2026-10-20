import { LEVEL_LESSONS, MEDIEVAL_HISTORY_TEXT } from './levelLessons';

const MOCK_LEVELS = Array.from({ length: 70 }, (_, index) => {
  const id = index + 1;
  const lessonSeeds = LEVEL_LESSONS[id] || [
    { id: `${id}-1`, type: 'jahon', title: 'Dars 1', content: 'Tez orada...' },
    { id: `${id}-2`, type: 'jahon', title: 'Dars 2', content: 'Tez orada...' },
    { id: `${id}-3`, type: 'uzbekiston', title: 'Dars 3', content: 'Tez orada...' },
  ];

  return {
    id,
    nom: `${id} Level`,
    darslar: lessonSeeds.map((lesson) => {
      const fan = lesson.type === 'uzbekiston' ? 'ozbekiston' : 'jahon';
      const fanSarlavhasi = fan === 'ozbekiston' ? "O'zbekiston" : 'Jahon';

      return {
        id: lesson.id,
        fan,
        sarlavha: lesson.title,
        muqova: {
          sarlavha: `${fanSarlavhasi} *Tarixi*`,
          tagsarlavha: lesson.title,
        },
        holat: 'elon_qilingan',
        bloklar: [
          {
            id: `${lesson.id}-block-1`,
            tur: 'matn',
            qiymat: lesson.content || (id === 1 && lesson.id === '1-1' ? MEDIEVAL_HISTORY_TEXT : 'Tez orada...'),
          },
        ],
      };
    }),
  };
});

export default MOCK_LEVELS;
