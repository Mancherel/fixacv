import { useRef, useState } from 'react'
import { useCVData } from '../context/CVContext'
import { PhotoCropModal } from './PhotoCropModal'

export function PersonalInfoForm() {
  const { cvData, updatePersonalInfo, togglePersonalInfoVisibility } = useCVData()
  const { personalInfo } = cvData
  const { personalInfoVisibility } = cvData
  const [pendingPhoto, setPendingPhoto] = useState<File | string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setPendingPhoto(file)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemovePhoto = () => {
    updatePersonalInfo({ photo: '' })
  }

  return (
    <div className="space-y-4">
      {pendingPhoto && (
        <PhotoCropModal
          source={pendingPhoto}
          onCancel={() => setPendingPhoto(null)}
          onSave={(dataUrl) => {
            updatePersonalInfo({ photo: dataUrl })
            setPendingPhoto(null)
          }}
        />
      )}

      <div className={personalInfoVisibility.photo ? '' : 'opacity-60'}>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">Photo</label>
          <button
            type="button"
            onClick={() => togglePersonalInfoVisibility('photo')}
            className={`relative inline-flex h-4 w-7 items-center rounded-full border transition-colors ${
              personalInfoVisibility.photo
                ? 'border-emerald-300 bg-emerald-200 hover:bg-emerald-300'
                : 'border-gray-300 bg-gray-200 hover:bg-gray-300'
            }`}
            title={personalInfoVisibility.photo ? 'Hide from CV' : 'Show in CV'}
            aria-label={personalInfoVisibility.photo ? 'Visible' : 'Hidden'}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${
                personalInfoVisibility.photo ? 'translate-x-3.5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <div className="mt-2 flex items-center gap-4">
          <div className="h-16 w-16 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
            {personalInfo.photo ? (
              <img
                src={personalInfo.photo}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                No photo
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
              Upload Photo
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
            {personalInfo.photo && (
              <button
                type="button"
                onClick={() => setPendingPhoto(personalInfo.photo || '')}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Edit
              </button>
            )}
            {personalInfo.photo && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={personalInfoVisibility.name ? '' : 'opacity-60'}>
        <div className="flex items-center justify-between">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <button
            type="button"
            onClick={() => togglePersonalInfoVisibility('name')}
            className={`relative inline-flex h-4 w-7 items-center rounded-full border transition-colors ${
              personalInfoVisibility.name
                ? 'border-emerald-300 bg-emerald-200 hover:bg-emerald-300'
                : 'border-gray-300 bg-gray-200 hover:bg-gray-300'
            }`}
            title={personalInfoVisibility.name ? 'Hide from CV' : 'Show in CV'}
            aria-label={personalInfoVisibility.name ? 'Visible' : 'Hidden'}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${
                personalInfoVisibility.name ? 'translate-x-3.5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <input
          type="text"
          id="name"
          value={personalInfo.name}
          onChange={(e) => updatePersonalInfo({ name: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Your full name"
        />
      </div>

      <div className={personalInfoVisibility.professionalTitle ? '' : 'opacity-60'}>
        <div className="flex items-center justify-between">
          <label htmlFor="professionalTitle" className="block text-sm font-medium text-gray-700">
            Professional Title
          </label>
          <button
            type="button"
            onClick={() => togglePersonalInfoVisibility('professionalTitle')}
            className={`relative inline-flex h-4 w-7 items-center rounded-full border transition-colors ${
              personalInfoVisibility.professionalTitle
                ? 'border-emerald-300 bg-emerald-200 hover:bg-emerald-300'
                : 'border-gray-300 bg-gray-200 hover:bg-gray-300'
            }`}
            title={personalInfoVisibility.professionalTitle ? 'Hide from CV' : 'Show in CV'}
            aria-label={personalInfoVisibility.professionalTitle ? 'Visible' : 'Hidden'}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${
                personalInfoVisibility.professionalTitle ? 'translate-x-3.5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <input
          type="text"
          id="professionalTitle"
          value={personalInfo.professionalTitle}
          onChange={(e) => updatePersonalInfo({ professionalTitle: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="e.g., Senior Frontend Developer"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className={personalInfoVisibility.email ? '' : 'opacity-60'}>
          <div className="flex items-center justify-between">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <button
              type="button"
              onClick={() => togglePersonalInfoVisibility('email')}
              className={`relative inline-flex h-4 w-7 items-center rounded-full border transition-colors ${
                personalInfoVisibility.email
                  ? 'border-emerald-300 bg-emerald-200 hover:bg-emerald-300'
                  : 'border-gray-300 bg-gray-200 hover:bg-gray-300'
              }`}
              title={personalInfoVisibility.email ? 'Hide from CV' : 'Show in CV'}
              aria-label={personalInfoVisibility.email ? 'Visible' : 'Hidden'}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${
                  personalInfoVisibility.email ? 'translate-x-3.5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <input
            type="email"
            id="email"
            value={personalInfo.email}
            onChange={(e) => updatePersonalInfo({ email: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="your@email.com"
          />
        </div>

        <div className={personalInfoVisibility.phone ? '' : 'opacity-60'}>
          <div className="flex items-center justify-between">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <button
              type="button"
              onClick={() => togglePersonalInfoVisibility('phone')}
              className={`relative inline-flex h-4 w-7 items-center rounded-full border transition-colors ${
                personalInfoVisibility.phone
                  ? 'border-emerald-300 bg-emerald-200 hover:bg-emerald-300'
                  : 'border-gray-300 bg-gray-200 hover:bg-gray-300'
              }`}
              title={personalInfoVisibility.phone ? 'Hide from CV' : 'Show in CV'}
              aria-label={personalInfoVisibility.phone ? 'Visible' : 'Hidden'}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${
                  personalInfoVisibility.phone ? 'translate-x-3.5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <input
            type="tel"
            id="phone"
            value={personalInfo.phone}
            onChange={(e) => updatePersonalInfo({ phone: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="+46 70 123 45 67"
          />
        </div>
      </div>

      <div className={personalInfoVisibility.linkedin ? '' : 'opacity-60'}>
        <div className="flex items-center justify-between">
          <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700">
            LinkedIn
          </label>
          <button
            type="button"
            onClick={() => togglePersonalInfoVisibility('linkedin')}
            className={`relative inline-flex h-4 w-7 items-center rounded-full border transition-colors ${
              personalInfoVisibility.linkedin
                ? 'border-emerald-300 bg-emerald-200 hover:bg-emerald-300'
                : 'border-gray-300 bg-gray-200 hover:bg-gray-300'
            }`}
            title={personalInfoVisibility.linkedin ? 'Hide from CV' : 'Show in CV'}
            aria-label={personalInfoVisibility.linkedin ? 'Visible' : 'Hidden'}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${
                personalInfoVisibility.linkedin ? 'translate-x-3.5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <input
          type="url"
          id="linkedin"
          value={personalInfo.linkedin || ''}
          onChange={(e) => updatePersonalInfo({ linkedin: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="https://linkedin.com/in/yourprofile"
        />
      </div>

      <div className={personalInfoVisibility.website ? '' : 'opacity-60'}>
        <div className="flex items-center justify-between">
          <label htmlFor="website" className="block text-sm font-medium text-gray-700">
            Website
          </label>
          <button
            type="button"
            onClick={() => togglePersonalInfoVisibility('website')}
            className={`relative inline-flex h-4 w-7 items-center rounded-full border transition-colors ${
              personalInfoVisibility.website
                ? 'border-emerald-300 bg-emerald-200 hover:bg-emerald-300'
                : 'border-gray-300 bg-gray-200 hover:bg-gray-300'
            }`}
            title={personalInfoVisibility.website ? 'Hide from CV' : 'Show in CV'}
            aria-label={personalInfoVisibility.website ? 'Visible' : 'Hidden'}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${
                personalInfoVisibility.website ? 'translate-x-3.5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <input
          type="url"
          id="website"
          value={personalInfo.website || ''}
          onChange={(e) => updatePersonalInfo({ website: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="https://yourwebsite.com"
        />
      </div>

      <div className={personalInfoVisibility.location ? '' : 'opacity-60'}>
        <div className="flex items-center justify-between">
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <button
            type="button"
            onClick={() => togglePersonalInfoVisibility('location')}
            className={`relative inline-flex h-4 w-7 items-center rounded-full border transition-colors ${
              personalInfoVisibility.location
                ? 'border-emerald-300 bg-emerald-200 hover:bg-emerald-300'
                : 'border-gray-300 bg-gray-200 hover:bg-gray-300'
            }`}
            title={personalInfoVisibility.location ? 'Hide from CV' : 'Show in CV'}
            aria-label={personalInfoVisibility.location ? 'Visible' : 'Hidden'}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${
                personalInfoVisibility.location ? 'translate-x-3.5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <input
          type="text"
          id="location"
          value={personalInfo.location || ''}
          onChange={(e) => updatePersonalInfo({ location: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Stockholm, Sweden"
        />
      </div>
    </div>
  )
}
