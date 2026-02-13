import { useState } from 'react'
import { KofiButton } from './KofiButton'
import { useI18n } from '../i18n/useI18n'

const KOFI_IFRAME_SRC =
  'https://ko-fi.com/mancherel/?hidefeed=true&widget=true&embed=true&preview=true'

export function SiteHeader() {
  const [showKofi, setShowKofi] = useState(false)
  const { t } = useI18n()

  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      {showKofi && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setShowKofi(false)}
        >
          <div
            className="relative h-[690px] w-[328px] overflow-hidden rounded-2xl bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowKofi(false)}
              className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-600 shadow-md hover:bg-slate-100"
              aria-label={t('header.closeDialog')}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <iframe
              id="kofiframe"
              src={KOFI_IFRAME_SRC}
              title={t('editor.modals.about.supportMe')}
              style={{ border: 'none', width: '100%', height: '100%', padding: '0', background: 'transparent' }}
            />
          </div>
        </div>
      )}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur print-hidden header-reveal">
        <div className="flex flex-col gap-2 px-4 py-2 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm sm:h-10 sm:w-10">
              <span className="logo-glow" aria-hidden="true" />
              <svg
                className="h-[18px] w-[18px] sm:h-5 sm:w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 3h7l5 5v13H7z" />
                <path d="M14 3v6h6" />
                <path d="M5 20l6-6" />
                <path d="M4 16l4 4" />
                <path d="M10 10h4" />
                <path d="M10 13h6" />
              </svg>
            </div>
            <div className="min-w-0 leading-none">
              <p className="text-2xl text-gray-900 sm:text-[2rem]">
                <span className="font-semibold">fixacv</span>
                <span className="text-amber-400">.app</span>
              </p>
              <p className="hidden pt-0 text-xs text-slate-400 info-reveal sm:block">
                {t('header.tagline')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-end">
            <div className="min-w-0">
              <KofiButton onClick={() => setShowKofi(true)} />
            </div>
            <button
              type="button"
              onClick={handlePrint}
              className="flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-md bg-blue-600 px-2.5 text-xs font-semibold leading-none whitespace-nowrap text-white shadow-md shadow-blue-200/60 hover:bg-blue-700 btn-lift sm:px-3.5 sm:text-sm"
            >
              <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 8V4h10v4M6 16h12v4H6v-4z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M5 12h14a2 2 0 012 2v2H3v-2a2 2 0 012-2z"
                />
              </svg>
              <span className="sm:hidden">{t('header.printPdfMobile')}</span>
              <span className="hidden sm:inline">{t('header.printPdfDesktop')}</span>
            </button>
          </div>
        </div>
      </header>

    </>
  )
}
