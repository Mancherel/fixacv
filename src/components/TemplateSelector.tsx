import { useCVData } from '../context/CVContext'
import { templates } from '../cv-template/templates'

export function TemplateSelector() {
  const { cvData, setSelectedTemplate } = useCVData()

  return (
    <select
      value={cvData.selectedTemplateId}
      onChange={(e) => setSelectedTemplate(e.target.value)}
      className="h-9 min-w-0 rounded-md border border-gray-300 bg-white px-2 text-xs text-gray-700 shadow-sm hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-gray-500"
    >
      {templates.map((tmpl) => (
        <option key={tmpl.id} value={tmpl.id}>
          {tmpl.name}
        </option>
      ))}
    </select>
  )
}
