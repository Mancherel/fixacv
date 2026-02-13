import { useCVData } from '../context/CVContext'
import { getUIText, getVisibilityToggleAria, getVisibilityToggleTitle } from '.'

export function useI18n() {
  const { cvData } = useCVData()
  const language = cvData.localization.cvLanguage

  return {
    language,
    t: (key: string, params?: Record<string, string | number>) =>
      getUIText(language, key, params),
    visibilityTitle: (isVisible: boolean) =>
      getVisibilityToggleTitle(language, isVisible),
    visibilityAria: (isVisible: boolean) =>
      getVisibilityToggleAria(language, isVisible),
  }
}
