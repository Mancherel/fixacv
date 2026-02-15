import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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

// Detect Safari (including iOS Safari) where CSS zoom scales text incorrectly.
// On Safari, zoom shrinks the container but enlarges text to compensate,
// producing the wrong result. We use transform: scale() instead.
const isSafari =
  typeof navigator !== 'undefined' &&
  /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

// Firefox doesn't support zoom at all. Safari's zoom is buggy.
// Only Chrome/Edge/Opera get zoom; everyone else gets transform.
const useZoom =
  typeof document !== 'undefined' && CSS.supports('zoom', '0.5') && !isSafari

export function PreviewPanel() {
  const { cvData } = useCVData()
  const { t } = useI18n()
  const containerRef = useRef<HTMLDivElement>(null)
  const [overlayTarget, setOverlayTarget] = useState<HTMLElement | null>(null)
  const [previewScale, setPreviewScale] = useState(1)
  const [userZoom, setUserZoom] = useState(1)
  const [isMobilePreview, setIsMobilePreview] = useState(false)

  const minUserZoom = isMobilePreview ? MOBILE_MIN_USER_ZOOM : DESKTOP_MIN_USER_ZOOM
  const maxUserZoom = isMobilePreview ? MOBILE_MAX_USER_ZOOM : DESKTOP_MAX_USER_ZOOM

  const clampUserZoom = (value: number) =>
    Math.min(maxUserZoom, Math.max(minUserZoom, value))

  // Find the relative wrapper in Layout (grandparent of our container)
  // so we can portal the zoom controls outside the scroll container.
  useEffect(() => {
    const el = containerRef.current?.parentElement?.parentElement ?? null
    setOverlayTarget(el)
  }, [])

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
  // Keep refs so touch handlers always read the latest values without
  // needing them in the dependency array (which would tear down
  // listeners mid-gesture and reset the pinch state).
  const userZoomRef = useRef(userZoom)
  userZoomRef.current = userZoom
  const previewScaleRef = useRef(previewScale)
  previewScaleRef.current = previewScale

  useEffect(() => {
    const el = containerRef.current
    if (!el || !isMobilePreview) return

    // The scroll container is the Layout preview div (parent of PreviewPanel)
    const scrollParent = el.parentElement
    if (!scrollParent) return

    let pinch: {
      startDist: number
      startZoom: number
      // Content-coordinate under the pinch midpoint at gesture start
      contentX: number
      contentY: number
      // Pinch midpoint relative to the scroll container's viewport
      viewX: number
      viewY: number
    } | null = null

    const dist = (touches: TouchList) => {
      const dx = touches[0].clientX - touches[1].clientX
      const dy = touches[0].clientY - touches[1].clientY
      return Math.hypot(dx, dy)
    }

    const mid = (touches: TouchList) => ({
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    })

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const m = mid(e.touches)
        const rect = scrollParent.getBoundingClientRect()
        const viewX = m.x - rect.left
        const viewY = m.y - rect.top
        const currentZoom = userZoomRef.current
        const currentScale = previewScaleRef.current * currentZoom
        // Convert viewport point to content-coordinate
        const contentX = (scrollParent.scrollLeft + viewX) / currentScale
        const contentY = (scrollParent.scrollTop + viewY) / currentScale
        pinch = {
          startDist: dist(e.touches),
          startZoom: currentZoom,
          contentX,
          contentY,
          viewX,
          viewY,
        }
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2 || !pinch) return
      e.preventDefault()
      const d = dist(e.touches)
      if (d > 0) {
        const newZoom = clampUserZoom(pinch.startZoom * (d / pinch.startDist))
        setUserZoom(newZoom)

        // Adjust scroll so the content point under the pinch stays put
        const newScale = previewScaleRef.current * newZoom
        const m = mid(e.touches)
        const rect = scrollParent.getBoundingClientRect()
        const viewX = m.x - rect.left
        const viewY = m.y - rect.top
        scrollParent.scrollLeft = pinch.contentX * newScale - viewX
        scrollParent.scrollTop = pinch.contentY * newScale - viewY
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
  }, [isMobilePreview])

  const effectiveScale = previewScale * userZoom
  const previewRenderKey = cvData.localization.cvLanguage
  const pagesRef = useRef<HTMLDivElement>(null)
  const [pagesNaturalSize, setPagesNaturalSize] = useState<{
    w: number
    h: number
  } | null>(null)

  // Apply scaling as inline styles on .preview-pages.
  // Chrome/Edge: use zoom (works correctly, affects layout).
  // Safari/Firefox: use transform: scale() (zoom is buggy on Safari,
  // unsupported on Firefox). Transform doesn't affect layout size,
  // so we compensate with a wrapper div.
  useEffect(() => {
    const el = containerRef.current?.querySelector<HTMLElement>('.preview-pages')
    if (!el) return
    if (useZoom) {
      el.style.zoom = String(effectiveScale)
      el.style.transform = ''
    } else {
      el.style.zoom = ''
      el.style.transform = `scale(${effectiveScale})`
      el.style.transformOrigin = 'top left'
    }
  }, [effectiveScale])

  // Measure the natural (unscaled) size of .preview-pages so the wrapper
  // can compensate for transform: scale() not affecting layout dimensions.
  useEffect(() => {
    if (useZoom) return // zoom handles layout natively
    const el = pagesRef.current
    if (!el) return
    const pages = el.querySelector<HTMLElement>('.preview-pages')
    if (!pages) return

    const measure = () => {
      const w = pages.scrollWidth
      const h = pages.scrollHeight
      setPagesNaturalSize((prev) =>
        prev && prev.w === w && prev.h === h ? prev : { w, h },
      )
    }

    measure()

    let observer: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(measure)
      observer.observe(pages)
    }

    return () => observer?.disconnect()
  }, [cvData, previewRenderKey])

  // Wrapper style to compensate for transform: scale() not affecting layout.
  // Only needed when not using zoom.
  const wrapperStyle =
    !useZoom && pagesNaturalSize
      ? {
          width: pagesNaturalSize.w * effectiveScale,
          height: pagesNaturalSize.h * effectiveScale,
        }
      : undefined

  const zoomControls = (
    <div className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-full border border-slate-200 bg-white/95 px-1 py-1 text-xs shadow-sm print-hidden dark:border-gray-600 dark:bg-gray-700/95">
      <button
        type="button"
        className="rounded-full border border-slate-200 px-2 py-0.5 text-slate-700 disabled:opacity-40 dark:border-gray-500 dark:text-gray-300"
        onClick={() => setUserZoom((current) => clampUserZoom(current - 0.15))}
        disabled={userZoom <= minUserZoom + 0.01}
        aria-label={t('previewPanel.zoomOut')}
      >
        -
      </button>
      <button
        type="button"
        className="rounded-full border border-slate-200 px-2 py-0.5 text-slate-700 dark:border-gray-500 dark:text-gray-300"
        onClick={() => setUserZoom(1)}
      >
        {Math.round(userZoom * 100)}%
      </button>
      <button
        type="button"
        className="rounded-full border border-slate-200 px-2 py-0.5 text-slate-700 disabled:opacity-40 dark:border-gray-500 dark:text-gray-300"
        onClick={() => setUserZoom((current) => clampUserZoom(current + 0.15))}
        disabled={userZoom >= maxUserZoom - 0.01}
        aria-label={t('previewPanel.zoomIn')}
      >
        +
      </button>
    </div>
  )

  return (
    <div
      ref={containerRef}
      className="preview-scaled h-full print-reset"
    >
      {/* Render zoom controls into the relative wrapper in Layout,
          outside the scroll container so they stay fixed in place. */}
      {overlayTarget && createPortal(zoomControls, overlayTarget)}
      <div className="p-3 pb-4 lg:p-8 lg:pb-16 print-reset">
        <div ref={pagesRef} style={{ ...wrapperStyle, marginInline: 'auto' }}>
          <Preview key={previewRenderKey} />
        </div>
      </div>
    </div>
  )
}
