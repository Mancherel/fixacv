import { useRef, useState } from 'react'
import { useCVData } from '../context/CVContext'
import { Section } from './Section'
import { PersonalInfoForm } from './PersonalInfoForm'
import { ProfessionalStatementForm } from './ProfessionalStatementForm'
import { ExperienceList } from './ExperienceList'
import { EducationList } from './EducationList'
import { CompetenciesList } from './CompetenciesList'
import { LanguagesForm } from './LanguagesForm'
import { OtherForm } from './OtherForm'
import { PreferencesForm } from './PreferencesForm'
import { CertificationsForm } from './CertificationsForm'
import { PortfolioForm } from './PortfolioForm'
import { FaqSection } from './FaqSection'
import { importLinkedInData } from '../utils/linkedinImport'

const KOFI_URL = 'https://ko-fi.com/mancherel'

interface ModalProps {
  open: boolean
  title: string
  subtitle?: string
  onClose: () => void
  children: React.ReactNode
}

function Modal({ open, title, subtitle, onClose, children }: ModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {subtitle ? <p className="mt-1 text-sm text-gray-500">{subtitle}</p> : null}
          </div>
          <button
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}

function buildDefaultFileName(name: string | undefined) {
  const trimmedName = name?.trim()
  const base = trimmedName && trimmedName.length > 0 ? trimmedName : 'cv'
  const safeBase = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
  const dateStamp = new Date().toISOString().split('T')[0]
  return `${safeBase || 'cv'}-${dateStamp}.json`
}

function ensureJsonExtension(filename: string) {
  const trimmed = filename.trim()
  if (trimmed.toLowerCase().endsWith('.json')) return trimmed
  return `${trimmed}.json`
}

