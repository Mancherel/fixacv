import { useRef, useState } from 'react'
import { useCVData } from '../context/CVContext'
import { PhotoCropModal } from './PhotoCropModal'
import { useI18n } from '../i18n/useI18n'
import { VisibilityToggle } from './VisibilityToggle'

export function PersonalInfoForm() {
  const { cvData, updatePersonalInfo, togglePersonalInfoVisibility } = useCVData()
  const { t } = useI18n()
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
          <label className="block text-sm font-medium text-gray-700">
            {t('forms.personalInfo.photo')}
          </label>
          <VisibilityToggle
            isVisible={personalInfoVisibility.photo}
            onToggle={() => togglePersonalInfoVisibility('photo')}
          />
        </div>
        <div className="mt-2 flex items-center gap-4">
          <div className="h-16 w-16 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
            {personalInfo.photo ? (
              <img
                src={personalInfo.photo}
                alt={t('forms.personalInfo.profileAlt')}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                {t('forms.personalInfo.noPhoto')}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
              {t('forms.personalInfo.uploadPhoto')}
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
                {t('forms.personalInfo.editPhoto')}
              </button>
            )}
            {personalInfo.photo && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
              >
                {t('forms.personalInfo.removePhoto')}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={personalInfoVisibility.name ? '' : 'opacity-60'}>
        <div className="flex items-center justify-between">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            {t('forms.personalInfo.name')}
          </label>
          <VisibilityToggle
            isVisible={personalInfoVisibility.name}
            onToggle={() => togglePersonalInfoVisibility('name')}
          />
        </div>
        <input
          type="text"
          id="name"
          value={personalInfo.name}
          onChange={(e) => updatePersonalInfo({ name: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder={t('forms.personalInfo.namePlaceholder')}
        />
      </div>

      <div className={personalInfoVisibility.professionalTitle ? '' : 'opacity-60'}>
        <div className="flex items-center justify-between">
          <label htmlFor="professionalTitle" className="block text-sm font-medium text-gray-700">
            {t('forms.personalInfo.professionalTitle')}
          </label>
          <VisibilityToggle
            isVisible={personalInfoVisibility.professionalTitle}
            onToggle={() => togglePersonalInfoVisibility('professionalTitle')}
          />
        </div>
        <input
          type="text"
          id="professionalTitle"
          value={personalInfo.professionalTitle}
          onChange={(e) => updatePersonalInfo({ professionalTitle: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder={t('forms.personalInfo.professionalTitlePlaceholder')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className={personalInfoVisibility.email ? '' : 'opacity-60'}>
          <div className="flex items-center justify-between">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              {t('forms.personalInfo.email')}
            </label>
            <VisibilityToggle
              isVisible={personalInfoVisibility.email}
              onToggle={() => togglePersonalInfoVisibility('email')}
            />
          </div>
          <input
            type="email"
            id="email"
            value={personalInfo.email}
            onChange={(e) => updatePersonalInfo({ email: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder={t('forms.personalInfo.emailPlaceholder')}
          />
        </div>

        <div className={personalInfoVisibility.phone ? '' : 'opacity-60'}>
          <div className="flex items-center justify-between">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              {t('forms.personalInfo.phone')}
            </label>
            <VisibilityToggle
              isVisible={personalInfoVisibility.phone}
              onToggle={() => togglePersonalInfoVisibility('phone')}
            />
          </div>
          <input
            type="tel"
            id="phone"
            value={personalInfo.phone}
            onChange={(e) => updatePersonalInfo({ phone: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder={t('forms.personalInfo.phonePlaceholder')}
          />
        </div>
      </div>

      <div className={personalInfoVisibility.linkedin ? '' : 'opacity-60'}>
        <div className="flex items-center justify-between">
          <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700">
            {t('forms.personalInfo.linkedin')}
          </label>
          <VisibilityToggle
            isVisible={personalInfoVisibility.linkedin}
            onToggle={() => togglePersonalInfoVisibility('linkedin')}
          />
        </div>
        <input
          type="url"
          id="linkedin"
          value={personalInfo.linkedin || ''}
          onChange={(e) => updatePersonalInfo({ linkedin: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder={t('forms.personalInfo.linkedinPlaceholder')}
        />
      </div>

      <div className={personalInfoVisibility.website ? '' : 'opacity-60'}>
        <div className="flex items-center justify-between">
          <label htmlFor="website" className="block text-sm font-medium text-gray-700">
            {t('forms.personalInfo.website')}
          </label>
          <VisibilityToggle
            isVisible={personalInfoVisibility.website}
            onToggle={() => togglePersonalInfoVisibility('website')}
          />
        </div>
        <input
          type="url"
          id="website"
          value={personalInfo.website || ''}
          onChange={(e) => updatePersonalInfo({ website: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder={t('forms.personalInfo.websitePlaceholder')}
        />
      </div>

      <div className={personalInfoVisibility.location ? '' : 'opacity-60'}>
        <div className="flex items-center justify-between">
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            {t('forms.personalInfo.location')}
          </label>
          <VisibilityToggle
            isVisible={personalInfoVisibility.location}
            onToggle={() => togglePersonalInfoVisibility('location')}
          />
        </div>
        <input
          type="text"
          id="location"
          value={personalInfo.location || ''}
          onChange={(e) => updatePersonalInfo({ location: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder={t('forms.personalInfo.locationPlaceholder')}
        />
      </div>
    </div>
  )
}
