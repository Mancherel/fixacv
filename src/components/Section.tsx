import { ReactNode, useEffect, useState } from 'react'
import { VisibilityToggle } from './VisibilityToggle'

interface SectionProps {
  title: ReactNode
  children: ReactNode
  defaultOpen?: boolean
  onToggleVisibility?: () => void
  isVisible?: boolean
  collapseSignal?: number
  isOpen?: boolean
  onToggleOpen?: () => void
}

export function Section({
  title,
  children,
  defaultOpen = true,
  onToggleVisibility,
  isVisible = true,
  collapseSignal,
  isOpen: controlledIsOpen,
  onToggleOpen,
}: SectionProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen)
  const isOpen = controlledIsOpen ?? internalIsOpen

  useEffect(() => {
    if (collapseSignal !== undefined && controlledIsOpen === undefined) {
      setInternalIsOpen(false)
    }
  }, [collapseSignal, controlledIsOpen])

  const handleToggle = () => {
    if (controlledIsOpen === undefined) {
      setInternalIsOpen(!isOpen)
    }
    onToggleOpen?.()
  }
  const handleHeaderKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleToggle()
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div
        className="mb-0 flex cursor-pointer items-center justify-between rounded-md px-1 py-1 transition-colors"
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        onClick={handleToggle}
        onKeyDown={handleHeaderKeyDown}
      >
        <div className="flex items-center gap-2 text-base font-semibold text-gray-900 hover:text-gray-700">
          <svg
            className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          {title}
        </div>

        {onToggleVisibility && (
          <VisibilityToggle
            isVisible={isVisible}
            onToggle={onToggleVisibility}
            size="md"
            stopPropagation
          />
        )}
      </div>

      <div
        className={`mx-1 grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ease-out sm:mx-4 lg:mx-6 ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
        aria-hidden={!isOpen}
      >
        <div className="min-h-0">
          <div className="my-4">{children}</div>
        </div>
      </div>
    </div>
  )
}
