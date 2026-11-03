import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/ui'
import { LORE, type LoreEntry } from '../content/lore'
import { MEDIA } from '../content/media'
import { MINISTRIES } from '../content/nav'
import { LoreCards } from './Nation'

export default function Moat() {
  const [params, setParams] = useSearchParams()
  const filter = params.get('f') as LoreEntry['section'] | null
  const sections = MINISTRIES.find((ministry) => ministry.no === '05')!.items
  const entries = LORE.filter((entry) => entry.section !== 'lore' && (!filter || entry.section === filter))
  return (
    <>
      <PageHeader image={MEDIA.headers.moat} kicker="05 · MOAT" en="CLASSIFIED ARCHIVE" ko="기밀 보관소">
        <p>검열된 문서는 눌러서 열람할 수 있어요. 공식 설정이 아닌 문서는 상태 라벨로 구분합니다.</p>
      </PageHeader>
      <nav className="category-tabs" aria-label="문서 분류">
        <button className={!filter ? 'active' : ''} onClick={() => setParams({})}>ALL<small>전체</small></button>
        {sections.map((item) => {
          const key = item.to.split('f=')[1]
          return <button key={key} className={filter === key ? 'active' : ''} onClick={() => setParams({ f: key })}>{item.en}<small>{item.ko}</small></button>
        })}
      </nav>
      {entries.length ? <LoreCards entries={entries} /> : <p className="empty">이 분류의 문서는 아직 기밀 해제되지 않았습니다. 출처가 확인되면 공개됩니다.</p>}
    </>
  )
}
