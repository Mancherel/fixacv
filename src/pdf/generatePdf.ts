import type { CVData } from '../types/cv'
import type { CVTemplate } from '../cv-template/types'

/**
 * Dynamically import react-pdf + PdfDocument, render to a Blob, and trigger
 * a browser download.
 *
 * This function is the only entry point that pulls in the heavy react-pdf
 * bundle (~500 KB gzip). By using dynamic import() it is tree-shaken out of
 * the initial load — the cost is only paid when the user clicks "Export PDF".
 */
export async function generatePdf(
  cvData: CVData,
  template: CVTemplate,
): Promise<void> {
  // Dynamic imports so react-pdf is only loaded when needed
  const [{ pdf }, { PdfDocument }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('./PdfDocument'),
  ])

  const doc = PdfDocument({ cvData, template })
  const blob = await pdf(doc).toBlob()

  // Build filename from user's name or a generic fallback
  const name = cvData.personalInfo.name?.trim().replace(/\s+/g, '_') || 'cv'
  const filename = `${name}_CV.pdf`

  // Trigger download
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, 100)
}
