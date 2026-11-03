import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BoardView } from '../components/Board'
import { PageHeader, Panel } from '../components/ui'
import { CONCERT } from '../content/concert'
import { ALBUMS, ARTIST_APPLE_MUSIC_SEARCH, ARTIST_SPOTIFY_URL, MCR_YOUTUBE_URL, spotifyAlbumUrl, WORLD_CUP_SONGS, type Album } from '../content/music'
import { useAlbumArt } from '../lib/albumArt'
import { MEDIA } from '../content/media'
import { useNation } from '../context/NationContext'
import { useRadio } from '../context/RadioContext'
import type { BracketResult } from '../data'
import { getBracket, resetBracket, saveBracket } from '../storage'
import type { BracketState } from '../types'
import { HubCards } from './Nation'

export function RecordsHub() {
  return (
    <>
      <PageHeader kicker="02 · MINISTRY OF RECORDS" en="THE ARCHIVE" ko="기록부 — 기억을 보존합니다" image={MEDIA.headers.records}>
        <p>Music, history, and everything that remains. 앨범, 가사 해석, 셋리 월드컵, 공연 기록.</p>
      </PageHeader>
      <HubCards ministryNo="02" />
    </>
  )
}

export function Discography() {
  const radio = useRadio()
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (id) document.getElementById(id)?.scrollIntoView({ block: 'start' })
  }, [])
  return (
    <>
      <PageHeader kicker="MINISTRY OF RECORDS" en="DISCOGRAPHY" ko="디스코그래피">
        <p>곡 옆 ▶를 누르면 NATIONAL RADIO에서 공식 YouTube 영상으로 전곡이 재생됩니다. <a href={MCR_YOUTUBE_URL} target="_blank" rel="noreferrer">YouTube</a> · <a href={ARTIST_SPOTIFY_URL} target="_blank" rel="noreferrer">Spotify</a> · <a href={ARTIST_APPLE_MUSIC_SEARCH} target="_blank" rel="noreferrer">Apple Music</a></p>
      </PageHeader>
      <div className="albums">
        {ALBUMS.map((album) => (
          <article key={album.slug} id={album.slug} className="album">
            <AlbumCover album={album} />
            <div className="album-info">
              <p className="kicker">{album.kind}</p>
              <h2>{album.title} <small>({album.year})</small></h2>
              <p>{album.note}</p>
              {album.spotifyAlbumId && <a className="text-link" href={spotifyAlbumUrl(album.spotifyAlbumId)} target="_blank" rel="noreferrer">Spotify에서 앨범 열기 →</a>}
              {album.tracks.length > 0 && (
                <ol className="tracklist">
                  {album.tracks.map((track, i) => (
                    <li key={track.title}>
                      <span className="track-no">{String(i + 1).padStart(2, '0')}</span>
                      <span className="track-title">{track.title}</span>
                      {track.youtubeId
                        ? <button className={`track-play ${radio.track.youtubeId === track.youtubeId ? 'current' : ''}`} onClick={() => radio.playTrack(track)} aria-label={`${track.title} 재생`}>{radio.track.youtubeId === track.youtubeId && radio.playing ? '♪' : '▶'}</button>
                        : <span className="track-na" title="공식 영상 미등록">—</span>}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </article>
        ))}
      </div>
    </>
  )
}

export function AlbumCover({ album }: { album: Album }) {
  const art = useAlbumArt(album.spotifyAlbumId)
  return art
    ? <img className="album-cover album-art" src={art} alt={`${album.title} 앨범 커버`} loading="lazy" />
    : <div className="album-cover" aria-hidden="true"><span>{album.year}</span><b>{album.title}</b></div>
}

export function Lyrics() {
  return (
    <>
      <PageHeader kicker="MINISTRY OF RECORDS" en="LYRIC INTERPRETATION" ko="가사 해석">
        <p>가사 전문은 올리지 않아요. 필요한 만큼 짧게 인용하고, 해석과 감상을 중심으로 나눠 주세요.</p>
      </PageHeader>
      <BoardView boards={['lyrics']} writable={['lyrics']} title="가사 해석" photo="none" />
    </>
  )
}

function getCurrentPair(winners: string[]): [string, string] | null {
  const s = WORLD_CUP_SONGS
  const opening: [string, string][] = [[s[0], s[1]], [s[2], s[3]], [s[4], s[5]], [s[6], s[7]]]
  if (winners.length < 4) return opening[winners.length] ?? null
  if (winners.length === 4) return [winners[0], winners[1]]
  if (winners.length === 5) return [winners[2], winners[3]]
  if (winners.length === 6) return [winners[4], winners[5]]
  return null
}

export function WorldCup() {
  const nation = useNation()
  const [bracket, setBracket] = useState<BracketState>(() => getBracket())
  const [results, setResults] = useState<BracketResult[] | null>(null)
  const pair = getCurrentPair(bracket.winners)
  const round = bracket.winners.length < 4 ? '8강' : bracket.winners.length < 6 ? '준결승' : '결승'

  useEffect(() => { void nation.repo.bracketResults().then(setResults).catch(() => setResults(null)) }, [nation.repo])

  const choose = (song: string) => {
    const winners = [...bracket.winners, song]
    const state: BracketState = winners.length === 7 ? { index: 7, winners, champion: song } : { index: winners.length, winners }
    setBracket(state)
    saveBracket(state)
    if (state.champion && nation.isServer) {
      void (async () => {
        if (!(await nation.requireCitizen())) return nation.toast('시민 등록을 하면 최종 선택이 전체 집계에 반영됩니다.')
        try {
          await nation.repo.submitChampion(song)
          setResults(await nation.repo.bracketResults())
          nation.toast('최종 선택이 전체 집계에 반영되었습니다.')
        } catch (error) { nation.fail(error) }
      })()
    }
  }
  const total = results?.reduce((sum, item) => sum + item.votes, 0) ?? 0

  return (
    <>
      <PageHeader kicker="MINISTRY OF RECORDS" en="SETLIST WORLD CUP" ko="셋리 월드컵 — 최애곡을 골라 주세요">
        <p>진행 상황은 이 기기에, 최종 선택은 시민 1인 1표로 전체 집계에 저장됩니다.</p>
      </PageHeader>
      <div className="worldcup">
        {bracket.champion ? (
          <div className="champion">
            <p className="kicker">YOUR FINAL CHOICE · 당신의 최종 선택</p>
            <h2>{bracket.champion}</h2>
            <button className="btn btn-ghost" onClick={() => { resetBracket(); setBracket(getBracket()) }}>다시 시작</button>
          </div>
        ) : pair ? (
          <div className="match">
            <p className="kicker">{round} · 대결 {bracket.winners.length + 1} / 7</p>
            <div className="match-pair">
              <button onClick={() => choose(pair[0])}>{pair[0]}</button>
              <span>VS</span>
              <button onClick={() => choose(pair[1])}>{pair[1]}</button>
            </div>
          </div>
        ) : <button className="btn btn-ghost" onClick={() => { resetBracket(); setBracket(getBracket()) }}>처음부터 시작</button>}
        {results && results.length > 0 && (
          <Panel title="NATIONAL RESULTS" ko={`전체 집계 · ${total}표`}>
            <ol className="bars">{results.slice(0, 8).map((item) => <li key={item.song}><span>{item.song}</span><b>{item.votes}표</b><i style={{ width: `${(item.votes / total) * 100}%` }} /></li>)}</ol>
          </Panel>
        )}
      </div>
    </>
  )
}

export function LiveArchive() {
  return (
    <>
      <PageHeader kicker="MINISTRY OF RECORDS" en="LIVE ARCHIVE" ko="공연 아카이브" />
      <div className="live-list">
        <article className="live-card">
          <span className="status-mark">RECORD PENDING · 기록 대기</span>
          <h2>{CONCERT.dateLabel} · INCHEON</h2>
          <p>{CONCERT.venue}</p>
          <p className="muted">공연 종료 후 출처가 확인된 셋리스트를 보관합니다. 추측은 <Link to="/culture/prediction">셋리 예측</Link>에서, 후기는 <Link to="/culture/after">AFTER THE PARADE</Link>에서 나눠 주세요.</p>
        </article>
      </div>
    </>
  )
}
