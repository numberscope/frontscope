import {mount} from '@vue/test-utils'
import {expect, test} from 'vitest'
import NavBar from '../NavBar.vue'

test('should have links to home, scope, about, and help', async () => {
    const wrapper = mount(NavBar, {shallow: true})
    expect(wrapper.html()).toContain('/')
    expect(wrapper.html()).toContain('/scope')
    expect(wrapper.html()).toContain('/about')
    expect(wrapper.html()).toContain('/help')
})
