import type { CVSectionId } from '../types/cv'

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

export type FontWeight = 'bold' | 'semibold' | 'normal'
export type TextTransform = 'uppercase' | 'none'

// ---------------------------------------------------------------------------
// Design Tokens — every visual value that differs between templates
// ---------------------------------------------------------------------------

export interface CVDesignTokens {
  // --- Typography ------------------------------------------------------- //

  fontFamily: string // 'Helvetica' | 'Times-Roman' | …

  fontSize: {
    name: number // Classic 22, Compact 20
    professionalTitle: number // 11
    sectionTitle: number // 11
    body: number // 10.5
    small: number // 10
    chip: number // 9.5
    tag: number // 9
    competencyLevelTitle: number // 12
    pageNumber: number // 10
    contactInline: number // 9 (Compact header zone)
  }

  fontWeight: {
    name: FontWeight
    sectionTitle: FontWeight
    companyName: FontWeight
    institution: FontWeight
  }

  letterSpacing: {
    professionalTitle: number // em
    sectionTitle: number // em
  }

  textTransform: {
    professionalTitle: TextTransform
    sectionTitle: TextTransform
  }

  lineHeight: {
    body: number // 1.4
    small: number // 1.3
  }

  // --- Colors ----------------------------------------------------------- //

  colors: {
    text: {
      primary: string // gray-900
      secondary: string // gray-700
      tertiary: string // gray-600
      muted: string // gray-500
      faint: string // gray-400
    }
    border: {
      section: string // gray-200
      item: string // gray-100
      separator: string // gray-300
    }
    background: {
      page: string // #ffffff
      sidebar: string // sidebar bg or 'transparent'
      chip: string
      tag: string
      headerZone: string // Compact: subtle bg
    }
    accent: string // optional accent color, or 'none'
  }

  // --- Spacing (in mm — each renderer converts) ------------------------- //

  spacing: {
    pageMargin: number
    sectionGap: number
    sectionTitleMarginBottom: number
    itemGap: number
    chipGap: number
    tagGap: number
    headerZonePaddingBottom: number // Compact only
  }

  // --- Component Styles ------------------------------------------------- //

  sectionTitle: {
    hasBorderBottom: boolean
    style: 'uppercase-border' | 'bold-simple' | 'accent-line' | 'minimal'
  }

  chip: {
    borderRadius: 'full' | 'sm' | 'none'
    hasBorder: boolean
    hasBackground: boolean
  }

  photo: {
    shape: 'circle' | 'rounded' | 'square'
    sizeMm: number
    hasShadow: boolean
    hasRing: boolean
  }

  experienceItem: {
    hasBorderBottom: boolean
    layout: 'inline' | 'stacked'
  }

  contactItem: {
    showIcons: boolean
    layout: 'vertical' | 'horizontal'
  }

  competencies: {
    layout: 'chips' | 'inline-text'
  }
}

// ---------------------------------------------------------------------------
// Layout Config — structural (page geometry, section placement)
// ---------------------------------------------------------------------------

export interface CVLayoutConfig {
  pageWidthMm: number
  pageHeightMm: number

  /** Two-column = sidebar + main, single-column = header zone + content flow */
  mode: 'two-column' | 'single-column'

  // --- Two-column mode -------------------------------------------------- //
  sidebarWidthPercent: number
  sidebarPosition: 'left' | 'right'
  sidebarSafeBottomMm: number
  showSidebarBorder: boolean
  showSidebarBackground: boolean
  sidebarSections: CVSectionId[]
  mainSections: CVSectionId[]

  // --- Single-column mode ----------------------------------------------- //
  headerSections: CVSectionId[]
  contentSections: CVSectionId[]
}

// ---------------------------------------------------------------------------
// Template Definition
// ---------------------------------------------------------------------------

export interface CVTemplate {
  id: string
  name: string
  description: string
  tokens: CVDesignTokens
  layout: CVLayoutConfig
}
