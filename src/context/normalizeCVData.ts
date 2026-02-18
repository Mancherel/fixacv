import type {
  AppLanguage,
  CVData,
  CVSectionId,
  Experience,
  Education,
  ListItem,
  PreferenceField,
  SectionTitleOverrides,
} from '../types'
import { getDefaultCVData } from '../utils/defaults'

const generateId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export const normalizeListItems = (items?: Array<ListItem | string>): ListItem[] => {
  if (!items || items.length === 0) return []
  return items.map((item) => {
    if (typeof item === 'string') {
      return { id: generateId(), name: item, visible: true }
    }
    return {
      id: item.id || generateId(),
      name: item.name,
      visible: item.visible ?? true,
    }
  })
}

const normalizeVisibility = <T extends { visible?: boolean }>(item: T) => ({
  ...item,
  visible: item.visible ?? true,
})

const normalizePreferencesField = (
  field?: PreferenceField | string
): PreferenceField => {
  if (typeof field === 'string') {
    return { value: field, visible: true }
  }
  return {
    value: field?.value ?? '',
    visible: field?.visible ?? true,
  }
}

const SECTION_IDS: CVSectionId[] = [
  'personalInfo',
  'professionalStatement',
  'experiences',
  'education',
  'competencies',
  'languages',
  'other',
  'certifications',
  'portfolio',
  'preferences',
]

export const normalizeSectionTitleOverrides = (
  overrides?: SectionTitleOverrides
): SectionTitleOverrides => {
  const normalized: SectionTitleOverrides = {}
  SECTION_IDS.forEach((section) => {
    const value = overrides?.[section]
    if (typeof value !== 'string') return
    const trimmed = value.trim()
    if (trimmed.length > 0) {
      normalized[section] = value
    }
  })
  return normalized
}

const normalizeCVLanguage = (language: unknown): AppLanguage => {
  return language === 'sv' ? 'sv' : 'en'
}

export const normalizeExperience = (exp: Experience): Experience => ({
  ...normalizeVisibility(exp),
  customType: exp.customType ?? '',
  tags: normalizeListItems(exp.tags as Array<ListItem | string>),
})

export const normalizeEducation = (edu: Education): Education => ({
  ...normalizeVisibility(edu),
  startYear: edu.startYear ?? null,
  endYear: edu.endYear ?? null,
  description: edu.description ?? '',
  tags: normalizeListItems(edu.tags as Array<ListItem | string>),
})

export function normalizeCVData(data: Partial<CVData> | null): CVData {
  const defaults = getDefaultCVData()
  if (!data) return defaults

  return {
    ...defaults,
    ...data,
    personalInfo: { ...defaults.personalInfo, ...data.personalInfo },
    personalInfoVisibility: {
      ...defaults.personalInfoVisibility,
      ...data.personalInfoVisibility,
    },
    experiences: (data.experiences ?? defaults.experiences).map(normalizeExperience),
    education: (data.education ?? defaults.education).map(normalizeEducation),
    competencies: {
      expert: (data.competencies?.expert ?? defaults.competencies.expert).map(normalizeVisibility),
      advanced: (data.competencies?.advanced ?? defaults.competencies.advanced).map(
        normalizeVisibility
      ),
      proficient: (data.competencies?.proficient ?? defaults.competencies.proficient).map(
        normalizeVisibility
      ),
    },
    sectionVisibility: { ...defaults.sectionVisibility, ...data.sectionVisibility },
    languages: normalizeListItems(data.languages ?? defaults.languages),
    other: normalizeListItems(data.other ?? defaults.other),
    certifications: normalizeListItems(data.certifications ?? defaults.certifications),
    portfolio: normalizeListItems(data.portfolio ?? defaults.portfolio),
    preferences: {
      workMode: normalizePreferencesField(data.preferences?.workMode),
      availability: normalizePreferencesField(data.preferences?.availability),
      locationPreference: normalizePreferencesField(data.preferences?.locationPreference),
    },
    localization: {
      cvLanguage: normalizeCVLanguage(data.localization?.cvLanguage),
      sectionTitleOverrides: {
        en: normalizeSectionTitleOverrides(data.localization?.sectionTitleOverrides?.en),
        sv: normalizeSectionTitleOverrides(data.localization?.sectionTitleOverrides?.sv),
      },
    },
  }
}