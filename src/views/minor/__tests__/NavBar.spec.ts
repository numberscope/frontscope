import NavBar from '../NavBar.vue'
import {expect, test} from 'vitest'
import {mount} from '@vue/test-utils'

test('should have links to home, scope, about, and documentation', () => {
    const wrapper = mount(NavBar, {shallow: true})
    expect(wrapper.html()).toContain('/')
    expect(wrapper.html()).toContain('/scope')
    expect(wrapper.html()).toContain('/about')
    expect(wrapper.html()).toContain('/doc')
})
