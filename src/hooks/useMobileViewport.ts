import { useEffect, useState } from 'react';
import { isTouchDevice, readSafeArea } from '../utils/viewport';

export interface MobileViewport {
  isMobile: boolean;
  isLandscape: boolean;
  width: number;
  height: number;
  safeTop: number;
  safeBottom: number;
}

function measure(): MobileViewport {
  const width = window.innerWidth;
  const height = window.visualViewport?.height ?? window.innerHeight;
  const touch = isTouchDevice();
  const isMobile = touch || width <= 600;
  // Ландшафт считаем только для тач-устройств с маленькой высотой:
  // на десктопе широкое окно — норма.
  const isLandscape = touch && width > height && height < 600;
  const { top, bottom } = readSafeArea();
  return { isMobile, isLandscape, width, height, safeTop: top, safeBottom: bottom };
}

export function useMobileViewport(): MobileViewport {
  const [vp, setVp] = useState<MobileViewport>(() => measure());

  useEffect(() => {
    let raf = 0;
    const onChange = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setVp(measure()));
    };
    window.addEventListener('resize', onChange);
    window.addEventListener('orientationchange', onChange);
    window.visualViewport?.addEventListener('resize', onChange);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onChange);
      window.removeEventListener('orientationchange', onChange);
      window.visualViewport?.removeEventListener('resize', onChange);
    };
  }, []);

  return vp;
}
