export type OrderType = 'onlyFirst' | 'speed' | 'noTools' | 'allSecond' | 'dark';

export interface OrderDef {
  type: OrderType;
  text: string;
  /** Подсказка, как сорвать приказ. */
  sabotageHint: string;
  duration: number;
}

export const BOSS_ORDERS: Record<OrderType, OrderDef> = {
  onlyFirst: {
    type: 'onlyFirst',
    text: 'Только первый контейнер!',
    sabotageHint: 'Другие заблокированы. Сортировка в них — саботаж',
    duration: 15,
  },
  speed: {
    type: 'speed',
    text: 'Скорость ×2!',
    sabotageHint: 'Замедление — саботаж',
    duration: 10,
  },
  noTools: {
    type: 'noTools',
    text: 'Запрещено Лассо!',
    sabotageHint: 'Любой инструмент — саботаж',
    duration: 20,
  },
  allSecond: {
    type: 'allSecond',
    text: 'Сортируй всё во второй!',
    sabotageHint: 'Всё во второй — очки Начальнику. Иначе — саботаж',
    duration: 15,
  },
  dark: {
    type: 'dark',
    text: 'Не смотри на ленту!',
    sabotageHint: 'Любая сортировка — саботаж',
    duration: 5,
  },
};

export const ORDER_REWARD_COINS = 5;
export const ORDER_TRUST = 5;
