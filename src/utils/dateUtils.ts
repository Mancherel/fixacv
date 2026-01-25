export function formatDateRange(startDate: string, endDate: string | null): string {
  const formatDate = (date: string) => {
    const [year, month] = date.split('-')
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec']
    return `${monthNames[parseInt(month) - 1]} ${year}`
  }

  const start = formatDate(startDate)
  const end = endDate ? formatDate(endDate) : 'Pågående'
  return `${start} - ${end}`
}

export function calculateDuration(startDate: string, endDate: string | null): string {
  const start = new Date(startDate + '-01')
  const end = endDate ? new Date(endDate + '-01') : new Date()

  let months = (end.getFullYear() - start.getFullYear()) * 12
  months += end.getMonth() - start.getMonth()

  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  if (years > 0 && remainingMonths > 0) {
    return `${years} år ${remainingMonths} mån`
  } else if (years > 0) {
    return `${years} år`
  } else if (remainingMonths > 0) {
    return `${remainingMonths} mån`
  } else {
    return '< 1 mån'
  }
}

export function formatDateRangeWithDuration(startDate: string, endDate: string | null): string {
  const range = formatDateRange(startDate, endDate)
  const duration = calculateDuration(startDate, endDate)
  return `${range} • ${duration}`
}
