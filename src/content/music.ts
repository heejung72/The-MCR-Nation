/**
 * 음악 데이터. Spotify ID는 open.spotify.com 공식 아티스트/앨범 페이지에서 확인한 값이다.
 * spotifyId가 없는 곡은 플레이어에서 재생 버튼 대신 Spotify 링크만 보여 준다.
 */

export const ARTIST_SPOTIFY_URL = 'https://open.spotify.com/artist/7FBcuc1gsnv6Y1nwFtNRCb'
export const ARTIST_APPLE_MUSIC_SEARCH = 'https://music.apple.com/kr/search?term=My%20Chemical%20Romance'

export type Track = { title: string; album: string; spotifyId?: string; youtubeId?: string }

/**
 * YouTube 영상 ID — 모두 My Chemical Romance 공식 채널(@MyChemicalRomance) 업로드이며,
 * oEmbed로 외부 사이트 퍼가기 허용을 확인했다(2026-11-03). NATIONAL RADIO는 이 영상들로 전곡을 재생한다.
 */
export const YOUTUBE_IDS: Record<string, string> = {
  'The End.': 'XkCA2XqUJ4o', 'Dead!': 'H48kOqqaWv0', 'This Is How I Disappear': '3df8CooYnSs', 'The Sharpest Lives': '73Y_x30uKQg',
  'Welcome to the Black Parade': 'RRKJiM9Njr8', "I Don't Love You": 'pyi0ZfuIIvo', 'House of Wolves': 'woalhgxmnDo', 'Cancer': 'wc2s9skF_58',
  'Mama': 'GEvLye15sq0', 'Sleep': 'RSAoJJzVXYY', 'Teenagers': 'k6EQAOmJrbw', 'Disenchanted': 'j_MlBCb9-m8', 'Famous Last Words': '8bbTtPL1jRs',
  'Blood': 'uX3Gw82f6GU',
  'Helena': 'UCCyoocDxBA', "I'm Not Okay (I Promise)": 'dhZTNgAs4Fc', 'The Ghost of You': 'uCUpvTMis-Y',
  'Na Na Na (Na Na Na Na Na Na Na Na Na)': '1Y4_iPb-Ovw', 'Bulletproof Heart': 'TGcLoEqL1es', 'SING': 'hTgnDLWeeaM', 'Planetary (GO!)': 'UvfNmXbVHi4',
  'The Only Hope for Me Is You': 'xd4pUfqt-Ko', 'Party Poison': 'Uer6BqLjZek', 'Save Yourself, I’ll Hold Them Back': 'EKGEuu83nRg',
  'S/C/A/R/E/C/R/O/W': 'FRDgaJJE670', 'Summertime': 'oj1q7iQ1v2s', 'DESTROYA': 'I4WgPi1hc6M', 'The Kids from Yesterday': 'YXiLHIYqb_Y',
  'Vampire Money': 'OPS1Qb9ap8A', 'The Foundations of Decay': 'V2kWUJkRvVs',
}
export const MCR_YOUTUBE_URL = 'https://www.youtube.com/@MyChemicalRomance'
export const youtubeThumb = (id: string) => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`
export const youtubeUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`

export type Album = {
  slug: string
  title: string
  year: string
  kind: string
  note: string
  spotifyAlbumId?: string
  tracks: Track[]
}

const t = (album: string, list: [string, string?][]): Track[] => list.map(([title, spotifyId]) => ({ title, album, spotifyId, youtubeId: YOUTUBE_IDS[title] }))

