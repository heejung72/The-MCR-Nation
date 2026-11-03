export type NavItem = { en: string; ko: string; to: string }
export type Ministry = { no: string; en: string; ko: string; to: string; items: NavItem[] }

export const MINISTRIES: Ministry[] = [
  {
    no: '01', en: 'MINISTRY OF INFORMATION', ko: '정보부', to: '/nation', items: [
      { en: 'MCR STORY', ko: '밴드 이야기', to: '/nation/story' },
      { en: "CITIZEN'S GUIDE", ko: '시민 안내서', to: '/nation/guide' },
      { en: 'NATIONAL LORE', ko: '세계관 기록', to: '/nation/lore' },
      { en: 'GOVERNMENT DIRECTORY', ko: '기관 안내', to: '/nation/directory' },
    ],
  },
  {
    no: '02', en: 'MINISTRY OF RECORDS', ko: '기록부', to: '/records', items: [
      { en: 'DISCOGRAPHY', ko: '디스코그래피', to: '/records/discography' },
      { en: 'LYRIC INTERPRETATION', ko: '가사 해석', to: '/records/lyrics' },
      { en: 'SETLIST WORLD CUP', ko: '셋리 월드컵', to: '/records/worldcup' },
      { en: 'LIVE ARCHIVE', ko: '공연 아카이브', to: '/records/live' },
    ],
  },
  {
    no: '03', en: 'MINISTRY OF TRANSMISSIONS', ko: '통신부', to: '/transmissions', items: [
      { en: 'MCR TALK', ko: 'MCR 이야기', to: '/transmissions/talk' },
      { en: 'GENERAL TRANSMISSION', ko: '자유 게시판', to: '/transmissions/general' },
      { en: 'FAN CREATIONS', ko: '팬 창작', to: '/transmissions/creations' },
      { en: 'COMPANIONS', ko: '동행 구하기', to: '/transmissions/companions' },
      { en: 'ALL POSTS', ko: '전체 글', to: '/transmissions' },
    ],
  },
  {
    no: '04', en: 'MINISTRY OF CULTURAL AFFAIRS', ko: '문화부', to: '/culture', items: [
      { en: '11.07 NATIONAL EVENT', ko: '내한 공연', to: '/culture/event' },
      { en: 'UNIFORM INSPECTION', ko: '콘서트룩', to: '/culture/uniform' },
      { en: 'SETLIST PREDICTION', ko: '셋리 예측', to: '/culture/prediction' },
      { en: 'OPENING ACT GUESS', ko: '오프닝 밴드 추측', to: '/culture/opening' },
      { en: 'AFTER THE PARADE', ko: '공연 후기', to: '/culture/after' },
    ],
  },
  {
    no: '05', en: 'MOAT', ko: '기밀 보관소', to: '/moat', items: [
      { en: 'MOAT HISTORY', ko: '기관 연혁', to: '/moat?f=moat-history' },
      { en: 'SUBJECT RECORDS', ko: '대상자 기록', to: '/moat?f=subject-records' },
      { en: 'RECONDITIONING FILES', ko: '재교육 문서', to: '/moat?f=reconditioning' },
      { en: 'CLASSIFIED DOCUMENTS', ko: '기밀 문서', to: '/moat?f=classified' },
    ],
  },
]

export const BOTTOM_TABS: NavItem[] = [
  { en: 'HOME', ko: '홈', to: '/' },
  { en: 'NATION', ko: '국가', to: '/nation' },
  { en: 'ARCHIVE', ko: '기록', to: '/records' },
  { en: 'COMMUNITY', ko: '커뮤니티', to: '/transmissions' },
  { en: 'CITIZENS', ko: '시민', to: '/citizens' },
]
