/** 11.07 NATIONAL EVENT — 운영자가 관리하는 공연 정보. 변경 시 이 파일만 고치면 된다. */
export const CONCERT = {
  title: '마이 케미컬 로맨스 내한공연',
  titleEn: 'MY CHEMICAL ROMANCE LIVE IN KOREA',
  date: '2026-11-07',
  dateLabel: '2026.11.07 (SAT)',
  venue: '인천 파라다이스시티 컬처파크',
  venueEn: 'PARADISE CITY CULTURE PARK, INCHEON',
  ticketUrl: 'https://m.ticketlink.co.kr/product/57330',
  note: '입장·공연 시각, 예매 상태와 관람 유의사항은 주최사 공지를 최종 기준으로 확인해 주세요.',
}

/** 한국 시간 기준 D-day (공연 당일 0, 지난 뒤 음수) */
export function daysUntilConcert(now = new Date()): number {
  const kstToday = new Date(now.getTime() + 9 * 3600_000).toISOString().slice(0, 10)
  return Math.round((Date.parse(CONCERT.date) - Date.parse(kstToday)) / 86_400_000)
}

export const dDayLabel = (days = daysUntilConcert()) => days > 0 ? `D-${days}` : days === 0 ? 'D-DAY' : 'AFTER THE PARADE'

/** 공연 당일 타임테이블 — 출처: 주최사 인스타그램 게시물 DfO8fhGnfzP (ualive_stage). 변경 공지가 나오면 함께 고친다. */
export const TIMETABLE: { time: string; ko: string; en: string; highlight?: boolean }[] = [
  { time: '13:00', ko: '티켓 박스 / 머천다이즈 부스 / 물품보관소 오픈', en: 'TICKET BOX / MD BOOTH / LOCKERS OPEN' },
  { time: '15:30', ko: '스탠딩 대기 공간 오픈', en: 'QUEUEING AREA FOR STANDING OPENS' },
  { time: '16:30', ko: '스탠딩 입장 시작', en: 'STANDING ENTRY STARTS' },
  { time: '17:30', ko: '지정석 입장 시작', en: 'RESERVED SEAT ENTRY STARTS' },
  { time: '19:00', ko: 'MY CHEMICAL ROMANCE 공연 시작', en: 'SHOW STARTS', highlight: true },
  { time: '19:30', ko: '티켓 박스 운영 종료', en: 'TICKET BOX CLOSES' },
]
export const TIMETABLE_SOURCE = 'https://www.instagram.com/p/DfO8fhGnfzP/'
