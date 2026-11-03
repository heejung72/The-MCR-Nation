import { useEffect, useRef } from 'react'
import { INSTAGRAM_ACCOUNT, instagramUrl } from '../content/instagram'

declare global {
  interface Window { instgrm?: { Embeds: { process: () => void } } }
}

const SCRIPT_SRC = 'https://www.instagram.com/embed.js'

function loadInstagram(): Promise<void> {
  if (window.instgrm) return Promise.resolve()
  return new Promise((resolve) => {
    let script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`)
    if (!script) {
      script = document.createElement('script')
      script.src = SCRIPT_SRC
      script.async = true
      document.body.appendChild(script)
    }
    script.addEventListener('load', () => resolve(), { once: true })
    // 이미 로드 중이었다면 잠시 후 확인
    window.setTimeout(() => { if (window.instgrm) resolve() }, 1500)
  })
}

/**
 * Instagram 공식 임베드. embed.js가 blockquote를 iframe으로 바꾸기 때문에,
 * React가 관리하지 않는 innerHTML 컨테이너 안에 넣는다(페이지 이동 시 오류 방지).
 * 스크립트가 막혀도 원본 링크가 남는다.
 */
export function InstagramPost({ shortcode }: { shortcode: string }) {
  if (!/^[A-Za-z0-9_-]+$/.test(shortcode)) return null
  const url = instagramUrl(shortcode)
  const html = `<blockquote class="instagram-media" data-instgrm-permalink="${url}?utm_source=ig_embed&amp;utm_campaign=loading" data-instgrm-version="14"><a href="${url}" target="_blank" rel="noreferrer">Instagram에서 이 게시물 보기 — @${INSTAGRAM_ACCOUNT.handle}</a></blockquote>`
  return (
    <div className="ig-post">
      <div className="ig-frame" dangerouslySetInnerHTML={{ __html: html }} />
      <a className="ig-link" href={url} target="_blank" rel="noreferrer">원본 게시물 열기 ↗</a>
    </div>
  )
}

export function InstagramFeed({ shortcodes, limit }: { shortcodes: string[]; limit?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const list = limit ? shortcodes.slice(0, limit) : shortcodes
  useEffect(() => {
    let alive = true
    void loadInstagram().then(() => { if (alive) window.instgrm?.Embeds.process() })
    return () => { alive = false }
  }, [list.join(',')])
  return (
    <div className="ig-feed" ref={ref}>
      {list.map((code) => <InstagramPost key={code} shortcode={code} />)}
    </div>
  )
}
