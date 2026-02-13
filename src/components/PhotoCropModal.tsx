import { useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from '../i18n/useI18n'

interface PhotoCropModalProps {
  source: File | string
  onCancel: () => void
  onSave: (dataUrl: string) => void
}

const CROP_SIZE = 240
const OUTPUT_SIZE = 400

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function PhotoCropModal({ source, onCancel, onSave }: PhotoCropModalProps) {
  const { t } = useI18n()
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 })
  const [baseScale, setBaseScale] = useState(1)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragState = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 })
  const imgRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    if (typeof source === 'string') {
      setImageSrc(source)
      return
    }

    const reader = new FileReader()
    reader.onload = () => setImageSrc(reader.result as string)
    reader.readAsDataURL(source)
  }, [source])

  const scale = useMemo(() => baseScale * zoom, [baseScale, zoom])

  const getBounds = (nextScale: number) => {
    const scaledWidth = imgSize.width * nextScale
    const scaledHeight = imgSize.height * nextScale
    return {
      minX: CROP_SIZE - scaledWidth,
      minY: CROP_SIZE - scaledHeight,
      maxX: 0,
      maxY: 0,
    }
  }

  useEffect(() => {
    if (!imgSize.width || !imgSize.height) return
    const { minX, minY, maxX, maxY } = getBounds(scale)

    setOffset((prev) => ({
      x: clamp(prev.x, minX, maxX),
      y: clamp(prev.y, minY, maxY),
    }))
  }, [imgSize, scale])

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    const width = img.naturalWidth
    const height = img.naturalHeight
    const nextBaseScale = Math.max(CROP_SIZE / width, CROP_SIZE / height)
    const scaledWidth = width * nextBaseScale
    const scaledHeight = height * nextBaseScale
    setImgSize({ width, height })
    setBaseScale(nextBaseScale)
    setZoom(1)
    setOffset({
      x: (CROP_SIZE - scaledWidth) / 2,
      y: (CROP_SIZE - scaledHeight) / 2,
    })
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!imgSize.width || !imgSize.height) return
    e.currentTarget.setPointerCapture(e.pointerId)
    setIsDragging(true)
    dragState.current = {
      x: e.clientX,
      y: e.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    const deltaX = e.clientX - dragState.current.x
    const deltaY = e.clientY - dragState.current.y
    const { minX, minY, maxX, maxY } = getBounds(scale)

    setOffset({
      x: clamp(dragState.current.offsetX + deltaX, minX, maxX),
      y: clamp(dragState.current.offsetY + deltaY, minY, maxY),
    })
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId)
    setIsDragging(false)
  }

  const handleSave = () => {
    if (!imgRef.current) return
    const canvas = document.createElement('canvas')
    canvas.width = OUTPUT_SIZE
    canvas.height = OUTPUT_SIZE
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const scaleToOutput = OUTPUT_SIZE / CROP_SIZE
    const drawWidth = imgSize.width * scale * scaleToOutput
    const drawHeight = imgSize.height * scale * scaleToOutput
    const drawX = offset.x * scaleToOutput
    const drawY = offset.y * scaleToOutput

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE)
    ctx.drawImage(imgRef.current, drawX, drawY, drawWidth, drawHeight)
    onSave(canvas.toDataURL('image/jpeg', 0.9))
  }

  const handleZoomChange = (value: number) => {
    if (!imgSize.width || !imgSize.height || !baseScale) {
      setZoom(value)
      return
    }

    const newZoom = value
    const oldScale = baseScale * zoom
    const newScale = baseScale * newZoom
    const center = CROP_SIZE / 2
    const imgX = (center - offset.x) / oldScale
    const imgY = (center - offset.y) / oldScale
    let nextX = center - imgX * newScale
    let nextY = center - imgY * newScale
    const { minX, minY, maxX, maxY } = getBounds(newScale)
    nextX = clamp(nextX, minX, maxX)
    nextY = clamp(nextY, minY, maxY)

    setOffset({ x: nextX, y: nextY })
    setZoom(newZoom)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-gray-900">{t('forms.photoCrop.title')}</h2>
        <p className="mt-1 text-sm text-gray-600">{t('forms.photoCrop.subtitle')}</p>

        <div className="mt-4 flex justify-center">
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="relative overflow-hidden rounded-md border border-gray-300 bg-gray-100"
            style={{ width: CROP_SIZE, height: CROP_SIZE, touchAction: 'none' }}
          >
            {imageSrc && (
              <img
                ref={imgRef}
                src={imageSrc}
                alt={t('forms.photoCrop.cropAlt')}
                onLoad={handleImageLoad}
                className="absolute left-0 top-0 select-none max-w-none max-h-none"
                style={{
                  width: imgSize.width * scale,
                  height: imgSize.height * scale,
                  transform: `translate(${offset.x}px, ${offset.y}px)`,
                }}
                draggable={false}
              />
            )}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div
                className="h-full w-full rounded-full border-2 border-white/80"
                style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.35)' }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-600">{t('forms.photoCrop.zoom')}</label>
          <input
            type="range"
            min="1"
            max="3"
            step="0.01"
            value={zoom}
            onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
            className="mt-1 w-full"
          />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {t('common.actions.cancel')}
          </button>
          <button
            onClick={handleSave}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {t('forms.photoCrop.savePhoto')}
          </button>
        </div>
      </div>
    </div>
  )
}
