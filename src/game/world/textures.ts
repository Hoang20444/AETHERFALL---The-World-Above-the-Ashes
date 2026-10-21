import { CanvasTexture, ClampToEdgeWrapping, RepeatWrapping, SRGBColorSpace } from 'three'
import { mulberry32 } from './noise'

/**
 * Small runtime-generated textures. These stand in until hand-made textures
 * are exported from Blender into public/textures. Each is created once.
 */

function canvas(size: number) {
  const element = document.createElement('canvas')
  element.width = size
  element.height = size
  const context = element.getContext('2d')
  if (!context) throw new Error('2D canvas is not available')
  return { element, context }
}

function toTexture(element: HTMLCanvasElement, color = true) {
  const texture = new CanvasTexture(element)
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.anisotropy = 8
  if (color) texture.colorSpace = SRGBColorSpace
  return texture
}

function speckle(context: CanvasRenderingContext2D, size: number, rand: () => number, count: number, alpha: number) {
  for (let i = 0; i < count; i++) {
    const shade = rand() > 0.5 ? 255 : 0
    context.fillStyle = `rgba(${shade},${shade},${shade},${alpha * rand()})`
    const s = 1 + rand() * 2.5
    context.fillRect(rand() * size, rand() * size, s, s)
  }
}

/** Handcrafted stylized fantasy flagstones: irregular interlocking slabs, chiseled bevels, mossy crevices, and fine cracks. */
function createFlagstoneTexture(): CanvasTexture {
  const size = 1024
  const { element, context } = canvas(size)
  const rand = mulberry32(101)

  // 1. Base dark weathered mortar foundation
  context.fillStyle = '#2a2f36'
  context.fillRect(0, 0, size, size)

  // 2. Generate multi-tiered interlocking paving grid (varying rows and broken joints)
  const rows = 6
  const rowHeight = size / rows

  for (let row = 0; row < rows; row++) {
    const y0 = row * rowHeight
    let x = (row % 2 === 0 ? 0 : -rowHeight * 0.45) + (rand() - 0.5) * 20

    while (x < size + 50) {
      // Dynamic stone width: mix of wide flagstones and compact keystones
      const width = 110 + rand() * 150
      const stoneH = rowHeight - 8 + (rand() - 0.5) * 6
      const stoneX = x + 4
      const stoneY = y0 + 4

      // Rich restrained stone color variation
      const baseLuma = 145 + Math.floor(rand() * 45)
      const warmShift = Math.floor(rand() * 8)
      const stoneColor = `rgb(${baseLuma + warmShift}, ${baseLuma}, ${baseLuma - 8})`

      // Draw beveled stone slab
      context.save()
      context.fillStyle = stoneColor
      context.beginPath()
      // Beveled rounded corners with organic irregularities
      const cr = 6 + rand() * 4
      context.roundRect(stoneX, stoneY, width - 8, stoneH, [cr, cr + 2, cr, cr + 1])
      context.fill()

      // Subtle directional chiseled lighting / wear gradient
      const grad = context.createLinearGradient(stoneX, stoneY, stoneX + width, stoneY + stoneH)
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.14)') // Top-left sunlit bevel
      grad.addColorStop(0.4, 'rgba(255, 255, 255, 0.02)')
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.18)')       // Bottom-right shadow bevel
      context.fillStyle = grad
      context.fill()

      // Inner chiseled rim stroke
      context.strokeStyle = 'rgba(255, 255, 255, 0.09)'
      context.lineWidth = 2
      context.stroke()

      // Occasional natural hairline crack
      if (rand() > 0.65) {
        context.strokeStyle = 'rgba(30, 35, 42, 0.45)'
        context.lineWidth = 1.2
        context.beginPath()
        const cx0 = stoneX + width * 0.3 + rand() * width * 0.4
        const cy0 = stoneY + 4
        context.moveTo(cx0, cy0)
        context.lineTo(cx0 + (rand() - 0.5) * 25, cy0 + stoneH * 0.5)
        context.lineTo(cx0 + (rand() - 0.5) * 35, cy0 + stoneH - 4)
        context.stroke()
      }

      context.restore()

      // 3. Subtle moss growth in mortar joints and corner crevices
      if (rand() > 0.4) {
        context.fillStyle = `rgba(${55 + Math.floor(rand() * 20)}, ${95 + Math.floor(rand() * 30)}, ${40 + Math.floor(rand() * 15)}, ${0.45 + rand() * 0.35})`
        const mossX = stoneX + (rand() > 0.5 ? 0 : width - 12)
        const mossY = stoneY + stoneH - 4
        const mossR = 5 + rand() * 8
        context.beginPath()
        context.arc(mossX, mossY, mossR, 0, Math.PI * 2)
        context.fill()
      }

      x += width
    }
  }

  // 4. Subtle micro-speckle texture for authentic ancient limestone grain
  speckle(context, size, rand, 18000, 0.08)
  return toTexture(element)
}

