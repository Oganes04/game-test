import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMobileViewport } from './hooks/useMobileViewport';
import { RotateDeviceOverlay } from './components/RotateDeviceOverlay';
import { AchievementToast } from './components/AchievementToast';
import { Particles } from './components/Particles';
import { MainMenu } from './screens/MainMenu';
import { IntroScreen } from './screens/IntroScreen';
import { LevelIntroScreen } from './screens/LevelIntroScreen';
import { GameScreen } from './screens/GameScreen';
import { LevelComplete } from './screens/LevelComplete';
import { ShopScreen } from './screens/ShopScreen';
import { AchievementsScreen } from './screens/AchievementsScreen';
import { FinaleScreen } from './screens/FinaleScreen';
import { useUiStore } from './store/uiStore';
import type { Screen } from './store/uiStore';
import { getLevel } from './data/levels';
import type { Scene } from './data/types';
import { installViewportHeightFallback } from './utils/viewport';

const SCREENS: Record<Screen, () => JSX.Element | null> = {
  menu: MainMenu,
  intro: IntroScreen,
  levelIntro: LevelIntroScreen,
  game: GameScreen,
  complete: LevelComplete,
  shop: ShopScreen,
  achievements: AchievementsScreen,
  finale: FinaleScreen,
};

function sceneFor(screen: Screen, levelId: number, backTo: Screen): Scene {
  if (screen === 'finale') return 'final';
  if (screen === 'menu' || screen === 'intro') return 'factory';
  if ((screen === 'shop' || screen === 'achievements') && backTo === 'menu') return 'factory';
  return getLevel(levelId).scene;
}

export default function App() {
  const vp = useMobileViewport();
  const screen = useUiStore((s) => s.screen);
  const levelId = useUiStore((s) => s.levelId);
  const runId = useUiStore((s) => s.runId);
  const backTo = useUiStore((s) => s.backTo);
  const scene = sceneFor(screen, levelId, backTo);

  useEffect(() => installViewportHeightFallback(), []);

  // Фоновая сцена — классом на <body>
  useEffect(() => {
    document.body.className = `scene-${scene}`;
  }, [scene]);

  const Current = SCREENS[screen];
  const key = screen === 'game' ? `game-${levelId}-${runId}` : screen;

  return (
    <>
      <Particles scene={scene} />
      <AnimatePresence mode="wait">
        <motion.div
          key={key}
          style={{ position: 'absolute', inset: 0 }}
          initial={{ opacity: 0, y: screen === 'game' ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
        >
          <Current />
        </motion.div>
      </AnimatePresence>
      <AchievementToast />
      {vp.isLandscape && <RotateDeviceOverlay />}
    </>
  );
}
