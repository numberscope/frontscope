import Home from '../Home.vue'
import {expect, test} from 'vitest'
import {mount} from '@vue/test-utils'

test('should contain link to scope', () => {
    const wrapper = mount(Home, {shallow: true})
    expect(wrapper.html()).toContain('/scope')
})
