import { useCVData } from '../context/CVContext'
import { SimpleListInput } from './SimpleListInput'

export function CertificationsForm() {
  const { cvData, updateCertifications } = useCVData()

  return (
    <SimpleListInput
      label="Add Certification / Course"
      items={cvData.certifications}
      onChange={updateCertifications}
      placeholder="e.g., AWS Solutions Architect (2023)"
      emptyText="No certifications added yet"
    />
  )
}
