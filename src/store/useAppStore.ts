import { create } from 'zustand';
import type { FlowId } from '../types';

export type TabId = 'start-here' | 'architecture' | 'components' | 'codebase' | 'flows' | 'roadmap' | 'mermaid';
export type Theme = 'dark' | 'light';
export type ActiveFlow = FlowId | 'all';

interface AppState {
  theme: Theme;
  toggleTheme: () => void;

  tab: TabId;
  setTab: (t: TabId) => void;

  activeFlow: ActiveFlow;
  setActiveFlow: (f: ActiveFlow) => void;

  stepIndex: number;
  setStepIndex: (i: number) => void;

  playing: boolean;
  setPlaying: (p: boolean) => void;
  togglePlaying: () => void;

  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
}

const applyThemeClass = (theme: Theme) => {
  const html = document.documentElement;
  if (theme === 'light') html.classList.add('light');
  else html.classList.remove('light');
};

const initialTheme: Theme =
  typeof window !== 'undefined' && localStorage.getItem('revint-theme') === 'light'
    ? 'light'
    : 'dark';

if (typeof window !== 'undefined') applyThemeClass(initialTheme);

export const useAppStore = create<AppState>((set, get) => ({
  theme: initialTheme,
  toggleTheme: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('revint-theme', next);
    applyThemeClass(next);
    set({ theme: next });
  },

  tab: 'start-here',
  setTab: (t) => set({ tab: t }),

  activeFlow: 'all',
  setActiveFlow: (f) => set({ activeFlow: f, stepIndex: 0, playing: false }),

  stepIndex: 0,
  setStepIndex: (i) => set({ stepIndex: Math.max(0, i) }),

  playing: false,
  setPlaying: (p) => set({ playing: p }),
  togglePlaying: () => set({ playing: !get().playing }),

  selectedNodeId: null,
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
}));
