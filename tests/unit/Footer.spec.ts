import {mount} from '@vue/test-utils'
import Footer from '@/views/minor/Footer.vue'

test('copyright statement should be correct and up-to-date', () => {
    const wrapper = mount(Footer)
    const currentYear = new Date().getFullYear()
    expect(wrapper.text()).toContain(
        `Copyright © 2020-${currentYear} University of Colorado Boulder`
    )
})
