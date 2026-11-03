import { useState } from 'react'
import { PostModal, PostRow } from '../components/Board'
import { Emblem } from '../components/Emblem'
import { PageHeader, Panel } from '../components/ui'
import { MEDIA } from '../content/media'
import { useNation } from '../context/NationContext'
import type { Post } from '../types'

export default function Citizens() {
  const nation = useNation()
  const [open, setOpen] = useState<Post | null>(null)
  const me = nation.identity
  const mine = me ? nation.posts.filter((post) => post.authorId === me.id) : []

  return (
    <>
      <PageHeader kicker="CITIZENS" en="CITIZENSHIP" ko="시민 정보" image={MEDIA.headers.citizens} />
      {me ? (
        <div className="two-col">
          <div className="citizen-card">
            <div className="citizen-card-head"><Emblem size={40} /><span>THE MCR NATION<br /><b>CITIZENSHIP CARD</b></span><small>No. {me.id.slice(0, 8).toUpperCase()}</small></div>
            <dl>
              <div><dt>NICKNAME · 별칭</dt><dd>{me.nickname}</dd></div>
              <div><dt>REGISTRY · 등록 방식</dt><dd>{me.type === 'kakao' ? '카카오 시민' : '익명 시민 (이 브라우저)'}</dd></div>
              <div><dt>STATUS · 신분</dt><dd>{me.role === 'admin' ? 'ADMINISTRATOR · 운영자' : 'CITIZEN · 시민'}</dd></div>
              <div><dt>RECORDS · 기록</dt><dd>{mine.length}건</dd></div>
            </dl>
            <span className="stamp" aria-hidden="true">DRAAG</span>
            <div className="citizen-actions">
              <button className="btn btn-ghost" onClick={() => void nation.rename()}>별칭 변경</button>
              {nation.isServer && me.type !== 'kakao' && <button className="btn btn-kakao" onClick={() => void nation.signInWithKakao()}>카카오로 전환</button>}
              {nation.isServer && <button className="text-link" onClick={() => void nation.signOut()}>로그아웃</button>}
            </div>
            {me.type === 'anonymous' && <p className="muted small">익명 시민은 브라우저 데이터를 지우면 다시 같은 별칭으로 돌아올 수 없어요.</p>}
          </div>
          <Panel title="MY RECORDS" ko="내가 남긴 기록">
            {mine.length ? <ul className="post-list">{mine.map((post) => <PostRow key={post.id} post={post} onOpen={setOpen} />)}</ul> : <p className="empty">아직 남긴 기록이 없어요.</p>}
          </Panel>
        </div>
      ) : (
        <div className="citizen-card unregistered">
          <h2>Join the Nation.</h2>
          <p>시민 등록을 하면 글쓰기, 댓글, 투표, 사진 공유를 할 수 있어요. 사이트에는 랜덤 별칭만 표시됩니다.</p>
          <button className="btn btn-red" onClick={() => void nation.requireCitizen()} disabled={nation.loading}>REGISTER NOW · 시민 등록 →</button>
        </div>
      )}
      <PostModal post={open} onClose={() => setOpen(null)} />
    </>
  )
}
