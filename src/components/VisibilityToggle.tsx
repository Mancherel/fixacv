import { useI18n } from '../i18n/useI18n'

interface VisibilityToggleProps {
  isVisible: boolean
  onToggle: () => void
  size?: 'sm' | 'md'
  stopPropagation?: boolean
  className?: string
}

export function VisibilityToggle({
  isVisible,
  onToggle,
  size = 'sm',
  stopPropagation = false,
  className = '',
}: VisibilityToggleProps) {
  const { visibilityAria, visibilityTitle } = useI18n()
  const sizeClass = size === 'md' ? 'h-8 w-8' : 'h-7 w-7'
  const iconClass = size === 'md' ? 'h-4.5 w-4.5' : 'h-4 w-4'

  return (
    <button
      type="button"
      onClick={(event) => {
        if (stopPropagation) {
          event.stopPropagation()
        }
        onToggle()
      }}
      className={`${sizeClass} inline-flex items-center justify-center rounded-md border transition-colors ${
        isVisible
          ? 'border-slate-300 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-800'
          : 'border-slate-200 bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-500'
      } ${className}`.trim()}
      title={visibilityTitle(isVisible)}
      aria-label={visibilityAria(isVisible)}
    >
      {isVisible ? (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M2.2 12s3.6-6.2 9.8-6.2 9.8 6.2 9.8 6.2-3.6 6.2-9.8 6.2S2.2 12 2.2 12z"
          />
          <circle cx="12" cy="12" r="2.7" strokeWidth={1.8} />
        </svg>
      ) : (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M2.2 12s3.6-6.2 9.8-6.2 9.8 6.2 9.8 6.2-3.6 6.2-9.8 6.2S2.2 12 2.2 12z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4l16 16"
          />
        </svg>
      )}
    </button>
  )
}
