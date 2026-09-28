import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, AlertTriangle, CheckCircle2, Circle, Hourglass } from 'lucide-react';
import { gaps } from '../../data/gaps';
import type { GapStatus, ContextId } from '../../types';

// ─── phases ──────────────────────────────────────────────────────────────────

interface Phase {
  id: string;
  label: string;
  color: string;
  status: 'done' | 'active' | 'upcoming' | 'vision';
  milestone: string;
  description: string;
  items: string[];  // gap IDs
}

const phases: Phase[] = [
  {
    id: 'p0',
    label: 'Phase 0 — HubSpot OAuth Fix',
    color: '#f59e0b',
    status: 'active',
    milestone: 'Pre-condition for CH MVP',
    description: 'Before HubSpot writeback can work at all, the OAuth app must have the correct scopes. Current scope is missing crm.schemas.contacts.write, so ensureRevintProperties() silently fails and no revint_* properties are ever created in the portal.',
    items: ['G9', 'G10'],
  },
  {
    id: 'p1',
    label: 'Phase 1 — Writeback Fix + HeadOfAgents Rollout',
    color: '#6366f1',
    status: 'active',
    milestone: 'CH MVP (FineDine) · SI.AI Faz 1',
    description: 'Two parallel tracks: (A) Wire the missing enqueueCrmWriteback() call in lead-intelligence-brief.ts so the HubSpot writeback actually fires after analysis. (B) Begin HeadOfAgents canary rollout and add the live_recrawl action tool.',
    items: ['G8', 'G9', 'G13'],
  },
  {
    id: 'p2',
    label: 'Phase 2 — Extended Action Tools',
    color: '#0ea5e9',
    status: 'upcoming',
    milestone: 'SI.AI Faz 2',
    description: 'Extend HeadOfAgents from read-only to read+validate by adding a web_search action tool. Prerequisite: fix the apify.ts:106 cost=0 bug so search costs are tracked correctly. Also fix Gemini key rotation edge cases.',
    items: ['G12', 'G14'],
  },
  {
    id: 'p3',
    label: 'Phase 3 — HubSpot Company Leads + MCP',
    color: '#f97316',
    status: 'upcoming',
    milestone: 'CH MVP (FineDine) Faz 3 · Post-M1',
    description: 'Extend the HubSpot integration to support company-level ingestion (restaurants come in as Companies, not Contacts). In parallel, design and build the CH.MCP server so external AI agents can query Leadac intelligence at runtime.',
    items: ['G15', 'G16'],
  },
  {
    id: 'p4',
    label: 'Phase 4 — Evidence T1–T4 Tiering',
    color: '#8b5cf6',
    status: 'vision',
    milestone: 'SI.AI Faz 3 / M4',
    description: 'Introduce formal evidence provenance to every claim in the brief. Today, all claims are mixed together regardless of source quality. T1 (direct quotes from reviews) is fundamentally different from T4 (AI inference) — but both look the same in the output. Tiering makes this explicit so SDRs know what to trust.',
    items: ['G17', 'G19', 'G20'],
  },
  {
    id: 'p5',
    label: 'Phase 5 — OI Closed-Loop Learning',
    color: '#22c55e',
    status: 'vision',
    milestone: 'OI Phase (M4+)',
    description: 'The seeds exist (OPENER_SUCCESS/FAIL memory writes, InsightPerformance Wilson scores) but the feedback loop is not closed. Winning patterns detected by PatternRecognition need to flow back into computeFnbModuleFit() as updated weights — so the module shortlist improves automatically with each won deal.',
    items: ['G11', 'G18'],
  },
];

// ─── styling ─────────────────────────────────────────────────────────────────

const statusMeta: Record<GapStatus, { label: string; color: string }> = {
  live:    { label: 'Live',    color: '#22c55e' },
  partial: { label: 'Partial', color: '#f59e0b' },
  planned: { label: 'Planned', color: '#6366f1' },
  vision:  { label: 'Vision',  color: '#ec4899' },
};

const phaseStatusIcon = {
  done:     <CheckCircle2 className="h-5 w-5 text-[#22c55e]" />,
  active:   <AlertTriangle className="h-5 w-5 text-[#f59e0b]" />,
  upcoming: <Hourglass className="h-5 w-5 text-[#6366f1]" />,
  vision:   <Circle className="h-5 w-5 text-[#ec4899]" />,
};

const contextColors: Record<string, string> = {
  SI: '#8b5cf6', CH: '#f97316', OI: '#22c55e', AI: '#6366f1', Platform: '#0ea5e9',
};

type FilterContext = ContextId | 'Platform' | 'all';
type FilterStatus = GapStatus | 'all';

// ─── components ──────────────────────────────────────────────────────────────

