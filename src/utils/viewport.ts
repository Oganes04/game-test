/** Читает значение env(safe-area-inset-*) через временный элемент. */
export function readSafeArea(): { top: number; bottom: number } {
  if (typeof document === 'undefined') return { top: 0, bottom: 0 };
  const probe = document.createElement('div');
  probe.style.cssText =
    'position:fixed;visibility:hidden;pointer-events:none;' +
    'padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)';
  document.body.appendChild(probe);
  const cs = getComputedStyle(probe);
  const top = parseFloat(cs.paddingTop) || 0;
  const bottom = parseFloat(cs.paddingBottom) || 0;
  probe.remove();
  return { top, bottom };
}

/** Тач-устройство с «грубым» указателем — телефон/планшет. */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(pointer: coarse)').matches ?? 'ontouchstart' in window;
}

/** Фолбэк для браузеров без dvh: пишет реальную высоту окна в --app-h. */
export function installViewportHeightFallback(): () => void {
  const supportsDvh = typeof CSS !== 'undefined' && CSS.supports?.('height', '100dvh');
  if (supportsDvh) return () => {};
  const apply = () => {
    const h = window.visualViewport?.height ?? window.innerHeight;
    document.documentElement.style.setProperty('--app-h', `${h}px`);
  };
  apply();
  window.addEventListener('resize', apply);
  window.addEventListener('orientationchange', apply);
  return () => {
    window.removeEventListener('resize', apply);
    window.removeEventListener('orientationchange', apply);
  };
}
