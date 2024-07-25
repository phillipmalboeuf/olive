<script lang="ts">
  import { onMount } from 'svelte'

  import { on } from 'svelte/events'
  import { fade } from 'svelte/transition'

  let { src, left, top, size, element }: {
    src: string
    left: number
    top: number
    size: number
    element: HTMLElement
  } = $props()


  onMount(() => {
   element.style.position = 'relative'
  })
</script>

<figure style:left={`${left}%`} style:top={`${top}%`} style:width={`${size}vw`}>
  <img {src} alt="Doodle" />
</figure>

<style>
  figure {
    pointer-events: none;
    position: absolute;
    margin: 0;
    padding: 0;
    transform: translate(-50%, -50%);
  }

  img {
    width: 100%;
    height: auto;    
  }
</style>
