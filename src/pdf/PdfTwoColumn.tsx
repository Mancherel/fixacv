import { Page, View, Text } from '@react-pdf/renderer'
import type { MainBlock, SidebarBlock } from '../cv-template/blocks'
import type { CVData, ProficiencyLevel } from '../types/cv'
import type { PdfStyles } from './pdfStyles'
import { PdfSidebar } from './PdfSidebar'
import { PdfMainContent } from './PdfMainContent'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PdfTwoColumnProps {
  mainBlocks: MainBlock[]
  sidebarBlocks: SidebarBlock[]
  styles: PdfStyles
  cvData: CVData
  resolveSectionTitle: (section: string) => string
  resolveCompetencyLevel: (level: ProficiencyLevel) => string
  resolveExperienceType: (type: string, customType?: string) => string
  emptyStateText: string
}

// ---------------------------------------------------------------------------
// Component
//
// Uses react-pdf's `wrap` mode — a single <Page wrap> with a flex row.
// The sidebar and main column are flex children. react-pdf handles automatic
// page breaks. The sidebar background/border extends to all pages, matching
// the HTML preview behaviour.
// ---------------------------------------------------------------------------

export function PdfTwoColumn({
  mainBlocks,
  sidebarBlocks,
  styles,
  cvData,
  resolveSectionTitle,
  resolveCompetencyLevel,
  resolveExperienceType,
  emptyStateText,
}: PdfTwoColumnProps) {
  return (
    <Page size="A4" style={styles.page} wrap>
      {/* Sidebar column */}
      <View style={styles.sidebar}>
        <PdfSidebar
          blocks={sidebarBlocks}
          styles={styles}
          cvData={cvData}
          resolveSectionTitle={resolveSectionTitle}
          resolveCompetencyLevel={resolveCompetencyLevel}
        />
      </View>

      {/* Main column */}
      <View style={styles.mainColumn}>
        <PdfMainContent
          blocks={mainBlocks}
          styles={styles}
          cvData={cvData}
          resolveSectionTitle={resolveSectionTitle}
          resolveExperienceType={resolveExperienceType}
          emptyStateText={emptyStateText}
        />
      </View>

      {/* Page number */}
      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) =>
          totalPages > 1 ? `${pageNumber}` : ''
        }
        fixed
      />
    </Page>
  )
}
