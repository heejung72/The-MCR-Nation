import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Modal, PageHeader, Panel, StatusBadge } from '../components/ui'
import { CONCERT } from '../content/concert'
import { LORE, STATUS_LABEL, type LoreEntry } from '../content/lore'
import { GALLERY, MEDIA } from '../content/media'
import { MINISTRIES } from '../content/nav'
import { CONTACT } from '../content/contact'
import { useNation } from '../context/NationContext'

export function HubCards({ ministryNo }: { ministryNo: string }) {
  const ministry = MINISTRIES.find((item) => item.no === ministryNo)!
  return (
    <div className="hub-cards">
      {ministry.items.map((item, i) => (
        <Link key={item.to} to={item.to} className="hub-card">
          <span className="hub-no">{String(i + 1).padStart(2, '0')}</span>
          <strong>{item.en}</strong>
          <small>{item.ko} →</small>
        </Link>
      ))}
    </div>
  )
}

export function NationHub() {
  return (
    <>
      <PageHeader kicker="01 · MINISTRY OF INFORMATION" en="THE NATION" ko="정보부 — Draag에 대하여" image={MEDIA.headers.nation}>
        <p>A history written in black and white. 밴드의 이야기, 시민 안내서, 세계관 기록을 열람하세요.</p>
      </PageHeader>
      <HubCards ministryNo="01" />
    </>
  )
}

export function Story() {
  const timeline = [
    ['2001', '뉴저지에서 결성. Gerard Way, Ray Toro, Mikey Way, Frank Iero로 대표되는 라인업.'],
    ['2002', '데뷔 앨범 I Brought You My Bullets, You Brought Me Your Love.'],
    ['2004', 'Three Cheers for Sweet Revenge — “Helena”, “I’m Not Okay (I Promise)”.'],
    ['2006', 'The Black Parade — The Patient의 죽음과 퍼레이드를 그린 콘셉트 앨범.'],
    ['2010', 'Danger Days: The True Lives of the Fabulous Killjoys.'],
    ['2013', '활동 중단 발표.'],
    ['2019', '재결합 발표.'],
    ['2022', '싱글 The Foundations of Decay 발표.'],
  ]
  return (
    <>
      <PageHeader kicker="MINISTRY OF INFORMATION" en="MCR STORY" ko="밴드 이야기" image={MEDIA.headers.story} />
      <Panel title="CHRONICLE" ko="연표">
        <ol className="timeline">{timeline.map(([year, text]) => <li key={year}><b>{year}</b><span>{text}</span></li>)}</ol>
        <p className="muted small">연표는 공개된 기본 정보 위주로 정리했습니다. 수정이 필요하면 MCR TALK에 남겨 주세요.</p>
      </Panel>
      <PhotoArchive />
    </>
  )
}

function PhotoArchive() {
  const [open, setOpen] = useState<number | null>(null)
  const current = open === null ? null : GALLERY[open]
  return (
    <Panel title="PHOTO ARCHIVE" ko="사진 보관함">
      <ul className="photo-grid">
        {GALLERY.map((item, i) => (
          <li key={item.src}><button onClick={() => setOpen(i)} aria-label={`사진 ${i + 1} 크게 보기`}><img src={item.src} alt={`My Chemical Romance 사진 ${i + 1}`} loading="lazy" /><span>{String(i + 1).padStart(2, '0')} · {item.label}</span></button></li>
        ))}
      </ul>
      <Modal open={current !== null} onClose={() => setOpen(null)} label="사진 보기" wide>
        {current && open !== null && (
          <figure className="photo-view">
            <img src={current.src} alt={`My Chemical Romance 사진 ${open + 1}`} />
            <figcaption>
              <button className="text-link" onClick={() => setOpen((open - 1 + GALLERY.length) % GALLERY.length)}>← 이전</button>
              <span>{String(open + 1).padStart(2, '0')} / {GALLERY.length} · {current.label}</span>
              <button className="text-link" onClick={() => setOpen((open + 1) % GALLERY.length)}>다음 →</button>
            </figcaption>
          </figure>
        )}
      </Modal>
    </Panel>
  )
}

export function Guide() {
  return (
    <>
      <PageHeader kicker="MINISTRY OF INFORMATION" en="CITIZEN'S GUIDE" ko="시민 안내서" />
      <div className="two-col">
        <Panel title="NEW CITIZENS" ko="처음 오셨나요">
          <ol className="guide-list">
            <li><b>들어보기</b> — 하단 NATIONAL RADIO에서 대표곡이 재생됩니다. <Link to="/records/discography">디스코그래피</Link>에서 앨범별로 들어 보세요.</li>
            <li><b>세계관 읽기</b> — <Link to="/nation/lore">NATIONAL LORE</Link>는 공식 설정과 팬 해석을 구분해 표시합니다.</li>
            <li><b>시민 등록</b> — 글쓰기·투표 시 익명 또는 카카오로 등록해요. 사이트에는 랜덤 별칭만 보입니다.</li>
            <li><b>참여하기</b> — <Link to="/transmissions">커뮤니티</Link>, <Link to="/culture/uniform">콘서트룩</Link>, <Link to="/culture/prediction">셋리 예측</Link>.</li>
          </ol>
        </Panel>
        <Panel title="NATIONAL EVENT PREP" ko="공연 준비">
          <ul className="check-list">
            <li>티켓·신분증 — 주최사 안내 확인</li>
            <li>귀가 동선과 교통편 ({CONCERT.venue})</li>
            <li>날씨, 편한 신발, 귀마개</li>
            <li>공식 공지 재확인 — <a href={CONCERT.ticketUrl} target="_blank" rel="noreferrer">티켓링크</a></li>
          </ul>
        </Panel>
        <Panel title="CITIZEN CODE" ko="커뮤니티 규칙">
          <ul className="check-list">
            <li>가사 전문·음원 파일은 올리지 않아요. 짧은 인용과 공식 링크를 써 주세요.</li>
            <li>실명·연락처 등 개인정보를 게시하지 않아요.</li>
            <li>다른 사람이 나온 사진은 동의를 받고 올려요.</li>
            <li>문제가 되는 글은 신고 버튼으로 알려 주세요.</li>
          </ul>
        </Panel>
      </div>
    </>
  )
}

