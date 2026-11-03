import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { RADIO_PLAYLIST, type Track } from '../content/music'

/**
 * NATIONAL RADIO — YouTube 공식 IFrame Player API로 MCR 공식 채널 영상을 재생한다.
 * - 로그인 없이 전곡 재생. 광고가 붙을 수 있다.
 * - YouTube 정책상 플레이어를 숨기지 않는다: 재생 중에는 "방송 화면"(200px 이상)이 보이고, 최소화하면 일시정지한다.
 * - 자동재생: 준비되면 재생을 요청하고, 브라우저가 막으면 방문자의 첫 클릭/키 입력 때 시작한다.
 */

type YTPlayer = {
  playVideo: () => void
  pauseVideo: () => void
  loadVideoById: (id: string) => void
  cueVideoById: (id: string) => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  getCurrentTime: () => number
  getDuration: () => number
  getPlayerState: () => number
  destroy: () => void
}
type YTNamespace = {
  Player: new (element: HTMLElement, options: {
    width?: string | number; height?: string | number; videoId: string
    playerVars?: Record<string, string | number>
    events?: { onReady?: () => void; onStateChange?: (event: { data: number }) => void; onError?: (event: { data: number }) => void }
  }) => YTPlayer
}
declare global {
  interface Window { YT?: YTNamespace; onYouTubeIframeAPIReady?: () => void }
}

const SCRIPT_SRC = 'https://www.youtube.com/iframe_api'
const SCREEN_KEY = 'mcr-nation:radio-screen'
const STATE = { ENDED: 0, PLAYING: 1, PAUSED: 2 }

function loadApi(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  return new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => { previous?.(); resolve(window.YT!) }
    if (!document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
      const script = document.createElement('script')
      script.src = SCRIPT_SRC
      script.async = true
      document.body.appendChild(script)
    }
  })
}

type Radio = {
  playlist: Track[]
  track: Track
  index: number
  ready: boolean
  playing: boolean
  position: number
  duration: number
  /** 방송 화면(YouTube 플레이어) 표시 여부. 닫으면 일시정지 */
  screenOpen: boolean
  setScreenOpen: (open: boolean) => void
  expanded: boolean
  setExpanded: (open: boolean) => void
  toggle: () => void
  next: () => void
  previous: () => void
  seekTo: (ratio: number) => void
  playIndex: (index: number) => void
  playTrack: (track: Track) => void
  hostRef: (element: HTMLDivElement | null) => void
}

const RadioContext = createContext<Radio | null>(null)

/** 저장된 선택이 없으면: 데스크톱은 열림(자동재생 시도), 모바일은 접힘(모바일 브라우저는 소리 자동재생을 항상 막음) */
const readScreenPref = () => {
  try {
    const saved = localStorage.getItem(SCREEN_KEY)
    if (saved) return saved !== 'closed'
  } catch { /* 저장소 없음 */ }
  return !window.matchMedia?.('(max-width: 719px)').matches
}

