const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const parseMonthYear = (date: string) => {
  if (!date) return null
  const match = /^(\d{4})-(\d{2})$/.exec(date)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  if (!Number.isFinite(year) || month < 1 || month > 12) return null
  return { year, month }
}

const formatMonthYear = (date: string) => {
  const parsed = parseMonthYear(date)
  if (!parsed) return ''
  return `${monthNames[parsed.month - 1]} ${parsed.year}`
}

export function formatDateRange(startDate: string, endDate: string | null): string {
  const start = formatMonthYear(startDate)
  if (!start) return ''

  if (!endDate) {
    return `${start} - Ongoing`
  }

  const end = formatMonthYear(endDate)
  if (!end) {
    return start
  }

  return `${start} - ${end}`
}

export function calculateDuration(startDate: string, endDate: string | null): string {
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
    return `${years} yr ${remainingMonths} mo`
  } else if (years > 0) {
    return `${years} yr`
  } else if (remainingMonths > 0) {
    return `${remainingMonths} mo`
  }
  return '< 1 mo'
}

export function formatDateRangeWithDuration(startDate: string, endDate: string | null): string {
  const range = formatDateRange(startDate, endDate)
  if (!range) return ''
  const duration = calculateDuration(startDate, endDate)
  return duration ? `${range} • ${duration}` : range
}
