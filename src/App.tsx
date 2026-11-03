import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { PageHeader } from './components/ui'
import { NationProvider } from './context/NationContext'
import { RadioProvider } from './context/RadioContext'
import Citizens from './pages/Citizens'
import { AfterParade, CultureHub, NationalEvent, OpeningGuess, Prediction, Uniform } from './pages/Culture'
import Home from './pages/Home'
import Moat from './pages/Moat'
import { Directory, Guide, Lore, NationHub, Story } from './pages/Nation'
import { Discography, LiveArchive, Lyrics, RecordsHub, WorldCup } from './pages/Records'
import Search from './pages/Search'
import Transmissions from './pages/Transmissions'

function NotFound() {
  return <PageHeader kicker="404" en="FILE NOT FOUND" ko="존재하지 않거나 기밀 해제되지 않은 문서입니다." />
}

export default function App() {
  return (
    <NationProvider>
      <RadioProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="nation" element={<NationHub />} />
            <Route path="nation/story" element={<Story />} />
            <Route path="nation/guide" element={<Guide />} />
            <Route path="nation/lore" element={<Lore />} />
            <Route path="nation/directory" element={<Directory />} />
            <Route path="records" element={<RecordsHub />} />
            <Route path="records/discography" element={<Discography />} />
            <Route path="records/lyrics" element={<Lyrics />} />
            <Route path="records/worldcup" element={<WorldCup />} />
            <Route path="records/live" element={<LiveArchive />} />
            <Route path="transmissions" element={<Transmissions />} />
            <Route path="transmissions/:board" element={<Transmissions />} />
            <Route path="culture" element={<CultureHub />} />
            <Route path="culture/event" element={<NationalEvent />} />
            <Route path="culture/uniform" element={<Uniform />} />
            <Route path="culture/prediction" element={<Prediction />} />
            <Route path="culture/opening" element={<OpeningGuess />} />
            <Route path="culture/after" element={<AfterParade />} />
            <Route path="moat" element={<Moat />} />
            <Route path="citizens" element={<Citizens />} />
            <Route path="search" element={<Search />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </RadioProvider>
    </NationProvider>
  )
}
