import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type {
  AppLanguage,
  CVData,
  CVSectionId,
  Experience,
  Education,
  Competency,
  ListItem,
} from '../types'
import { storage } from '../utils/storage'
import { getDefaultCVData } from '../utils/defaults'
import { normalizeCVData, normalizeListItems } from './normalizeCVData'

interface CVContextType {
  cvData: CVData
  lastSaved: Date | null
  updatePersonalInfo: (info: Partial<CVData['personalInfo']>) => void
  togglePersonalInfoVisibility: (field: keyof CVData['personalInfoVisibility']) => void
  updateProfessionalStatement: (statement: string) => void
  addExperience: (experience: Experience) => void
  updateExperience: (id: string, updates: Partial<Experience>) => void
  deleteExperience: (id: string) => void
  addEducation: (education: Education) => void
  updateEducation: (id: string, updates: Partial<Education>) => void
  deleteEducation: (id: string) => void
  addCompetency: (competency: Competency) => void
  updateCompetency: (id: string, updates: Partial<Competency>) => void
  deleteCompetency: (id: string) => void
  reorderCompetency: (level: Competency['level'], fromId: string, toId: string) => void
  updateLanguages: (languages: ListItem[]) => void
  updateOther: (other: ListItem[]) => void
  updateCertifications: (certifications: ListItem[]) => void
  updatePortfolio: (portfolio: ListItem[]) => void
  updatePreferences: (preferences: CVData['preferences']) => void
  toggleSectionVisibility: (section: keyof CVData['sectionVisibility']) => void
  setCVLanguage: (language: AppLanguage) => void
  setSectionTitleOverride: (section: CVSectionId, title: string) => void
  clearSectionTitleOverride: (section: CVSectionId) => void
  clearAllData: () => void
  importData: (data: CVData) => void
  exportData: () => CVData
}

const CVContext = createContext<CVContextType | undefined>(undefined)

