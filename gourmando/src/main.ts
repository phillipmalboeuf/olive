import { mount } from 'svelte'
// import './app.css'
import Cursor from './Cursor.svelte'
import Physics from './Physics.svelte'

console.log('Gourmando')

document.querySelectorAll('[data-cursor]').forEach(target => {
  mount(Cursor, {
    target,
    props: {
      src: target.getAttribute('data-cursor'),
      element: target
    }
  })
})

document.querySelectorAll('[data-physics]').forEach(target => {
  mount(Physics, {
    target,
    props: {
      text: target.querySelector('[data-physics-text]'),
      element: target
    }
  })
})


// export default app
