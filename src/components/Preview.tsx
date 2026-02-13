import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useCVData } from '../context/CVContext'
import { formatDateRangeWithDuration } from '../utils/dateUtils'
import { useI18n } from '../i18n/useI18n'
import type { AppLanguage, Education, Experience, ProficiencyLevel } from '../types'
import {
  getCompetencyLevelText,
  getPreferenceLabelText,
  getPreviewEmptyStateText,
  getPreviewSectionTitle,
} from '../i18n'
import {
  PREVIEW_FOCUS_SECTION_EVENT,
  type EditorSectionId,
  type PreviewFocusSectionDetail,
} from '../types/editorNavigation'

const PAGE_HEIGHT_MM = 297
const PAGE_MARGIN_MM = 15
const SIDEBAR_SAFE_BOTTOM_MM = 12

type MainBlock =
  | { id: string; type: 'header' }
  | { id: string; type: 'statement' }
  | { id: string; type: 'experience-title' }
  | { id: string; type: 'experience-item'; item: Experience }
  | { id: string; type: 'education-title' }
  | { id: string; type: 'education-item'; item: Education }
  | { id: string; type: 'empty' }

type ContactKind = 'email' | 'phone' | 'location' | 'linkedin' | 'website'

type SidebarBlock =
  | { id: string; type: 'photo' }
  | { id: string; type: 'contact-title' }
  | { id: string; type: 'contact-item'; value: string; href?: string; kind: ContactKind }
  | { id: string; type: 'competencies-title' }
  | { id: string; type: 'competency-level-title'; level: ProficiencyLevel }
  | { id: string; type: 'competency-row'; level: ProficiencyLevel; names: string[] }
  | { id: string; type: 'languages-title' }
  | { id: string; type: 'language-item'; name: string }
  | { id: string; type: 'other-title' }
  | { id: string; type: 'other-item'; name: string }
  | { id: string; type: 'certifications-title' }
  | { id: string; type: 'certification-item'; name: string }
  | { id: string; type: 'portfolio-title' }
  | { id: string; type: 'portfolio-item'; name: string }
  | { id: string; type: 'preferences-title' }
  | { id: string; type: 'preference-item'; name: string }

const hasExperienceContent = (exp: Experience, language: AppLanguage) => {
  if (exp.company?.trim()) return true
  if (exp.title?.trim()) return true
  if (exp.description?.trim()) return true
  if (exp.tags?.some((tag) => tag.visible && tag.name.trim())) return true
  return Boolean(formatDateRangeWithDuration(exp.startDate, exp.endDate, language))
}

const hasEducationContent = (edu: Education) => {
  if (edu.institution?.trim()) return true
  if (edu.degree?.trim()) return true
  if (edu.description?.trim()) return true
  if (edu.tags?.some((tag) => tag.visible && tag.name.trim())) return true
  if (edu.startYear || edu.endYear) return true
  return false
}

