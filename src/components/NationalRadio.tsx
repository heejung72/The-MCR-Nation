import { ARTIST_APPLE_MUSIC_SEARCH, MCR_YOUTUBE_URL, spotifyTrackUrl, youtubeThumb, youtubeUrl } from '../content/music'
import { formatTime, useRadio } from '../context/RadioContext'

function Icon({ name }: { name: 'play' | 'pause' | 'next' | 'prev' | 'up' | 'down' | 'radio' }) {
  const paths: Record<string, string> = {
    play: 'M7 4 L20 12 L7 20 Z',
    pause: 'M6 4 H10 V20 H6 Z M14 4 H18 V20 H14 Z',
    next: 'M5 5 L15 12 L5 19 Z M16 5 H19 V19 H16 Z',
    prev: 'M19 5 L9 12 L19 19 Z M5 5 H8 V19 H5 Z',
    up: 'M5 15 L12 8 L19 15',
    down: 'M5 9 L12 16 L19 9',
    radio: 'M4 10 H20 V20 H4 Z M8 10 L16 4',
  }
  const stroke = name === 'up' || name === 'down' || name === 'radio'
  return <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d={paths[name]} fill={stroke ? 'none' : 'currentColor'} stroke={stroke ? 'currentColor' : 'none'} strokeWidth="2" /></svg>
}

function Progress({ compact = false }: { compact?: boolean }) {
  const radio = useRadio()
  const ratio = radio.duration ? radio.position / radio.duration : 0
  return (
    <div className={`radio-progress ${compact ? 'compact' : ''}`}>
      {!compact && <span>{formatTime(radio.position)}</span>}
      <input type="range" min={0} max={1000} value={Math.round(ratio * 1000)} onChange={(event) => radio.seekTo(Number(event.target.value) / 1000)} aria-label="재생 위치" style={{ ['--ratio' as string]: `${ratio * 100}%` }} disabled={!radio.duration} />
      {!compact && <span>{formatTime(radio.duration)}</span>}
    </div>
  )
}

export function RadioControls({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const radio = useRadio()
  return (
    <div className={`radio-controls ${size}`}>
      <button onClick={radio.previous} aria-label="이전 곡"><Icon name="prev" /></button>
      <button className="radio-play" onClick={radio.toggle} aria-label={radio.playing ? '일시정지' : '재생'} disabled={!radio.ready}><Icon name={radio.playing ? 'pause' : 'play'} /></button>
      <button onClick={radio.next} aria-label="다음 곡"><Icon name="next" /></button>
    </div>
  )
}

/** 홈 히어로 오른쪽 카드 (데스크톱) */
export function RadioCard() {
  const radio = useRadio()
  return (
    <aside className="radio-card" aria-label="NATIONAL RADIO">
      <div className="radio-card-head"><span className={`on-air ${radio.playing ? 'live' : ''}`}>{radio.playing ? 'ON AIR' : 'STANDBY'}</span><b>NATIONAL RADIO</b></div>
      <div className="radio-card-track">
        {radio.track.youtubeId ? <img className="radio-art" src={youtubeThumb(radio.track.youtubeId)} alt="" /> : <div className="radio-art" aria-hidden="true">✦</div>}
        <div><strong>{radio.track.title}</strong><span>My Chemical Romance · {radio.track.album}</span></div>
      </div>
      <Progress />
      <RadioControls />
      <button className="text-link" onClick={() => radio.setExpanded(true)}>재생 목록 열기 →</button>
    </aside>
  )
}

/** 방송 화면 — YouTube 플레이어. 정책상 재생 중에는 보이게 두고, 최소화하면 일시정지한다. */
function BroadcastScreen() {
  const radio = useRadio()
  return (
    <section className={`broadcast ${radio.screenOpen ? 'open' : 'closed'}`} aria-label="NATIONAL RADIO 방송 화면">
      <div className="broadcast-bar">
        <span className={`on-air ${radio.playing ? 'live' : ''}`}>{radio.playing ? 'ON AIR' : 'STANDBY'}</span>
        <b>NATIONAL RADIO</b>
        <button onClick={() => radio.setScreenOpen(false)} aria-label="방송 화면 최소화 (일시정지)">— 최소화</button>
      </div>
      <div className="broadcast-video" ref={radio.hostRef} />
    </section>
  )
}

/** 화면 하단 고정 플레이어 + 재생 목록 패널 */
export function NationalRadioDock() {
  const radio = useRadio()
  return (
    <>
      <BroadcastScreen />
      <div className={`radio-dock ${radio.expanded ? 'is-expanded' : ''}`} role="region" aria-label="NATIONAL RADIO 플레이어">
        <button className="radio-dock-track" onClick={() => radio.setExpanded(!radio.expanded)} aria-expanded={radio.expanded} aria-controls="radio-panel">
          {radio.track.youtubeId ? <img className="radio-dock-art" src={youtubeThumb(radio.track.youtubeId)} alt="" /> : <span className={`on-air-dot ${radio.playing ? 'live' : ''}`} aria-hidden="true" />}
          <span className="radio-dock-text"><strong>{radio.track.title}</strong><small>{radio.playing ? 'NOW PLAYING · ' : ''}My Chemical Romance</small></span>
        </button>
        <RadioControls size="sm" />
        <div className="radio-dock-progress"><Progress /></div>
        {!radio.screenOpen && <button className="radio-screen-btn" onClick={() => radio.setScreenOpen(true)} aria-label="방송 화면 열기">▣</button>}
        <button className="radio-expand" onClick={() => radio.setExpanded(!radio.expanded)} aria-label={radio.expanded ? '재생 목록 닫기' : '재생 목록 열기'}><Icon name={radio.expanded ? 'down' : 'up'} /></button>
        <Progress compact />
      </div>

      <section id="radio-panel" className={`radio-panel ${radio.expanded ? 'open' : ''}`} aria-hidden={!radio.expanded} aria-label="NATIONAL RADIO 재생 목록">
        <div className="radio-panel-inner">
          <div className="radio-panel-main">
            <p className="kicker">NATIONAL RADIO · 국영 라디오</p>
            <h2>{radio.track.title}</h2>
            <p className="muted">My Chemical Romance · {radio.track.album}</p>
            <Progress />
            <RadioControls />
            <p className="radio-legal">
              My Chemical Romance 공식 YouTube 채널 영상으로 재생합니다(광고가 나올 수 있어요). 방송 화면을 최소화하면 일시정지됩니다.<br />
              {radio.track.youtubeId && <a href={youtubeUrl(radio.track.youtubeId)} target="_blank" rel="noreferrer">YouTube에서 보기</a>}
              {radio.track.spotifyId && <> · <a href={spotifyTrackUrl(radio.track.spotifyId)} target="_blank" rel="noreferrer">Spotify</a></>}
              {' · '}<a href={ARTIST_APPLE_MUSIC_SEARCH} target="_blank" rel="noreferrer">Apple Music</a>
              {' · '}<a href={MCR_YOUTUBE_URL} target="_blank" rel="noreferrer">공식 채널</a>
            </p>
          </div>
          <ol className="radio-playlist">
            {radio.playlist.map((track, i) => (
              <li key={track.youtubeId}>
                <button className={i === radio.index ? 'current' : ''} onClick={() => radio.playIndex(i)} aria-current={i === radio.index}>
                  <span>{String(i + 1).padStart(2, '0')}</span>{track.title}<small>{track.album}</small>
                </button>
              </li>
            ))}
          </ol>
          <button className="radio-panel-close" onClick={() => radio.setExpanded(false)}>접기</button>
        </div>
      </section>
    </>
  )
}
