import { useEffect, useState } from 'react'

const CACHE_KEY = 'mcr-nation:album-art'
const memory: Record<string, string> = (() => { try { return JSON.parse(sessionStorage.getItem(CACHE_KEY) ?? '{}') } catch { return {} } })()

/** Spotify 공식 oEmbed가 제공하는 앨범 커버 이미지 URL. 실패하면 null(타이포 커버로 대체). */
export function useAlbumArt(spotifyAlbumId?: string): string | null {
  const [url, setUrl] = useState<string | null>(spotifyAlbumId ? memory[spotifyAlbumId] ?? null : null)
  useEffect(() => {
    if (!spotifyAlbumId || memory[spotifyAlbumId]) return
    let alive = true
    fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(`https://open.spotify.com/album/${spotifyAlbumId}`)}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { thumbnail_url?: string } | null) => {
        if (!alive || !data?.thumbnail_url) return
        memory[spotifyAlbumId] = data.thumbnail_url
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(memory)) } catch { /* 저장 불가 */ }
        setUrl(data.thumbnail_url)
      })
      .catch(() => undefined)
    return () => { alive = false }
  }, [spotifyAlbumId])
  return url
}