function GapCard({ gapId }: { gapId: string }) {
  const gap = gaps.find((g) => g.id === gapId);
  if (!gap) return null;
  const m = statusMeta[gap.status];
  const ctxColor = contextColors[gap.context] ?? '#6366f1';

  return (
    <div
      className="flex flex-col gap-2 rounded-xl border border-line bg-surface-0 p-4"
      style={{ borderLeft: `3px solid ${m.color}` }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] text-ink-faint">{gap.id}</span>
        <span
          className="rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider"
          style={{ background: `${ctxColor}15`, color: ctxColor }}
        >
          {gap.context}
        </span>
        <span
          className="rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider"
          style={{ borderColor: `${m.color}44`, background: `${m.color}12`, color: m.color }}
        >
          {m.label}
        </span>
      </div>
      <div className="font-medium text-ink">{gap.title}</div>
      <p className="text-xs leading-relaxed text-ink-soft">{gap.description}</p>
      {gap.fix && (
        <div
          className="rounded-lg border p-2.5 text-xs"
          style={{ borderColor: `${m.color}33`, background: `${m.color}08` }}
        >
          <span className="font-semibold" style={{ color: m.color }}>Fix: </span>
          <span className="text-ink-soft">{gap.fix}</span>
        </div>
      )}
      <div className="font-mono text-[9px] text-ink-faint">{gap.codeRef}</div>
    </div>
  );
}

