import type { CVData } from '../types'

const STORAGE_KEY = 'fixacv-data'
const STORAGE_VERSION_KEY = 'fixacv-version'
const CURRENT_VERSION = 1

const STORAGE_WARNING_THRESHOLD = 0.8
const PHOTO_SIZE_LIMIT = 500 * 1024

export interface StorageWarning {
  type: 'quota' | 'photo' | 'corrupted'
  message: string
  details?: string
}

export interface StorageStats {
  usedBytes: number
  availableBytes: number | null
  totalBytes: number | null
  usagePercent: number | null
}

function getStringByteSize(str: string): number {
  return new Blob([str]).size
}

function getPhotoSize(photo: string | undefined): number {
  if (!photo) return 0
  if (photo.startsWith('data:')) {
    const base64 = photo.split(',')[1] || ''
    return Math.ceil((base64.length * 3) / 4)
  }
  return photo.length
}

function validatePhotoSize(photo: string | undefined): StorageWarning | null {
  if (!photo) return null
  const size = getPhotoSize(photo)
  if (size > PHOTO_SIZE_LIMIT) {
    return {
      type: 'photo',
      message: `Photo size (${Math.round(size / 1024)}KB) exceeds recommended limit (${Math.round(PHOTO_SIZE_LIMIT / 1024)}KB)`,
      details: 'Large photos may cause storage issues. Consider using a smaller image.',
    }
  }
  return null
}

function isCorruptedData(data: unknown): boolean {
  if (data === null || data === undefined) return false
  if (typeof data !== 'object') return true
  return false
}

function migrateData(data: unknown, fromVersion: number): CVData | null {
  if (fromVersion === CURRENT_VERSION) {
    return data as CVData
  }
  
  if (fromVersion < CURRENT_VERSION) {
    return data as CVData
  }
  
  return null
}

export const storage = {
  save: (data: CVData): StorageWarning[] => {
    const warnings: StorageWarning[] = []
    
    const photoWarning = validatePhotoSize(data.personalInfo?.photo)
    if (photoWarning) warnings.push(photoWarning)
    
    try {
      const serialized = JSON.stringify(data)
      const dataSize = getStringByteSize(serialized)
      
      try {
        const testKey = `fixacv-test-${Date.now()}`
        localStorage.setItem(testKey, serialized)
        localStorage.removeItem(testKey)
      } catch (e) {
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
          warnings.push({
            type: 'quota',
            message: 'Storage quota exceeded. Cannot save CV data.',
            details: 'Try removing the photo or reducing the amount of content.',
          })
          return warnings
        }
      }
      
      localStorage.setItem(STORAGE_KEY, serialized)
      localStorage.setItem(STORAGE_VERSION_KEY, String(CURRENT_VERSION))
      
      const estimatedTotal = 5 * 1024 * 1024
      const usagePercent = (dataSize / estimatedTotal) * 100
      
      if (usagePercent > STORAGE_WARNING_THRESHOLD * 100) {
        warnings.push({
          type: 'quota',
          message: `Storage usage is at ${usagePercent.toFixed(0)}% of estimated limit`,
          details: `Using ${(dataSize / 1024).toFixed(1)}KB of ~5MB. Consider exporting a backup.`,
        })
      }
    } catch (error) {
      console.error('Failed to save CV data:', error)
      warnings.push({
        type: 'quota',
        message: 'Failed to save CV data',
        details: error instanceof Error ? error.message : 'Unknown error',
      })
    }
    
    return warnings
  },

  load: (): CVData | null => {
    try {
      const versionStr = localStorage.getItem(STORAGE_VERSION_KEY)
      const storedVersion = versionStr ? parseInt(versionStr, 10) : 0
      
      const data = localStorage.getItem(STORAGE_KEY)
      if (!data) return null
      
      const parsed = JSON.parse(data)
      
      if (isCorruptedData(parsed)) {
        console.error('Corrupted data detected in storage')
        return null
      }
      
      return migrateData(parsed, storedVersion)
    } catch (error) {
      console.error('Failed to load CV data:', error)
      return null
    }
  },

  clear: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(STORAGE_VERSION_KEY)
    } catch (error) {
      console.error('Failed to clear CV data:', error)
    }
  },

  getStats: (): StorageStats => {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      const usedBytes = data ? getStringByteSize(data) : 0
      
      const estimatedTotal = 5 * 1024 * 1024
      
      return {
        usedBytes,
        availableBytes: estimatedTotal - usedBytes,
        totalBytes: estimatedTotal,
        usagePercent: (usedBytes / estimatedTotal) * 100,
      }
    } catch {
      return {
        usedBytes: 0,
        availableBytes: null,
        totalBytes: null,
        usagePercent: null,
      }
    }
  },

  getPhotoSize,
  
  PHOTO_SIZE_LIMIT,
  
  STORAGE_WARNING_THRESHOLD,
}