/** Coursed masonry blocks for walls, cliffs and pillars. */
function createMasonryTexture(): CanvasTexture {
  const size = 512
  const { element, context } = canvas(size)
  const rand = mulberry32(91)
  context.fillStyle = '#3e4144'
  context.fillRect(0, 0, size, size)
  const courses = 6
  const courseHeight = size / courses
  for (let row = 0; row < courses; row++) {
    let x = -rand() * 80
    while (x < size) {
      const width = 110 + rand() * 120
      const light = 140 + Math.floor(rand() * 36)
      context.fillStyle = `rgb(${light},${light + 2},${light + 6})`
      context.fillRect(x + 2.5, row * courseHeight + 2.5, width - 5, courseHeight - 5)
      x += width
    }
  }
  // Vertical weathering streaks.
  for (let i = 0; i < 60; i++) {
    const x = rand() * size
    const gradient = context.createLinearGradient(0, 0, 0, size)
    gradient.addColorStop(0, 'rgba(0,0,0,0)')
    gradient.addColorStop(1, `rgba(0,0,0,${0.05 + rand() * 0.08})`)
    context.fillStyle = gradient
    context.fillRect(x, 0, 2 + rand() * 10, size)
  }
  speckle(context, size, rand, 7000, 0.14)
  return toTexture(element)
}

/** Soft, lumpy cloud puff used by billboard sprites. */
function createCloudTexture(): CanvasTexture {
  const size = 256
  const { element, context } = canvas(size)
  const rand = mulberry32(5)
  for (let i = 0; i < 22; i++) {
    const angle = rand() * Math.PI * 2
    const distance = Math.pow(rand(), 0.8) * size * 0.22
    const x = size / 2 + Math.cos(angle) * distance * 1.3
    const y = size / 2 + Math.sin(angle) * distance * 0.6
    const radius = size * (0.12 + rand() * 0.16)
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius)
    gradient.addColorStop(0, 'rgba(255,255,255,0.42)')
    gradient.addColorStop(0.6, 'rgba(255,255,255,0.14)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
    context.fillStyle = gradient
    context.fillRect(0, 0, size, size)
  }
  const texture = toTexture(element)
  texture.wrapS = texture.wrapT = ClampToEdgeWrapping
  return texture
}

/** Radial glow for additive halos. */
function createGlowTexture(): CanvasTexture {
  const size = 128
  const { element, context } = canvas(size)
  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.25, 'rgba(255,255,255,0.35)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, size, size)
  const texture = toTexture(element)
  texture.wrapS = texture.wrapT = ClampToEdgeWrapping
  return texture
}

/** Ancient carved stone with luminous glowing cyan Aether runes and energy conduits. */
function createRunicTexture(): CanvasTexture {
  const size = 512
  const { element, context } = canvas(size)
  const rand = mulberry32(104)

  // Weathered dark slate background
  context.fillStyle = '#26303b'
  context.fillRect(0, 0, size, size)

  // Subtle stone grain
  speckle(context, size, rand, 8000, 0.12)

  // Ancient etched grooves (dark recessed outline)
  context.strokeStyle = 'rgba(15, 20, 26, 0.85)'
  context.lineWidth = 14
  context.lineCap = 'round'
  context.lineJoin = 'round'

  const drawGlyphs = (cx: number, cy: number, scale: number) => {
    context.beginPath()
    // Vertical conduit
    context.moveTo(cx, cy - 60 * scale)
    context.lineTo(cx, cy + 60 * scale)
    // Diamond rune
    context.moveTo(cx, cy - 35 * scale)
    context.lineTo(cx + 25 * scale, cy)
    context.lineTo(cx, cy + 35 * scale)
    context.lineTo(cx - 25 * scale, cy)
    context.closePath()
    // Horizontal cross-seals
    context.moveTo(cx - 30 * scale, cy - 20 * scale)
    context.lineTo(cx + 30 * scale, cy - 20 * scale)
    context.moveTo(cx - 20 * scale, cy + 20 * scale)
    context.lineTo(cx + 20 * scale, cy + 20 * scale)
    context.stroke()
  }

  // Draw groove depressions
  for (let x = 64; x < size; x += 128) {
    for (let y = 80; y < size; y += 170) {
      drawGlyphs(x, y, 0.85)
    }
  }

  // Outer Aether cyan glow
  context.strokeStyle = 'rgba(95, 240, 255, 0.45)'
  context.lineWidth = 9
  context.shadowColor = '#5ff0ff'
  context.shadowBlur = 12

  for (let x = 64; x < size; x += 128) {
    for (let y = 80; y < size; y += 170) {
      drawGlyphs(x, y, 0.85)
    }
  }

  // Core brilliant cyan stroke
  context.strokeStyle = '#a6f8ff'
  context.lineWidth = 3
  context.shadowBlur = 4

  for (let x = 64; x < size; x += 128) {
    for (let y = 80; y < size; y += 170) {
      drawGlyphs(x, y, 0.85)
    }
  }

  return toTexture(element)
}

