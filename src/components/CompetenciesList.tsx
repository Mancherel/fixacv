import { useMemo, useState } from 'react'
import { useCVData } from '../context/CVContext'
import { getCompetencyLevelText } from '../i18n'
import { useI18n } from '../i18n/useI18n'
import { VisibilityToggle } from './VisibilityToggle'
import type { ProficiencyLevel, Competency } from '../types'

export function CompetenciesList() {
  const { cvData, addCompetency, updateCompetency, deleteCompetency, reorderCompetency } =
    useCVData()
  const { language, t } = useI18n()
  const [skillName, setSkillName] = useState('')
  const [skillLevel, setSkillLevel] = useState<ProficiencyLevel>('proficient')
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [draggedOverId, setDraggedOverId] = useState<string | null>(null)

  const levelLabels = useMemo(
    () =>
      ({
        expert: getCompetencyLevelText(language, 'expert'),
        advanced: getCompetencyLevelText(language, 'advanced'),
        proficient: getCompetencyLevelText(language, 'proficient'),
      }) as Record<ProficiencyLevel, string>,
    [language],
  )

  const handleAdd = () => {
    if (skillName.trim()) {
      addCompetency({
        id: crypto.randomUUID(),
        name: skillName.trim(),
        level: skillLevel,
        visible: true,
      })
      setSkillName('')
      setSkillLevel('proficient')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t('forms.competencies.confirmDelete'))) {
      deleteCompetency(id)
    }
  }

  const handleDragStart = (id: string) => {
    setDraggedItem(id)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDraggedOverId(null)
  }

  const handleDrop = (targetLevel: ProficiencyLevel) => {
    if (draggedItem) {
      const dragged = allCompetencies.find((item) => item.id === draggedItem)
      if (dragged && dragged.currentLevel !== targetLevel) {
        updateCompetency(draggedItem, { level: targetLevel })
      }
      setDraggedItem(null)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDropOnItem = (targetId: string, targetLevel: ProficiencyLevel) => {
    if (!draggedItem) return
    const dragged = allCompetencies.find((item) => item.id === draggedItem)
    if (!dragged) return
    if (dragged.currentLevel === targetLevel) {
      reorderCompetency(targetLevel, draggedItem, targetId)
    } else {
      updateCompetency(draggedItem, { level: targetLevel })
    }
    setDraggedItem(null)
    setDraggedOverId(null)
  }

  const allCompetencies: Array<Competency & { currentLevel: ProficiencyLevel }> = [
    ...cvData.competencies.expert.map((c) => ({ ...c, currentLevel: 'expert' as ProficiencyLevel })),
    ...cvData.competencies.advanced.map((c) => ({ ...c, currentLevel: 'advanced' as ProficiencyLevel })),
    ...cvData.competencies.proficient.map((c) => ({ ...c, currentLevel: 'proficient' as ProficiencyLevel })),
  ]

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h4 className="mb-3 text-sm font-semibold text-gray-900">{t('forms.competencies.addSkillTitle')}</h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={skillName}
            onChange={(e) => setSkillName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('forms.competencies.skillNamePlaceholder')}
            className="block h-9 w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div className="relative">
            <select
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value as ProficiencyLevel)}
              className="h-9 appearance-none rounded-md border border-slate-200 px-3 py-2 pr-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="proficient">{levelLabels.proficient}</option>
              <option value="advanced">{levelLabels.advanced}</option>
              <option value="expert">{levelLabels.expert}</option>
            </select>
            <svg
              className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 9l6 6 6-6" />
            </svg>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className="h-9 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {t('common.actions.add')}
          </button>
        </div>
      </div>

      {(['expert', 'advanced', 'proficient'] as ProficiencyLevel[]).map((level) => {
        const skillsInLevel = allCompetencies.filter((c) => c.currentLevel === level)

        return (
          <div
            key={level}
            onDrop={() => handleDrop(level)}
            onDragOver={handleDragOver}
            className={`rounded-lg border-2 border-dashed p-3 transition-colors ${
              draggedItem ? 'border-blue-400 bg-blue-50' : 'border-transparent'
            }`}
          >
            <h4 className="mb-2 text-sm font-semibold text-gray-900">{levelLabels[level]}</h4>
            {skillsInLevel.length > 0 ? (
              <div className="space-y-2">
                {skillsInLevel.map((comp) => (
                  <CompetencyItem
                    key={comp.id}
                    competency={comp}
                    onDragStart={() => handleDragStart(comp.id)}
                    onDragEnd={handleDragEnd}
                    onDragOverItem={() => setDraggedOverId(comp.id)}
                    onDragLeaveItem={() =>
                      setDraggedOverId((current) => (current === comp.id ? null : current))
                    }
                    onDropOnItem={() => handleDropOnItem(comp.id, comp.currentLevel)}
                    onUpdate={(name) => updateCompetency(comp.id, { name })}
                    onToggleVisible={() =>
                      updateCompetency(comp.id, { visible: !comp.visible })
                    }
                    onDelete={() => handleDelete(comp.id)}
                    isDragging={draggedItem === comp.id}
                    isDropTarget={draggedOverId === comp.id && draggedItem !== comp.id}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                {draggedItem
                  ? t('forms.competencies.dropHere')
                  : t('forms.competencies.noSkillsForLevel', { level: levelLabels[level].toLowerCase() })}
              </p>
            )}
          </div>
        )
      })}

      {allCompetencies.length === 0 && (
        <p className="text-center text-sm text-gray-400">{t('forms.competencies.noSkillsYet')}</p>
      )}
    </div>
  )
}

function CompetencyItem({
  competency,
  onDragStart,
  onDragEnd,
  onDragOverItem,
  onDragLeaveItem,
  onDropOnItem,
  onUpdate,
  onToggleVisible,
  onDelete,
  isDragging,
  isDropTarget,
}: {
  competency: Competency
  onDragStart: () => void
  onDragEnd: () => void
  onDragOverItem: () => void
  onDragLeaveItem: () => void
  onDropOnItem: () => void
  onUpdate: (name: string) => void
  onToggleVisible: () => void
  onDelete: () => void
  isDragging: boolean
  isDropTarget: boolean
}) {
  const { t } = useI18n()
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(competency.name)

  const handleBlur = () => {
    setIsEditing(false)
    if (editValue.trim() && editValue !== competency.name) {
      onUpdate(editValue.trim())
    } else {
      setEditValue(competency.name)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      ;(e.target as HTMLInputElement).blur()
    } else if (e.key === 'Escape') {
      setEditValue(competency.name)
      setIsEditing(false)
    }
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={(event) => {
        event.preventDefault()
        onDragOverItem()
      }}
      onDragLeave={onDragLeaveItem}
      onDrop={(event) => {
        event.preventDefault()
        onDropOnItem()
      }}
      className={`group flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 transition-opacity hover:border-slate-300 hover:bg-slate-50 ${
        isDragging ? 'cursor-grabbing opacity-50' : 'cursor-grab'
      } ${competency.visible ? '' : 'opacity-60'} ${
        isDropTarget ? 'ring-2 ring-blue-200' : ''
      }`}
    >
      {isEditing ? (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="block w-full rounded border border-blue-500 px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          autoFocus
        />
      ) : (
        <span
          onClick={() => setIsEditing(true)}
          className="flex flex-1 cursor-text items-center gap-2 text-sm text-gray-900"
        >
          <svg className="h-3.5 w-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M8 7h8M8 12h8M8 17h8" />
          </svg>
          {competency.name}
        </span>
      )}
      <div className="ml-2 flex items-center gap-2">
        <button
          onClick={onDelete}
          className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-gray-600 opacity-0 transition-opacity hover:bg-slate-100 group-hover:opacity-100"
          title={t('common.actions.delete')}
          aria-label={t('common.actions.delete')}
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
        <VisibilityToggle isVisible={competency.visible} onToggle={onToggleVisible} />
      </div>
    </div>
  )
}
