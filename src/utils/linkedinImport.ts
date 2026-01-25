import type { CVData, ListItem } from '../types'

interface LinkedInProfile {
  'First Name': string
  'Last Name': string
  'Headline': string
  'Summary': string
}

interface LinkedInPosition {
  'Company Name': string
  'Title': string
  'Description': string
  'Location': string
  'Started On': string
  'Finished On': string
}

interface LinkedInEducation {
  'School Name': string
  'Degree Name': string
  'Start Date': string
  'End Date': string
}

interface LinkedInSkill {
  'Name': string
}

interface LinkedInCourse {
  'Name': string
  'Number': string
}

function parseCSV(csvText: string): any[] {
  const lines = csvText.trim().split('\n')
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.trim())
  const rows = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length === headers.length) {
      const row: any = {}
      headers.forEach((header, index) => {
        row[header] = values[index]
      })
      rows.push(row)
    }
  }

  return rows
}

function parseCSVLine(line: string): string[] {
  const result = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
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

function parseLinkedInDate(dateStr: string): string | null {
  if (!dateStr) return null

  // Format: "Mar 2018" or "2018"
  const parts = dateStr.trim().split(' ')

  if (parts.length === 2) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthIndex = monthNames.indexOf(parts[0])
    if (monthIndex !== -1) {
      const month = String(monthIndex + 1).padStart(2, '0')
      return `${parts[1]}-${month}`
    }
  }

  // Just year
  if (parts.length === 1 && parts[0].length === 4) {
    return `${parts[0]}-01`
  }

  return null
}

export async function importLinkedInData(files: FileList): Promise<Partial<CVData>> {
  const result: Partial<CVData> = {
    personalInfo: {
      name: '',
      professionalTitle: '',
      email: '',
      phone: '',
    },
    professionalStatement: '',
    experiences: [],
    education: [],
    competencies: {
      expert: [],
      advanced: [],
      proficient: [],
    },
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const text = await file.text()

    if (file.name.includes('Profile.csv')) {
      const profiles = parseCSV(text) as LinkedInProfile[]
      if (profiles.length > 0) {
        const profile = profiles[0]
        result.personalInfo = {
          name: `${profile['First Name']} ${profile['Last Name']}`.trim(),
          professionalTitle: profile['Headline'] || '',
          email: '',
          phone: '',
        }
        result.professionalStatement = profile['Summary'] || ''
      }
    }

    if (file.name.includes('Positions.csv')) {
      const positions = parseCSV(text) as LinkedInPosition[]
      result.experiences = positions.map(pos => {
        const startDate = parseLinkedInDate(pos['Started On'])
        const endDate = parseLinkedInDate(pos['Finished On'])

        return {
          id: crypto.randomUUID(),
          type: 'employment' as const,
          company: pos['Company Name'] || '',
          title: pos['Title'] || '',
          startDate: startDate || '',
          endDate: endDate,
          description: pos['Description'] || '',
          tags: [],
          visible: true,
        }
      }).filter(exp => exp.company && exp.title)
    }

    if (file.name.includes('Education.csv')) {
      const education = parseCSV(text) as LinkedInEducation[]
      result.education = education.map(edu => ({
        id: crypto.randomUUID(),
        institution: edu['School Name'] || '',
        degree: edu['Degree Name'] || '',
        startYear: parseInt(edu['Start Date']) || 2000,
        endYear: parseInt(edu['End Date']) || 2000,
        description: '',
        tags: [],
        visible: true,
      })).filter(edu => edu.institution)
    }

    if (file.name.includes('Skills.csv')) {
      const skills = parseCSV(text) as LinkedInSkill[]
      const skillNames = skills.map(s => s['Name']).filter(Boolean)

      // Distribute skills across levels (this is just a default, user can adjust)
      const third = Math.ceil(skillNames.length / 3)

      result.competencies = {
        expert: skillNames.slice(0, Math.min(5, third)).map(name => ({
          id: crypto.randomUUID(),
          name,
          level: 'expert' as const,
          visible: true,
        })),
        advanced: skillNames.slice(Math.min(5, third), Math.min(10, third * 2)).map(name => ({
          id: crypto.randomUUID(),
          name,
          level: 'advanced' as const,
          visible: true,
        })),
        proficient: skillNames.slice(Math.min(10, third * 2)).map(name => ({
          id: crypto.randomUUID(),
          name,
          level: 'proficient' as const,
          visible: true,
        })),
      }
    }

    if (file.name.includes('Courses.csv')) {
      const courses = parseCSV(text) as LinkedInCourse[]
      const certifications = courses
        .map((course) => {
          const name = course['Name']?.trim()
          const number = course['Number']?.trim()
          if (!name) return ''
          return number ? `${name} (${number})` : name
        })
        .filter(Boolean)
        .map((name) => ({
          id: crypto.randomUUID(),
          name,
          visible: true,
        })) as ListItem[]

      result.certifications = certifications
    }
  }

  return result
}
