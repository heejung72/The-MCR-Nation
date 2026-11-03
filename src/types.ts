export type BoardId = 'general' | 'looks' | 'lyrics' | 'companions'

export type Identity = {
  id: string
  nickname: string
  type: 'anonymous' | 'kakao'
}

export type Comment = {
  id: string
  authorId: string
  authorName: string
  body: string
  createdAt: string
}

export type Post = {
  id: string
  board: BoardId
  title: string
  body: string
  authorId: string
  authorName: string
  createdAt: string
  comments: Comment[]
}

export type BracketState = {
  index: number
  winners: string[]
  champion?: string
}
