import {alertMessage} from '../alertMessage'
import {describe, it, expect} from 'vitest'

describe('alertMessage', () => {
    it('contains text about generating an error', () => {
        expect(alertMessage('foo')).toContain('generated an error.')
    })
    it('contains the error', () => {
        expect(alertMessage('bar')).toContain('bar')
    })
    // Should we also try to test errorOverlay? Is there a way to have
    // a valid DOM (html page) in a vitest? I am not at this moment
    // familiar with how that might work...
})
