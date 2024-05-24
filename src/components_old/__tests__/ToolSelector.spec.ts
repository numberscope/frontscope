import {describe, it, expect} from 'vitest'
import {mount} from '@vue/test-utils'
import ToolSelector from '../ToolSelector.vue'

describe('ToolSelector', () => {
    it('displays title', () => {
        const wrapper = mount(ToolSelector, {props: {title: 'Foo Title'}})
        expect(wrapper.text()).toContain('Foo Title')
    })
})
