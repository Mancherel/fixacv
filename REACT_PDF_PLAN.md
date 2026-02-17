# React-pdf + Multi-Template Implementation Plan

> Branch: `feat/react-pdf`
> Replaces `window.print()` with `@react-pdf/renderer` and introduces a
> shared template system so the HTML preview and PDF export are driven by
> **one source of truth**. Designed from day one to support multiple
> selectable CV styles.

---

## 1. Background

The current "Export PDF" button calls `window.print()`. This is fragile:

- iOS Safari renders print incorrectly (margins, blank pages, clipping)
- The complex Layout structure requires `print-reset` CSS hacks
- Output differs across browsers

Additionally, all styling lives directly in `Preview.tsx` as Tailwind
classes. Adding a second visual style means duplicating 1200+ lines of
rendering code.

**Goals:**

1. Replace `window.print()` with `@react-pdf/renderer`
2. Extract a shared template descriptor so Preview (HTML) and PDF read the
   same design tokens
3. Architecture supports N templates selectable by the user

---

## 2. Architecture Overview

```
                     CVData (from CVContext)
                            |
               +------------+------------+
               |                         |
      dataUtils (shared)         Template (classic/executive/compact)
      buildBlocks(cvData)                |
               |                   tokens + layout
               |                         |
               +--------+--------+      |
                        |         |      |
                   layout.mode?   |      |
                  /           \   |      |
          two-column    single-column    |
          /        \         |           |
     sidebar    main    headerZone       |
     blocks    blocks   + contentFlow    |
                  \         /            |
                   \       /             |
               +----+-----+----+        |
               |               |        |
         HTML Renderer    PDF Renderer   |
         (Preview.tsx)  (PdfDocument.tsx) |
               |               |        |
         inline styles    StyleSheet  <--+
         from tokens      from tokens
```

**Key insight:** A template is a **data object** (colors, sizes, spacing,
layout mode), not a component tree. Both renderers consume the same
template, but the `layout.mode` field tells them **which page structure**
to use:
- `two-column`: sidebar + main (Classic, Executive)
- `single-column`: header zone + vertical content flow (Compact)

---

## 3. The Three Templates

### Template 1: "Classic" (current design)

The existing two-column layout. Clean, modern sans-serif.

- **Font:** Helvetica (sans-serif)
- **Layout:** Two columns — 30% sidebar left, 70% main right
- **Photo:** Circle, ring + shadow
- **Section titles:** Uppercase, letter-spaced, thin border-bottom
- **Chips/tags:** Fully rounded (pill shape)
- **Colors:** Gray palette, no accent color
- **Sidebar:** Light gray background, holds contact/competencies/languages/etc.
- **Main:** Header, statement, experiences, education

### Template 2: "Executive" (klassisk/traditionell)

A more traditional, formal look. Serif typography, squared-off elements.

- **Font:** Times-Roman (serif) — built into react-pdf, available in all browsers
- **Layout:** Two columns — 30% sidebar left, 70% main right (same structure)
- **Photo:** Square with no rounding, no ring, subtle shadow
- **Section titles:** Bold, normal case (not uppercase), no border — just weight
- **Chips/tags:** Small border-radius (sm), subtle border
- **Colors:** Warmer gray palette, slightly darker, optional dark accent line
- **Sidebar:** Subtle cream/warm-gray background
- **Main:** Same sections, slightly larger line-height for readability
- **Experience items:** Stacked layout (company on one line, date below) instead of inline

This template changes only tokens — same component structure, same
renderer code.

### Template 3: "Compact" (enkolumn, radbaserad)

A dense, single-column layout. No sidebar. All content flows top to bottom.

- **Font:** Helvetica (sans-serif), slightly smaller sizes for density
- **Layout:** Single column, full width. Two "zones" stacked vertically:
  1. **Header zone:** Name, title, contact info — laid out horizontally
     (name left, contact right, or centered)
  2. **Content zone:** All sections flow vertically — statement,
     competencies (as inline chip row), experiences, education,
     languages, certifications, etc.
