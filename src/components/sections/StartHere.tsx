import { motion } from 'framer-motion';
import {
  ArrowRight, Bot, Brain, Database, GitBranch, Lock,
  Network, Server, Sparkles, Target, Zap,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.35, ease: 'easeOut' as const },
});

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-1 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-ink-soft">
      {children}
    </div>
  );
}

function Card({
  icon: Icon,
  color,
  title,
  children,
  mono,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  color: string;
  title: string;
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface-1 p-5">
      <div
        className="grid h-10 w-10 place-items-center rounded-xl"
        style={{ background: `${color}18`, color }}
      >
        <Icon className="h-5 w-5" strokeWidth={1.8} />
      </div>
      <div className="font-semibold text-ink">{title}</div>
      <div className={mono ? 'space-y-1.5' : 'text-sm leading-relaxed text-ink-soft'}>
        {children}
      </div>
    </div>
  );
}

function CodeLine({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-baseline gap-2 font-mono text-[11px]">
      <span className="shrink-0 text-ink-faint">{label}</span>
      <span className="truncate" style={{ color: color ?? 'rgb(var(--ink))' }}>{value}</span>
    </div>
  );
}

function PhilosophyBlock({
  number,
  title,
  why,
  how,
  color,
}: {
  number: string;
  title: string;
  why: string;
  how: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface-1 p-5" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="mb-3 flex items-center gap-2">
        <span
          className="rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider"
          style={{ background: `${color}20`, color }}
        >
          {number}
        </span>
        <span className="font-semibold text-ink">{title}</span>
      </div>
      <p className="mb-2 text-sm text-ink-soft">
        <strong className="font-medium text-ink">Why: </strong>{why}
      </p>
      <p className="text-sm text-ink-soft">
        <strong className="font-medium text-ink">How: </strong>{how}
      </p>
    </div>
  );
}

