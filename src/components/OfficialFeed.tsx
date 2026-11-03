import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { INSTAGRAM_ACCOUNT, instagramUrl, parseInstagramShortcode, type OfficialPost } from '../content/instagram'
import { useNation } from '../context/NationContext'
import { InstagramFeed } from './InstagramEmbed'

/** 공식 소식 피드. 운영자에게는 링크 추가/삭제 도구가 보인다. */
export function OfficialFeed({ limit, manage = false }: { limit?: number; manage?: boolean }) {
  const nation = useNation()
  const [posts, setPosts] = useState<OfficialPost[] | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => nation.repo.listOfficialPosts().then(setPosts).catch((error) => { nation.fail(error); setPosts([]) }), [nation])
  useEffect(() => { void load() }, [nation.repo]) // eslint-disable-line react-hooks/exhaustive-deps

  const add = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const shortcode = parseInstagramShortcode(String(data.get('link') ?? ''))
    if (!shortcode) return nation.toast('인스타그램 게시물 링크를 확인해 주세요. 예: https://www.instagram.com/p/XXXX/')
    setSaving(true)
    try {
      await nation.repo.addOfficialPost({ shortcode, note: String(data.get('note') ?? '').trim() || null, pinned: data.get('pinned') === 'on' })
      form.reset()
      await load()
      nation.toast('공식 소식을 추가했습니다.')
    } catch (error) { nation.fail(error) } finally { setSaving(false) }
  }

  const remove = async (shortcode: string) => {
    if (!window.confirm('이 게시물을 공식 소식에서 내릴까요? (인스타그램 원본은 그대로입니다)')) return
    try { await nation.repo.removeOfficialPost(shortcode); await load() } catch (error) { nation.fail(error) }
  }

  if (!posts) return <p className="empty">공식 소식을 불러오는 중…</p>
  const shown = limit ? posts.slice(0, limit) : posts
  return (
    <div className="official-feed">
      {manage && nation.isAdmin && (
        <form className="composer official-form" onSubmit={(event) => void add(event)}>
          <p className="composer-hint">운영자 전용 — @{INSTAGRAM_ACCOUNT.handle} 등의 인스타그램 게시물 링크를 붙여넣으면 바로 게시됩니다.</p>
          <label>게시물 링크<input name="link" required placeholder="https://www.instagram.com/p/…" /></label>
          <label>메모 (선택)<input name="note" maxLength={120} placeholder="예: 공연 당일 타임테이블" /></label>
          <label className="inline-check"><input type="checkbox" name="pinned" /> 맨 위에 고정</label>
          <div className="composer-actions"><button className="btn btn-red" type="submit" disabled={saving}>{saving ? '추가 중…' : '공식 소식 추가'}</button></div>
        </form>
      )}
      {shown.length ? (
        <>
          {shown.some((post) => post.note || post.pinned) && (
            <ul className="official-notes">
              {shown.filter((post) => post.note || post.pinned).map((post) => <li key={post.shortcode}>{post.pinned && <em className="tag tag-red">PINNED</em>}<a href={instagramUrl(post.shortcode)} target="_blank" rel="noreferrer">{post.note ?? '고정된 공식 게시물'}</a></li>)}
            </ul>
          )}
          <InstagramFeed shortcodes={shown.map((post) => post.shortcode)} />
          {manage && nation.isAdmin && (
            <ul className="official-admin-list">
              {shown.map((post) => <li key={post.shortcode}><code>{post.shortcode}</code>{post.note && <span>{post.note}</span>}<button className="text-link danger" onClick={() => void remove(post.shortcode)}>내리기</button></li>)}
            </ul>
          )}
        </>
      ) : <p className="empty">아직 등록된 공식 소식이 없습니다.</p>}
    </div>
  )
}
