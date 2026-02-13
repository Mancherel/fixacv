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

  useEffect(() => {
    if (!isDragging) return

    const handlePointerMove = (event: PointerEvent) => {
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

    const handlePointerEnd = () => {
      dragStateRef.current = null
      setIsDragging(false)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerEnd)
    window.addEventListener('pointercancel', handlePointerEnd)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerEnd)
      window.removeEventListener('pointercancel', handlePointerEnd)
    }
  }, [isDragging])

  const handleSeparatorPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    const axis: DragState['axis'] = isDesktopLayout ? 'x' : 'y'

    dragStateRef.current = {
      axis,
      startCoord: axis === 'x' ? event.clientX : event.clientY,
      startValue: axis === 'x' ? desktopEditorWidthPct : mobilePreviewHeightPct,
    }
    setIsDragging(true)
    event.preventDefault()
  }

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
    <div className={`flex h-screen flex-col overflow-hidden bg-gray-50 print-reset ${isDragging ? 'select-none' : ''}`}>
      <SiteHeader />

      <div ref={containerRef} className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        {/* Preview Panel */}
        <div
          className="order-1 min-h-0 shrink-0 overflow-y-auto overflow-x-hidden bg-gray-100 pb-4 lg:order-3 lg:flex-1 lg:pb-16 print-full print-reset"
          style={previewStyle}
        >
          {preview}
        </div>

        {/* Drag Separator */}
        <div
          role="separator"
          aria-orientation={isDesktopLayout ? 'vertical' : 'horizontal'}
          tabIndex={0}
          aria-label={
            isDesktopLayout
              ? t('layout.resizeEditorWidth')
              : t('layout.resizeEditorHeight')
          }
          className={`order-2 z-10 shrink-0 bg-slate-100 print-hidden ${
            isDesktopLayout
              ? 'w-3 cursor-col-resize border-x border-slate-200 touch-none'
              : 'h-4 cursor-row-resize border-y border-slate-200 touch-none'
          }`}
          onPointerDown={handleSeparatorPointerDown}
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
          className="order-3 min-h-0 flex-1 overflow-y-auto bg-slate-50 print-hidden lg:order-1 lg:flex-none"
          style={editorStyle}
        >
          <div className="px-4 pb-6 pt-0 lg:px-6">{editor}</div>
        </div>
      </div>
    </div>
  )
}
