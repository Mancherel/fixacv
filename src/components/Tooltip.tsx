import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

interface TooltipProps {
  text: string
  children: ReactNode
  widthClassName?: string
}

export function Tooltip({ text, children, widthClassName = 'w-64' }: TooltipProps) {
  const [pinned, setPinned] = useState(false)
  const [hovered, setHovered] = useState(false)
  const ref = useRef<HTMLSpanElement | null>(null)
  const open = hovered || pinned

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) {
        setPinned(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === 'Escape') {
      setPinned(false)
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setPinned((value) => !value)
    }
  }

  return (
    <span
      ref={ref}
      className="relative inline-flex items-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span
        role="button"
        tabIndex={0}
        onClick={() => setPinned((value) => !value)}
        onKeyDown={handleKeyDown}
        aria-expanded={open}
        className="cursor-help underline decoration-dotted underline-offset-4 decoration-gray-400 text-gray-600 align-baseline"
      >
        {children}
      </span>
      {open && (
        <span
          className={`absolute left-1/2 top-full z-50 mt-2 ${widthClassName} -translate-x-1/2 rounded-md border border-gray-200 bg-white px-3 py-2 text-[11px] leading-snug text-gray-700 shadow-lg tooltip-pop`}
        >
          {text}
        </span>
      )}
    </span>
  )
}
