import {describe, it, expect} from 'vitest'
import {mount} from '@vue/test-utils'
import SeqSelector from '../SeqSelector.vue'

describe('SeqGetter', () => {
    const falseEmit = 'set-seq-params'
    it(`emits ${falseEmit} when isInstance is false`, () => {
        const wrapper = mount(SeqSelector, {
            props: {
                isInstance: false,
            },
        })
        wrapper.find('a').trigger('click')
        expect(wrapper.emitted()).toHaveProperty(falseEmit)
    })
    const trueEmit = 'stage-instance'
    it(`emits ${trueEmit} when isInstance is true`, () => {
        const wrapper = mount(SeqSelector, {
            props: {
                isInstance: true,
            },
        })
        wrapper.find('a').trigger('click')
        expect(wrapper.emitted()).toHaveProperty(trueEmit)
    })
    it('displays title', () => {
        const wrapper = mount(SeqSelector, {
            props: {
                title: 'Foo Title',
                isInstance: false,
            },
        })
        expect(wrapper.text()).toContain('Foo Title')
    })
})
