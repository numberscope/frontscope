import {describe, it, expect} from 'vitest'
import {mount} from '@vue/test-utils'
import StopDrawingButton from '../StopDrawingButton.vue'

describe('ToolSelector', () => {
    it('emits stopDrawing when clicked', () => {
        const wrapper = mount(StopDrawingButton)
        wrapper.find('a').trigger('click')
        expect(wrapper.emitted()).toHaveProperty('stopDrawing')
    })
})
