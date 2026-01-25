import { Preview } from './Preview'

export function PreviewPanel() {
  return (
    <div className="relative h-full print-reset">
      <div className="flex items-start justify-center p-8 pb-16 print-reset">
        <Preview />
      </div>
    </div>
  )
}
