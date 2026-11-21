export type Item = {
  id: number
  lane: number
  x: number
  icon: string
  name: string
  target: number
  shadow: boolean
  ghost: boolean
  void: boolean
}
export type Shift = {
  time: number
  elapsed: number
  spawn: number
  items: Item[]
  count: number
  score: number
  life: number
  heat: number
  combo: number
  peak: number
  light: number
  clean: boolean
  shield: number
  orderIndex: number
  order?: { type: number; until: number; obeyed: boolean }
  effects: Record<string, number>
  cooldowns: Record<string, number>
  done: string[]
  pending?: string
  flash: string
}
export type Checkpoint = { level: number; serial: number; shift: Shift }
export const initialShift = (): Shift => ({
  time: 160,
  elapsed: 0,
  spawn: 0.6,
  items: [],
  count: 0,
  score: 0,
  life: 3,
  heat: 0,
  combo: 0,
  peak: 0,
  light: 0,
  clean: true,
  shield: 0,
  orderIndex: 0,
  effects: {},
  cooldowns: {},
  done: [],
  flash: '',
})
