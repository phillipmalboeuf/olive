<script lang="ts">
  import { onMount } from 'svelte'

  import { on } from 'svelte/events'
  import { fade } from 'svelte/transition'
  import { cursor } from './stores';

  let { src, element }: {
    src: string
    element: HTMLElement
  } = $props()

  let x: number = $state()
  let y: number = $state()
  let w: number = $state()
  let h: number = $state()

  onMount(() => {
    element.style.cursor = "none"

    const move = on(element, "pointermove", (e) => {
      x = e.clientX
      y = e.clientY
      
      cursor.set({ x, y, w, h })
    })

    const leave = on(element, "pointerleave", (e) => {
      x = undefined
      y = undefined

      cursor.set({ x, y, w, h })
    })

    return () => {
      element.style.cursor = undefined
      move()
      leave()
    }
  })
</script>

<!-- <svelte:document on:mousemove={(e) => {
  x = e.clientX
  y = e.clientY
}} /> -->

{#if x}
<figure transition:fade={{ duration: 333 }} style:left={`${x}px`} style:top={`${y}px`} bind:clientWidth={w} bind:clientHeight={h}>
  <img {src} alt="Cursor" />
</figure>
{/if}

<style>
  figure {
    margin: 0;
    padding: 0;

    position: fixed;
    z-index: 6666;
    transform: translate(-50%, -50%);
    transition: transform 666ms, opacity 666ms;
    pointer-events: none;


    /* &.hovering {
      transform: translate(-50%, -50%) scale(0.88);
      // border-radius: 25%;
    } */

    &.hidden {
      opacity: 0;
    }
  }
</style>
