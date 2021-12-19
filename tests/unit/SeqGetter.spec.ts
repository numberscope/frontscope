import {mount} from '@vue/test-utils'
import SeqGetter from '@/components/SeqGetter.vue'

/*
* As of this writing, the SeqGetter component has two props:
* (1) title
* (2) instanceId
* both of which are of type String.
*
* In this test, we use the Vue Test Utils library to mount an isolated SeqGetter
* component and add a dummy title. We then test to see if the mounted
* component's text has our dummy title.
*/
test('displays dummy title', () => {
  const wrapper = mount(SeqGetter, {
    propsData: {
      title: 'Dummy Title',
      instanceId: '12345'
    }
  })
  expect(wrapper.text()).toContain('Dummy Title')
})