<script lang="ts">
  import { onMount, tick } from 'svelte'
  import { Body, Bodies, Composite, Engine, Events, Render, Runner, World, Sleeping, Common } from 'matter-js'

  import { on } from 'svelte/events'
  import { cursor } from './stores'

  let { text, element, trimTop=0.3, trimBottom=0.15, canvas=false }: {
    text: HTMLElement
    element: HTMLElement
    trimTop?: number
    trimBottom?: number
    canvas?: boolean
  } = $props()

  let ready = $state(false)
  let px = $state<number>()
  let py = $state<number>()
  // let orientation = $state<number>()

  let engine: Engine
  let render: Render
  let runner: Runner

  let bounds = $derived(element.getBoundingClientRect())

  // trimTop = 0
  // trimBottom = 0

  let splitElement = $state<HTMLElement>()

  const descenders = 'gjqpy'
  const ascenders = 'lidtfjkb'

  onMount(() => {
    text.style.display = "none"
    element.style.position = "relative"

    const style = getComputedStyle(element)
    
    const padding = Number(style.padding.replace('px', '')) || 40
    element.style.padding = "0"

    engine = Engine.create({
      enableSleeping: true
    })
    render = !canvas ? undefined : Render.create({
      element,
      engine,
      options: {
        pixelRatio: window.devicePixelRatio,
        width: bounds.width,
        height: bounds.height,
        wireframes: false,
        background: 'transparent'
      }
    })

    // const style = getComputedStyle(splitElement)
    // const ogboxes = Array.from(splitElement.querySelectorAll('span').values()).map(span => {
    //   const rect = span.getBoundingClientRect()
    //   // const letter = span.innerText
    //   const {x, y, w, h} = {
    //     x: rect.x,
    //     w: rect.width,
    //     y: rect.y,
    //     h: rect.height
    //   }
    //   return {
    //     // letter,
    //     body: Bodies.rectangle(x + (w / 2), y + (h / 2), w, h, {
    //       isStatic: true,
    //       render: {
    //         // fillStyle: 'transparent',
    //         opacity: 0.2
    //       }
    //     })
    //   }
    // })
    const boxes = Array.from(splitElement.querySelectorAll('span').values()).map((span, i) => {
      // const rect = span.getBoundingClientRect()
      const letter = span.innerText

      const ascending = ascenders.includes(letter)
      const descending = descenders.includes(letter)
      const {x, y, w, h} = {
        x: span.offsetLeft,
        w: span.offsetWidth,
        // y: rect.y,
        // h: rect.height * (1 - trimTop - trimBottom)
        y: span.offsetTop + (span.offsetHeight * (ascending ? 0.12 : trimTop)),
        h: span.offsetHeight * (1 - (ascending ? 0.12 : trimTop) - (descending ? 0 : trimBottom))
      }
      return {
        // letter,
        ascending,
        descending,
        ...{x, y, w, h},
        adjustX: span.offsetWidth / 2,
        adjustY: (span.offsetHeight
          // * (ascending ? (1 - trimBottom) : 1)
          // * (descending ? (1 + trimBottom) : 1)
          / 2),
        span,
        body: Body.create({
          // isStatic: true,
          slop: 0,
          restitution: 0.1,
          parts: [
            Bodies.rectangle(x + (w / 2), span.offsetTop + (span.offsetHeight / 2), w, span.offsetHeight, {
              // chamfer: { radius: w/4 },
              isSensor: true,
              render: {
                fillStyle: 'black',
                opacity: 0.5
              }
            }),
            Bodies.rectangle(x + (w / 2), y + (h / 2), w, h, {
              chamfer: { radius: w/4 },
              density: 0,
              render: {
                // fillStyle: 'transparent',
                opacity: 0.5
              }
            })
          ]
        })
      }
    })

    const overpad = 5000

    const top = Bodies.rectangle(bounds.width / 2, -overpad, bounds.width, padding + (overpad * 2), {
      isStatic: true,
      friction: 0
    })
    const right = Bodies.rectangle(bounds.width + overpad, bounds.height / 2, padding + (overpad * 2), bounds.height, {
      isStatic: true,
      friction: 0
    })
    const bottom = Bodies.rectangle(bounds.width / 2, bounds.height + overpad, bounds.width, padding + (overpad * 2), {
      isStatic: true,
      friction: 0
    })
    const left = Bodies.rectangle(-overpad, bounds.height / 2, padding + (overpad * 2), bounds.height, {
      isStatic: true,
      friction: 0
    })

    const cursorBody = Bodies.circle(0, 0, 100, {
      isStatic: true,
      // density: 0.00001,
      slop: 0,
      render: {
        fillStyle: 'green',
        opacity: 0.5
      }
    })

    // add all of the bodies to the world
    Composite.add(engine.world, [
      ...boxes.map(box => box.body),
      // ...ogboxes.map(box => box.body),
      cursorBody,
      top, right, bottom, left
    ]);

    const unsubscribe = cursor.subscribe((value) => {
      if (!value || !value.w) return
      Body.scale(cursorBody, value.w / 220, value.h / 220)
      unsubscribe()
    })

    cursor.subscribe((value) => {
      if (!value || !value.x || !px) return
      //@ts-ignore
      Body.setPosition(cursorBody, { x: px, y: py }, true)

      boxes.forEach(box => {
        Sleeping.set(box.body, false)
      })
    })

    ready = true

    render && Render.run(render)
    runner = Runner.create()
    Runner.run(runner, engine)

    function update() {
      boxes.forEach(({ span, body }) => {
        if (!body.isSleeping && body.position.x) {
          span.style.transform = `translate3d(${body.position.x}px, ${body.position.y}px, 0) rotate(${body.angle}rad)`
        }
      })
    }

    boxes.forEach(({ span, adjustX, adjustY, w, h, ascending, descending }) => {
      // span.style.position = 'absolute'
      
      span.style.left = (adjustX * -1) + 'px'
      span.style.top = (adjustY * -1) + 'px'
      
      // span.style.width = w+'px'
      // span.style.height = h+'px'
      // span.style.transformOrigin = `${!ascending ? !descending ? 'bottom' : `${100 * (1 - trimTop)}%` : ''} center`
    })

    Events.on(engine, 'afterUpdate', update)

    // function afterRender() {
    //   const context = render.context;
    //   boxes.forEach(({ body: { position, angle }, descending, w, h, letter }) => {
    //     context.save()
    //     context.translate(position.x + (w / 2), position.y + (descending ? h * trimBottom : (h / 2))); // Translate to the body's position
    //     context.rotate(angle); // Rotate to the body's angle
    //     context.font = `${style.fontWeight} ${style.fontSize} '${style.fontFamily}'`;
    //     context.fillStyle = style.color;
    //     context.textAlign = 'end';
    //     // context.textBaseline = 'alphabetic';
    //     context.fillText(letter, 0, 0); // Draw the text at the origin (0, 0) because we've already translated
    //     context.restore()
    //   })
    // }

    // Events.on(render, 'afterRender', afterRender)

    return () => {
      Render.stop(render)
      Runner.stop(runner)
      Events.off(engine, 'afterUpdate', update)
      World.clear(engine.world, false)
      Engine.clear(engine)

      if (render) {
        render.canvas.remove()
        render.canvas = null
        render.context = null
        render.textures = {}
      }
    }
  })
