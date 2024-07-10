import { writable } from 'svelte/store'

export const cursor = writable<{ x: number, y: number, w: number, h: number }>() 