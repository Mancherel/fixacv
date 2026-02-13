import { useCVData } from '../context/CVContext'
import { useI18n } from '../i18n/useI18n'
import { VisibilityToggle } from './VisibilityToggle'

interface ProfessionalStatementFormProps {
  isVisible?: boolean
  onToggleVisibility?: () => void
}

export function ProfessionalStatementForm({
  isVisible = true,
  onToggleVisibility,
}: ProfessionalStatementFormProps) {
  const { cvData, updateProfessionalStatement } = useCVData()
  const { t } = useI18n()

  return (
    <div className={isVisible ? '' : 'opacity-60'}>
      <div className="flex items-center justify-between">
        <label htmlFor="statement" className="block text-sm font-medium text-gray-700">
          {t('forms.professionalStatement.label')}
        </label>
        {onToggleVisibility ? (
          <VisibilityToggle
            isVisible={isVisible}
            onToggle={onToggleVisibility}
          />
        ) : null}
      </div>
      <textarea
        id="statement"
        value={cvData.professionalStatement}
        onChange={(e) => updateProfessionalStatement(e.target.value)}
        rows={4}
        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        placeholder={t('forms.professionalStatement.placeholder')}
      />
      <p className="mt-1 text-xs text-gray-500">
        {t('forms.professionalStatement.characters', { count: cvData.professionalStatement.length })}
      </p>
    </div>
  )
}
