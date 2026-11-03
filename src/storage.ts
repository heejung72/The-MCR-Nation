import type { BracketState, Identity, Post } from './types'

const keys = {
  identity: 'mcr-nation:identity',
  posts: 'mcr-nation:posts',
  bracket: 'mcr-nation:bracket',
}

const samplePosts: Post[] = [
  {
    id: 'record-001',
    board: 'general',
    title: '내한공연 전에 꼭 챙길 것 같이 정리해요',
    body: '입장 동선, 날씨, 귀마개, 귀가 방법을 한 기록에 모아 두면 좋겠습니다. 확인한 정보는 출처를 함께 남겨 주세요.',
    authorId: 'archive',
    authorName: '기록 보관관',
    createdAt: '2026-11-03T09:00:00.000Z',
    comments: [],
  },
  {
    id: 'record-002',
    board: 'talk',
    imagePath: null,
    title: '블랙 퍼레이드 느낌의 겨울 레이어드',
    body: '검정만 쓰기보다 바랜 회색 셔츠와 작은 붉은 포인트를 섞어 볼 생각이에요. 오래 서 있어도 편한 신발이 제일 중요합니다.',
    authorId: 'citizen-01',
    authorName: '잿빛 밀 이삭 117',
    createdAt: '2026-11-02T15:30:00.000Z',
    comments: [],
  },
]

const read = <T,>(key: string, fallback: T): T => {
  try {
    const value = window.localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

const write = <T,>(key: string, value: T) => window.localStorage.setItem(key, JSON.stringify(value))

const createId = () => window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`

const nouns = ['검은 사슴', '밀 이삭', '회색 나팔', '붉은 검인', '콘크리트 별', '밤의 행진']
const modifiers = ['잔향의', '낯선', '느린', '작은', '고요한', '먼 곳의']

export function getIdentity(): Identity | null {
  return read<Identity | null>(keys.identity, null)
}

const pick = (list: string[]) => list[Math.floor(Math.random() * list.length)]

/** 개인정보 없는 랜덤 별칭 (예: 잔향의 검은 사슴 482) */
export const randomNickname = () => `${pick(modifiers)} ${pick(nouns)} ${Math.floor(100 + Math.random() * 900)}`

export function createAnonymousIdentity(): Identity {
  const nickname = randomNickname()
  const identity: Identity = { id: createId(), nickname, type: 'anonymous', role: 'citizen' }
  write(keys.identity, identity)
  return identity
}

export const saveIdentity = (identity: Identity) => write(keys.identity, identity)
export const getPosts = () => read<Post[]>(keys.posts, samplePosts)
export const savePosts = (posts: Post[]) => write(keys.posts, posts)
export const getBracket = () => read<BracketState>(keys.bracket, { index: 0, winners: [] })
export const saveBracket = (state: BracketState) => write(keys.bracket, state)
export const resetBracket = () => saveBracket({ index: 0, winners: [] })
