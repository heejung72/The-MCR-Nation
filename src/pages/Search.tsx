import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PostModal, PostRow } from '../components/Board'
import { PageHeader, Panel } from '../components/ui'
import { LORE } from '../content/lore'
import { ALBUMS } from '../content/music'
import { MINISTRIES } from '../content/nav'
import { useNation } from '../context/NationContext'
import type { Post } from '../types'

export default function Search() {
  const [params] = useSearchParams()
  const nation = useNation()
  const [open, setOpen] = useState<Post | null>(null)
  const q = (params.get('q') ?? '').trim().toLowerCase()
  const has = (text: string) => text.toLowerCase().includes(q)
  const posts = q ? nation.posts.filter((post) => has(`${post.title} ${post.body}`)) : []
  const albums = q ? ALBUMS.filter((album) => has(album.title) || album.tracks.some((track) => has(track.title))) : []
  const docs = q ? LORE.filter((entry) => has(`${entry.title} ${entry.summary} ${entry.body}`)) : []
  const pages = q ? MINISTRIES.flatMap((ministry) => ministry.items).filter((item) => has(`${item.en} ${item.ko}`)) : []
  const total = posts.length + albums.length + docs.length + pages.length

  return (
    <>
      <PageHeader kicker="SEARCH THE NATION" en="SEARCH" ko={q ? `“${params.get('q')}” 검색 결과 ${total}건` : '검색어를 입력하세요'} />
      {pages.length > 0 && <Panel title="PAGES" ko="메뉴"><ul className="link-list">{pages.map((item) => <li key={item.to}><Link to={item.to}>{item.en}<small>{item.ko}</small></Link></li>)}</ul></Panel>}
      {albums.length > 0 && <Panel title="RECORDS" ko="앨범·곡"><ul className="link-list">{albums.map((album) => <li key={album.slug}><Link to={`/records/discography#${album.slug}`}>{album.title}<small>{album.year}</small></Link></li>)}</ul></Panel>}
      {docs.length > 0 && <Panel title="DOCUMENTS" ko="세계관 문서"><ul className="link-list">{docs.map((entry) => <li key={entry.slug}><Link to={entry.section === 'lore' ? '/nation/lore' : '/moat'}>{entry.title}<small>FILE NO. {entry.fileNo}</small></Link></li>)}</ul></Panel>}
      {posts.length > 0 && <Panel title="TRANSMISSIONS" ko="게시글"><ul className="post-list">{posts.map((post) => <PostRow key={post.id} post={post} onOpen={setOpen} />)}</ul></Panel>}
      {q && !total && <p className="empty">검색 결과가 없습니다.</p>}
      <PostModal post={open} onClose={() => setOpen(null)} />
    </>
  )
}
