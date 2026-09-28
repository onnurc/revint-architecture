import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useVisibleSteps } from './useVisibleSteps';

export function useKeyboardControls() {
  const stepIndex = useAppStore((s) => s.stepIndex);
  const setStepIndex = useAppStore((s) => s.setStepIndex);
  const togglePlaying = useAppStore((s) => s.togglePlaying);
  const visible = useVisibleSteps();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) return;
      if (!visible) return;
      const last = visible.steps.length - 1;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setStepIndex(Math.min(stepIndex + 1, last));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setStepIndex(Math.max(stepIndex - 1, 0));
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlaying();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [stepIndex, setStepIndex, togglePlaying, visible]);
}
