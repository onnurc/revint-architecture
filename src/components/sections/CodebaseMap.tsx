import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';

// ─── types ────────────────────────────────────────────────────────────────────

interface CodeEntry {
  label: string;
  path: string;
  note?: string;
  color?: string;
}

interface Section {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  entries: CodeEntry[];
  howTo?: { title: string; steps: string[] };
}

// ─── data ─────────────────────────────────────────────────────────────────────

const sections: Section[] = [
  {
    id: 'group-a',
    title: 'Group A — Sync Gemini Workers',
    subtitle: '10 deterministic enrichment workers · run in parallel waves via BullMQ',
    color: '#6366f1',
    entries: [
      { label: 'Worker registry (all 3 groups)',  path: 'src/lib/agent-workers/registry.ts',      note: 'WORKERS_MAP, resolveWorkerFinalize(), resolveMemoryWrites()' },
      { label: 'Gemini client',                   path: 'src/lib/gemini-client.ts',               note: 'generateWithTimeout(), AbortController, 60s default' },
      { label: 'Key rotation',                    path: 'src/lib/gemini-keys.ts',                 note: 'GEMINI_API_KEY_* round-robin, allGeminiKeysCool()' },
      { label: 'Chains definition',               path: 'src/lib/ai-core/chains.ts',              note: 'CHAINS, SENTINEL_STEPS, getDefaultChain()' },
      { label: 'FnB module-fit shortlist',        path: 'src/lib/playbook/vertical-pack/fnb-module-fit.ts', note: 'computeFnbModuleFit() → { primary, secondary, excluded }' },
      { label: 'Intelligence brief (wave-final)', path: 'src/lib/agent-workers/lead-intelligence-brief.ts', note: 'Reads all substrate, triggers HeadOfAgents', color: '#8b5cf6' },
    ],
    howTo: {
      title: 'How to register a new Group A worker',
      steps: [
        "Create your worker function in registry.ts following the signature: async function myWorker(workspaceId, leadId, agentRunId): Promise<void>",
        "Write structured output to a Prisma table scoped by workspaceId",
        "Call resolveMemoryWrites() if you want the result embedded in pgvector",
        "Call enqueueAdvance(sessionId) at the end to trigger the next orchestrator step",
        "Add your function to WORKERS_MAP: { MY_WORKER_KIND: myWorker }",
        "Add MY_WORKER_KIND to the relevant chain in chains.ts with its deps[] declared",
      ],
    },
  },
  {
    id: 'group-e',
    title: 'Group E — Async Apify Workers',
    subtitle: '9 deep-data actors · fire-and-forget → webhook callback pattern',
    color: '#f97316',
    entries: [
      { label: 'Apify client wrapper',      path: 'src/lib/apify.ts',                         note: 'runSync(), runAsync({ webhook }), finalizeApifyAgentRun()' },
      { label: 'Apify worker modules',      path: 'src/lib/agent-workers/apify/',             note: 'APIFY_GMAPS_DEEP, WEB_CRAWL_DEEP, INSTAGRAM_DEEP, SERP_RANK…' },
      { label: 'Webhook callback handler',  path: 'src/app/api/webhooks/apify/route.ts',      note: 'HMAC verify → finalizeApifyAgentRun() → advance()' },
    ],
    howTo: {
      title: 'Async actor lifecycle',
      steps: [
        "Worker calls apify.runAsync(actorId, input, { webhook: '/api/webhooks/apify', userData: { agentRunId } })",
        "AgentRun is set to status=RUNNING immediately — the BullMQ job returns",
        "Apify Cloud runs the actor (minutes to hours)",
        "On completion, Apify POST /api/webhooks/apify with the dataset + userData.agentRunId",
        "finalizeApifyAgentRun() verifies HMAC, persists actor output to the relevant table",
        "resolveWorkerFinalize() is called, then enqueueAdvance() triggers the next DAG step",
        "Idempotency guard: terminal AgentRun cannot be updated twice",
      ],
    },
  },
  {
    id: 'group-d',
    title: 'Group D — Ops Workers',
    subtitle: 'CRM sync, outcome attribution, outreach, MEDDPICC extraction',
    color: '#22c55e',
    entries: [
      { label: 'All Group D functions',        path: 'src/lib/agent-workers/registry.ts',      note: 'OUTCOME_ATTRIBUTOR, INBOX_REPLY_ATTRIBUTOR, OUTREACH_SENDER, MEDDPICC_EXTRACTOR, SPIN_EXTRACTOR' },
      { label: 'HubSpot writeback',            path: 'src/lib/integrations/hubspot/writeback.ts', note: 'enqueueCrmWriteback() → patches 11 revint_* properties', color: '#f59e0b' },
      { label: 'HubSpot ingest (inbound)',     path: 'src/lib/integrations/hubspot/ingest.ts', note: 'ingestHubspotLead() → Lead.create → router.emit("lead_created")' },
      { label: 'HubSpot OAuth + properties',  path: 'src/lib/integrations/hubspot/',          note: 'ensureRevintProperties(), token refresh, app-card handler' },
      { label: 'InsightPerformance (OI seed)', path: 'src/lib/agent-workers/registry.ts',      note: 'OUTCOME_ATTRIBUTOR writes OPENER_SUCCESS/FAIL → SemanticMemory', color: '#22c55e' },
    ],
  },
  {
    id: 'memory',
    title: 'Semantic Memory Layer',
    subtitle: 'pgvector HNSW · 768-dim gemini-embedding-001 · workspace-scoped',
    color: '#8b5cf6',
    entries: [
      { label: 'Memory API (ONLY entry point)',   path: 'src/lib/ai-core/memory.ts',    note: 'upsertAndEmbed(), query(), queryWithNicheUnion(), deleteByLead()' },
      { label: 'Embed helper',                    path: 'src/lib/ai-core/embed.ts',     note: 'embed(text) → 768-dim vector. Retry on 429 → EmbeddingError → SUCCEEDED_NO_MEMORY' },
      { label: 'Prisma schema (SemanticMemory)',  path: 'prisma/schema.prisma',          note: 'Table: semantic_memory. HNSW index on embedding. Kind enum.' },
    ],
    howTo: {
      title: 'Memory kinds and when to use each',
      steps: [
        "LEAD_PROFILE — written by LEAD_INTELLIGENCE_BRIEF after substrate is ready",
        "REVIEW_CHUNK — written by REVIEW_ANALYST for each significant review segment",
        "OPENER_SUCCESS / OPENER_FAIL — written by OUTCOME_ATTRIBUTOR after call outcome",
        "NBA_DECISION — written by HeadOfAgents after each decision to track decisions over time",
        "WORKSPACE_ICP — written during onboarding to capture the workspace's ideal customer",
        "NEVER call prisma.semanticMemory.* directly — always go through memory.ts (AGENTS.md §3)",
      ],
    },
  },
  {
    id: 'orchestration',
    title: 'Planner & Orchestrator',
    subtitle: 'DAG builder + fan-out walker · advisory locks · sentinel steps',
    color: '#0ea5e9',
    entries: [
      { label: 'AI Core router (event bus)',   path: 'src/lib/ai-core/router.ts',        note: 'emit(EventKind, payload) → planFromEvent(). No HTTP.' },
      { label: 'Planner',                      path: 'src/lib/ai-core/planner.ts',       note: 'planFromEvent(), planFromIntent(), commitIntentPlan()' },
      { label: 'Orchestrator (advance)',        path: 'src/lib/ai-core/orchestrator.ts', note: 'advance(), recoverStuckSessions(). Advisory lock on sessionId.' },
      { label: 'BullMQ queue definitions',     path: 'src/lib/queues.ts',               note: 'agent-runs (primary), discovery, review-analysis, email-verification, seo-ops, inbox-sync' },
      { label: 'Worker supervisor',            path: 'src/workers/index.ts',            note: 'startWorker() boots all BullMQ consumers' },
      { label: 'Chains & sentinel steps',      path: 'src/lib/ai-core/chains.ts',       note: 'SENTINEL_STEPS run inline in DB tx, not as BullMQ jobs' },
    ],
  },
  {
    id: 'telemetry',
    title: 'Telemetry & Error Handling',
    subtitle: 'ChainTelemetry · dead-letter · stuck session recovery · embedding backfill',
    color: '#ec4899',
    entries: [
      { label: 'ChainTelemetry writes',        path: 'src/lib/ai-core/orchestrator.ts',  note: 'Written at PlannerSession terminal state: p95 latency, total cost, SLA breach' },
      { label: 'Stuck session recovery',       path: 'src/lib/ai-core/orchestrator.ts',  note: 'recoverStuckSessions() — finds RUNNING sessions with all AgentRuns done' },
      { label: 'Cleanup stale sessions API',   path: 'src/app/api/agent-runs/cleanup-stale/', note: 'Called by cron on schedule' },
      { label: 'Embedding backfill',           path: 'src/lib/ai-core/embed.ts',         note: 'enqueueReembed() fires when embed() fails with 429/403' },
      { label: 'SUCCEEDED_NO_MEMORY status',   path: 'src/lib/agent-workers/registry.ts', note: 'Worker succeeded but pgvector write failed — backfill will retry' },
    ],
    howTo: {
      title: 'Error states to know',
      steps: [
        "SUCCEEDED — worker ran correctly, output written, memory embedded",
        "SUCCEEDED_NO_MEMORY — worker output written, but embedding failed (429/403). enqueueReembed() will retry.",
        "FAILED — worker threw an error. BullMQ will retry up to maxAttempts, then mark as dead-letter.",
        "RUNNING — Apify async worker dispatched, waiting for webhook callback",
        "Stuck sessions: a PlannerSession can get stuck if an AgentRun completes but advance() never fires. Use recoverStuckSessions() or the cleanup-stale cron.",
      ],
    },
  },
  {
    id: 'api-routes',
    title: 'Key API Routes',
    subtitle: 'Next.js 16 App Router · async params/cookies/headers · requireUser() on every route',
    color: '#f59e0b',
    entries: [
      { label: 'Auth gate',                   path: 'src/lib/auth.ts',                            note: 'requireUser() → AuthedSession { userId, workspaceId, plan, role }' },
      { label: 'Lead creation',               path: 'src/app/api/leads/route.ts',                 note: 'POST → lead.create → router.emit("lead_created")' },
      { label: 'Discovery (Places)',           path: 'src/app/api/discovery/route.ts',             note: 'Google Places → bulk lead ingestion' },
      { label: 'Planner kickoff',             path: 'src/app/api/planner/start/route.ts',         note: 'POST → planFromEvent() or planFromIntent()' },
      { label: 'Agent run status',            path: 'src/app/api/agent-runs/',                    note: 'GET [id], cleanup-stale, recovery' },
      { label: 'HubSpot webhook',             path: 'src/app/api/webhooks/hubspot/route.ts',      note: 'v3 HMAC → CrmSyncLog dedup → ingestHubspotLead()' },
      { label: 'Apify webhook',               path: 'src/app/api/webhooks/apify/route.ts',        note: 'HMAC → finalizeApifyAgentRun() → advance()' },
      { label: 'Stripe webhook',              path: 'src/app/api/billing/webhook/route.ts',       note: 'runtime="nodejs" required. StripeEventLog dedup. No apiVersion.' },
      { label: 'HubSpot OAuth',               path: 'src/app/api/oauth/',                         note: 'CrmConnection create + token refresh flow' },
      { label: 'Billing API',                 path: 'src/app/api/billing/',                       note: 'Checkout, portal, quota, plan gating' },
    ],
  },
];

