import { FormEvent, useMemo, useState } from 'react'
import { createAnonymousIdentity, getBracket, getIdentity, getPosts, resetBracket, saveBracket, saveIdentity, savePosts } from './storage'
import type { BoardId, Identity, Post } from './types'

const ticketUrl = 'https://m.ticketlink.co.kr/product/57330'
const songs = ['Welcome to the Black Parade', 'Helena', 'I’m Not Okay (I Promise)', 'Famous Last Words', 'Teenagers', 'The Ghost of You', 'Na Na Na', 'The Foundations of Decay']

const boardNames: Record<BoardId, string> = {
  general: '전체 기록',
  looks: '콘서트룩',
  lyrics: '가사 해석',
  companions: '동행인 구하기',
}

const albums = [
  ['I Brought You My Bullets, You Brought Me Your Love', '2002', '데뷔 앨범'],
  ['Three Cheers for Sweet Revenge', '2004', '두 번째 정규 앨범'],
  ['The Black Parade', '2006', '컨셉 앨범'],
  ['Danger Days: The True Lives of the Fabulous Killjoys', '2010', '네 번째 정규 앨범'],
  ['The Foundations of Decay', '2022', '싱글'],
]

const formatDate = (date: string) => new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date))

export default function App() {
  const [identity, setIdentity] = useState<Identity | null>(() => getIdentity())
  const [posts, setPosts] = useState<Post[]>(() => getPosts())
  const [board, setBoard] = useState<BoardId>('general')
  const [notice, setNotice] = useState('')
  const [bracket, setBracket] = useState(() => getBracket())
  const [showComposer, setShowComposer] = useState(false)

  const filteredPosts = useMemo(() => posts.filter((post) => post.board === board), [posts, board])
  const pair = useMemo(() => getCurrentPair(bracket.winners), [bracket.winners])

  const ensureIdentity = () => {
    if (identity) return identity
    const next = createAnonymousIdentity()
    setIdentity(next)
    setNotice(`${next.nickname}으로 시민 기록 권한을 발급했습니다.`)
    return next
  }

  const updatePosts = (next: Post[]) => {
    setPosts(next)
    savePosts(next)
  }

  const createPost = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const title = String(form.get('title') ?? '').trim()
    const body = String(form.get('body') ?? '').trim()
    if (!title || !body) return setNotice('제목과 본문을 모두 입력해 주세요.')
    const author = ensureIdentity()
    const post: Post = {
      id: crypto.randomUUID(), board, title, body, authorId: author.id, authorName: author.nickname,
      createdAt: new Date().toISOString(), comments: [],
    }
    updatePosts([post, ...posts])
    event.currentTarget.reset()
    setShowComposer(false)
    setNotice('기록을 보관했습니다.')
  }

  const addComment = (postId: string, body: string) => {
    const content = body.trim()
    if (!content) return
    const author = ensureIdentity()
    updatePosts(posts.map((post) => post.id === postId ? {
      ...post,
      comments: [...post.comments, { id: crypto.randomUUID(), authorId: author.id, authorName: author.nickname, body: content, createdAt: new Date().toISOString() }],
    } : post))
    setNotice('의견을 기록했습니다.')
  }

  const deletePost = (postId: string) => {
    const post = posts.find((item) => item.id === postId)
    if (!post || post.authorId !== identity?.id) return setNotice('본인이 작성한 기록만 철회할 수 있습니다.')
    updatePosts(posts.filter((item) => item.id !== postId))
    setNotice('기록을 철회했습니다.')
  }

  const chooseSong = (song: string) => {
    const next = { index: bracket.index + 1, winners: [...bracket.winners, song] }
    const state = next.winners.length === 7 ? { ...next, champion: next.winners.at(-1) } : next
    setBracket(state)
    saveBracket(state)
  }

  const renameIdentity = () => {
    const current = ensureIdentity()
    const nickname = window.prompt('새 별칭을 입력하세요. 개인정보는 쓰지 마세요.', current.nickname)?.trim()
    if (!nickname) return
    const next = { ...current, nickname: nickname.slice(0, 20) }
    saveIdentity(next)
    setIdentity(next)
    setNotice('별칭을 바꿨습니다. 이전 기록의 표시는 유지됩니다.')
  }

  return (
    <div className="site-shell">
      <header className="masthead">
        <a className="brand" href="#top" aria-label="THE MCR NATION 홈으로 이동"><span className="seal" aria-hidden="true">✦</span><span>THE MCR<br />NATION</span></a>
        <p className="document-id">M.C.R. CIVIC ARCHIVE / INC-1107</p>
        <div className="identity">
          {identity ? <><span>{identity.nickname}</span><button className="text-button" onClick={renameIdentity}>별칭 변경</button></> : <button className="outline-button" onClick={ensureIdentity}>익명 시민 등록</button>}
        </div>
      </header>

      <nav className="top-nav" aria-label="주요 메뉴">
        <a href="#concert">공연 안내</a><a href="#records">시민 기록</a><a href="#bracket">셋리 월드컵</a><a href="#archive">Draag 기록관</a>
      </nav>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-stamp">특별 공연 공지<br />VOL. 01</div>
          <p className="hero-kicker">LONG LIVE THE BLACK PARADE / KOREA</p>
          <h1 id="hero-title">기록은 남고,<br />우리는 함께 행진한다.</h1>
          <p className="hero-copy">My Chemical Romance 내한공연을 앞둔 팬들을 위한 안내, 기록, 그리고 서로의 목소리.</p>
          <a className="primary-button" href="#concert">공연 정보 확인</a>
        </section>

        <section id="concert" className="section concert-section" aria-labelledby="concert-title">
          <div className="section-heading"><p className="eyebrow">특별 작전실</p><h2 id="concert-title">11월 7일 공연 안내</h2></div>
          <div className="concert-grid">
            <div className="date-block"><span>2026</span><strong>11.07</strong><span>SAT</span></div>
            <div><h3>마이 케미컬 로맨스 내한공연</h3><p>인천 파라다이스시티 컬처파크</p><p className="muted">입장·공연 시각, 예매 상태와 관람 유의사항은 주최사 공지를 최종 기준으로 확인해 주세요.</p></div>
            <a className="secondary-button" href={ticketUrl} target="_blank" rel="noreferrer">티켓링크에서 확인</a>
          </div>
          <div className="checklist" aria-label="공연 전 체크리스트">
            <p>공연 전 확인</p><label><input type="checkbox" /> 티켓과 신분증</label><label><input type="checkbox" /> 귀가 동선과 막차</label><label><input type="checkbox" /> 날씨와 편한 신발</label><label><input type="checkbox" /> 공식 공지 재확인</label>
          </div>
        </section>

        <section id="records" className="section records-section" aria-labelledby="records-title">
          <div className="section-heading"><p className="eyebrow">시민 기록 보관소</p><h2 id="records-title">함께 남기는 이야기</h2><p>익명 별칭으로도 작성할 수 있습니다. 공연 정보는 출처를 남겨 주세요.</p></div>
          <div className="board-tabs" role="tablist" aria-label="게시판 선택">
            {(Object.keys(boardNames) as BoardId[]).map((id) => <button key={id} className={board === id ? 'active' : ''} onClick={() => setBoard(id)} role="tab" aria-selected={board === id}>{boardNames[id]}</button>)}
            <button className="write-button" onClick={() => { ensureIdentity(); setShowComposer(true) }}>기록 작성</button>
          </div>
          {showComposer && <form className="composer" onSubmit={createPost}><label>제목<input name="title" maxLength={80} required placeholder="기록의 제목" /></label><label>내용<textarea name="body" maxLength={1600} required placeholder="사진은 다음 단계에서 추가합니다. 지금은 이야기와 정보를 남겨 주세요." /></label><div><button className="primary-button" type="submit">기록 보관</button><button className="text-button" type="button" onClick={() => setShowComposer(false)}>닫기</button></div></form>}
          <div className="post-list">{filteredPosts.length ? filteredPosts.map((post) => <PostCard key={post.id} post={post} identity={identity} onComment={addComment} onDelete={deletePost} />) : <p className="empty">아직 이 분류의 기록이 없습니다. 첫 기록을 남겨 보세요.</p>}</div>
        </section>

        <section id="bracket" className="section bracket-section" aria-labelledby="bracket-title">
          <div className="section-heading"><p className="eyebrow">국민 선호 조사</p><h2 id="bracket-title">셋리스트 월드컵</h2><p>현재 기기에 진행 상황이 저장됩니다.</p></div>
          {bracket.champion ? <div className="champion"><p>당신의 최종 선택</p><h3>{bracket.champion}</h3><button className="secondary-button" onClick={() => { resetBracket(); setBracket(getBracket()) }}>다시 시작</button></div> : pair ? <div className="match"><p>대결 {bracket.index + 1} / 7</p><div><button onClick={() => chooseSong(pair[0])}>{pair[0]}</button><span>VS</span><button onClick={() => chooseSong(pair[1])}>{pair[1]}</button></div></div> : <div className="champion"><p>후보를 불러오는 중입니다.</p><button className="secondary-button" onClick={() => { resetBracket(); setBracket(getBracket()) }}>처음부터 시작</button></div>}
        </section>

        <section className="section discography-section" aria-labelledby="discography-title">
          <div className="section-heading"><p className="eyebrow">음반 기록</p><h2 id="discography-title">디스코그래피</h2><p>앨범 정보와 음원 재생은 공식 플랫폼으로 연결합니다.</p></div>
          <div className="album-list">{albums.map(([name, year, detail]) => <article key={name}><span>{year}</span><h3>{name}</h3><p>{detail}</p></article>)}</div>
          <div className="music-panel"><div><p className="eyebrow">공식 음원 보관함</p><h3>My Chemical Romance on Spotify</h3><p>페이지 진입 시 재생을 요청합니다. 브라우저가 소리 자동 재생을 막으면 플레이어의 재생 버튼을 한 번 눌러 주세요.</p><a className="secondary-button" href="https://open.spotify.com/artist/5YpirkJ20LJ5HjcDrOkOOg" target="_blank" rel="noreferrer">Spotify에서 열기</a></div><iframe title="My Chemical Romance official Spotify player" src="https://open.spotify.com/embed/artist/7FBcuc1gsnv6Y1nwFtNRCb?utm_source=generator&autoplay=1" width="100%" height="352" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="eager" /></div>
        </section>

        <section className="section setlist-section" aria-labelledby="setlist-title">
          <div className="section-heading"><p className="eyebrow">공연별 보관함</p><h2 id="setlist-title">셋리스트 아카이브</h2><p>공식 발표 또는 현장 확인 출처가 있는 기록부터 공개합니다.</p></div>
          <div className="setlist-card"><div><span className="status-mark">기록 대기</span><h3>2026.11.07 · INCHEON</h3><p>인천 파라다이스시티 컬처파크</p></div><p>공연 종료 후 출처가 확인된 셋리스트를 보관합니다. 추측 목록은 확정 기록과 분리합니다.</p></div>
        </section>

        <section id="archive" className="section archive-section" aria-labelledby="archive-title">
          <div className="section-heading"><p className="eyebrow">Draag 기록관</p><h2 id="archive-title">읽기 전에 알아둘 구분</h2></div>
          <div className="source-grid"><article><h3>공식·공연 확인</h3><p>공식 채널, 티켓 판매처, 공연장에서 직접 확인할 수 있는 정보입니다.</p></article><article><h3>팬 아카이브</h3><p>팬이 수집한 기록입니다. 원 출처와 작성 시점을 함께 봐야 합니다.</p></article><article><h3>팬의 이야기</h3><p>자유로운 해석과 감상입니다. 이곳에서는 여러 독해가 함께 존재합니다.</p></article></div>
        </section>
      </main>

      <footer><p>THE MCR NATION · fan community archive</p><p>음원·가사는 공식 링크와 적법한 인용을 우선합니다.</p></footer>
      {notice && <div className="toast" role="status">{notice}<button onClick={() => setNotice('')} aria-label="알림 닫기">×</button></div>}
    </div>
  )
}

