import Gallery from '../Gallery.vue'
import {expect, test} from 'vitest'
import {mount} from '@vue/test-utils'

test('should contain specimen gallery', () => {
    const wrapper = mount(Gallery, {shallow: true})
    expect(wrapper.html()).toContain('Specimen gallery')
})
