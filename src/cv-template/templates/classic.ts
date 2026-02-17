import type { CVTemplate } from '../types'

export const classicTemplate: CVTemplate = {
  id: 'classic',
  name: 'Classic',
  description: 'Clean two-column layout with sidebar',

  tokens: {
    fontFamily: 'Helvetica',

    fontSize: {
      name: 22,
      professionalTitle: 11,
      sectionTitle: 11,
      body: 10.5,
      small: 10,
      chip: 9.5,
      tag: 9,
      competencyLevelTitle: 12,
      pageNumber: 10,
      contactInline: 9,
    },

    fontWeight: {
      name: 'semibold',
      sectionTitle: 'semibold',
      companyName: 'semibold',
      institution: 'semibold',
    },

    letterSpacing: {
      professionalTitle: 0.18,
      sectionTitle: 0.14,
    },

    textTransform: {
      professionalTitle: 'uppercase',
      sectionTitle: 'uppercase',
    },

    lineHeight: {
      body: 1.4,
      small: 1.3,
    },

    colors: {
      text: {
        primary: '#101828',
        secondary: '#344054',
        tertiary: '#475467',
        muted: '#667085',
        faint: '#98A2B3',
      },
      border: {
        section: '#EAECF0',
        item: '#F2F4F7',
        separator: '#D0D5DD',
      },
      background: {
        page: '#ffffff',
        sidebar: 'rgba(249,250,251,0.7)',
        chip: '#F2F4F7',
        tag: '#F2F4F7',
        headerZone: 'transparent',
      },
      accent: 'none',
    },

    spacing: {
      pageMargin: 15,
      sectionGap: 4.2,
      sectionTitleMarginBottom: 2,
      itemGap: 1.5,
      chipGap: 1.5,
      tagGap: 0.5,
      headerZonePaddingBottom: 0,
    },

    sectionTitle: {
      hasBorderBottom: true,
      style: 'uppercase-border',
    },

    chip: {
      borderRadius: 'full',
      hasBorder: false,
      hasBackground: true,
    },

    photo: {
      shape: 'circle',
      sizeMm: 20,
      hasShadow: true,
      hasRing: true,
    },

    experienceItem: {
      hasBorderBottom: true,
      layout: 'inline',
    },

    contactItem: {
      showIcons: true,
      layout: 'vertical',
    },

    competencies: {
      layout: 'chips',
    },
  },

  layout: {
    pageWidthMm: 210,
    pageHeightMm: 297,
    mode: 'two-column',
    sidebarWidthPercent: 30,
    sidebarPosition: 'left',
    sidebarSafeBottomMm: 12,
    showSidebarBorder: true,
    showSidebarBackground: true,
    sidebarSections: [
      'personalInfo',
      'competencies',
      'languages',
      'other',
      'certifications',
      'portfolio',
      'preferences',
    ],
    mainSections: ['professionalStatement', 'experiences', 'education'],
    headerSections: [],
    contentSections: [],
  },
}
