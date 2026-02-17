import { Document } from '@react-pdf/renderer'
import type { CVData, ProficiencyLevel } from '../types/cv'
import type { CVTemplate } from '../cv-template/types'
import { buildMainBlocks, buildSidebarBlocks, buildContentBlocks } from '../cv-template/buildBlocks'
import {
  getPreviewSectionTitle,
  getCompetencyLevelText,
  getPreferenceLabelText,
  getPreviewEmptyStateText,
  getUIText,
} from '../i18n'
import { buildPdfStyles } from './pdfStyles'
import { PdfTwoColumn } from './PdfTwoColumn'
import { PdfSingleColumn } from './PdfSingleColumn'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PdfDocumentProps {
  cvData: CVData
  template: CVTemplate
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PdfDocument({ cvData, template }: PdfDocumentProps) {
  const { tokens, layout } = template
  const language = cvData.localization.cvLanguage
  const sectionTitleOverrides =
    cvData.localization.sectionTitleOverrides[language] ?? {}

  // Shared style sheet built from tokens
  const styles = buildPdfStyles(tokens, layout)

  const preferenceLabels = {
    workMode: getPreferenceLabelText(language, 'workMode'),
    availability: getPreferenceLabelText(language, 'availability'),
    location: getPreferenceLabelText(language, 'location'),
  }

  // For PDF, each competency name becomes its own chip (no DOM measurement)
  const competencyRows: Record<ProficiencyLevel, string[][]> = {
    expert: cvData.competencies.expert
      .filter((c) => c.visible && c.name.trim())
      .map((c) => [c.name]),
    advanced: cvData.competencies.advanced
      .filter((c) => c.visible && c.name.trim())
      .map((c) => [c.name]),
    proficient: cvData.competencies.proficient
      .filter((c) => c.visible && c.name.trim())
      .map((c) => [c.name]),
  }

  // Resolvers
  const resolveSectionTitle = (section: string) =>
    getPreviewSectionTitle(
      language,
      section as Parameters<typeof getPreviewSectionTitle>[1],
      sectionTitleOverrides,
    )

  const resolveCompetencyLevel = (level: ProficiencyLevel) =>
    getCompetencyLevelText(language, level)

  const resolveExperienceType = (type: string, customType?: string): string => {
    if (type === 'assignment') return getUIText(language, 'forms.experience.typeAssignment')
    if (type === 'employment') return getUIText(language, 'forms.experience.typeEmployment')
    if (type === 'custom') return customType?.trim() || getUIText(language, 'forms.experience.typeCustom')
    return ''
  }

  const emptyStateText = getPreviewEmptyStateText(language)

  // Branch on layout mode
  if (layout.mode === 'single-column') {
    const contentBlocks = buildContentBlocks(
      cvData,
      layout.contentSections,
      competencyRows,
      preferenceLabels,
    )

    return (
      <Document>
        <PdfSingleColumn
          contentBlocks={contentBlocks}
          styles={styles}
          cvData={cvData}
          template={template}
          resolveSectionTitle={resolveSectionTitle}
          resolveCompetencyLevel={resolveCompetencyLevel}
          resolveExperienceType={resolveExperienceType}
          emptyStateText={emptyStateText}
        />
      </Document>
    )
  }

  // Two-column mode (Classic, Executive)
  const mainBlocks = buildMainBlocks(cvData)
  const sidebarBlocks = buildSidebarBlocks(cvData, competencyRows, preferenceLabels)

  return (
    <Document>
      <PdfTwoColumn
        mainBlocks={mainBlocks}
        sidebarBlocks={sidebarBlocks}
        styles={styles}
        cvData={cvData}
        resolveSectionTitle={resolveSectionTitle}
        resolveCompetencyLevel={resolveCompetencyLevel}
        resolveExperienceType={resolveExperienceType}
        emptyStateText={emptyStateText}
      />
    </Document>
  )
}
