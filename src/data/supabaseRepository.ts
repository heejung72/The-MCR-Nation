import { consumeOAuthRedirect, currentUserId, getSession, publicStorageUrl, redirectToKakao, rest, signInAnonymously, signOut, SupabaseError, uploadToStorage } from '../lib/supabaseRest'
import { randomNickname } from '../storage'
import type { OfficialPost } from '../content/instagram'
import type { BoardId, Comment, Identity, Post } from '../types'
import type { BracketResult, OpeningResult, PredictionResult, Repository } from './repository'

const BUCKET = 'citizen-uploads'

type ProfileRow = { id: string; nickname: string; kind: 'anonymous' | 'kakao'; role: 'citizen' | 'admin' }
type CommentRow = { id: string; author_id: string; author_name: string; body: string; created_at: string }
type PostRow = { id: string; board: BoardId; title: string; body: string; author_id: string; author_name: string; created_at: string; image_path: string | null; comments?: CommentRow[] }

const PROFILE_FIELDS = 'id,nickname,kind,role'
const POST_FIELDS = 'id,board,title,body,author_id,author_name,created_at,image_path'

const toIdentity = (row: ProfileRow): Identity => ({ id: row.id, nickname: row.nickname, type: row.kind, role: row.role })
const toComment = (row: CommentRow): Comment => ({ id: row.id, authorId: row.author_id, authorName: row.author_name, body: row.body, createdAt: row.created_at })
const toPost = (row: PostRow): Post => ({
  id: row.id, board: row.board, title: row.title, body: row.body, authorId: row.author_id, authorName: row.author_name, createdAt: row.created_at,
  imagePath: row.image_path, comments: (row.comments ?? []).map(toComment),
})

/** Supabase 오류를 사용자가 조치할 수 있는 한국어 안내로 바꾼다. */
function explain(error: unknown): Error {
  if (!(error instanceof Error)) return new Error('요청을 처리하지 못했습니다.')
  const message = error.message.toLowerCase()
  if (error instanceof SupabaseError) {
    if (error.code === 'PGRST205' || error.code === '42P01' || message.includes('could not find the table'))
      return new Error('Supabase에 테이블이 아직 없습니다. supabase/migrations의 SQL을 순서대로 실행해 주세요.')
    if (message.includes('anonymous sign-ins are disabled'))
      return new Error('Supabase에서 익명 로그인이 꺼져 있습니다. Authentication → Sign In / Providers에서 Anonymous sign-ins를 켜 주세요.')
    if (error.status === 429 || message.includes('rate limit'))
      return new Error('요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.')
    if (error.status === 413 || message.includes('maximum allowed size') || message.includes('payload too large'))
      return new Error('사진 용량이 너무 큽니다. 5MB 이하로 올려 주세요.')
    if (message.includes('mime type') || message.includes('invalid_mime_type'))
      return new Error('JPG, PNG, WEBP 사진만 올릴 수 있습니다.')
    if (error.code === '23505') return new Error('이미 처리된 요청입니다.')
    if (error.status === 401 || error.status === 403 || error.code === '42501')
      return new Error(error.message.match(/[가-힣]/) ? error.message : '권한이 없습니다. 다시 로그인하거나 본인 기록인지 확인해 주세요.')
  }
  if (message.includes('failed to fetch')) return new Error('서버에 연결하지 못했습니다. 네트워크와 .env.local의 Supabase URL을 확인해 주세요.')
  return error
}

const guard = async <T,>(task: () => Promise<T>): Promise<T> => {
  try { return await task() } catch (error) { throw explain(error) }
}

