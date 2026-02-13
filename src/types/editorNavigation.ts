import type { CVSectionId } from './cv'

export type EditorSectionId = CVSectionId

export interface PreviewFocusSectionDetail {
  section: EditorSectionId
}

export const PREVIEW_FOCUS_SECTION_EVENT = 'preview:focus-section'
