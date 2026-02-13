import { useState } from 'react'
import { useCVData } from '../context/CVContext'
import { ExperienceForm } from './ExperienceForm'
import { formatDateRange } from '../utils/dateUtils'
import { useI18n } from '../i18n/useI18n'
import { VisibilityToggle } from './VisibilityToggle'
import type { AppLanguage, Experience } from '../types'

export function ExperienceList() {
  const { cvData, deleteExperience, updateExperience } = useCVData()
  const { language, t } = useI18n()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  const handleEdit = (id: string) => {
    setEditingId(id)
    setIsAdding(false)
  }

  const handleDelete = (id: string) => {
    if (confirm(t('forms.experience.confirmDelete'))) {
      deleteExperience(id)
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
      {cvData.experiences.map((exp) => (
        <div key={exp.id}>
          {editingId === exp.id ? (
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <ExperienceForm experience={exp} onSave={handleSave} onCancel={handleCancel} />
            </div>
          ) : (
            <ExperienceItem
              experience={exp}
              language={language}
              onEdit={() => handleEdit(exp.id)}
              onDelete={() => handleDelete(exp.id)}
              onToggleVisible={() =>
                updateExperience(exp.id, { visible: !exp.visible })
              }
            />
          )}
        </div>
      ))}

      {isAdding ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <ExperienceForm onSave={handleSave} onCancel={handleCancel} />
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full rounded-md border-2 border-dashed border-slate-300 px-4 py-3 text-sm font-medium text-slate-600 hover:border-slate-400 hover:text-slate-700"
        >
          {t('forms.experience.addButton')}
        </button>
      )}
    </div>
  )
}

function ExperienceItem({
  experience,
  language,
  onEdit,
  onDelete,
  onToggleVisible,
}: {
  experience: Experience
  language: AppLanguage
  onEdit: () => void
  onDelete: () => void
  onToggleVisible: () => void
}) {
  const { t } = useI18n()
  const dateRange = formatDateRange(experience.startDate, experience.endDate, language)
  const typeLabel =
    experience.type === 'assignment'
      ? t('forms.experience.typeAssignment')
      : experience.type === 'employment'
        ? t('forms.experience.typeEmployment')
        : experience.type === 'custom'
          ? experience.customType?.trim() || t('forms.experience.typeCustom')
          : ''

  return (
    <div
      className={`group rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300 hover:bg-slate-50 ${
        experience.visible ? '' : 'opacity-60'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{experience.company}</h3>
            {typeLabel && (
              <span className="rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-600">
                {typeLabel}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700">{experience.title}</p>
          {dateRange ? <p className="text-xs text-gray-500">{dateRange}</p> : null}
          {experience.description && (
            <p className="mt-2 text-sm text-gray-600">{experience.description}</p>
          )}
          {experience.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {experience.tags.map((tag) => (
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
          <VisibilityToggle isVisible={experience.visible} onToggle={onToggleVisible} />
        </div>
      </div>
    </div>
  )
}
