import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createRepository, type NewPost, type ReportTarget, type Repository } from '../data'
import type { Identity, Post } from '../types'

type Nation = {
  repo: Repository
  isServer: boolean
  identity: Identity | null
  isAdmin: boolean
  posts: Post[]
  loading: boolean
  busy: boolean
  notice: string
  toast: (message: string) => void
  dismissToast: () => void
  fail: (error: unknown) => void
  /** 시민 등록이 필요한 행동 전에 호출. 미등록이면 등록 모달을 띄우고, 취소하면 null */
  requireCitizen: () => Promise<Identity | null>
  registration: { open: boolean; choose: (choice: 'anonymous' | 'kakao' | 'cancel') => void }
  createPost: (input: NewPost) => Promise<Post | null>
  deletePost: (id: string) => Promise<void>
  addComment: (postId: string, body: string) => Promise<boolean>
  report: (target: ReportTarget) => Promise<void>
  rename: () => Promise<void>
  signInWithKakao: () => Promise<void>
  signOut: () => Promise<void>
  refreshPosts: () => Promise<void>
}

const NationContext = createContext<Nation | null>(null)

export function NationProvider({ children }: { children: ReactNode }) {
  const repo = useMemo(() => createRepository(), [])
  const [identity, setIdentity] = useState<Identity | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [registrationOpen, setRegistrationOpen] = useState(false)
  const resolver = useRef<((identity: Identity | null) => void) | null>(null)
  const identityRef = useRef<Identity | null>(null)
  identityRef.current = identity

  const toast = useCallback((message: string) => setNotice(message), [])
  const fail = useCallback((error: unknown) => setNotice(error instanceof Error ? error.message : '요청을 처리하지 못했습니다.'), [])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(''), 5000)
    return () => window.clearTimeout(timer)
  }, [notice])

  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const current = await repo.init()
        if (!alive) return
        setIdentity(current)
        const list = await repo.listPosts()
        if (alive) setPosts(list)
      } catch (error) {
        if (alive) fail(error)
      } finally {
        if (alive) setLoading(false)
      }
    }
    void load()
    return () => { alive = false }
  }, [repo, fail])

  const run = useCallback(async <T,>(task: () => Promise<T>): Promise<T | null> => {
    setBusy(true)
    try { return await task() } catch (error) { fail(error); return null } finally { setBusy(false) }
  }, [fail])

  const requireCitizen = useCallback(() => {
    if (identityRef.current) return Promise.resolve(identityRef.current)
    setRegistrationOpen(true)
    return new Promise<Identity | null>((resolve) => { resolver.current = resolve })
  }, [])

  const choose = useCallback((choice: 'anonymous' | 'kakao' | 'cancel') => {
    const finish = (value: Identity | null) => { resolver.current?.(value); resolver.current = null; setRegistrationOpen(false) }
    if (choice === 'cancel') return finish(null)
    if (choice === 'kakao') { finish(null); void run(() => repo.signInWithKakao()); return }
    void run(async () => {
      const next = await repo.ensureIdentity()
      setIdentity(next)
      setNotice(`시민 등록 완료 — ${next.nickname}`)
      finish(next)
      return next
    }).then((value) => { if (!value) finish(null) })
  }, [repo, run])

  const nation: Nation = {
    repo,
    isServer: repo.mode === 'supabase',
    identity,
    isAdmin: identity?.role === 'admin',
    posts,
    loading,
    busy,
    notice,
    toast,
    dismissToast: () => setNotice(''),
    fail,
    requireCitizen,
    registration: { open: registrationOpen, choose },
    async createPost(input) {
      if (!(await requireCitizen())) return null
      return run(async () => {
        const post = await repo.createPost(input)
        setPosts((current) => [post, ...current])
        setNotice('기록을 보관했습니다.')
        return post
      })
    },
    async deletePost(id) {
      if (!window.confirm('이 기록을 철회할까요? 되돌릴 수 없습니다.')) return
      await run(async () => {
        await repo.deletePost(id)
        setPosts((current) => current.filter((post) => post.id !== id))
        setNotice('기록을 철회했습니다.')
      })
    },
    async addComment(postId, body) {
      const content = body.trim()
      if (!content || !(await requireCitizen())) return false
      const comment = await run(() => repo.addComment(postId, content))
      if (!comment) return false
      setPosts((current) => current.map((post) => post.id === postId ? { ...post, comments: [...post.comments, comment] } : post))
      return true
    },
    async report(target) {
      if (!(await requireCitizen())) return
      const reason = window.prompt('신고 사유를 적어 주세요. (예: 개인정보 노출, 가사 전문 게시, 혐오 표현)')?.trim()
      if (!reason) return
      await run(async () => {
        await repo.report(target, reason.slice(0, 300))
        setNotice(repo.mode === 'supabase' ? '신고가 운영자 보관함에 접수되었습니다.' : '신고를 이 기기에 기록했습니다.')
      })
    },
    async rename() {
      const current = await requireCitizen()
      if (!current) return
      const nickname = window.prompt('새 별칭을 입력하세요. 실명·연락처 등 개인정보는 쓰지 마세요.', current.nickname)?.trim()
      if (!nickname) return
      await run(async () => {
        setIdentity(await repo.rename(nickname.slice(0, 20)))
        setNotice('별칭을 바꿨습니다. 이전 기록의 표시는 유지됩니다.')
      })
    },
    async signInWithKakao() {
      if (identity?.type === 'anonymous' && !window.confirm('카카오로 로그인하면 새 계정으로 시작합니다. 지금 익명 별칭으로 쓴 기록은 익명 계정에 남습니다. 계속할까요?')) return
      await run(() => repo.signInWithKakao())
    },
    async signOut() {
      await run(async () => {
        await repo.signOut()
        setIdentity(null)
        setNotice('로그아웃했습니다.')
      })
    },
    async refreshPosts() {
      await run(async () => setPosts(await repo.listPosts()))
    },
  }

  return <NationContext.Provider value={nation}>{children}</NationContext.Provider>
}

export function useNation() {
  const nation = useContext(NationContext)
  if (!nation) throw new Error('useNation must be used inside NationProvider')
  return nation
}
