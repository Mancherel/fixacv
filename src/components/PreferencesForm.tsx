import { useCVData } from '../context/CVContext'
import { useI18n } from '../i18n/useI18n'
import { VisibilityToggle } from './VisibilityToggle'

export function PreferencesForm() {
  const { cvData, updatePreferences } = useCVData()
  const { t } = useI18n()
  const { preferences } = cvData
  const workModeOptions = [
    { value: '', label: t('forms.preferences.workModeFlexible') },
    { value: 'Remote', label: t('forms.preferences.workModeRemote') },
    { value: 'Hybrid', label: t('forms.preferences.workModeHybrid') },
    { value: 'On-site', label: t('forms.preferences.workModeOnSite') },
  ]

  return (
    <div className="space-y-4">
      <div className={preferences.workMode.visible ? '' : 'opacity-60'}>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            {t('forms.preferences.workMode')}
          </label>
          <VisibilityToggle
            isVisible={preferences.workMode.visible}
            onToggle={() =>
              updatePreferences({
                ...preferences,
                workMode: {
                  ...preferences.workMode,
                  visible: !preferences.workMode.visible,
                },
              })
            }
          />
        </div>
        <select
          value={preferences.workMode.value}
          onChange={(e) =>
            updatePreferences({
              ...preferences,
              workMode: { ...preferences.workMode, value: e.target.value },
            })
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {workModeOptions.map((mode) => (
            <option key={mode.value || 'flexible'} value={mode.value}>
              {mode.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-400">{t('forms.preferences.workModeHint')}</p>
      </div>

      <div className={preferences.availability.visible ? '' : 'opacity-60'}>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            {t('forms.preferences.availability')}
          </label>
          <VisibilityToggle
            isVisible={preferences.availability.visible}
            onToggle={() =>
              updatePreferences({
                ...preferences,
                availability: {
                  ...preferences.availability,
                  visible: !preferences.availability.visible,
                },
              })
            }
          />
        </div>
        <input
          type="text"
          value={preferences.availability.value}
          onChange={(e) =>
            updatePreferences({
              ...preferences,
              availability: { ...preferences.availability, value: e.target.value },
            })
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder={t('forms.preferences.availabilityPlaceholder')}
        />
      </div>

      <div className={preferences.locationPreference.visible ? '' : 'opacity-60'}>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            {t('forms.preferences.locationPreference')}
          </label>
          <VisibilityToggle
            isVisible={preferences.locationPreference.visible}
            onToggle={() =>
              updatePreferences({
                ...preferences,
                locationPreference: {
                  ...preferences.locationPreference,
                  visible: !preferences.locationPreference.visible,
                },
              })
            }
          />
        </div>
        <input
          type="text"
          value={preferences.locationPreference.value}
          onChange={(e) =>
            updatePreferences({
              ...preferences,
              locationPreference: {
                ...preferences.locationPreference,
                value: e.target.value,
              },
            })
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder={t('forms.preferences.locationPreferencePlaceholder')}
        />
      </div>
    </div>
  )
}
