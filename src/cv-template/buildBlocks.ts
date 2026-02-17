import type { CVData, CVSectionId, ProficiencyLevel } from '../types/cv'
import type { ContactKind, ContentBlock, MainBlock, SidebarBlock } from './blocks'
import {
  getVisibleContactItems,
  getVisibleEducation,
  getVisibleExperiences,
  getVisibleListItems,
  getVisiblePreferences,
  hasVisibleCompetencies,
} from './dataUtils'

// ---------------------------------------------------------------------------
// Main column blocks (two-column mode)
// ---------------------------------------------------------------------------

export function buildMainBlocks(cvData: CVData): MainBlock[] {
  const blocks: MainBlock[] = [{ id: 'header', type: 'header' }]

  if (cvData.sectionVisibility.professionalStatement && cvData.professionalStatement) {
    blocks.push({ id: 'statement', type: 'statement' })
  }

  const visibleExperiences = getVisibleExperiences(cvData)
  if (cvData.sectionVisibility.experiences && visibleExperiences.length > 0) {
    blocks.push({ id: 'experience-title', type: 'experience-title' })
    visibleExperiences.forEach((exp) => {
      blocks.push({ id: `experience-${exp.id}`, type: 'experience-item', item: exp })
    })
  }

  const visibleEducation = getVisibleEducation(cvData)
  if (cvData.sectionVisibility.education && visibleEducation.length > 0) {
    blocks.push({ id: 'education-title', type: 'education-title' })
    visibleEducation.forEach((edu) => {
      blocks.push({ id: `education-${edu.id}`, type: 'education-item', item: edu })
    })
  }

  if (blocks.length === 1) {
    blocks.push({ id: 'empty', type: 'empty' })
  }

  return blocks
}

// ---------------------------------------------------------------------------
// Sidebar blocks (two-column mode)
// ---------------------------------------------------------------------------

export function buildSidebarBlocks(
  cvData: CVData,
  competencyRows: Record<ProficiencyLevel, string[][]>,
  preferenceLabels: { workMode: string; availability: string; location: string },
): SidebarBlock[] {
  const blocks: SidebarBlock[] = []

  // Photo
  if (cvData.personalInfo.photo && cvData.personalInfoVisibility.photo) {
    blocks.push({ id: 'side-photo', type: 'photo' })
  }

  // Contact
  const contactItems = getVisibleContactItems(cvData)
  if (contactItems.length > 0) {
    blocks.push({ id: 'side-contact-title', type: 'contact-title' })
    contactItems.forEach((item, index) => {
      blocks.push({
        id: `side-contact-${index}`,
        type: 'contact-item',
        value: item.value,
        href: undefined,
        kind: item.kind as ContactKind,
      })
    })
  }

  // Competencies
  if (cvData.sectionVisibility.competencies && hasVisibleCompetencies(cvData)) {
    blocks.push({ id: 'side-competencies-title', type: 'competencies-title' })
    ;(['expert', 'advanced', 'proficient'] as ProficiencyLevel[]).forEach((level) => {
      const list = cvData.competencies[level].filter(
        (comp) => comp.visible && comp.name.trim(),
      )
      if (list.length === 0) return
      blocks.push({
        id: `side-competency-level-${level}`,
        type: 'competency-level-title',
        level,
      })
      const rows = competencyRows[level]?.length
        ? competencyRows[level]
        : list.map((comp) => [comp.name])
      rows.forEach((row, index) => {
        blocks.push({
          id: `side-competency-row-${level}-${index}`,
          type: 'competency-row',
          level,
          names: row,
        })
      })
    })
  }

  // Languages
  const visibleLanguages = getVisibleListItems(cvData.languages)
  if (cvData.sectionVisibility.languages && visibleLanguages.length > 0) {
    blocks.push({ id: 'side-languages-title', type: 'languages-title' })
    visibleLanguages.forEach((name, index) => {
      blocks.push({ id: `side-language-${index}`, type: 'language-item', name })
    })
  }

  // Other
  const visibleOther = getVisibleListItems(cvData.other)
  if (cvData.sectionVisibility.other && visibleOther.length > 0) {
    blocks.push({ id: 'side-other-title', type: 'other-title' })
    visibleOther.forEach((name, index) => {
      blocks.push({ id: `side-other-${index}`, type: 'other-item', name })
    })
  }

  // Certifications
  const visibleCertifications = getVisibleListItems(cvData.certifications)
  if (cvData.sectionVisibility.certifications && visibleCertifications.length > 0) {
    blocks.push({ id: 'side-certifications-title', type: 'certifications-title' })
    visibleCertifications.forEach((name, index) => {
      blocks.push({ id: `side-certification-${index}`, type: 'certification-item', name })
    })
  }

  // Portfolio
  const visiblePortfolio = getVisibleListItems(cvData.portfolio)
  if (cvData.sectionVisibility.portfolio && visiblePortfolio.length > 0) {
    blocks.push({ id: 'side-portfolio-title', type: 'portfolio-title' })
    visiblePortfolio.forEach((name, index) => {
      blocks.push({ id: `side-portfolio-${index}`, type: 'portfolio-item', name })
    })
  }

  // Preferences
  const preferenceItems = getVisiblePreferences(cvData, preferenceLabels)
  if (cvData.sectionVisibility.preferences && preferenceItems.length > 0) {
    blocks.push({ id: 'side-preferences-title', type: 'preferences-title' })
    preferenceItems.forEach((item) => {
      blocks.push({
        id: `side-preferences-${item.id}`,
        type: 'preference-item',
        name: `${item.label}: ${item.value}`,
      })
    })
  }

  return blocks
}

