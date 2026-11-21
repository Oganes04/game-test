import type { Story } from '../store/gameStore'
export const secretPath = (s: Story) =>
  s.robot_kitten === 'memory' &&
  s.whisper === 'listened' &&
  s.whisperSaved === 'saved' &&
  s.misha === 'chip' &&
  s.ex === 'talked' &&
  s.shadow === 'passed' &&
  s.originalRobot === 'taken'
export function endingFor(s: Story) {
  if (s.curator === 'secret' && secretPath(s)) return 'secret'
  if (s.curator === 'nothing') return 'nothing'
  if (s.curator === 'power') return s.shadow === 'freed' ? 'power' : 'bureau'
  if (s.originalRobot === 'weapon') return 'destruction'
  return s.whisperSaved === 'saved' || s.shadow === 'freed'
    ? 'savior'
    : 'nothing'
}