- **Photo:** Small, square, inline next to name (or omitted)
- **Section titles:** Bold simple, no border, compact spacing
- **Chips/tags:** No background, comma-separated or minimal styling
- **Colors:** High contrast, minimal decoration
- **No sidebar at all** — everything in a single column
- **Competencies:** Rendered as a compact inline list (not grouped in sidebar)
- **Contact info:** Horizontal row with icons, not a vertical sidebar list

**Architectural impact:** This template has `layout.mode: 'single-column'`
instead of `'two-column'`. The renderers need a branch:
- Two-column mode: sidebar + main side by side (Templates 1 & 2)
- Single-column mode: header zone + content zone stacked (Template 3)

This is why `layout.mode` exists in the template — the renderers check it
to pick which page structure to use. The block-building logic is the same
(same CVData → same blocks), but *where* the blocks are placed differs.

---

## 4. What Is a Template?

A template defines the **visual style** of the CV, not the data or
structure. It controls:

### 4a. Design Tokens (values that change between templates)

```ts
type FontWeight = 'bold' | 'semibold' | 'normal'
type TextTransform = 'uppercase' | 'none'

interface CVDesignTokens {
  // --- Typography ---
  fontFamily: string                    // 'Helvetica' | 'Times-Roman' | ...

  fontSize: {
    name: number                        // Classic: 22, Compact: 20
    professionalTitle: number           // 11
    sectionTitle: number                // 11
    body: number                        // 10.5
    small: number                       // 10
    chip: number                        // 9.5
    tag: number                         // 9
    competencyLevelTitle: number        // 12
    pageNumber: number                  // 10
    contactInline: number               // 9 (Compact header zone)
  }

  fontWeight: {
    name: FontWeight                    // Classic: semibold, Executive: bold
    sectionTitle: FontWeight
    companyName: FontWeight
    institution: FontWeight
  }

  letterSpacing: {
    professionalTitle: number           // Classic: 0.18, Executive: 0
    sectionTitle: number                // Classic: 0.14, Executive: 0
  }

  textTransform: {
    professionalTitle: TextTransform    // Classic: uppercase, Executive: none
    sectionTitle: TextTransform         // Classic: uppercase, Executive: none
  }

  lineHeight: {
    body: number                        // Classic: 1.4, Executive: 1.5
    small: number                       // 1.3
  }

  // --- Colors ---
  colors: {
    text: {
      primary: string                   // gray-900
      secondary: string                 // gray-700
      tertiary: string                  // gray-600
      muted: string                     // gray-500
      faint: string                     // gray-400
    }
    border: {
      section: string                   // gray-200
      item: string                      // gray-100
      separator: string                 // gray-300
    }
    background: {
      page: string                      // #ffffff
      sidebar: string                   // rgba(249,250,251,0.7) or 'none'
      chip: string                      // gray-100
      tag: string                       // gray-100
      headerZone: string                // Compact: subtle bg for header area
    }
    accent: string                      // Executive: dark line, Compact: none
  }

  // --- Spacing (in mm, converted by each renderer) ---
  spacing: {
    pageMargin: number                  // Classic/Exec: 15, Compact: 12
    sectionGap: number                  // Classic: 4.2, Compact: 3
    sectionTitleMarginBottom: number    // 2
    itemGap: number                     // 1.5
    chipGap: number                     // 1.5
    tagGap: number                      // 0.5
    headerZonePaddingBottom: number     // Compact: 4 (space below header zone)
  }

  // --- Component Styles ---
  sectionTitle: {
    hasBorderBottom: boolean            // Classic: true, Executive: false
    style: 'uppercase-border' | 'bold-simple' | 'accent-line' | 'minimal'
  }

  chip: {
    borderRadius: 'full' | 'sm' | 'none'
    hasBorder: boolean                  // Executive: true
    hasBackground: boolean              // Compact: false (plain text)
  }

  photo: {
    shape: 'circle' | 'rounded' | 'square'
    sizeMm: number                      // Classic: 20, Executive: 22, Compact: 12
    hasShadow: boolean
    hasRing: boolean
  }

  experienceItem: {
    hasBorderBottom: boolean            // Classic: true
    layout: 'inline' | 'stacked'       // inline = company+date same line
  }

  contactItem: {
    showIcons: boolean                  // Classic/Executive: true, Compact: true
    layout: 'vertical' | 'horizontal'  // sidebar vs inline row
  }

  competencies: {
    layout: 'chips' | 'inline-text'    // chips in sidebar vs comma-sep inline
  }
}
```

