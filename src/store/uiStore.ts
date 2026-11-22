import { create } from 'zustand';
import type { EndingId } from '../data/types';
import type { IconName } from '../components/svg/Icons';

export type Screen = 'menu' | 'intro' | 'levelIntro' | 'game' | 'complete' | 'shop' | 'achievements' | 'finale';

export interface LevelResult {
  levelId: number;
  win: boolean;
  reason?: string;
  score: number;
  stars: 0 | 1 | 2 | 3;
  lives: number;
  maxCombo: number;
  coins: number;
  ordersDone: number;
  ordersSabotaged: number;
  log: string[];
  ending?: EndingId;
}

export interface Toast {
  id: number;
  kind: 'achievement' | 'tool' | 'info';
  title: string;
  text?: string;
  icon: IconName;
}

interface UiState {
  screen: Screen;
  levelId: number;
  /** Растёт при каждом входе в игру — пересоздаёт GameScreen (рестарт). */
  runId: number;
  /** Куда вернуться из магазина/ачивок. */
  backTo: Screen;
  result: LevelResult | null;
  endingId: EndingId | null;
  toasts: Toast[];
  go: (screen: Screen, opts?: { levelId?: number; backTo?: Screen }) => void;
  setResult: (r: LevelResult) => void;
  setEnding: (id: EndingId) => void;
  pushToast: (t: Omit<Toast, 'id'>) => void;
  dropToast: (id: number) => void;
}

let toastId = 1;

export const useUiStore = create<UiState>()((set) => ({
  screen: 'menu',
  levelId: 1,
  runId: 0,
  backTo: 'menu',
  result: null,
  endingId: null,
  toasts: [],
  go: (screen, opts) =>
    set((s) => ({
      screen,
      levelId: opts?.levelId ?? s.levelId,
      backTo: opts?.backTo ?? s.backTo,
      runId: screen === 'game' ? s.runId + 1 : s.runId,
    })),
  setResult: (r) => set({ result: r }),
  setEnding: (id) => set({ endingId: id }),
  pushToast: (t) => set((s) => ({ toasts: [...s.toasts, { ...t, id: toastId++ }] })),
  dropToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

// dev-доступ для автотестов и скриншотов
if (import.meta.env.DEV) (window as unknown as { __ui?: typeof useUiStore }).__ui = useUiStore;
