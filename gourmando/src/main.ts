import { mount } from 'svelte'
// import './app.css'
import Cursor from './Cursor.svelte'

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


// export default app
