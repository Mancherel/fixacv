import { useState } from 'react'
import type { ListItem } from '../types'
import { useI18n } from '../i18n/useI18n'
import { VisibilityToggle } from './VisibilityToggle'

interface SimpleListInputProps {
  label: string
  items: ListItem[]
  onChange: (items: ListItem[]) => void
  placeholder?: string
  emptyText?: string
}

export function SimpleListInput({
  label,
  items,
  onChange,
  placeholder,
  emptyText,
}: SimpleListInputProps) {
  const { t } = useI18n()
  const [input, setInput] = useState('')
  const resolvedEmptyText = emptyText ?? t('forms.lists.defaultEmpty')

  const handleAdd = () => {
    const value = input.trim()
    if (!value) return
    onChange([
      ...items,
      {
        id: crypto.randomUUID(),
        name: value,
        visible: true,
      },
    ])
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  const handleRemove = (id: string) => {
    onChange(items.filter((item) => item.id !== id))
  }

  const handleToggleVisible = (id: string) => {
    onChange(
      items.map((item) =>
        item.id === id ? { ...item, visible: !item.visible } : item
      )
    )
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="block w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            {t('common.actions.add')}
          </button>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-gray-700 ${
                item.visible ? '' : 'opacity-60'
              }`}
            >
              <span>{item.name}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-gray-600 hover:bg-slate-100"
                  title={t('common.actions.remove')}
                  aria-label={t('common.actions.remove')}
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.6}
                      d="M4 7h16M9 7V5h6v2m-7 3v8m4-8v8m4-8v8M6 7l1 14h10l1-14"
                    />
                  </svg>
                </button>
                <VisibilityToggle
                  isVisible={item.visible}
                  onToggle={() => handleToggleVisible(item.id)}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400">{resolvedEmptyText}</p>
      )}
    </div>
  )
}