// ─── components ───────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      onClick={copy}
      className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity rounded p-0.5 text-ink-faint hover:text-ink"
      title="Copy path"
    >
      {copied ? <Check className="h-3 w-3 text-[#22c55e]" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

function SectionBlock({ section }: { section: Section }) {
  const [open, setOpen] = useState(section.id === 'group-a');

  return (
    <div className="rounded-2xl border border-line bg-surface-1 overflow-hidden">
      {/* Header */}
      <button
        className="flex w-full items-center gap-4 p-5 text-left hover:bg-surface-2 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <div
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: section.color, boxShadow: `0 0 8px ${section.color}` }}
        />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-ink">{section.title}</div>
          <div className="mt-0.5 font-mono text-[10px] text-ink-faint truncate">{section.subtitle}</div>
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
            <div className="border-t border-line px-5 pb-5 pt-4 flex flex-col gap-5">
              {/* File entries */}
              <div className="rounded-xl border border-line overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line bg-surface-2">
                      <th className="px-4 py-2 text-left font-mono text-[10px] uppercase tracking-wider text-ink-faint">Label</th>
                      <th className="px-4 py-2 text-left font-mono text-[10px] uppercase tracking-wider text-ink-faint">Path</th>
                      <th className="hidden px-4 py-2 text-left font-mono text-[10px] uppercase tracking-wider text-ink-faint md:table-cell">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.entries.map((entry, i) => (
                      <tr
                        key={entry.path}
                        className={`group border-b border-line last:border-none ${i % 2 === 0 ? '' : 'bg-surface-0/40'}`}
                      >
                        <td className="px-4 py-2.5 font-medium text-ink">{entry.label}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center">
                            <code
                              className="rounded px-1.5 py-0.5 font-mono text-[11px]"
                              style={
                                entry.color
                                  ? { background: `${entry.color}18`, color: entry.color }
                                  : { background: `${section.color}15`, color: section.color }
                              }
                            >
                              {entry.path}
                            </code>
                            <CopyButton text={entry.path} />
                          </div>
                        </td>
                        <td className="hidden px-4 py-2.5 text-xs text-ink-soft md:table-cell">{entry.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* How-to */}
              {section.howTo && (
                <div
                  className="rounded-xl border p-4"
                  style={{ borderColor: `${section.color}33`, background: `${section.color}08` }}
                >
                  <div className="mb-3 font-semibold" style={{ color: section.color }}>
                    {section.howTo.title}
                  </div>
                  <ol className="space-y-2">
                    {section.howTo.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-ink-soft">
                        <span
                          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[9px] font-semibold"
                          style={{ background: `${section.color}22`, color: section.color }}
                        >
                          {i + 1}
                        </span>
                        <code className="font-mono text-[11px] leading-relaxed text-ink-soft">{step}</code>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── main ─────────────────────────────────────────────────────────────────────

export function CodebaseMap() {
  const [search, setSearch] = useState('');

  const filtered = sections.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.subtitle.toLowerCase().includes(q) ||
      s.entries.some(
        (e) => e.path.toLowerCase().includes(q) || (e.note ?? '').toLowerCase().includes(q) || e.label.toLowerCase().includes(q),
      )
    );
  });

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-6 px-6 py-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Codebase Map — "Where is What?"</h2>
        <p className="text-sm text-ink-soft">
          Quick-lookup reference for file locations, worker groups, memory patterns, and how to extend the system.
        </p>
      </div>

      {/* Search */}
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search paths, labels, notes…"
        className="w-full rounded-xl border border-line bg-surface-1 px-4 py-2.5 text-sm text-ink placeholder-ink-faint outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
      />

      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-ink-faint">
            No results for "{search}"
          </div>
        ) : (
          filtered.map((s) => <SectionBlock key={s.id} section={s} />)
        )}
      </div>
    </div>
  );
}
