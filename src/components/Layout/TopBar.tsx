import clsx from 'clsx';
import { Moon, Sun } from 'lucide-react';
import { useAppStore, type TabId } from '../../store/useAppStore';

const tabs: Array<{ id: TabId; label: string; badge?: string }> = [
  { id: 'start-here',   label: 'Start Here',       badge: 'New' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'components',   label: 'Bounded Contexts' },
  { id: 'codebase',     label: 'Codebase Map' },
  { id: 'flows',        label: 'Flows' },
  { id: 'roadmap',      label: 'Roadmap' },
  { id: 'mermaid',      label: 'Mermaid' },
];

export function TopBar() {
  const tab = useAppStore((s) => s.tab);
  const setTab = useAppStore((s) => s.setTab);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface-0/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-6 py-3">
        {/* Logo */}
        <div className="flex shrink-0 items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent/15 text-accent">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
              <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" opacity=".85" />
            </svg>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight text-ink">Revint</div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-ink-faint">
              Architecture Hub
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-line" />

        {/* Nav */}
        <nav className="flex flex-1 flex-wrap items-center gap-0.5 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={clsx(
                'relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors',
                tab === t.id
                  ? 'bg-surface-2 font-medium text-ink shadow-sm'
                  : 'text-ink-soft hover:bg-surface-1 hover:text-ink',
              )}
            >
              {t.label}
              {t.badge && (
                <span className="rounded bg-accent/20 px-1 font-mono text-[8px] font-semibold uppercase tracking-wider text-accent">
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="shrink-0 rounded-md border border-line bg-surface-2 p-2 text-ink transition-colors hover:bg-surface-3"
          title="Toggle theme"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}
