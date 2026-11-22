import { memo } from 'react';
import type { CSSProperties, ReactNode } from 'react';

/** Небольшие UI-иконки 24×24 (stroke-стиль). Заменяют emoji в интерфейсе. */
export type IconName =
  | 'heart' | 'heartEmpty' | 'coin' | 'star' | 'starEmpty' | 'close' | 'rotate'
  | 'lock' | 'play' | 'shop' | 'trophy' | 'reset' | 'pause' | 'arrow' | 'back'
  | 'lasso' | 'paw' | 'eye' | 'child' | 'orb' | 'hourglass' | 'magnet' | 'shield'
  | 'diamond' | 'target' | 'headphones' | 'dove' | 'blast' | 'spiral' | 'walker'
  | 'flame' | 'chat' | 'chip' | 'book' | 'bolt' | 'ghost' | 'moon' | 'check' | 'clock'
  | 'list' | 'swipe';

const P: Record<IconName, ReactNode> = {
  heart: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill="currentColor" />,
  heartEmpty: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
  coin: (
    <>
      <circle cx="12" cy="12" r="8" fill="currentColor" fillOpacity=".22" />
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5v9M9.5 9.5h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4" />
    </>
  ),
  star: <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z" fill="currentColor" />,
  starEmpty: <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  rotate: (
    <>
      <rect x="7" y="3" width="10" height="18" rx="2" />
      <path d="M2.5 12a9.5 9.5 0 0 1 3-6.5M21.5 12a9.5 9.5 0 0 1-3 6.5" />
      <path d="M3 3.5l2.5 2 2-2.5M21 20.5l-2.5-2-2 2.5" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  play: <path d="M8 5l11 7-11 7z" fill="currentColor" />,
  shop: (
    <>
      <path d="M4 9h16l-1.2 10.2a1 1 0 0 1-1 .8H6.2a1 1 0 0 1-1-.8z" />
      <path d="M9 9V7a3 3 0 0 1 6 0v2" />
    </>
  ),
  trophy: (
    <>
      <path d="M7 4h10v5a5 5 0 0 1-10 0z" />
      <path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M12 14v3M8 20h8M9.5 17h5" />
    </>
  ),
  reset: (
    <>
      <path d="M4 12a8 8 0 1 0 2.4-5.7" />
      <path d="M4 4v4h4" />
    </>
  ),
  pause: <path d="M8 5v14M16 5v14" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  back: <path d="M19 12H5M11 6l-6 6 6 6" />,
  lasso: (
    <>
      <ellipse cx="13" cy="8" rx="7" ry="4.5" />
      <path d="M8 11.5c-1 2-3 3-3 5.5a3 3 0 0 0 3 3M8 20l-2 1.5" />
    </>
  ),
  paw: (
    <>
      <ellipse cx="12" cy="15.5" rx="4.5" ry="3.8" fill="currentColor" fillOpacity=".25" />
      <ellipse cx="12" cy="15.5" rx="4.5" ry="3.8" />
      <circle cx="6.5" cy="10" r="1.8" /><circle cx="10" cy="6.5" r="1.8" />
      <circle cx="14" cy="6.5" r="1.8" /><circle cx="17.5" cy="10" r="1.8" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </>
  ),
  child: (
    <>
      <circle cx="12" cy="7" r="3.5" />
      <path d="M6 21v-3a6 6 0 0 1 12 0v3" />
      <path d="M10.5 7.5h.01M13.5 7.5h.01M10.8 9c.7.5 1.7.5 2.4 0" />
    </>
  ),
  orb: (
    <>
      <circle cx="12" cy="11" r="7" fill="currentColor" fillOpacity=".18" />
      <circle cx="12" cy="11" r="7" />
      <path d="M8 20h8M9 9.5a3 3 0 0 1 3-2.5" />
    </>
  ),
  hourglass: (
    <>
      <path d="M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9" />
      <path d="M9 18.5h6l-3-2.5z" fill="currentColor" />
    </>
  ),
  magnet: (
    <>
      <path d="M6 4v8a6 6 0 0 0 12 0V4h-4v8a2 2 0 0 1-4 0V4z" />
      <path d="M6 8h4M14 8h4" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6z" fill="currentColor" fillOpacity=".18" />
      <path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6z" />
    </>
  ),
  diamond: (
    <>
      <path d="M6 4h12l3 5-9 11L3 9z" fill="currentColor" fillOpacity=".18" />
      <path d="M6 4h12l3 5-9 11L3 9zM3 9h18M9 4l3 16 3-16" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </>
  ),
  headphones: (
    <>
      <path d="M4 15v-3a8 8 0 0 1 16 0v3" />
      <rect x="3" y="14" width="4" height="6" rx="1.5" fill="currentColor" fillOpacity=".3" />
      <rect x="17" y="14" width="4" height="6" rx="1.5" fill="currentColor" fillOpacity=".3" />
    </>
  ),
  dove: <path d="M3 14c4 0 6-2 8-6 1 3 3 4 6 4l4-2-2 4c-1 4-5 6-9 6-3 0-5-1-7-3l3-1z" />,
  blast: <path d="M12 2l2 6 5-3-2 6 5 1-5 3 3 5-6-2-2 6-2-6-6 2 3-5-5-3 5-1-2-6 5 3z" />,
  spiral: <path d="M12 12a1.5 1.5 0 1 1 1.5 1.5A3 3 0 0 1 10.5 10.5 4.5 4.5 0 0 1 15 6a6 6 0 0 1 6 6 7.5 7.5 0 0 1-7.5 7.5A9 9 0 0 1 3 12" />,
  walker: (
    <>
      <circle cx="13" cy="4.5" r="2" />
      <path d="M11 21l2-6-2-3 1-4 4 3 3 1M13 15l3 6M12 8l-4 2-1 4" />
    </>
  ),
  flame: <path d="M12 21c-4 0-6.5-2.8-6.5-6.2C5.5 10 10 8 10 3c3 2 4.5 4.5 4.5 7 1-.6 1.8-1.8 2-3 1.8 2 2.5 4.4 2.5 6.8C19 18.2 16 21 12 21z" />,
  chat: <path d="M4 5h16v11H9l-5 4z" />,
  chip: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <rect x="9.5" y="9.5" width="5" height="5" fill="currentColor" fillOpacity=".4" />
      <path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" />
    </>
  ),
  book: <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 21V5M8 7h7" />,
  bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7z" fill="currentColor" fillOpacity=".25" />,
  ghost: (
    <>
      <path d="M5 21V10a7 7 0 0 1 14 0v11l-2.3-2-2.3 2-2.4-2-2.3 2-2.4-2z" />
      <circle cx="9.5" cy="10" r="1.2" fill="currentColor" /><circle cx="14.5" cy="10" r="1.2" fill="currentColor" />
    </>
  ),
  moon: <path d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5z" />,
  check: <path d="M4.5 12.5l5 5 10-11" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  list: <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />,
  swipe: (
    <>
      <path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11l3.5.6a2 2 0 0 1 1.6 2.2l-.6 4.2a3 3 0 0 1-3 2.5H11a3 3 0 0 1-2.4-1.2L5.5 15a1.4 1.4 0 0 1 2-1.9L9 14.5" />
      <path d="M3 4h5M3 4l2-2M3 4l2 2" />
    </>
  ),
};

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
  strokeWidth?: number;
  title?: string;
}

export const Icon = memo(function Icon({ name, size = 20, className, style, strokeWidth = 1.8, title }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title ? <title>{title}</title> : null}
      {P[name]}
    </svg>
  );
});
