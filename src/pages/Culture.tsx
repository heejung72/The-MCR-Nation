import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BoardView, Composer, PostModal, PostRow } from '../components/Board'
import { OfficialFeed } from '../components/OfficialFeed'
import { PageHeader, Panel } from '../components/ui'
import { CONCERT, daysUntilConcert, dDayLabel, TIMETABLE, TIMETABLE_SOURCE } from '../content/concert'
import { INSTAGRAM_ACCOUNT } from '../content/instagram'
import { MEDIA } from '../content/media'
import { PREDICTION_SONGS } from '../content/music'
import { useNation } from '../context/NationContext'
import type { OpeningResult, PredictionResult } from '../data'
import type { Post } from '../types'
import { HubCards } from './Nation'

export function CultureHub() {
  return (
    <>
      <PageHeader image={MEDIA.headers.culture} kicker="04 · MINISTRY OF CULTURAL AFFAIRS" en="THE CITIZENS" ko="문화부 — We are the Nation">
        <p>Share your uniform, become a part of DRAAG. 공연 안내, 콘서트룩, 셋리 예측, 공연 후기.</p>
      </PageHeader>
      <HubCards ministryNo="04" />
    </>
  )
}

const CHECKLIST_KEY = 'mcr-nation:checklist'
const CHECKLIST = ['티켓과 신분증', '귀가 동선과 막차·셔틀', '날씨와 편한 신발', '귀마개와 보조배터리', '공식 공지 재확인']

export function NationalEvent() {
  const nation = useNation()
  const [checked, setChecked] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem(CHECKLIST_KEY) ?? '[]') } catch { return [] } })
  const [composing, setComposing] = useState(false)
  const [open, setOpen] = useState<Post | null>(null)
  const notices = nation.posts.filter((post) => post.board === 'notice')
  const days = daysUntilConcert()

  const toggle = (item: string) => {
    const next = checked.includes(item) ? checked.filter((value) => value !== item) : [...checked, item]
    setChecked(next)
    try { localStorage.setItem(CHECKLIST_KEY, JSON.stringify(next)) } catch { /* 저장 불가 환경 */ }
  }

  return (
    <>
      <PageHeader kicker="MINISTRY OF CULTURAL AFFAIRS" en="11.07 NATIONAL EVENT" ko="내한 공연 — Citizens, prepare." image={MEDIA.headers.event} />
      <section className="event-hero">
        <div className="event-dday"><span>{dDayLabel(days)}</span><small>{days > 0 ? '공연까지' : days === 0 ? '오늘입니다' : '공연이 끝났어요'}</small></div>
        <div>
          <p className="kicker">{CONCERT.titleEn}</p>
          <h2>{CONCERT.title}</h2>
          <p className="event-when">{CONCERT.dateLabel}<br />{CONCERT.venue}</p>
          <p className="muted small">{CONCERT.note}</p>
          <a className="btn btn-red" href={CONCERT.ticketUrl} target="_blank" rel="noreferrer">티켓링크에서 확인 ↗</a>
        </div>
      </section>

      <Timetable />

      <div className="two-col">
        <Panel title="GOVERNMENT DISPATCH" ko="운영진 공지" action={nation.isAdmin ? <button className="more" onClick={() => setComposing(!composing)}>{composing ? '닫기' : '+ 공지 작성'}</button> : undefined}>
          {composing && <Composer boards={['notice']} defaultBoard="notice" photo="optional" onDone={() => setComposing(false)} />}
          {notices.length ? <ul className="post-list">{notices.map((post) => <PostRow key={post.id} post={post} onOpen={setOpen} showBoard={false} />)}</ul>
            : <p className="empty">아직 운영진 공지가 없습니다. 주최사 공식 소식은 아래 OFFICIAL FEED를 확인하세요.</p>}
        </Panel>
        <Panel title="PREPARATION ORDER" ko="공연 전 체크리스트 (이 기기에 저장)">
          <ul className="checklist">
            {CHECKLIST.map((item) => <li key={item}><label><input type="checkbox" checked={checked.includes(item)} onChange={() => toggle(item)} /> {item}</label></li>)}
          </ul>
          <p className="muted small">함께 갈 사람을 찾나요? <Link to="/transmissions/companions">동행 구하기 →</Link></p>
        </Panel>
      </div>

      <Panel title="OFFICIAL FEED" ko={`주최사 인스타그램 @${INSTAGRAM_ACCOUNT.handle}`} action={<a className="more" href={INSTAGRAM_ACCOUNT.url} target="_blank" rel="noreferrer">INSTAGRAM ↗</a>}>
        <p className="muted small">주최사 게시물을 Instagram 공식 임베드로 보여 줍니다. 최종 정보는 원본 게시물과 예매처 공지를 기준으로 확인하세요.</p>
        <OfficialFeed manage />
      </Panel>
      <PostModal post={open} onClose={() => setOpen(null)} />
    </>
  )
}

