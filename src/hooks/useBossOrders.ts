import { useMemo } from 'react';
import { BOSS_ORDERS } from '../data/bossOrders';
import type { OrderDef, OrderType } from '../data/bossOrders';

export interface ActiveOrder {
  def: OrderDef;
  remaining: number;
  sabotaged: boolean;
}

export interface OrderHud {
  type: OrderType;
  text: string;
  hint: string;
  remaining: number;
  duration: number;
  sabotaged: boolean;
}

/** Пороги (доля от цели), на которых Начальник вмешивается. */
export function planOrders(types: OrderType[], goal: number): { at: number; def: OrderDef }[] {
  const fractions = types.length === 1 ? [0.35] : [0.25, 0.62];
  return types.map((t, i) => ({ at: Math.max(2, Math.round(goal * fractions[i])), def: BOSS_ORDERS[t] }));
}

/** Во время этих приказов упущенные объекты не стоят жизни: Начальник берёт ответственность. */
export const orderForgivesEscapes = (o: ActiveOrder | null) => !!o && (o.def.type === 'onlyFirst' || o.def.type === 'dark');

export const orderSpeedMultiplier = (o: ActiveOrder | null) => (o?.def.type === 'speed' ? 2 : 1);

export function toOrderHud(o: ActiveOrder | null): OrderHud | null {
  if (!o) return null;
  return {
    type: o.def.type,
    text: o.def.text,
    hint: o.def.sabotageHint,
    remaining: o.remaining,
    duration: o.def.duration,
    sabotaged: o.sabotaged,
  };
}

/** UI-производные активного приказа для экрана игры. */
export function useBossOrders(order: OrderHud | null) {
  return useMemo(() => {
    const type = order?.type;
    return {
      active: !!order,
      lockedBins: type === 'onlyFirst' ? new Set([1, 2]) : new Set<number>(),
      trapBin: type === 'allSecond' ? 1 : -1,
      toolsLocked: type === 'noTools',
      dark: type === 'dark',
    };
  }, [order?.type]);
}
