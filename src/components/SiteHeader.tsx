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
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur print-hidden header-reveal dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <img
              src="/fixacv.app.logo.png"
              alt=""
              className="h-[36px] sm:h-[44px] w-auto"
            />
            <div className="min-w-0">
              <p className="flex items-baseline text-2xl font-bold tracking-tight leading-[1] sm:text-[2rem]">
                <span className="text-gray-600 dark:text-gray-300">fixa</span>
                <span className="text-blue-600 dark:text-blue-400">cv</span>
                <span className="text-[0.55em] text-blue-600/70 dark:text-blue-400/70">.app</span>
              </p>
              <p className="hidden pt-0 text-xs text-slate-400 font-normal info-reveal sm:block dark:text-slate-400">
                {t('header.tagline')}
              </p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <KofiButton onClick={() => setShowKofi(true)} />
            <button
              type="button"
              onClick={handlePrint}
              className="flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-md bg-blue-600 px-2.5 text-xs font-semibold leading-none whitespace-nowrap text-white shadow-md shadow-blue-200/60 hover:bg-blue-700 btn-lift sm:px-3.5 sm:text-xs dark:shadow-blue-900/40"
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
