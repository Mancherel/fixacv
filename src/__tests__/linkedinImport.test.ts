import { describe, it, expect } from 'vitest'
import { parseCSVLine, parseCSV, parseLinkedInDate } from '../test/linkedinImportHelpers'

describe('parseCSVLine', () => {
  it('parses simple comma-separated values', () => {
    expect(parseCSVLine('a,b,c')).toEqual(['a', 'b', 'c'])
  })

  it('handles quoted values with commas', () => {
    expect(parseCSVLine('"a,b",c,d')).toEqual(['a,b', 'c', 'd'])
  })

  it('handles empty values', () => {
    expect(parseCSVLine('a,,c')).toEqual(['a', '', 'c'])
  })

  it('handles escaped quotes', () => {
    expect(parseCSVLine('"He said ""hello"""')).toEqual(['He said "hello"'])
  })

  it('trims whitespace from values', () => {
    expect(parseCSVLine('  a  ,  b  ')).toEqual(['a', 'b'])
  })

  it('trims values inside quotes', () => {
    expect(parseCSVLine('"  spaced  "')).toEqual(['spaced'])
  })

  it('parses single value', () => {
    expect(parseCSVLine('single')).toEqual(['single'])
  })

  it('handles trailing comma', () => {
    expect(parseCSVLine('a,b,')).toEqual(['a', 'b', ''])
  })
})

describe('parseCSV', () => {
  it('parses simple CSV with headers', () => {
    const csv = 'Name,Age,City\nJohn,30,NYC\nJane,25,LA'
    const result = parseCSV(csv)
    expect(result).toEqual([
      { Name: 'John', Age: '30', City: 'NYC' },
      { Name: 'Jane', Age: '25', City: 'LA' },
    ])
  })

  it('returns empty array for empty input', () => {
    expect(parseCSV('')).toEqual([])
    expect(parseCSV('Name')).toEqual([])
  })

  it('handles quoted values with commas in CSV', () => {
    const csv = 'Name,Description\nTest,"A, description"'
    const result = parseCSV(csv)
    expect(result).toEqual([{ Name: 'Test', Description: 'A, description' }])
  })

  it('skips rows with mismatched column count', () => {
    const csv = 'A,B,C\n1,2,3\n4,5\n6,7,8'
    const result = parseCSV(csv)
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ A: '1', B: '2', C: '3' })
    expect(result[1]).toEqual({ A: '6', B: '7', C: '8' })
  })
})

describe('parseLinkedInDate', () => {
  it('parses "Mon YYYY" format', () => {
    expect(parseLinkedInDate('Mar 2018')).toBe('2018-03')
    expect(parseLinkedInDate('Jan 2020')).toBe('2020-01')
    expect(parseLinkedInDate('Dec 1999')).toBe('1999-12')
  })

  it('parses year-only format', () => {
    expect(parseLinkedInDate('2018')).toBe('2018-01')
    expect(parseLinkedInDate('2020')).toBe('2020-01')
  })

  it('returns null for invalid input', () => {
    expect(parseLinkedInDate('')).toBeNull()
    expect(parseLinkedInDate(null)).toBeNull()
    expect(parseLinkedInDate('invalid')).toBeNull()
    expect(parseLinkedInDate('InvalidMonth 2020')).toBeNull()
  })

  it('handles whitespace', () => {
    expect(parseLinkedInDate('  Mar 2018  ')).toBe('2018-03')
  })

  it('handles all months', () => {
    const months = [
      ['Jan', '01'],
      ['Feb', '02'],
      ['Mar', '03'],
      ['Apr', '04'],
      ['May', '05'],
      ['Jun', '06'],
      ['Jul', '07'],
      ['Aug', '08'],
      ['Sep', '09'],
      ['Oct', '10'],
      ['Nov', '11'],
      ['Dec', '12'],
    ]
    months.forEach(([month, num]) => {
      expect(parseLinkedInDate(`${month} 2020`)).toBe(`2020-${num}`)
    })
  })
})
