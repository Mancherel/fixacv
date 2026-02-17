import { StyleSheet, Font } from '@react-pdf/renderer'
import type { CVDesignTokens, CVLayoutConfig } from '../cv-template/types'

// ---------------------------------------------------------------------------
// Disable automatic word hyphenation — keeps words intact
// ---------------------------------------------------------------------------

Font.registerHyphenationCallback((word) => [word])

// ---------------------------------------------------------------------------
// Unit helpers
// ---------------------------------------------------------------------------

/** 1 mm ≈ 2.8346 pt (PostScript points) */
const MM_TO_PT = 2.8346

export function mmToPt(mm: number): number {
  return mm * MM_TO_PT
}

/** Map token font weight to a numeric value react-pdf understands */
function resolveWeight(w: 'bold' | 'semibold' | 'normal'): number {
  if (w === 'bold') return 700
  if (w === 'semibold') return 600
  return 400
}

/** Map chip borderRadius token to pt value */
function resolveChipRadius(r: 'full' | 'sm' | 'none'): number {
  if (r === 'full') return 999
  if (r === 'sm') return 3
  return 0
}

// ---------------------------------------------------------------------------
// Build the full StyleSheet from template tokens + layout
// ---------------------------------------------------------------------------

export function buildPdfStyles(tokens: CVDesignTokens, layout: CVLayoutConfig) {
  const pm = mmToPt(tokens.spacing.pageMargin)
  const gutter = mmToPt(tokens.spacing.sectionGap)

  // react-pdf uses content-box: padding is added OUTSIDE width.
  // We use `flex` to let flexbox allocate widths correctly, then
  // apply padding inside each column.
  // Sidebar gets `flex: sidebarPercent`, main gets `flex: mainPercent`.

  return StyleSheet.create({
    // --- Page -------------------------------------------------------------- //
    page: {
      fontFamily: tokens.fontFamily,
      backgroundColor: tokens.colors.background.page,
      color: tokens.colors.text.secondary,
      fontSize: tokens.fontSize.body,
      lineHeight: tokens.lineHeight.body,
      flexDirection: 'row',
    },

    // --- Two-column structure --------------------------------------------- //
    // Using flex-grow ratios to split the page correctly.
    // Sidebar: 30 / Main: 70 (or whatever the template specifies).
    // Padding is applied inside each column. Because flex-basis is 0
    // and flex-grow distributes the full page width, padding is taken
    // from each column's allocated space — behaving like border-box.
    sidebar: {
      flex: layout.sidebarWidthPercent,
      paddingTop: pm,
      paddingBottom: pm,
      paddingLeft: pm * 0.7,
      paddingRight: gutter * 0.75,
      backgroundColor: layout.showSidebarBackground
        ? tokens.colors.background.sidebar
        : 'transparent',
      ...(layout.showSidebarBorder
        ? { borderRightWidth: 0.5, borderRightColor: tokens.colors.border.section }
        : {}),
    },

    mainColumn: {
      flex: 100 - layout.sidebarWidthPercent,
      paddingTop: pm,
      paddingBottom: pm,
      paddingLeft: gutter * 1.5,
      paddingRight: pm,
    },

    // --- Section titles --------------------------------------------------- //
    sectionTitle: {
      fontSize: tokens.fontSize.sectionTitle,
      fontWeight: resolveWeight(tokens.fontWeight.sectionTitle),
      textTransform: tokens.textTransform.sectionTitle,
      letterSpacing: tokens.letterSpacing.sectionTitle,
      color: tokens.colors.text.secondary,
      ...(tokens.sectionTitle.hasBorderBottom
        ? {
            borderBottomWidth: 0.5,
            borderBottomColor: tokens.colors.border.section,
            paddingBottom: mmToPt(0.8),
          }
        : {}),
      marginBottom: mmToPt(tokens.spacing.sectionTitleMarginBottom),
    },

    // --- Header ----------------------------------------------------------- //
    nameText: {
      fontSize: tokens.fontSize.name,
      fontWeight: resolveWeight(tokens.fontWeight.name),
      color: tokens.colors.text.primary,
      lineHeight: 1.15,
    },

    professionalTitle: {
      fontSize: tokens.fontSize.professionalTitle,
      textTransform: tokens.textTransform.professionalTitle,
      letterSpacing: tokens.letterSpacing.professionalTitle,
      color: tokens.colors.text.muted,
      marginTop: 1,
    },

    // --- Statement -------------------------------------------------------- //
    statement: {
      fontSize: tokens.fontSize.body,
      lineHeight: tokens.lineHeight.small,
      color: tokens.colors.text.secondary,
    },

    // --- Photo ------------------------------------------------------------ //
    photo: {
      width: mmToPt(tokens.photo.sizeMm),
      height: mmToPt(tokens.photo.sizeMm),
      borderRadius: tokens.photo.shape === 'circle'
        ? mmToPt(tokens.photo.sizeMm) / 2
        : tokens.photo.shape === 'rounded'
          ? 4
          : 0,
      objectFit: 'cover' as const,
      alignSelf: 'center' as const,
    },

    // --- Contact items ---------------------------------------------------- //
    contactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },

    contactText: {
      fontSize: tokens.fontSize.body,
      color: tokens.colors.text.secondary,
    },

    contactIcon: {
      width: 10,
      height: 10,
      color: tokens.colors.text.faint,
    },

    // --- Competency chips ------------------------------------------------- //
    competencyLevelTitle: {
      fontSize: tokens.fontSize.competencyLevelTitle,
      fontWeight: resolveWeight('semibold'),
      color: tokens.colors.text.primary,
      marginBottom: 2,
      marginTop: 1,
    },

    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: mmToPt(tokens.spacing.chipGap),
    },

    chip: {
      fontSize: tokens.fontSize.chip,
      color: tokens.colors.text.secondary,
      backgroundColor: tokens.chip.hasBackground
        ? tokens.colors.background.chip
        : 'transparent',
      borderRadius: resolveChipRadius(tokens.chip.borderRadius),
      ...(tokens.chip.hasBorder
        ? { borderWidth: 0.5, borderColor: tokens.colors.border.section }
        : {}),
      paddingHorizontal: 5,
      paddingVertical: 1.5,
    },

    // --- Simple list items (languages, certs, etc.) ----------------------- //
    simpleItem: {
      fontSize: tokens.fontSize.body,
      color: tokens.colors.text.secondary,
      lineHeight: 1.5,
    },

    // --- Experience ------------------------------------------------------- //
    experienceContainer: {
      ...(tokens.experienceItem.hasBorderBottom
        ? {
            borderBottomWidth: 0.5,
            borderBottomColor: tokens.colors.border.item,
            paddingBottom: mmToPt(1.5),
          }
        : {}),
      marginBottom: mmToPt(tokens.spacing.itemGap),
    },

    experienceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      gap: 6,
    },

    experienceCompanyRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      flex: 1,
    },

    companyName: {
      fontSize: tokens.fontSize.small,
      fontWeight: resolveWeight(tokens.fontWeight.companyName),
      color: tokens.colors.text.primary,
      lineHeight: 1.3,
      flex: 1,
    },

    dotSeparator: {
      fontSize: tokens.fontSize.small,
      color: tokens.colors.border.separator,
    },

    typeBadge: {
      fontSize: tokens.fontSize.small,
      color: tokens.colors.text.muted,
      lineHeight: 1,
    },

    dateText: {
      fontSize: tokens.fontSize.small,
      color: tokens.colors.text.muted,
      lineHeight: 1,
      textAlign: 'right' as const,
    },

    jobTitle: {
      fontSize: tokens.fontSize.small,
      color: tokens.colors.text.secondary,
      marginTop: 1,
    },

    jobTitleBold: {
      fontWeight: 500,
      color: tokens.colors.text.primary,
    },

    descriptionText: {
      fontSize: tokens.fontSize.small,
      lineHeight: tokens.lineHeight.small,
      color: tokens.colors.text.tertiary,
      marginTop: 1,
    },

    tagRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: mmToPt(tokens.spacing.tagGap),
      marginTop: 2,
    },

    tag: {
      fontSize: tokens.fontSize.tag,
      color: tokens.colors.text.tertiary,
      backgroundColor: tokens.colors.background.tag,
      borderRadius: resolveChipRadius(tokens.chip.borderRadius),
      paddingHorizontal: 4,
      paddingVertical: 1.5,
    },

    // --- Education -------------------------------------------------------- //
    educationContainer: {
      ...(tokens.experienceItem.hasBorderBottom
        ? {
            borderBottomWidth: 0.5,
            borderBottomColor: tokens.colors.border.item,
            paddingBottom: mmToPt(2),
          }
        : {}),
      marginBottom: mmToPt(tokens.spacing.itemGap),
    },

    educationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
    },

    institutionName: {
      fontSize: tokens.fontSize.small,
      fontWeight: resolveWeight(tokens.fontWeight.institution),
      color: tokens.colors.text.primary,
    },

    yearRange: {
      fontSize: tokens.fontSize.small,
      color: tokens.colors.text.tertiary,
    },

    degreeName: {
      fontSize: tokens.fontSize.small,
      color: tokens.colors.text.secondary,
    },

    // --- Page number ------------------------------------------------------ //
    pageNumber: {
      position: 'absolute',
      bottom: mmToPt(3),
      right: pm,
      fontSize: tokens.fontSize.pageNumber,
      color: tokens.colors.text.faint,
    },

    // --- Utility ---------------------------------------------------------- //
    sectionGap: {
      height: mmToPt(tokens.spacing.sectionGap),
    },

    // --- Empty state ------------------------------------------------------ //
    emptyState: {
      paddingVertical: mmToPt(12),
      textAlign: 'center',
      fontSize: tokens.fontSize.body + 2,
      color: tokens.colors.text.faint,
    },
  })
}

export type PdfStyles = ReturnType<typeof buildPdfStyles>
