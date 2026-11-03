/**
 * 세계관 기록(NATIONAL LORE · MOAT).
 * status
 *  - canon: 공식 앨범·공식 채널 등에서 확인된 설정
 *  - fan: 팬(또는 이 사이트)의 해석 — 공식 설정이 아님
 *  - unverified: 공연·팬 아카이브에서 언급되지만 아직 운영자가 출처를 검토하지 않은 내용
 * 운영자가 출처를 확인하면 sources와 reviewedAt을 채우고 status를 바꾼다.
 */
export type LoreStatus = 'canon' | 'fan' | 'unverified'
export type LoreEntry = {
  slug: string
  fileNo: string
  section: 'lore' | 'moat-history' | 'subject-records' | 'reconditioning' | 'classified'
  title: string
  summary: string
  body: string
  status: LoreStatus
  sources: { label: string; url?: string }[]
  reviewedAt: string | null
}

export const STATUS_LABEL: Record<LoreStatus, { en: string; ko: string }> = {
  canon: { en: 'CANON', ko: '공식 설정' },
  fan: { en: 'FAN INTERPRETATION', ko: '팬 해석' },
  unverified: { en: 'UNVERIFIED', ko: '미검증' },
}

export const LORE: LoreEntry[] = [
  {
    slug: 'the-black-parade', fileNo: '001', section: 'lore', title: 'SUBJECT: THE BLACK PARADE',
    summary: '죽음을 앞둔 환자 “The Patient”의 이야기를 담은 2006년 콘셉트 앨범.',
    body: '앨범은 병상에 누운 The Patient가 삶을 돌아보는 이야기로 구성된다. 죽음은 그가 가장 아끼던 기억 — 어린 시절 아버지와 함께 본 퍼레이드 — 의 모습으로 그를 찾아온다. 이 사이트의 행진·기록·장례 행렬 이미지는 이 설정에서 출발한다.',
    status: 'canon', sources: [{ label: '앨범 The Black Parade (2006) 및 밴드 인터뷰 — 운영자 출처 링크 추가 필요' }], reviewedAt: null,
  },
  {
    slug: 'long-live-the-black-parade', fileNo: '002', section: 'lore', title: 'LONG LIVE THE BLACK PARADE',
    summary: 'The Black Parade를 중심으로 한 투어. 무대 연출은 가상의 국가 Draag를 배경으로 한다고 알려져 있다.',
    body: '투어 무대는 국가 행사·선전 방송·의식처럼 연출된 장면들로 이어진다고 공연 관람기와 영상에서 전해진다. 세부 설정(인물, 기관, 연표)은 공식 발표가 아닌 현장 기록에 기반하므로 운영자 검토 전까지 미검증으로 표시한다.',
    status: 'unverified', sources: [{ label: '공연 영상·관람 기록 — 운영자 검토 필요' }], reviewedAt: null,
  },
  {
    slug: 'draag', fileNo: '003', section: 'lore', title: 'THE NATION OF DRAAG',
    summary: '투어 연출 속 가상의 국가. 이 사이트는 Draag의 “시민 포털”이라는 콘셉트로 만들어졌다.',
    body: '정부 기록 보관소, 행정 문서, 선전물의 분위기는 이 사이트의 디자인 해석이다. Draag의 통치 기관·법·역사에 대한 상세 설명은 팬 아카이브마다 다르므로, 출처가 확인된 항목만 공식 설정으로 옮긴다.',
    status: 'unverified', sources: [{ label: '팬 아카이브 정리 — 운영자 검토 필요' }], reviewedAt: null,
  },
  {
    slug: 'portal-concept', fileNo: '004', section: 'lore', title: 'WHY A NATION?',
    summary: '“We don’t belong anywhere. So we built our own nation.” — THE MCR NATION의 해석.',
    body: '어디에도 속하지 못한다고 느끼던 사람들이 이 밴드의 음악 아래 모였다는 감각을, 하나의 국가와 시민권이라는 형식으로 옮긴 것이 이 사이트의 출발점이다. 공식 설정이 아닌 팬 커뮤니티의 해석이다.',
    status: 'fan', sources: [{ label: 'THE MCR NATION 운영진' }], reviewedAt: '2026-11-03',
  },
  {
    slug: 'moat', fileNo: 'M-01', section: 'moat-history', title: 'M.O.A.T.',
    summary: '팬 아카이브에서 Draag 세계관의 기관으로 언급되는 이름.',
    body: '명칭의 의미와 역할은 아직 공식적으로 확인되지 않았다. 출처가 확인되면 이 문서를 갱신한다.',
    status: 'unverified', sources: [{ label: '팬 아카이브 언급 — 운영자 검토 필요' }], reviewedAt: null,
  },
]
