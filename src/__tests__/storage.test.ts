import { describe, it, expect, beforeEach } from 'vitest'
import { storage } from '../utils/storage'
import type { CVData } from '../types'

describe('storage', () => {
  const STORAGE_KEY = 'fixacv-data'

  const sampleCVData: CVData = {
    personalInfo: {
      name: 'Test User',
      professionalTitle: 'Developer',
      email: 'test@example.com',
      phone: '+1234567890',
      linkedin: '',
      website: '',
      location: 'Test City',
      photo: '',
    },
    personalInfoVisibility: {
      name: true,
      professionalTitle: true,
      email: true,
      phone: true,
      linkedin: true,
      website: true,
      location: true,
      photo: true,
    },
    professionalStatement: 'Test statement',
    experiences: [],
    education: [],
    competencies: {
      expert: [],
      advanced: [],
      proficient: [],
    },
    languages: [],
    other: [],
    certifications: [],
    portfolio: [],
    preferences: {
      workMode: { value: '', visible: true },
      availability: { value: '', visible: true },
      locationPreference: { value: '', visible: true },
    },
    sectionVisibility: {
      professionalStatement: true,
      experiences: true,
      education: true,
      competencies: true,
      languages: true,
      other: true,
      certifications: true,
      portfolio: true,
      preferences: true,
    },
    localization: {
      cvLanguage: 'en',
      sectionTitleOverrides: {
        en: {},
        sv: {},
      },
    },
  }

  beforeEach(() => {
    localStorage.clear()
  })

  describe('save', () => {
    it('saves data to localStorage', () => {
      storage.save(sampleCVData)
      const stored = localStorage.getItem(STORAGE_KEY)
      expect(stored).not.toBeNull()
      expect(JSON.parse(stored!)).toEqual(sampleCVData)
    })

    it('handles complex nested data', () => {
      const complexData: CVData = {
        ...sampleCVData,
        experiences: [
          {
            id: 'exp-1',
            type: 'employment',
            customType: '',
            company: 'Test Company',
            title: 'Senior Developer',
            startDate: '2020-01',
            endDate: null,
            description: 'Test description',
            tags: [
              { id: 'tag-1', name: 'React', visible: true },
              { id: 'tag-2', name: 'TypeScript', visible: false },
            ],
            visible: true,
          },
        ],
      }
      storage.save(complexData)
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
      expect(stored.experiences).toHaveLength(1)
      expect(stored.experiences[0].tags).toHaveLength(2)
    })
  })

  describe('load', () => {
    it('returns null when no data stored', () => {
      expect(storage.load()).toBeNull()
    })

    it('loads previously saved data', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleCVData))
      const loaded = storage.load()
      expect(loaded).toEqual(sampleCVData)
    })

    it('returns null for invalid JSON', () => {
      localStorage.setItem(STORAGE_KEY, 'not valid json')
      const result = storage.load()
      expect(result).toBeNull()
    })
  })

  describe('clear', () => {
    it('removes stored data', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleCVData))
      expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()
      
      storage.clear()
      
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    })
  })

  describe('round-trip', () => {
    it('can save and load data without loss', () => {
      storage.save(sampleCVData)
      const loaded = storage.load()
      expect(loaded).toEqual(sampleCVData)
    })
  })
})