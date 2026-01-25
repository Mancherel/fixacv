import type { CVData } from '../types'

const STORAGE_KEY = 'fixacv-data'

export const storage = {
  save: (data: CVData): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save CV data:', error)
    }
  },

  load: (): CVData | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Failed to load CV data:', error)
      return null
    }
  },

  clear: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear CV data:', error)
    }
  },
}
