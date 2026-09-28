import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useVisibleSteps } from './useVisibleSteps';

export function useFlowAnimation(intervalMs = 2200) {
  const playing = useAppStore((s) => s.playing);
  const setPlaying = useAppStore((s) => s.setPlaying);
  const stepIndex = useAppStore((s) => s.stepIndex);
  const setStepIndex = useAppStore((s) => s.setStepIndex);
  const visible = useVisibleSteps();

  useEffect(() => {
    if (!playing || !visible) return;
    const last = visible.steps.length - 1;
    if (stepIndex >= last) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setStepIndex(stepIndex + 1), intervalMs);
    return () => clearTimeout(t);
  }, [playing, stepIndex, visible, setPlaying, setStepIndex, intervalMs]);
}
