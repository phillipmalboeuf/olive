import { mount } from 'svelte'
// import './app.css'
import Cursor from './Cursor.svelte'
import Physics from './Physics.svelte'
import Doodle from './Doodle.svelte'

console.log('Gourmando')

document.querySelectorAll<HTMLElement>('[data-cursor]').forEach(target => {
  mount(Cursor, {
    target,
    props: {
      src: target.getAttribute('data-cursor'),
      element: target
    }
  })
})

document.querySelectorAll<HTMLElement>('[data-doodle]').forEach(target => {
  const sibling = target.parentElement.previousSibling.previousSibling
  console.log(sibling)
  mount(Doodle, {
    target: sibling as HTMLElement,
    props: {
      src: target.getAttribute('data-doodle'),
      top: Number(target.getAttribute('data-doodle-top')),
      left: Number(target.getAttribute('data-doodle-left')),
      size: Number(target.getAttribute('data-doodle-size')),
      element: sibling as HTMLElement
    }
  })
})

document.querySelectorAll<HTMLElement>('[data-physics]').forEach(target => {
  mount(Physics, {
    target,
    props: {
      text: target.querySelector('[data-physics-text]'),
      element: target
    }
  })
})


// export default app
