import { useState } from 'react'
import { useCVData } from '../context/CVContext'
import { EducationForm } from './EducationForm'
import type { Education } from '../types'

export function EducationList() {
  const { cvData, deleteEducation, updateEducation } = useCVData()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  const handleEdit = (id: string) => {
    setEditingId(id)
    setIsAdding(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this education?')) {
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
          + Add Education
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
          <p className="text-xs text-gray-500">
            {education.startYear} - {education.endYear}
          </p>
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
              title="Edit"
              aria-label="Edit"
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
              title="Delete"
              aria-label="Delete"
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
          <button
            type="button"
            onClick={onToggleVisible}
            className={`relative inline-flex h-4 w-7 items-center rounded-full border transition-colors ${
              education.visible
                ? 'border-emerald-300 bg-emerald-200 hover:bg-emerald-300'
                : 'border-gray-300 bg-gray-200 hover:bg-gray-300'
            }`}
            title={education.visible ? 'Hide from CV' : 'Show in CV'}
            aria-label={education.visible ? 'Visible' : 'Hidden'}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${
                education.visible ? 'translate-x-3.5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
