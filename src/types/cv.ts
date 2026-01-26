/**
 * CV Data Types
 * Based on planning/final-decisions.md
 */

export interface PersonalInfo {
  name: string
  professionalTitle: string
  email: string
  phone: string
  linkedin?: string
  website?: string
  location?: string
  photo?: string
}

export type ExperienceType = 'assignment' | 'employment' | 'custom' | 'none'

export interface Experience {
  id: string
  type: ExperienceType
  customType?: string
  company: string
  title: string
  startDate: string // YYYY-MM format
  endDate: string | null // YYYY-MM or null for ongoing
  description: string
  tags: ListItem[]
  visible: boolean
}

export interface Education {
  id: string
  institution: string
  degree: string
  startYear: number | null
  endYear: number | null
  description: string
  tags: ListItem[]
  visible: boolean
}

export type ProficiencyLevel = 'expert' | 'advanced' | 'proficient'

export interface Competency {
  id: string
  name: string
  level: ProficiencyLevel
  visible: boolean
}

export interface CompetencyGroup {
  expert: Competency[]
  advanced: Competency[]
  proficient: Competency[]
}

export interface ListItem {
  id: string
  name: string
  visible: boolean
}

export interface PreferenceField {
  value: string
  visible: boolean
}

export interface CVData {
  personalInfo: PersonalInfo
  personalInfoVisibility: {
    name: boolean
    professionalTitle: boolean
    email: boolean
    phone: boolean
    linkedin: boolean
    website: boolean
    location: boolean
    photo: boolean
  }
  professionalStatement: string
  experiences: Experience[]
  education: Education[]
  competencies: CompetencyGroup
  languages: ListItem[]
  other: ListItem[]
  certifications: ListItem[]
  portfolio: ListItem[]
  preferences: {
    workMode: PreferenceField
    availability: PreferenceField
    locationPreference: PreferenceField
  }
  // Section visibility (for v0.1)
  sectionVisibility: {
    professionalStatement: boolean
    experiences: boolean
    education: boolean
    competencies: boolean
    languages: boolean
    other: boolean
    certifications: boolean
    portfolio: boolean
    preferences: boolean
  }
}

// Helper type for creating new items
export type NewExperience = Omit<Experience, 'id' | 'visible'>
export type NewEducation = Omit<Education, 'id' | 'visible'>
export type NewCompetency = Omit<Competency, 'id' | 'visible'>
