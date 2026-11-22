import { memo, useId } from 'react';

interface Props {
  color: string;
  className?: string;
}

/** Контейнер-приёмник: воронка с подсвеченным краем. Растягивается по ширине. */
export const BinSVG = memo(function BinSVG({ color, className }: Props) {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 120 72" preserveAspectRatio="none" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity=".38" />
          <stop offset="1" stopColor="#0b1020" stopOpacity=".95" />
        </linearGradient>
        <linearGradient id={`${id}r`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={color} stopOpacity="0" />
          <stop offset=".5" stopColor={color} stopOpacity="1" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* внутренность */}
      <path d="M4 10h112l-10 58H14z" fill="#05070e" />
      <path d="M4 10h112l-10 58H14z" fill={`url(#${id}b)`} />
      {/* рёбра */}
      <path d="M36 10l-4 58M60 10v58M84 10l4 58" stroke={color} strokeOpacity=".16" strokeWidth="1.5" />
      {/* обод */}
      <rect x="2" y="6" width="116" height="7" rx="3.5" fill="#131a2e" stroke={color} strokeOpacity=".7" strokeWidth="1.2" />
      <rect x="10" y="2" width="100" height="3" rx="1.5" fill={`url(#${id}r)`} opacity=".9" />
      {/* предупреждающие полосы */}
      <path d="M18 60h84" stroke={color} strokeOpacity=".5" strokeWidth="2" strokeDasharray="6 5" />
    </svg>
  );
});
