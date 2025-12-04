import {
    alertMessage,
    clearErrorOverlay,
    errorOverlay,
    hasErrorOverlay,
} from '../alertMessage'
import {describe, it, expect} from 'vitest'
import {Window} from 'happy-dom'

describe('alertMessage', () => {
    it('contains text about generating an error', () => {
        expect(alertMessage('foo')).toContain('generated an error.')
    })
    it('contains the error', () => {
        expect(alertMessage('bar')).toContain('bar')
    })
    it('can manipulate error overlays', () => {
        const window = new Window()
        const doc = window.document
        // happy-dom is not TypeScript-compliant with HTMLElement interface:
        const container = doc.createElement('div') as unknown as HTMLElement
        errorOverlay('baz', container)
        expect(container.textContent).toContain('baz')
        expect(hasErrorOverlay(container)).toBe(true)
        clearErrorOverlay(container)
        expect(hasErrorOverlay(container)).toBe(false)
    })
})
