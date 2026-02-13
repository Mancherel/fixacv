import { useCVData } from '../context/CVContext'
import { SimpleListInput } from './SimpleListInput'
import { useI18n } from '../i18n/useI18n'

export function LanguagesForm() {
  const { cvData, updateLanguages } = useCVData()
  const { t } = useI18n()

  return (
    <SimpleListInput
      label={t('forms.lists.languagesLabel')}
      items={cvData.languages}
      onChange={updateLanguages}
      placeholder={t('forms.lists.languagesPlaceholder')}
      emptyText={t('forms.lists.languagesEmpty')}
    />
  )
}