export function CVProvider({ children }: { children: ReactNode }) {
  const [cvData, setCVData] = useState<CVData>(() => {
    const saved = storage.load()
    return normalizeCVData(saved)
  })
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Auto-save to localStorage whenever cvData changes
  useEffect(() => {
    storage.save(cvData)
    setLastSaved(new Date())
  }, [cvData])

  const updatePersonalInfo = (info: Partial<CVData['personalInfo']>) => {
    setCVData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, ...info },
    }))
  }

  const togglePersonalInfoVisibility = (field: keyof CVData['personalInfoVisibility']) => {
    setCVData((prev) => ({
      ...prev,
      personalInfoVisibility: {
        ...prev.personalInfoVisibility,
        [field]: !prev.personalInfoVisibility[field],
      },
    }))
  }

  const updateProfessionalStatement = (statement: string) => {
    setCVData((prev) => ({ ...prev, professionalStatement: statement }))
  }

  const addExperience = (experience: Experience) => {
    const nextExperience = {
      ...experience,
      visible: experience.visible ?? true,
      tags: normalizeListItems(experience.tags as Array<ListItem | string>),
    }
    setCVData((prev) => ({
      ...prev,
      experiences: [...prev.experiences, nextExperience],
    }))
  }

  const updateExperience = (id: string, updates: Partial<Experience>) => {
    setCVData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) =>
        exp.id === id ? { ...exp, ...updates } : exp
      ),
    }))
  }

  const deleteExperience = (id: string) => {
    setCVData((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((exp) => exp.id !== id),
    }))
  }

  const addEducation = (education: Education) => {
    const nextEducation = {
      ...education,
      visible: education.visible ?? true,
      description: education.description ?? '',
      tags: normalizeListItems(education.tags as Array<ListItem | string>),
    }
    setCVData((prev) => ({
      ...prev,
      education: [...prev.education, nextEducation],
    }))
  }

  const updateEducation = (id: string, updates: Partial<Education>) => {
    setCVData((prev) => ({
      ...prev,
      education: prev.education.map((edu) =>
        edu.id === id ? { ...edu, ...updates } : edu
      ),
    }))
  }

  const deleteEducation = (id: string) => {
    setCVData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }))
  }

  const addCompetency = (competency: Competency) => {
    const nextCompetency = { ...competency, visible: competency.visible ?? true }
    setCVData((prev) => ({
      ...prev,
      competencies: {
        ...prev.competencies,
        [competency.level]: [...prev.competencies[competency.level], nextCompetency],
      },
    }))
  }

  const updateCompetency = (id: string, updates: Partial<Competency>) => {
    setCVData((prev) => {
      const newCompetencies = { ...prev.competencies }

      // Find and update competency in its current level
      for (const level of ['expert', 'advanced', 'proficient'] as const) {
        const index = newCompetencies[level].findIndex((c) => c.id === id)
        if (index !== -1) {
          const updated = { ...newCompetencies[level][index], ...updates }

          // If level changed, move to new level
          if (updates.level && updates.level !== level) {
            newCompetencies[level] = newCompetencies[level].filter((c) => c.id !== id)
            newCompetencies[updates.level] = [...newCompetencies[updates.level], updated]
          } else {
            newCompetencies[level][index] = updated
          }
          break
        }
      }

      return { ...prev, competencies: newCompetencies }
    })
  }

  const deleteCompetency = (id: string) => {
    setCVData((prev) => {
      const newCompetencies = { ...prev.competencies }

      for (const level of ['expert', 'advanced', 'proficient'] as const) {
        newCompetencies[level] = newCompetencies[level].filter((c) => c.id !== id)
      }

      return { ...prev, competencies: newCompetencies }
    })
  }

  const reorderCompetency = (level: Competency['level'], fromId: string, toId: string) => {
    if (fromId === toId) return
    setCVData((prev) => {
      const list = prev.competencies[level]
      const fromIndex = list.findIndex((item) => item.id === fromId)
      const toIndex = list.findIndex((item) => item.id === toId)
      if (fromIndex === -1 || toIndex === -1) return prev
      const next = [...list]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return {
        ...prev,
        competencies: {
          ...prev.competencies,
          [level]: next,
        },
      }
    })
  }

  const updateLanguages = (languages: ListItem[]) => {
    setCVData((prev) => ({ ...prev, languages }))
  }

  const updateOther = (other: ListItem[]) => {
    setCVData((prev) => ({ ...prev, other }))
  }

  const updateCertifications = (certifications: ListItem[]) => {
    setCVData((prev) => ({ ...prev, certifications }))
  }

  const updatePortfolio = (portfolio: ListItem[]) => {
    setCVData((prev) => ({ ...prev, portfolio }))
  }

  const updatePreferences = (preferences: CVData['preferences']) => {
    setCVData((prev) => ({ ...prev, preferences }))
  }

  const toggleSectionVisibility = (section: keyof CVData['sectionVisibility']) => {
    setCVData((prev) => ({
      ...prev,
      sectionVisibility: {
        ...prev.sectionVisibility,
        [section]: !prev.sectionVisibility[section],
      },
    }))
  }

  const setCVLanguage = (language: AppLanguage) => {
    setCVData((prev) => ({
      ...prev,
      localization: {
        ...prev.localization,
        cvLanguage: language,
      },
    }))
  }

  const setSectionTitleOverride = (section: CVSectionId, title: string) => {
    setCVData((prev) => {
      const language = prev.localization.cvLanguage
      const currentOverrides = { ...prev.localization.sectionTitleOverrides[language] }
      const trimmed = title.trim()

      if (trimmed.length === 0) {
        delete currentOverrides[section]
      } else {
        currentOverrides[section] = title
      }

      return {
        ...prev,
        localization: {
          ...prev.localization,
          sectionTitleOverrides: {
            ...prev.localization.sectionTitleOverrides,
            [language]: currentOverrides,
          },
        },
      }
    })
  }

  const clearSectionTitleOverride = (section: CVSectionId) => {
    setCVData((prev) => {
      const language = prev.localization.cvLanguage
      const currentOverrides = { ...prev.localization.sectionTitleOverrides[language] }
      if (!(section in currentOverrides)) {
        return prev
      }
      delete currentOverrides[section]
      return {
        ...prev,
        localization: {
          ...prev.localization,
          sectionTitleOverrides: {
            ...prev.localization.sectionTitleOverrides,
            [language]: currentOverrides,
          },
        },
      }
    })
  }

  const clearAllData = () => {
    const defaultData = getDefaultCVData()
    setCVData(defaultData)
    storage.clear()
  }

  const importData = (data: CVData) => {
    setCVData(normalizeCVData(data))
  }

  const exportData = () => {
    return cvData
  }

  return (
    <CVContext.Provider
      value={{
        cvData,
        lastSaved,
        updatePersonalInfo,
        togglePersonalInfoVisibility,
        updateProfessionalStatement,
        addExperience,
        updateExperience,
        deleteExperience,
        addEducation,
        updateEducation,
        deleteEducation,
        addCompetency,
        updateCompetency,
        deleteCompetency,
        reorderCompetency,
        updateLanguages,
        updateOther,
        updateCertifications,
        updatePortfolio,
        updatePreferences,
        toggleSectionVisibility,
        setCVLanguage,
        setSectionTitleOverride,
        clearSectionTitleOverride,
        clearAllData,
        importData,
        exportData,
      }}
    >
      {children}
    </CVContext.Provider>
  )
}

export function useCVData() {
  const context = useContext(CVContext)
  if (!context) {
    throw new Error('useCVData must be used within CVProvider')
  }
  return context
}
