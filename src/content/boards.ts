import type { BoardId } from '../types'

export const BOARDS: Record<BoardId, { en: string; ko: string; hint: string }> = {
  notice: { en: 'GOVERNMENT DISPATCH', ko: '정부 공지', hint: '운영진 공지입니다.' },
  talk: { en: 'MCR TALK', ko: 'MCR 이야기', hint: '밴드, 음악, 멤버 이야기를 나눠요.' },
  general: { en: 'GENERAL TRANSMISSION', ko: '자유 게시판', hint: '무엇이든 자유롭게.' },
  creations: { en: 'FAN CREATIONS', ko: '팬 창작', hint: '그림, 글, 영상 등 직접 만든 작품을 공유해요.' },
  lyrics: { en: 'LYRIC INTERPRETATION', ko: '가사 해석', hint: '가사 전문 대신 짧은 인용과 해석·감상을 남겨 주세요.' },
  companions: { en: 'COMPANIONS', ko: '동행 구하기', hint: '개인 연락처는 댓글보다 쪽지·오픈채팅 링크로 안전하게 주고받으세요.' },
  looks: { en: 'UNIFORM INSPECTION', ko: '콘서트룩', hint: '사진과 함께 콘서트룩을 공유해요. 다른 사람이 나온 사진은 동의를 받아 주세요.' },
  after: { en: 'AFTER THE PARADE', ko: '공연 후기', hint: '공연 후기와 사진을 남겨요. 공연 녹화 영상 전체 업로드는 삼가 주세요.' },
}

/** 일반 시민이 고를 수 있는 게시판(통신부 글쓰기) */
export const TRANSMISSION_BOARDS: BoardId[] = ['talk', 'general', 'creations', 'companions']
