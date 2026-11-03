const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_INPUT = 15 * 1024 * 1024
const MAX_OUTPUT = 5 * 1024 * 1024
const MAX_EDGE = 1600

/** 업로드 전 검증 + 긴 변 1600px WebP로 줄인다(위치 정보 등 EXIF도 제거됨). */
export async function prepareImage(file: File): Promise<{ blob: Blob; extension: string }> {
  if (!ACCEPTED.includes(file.type)) throw new Error('JPG, PNG, WEBP 사진만 올릴 수 있습니다.')
  if (file.size > MAX_INPUT) throw new Error('사진이 너무 큽니다. 15MB 이하로 골라 주세요.')
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.85))
  if (blob && blob.type === 'image/webp' && blob.size <= MAX_OUTPUT) return { blob, extension: 'webp' }
  const jpeg = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85))
  if (!jpeg || jpeg.size > MAX_OUTPUT) throw new Error('사진을 5MB 이하로 줄이지 못했습니다. 다른 사진을 골라 주세요.')
  return { blob: jpeg, extension: 'jpg' }
}
