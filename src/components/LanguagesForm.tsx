import { useCVData } from '../context/CVContext'
import { SimpleListInput } from './SimpleListInput'

export function LanguagesForm() {
  const { cvData, updateLanguages } = useCVData()

  return (
    <SimpleListInput
      label="Add Language"
      items={cvData.languages}
      onChange={updateLanguages}
      placeholder="e.g., Swedish (Native)"
      emptyText="No languages added yet"
    />
  )
}
