import { useCVData } from '../context/CVContext'

const WORK_MODES = ['Flexible', 'Remote', 'Hybrid', 'On-site']

export function PreferencesForm() {
  const { cvData, updatePreferences } = useCVData()
  const { preferences } = cvData

  return (
    <div className="space-y-4">
      <div className={preferences.workMode.visible ? '' : 'opacity-60'}>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">Work mode</label>
          <button
            type="button"
            onClick={() =>
              updatePreferences({
                ...preferences,
                workMode: {
                  ...preferences.workMode,
                  visible: !preferences.workMode.visible,
                },
              })
            }
            className={`relative inline-flex h-4 w-7 items-center rounded-full border transition-colors ${
              preferences.workMode.visible
                ? 'border-emerald-300 bg-emerald-200 hover:bg-emerald-300'
                : 'border-gray-300 bg-gray-200 hover:bg-gray-300'
            }`}
            title={preferences.workMode.visible ? 'Hide from CV' : 'Show in CV'}
            aria-label={preferences.workMode.visible ? 'Visible' : 'Hidden'}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${
                preferences.workMode.visible ? 'translate-x-3.5' : 'translate-x-1'
              }`}
            />
          </button>
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
          {WORK_MODES.map((mode) => (
            <option key={mode} value={mode === 'Flexible' ? '' : mode}>
              {mode}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-400">Leave as Flexible if you have no preference.</p>
      </div>

      <div className={preferences.availability.visible ? '' : 'opacity-60'}>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Availability / notice period
          </label>
          <button
            type="button"
            onClick={() =>
              updatePreferences({
                ...preferences,
                availability: {
                  ...preferences.availability,
                  visible: !preferences.availability.visible,
                },
              })
            }
            className={`relative inline-flex h-4 w-7 items-center rounded-full border transition-colors ${
              preferences.availability.visible
                ? 'border-emerald-300 bg-emerald-200 hover:bg-emerald-300'
                : 'border-gray-300 bg-gray-200 hover:bg-gray-300'
            }`}
            title={preferences.availability.visible ? 'Hide from CV' : 'Show in CV'}
            aria-label={preferences.availability.visible ? 'Visible' : 'Hidden'}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${
                preferences.availability.visible ? 'translate-x-3.5' : 'translate-x-1'
              }`}
            />
          </button>
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
          placeholder="e.g., 1 month notice"
        />
      </div>

      <div className={preferences.locationPreference.visible ? '' : 'opacity-60'}>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">Location preference</label>
          <button
            type="button"
            onClick={() =>
              updatePreferences({
                ...preferences,
                locationPreference: {
                  ...preferences.locationPreference,
                  visible: !preferences.locationPreference.visible,
                },
              })
            }
            className={`relative inline-flex h-4 w-7 items-center rounded-full border transition-colors ${
              preferences.locationPreference.visible
                ? 'border-emerald-300 bg-emerald-200 hover:bg-emerald-300'
                : 'border-gray-300 bg-gray-200 hover:bg-gray-300'
            }`}
            title={preferences.locationPreference.visible ? 'Hide from CV' : 'Show in CV'}
            aria-label={preferences.locationPreference.visible ? 'Visible' : 'Hidden'}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${
                preferences.locationPreference.visible ? 'translate-x-3.5' : 'translate-x-1'
              }`}
            />
          </button>
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
          placeholder="e.g., Stockholm area"
        />
      </div>
    </div>
  )
}
