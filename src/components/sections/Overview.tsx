import { motion } from 'framer-motion';
import { ArrowRight, BarChart2, BrainCircuit, GitBranch, Zap } from 'lucide-react';
import { architecture } from '../../data/architecture';
import { useAppStore } from '../../store/useAppStore';

const highlights = [
  {
    icon: BrainCircuit,
    color: '#8b5cf6',
    title: 'Two-Brain Model',
    body: 'Deterministic Gemini chain (Group A) for enrichment + Claude HeadOfAgents for final synthesis. Clear ownership, no drift.',
  },
  {
    icon: GitBranch,
    color: '#6366f1',
    title: 'DAG Orchestration',
    body: 'Planner builds PersistedPlan DAGs. Orchestrator advances steps with advisory locks — no duplicate work on Redis.',
  },
  {
    icon: Zap,
    color: '#22c55e',
    title: 'Semantic Memory',
    body: 'pgvector HNSW (768-dim). OPENER_SUCCESS/FAIL memories feed the OI learning loop via InsightPerformance.',
  },
  {
    icon: BarChart2,
    color: '#f97316',
    title: 'HubSpot Two-Way Sync',
    body: '11 revint_* custom properties. Inbound webhooks create leads; outbound writeback patches contact/deal records.',
  },
];

export function Overview() {
  const setTab = useAppStore((s) => s.setTab);

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-16 px-6 py-14">
      <section className="grid gap-10 lg:grid-cols-[1.15fr_1fr]">
        <div className="flex flex-col gap-6">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-line bg-surface-1 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-ink-soft">
            B2B SaaS · Agency Lead Generation
          </div>
          <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight text-ink md:text-6xl">
            <span className="text-ink">Revint</span>
            <span className="block bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#ec4899] bg-clip-text text-transparent">
              unified architecture
            </span>
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-ink-soft">
            Six-layer system powering AI-driven lead enrichment, semantic memory, and two-way
            HubSpot sync. This explorer maps every bounded context, data flow, and maturity gap
            to concrete files and Prisma tables.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setTab('architecture')}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-card transition-transform hover:-translate-y-0.5"
            >
              Open the diagram <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setTab('roadmap')}
              className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface-1 px-4 py-2.5 text-sm text-ink hover:bg-surface-2"
            >
              Gap analysis
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-3 font-mono text-[11px] uppercase tracking-wider text-ink-faint">
            <span>Next.js 16</span>·<span>Prisma 6 + pgvector</span>·<span>BullMQ + Redis</span>·
            <span>Gemini</span>·<span>Claude API</span>·<span>HubSpot</span>·<span>Stripe v22</span>·<span>Apify</span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#6366f1]/25 via-[#8b5cf6]/15 to-[#ec4899]/25 blur-2xl" />
          <div className="relative grid grid-cols-2 gap-3 rounded-3xl border border-line bg-surface-1/80 p-4 shadow-card">
            {architecture.flows.map((flow) => (
              <div
                key={flow.id}
                className="rounded-xl border border-line bg-surface-2 p-3 text-sm text-ink"
                style={{ borderColor: `${flow.color}55` }}
              >
                <div
                  className="mb-1 h-1.5 w-6 rounded-full"
                  style={{ backgroundColor: flow.color, boxShadow: `0 0 12px ${flow.color}` }}
                />
                <div className="font-semibold">{flow.label}</div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                  {flow.steps.length} steps
                </div>
              </div>
            ))}
            <div className="rounded-xl border border-line bg-surface-2 p-3 text-sm text-ink" style={{ borderColor: '#22c55e55' }}>
              <div className="mb-1 h-1.5 w-6 rounded-full" style={{ backgroundColor: '#22c55e', boxShadow: '0 0 12px #22c55e' }} />
              <div className="font-semibold">6 Zones</div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-ink-faint">26 nodes</div>
            </div>
            <div className="rounded-xl border border-line bg-surface-2 p-3 text-sm text-ink" style={{ borderColor: '#f59e0b55' }}>
              <div className="mb-1 h-1.5 w-6 rounded-full" style={{ backgroundColor: '#f59e0b', boxShadow: '0 0 12px #f59e0b' }} />
              <div className="font-semibold">4 Contexts</div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-ink-faint">SI · CH · OI · AI</div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">
          Architecture highlights
        </h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {highlights.map((h, i) => {
            const Icon = h.icon;
            return (
              <motion.div
                key={h.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.32 }}
                className="flex flex-col gap-3 rounded-2xl border border-line bg-surface-1 p-5"
              >
                <div
                  className="grid h-10 w-10 place-items-center rounded-lg"
                  style={{ background: `${h.color}22`, color: h.color }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-base font-semibold text-ink">{h.title}</div>
                <p className="text-sm text-ink-soft">{h.body}</p>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
