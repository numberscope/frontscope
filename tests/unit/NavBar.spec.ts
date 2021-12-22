import {mount, RouterLinkStub} from '@vue/test-utils'
import NavBar from '@/views/minor/NavBar.vue'

test('routes to Home and UserManual', () => {
  const wrapper = mount(NavBar, {
      stubs: {
          RouterLink: RouterLinkStub
      }
  })
  const links = wrapper.findAllComponents(RouterLinkStub);
  expect(links.at(0).props().to.name).toBe('Home'); // Logo link
  expect(links.at(1).props().to.name).toBe('Home'); // First named link
  /* Not sure what the middle link "Specimens" is about */
  expect(links.at(-1).props().to.name).toBe('UserManual');
})
