import { describe, it, expect } from 'vitest'
import { normalizeCVData } from '../context/normalizeCVData'
import type { CVData, ListItem, Experience, Education, Competency } from '../types'

describe('normalizeCVData', () => {
  const defaultData: CVData = {
    personalInfo: {
      name: '',
      professionalTitle: '',
      email: '',
      phone: '',
      linkedin: '',
      website: '',
      location: '',
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
    professionalStatement: '',
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

  it('returns default data when input is null', () => {
    const result = normalizeCVData(null)
    expect(result).toEqual(defaultData)
  })

  it('preserves valid personal info', () => {
    const result = normalizeCVData({
      personalInfo: {
        name: 'John Doe',
        professionalTitle: 'Developer',
        email: 'john@example.com',
        phone: '+1234567890',
        linkedin: 'linkedin.com/in/johndoe',
        website: 'johndoe.com',
        location: 'New York',
        photo: 'data:image/png;base64,abc',
      },
    } as Partial<CVData>)
    expect(result.personalInfo.name).toBe('John Doe')
    expect(result.personalInfo.professionalTitle).toBe('Developer')
    expect(result.personalInfo.email).toBe('john@example.com')
  })

  it('merges partial personal info with defaults', () => {
    const result = normalizeCVData({
      personalInfo: {
        name: 'Jane',
      },
    } as Partial<CVData>)
    expect(result.personalInfo.name).toBe('Jane')
    expect(result.personalInfo.email).toBe('')
    expect(result.personalInfo.phone).toBe('')
  })
})

describe('normalizeListItems', () => {
  const generateId = () => 'test-uuid-1234'

  const normalizeListItems = (items?: Array<ListItem | string>): ListItem[] => {
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

  it('returns empty array for undefined or empty input', () => {
    expect(normalizeListItems(undefined)).toEqual([])
    expect(normalizeListItems([])).toEqual([])
  })

  it('converts strings to ListItem objects', () => {
    const result = normalizeListItems(['English', 'Swedish'])
    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('English')
    expect(result[0].visible).toBe(true)
    expect(result[1].name).toBe('Swedish')
    expect(result[1].visible).toBe(true)
  })

  it('preserves existing ListItem objects', () => {
    const input: ListItem[] = [
      { id: 'existing-id', name: 'Python', visible: false },
    ]
    const result = normalizeListItems(input)
    expect(result[0].id).toBe('existing-id')
    expect(result[0].name).toBe('Python')
    expect(result[0].visible).toBe(false)
  })

  it('adds missing id and visible to ListItem objects', () => {
    const result = normalizeListItems([{ name: 'JavaScript' } as ListItem])
    expect(result[0].id).toBe('test-uuid-1234')
    expect(result[0].visible).toBe(true)
  })

  it('handles mixed input', () => {
    const result = normalizeListItems([
      'String item',
      { id: 'custom-id', name: 'Object item', visible: true },
    ])
    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('String item')
    expect(result[1].id).toBe('custom-id')
  })
})

describe('normalizeExperience', () => {
  const normalizeExperience = (exp: Partial<Experience>): Experience => ({
    id: exp.id || 'test-id',
    type: exp.type || 'employment',
    customType: exp.customType ?? '',
    company: exp.company || '',
    title: exp.title || '',
    startDate: exp.startDate || '',
    endDate: exp.endDate ?? null,
    description: exp.description || '',
    tags: exp.tags || [],
    visible: exp.visible ?? true,
  })

  it('fills missing optional fields with defaults', () => {
    const result = normalizeExperience({
      id: 'exp-1',
      type: 'assignment',
      company: 'Acme',
      title: 'Dev',
      startDate: '2020-01',
      endDate: null,
      description: 'Work',
    })
    expect(result.customType).toBe('')
    expect(result.visible).toBe(true)
    expect(result.tags).toEqual([])
  })

  it('preserves all provided values', () => {
    const exp: Experience = {
      id: 'exp-1',
      type: 'custom',
      customType: 'Freelance',
      company: 'Acme',
      title: 'Senior Dev',
      startDate: '2020-01',
      endDate: '2022-06',
      description: 'Great work',
      tags: [{ id: 'tag-1', name: 'React', visible: true }],
      visible: false,
    }
    const result = normalizeExperience(exp)
    expect(result).toEqual(exp)
  })
})

describe('normalizeEducation', () => {
  const normalizeEducation = (edu: Partial<Education>): Education => ({
    id: edu.id || 'test-id',
    institution: edu.institution || '',
    degree: edu.degree || '',
    startYear: edu.startYear ?? null,
    endYear: edu.endYear ?? null,
    description: edu.description ?? '',
    tags: edu.tags || [],
    visible: edu.visible ?? true,
  })

  it('handles null years', () => {
    const result = normalizeEducation({
      id: 'edu-1',
      institution: 'MIT',
      degree: 'CS',
      startYear: null,
      endYear: null,
    })
    expect(result.startYear).toBeNull()
    expect(result.endYear).toBeNull()
  })

  it('preserves year values', () => {
    const result = normalizeEducation({
      id: 'edu-1',
      institution: 'Stanford',
      degree: 'PhD',
      startYear: 2015,
      endYear: 2020,
    })
    expect(result.startYear).toBe(2015)
    expect(result.endYear).toBe(2020)
  })
})

describe('normalizeCompetency', () => {
  const normalizeCompetency = (comp: Partial<Competency>): Competency => ({
    id: comp.id || 'test-id',
    name: comp.name || '',
    level: comp.level || 'proficient',
    visible: comp.visible ?? true,
  })

  it('defaults visible to true', () => {
    const result = normalizeCompetency({ id: 'c1', name: 'React', level: 'expert' })
    expect(result.visible).toBe(true)
  })

  it('preserves visible false', () => {
    const result = normalizeCompetency({
      id: 'c1',
      name: 'Vue',
      level: 'advanced',
      visible: false,
    })
    expect(result.visible).toBe(false)
  })
})