import {describe, it, expect} from 'vitest'

import {breakableString} from '../layoutUtilities'
// isMobile not easily unit testable, since it needs a browser context

describe('breakableString', () => {
    it('leaves small numbers alone', () => {
        expect(breakableString(2n)).toBe(2n.toString())
        expect(breakableString(123456789n)).toBe(123456789n.toString())
        expect(breakableString(-123456789n)).toBe((-123456789n).toString())
    })
    it('splits larger numbers into groups of 3 digits from the right', () => {
        expect(breakableString(1234567890n)).toBe('1 234 567 890')
        expect(breakableString(12345678901n)).toBe('12 345 678 901')
        expect(breakableString(123456789012n)).toBe('123 456 789 012')
        expect(breakableString(-1234567890n)).toBe('-1 234 567 890')
        expect(breakableString(-12345678901n)).toBe('-12 345 678 901')
        expect(breakableString(-123456789012n)).toBe('-123 456 789 012')
    })
})
