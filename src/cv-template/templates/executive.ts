import type { CVTemplate } from '../types'

export const executiveTemplate: CVTemplate = {
  id: 'executive',
  name: 'Executive',
  description: 'Traditional serif style with formal layout',

  tokens: {
    fontFamily: 'Times-Roman',

    fontSize: {
      name: 24,
      professionalTitle: 11,
      sectionTitle: 12,
      body: 10.5,
      small: 10,
      chip: 9,
      tag: 9,
      competencyLevelTitle: 11,
      pageNumber: 10,
      contactInline: 9,
    },

    fontWeight: {
      name: 'bold',
      sectionTitle: 'bold',
      companyName: 'bold',
      institution: 'bold',
    },

    letterSpacing: {
      professionalTitle: 0.06,
      sectionTitle: 0,
    },

    textTransform: {
      professionalTitle: 'none',
      sectionTitle: 'none',
    },

    lineHeight: {
      body: 1.5,
      small: 1.35,
    },

    colors: {
      text: {
        primary: '#1a1a1a',
        secondary: '#333333',
        tertiary: '#4a4a4a',
        muted: '#666666',
        faint: '#999999',
      },
      border: {
        section: '#cccccc',
        item: '#e5e5e5',
        separator: '#bbbbbb',
      },
      background: {
        page: '#ffffff',
        sidebar: '#f8f6f3',
        chip: '#f0ede8',
        tag: '#f0ede8',
        headerZone: 'transparent',
      },
      accent: '#2c2c2c',
    },

    spacing: {
      pageMargin: 15,
      sectionGap: 4.5,
      sectionTitleMarginBottom: 2.5,
      itemGap: 2,
      chipGap: 1.5,
      tagGap: 0.5,
      headerZonePaddingBottom: 0,
    },

    sectionTitle: {
      hasBorderBottom: false,
      style: 'bold-simple',
    },

    chip: {
      borderRadius: 'sm',
      hasBorder: true,
      hasBackground: true,
    },

    photo: {
      shape: 'square',
      sizeMm: 22,
      hasShadow: true,
      hasRing: false,
    },

    experienceItem: {
      hasBorderBottom: true,
      layout: 'stacked',
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
