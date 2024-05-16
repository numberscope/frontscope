import {describe, it, expect} from 'vitest'
import {mount} from '@vue/test-utils'
import SeqGetter from '../SeqGetter.vue'

describe('SeqGetter', () => {
    it('emits load-seq when clicked', () => {
        const wrapper = mount(SeqGetter)
        wrapper.find('a').trigger('click')
        expect(wrapper.emitted()).toHaveProperty('load-seq')
    })
    it('displays title', () => {
        const wrapper = mount(SeqGetter, {
            props: {
                title: 'Foo Title',
            },
        })
        expect(wrapper.text()).toContain('Foo Title')
    })
})