### 4b. Layout Config (structural — differs between templates)

```ts
interface CVLayoutConfig {
  pageWidthMm: number                   // 210 (A4)
  pageHeightMm: number                  // 297 (A4)

  // The key discriminator: two-column or single-column
  mode: 'two-column' | 'single-column'

  // --- Two-column mode (Classic, Executive) ---
  sidebarWidthPercent: number           // 30
  sidebarPosition: 'left' | 'right'
  sidebarSafeBottomMm: number          // 12
  showSidebarBorder: boolean
  showSidebarBackground: boolean
  sidebarSections: CVSectionId[]       // sections rendered in sidebar
  mainSections: CVSectionId[]          // sections rendered in main column

  // --- Single-column mode (Compact) ---
  // headerSections: contact info, photo — rendered in a horizontal header zone
  // contentSections: all other sections — rendered vertically, full width
  headerSections: CVSectionId[]        // ['personalInfo']
  contentSections: CVSectionId[]       // ['professionalStatement', 'competencies',
                                       //  'experiences', 'education', 'languages', ...]
  // Order of contentSections determines render order
}
```

### 4c. Template Definition

```ts
interface CVTemplate {
  id: string                          // 'classic' | 'executive' | 'compact'
  name: string                        // Display name
  description: string                 // Short description for selector
  tokens: CVDesignTokens
  layout: CVLayoutConfig
}
```

---

## 5. Template Registry — All Three Templates

### Classic (current design)

```ts
const classicTemplate: CVTemplate = {
  id: 'classic',
  name: 'Classic',
  description: 'Clean two-column layout with sidebar',
  tokens: {
    fontFamily: 'Helvetica',
    fontSize: { name: 22, professionalTitle: 11, sectionTitle: 11, body: 10.5,
                small: 10, chip: 9.5, tag: 9, competencyLevelTitle: 12,
                pageNumber: 10, contactInline: 9 },
    fontWeight: { name: 'semibold', sectionTitle: 'semibold',
                  companyName: 'semibold', institution: 'semibold' },
    letterSpacing: { professionalTitle: 0.18, sectionTitle: 0.14 },
    textTransform: { professionalTitle: 'uppercase', sectionTitle: 'uppercase' },
    lineHeight: { body: 1.4, small: 1.3 },
    colors: {
      text: { primary: '#101828', secondary: '#344054', tertiary: '#475467',
              muted: '#667085', faint: '#98A2B3' },
      border: { section: '#EAECF0', item: '#F2F4F7', separator: '#D0D5DD' },
      background: { page: '#ffffff', sidebar: 'rgba(249,250,251,0.7)',
                     chip: '#F2F4F7', tag: '#F2F4F7', headerZone: 'transparent' },
      accent: 'none',
    },
    spacing: { pageMargin: 15, sectionGap: 4.2, sectionTitleMarginBottom: 2,
               itemGap: 1.5, chipGap: 1.5, tagGap: 0.5, headerZonePaddingBottom: 0 },
    sectionTitle: { hasBorderBottom: true, style: 'uppercase-border' },
    chip: { borderRadius: 'full', hasBorder: false, hasBackground: true },
    photo: { shape: 'circle', sizeMm: 20, hasShadow: true, hasRing: true },
    experienceItem: { hasBorderBottom: true, layout: 'inline' },
    contactItem: { showIcons: true, layout: 'vertical' },
    competencies: { layout: 'chips' },
  },
  layout: {
    pageWidthMm: 210, pageHeightMm: 297,
    mode: 'two-column',
    sidebarWidthPercent: 30,
    sidebarPosition: 'left',
    sidebarSafeBottomMm: 12,
    showSidebarBorder: true,
    showSidebarBackground: true,
    sidebarSections: ['personalInfo', 'competencies', 'languages',
                      'other', 'certifications', 'portfolio', 'preferences'],
    mainSections: ['professionalStatement', 'experiences', 'education'],
    headerSections: [],
    contentSections: [],
  },
}
```

