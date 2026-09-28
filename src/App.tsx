import { TopBar } from './components/Layout/TopBar';
import { StartHere } from './components/sections/StartHere';
import { Architecture } from './components/sections/Architecture';
import { Components } from './components/sections/Components';
import { CodebaseMap } from './components/sections/CodebaseMap';
import { Flows } from './components/sections/Flows';
import { Roadmap } from './components/sections/Roadmap';
import { MermaidSource } from './components/sections/MermaidSource';
import { useAppStore } from './store/useAppStore';
import { useKeyboardControls } from './hooks/useKeyboardControls';
import { useFlowAnimation } from './hooks/useFlowAnimation';

function Section() {
  const tab = useAppStore((s) => s.tab);
  switch (tab) {
    case 'start-here':   return <StartHere />;
    case 'architecture': return <Architecture />;
    case 'components':   return <Components />;
    case 'codebase':     return <CodebaseMap />;
    case 'flows':        return <Flows />;
    case 'roadmap':      return <Roadmap />;
    case 'mermaid':      return <MermaidSource />;
    default:             return null;
  }
}

export default function App() {
  useKeyboardControls();
  useFlowAnimation();
  return (
    <div className="min-h-full bg-surface-0 text-ink">
      <TopBar />
      <main>
        <Section />
      </main>
      <footer className="mx-auto max-w-[1440px] border-t border-line px-6 py-6 font-mono text-[10px] uppercase tracking-widest text-ink-faint">
        Revint Architecture Hub · edit src/data/ to update any content · built with @xyflow/react + framer-motion
      </footer>
    </div>
  );
}
