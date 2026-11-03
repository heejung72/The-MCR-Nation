import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { BOARDS } from '../content/boards'
import { useNation } from '../context/NationContext'
import { prepareImage } from '../lib/image'
import type { BoardId, Post } from '../types'
import { Modal, timeAgo } from './ui'

/** 게시글 상세 (모달) */
export function PostModal({ post, onClose }: { post: Post | null; onClose: () => void }) {
  const nation = useNation()
  const [comment, setComment] = useState('')
  const live = post ? nation.posts.find((item) => item.id === post.id) ?? post : null
  const canDelete = live && nation.identity && (live.authorId === nation.identity.id || nation.isAdmin)
  return (
    <Modal open={Boolean(live)} onClose={onClose} label={live?.title ?? '게시글'} wide>
      {live && (
        <article className="post-detail">
          <p className="kicker">{BOARDS[live.board].en} · {BOARDS[live.board].ko}</p>
          <h2>{live.title}</h2>
          <p className="post-meta"><span>{live.authorName}</span><time dateTime={live.createdAt}>{timeAgo(live.createdAt)}</time></p>
          {live.imagePath && <img className="post-image" src={nation.repo.imageUrl(live.imagePath)} alt={`${live.authorName}이 올린 사진: ${live.title}`} />}
          <p className="post-body">{live.body}</p>
          <div className="post-actions">
            <button className="text-link" onClick={() => void nation.report({ type: 'post', id: live.id })}>신고</button>
            {canDelete && <button className="text-link danger" onClick={() => void nation.deletePost(live.id).then(onClose)}>{live.authorId === nation.identity?.id ? '내 기록 철회' : '운영자 삭제'}</button>}
          </div>
          <section className="comments" aria-label="의견">
            <h3>의견 {live.comments.length}</h3>
            {live.comments.map((item) => (
              <div key={item.id} className="comment">
                <b>{item.authorName}</b><span>{item.body}</span>
                <small>{timeAgo(item.createdAt)} · <button className="text-link" onClick={() => void nation.report({ type: 'comment', id: item.id })}>신고</button></small>
              </div>
            ))}
            <form onSubmit={(event) => { event.preventDefault(); void nation.addComment(live.id, comment).then((ok) => { if (ok) setComment('') }) }}>
              <input value={comment} onChange={(event) => setComment(event.target.value)} maxLength={300} placeholder="의견을 남기세요" aria-label="의견 내용" />
              <button type="submit" className="btn btn-red" disabled={nation.busy}>등록</button>
            </form>
          </section>
        </article>
      )}
    </Modal>
  )
}

/** 글쓰기 폼. photo='required'면 사진 필수(콘서트룩) */
export function Composer({ boards, defaultBoard, photo = 'optional', onDone }: { boards: BoardId[]; defaultBoard: BoardId; photo?: 'none' | 'optional' | 'required'; onDone: () => void }) {
  const nation = useNation()
  const [board, setBoard] = useState<BoardId>(defaultBoard)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!file) { setPreview(null); return }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const title = String(data.get('title') ?? '').trim()
    const body = String(data.get('body') ?? '').trim()
    if (!title || !body) return nation.toast('제목과 본문을 모두 입력해 주세요.')
    if (photo === 'required' && !file) return nation.toast('콘서트룩은 사진이 필요해요.')
    if (!(await nation.requireCitizen())) return
    setUploading(true)
    try {
      let imagePath: string | null = null
      if (file) {
        const prepared = await prepareImage(file)
        imagePath = await nation.repo.uploadImage(prepared.blob, prepared.extension)
      }
      const post = await nation.createPost({ board, title, body, imagePath })
      if (post) { form.reset(); setFile(null); onDone() }
    } catch (error) {
      nation.fail(error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <form className="composer" onSubmit={(event) => void submit(event)}>
      {boards.length > 1 && (
        <label>분류
          <select value={board} onChange={(event) => setBoard(event.target.value as BoardId)}>
            {boards.map((id) => <option key={id} value={id}>{BOARDS[id].en} · {BOARDS[id].ko}</option>)}
          </select>
        </label>
      )}
      <p className="composer-hint">{BOARDS[board].hint}</p>
      <label>제목<input name="title" maxLength={80} required placeholder="기록의 제목" /></label>
      <label>내용<textarea name="body" maxLength={1600} required rows={6} placeholder="개인정보(실명·연락처)는 적지 마세요." /></label>
      {photo !== 'none' && (
        <label className="file-field">사진 {photo === 'required' ? '(필수)' : '(선택)'} — JPG·PNG·WEBP, 자동으로 줄여서 올라가요
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setFile(event.target.files?.[0] ?? null)} required={photo === 'required'} />
        </label>
      )}
      {preview && <img className="composer-preview" src={preview} alt="올릴 사진 미리보기" />}
      <div className="composer-actions">
        <button className="btn btn-red" type="submit" disabled={nation.busy || uploading}>{uploading ? '보관 중…' : '기록 보관'}</button>
        <button className="text-link" type="button" onClick={onDone}>닫기</button>
      </div>
    </form>
  )
}

