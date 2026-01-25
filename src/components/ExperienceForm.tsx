import { useState } from 'react'
import { useCVData } from '../context/CVContext'
import type { Experience, ExperienceType, ListItem } from '../types'

interface ExperienceFormProps {
  experience?: Experience
  onSave: () => void
  onCancel: () => void
}

export function ExperienceForm({ experience, onSave, onCancel }: ExperienceFormProps) {
  const { addExperience, updateExperience } = useCVData()
  const [formData, setFormData] = useState<Omit<Experience, 'id' | 'visible'>>({
    type: experience?.type || 'assignment',
    customType: experience?.customType || '',
    company: experience?.company || '',
    title: experience?.title || '',
    startDate: experience?.startDate || '',
    endDate: experience?.endDate || null,
    description: experience?.description || '',
    tags: experience?.tags || [],
  })
  const [tagInput, setTagInput] = useState('')
  const [isOngoing, setIsOngoing] = useState(!experience?.endDate && !!experience)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (experience) {
      updateExperience(experience.id, formData)
    } else {
      const newExperience: Experience = {
        id: crypto.randomUUID(),
        ...formData,
        visible: true,
      }
      addExperience(newExperience)
    }
    onSave()
  }

  const handleAddTag = () => {
    const value = tagInput.trim()
    if (value) {
      const nextTag: ListItem = { id: crypto.randomUUID(), name: value, visible: true }
      setFormData({ ...formData, tags: [...formData.tags, nextTag] })
      setTagInput('')
    }
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
        <label className="block text-sm font-medium text-gray-700">Type</label>
        <div className="mt-2 flex flex-wrap gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="assignment"
              checked={formData.type === 'assignment'}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as ExperienceType })}
              className="mr-2"
            />
            Assignment
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="employment"
              checked={formData.type === 'employment'}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as ExperienceType })}
              className="mr-2"
            />
            Employment
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="custom"
              checked={formData.type === 'custom'}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as ExperienceType })}
              className="mr-2"
            />
            Custom
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="none"
              checked={formData.type === 'none'}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as ExperienceType })}
              className="mr-2"
            />
            None
          </label>
        </div>
        {formData.type === 'custom' && (
          <input
            type="text"
            value={formData.customType || ''}
            onChange={(e) => setFormData({ ...formData, customType: e.target.value })}
            className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Custom type label"
          />
        )}
      </div>

      <div>
        <label htmlFor="company" className="block text-sm font-medium text-gray-700">
          Company
        </label>
        <input
          type="text"
          id="company"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title/Role
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <input
            type="month"
            id="startDate"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <input
            type="month"
            id="endDate"
            value={formData.endDate || ''}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value || null })}
            disabled={isOngoing}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <label className="mt-1 flex items-center text-sm">
            <input
              type="checkbox"
              checked={isOngoing}
              onChange={(e) => {
                setIsOngoing(e.target.checked)
                if (e.target.checked) {
                  setFormData({ ...formData, endDate: null })
                }
              }}
              className="mr-2"
            />
            Ongoing
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
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
          Tags
        </label>
        <div className="mt-1 flex gap-2">
          <input
            type="text"
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            placeholder="e.g., React, TypeScript"
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            Add
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
                    title="Remove"
                    aria-label="Remove"
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
                  <button
                    type="button"
                    onClick={() => handleToggleTag(tag.id)}
                    className={`relative inline-flex h-4 w-7 items-center rounded-full border transition-colors ${
                      tag.visible
                        ? 'border-emerald-300 bg-emerald-200 hover:bg-emerald-300'
                        : 'border-gray-300 bg-gray-200 hover:bg-gray-300'
                    }`}
                    title={tag.visible ? 'Hide from CV' : 'Show in CV'}
                    aria-label={tag.visible ? 'Visible' : 'Hidden'}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${
                        tag.visible ? 'translate-x-3.5' : 'translate-x-1'
                      }`}
                    />
                  </button>
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
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {experience ? 'Update' : 'Add'}
        </button>
      </div>
    </form>
  )
}
