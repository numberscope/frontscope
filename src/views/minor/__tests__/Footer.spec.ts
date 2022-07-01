import Footer from '../Footer.vue'
import {expect, test} from 'vitest'
import {mount} from '@vue/test-utils'

test('should contain thank you', () => {
    const wrapper = mount(Footer, {shallow: true})
    expect(wrapper.text()).toContain('Thank you very much to')
})
