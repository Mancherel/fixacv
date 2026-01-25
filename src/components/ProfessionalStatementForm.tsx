import { useCVData } from '../context/CVContext'

export function ProfessionalStatementForm() {
  const { cvData, updateProfessionalStatement } = useCVData()

  return (
    <div>
      <label htmlFor="statement" className="block text-sm font-medium text-gray-700">
        Professional Statement
      </label>
      <textarea
        id="statement"
        value={cvData.professionalStatement}
        onChange={(e) => updateProfessionalStatement(e.target.value)}
        rows={4}
        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        placeholder="A brief professional summary (2-3 sentences)..."
      />
      <p className="mt-1 text-xs text-gray-500">
        {cvData.professionalStatement.length} characters
      </p>
    </div>
  )
}