export function PostRow({ post, onOpen, showBoard = true }: { post: Post; onOpen: (post: Post) => void; showBoard?: boolean }) {
  const nation = useNation()
  return (
    <li className="post-row">
      <button onClick={() => onOpen(post)}>
        {post.imagePath ? <img src={nation.repo.imageUrl(post.imagePath)} alt="" loading="lazy" /> : <span className="post-thumb" aria-hidden="true">✦</span>}
        <span className="post-row-main">
          <strong>{post.title}</strong>
          <small>{showBoard && <em className="tag">{BOARDS[post.board].en}</em>}{post.authorName} · {timeAgo(post.createdAt)}</small>
        </span>
        <span className="post-row-count" aria-label={`의견 ${post.comments.length}개`}>💬 {post.comments.length}</span>
      </button>
    </li>
  )
}

/** 게시판: 분류 탭·검색·정렬·목록·글쓰기 */
export function BoardView({ boards, writable, title, photo = 'optional', gallery = false }: { boards: BoardId[]; writable: BoardId[]; title?: string; photo?: 'none' | 'optional' | 'required'; gallery?: boolean }) {
  const nation = useNation()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<'latest' | 'popular'>('latest')
  const [composing, setComposing] = useState(false)
  const [open, setOpen] = useState<Post | null>(null)

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = nation.posts.filter((post) => boards.includes(post.board) && (!q || `${post.title} ${post.body} ${post.authorName}`.toLowerCase().includes(q)))
    return sort === 'popular' ? [...filtered].sort((a, b) => b.comments.length - a.comments.length) : filtered
  }, [nation.posts, boards, query, sort])

  return (
    <div className="board">
      <div className="board-tools">
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="게시글 검색" aria-label={`${title ?? '게시판'} 검색`} />
        <div className="segmented" role="group" aria-label="정렬">
          <button className={sort === 'latest' ? 'active' : ''} onClick={() => setSort('latest')} aria-pressed={sort === 'latest'}>최신</button>
          <button className={sort === 'popular' ? 'active' : ''} onClick={() => setSort('popular')} aria-pressed={sort === 'popular'}>인기</button>
        </div>
        {writable.length > 0 && <button className="btn btn-red" onClick={() => void nation.requireCitizen().then((ok) => { if (ok) setComposing(true) })}>✎ 글쓰기</button>}
      </div>
      {composing && <Composer boards={writable} defaultBoard={writable[0]} photo={photo} onDone={() => setComposing(false)} />}
      {nation.loading ? <p className="empty">기록을 불러오는 중입니다…</p>
        : !list.length ? <p className="empty">{query ? '검색 결과가 없습니다.' : '아직 기록이 없습니다. 첫 기록을 남겨 보세요.'}</p>
        : gallery ? (
          <ul className="gallery">
            {list.map((post) => (
              <li key={post.id}>
                <button onClick={() => setOpen(post)}>
                  {post.imagePath ? <img src={nation.repo.imageUrl(post.imagePath)} alt={`${post.authorName}의 콘서트룩: ${post.title}`} loading="lazy" /> : <span className="gallery-empty">NO PHOTO</span>}
                  <span className="gallery-caption"><strong>{post.title}</strong><small>{post.authorName} · 💬 {post.comments.length}</small></span>
                </button>
              </li>
            ))}
          </ul>
        ) : <ul className="post-list">{list.map((post) => <PostRow key={post.id} post={post} onOpen={setOpen} showBoard={boards.length > 1} />)}</ul>}
      <PostModal post={open} onClose={() => setOpen(null)} />
    </div>
  )
}
