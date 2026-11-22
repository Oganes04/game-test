import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { EndingId, LevelProgress, Stats, StoryFlags, ToolId } from '../data/types';
import { SAVE_KEY, safeStorage } from '../utils/storage';
import { TOOLS } from '../data/tools';
import { ACHIEVEMENTS, ACHIEVEMENT_COINS } from '../data/achievements';
import type { AchCtx } from '../data/achievements';
import { ENDING_COINS } from '../data/finales';
import { useUiStore } from './uiStore';

export const INITIAL_STORY: StoryFlags = {
  whisperSaved: false,
  whisperListened: false,
  hasChip: false,
  curatorWeak: false,
};

const INITIAL_STATS: Stats = { totalGames: 0, totalOrders: 0, sabotagedOrders: 0, lassoUsed: 0, totalSorted: 0 };

export interface SaveData {
  coins: number;
  unlockedTools: ToolId[];
  /** Покупки: для одноразовых — количество, для постоянных — 1. */
  purchasedTools: Partial<Record<ToolId, number>>;
  levelProgress: Record<number, LevelProgress>;
  achievements: string[];
  story: StoryFlags;
  endings: EndingId[];
  stats: Stats;
  trust: { boss: number; whisper: number };
  introSeen: boolean;
  everPurchased: boolean;
}

interface Actions {
  addCoins: (n: number) => void;
  setStory: (patch: Partial<StoryFlags>) => void;
  unlockTools: (ids: ToolId[]) => ToolId[];
  buyTool: (id: ToolId) => boolean;
  consumeTool: (id: ToolId) => void;
  completeLevel: (id: number, stars: 1 | 2 | 3, score: number, coins: number) => void;
  addStats: (inc: Partial<Stats>) => void;
  addTrust: (boss: number, whisper: number) => void;
  addEnding: (id: EndingId) => boolean;
  setIntroSeen: () => void;
  /** Новая игра: сброс сюжета и прогресса; монеты, покупки, ачивки и концовки сохраняются. */
  newGame: () => void;
  resetAll: () => void;
}

const initial = (): SaveData => ({
  coins: 0,
  unlockedTools: [],
  purchasedTools: {},
  levelProgress: {},
  achievements: [],
  story: { ...INITIAL_STORY },
  endings: [],
  stats: { ...INITIAL_STATS },
  trust: { boss: 0, whisper: 0 },
  introSeen: false,
  everPurchased: false,
});

export const useGameStore = create<SaveData & Actions>()(
  persist(
    (set, get) => ({
      ...initial(),

      addCoins: (n) => set((s) => ({ coins: Math.max(0, s.coins + n) })),

      setStory: (patch) => set((s) => ({ story: { ...s.story, ...patch } })),

      unlockTools: (ids) => {
        const have = new Set(get().unlockedTools);
        const fresh = ids.filter((id) => !have.has(id));
        if (fresh.length) set({ unlockedTools: [...get().unlockedTools, ...fresh] });
        return fresh;
      },

      buyTool: (id) => {
        const def = TOOLS[id];
        const s = get();
        if (!def.price || s.coins < def.price) return false;
        if (!def.consumable && s.purchasedTools[id]) return false;
        set({
          coins: s.coins - def.price,
          purchasedTools: { ...s.purchasedTools, [id]: (s.purchasedTools[id] ?? 0) + 1 },
          everPurchased: true,
        });
        return true;
      },

      consumeTool: (id) =>
        set((s) => ({ purchasedTools: { ...s.purchasedTools, [id]: Math.max(0, (s.purchasedTools[id] ?? 0) - 1) } })),

      completeLevel: (id, stars, score, coins) =>
        set((s) => {
          const prev = s.levelProgress[id];
          return {
            coins: s.coins + coins,
            levelProgress: {
              ...s.levelProgress,
              [id]: {
                completed: true,
                stars: (Math.max(prev?.stars ?? 1, stars) as 1 | 2 | 3),
                bestScore: Math.max(prev?.bestScore ?? 0, score),
              },
            },
          };
        }),

      addStats: (inc) =>
        set((s) => {
          const next = { ...s.stats };
          (Object.keys(inc) as (keyof Stats)[]).forEach((k) => {
            next[k] = (next[k] ?? 0) + (inc[k] ?? 0);
          });
          return { stats: next };
        }),

      addTrust: (boss, whisper) =>
        set((s) => ({ trust: { boss: s.trust.boss + boss, whisper: s.trust.whisper + whisper } })),

      addEnding: (id) => {
        const s = get();
        if (s.endings.includes(id)) return false;
        set({ endings: [...s.endings, id], coins: s.coins + ENDING_COINS });
        return true;
      },

      setIntroSeen: () => set({ introSeen: true }),

      newGame: () =>
        set((s) => ({
          story: { ...INITIAL_STORY },
          levelProgress: {},
          unlockedTools: [],
          trust: { boss: 0, whisper: 0 },
          coins: s.coins,
        })),

      resetAll: () => set(initial()),
    }),
    {
      name: SAVE_KEY,
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      // сохраняем только данные, без функций
      partialize: (s) =>
        Object.fromEntries(Object.entries(s).filter(([, v]) => typeof v !== 'function')) as unknown as SaveData,
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<SaveData>;
        return {
          ...current,
          ...p,
          story: { ...INITIAL_STORY, ...(p.story ?? {}) },
          stats: { ...INITIAL_STATS, ...(p.stats ?? {}) },
          trust: { boss: 0, whisper: 0, ...(p.trust ?? {}) },
        };
      },
    },
  ),
);

/** Следующий непройденный уровень (1..10). */
export function nextLevelId(progress: Record<number, LevelProgress>): number {
  for (let i = 1; i <= 10; i++) if (!progress[i]?.completed) return i;
  return 10;
}

export function isLevelUnlocked(id: number, progress: Record<number, LevelProgress>) {
  return id === 1 || !!progress[id - 1]?.completed;
}

/**
 * Проверяет ачивки, начисляет за новые монеты и показывает тосты.
 * Возвращает id новых ачивок.
 */
export function checkAchievements(run?: AchCtx['run']): string[] {
  const st = useGameStore.getState();
  const ctx: AchCtx = {
    story: st.story,
    stats: st.stats,
    coins: st.coins,
    levelProgress: st.levelProgress,
    endings: st.endings,
    purchasedAny: st.everPurchased,
    run,
  };
  const have = new Set(st.achievements);
  const fresh = ACHIEVEMENTS.filter((a) => !have.has(a.id) && a.check(ctx));
  if (!fresh.length) return [];
  useGameStore.setState({
    achievements: [...st.achievements, ...fresh.map((a) => a.id)],
    coins: useGameStore.getState().coins + fresh.length * ACHIEVEMENT_COINS,
  });
  const push = useUiStore.getState().pushToast;
  fresh.forEach((a) => push({ kind: 'achievement', title: a.title, text: `+${ACHIEVEMENT_COINS} монет`, icon: a.icon }));
  // «Премия» может открыться от монет за другие ачивки
  return [...fresh.map((a) => a.id), ...checkAchievements(run)];
}
