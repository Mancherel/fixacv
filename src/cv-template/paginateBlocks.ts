import type { ProficiencyLevel } from '../types/cv'
import type { ContentBlock, MainBlock, SidebarBlock } from './blocks'

// ---------------------------------------------------------------------------
// Main column pagination (two-column mode)
// ---------------------------------------------------------------------------

export function paginateMainBlocks(
  blocks: MainBlock[],
  heights: Map<string, number>,
  maxHeight: number,
): MainBlock[][] {
  const pages: MainBlock[][] = []
  let current: MainBlock[] = []
  let used = 0
  const seenTitles = { experience: false, education: false }
  const titleHeights = {
    experience: heights.get('experience-title') || 0,
    education: heights.get('education-title') || 0,
  }

  const getSection = (block: MainBlock) => {
    if (block.type === 'experience-item' || block.type === 'experience-title')
      return 'experience'
    if (block.type === 'education-item' || block.type === 'education-title')
      return 'education'
    return null
  }

  const getHeight = (block: MainBlock) => {
    const direct = heights.get(block.id)
    if (direct !== undefined) return direct
    if (block.type === 'experience-title') return titleHeights.experience
    if (block.type === 'education-title') return titleHeights.education
    return 0
  }

  const makeRepeatedTitle = (
    section: 'experience' | 'education',
    index: number,
  ): MainBlock => ({
    id: `${section}-title-continued-${index}`,
    type: section === 'experience' ? 'experience-title' : 'education-title',
  })

  for (let i = 0; i < blocks.length; i += 1) {
    const block = blocks[i]
    const blockHeight = getHeight(block)
    const isSectionTitle =
      block.type === 'experience-title' || block.type === 'education-title'

    if (isSectionTitle) {
      const nextBlock = blocks[i + 1]
      const nextHeight = nextBlock ? getHeight(nextBlock) : 0
      if (current.length > 0 && used + blockHeight + nextHeight > maxHeight) {
        pages.push(current)
        current = []
        used = 0
      }
    }

    if (current.length > 0 && used + blockHeight > maxHeight) {
      pages.push(current)
      current = []
      used = 0

      const section = getSection(block)
      if (
        section &&
        seenTitles[section] &&
        titleHeights[section] > 0 &&
        titleHeights[section] + blockHeight <= maxHeight
      ) {
        current.push(makeRepeatedTitle(section, pages.length))
        used += titleHeights[section]
      }
    }

    if (blockHeight > maxHeight && used > 0) {
      current = []
      used = 0
    }

    current.push(block)
    used += blockHeight

    if (blockHeight > maxHeight && current.length === 1) {
      pages.push(current)
      current = []
      used = 0
    }

    if (block.type === 'experience-title') {
      seenTitles.experience = true
    } else if (block.type === 'education-title') {
      seenTitles.education = true
    }
  }

  if (current.length > 0) {
    pages.push(current)
  }

  return pages
}

// ---------------------------------------------------------------------------
// Sidebar pagination (two-column mode)
// ---------------------------------------------------------------------------

