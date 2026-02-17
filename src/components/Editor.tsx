import { useEffect, useRef, useState } from 'react'
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
import type { AppLanguage } from '../types'
import {
  PREVIEW_FOCUS_SECTION_EVENT,
  type EditorSectionId,
  type PreviewFocusSectionDetail,
} from '../types/editorNavigation'
import {
  SECTION_ORDER,
  SUPPORTED_LANGUAGES,
  getEditorControlText,
  getEditorSectionTitle,
  getLanguageDisplayName,
  getPreviewSectionTitle,
} from '../i18n'
import { useI18n } from '../i18n/useI18n'
import { useTheme } from '../hooks/useTheme'
import { KofiButton } from './KofiButton'

const KOFI_URL = 'https://ko-fi.com/mancherel'

interface ModalProps {
  open: boolean
  title: string
  subtitle?: string
  onClose: () => void
  closeAriaLabel: string
  children: React.ReactNode
}

function Modal({ open, title, subtitle, onClose, closeAriaLabel, children }: ModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
            {subtitle ? <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p> : null}
          </div>
          <button
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            onClick={onClose}
            aria-label={closeAriaLabel}
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

const MOBILE_LAYOUT_QUERY = '(max-width: 1023px)'
const DEFAULT_MOBILE_SECTION: EditorSectionId = 'personalInfo'
const EDITOR_MOBILE_SECTION_ORDER = SECTION_ORDER.filter(
  (section): section is EditorSectionId => section !== 'professionalStatement',
)

export function Editor() {
  const {
    cvData,
    toggleSectionVisibility,
    setCVLanguage,
    setSectionTitleOverride,
    clearSectionTitleOverride,
    importData,
    exportData,
    clearAllData,
  } = useCVData()
  const { t } = useI18n()
  const { theme, toggleTheme } = useTheme()
  const [showNewCv, setShowNewCv] = useState(false)
  const [showSave, setShowSave] = useState(false)
  const [showOpenFile, setShowOpenFile] = useState(false)
  const [showLinkedIn, setShowLinkedIn] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [showFaq, setShowFaq] = useState(false)
  const [saveFileName, setSaveFileName] = useState('')
  const [collapseSignal, setCollapseSignal] = useState(0)
  const [editingTitleSection, setEditingTitleSection] = useState<EditorSectionId | null>(null)
  const [titleDraft, setTitleDraft] = useState('')
  const [isJsonDragActive, setIsJsonDragActive] = useState(false)
  const [isLinkedInDragActive, setIsLinkedInDragActive] = useState(false)
  const [isMobileLayout, setIsMobileLayout] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(MOBILE_LAYOUT_QUERY).matches
  })
  const [activeMobileSection, setActiveMobileSection] = useState<EditorSectionId | null>(
    DEFAULT_MOBILE_SECTION,
  )
  const [mobileChipTopOffset, setMobileChipTopOffset] = useState(56)
  const [isMobileChipsVisible, setIsMobileChipsVisible] = useState(true)

  const editorRootRef = useRef<HTMLDivElement>(null)
  const editorHeaderRef = useRef<HTMLElement>(null)
  const mobileChipsVisibleRef = useRef(true)
  const scrollTrackerRef = useRef({
    lastTop: 0,
    downDistance: 0,
    upDistance: 0,
    rafId: 0,
  })
  const jsonInputRef = useRef<HTMLInputElement>(null)
  const linkedInInputRef = useRef<HTMLInputElement>(null)
  const headerButtonBase =
    'shrink-0 inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-semibold leading-none transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-1 sm:text-xs'

  useEffect(() => {
    mobileChipsVisibleRef.current = isMobileChipsVisible
  }, [isMobileChipsVisible])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mediaQuery = window.matchMedia(MOBILE_LAYOUT_QUERY)

    const updateLayoutMode = (matches: boolean) => {
      setIsMobileLayout(matches)
      if (matches) {
        setActiveMobileSection((current) => current ?? DEFAULT_MOBILE_SECTION)
      }
    }

    updateLayoutMode(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      updateLayoutMode(event.matches)
    }

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }

    mediaQuery.addListener(handleChange)
    return () => mediaQuery.removeListener(handleChange)
  }, [])

  useEffect(() => {
    if (!isMobileLayout) {
      mobileChipsVisibleRef.current = true
      setIsMobileChipsVisible(true)
      return
    }

    const rootElement = editorRootRef.current
    if (!rootElement) return

    const findScrollableAncestor = (element: HTMLElement): HTMLElement | Window => {
      let parent: HTMLElement | null = element.parentElement
      while (parent) {
        const style = window.getComputedStyle(parent)
        const overflowY = style.overflowY
        const canScroll = /(auto|scroll|overlay)/.test(overflowY)
        if (canScroll && parent.scrollHeight > parent.clientHeight + 1) {
          return parent
        }
        parent = parent.parentElement
      }
      return window
    }

    const scrollContainer = findScrollableAncestor(rootElement)

    const readScrollTop = () => {
      if (scrollContainer === window) {
        return window.scrollY || document.documentElement.scrollTop || 0
      }
      return (scrollContainer as HTMLElement).scrollTop
    }

    const tracker = scrollTrackerRef.current
    tracker.lastTop = readScrollTop()
    tracker.downDistance = 0
    tracker.upDistance = 0

    const setChipsVisibility = (visible: boolean) => {
      if (mobileChipsVisibleRef.current === visible) return
      mobileChipsVisibleRef.current = visible
      setIsMobileChipsVisible(visible)
    }

    const evaluateScroll = () => {
      tracker.rafId = 0
      const currentScrollTop = readScrollTop()
      const delta = currentScrollTop - tracker.lastTop
      tracker.lastTop = currentScrollTop

      if (currentScrollTop <= 24) {
        tracker.downDistance = 0
        tracker.upDistance = 0
        setChipsVisibility(true)
        return
      }

      if (Math.abs(delta) < 1) return

      if (delta > 0) {
        tracker.downDistance += delta
        tracker.upDistance = 0
        if (tracker.downDistance >= 18) {
          setChipsVisibility(false)
          tracker.downDistance = 0
        }
        return
      }

      tracker.upDistance += -delta
      tracker.downDistance = 0
      if (tracker.upDistance >= 12) {
        setChipsVisibility(true)
        tracker.upDistance = 0
      }
    }

    const handleScroll = () => {
      if (tracker.rafId !== 0) return
      tracker.rafId = window.requestAnimationFrame(evaluateScroll)
    }

    if (scrollContainer === window) {
      window.addEventListener('scroll', handleScroll, { passive: true })
      return () => {
        window.removeEventListener('scroll', handleScroll)
        if (tracker.rafId !== 0) {
          window.cancelAnimationFrame(tracker.rafId)
          tracker.rafId = 0
        }
      }
    }

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll)
      if (tracker.rafId !== 0) {
        window.cancelAnimationFrame(tracker.rafId)
        tracker.rafId = 0
      }
    }
  }, [isMobileLayout])

  useEffect(() => {
    if (!isMobileLayout) {
      setMobileChipTopOffset(56)
      return
    }

    const headerElement = editorHeaderRef.current
    if (!headerElement) return

    const updateOffset = () => {
      setMobileChipTopOffset(headerElement.getBoundingClientRect().height)
    }

    updateOffset()

    let observer: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(updateOffset)
      observer.observe(headerElement)
    }

    window.addEventListener('resize', updateOffset)

    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', updateOffset)
    }
  }, [isMobileLayout])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handlePreviewFocusSection = (event: Event) => {
      const customEvent = event as CustomEvent<PreviewFocusSectionDetail>
      const targetSection = customEvent.detail?.section
      if (!targetSection) return

      openMobileSection(targetSection, true)
    }

    window.addEventListener(
      PREVIEW_FOCUS_SECTION_EVENT,
      handlePreviewFocusSection as EventListener,
    )
    return () =>
      window.removeEventListener(
        PREVIEW_FOCUS_SECTION_EVENT,
        handlePreviewFocusSection as EventListener,
      )
  }, [])

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
  const cvLanguage = cvData.localization.cvLanguage
  const cvLanguageLabel = getEditorControlText(cvLanguage, 'cvLanguageLabel')
  const languageOverrides = cvData.localization.sectionTitleOverrides[cvLanguage] ?? {}

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
      } catch {
        alert(t('editor.alerts.jsonImportFailed'))
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
    setActiveMobileSection(null)
  }

  const scrollToSection = (section: EditorSectionId, focusField = false) => {
    requestAnimationFrame(() => {
      const selector = `[data-editor-section="${section}"]`
      const sectionElement = document.querySelector<HTMLElement>(selector)
      if (!sectionElement) return

      sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' })

      if (!focusField) return
      window.setTimeout(() => {
        const focusableField = sectionElement.querySelector<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >(
          'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled])',
        )
        focusableField?.focus({ preventScroll: true })
      }, 180)
    })
  }

  const openMobileSection = (section: EditorSectionId, focusField = false) => {
    const containerSection =
      section === 'professionalStatement' ? 'personalInfo' : section
    mobileChipsVisibleRef.current = true
    setIsMobileChipsVisible(true)
    setActiveMobileSection(containerSection)
    scrollToSection(section, focusField)
  }

  const toggleMobileSection = (section: EditorSectionId) => {
    setActiveMobileSection((current) => (current === section ? null : section))
  }

  const resolveEditorSectionTitle = (section: EditorSectionId) =>
    getEditorSectionTitle(cvLanguage, section, languageOverrides)

  const sectionHasPreviewHeading = (section: EditorSectionId) =>
    section !== 'professionalStatement'

  const resolveDefaultPreviewSectionTitle = (section: EditorSectionId) =>
    getPreviewSectionTitle(cvLanguage, section)

  const startSectionTitleEdit = (section: EditorSectionId) => {
    if (!sectionHasPreviewHeading(section)) return
    setEditingTitleSection(section)
    setTitleDraft(languageOverrides[section] ?? '')
  }

  const commitSectionTitleEdit = (section: EditorSectionId) => {
    const trimmed = titleDraft.trim()
    if (trimmed.length === 0) {
      clearSectionTitleOverride(section)
    } else {
      setSectionTitleOverride(section, trimmed)
    }
    setEditingTitleSection(null)
    setTitleDraft('')
  }

  const cancelSectionTitleEdit = () => {
    setEditingTitleSection(null)
    setTitleDraft('')
  }

  const renderEditableSectionTitle = (section: EditorSectionId) => {
    const title = resolveEditorSectionTitle(section)

    if (!sectionHasPreviewHeading(section)) {
      return title
    }

    if (editingTitleSection === section) {
      return (
        <div
          className="flex items-center"
          onClick={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <input
            value={titleDraft}
            onChange={(event) => setTitleDraft(event.target.value)}
            onBlur={() => commitSectionTitleEdit(section)}
            placeholder={resolveDefaultPreviewSectionTitle(section)}
            autoFocus
            className="h-8 w-full min-w-[12rem] rounded-md border border-slate-200 bg-white px-2.5 text-sm font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                commitSectionTitleEdit(section)
              } else if (event.key === 'Escape') {
                event.preventDefault()
                cancelSectionTitleEdit()
              }
            }}
          />
        </div>
      )
    }

    return (
      <span className="inline-flex items-center gap-1.5">
        <span>{title}</span>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            startSectionTitleEdit(section)
          }}
          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          title={getEditorControlText(cvLanguage, 'customizeHeading')}
          aria-label={getEditorControlText(cvLanguage, 'customizeHeading')}
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.7}
              d="M16.5 4.5l3 3L8 19H5v-3L16.5 4.5z"
            />
          </svg>
        </button>
      </span>
    )
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
        localization: cvData.localization,
      }

      importData(mergedData)
      setShowLinkedIn(false)
      alert(t('editor.alerts.linkedInImportSuccess'))
    } catch {
      alert(t('editor.alerts.linkedInImportFailed'))
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
    <div className="editor-root" ref={editorRootRef}>
      <Modal
        open={showNewCv}
        title={t('editor.modals.newCv.title')}
        subtitle={t('editor.modals.newCv.subtitle')}
        onClose={() => setShowNewCv(false)}
        closeAriaLabel={t('editor.modals.closeAria')}
      >
        <div className="space-y-4 text-sm text-gray-600">
          <p>{t('editor.modals.newCv.body')}</p>
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
              {t('editor.modals.newCv.downloadCurrent')}
            </button>
          ) : (
            <p className="text-xs text-gray-400">{t('editor.modals.newCv.noContent')}</p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={() => setShowNewCv(false)}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            type="button"
          >
            {t('common.actions.cancel')}
          </button>
          <button
            onClick={handleConfirmNewCv}
            className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
            type="button"
          >
            {t('editor.modals.newCv.startNew')}
          </button>
        </div>
      </Modal>

      <Modal
        open={showSave}
        title={t('editor.modals.saveCv.title')}
        subtitle={t('editor.modals.saveCv.subtitle')}
        onClose={() => setShowSave(false)}
        closeAriaLabel={t('editor.modals.closeAria')}
      >
        <div className="space-y-4 text-sm text-gray-600">
          <p>{t('editor.modals.saveCv.body')}</p>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              {t('editor.modals.saveCv.filename')}
            </label>
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
            {t('editor.modals.saveCv.downloadJson')}
          </button>
        </div>
      </Modal>

      <Modal
        open={showOpenFile}
        title={t('editor.modals.openCv.title')}
        subtitle={t('editor.modals.openCv.subtitle')}
        onClose={() => setShowOpenFile(false)}
        closeAriaLabel={t('editor.modals.closeAria')}
      >
        <div className="space-y-4 text-sm text-gray-600">
          <p>{t('editor.modals.openCv.body')}</p>
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
              {t('editor.modals.newCv.downloadCurrent')}
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
            <span>{t('editor.modals.openCv.dropZone')}</span>
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
        title={t('editor.modals.linkedInImport.title')}
        subtitle={t('editor.modals.linkedInImport.subtitle')}
        onClose={() => setShowLinkedIn(false)}
        closeAriaLabel={t('editor.modals.closeAria')}
      >
        <div className="space-y-4 text-sm text-gray-600">
          <div className="rounded-md bg-slate-50 p-3 text-xs text-slate-600">
            <p className="font-semibold text-slate-700">{t('editor.modals.linkedInImport.howToTitle')}</p>
            <ol className="mt-2 list-inside list-decimal space-y-1">
              <li>{t('editor.modals.linkedInImport.step1')}</li>
              <li>{t('editor.modals.linkedInImport.step2')}</li>
              <li>{t('editor.modals.linkedInImport.step3')}</li>
              <li>{t('editor.modals.linkedInImport.step4')}</li>
            </ol>
          </div>

          <div className="rounded-md bg-white p-3 text-xs text-slate-600">
            <p className="font-semibold text-slate-700">{t('editor.modals.linkedInImport.supportedTitle')}</p>
            <ul className="mt-2 space-y-1">
              <li>{t('editor.modals.linkedInImport.file1')}</li>
              <li>{t('editor.modals.linkedInImport.file2')}</li>
              <li>{t('editor.modals.linkedInImport.file3')}</li>
              <li>{t('editor.modals.linkedInImport.file4')}</li>
              <li>{t('editor.modals.linkedInImport.file5')}</li>
            </ul>
          </div>

          <p className="text-xs text-slate-500">
            {t('editor.modals.linkedInImport.note')}
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
            <span>{t('editor.modals.linkedInImport.dropZone')}</span>
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
        title={t('editor.modals.faq.title')}
        subtitle={t('editor.modals.faq.subtitle')}
        onClose={() => setShowFaq(false)}
        closeAriaLabel={t('editor.modals.closeAria')}
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
            {t('common.actions.close')}
          </button>
        </div>
      </Modal>

      <Modal
        open={showAbout}
        title={t('editor.modals.about.title')}
        subtitle={t('editor.modals.about.subtitle')}
        onClose={() => setShowAbout(false)}
        closeAriaLabel={t('editor.modals.closeAria')}
      >
        <div className="space-y-3 text-sm text-gray-600">
          <p>{t('editor.modals.about.line1')}</p>
          <p>{t('editor.modals.about.line2')}</p>
          <p>{t('editor.modals.about.line3')}</p>
          <p>{t('editor.modals.about.line4')}</p>
          <p>
            {t('editor.modals.about.openSourcePrefix')}{' '}
            <a
              href="https://github.com/Mancherel/fixacv"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              {t('editor.modals.about.openSourceLink')}
            </a>
            .
          </p>
          <p>
            {t('editor.modals.about.bugsPrefix')}{' '}
            <a
              href="https://github.com/Mancherel/fixacv/issues"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              {t('editor.modals.about.bugsLink')}
            </a>
            .
          </p>
          <div className="pt-2">
            <KofiButton onClick={() => window.open(KOFI_URL, '_blank')} />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setShowAbout(false)}
            className="rounded-md bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800"
            type="button"
          >
            {t('editor.modals.about.gotIt')}
          </button>
        </div>
      </Modal>

      <header
        ref={editorHeaderRef}
        className="sticky top-0 z-10 -mx-4 mb-0 border-b border-slate-200 bg-white/95 px-0 py-1.5 backdrop-blur lg:-mx-6 lg:mb-6 lg:px-6 lg:py-3 dark:border-gray-700 dark:bg-gray-800/95"
      >
        <div className="overflow-x-auto no-scrollbar lg:overflow-visible">
          <div className="flex w-max min-w-full items-center gap-1.5 pl-3 pr-3 lg:w-full lg:min-w-0 lg:flex-wrap lg:gap-2 lg:pl-0 lg:pr-0">
            <button
              onClick={() => setShowNewCv(true)}
              className={`${headerButtonBase} border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600`}
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
              {t('editor.headerButtons.newCv')}
            </button>
            <button
              onClick={openSaveModal}
              className={`${headerButtonBase} border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600`}
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
              {t('editor.headerButtons.save')}
            </button>
            <button
              onClick={() => setShowOpenFile(true)}
              className={`${headerButtonBase} border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600`}
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
              {t('editor.headerButtons.openFile')}
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
              {t('editor.headerButtons.importLinkedIn')}
            </button>
            <button
              onClick={() => setShowAbout(true)}
              className={`${headerButtonBase} border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600`}
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
              {t('editor.headerButtons.about')}
            </button>
            <button
              onClick={() => setShowFaq(true)}
              className={`${headerButtonBase} border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600`}
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
              {t('editor.headerButtons.faq')}
            </button>
            <button
              onClick={toggleTheme}
              className={`${headerButtonBase} border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600`}
              type="button"
              aria-label={theme === 'dark' ? t('header.lightMode') : t('header.darkMode')}
            >
              {theme === 'dark' ? (
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              )}
            </button>
            <div className="flex h-8 shrink-0 items-stretch overflow-hidden rounded-md border border-slate-300 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 dark:border-gray-600 dark:bg-gray-700">
              <label
                htmlFor="cv-language-select"
                className="flex items-center border-r border-slate-300 bg-slate-50 px-2.5 text-slate-500 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400"
                aria-label={cvLanguageLabel}
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="9" strokeWidth={1.7} />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M3 12h18" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.7}
                    d="M12 3c2.5 2.6 4 5.7 4 9s-1.5 6.4-4 9c-2.5-2.6-4-5.7-4-9s1.5-6.4 4-9z"
                  />
                </svg>
                <span className="sr-only">{cvLanguageLabel}</span>
              </label>
              <div className="relative flex h-full items-center">
                <select
                  id="cv-language-select"
                  value={cvLanguage}
                  onChange={(event) => setCVLanguage(event.target.value as AppLanguage)}
                  aria-label={cvLanguageLabel}
                  className="editor-language-select h-full w-[7.5rem] appearance-none border-0 bg-white pl-3 pr-10 text-[11px] font-semibold leading-none text-slate-700 focus:outline-none sm:text-xs dark:bg-gray-700 dark:text-gray-300"
                >
                  {SUPPORTED_LANGUAGES.map((languageOption) => (
                    <option key={languageOption} value={languageOption}>
                      {getLanguageDisplayName(cvLanguage, languageOption)}
                    </option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-2 h-4 w-4 text-slate-600"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m6 8 4 4 4-4" />
                </svg>
              </div>
            </div>
            {/* Collapse all is intentionally hidden for now; keep signal for future placement. */}
            <button
              onClick={handleCollapseAll}
              className="hidden"
              type="button"
            />
          </div>
        </div>
      </header>

      {isMobileLayout ? (
        <div
          className={`sticky z-[5] -mx-4 mb-3 border-b border-slate-300 bg-blue-50/90 px-0 py-1 backdrop-blur will-change-transform transition-transform duration-500 ease-out dark:border-gray-600 dark:bg-gray-800/90 ${
            isMobileChipsVisible
              ? 'translate-y-0'
              : 'pointer-events-none -translate-y-[120%]'
          }`}
          style={{ top: `${mobileChipTopOffset}px` }}
        >
          <div className="overflow-x-auto no-scrollbar">
            <div className="flex w-max min-w-full items-center gap-2 pl-3 pr-3">
              {EDITOR_MOBILE_SECTION_ORDER.map((section) => (
                <button
                  key={section}
                  type="button"
                  onClick={() => openMobileSection(section)}
                  className={`inline-flex h-8 shrink-0 items-center rounded-full border px-3 text-xs font-semibold leading-none ${
                    activeMobileSection === section
                      ? 'border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                      : 'border-slate-300 bg-white text-slate-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {resolveEditorSectionTitle(section)}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        <div data-editor-section="personalInfo">
          <Section
            title={renderEditableSectionTitle('personalInfo')}
            collapseSignal={collapseSignal}
            isOpen={isMobileLayout ? activeMobileSection === 'personalInfo' : undefined}
            onToggleOpen={isMobileLayout ? () => toggleMobileSection('personalInfo') : undefined}
          >
            <PersonalInfoForm />
            <div
              data-editor-section="professionalStatement"
              className="mt-6 border-t border-slate-200 pt-4"
            >
              <ProfessionalStatementForm
                isVisible={cvData.sectionVisibility.professionalStatement}
                onToggleVisibility={() => toggleSectionVisibility('professionalStatement')}
              />
            </div>
          </Section>
        </div>

        <div data-editor-section="experiences">
          <Section
            title={renderEditableSectionTitle('experiences')}
            onToggleVisibility={() => toggleSectionVisibility('experiences')}
            isVisible={cvData.sectionVisibility.experiences}
            collapseSignal={collapseSignal}
            isOpen={isMobileLayout ? activeMobileSection === 'experiences' : undefined}
            onToggleOpen={isMobileLayout ? () => toggleMobileSection('experiences') : undefined}
          >
            <ExperienceList />
          </Section>
        </div>

        <div data-editor-section="education">
          <Section
            title={renderEditableSectionTitle('education')}
            onToggleVisibility={() => toggleSectionVisibility('education')}
            isVisible={cvData.sectionVisibility.education}
            collapseSignal={collapseSignal}
            isOpen={isMobileLayout ? activeMobileSection === 'education' : undefined}
            onToggleOpen={isMobileLayout ? () => toggleMobileSection('education') : undefined}
          >
            <EducationList />
          </Section>
        </div>

        <div data-editor-section="competencies">
          <Section
            title={renderEditableSectionTitle('competencies')}
            onToggleVisibility={() => toggleSectionVisibility('competencies')}
            isVisible={cvData.sectionVisibility.competencies}
            collapseSignal={collapseSignal}
            isOpen={isMobileLayout ? activeMobileSection === 'competencies' : undefined}
            onToggleOpen={isMobileLayout ? () => toggleMobileSection('competencies') : undefined}
          >
            <CompetenciesList />
          </Section>
        </div>

        <div data-editor-section="languages">
          <Section
            title={renderEditableSectionTitle('languages')}
            onToggleVisibility={() => toggleSectionVisibility('languages')}
            isVisible={cvData.sectionVisibility.languages}
            collapseSignal={collapseSignal}
            isOpen={isMobileLayout ? activeMobileSection === 'languages' : undefined}
            onToggleOpen={isMobileLayout ? () => toggleMobileSection('languages') : undefined}
          >
            <LanguagesForm />
          </Section>
        </div>

        <div data-editor-section="other">
          <Section
            title={renderEditableSectionTitle('other')}
            onToggleVisibility={() => toggleSectionVisibility('other')}
            isVisible={cvData.sectionVisibility.other}
            collapseSignal={collapseSignal}
            isOpen={isMobileLayout ? activeMobileSection === 'other' : undefined}
            onToggleOpen={isMobileLayout ? () => toggleMobileSection('other') : undefined}
          >
            <OtherForm />
          </Section>
        </div>

        <div data-editor-section="certifications">
          <Section
            title={renderEditableSectionTitle('certifications')}
            onToggleVisibility={() => toggleSectionVisibility('certifications')}
            isVisible={cvData.sectionVisibility.certifications}
            collapseSignal={collapseSignal}
            isOpen={isMobileLayout ? activeMobileSection === 'certifications' : undefined}
            onToggleOpen={isMobileLayout ? () => toggleMobileSection('certifications') : undefined}
          >
            <CertificationsForm />
          </Section>
        </div>

        <div data-editor-section="portfolio">
          <Section
            title={renderEditableSectionTitle('portfolio')}
            onToggleVisibility={() => toggleSectionVisibility('portfolio')}
            isVisible={cvData.sectionVisibility.portfolio}
            collapseSignal={collapseSignal}
            isOpen={isMobileLayout ? activeMobileSection === 'portfolio' : undefined}
            onToggleOpen={isMobileLayout ? () => toggleMobileSection('portfolio') : undefined}
          >
            <PortfolioForm />
          </Section>
        </div>

        <div data-editor-section="preferences">
          <Section
            title={renderEditableSectionTitle('preferences')}
            onToggleVisibility={() => toggleSectionVisibility('preferences')}
            isVisible={cvData.sectionVisibility.preferences}
            collapseSignal={collapseSignal}
            isOpen={isMobileLayout ? activeMobileSection === 'preferences' : undefined}
            onToggleOpen={isMobileLayout ? () => toggleMobileSection('preferences') : undefined}
          >
            <PreferencesForm />
          </Section>
        </div>
      </div>
    </div>
  )
}
