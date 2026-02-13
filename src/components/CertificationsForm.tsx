import { useCVData } from '../context/CVContext'
import { SimpleListInput } from './SimpleListInput'
import { useI18n } from '../i18n/useI18n'

export function CertificationsForm() {
  const { cvData, updateCertifications } = useCVData()
  const { t } = useI18n()

  return (
    <SimpleListInput
      label={t('forms.lists.certificationsLabel')}
      items={cvData.certifications}
      onChange={updateCertifications}
      placeholder={t('forms.lists.certificationsPlaceholder')}
      emptyText={t('forms.lists.certificationsEmpty')}
    />
  )
}
