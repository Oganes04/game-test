import { memo } from 'react';
import type { ReactNode } from 'react';

/**
 * Иконки объектов на ленте: 40×40, простые path.
 * Обводка — currentColor, заливка — класс .of (var(--obj-fill)).
 */
const F = 'of';
const D = 'od'; // тёмные детали

const ICONS: Record<string, ReactNode> = {
  // ── Обычное ──
  teddy: (
    <>
      <circle cx="12" cy="11" r="4" className={F} /><circle cx="28" cy="11" r="4" className={F} />
      <circle cx="20" cy="17" r="8" className={F} />
      <ellipse cx="20" cy="30" rx="9" ry="7" className={F} />
      <circle cx="17" cy="16" r="1" className={D} /><circle cx="23" cy="16" r="1" className={D} />
      <ellipse cx="20" cy="20" rx="2.5" ry="1.8" className={D} />
    </>
  ),
  book: (
    <>
      <path d="M6 9c5-2 10-2 14 1v22c-4-3-9-3-14-1z" className={F} />
      <path d="M34 9c-5-2-10-2-14 1v22c4-3 9-3 14-1z" className={F} />
      <path d="M10 14h6M10 18h6M24 14h6M24 18h6" />
    </>
  ),
  cup: (
    <>
      <path d="M8 13h20v13a6 6 0 0 1-6 6h-8a6 6 0 0 1-6-6z" className={F} />
      <path d="M28 16h3a4 4 0 0 1 0 8h-3" />
      <path d="M14 5c-1 2 1 3 0 5M20 5c-1 2 1 3 0 5" />
    </>
  ),
  flower: (
    <>
      <path d="M20 22v13M20 30c-3-3-7-3-9-1M20 28c3-3 6-3 8-1" />
      <circle cx="20" cy="9" r="4" className={F} /><circle cx="27" cy="14" r="4" className={F} />
      <circle cx="13" cy="14" r="4" className={F} /><circle cx="16" cy="21" r="4" className={F} />
      <circle cx="24" cy="21" r="4" className={F} /><circle cx="20" cy="16" r="3" className={D} />
    </>
  ),
  apple: (
    <>
      <path d="M20 12c-6-4-14 0-12 10 1 7 6 12 12 10 6 2 11-3 12-10 2-10-6-14-12-10z" className={F} />
      <path d="M20 12c0-4 2-6 4-7M21 9c3-2 6-1 7 1-3 1-5 1-7-1" />
    </>
  ),
  letter: (
    <>
      <rect x="5" y="10" width="30" height="21" rx="3" className={F} />
      <path d="M5 12l15 11 15-11" />
      <circle cx="20" cy="23" r="2.5" className={D} />
    </>
  ),
  umbrella: (
    <>
      <path d="M4 20a16 14 0 0 1 32 0c-2-2-5-2-6 0-2-2-5-2-7 0-2-2-5-2-6 0-2-2-5-2-7 0z" className={F} />
      <path d="M20 6v24a3 3 0 0 1-6 0" />
    </>
  ),
  hat: (
    <>
      <path d="M11 26V12a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v14z" className={F} />
      <ellipse cx="20" cy="27" rx="16" ry="4" className={F} />
      <path d="M11 21h18" />
    </>
  ),
  key: (
    <>
      <circle cx="12" cy="20" r="7" className={F} /><circle cx="12" cy="20" r="2.5" className={D} />
      <path d="M19 20h16M30 20v5M34 20v4" />
    </>
  ),
  clock: (
    <>
      <circle cx="20" cy="21" r="13" className={F} />
      <path d="M20 13v8l5 4M11 6l-4 4M29 6l4 4" />
    </>
  ),
  photo: (
    <>
      <rect x="6" y="7" width="28" height="26" rx="2" className={F} />
      <rect x="10" y="11" width="20" height="15" className={D} />
      <circle cx="17" cy="16" r="2.5" /><path d="M10 26l7-5 4 3 4-4 5 6" />
    </>
  ),
  ball: (
    <>
      <circle cx="20" cy="20" r="14" className={F} />
      <path d="M6.5 16c8 3 19 3 27 0M20 6c-5 8-5 20 0 28M20 6c5 8 5 20 0 28" />
    </>
  ),
  sock: (
    <>
      <path d="M14 5h12v16l-4 10a5 5 0 0 1-9 1l-4-3a4 4 0 0 1 1-6l4-3z" className={F} />
      <path d="M14 10h12M14 14h12" />
    </>
  ),
  candle: (
    <>
      <rect x="14" y="17" width="12" height="18" rx="2" className={F} />
      <path d="M20 17v-3" />
      <path d="M20 4c3 3 4 6 0 9-4-3-3-6 0-9z" className={D} />
    </>
  ),
  // ── Техника ──
  gear: (
    <>
      <path d="M17 4h6l1 4 3 1.5 4-2 4 4-2 4 1.3 3 4 1v6l-4 1-1.3 3 2 4-4 4-4-2-3 1.3-1 4h-6l-1-4-3-1.3-4 2-4-4 2-4L8 23.5 4 23v-6l4-1 1.3-3-2-4 4-4 4 2L17 8z" className={F} />
      <circle cx="20" cy="20" r="5" className={D} />
    </>
  ),
  battery: (
    <>
      <rect x="6" y="12" width="26" height="16" rx="3" className={F} />
      <path d="M32 17h3v6h-3" />
      <path d="M12 20h6M15 17v6M23 20h5" />
    </>
  ),
  chip: (
    <>
      <rect x="10" y="10" width="20" height="20" rx="2" className={F} />
      <rect x="15" y="15" width="10" height="10" className={D} />
      <path d="M15 5v5M20 5v5M25 5v5M15 30v5M20 30v5M25 30v5M5 15h5M5 20h5M5 25h5M30 15h5M30 20h5M30 25h5" />
    </>
  ),
  bulb: (
    <>
      <path d="M20 4a11 11 0 0 0-7 19.5c1.5 1.3 2 2.5 2 4.5h10c0-2 .5-3.2 2-4.5A11 11 0 0 0 20 4z" className={F} />
      <path d="M15 31h10M16 35h8M17 22l3-5 3 5" />
    </>
  ),
  phone: (
    <>
      <rect x="11" y="4" width="18" height="32" rx="4" className={F} />
      <rect x="14" y="9" width="12" height="19" className={D} />
      <path d="M18 32h4" />
    </>
  ),
  radio: (
    <>
      <rect x="5" y="14" width="30" height="20" rx="3" className={F} />
      <circle cx="14" cy="24" r="5" className={D} />
      <path d="M24 20h7M24 24h7M24 28h7M10 14L28 5" />
    </>
  ),
  plug: (
    <>
      <path d="M11 13h18v8a9 9 0 0 1-18 0z" className={F} />
      <path d="M15 13V5M25 13V5M20 30v6" />
    </>
  ),
  screw: (
    <>
      <path d="M10 6h20l-3 7H13z" className={F} />
      <path d="M15 13h10v15l-5 7-5-7z" className={F} />
      <path d="M15 17l10 3M15 22l10 3M20 6v7" />
    </>
  ),
  antenna: (
    <>
      <path d="M20 16v19M12 35h16M14 26l6-10 6 10" />
      <circle cx="20" cy="12" r="4" className={F} />
      <path d="M11 6a12 12 0 0 0 0 12M29 6a12 12 0 0 1 0 12" />
    </>
  ),
  monitor: (
    <>
      <rect x="4" y="6" width="32" height="22" rx="3" className={F} />
      <rect x="8" y="10" width="24" height="14" className={D} />
      <path d="M16 34h8M20 28v6M11 19l4-4 4 4 5-6" />
    </>
  ),
  cassette: (
    <>
      <rect x="4" y="9" width="32" height="22" rx="3" className={F} />
      <circle cx="13" cy="19" r="3.5" className={D} /><circle cx="27" cy="19" r="3.5" className={D} />
      <path d="M13 19h14M10 31l3-5h14l3 5" />
    </>
  ),
  wrench: (
    <>
      <path d="M28 4a8 8 0 0 0-7 11L6 30a3 3 0 0 0 4 4l15-15a8 8 0 0 0 11-7l-5 2-3-3 2-5z" className={F} />
    </>
  ),
  // ── Опасное ──
  bomb: (
    <>
      <circle cx="18" cy="23" r="12" className={F} />
      <path d="M25 13l3-3M28 10c2-3 5-3 7-1" />
      <path d="M33 4l1 3M37 7l-3 1" />
      <circle cx="14" cy="20" r="3" className={D} />
    </>
  ),
  poison: (
    <>
      <path d="M15 4h10v8l7 10a8 8 0 0 1-6.5 13h-11A8 8 0 0 1 8 22l7-10z" className={F} />
      <circle cx="17" cy="23" r="2" className={D} /><circle cx="23" cy="23" r="2" className={D} />
      <path d="M17 29h6M14 4h12" />
    </>
  ),
  fire: (
    <path d="M20 36c-8 0-12-5-12-11 0-8 8-11 8-20 5 3 8 8 8 13 2-1 3-3 3-5 3 3 5 7 5 12 0 6-5 11-12 11z" className={F} />
  ),
  radiation: (
    <>
      <circle cx="20" cy="20" r="15" className={D} />
      <path d="M20 20L13 8a14 14 0 0 1 14 0zM20 20l14 0a14 14 0 0 1-7 12zM20 20l-7 12a14 14 0 0 1-7-12z" className={F} />
      <circle cx="20" cy="20" r="3" className={F} />
    </>
  ),
  lightning: <path d="M23 3L8 23h10l-3 14 17-21H21z" className={F} />,
  spider: (
    <>
      <ellipse cx="20" cy="22" rx="7" ry="8" className={F} />
      <circle cx="20" cy="12" r="4" className={F} />
      <path d="M13 18L5 12M13 22H4M13 26l-8 6M27 18l8-6M27 22h9M27 26l8 6" />
    </>
  ),
  dynamite: (
    <>
      <rect x="8" y="12" width="7" height="22" rx="2" className={F} />
      <rect x="16.5" y="12" width="7" height="22" rx="2" className={F} />
      <rect x="25" y="12" width="7" height="22" rx="2" className={F} />
      <path d="M6 22h28M20 12c0-4 3-6 6-6" /><circle cx="28" cy="5" r="2" className={D} />
    </>
  ),
  acid: (
    <>
      <path d="M9 10h22v22a3 3 0 0 1-3 3H12a3 3 0 0 1-3-3z" className={F} />
      <path d="M9 10c2-3 20-3 22 0M9 18h22M14 24c2 3 4 3 6 0s4-3 6 0" />
    </>
  ),
  saw: (
    <>
      <circle cx="20" cy="20" r="14" className={F} />
      <path d="M20 4l3 4M36 20l-4 3M20 36l-3-4M4 20l4-3M31 9l-1 5M31 31l-5-1M9 31l1-5M9 9l5 1" />
      <circle cx="20" cy="20" r="4" className={D} />
    </>
  ),
  blade: (
    <>
      <path d="M6 34L28 6l6 2-2 6L10 36z" className={F} />
      <path d="M10 28l4 4" />
    </>
  ),
  virus: (
    <>
      <circle cx="20" cy="20" r="10" className={F} />
      <path d="M20 4v6M20 30v6M4 20h6M30 20h6M9 9l4 4M27 27l4 4M31 9l-4 4M9 31l4-4" />
      <circle cx="17" cy="18" r="2" className={D} /><circle cx="23" cy="23" r="1.5" className={D} />
    </>
  ),
  mine: (
    <>
      <path d="M6 30c0-8 6-14 14-14s14 6 14 14z" className={F} />
      <path d="M4 30h32M20 16v-5M14 18l-3-4M26 18l3-4" />
      <circle cx="20" cy="9" r="2" className={D} />
    </>
  ),
  // ── Понятия ──
  love: <path d="M20 34S6 25 6 15a7 7 0 0 1 14-3 7 7 0 0 1 14 3c0 10-14 19-14 19z" className={F} />,
  hope: (
    <>
      <path d="M20 4l3 11 11 1-9 6 3 12-8-7-8 7 3-12-9-6 11-1z" className={F} />
    </>
  ),
  memory: (
    <>
      <path d="M8 6h24v28l-12-7-12 7z" className={F} />
      <path d="M14 14h12M14 19h8" />
    </>
  ),
  regret: (
    <>
      <circle cx="20" cy="18" r="13" className={F} />
      <path d="M13 16l4 2M27 16l-4 2M14 26c4-3 8-3 12 0" />
      <path d="M14 22c0 3-1 6-2 8" />
    </>
  ),
  fear: (
    <>
      <path d="M8 36V18a12 12 0 0 1 24 0v18l-4-3-4 3-4-3-4 3-4-3z" className={F} />
      <circle cx="15" cy="17" r="3" className={D} /><circle cx="25" cy="17" r="3" className={D} />
      <ellipse cx="20" cy="26" rx="3" ry="4" className={D} />
    </>
  ),
  guilt: (
    <>
      <path d="M10 34l3-18h14l3 18z" className={F} />
      <circle cx="20" cy="10" r="5" className={F} />
      <path d="M14 22h12" />
    </>
  ),
  emptiness: (
    <>
      <circle cx="20" cy="20" r="15" className={F} />
      <circle cx="20" cy="20" r="9" className={D} />
      <circle cx="20" cy="20" r="3" />
    </>
  ),
  anger: (
    <>
      <path d="M20 3l4 8 9-3-3 9 8 4-8 4 3 9-9-3-4 8-4-8-9 3 3-9-8-4 8-4-3-9 9 3z" className={F} />
      <path d="M15 17l4 2M25 17l-4 2M15 25h10" />
    </>
  ),
  oblivion: (
    <>
      <path d="M6 20c4-8 10-12 14-12s10 4 14 12c-4 8-10 12-14 12S10 28 6 20z" className={F} />
      <path d="M8 32L32 8" />
    </>
  ),
  // ── Особые ──
  question: (
    <>
      <circle cx="20" cy="20" r="15" className={F} />
      <path d="M15 15a5 5 0 1 1 7 4.6c-1.4.6-2 1.6-2 3V25" strokeWidth="3" />
      <circle cx="20" cy="30" r="1.6" fill="currentColor" />
    </>
  ),
  shadowTwin: (
    <>
      <path d="M10 36c0-9 4-14 10-14s10 5 10 14z" className={F} />
      <circle cx="20" cy="13" r="7" className={F} />
      <path d="M14 13h12" strokeWidth="3" />
    </>
  ),
};

interface Props {
  id: string;
  size?: number;
}

export const ObjectIcon = memo(function ObjectIcon({ id, size = 40 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {ICONS[id] ?? ICONS.question}
    </svg>
  );
});

export const OBJECT_ICON_IDS = Object.keys(ICONS);