export function Editor() {
  const { cvData, toggleSectionVisibility, importData, exportData, clearAllData } = useCVData()
  const [showNewCv, setShowNewCv] = useState(false)
  const [showSave, setShowSave] = useState(false)
  const [showOpenFile, setShowOpenFile] = useState(false)
  const [showLinkedIn, setShowLinkedIn] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [showFaq, setShowFaq] = useState(false)
  const [saveFileName, setSaveFileName] = useState('')
  const [collapseSignal, setCollapseSignal] = useState(0)
  const [isJsonDragActive, setIsJsonDragActive] = useState(false)
  const [isLinkedInDragActive, setIsLinkedInDragActive] = useState(false)

  const jsonInputRef = useRef<HTMLInputElement>(null)
  const linkedInInputRef = useRef<HTMLInputElement>(null)
  const headerButtonBase =
    'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-1'

  const hasPersonalInfo = Object.values(cvData.personalInfo).some(
    (value) => typeof value === 'string' && value.trim().length > 0,
  )
  const hasCompetencies =
    cvData.competencies.expert.length > 0 ||
    cvData.competencies.advanced.length > 0 ||
    cvData.competencies.proficient.length > 0
  const hasPreferences = Object.values(cvData.preferences).some(
    (field) => field.value && field.value.trim().length > 0,
  )
  const hasContent =
    hasPersonalInfo ||
    Boolean(cvData.professionalStatement?.trim()) ||
    cvData.experiences.length > 0 ||
    cvData.education.length > 0 ||
    hasCompetencies ||
    cvData.languages.length > 0 ||
    cvData.other.length > 0 ||
    cvData.certifications.length > 0 ||
    cvData.portfolio.length > 0 ||
    hasPreferences

  const downloadJson = (filename?: string) => {
    const data = exportData()
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const resolvedName = filename && filename.trim().length > 0
      ? ensureJsonExtension(filename)
      : buildDefaultFileName(cvData.personalInfo.name)

    a.href = url
    a.download = resolvedName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const openSaveModal = () => {
    setSaveFileName(buildDefaultFileName(cvData.personalInfo.name))
    setShowSave(true)
  }

  const handleConfirmNewCv = () => {
    clearAllData()
    setShowNewCv(false)
  }

  const handleImportFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string
        const data = JSON.parse(json)
        importData(data)
        setShowOpenFile(false)
      } catch (error) {
        alert('Failed to import data. Please check the file format.')
      }
    }
    reader.readAsText(file)
  }

  const handleJsonInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    handleImportFile(file)
    event.target.value = ''
  }

  const handleJsonDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsJsonDragActive(false)
    const file = event.dataTransfer.files?.[0]
    if (file) {
      handleImportFile(file)
    }
  }

  const handleCollapseAll = () => {
    setCollapseSignal((prev) => prev + 1)
  }

  const importLinkedInFiles = async (files: FileList) => {
    try {
      const linkedInData = await importLinkedInData(files)

      const hasImportedCompetencies =
        linkedInData.competencies &&
        ((linkedInData.competencies.expert?.length || 0) > 0 ||
          (linkedInData.competencies.advanced?.length || 0) > 0 ||
          (linkedInData.competencies.proficient?.length || 0) > 0)

      const mergedData = {
        personalInfo: linkedInData.personalInfo?.name ? linkedInData.personalInfo : cvData.personalInfo,
        personalInfoVisibility: cvData.personalInfoVisibility,
        professionalStatement: linkedInData.professionalStatement || cvData.professionalStatement,
        experiences:
          linkedInData.experiences && linkedInData.experiences.length > 0
            ? linkedInData.experiences
            : cvData.experiences,
        education:
          linkedInData.education && linkedInData.education.length > 0
            ? linkedInData.education
            : cvData.education,
        competencies: hasImportedCompetencies && linkedInData.competencies ? linkedInData.competencies : cvData.competencies,
        certifications:
          linkedInData.certifications && linkedInData.certifications.length > 0
            ? linkedInData.certifications
            : cvData.certifications,
        portfolio: cvData.portfolio,
        sectionVisibility: cvData.sectionVisibility,
        languages: cvData.languages,
        other: cvData.other,
        preferences: cvData.preferences,
      }

      importData(mergedData)
      setShowLinkedIn(false)
      alert('LinkedIn data imported successfully!')
    } catch (error) {
      alert('Failed to import LinkedIn data. Please make sure you selected the correct CSV files.')
    }
  }

  const handleLinkedInInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    void importLinkedInFiles(files)
    event.target.value = ''
  }

  const handleLinkedInDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsLinkedInDragActive(false)
    const files = event.dataTransfer.files
    if (files && files.length > 0) {
      void importLinkedInFiles(files)
    }
  }

  return (
    <div className="editor-root">
      <Modal
        open={showNewCv}
        title="Start a new CV?"
        subtitle="This clears the current editor and preview."
        onClose={() => setShowNewCv(false)}
      >
        <div className="space-y-4 text-sm text-gray-600">
          <p>Your current CV will be replaced. You can download a backup first if you want to keep it.</p>
          {hasContent ? (
            <button
              onClick={() => downloadJson()}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              type="button"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 3v10m0 0l-4-4m4 4l4-4M5 21h14"
                />
              </svg>
              Download current CV
            </button>
          ) : (
            <p className="text-xs text-gray-400">No content yet, nothing to back up.</p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={() => setShowNewCv(false)}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmNewCv}
            className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
            type="button"
          >
            Start new
          </button>
        </div>
      </Modal>

      <Modal
        open={showSave}
        title="Save your CV"
        subtitle="Download a JSON backup you can reopen later."
        onClose={() => setShowSave(false)}
      >
        <div className="space-y-4 text-sm text-gray-600">
          <p>Keep this file safe. You can open it again from “Open file”.</p>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">Filename</label>
            <input
              value={saveFileName}
              onChange={(event) => setSaveFileName(event.target.value)}
              className="mt-2 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <button
            onClick={() => downloadJson(saveFileName)}
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
            type="button"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 3v10m0 0l-4-4m4 4l4-4M5 21h14"
              />
            </svg>
            Download JSON
          </button>
        </div>
      </Modal>

      <Modal
        open={showOpenFile}
        title="Open a CV file"
        subtitle="Import a JSON backup to continue editing."
        onClose={() => setShowOpenFile(false)}
      >
        <div className="space-y-4 text-sm text-gray-600">
          <p>Opening a file replaces your current CV. Download a backup first if you want to keep it.</p>
          {hasContent ? (
            <button
              onClick={() => downloadJson()}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              type="button"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 3v10m0 0l-4-4m4 4l4-4M5 21h14"
                />
              </svg>
              Download current CV
            </button>
          ) : null}
          <div
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-6 text-center text-xs text-slate-500 transition ${
              isJsonDragActive ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-slate-50'
            }`}
            onClick={() => jsonInputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault()
              setIsJsonDragActive(true)
            }}
            onDragLeave={() => setIsJsonDragActive(false)}
            onDrop={handleJsonDrop}
          >
            <svg className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16V8m0 0l-3 3m3-3l3 3" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v3h16v-3" />
            </svg>
            <span>Drop a JSON file here or click to browse.</span>
            <input
              ref={jsonInputRef}
              type="file"
              accept=".json"
              onChange={handleJsonInputChange}
              className="hidden"
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={showLinkedIn}
        title="Import from LinkedIn"
        subtitle="Use LinkedIn CSV exports to prefill your CV faster."
        onClose={() => setShowLinkedIn(false)}
      >
        <div className="space-y-4 text-sm text-gray-600">
          <div className="rounded-md bg-slate-50 p-3 text-xs text-slate-600">
            <p className="font-semibold text-slate-700">How to export from LinkedIn</p>
            <ol className="mt-2 list-inside list-decimal space-y-1">
              <li>Go to LinkedIn Settings & Privacy</li>
              <li>Open “Data privacy” → “Get a copy of your data”</li>
              <li>Select the data you want and download</li>
              <li>Extract the ZIP file and upload the CSVs here</li>
            </ol>
          </div>

          <div className="rounded-md bg-white p-3 text-xs text-slate-600">
            <p className="font-semibold text-slate-700">Supported CSV files</p>
            <ul className="mt-2 space-y-1">
              <li>Profile.csv (name, headline, summary)</li>
              <li>Positions.csv (work experience)</li>
              <li>Education.csv (education history)</li>
              <li>Skills.csv (competencies)</li>
              <li>Courses.csv (courses / certifications)</li>
            </ul>
          </div>

          <p className="text-xs text-slate-500">
            You can upload one or many files. Imported sections replace the matching section in your CV,
            other sections stay untouched. Importing can overwrite existing data in those sections.
          </p>

          <div
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-6 text-center text-xs text-slate-500 transition ${
              isLinkedInDragActive ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-slate-50'
            }`}
            onClick={() => linkedInInputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault()
              setIsLinkedInDragActive(true)
            }}
            onDragLeave={() => setIsLinkedInDragActive(false)}
            onDrop={handleLinkedInDrop}
          >
            <svg className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16V8m0 0l-3 3m3-3l3 3" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v3h16v-3" />
            </svg>
            <span>Drop LinkedIn CSV files here or click to browse.</span>
            <input
              ref={linkedInInputRef}
              type="file"
              accept=".csv"
              multiple
              onChange={handleLinkedInInputChange}
              className="hidden"
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={showFaq}
        title="FAQ"
        subtitle="Answers to common questions."
        onClose={() => setShowFaq(false)}
      >
        <div className="max-h-[60vh] overflow-y-auto pr-2">
          <FaqSection />
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setShowFaq(false)}
            className="rounded-md bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800"
            type="button"
          >
            Close
          </button>
        </div>
      </Modal>

      <Modal
        open={showAbout}
        title="About fixacv"
        subtitle="Free CV builder with local-first data."
        onClose={() => setShowAbout(false)}
      >
        <div className="space-y-3 text-sm text-gray-600">
          <p>Everything runs in your browser. Your data stays on your device unless you export it.</p>
          <p>Save JSON backups so you can reopen your CV later.</p>
          <p>Import LinkedIn CSV exports to get started faster.</p>
          <p>Print or save to PDF when your CV is ready.</p>
          <p>
            Open source on{' '}
            <a
              href="https://github.com/Mancherel/fixacv"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              GitHub
            </a>
            .
          </p>
          <div className="pt-2">
            <a
              href={KOFI_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-[#fcbf47] bg-[#fcbf47] px-4 py-2 text-xs font-semibold text-[#323842] shadow-md shadow-amber-200/60 hover:bg-[#f6b532]"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.6}
                  d="M4 8h12v8a4 4 0 01-4 4H8a4 4 0 01-4-4V8z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.6}
                  d="M16 10h2a2 2 0 012 2v1a3 3 0 01-3 3h-1"
                />
              </svg>
              Support me
            </a>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setShowAbout(false)}
            className="rounded-md bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800"
            type="button"
          >
            Got it
          </button>
        </div>
      </Modal>

      <header className="sticky top-0 z-10 -mx-6 mb-4 border-b border-slate-200 bg-white/95 px-6 py-6 backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowNewCv(true)}
            className={`${headerButtonBase} border border-slate-200 bg-white text-slate-700 hover:bg-slate-100`}
            type="button"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.6}
                d="M7 3h7l5 5v13H7z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.6}
                d="M14 3v6h6"
              />
            </svg>
            New CV
          </button>
          <button
            onClick={openSaveModal}
            className={`${headerButtonBase} border border-slate-200 bg-white text-slate-700 hover:bg-slate-100`}
            type="button"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.6}
                d="M5 5h11l3 3v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.6}
                d="M9 5v4h6V5M9 15h6"
              />
            </svg>
            Save
          </button>
          <button
            onClick={() => setShowOpenFile(true)}
            className={`${headerButtonBase} border border-slate-200 bg-white text-slate-700 hover:bg-slate-100`}
            type="button"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.6}
                d="M3 7h6l2 2h10v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.6}
                d="M12 14V8m0 0l-3 3m3-3l3 3"
              />
            </svg>
            Open file
          </button>
          <button
            onClick={() => setShowLinkedIn(true)}
            className={`${headerButtonBase} border border-[#0A66C2] bg-[#0A66C2] text-white hover:bg-[#084c95]`}
            type="button"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.6}
                d="M10 13a4 4 0 0 1 0-6l2-2a4 4 0 1 1 6 6l-1 1"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.6}
                d="M14 11a4 4 0 0 1 0 6l-2 2a4 4 0 1 1-6-6l1-1"
              />
            </svg>
            Import from LinkedIn
          </button>
          <button
            onClick={() => setShowAbout(true)}
            className={`${headerButtonBase} border border-slate-200 bg-white text-slate-700 hover:bg-slate-100`}
            type="button"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.6}
                d="M12 16v-4m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            About
          </button>
          <button
            onClick={() => setShowFaq(true)}
            className={`${headerButtonBase} border border-slate-200 bg-white text-slate-700 hover:bg-slate-100`}
            type="button"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.6}
                d="M12 18h.01M9 9a3 3 0 016 0c0 2-3 2-3 4"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.6}
                d="M12 22a10 10 0 100-20 10 10 0 000 20z"
              />
            </svg>
            FAQ
          </button>
          {/* Collapse all is intentionally hidden for now; keep signal for future placement. */}
          <button
            onClick={handleCollapseAll}
            className="hidden"
            type="button"
          />
        </div>
      </header>

      <div className="space-y-4">
        <Section title="Personal Information" collapseSignal={collapseSignal}>
          <PersonalInfoForm />
        </Section>

        <Section
          title="Professional Statement"
          onToggleVisibility={() => toggleSectionVisibility('professionalStatement')}
          isVisible={cvData.sectionVisibility.professionalStatement}
          collapseSignal={collapseSignal}
        >
          <ProfessionalStatementForm />
        </Section>

        <Section
          title="Work Experience"
          onToggleVisibility={() => toggleSectionVisibility('experiences')}
          isVisible={cvData.sectionVisibility.experiences}
          collapseSignal={collapseSignal}
        >
          <ExperienceList />
        </Section>

        <Section
          title="Education"
          onToggleVisibility={() => toggleSectionVisibility('education')}
          isVisible={cvData.sectionVisibility.education}
          collapseSignal={collapseSignal}
        >
          <EducationList />
        </Section>

        <Section
          title="Competencies"
          onToggleVisibility={() => toggleSectionVisibility('competencies')}
          isVisible={cvData.sectionVisibility.competencies}
          collapseSignal={collapseSignal}
        >
          <CompetenciesList />
        </Section>

        <Section
          title="Languages"
          onToggleVisibility={() => toggleSectionVisibility('languages')}
          isVisible={cvData.sectionVisibility.languages}
          collapseSignal={collapseSignal}
        >
          <LanguagesForm />
        </Section>

        <Section
          title="Other"
          onToggleVisibility={() => toggleSectionVisibility('other')}
          isVisible={cvData.sectionVisibility.other}
          collapseSignal={collapseSignal}
        >
          <OtherForm />
        </Section>

        <Section
          title="Courses / Certifications"
          onToggleVisibility={() => toggleSectionVisibility('certifications')}
          isVisible={cvData.sectionVisibility.certifications}
          collapseSignal={collapseSignal}
        >
          <CertificationsForm />
        </Section>

        <Section
          title="Portfolio"
          onToggleVisibility={() => toggleSectionVisibility('portfolio')}
          isVisible={cvData.sectionVisibility.portfolio}
          collapseSignal={collapseSignal}
        >
          <PortfolioForm />
        </Section>

        <Section
          title="Preferences"
          onToggleVisibility={() => toggleSectionVisibility('preferences')}
          isVisible={cvData.sectionVisibility.preferences}
          collapseSignal={collapseSignal}
        >
          <PreferencesForm />
        </Section>

      </div>
    </div>
  )
}
