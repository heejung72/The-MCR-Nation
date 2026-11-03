import { useEffect, useState, type FormEvent } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { CONCERT, dDayLabel } from '../content/concert'
import { CONTACT } from '../content/contact'
import { BOTTOM_TABS, MINISTRIES } from '../content/nav'
import { useNation } from '../context/NationContext'
import { Emblem } from './Emblem'
import { NationalRadioDock } from './NationalRadio'
import { Modal } from './ui'

function SearchBox({ onDone }: { onDone?: () => void }) {
  const navigate = useNavigate()
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const q = String(new FormData(event.currentTarget).get('q') ?? '').trim()
    if (!q) return
    navigate(`/search?q=${encodeURIComponent(q)}`)
    onDone?.()
  }
  return (
    <form className="search-box" role="search" onSubmit={submit}>
      <input name="q" placeholder="SEARCH THE NATION… 검색" aria-label="사이트 검색" />
      <button type="submit" aria-label="검색">⌕</button>
    </form>
  )
}

function DraagClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 1000); return () => window.clearInterval(timer) }, [])
  const text = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now)
  return <div className="draag-time"><span>DRAAG TIME · 서울</span><time>{text}</time></div>
}

function MinistryNav({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation()
  return (
    <nav className="ministry-nav" aria-label="Ministry 메뉴">
      {MINISTRIES.map((ministry) => {
        const active = location.pathname.startsWith(ministry.to)
        return (
          <div key={ministry.no} className={`ministry ${active ? 'active' : ''}`}>
            <NavLink to={ministry.to} end className="ministry-title" onClick={onNavigate}>
              <span className="ministry-no">{ministry.no}.</span>
              <span>{ministry.en}<small>{ministry.ko}</small></span>
            </NavLink>
            <ul>
              {ministry.items.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} end onClick={onNavigate} className={({ isActive }) => (isActive || location.pathname + location.search === item.to ? 'active' : '')}>
                    {item.en}<small>{item.ko}</small>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </nav>
  )
}

function Brand() {
  return (
    <Link to="/" className="brand" aria-label="THE MCR NATION 홈">
      <Emblem size={44} />
      <span><b>THE MCR NATION</b><small>THE MINISTRY OF MCR AFFAIRS</small></span>
    </Link>
  )
}

function CitizenButton() {
  const nation = useNation()
  if (nation.identity) {
    return <Link to="/citizens" className="citizen-chip">{nation.isAdmin && <em>ADMIN</em>}{nation.identity.nickname}</Link>
  }
  return <button className="citizen-chip login" onClick={() => void nation.requireCitizen()} disabled={nation.loading}>CITIZEN LOGIN<small>시민 등록</small></button>
}

function RegistrationModal() {
  const nation = useNation()
  return (
    <Modal open={nation.registration.open} onClose={() => nation.registration.choose('cancel')} label="시민 등록">
      <div className="registration-card">
        <p className="kicker">CITIZEN REGISTRATION · 시민 등록</p>
        <h2>Join the Nation.</h2>
        <p>글쓰기, 댓글, 투표, 사진 공유는 시민만 할 수 있어요. 어떤 방식이든 사이트에는 <b>랜덤 별칭</b>으로만 표시됩니다.</p>
        <div className="registration-actions">
          <button className="btn btn-red" onClick={() => nation.registration.choose('anonymous')} disabled={nation.busy}>익명 시민으로 등록<small>이 브라우저에서만 유지</small></button>
          {nation.isServer && <button className="btn btn-kakao" onClick={() => nation.registration.choose('kakao')} disabled={nation.busy}>카카오로 등록<small>다른 기기에서도 유지</small></button>}
        </div>
        <button className="text-link" onClick={() => nation.registration.choose('cancel')}>나중에 하기</button>
        <span className="stamp" aria-hidden="true">DRAAG</span>
      </div>
    </Modal>
  )
}

export function Layout() {
  const nation = useNation()
  const [drawer, setDrawer] = useState(false)
  const location = useLocation()

  useEffect(() => { setDrawer(false); window.scrollTo({ top: 0 }) }, [location.pathname])
  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawer])

  return (
    <div className="app">
      <a className="skip-link" href="#main">본문으로 건너뛰기</a>
      <div className="utility-bar">
        <span>UNOFFICIAL FAN PORTAL OF DRAAG // THE MCR NATION</span>
        <span className="utility-right">{dDayLabel()} · {CONCERT.dateLabel} · LONG LIVE THE BLACK PARADE.</span>
      </div>

      <header className="mobile-header">
        <Brand />
        <button className="menu-button" onClick={() => setDrawer(true)} aria-label="메뉴 열기" aria-expanded={drawer}><span /><span /><span /></button>
      </header>

      <aside className="sidebar" aria-label="사이드바">
        <div className="sidebar-brand"><Link to="/" aria-label="THE MCR NATION 홈"><Emblem size={92} /><b>— THE —<br />MCR NATION</b><small>THE MINISTRY OF MCR AFFAIRS</small></Link></div>
        <MinistryNav />
        <SearchBox />
        <DraagClock />
      </aside>

      <div className={`drawer ${drawer ? 'open' : ''}`} aria-hidden={!drawer}>
        <div className="drawer-backdrop" onClick={() => setDrawer(false)} />
        <div className="drawer-panel" role="dialog" aria-label="메뉴">
          <div className="drawer-head"><Brand /><button onClick={() => setDrawer(false)} aria-label="메뉴 닫기">×</button></div>
          <SearchBox onDone={() => setDrawer(false)} />
          <CitizenButton />
          <MinistryNav onNavigate={() => setDrawer(false)} />
        </div>
      </div>

      <div className="content-column">
        <div className="topbar">
          <span className={`server-state ${nation.isServer ? 'online' : ''}`}>{nation.isServer ? '● NATIONAL ARCHIVE ONLINE' : '○ LOCAL MODE · 이 기기에만 저장'}</span>
          <CitizenButton />
        </div>
        <main id="main" className="main" key={location.pathname}>
          <Outlet />
        </main>
        <footer className="footer">
          <p><b>THE MCR NATION</b> · 비공식 팬 커뮤니티입니다. My Chemical Romance, 소속사, 투어 주최사와 관련이 없습니다.</p>
          <p>음원은 공식 스트리밍 플레이어로, 가사는 짧은 인용과 공식 링크로만 다룹니다.</p>
          <a className="contact-link" href={CONTACT.url} target="_blank" rel="noreferrer">💬 관리자 문의 · 카카오톡 오픈채팅 「{CONTACT.label}」 ↗</a>
        </footer>
      </div>

      <NationalRadioDock />

      <nav className="bottom-tabs" aria-label="하단 메뉴">
        {BOTTOM_TABS.map((tab) => (
          <NavLink key={tab.to} to={tab.to} end={tab.to === '/'}><span className="tab-mark" aria-hidden="true" />{tab.en}<small>{tab.ko}</small></NavLink>
        ))}
      </nav>

      <RegistrationModal />
      {nation.notice && <div className="toast" role="status">{nation.notice}<button onClick={nation.dismissToast} aria-label="알림 닫기">×</button></div>}
    </div>
  )
}
