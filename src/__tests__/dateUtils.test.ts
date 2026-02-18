import { describe, it, expect } from 'vitest'
import {
  formatDateRange,
  calculateDuration,
  formatDateRangeWithDuration,
} from '../utils/dateUtils'

describe('formatDateRange', () => {
  describe('English', () => {
    it('formats a date range with both dates', () => {
      expect(formatDateRange('2020-01', '2022-06', 'en')).toBe('Jan 2020 - Jun 2022')
    })

    it('formats ongoing position', () => {
      expect(formatDateRange('2020-01', null, 'en')).toBe('Jan 2020 - Ongoing')
    })

    it('returns empty string for invalid start date', () => {
      expect(formatDateRange('', '2022-06', 'en')).toBe('')
      expect(formatDateRange('invalid', '2022-06', 'en')).toBe('')
    })

    it('returns start only for invalid end date', () => {
      expect(formatDateRange('2020-01', 'invalid', 'en')).toBe('Jan 2020')
    })

    it('handles edge case months', () => {
      expect(formatDateRange('2020-01', '2020-12', 'en')).toBe('Jan 2020 - Dec 2020')
    })
  })

  describe('Swedish', () => {
    it('formats a date range with both dates', () => {
      expect(formatDateRange('2020-01', '2022-06', 'sv')).toBe('Jan 2020 - Jun 2022')
    })

    it('formats ongoing position', () => {
      expect(formatDateRange('2020-01', null, 'sv')).toBe('Jan 2020 - Pågående')
    })

    it('uses Swedish month names', () => {
      expect(formatDateRange('2020-05', '2020-10', 'sv')).toBe('Maj 2020 - Okt 2020')
    })
  })
})

describe('calculateDuration', () => {
  describe('English', () => {
    it('calculates duration in months only', () => {
      expect(calculateDuration('2020-01', '2020-06', 'en')).toBe('5 mo')
    })

    it('calculates duration in years only', () => {
      expect(calculateDuration('2020-01', '2022-01', 'en')).toBe('2 yr')
    })

    it('calculates duration in years and months', () => {
      expect(calculateDuration('2020-01', '2022-06', 'en')).toBe('2 yr 5 mo')
    })

    it('returns less than one month for short duration', () => {
      expect(calculateDuration('2020-01', '2020-01', 'en')).toBe('< 1 mo')
    })

    it('calculates ongoing duration from now', () => {
      const result = calculateDuration('2020-01', null, 'en')
      expect(result).toMatch(/\d+ yr/)
    })

    it('returns empty string for invalid start date', () => {
      expect(calculateDuration('invalid', '2022-01', 'en')).toBe('')
    })
  })

  describe('Swedish', () => {
    it('uses Swedish units for months', () => {
      expect(calculateDuration('2020-01', '2020-06', 'sv')).toBe('5 mån')
    })

    it('uses Swedish units for years', () => {
      expect(calculateDuration('2020-01', '2022-01', 'sv')).toBe('2 år')
    })

    it('uses Swedish units for combined', () => {
      expect(calculateDuration('2020-01', '2022-06', 'sv')).toBe('2 år 5 mån')
    })

    it('uses Swedish for less than one month', () => {
      expect(calculateDuration('2020-01', '2020-01', 'sv')).toBe('< 1 mån')
    })
  })
})

describe('formatDateRangeWithDuration', () => {
  it('combines date range and duration', () => {
    expect(formatDateRangeWithDuration('2020-01', '2022-06', 'en')).toBe(
      'Jan 2020 - Jun 2022 • 2 yr 5 mo'
    )
  })

  it('handles ongoing position', () => {
    const result = formatDateRangeWithDuration('2020-01', null, 'en')
    expect(result).toMatch(/Jan 2020 - Ongoing • \d+ yr/)
  })

  it('returns empty string for invalid input', () => {
    expect(formatDateRangeWithDuration('', '2022-06', 'en')).toBe('')
  })
})
