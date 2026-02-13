import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Preview } from './Preview'
import { useCVData } from '../context/CVContext'
import { useI18n } from '../i18n/useI18n'

const MOBILE_PREVIEW_QUERY = '(max-width: 1023px)'
const A4_WIDTH_MM = 210
const PREVIEW_SIDE_PADDING_PX = 24
const MIN_PREVIEW_SCALE = 0.36
const MIN_USER_ZOOM = 1
const MAX_USER_ZOOM = 2.5

function getPxPerMm() {
  const probe = document.createElement('div')
  probe.style.width = '1mm'
  probe.style.position = 'absolute'
  probe.style.left = '-9999px'
  document.body.appendChild(probe)
  const width = probe.getBoundingClientRect().width || 3.78
  probe.remove()
  return width
}

export function PreviewPanel() {
  const { cvData } = useCVData()
  const { t } = useI18n()
  const containerRef = useRef<HTMLDivElement>(null)
  const pinchStateRef = useRef<{ distance: number; zoom: number } | null>(null)
  const [previewScale, setPreviewScale] = useState(1)
  const [userZoom, setUserZoom] = useState(1)
  const [isMobilePreview, setIsMobilePreview] = useState(false)

  const clampUserZoom = (value: number) =>
    Math.min(MAX_USER_ZOOM, Math.max(MIN_USER_ZOOM, value))

  const getTouchDistance = (touches: React.TouchList) => {
    const touchA = touches[0]
    const touchB = touches[1]
    const dx = touchA.clientX - touchB.clientX
    const dy = touchA.clientY - touchB.clientY
    return Math.hypot(dx, dy)
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mediaQuery = window.matchMedia(MOBILE_PREVIEW_QUERY)

    const updatePreviewScale = () => {
      if (!containerRef.current) return
      if (!mediaQuery.matches) {
        setIsMobilePreview(false)
        setPreviewScale(1)
        setUserZoom(1)
        return
      }

      setIsMobilePreview(true)
      const availableWidth = Math.max(
        containerRef.current.clientWidth - PREVIEW_SIDE_PADDING_PX,
        0,
      )
      const a4WidthPx = A4_WIDTH_MM * getPxPerMm()
      const nextScale = Math.min(
        1,
        Math.max(MIN_PREVIEW_SCALE, availableWidth / a4WidthPx),
      )

      setPreviewScale((current) =>
        Math.abs(current - nextScale) > 0.01 ? nextScale : current,
      )
    }

    updatePreviewScale()

    let observer: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      observer = new ResizeObserver(updatePreviewScale)
      observer.observe(containerRef.current)
    }

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updatePreviewScale)
    } else {
      mediaQuery.addListener(updatePreviewScale)
    }
    window.addEventListener('orientationchange', updatePreviewScale)
    window.addEventListener('resize', updatePreviewScale)

    return () => {
      observer?.disconnect()
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', updatePreviewScale)
      } else {
        mediaQuery.removeListener(updatePreviewScale)
      }
      window.removeEventListener('orientationchange', updatePreviewScale)
      window.removeEventListener('resize', updatePreviewScale)
    }
  }, [])

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!isMobilePreview || event.touches.length !== 2) return
    pinchStateRef.current = {
      distance: getTouchDistance(event.touches),
      zoom: userZoom,
    }
  }

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!isMobilePreview || event.touches.length !== 2 || !pinchStateRef.current) return
    event.preventDefault()

    const nextDistance = getTouchDistance(event.touches)
    if (nextDistance <= 0) return

    const zoomRatio = nextDistance / pinchStateRef.current.distance
    setUserZoom(clampUserZoom(pinchStateRef.current.zoom * zoomRatio))
  }

  const handleTouchEnd = () => {
    pinchStateRef.current = null
  }

  const effectiveScale = previewScale * userZoom
  const panelStyle = useMemo(
    () => ({ '--preview-scale': String(effectiveScale) } as CSSProperties),
    [effectiveScale],
  )
  const previewRenderKey = cvData.localization.cvLanguage

  return (
    <div
      ref={containerRef}
      className="preview-scaled relative h-full print-reset"
      style={panelStyle}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {isMobilePreview ? (
        <div className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-full border border-slate-200 bg-white/95 px-1 py-1 text-xs shadow-sm">
          <button
            type="button"
            className="rounded-full border border-slate-200 px-2 py-0.5 text-slate-700 disabled:opacity-40"
            onClick={() => setUserZoom((current) => clampUserZoom(current - 0.15))}
            disabled={userZoom <= MIN_USER_ZOOM + 0.01}
            aria-label={t('previewPanel.zoomOut')}
          >
            -
          </button>
          <button
            type="button"
            className="rounded-full border border-slate-200 px-2 py-0.5 text-slate-700"
            onClick={() => setUserZoom(1)}
          >
            {Math.round(userZoom * 100)}%
          </button>
          <button
            type="button"
            className="rounded-full border border-slate-200 px-2 py-0.5 text-slate-700 disabled:opacity-40"
            onClick={() => setUserZoom((current) => clampUserZoom(current + 0.15))}
            disabled={userZoom >= MAX_USER_ZOOM - 0.01}
            aria-label={t('previewPanel.zoomIn')}
          >
            +
          </button>
        </div>
      ) : null}
      <div className="flex items-start justify-center p-3 pb-4 lg:p-8 lg:pb-16 print-reset">
        <Preview key={previewRenderKey} />
      </div>
    </div>
  )
}