export function paginateSidebarBlocks(
  blocks: SidebarBlock[],
  heights: Map<string, number>,
  maxHeight: number,
): SidebarBlock[][] {
  const pages: SidebarBlock[][] = []
  let current: SidebarBlock[] = []
  let used = 0
  let seenCompetenciesTitle = false
  let seenLanguagesTitle = false
  let seenOtherTitle = false
  let seenCertificationsTitle = false
  let seenPortfolioTitle = false
  let seenPreferencesTitle = false

  const competenciesTitleHeight = heights.get('side-competencies-title') || 0
  const languagesTitleHeight = heights.get('side-languages-title') || 0
  const otherTitleHeight = heights.get('side-other-title') || 0
  const certificationsTitleHeight = heights.get('side-certifications-title') || 0
  const portfolioTitleHeight = heights.get('side-portfolio-title') || 0
  const preferencesTitleHeight = heights.get('side-preferences-title') || 0
  const levelTitleHeights: Record<ProficiencyLevel, number> = {
    expert: heights.get('side-competency-level-expert') || 0,
    advanced: heights.get('side-competency-level-advanced') || 0,
    proficient: heights.get('side-competency-level-proficient') || 0,
  }

  const getHeight = (block: SidebarBlock) => {
    const direct = heights.get(block.id)
    if (direct !== undefined) return direct
    if (block.type === 'competencies-title') return competenciesTitleHeight
    if (block.type === 'competency-level-title') return levelTitleHeights[block.level]
    if (block.type === 'languages-title') return languagesTitleHeight
    if (block.type === 'other-title') return otherTitleHeight
    if (block.type === 'certifications-title') return certificationsTitleHeight
    if (block.type === 'portfolio-title') return portfolioTitleHeight
    if (block.type === 'preferences-title') return preferencesTitleHeight
    return 0
  }

  const makeRepeatedTitle = (pageIndex: number): SidebarBlock => ({
    id: `side-competencies-title-repeat-${pageIndex}`,
    type: 'competencies-title',
  })

  const makeRepeatedLevel = (
    level: ProficiencyLevel,
    pageIndex: number,
  ): SidebarBlock => ({
    id: `side-competency-level-${level}-repeat-${pageIndex}`,
    type: 'competency-level-title',
    level,
  })

  const isSectionTitle = (block: SidebarBlock) =>
    block.type === 'contact-title' ||
    block.type === 'competencies-title' ||
    block.type === 'competency-level-title' ||
    block.type === 'languages-title' ||
    block.type === 'other-title' ||
    block.type === 'certifications-title' ||
    block.type === 'portfolio-title' ||
    block.type === 'preferences-title'

  for (let i = 0; i < blocks.length; i += 1) {
    const block = blocks[i]
    const blockHeight = getHeight(block)

    if (isSectionTitle(block)) {
      const nextBlock = blocks[i + 1]
      const nextHeight = nextBlock ? getHeight(nextBlock) : 0
      if (current.length > 0 && used + blockHeight + nextHeight > maxHeight) {
        pages.push(current)
        current = []
        used = 0
      }
    }

    if (current.length > 0 && used + blockHeight > maxHeight) {
      pages.push(current)
      current = []
      used = 0

      if (
        seenCompetenciesTitle &&
        (block.type === 'competency-level-title' || block.type === 'competency-row')
      ) {
        const titleHeight = competenciesTitleHeight
        if (used + titleHeight <= maxHeight) {
          current.push(makeRepeatedTitle(pages.length))
          used += titleHeight
        }

        if (block.type === 'competency-row') {
          const levelHeight = levelTitleHeights[block.level]
          if (levelHeight > 0 && used + levelHeight <= maxHeight) {
            current.push(makeRepeatedLevel(block.level, pages.length))
            used += levelHeight
          }
        }
      }

      if (seenLanguagesTitle && block.type === 'language-item') {
        if (languagesTitleHeight > 0 && used + languagesTitleHeight <= maxHeight) {
          current.push({
            id: `side-languages-title-repeat-${pages.length}`,
            type: 'languages-title',
          })
          used += languagesTitleHeight
        }
      }

      if (seenOtherTitle && block.type === 'other-item') {
        if (otherTitleHeight > 0 && used + otherTitleHeight <= maxHeight) {
          current.push({
            id: `side-other-title-repeat-${pages.length}`,
            type: 'other-title',
          })
          used += otherTitleHeight
        }
      }

      if (seenCertificationsTitle && block.type === 'certification-item') {
        if (
          certificationsTitleHeight > 0 &&
          used + certificationsTitleHeight <= maxHeight
        ) {
          current.push({
            id: `side-certifications-title-repeat-${pages.length}`,
            type: 'certifications-title',
          })
          used += certificationsTitleHeight
        }
      }

      if (seenPortfolioTitle && block.type === 'portfolio-item') {
        if (portfolioTitleHeight > 0 && used + portfolioTitleHeight <= maxHeight) {
          current.push({
            id: `side-portfolio-title-repeat-${pages.length}`,
            type: 'portfolio-title',
          })
          used += portfolioTitleHeight
        }
      }

      if (seenPreferencesTitle && block.type === 'preference-item') {
        if (preferencesTitleHeight > 0 && used + preferencesTitleHeight <= maxHeight) {
          current.push({
            id: `side-preferences-title-repeat-${pages.length}`,
            type: 'preferences-title',
          })
          used += preferencesTitleHeight
        }
      }
    }

    current.push(block)
    used += blockHeight

    if (block.type === 'competencies-title') {
      seenCompetenciesTitle = true
    } else if (block.type === 'languages-title') {
      seenLanguagesTitle = true
    } else if (block.type === 'other-title') {
      seenOtherTitle = true
    } else if (block.type === 'certifications-title') {
      seenCertificationsTitle = true
    } else if (block.type === 'portfolio-title') {
      seenPortfolioTitle = true
    } else if (block.type === 'preferences-title') {
      seenPreferencesTitle = true
    }
  }

  if (current.length > 0) {
    pages.push(current)
  }

  return pages
}

// ---------------------------------------------------------------------------
// Content block pagination (single-column mode)
// ---------------------------------------------------------------------------

export function paginateContentBlocks(
  blocks: ContentBlock[],
  heights: Map<string, number>,
  maxHeight: number,
): ContentBlock[][] {
  // For single-column mode we use a simpler approach: just fill pages,
  // keeping section titles with their first item (orphan prevention).
  const pages: ContentBlock[][] = []
  let current: ContentBlock[] = []
  let used = 0

  const getHeight = (block: ContentBlock) => heights.get(block.id) || 0

  const isTitleBlock = (block: ContentBlock) =>
    block.type === 'experience-title' ||
    block.type === 'education-title' ||
    block.type === 'competencies-title' ||
    block.type === 'competency-level-title' ||
    block.type === 'languages-title' ||
    block.type === 'other-title' ||
    block.type === 'certifications-title' ||
    block.type === 'portfolio-title' ||
    block.type === 'preferences-title'

  for (let i = 0; i < blocks.length; i += 1) {
    const block = blocks[i]
    const blockHeight = getHeight(block)

    // Keep title + next item together
    if (isTitleBlock(block)) {
      const nextBlock = blocks[i + 1]
      const nextHeight = nextBlock ? getHeight(nextBlock) : 0
      if (current.length > 0 && used + blockHeight + nextHeight > maxHeight) {
        pages.push(current)
        current = []
        used = 0
      }
    }

    if (current.length > 0 && used + blockHeight > maxHeight) {
      pages.push(current)
      current = []
      used = 0
    }

    current.push(block)
    used += blockHeight
  }

  if (current.length > 0) {
    pages.push(current)
  }

  return pages
}
