import {expect, test} from 'vitest'
import {mount} from '@vue/test-utils'

import NavBar from '../NavBar.vue'
import {Specimen} from '../../../shared/Specimen'

test('should have links to home, scope, about, and documentation', () => {
    const specimen = new Specimen('Formula', 'Turtle')
    const wrapper = mount(NavBar, {props: {specimen}, shallow: true})
    expect(wrapper.html()).toContain('/')
    expect(wrapper.html()).toContain('/about')
    expect(wrapper.html()).toContain('/doc')
})
