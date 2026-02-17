import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useCVData } from '../context/CVContext'
import { formatDateRangeWithDuration } from '../utils/dateUtils'
import { useI18n } from '../i18n/useI18n'
import type { ProficiencyLevel } from '../types'
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
import type { ContentBlock, MainBlock, SidebarBlock } from '../cv-template/blocks'
import { buildMainBlocks, buildSidebarBlocks, buildContentBlocks } from '../cv-template/buildBlocks'
import { paginateMainBlocks, paginateSidebarBlocks, paginateContentBlocks } from '../cv-template/paginateBlocks'
import { getTemplate } from '../cv-template/templates'
import { getVisibleContactItems } from '../cv-template/dataUtils'


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

export function Preview() {
  const { cvData } = useCVData()
  const template = getTemplate(cvData.selectedTemplateId)

  if (template.layout.mode === 'single-column') {
    return <SingleColumnPreview />
  }

  return <TwoColumnPreview />
}

function TwoColumnPreview() {
  const { cvData } = useCVData()
  const template = getTemplate(cvData.selectedTemplateId)
  const PAGE_HEIGHT_MM = template.layout.pageHeightMm
  const PAGE_MARGIN_MM = template.tokens.spacing.pageMargin
  const SIDEBAR_SAFE_BOTTOM_MM = template.layout.sidebarSafeBottomMm
  const cvLanguage = cvData.localization.cvLanguage
  const sectionTitleOverrides = cvData.localization.sectionTitleOverrides[cvLanguage] ?? {}
  const blocks = useMemo(() => buildMainBlocks(cvData), [cvData])
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

    setPages(paginateMainBlocks(blocks, heights, maxHeight))
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

// ---------------------------------------------------------------------------
// Single-column preview (Compact template)
// ---------------------------------------------------------------------------

function SingleColumnPreview() {
  const { cvData } = useCVData()
  const template = getTemplate(cvData.selectedTemplateId)
  const PAGE_HEIGHT_MM = template.layout.pageHeightMm
  const PAGE_MARGIN_MM = template.tokens.spacing.pageMargin
  const cvLanguage = cvData.localization.cvLanguage
  const sectionTitleOverrides = cvData.localization.sectionTitleOverrides[cvLanguage] ?? {}
  const preferenceLabels = useMemo(
    () => ({
      workMode: getPreferenceLabelText(cvLanguage, 'workMode'),
      availability: getPreferenceLabelText(cvLanguage, 'availability'),
      location: getPreferenceLabelText(cvLanguage, 'location'),
    }),
    [cvLanguage],
  )
  // For single-column mode, chips are rendered as inline text — no chip row measurement needed
  const emptyRows: Record<ProficiencyLevel, string[][]> = {
    expert: [],
    advanced: [],
    proficient: [],
  }
  const contentBlocks = useMemo(
    () => buildContentBlocks(cvData, template.layout.contentSections, emptyRows, preferenceLabels),
    [cvData, template.layout.contentSections, preferenceLabels],
  )
  const [contentPages, setContentPages] = useState<ContentBlock[][]>([])
  const measureRef = useRef<HTMLDivElement>(null)
  const pxPerMmRef = useRef<number | null>(null)

  const resolvePreviewSectionTitle = (section: EditorSectionId) =>
    getPreviewSectionTitle(cvLanguage, section, sectionTitleOverrides)
  const resolveCompetencyLevelTitle = (level: ProficiencyLevel) =>
    getCompetencyLevelText(cvLanguage, level)
  const emptyPreviewText = getPreviewEmptyStateText(cvLanguage)

  // Contact items for header zone
  const contactItems = useMemo(() => getVisibleContactItems(cvData), [cvData])

  useLayoutEffect(() => {
    if (!measureRef.current) return
    if (!pxPerMmRef.current) {
      pxPerMmRef.current = getPxPerMm()
    }
    const maxHeight =
      (PAGE_HEIGHT_MM - PAGE_MARGIN_MM * 2) * (pxPerMmRef.current || 1)
    const heights = new Map<string, number>()
    const blockEls = measureRef.current.querySelectorAll<HTMLElement>('[data-block-id]')
    blockEls.forEach((el) => {
      const id = el.dataset.blockId
      if (id) {
        heights.set(id, getBlockHeight(el))
      }
    })
    setContentPages(paginateContentBlocks(contentBlocks, heights, maxHeight))
  }, [contentBlocks, cvData])

  const pages = contentPages.length > 0 ? contentPages : [contentBlocks]

  const handlePreviewClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>(
      '[data-editor-section-target]',
    )
    if (!target) return
    const section = target.dataset.editorSectionTarget as EditorSectionId | undefined
    if (!section) return
    focusEditorSection(section)
  }

  const showName = cvData.personalInfoVisibility.name && cvData.personalInfo.name
  const showTitle =
    cvData.personalInfoVisibility.professionalTitle && cvData.personalInfo.professionalTitle
  const showPhoto = cvData.personalInfo.photo && cvData.personalInfoVisibility.photo

  return (
    <div className="preview-pages" onClick={handlePreviewClick}>
      {pages.map((pageBlocks, pageIndex) => (
        <div key={pageIndex} className="preview-page relative">
          <div className="preview-page-inner">
            {/* Header zone on first page only */}
            {pageIndex === 0 && (
              <div
                className="mb-3 border-b pb-3"
                style={{
                  borderColor: template.tokens.colors.border.section,
                  backgroundColor: template.tokens.colors.background.headerZone,
                }}
                data-editor-section-target="personalInfo"
              >
                <div className="flex items-start gap-3">
                  {showPhoto && (
                    <img
                      src={cvData.personalInfo.photo}
                      alt={cvData.personalInfo.name || ''}
                      className="shrink-0 object-cover"
                      style={{
                        width: `${template.tokens.photo.sizeMm}mm`,
                        height: `${template.tokens.photo.sizeMm}mm`,
                        borderRadius:
                          template.tokens.photo.shape === 'circle' ? '50%'
                          : template.tokens.photo.shape === 'rounded' ? '4px'
                          : '0',
                      }}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    {showName && (
                      <h1
                        className="leading-tight"
                        style={{
                          fontSize: `${template.tokens.fontSize.name}px`,
                          fontWeight: template.tokens.fontWeight.name === 'bold' ? 700 : 600,
                          color: template.tokens.colors.text.primary,
                        }}
                      >
                        {cvData.personalInfo.name}
                      </h1>
                    )}
                    {showTitle && (
                      <p
                        className="mt-0.5"
                        style={{
                          fontSize: `${template.tokens.fontSize.professionalTitle}px`,
                          textTransform: template.tokens.textTransform.professionalTitle,
                          letterSpacing: `${template.tokens.letterSpacing.professionalTitle}em`,
                          color: template.tokens.colors.text.muted,
                        }}
                      >
                        {cvData.personalInfo.professionalTitle}
                      </p>
                    )}
                    {contactItems.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
                        {contactItems.map((item, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: `${template.tokens.fontSize.contactInline}px`,
                              color: template.tokens.colors.text.secondary,
                            }}
                          >
                            {item.value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {/* Content blocks */}
            <div className="space-y-3">
              {pageBlocks.map((block) =>
                renderContentBlock(
                  block,
                  resolvePreviewSectionTitle,
                  resolveCompetencyLevelTitle,
                  emptyPreviewText,
                  template,
                ),
              )}
            </div>
          </div>
          <div className="absolute bottom-3 right-4 text-[10px] text-gray-400">
            {pageIndex + 1}
          </div>
        </div>
      ))}

      {/* Hidden measurement container */}
      <div
        ref={measureRef}
        className="fixed left-0 top-0 pointer-events-none"
        style={{ visibility: 'hidden', left: '-9999px' }}
        aria-hidden="true"
      >
        <div className="preview-page">
          <div className="preview-page-inner">
            <div className="space-y-3">
              {contentBlocks.map((block) =>
                renderContentBlock(
                  block,
                  resolvePreviewSectionTitle,
                  resolveCompetencyLevelTitle,
                  emptyPreviewText,
                  template,
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Content block renderer (single-column mode — renders both Main & Sidebar blocks)
// ---------------------------------------------------------------------------

function renderContentBlock(
  block: ContentBlock,
  resolveSectionTitle: (section: EditorSectionId) => string,
  resolveCompetencyLevelTitle: (level: ProficiencyLevel) => string,
  emptyStateText: string,
  _template: import('../cv-template/types').CVTemplate,
) {
  // MainBlock types
  if (block.type === 'header' || block.type === 'statement' ||
      block.type === 'experience-title' || block.type === 'experience-item' ||
      block.type === 'education-title' || block.type === 'education-item' ||
      block.type === 'empty') {
    return renderBlock(block as MainBlock, resolveSectionTitle, emptyStateText)
  }

  // Section divider
  if (block.type === 'section-divider') {
    return <div key={block.id} data-block-id={block.id} className="my-1" />
  }

  // SidebarBlock types (rendered full-width in single-column mode)
  return renderSidebarBlock(block as SidebarBlock, resolveSectionTitle, resolveCompetencyLevelTitle)
}

// ---------------------------------------------------------------------------
// Two-column sub-components
// ---------------------------------------------------------------------------

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
      <div className="pb-0">
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
  const hasVisibleRole =
    cvData.personalInfoVisibility.professionalTitle &&
    cvData.personalInfo.professionalTitle?.trim().length > 0

  return (
    <div
      data-block-id="statement"
      data-editor-section-target="professionalStatement"
      className={hasVisibleRole ? '-mt-2' : ''}
    >
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
      className="page-break-inside-avoid border-b border-gray-100 pb-1.5 last:border-b-0 last:pb-0"
    >
      {(showCompany || dateText || typeLabel) && (
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex items-center gap-1.5">
            {showCompany ? (
              <h3 className="mb-0 text-xs font-semibold leading-tight text-gray-900">
                {showCompany}
              </h3>
            ) : null}
            {showCompany && typeLabel ? <span className="text-gray-300">•</span> : null}
            {typeLabel ? (
              <span className="text-[10px] leading-none text-gray-500">{typeLabel}</span>
            ) : null}
          </div>
          {dateText ? <span className="shrink-0 text-[10px] leading-none text-gray-500">{dateText}</span> : null}
        </div>
      )}
      {showTitle ? (
        <p className="mt-0.5 text-[10px] leading-tight text-gray-700">
          <span className="font-medium text-gray-800">{showTitle}</span>
        </p>
      ) : null}
      {showDescription && (
        <p className="mt-0.5 text-[10px] leading-snug text-gray-600">{exp.description}</p>
      )}
      {visibleTags.length > 0 && (
        <div className="mt-0.5 flex flex-wrap gap-0.5">
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