export function StartHere() {
  const setTab = useAppStore((s) => s.setTab);
  const setActiveFlow = useAppStore((s) => s.setActiveFlow);

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-20 px-6 py-14">

      {/* ── HERO ── */}
      <section className="flex flex-col gap-6">
        <motion.div {...fade(0)}>
          <SectionLabel>New Engineer Onboarding · Start Here</SectionLabel>
        </motion.div>

        <motion.h1 {...fade(0.04)} className="text-5xl font-semibold leading-[1.05] tracking-tight text-ink md:text-6xl">
          Revint turns noise into{' '}
          <span className="bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#ec4899] bg-clip-text text-transparent">
            ready-to-close briefs
          </span>
        </motion.h1>

        <motion.p {...fade(0.08)} className="max-w-2xl text-lg leading-relaxed text-ink-soft">
          Revint is a B2B SaaS platform that enriches restaurant & F&B businesses from raw signals
          — Google reviews, website content, social media, competitor data — into a single, evidence-backed
          Account Intelligence Brief. An SDR opens the app knowing <em>exactly</em> what to say, which
          product angle to lead with, and why <em>today</em> is the right time to call.
        </motion.p>

        <motion.div {...fade(0.12)} className="flex flex-wrap gap-3">
          <button
            onClick={() => setTab('architecture')}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5"
          >
            Explore the diagram <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => { setTab('architecture'); setActiveFlow('ingest'); }}
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface-1 px-5 py-2.5 text-sm font-medium text-ink hover:bg-surface-2"
          >
            Walk Flow A step-by-step
          </button>
          <button
            onClick={() => setTab('codebase')}
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface-1 px-5 py-2.5 text-sm font-medium text-ink hover:bg-surface-2"
          >
            Where is what?
          </button>
        </motion.div>
      </section>

      {/* ── AI STRATEGY ── */}
      <motion.section {...fade(0.1)} className="flex flex-col gap-6">
        <div>
          <SectionLabel><Sparkles className="h-3 w-3" /> AI Strategy</SectionLabel>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
            Two brains, one decision
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
            The system uses two AI models with completely separate roles. Understanding this split
            is the single most important mental model for working on Revint.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* Gemini */}
          <div className="relative flex flex-col gap-4 rounded-2xl border p-6" style={{ borderColor: '#6366f144', background: '#6366f108' }}>
            <div className="absolute -top-3 left-5">
              <span className="rounded-md border border-[#6366f144] bg-surface-0 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#6366f1]">
                Brain 1 — Deterministic
              </span>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#6366f118] text-[#6366f1]">
                <Zap className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <div>
                <div className="font-semibold text-ink">Gemini 2.0 Flash</div>
                <div className="font-mono text-[10px] text-ink-faint">Group A workers · All embeddings</div>
              </div>
            </div>
            <div className="space-y-1.5">
              <CodeLine label="Model" value="gemini-2.0-flash" color="#6366f1" />
              <CodeLine label="Embed" value="gemini-embedding-001 → 768-dim" color="#6366f1" />
              <CodeLine label="Timeout" value="60 s with AbortController" />
              <CodeLine label="Keys" value="Round-robin GEMINI_API_KEY_* rotation" />
              <CodeLine label="On 429" value="→ SUCCEEDED_NO_MEMORY → enqueueReembed()" />
            </div>
            <p className="text-sm leading-relaxed text-ink-soft">
              Used for <strong className="text-ink">all 10+ deterministic enrichment workers</strong> (SUBVERTICAL_CLASSIFIER,
              WEBSITE_AUDITOR, REVIEW_ANALYST, ICP_SCORER…). Fast (1–3 s), cheap, and stateless —
              each worker gets a structured prompt and writes structured output to a Prisma table.
              Also powers the pgvector HNSW semantic memory index.
            </p>
          </div>

          {/* Claude */}
          <div className="relative flex flex-col gap-4 rounded-2xl border p-6" style={{ borderColor: '#ec489944', background: '#ec489908' }}>
            <div className="absolute -top-3 left-5">
              <span className="rounded-md border border-[#ec489944] bg-surface-0 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#ec4899]">
                Brain 2 — Strategic
              </span>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#ec489918] text-[#ec4899]">
                <Bot className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <div>
                <div className="font-semibold text-ink">Claude 3.7 Sonnet</div>
                <div className="font-mono text-[10px] text-ink-faint">HeadOfAgents only · Final decision</div>
              </div>
            </div>
            <div className="space-y-1.5">
              <CodeLine label="Model" value="claude-3-7-sonnet-20250219" color="#ec4899" />
              <CodeLine label="Loop" value="≤5 read-only tool rounds" />
              <CodeLine label="Tools" value="get_lead_basics, get_reviews, get_memory…" />
              <CodeLine label="Output" value="{ primaryAngle, talkTrack, packageId, confidence }" />
              <CodeLine label="Gate" value="validateDecision() + detectContradictions()" />
            </div>
            <p className="text-sm leading-relaxed text-ink-soft">
              Only fires <strong className="text-ink">after all Gemini substrate workers complete</strong>. Claude's
              sole job: read the evidence and decide the optimal sales angle. It cannot mutate
              data — only read. The QA gate rejects decisions that hallucinate modules or leave
              contradictions unresolved. Flag-gated: off → shadow → live.
            </p>
          </div>
        </div>

        {/* Why this split */}
        <div className="rounded-2xl border border-line bg-surface-1 p-5">
          <div className="mb-2 font-semibold text-ink">Why the split?</div>
          <p className="text-sm leading-relaxed text-ink-soft">
            Gemini is fast and cheap — ideal for parallel, stateless extraction where the output format is
            100% predictable (JSON schemas). Claude is slower and more expensive but excels at
            multi-step reasoning across contradicting evidence, which is exactly what choosing a
            sales angle requires. Mixing them in the same workers would make individual steps
            unpredictable and expensive; separating them means each model is used <em>only where it
            adds unique value</em>.
          </p>
        </div>
      </motion.section>

      {/* ── ARCHITECTURAL INVARIANTS ── */}
      <motion.section {...fade(0.12)} className="flex flex-col gap-6">
        <div>
          <SectionLabel><Lock className="h-3 w-3" /> Core Architectural Invariants</SectionLabel>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
            Three rules that never bend
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
            These design decisions were made early and have high leverage — changing them would require
            restructuring the entire system. Understand why they exist before proposing alternatives.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <PhilosophyBlock
            number="Invariant 1"
            title="Single BullMQ queue for all AI work"
            color="#8b5cf6"
            why="Multiple queues create priority inversion, resource competition, and observability gaps. You can't see the real queue depth when work is spread across 6 queues."
            how="One queue named agent-runs handles orchestrator_advance, worker_execute, and crm_writeback jobs. Jobs carry a discriminated type field. New AI worker types are added as new type values — never new queues. (AGENTS.md §4)"
          />
          <PhilosophyBlock
            number="Invariant 2"
            title="DAG over linear pipeline"
            color="#6366f1"
            why="A linear queue blocks on the slowest step. WEBSITE_AUDITOR (~3 s) and REVIEW_ANALYST (~4 s) have no dependency on each other — running them sequentially wastes ~3–4 s per lead."
            how="The Planner builds a PersistedPlan DAG where each step declares its deps[]. The Orchestrator's advance() finds all PENDING steps whose deps are SUCCEEDED and fans them out simultaneously. Wave N only starts when Wave N-1 is fully complete."
          />
          <PhilosophyBlock
            number="Invariant 3"
            title="Postgres advisory locks on advance()"
            color="#0ea5e9"
            why="Multiple BullMQ workers can consume the same queue concurrently. Without a lock, two workers completing at the same instant both call enqueueAdvance() and create duplicate AgentRun rows for the next step."
            how="advance(sessionId) acquires a session-scoped Postgres advisory lock before reading the plan. The second caller waits, then sees a plan where those steps are already RUNNING and fans out nothing. Lock is released at the end of the DB transaction."
          />
        </div>
      </motion.section>

      {/* ── DATA FLOW PHILOSOPHY ── */}
      <motion.section {...fade(0.14)} className="flex flex-col gap-6">
        <div>
          <SectionLabel><Database className="h-3 w-3" /> Data Philosophy</SectionLabel>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
            Multi-tenant by default
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card icon={Lock} color="#22c55e" title="workspaceId everywhere">
            <p className="text-sm leading-relaxed text-ink-soft">
              Every Prisma query that touches business data must be scoped by <code className="rounded bg-surface-2 px-1 font-mono text-[11px]">workspaceId</code>.
              The invariant is enforced by code review, not by the DB schema alone.
              <code className="mt-1 block rounded bg-surface-2 px-2 py-1 font-mono text-[10px] text-ink-soft">
                const {'{'} workspaceId {'}'} = await requireUser()
              </code>
            </p>
          </Card>
          <Card icon={Brain} color="#8b5cf6" title="Semantic memory is abstracted">
            <p className="text-sm leading-relaxed text-ink-soft">
              Direct <code className="rounded bg-surface-2 px-1 font-mono text-[11px]">prisma.semanticMemory.*</code> calls
              are <strong className="text-ink">forbidden</strong>. All reads and writes go through
              <code className="mx-1 rounded bg-surface-2 px-1 font-mono text-[11px]">src/lib/ai-core/memory.ts</code>
              which handles embedding, dedup, and HNSW index management.
            </p>
          </Card>
          <Card icon={GitBranch} color="#f97316" title="Generated Prisma client">
            <p className="text-sm leading-relaxed text-ink-soft">
              Always import from <code className="rounded bg-surface-2 px-1 font-mono text-[11px]">@/generated/prisma/client</code> —
              <strong className="text-ink"> never</strong> from <code className="rounded bg-surface-2 px-1 font-mono text-[11px]">@prisma/client</code>.
              Run <code className="mx-1 rounded bg-surface-2 px-1 font-mono text-[11px]">npm run db:generate</code> after
              schema changes.
            </p>
          </Card>
          <Card icon={Network} color="#0ea5e9" title="HubSpot is two-way">
            <p className="text-sm leading-relaxed text-ink-soft">
              Inbound: HubSpot webhook → HMAC verify → <code className="rounded bg-surface-2 px-1 font-mono text-[11px]">CrmSyncLog</code> dedup → lead ingest.
              Outbound: After analysis, <code className="rounded bg-surface-2 px-1 font-mono text-[11px]">enqueueCrmWriteback()</code> patches
              11 <code className="rounded bg-surface-2 px-1 font-mono text-[11px]">revint_*</code> properties on the HubSpot contact.
            </p>
          </Card>
          <Card icon={Server} color="#ec4899" title="Stripe has two rules">
            <p className="text-sm leading-relaxed text-ink-soft">
              1. Always use <code className="rounded bg-surface-2 px-1 font-mono text-[11px]">runtime = "nodejs"</code> for
              the webhook route (signature verify breaks in edge runtime).
              2. Never pass <code className="rounded bg-surface-2 px-1 font-mono text-[11px]">apiVersion</code> to the Stripe
              constructor — it broke types in v22.
            </p>
          </Card>
          <Card icon={Target} color="#f59e0b" title="OI loop — not yet closed">
            <p className="text-sm leading-relaxed text-ink-soft">
              The seeds exist: <code className="rounded bg-surface-2 px-1 font-mono text-[11px]">OPENER_SUCCESS/FAIL</code> memory
              writes + <code className="rounded bg-surface-2 px-1 font-mono text-[11px]">InsightPerformance</code> Wilson scores.
              But <code className="rounded bg-surface-2 px-1 font-mono text-[11px]">computeFnbModuleFit()</code> still uses
              static weights. Connecting them is the OI Phase goal.
            </p>
          </Card>
        </div>
      </motion.section>

      {/* ── 10-MINUTE TOUR ── */}
      <motion.section {...fade(0.16)} className="flex flex-col gap-4">
        <div>
          <SectionLabel>10-Minute Orientation Plan</SectionLabel>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
            Where to go next
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              step: '01',
              tab: 'architecture' as const,
              title: 'Architecture Diagram',
              body: 'Pan the 6-zone canvas. Select "Flow A" and press Space to auto-play the ingestion pipeline. Click any node for file locations.',
              color: '#6366f1',
              time: '3 min',
            },
            {
              step: '02',
              tab: 'components' as const,
              title: 'Bounded Contexts',
              body: 'Browse SI → AI → CH → OI. Each component shows maturity (Live/Partial/Vision) and the Prisma tables it owns.',
              color: '#8b5cf6',
              time: '2 min',
            },
            {
              step: '03',
              tab: 'codebase' as const,
              title: 'Codebase Map',
              body: 'Find Group A workers, the memory API, and how to add a new worker in registry.ts. Use this as your daily reference.',
              color: '#0ea5e9',
              time: '3 min',
            },
            {
              step: '04',
              tab: 'flows' as const,
              title: 'Flows Deep Dive',
              body: 'Expand each step in Flow A, B, and D. Note the payload shapes — these are the actual JSON structures in production.',
              color: '#22c55e',
              time: '1 min',
            },
            {
              step: '05',
              tab: 'roadmap' as const,
              title: 'Engineering Roadmap',
              body: "Know what's live, what's broken (HubSpot writeback bug), and what's Vision-only. This sets context for every PR discussion.",
              color: '#f59e0b',
              time: '1 min',
            },
          ].map((item) => (
            <button
              key={item.step}
              onClick={() => setTab(item.tab)}
              className="group flex flex-col gap-3 rounded-2xl border border-line bg-surface-1 p-5 text-left transition-all hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card"
            >
              <div className="flex items-center justify-between">
                <span
                  className="rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold"
                  style={{ background: `${item.color}20`, color: item.color }}
                >
                  {item.step}
                </span>
                <span className="font-mono text-[10px] text-ink-faint">{item.time}</span>
              </div>
              <div className="font-semibold text-ink group-hover:text-accent transition-colors">{item.title}</div>
              <p className="text-sm text-ink-soft">{item.body}</p>
              <div className="mt-auto flex items-center gap-1 font-mono text-[10px] text-ink-faint group-hover:text-accent transition-colors">
                Open <ArrowRight className="h-3 w-3" />
              </div>
            </button>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