### Executive (klassisk/traditionell)

```ts
const executiveTemplate: CVTemplate = {
  id: 'executive',
  name: 'Executive',
  description: 'Traditional serif style with formal layout',
  tokens: {
    fontFamily: 'Times-Roman',
    fontSize: { name: 24, professionalTitle: 11, sectionTitle: 12, body: 10.5,
                small: 10, chip: 9, tag: 9, competencyLevelTitle: 11,
                pageNumber: 10, contactInline: 9 },
    fontWeight: { name: 'bold', sectionTitle: 'bold',
                  companyName: 'bold', institution: 'bold' },
    letterSpacing: { professionalTitle: 0.06, sectionTitle: 0 },
    textTransform: { professionalTitle: 'none', sectionTitle: 'none' },
    lineHeight: { body: 1.5, small: 1.35 },
    colors: {
      text: { primary: '#1a1a1a', secondary: '#333333', tertiary: '#4a4a4a',
              muted: '#666666', faint: '#999999' },
      border: { section: '#cccccc', item: '#e5e5e5', separator: '#bbbbbb' },
      background: { page: '#ffffff', sidebar: '#f8f6f3',
                     chip: '#f0ede8', tag: '#f0ede8', headerZone: 'transparent' },
      accent: '#2c2c2c',
    },
    spacing: { pageMargin: 15, sectionGap: 4.5, sectionTitleMarginBottom: 2.5,
               itemGap: 2, chipGap: 1.5, tagGap: 0.5, headerZonePaddingBottom: 0 },
    sectionTitle: { hasBorderBottom: false, style: 'bold-simple' },
    chip: { borderRadius: 'sm', hasBorder: true, hasBackground: true },
    photo: { shape: 'square', sizeMm: 22, hasShadow: true, hasRing: false },
    experienceItem: { hasBorderBottom: true, layout: 'stacked' },
    contactItem: { showIcons: true, layout: 'vertical' },
    competencies: { layout: 'chips' },
  },
  layout: {
    pageWidthMm: 210, pageHeightMm: 297,
    mode: 'two-column',
    sidebarWidthPercent: 30,
    sidebarPosition: 'left',
    sidebarSafeBottomMm: 12,
    showSidebarBorder: true,
    showSidebarBackground: true,
    sidebarSections: ['personalInfo', 'competencies', 'languages',
                      'other', 'certifications', 'portfolio', 'preferences'],
    mainSections: ['professionalStatement', 'experiences', 'education'],
    headerSections: [],
    contentSections: [],
  },
}
```

### Compact (enkolumn, radbaserad)

