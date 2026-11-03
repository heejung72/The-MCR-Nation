/**
 * 공연 관련 공식 소식 — 주최사(ualive) 인스타그램 게시물.
 * 서버 모드에서는 Supabase official_posts 테이블이 기준이며, 운영자가 공연 페이지에서 링크를 붙여넣어 추가·삭제한다.
 * 아래 목록은 서버 미연결(로컬 모드) 시 기본값이다.
 */
export const INSTAGRAM_ACCOUNT = { handle: 'ualive_stage', url: 'https://www.instagram.com/ualive_stage/' }

export type OfficialPost = { shortcode: string; account: string; note: string | null; pinned: boolean }

export const DEFAULT_OFFICIAL_POSTS: OfficialPost[] = [
  { shortcode: 'DfO8fhGnfzP', account: 'ualive_stage', note: '공연 당일 타임테이블', pinned: true },
  ...['DSd_Z2bk0yj', 'DfOZpdVnU9T', 'DfD_c5qHYFi', 'De-2TqLncBa', 'Dd0K1ndHSxf'].map((shortcode) => ({ shortcode, account: 'ualive_stage', note: null, pinned: false })),
]

export const instagramUrl = (shortcode: string) => `https://www.instagram.com/p/${shortcode}/`

/** instagram.com/p/<code>, /reel/<code>, /<계정>/p/<code> 링크 또는 shortcode 자체에서 shortcode를 뽑는다. */
export function parseInstagramShortcode(input: string): string | null {
  const text = input.trim()
  const match = text.match(/instagram\.com\/(?:[A-Za-z0-9._]+\/)?(?:p|reel|tv)\/([A-Za-z0-9_-]{5,40})/)
  if (match) return match[1]
  return /^[A-Za-z0-9_-]{5,40}$/.test(text) ? text : null
}
