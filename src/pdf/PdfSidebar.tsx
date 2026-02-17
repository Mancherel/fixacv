import { View, Text, Image } from '@react-pdf/renderer'
import type { SidebarBlock } from '../cv-template/blocks'
import type { PdfStyles } from './pdfStyles'
import type { CVData, ProficiencyLevel } from '../types/cv'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PdfSidebarProps {
  blocks: SidebarBlock[]
  styles: PdfStyles
  cvData: CVData
  resolveSectionTitle: (section: string) => string
  resolveCompetencyLevel: (level: ProficiencyLevel) => string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PdfSidebar({
  blocks,
  styles,
  cvData,
  resolveSectionTitle,
  resolveCompetencyLevel,
}: PdfSidebarProps) {
  return (
    <View style={styles.sidebar}>
      {blocks.map((block, index) => (
        <PdfSidebarBlock
          key={block.id}
          block={block}
          styles={styles}
          cvData={cvData}
          resolveSectionTitle={resolveSectionTitle}
          resolveCompetencyLevel={resolveCompetencyLevel}
          isFirst={index === 0}
        />
      ))}
    </View>
  )
}

// ---------------------------------------------------------------------------
// Block dispatcher
// ---------------------------------------------------------------------------

function PdfSidebarBlock({
  block,
  styles,
  cvData,
  resolveSectionTitle,
  resolveCompetencyLevel,
  isFirst,
}: {
  block: SidebarBlock
  styles: PdfStyles
  cvData: CVData
  resolveSectionTitle: (section: string) => string
  resolveCompetencyLevel: (level: ProficiencyLevel) => string
  isFirst: boolean
}) {
  switch (block.type) {
    case 'photo':
      return <PdfPhoto styles={styles} photo={cvData.personalInfo.photo} />

    case 'contact-title':
      return (
        <PdfSectionTitle
          styles={styles}
          text={resolveSectionTitle('personalInfo')}
          isFirst={isFirst}
        />
      )

    case 'contact-item':
      return (
        <View style={styles.contactRow}>
          <Text style={styles.contactText}>{block.value}</Text>
        </View>
      )

    case 'competencies-title':
      return (
        <PdfSectionTitle
          styles={styles}
          text={resolveSectionTitle('competencies')}
          isFirst={isFirst}
        />
      )

    case 'competency-level-title':
      return <Text style={styles.competencyLevelTitle}>{resolveCompetencyLevel(block.level)}</Text>

    case 'competency-row':
      return (
        <View style={styles.chipRow}>
          {block.names.map((name, i) => (
            <Text key={`${name}-${i}`} style={styles.chip}>
              {name}
            </Text>
          ))}
        </View>
      )

    case 'languages-title':
      return (
        <PdfSectionTitle
          styles={styles}
          text={resolveSectionTitle('languages')}
          isFirst={isFirst}
        />
      )

    case 'language-item':
      return <Text style={styles.simpleItem}>{block.name}</Text>

    case 'other-title':
      return (
        <PdfSectionTitle
          styles={styles}
          text={resolveSectionTitle('other')}
          isFirst={isFirst}
        />
      )

    case 'other-item':
      return <Text style={styles.simpleItem}>{block.name}</Text>

    case 'certifications-title':
      return (
        <PdfSectionTitle
          styles={styles}
          text={resolveSectionTitle('certifications')}
          isFirst={isFirst}
        />
      )

    case 'certification-item':
      return <Text style={styles.simpleItem}>{block.name}</Text>

    case 'portfolio-title':
      return (
        <PdfSectionTitle
          styles={styles}
          text={resolveSectionTitle('portfolio')}
          isFirst={isFirst}
        />
      )

    case 'portfolio-item':
      return <Text style={styles.simpleItem}>{block.name}</Text>

    case 'preferences-title':
      return (
        <PdfSectionTitle
          styles={styles}
          text={resolveSectionTitle('preferences')}
          isFirst={isFirst}
        />
      )

    case 'preference-item':
      return <Text style={styles.simpleItem}>{block.name}</Text>

    default:
      return null
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/**
 * Section title in sidebar. The first section title gets no top margin
 * (photo or first block), subsequent ones get 14pt to match HTML space-y-4.
 */
function PdfSectionTitle({
  styles,
  text,
  isFirst,
}: {
  styles: PdfStyles
  text: string
  isFirst: boolean
}) {
  return (
    <View style={{ marginTop: isFirst ? 0 : 14 }}>
      <Text style={styles.sectionTitle}>{text}</Text>
    </View>
  )
}

function PdfPhoto({ styles, photo }: { styles: PdfStyles; photo?: string }) {
  if (!photo) return null
  return (
    <View style={{ alignItems: 'center', marginBottom: 4 }}>
      <Image src={photo} style={styles.photo} />
    </View>
  )
}
