import ScopeView from '../ScopeView.vue'
import {expect, test} from 'vitest'
import {mount} from '@vue/test-utils'

test('should contain link to scope', () => {
    const wrapper = mount(ScopeView, {shallow: true})
    expect(wrapper.text()).toContain("The 'Scope")
})
