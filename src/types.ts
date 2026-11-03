export type BoardId = 'notice' | 'talk' | 'general' | 'creations' | 'lyrics' | 'companions' | 'looks' | 'after'

export type Identity = {
  id: string
  nickname: string
  type: 'anonymous' | 'kakao'
  role: 'citizen' | 'admin'
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
  imagePath?: string | null
  comments: Comment[]
}

export type BracketState = {
  index: number
  winners: string[]
  champion?: string
}