// ---------------------------------------------------------------------------
// Content blocks (single-column mode — all sections in one stream)
// ---------------------------------------------------------------------------

/**
 * Builds a flat list of blocks for single-column mode. The order of sections
 * is determined by `sectionOrder` from the template's layout.contentSections.
 */
export function buildContentBlocks(
  cvData: CVData,
  sectionOrder: CVSectionId[],
  competencyRows: Record<ProficiencyLevel, string[][]>,
  preferenceLabels: { workMode: string; availability: string; location: string },
): ContentBlock[] {
  const blocks: ContentBlock[] = []
  let hasContent = false

  for (const section of sectionOrder) {
    const sectionBlocks = buildSectionBlocks(
      section,
      cvData,
      competencyRows,
      preferenceLabels,
    )
    if (sectionBlocks.length > 0) {
      if (hasContent) {
        blocks.push({ id: `divider-before-${section}`, type: 'section-divider' })
      }
      blocks.push(...sectionBlocks)
      hasContent = true
    }
  }

  if (blocks.length === 0) {
    blocks.push({ id: 'empty', type: 'empty' })
  }

  return blocks
}

// ---------------------------------------------------------------------------
// Helpers for buildContentBlocks — builds blocks for a single section
// ---------------------------------------------------------------------------

function buildSectionBlocks(
  section: CVSectionId,
  cvData: CVData,
  competencyRows: Record<ProficiencyLevel, string[][]>,
  preferenceLabels: { workMode: string; availability: string; location: string },
): ContentBlock[] {
  switch (section) {
    case 'professionalStatement':
      return buildStatementSection(cvData)
    case 'experiences':
      return buildExperiencesSection(cvData)
    case 'education':
      return buildEducationSection(cvData)
    case 'competencies':
      return buildCompetenciesSection(cvData, competencyRows)
    case 'languages':
      return buildListSection(cvData, 'languages', cvData.languages, 'side-languages-title', 'languages-title', 'side-language-', 'language-item')
    case 'other':
      return buildListSection(cvData, 'other', cvData.other, 'side-other-title', 'other-title', 'side-other-', 'other-item')
    case 'certifications':
      return buildListSection(cvData, 'certifications', cvData.certifications, 'side-certifications-title', 'certifications-title', 'side-certification-', 'certification-item')
    case 'portfolio':
      return buildListSection(cvData, 'portfolio', cvData.portfolio, 'side-portfolio-title', 'portfolio-title', 'side-portfolio-', 'portfolio-item')
    case 'preferences':
      return buildPreferencesSection(cvData, preferenceLabels)
    default:
      return []
  }
}

