export function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}

export function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.trim().split('\n')
  if (lines.length < 2) return []

  const headers = parseCSVLine(lines[0])
  const rows: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length === headers.length) {
      const row: Record<string, string> = {}
      headers.forEach((header, index) => {
        row[header] = values[index]
      })
      rows.push(row)
    }
  }

  return rows
}

export function parseLinkedInDate(dateStr: string | null): string | null {
  if (!dateStr) return null

  const parts = dateStr.trim().split(' ')

  if (parts.length === 2) {
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ]
    const monthIndex = monthNames.indexOf(parts[0])
    if (monthIndex !== -1) {
      const month = String(monthIndex + 1).padStart(2, '0')
      return `${parts[1]}-${month}`
    }
  }

  if (parts.length === 1 && parts[0].length === 4 && /^\d{4}$/.test(parts[0])) {
    return `${parts[0]}-01`
  }

  return null
}
