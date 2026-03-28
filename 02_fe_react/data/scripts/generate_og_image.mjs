/**
 * OG 이미지 생성 스크립트
 * 출력: public/panda-og-dark.png, public/panda-og-white.png
 *
 * 실행: node data/scripts/generate_og_image.mjs
 */

import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.resolve(__dirname, '../../public')

const W = 1200
const H = 630

// 판다 이미지 (logo_transparent.png: 1536×1024, RGBA)
// height=460 → width=690 (비율 3:2 유지)
const PANDA_H = 460
const PANDA_W = Math.round(PANDA_H * (1536 / 1024)) // 690
const PANDA_LEFT = 0
const PANDA_TOP = Math.round((H - PANDA_H) / 2) // 85

// 텍스트 위치: 판다 오른팔 끝(x≈650)에서 "A"가 겹치도록
// 판다가 SVG 텍스트 위에 그려져 → 팔이 텍스트를 앞에서 잡는 효과
const TEXT_X = 630
const TEXT_Y = 215 // dominant-baseline: central 기준, 약 상단 1/3 지점
const SUB_Y = 350

async function loadPanda() {
  const { data, info } = await sharp(path.join(publicDir, 'logo_transparent.png'))
    .resize({ height: PANDA_H })
    .toBuffer({ resolveWithObject: true })
  console.log(`판다 리사이즈: ${info.width}×${info.height} (top:${PANDA_TOP})`)
  return data
}

async function generate(isDark, pandaBuf) {
  const bg = isDark ? '#0d0a1e' : '#f8f7ff'
  const textColor = isDark ? '#ffffff' : '#0d0a1e'
  const subColor = isDark ? '#c9b8ff' : '#6b4fa8'
  const outFile = isDark ? 'panda-og-dark.png' : 'panda-og-white.png'

  // SVG 텍스트 레이어 (판다 뒤에 그려짐 → 팔이 앞으로 나옴)
  const svgText = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <text
    x="${TEXT_X}"
    y="${TEXT_Y}"
    font-family="Arial, Helvetica, sans-serif"
    font-weight="900"
    font-size="118"
    fill="${textColor}"
    dominant-baseline="central"
    text-anchor="start"
  >Atchu</text>
  <text
    x="${TEXT_X + 4}"
    y="${SUB_Y}"
    font-family="'Noto Sans CJK KR', 'Noto Sans KR', 'Apple SD Gothic Neo', Arial, sans-serif"
    font-size="30"
    fill="${subColor}"
    dominant-baseline="central"
    text-anchor="start"
  >데이터로 보는 매매 기준</text>
</svg>`

  await sharp({
    create: {
      width: W,
      height: H,
      channels: 4,
      background: bg,
    },
  })
    .composite([
      // 1) 텍스트 먼저 (판다 뒤에 배치)
      { input: Buffer.from(svgText), left: 0, top: 0 },
      // 2) 판다를 텍스트 위에 합성 → 오른팔이 "Atchu" 앞에 나타남
      { input: pandaBuf, left: PANDA_LEFT, top: PANDA_TOP },
    ])
    .png()
    .toFile(path.join(publicDir, outFile))

  console.log(`✓ ${outFile} 생성 완료`)
}

const pandaBuf = await loadPanda()
await generate(true, pandaBuf)
await generate(false, pandaBuf)

console.log('\n두 파일 모두 public/ 에 저장되었습니다.')
console.log('  - panda-og-dark.png  (다크 퍼플)')
console.log('  - panda-og-white.png (화이트)')