```ts
const compactTemplate: CVTemplate = {
  id: 'compact',
  name: 'Compact',
  description: 'Dense single-column layout, no sidebar',
  tokens: {
    fontFamily: 'Helvetica',
    fontSize: { name: 20, professionalTitle: 10, sectionTitle: 10.5, body: 9.5,
                small: 9, chip: 8.5, tag: 8.5, competencyLevelTitle: 10,
                pageNumber: 9, contactInline: 9 },
    fontWeight: { name: 'bold', sectionTitle: 'semibold',
                  companyName: 'semibold', institution: 'semibold' },
    letterSpacing: { professionalTitle: 0.1, sectionTitle: 0.08 },
    textTransform: { professionalTitle: 'uppercase', sectionTitle: 'uppercase' },
    lineHeight: { body: 1.35, small: 1.25 },
    colors: {
      text: { primary: '#111111', secondary: '#333333', tertiary: '#444444',
              muted: '#666666', faint: '#999999' },
      border: { section: '#dddddd', item: '#eeeeee', separator: '#cccccc' },
      background: { page: '#ffffff', sidebar: 'transparent',
                     chip: 'transparent', tag: 'transparent',
                     headerZone: '#f7f7f7' },
      accent: 'none',
    },
    spacing: { pageMargin: 12, sectionGap: 3, sectionTitleMarginBottom: 1.5,
               itemGap: 1, chipGap: 0.8, tagGap: 0.3, headerZonePaddingBottom: 4 },
    sectionTitle: { hasBorderBottom: true, style: 'minimal' },
    chip: { borderRadius: 'none', hasBorder: false, hasBackground: false },
    photo: { shape: 'square', sizeMm: 12, hasShadow: false, hasRing: false },
    experienceItem: { hasBorderBottom: true, layout: 'inline' },
    contactItem: { showIcons: true, layout: 'horizontal' },
    competencies: { layout: 'inline-text' },
  },
  layout: {
    pageWidthMm: 210, pageHeightMm: 297,
    mode: 'single-column',
    sidebarWidthPercent: 0,
    sidebarPosition: 'left',
    sidebarSafeBottomMm: 0,
    showSidebarBorder: false,
    showSidebarBackground: false,
    sidebarSections: [],
    mainSections: [],
    headerSections: ['personalInfo'],
    contentSections: ['professionalStatement', 'competencies', 'experiences',
                      'education', 'languages', 'certifications',
                      'portfolio', 'other', 'preferences'],
  },
}
```

### Registry

```ts
// src/cv-template/templates/index.ts
export const templates: CVTemplate[] = [
  classicTemplate,
  executiveTemplate,
  compactTemplate,
]

export function getTemplate(id: string): CVTemplate {
  return templates.find(t => t.id === id) ?? classicTemplate
}
```

---

## 6. File Structure

```
src/
  cv-template/
    types.ts                    # CVDesignTokens, CVLayoutConfig, CVTemplate
    blocks.ts                   # MainBlock, SidebarBlock, ContentBlock types
    buildBlocks.ts              # buildBlocks(), buildSidebarBlocks(),
                                # buildContentBlocks() (single-column)
    paginateBlocks.ts           # paginateBlocks(), paginateSidebarBlocks(),
                                # paginateContentBlocks() (single-column)
    dataUtils.ts                # getVisibleExperiences(), getVisibleContactItems(), etc.
    templates/
      classic.ts
      executive.ts
      compact.ts
      index.ts                  # Registry: templates[], getTemplate()

  components/
    Preview.tsx                 # HTML renderer — branches on layout.mode
    PreviewPanel.tsx            # (unchanged)
    TemplateSelector.tsx        # Dropdown/card selector for choosing template

  pdf/
    PdfDocument.tsx             # Root Document — branches on layout.mode
    PdfTwoColumn.tsx            # Two-column page layout (Classic, Executive)
    PdfSingleColumn.tsx         # Single-column page layout (Compact)
    PdfSidebar.tsx              # Sidebar column (two-column mode)
    PdfMainContent.tsx          # Main column (two-column mode)
    PdfHeaderZone.tsx           # Header zone (single-column mode)
    PdfContentFlow.tsx          # Vertical content flow (single-column mode)
    pdfStyles.ts                # tokens → StyleSheet.create() converter
    generatePdf.ts              # pdf().toBlob() + download

  context/
    CVContext.tsx                # Add selectedTemplateId to persisted state
```

---

## 7. How Renderers Consume Tokens

### Shared style helper — `cv-template/tokenStyles.ts`

A renderer-agnostic helper that converts tokens into plain style objects.
Both HTML and PDF renderers use this, then do minimal mapping to their own
format:

```ts
// Returns plain objects with numeric/string values — no CSS units, no
// react-pdf specifics. Each renderer translates as needed.
export function buildTokenStyles(tokens: CVDesignTokens) {
  return {
    sectionTitle: {
      fontSize: tokens.fontSize.sectionTitle,
      fontWeight: tokens.fontWeight.sectionTitle,
      textTransform: tokens.textTransform.sectionTitle,
      letterSpacing: tokens.letterSpacing.sectionTitle,
      color: tokens.colors.text.secondary,
      borderBottomColor: tokens.sectionTitle.hasBorderBottom
        ? tokens.colors.border.section : undefined,
      marginBottomMm: tokens.spacing.sectionTitleMarginBottom,
    },
    // ... etc for every element type
  }
}
```

