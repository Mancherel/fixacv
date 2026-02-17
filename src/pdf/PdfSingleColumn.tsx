import { Page, View, Text, Image } from '@react-pdf/renderer'
import type { ContentBlock, MainBlock, SidebarBlock } from '../cv-template/blocks'
import type { CVData, ProficiencyLevel } from '../types/cv'
import type { CVTemplate } from '../cv-template/types'
import type { PdfStyles } from './pdfStyles'
import { mmToPt } from './pdfStyles'
import { formatDateRangeWithDuration } from '../utils/dateUtils'
import { getVisibleContactItems, type ContactItem } from '../cv-template/dataUtils'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PdfSingleColumnProps {
  contentBlocks: ContentBlock[]
  styles: PdfStyles
  cvData: CVData
  template: CVTemplate
  resolveSectionTitle: (section: string) => string
  resolveCompetencyLevel: (level: ProficiencyLevel) => string
  resolveExperienceType: (type: string, customType?: string) => string
  emptyStateText: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PdfSingleColumn({
  contentBlocks,
  styles,
  cvData,
  template,
  resolveSectionTitle,
  resolveCompetencyLevel,
  resolveExperienceType,
  emptyStateText,
}: PdfSingleColumnProps) {
  const { tokens } = template
  const { personalInfo, personalInfoVisibility } = cvData
  const showName = personalInfoVisibility.name && personalInfo.name
  const showTitle = personalInfoVisibility.professionalTitle && personalInfo.professionalTitle
  const showPhoto = personalInfo.photo && personalInfoVisibility.photo
  const contactItems = getVisibleContactItems(cvData)
  const pm = mmToPt(tokens.spacing.pageMargin)

  return (
    <Page
      size="A4"
      style={{
        ...styles.page,
        flexDirection: 'column',
        paddingTop: pm,
        paddingBottom: pm,
        paddingLeft: pm,
        paddingRight: pm,
      }}
      wrap
    >
      {/* Header zone */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 8,
          paddingBottom: mmToPt(tokens.spacing.headerZonePaddingBottom),
          borderBottomWidth: 0.5,
          borderBottomColor: tokens.colors.border.section,
          marginBottom: mmToPt(tokens.spacing.sectionGap),
          backgroundColor: tokens.colors.background.headerZone,
        }}
        fixed
      >
        {showPhoto && (
          <Image
            src={personalInfo.photo!}
            style={{
              width: mmToPt(tokens.photo.sizeMm),
              height: mmToPt(tokens.photo.sizeMm),
              borderRadius:
                tokens.photo.shape === 'circle'
                  ? mmToPt(tokens.photo.sizeMm) / 2
                  : tokens.photo.shape === 'rounded'
                    ? 4
                    : 0,
              objectFit: 'cover',
            }}
          />
        )}
        <View style={{ flex: 1 }}>
          {showName && <Text style={styles.nameText}>{personalInfo.name}</Text>}
          {showTitle && (
            <Text style={styles.professionalTitle}>{personalInfo.professionalTitle}</Text>
          )}
          {contactItems.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 3 }}>
              {contactItems.map((item: ContactItem, i: number) => (
                <Text
                  key={i}
                  style={{ fontSize: tokens.fontSize.contactInline, color: tokens.colors.text.secondary }}
                >
                  {item.value}
                </Text>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Content flow */}
      {contentBlocks.map((block) => (
        <PdfContentBlockRenderer
          key={block.id}
          block={block}
          styles={styles}
          cvData={cvData}
          template={template}
          resolveSectionTitle={resolveSectionTitle}
          resolveCompetencyLevel={resolveCompetencyLevel}
          resolveExperienceType={resolveExperienceType}
          emptyStateText={emptyStateText}
        />
      ))}

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

// ---------------------------------------------------------------------------
// Content block renderer (dispatches to Main or Sidebar renderers)
// ---------------------------------------------------------------------------

function PdfContentBlockRenderer({
  block,
  styles,
  cvData,
  template,
  resolveSectionTitle,
  resolveCompetencyLevel,
  resolveExperienceType,
  emptyStateText,
}: {
  block: ContentBlock
  styles: PdfStyles
  cvData: CVData
  template: CVTemplate
  resolveSectionTitle: (section: string) => string
  resolveCompetencyLevel: (level: ProficiencyLevel) => string
  resolveExperienceType: (type: string, customType?: string) => string
  emptyStateText: string
}) {
  const language = cvData.localization.cvLanguage

  switch (block.type) {
    // Section divider
    case 'section-divider':
      return <View style={{ height: mmToPt(template.tokens.spacing.sectionGap) }} />

    // Main content blocks
    case 'header':
      return null // Header is rendered in the fixed header zone
    case 'statement':
      if (!cvData.professionalStatement) return null
      return <Text style={styles.statement}>{cvData.professionalStatement}</Text>
    case 'experience-title':
      return (
        <View style={{ marginTop: 4 }} wrap={false} minPresenceAhead={40}>
          <Text style={styles.sectionTitle}>{resolveSectionTitle('experiences')}</Text>
        </View>
      )
    case 'experience-item': {
      const exp = (block as Extract<MainBlock, { type: 'experience-item' }>).item
      const dateText = formatDateRangeWithDuration(exp.startDate, exp.endDate, language)
      const typeLabel = resolveExperienceType(exp.type, exp.customType)
      const visibleTags = exp.tags.filter((t) => t.visible && t.name.trim())
      return (
        <View style={styles.experienceContainer} wrap={false}>
          {(exp.company?.trim() || dateText || typeLabel) ? (
            <View style={styles.experienceHeader}>
              <Text style={styles.companyName}>
                {exp.company?.trim() || ''}
                {exp.company?.trim() && typeLabel ? (
                  <Text style={styles.dotSeparator}>{' • '}<Text style={styles.typeBadge}>{typeLabel}</Text></Text>
                ) : typeLabel ? (
                  <Text style={styles.typeBadge}>{typeLabel}</Text>
                ) : null}
              </Text>
              {dateText ? <Text style={styles.dateText}>{dateText}</Text> : null}
            </View>
          ) : null}
          {exp.title?.trim() ? (
            <Text style={styles.jobTitle}>
              <Text style={styles.jobTitleBold}>{exp.title}</Text>
            </Text>
          ) : null}
          {exp.description?.trim() ? <Text style={styles.descriptionText}>{exp.description}</Text> : null}
          {visibleTags.length > 0 ? (
            <View style={styles.tagRow}>
              {visibleTags.map((tag) => <Text key={tag.id} style={styles.tag}>{tag.name}</Text>)}
            </View>
          ) : null}
        </View>
      )
    }
    case 'education-title':
      return (
        <View style={{ marginTop: 4 }} wrap={false} minPresenceAhead={40}>
          <Text style={styles.sectionTitle}>{resolveSectionTitle('education')}</Text>
        </View>
      )
    case 'education-item': {
      const edu = (block as Extract<MainBlock, { type: 'education-item' }>).item
      const yearRange = edu.startYear && edu.endYear
        ? `${edu.startYear} - ${edu.endYear}`
        : edu.startYear ? `${edu.startYear}` : edu.endYear ? `${edu.endYear}` : ''
      const visibleTags = edu.tags.filter((t) => t.visible && t.name.trim())
      return (
        <View style={styles.educationContainer} wrap={false}>
          {(edu.institution?.trim() || yearRange) ? (
            <View style={styles.educationHeader}>
              {edu.institution?.trim() ? <Text style={styles.institutionName}>{edu.institution}</Text> : <Text> </Text>}
              {yearRange ? <Text style={styles.yearRange}>{yearRange}</Text> : null}
            </View>
          ) : null}
          {edu.degree?.trim() ? <Text style={styles.degreeName}>{edu.degree}</Text> : null}
          {edu.description?.trim() ? <Text style={styles.descriptionText}>{edu.description}</Text> : null}
          {visibleTags.length > 0 ? (
            <View style={styles.tagRow}>
              {visibleTags.map((tag) => <Text key={tag.id} style={styles.tag}>{tag.name}</Text>)}
            </View>
          ) : null}
        </View>
      )
    }
    case 'empty':
      return <Text style={styles.emptyState}>{emptyStateText}</Text>

    // Sidebar blocks (rendered full-width in single column)
    case 'competencies-title':
      return (
        <View style={{ marginTop: 4 }} wrap={false} minPresenceAhead={20}>
          <Text style={styles.sectionTitle}>{resolveSectionTitle('competencies')}</Text>
        </View>
      )
    case 'competency-level-title':
      return <Text style={styles.competencyLevelTitle}>{resolveCompetencyLevel((block as Extract<import('../cv-template/blocks').SidebarBlock, { type: 'competency-level-title' }>).level)}</Text>
    case 'competency-row': {
      const row = block as Extract<import('../cv-template/blocks').SidebarBlock, { type: 'competency-row' }>
      return (
        <View style={styles.chipRow}>
          {row.names.map((name, i) => <Text key={`${name}-${i}`} style={styles.chip}>{name}</Text>)}
        </View>
      )
    }
    case 'languages-title':
      return (
        <View style={{ marginTop: 4 }} wrap={false} minPresenceAhead={20}>
          <Text style={styles.sectionTitle}>{resolveSectionTitle('languages')}</Text>
        </View>
      )
    case 'language-item':
      return <Text style={styles.simpleItem}>{(block as Extract<SidebarBlock, { type: 'language-item' }>).name}</Text>
    case 'other-title':
      return (
        <View style={{ marginTop: 4 }} wrap={false} minPresenceAhead={20}>
          <Text style={styles.sectionTitle}>{resolveSectionTitle('other')}</Text>
        </View>
      )
    case 'other-item':
      return <Text style={styles.simpleItem}>{(block as Extract<SidebarBlock, { type: 'other-item' }>).name}</Text>
    case 'certifications-title':
      return (
        <View style={{ marginTop: 4 }} wrap={false} minPresenceAhead={20}>
          <Text style={styles.sectionTitle}>{resolveSectionTitle('certifications')}</Text>
        </View>
      )
    case 'certification-item':
      return <Text style={styles.simpleItem}>{(block as Extract<SidebarBlock, { type: 'certification-item' }>).name}</Text>
    case 'portfolio-title':
      return (
        <View style={{ marginTop: 4 }} wrap={false} minPresenceAhead={20}>
          <Text style={styles.sectionTitle}>{resolveSectionTitle('portfolio')}</Text>
        </View>
      )
    case 'portfolio-item':
      return <Text style={styles.simpleItem}>{(block as Extract<SidebarBlock, { type: 'portfolio-item' }>).name}</Text>
    case 'preferences-title':
      return (
        <View style={{ marginTop: 4 }} wrap={false} minPresenceAhead={20}>
          <Text style={styles.sectionTitle}>{resolveSectionTitle('preferences')}</Text>
        </View>
      )
    case 'preference-item':
      return <Text style={styles.simpleItem}>{(block as Extract<SidebarBlock, { type: 'preference-item' }>).name}</Text>

    // Contact & photo are handled in the header zone, skip here
    case 'contact-title':
    case 'contact-item':
    case 'photo':
      return null

    default:
      return null
  }
}
