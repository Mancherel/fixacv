import { View, Text } from '@react-pdf/renderer'
import type { MainBlock } from '../cv-template/blocks'
import type { PdfStyles } from './pdfStyles'
import type { CVData } from '../types/cv'
import type { AppLanguage } from '../types/cv'
import { formatDateRangeWithDuration } from '../utils/dateUtils'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PdfMainContentProps {
  blocks: MainBlock[]
  styles: PdfStyles
  cvData: CVData
  resolveSectionTitle: (section: string) => string
  resolveExperienceType: (type: string, customType?: string) => string
  emptyStateText: string
}

// ---------------------------------------------------------------------------
// Component — renders all main blocks (without a wrapper View so the caller
// can control the container and padding).
// ---------------------------------------------------------------------------

export function PdfMainContent({
  blocks,
  styles,
  cvData,
  resolveSectionTitle,
  resolveExperienceType,
  emptyStateText,
}: PdfMainContentProps) {
  return (
    <>
      {blocks.map((block) => (
        <PdfMainBlock
          key={block.id}
          block={block}
          styles={styles}
          cvData={cvData}
          resolveSectionTitle={resolveSectionTitle}
          resolveExperienceType={resolveExperienceType}
          emptyStateText={emptyStateText}
        />
      ))}
    </>
  )
}

// ---------------------------------------------------------------------------
// Block dispatcher
// ---------------------------------------------------------------------------

function PdfMainBlock({
  block,
  styles,
  cvData,
  resolveSectionTitle,
  resolveExperienceType,
  emptyStateText,
}: {
  block: MainBlock
  styles: PdfStyles
  cvData: CVData
  resolveSectionTitle: (section: string) => string
  resolveExperienceType: (type: string, customType?: string) => string
  emptyStateText: string
}) {
  switch (block.type) {
    case 'header':
      return <PdfHeader styles={styles} cvData={cvData} />

    case 'statement':
      return <PdfStatement styles={styles} text={cvData.professionalStatement} cvData={cvData} />

    case 'experience-title':
      return <PdfSectionHeading styles={styles} text={resolveSectionTitle('experiences')} />

    case 'experience-item':
      return (
        <PdfExperienceItem
          styles={styles}
          block={block}
          language={cvData.localization.cvLanguage}
          resolveExperienceType={resolveExperienceType}
        />
      )

    case 'education-title':
      return <PdfSectionHeading styles={styles} text={resolveSectionTitle('education')} />

    case 'education-item':
      return <PdfEducationItem styles={styles} block={block} />

    case 'empty':
      return <Text style={styles.emptyState}>{emptyStateText}</Text>

    default:
      return null
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function PdfSectionHeading({ styles, text }: { styles: PdfStyles; text: string }) {
  return (
    <View style={{ marginTop: 14 }} wrap={false} minPresenceAhead={40}>
      <Text style={styles.sectionTitle}>{text}</Text>
    </View>
  )
}

function PdfHeader({ styles, cvData }: { styles: PdfStyles; cvData: CVData }) {
  const { personalInfo, personalInfoVisibility } = cvData
  const showName = personalInfoVisibility.name && personalInfo.name
  const showTitle = personalInfoVisibility.professionalTitle && personalInfo.professionalTitle

  if (!showName && !showTitle) return null

  return (
    <View>
      {showName ? <Text style={styles.nameText}>{personalInfo.name}</Text> : null}
      {showTitle ? (
        <Text style={styles.professionalTitle}>{personalInfo.professionalTitle}</Text>
      ) : null}
    </View>
  )
}

function PdfStatement({
  styles,
  text,
  cvData,
}: {
  styles: PdfStyles
  text: string
  cvData: CVData
}) {
  if (!text) return null
  const hasVisibleRole =
    cvData.personalInfoVisibility.professionalTitle &&
    cvData.personalInfo.professionalTitle?.trim().length > 0

  return (
    <View style={hasVisibleRole ? { marginTop: 2 } : { marginTop: 8 }}>
      <Text style={styles.statement}>{text}</Text>
    </View>
  )
}

function PdfExperienceItem({
  styles,
  block,
  language,
  resolveExperienceType,
}: {
  styles: PdfStyles
  block: Extract<MainBlock, { type: 'experience-item' }>
  language: AppLanguage
  resolveExperienceType: (type: string, customType?: string) => string
}) {
  const exp = block.item
  const dateText = formatDateRangeWithDuration(exp.startDate, exp.endDate, language)
  const showCompany = exp.company?.trim()
  const showTitle = exp.title?.trim()
  const showDescription = exp.description?.trim()
  const visibleTags = exp.tags.filter((tag) => tag.visible && tag.name.trim())
  const typeLabel = resolveExperienceType(exp.type, exp.customType)

  return (
    <View style={styles.experienceContainer} wrap={false}>
      {(showCompany || dateText || typeLabel) ? (
        <View style={styles.experienceHeader}>
          <Text style={styles.companyName}>
            {showCompany || ''}
            {showCompany && typeLabel ? (
              <Text style={styles.dotSeparator}>{' • '}<Text style={styles.typeBadge}>{typeLabel}</Text></Text>
            ) : typeLabel ? (
              <Text style={styles.typeBadge}>{typeLabel}</Text>
            ) : null}
          </Text>
          {dateText ? <Text style={styles.dateText}>{dateText}</Text> : null}
        </View>
      ) : null}

      {showTitle ? (
        <Text style={styles.jobTitle}>
          <Text style={styles.jobTitleBold}>{showTitle}</Text>
        </Text>
      ) : null}

      {showDescription ? (
        <Text style={styles.descriptionText}>{exp.description}</Text>
      ) : null}

      {visibleTags.length > 0 ? (
        <View style={styles.tagRow}>
          {visibleTags.map((tag) => (
            <Text key={tag.id} style={styles.tag}>
              {tag.name}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  )
}

function PdfEducationItem({
  styles,
  block,
}: {
  styles: PdfStyles
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
    <View style={styles.educationContainer} wrap={false}>
      {(showInstitution || yearRange) ? (
        <View style={styles.educationHeader}>
          {showInstitution ? (
            <Text style={styles.institutionName}>{showInstitution}</Text>
          ) : (
            <Text> </Text>
          )}
          {yearRange ? <Text style={styles.yearRange}>{yearRange}</Text> : null}
        </View>
      ) : null}

      {showDegree ? <Text style={styles.degreeName}>{showDegree}</Text> : null}

      {showDescription ? (
        <Text style={styles.descriptionText}>{edu.description}</Text>
      ) : null}

      {visibleTags.length > 0 ? (
        <View style={styles.tagRow}>
          {visibleTags.map((tag) => (
            <Text key={tag.id} style={styles.tag}>
              {tag.name}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  )
}
