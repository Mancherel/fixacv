/**
 * Test script: Generate a PDF from test data and save to disk.
 * Run with: npx tsx scripts/test-pdf.tsx
 */
import ReactPDF from '@react-pdf/renderer'
import { PdfDocument } from '../src/pdf/PdfDocument'
import { getTemplate } from '../src/cv-template/templates'
import type { CVData } from '../src/types/cv'

const testData: CVData = {
  personalInfo: {
    name: 'Magnus Blix',
    professionalTitle: 'Frontend + UX + Design',
    email: 'magnus.blix@basio.net',
    phone: '073 9090 100',
    website: 'https://blixen.design',
    linkedin: '',
    location: '',
    photo: '',
  },
  personalInfoVisibility: {
    name: true,
    professionalTitle: true,
    email: true,
    phone: true,
    linkedin: false,
    website: true,
    location: false,
    photo: false,
  },
  professionalStatement:
    'With a msc in engineering and a strong creative drive, I work at the intersection of technology, human interaction and aesthetics. I\'m motivated by creating technology that feels as good to use as it looks, and that is built to be clear, robust and long lasting, both in design and in code.',
  experiences: [
    {
      id: 'exp-1',
      type: 'custom' as const,
      customType: 'Founder',
      company: 'Blixen Design AB',
      title: '',
      startDate: '2018-03',
      endDate: null,
      description:
        'Helping businesses developing digital services, content creation and prototyping. Hardware, software and design.',
      tags: [
        { id: 't1', name: 'Frontend', visible: true },
        { id: 't2', name: 'Graphic Design', visible: true },
        { id: 't3', name: 'User Experience', visible: true },
        { id: 't4', name: 'Media production', visible: true },
        { id: 't5', name: 'Content creation', visible: true },
      ],
      visible: true,
    },
    {
      id: 'exp-2',
      type: 'assignment' as const,
      company: 'Marginalen Bank',
      title: 'Senior Frontend Developer / UX Designer',
      startDate: '2018-03',
      endDate: '2025-06',
      description:
        'Developing modern fintech web applications with Episerver headless and Vue.js. New external web marginalen.se and PWA Internet banking. Also Hygglig.com.',
      tags: [
        { id: 't6', name: 'Vuejs', visible: true },
        { id: 't7', name: 'Optimizely', visible: true },
        { id: 't8', name: 'TypeScript', visible: true },
        { id: 't9', name: 'Storybook', visible: true },
        { id: 't10', name: 'BankId', visible: true },
      ],
      visible: true,
    },
    {
      id: 'exp-3',
      type: 'employment' as const,
      company: 'Geeks AB',
      title: 'Senior Frontend Developer / UX / Art Director',
      startDate: '2015-09',
      endDate: '2018-06',
      description:
        'Worked mainly with migration of gaming site FZ.se to the Sweclockers.com editor platform after aquecition from Egmont. The project included new design and UI.',
      tags: [
        { id: 't11', name: 'Indesign', visible: true },
        { id: 't12', name: 'Photoshop', visible: true },
        { id: 't13', name: 'Wordpress', visible: true },
        { id: 't14', name: 'Design Systems', visible: true },
      ],
      visible: true,
    },
    {
      id: 'exp-4',
      type: 'assignment' as const,
      company: 'Tele2',
      title: 'Lead Frontend Developer and Art Director (via Knowit Experience)',
      startDate: '2014-02',
      endDate: '2015-09',
      description:
        'Tele2 introduced a new kind of subscription without bindningstid and asked for a new web and graphic profile.',
      tags: [
        { id: 't15', name: 'jQuery', visible: true },
        { id: 't16', name: 'Zurb Foundation 5', visible: true },
        { id: 't17', name: 'Responsive', visible: true },
      ],
      visible: true,
    },
    {
      id: 'exp-5',
      type: 'employment' as const,
      company: 'Knowit Reaktor Stockholm',
      title: 'Frontend Developer, Art Director and UX Specialist',
      startDate: '2010-03',
      endDate: '2015-09',
      description:
        'Consultant in the area of online services. Mainly working with Interaction Design, Graphic Design and Front-End Development.',
      tags: [],
      visible: true,
    },
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'Linköpings Universitet',
      degree: 'Master of Science in Media Technology',
      startYear: 2004,
      endYear: 2009,
      description: '',
      tags: [],
      visible: true,
    },
  ],
  competencies: {
    expert: [
      { id: 'c1', name: 'TypeScript', visible: true },
      { id: 'c2', name: 'SCSS', visible: true },
      { id: 'c3', name: 'Vuejs', visible: true },
      { id: 'c4', name: 'React', visible: true },
    ],
    advanced: [
      { id: 'c5', name: 'Design Systems', visible: true },
      { id: 'c6', name: 'Vite', visible: true },
      { id: 'c7', name: 'Storybook', visible: true },
      { id: 'c8', name: 'Figma', visible: true },
    ],
    proficient: [],
  },
  languages: [
    { id: 'l1', name: 'Swedish (native)', visible: true },
    { id: 'l2', name: 'English', visible: true },
  ],
  other: [],
  certifications: [
    { id: 'cert1', name: 'Hand sketching', visible: true },
    { id: 'cert2', name: 'Leadership in teams', visible: true },
  ],
  portfolio: [{ id: 'p1', name: 'fixacv.app', visible: true }],
  preferences: {
    workMode: { value: 'Hybrid', visible: true },
    availability: { value: '', visible: false },
    locationPreference: { value: 'Stockholm and norrort', visible: true },
  },
  sectionVisibility: {
    professionalStatement: true,
    experiences: true,
    education: true,
    competencies: true,
    languages: true,
    other: false,
    certifications: true,
    portfolio: true,
    preferences: true,
  },
  localization: {
    cvLanguage: 'en',
    sectionTitleOverrides: { en: {}, sv: {} },
  },
  selectedTemplateId: 'classic',
}

async function main() {
  const template = getTemplate('classic')
  const doc = PdfDocument({ cvData: testData, template })
  const outputPath = '/Users/magnusblix/Dev/fixacv/test-output.pdf'
  await ReactPDF.renderToFile(doc, outputPath)
  console.log(`PDF generated at: ${outputPath}`)
}

main().catch((err) => {
  console.error('Failed to generate PDF:', err)
  process.exit(1)
})
