import type { IconName } from '../components/svg/Icons';
import type { StoryFlags, ToolId } from './types';

export interface ToolDef {
  id: ToolId;
  name: string;
  desc: string;
  icon: IconName;
  color: string;
  /** Кулдаун, сек (0 — одноразовый). */
  cd: number;
  kind: 'base' | 'shop';
  price?: number;
  consumable?: boolean;
  unlockHint?: string;
}

export const TOOLS: Record<ToolId, ToolDef> = {
  lasso: {
    id: 'lasso', name: 'Лассо', icon: 'lasso', color: '#6c8cff', cd: 15, kind: 'base',
    desc: 'Притягивает ближайший к краю объект и выделяет его.', unlockHint: 'Уровень 2',
  },
  purr: {
    id: 'purr', name: 'Мурчание', icon: 'paw', color: '#ffd166', cd: 25, kind: 'base',
    desc: 'Замедляет все ленты ×2 на 5 секунд.', unlockHint: 'Спаси котёнка',
  },
  voice: {
    id: 'voice', name: 'Голос Пустоты', icon: 'eye', color: '#c86bff', cd: 30, kind: 'base',
    desc: '×3 очки за объекты «из Пустоты» 10 секунд.', unlockHint: 'Спаси Шёпота',
  },
  laugh: {
    id: 'laugh', name: 'Детский смех', icon: 'child', color: '#9fd0ff', cd: 40, kind: 'base',
    desc: 'Замораживает призраков на 5 секунд.', unlockHint: 'Спаси Мишу',
  },
  doubt: {
    id: 'doubt', name: 'Сомнение', icon: 'orb', color: '#a86bff', cd: 45, kind: 'base',
    desc: 'Объекты-вопросы можно сортировать 8 секунд.', unlockHint: 'Освободи Тень',
  },
  freeze: {
    id: 'freeze', name: 'Заморозка времени', icon: 'hourglass', color: '#9fd0ff', cd: 0, kind: 'shop',
    price: 50, consumable: true, desc: '+15 секунд к таймеру смены. Одноразовый.',
  },
  magnet: {
    id: 'magnet', name: 'Магнит', icon: 'magnet', color: '#ff8f6b', cd: 60, kind: 'shop',
    price: 80, desc: 'Авто-сортировка всех объектов на лентах. Кулдаун 60 с.',
  },
  shield: {
    id: 'shield', name: 'Призрачный щит', icon: 'shield', color: '#c86bff', cd: 0, kind: 'shop',
    price: 100, consumable: true, desc: '3 промаха не отнимают жизнь. Действует до конца уровня.',
  },
  double: {
    id: 'double', name: 'Двойные очки', icon: 'diamond', color: '#3ddc97', cd: 0, kind: 'shop',
    price: 60, consumable: true, desc: '×2 очки до конца уровня. Одноразовый.',
  },
  eye: {
    id: 'eye', name: 'Точный глаз', icon: 'target', color: '#ffd166', cd: 30, kind: 'shop',
    price: 120, desc: 'Подсвечивает правильный контейнер 6 секунд. Кулдаун 30 с.',
  },
};

export const BASE_TOOLS: ToolId[] = ['lasso', 'purr', 'voice', 'laugh', 'doubt'];
export const SHOP_TOOLS: ToolId[] = ['freeze', 'magnet', 'shield', 'double', 'eye'];

/** Какие базовые инструменты положены по флагам сюжета. */
export function storyTools(s: StoryFlags, levelId: number): ToolId[] {
  const out: ToolId[] = [];
  if (levelId >= 2) out.push('lasso');
  const kitten = s.sad_villain === 'saved' || s.sad_villain === 'used' || s.robot_kitten === 'saved';
  if (kitten) out.push('purr');
  if (s.whisperSaved) out.push('voice');
  if (s.misha === 'gift' || s.misha === 'chip') out.push('laugh');
  if (s.shadow === 'freed') out.push('doubt');
  return out;
}
