import About from '../About.vue'
import {expect, test} from 'vitest'
import {mount} from '@vue/test-utils'

test('should contain text about Numberscope', () => {
    const wrapper = mount(About)
    expect(wrapper.text()).toContain('Numberscope')
})

test('should contain text about Dr. Stange', () => {
    const wrapper = mount(About)
    expect(wrapper.text()).toContain('Dr.')
    expect(wrapper.text()).toContain('Katherine')
    expect(wrapper.text()).toContain('Stange')
})
