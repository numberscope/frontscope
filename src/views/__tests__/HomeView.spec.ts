import HomeView from '../HomeView.vue'
import {expect, test} from 'vitest'
import {mount} from '@vue/test-utils'

test('should contain link to scope', () => {
    const wrapper = mount(HomeView, {shallow: true})
    expect(wrapper.html()).toContain('/scope')
})