</script>

<!-- <svelte:window ondeviceorientation={(event) => {
  orientation = event.gamma

  if (orientation === 0) {
      engine.gravity.x = Common.clamp(event.gamma, -90, 90) / 90;
      engine.gravity.y = Common.clamp(event.beta, -90, 90) / 90;
  } else if (orientation === 180) {
      engine.gravity.x = Common.clamp(event.gamma, -90, 90) / 90;
      engine.gravity.y = Common.clamp(-event.beta, -90, 90) / 90;
  } else if (orientation === 90) {
      engine.gravity.x = Common.clamp(event.beta, -90, 90) / 90;
      engine.gravity.y = Common.clamp(-event.gamma, -90, 90) / 90;
  } else if (orientation === -90) {
      engine.gravity.x = Common.clamp(-event.beta, -90, 90) / 90;
      engine.gravity.y = Common.clamp(event.gamma, -90, 90) / 90;
  }
}} /> -->

<figure class:ready onpointermove={(e) => {
  px = e.layerX
  py = e.layerY
}}>
  <svelte:element this={text.tagName} class={text.className} bind:this={splitElement}>
    {#each text.innerHTML.trim().split('<br>') as t, i}
      {#if i !== 0}<br>{/if}
      {#each Array.from(t).filter((l, j) => j<12) as l}<span>{l}</span>{/each}
    {/each}
  </svelte:element>
  <!-- <h1>{@html text.innerHTML}</h1> -->
</figure>


<style>
  figure {
    margin: 0;
    padding: 0;

    position: absolute;
    bottom: 0;
    left: 0;

    width: 100%;
    height: 100%;
    overflow: hidden;

    display: flex;
    align-items: flex-end;

    box-sizing: border-box;
    /* padding: 40px; */
  }

  figure > :global(*) {
    line-height: 1;
  }

  figure span {
    /* position: absolute; */
    pointer-events: none;
    display: inline-flex;
    /* align-items: center; */
    transform-origin: center;
    will-change: transform;
  }

  figure.ready span {
    position: absolute;
    top: 0;
    left: 0;
  }
</style>
