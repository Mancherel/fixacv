import { ReactNode } from 'react'
import { SiteHeader } from './SiteHeader'

interface LayoutProps {
  editor: ReactNode
  preview: ReactNode
}

export function Layout({ editor, preview }: LayoutProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50 print-reset">
      <SiteHeader />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left Panel - Editor */}
        <div className="w-[35%] min-h-0 overflow-y-auto border-r border-slate-200 bg-slate-50 print-hidden">
          <div className="px-6 pb-6 pt-0">{editor}</div>
        </div>

        {/* Right Panel - Preview */}
        <div className="w-[65%] min-h-0 overflow-y-auto bg-gray-100 pb-16 print-full print-reset">
          {preview}
        </div>
      </div>
    </div>
  )
}
