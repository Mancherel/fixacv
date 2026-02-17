// Types
export type {
  CVDesignTokens,
  CVLayoutConfig,
  CVTemplate,
  FontWeight,
  TextTransform,
} from './types'

// Block types
export type { ContactKind, ContentBlock, MainBlock, SidebarBlock } from './blocks'

// Block building
export { buildContentBlocks, buildMainBlocks, buildSidebarBlocks } from './buildBlocks'

// Pagination
export {
  paginateContentBlocks,
  paginateMainBlocks,
  paginateSidebarBlocks,
} from './paginateBlocks'

// Data utilities
export {
  getVisibleCompetencies,
  getVisibleContactItems,
  getVisibleEducation,
  getVisibleExperiences,
  getVisibleListItems,
  getVisiblePreferences,
  hasEducationContent,
  hasExperienceContent,
  hasVisibleCompetencies,
} from './dataUtils'
export type { ContactItem, PreferenceDisplay } from './dataUtils'

// Templates
export { getTemplate, templates } from './templates'
export { classicTemplate } from './templates/classic'
export { compactTemplate } from './templates/compact'
export { executiveTemplate } from './templates/executive'
