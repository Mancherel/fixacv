import type { AppLanguage } from '../types'

const monthNames: Record<AppLanguage, string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  sv: ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'],
}

const durationUnits: Record<
  AppLanguage,
  { ongoing: string; year: string; month: string; lessThanOneMonth: string }
> = {
  en: {
    ongoing: 'Ongoing',
    year: 'yr',
    month: 'mo',
    lessThanOneMonth: '< 1 mo',
  },
  sv: {
    ongoing: 'Pågående',
    year: 'år',
    month: 'mån',
    lessThanOneMonth: '< 1 mån',
  },
}

const parseMonthYear = (date: string) => {
  if (!date) return null
  const match = /^(\d{4})-(\d{2})$/.exec(date)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  if (!Number.isFinite(year) || month < 1 || month > 12) return null
  return { year, month }
}

const formatMonthYear = (date: string, language: AppLanguage) => {
  const parsed = parseMonthYear(date)
  if (!parsed) return ''
  return `${monthNames[language][parsed.month - 1]} ${parsed.year}`
}

export function formatDateRange(
  startDate: string,
  endDate: string | null,
  language: AppLanguage = 'en',
): string {
  const start = formatMonthYear(startDate, language)
  if (!start) return ''

  if (!endDate) {
    return `${start} - ${durationUnits[language].ongoing}`
  }

  const end = formatMonthYear(endDate, language)
  if (!end) {
    return start
  }

  return `${start} - ${end}`
}

export function calculateDuration(
  startDate: string,
  endDate: string | null,
  language: AppLanguage = 'en',
): string {
  const startParts = parseMonthYear(startDate)
  if (!startParts) return ''
  const start = new Date(startParts.year, startParts.month - 1, 1)

  let end: Date | null = null
  if (!endDate) {
    end = new Date()
  } else {
    const endParts = parseMonthYear(endDate)
    if (!endParts) return ''
    end = new Date(endParts.year, endParts.month - 1, 1)
  }

  let months = (end.getFullYear() - start.getFullYear()) * 12
  months += end.getMonth() - start.getMonth()
  if (months < 0) return ''

  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  if (years > 0 && remainingMonths > 0) {
    return `${years} ${durationUnits[language].year} ${remainingMonths} ${durationUnits[language].month}`
  }
  if (years > 0) {
    return `${years} ${durationUnits[language].year}`
  }
  if (remainingMonths > 0) {
    return `${remainingMonths} ${durationUnits[language].month}`
  }
  return durationUnits[language].lessThanOneMonth
}

export function formatDateRangeWithDuration(
  startDate: string,
  endDate: string | null,
  language: AppLanguage = 'en',
): string {
  const range = formatDateRange(startDate, endDate, language)
  if (!range) return ''
  const duration = calculateDuration(startDate, endDate, language)
  return duration ? `${range} • ${duration}` : range
}