export function Timetable({ compact = false }: { compact?: boolean }) {
  return (
    <section className={`timetable ${compact ? 'compact' : ''}`} aria-label="공연 당일 타임테이블">
      <div className="timetable-head"><p className="kicker">D-DAY TIMETABLE · 공연 당일 일정</p><a href={TIMETABLE_SOURCE} target="_blank" rel="noreferrer">출처: @{INSTAGRAM_ACCOUNT.handle} ↗</a></div>
      <ol>
        {TIMETABLE.map((item) => (
          <li key={item.time} className={item.highlight ? 'highlight' : ''}>
            <time>{item.time}</time>
            <span><strong>{item.ko}</strong>{!compact && <small>{item.en}</small>}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function Uniform() {
  return (
    <>
      <PageHeader kicker="MINISTRY OF CULTURAL AFFAIRS" en="UNIFORM INSPECTION" ko="콘서트룩 — Show your uniform.">
        <p>사진과 함께 콘서트룩을 공유하세요. 사진은 업로드 전에 자동으로 줄이고 위치 정보(EXIF)는 지워집니다.</p>
      </PageHeader>
      <BoardView boards={['looks']} writable={['looks']} title="콘서트룩" photo="required" gallery />
    </>
  )
}

export function AfterParade() {
  return (
    <>
      <PageHeader kicker="MINISTRY OF CULTURAL AFFAIRS" en="AFTER THE PARADE" ko="공연 후기">
        <p>공연의 기억을 남겨 주세요. 사진은 선택이에요. 공연 영상 전체 업로드는 삼가 주세요.</p>
      </PageHeader>
      <BoardView boards={['after']} writable={['after']} title="공연 후기" photo="optional" />
    </>
  )
}

export function OpeningGuess() {
  const nation = useNation()
  const [mine, setMine] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [results, setResults] = useState<OpeningResult[] | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    void nation.repo.myOpeningGuess().then((band) => { setMine(band); setDraft(band ?? '') }).catch(() => undefined)
    void nation.repo.openingResults().then(setResults).catch(() => setResults(null))
  }, [nation.repo, nation.identity?.id])

  const submit = async (band: string) => {
    const value = band.replace(/\s+/g, ' ').trim().slice(0, 60)
    if (!value) return nation.toast('밴드 이름을 적어 주세요.')
    if (!(await nation.requireCitizen())) return
    setSaving(true)
    try {
      await nation.repo.saveOpeningGuess(value)
      setMine(value)
      setDraft(value)
      setResults(await nation.repo.openingResults())
      nation.toast(mine ? '추측을 바꿨습니다.' : '추측을 제출했습니다.')
    } catch (error) { nation.fail(error) } finally { setSaving(false) }
  }

  const total = results?.[0]?.total ?? 0
  return (
    <>
      <PageHeader kicker="MINISTRY OF CULTURAL AFFAIRS" en="OPENING ACT GUESS" ko="오프닝 밴드 추측하기 — 누가 무대를 열까?">
        <p>11.07 공연의 오프닝 밴드를 맞혀 보세요. 시민 1인 1추측, 다시 제출하면 바뀝니다. 오프닝 공연 여부와 출연진은 주최사 발표가 기준이에요.</p>
      </PageHeader>
      <div className="two-col">
        <Panel title="YOUR GUESS" ko={mine ? `내 추측: ${mine}` : '아직 제출하지 않았어요'}>
          <form className="opening-form" onSubmit={(event) => { event.preventDefault(); void submit(draft) }}>
            <label>밴드 이름<input value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={60} placeholder="예: 좋아하는 국내·해외 밴드" /></label>
            <button className="btn btn-red" type="submit" disabled={saving}>{saving ? '제출 중…' : mine ? '추측 바꾸기' : '추측 제출'}</button>
          </form>
          {results && results.length > 0 && (
            <>
              <p className="muted small">다른 시민들의 추측을 눌러 같은 밴드에 한 표를 보탤 수도 있어요.</p>
              <div className="song-chips">{results.slice(0, 12).map((item) => <button key={item.band} className={mine?.toLowerCase().replace(/\s/g, '') === item.band.toLowerCase().replace(/\s/g, '') ? 'active' : ''} onClick={() => void submit(item.band)} disabled={saving}>{item.band}</button>)}</div>
            </>
          )}
        </Panel>
        <Panel title="CITIZEN FORECAST" ko={nation.isServer ? `시민 ${total}명 참여` : '서버 연결 후 집계'}>
          {results && results.length ? (
            <ol className="bars">{results.map((item, i) => <li key={item.band}><span>{i === 0 ? '👑 ' : ''}{item.band}</span><b>{item.votes}표 · {Math.round((item.votes / Math.max(1, total)) * 100)}%</b><i style={{ width: `${(item.votes / Math.max(1, total)) * 100}%` }} /></li>)}</ol>
          ) : <p className="empty">아직 아무도 추측하지 않았어요. 첫 추측을 남겨 보세요!</p>}
          <p className="muted small">대소문자·띄어쓰기가 달라도 같은 밴드로 묶어 집계해요. 발표가 나오면 정부 공지로 알려 드릴게요.</p>
        </Panel>
      </div>
    </>
  )
}

const MAX_PICKS = 20

export function Prediction() {
  const nation = useNation()
  const [picks, setPicks] = useState<string[]>([])
  const [saved, setSaved] = useState<string[]>([])
  const [results, setResults] = useState<PredictionResult[] | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    void nation.repo.myPrediction().then((list) => { setPicks(list); setSaved(list) }).catch(() => undefined)
    void nation.repo.predictionResults().then(setResults).catch(() => setResults(null))
  }, [nation.repo, nation.identity?.id])

  const toggle = (song: string) => setPicks((current) => current.includes(song) ? current.filter((item) => item !== song) : current.length >= MAX_PICKS ? (nation.toast(`최대 ${MAX_PICKS}곡까지 고를 수 있어요.`), current) : [...current, song])
  const dirty = useMemo(() => [...picks].sort().join('|') !== [...saved].sort().join('|'), [picks, saved])

  const save = async () => {
    if (!picks.length) return nation.toast('예상 곡을 한 곡 이상 골라 주세요.')
    if (!(await nation.requireCitizen())) return
    setSaving(true)
    try {
      await nation.repo.savePrediction(picks)
      setSaved(picks)
      setResults(await nation.repo.predictionResults())
      nation.toast('셋리스트 예측을 제출했습니다.')
    } catch (error) { nation.fail(error) } finally { setSaving(false) }
  }

  const voters = results?.[0]?.voters ?? 0
  return (
    <>
      <PageHeader kicker="MINISTRY OF CULTURAL AFFAIRS" en="SETLIST PREDICTION" ko="셋리 예측 — 11.07에 나올 곡은?">
        <p>나올 것 같은 곡을 최대 {MAX_PICKS}곡까지 골라 제출하세요. 다시 제출하면 내 예측이 교체됩니다.</p>
      </PageHeader>
      <div className="two-col prediction">
        <Panel title="YOUR PREDICTION" ko={`내 예측 ${picks.length} / ${MAX_PICKS}`}>
          <div className="song-chips">
            {PREDICTION_SONGS.map((song) => <button key={song} className={picks.includes(song) ? 'active' : ''} aria-pressed={picks.includes(song)} onClick={() => toggle(song)}>{song}</button>)}
          </div>
          <div className="composer-actions">
            <button className="btn btn-red" onClick={() => void save()} disabled={saving || !dirty}>{saving ? '제출 중…' : saved.length ? '예측 다시 제출' : '예측 제출'}</button>
            {picks.length > 0 && <button className="text-link" onClick={() => setPicks([])}>모두 해제</button>}
          </div>
        </Panel>
        <Panel title="NATIONAL FORECAST" ko={nation.isServer ? `시민 ${voters}명 참여` : '서버 연결 후 집계'}>
          {results && results.length ? (
            <ol className="bars">{results.slice(0, 20).map((item) => <li key={item.song}><span>{item.song}</span><b>{Math.round((item.votes / Math.max(1, item.voters)) * 100)}%</b><i style={{ width: `${(item.votes / Math.max(1, item.voters)) * 100}%` }} /></li>)}</ol>
          ) : <p className="empty">아직 제출된 예측이 없어요. 첫 예측을 남겨 보세요.</p>}
          <p className="muted small">%는 참여한 시민 중 그 곡을 고른 비율입니다. 공연 후 실제 셋리스트는 <Link to="/records/live">LIVE ARCHIVE</Link>에 기록됩니다.</p>
        </Panel>
      </div>
    </>
  )
}
