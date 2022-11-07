import {alertMessage} from '../alertMessage.js'
import {describe, it, expect} from 'vitest'

describe('alertMessage', () => {
    it('contains text about experiencing an error', () => {
        expect(alertMessage('foo')).toContain(
            'Numberscope experienced an error.'
        )
    })
    it('contains the error', () => {
        expect(alertMessage('bar')).toContain('bar')
    })
})
