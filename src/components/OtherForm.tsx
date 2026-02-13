import { useCVData } from '../context/CVContext'
import { SimpleListInput } from './SimpleListInput'
import { useI18n } from '../i18n/useI18n'

export function OtherForm() {
  const { cvData, updateOther } = useCVData()
  const { t } = useI18n()

  return (
    <SimpleListInput
      label={t('forms.lists.otherLabel')}
      items={cvData.other}
      onChange={updateOther}
      placeholder={t('forms.lists.otherPlaceholder')}
      emptyText={t('forms.lists.otherEmpty')}
    />
  )
}
