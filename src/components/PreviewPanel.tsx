import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Preview } from './Preview'
import { useCVData } from '../context/CVContext'
import { useI18n } from '../i18n/useI18n'

const MOBILE_PREVIEW_QUERY = '(max-width: 1023px)'
const A4_WIDTH_MM = 210
const PREVIEW_SIDE_PADDING_PX = 24
const MIN_PREVIEW_SCALE = 0.36
const MOBILE_MIN_USER_ZOOM = 1
const MOBILE_MAX_USER_ZOOM = 2.5
const DESKTOP_MIN_USER_ZOOM = 0.65
const DESKTOP_MAX_USER_ZOOM = 1.6

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
  const [previewScale, setPreviewScale] = useState(1)
  const [userZoom, setUserZoom] = useState(1)
  const [isMobilePreview, setIsMobilePreview] = useState(false)

  const minUserZoom = isMobilePreview ? MOBILE_MIN_USER_ZOOM : DESKTOP_MIN_USER_ZOOM
  const maxUserZoom = isMobilePreview ? MOBILE_MAX_USER_ZOOM : DESKTOP_MAX_USER_ZOOM

  const clampUserZoom = (value: number) =>
    Math.min(maxUserZoom, Math.max(minUserZoom, value))

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mediaQuery = window.matchMedia(MOBILE_PREVIEW_QUERY)

    const updatePreviewScale = () => {
      if (!containerRef.current) return
      if (!mediaQuery.matches) {
        setIsMobilePreview(false)
        setPreviewScale(1)
        setUserZoom((current) =>
          Math.min(DESKTOP_MAX_USER_ZOOM, Math.max(DESKTOP_MIN_USER_ZOOM, current)),
        )
        return
      }

      setIsMobilePreview(true)
      setUserZoom((current) =>
        Math.min(MOBILE_MAX_USER_ZOOM, Math.max(MOBILE_MIN_USER_ZOOM, current)),
      )
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

  /* ── Pinch-to-zoom via native listeners (keeps 1-finger scroll passive) ── */
  useEffect(() => {
    const el = containerRef.current
    if (!el || !isMobilePreview) return

    let pinch: { startDist: number; startZoom: number } | null = null

    const dist = (touches: TouchList) => {
      const dx = touches[0].clientX - touches[1].clientX
      const dy = touches[0].clientY - touches[1].clientY
      return Math.hypot(dx, dy)
    }

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        pinch = { startDist: dist(e.touches), startZoom: userZoom }
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2 || !pinch) return
      e.preventDefault()
      const d = dist(e.touches)
      if (d > 0) {
        setUserZoom(clampUserZoom(pinch.startZoom * (d / pinch.startDist)))
      }
    }

    const onTouchEnd = () => {
      pinch = null
    }

    el.addEventListener('touchstart', onTouchStart)
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd)
    el.addEventListener('touchcancel', onTouchEnd)

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
      el.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [isMobilePreview, userZoom])

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
    >
      <div className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-full border border-slate-200 bg-white/95 px-1 py-1 text-xs shadow-sm">
        <button
          type="button"
          className="rounded-full border border-slate-200 px-2 py-0.5 text-slate-700 disabled:opacity-40"
          onClick={() => setUserZoom((current) => clampUserZoom(current - 0.15))}
          disabled={userZoom <= minUserZoom + 0.01}
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
          disabled={userZoom >= maxUserZoom - 0.01}
          aria-label={t('previewPanel.zoomIn')}
        >
          +
        </button>
      </div>
      <div className="flex items-start justify-center p-3 pb-4 lg:p-8 lg:pb-16 print-reset">
        <Preview key={previewRenderKey} />
      </div>
    </div>
  )
}