function PhaseBlock({ phase }: { phase: Phase }) {
  const [open, setOpen] = useState(phase.status === 'active');

  return (
    <div
      className="rounded-2xl border border-line bg-surface-1 overflow-hidden"
      style={phase.status === 'active' ? { borderColor: `${phase.color}55` } : undefined}
    >
      <button
        className="flex w-full items-center gap-4 p-5 text-left hover:bg-surface-2 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="shrink-0">{phaseStatusIcon[phase.status]}</div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-ink">{phase.label}</div>
          <div className="mt-0.5 font-mono text-[10px] text-ink-faint">{phase.milestone}</div>
        </div>
        <span
          className="hidden shrink-0 rounded-md px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider sm:inline"
          style={{ background: `${phase.color}20`, color: phase.color }}
        >
          {phase.status}
        </span>
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-ink-faint" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-ink-faint" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="border-t border-line px-5 pb-5 pt-4 flex flex-col gap-4">
              <p className="text-sm leading-relaxed text-ink-soft">{phase.description}</p>
              <div className="grid gap-3 md:grid-cols-2">
                {phase.items.map((id) => <GapCard key={id} gapId={id} />)}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── hubspot deep-dive ───────────────────────────────────────────────────────

function HubspotRemediationPlan() {
  const [open, setOpen] = useState(false);
  const fases = [
    { id: 'Faz 0', color: '#f59e0b', title: 'OAuth App Alignment', steps: ['Audit the HubSpot OAuth app in FineDine portal', 'Add missing scopes: crm.schemas.contacts.write, crm.objects.contacts.write, crm.objects.deals.write', 'Reconnect the OAuth flow to get a fresh token with correct scopes'] },
    { id: 'Faz 1', color: '#f97316', title: 'ensureRevintProperties Fix', steps: ['Fix ensureRevintProperties() to surface errors instead of swallowing them', 'Add retry logic with exponential backoff on 403', 'Verify all 11 revint_* properties are created in the test portal before proceeding'] },
    { id: 'Faz 2', color: '#6366f1', title: 'Wire the Missing Call', steps: ['In lead-intelligence-brief.ts ~line 1560, after salesConfidence update, add enqueueCrmWriteback(workspaceId, leadId)', 'Verify CrmSyncLog entries are created in DB after analysis', 'Check HubSpot contact shows updated revint_sales_confidence in test portal'] },
    { id: 'Faz 3', color: '#8b5cf6', title: 'Company-Level Support', steps: ['Provision revint_* properties on the Company object type in HubSpot', 'Extend writeback.ts to support objectType: "company"', 'Update App Card objectTypes to include companies'] },
    { id: 'Faz 4', color: '#22c55e', title: 'App Card Deployment', steps: ['cd hubspot-app && hs project upload', 'Promote the card in the HubSpot developer portal', 'Verify card renders in contact and company views with fresh revint_* data'] },
  ];

  return (
    <div className="rounded-2xl border border-[#f97316]/40 bg-surface-1 overflow-hidden">
      <button
        className="flex w-full items-center gap-4 p-5 text-left hover:bg-surface-2 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <AlertTriangle className="h-5 w-5 shrink-0 text-[#f97316]" />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-ink">HubSpot 5-Phase Writeback Remediation</div>
          <div className="mt-0.5 font-mono text-[10px] text-ink-faint">
            Known bug: enqueueCrmWriteback() never called → crm_sync_logs empty
          </div>
        </div>
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-ink-faint" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-ink-faint" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="border-t border-[#f97316]/30 px-5 pb-5 pt-4">
              <p className="mb-4 text-sm text-ink-soft">
                The HubSpot writeback has a chain of three bugs that must be fixed in order.
                Faz 0 and 1 are OAuth-level prerequisites. Faz 2 is the actual code fix.
                Faz 3–4 are the extension and deployment.
              </p>
              <div className="flex flex-col gap-3">
                {fases.map((f) => (
                  <div
                    key={f.id}
                    className="rounded-xl border p-4"
                    style={{ borderColor: `${f.color}33`, background: `${f.color}08` }}
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <span
                        className="rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold"
                        style={{ background: `${f.color}25`, color: f.color }}
                      >
                        {f.id}
                      </span>
                      <span className="font-semibold text-ink">{f.title}</span>
                    </div>
                    <ol className="space-y-1.5">
                      {f.steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-ink-soft">
                          <span
                            className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full font-mono text-[8px]"
                            style={{ background: `${f.color}20`, color: f.color }}
                          >
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── all gaps table ───────────────────────────────────────────────────────────

function AllGapsTable() {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterContext, setFilterContext] = useState<FilterContext>('all');
  const [search, setSearch] = useState('');

  const filtered = gaps.filter((g) => {
    if (filterStatus !== 'all' && g.status !== filterStatus) return false;
    if (filterContext !== 'all' && g.context !== filterContext) return false;
    if (search && !g.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    live: gaps.filter((g) => g.status === 'live').length,
    partial: gaps.filter((g) => g.status === 'partial').length,
    planned: gaps.filter((g) => g.status === 'planned').length,
    vision: gaps.filter((g) => g.status === 'vision').length,
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        {(Object.entries(counts) as [GapStatus, number][]).map(([status, count]) => {
          const m = statusMeta[status];
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(filterStatus === status ? 'all' : status)}
              className="rounded-xl border border-line p-3 text-left transition-all hover:-translate-y-0.5"
              style={filterStatus === status ? { borderColor: `${m.color}55`, background: `${m.color}10` } : undefined}
            >
              <div className="text-2xl font-semibold" style={{ color: m.color }}>{count}</div>
              <div className="font-mono text-[10px] uppercase tracking-wider" style={{ color: m.color }}>{m.label}</div>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by title…"
          className="h-8 rounded-lg border border-line bg-surface-1 px-3 text-sm text-ink placeholder-ink-faint outline-none focus:border-accent transition-colors"
        />
        <div className="flex gap-1">
          {(['all', 'live', 'partial', 'planned', 'vision'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`rounded px-2 py-1 text-xs transition-colors ${filterStatus === s ? 'bg-surface-3 text-ink font-medium' : 'text-ink-soft hover:bg-surface-2'}`}
            >
              {s === 'all' ? 'All' : statusMeta[s].label}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {(['all', 'SI', 'CH', 'OI', 'AI', 'Platform'] as const).map((c) => (
            <button
              key={c}
              onClick={() => setFilterContext(c)}
              className={`rounded px-2 py-1 text-xs transition-colors ${filterContext === c ? 'bg-surface-3 text-ink font-medium' : 'text-ink-soft hover:bg-surface-2'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-line overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-surface-2">
              <th className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-wider text-ink-faint">ID</th>
              <th className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-wider text-ink-faint">Title</th>
              <th className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-wider text-ink-faint">Context</th>
              <th className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-wider text-ink-faint">Status</th>
              <th className="hidden px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-wider text-ink-faint lg:table-cell">Phase</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((gap, i) => {
              const m = statusMeta[gap.status];
              const ctxColor = contextColors[gap.context] ?? '#6366f1';
              return (
                <tr key={gap.id} className={`border-b border-line last:border-none ${i % 2 === 0 ? '' : 'bg-surface-0/40'}`}>
                  <td className="px-4 py-3 font-mono text-[11px] text-ink-faint">{gap.id}</td>
                  <td className="px-4 py-3 font-medium text-ink max-w-xs">{gap.title}</td>
                  <td className="px-4 py-3">
                    <span className="rounded px-1.5 py-0.5 font-mono text-[9px] uppercase" style={{ background: `${ctxColor}15`, color: ctxColor }}>
                      {gap.context}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase" style={{ borderColor: `${m.color}44`, background: `${m.color}12`, color: m.color }}>
                      {m.label}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 font-mono text-[10px] text-ink-faint lg:table-cell">{gap.phase ?? '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-8 text-center text-sm text-ink-faint">No items match the current filter.</div>
        )}
      </div>
    </div>
  );
}

// ─── main ────────────────────────────────────────────────────────────────────

export function Roadmap() {
  const [view, setView] = useState<'phases' | 'table'>('phases');

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-6 px-6 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Engineering Roadmap</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Actionable phases from today's production state to the full OI learning loop.
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border border-line bg-surface-1 p-1">
          {(['phases', 'table'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors capitalize ${view === v ? 'bg-surface-3 text-ink shadow-sm' : 'text-ink-soft hover:text-ink'}`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === 'phases' ? (
        <div className="flex flex-col gap-4">
          <HubspotRemediationPlan />
          {phases.map((p) => <PhaseBlock key={p.id} phase={p} />)}
        </div>
      ) : (
        <AllGapsTable />
      )}
    </div>
  );
}
