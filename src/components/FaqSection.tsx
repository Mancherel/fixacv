import { useI18n } from '../i18n/useI18n'

const FAQ_ITEMS = ['whatIs', 'account', 'exportPdf', 'linkedIn', 'languages'] as const

export function FaqSection() {
  const { t } = useI18n()

  return (
    <div className="space-y-6 text-sm text-slate-600">
      <section>
        <dl className="space-y-4">
          {FAQ_ITEMS.map((item) => (
            <div key={item}>
              <dt className="font-semibold text-slate-800">{t(`faq.items.${item}.q`)}</dt>
              <dd className="mt-1">{t(`faq.items.${item}.a`)}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}
