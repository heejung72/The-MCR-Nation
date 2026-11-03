import { NavLink, useParams } from 'react-router-dom'
import { BoardView } from '../components/Board'
import { PageHeader } from '../components/ui'
import { BOARDS, TRANSMISSION_BOARDS } from '../content/boards'
import { MEDIA } from '../content/media'
import type { BoardId } from '../types'

export default function Transmissions() {
  const { board } = useParams()
  const current = TRANSMISSION_BOARDS.includes(board as BoardId) ? (board as BoardId) : null
  const boards: BoardId[] = current ? [current] : [...TRANSMISSION_BOARDS, 'lyrics', 'after', 'looks', 'notice']
  return (
    <>
      <PageHeader image={MEDIA.headers.transmissions} kicker="03 · MINISTRY OF TRANSMISSIONS" en="THE UNDERGROUND" ko={current ? `${BOARDS[current].en} · ${BOARDS[current].ko}` : '통신부 — 전체 글'}>
        <p>Speak. Share. Belong. {current ? BOARDS[current].hint : '시민들의 모든 전송을 모아 봅니다.'}</p>
      </PageHeader>
      <nav className="category-tabs" aria-label="게시판 분류">
        <NavLink to="/transmissions" end>ALL POSTS<small>전체</small></NavLink>
        {TRANSMISSION_BOARDS.map((id) => <NavLink key={id} to={`/transmissions/${id}`}>{BOARDS[id].en}<small>{BOARDS[id].ko}</small></NavLink>)}
      </nav>
      <BoardView key={current ?? 'all'} boards={boards} writable={current ? [current] : TRANSMISSION_BOARDS} title={current ? BOARDS[current].ko : '전체 글'} />
    </>
  )
}