### HTML Renderer (Preview.tsx)

Maps the shared style objects to `React.CSSProperties`:

```ts
const ts = buildTokenStyles(template.tokens)

// Section title style
const sectionTitleCss: React.CSSProperties = {
  fontSize: ts.sectionTitle.fontSize,
  fontWeight: ts.sectionTitle.fontWeight === 'semibold' ? 600 : 700,
  textTransform: ts.sectionTitle.textTransform,
  letterSpacing: `${ts.sectionTitle.letterSpacing}em`,
  color: ts.sectionTitle.color,
  borderBottom: ts.sectionTitle.borderBottomColor
    ? `1px solid ${ts.sectionTitle.borderBottomColor}` : 'none',
  marginBottom: ts.sectionTitle.marginBottomMm * pxPerMm,
}
```

Structural Tailwind classes (flex, items-center, etc.) remain as classes.

### PDF Renderer (pdfStyles.ts)

Maps the same shared style objects to react-pdf `StyleSheet`:

```ts
const ts = buildTokenStyles(template.tokens)

StyleSheet.create({
  sectionTitle: {
    fontSize: ts.sectionTitle.fontSize,
    fontWeight: ts.sectionTitle.fontWeight === 'semibold' ? 600 : 700,
    textTransform: ts.sectionTitle.textTransform,
    letterSpacing: ts.sectionTitle.letterSpacing,
    color: ts.sectionTitle.color,
    borderBottomWidth: ts.sectionTitle.borderBottomColor ? 1 : 0,
    borderBottomColor: ts.sectionTitle.borderBottomColor,
    marginBottom: mmToPt(ts.sectionTitle.marginBottomMm),
  },
})
```

**One tokens object → one shared style builder → two thin renderers.**

### Layout Mode Branching

Both renderers check `template.layout.mode`:

```ts
// Preview.tsx (simplified)
if (template.layout.mode === 'two-column') {
  return <TwoColumnPreview template={template} blocks={...} sidebar={...} />
} else {
  return <SingleColumnPreview template={template} headerData={...} content={...} />
}

// PdfDocument.tsx (simplified)
if (template.layout.mode === 'two-column') {
  return <PdfTwoColumn template={template} ... />
} else {
  return <PdfSingleColumn template={template} ... />
}
```

The two-column components reuse all existing rendering logic (sidebar +
main). The single-column components render a header zone (name + contact
horizontal) then all sections vertically.

**Importantly:** the individual block renderers (ExperienceBlock,
EducationBlock, SectionTitle, etc.) are shared between both modes. Only
the page-level "shell" differs.

---

## 8. Data Layer — Shared Block Building

Extracted from the current `Preview.tsx` (no logic changes, just moved):

```
cv-template/
  blocks.ts           # Type definitions: MainBlock, SidebarBlock, ContentBlock, ContactKind
  buildBlocks.ts      # buildMainBlocks(cvData) → MainBlock[]
                      # buildSidebarBlocks(cvData, ...) → SidebarBlock[]
                      # buildContentBlocks(cvData, sectionOrder) → ContentBlock[]
  paginateBlocks.ts   # paginateMainBlocks(blocks, heights, max) → MainBlock[][]
                      # paginateSidebarBlocks(blocks, heights, max) → SidebarBlock[][]
                      # paginateContentBlocks(blocks, heights, max) → ContentBlock[][]
  dataUtils.ts        # hasExperienceContent(), hasEducationContent()
                      # getVisibleExperiences(), getVisibleEducation()
                      # getVisibleContactItems(), getVisibleCompetencies()
                      # getVisibleListItems(), getVisiblePreferences()
```

### ContentBlock (for single-column mode)

Single-column mode needs a unified block type that can hold any section:

```ts
type ContentBlock =
  | MainBlock                           // header, statement, experience-*, education-*
  | SidebarBlock                        // competencies, languages, contact, etc.
  | { id: string; type: 'section-divider' }  // thin line between sections
```

