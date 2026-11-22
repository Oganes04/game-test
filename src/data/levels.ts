import type { LevelDef, Scene } from './types';
import { idsOf } from './objects';
import type { OrderType } from './bossOrders';

/** Базовые параметры ленты — общие для движка и расчёта таймера. */
export const BASE_SPAWN_INTERVAL = 1.9; // сек между объектами на 1 линии при скорости 1.0x
export const BASE_CROSS_TIME = 7.5; // сек на проезд ленты при 1.0x
export const LANE_INTERVAL_FACTOR: Record<number, number> = { 1: 1, 2: 1.6, 3: 2.2 };

const ALL = idsOf('common', 'tech', 'danger');
const CONCEPTS = idsOf('keep', 'release', 'erase');

/** Таймер считается из темпа подачи: цель × интервал × запас + 12с. */
function timeFor(goal: number, speed: number, lanes: number, sortableShare = 1) {
  const perLane = (BASE_SPAWN_INTERVAL / speed) * LANE_INTERVAL_FACTOR[lanes];
  const effective = perLane / lanes / sortableShare;
  return Math.round(goal * effective * 1.5 + 12);
}

interface Raw extends Omit<LevelDef, 'time' | 'scene'> {
  orderTypes: OrderType[];
  sortableShare?: number;
}

const sceneFor = (id: number): Scene =>
  id <= 2 ? 'factory' : id <= 4 ? 'alarm' : id <= 6 ? 'grim' : id <= 8 ? 'personal' : id === 9 ? 'void' : 'final';

const RAW: Raw[] = [
  {
    id: 1, act: 1, title: 'Первый день', speed: 1.0, goal: 20, feature: 'Обучение',
    lanes: [{ cats: ['common', 'tech', 'danger'] }], bins: ['common', 'tech', 'danger'],
    orders: 0, orderTypes: [], pool: ALL.filter((_, i) => i % 3 !== 2),
    events: [{ at: 5, kind: 'dilemma', id: 'villain', mode: 'belt' }],
  },
  {
    id: 2, act: 1, title: 'Робот-котёнок', speed: 1.15, goal: 25, feature: 'Лассо',
    lanes: [{ cats: ['common', 'tech', 'danger'] }], bins: ['common', 'tech', 'danger'],
    orders: 0, orderTypes: [], pool: ALL,
    events: [{ at: 7, kind: 'dilemma', id: 'robotKitten', mode: 'belt' }],
  },
  {
    id: 3, act: 2, title: 'Инспекция', speed: 1.3, goal: 30, feature: 'Шёпот в углу · 1 приказ',
    lanes: [{ cats: ['common', 'tech', 'danger'] }], bins: ['common', 'tech', 'danger'],
    orders: 1, orderTypes: ['noTools'], pool: ALL,
    events: [{ at: 14, kind: 'dilemma', id: 'whisper3', mode: 'corner' }],
  },
  {
    id: 4, act: 2, title: 'Призраки', speed: 1.45, goal: 35, feature: 'Призраки и союзники',
    lanes: [{ cats: ['common', 'tech', 'danger'] }], bins: ['common', 'tech', 'danger'],
    orders: 1, orderTypes: ['onlyFirst'], pool: ALL,
    events: [{ at: 4, kind: 'beat', id: 'ghosts4', mode: 'corner' }],
  },
  {
    id: 5, act: 3, title: 'Возвращение Шёпота', speed: 1.6, goal: 40, feature: 'Шёпот на ленте',
    lanes: [{ cats: ['common', 'tech', 'danger'] }], bins: ['common', 'tech', 'danger'],
    orders: 1, orderTypes: ['speed'], pool: ALL, voidObjects: true,
    events: [{ at: 15, kind: 'dilemma', id: 'whisper5', mode: 'belt' }],
  },
  {
    id: 6, act: 3, title: 'Куратор', speed: 1.65, goal: 45, feature: '2 приказа',
    lanes: [{ cats: ['common', 'tech', 'danger'] }], bins: ['common', 'tech', 'danger'],
    orders: 2, orderTypes: ['allSecond', 'dark'], pool: ALL, voidObjects: true,
    events: [{ at: 22, kind: 'dilemma', id: 'curator6', mode: 'corner' }],
  },
  {
    id: 7, act: 4, title: 'Сын и Она', speed: 1.65, goal: 45, feature: 'Вторая линия',
    lanes: [{ cats: ['common', 'tech'] }, { cats: ['tech', 'danger'] }], bins: ['common', 'tech', 'danger'],
    orders: 2, orderTypes: ['onlyFirst', 'speed'], pool: ALL, voidObjects: true,
    events: [
      { at: 8, kind: 'dilemma', id: 'misha', mode: 'belt' },
      { at: 26, kind: 'dilemma', id: 'ex', mode: 'belt' },
    ],
  },
  {
    id: 8, act: 4, title: 'Тень Куратора', speed: 1.7, goal: 50, feature: 'Тени-двойники',
    lanes: [{ cats: ['common', 'danger'] }, { cats: ['common', 'tech', 'danger'] }], bins: ['common', 'tech', 'danger'],
    orders: 2, orderTypes: ['noTools', 'allSecond'], pool: ALL, voidObjects: true, shadowTwins: true,
    sortableShare: 0.82,
    events: [{ at: 20, kind: 'dilemma', id: 'shadow', mode: 'belt' }],
  },
  {
    id: 9, act: 5, title: 'Пустота', speed: 1.75, goal: 45, feature: 'Шкала света',
    lanes: [{ cats: ['common', 'tech', 'danger'] }, { cats: ['common', 'tech', 'danger'] }], bins: ['common', 'tech', 'danger'],
    orders: 2, orderTypes: ['dark', 'speed'], pool: ALL, voidObjects: true, lightMeter: true,
    events: [
      { at: 6, kind: 'beat', id: 'whisperHidden', mode: 'corner', when: (s) => s.misha === 'chip' },
      { at: 22, kind: 'dilemma', id: 'original', mode: 'belt' },
    ],
  },
  {
    id: 10, act: 5, title: 'Настоящий финал', speed: 1.75, goal: 40, feature: 'Третья линия · вопросы',
    lanes: [{ cats: ['keep', 'release'] }, { cats: ['release', 'erase'] }, { cats: ['keep', 'erase'] }],
    bins: ['keep', 'release', 'erase'],
    orders: 2, orderTypes: ['allSecond', 'onlyFirst'], pool: CONCEPTS, questions: true,
    sortableShare: 0.8,
    events: [{ at: 40, kind: 'dilemma', id: 'final', mode: 'final' }],
  },
];

export interface LevelFull extends LevelDef {
  orderTypes: OrderType[];
}

export const LEVELS: LevelFull[] = RAW.map((r) => ({
  ...r,
  scene: sceneFor(r.id),
  time: timeFor(r.goal, r.speed, r.lanes.length, r.sortableShare),
}));

export const getLevel = (id: number) => LEVELS[Math.max(0, Math.min(LEVELS.length - 1, id - 1))];

export const ACT_NAMES: Record<number, string> = {
  1: 'Акт I · Новый сотрудник',
  2: 'Акт II · Тайна',
  3: 'Акт III · Правда',
  4: 'Акт IV · Личное',
  5: 'Акт V · Финал',
};
