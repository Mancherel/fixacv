import { describe, it, expect, beforeEach } from 'vitest'
import { storage } from '../utils/storage'
import type { CVData } from '../types'

describe('storage', () => {
  const STORAGE_KEY = 'fixacv-data'
  const VERSION_KEY = 'fixacv-version'

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
      const warnings = storage.save(sampleCVData)
      const stored = localStorage.getItem(STORAGE_KEY)
      expect(stored).not.toBeNull()
      expect(JSON.parse(stored!)).toEqual(sampleCVData)
      expect(warnings).toEqual([])
    })

    it('saves version to localStorage', () => {
      storage.save(sampleCVData)
      const version = localStorage.getItem(VERSION_KEY)
      expect(version).toBe('1')
    })

    it('returns empty warnings array for normal save', () => {
      const warnings = storage.save(sampleCVData)
      expect(warnings).toEqual([])
    })

    it('returns warning for large photos', () => {
      const largePhoto = 'data:image/png;base64,' + 'A'.repeat(700 * 1024)
      const dataWithLargePhoto = {
        ...sampleCVData,
        personalInfo: { ...sampleCVData.personalInfo, photo: largePhoto },
      }
      const warnings = storage.save(dataWithLargePhoto)
      expect(warnings.length).toBeGreaterThan(0)
      expect(warnings[0].type).toBe('photo')
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
      const warnings = storage.save(complexData)
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
      expect(stored.experiences).toHaveLength(1)
      expect(stored.experiences[0].tags).toHaveLength(2)
      expect(warnings).toEqual([])
    })
  })

  describe('load', () => {
    it('returns null when no data stored', () => {
      expect(storage.load()).toBeNull()
    })

    it('loads previously saved data', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleCVData))
      localStorage.setItem(VERSION_KEY, '1')
      const loaded = storage.load()
      expect(loaded).toEqual(sampleCVData)
    })

    it('returns null for invalid JSON', () => {
      localStorage.setItem(STORAGE_KEY, 'not valid json')
      const result = storage.load()
      expect(result).toBeNull()
    })

    it('handles missing version', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleCVData))
      const loaded = storage.load()
      expect(loaded).toEqual(sampleCVData)
    })
  })

  describe('clear', () => {
    it('removes stored data', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleCVData))
      localStorage.setItem(VERSION_KEY, '1')
      expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()
      
      storage.clear()
      
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
      expect(localStorage.getItem(VERSION_KEY)).toBeNull()
    })
  })

  describe('getStats', () => {
    it('returns stats with zero usage when no data', () => {
      const stats = storage.getStats()
      expect(stats.usedBytes).toBe(0)
      expect(stats.usagePercent).toBe(0)
    })

    it('returns stats after saving data', () => {
      storage.save(sampleCVData)
      const stats = storage.getStats()
      expect(stats.usedBytes).toBeGreaterThan(0)
      expect(stats.usagePercent).toBeGreaterThan(0)
      expect(stats.totalBytes).toBe(5 * 1024 * 1024)
    })
  })

  describe('getPhotoSize', () => {
    it('returns 0 for undefined photo', () => {
      expect(storage.getPhotoSize(undefined)).toBe(0)
    })

    it('returns 0 for empty string', () => {
      expect(storage.getPhotoSize('')).toBe(0)
    })

    it('calculates size for base64 data URL', () => {
      const base64 = 'data:image/png;base64,SGVsbG8='
      const size = storage.getPhotoSize(base64)
      expect(size).toBeGreaterThan(0)
    })

    it('calculates size for non-data URL', () => {
      const url = 'https://example.com/photo.jpg'
      const size = storage.getPhotoSize(url)
      expect(size).toBe(url.length)
    })
  })

  describe('round-trip', () => {
    it('can save and load data without loss', () => {
      storage.save(sampleCVData)
      const loaded = storage.load()
      expect(loaded).toEqual(sampleCVData)
    })
  })

  describe('constants', () => {
    it('exposes PHOTO_SIZE_LIMIT', () => {
      expect(storage.PHOTO_SIZE_LIMIT).toBe(500 * 1024)
    })

    it('exposes STORAGE_WARNING_THRESHOLD', () => {
      expect(storage.STORAGE_WARNING_THRESHOLD).toBe(0.8)
    })
  })
})