/** Painterly stylized grass clumps, moss and delicate white fantasy flowers. */
function createFoliageTexture(): CanvasTexture {
  const size = 256
  const { element, context } = canvas(size)
  const rand = mulberry32(42)

  // Transparent background
  context.clearRect(0, 0, size, size)

  // Clustered grass tufts
  const bladeColors = ['#3d6328', '#4f7c32', '#6b9e3e', '#88ba4e']
  const tufts = 48
  for (let t = 0; t < tufts; t++) {
    const rootX = rand() * size
    const rootY = rand() * size
    const bladeCount = 6 + Math.floor(rand() * 8)

    for (let b = 0; b < bladeCount; b++) {
      const angle = -Math.PI / 2 + (rand() - 0.5) * 1.2
      const length = 18 + rand() * 26
      const tipX = rootX + Math.cos(angle) * length
      const tipY = rootY + Math.sin(angle) * length

      context.strokeStyle = bladeColors[Math.floor(rand() * bladeColors.length)]
      context.lineWidth = 2 + rand() * 2
      context.beginPath()
      context.moveTo(rootX + (rand() - 0.5) * 6, rootY)
      context.quadraticCurveTo(
        rootX + (rand() - 0.5) * 12,
        rootY - length * 0.5,
        tipX,
        tipY,
      )
      context.stroke()
    }
  }

  // Tiny white fantasy flower clusters with gold stamen
  for (let f = 0; f < 36; f++) {
    const fx = rand() * size
    const fy = rand() * size
    const r = 2.5 + rand() * 2

    // 5 white petals
    context.fillStyle = 'rgba(245, 248, 252, 0.95)'
    for (let p = 0; p < 5; p++) {
      const a = (p / 5) * Math.PI * 2
      context.beginPath()
      context.arc(fx + Math.cos(a) * r, fy + Math.sin(a) * r, r * 0.7, 0, Math.PI * 2)
      context.fill()
    }
    // Gold center
    context.fillStyle = '#f7cf68'
    context.beginPath()
    context.arc(fx, fy, r * 0.5, 0, Math.PI * 2)
    context.fill()
  }

  const texture = toTexture(element)
  texture.wrapS = texture.wrapT = ClampToEdgeWrapping
  return texture
}

/** Cascading stylized waterfall ribbon with foaming streaks. */
function createWaterfallTexture(): CanvasTexture {
  const width = 256
  const height = 512
  const { element, context } = canvas(width)
  const rand = mulberry32(77)

  // Gradient base: translucent cyan to white-blue
  const baseGrad = context.createLinearGradient(0, 0, width, 0)
  baseGrad.addColorStop(0, 'rgba(60, 180, 220, 0.35)')
  baseGrad.addColorStop(0.2, 'rgba(95, 240, 255, 0.85)')
  baseGrad.addColorStop(0.8, 'rgba(95, 240, 255, 0.85)')
  baseGrad.addColorStop(1, 'rgba(60, 180, 220, 0.35)')
  context.fillStyle = baseGrad
  context.fillRect(0, 0, width, height)

  // Vertical rushing white foam ribbons
  for (let i = 0; i < 70; i++) {
    const x = rand() * width
    const w = 2 + rand() * 6
    const foamGrad = context.createLinearGradient(0, 0, 0, height)
    foamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)')
    foamGrad.addColorStop(0.5, 'rgba(220, 248, 255, 0.75)')
    foamGrad.addColorStop(1, 'rgba(255, 255, 255, 0.95)')
    context.fillStyle = foamGrad
    context.fillRect(x, 0, w, height)
  }

  // Soft spray mist speckles
  for (let s = 0; s < 1200; s++) {
    context.fillStyle = `rgba(255, 255, 255, ${0.2 + rand() * 0.6})`
    context.fillRect(rand() * width, rand() * height, 1 + rand() * 3, 2 + rand() * 5)
  }

  const texture = toTexture(element)
  texture.wrapS = ClampToEdgeWrapping
  texture.wrapT = RepeatWrapping
  return texture
}

const cache = new Map<string, CanvasTexture>()
function cached(key: string, factory: () => CanvasTexture) {
  let texture = cache.get(key)
  if (!texture) {
    texture = factory()
    cache.set(key, texture)
  }
  return texture
}

export const getFlagstoneTexture = () => cached('flagstone', createFlagstoneTexture)
export const getMasonryTexture = () => cached('masonry', createMasonryTexture)
export const getCloudTexture = () => cached('cloud', createCloudTexture)
export const getGlowTexture = () => cached('glow', createGlowTexture)
export const getRunicTexture = () => cached('runic', createRunicTexture)
export const getFoliageTexture = () => cached('foliage', createFoliageTexture)
export const getWaterfallTexture = () => cached('waterfall', createWaterfallTexture)
