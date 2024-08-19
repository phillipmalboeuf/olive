<script lang="ts">
  import { onMount } from 'svelte'

  import { on } from 'svelte/events'
  import { fade } from 'svelte/transition'
  import { cursor } from './stores'

  let { src, element }: {
    src: string
    element: HTMLElement
  } = $props()

  let visible: boolean = $state(false)
  let x: number = $state()
  let y: number = $state()
  let w: number = $state()
  let h: number = $state()

  let hidden = $state(false)

  function isTouchDevice() {
    // @ts-ignore
    return (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
  }

  onMount(() => {
    if (window.innerWidth < 750) return
    if (isTouchDevice()) return
    element.style.cursor = "none"

    const enter = on(element, "mouseenter", (e) => {
      visible = true
      
      // cursor.set({ x, y, w, h })
    })

    const leave = on(element, "mouseleave", (e) => {
      visible = false
      // x = undefined
      // y = undefined

      // cursor.set({ x, y, w, h })
    })

    return () => {
      element.style.cursor = undefined
      enter()
      leave()
    }
  })
</script>

<svelte:document on:mousemove={(e) => {
  if (isTouchDevice()) return
  if (!visible) return

  // @ts-ignore
  if (!hidden && ['BUTTON', 'A', 'INPUT'].includes(e.target.nodeName)) {
    hidden = true

  // @ts-ignore
  } else if (hidden && !['BUTTON', 'A', 'INPUT'].includes(e.target.nodeName)) {
    hidden = false
  }

  x = e.clientX
  y = e.clientY

  cursor.set({ x, y, w, h })
}} />

<!-- <svelte:document on:mousemove={(e) => {
  x = e.clientX
  y = e.clientY
}} /> -->

<figure class:hidden={!visible || hidden} style:left={`${x}px`} style:top={`${y}px`} bind:clientWidth={w} bind:clientHeight={h}>
  <img {src} alt="Cursor" />
</figure>

<style>
  figure {
    margin: 0;
    padding: 0;

    position: fixed;
    z-index: 6666;
    transform: translate(-50%, -50%);
    /* transition: transform 666ms, opacity 666ms; */
    pointer-events: none;


    /* &.hovering {
      transform: translate(-50%, -50%) scale(0.88);
      // border-radius: 25%;
    } */

    &.hidden {
      opacity: 0;
    }
  }

  @media screen and (max-width: 750px) {
    figure {
      display: none;
    }
  }
</style>