`buildContentBlocks(cvData, sectionOrder)` takes the `contentSections`
array from the template layout and produces blocks in that order. It
reuses the same per-section building logic as `buildMainBlocks()` and
`buildSidebarBlocks()`, but outputs them into a single flat list.

Both `Preview.tsx` and `PdfDocument.tsx` import from here.

---

## 9. CVData Extension

Add `selectedTemplateId` to persisted state:

```ts
// In CVData (cv.ts)
interface CVData {
  // ... existing fields ...
  selectedTemplateId: string    // default: 'classic'
}
```

`CVContext.tsx` persists this to localStorage alongside all other CV data.

---

## 10. Template Selector UI

Small dropdown in the Editor panel (or SiteHeader):

```tsx
function TemplateSelector() {
  const { cvData, setSelectedTemplate } = useCVData()
  const currentTemplate = getTemplate(cvData.selectedTemplateId)

  return (
    <select value={currentTemplate.id} onChange={e => setSelectedTemplate(e.target.value)}>
      {templates.map(t => (
        <option key={t.id} value={t.id}>{t.name}</option>
      ))}
    </select>
  )
}
```

The preview updates instantly when the template changes, since it just reads
different tokens. No re-mount needed.

---

## 11. Pagination

### HTML Preview

Keeps the current DOM-measurement approach. The pagination functions move to
`cv-template/paginateBlocks.ts` but the measurement logic (getPxPerMm,
getBlockHeight, measureChipRows, hidden off-screen div) stays in
`Preview.tsx` since it's HTML-specific.

Template tokens affect element sizes, which affect measurement results, so
pagination adapts automatically to different templates.

### PDF

react-pdf has its own layout engine. Start with:

**Option A — `wrap` mode** (simple):
- Single `<Page wrap>` per document
- Sidebar as `fixed` element repeating on every page
- Main content flows with automatic page breaks
- react-pdf handles orphan prevention via `minPresenceAhead`