function buildBlocks(cvData: ReturnType<typeof useCVData>['cvData']): MainBlock[] {
  const blocks: MainBlock[] = [{ id: 'header', type: 'header' }]
  const language = cvData.localization.cvLanguage

  if (cvData.sectionVisibility.professionalStatement && cvData.professionalStatement) {
    blocks.push({ id: 'statement', type: 'statement' })
  }

  const visibleExperiences = cvData.experiences
    .filter((exp) => exp.visible)
    .filter((exp) => hasExperienceContent(exp, language))
  if (cvData.sectionVisibility.experiences && visibleExperiences.length > 0) {
    blocks.push({ id: 'experience-title', type: 'experience-title' })
    visibleExperiences.forEach((exp) => {
      blocks.push({ id: `experience-${exp.id}`, type: 'experience-item', item: exp })
    })
  }

  const visibleEducation = cvData.education
    .filter((edu) => edu.visible)
    .filter(hasEducationContent)
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

function buildSidebarBlocks(
  cvData: ReturnType<typeof useCVData>['cvData'],
  competencyRows: Record<ProficiencyLevel, string[][]>,
  preferenceLabels: {
    workMode: string
    availability: string
    location: string
  },
): SidebarBlock[] {
  const blocks: SidebarBlock[] = []

  if (cvData.personalInfo.photo && cvData.personalInfoVisibility.photo) {
    blocks.push({ id: 'side-photo', type: 'photo' })
  }

  const contactItems: Array<{ value: string; kind: ContactKind }> = []
  if (cvData.personalInfoVisibility.email && cvData.personalInfo.email) {
    contactItems.push({ value: cvData.personalInfo.email, kind: 'email' })
  }
  if (cvData.personalInfoVisibility.phone && cvData.personalInfo.phone) {
    contactItems.push({ value: cvData.personalInfo.phone, kind: 'phone' })
  }
  if (cvData.personalInfoVisibility.location && cvData.personalInfo.location) {
    contactItems.push({ value: cvData.personalInfo.location, kind: 'location' })
  }
  if (cvData.personalInfoVisibility.linkedin && cvData.personalInfo.linkedin) {
    contactItems.push({ value: cvData.personalInfo.linkedin, kind: 'linkedin' })
  }
  if (cvData.personalInfoVisibility.website && cvData.personalInfo.website) {
    contactItems.push({ value: cvData.personalInfo.website, kind: 'website' })
  }

  if (contactItems.length > 0) {
    blocks.push({ id: 'side-contact-title', type: 'contact-title' })
    contactItems.forEach((item, index) => {
      const kind: ContactKind = item.kind
      blocks.push({
        id: `side-contact-${index}`,
        type: 'contact-item',
        value: item.value,
        href: undefined,
        kind,
      })
    })
  }

  const hasCompetencies =
    cvData.sectionVisibility.competencies &&
    (cvData.competencies.expert.some((comp) => comp.visible && comp.name.trim()) ||
      cvData.competencies.advanced.some((comp) => comp.visible && comp.name.trim()) ||
      cvData.competencies.proficient.some((comp) => comp.visible && comp.name.trim()))

  if (hasCompetencies) {
    blocks.push({ id: 'side-competencies-title', type: 'competencies-title' })
    ;(['expert', 'advanced', 'proficient'] as ProficiencyLevel[]).forEach((level) => {
      const list = cvData.competencies[level].filter((comp) => comp.visible && comp.name.trim())
      if (list.length === 0) return
      blocks.push({ id: `side-competency-level-${level}`, type: 'competency-level-title', level })
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

  const visibleLanguages = cvData.languages.filter((item) => item.visible && item.name.trim())
  if (cvData.sectionVisibility.languages && visibleLanguages.length > 0) {
    blocks.push({ id: 'side-languages-title', type: 'languages-title' })
    visibleLanguages.forEach((item, index) => {
      blocks.push({ id: `side-language-${index}`, type: 'language-item', name: item.name })
    })
  }

  const visibleOther = cvData.other.filter((item) => item.visible && item.name.trim())
  if (cvData.sectionVisibility.other && visibleOther.length > 0) {
    blocks.push({ id: 'side-other-title', type: 'other-title' })
    visibleOther.forEach((item, index) => {
      blocks.push({ id: `side-other-${index}`, type: 'other-item', name: item.name })
    })
  }

  const visibleCertifications = cvData.certifications.filter(
    (item) => item.visible && item.name.trim()
  )
  if (cvData.sectionVisibility.certifications && visibleCertifications.length > 0) {
    blocks.push({ id: 'side-certifications-title', type: 'certifications-title' })
    visibleCertifications.forEach((item, index) => {
      blocks.push({
        id: `side-certification-${index}`,
        type: 'certification-item',
        name: item.name,
      })
    })
  }

  const visiblePortfolio = cvData.portfolio.filter((item) => item.visible && item.name.trim())
  if (cvData.sectionVisibility.portfolio && visiblePortfolio.length > 0) {
    blocks.push({ id: 'side-portfolio-title', type: 'portfolio-title' })
    visiblePortfolio.forEach((item, index) => {
      blocks.push({ id: `side-portfolio-${index}`, type: 'portfolio-item', name: item.name })
    })
  }

  const preferenceItems = [
    { id: 'workmode', label: preferenceLabels.workMode, field: cvData.preferences.workMode },
    { id: 'availability', label: preferenceLabels.availability, field: cvData.preferences.availability },
    {
      id: 'location',
      label: preferenceLabels.location,
      field: cvData.preferences.locationPreference,
    },
  ].filter((item) => item.field.visible && item.field.value)

  if (cvData.sectionVisibility.preferences && preferenceItems.length > 0) {
    blocks.push({ id: 'side-preferences-title', type: 'preferences-title' })
    preferenceItems.forEach((item) => {
      blocks.push({
        id: `side-preferences-${item.id}`,
        type: 'preference-item',
        name: `${item.label}: ${item.field.value}`,
      })
    })
  }

  return blocks
}

function getPxPerMm(): number {
  const probe = document.createElement('div')
  probe.style.width = '1mm'
  probe.style.position = 'absolute'
  probe.style.left = '-9999px'
  document.body.appendChild(probe)
  const px = probe.getBoundingClientRect().width
  document.body.removeChild(probe)
  return px || 3.78
}

function getBlockHeight(el: HTMLElement): number {
  const rect = el.getBoundingClientRect()
  const style = window.getComputedStyle(el)
  const marginTop = parseFloat(style.marginTop) || 0
  const marginBottom = parseFloat(style.marginBottom) || 0
  return rect.height + marginTop + marginBottom
}

function measureChipRows(names: string[], width: number): string[][] {
  if (typeof document === 'undefined' || width <= 0) {
    return names.map((name) => [name])
  }

  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.visibility = 'hidden'
  container.style.width = `${width}px`
  container.className = 'flex flex-wrap gap-1.5'

  names.forEach((name) => {
    const chip = document.createElement('span')
    chip.className =
      'whitespace-nowrap rounded-full bg-gray-100 px-2 py-0.5 text-[9.5px] text-gray-700'
    chip.textContent = name
    container.appendChild(chip)
  })

  document.body.appendChild(container)

  const rows: string[][] = []
  let currentTop: number | null = null
  let row: string[] = []
  const children = Array.from(container.children) as HTMLElement[]

  children.forEach((child, index) => {
    const top = child.offsetTop
    if (currentTop === null || Math.abs(top - currentTop) <= 1) {
      currentTop = currentTop ?? top
      row.push(names[index])
    } else {
      rows.push(row)
      row = [names[index]]
      currentTop = top
    }
  })

  if (row.length > 0) rows.push(row)
  container.remove()

  return rows.length > 0 ? rows : names.map((name) => [name])
}

function rowsEqual(
  a: Record<ProficiencyLevel, string[][]>,
  b: Record<ProficiencyLevel, string[][]>
): boolean {
  const levels: ProficiencyLevel[] = ['expert', 'advanced', 'proficient']
  return levels.every((level) => {
    const rowsA = a[level]
    const rowsB = b[level]
    if (rowsA.length !== rowsB.length) return false
    return rowsA.every((row, rowIndex) => {
      const otherRow = rowsB[rowIndex]
      if (!otherRow || row.length !== otherRow.length) return false
      return row.every((name, idx) => name === otherRow[idx])
    })
  })
}

function focusEditorSection(section: EditorSectionId) {
  if (typeof window === 'undefined') return
  const detail: PreviewFocusSectionDetail = { section }
  window.dispatchEvent(new CustomEvent(PREVIEW_FOCUS_SECTION_EVENT, { detail }))
}

function paginateBlocks(
  blocks: MainBlock[],
  heights: Map<string, number>,
  maxHeight: number
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
    if (block.type === 'experience-item' || block.type === 'experience-title') return 'experience'
    if (block.type === 'education-item' || block.type === 'education-title') return 'education'
    return null
  }

  const getHeight = (block: MainBlock) => {
    const direct = heights.get(block.id)
    if (direct !== undefined) return direct
    if (block.type === 'experience-title') return titleHeights.experience
    if (block.type === 'education-title') return titleHeights.education
    return 0
  }

  const makeRepeatedTitle = (section: 'experience' | 'education', index: number): MainBlock => ({
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

function paginateSidebarBlocks(
  blocks: SidebarBlock[],
  heights: Map<string, number>,
  maxHeight: number
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

  const makeRepeatedLevel = (level: ProficiencyLevel, pageIndex: number): SidebarBlock => ({
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
          current.push({ id: `side-languages-title-repeat-${pages.length}`, type: 'languages-title' })
          used += languagesTitleHeight
        }
      }

      if (seenOtherTitle && block.type === 'other-item') {
        if (otherTitleHeight > 0 && used + otherTitleHeight <= maxHeight) {
          current.push({ id: `side-other-title-repeat-${pages.length}`, type: 'other-title' })
          used += otherTitleHeight
        }
      }

      if (seenCertificationsTitle && block.type === 'certification-item') {
        if (certificationsTitleHeight > 0 && used + certificationsTitleHeight <= maxHeight) {
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

export function Preview() {
  const { cvData } = useCVData()
  const cvLanguage = cvData.localization.cvLanguage
  const sectionTitleOverrides = cvData.localization.sectionTitleOverrides[cvLanguage] ?? {}
  const blocks = useMemo(() => buildBlocks(cvData), [cvData])
  const [pages, setPages] = useState<MainBlock[][]>([])
  const [sidebarPages, setSidebarPages] = useState<SidebarBlock[][]>([])
  const [competencyRows, setCompetencyRows] = useState<Record<ProficiencyLevel, string[][]>>({
    expert: [],
    advanced: [],
    proficient: [],
  })
  const preferenceLabels = useMemo(
    () => ({
      workMode: getPreferenceLabelText(cvLanguage, 'workMode'),
      availability: getPreferenceLabelText(cvLanguage, 'availability'),
      location: getPreferenceLabelText(cvLanguage, 'location'),
    }),
    [cvLanguage],
  )
  const sidebarBlocks = useMemo(
    () => buildSidebarBlocks(cvData, competencyRows, preferenceLabels),
    [cvData, competencyRows, preferenceLabels]
  )
  const measureRef = useRef<HTMLDivElement>(null)
  const pxPerMmRef = useRef<number | null>(null)
  const resolvePreviewSectionTitle = (section: EditorSectionId) =>
    getPreviewSectionTitle(cvLanguage, section, sectionTitleOverrides)
  const resolveCompetencyLevelTitle = (level: ProficiencyLevel) =>
    getCompetencyLevelText(cvLanguage, level)
  const emptyPreviewText = getPreviewEmptyStateText(cvLanguage)

  useLayoutEffect(() => {
    if (!measureRef.current) return

    if (!pxPerMmRef.current) {
      pxPerMmRef.current = getPxPerMm()
    }

    const maxHeight =
      (PAGE_HEIGHT_MM - PAGE_MARGIN_MM * 2) * (pxPerMmRef.current || 1)
    const sidebarMaxHeight =
      maxHeight - SIDEBAR_SAFE_BOTTOM_MM * (pxPerMmRef.current || 1)

    const heights = new Map<string, number>()
    const blockEls = measureRef.current.querySelectorAll<HTMLElement>('[data-block-id]')
    blockEls.forEach((el) => {
      const id = el.dataset.blockId
      if (id) {
        heights.set(id, getBlockHeight(el))
      }
    })

    const sidebarContent = measureRef.current.querySelector<HTMLElement>('[data-sidebar-content]')
    const sidebarWidth = sidebarContent?.getBoundingClientRect().width || 0
    if (sidebarWidth > 0 && cvData.sectionVisibility.competencies) {
      const nextRows: Record<ProficiencyLevel, string[][]> = {
        expert: measureChipRows(
          cvData.competencies.expert.filter((comp) => comp.visible).map((comp) => comp.name),
          sidebarWidth
        ),
        advanced: measureChipRows(
          cvData.competencies.advanced.filter((comp) => comp.visible).map((comp) => comp.name),
          sidebarWidth
        ),
        proficient: measureChipRows(
          cvData.competencies.proficient.filter((comp) => comp.visible).map((comp) => comp.name),
          sidebarWidth
        ),
      }
      if (!rowsEqual(nextRows, competencyRows)) {
        setCompetencyRows(nextRows)
      }
    }

    setPages(paginateBlocks(blocks, heights, maxHeight))
    setSidebarPages(paginateSidebarBlocks(sidebarBlocks, heights, sidebarMaxHeight))
  }, [blocks, sidebarBlocks, cvData, competencyRows])

  const mainPages = pages.length > 0 ? pages : [blocks]
  const sidePages = sidebarPages.length > 0 ? sidebarPages : [sidebarBlocks]
  const pageCount = Math.max(mainPages.length, sidePages.length)

  const handlePreviewClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>(
      '[data-editor-section-target]',
    )
    if (!target) return
    const section = target.dataset.editorSectionTarget as EditorSectionId | undefined
    if (!section) return
    focusEditorSection(section)
  }

  return (
    <div className="preview-pages" onClick={handlePreviewClick}>
      {Array.from({ length: pageCount }).map((_, pageIndex) => (
        <div key={pageIndex} className="preview-page relative">
          <div className="preview-page-inner">
            <div className="flex h-full">
              <Sidebar
                blocks={sidePages[pageIndex] || []}
                resolveSectionTitle={resolvePreviewSectionTitle}
                resolveCompetencyLevelTitle={resolveCompetencyLevelTitle}
              />
              <MainContent
                blocks={mainPages[pageIndex] || []}
                resolveSectionTitle={resolvePreviewSectionTitle}
                emptyStateText={emptyPreviewText}
              />
            </div>
          </div>
          <div className="absolute bottom-3 right-4 text-[10px] text-gray-400">
            {pageIndex + 1}
          </div>
        </div>
      ))}

      <div
        ref={measureRef}
        className="fixed left-0 top-0 pointer-events-none"
        style={{ visibility: 'hidden', left: '-9999px' }}
        aria-hidden="true"
      >
        <div className="preview-page">
          <div className="preview-page-inner">
            <div className="flex h-full">
              <div className="cv-sidebar cv-sidebar-bleed w-[30%] border-r border-gray-200 bg-gray-50/70">
                <div className="space-y-4" data-sidebar-content>
                  {sidebarBlocks.map((block) =>
                    renderSidebarBlock(
                      block,
                      resolvePreviewSectionTitle,
                      resolveCompetencyLevelTitle,
                    ),
                  )}
                </div>
              </div>
              <div className="w-[70%] px-6 text-[10.5px] text-gray-700">
                <div className="space-y-4">
                  {blocks.map((block) =>
                    renderBlock(block, resolvePreviewSectionTitle, emptyPreviewText),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Sidebar({
  blocks,
  resolveSectionTitle,
  resolveCompetencyLevelTitle,
}: {
  blocks: SidebarBlock[]
  resolveSectionTitle: (section: EditorSectionId) => string
  resolveCompetencyLevelTitle: (level: ProficiencyLevel) => string
}) {
  return (
    <div className="cv-sidebar cv-sidebar-bleed w-[30%] border-r border-gray-200 bg-gray-50/70">
      <div className="space-y-4">
        {blocks.map((block) =>
          renderSidebarBlock(block, resolveSectionTitle, resolveCompetencyLevelTitle),
        )}
      </div>
    </div>
  )
}

function MainContent({
  blocks,
  resolveSectionTitle,
  emptyStateText,
}: {
  blocks: MainBlock[]
  resolveSectionTitle: (section: EditorSectionId) => string
  emptyStateText: string
}) {
  return (
    <div className="w-[70%] px-6 text-[10.5px] text-gray-700">
      <div className="space-y-4">
        {blocks.map((block) => renderBlock(block, resolveSectionTitle, emptyStateText))}
      </div>
    </div>
  )
}

function renderSidebarBlock(
  block: SidebarBlock,
  resolveSectionTitle: (section: EditorSectionId) => string,
  resolveCompetencyLevelTitle: (level: ProficiencyLevel) => string,
) {
  switch (block.type) {
    case 'photo':
      return <SidebarPhoto key={block.id} block={block} />
    case 'contact-title':
      return (
        <div key={block.id} data-block-id={block.id} data-editor-section-target="personalInfo">
          <h2 className="mb-2 border-b border-gray-200 pb-1 text-[11px] font-semibold uppercase leading-tight tracking-[0.14em] text-gray-700">
            {resolveSectionTitle('personalInfo')}
          </h2>
        </div>
      )
    case 'contact-item':
      return <SidebarContactItem key={block.id} block={block} />
    case 'competencies-title':
      return (
        <div key={block.id} data-block-id={block.id} data-editor-section-target="competencies">
          <h2 className="mb-2 border-b border-gray-200 pb-1 text-[11px] font-semibold uppercase leading-tight tracking-[0.14em] text-gray-700">
            {resolveSectionTitle('competencies')}
          </h2>
        </div>
      )
    case 'competency-level-title':
      return (
        <div key={block.id} data-block-id={block.id} data-editor-section-target="competencies">
          <h3 className="mb-1 text-xs font-semibold text-gray-900">
            {resolveCompetencyLevelTitle(block.level)}
          </h3>
        </div>
      )
    case 'competency-row':
      return <SidebarCompetencyRow key={block.id} block={block} />
    case 'languages-title':
      return (
        <div key={block.id} data-block-id={block.id} data-editor-section-target="languages">
          <h2 className="mb-2 border-b border-gray-200 pb-1 text-[11px] font-semibold uppercase leading-tight tracking-[0.14em] text-gray-700">
            {resolveSectionTitle('languages')}
          </h2>
        </div>
      )
    case 'language-item':
      return <SidebarSimpleItem key={block.id} block={block} />
    case 'other-title':
      return (
        <div key={block.id} data-block-id={block.id} data-editor-section-target="other">
          <h2 className="mb-2 border-b border-gray-200 pb-1 text-[11px] font-semibold uppercase leading-tight tracking-[0.14em] text-gray-700">
            {resolveSectionTitle('other')}
          </h2>
        </div>
      )
    case 'other-item':
      return <SidebarSimpleItem key={block.id} block={block} />
    case 'certifications-title':
      return (
        <div key={block.id} data-block-id={block.id} data-editor-section-target="certifications">
          <h2 className="mb-2 border-b border-gray-200 pb-1 text-[11px] font-semibold uppercase leading-tight tracking-[0.14em] text-gray-700">
            {resolveSectionTitle('certifications')}
          </h2>
        </div>
      )
    case 'certification-item':
      return <SidebarSimpleItem key={block.id} block={block} />
    case 'portfolio-title':
      return (
        <div key={block.id} data-block-id={block.id} data-editor-section-target="portfolio">
          <h2 className="mb-2 border-b border-gray-200 pb-1 text-[11px] font-semibold uppercase leading-tight tracking-[0.14em] text-gray-700">
            {resolveSectionTitle('portfolio')}
          </h2>
        </div>
      )
    case 'portfolio-item':
      return <SidebarSimpleItem key={block.id} block={block} />
    case 'preferences-title':
      return (
        <div key={block.id} data-block-id={block.id} data-editor-section-target="preferences">
          <h2 className="mb-2 border-b border-gray-200 pb-1 text-[11px] font-semibold uppercase leading-tight tracking-[0.14em] text-gray-700">
            {resolveSectionTitle('preferences')}
          </h2>
        </div>
      )
    case 'preference-item':
      return <SidebarSimpleItem key={block.id} block={block} />
    default:
      return null
  }
}

function SidebarPhoto({ block }: { block: Extract<SidebarBlock, { type: 'photo' }> }) {
  const { cvData } = useCVData()
  const { t } = useI18n()
  if (!cvData.personalInfo.photo || !cvData.personalInfoVisibility.photo) return null
  return (
    <div
      data-block-id={block.id}
      data-editor-section-target="personalInfo"
      className="flex justify-center"
    >
      <img
        src={cvData.personalInfo.photo}
        alt={cvData.personalInfo.name || t('forms.personalInfo.profileAlt')}
        className="h-20 w-20 rounded-full object-cover ring-2 ring-white shadow-sm"
      />
    </div>
  )
}

function SidebarContactItem({
  block,
}: {
  block: Extract<SidebarBlock, { type: 'contact-item' }>
}) {
  const icon = {
    email: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 6h16v12H4z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 7l8 6 8-6"
        />
      </svg>
    ),
    phone: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M5 7c0 6.075 4.925 11 11 11l2-2-3.5-3.5-2.5 1.5A8.5 8.5 0 017.5 8.5L9 6 5 7z"
        />
      </svg>
    ),
    location: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 21s7-7.5 7-12a7 7 0 10-14 0c0 4.5 7 12 7 12z"
        />
        <circle cx="12" cy="9" r="2.5" strokeWidth={1.5} />
      </svg>
    ),
    linkedin: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 9v9" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 6h.01" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M10 9v9m0-5c0-2 3-2 3 0v5m0-7h2"
        />
      </svg>
    ),
    website: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="9" strokeWidth={1.5} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12h18" />
      </svg>
    ),
  }[block.kind]

  return (
    <div
      data-block-id={block.id}
      data-editor-section-target="personalInfo"
      className="-mt-0.5 flex items-center gap-2 text-[10.5px] text-gray-700"
    >
      <span className="text-gray-400">{icon}</span>
      {block.value}
    </div>
  )
}

function SidebarCompetencyRow({
  block,
}: {
  block: Extract<SidebarBlock, { type: 'competency-row' }>
}) {
  return (
    <div
      data-block-id={block.id}
      data-editor-section-target="competencies"
      className="-mt-2 flex flex-nowrap gap-1.5"
    >
      {block.names.map((name, index) => (
        <span
          key={`${name}-${index}`}
          className="cv-chip whitespace-nowrap rounded-full bg-gray-100 px-2 py-0.5 text-[9.5px] text-gray-700"
        >
          {name}
        </span>
      ))}
    </div>
  )
}

function SidebarSimpleItem({
  block,
}: {
  block: Extract<
    SidebarBlock,
    { type: 'language-item' | 'other-item' | 'certification-item' | 'portfolio-item' | 'preference-item' }
  >
}) {
  const sectionTarget =
    block.type === 'language-item'
      ? 'languages'
      : block.type === 'other-item'
        ? 'other'
        : block.type === 'certification-item'
          ? 'certifications'
          : block.type === 'portfolio-item'
            ? 'portfolio'
            : 'preferences'

  return (
    <div
      data-block-id={block.id}
      data-editor-section-target={sectionTarget}
      className="-mt-1 flex items-start text-[10.5px] text-gray-700"
    >
      <span>{block.name}</span>
    </div>
  )
}

function renderBlock(
  block: MainBlock,
  resolveSectionTitle: (section: EditorSectionId) => string,
  emptyStateText: string,
) {
  switch (block.type) {
    case 'header':
      return <HeaderBlock key={block.id} />
    case 'statement':
      return <StatementBlock key={block.id} />
    case 'experience-title':
      return (
        <div key={block.id} data-block-id={block.id} data-editor-section-target="experiences">
          <h2 className="mb-2 border-b border-gray-200 pb-1 text-[11px] font-semibold uppercase leading-tight tracking-[0.14em] text-gray-700">
            {resolveSectionTitle('experiences')}
          </h2>
        </div>
      )
    case 'experience-item':
      return <ExperienceBlock key={block.id} block={block} />
    case 'education-title':
      return (
        <div key={block.id} data-block-id={block.id} data-editor-section-target="education">
          <h2 className="mb-2 border-b border-gray-200 pb-1 text-[11px] font-semibold uppercase leading-tight tracking-[0.14em] text-gray-700">
            {resolveSectionTitle('education')}
          </h2>
        </div>
      )
    case 'education-item':
      return <EducationBlock key={block.id} block={block} />
    case 'empty':
      return (
        <div key={block.id} data-block-id={block.id}>
          <div className="py-12 text-center text-sm text-gray-400">
            {emptyStateText}
          </div>
        </div>
      )
    default:
      return null
  }
}

function HeaderBlock() {
  const { cvData } = useCVData()
  const { personalInfo } = cvData

  const showName = cvData.personalInfoVisibility.name && personalInfo.name
  const showTitle =
    cvData.personalInfoVisibility.professionalTitle && personalInfo.professionalTitle

  if (!showName && !showTitle) {
    return <div data-block-id="header" data-editor-section-target="personalInfo" />
  }

  return (
    <div data-block-id="header" data-editor-section-target="personalInfo">
      <div className="border-b border-gray-300 pb-2">
        {showName && <h1 className="text-[22px] font-semibold text-gray-900">{showName}</h1>}
        {showTitle && (
          <p className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-gray-500">
            {showTitle}
          </p>
        )}
      </div>
    </div>
  )
}

function StatementBlock() {
  const { cvData } = useCVData()
  if (!cvData.professionalStatement) return null

  return (
    <div data-block-id="statement" data-editor-section-target="professionalStatement">
      <p className="text-[10.5px] leading-snug text-gray-700">
        {cvData.professionalStatement}
      </p>
    </div>
  )
}

function ExperienceBlock({
  block,
}: {
  block: Extract<MainBlock, { type: 'experience-item' }>
}) {
  const { cvData } = useCVData()
  const { t } = useI18n()
  const exp = block.item
  const dateText = formatDateRangeWithDuration(
    exp.startDate,
    exp.endDate,
    cvData.localization.cvLanguage,
  )
  const showCompany = exp.company?.trim()
  const showTitle = exp.title?.trim()
  const showDescription = exp.description?.trim()
  const visibleTags = exp.tags.filter((tag) => tag.visible && tag.name.trim())
  const hasDetails = Boolean(showCompany || showTitle || showDescription || visibleTags.length || dateText)
  const typeLabel =
    exp.type === 'assignment'
      ? t('forms.experience.typeAssignment')
      : exp.type === 'employment'
        ? t('forms.experience.typeEmployment')
        : exp.type === 'custom'
          ? exp.customType?.trim() || t('forms.experience.typeCustom')
          : ''
  return (
    <div
      data-block-id={block.id}
      data-editor-section-target="experiences"
      className="page-break-inside-avoid border-b border-gray-100 pb-2 last:border-b-0 last:pb-0"
    >
      {typeLabel && hasDetails && (
        <p className="mb-1 text-[9px] uppercase tracking-[0.2em] text-gray-400">
          {typeLabel}
        </p>
      )}
      {(showCompany || dateText) && (
        <div className="flex items-baseline justify-between">
          {showCompany ? (
            <h3 className="mb-0.5 text-xs font-semibold text-gray-900">{showCompany}</h3>
          ) : (
            <span />
          )}
          {dateText ? <span className="text-[10px] text-gray-500">{dateText}</span> : null}
        </div>
      )}
      {showTitle ? <p className="text-[10.5px] font-medium text-gray-800">{showTitle}</p> : null}
      {showDescription && (
        <p className="mt-0.5 text-[10px] leading-snug text-gray-600">{exp.description}</p>
      )}
      {visibleTags.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-0.5">
          {visibleTags.map((tag) => (
            <span
              key={tag.id}
              className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[9px] text-gray-600"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function EducationBlock({
  block,
}: {
  block: Extract<MainBlock, { type: 'education-item' }>
}) {
  const edu = block.item
  const startYear = edu.startYear ?? null
  const endYear = edu.endYear ?? null
  const yearRange = startYear && endYear
    ? `${startYear} - ${endYear}`
    : startYear
      ? `${startYear}`
      : endYear
        ? `${endYear}`
        : ''
  const showInstitution = edu.institution?.trim()
  const showDegree = edu.degree?.trim()
  const showDescription = edu.description?.trim()
  const visibleTags = edu.tags.filter((tag) => tag.visible && tag.name.trim())

  return (
    <div
      data-block-id={block.id}
      data-editor-section-target="education"
      className="page-break-inside-avoid border-b border-gray-100 pb-2 last:border-b-0 last:pb-0"
    >
      {(showInstitution || yearRange) && (
        <div className="flex items-baseline justify-between">
          {showInstitution ? (
            <h3 className="text-xs font-semibold text-gray-900">{showInstitution}</h3>
          ) : (
            <span />
          )}
          {yearRange ? <span className="text-[10px] text-gray-600">{yearRange}</span> : null}
        </div>
      )}
      {showDegree ? <p className="text-[10px] text-gray-700">{showDegree}</p> : null}
      {showDescription && (
        <p className="mt-0.5 text-[10px] leading-snug text-gray-600">{edu.description}</p>
      )}
      {visibleTags.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-0.5">
          {visibleTags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[9px] text-gray-600"
              >
                {tag.name}
              </span>
            ))}
        </div>
      )}
    </div>
  )
}