function PostCard({ post, identity, onComment, onDelete }: { post: Post, identity: Identity | null, onComment: (id: string, body: string) => void, onDelete: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  const [comment, setComment] = useState('')
  return <article className="post-card"><div className="post-meta"><span>{post.authorName}</span><time>{formatDate(post.createdAt)}</time></div><h3>{post.title}</h3><p>{post.body}</p><div className="post-actions"><button className="text-button" onClick={() => setOpen(!open)}>{post.comments.length}개 의견 {open ? '닫기' : '보기'}</button>{post.authorId === identity?.id && <button className="text-button danger" onClick={() => onDelete(post.id)}>내 기록 철회</button>}<button className="text-button" onClick={() => window.alert('신고 접수 UI는 준비 중입니다. MVP 다음 단계에서 운영자 보관함과 연결합니다.')}>신고</button></div>{open && <div className="comments">{post.comments.map((item) => <div key={item.id}><b>{item.authorName}</b><span>{item.body}</span></div>)}<form onSubmit={(event) => { event.preventDefault(); onComment(post.id, comment); setComment('') }}><input value={comment} onChange={(event) => setComment(event.target.value)} maxLength={300} placeholder="의견을 남기세요" aria-label="댓글 내용" /><button type="submit">등록</button></form></div>}</article>
}

function getCurrentPair(winners: string[]): [string, string] | null {
  const opening: [string, string][] = [[songs[0], songs[1]], [songs[2], songs[3]], [songs[4], songs[5]], [songs[6], songs[7]]]
  if (winners.length < 4) return opening[winners.length] ?? null
  if (winners.length === 4) return [winners[0], winners[1]]
  if (winners.length === 5) return [winners[2], winners[3]]
  if (winners.length === 6) return [winners[4], winners[5]]
  return null
}