export function createSupabaseRepository(): Repository {
  let initPromise: Promise<Identity | null> | null = null

  const loadProfile = async (): Promise<Identity | null> => {
    const session = await getSession()
    if (!session) return null
    const rows = await rest<ProfileRow[]>(`profiles?id=eq.${session.user.id}&select=${PROFILE_FIELDS}`)
    return rows[0] ? toIdentity(rows[0]) : null
  }

  return {
    mode: 'supabase',
    init() {
      // StrictMode 이중 실행에도 OAuth 복귀 처리는 한 번만
      initPromise ??= guard(async () => {
        await consumeOAuthRedirect()
        return loadProfile()
      })
      return initPromise
    },
    ensureIdentity: () => guard(async () => {
      const existing = await loadProfile()
      if (existing) return existing
      await signInAnonymously(randomNickname())
      const created = await loadProfile()
      if (!created) throw new Error('프로필이 생성되지 않았습니다. handle_new_user 트리거를 확인해 주세요.')
      return created
    }),
    rename: (nickname) => guard(async () => {
      const session = await getSession()
      if (!session) throw new Error('먼저 시민 등록을 해 주세요.')
      const rows = await rest<ProfileRow[]>(`profiles?id=eq.${session.user.id}&select=${PROFILE_FIELDS}`, { method: 'PATCH', body: { nickname }, prefer: 'return=representation' })
      if (!rows[0]) throw new Error('별칭을 바꾸지 못했습니다.')
      return toIdentity(rows[0])
    }),
    async signInWithKakao() {
      redirectToKakao()
    },
    signOut: () => guard(signOut),
    listPosts: () => guard(async () => {
      const select = `${POST_FIELDS},comments(id,author_id,author_name,body,created_at)`
      const rows = await rest<PostRow[]>(`posts?select=${select}&order=created_at.desc&comments.order=created_at.asc&limit=300`)
      return rows.map(toPost)
    }),
    createPost: (input) => guard(async () => {
      const body = { board: input.board, title: input.title, body: input.body, image_path: input.imagePath ?? null }
      const rows = await rest<PostRow[]>(`posts?select=${POST_FIELDS}`, { method: 'POST', body, prefer: 'return=representation' })
      return toPost({ ...rows[0], comments: [] })
    }),
    deletePost: (id) => guard(async () => {
      const rows = await rest<PostRow[]>(`posts?id=eq.${encodeURIComponent(id)}&select=id`, { method: 'DELETE', prefer: 'return=representation' })
      if (!rows.length) throw new Error('본인이 작성한 기록만 철회할 수 있습니다.')
    }),
    addComment: (postId, body) => guard(async () => {
      const rows = await rest<CommentRow[]>('comments?select=id,author_id,author_name,body,created_at', { method: 'POST', body: { post_id: postId, body }, prefer: 'return=representation' })
      return toComment(rows[0])
    }),
    report: (target, reason) => guard(async () => {
      await rest('reports', { method: 'POST', body: { target_type: target.type, target_id: target.id, reason }, prefer: 'return=minimal' })
    }),
    uploadImage: (file, extension) => guard(async () => {
      const userId = currentUserId()
      if (!userId) throw new Error('먼저 시민 등록을 해 주세요.')
      const name = `${Date.now()}-${(window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)).slice(0, 8)}.${extension}`
      return uploadToStorage(BUCKET, `${userId}/${name}`, file)
    }),
    imageUrl: (path) => path.startsWith('data:') ? path : publicStorageUrl(BUCKET, path),
    submitChampion: (song) => guard(async () => {
      await rest('rpc/cast_bracket_vote', { method: 'POST', body: { song } })
    }),
    bracketResults: () => guard(async () => {
      const rows = await rest<{ champion: string; votes: number }[]>('rpc/get_bracket_results', { method: 'POST', body: {} })
      return rows.map((row): BracketResult => ({ song: row.champion, votes: Number(row.votes) }))
    }),
    myPrediction: () => guard(async () => {
      if (!(await getSession())) return []
      return rest<string[]>('rpc/get_my_setlist_prediction', { method: 'POST', body: {} })
    }),
    savePrediction: (songs) => guard(async () => {
      await rest('rpc/set_setlist_prediction', { method: 'POST', body: { songs } })
    }),
    predictionResults: () => guard(async () => {
      const rows = await rest<{ song: string; votes: number; voters: number }[]>('rpc/get_setlist_prediction_results', { method: 'POST', body: {} })
      return rows.map((row): PredictionResult => ({ song: row.song, votes: Number(row.votes), voters: Number(row.voters) }))
    }),
    listOfficialPosts: () => guard(() => rest<OfficialPost[]>('official_posts?select=shortcode,account,note,pinned&order=pinned.desc,created_at.desc&limit=60')),
    addOfficialPost: (input) => guard(async () => {
      await rest('official_posts', { method: 'POST', body: { shortcode: input.shortcode, note: input.note || null, pinned: Boolean(input.pinned) }, prefer: 'return=minimal' })
    }),
    removeOfficialPost: (shortcode) => guard(async () => {
      const rows = await rest<{ shortcode: string }[]>(`official_posts?shortcode=eq.${encodeURIComponent(shortcode)}&select=shortcode`, { method: 'DELETE', prefer: 'return=representation' })
      if (!rows.length) throw new Error('운영자만 삭제할 수 있습니다.')
    }),
    myOpeningGuess: () => guard(async () => {
      if (!(await getSession())) return null
      return rest<string | null>('rpc/get_my_opening_guess', { method: 'POST', body: {} })
    }),
    saveOpeningGuess: (band) => guard(async () => {
      await rest('rpc/set_opening_guess', { method: 'POST', body: { band } })
    }),
    openingResults: () => guard(async () => {
      const rows = await rest<{ band: string; votes: number; total: number }[]>('rpc/get_opening_guess_results', { method: 'POST', body: {} })
      return rows.map((row): OpeningResult => ({ band: row.band, votes: Number(row.votes), total: Number(row.total) }))
    }),
  }
}
