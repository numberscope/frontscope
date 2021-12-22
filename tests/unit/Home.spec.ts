import {mount, RouterLinkStub} from '@vue/test-utils'
import Home from '@/views/Home.vue'

test('name of route is Canvas', () => {
  const wrapper = mount(Home, {
      stubs: {
          RouterLink: RouterLinkStub
      }
  })
  expect(wrapper.findComponent(RouterLinkStub).props().to.name).toBe('Canvas')
})