export function LoreDocument({ entry }: { entry: LoreEntry }) {
  const [revealed, setRevealed] = useState(entry.status !== 'unverified')
  return (
    <article className={`declassified status-${entry.status}`}>
      <div className="doc-head"><span className="doc-stamp">{entry.status === 'canon' ? 'DECLASSIFIED' : entry.status === 'fan' ? 'CITIZEN REPORT' : 'UNDER REVIEW'}</span><span>FILE NO. {entry.fileNo}</span></div>
      <h2>{entry.title}</h2>
      <StatusBadge status={entry.status} />
      <p className="doc-summary">{entry.summary}</p>
      {revealed ? <p className="doc-body">{entry.body}</p> : (
        <button className="redacted" onClick={() => setRevealed(true)}>
          <span aria-hidden="true">████████ ███ ██████████ ████</span>
          검토 전 기록입니다. 눌러서 열람하기
        </button>
      )}
      <dl className="doc-meta">
        <div><dt>SOURCE · 출처</dt><dd>{entry.sources.map((source) => source.url ? <a key={source.label} href={source.url} target="_blank" rel="noreferrer">{source.label}</a> : <span key={source.label}>{source.label}</span>)}</dd></div>
        <div><dt>LAST REVIEW · 마지막 검토</dt><dd>{entry.reviewedAt ?? '검토 대기'}</dd></div>
      </dl>
    </article>
  )
}

export function LoreCards({ entries }: { entries: LoreEntry[] }) {
  const [open, setOpen] = useState<LoreEntry | null>(null)
  return (
    <>
      <div className="lore-grid">
        {entries.map((entry) => (
          <button key={entry.slug} className={`lore-card status-${entry.status}`} onClick={() => setOpen(entry)}>
            <span className="lore-file">FILE NO. {entry.fileNo}</span>
            <strong>{entry.title}</strong>
            <p>{entry.summary}</p>
            <StatusBadge status={entry.status} />
          </button>
        ))}
      </div>
      <Modal open={Boolean(open)} onClose={() => setOpen(null)} label={open?.title ?? '문서'} wide>
        {open && <LoreDocument entry={open} />}
      </Modal>
    </>
  )
}

export function Lore() {
  return (
    <>
      <PageHeader kicker="MINISTRY OF INFORMATION" en="NATIONAL LORE" ko="세계관 기록">
        <p>In the world of DRAAG, we are all part of the story. 모든 문서에는 공식 여부와 출처를 표시합니다.</p>
      </PageHeader>
      <div className="legend">
        {(Object.keys(STATUS_LABEL) as (keyof typeof STATUS_LABEL)[]).map((status) => <span key={status}><StatusBadge status={status} /> {status === 'canon' ? '공식 앨범·채널에서 확인' : status === 'fan' ? '팬·운영진의 해석' : '출처 검토 전'}</span>)}
      </div>
      <LoreCards entries={LORE.filter((entry) => entry.section === 'lore')} />
    </>
  )
}

export function Directory() {
  const nation = useNation()
  return (
    <>
      <PageHeader kicker="MINISTRY OF INFORMATION" en="GOVERNMENT DIRECTORY" ko="기관 안내" />
      <div className="directory">
        {MINISTRIES.map((ministry) => (
          <Panel key={ministry.no} title={`${ministry.no}. ${ministry.en}`} ko={ministry.ko}>
            <ul className="link-list">{ministry.items.map((item) => <li key={item.to}><Link to={item.to}>{item.en}<small>{item.ko}</small></Link></li>)}</ul>
          </Panel>
        ))}
        <Panel title="NATIONAL ARCHIVE STATUS" ko="운영 상태">
          <p>{nation.isServer ? '공용 기록 보관소에 연결되어 있습니다. 모든 시민이 같은 기록을 봅니다.' : '서버 미연결 — 기록이 이 기기에만 저장됩니다.'}</p>
          <p className="muted small">THE MCR NATION은 비공식 팬 프로젝트입니다.</p>
          <p>운영진 문의: <a href={CONTACT.url} target="_blank" rel="noreferrer">카카오톡 오픈채팅 「{CONTACT.label}」 ↗</a></p>
        </Panel>
      </div>
    </>
  )
}
