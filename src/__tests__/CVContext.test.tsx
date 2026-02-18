import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { CVProvider, useCVData } from '../context/CVContext'
import type { ReactNode } from 'react'
import type { Experience, Education, Competency, ListItem } from '../types'

const wrapper = ({ children }: { children: ReactNode }) => <CVProvider>{children}</CVProvider>

describe('CVContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initial state', () => {
    it('starts with empty CV data', () => {
      const { result } = renderHook(() => useCVData(), { wrapper })
      expect(result.current.cvData.personalInfo.name).toBe('')
      expect(result.current.cvData.experiences).toEqual([])
      expect(result.current.cvData.education).toEqual([])
    })

    it('lastSaved is set after debounce', async () => {
      const { result } = renderHook(() => useCVData(), { wrapper })
      expect(result.current.lastSaved).toBeNull()
      
      await act(async () => {
        vi.advanceTimersByTime(600)
      })
      
      expect(result.current.lastSaved).not.toBeNull()
    })

    it('storageWarnings starts empty', () => {
      const { result } = renderHook(() => useCVData(), { wrapper })
      expect(result.current.storageWarnings).toEqual([])
    })

    it('storageStats has initial values', () => {
      const { result } = renderHook(() => useCVData(), { wrapper })
      expect(result.current.storageStats.usedBytes).toBe(0)
    })
  })

  describe('updatePersonalInfo', () => {
    it('updates personal info fields', () => {
      const { result } = renderHook(() => useCVData(), { wrapper })

      act(() => {
        result.current.updatePersonalInfo({ name: 'John Doe' })
      })

      expect(result.current.cvData.personalInfo.name).toBe('John Doe')
    })

    it('merges with existing personal info', () => {
      const { result } = renderHook(() => useCVData(), { wrapper })

      act(() => {
        result.current.updatePersonalInfo({ name: 'John', email: 'john@test.com' })
      })
      act(() => {
        result.current.updatePersonalInfo({ phone: '+1234567890' })
      })

      expect(result.current.cvData.personalInfo.name).toBe('John')
      expect(result.current.cvData.personalInfo.email).toBe('john@test.com')
      expect(result.current.cvData.personalInfo.phone).toBe('+1234567890')
    })
  })

  describe('experiences', () => {
    it('adds an experience', () => {
      const { result } = renderHook(() => useCVData(), { wrapper })

      const newExp: Experience = {
        id: 'exp-1',
        type: 'employment',
        customType: '',
        company: 'Acme Corp',
        title: 'Developer',
        startDate: '2020-01',
        endDate: null,
        description: 'Test',
        tags: [],
        visible: true,
      }

      act(() => {
        result.current.addExperience(newExp)
      })

      expect(result.current.cvData.experiences).toHaveLength(1)
      expect(result.current.cvData.experiences[0].company).toBe('Acme Corp')
    })

    it('updates an experience', () => {
      const { result } = renderHook(() => useCVData(), { wrapper })

      const newExp: Experience = {
        id: 'exp-1',
        type: 'employment',
        customType: '',
        company: 'Acme Corp',
        title: 'Developer',
        startDate: '2020-01',
        endDate: null,
        description: '',
        tags: [],
        visible: true,
      }

      act(() => {
        result.current.addExperience(newExp)
      })

      act(() => {
        result.current.updateExperience('exp-1', { title: 'Senior Developer' })
      })

      expect(result.current.cvData.experiences[0].title).toBe('Senior Developer')
    })

    it('deletes an experience', () => {
      const { result } = renderHook(() => useCVData(), { wrapper })

      const newExp: Experience = {
        id: 'exp-1',
        type: 'employment',
        customType: '',
        company: 'Acme Corp',
        title: 'Developer',
        startDate: '2020-01',
        endDate: null,
        description: '',
        tags: [],
        visible: true,
      }

      act(() => {
        result.current.addExperience(newExp)
      })

      expect(result.current.cvData.experiences).toHaveLength(1)

      act(() => {
        result.current.deleteExperience('exp-1')
      })

      expect(result.current.cvData.experiences).toHaveLength(0)
    })
  })

  describe('education', () => {
    it('adds education', () => {
      const { result } = renderHook(() => useCVData(), { wrapper })

      const newEdu: Education = {
        id: 'edu-1',
        institution: 'MIT',
        degree: 'CS',
        startYear: 2018,
        endYear: 2022,
        description: '',
        tags: [],
        visible: true,
      }

      act(() => {
        result.current.addEducation(newEdu)
      })

      expect(result.current.cvData.education).toHaveLength(1)
      expect(result.current.cvData.education[0].institution).toBe('MIT')
    })

    it('updates education', () => {
      const { result } = renderHook(() => useCVData(), { wrapper })

      const newEdu: Education = {
        id: 'edu-1',
        institution: 'MIT',
        degree: 'CS',
        startYear: 2018,
        endYear: 2022,
        description: '',
        tags: [],
        visible: true,
      }

      act(() => {
        result.current.addEducation(newEdu)
      })

      act(() => {
        result.current.updateEducation('edu-1', { degree: 'Computer Science' })
      })

      expect(result.current.cvData.education[0].degree).toBe('Computer Science')
    })

    it('deletes education', () => {
      const { result } = renderHook(() => useCVData(), { wrapper })

      const newEdu: Education = {
        id: 'edu-1',
        institution: 'MIT',
        degree: 'CS',
        startYear: 2018,
        endYear: 2022,
        description: '',
        tags: [],
        visible: true,
      }

      act(() => {
        result.current.addEducation(newEdu)
      })

      act(() => {
        result.current.deleteEducation('edu-1')
      })

      expect(result.current.cvData.education).toHaveLength(0)
    })
  })

  describe('competencies', () => {
    it('adds a competency', () => {
      const { result } = renderHook(() => useCVData(), { wrapper })

      const newComp: Competency = {
        id: 'comp-1',
        name: 'React',
        level: 'expert',
        visible: true,
      }

      act(() => {
        result.current.addCompetency(newComp)
      })

      expect(result.current.cvData.competencies.expert).toHaveLength(1)
      expect(result.current.cvData.competencies.expert[0].name).toBe('React')
    })

    it('updates a competency', () => {
      const { result } = renderHook(() => useCVData(), { wrapper })

      const newComp: Competency = {
        id: 'comp-1',
        name: 'React',
        level: 'expert',
        visible: true,
      }

      act(() => {
        result.current.addCompetency(newComp)
      })

      act(() => {
        result.current.updateCompetency('comp-1', { name: 'React & TypeScript' })
      })

      expect(result.current.cvData.competencies.expert[0].name).toBe('React & TypeScript')
    })

    it('moves competency between levels', () => {
      const { result } = renderHook(() => useCVData(), { wrapper })

      const newComp: Competency = {
        id: 'comp-1',
        name: 'React',
        level: 'expert',
        visible: true,
      }

      act(() => {
        result.current.addCompetency(newComp)
      })

      expect(result.current.cvData.competencies.expert).toHaveLength(1)

      act(() => {
        result.current.updateCompetency('comp-1', { level: 'proficient' })
      })

      expect(result.current.cvData.competencies.expert).toHaveLength(0)
      expect(result.current.cvData.competencies.proficient).toHaveLength(1)
    })

    it('deletes a competency', () => {
      const { result } = renderHook(() => useCVData(), { wrapper })

      const newComp: Competency = {
        id: 'comp-1',
        name: 'React',
        level: 'expert',
        visible: true,
      }

      act(() => {
        result.current.addCompetency(newComp)
      })

      act(() => {
        result.current.deleteCompetency('comp-1')
      })

      expect(result.current.cvData.competencies.expert).toHaveLength(0)
    })

    it('reorders competencies', () => {
      const { result } = renderHook(() => useCVData(), { wrapper })

      const comp1: Competency = {
        id: 'comp-1',
        name: 'React',
        level: 'expert',
        visible: true,
      }
      const comp2: Competency = {
        id: 'comp-2',
        name: 'TypeScript',
        level: 'expert',
        visible: true,
      }

      act(() => {
        result.current.addCompetency(comp1)
        result.current.addCompetency(comp2)
      })

      expect(result.current.cvData.competencies.expert[0].name).toBe('React')
      expect(result.current.cvData.competencies.expert[1].name).toBe('TypeScript')

      act(() => {
        result.current.reorderCompetency('expert', 'comp-2', 'comp-1')
      })

      expect(result.current.cvData.competencies.expert[0].name).toBe('TypeScript')
      expect(result.current.cvData.competencies.expert[1].name).toBe('React')
    })
  })

  describe('list items (languages, other, certifications, portfolio)', () => {
    it('updates languages', () => {
      const { result } = renderHook(() => useCVData(), { wrapper })

      const languages: ListItem[] = [
        { id: 'lang-1', name: 'English', visible: true },
        { id: 'lang-2', name: 'Swedish', visible: true },
      ]

      act(() => {
        result.current.updateLanguages(languages)
      })

      expect(result.current.cvData.languages).toEqual(languages)
    })

    it('updates other items', () => {
      const { result } = renderHook(() => useCVData(), { wrapper })

      const other: ListItem[] = [
        { id: 'other-1', name: "Driver's License", visible: true },
      ]

      act(() => {
        result.current.updateOther(other)
      })

      expect(result.current.cvData.other).toEqual(other)
    })

    it('updates certifications', () => {
      const { result } = renderHook(() => useCVData(), { wrapper })

      const certifications: ListItem[] = [
        { id: 'cert-1', name: 'AWS Certified', visible: true },
      ]

      act(() => {
        result.current.updateCertifications(certifications)
      })

      expect(result.current.cvData.certifications).toEqual(certifications)
    })

    it('updates portfolio', () => {
      const { result } = renderHook(() => useCVData(), { wrapper })

      const portfolio: ListItem[] = [
        { id: 'port-1', name: 'github.com/user', visible: true },
      ]

      act(() => {
        result.current.updatePortfolio(portfolio)
      })

      expect(result.current.cvData.portfolio).toEqual(portfolio)
    })
  })

  describe('section visibility', () => {
    it('toggles section visibility', () => {
      const { result } = renderHook(() => useCVData(), { wrapper })

      expect(result.current.cvData.sectionVisibility.experiences).toBe(true)

      act(() => {
        result.current.toggleSectionVisibility('experiences')
      })

      expect(result.current.cvData.sectionVisibility.experiences).toBe(false)
    })
  })

  describe('import/export', () => {
    it('exports current data', () => {
      const { result } = renderHook(() => useCVData(), { wrapper })

      act(() => {
        result.current.updatePersonalInfo({ name: 'Test User' })
      })

      const exported = result.current.exportData()
      expect(exported.personalInfo.name).toBe('Test User')
    })

    it('imports data', () => {
      const { result } = renderHook(() => useCVData(), { wrapper })

      const importData = {
        ...result.current.cvData,
        personalInfo: {
          ...result.current.cvData.personalInfo,
          name: 'Imported User',
        },
      }

      act(() => {
        result.current.importData(importData)
      })

      expect(result.current.cvData.personalInfo.name).toBe('Imported User')
    })
  })

  describe('clearAllData', () => {
    it('resets all data to defaults', () => {
      const { result } = renderHook(() => useCVData(), { wrapper })

      act(() => {
        result.current.updatePersonalInfo({ name: 'John' })
        result.current.addExperience({
          id: 'exp-1',
          type: 'employment',
          customType: '',
          company: 'Test',
          title: 'Dev',
          startDate: '2020-01',
          endDate: null,
          description: '',
          tags: [],
          visible: true,
        })
      })

      expect(result.current.cvData.personalInfo.name).toBe('John')
      expect(result.current.cvData.experiences).toHaveLength(1)

      act(() => {
        result.current.clearAllData()
      })

      expect(result.current.cvData.personalInfo.name).toBe('')
      expect(result.current.cvData.experiences).toHaveLength(0)
    })
  })

  describe('storage warnings', () => {
    it('clearStorageWarnings clears warnings', () => {
      const { result } = renderHook(() => useCVData(), { wrapper })

      act(() => {
        result.current.clearStorageWarnings()
      })

      expect(result.current.storageWarnings).toEqual([])
    })
  })
})