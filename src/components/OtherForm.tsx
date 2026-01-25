import { useCVData } from '../context/CVContext'
import { SimpleListInput } from './SimpleListInput'

export function OtherForm() {
  const { cvData, updateOther } = useCVData()

  return (
    <SimpleListInput
      label="Add Misc Item"
      items={cvData.other}
      onChange={updateOther}
      placeholder="e.g., Driver's license B"
      emptyText="No misc items added yet"
    />
  )
}
