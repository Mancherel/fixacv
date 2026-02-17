import { formatDateRangeWithDuration } from '../utils/dateUtils'
import type {
  AppLanguage,
  CVData,
  Education,
  Experience,
  ListItem,
  ProficiencyLevel,
} from '../types/cv'
import type { ContactKind } from './blocks'

// ---------------------------------------------------------------------------
// Content checks
// ---------------------------------------------------------------------------

export function hasExperienceContent(exp: Experience, language: AppLanguage): boolean {
  if (exp.company?.trim()) return true
  if (exp.title?.trim()) return true
  if (exp.description?.trim()) return true
  if (exp.tags?.some((tag) => tag.visible && tag.name.trim())) return true
  return Boolean(formatDateRangeWithDuration(exp.startDate, exp.endDate, language))
}

export function hasEducationContent(edu: Education): boolean {
  if (edu.institution?.trim()) return true
  if (edu.degree?.trim()) return true
  if (edu.description?.trim()) return true
  if (edu.tags?.some((tag) => tag.visible && tag.name.trim())) return true
  if (edu.startYear || edu.endYear) return true
  return false
}

// ---------------------------------------------------------------------------
// Visible item extractors
// ---------------------------------------------------------------------------

export function getVisibleExperiences(cvData: CVData): Experience[] {
  const language = cvData.localization.cvLanguage
  return cvData.experiences
    .filter((exp) => exp.visible)
    .filter((exp) => hasExperienceContent(exp, language))
}

export function getVisibleEducation(cvData: CVData): Education[] {
  return cvData.education
    .filter((edu) => edu.visible)
    .filter(hasEducationContent)
}

export interface ContactItem {
  value: string
  kind: ContactKind
}

export function getVisibleContactItems(cvData: CVData): ContactItem[] {
  const items: ContactItem[] = []
  if (cvData.personalInfoVisibility.email && cvData.personalInfo.email) {
    items.push({ value: cvData.personalInfo.email, kind: 'email' })
  }
  if (cvData.personalInfoVisibility.phone && cvData.personalInfo.phone) {
    items.push({ value: cvData.personalInfo.phone, kind: 'phone' })
  }
  if (cvData.personalInfoVisibility.location && cvData.personalInfo.location) {
    items.push({ value: cvData.personalInfo.location, kind: 'location' })
  }
  if (cvData.personalInfoVisibility.linkedin && cvData.personalInfo.linkedin) {
    items.push({ value: cvData.personalInfo.linkedin, kind: 'linkedin' })
  }
  if (cvData.personalInfoVisibility.website && cvData.personalInfo.website) {
    items.push({ value: cvData.personalInfo.website, kind: 'website' })
  }
  return items
}

export function getVisibleCompetencies(
  cvData: CVData,
): Record<ProficiencyLevel, string[]> {
  const result: Record<ProficiencyLevel, string[]> = {
    expert: [],
    advanced: [],
    proficient: [],
  }
  for (const level of ['expert', 'advanced', 'proficient'] as ProficiencyLevel[]) {
    result[level] = cvData.competencies[level]
      .filter((comp) => comp.visible && comp.name.trim())
      .map((comp) => comp.name)
  }
  return result
}

export function hasVisibleCompetencies(cvData: CVData): boolean {
  return (
    cvData.competencies.expert.some((c) => c.visible && c.name.trim()) ||
    cvData.competencies.advanced.some((c) => c.visible && c.name.trim()) ||
    cvData.competencies.proficient.some((c) => c.visible && c.name.trim())
  )
}

export function getVisibleListItems(items: ListItem[]): string[] {
  return items.filter((item) => item.visible && item.name.trim()).map((item) => item.name)
}

export interface PreferenceDisplay {
  id: string
  label: string
  value: string
}

export function getVisiblePreferences(
  cvData: CVData,
  labels: { workMode: string; availability: string; location: string },
): PreferenceDisplay[] {
  const items = [
    { id: 'workmode', label: labels.workMode, field: cvData.preferences.workMode },
    { id: 'availability', label: labels.availability, field: cvData.preferences.availability },
    { id: 'location', label: labels.location, field: cvData.preferences.locationPreference },
  ]
  return items
    .filter((item) => item.field.visible && item.field.value)
    .map((item) => ({ id: item.id, label: item.label, value: item.field.value }))
}
