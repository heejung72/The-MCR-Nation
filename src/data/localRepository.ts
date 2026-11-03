import { createAnonymousIdentity, getIdentity, getPosts, saveIdentity, savePosts } from '../storage'
import { DEFAULT_OFFICIAL_POSTS } from '../content/instagram'
import type { Identity } from '../types'
import type { Repository } from './repository'

const REPORTS_KEY = 'mcr-nation:reports'
const PREDICTION_KEY = 'mcr-nation:prediction'
const OPENING_KEY = 'mcr-nation:opening'
const newId = () => window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`

const requireIdentity = (): Identity => {
  const identity = getIdentity()
  if (!identity) throw new Error('먼저 익명 시민으로 등록해 주세요.')
  return { ...identity, role: identity.role ?? 'citizen' }
}

const readJson = <T,>(key: string, fallback: T): T => {
  try { return JSON.parse(window.localStorage.getItem(key) ?? '') as T } catch { return fallback }
}

/** 서버 설정(.env.local)이 없을 때 쓰는 브라우저 전용 저장소 */
export function createLocalRepository(): Repository {
  return {
    mode: 'local',
    init: async () => { const identity = getIdentity(); return identity ? { ...identity, role: identity.role ?? 'citizen' } : null },
    ensureIdentity: async () => { const identity = getIdentity() ?? createAnonymousIdentity(); return { ...identity, role: identity.role ?? 'citizen' } },
    async rename(nickname) {
      const next = { ...requireIdentity(), nickname }
      saveIdentity(next)
      return next
    },
    async signInWithKakao() {
      throw new Error('카카오 로그인은 Supabase 연결(.env.local) 후 사용할 수 있습니다.')
    },
    async signOut() {
      window.localStorage.removeItem('mcr-nation:identity')
    },
    listPosts: async () => getPosts(),
    async createPost({ board, title, body, imagePath }) {
      const author = requireIdentity()
      if (board === 'notice') throw new Error('공지는 운영자만 작성할 수 있습니다.')
      const post = { id: newId(), board, title, body, imagePath: imagePath ?? null, authorId: author.id, authorName: author.nickname, createdAt: new Date().toISOString(), comments: [] }
      savePosts([post, ...getPosts()])
      return post
    },
    async deletePost(id) {
      const author = requireIdentity()
      const posts = getPosts()
      if (posts.find((post) => post.id === id)?.authorId !== author.id) throw new Error('본인이 작성한 기록만 철회할 수 있습니다.')
      savePosts(posts.filter((post) => post.id !== id))
    },
    async addComment(postId, body) {
      const author = requireIdentity()
      const comment = { id: newId(), authorId: author.id, authorName: author.nickname, body, createdAt: new Date().toISOString() }
      savePosts(getPosts().map((post) => post.id === postId ? { ...post, comments: [...post.comments, comment] } : post))
      return comment
    },
    async report(target, reason) {
      const reports = readJson<unknown[]>(REPORTS_KEY, [])
      reports.push({ ...target, reason, createdAt: new Date().toISOString() })
      window.localStorage.setItem(REPORTS_KEY, JSON.stringify(reports))
    },
    async uploadImage(file) {
      // 로컬 모드: 브라우저 안에만 저장(data URL). 서버 연결 시 Supabase Storage 사용
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = () => reject(new Error('사진을 읽지 못했습니다.'))
        reader.readAsDataURL(file)
      })
    },
    imageUrl: (path) => path,
    async submitChampion() { /* 로컬 모드에서는 이 기기의 진행 상황만 저장 */ },
    bracketResults: async () => null,
    myPrediction: async () => readJson<string[]>(PREDICTION_KEY, []),
    async savePrediction(songs) { window.localStorage.setItem(PREDICTION_KEY, JSON.stringify(songs)) },
    predictionResults: async () => null,
    listOfficialPosts: async () => DEFAULT_OFFICIAL_POSTS,
    async addOfficialPost() { throw new Error('공식 소식 관리는 서버 연결 후 운영자만 할 수 있습니다.') },
    async removeOfficialPost() { throw new Error('공식 소식 관리는 서버 연결 후 운영자만 할 수 있습니다.') },
    myOpeningGuess: async () => window.localStorage.getItem(OPENING_KEY),
    async saveOpeningGuess(band) { window.localStorage.setItem(OPENING_KEY, band) },
    openingResults: async () => null,
  }
}
