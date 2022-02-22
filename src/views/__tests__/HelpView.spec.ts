import HelpView from '../HelpView.vue'
import {expect, test} from 'vitest'
import {mount} from '@vue/test-utils'

test('has links to guide, docs, github, and email', () => {
    const wrapper = mount(HelpView)

    // guide
    expect(wrapper.html()).toContain('#')

    // docs
    expect(wrapper.html()).toContain('#')

    // github
    expect(wrapper.html()).toContain('https://github.com/numberscope')

    // email
    expect(wrapper.html()).toContain('mailto:numberscope@colorado.edu')
})
