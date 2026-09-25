export const dashboardData = {
  userName: 'Jasur',
  classLevel: '7-sinf',
  courseType: 'Full Tarix',
  streak: 7,
  xp: 340,
  rank: 15,
  todayLesson: "1-Bo'lim: Qadimgi davr",
  examDaysLeft: 2,
  examDay: 'Yakshanba',
};

export function getDashboardCards(data = dashboardData) {
  return [
    {
      id: 1,
      title: 'Bugungi dars',
      subtitle: data.todayLesson,
      action: 'Boshlash',
      bgColor: '#E8D5B7',
      iconName: 'BookOpen',
      iconColor: '#92641A',
    },
    {
      id: 2,
      title: 'Ketma-ketlik',
      subtitle: `${data.streak} kun davom etmoqda`,
      action: 'Davom et',
      bgColor: '#F0B8A8',
      iconName: 'Flame',
      iconColor: '#C0442C',
    },
    {
      id: 3,
      title: 'Reyting',
      subtitle: `Siz #${data.rank}-o'rinda`,
      action: "Ko'rish",
      bgColor: '#D4C5E2',
      iconName: 'Trophy',
      iconColor: '#6B3FA0',
    },
    {
      id: 4,
      title: 'Haftalik imtihon',
      subtitle: data.examDay,
      action: `${data.examDaysLeft} kun qoldi`,
      bgColor: '#B8E0E8',
      iconName: 'ClipboardList',
      iconColor: '#1A6B7E',
    },
  ];
}