function buildStatementSection(cvData: CVData): ContentBlock[] {
  if (!cvData.sectionVisibility.professionalStatement || !cvData.professionalStatement) {
    return []
  }
  return [{ id: 'statement', type: 'statement' }]
}

function buildExperiencesSection(cvData: CVData): ContentBlock[] {
  const visible = getVisibleExperiences(cvData)
  if (!cvData.sectionVisibility.experiences || visible.length === 0) return []
  const blocks: ContentBlock[] = [{ id: 'experience-title', type: 'experience-title' }]
  visible.forEach((exp) => {
    blocks.push({ id: `experience-${exp.id}`, type: 'experience-item', item: exp })
  })
  return blocks
}

function buildEducationSection(cvData: CVData): ContentBlock[] {
  const visible = getVisibleEducation(cvData)
  if (!cvData.sectionVisibility.education || visible.length === 0) return []
  const blocks: ContentBlock[] = [{ id: 'education-title', type: 'education-title' }]
  visible.forEach((edu) => {
    blocks.push({ id: `education-${edu.id}`, type: 'education-item', item: edu })
  })
  return blocks
}

function buildCompetenciesSection(
  cvData: CVData,
  competencyRows: Record<ProficiencyLevel, string[][]>,
): ContentBlock[] {
  if (!cvData.sectionVisibility.competencies || !hasVisibleCompetencies(cvData)) {
    return []
  }
  const blocks: ContentBlock[] = [
    { id: 'side-competencies-title', type: 'competencies-title' },
  ]
  ;(['expert', 'advanced', 'proficient'] as ProficiencyLevel[]).forEach((level) => {
    const list = cvData.competencies[level].filter(
      (comp) => comp.visible && comp.name.trim(),
    )
    if (list.length === 0) return
    blocks.push({
      id: `side-competency-level-${level}`,
      type: 'competency-level-title',
      level,
    })
    const rows = competencyRows[level]?.length
      ? competencyRows[level]
      : list.map((comp) => [comp.name])
    rows.forEach((row, index) => {
      blocks.push({
        id: `side-competency-row-${level}-${index}`,
        type: 'competency-row',
        level,
        names: row,
      })
    })
  })
  return blocks
}

function buildListSection(
  cvData: CVData,
  sectionKey: 'languages' | 'other' | 'certifications' | 'portfolio',
  items: import('../types/cv').ListItem[],
  titleId: string,
  titleType: SidebarBlock['type'],
  itemIdPrefix: string,
  itemType: SidebarBlock['type'],
): ContentBlock[] {
  const visible = getVisibleListItems(items)
  if (!cvData.sectionVisibility[sectionKey] || visible.length === 0) return []
  const blocks: ContentBlock[] = [{ id: titleId, type: titleType } as SidebarBlock]
  visible.forEach((name, index) => {
    blocks.push({ id: `${itemIdPrefix}${index}`, type: itemType, name } as SidebarBlock)
  })
  return blocks
}

function buildPreferencesSection(
  cvData: CVData,
  preferenceLabels: { workMode: string; availability: string; location: string },
): ContentBlock[] {
  const items = getVisiblePreferences(cvData, preferenceLabels)
  if (!cvData.sectionVisibility.preferences || items.length === 0) return []
  const blocks: ContentBlock[] = [
    { id: 'side-preferences-title', type: 'preferences-title' } as SidebarBlock,
  ]
  items.forEach((item) => {
    blocks.push({
      id: `side-preferences-${item.id}`,
      type: 'preference-item',
      name: `${item.label}: ${item.value}`,
    } as SidebarBlock)
  })
  return blocks
}
