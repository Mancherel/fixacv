import { ReactNode, useEffect, useRef, useState } from 'react'
import { SiteHeader } from './SiteHeader'
import { useI18n } from '../i18n/useI18n'

interface LayoutProps {
  editor: ReactNode
  preview: ReactNode
}

interface DragState {
  axis: 'x' | 'y'
  startCoord: number
  startValue: number
}

const DESKTOP_LAYOUT_QUERY = '(min-width: 1024px)'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

function resolveBounds(minValue: number, maxValue: number, fallbackValue: number) {
  if (maxValue >= minValue) {
    return { min: minValue, max: maxValue }
  }

  const centered = clamp(fallbackValue, Math.min(minValue, maxValue), Math.max(minValue, maxValue))
  return { min: centered, max: centered }
}

export function Layout({ editor, preview }: LayoutProps) {
  const { t } = useI18n()
  const containerRef = useRef<HTMLDivElement>(null)
  const separatorRef = useRef<HTMLDivElement>(null)
  const dragStateRef = useRef<DragState | null>(null)

  const [isDesktopLayout, setIsDesktopLayout] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(DESKTOP_LAYOUT_QUERY).matches
  })
  const [isDragging, setIsDragging] = useState(false)
  const [desktopEditorWidthPct, setDesktopEditorWidthPct] = useState(35)
  const [mobilePreviewHeightPct, setMobilePreviewHeightPct] = useState(38)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mediaQuery = window.matchMedia(DESKTOP_LAYOUT_QUERY)
    const handleChange = (event: MediaQueryListEvent) => {
      setIsDesktopLayout(event.matches)
    }

    setIsDesktopLayout(mediaQuery.matches)

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }

    mediaQuery.addListener(handleChange)
    return () => mediaQuery.removeListener(handleChange)
  }, [])

  /* ── Separator drag via pointer capture ── */

  useEffect(() => {
    const sep = separatorRef.current
    if (!sep) return

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return

      const container = containerRef.current
      if (!container) return

      const axis: DragState['axis'] = isDesktopLayout ? 'x' : 'y'
      dragStateRef.current = {
        axis,
        startCoord: axis === 'x' ? event.clientX : event.clientY,
        startValue: axis === 'x' ? desktopEditorWidthPct : mobilePreviewHeightPct,
      }
      setIsDragging(true)
      sep.setPointerCapture(event.pointerId)
      event.preventDefault()
    }

    const onPointerMove = (event: PointerEvent) => {
      const dragState = dragStateRef.current
      const container = containerRef.current
      if (!dragState || !container) return

      const rect = container.getBoundingClientRect()
      if (dragState.axis === 'x' && rect.width > 0) {
        const deltaPercent = ((event.clientX - dragState.startCoord) / rect.width) * 100
        const minPercent = Math.max(24, (280 / rect.width) * 100)
        const maxPercent = Math.min(60, 100 - (360 / rect.width) * 100)
        const bounds = resolveBounds(minPercent, maxPercent, dragState.startValue)
        setDesktopEditorWidthPct(clamp(dragState.startValue + deltaPercent, bounds.min, bounds.max))
        return
      }

      if (dragState.axis === 'y' && rect.height > 0) {
        const deltaPercent = ((event.clientY - dragState.startCoord) / rect.height) * 100
        const minPercent = Math.max(22, (170 / rect.height) * 100)
        const maxPercent = Math.min(72, 100 - (230 / rect.height) * 100)
        const bounds = resolveBounds(minPercent, maxPercent, dragState.startValue)
        setMobilePreviewHeightPct(clamp(dragState.startValue + deltaPercent, bounds.min, bounds.max))
      }
    }

    const onPointerUp = (event: PointerEvent) => {
      if (!dragStateRef.current) return
      sep.releasePointerCapture(event.pointerId)
      dragStateRef.current = null
      setIsDragging(false)
    }

    sep.addEventListener('pointerdown', onPointerDown)
    sep.addEventListener('pointermove', onPointerMove)
    sep.addEventListener('pointerup', onPointerUp)
    sep.addEventListener('pointercancel', onPointerUp)

    return () => {
      sep.removeEventListener('pointerdown', onPointerDown)
      sep.removeEventListener('pointermove', onPointerMove)
      sep.removeEventListener('pointerup', onPointerUp)
      sep.removeEventListener('pointercancel', onPointerUp)
    }
  }, [isDesktopLayout, desktopEditorWidthPct, mobilePreviewHeightPct])

  const handleSeparatorKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 5 : 2
    if (isDesktopLayout) {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        setDesktopEditorWidthPct((value) => clamp(value - step, 24, 60))
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        setDesktopEditorWidthPct((value) => clamp(value + step, 24, 60))
      }
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setMobilePreviewHeightPct((value) => clamp(value - step, 22, 72))
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      setMobilePreviewHeightPct((value) => clamp(value + step, 22, 72))
    }
  }

  const editorStyle = isDesktopLayout ? { width: `${desktopEditorWidthPct}%` } : undefined
  const previewStyle = !isDesktopLayout ? { height: `${mobilePreviewHeightPct}%` } : undefined

  return (
    <div className={`flex h-screen flex-col overflow-hidden bg-gray-50 dark:bg-gray-900 print-reset ${isDragging ? 'select-none' : ''}`}>
      <SiteHeader />

      <div ref={containerRef} className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row print-reset">
        {/* Preview Panel – relative wrapper so the zoom overlay can sit outside the scroll container */}
        <div
          className="relative order-1 min-h-0 shrink-0 lg:order-3 lg:flex-1 print-reset"
          style={previewStyle}
        >
          <div className="absolute inset-0 overflow-auto bg-gray-100 dark:bg-neutral-700 pb-4 touch-manipulation lg:overflow-x-hidden lg:pb-16 print-reset">
            {preview}
          </div>
        </div>

        {/* Drag Separator */}
        <div
          ref={separatorRef}
          role="separator"
          aria-orientation={isDesktopLayout ? 'vertical' : 'horizontal'}
          tabIndex={0}
          aria-label={
            isDesktopLayout
              ? t('layout.resizeEditorWidth')
              : t('layout.resizeEditorHeight')
          }
          className={`order-2 z-10 shrink-0 bg-slate-100 dark:bg-gray-700 touch-none print-hidden ${
            isDesktopLayout
              ? 'w-3 cursor-col-resize border-x border-slate-200 dark:border-gray-600'
              : 'h-4 cursor-row-resize border-y border-slate-200 dark:border-gray-600'
          }`}
          onKeyDown={handleSeparatorKeyDown}
        >
          <div className="flex h-full w-full items-center justify-center">
            <div
              className={`rounded-full bg-slate-400/70 transition-colors ${
                isDesktopLayout ? 'h-14 w-1' : 'h-1 w-14'
              } ${isDragging ? 'bg-blue-500' : ''}`}
            />
          </div>
        </div>

        {/* Editor Panel */}
        <div
          className="order-3 min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 dark:bg-gray-900 touch-pan-y print-hidden lg:order-1 lg:flex-none"
          style={editorStyle}
        >
          <div className="px-4 pb-6 pt-0 lg:px-6">{editor}</div>
        </div>
      </div>
    </div>
  )
}
