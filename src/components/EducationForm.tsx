import { useState } from 'react'
import { useCVData } from '../context/CVContext'
import { useI18n } from '../i18n/useI18n'
import { VisibilityToggle } from './VisibilityToggle'
import type { Education, ListItem } from '../types'

interface EducationFormProps {
  education?: Education
  onSave: () => void
  onCancel: () => void
}

export function EducationForm({ education, onSave, onCancel }: EducationFormProps) {
  const { addEducation, updateEducation } = useCVData()
  const { t } = useI18n()
  const [formData, setFormData] = useState<Omit<Education, 'id' | 'visible'>>({
    institution: education?.institution || '',
    degree: education?.degree || '',
    startYear: education?.startYear ?? null,
    endYear: education?.endYear ?? null,
    description: education?.description || '',
    tags: education?.tags || [],
  })
  const [tagInput, setTagInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (education) {
      updateEducation(education.id, formData)
    } else {
      const newEducation: Education = {
        id: crypto.randomUUID(),
        ...formData,
        visible: true,
      }
      addEducation(newEducation)
    }
    onSave()
  }

  const handleAddTag = () => {
    const value = tagInput.trim()
    if (!value) return
    const nextTag: ListItem = { id: crypto.randomUUID(), name: value, visible: true }
    setFormData({ ...formData, tags: [...formData.tags, nextTag] })
    setTagInput('')
  }

  const handleRemoveTag = (id: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag.id !== id),
    })
  }

  const handleToggleTag = (id: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.map((tag) =>
        tag.id === id ? { ...tag, visible: !tag.visible } : tag
      ),
    })
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="institution" className="block text-sm font-medium text-gray-700">
          {t('forms.education.institution')}
        </label>
        <input
          type="text"
          id="institution"
          value={formData.institution}
          onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder={t('forms.education.institutionPlaceholder')}
        />
      </div>

      <div>
        <label htmlFor="degree" className="block text-sm font-medium text-gray-700">
          {t('forms.education.degreeProgram')}
        </label>
        <input
          type="text"
          id="degree"
          value={formData.degree}
          onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder={t('forms.education.degreePlaceholder')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="startYear" className="block text-sm font-medium text-gray-700">
            {t('forms.education.startYear')}
          </label>
          <input
            type="number"
            id="startYear"
            min="1950"
            max="2100"
            value={formData.startYear ?? ''}
            onChange={(e) => {
              const value = e.target.value
              setFormData({
                ...formData,
                startYear: value ? parseInt(value, 10) : null,
              })
            }}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="endYear" className="block text-sm font-medium text-gray-700">
            {t('forms.education.endYear')}
          </label>
          <input
            type="number"
            id="endYear"
            min="1950"
            max="2100"
            value={formData.endYear ?? ''}
            onChange={(e) => {
              const value = e.target.value
              setFormData({
                ...formData,
                endYear: value ? parseInt(value, 10) : null,
              })
            }}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          {t('forms.education.description')}
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
          {t('forms.education.tags')}
        </label>
        <div className="mt-1 flex gap-2">
          <input
            type="text"
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            placeholder={t('forms.education.tagsPlaceholder')}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            {t('common.actions.add')}
          </button>
        </div>
        {formData.tags.length > 0 && (
          <div className="mt-2 space-y-2">
            {formData.tags.map((tag) => (
              <div
                key={tag.id}
                className={`flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 ${
                  tag.visible ? '' : 'opacity-60'
                }`}
              >
                <span className="text-sm text-gray-700">{tag.name}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag.id)}
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
                    isVisible={tag.visible}
                    onToggle={() => handleToggleTag(tag.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {t('common.actions.cancel')}
        </button>
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {education ? t('common.actions.update') : t('common.actions.add')}
        </button>
      </div>
    </form>
  )
}