export function RadioProvider({ children }: { children: ReactNode }) {
  const [playlist, setPlaylist] = useState<Track[]>(RADIO_PLAYLIST)
  const [index, setIndex] = useState(0)
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const [screenOpen, setScreenOpenState] = useState(readScreenPref)
  const [expanded, setExpanded] = useState(false)
  const [host, setHost] = useState<HTMLDivElement | null>(null)
  const player = useRef<YTPlayer | null>(null)
  const state = useRef({ index: 0, playlist: RADIO_PLAYLIST, started: false, userPaused: false, errors: 0, screenOpen: readScreenPref() })
  state.current.index = index
  state.current.playlist = playlist
  state.current.screenOpen = screenOpen

  const setScreenOpen = useCallback((open: boolean) => {
    setScreenOpenState(open)
    state.current.screenOpen = open
    try { localStorage.setItem(SCREEN_KEY, open ? 'open' : 'closed') } catch { /* 저장 불가 */ }
    if (!open) { state.current.userPaused = true; player.current?.pauseVideo() }
  }, [])

  const load = useCallback((nextIndex: number, list = state.current.playlist) => {
    const safe = (nextIndex + list.length) % list.length
    setIndex(safe)
    setPosition(0)
    setDuration(0)
    state.current.userPaused = false
    if (!state.current.screenOpen) setScreenOpen(true)
    player.current?.loadVideoById(list[safe].youtubeId!)
  }, [setScreenOpen])

  // 플레이어 생성 (한 번만)
  useEffect(() => {
    if (!host || player.current) return
    let cancelled = false
    const mount = document.createElement('div')
    host.appendChild(mount)
    void loadApi().then((YT) => {
      if (cancelled) return
      player.current = new YT.Player(mount, {
        width: '100%', height: '100%', videoId: RADIO_PLAYLIST[0].youtubeId!,
        playerVars: { playsinline: 1, rel: 0, modestbranding: 1, origin: window.location.origin },
        events: {
          onReady: () => {
            setReady(true)
            if (state.current.screenOpen) player.current?.playVideo() // 자동재생 요청
          },
          onStateChange: ({ data }) => {
            setPlaying(data === STATE.PLAYING)
            if (data === STATE.PLAYING) { state.current.started = true; state.current.errors = 0 }
            if (data === STATE.ENDED) load(state.current.index + 1)
          },
          onError: () => {
            // 재생 불가(삭제·퍼가기 금지 등) → 다음 곡. 연속 실패는 목록 길이만큼만
            state.current.errors += 1
            if (state.current.errors < state.current.playlist.length) load(state.current.index + 1)
          },
        },
      })
    })
    return () => { cancelled = true }
  }, [host, load])

  // 재생 위치 갱신
  useEffect(() => {
    if (!ready) return
    const timer = window.setInterval(() => {
      const p = player.current
      if (!p) return
      setPosition((p.getCurrentTime() || 0) * 1000)
      setDuration((p.getDuration() || 0) * 1000)
    }, 500)
    return () => window.clearInterval(timer)
  }, [ready])

  // 브라우저가 소리 자동재생을 막은 경우: 첫 클릭/키 입력 때 시작
  useEffect(() => {
    if (!ready) return
    const kick = (event: Event) => {
      // 플레이어 버튼을 직접 누른 경우는 그 버튼이 처리한다(이중 처리로 바로 멈추는 문제 방지)
      if (event.target instanceof Element && event.target.closest('.radio-dock, .radio-panel, .broadcast, .radio-card')) return
      if (!state.current.started && !state.current.userPaused && state.current.screenOpen) player.current?.playVideo()
    }
    window.addEventListener('pointerdown', kick, { capture: true })
    window.addEventListener('keydown', kick, { capture: true })
    return () => {
      window.removeEventListener('pointerdown', kick, { capture: true })
      window.removeEventListener('keydown', kick, { capture: true })
    }
  }, [ready])

  const radio: Radio = {
    playlist,
    track: playlist[index],
    index,
    ready,
    playing,
    position,
    duration,
    screenOpen,
    setScreenOpen,
    expanded,
    setExpanded,
    toggle() {
      const isPlaying = player.current?.getPlayerState() === STATE.PLAYING
      if (isPlaying) { state.current.userPaused = true; player.current?.pauseVideo(); return }
      state.current.userPaused = false
      if (!screenOpen) setScreenOpen(true)
      player.current?.playVideo()
    },
    next: () => load(index + 1),
    previous: () => (position > 3000 ? player.current?.seekTo(0, true) : load(index - 1)),
    seekTo(ratio) {
      if (duration > 0) player.current?.seekTo(Math.max(0, Math.min(1, ratio)) * duration / 1000, true)
    },
    playIndex: (nextIndex) => load(nextIndex),
    playTrack(track) {
      if (!track.youtubeId) return
      const existing = playlist.findIndex((item) => item.youtubeId === track.youtubeId)
      if (existing >= 0) return load(existing)
      const list = [track, ...playlist]
      setPlaylist(list)
      load(0, list)
    },
    hostRef: setHost,
  }

  return <RadioContext.Provider value={radio}>{children}</RadioContext.Provider>
}

export function useRadio() {
  const radio = useContext(RadioContext)
  if (!radio) throw new Error('useRadio must be used inside RadioProvider')
  return radio
}

export const formatTime = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000))
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}