export const ALBUMS: Album[] = [
  {
    slug: 'bullets', title: 'I Brought You My Bullets, You Brought Me Your Love', year: '2002', kind: '1st Studio Album',
    note: '뉴저지에서 결성된 밴드의 데뷔 앨범.', spotifyAlbumId: '3VSl97ITIbXoFQvx2DQ605', tracks: [],
  },
  {
    slug: 'three-cheers', title: 'Three Cheers for Sweet Revenge', year: '2004', kind: '2nd Studio Album',
    note: '“Helena”, “I’m Not Okay (I Promise)”, “The Ghost of You”가 수록된 메이저 데뷔작.', spotifyAlbumId: '3DuiGV3J09SUhvp8gqNx8h',
    tracks: t('Three Cheers for Sweet Revenge', [
      ['Helena', '5dTHtzHFPyi8TlTtzoz1J9'], ["Give 'Em Hell, Kid", '0axF06XwNLobcx5z8BVtYw'], ['To the End', '1GErReAT0swX36x3O8GyQn'],
      ["You Know What They Do to Guys Like Us in Prison"], ["I'm Not Okay (I Promise)", '7lRlq939cDG4SzWOF4VAnd'], ['The Ghost of You', '1yKAqZoi8xWGLCf5vajroL'],
      ['The Jetset Life Is Gonna Kill You', '7HKfrU3iuEFrKxTAfVznrG'], ['Interlude', '4vpaz6338VqJIeJHq6z2mU'], ['Thank You for the Venom', '0BpKPyXhWsTaWkgXeOd1Sn'],
      ["Hang 'Em High", '262RJtiqytpugV1UvDicN9'], ["It's Not a Fashion Statement, It's a Deathwish", '4fGIqy3bvjX0jz1SJHqjjo'],
      ['Cemetery Drive', '2cViIXIe8Pbd1sOJExMJlK'], ['I Never Told You What I Do for a Living', '6gLn8QhAYL4dEwdpVjfCPl'],
    ]),
  },
  {
    slug: 'the-black-parade', title: 'The Black Parade', year: '2006', kind: '3rd Studio Album · Concept Album',
    note: '죽음을 앞둔 “The Patient”의 이야기를 따라가는 콘셉트 앨범. 이 사이트 세계관의 출발점.', spotifyAlbumId: '0FZK97MXMm5mUQ8mtudjuK',
    tracks: t('The Black Parade', [
      ['The End.', '6s2yqZbiPNPL1B2IeCMsUA'], ['Dead!'], ['This Is How I Disappear', '0rUNZQuYQvOz6A6zwyT6tM'], ['The Sharpest Lives', '2kMjk14RmYyYhhSbipoa9U'],
      ['Welcome to the Black Parade', '5wQnmLuC1W7ATsArWACrgW'], ["I Don't Love You", '4RAOI1etsgbh5NP3T5R8rN'], ['House of Wolves'],
      ['Cancer', '0GgN4MhR5GKn5IcKN0e0rG'], ['Mama'], ['Sleep', '2pONuBYwWrNm9jcJH6hmPc'], ['Teenagers', '7j31rVgGX9Q2blT92VBEA0'],
      ['Disenchanted', '6T7MAQCekVb3UnCykjX3BP'], ['Famous Last Words', '2d6m2F4I7wCuAKtSsdhh83'], ['Blood'],
    ]),
  },
  {
    slug: 'danger-days', title: 'Danger Days: The True Lives of the Fabulous Killjoys', year: '2010', kind: '4th Studio Album',
    note: '사막의 킬조이들을 그린, 색과 속도의 앨범.', spotifyAlbumId: '2wPnKggTK3QhYAKL7Q0vvr',
    tracks: t('Danger Days', [
      ['Look Alive, Sunshine', '1VTn4DY9aJn5Wc05ieKx6T'], ['Na Na Na (Na Na Na Na Na Na Na Na Na)'], ['Bulletproof Heart', '2EGF4JrisrJ4D4HOdTyYEO'],
      ['SING', '1mX6SYJ1ZpcoxQUiER8wOI'], ['Planetary (GO!)'], ['The Only Hope for Me Is You', '0OByd6pqxZzsXZRj6kJYbN'],
      ['Jet-Star and the Kobra Kid / Traffic Report', '2iMjpD1UJzncfBpOsVeupT'], ['Party Poison', '1RT6zSjs59gJdFfUshT465'],
      ['Save Yourself, I’ll Hold Them Back'], ['S/C/A/R/E/C/R/O/W', '53lQywP7h2KlnfPAbwxWD9'], ['Summertime', '7cQjIIjLOhbRVCXyIepF2U'],
      ['DESTROYA', '08gaUXuT1LXIae7TwBTCB9'], ['The Kids from Yesterday', '5A0OekqQy0rb1pcsf4k0J7'], ['Goodnite, Dr. Death', '1QPY7FhOsWSbvpKuQW6q4O'],
      ['Vampire Money'],
    ]),
  },
  {
    slug: 'foundations-of-decay', title: 'The Foundations of Decay', year: '2022', kind: 'Single',
    note: '재결합 이후 발표한 싱글.', tracks: t('The Foundations of Decay', [['The Foundations of Decay']]),
  },
]

/** NATIONAL RADIO 기본 재생 목록 (공식 YouTube 영상이 있는 곡) */
export const RADIO_PLAYLIST: Track[] = [
  'Welcome to the Black Parade', 'Teenagers', 'Helena', "I'm Not Okay (I Promise)", 'Famous Last Words', 'The Ghost of You',
  "I Don't Love You", 'Na Na Na (Na Na Na Na Na Na Na Na Na)', 'SING', 'The Kids from Yesterday', 'Cancer', 'The Sharpest Lives',
  'Disenchanted', 'The Foundations of Decay',
].map((title) => ALBUMS.flatMap((album) => album.tracks).find((track) => track.title === title && track.youtubeId)!)

/** 셋리스트 월드컵 8강 */
export const WORLD_CUP_SONGS = ['Welcome to the Black Parade', 'Helena', "I'm Not Okay (I Promise)", 'Famous Last Words', 'Teenagers', 'The Ghost of You', 'Na Na Na', 'The Foundations of Decay']

/** 셋리스트 예측 후보곡 */
export const PREDICTION_SONGS: string[] = [
  ...ALBUMS.find((album) => album.slug === 'the-black-parade')!.tracks.map((track) => track.title), 'Blood',
  'Helena', "I'm Not Okay (I Promise)", 'The Ghost of You', 'Thank You for the Venom', "You Know What They Do to Guys Like Us in Prison", 'Cemetery Drive',
  'Vampires Will Never Hurt You', 'Headfirst for Halos', 'Our Lady of Sorrows',
  'Na Na Na', 'SING', 'Planetary (GO!)', 'The Kids from Yesterday', 'DESTROYA', 'Summertime',
  'The Foundations of Decay', 'Desert Song', 'Skylines and Turnstiles',
]

export const spotifyTrackUrl = (id: string) => `https://open.spotify.com/track/${id}`
export const spotifyAlbumUrl = (id: string) => `https://open.spotify.com/album/${id}`
