import { useCVData } from '../context/CVContext'
import { SimpleListInput } from './SimpleListInput'

export function PortfolioForm() {
  const { cvData, updatePortfolio } = useCVData()

  return (
    <SimpleListInput
      label="Add Portfolio Link"
      items={cvData.portfolio}
      onChange={updatePortfolio}
      placeholder="e.g., https://yourportfolio.com/project"
      emptyText="No portfolio links added yet"
    />
  )
}
