import {mount} from '@vue/test-utils'
import {expect, test} from 'vitest'
import AboutView from '../AboutView.vue'

test('should contain text about Numberscope', () => {
    const wrapper = mount(AboutView, () => {
        expect(wrapper.text()).toContain('Numberscope')
    })
})

test('should contain text about Dr. Stange', () => {
    const wrapper = mount(AboutView, () => {
        expect(wrapper.text()).toContain('Dr.')
        expect(wrapper.text()).toContain('Katherine')
        expect(wrapper.text()).toContain('Stange')
    })
})
