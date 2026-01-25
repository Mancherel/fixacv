import { useState } from 'react'
import { KofiButton } from './KofiButton'

const KOFI_IFRAME_SRC =
  'https://ko-fi.com/mancherel/?hidefeed=true&widget=true&embed=true&preview=true'

export function SiteHeader() {
  const [showKofi, setShowKofi] = useState(false)

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
              aria-label="Close"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <iframe
              id="kofiframe"
              src={KOFI_IFRAME_SRC}
              title="mancherel"
              style={{ border: 'none', width: '100%', height: '100%', padding: '0', background: 'transparent' }}
            />
          </div>
        </div>
      )}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur print-hidden header-reveal">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-1.5">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
              <span className="logo-glow" aria-hidden="true" />
              <svg
                className="h-5 w-5"
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
            <div className="leading-none">
              <p className="text-2xl text-gray-900">
                <span className="font-semibold">fixacv</span>
                <span className="text-amber-400">.app</span>
              </p>
              <p className="pt-0 text-xs text-slate-400 info-reveal">
                Free CV builder. Your data stays with you.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <KofiButton onClick={() => setShowKofi(true)} />
            <button
              type="button"
              onClick={handlePrint}
              className="flex h-10 items-center gap-1.5 rounded-md bg-blue-600 px-4 text-sm font-semibold leading-none text-white shadow-md shadow-blue-200/60 hover:bg-blue-700 btn-lift"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
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
              Print / Save PDF
            </button>
          </div>
        </div>
      </header>

    </>
  )
}
