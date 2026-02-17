import type { Education, Experience, ProficiencyLevel } from '../types/cv'

// ---------------------------------------------------------------------------
// Contact kinds (sidebar & header zone)
// ---------------------------------------------------------------------------

export type ContactKind = 'email' | 'phone' | 'location' | 'linkedin' | 'website'

// ---------------------------------------------------------------------------
// Main column blocks (two-column mode)
// ---------------------------------------------------------------------------

export type MainBlock =
  | { id: string; type: 'header' }
  | { id: string; type: 'statement' }
  | { id: string; type: 'experience-title' }
  | { id: string; type: 'experience-item'; item: Experience }
  | { id: string; type: 'education-title' }
  | { id: string; type: 'education-item'; item: Education }
  | { id: string; type: 'empty' }

// ---------------------------------------------------------------------------
// Sidebar blocks (two-column mode)
// ---------------------------------------------------------------------------

export type SidebarBlock =
  | { id: string; type: 'photo' }
  | { id: string; type: 'contact-title' }
  | { id: string; type: 'contact-item'; value: string; href?: string; kind: ContactKind }
  | { id: string; type: 'competencies-title' }
  | { id: string; type: 'competency-level-title'; level: ProficiencyLevel }
  | { id: string; type: 'competency-row'; level: ProficiencyLevel; names: string[] }
  | { id: string; type: 'languages-title' }
  | { id: string; type: 'language-item'; name: string }
  | { id: string; type: 'other-title' }
  | { id: string; type: 'other-item'; name: string }
  | { id: string; type: 'certifications-title' }
  | { id: string; type: 'certification-item'; name: string }
  | { id: string; type: 'portfolio-title' }
  | { id: string; type: 'portfolio-item'; name: string }
  | { id: string; type: 'preferences-title' }
  | { id: string; type: 'preference-item'; name: string }

// ---------------------------------------------------------------------------
// Content blocks (single-column mode — unified stream)
// ---------------------------------------------------------------------------

export type ContentBlock =
  | MainBlock
  | SidebarBlock
  | { id: string; type: 'section-divider' }
