import Help from '../Help.vue'
import {expect, test} from 'vitest'
import {mount} from '@vue/test-utils'

test('has links to guide, docs, github, and email', () => {
    const wrapper = mount(Help, {shallow: true})

    // guide
    expect(wrapper.html()).toContain('#')

    // docs
    // this will change as we get rid of the old user manual and add new docs

    // github
    expect(wrapper.html()).toContain('https://github.com/numberscope')

    // email
    expect(wrapper.html()).toContain('mailto:numberscope@colorado.edu')
})
