import { ReactNode, useEffect, useState } from 'react'

interface SectionProps {
  title: string
  children: ReactNode
  defaultOpen?: boolean
  onToggleVisibility?: () => void
  isVisible?: boolean
  collapseSignal?: number
}

export function Section({
  title,
  children,
  defaultOpen = true,
  onToggleVisibility,
  isVisible = true,
  collapseSignal,
}: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  useEffect(() => {
    if (collapseSignal !== undefined) {
      setIsOpen(false)
    }
  }, [collapseSignal])

  const handleToggle = () => setIsOpen(!isOpen)
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
          <button
            onClick={(event) => {
              event.stopPropagation()
              onToggleVisibility()
            }}
            className={`relative inline-flex h-5 w-10 items-center rounded-full border transition-colors ${
              isVisible
                ? 'border-emerald-300 bg-emerald-200 hover:bg-emerald-300'
                : 'border-gray-300 bg-gray-200 hover:bg-gray-300'
            }`}
            title={isVisible ? 'Hide from CV' : 'Show in CV'}
            aria-label={isVisible ? 'Visible' : 'Hidden'}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                isVisible ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        )}
      </div>

      <div
        className={`mx-6 overflow-hidden transition-all duration-200 ease-out ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
        aria-hidden={!isOpen}
      >
        <div className="my-4">{children}</div>
      </div>
    </div>
  )
}
