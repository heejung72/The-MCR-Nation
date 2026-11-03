/**
 * 사이트 이미지. 원본은 public/media/img, 웹용 사본은 public/media/photos(WebP).
 * 출처·허가는 public/media/credits.md에 기록하고, 권리자 요청이 있으면 즉시 내린다.
 */
const photo = (name: string) => `/media/photos/${name}.webp`

export const MEDIA = {
  heroImage: photo('black-parade-city'),
  paradeImage: photo('black-parade-uniforms'),
  eventImage: photo('stairs'),
  stencil: photo('stencil'),
  ministryCards: [photo('dark-square'), photo('white-hair'), photo('street'), photo('sepia-lineup')],
  headers: {
    nation: photo('desert'),
    records: photo('magazine'),
    transmissions: photo('backseat'),
    culture: photo('golf-cart'),
    moat: photo('dark-lineup'),
    citizens: photo('white-studio'),
    story: photo('sepia-lineup'),
    event: photo('stairs'),
  },
}

/** MCR STORY 사진 보관함 */
export const GALLERY: { src: string; label: string }[] = [
  { src: photo('black-parade-city'), label: 'THE BLACK PARADE' },
  { src: photo('black-parade-uniforms'), label: 'THE BLACK PARADE' },
  { src: photo('white-hair'), label: 'ARCHIVE' },
  { src: photo('dark-square'), label: 'ARCHIVE' },
  { src: photo('dark-lineup'), label: 'ARCHIVE' },
  { src: photo('stairs'), label: 'ARCHIVE' },
  { src: photo('white-studio'), label: 'ARCHIVE' },
  { src: photo('magazine'), label: 'PRESS' },
  { src: photo('street'), label: 'ARCHIVE' },
  { src: photo('desert'), label: 'ARCHIVE' },
  { src: photo('golf-cart'), label: 'ARCHIVE' },
  { src: photo('backseat'), label: 'ARCHIVE' },
  { src: photo('sepia-lineup'), label: 'ARCHIVE' },
  { src: photo('stencil'), label: 'FAN ART' },
]