**Option B — Pre-calculated pages** (if A doesn't work):
- Use font metrics to estimate block heights
- Run `paginateBlocks()` / `paginateSidebarBlocks()` with estimated heights
- Render one `<Page>` per result

Start with Option A.

---

## 12. Implementation Order

### Phase 1: Template infrastructure (no visible changes yet)

1. **`cv-template/types.ts`** — CVDesignTokens, CVLayoutConfig, CVTemplate interfaces
2. **`cv-template/blocks.ts`** — Move MainBlock, SidebarBlock types. Add ContentBlock.
3. **`cv-template/dataUtils.ts`** — Extract visibility filters, content checkers
4. **`cv-template/buildBlocks.ts`** — Move buildMainBlocks(), buildSidebarBlocks(). Add buildContentBlocks().
5. **`cv-template/paginateBlocks.ts`** — Move pagination functions. Add paginateContentBlocks().
6. **`cv-template/tokenStyles.ts`** — Shared buildTokenStyles(tokens) helper
7. **`cv-template/templates/classic.ts`** — Encode current Preview.tsx styling
8. **`cv-template/templates/index.ts`** — Registry with classic only

### Phase 2: Migrate Preview.tsx to template tokens (Classic only)

9. **Update `Preview.tsx`** — Import from cv-template. Replace hardcoded Tailwind values with token-derived inline styles. Add layout.mode branching (only two-column path active for now).
10. **Verify** — Preview must look identical to before with Classic template.

### Phase 3: PDF rendering (Classic template, two-column)

11. **Install `@react-pdf/renderer`**
12. **`pdf/pdfStyles.ts`** — buildPdfStyles(tokens) using shared tokenStyles
13. **`pdf/PdfSidebar.tsx`** — Sidebar column
14. **`pdf/PdfMainContent.tsx`** — Main column
15. **`pdf/PdfTwoColumn.tsx`** — Two-column page shell
16. **`pdf/PdfDocument.tsx`** — Document wrapper, branches on layout.mode
17. **`pdf/generatePdf.ts`** — Blob + download

### Phase 4: Integration + template selector

18. **`SiteHeader.tsx`** — Swap window.print() for generatePdf(), loading state
19. **`CVContext.tsx`** — Add selectedTemplateId to state + persistence
20. **`TemplateSelector.tsx`** — Selector component (dropdown or cards)
21. **Verify** Classic works end-to-end (preview + PDF + selector)

### Phase 5: Executive template (two-column, tokens only)

22. **`cv-template/templates/executive.ts`** — Token definition
23. **Register in index.ts**
24. **Verify** — Preview and PDF render correctly with Executive selected.
    Confirm serif font, square photo, bold titles, stacked experience layout.

### Phase 6: Compact template (single-column — new layout mode)

25. **`buildContentBlocks()`** — Implement in buildBlocks.ts
26. **`paginateContentBlocks()`** — Implement in paginateBlocks.ts
27. **HTML single-column renderer** — SingleColumnPreview in Preview.tsx
    - Header zone: name + title left, contact items horizontal right, small photo
    - Content flow: all sections vertically, full width
    - Competencies rendered as inline comma-separated text
28. **`pdf/PdfHeaderZone.tsx`** — Header zone for single-column
29. **`pdf/PdfContentFlow.tsx`** — Vertical content for single-column
30. **`pdf/PdfSingleColumn.tsx`** — Single-column page shell
31. **`cv-template/templates/compact.ts`** — Token definition
32. **Register in index.ts**
33. **Verify** — Preview and PDF render correctly with Compact selected.

### Phase 7: Cleanup

34. **Remove `html2pdf.js`** — `npm uninstall html2pdf.js`
35. **Remove `@media print` CSS** — print-reset, cv-sidebar print rules, @page rules
36. **Remove `page-break-inside-avoid` class** — no longer needed

---

## 13. Risks and Mitigations

| Risk | Mitigation |
|------|-----------|
| Inline styles in Preview.tsx make Tailwind mixed | Only token-driven values become inline. Structural (flex, items-center) stays Tailwind. |
| Template tokens get too complex | Start with Classic only. Extend interface as Executive/Compact reveal needs. |
| react-pdf Helvetica vs browser system font | Minor difference. Accept it. Can register web font later. |
| react-pdf Times-Roman vs browser serif | Same — minor. Times-Roman is built into react-pdf. |
| Bundle size (~500KB gzip for react-pdf) | Dynamic import on Export click. Zero cost to initial load. |
| Two-column PDF pagination | Option A (wrap + fixed sidebar). Fallback to Option B if needed. |
| Single-column layout is architecturally different | Contained in separate components (PdfSingleColumn, SingleColumnPreview). Shared block renderers. |
| Compact template competencies as inline text | New render variant in block renderer, toggled by `tokens.competencies.layout`. |
| Executive stacked experience layout | New variant in ExperienceBlock, toggled by `tokens.experienceItem.layout`. |

---

## 14. Definition of Done

### Core
- [ ] Template system with CVDesignTokens, CVLayoutConfig, CVTemplate
- [ ] Block building extracted to `cv-template/` and shared by both renderers
- [ ] Shared `buildTokenStyles()` helper consumed by both HTML and PDF

### Classic template
- [ ] Preview.tsx renders Classic from tokens (looks identical to current)
- [ ] PDF export generates correct Classic PDF
- [ ] Two-column layout, circular photo, chips, uppercase section titles

### Executive template
- [ ] Preview renders Executive (serif, square photo, bold titles, stacked layout)
- [ ] PDF export generates correct Executive PDF
- [ ] Warm color palette, subtle chip borders, no letter-spacing on titles

### Compact template
- [ ] Preview renders Compact (single column, header zone + content flow)
- [ ] PDF export generates correct Compact PDF
- [ ] Contact info horizontal, competencies as inline text, dense spacing
- [ ] No sidebar

### Integration
- [ ] Template selector in UI, 3 templates selectable
- [ ] `selectedTemplateId` persisted in CVData / localStorage
- [ ] Dynamic import of react-pdf (not in initial bundle)
- [ ] Works on iOS Safari, Chrome, Firefox

### Cleanup
- [ ] `html2pdf.js` removed
- [ ] Print CSS removed
