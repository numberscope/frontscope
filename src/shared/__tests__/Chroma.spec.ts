import {describe, it, expect} from 'vitest'

import {chroma, rainbow, isChroma, overlay, dilute, ply} from '../Chroma'

const red = chroma('red')

describe('chroma', () => {
    it('does the standard chroma.js constructions', () => {
        expect(red.hex()).toBe('#ff0000')
        expect(chroma('hotpink').hex()).toBe('#ff69b4')
        expect(chroma('F39').hex()).toBe('#ff3399')
        expect(chroma(16724889).hex()).toBe('#ff3399')
        expect(chroma(255, 51, 153).hex()).toBe('#ff3399')
        expect(chroma(330, 1, 0.6, 'hsl').hex()).toBe('#ff3399')
        expect(chroma({c: 1, m: 0.5, y: 0, k: 0.2}).hex()).toBe('#0066cc')
    })
    it('adds the Numberscope extra constructions', () => {
        expect(chroma().hex()).toBe('#000000')
        expect(chroma([0.5, 0.5, 0.5, 0.5]).hex()).toBe('#80808080')
        expect(chroma(0.5, 0.5, 0.5, 0.5).hex()).toBe('#80808080')
        expect(chroma(0.5).hex()).toBe('#808080')
        expect(chroma('red', 0.5).hex()).toBe('#ff000080')
    })
})

describe('rainbow', () => {
    it('uses an angle in degrees', () => {
        expect(rainbow(7)).toStrictEqual(rainbow(367))
    })
    it('accepts an opacity argument', () => {
        expect(rainbow(45, 0.5).hex()).toBe('#ed240080')
    })
})

describe('isChroma', () => {
    it('tests entities to see if they are chroma objects', () => {
        expect(isChroma(chroma())).toBe(true)
        expect(isChroma({r: 7, g: 8, b: 9})).toBe(false)
    })
})

describe('overlay', () => {
    it('handles full opacity and transparency', () => {
        expect(overlay(chroma('#f3a2c3'), red)).toStrictEqual(red)
        expect(overlay(red, chroma('blue', 0))).toStrictEqual(red)
    })
    it('does alpha-compositing', () => {
        expect(overlay(chroma('red', 0.5), chroma('green', 0.5)).hex()).toBe(
            '#555500bf'
        )
    })
    it('is associative', () => {
        const hg = chroma('green', 0.5)
        const hb = chroma('blue', 0.5)
        expect(overlay(overlay(red, hg), hb)).toStrictEqual(
            overlay(red, overlay(hg, hb))
        )
    })
})

describe('dilute', () => {
    it('multiplies opacity by a constant', () => {
        expect(dilute(red, 0.5)).toStrictEqual(chroma('red', 0.5))
        expect(dilute(chroma('blue', 0.7), 0.6).alpha()).toBe(0.7 * 0.6)
    })
})

describe('ply', () => {
    it('represents several plies of the same overlay', () => {
        const hc = chroma('cyan', 0.5)
        expect(ply(hc, 2)).toStrictEqual(overlay(hc, hc))
        const qc = ply(hc, 0.5)
        const mhc = overlay(qc, qc)
        const amhc = mhc.alpha(Math.round(mhc.alpha() * 2 ** 20) / 2 ** 20)
        expect(amhc).toStrictEqual(hc)
    })
    it('has no effect on opaque colors', () => {
        expect(ply(red, 3.5)).toStrictEqual(red)
    })
})
