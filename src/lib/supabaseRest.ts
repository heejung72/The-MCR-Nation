/**
 * Supabase Auth(GoTrue) + PostgREST를 fetch로 직접 호출하는 최소 클라이언트.
 * 외부 패키지 없이 익명 로그인, 카카오 OAuth(implicit flow), 세션 갱신, REST/RPC 호출을 처리한다.
 * 실시간 채팅 등 Realtime이 필요해지면 @supabase/supabase-js로 교체한다(같은 Repository 인터페이스 유지).
 */

const baseUrl = (import.meta.env.VITE_SUPABASE_URL ?? '').trim().replace(/\/+$/, '')
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim()

export const supabaseConfigured = Boolean(baseUrl && anonKey)

export type AuthUser = {
  id: string
  is_anonymous?: boolean
  user_metadata?: Record<string, unknown>
}

export type Session = {
  access_token: string
  refresh_token: string
  expires_at: number
  user: AuthUser
}

export class SupabaseError extends Error {
  status: number
  code?: string
  constructor(message: string, status: number, code?: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

const SESSION_KEY = 'mcr-nation:supabase-session'
const now = () => Math.floor(Date.now() / 1000)

function loadSession(): Session | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

function saveSession(session: Session | null) {
  try {
    if (session) window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    else window.localStorage.removeItem(SESSION_KEY)
  } catch {
    /* 저장소를 쓸 수 없는 환경에서는 현재 탭에서만 유지 */
  }
  current = session
}

let current: Session | null = supabaseConfigured ? loadSession() : null
let refreshing: Promise<Session | null> | null = null

type TokenResponse = {
  access_token: string
  refresh_token: string
  expires_in?: number | string
  expires_at?: number | string
  user: AuthUser
}

const toSession = (data: TokenResponse): Session => ({
  access_token: data.access_token,
  refresh_token: data.refresh_token,
  expires_at: Number(data.expires_at ?? now() + Number(data.expires_in ?? 3600)),
  user: data.user,
})

async function parseError(response: Response): Promise<SupabaseError> {
  let message = `요청 실패 (${response.status})`
  let code: string | undefined
  try {
    const body = await response.json()
    message = body.msg ?? body.message ?? body.error_description ?? body.error ?? message
    code = body.code ?? body.error_code
  } catch {
    /* 본문 없음 */
  }
  return new SupabaseError(String(message), response.status, code ? String(code) : undefined)
}

async function auth<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${baseUrl}/auth/v1${path}`, {
    ...init,
    headers: {
      apikey: anonKey,
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  })
  if (!response.ok) throw await parseError(response)
  const text = await response.text()
  return (text ? JSON.parse(text) : null) as T
}

async function refresh(session: Session): Promise<Session | null> {
  try {
    const data = await auth<TokenResponse>('/token?grant_type=refresh_token', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: session.refresh_token }),
    })
    const next = toSession(data)
    saveSession(next)
    return next
  } catch (error) {
    // 네트워크 오류는 세션을 유지하고, 토큰 거부(4xx)일 때만 로그아웃 처리
    if (error instanceof SupabaseError && error.status >= 400 && error.status < 500) saveSession(null)
    return null
  }
}

/** 만료 60초 전이면 refresh 토큰으로 갱신한 유효 세션을 돌려준다. */
export async function getSession(): Promise<Session | null> {
  if (!current) return null
  if (current.expires_at - 60 > now()) return current
  refreshing ??= refresh(current).finally(() => { refreshing = null })
  return refreshing
}

/** 카카오 로그인에서 돌아온 URL(#access_token=...)을 세션으로 저장한다. */
export async function consumeOAuthRedirect(): Promise<Session | null> {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const query = new URLSearchParams(window.location.search)
  const errorDescription = hash.get('error_description') ?? query.get('error_description')
  const cleanUrl = () => window.history.replaceState(null, '', window.location.pathname)

  if (errorDescription) {
    cleanUrl()
    throw new SupabaseError(errorDescription.replace(/\+/g, ' '), 400, hash.get('error_code') ?? query.get('error_code') ?? undefined)
  }
  const accessToken = hash.get('access_token')
  const refreshToken = hash.get('refresh_token')
  if (!accessToken || !refreshToken) return null

  cleanUrl()
  const user = await auth<AuthUser>('/user', { method: 'GET' }, accessToken)
  const session = toSession({
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_at: hash.get('expires_at') ?? undefined,
    expires_in: hash.get('expires_in') ?? undefined,
    user,
  })
  saveSession(session)
  return session
}

/** Supabase 익명 로그인. 닉네임은 user_metadata로 전달되어 DB 트리거가 프로필을 만든다. */
export async function signInAnonymously(nickname: string): Promise<Session> {
  const data = await auth<TokenResponse>('/signup', {
    method: 'POST',
    body: JSON.stringify({ data: { nickname } }),
  })
  const session = toSession(data)
  saveSession(session)
  return session
}

/** 카카오 동의 화면으로 이동한다. 이메일(account_email)은 요청하지 않는다. */
export function redirectToKakao(redirectTo = `${window.location.origin}${window.location.pathname}`) {
  const params = new URLSearchParams({
    provider: 'kakao',
    redirect_to: redirectTo,
    scopes: 'profile_nickname profile_image',
  })
  window.location.assign(`${baseUrl}/auth/v1/authorize?${params.toString()}`)
}

export async function signOut() {
  const session = current
  saveSession(null)
  if (session) {
    try {
      await auth('/logout', { method: 'POST' }, session.access_token)
    } catch {
      /* 로컬 세션은 이미 삭제됨 */
    }
  }
}

type RestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  prefer?: string
}

/** PostgREST 호출. 로그인 상태면 사용자 토큰, 아니면 anon 키로 요청한다(RLS가 권한을 판단). */
export async function rest<T>(path: string, options: RestOptions = {}): Promise<T> {
  const session = await getSession()
  const response = await fetch(`${baseUrl}/rest/v1/${path}`, {
    method: options.method ?? 'GET',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${session?.access_token ?? anonKey}`,
      'Content-Type': 'application/json',
      ...(options.prefer ? { Prefer: options.prefer } : {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })
  if (!response.ok) throw await parseError(response)
  const text = await response.text()
  return (text ? JSON.parse(text) : null) as T
}

/** Storage 업로드. 경로는 `<user-id>/<파일명>` 이어야 RLS를 통과한다. */
export async function uploadToStorage(bucket: string, path: string, file: Blob): Promise<string> {
  const session = await getSession()
  if (!session) throw new SupabaseError('먼저 시민 등록을 해 주세요.', 401)
  const response = await fetch(`${baseUrl}/storage/v1/object/${bucket}/${path}`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': file.type || 'application/octet-stream',
      'x-upsert': 'false',
    },
    body: file,
  })
  if (!response.ok) throw await parseError(response)
  return path
}

export const publicStorageUrl = (bucket: string, path: string) => `${baseUrl}/storage/v1/object/public/${bucket}/${path}`

export const currentUserId = () => current?.user.id ?? null
