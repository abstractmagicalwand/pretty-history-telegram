import React from 'react'

import test from 'ava'
import {mount} from 'enzyme'
import PrettyHistoryTelegram from './index'

test('output <PrettyHistoryTelegram />', async (t) => {
  const wrapper = mount(PrettyHistoryTelegram)
  console.log(wrapper.props())
})

// find input
// set text
// find button
// click button
// find output
// copy
// equal

/* test('shallow', (t) => {

  t.equal(wrapper.contains(<span>Foo</span>), true)
})
*/


/* test('mount', (t) => {
  const wrapper = mount(<PrettyHistoryTelegram />)
  const fooInner = wrapper.find('.foo-inner')
  t.equal(fooInner.is('.foo-inner'), true)
})*/
