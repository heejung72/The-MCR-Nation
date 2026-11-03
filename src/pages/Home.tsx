import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PostModal } from '../components/Board'
import { Emblem } from '../components/Emblem'
import { OfficialFeed } from '../components/OfficialFeed'
import { Timetable } from './Culture'
import { RadioCard } from '../components/NationalRadio'
import { Panel, timeAgo } from '../components/ui'
import { BOARDS } from '../content/boards'
import { CONCERT, daysUntilConcert, dDayLabel } from '../content/concert'
import { INSTAGRAM_ACCOUNT } from '../content/instagram'
import { MEDIA } from '../content/media'
import { MINISTRIES } from '../content/nav'
import { useNation } from '../context/NationContext'
import type { BoardId, Post } from '../types'

const FEED_TABS: { id: 'all' | BoardId; label: string }[] = [
  { id: 'all', label: 'ALL' }, { id: 'talk', label: 'MCR TALK' }, { id: 'general', label: 'GENERAL' }, { id: 'creations', label: 'FAN CREATIONS' },
]

export default function Home() {
  const nation = useNation()
  const [tab, setTab] = useState<'all' | BoardId>('all')
  const [open, setOpen] = useState<Post | null>(null)
  const notice = nation.posts.find((post) => post.board === 'notice')
  const feed = useMemo(() => nation.posts.filter((post) => post.board !== 'notice' && post.board !== 'looks' && (tab === 'all' || post.board === tab)).slice(0, 5), [nation.posts, tab])
  const looks = nation.posts.filter((post) => post.board === 'looks' && post.imagePath).slice(0, 3)
  const days = daysUntilConcert()

  return (
    <div className="home">
      <section className="hero" style={{ ['--hero-image' as string]: `url("${MEDIA.heroImage}")` }}>
        <div className="hero-copy">
          <p className="kicker">DRAAG CITIZEN PORTAL · 비공식 팬 커뮤니티</p>
          <h1>WELCOME,<br />CITIZEN.</h1>
          <p className="hero-sub">Your presence has been registered.</p>
          <p className="hero-text">The Nation appreciates your continued contribution to the culture, stability and musical accomplishments of DRAAG.<br /><span className="ko">MCR을 사랑하는 시민들의 기록 보관소에 오신 것을 환영합니다.</span></p>
          <div className="hero-actions">
            <Link to="/nation" className="btn btn-red">ENTER THE NATION →</Link>
            <Link to="/culture/event" className="btn btn-ghost">11.07 공연 안내</Link>
          </div>
        </div>
        <RadioCard />
        <div className="hero-skyline" aria-hidden="true" />
      </section>

      <nav className="ministry-cards" aria-label="Ministry 바로가기">
        {MINISTRIES.slice(0, 4).map((ministry, i) => (
          <Link key={ministry.no} to={ministry.to} className="ministry-card" style={{ ['--card-image' as string]: `url("${MEDIA.ministryCards[i]}")` }}>
            <span className="ministry-card-no">{ministry.no}</span>
            <strong>{ministry.en}</strong>
            <small>{ministry.ko} · {ministry.items[0].ko} →</small>
          </Link>
        ))}
      </nav>

      <div className="home-grid">
        <Panel title="GOVERNMENT DISPATCH" ko="정부 공지" className="dispatch" action={<Link to="/culture/event" className="more">MORE +</Link>}>
          {notice ? (
            <button className="dispatch-body" onClick={() => setOpen(notice)}>
              <span className="tag tag-red">OFFICIAL NOTICE</span>
              <h3>{notice.title}</h3>
              <p>{notice.body.slice(0, 140)}{notice.body.length > 140 ? '…' : ''}</p>
              <small>{notice.authorName} · {timeAgo(notice.createdAt)}</small>
            </button>
          ) : (
            <Link to="/culture/event" className="dispatch-body">
              <span className="tag tag-red">NATIONAL EVENT</span>
              <h3>11.07 NATIONAL EVENT<br />— CITIZENS, PREPARE.</h3>
              <p>{CONCERT.title} · {CONCERT.venue}. 공연 정보와 준비 체크리스트를 확인하세요.</p>
              <small>{CONCERT.dateLabel}</small>
            </Link>
          )}
        </Panel>

        <Panel title="THE BLACK PARADE" ko="대표 기록" className="parade" action={<Link to="/nation/lore" className="more">MORE +</Link>}>
          <Link to="/records/discography#the-black-parade" className="parade-body">
            <img className="parade-photo" src={MEDIA.paradeImage} alt="The Black Parade 제복을 입은 My Chemical Romance" loading="lazy" />
            <div>
              <h3>THE BLACK PARADE<br />— A LEGACY FOREVER.</h3>
              <p>죽음을 앞둔 The Patient의 이야기. 앨범과 세계관 기록을 열람하세요.</p>
              <em>Long live the Black Parade.</em>
            </div>
          </Link>
        </Panel>

        <Panel title="COMMUNITY TRANSMISSIONS" ko="최신 글" className="feed" action={<Link to="/transmissions" className="more">MORE +</Link>}>
          <div className="mini-tabs" role="tablist">
            {FEED_TABS.map((item) => <button key={item.id} role="tab" aria-selected={tab === item.id} className={tab === item.id ? 'active' : ''} onClick={() => setTab(item.id)}>{item.label}</button>)}
          </div>
          {nation.loading ? <p className="empty">불러오는 중…</p> : feed.length ? (
            <ul className="feed-list">
              {feed.map((post) => (
                <li key={post.id}><button onClick={() => setOpen(post)}>
                  <em className="tag">{BOARDS[post.board].en}</em><strong>{post.title}</strong><small>{timeAgo(post.createdAt)}</small><span>💬 {post.comments.length}</span>
                </button></li>
              ))}
            </ul>
          ) : <p className="empty">아직 전송된 글이 없어요. <Link to="/transmissions">첫 글을 남겨 보세요 →</Link></p>}
        </Panel>

        <Panel title="UPCOMING EVENT" ko="다가오는 공연" className="event" action={<Link to="/culture/event" className="more">MORE +</Link>}>
          <Link to="/culture/event" className="event-body" style={{ ['--event-image' as string]: `url("${MEDIA.eventImage}")` }}>
            <span className="dday">{dDayLabel(days)}</span>
            <strong>MCR LIVE IN KOREA</strong>
            <span>{CONCERT.dateLabel}</span>
            <span>{CONCERT.venue}</span>
            <span className="event-times">16:30 스탠딩 입장 · 19:00 공연 시작</span>
          </Link>
        </Panel>

        <Panel title="CITIZEN'S UNIFORM" ko="콘서트룩" className="uniform" action={<Link to="/culture/uniform" className="more">MORE +</Link>}>
          {looks.length ? (
            <div className="uniform-strip">
              {looks.map((post) => <button key={post.id} onClick={() => setOpen(post)}><img src={nation.repo.imageUrl(post.imagePath!)} alt={`${post.authorName}의 콘서트룩`} loading="lazy" /></button>)}
            </div>
          ) : (
            <Link to="/culture/uniform" className="uniform-empty"><img src={MEDIA.stencil} alt="" loading="lazy" /><strong>SHOW YOUR UNIFORM.</strong><span>BE A PART OF THE NATION.</span><small>첫 콘서트룩을 올려 주세요 →</small></Link>
          )}
        </Panel>
      </div>

      <Panel title="OFFICIAL FEED" ko={`공연 공식 소식 · @${INSTAGRAM_ACCOUNT.handle}`} className="home-feed" action={<Link to="/culture/event" className="more">전체 보기 +</Link>}>
        <Timetable compact />
        <OfficialFeed limit={3} />
      </Panel>

      <section className="motto" aria-label="표어">
        <p>“A NATION BUILT ON MUSIC, CHAOS AND LOVE.”</p>
        <small>We don’t belong anywhere. So we built our own nation.</small>
      </section>
      <PostModal post={open} onClose={() => setOpen(null)} />
    </div>
  )
}
