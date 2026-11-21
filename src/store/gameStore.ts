import { create } from 'zustand'
import type { Checkpoint } from './shift'
import { persist } from 'zustand/middleware'

export type Story = Record<string, string>
type Progress = Record<
  number,
  { stars: number; bestScore: number; completed: true }
>
export type Stats = {
  totalGames: number
  totalOrders: number
  sabotagedOrders: number
  lassoUsed: number
}
export type Save = {
  checkpoint?: Checkpoint
  level: number
  coins: number
  story: Story
  levelProgress: Progress
  unlockedTools: string[]
  purchasedTools: string[]
  achievements: string[]
  endings: string[]
  stats: Stats
}
const initial = (): Save => ({
  checkpoint: undefined,
  level: 1,
  coins: 0,
  story: {},
  levelProgress: {},
  unlockedTools: [],
  purchasedTools: [],
  achievements: [],
  endings: [],
  stats: { totalGames: 0, totalOrders: 0, sabotagedOrders: 0, lassoUsed: 0 },
})
export const useGameStore = create<
  Save & { update: (fn: (s: Save) => Partial<Save>) => void; reset: () => void }
>()(
  persist(
    (set) => ({
      ...initial(),
      update: (fn) => set(fn),
      reset: () =>
        set(({ achievements, endings }) => ({
          ...initial(),
          achievements,
          endings,
        })),
    }),
    { name: 'conveyor-save' },
  ),
)
