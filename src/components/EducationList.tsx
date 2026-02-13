import { useState } from 'react'
import { useCVData } from '../context/CVContext'
import { useI18n } from '../i18n/useI18n'
import { EducationForm } from './EducationForm'
import { VisibilityToggle } from './VisibilityToggle'
import type { Education } from '../types'

export function EducationList() {
  const { cvData, deleteEducation, updateEducation } = useCVData()
  const { t } = useI18n()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  const handleEdit = (id: string) => {
    setEditingId(id)
    setIsAdding(false)
  }

  const handleDelete = (id: string) => {
    if (confirm(t('forms.education.confirmDelete'))) {
      deleteEducation(id)
    }
  }

  const handleSave = () => {
    setEditingId(null)
    setIsAdding(false)
  }

  const handleCancel = () => {
    setEditingId(null)
    setIsAdding(false)
  }

  return (
    <div className="space-y-4">
      {cvData.education.map((edu) => (
        <div key={edu.id}>
          {editingId === edu.id ? (
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <EducationForm education={edu} onSave={handleSave} onCancel={handleCancel} />
            </div>
          ) : (
            <EducationItem
              education={edu}
              onEdit={() => handleEdit(edu.id)}
              onDelete={() => handleDelete(edu.id)}
              onToggleVisible={() =>
                updateEducation(edu.id, { visible: !edu.visible })
              }
            />
          )}
        </div>
      ))}

      {isAdding ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <EducationForm onSave={handleSave} onCancel={handleCancel} />
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full rounded-md border-2 border-dashed border-slate-300 px-4 py-3 text-sm font-medium text-slate-600 hover:border-slate-400 hover:text-slate-700"
        >
          {t('forms.education.addButton')}
        </button>
      )}
    </div>
  )
}

function EducationItem({
  education,
  onEdit,
  onDelete,
  onToggleVisible,
}: {
  education: Education
  onEdit: () => void
  onDelete: () => void
  onToggleVisible: () => void
}) {
  const { t } = useI18n()
  const yearRange = (() => {
    const start = Number.isFinite(education.startYear ?? NaN) ? education.startYear : null
    const end = Number.isFinite(education.endYear ?? NaN) ? education.endYear : null
    if (start && end) return `${start} - ${end}`
    if (start) return `${start}`
    if (end) return `${end}`
    return ''
  })()

  return (
    <div
      className={`group rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300 hover:bg-slate-50 ${
        education.visible ? '' : 'opacity-60'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{education.institution}</h3>
          <p className="text-sm text-gray-700">{education.degree}</p>
          {yearRange ? <p className="text-xs text-gray-500">{yearRange}</p> : null}
          {education.description && (
            <p className="mt-2 text-sm text-gray-600">{education.description}</p>
          )}
          {education.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {education.tags.map((tag) => (
                <span
                  key={tag.id}
                  className={`rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 ${
                    tag.visible ? '' : 'opacity-60'
                  }`}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="ml-4 flex items-center gap-2">
          <div className="flex gap-1.5 opacity-50 transition-opacity group-hover:opacity-100">
            <button
              onClick={onEdit}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-gray-600 hover:bg-slate-100"
              title={t('common.actions.edit')}
              aria-label={t('common.actions.edit')}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.6}
                  d="M16.5 4.5l3 3L8 19H5v-3L16.5 4.5z"
                />
              </svg>
            </button>
            <button
              onClick={onDelete}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-gray-600 hover:bg-slate-100"
              title={t('common.actions.delete')}
              aria-label={t('common.actions.delete')}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.6}
                  d="M4 7h16M9 7V5h6v2m-7 3v8m4-8v8m4-8v8M6 7l1 14h10l1-14"
                />
              </svg>
            </button>
          </div>
          <VisibilityToggle isVisible={education.visible} onToggle={onToggleVisible} />
        </div>
      </div>
    </div>
  )
}
