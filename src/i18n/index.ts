import en from './locales/en.json'
import sv from './locales/sv.json'
import type {
  AppLanguage,
  CVSectionId,
  ProficiencyLevel,
  SectionTitleOverrides,
} from '../types'

type EditorControlKey =
  | 'cvLanguageLabel'
  | 'customizeHeading'
  | 'customHeadingLabel'
  | 'customHeadingPlaceholder'
  | 'resetHeading'

type PreferenceLabelKey = 'workMode' | 'availability' | 'location'

interface LocaleCatalog {
  languages: Record<AppLanguage, string>
  editor: {
    sectionTitles: Record<CVSectionId, string>
    controls: Record<EditorControlKey, string>
  }
  preview: {
    sectionTitles: Record<CVSectionId, string>
    competencyLevels: Record<ProficiencyLevel, string>
    preferenceLabels: Record<PreferenceLabelKey, string>
    emptyState: string
  }
  ui: Record<string, unknown>
}

const locales: Record<AppLanguage, LocaleCatalog> = {
  en: en as LocaleCatalog,
  sv: sv as LocaleCatalog,
}

const fallbackLocale = locales.en

function getLocale(language: AppLanguage): LocaleCatalog {
  return locales[language] ?? fallbackLocale
}

function getNestedStringValue(
  source: Record<string, unknown> | undefined,
  path: string,
): string | undefined {
  if (!source) return undefined
  const result = path
    .split('.')
    .reduce<unknown>((value, segment) => {
      if (!value || typeof value !== 'object') return undefined
      return (value as Record<string, unknown>)[segment]
    }, source)

  return typeof result === 'string' ? result : undefined
}

function interpolate(
  template: string,
  params?: Record<string, string | number>,
): string {
  if (!params) return template
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, token: string) => {
    const value = params[token]
    return value === undefined || value === null ? '' : String(value)
  })
}

function getOverride(overrides: SectionTitleOverrides | undefined, section: CVSectionId): string | null {
  const raw = overrides?.[section]
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim()
  return trimmed.length > 0 ? trimmed : null
}

export const SUPPORTED_LANGUAGES: AppLanguage[] = ['en', 'sv']

export const SECTION_ORDER: CVSectionId[] = [
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

export function getEditorSectionTitle(
  language: AppLanguage,
  section: CVSectionId,
  overrides?: SectionTitleOverrides,
): string {
  const override = getOverride(overrides, section)
  if (override) return override
  return getLocale(language).editor.sectionTitles[section] ?? fallbackLocale.editor.sectionTitles[section]
}

export function getPreviewSectionTitle(
  language: AppLanguage,
  section: CVSectionId,
  overrides?: SectionTitleOverrides,
): string {
  const override = getOverride(overrides, section)
  if (override) return override
  return getLocale(language).preview.sectionTitles[section] ?? fallbackLocale.preview.sectionTitles[section]
}

export function getEditorControlText(language: AppLanguage, key: EditorControlKey): string {
  return getLocale(language).editor.controls[key] ?? fallbackLocale.editor.controls[key]
}

export function getLanguageDisplayName(
  uiLanguage: AppLanguage,
  languageOption: AppLanguage,
): string {
  return getLocale(uiLanguage).languages[languageOption] ?? fallbackLocale.languages[languageOption]
}

export function getCompetencyLevelText(
  language: AppLanguage,
  level: ProficiencyLevel,
): string {
  return getLocale(language).preview.competencyLevels[level] ?? fallbackLocale.preview.competencyLevels[level]
}

export function getPreferenceLabelText(
  language: AppLanguage,
  key: PreferenceLabelKey,
): string {
  return getLocale(language).preview.preferenceLabels[key] ?? fallbackLocale.preview.preferenceLabels[key]
}

export function getPreviewEmptyStateText(language: AppLanguage): string {
  return getLocale(language).preview.emptyState
}

export function getUIText(
  language: AppLanguage,
  key: string,
  params?: Record<string, string | number>,
): string {
  const fromSelected = getNestedStringValue(getLocale(language).ui, key)
  const fromFallback = getNestedStringValue(fallbackLocale.ui, key)
  const resolved = fromSelected ?? fromFallback ?? key
  return interpolate(resolved, params)
}

export function getVisibilityToggleTitle(
  language: AppLanguage,
  isVisible: boolean,
): string {
  return getUIText(
    language,
    isVisible ? 'common.visibility.hideFromCv' : 'common.visibility.showInCv',
  )
}

export function getVisibilityToggleAria(
  language: AppLanguage,
  isVisible: boolean,
): string {
  return getUIText(
    language,
    isVisible ? 'common.visibility.visible' : 'common.visibility.hidden',
  )
}
