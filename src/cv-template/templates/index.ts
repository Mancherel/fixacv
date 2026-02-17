import type { CVTemplate } from '../types'
import { classicTemplate } from './classic'
import { compactTemplate } from './compact'
import { executiveTemplate } from './executive'

export const templates: CVTemplate[] = [
  classicTemplate,
  executiveTemplate,
  compactTemplate,
]

export function getTemplate(id: string): CVTemplate {
  return templates.find((t) => t.id === id) ?? classicTemplate
}

export { classicTemplate, executiveTemplate, compactTemplate }
