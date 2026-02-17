import type { CVTemplate } from '../types'

export const compactTemplate: CVTemplate = {
  id: 'compact',
  name: 'Compact',
  description: 'Dense single-column layout, no sidebar',

  tokens: {
    fontFamily: 'Helvetica',

    fontSize: {
      name: 20,
      professionalTitle: 10,
      sectionTitle: 10.5,
      body: 9.5,
      small: 9,
      chip: 8.5,
      tag: 8.5,
      competencyLevelTitle: 10,
      pageNumber: 9,
      contactInline: 9,
    },

    fontWeight: {
      name: 'bold',
      sectionTitle: 'semibold',
      companyName: 'semibold',
      institution: 'semibold',
    },

    letterSpacing: {
      professionalTitle: 0.1,
      sectionTitle: 0.08,
    },

    textTransform: {
      professionalTitle: 'uppercase',
      sectionTitle: 'uppercase',
    },

    lineHeight: {
      body: 1.35,
      small: 1.25,
    },

    colors: {
      text: {
        primary: '#111111',
        secondary: '#333333',
        tertiary: '#444444',
        muted: '#666666',
        faint: '#999999',
      },
      border: {
        section: '#dddddd',
        item: '#eeeeee',
        separator: '#cccccc',
      },
      background: {
        page: '#ffffff',
        sidebar: 'transparent',
        chip: 'transparent',
        tag: 'transparent',
        headerZone: '#f7f7f7',
      },
      accent: 'none',
    },

    spacing: {
      pageMargin: 12,
      sectionGap: 3,
      sectionTitleMarginBottom: 1.5,
      itemGap: 1,
      chipGap: 0.8,
      tagGap: 0.3,
      headerZonePaddingBottom: 4,
    },

    sectionTitle: {
      hasBorderBottom: true,
      style: 'minimal',
    },

    chip: {
      borderRadius: 'none',
      hasBorder: false,
      hasBackground: false,
    },

    photo: {
      shape: 'square',
      sizeMm: 12,
      hasShadow: false,
      hasRing: false,
    },

    experienceItem: {
      hasBorderBottom: true,
      layout: 'inline',
    },

    contactItem: {
      showIcons: true,
      layout: 'horizontal',
    },

    competencies: {
      layout: 'inline-text',
    },
  },

  layout: {
    pageWidthMm: 210,
    pageHeightMm: 297,
    mode: 'single-column',
    sidebarWidthPercent: 0,
    sidebarPosition: 'left',
    sidebarSafeBottomMm: 0,
    showSidebarBorder: false,
    showSidebarBackground: false,
    sidebarSections: [],
    mainSections: [],
    headerSections: ['personalInfo'],
    contentSections: [
      'professionalStatement',
      'competencies',
      'experiences',
      'education',
      'languages',
      'certifications',
      'portfolio',
      'other',
      'preferences',
    ],
  },
}
