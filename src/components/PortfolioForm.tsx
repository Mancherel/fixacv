import { useCVData } from '../context/CVContext'
import { SimpleListInput } from './SimpleListInput'
import { useI18n } from '../i18n/useI18n'

export function PortfolioForm() {
  const { cvData, updatePortfolio } = useCVData()
  const { t } = useI18n()

  return (
    <SimpleListInput
      label={t('forms.lists.portfolioLabel')}
      items={cvData.portfolio}
      onChange={updatePortfolio}
      placeholder={t('forms.lists.portfolioPlaceholder')}
      emptyText={t('forms.lists.portfolioEmpty')}
    />
  )
}
