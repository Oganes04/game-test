import { useEffect, useRef } from 'react'

export default function useGameLoop(
  enabled: boolean,
  step: (delta: number) => void,
) {
  const latest = useRef(step)
  latest.current = step
  useEffect(() => {
    if (!enabled) return
    let frame = 0,
      previous = performance.now()
    function tick(now: number) {
      const delta = Math.min((now - previous) / 1000, 0.1)
      previous = now
      if (!document.hidden) latest.current(delta)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [enabled])
}
