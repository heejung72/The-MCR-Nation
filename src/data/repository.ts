import type { OfficialPost } from '../content/instagram'
import type { BoardId, Comment, Identity, Post } from '../types'

export type ReportTarget = { type: 'post' | 'comment'; id: string }
export type BracketResult = { song: string; votes: number }
export type PredictionResult = { song: string; votes: number; voters: number }
export type OpeningResult = { band: string; votes: number; total: number }
export type NewPost = { board: BoardId; title: string; body: string; imagePath?: string | null }

/**
 * 화면은 이 인터페이스만 사용한다.
 * - local: API 키 없이 브라우저(localStorage)에만 저장 — 개발·데모용
 * - supabase: 여러 사용자가 함께 보는 서버 저장소 + 익명/카카오 로그인
 */
export interface Repository {
  readonly mode: 'local' | 'supabase'
  /** 앱 시작 시 1회: 카카오 로그인 복귀 처리 및 현재 신원 확인 */
  init(): Promise<Identity | null>
  /** 신원이 없으면 랜덤 별칭의 익명 시민을 발급한다 */
  ensureIdentity(): Promise<Identity>
  rename(nickname: string): Promise<Identity>
  signInWithKakao(): Promise<void>
  signOut(): Promise<void>
  listPosts(): Promise<Post[]>
  createPost(input: NewPost): Promise<Post>
  deletePost(id: string): Promise<void>
  addComment(postId: string, body: string): Promise<Comment>
  report(target: ReportTarget, reason: string): Promise<void>
  /** 사진을 업로드하고 저장 경로를 돌려준다(게시글 imagePath에 사용) */
  uploadImage(file: Blob, extension: string): Promise<string>
  imageUrl(path: string): string
  submitChampion(song: string): Promise<void>
  /** 전체 집계. 서버가 없으면 null */
  bracketResults(): Promise<BracketResult[] | null>
  myPrediction(): Promise<string[]>
  savePrediction(songs: string[]): Promise<void>
  predictionResults(): Promise<PredictionResult[] | null>
  /** 공식 소식(인스타그램) — 고정 글 먼저, 최신순 */
  listOfficialPosts(): Promise<OfficialPost[]>
  addOfficialPost(input: { shortcode: string; note?: string | null; pinned?: boolean }): Promise<void>
  removeOfficialPost(shortcode: string): Promise<void>
  /** 오프닝 밴드 추측 — 1인 1추측 */
  myOpeningGuess(): Promise<string | null>
  saveOpeningGuess(band: string): Promise<void>
  openingResults(): Promise<OpeningResult[] | null>
}
