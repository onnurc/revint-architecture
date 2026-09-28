import {
  Bot, Brain, Boxes, Cable, CircuitBoard, Cloud, CreditCard,
  Database, GitBranch, Globe, Key, Layers, Mail, Monitor,
  Network, Package, Radio, Server, Webhook, Workflow, Zap,
} from 'lucide-react';
import type { Architecture } from '../types';

// ─── canvas constants ────────────────────────────────────────────────────────
const W = 1780;   // total canvas width

// 5-node row: gap = (W - 40 - 5*NW) / 4 = 135  → x: 20, 395, 770, 1145, 1520
const X5 = [20, 395, 770, 1145, 1520] as const;
// 3-node row: gap = (W - 40 - 3*NW) / 2 = 500  → x: 20, 760, 1500
const X3 = [20, 760, 1500] as const;
// 6-node row: gap = (W - 40 - 6*NW) / 5 = 60   → x: 20, 320, 620, 920, 1220, 1520
const X6 = [20, 320, 620, 920, 1220, 1520] as const;

const NY = 28;  // node y offset inside zone

// ─── zones ───────────────────────────────────────────────────────────────────
const zones: Architecture['zones'] = [
  { id: 'client',   label: '① Client & Ingestion Layer',         color: '#6366f1', description: 'Browser, scheduled tasks, and inbound webhooks from external systems.',  x: 0, y: 0,   width: W, height: 110 },
  { id: 'edge',     label: '② Edge / API Layer (Next.js routes)', color: '#0ea5e9', description: 'Next.js 16 App Router handlers. Every request passes requireUser().',  x: 0, y: 130, width: W, height: 110 },
  { id: 'orch',     label: '③ Queue & Distributed Orchestration', color: '#8b5cf6', description: 'In-process event bus, Planner DAG builder, Orchestrator walker, BullMQ queues on Redis.', x: 0, y: 260, width: W, height: 130 },
  { id: 'workers',  label: '④ Worker Execution Fleet',            color: '#ec4899', description: 'BullMQ consumers: sync Gemini workers, Claude Head Agent, async Apify actors, ops workers.', x: 0, y: 410, width: W, height: 180 },
  { id: 'data',     label: '⑤ Data & Intelligence Layer',         color: '#22c55e', description: 'PostgreSQL (Prisma), pgvector HNSW semantic memory, Redis job state.',  x: 0, y: 610, width: W, height: 110 },
  { id: 'external', label: '⑥ External Ecosystem',                color: '#f59e0b', description: 'Apify Cloud, Gemini, Claude API, HubSpot CRM, Resend, Stripe.',         x: 0, y: 740, width: W, height: 110 },
];

// ─── nodes ───────────────────────────────────────────────────────────────────
const nodes: Architecture['nodes'] = [
  // ① CLIENT
  { id: 'browser',    zoneId: 'client',   title: 'Browser / Next.js SSR', tech: 'App Router pages',         icon: Monitor,      description: 'SDR UI — lead list, Kanban, Copilot chat, onboarding flow.', responsibility: 'All user-driven actions: creating leads, triggering analysis, logging dispositions.', files: ['src/app/(dashboard)/'], x: X5[0], y: NY },
  { id: 'cronTick',   zoneId: 'client',   title: 'Cron Jobs',             tech: 'Vercel cron / internal',   icon: Radio,        description: 'Sequence step ticks, cleanup of stale sessions, seating sync.', responsibility: 'Fire-and-forget: POST /api/agent-runs/cleanup-stale, sequence tick endpoints.', files: ['src/app/api/agent-runs/cleanup-stale/', 'src/app/api/sequences/'], x: X5[1], y: NY },
  { id: 'stripeWH',   zoneId: 'client',   title: 'Stripe Webhook',        tech: 'POST /api/billing/webhook', icon: CreditCard,   description: 'Subscription lifecycle events from Stripe (no apiVersion).', responsibility: 'Plan upgrades, downgrades, payment failures → workspace quota sync.', files: ['src/app/api/billing/webhook/route.ts'], x: X5[2], y: NY },
  { id: 'hubspotWH',  zoneId: 'client',   title: 'HubSpot Webhook',       tech: 'POST /api/webhooks/hubspot', icon: Network,    description: 'Contact/company/deal events from HubSpot v3 signature.', responsibility: 'Inbound lead creation, deal stage changes mirrored into WatchlistItem.', files: ['src/app/api/webhooks/hubspot/route.ts'], x: X5[3], y: NY },
  { id: 'apifyWH',    zoneId: 'client',   title: 'Apify Webhook',         tech: 'POST /api/webhooks/apify',  icon: Webhook,     description: 'Async actor completion callbacks from Apify Cloud.', responsibility: 'finalizeApifyAgentRun() → persist output → enqueueAdvance.', files: ['src/app/api/webhooks/apify/route.ts'], x: X5[4], y: NY },

  // ② EDGE
  { id: 'auth',       zoneId: 'edge',     title: 'requireUser()',         tech: 'src/lib/auth.ts',          icon: Key,          description: 'Supabase session → AuthedSession {userId, workspaceId, plan, role}.', responsibility: 'Gates every route. Creates personal workspace on first login. RBAC via WorkspaceMember.role.', files: ['src/lib/auth.ts'], x: X5[0], y: NY },
  { id: 'leadsAPI',   zoneId: 'edge',     title: 'Leads API',             tech: 'POST /api/leads',          icon: Package,      description: 'Create leads from Google Places discovery or manual entry.', responsibility: 'prisma.lead.create() scoped by workspaceId, then router.emit("lead_created").', files: ['src/app/api/leads/route.ts', 'src/app/api/discovery/route.ts'], x: X5[1], y: NY },
  { id: 'plannerAPI', zoneId: 'edge',     title: 'Planner API',           tech: 'POST /api/planner/start',  icon: GitBranch,    description: 'Kick off a new PlannerSession for a lead or batch.', responsibility: 'Validates quota, calls planFromEvent() or planFromIntent(), returns sessionId.', files: ['src/app/api/planner/start/route.ts'], x: X5[2], y: NY },
  { id: 'agentAPI',   zoneId: 'edge',     title: 'Agent Runs API',        tech: 'GET /api/agent-runs/[id]', icon: CircuitBoard,  description: 'Polling endpoint and export for individual AgentRun records.', responsibility: 'Status reads, artifact download, stale cleanup, recovery endpoints.', files: ['src/app/api/agent-runs/'], x: X5[3], y: NY },
  { id: 'webhookRtr', zoneId: 'edge',     title: 'Webhook Router',        tech: 'Stripe · HubSpot · Apify', icon: Cable,        description: 'Central handler for all inbound webhooks with signature verification.', responsibility: 'HMAC verify → CrmSyncLog dedup → dispatch to domain logic.', files: ['src/app/api/billing/webhook/', 'src/app/api/webhooks/'], x: X5[4], y: NY },

  // ③ ORCHESTRATION
  { id: 'router',     zoneId: 'orch',     title: 'AI Core Router',        tech: 'src/lib/ai-core/router.ts', icon: Zap,         description: 'In-process event bus. emit(EventKind, payload) → planFromEvent().', responsibility: 'Decouples API handlers from planner. Supports lead_created, voice_note_added, watchlist_stage_changed.', files: ['src/lib/ai-core/router.ts', 'src/lib/ai-core/events.ts'], x: X5[0], y: 38 },
  { id: 'planner',    zoneId: 'orch',     title: 'Planner',               tech: 'src/lib/ai-core/planner.ts', icon: Layers,     description: 'Converts events or copilot intents into PersistedPlan DAG arrays.', responsibility: 'planFromEvent → resolves CHAINS[event] → PlannerSession.create(). planFromIntent for copilot.', files: ['src/lib/ai-core/planner.ts', 'src/lib/ai-core/chains.ts'], x: X5[1], y: 38 },
  { id: 'orchestrator', zoneId: 'orch',   title: 'DAG Orchestrator',      tech: 'src/lib/ai-core/orchestrator.ts', icon: Workflow, description: 'Walks the PersistedPlan, fans out ready steps, handles sentinels inline.', responsibility: 'advance(): load session → fan out PENDING steps → mark terminal states. Sentinel steps (embed_profile) run inside DB transaction.', files: ['src/lib/ai-core/orchestrator.ts'], x: X5[2], y: 38 },
  { id: 'qAgent',     zoneId: 'orch',     title: 'BullMQ: agent-runs',    tech: 'Redis (primary queue)',    icon: Server,       description: 'PRIMARY queue for all AI work. Types: orchestrator_advance, worker_execute, crm_writeback.', responsibility: 'No new queues for AI work per AGENTS.md. Advisory locks prevent duplicate advance jobs.', files: ['src/lib/queues.ts', 'src/workers/index.ts'], x: X5[3], y: 38 },
  { id: 'qOther',     zoneId: 'orch',     title: 'BullMQ: discovery / review / seo', tech: 'Redis (legacy queues)', icon: Boxes, description: 'Parallel queues for non-AI workloads: Google Places discovery, review-analysis, email-verification, seo-ops.', responsibility: 'startDiscoveryWorker(), startReviewAnalysisWorker(), startSeoOpsWorker().', files: ['src/lib/queues.ts'], x: X5[4], y: 38 },

  // ④ WORKERS
  { id: 'syncWorkers', zoneId: 'workers', title: 'Sync Intelligence Workers', tech: 'Group A (10+ Gemini workers)', icon: Brain,    description: 'Deterministic enrichment pipeline: SUBVERTICAL_CLASSIFIER → WEBSITE_AUDITOR → REVIEW_ANALYST → SCORER → ICP → TRIGGER → INSIGHT.', responsibility: 'Each worker calls Gemini (60s timeout, key rotation), writes substrate tables, calls upsertAndEmbed(), enqueueAdvance.', files: ['src/lib/agent-workers/registry.ts', 'src/lib/gemini-client.ts', 'src/lib/gemini-keys.ts'], x: X5[0], y: NY },
  { id: 'libBrief',    zoneId: 'workers', title: 'LEAD_INTELLIGENCE_BRIEF', tech: 'lead-intelligence-brief.ts', icon: GitBranch, description: 'Reads all substrate, runs computeFnbModuleFit(), builds deterministic brief, then triggers HeadOfAgents.', responsibility: 'Truth Layer: derives F&B signals, pain points (T1 quotes vs T3), salesConfidence. Writes LeadNextAction. Invokes Claude loop.', files: ['src/lib/agent-workers/lead-intelligence-brief.ts', 'src/lib/playbook/vertical-pack/fnb-module-fit.ts'], x: X5[1], y: NY },
  { id: 'headOfAgents', zoneId: 'workers', title: 'SI.AI.HeadOfAgents',   tech: 'head-agent.ts + claude.ts', icon: Bot,         description: 'Claude API agent loop (≤5 rounds, read-only tools). Produces single decision JSON: {primaryAngle, talkTrack, packageId, confidence, conflicts}.', responsibility: 'Read-only tools: get_lead_basics, get_full_reviews, get_website_audit, get_dossier, get_memory. validateDecision() QA gate. Flag-gated ON/OFF/shadow.', files: ['src/lib/ai-core/agent/head-agent.ts', 'src/lib/ai-core/agent/claude.ts', 'src/lib/ai-core/agent/tools.ts'], x: X5[2], y: NY },
  { id: 'asyncApify',  zoneId: 'workers', title: 'Async Apify Workers',   tech: 'Group E (9 actors)',        icon: Cloud,        description: 'Deep enrichment actors: APIFY_GMAPS_DEEP, WEB_CRAWL_DEEP, INSTAGRAM_DEEP, LINKEDIN_COMPANY, SERP_RANK, REDDIT_MENTIONS…', responsibility: 'apify.runAsync(actorId, input, {webhook}) → AgentRun.status=RUNNING. Callback via /api/webhooks/apify finalizes.', files: ['src/lib/apify.ts', 'src/lib/agent-workers/apify/'], x: X5[3], y: NY },
  { id: 'opsWorkers',  zoneId: 'workers', title: 'Ops Workers (Group D)', tech: 'CRM sync, outreach, attribution', icon: Globe, description: 'OUTCOME_ATTRIBUTOR, INBOX_REPLY_ATTRIBUTOR, OUTREACH_SENDER, MEDDPICC_EXTRACTOR, SPIN_EXTRACTOR.', responsibility: 'OUTCOME_ATTRIBUTOR bumps InsightPerformance, writes OPENER_SUCCESS/FAIL to SemanticMemory (OI seed). enqueueCrmWriteback triggers HubSpot sync.', files: ['src/lib/agent-workers/registry.ts', 'src/lib/integrations/hubspot/writeback.ts'], x: X5[4], y: NY },

  // ⑤ DATA
  { id: 'postgres',   zoneId: 'data',     title: 'PostgreSQL (Prisma)',   tech: 'src/generated/prisma/client', icon: Database,   description: '50+ tables: Lead, Account, PlannerSession, AgentRun, WebsiteAudit, ReviewAnalysis, LeadNextAction, CrmSyncLog, StripeEventLog…', responsibility: 'Multi-tenant — every query scoped by workspaceId. Generated client at @/generated/prisma/client (NOT @prisma/client).', files: ['prisma/schema.prisma', 'src/generated/prisma/'], x: X3[0], y: NY },
  { id: 'pgvector',   zoneId: 'data',     title: 'pgvector / HNSW',      tech: 'semantic_memory (768-dim)', icon: Zap,          description: 'HNSW cosine index on SemanticMemory.embedding. Kinds: LEAD_PROFILE, REVIEW_CHUNK, OPENER_SUCCESS/FAIL, NBA_DECISION, WORKSPACE_ICP.', responsibility: 'All reads/writes via src/lib/ai-core/memory.ts only. Direct prisma.semanticMemory.* is forbidden (AGENTS.md §3).', files: ['src/lib/ai-core/memory.ts', 'src/lib/ai-core/embed.ts'], x: X3[1], y: NY },
  { id: 'redis',      zoneId: 'data',     title: 'Redis',                tech: 'BullMQ job store',          icon: Server,       description: 'BullMQ queue persistence and job state. Advisory locks prevent duplicate orchestrator advances.', responsibility: 'Bull queues: agent-runs, discovery, review-analysis, email-verification, seo-ops, inbox-sync.', files: ['src/lib/queues.ts'], x: X3[2], y: NY },

  // ⑥ EXTERNAL
  { id: 'apifyCloud', zoneId: 'external', title: 'Apify Cloud',          tech: 'Actors + webhook callback', icon: Cloud,        description: 'Runs deep-data actors (gmaps, instagram, web_crawl, serp, linkedin, reddit, tiktok).', responsibility: 'Returns dataset via webhook to /api/webhooks/apify. Cost tracked via x-apify-pagination-run-id.', files: ['src/lib/apify.ts'], x: X6[0], y: NY },
  { id: 'gemini',     zoneId: 'external', title: 'Gemini APIs',          tech: 'gemini-2.0-flash + embedding-001', icon: Zap,  description: 'gemini-2.0-flash for analysis (60s timeout, key rotation). gemini-embedding-001 for 768-dim vectors.', responsibility: 'Key rotation via gemini-keys.ts. 429/403 → SUCCEEDED_NO_MEMORY + backfill embed job. Input/output tokens tracked on AgentRun.', files: ['src/lib/gemini-client.ts', 'src/lib/gemini-keys.ts'], x: X6[1], y: NY },
  { id: 'claudeAPI',  zoneId: 'external', title: 'Claude API (Anthropic)', tech: 'claude-3-7-sonnet · HeadOfAgents only', icon: Bot, description: 'Used exclusively by SI.AI.HeadOfAgents for final sales angle decision. Read-only tool loop, max 5 rounds.', responsibility: 'NOT used for deterministic workers. Gemini handles all Group A analysis. Claude = final synthesis only.', files: ['src/lib/ai-core/agent/claude.ts'], x: X6[2], y: NY },
  { id: 'hubspotCRM', zoneId: 'external', title: 'HubSpot CRM',          tech: 'OAuth2 · revint_* properties', icon: Network,  description: 'Two-way sync. 11 revint_* custom properties written after analysis. App Card in contact/deal view.', responsibility: 'Inbound: webhook → lead import. Outbound: writeback.ts patches all revint_* props. call-task-sync logs activities.', files: ['src/lib/integrations/hubspot/'], x: X6[3], y: NY },
  { id: 'resend',     zoneId: 'external', title: 'Resend',               tech: 'React Email templates',    icon: Mail,         description: 'Transactional email for billing events, welcome sequences, outreach sender.', responsibility: 'sendEmail() with exponential retry. Dev redirect via EMAIL_DEV_REDIRECT. CRLF injection protection.', files: ['src/lib/email/'], x: X6[4], y: NY },
  { id: 'stripeExt',  zoneId: 'external', title: 'Stripe v22',           tech: 'No apiVersion (broke types)', icon: CreditCard, description: 'Subscription billing. No apiVersion on SDK constructor (broke types in v22).', responsibility: 'Webhook: StripeEventLog dedup → workspace.plan + quota sync. runtime="nodejs" required for signature verify.', files: ['src/lib/stripe.ts', 'src/lib/plans.ts'], x: X6[5], y: NY },
];

// ─── edges ───────────────────────────────────────────────────────────────────
const edges: Architecture['edges'] = [
  // client → edge
  { id: 'e-browser-auth',    source: 'browser',     target: 'auth',        kind: 'sync',    label: 'HTTP + cookie' },
  { id: 'e-cron-qagent',     source: 'cronTick',    target: 'qAgent',      kind: 'async',   label: 'tick' },
  { id: 'e-stripe-whr',      source: 'stripeWH',    target: 'webhookRtr',  kind: 'webhook', label: 'stripe-signature' },
  { id: 'e-hs-whr',          source: 'hubspotWH',   target: 'webhookRtr',  kind: 'webhook', label: 'hs-signature-v3' },
  { id: 'e-apify-whr',       source: 'apifyWH',     target: 'webhookRtr',  kind: 'webhook', label: 'x-apify-sig' },

  // edge internal
  { id: 'e-auth-leads',      source: 'auth',        target: 'leadsAPI',    kind: 'sync' },
  { id: 'e-auth-planner',    source: 'auth',        target: 'plannerAPI',  kind: 'sync' },
  { id: 'e-auth-agent',      source: 'auth',        target: 'agentAPI',    kind: 'sync' },
  { id: 'e-auth-supabase',   source: 'auth',        target: 'stripeExt',   kind: 'sync' },   // placeholder visual only

  // edge → orchestration
  { id: 'e-leads-router',    source: 'leadsAPI',    target: 'router',      kind: 'async',   label: 'emit lead_created' },
  { id: 'e-leads-postgres',  source: 'leadsAPI',    target: 'postgres',    kind: 'sync',    label: 'lead.create' },
  { id: 'e-planner-api-orch',source: 'plannerAPI',  target: 'planner',     kind: 'sync' },
  { id: 'e-whr-router',      source: 'webhookRtr',  target: 'router',      kind: 'async',   label: 'ingest event' },
  { id: 'e-whr-postgres',    source: 'webhookRtr',  target: 'postgres',    kind: 'sync',    label: 'dedup / log' },

  // orchestration internal
  { id: 'e-router-planner',  source: 'router',      target: 'planner',     kind: 'sync' },
  { id: 'e-planner-postgres',source: 'planner',     target: 'postgres',    kind: 'sync',    label: 'PlannerSession' },
  { id: 'e-planner-qagent',  source: 'planner',     target: 'qAgent',      kind: 'async',   label: 'enqueueAdvance' },
  { id: 'e-qagent-orch',     source: 'qAgent',      target: 'orchestrator',kind: 'sync',    label: 'orchestrator_advance' },
  { id: 'e-orch-qagent',     source: 'orchestrator',target: 'qAgent',      kind: 'async',   label: 'fan-out worker_execute' },
  { id: 'e-orch-postgres',   source: 'orchestrator',target: 'postgres',    kind: 'sync',    label: 'read session' },

  // orchestration → workers
  { id: 'e-qagent-sync',    source: 'qAgent',       target: 'syncWorkers', kind: 'async',   label: 'worker_execute' },
  { id: 'e-qagent-brief',   source: 'qAgent',       target: 'libBrief',    kind: 'async',   label: 'worker_execute' },
  { id: 'e-qagent-apify',   source: 'qAgent',       target: 'asyncApify',  kind: 'async',   label: 'async_dispatch' },
  { id: 'e-qagent-ops',     source: 'qAgent',       target: 'opsWorkers',  kind: 'async' },

  // workers → external
  { id: 'e-sync-gemini',    source: 'syncWorkers',  target: 'gemini',      kind: 'sync',    label: 'generateWithTimeout' },
  { id: 'e-hoa-claude',     source: 'headOfAgents', target: 'claudeAPI',   kind: 'sync',    label: '≤5 rounds' },
  { id: 'e-apify-cloud',    source: 'asyncApify',   target: 'apifyCloud',  kind: 'async',   label: 'runAsync' },
  { id: 'e-cloud-apifywh',  source: 'apifyCloud',   target: 'apifyWH',     kind: 'webhook', label: 'dataset callback' },
  { id: 'e-ops-hubspot',    source: 'opsWorkers',   target: 'hubspotCRM',  kind: 'async',   label: 'revint_* writeback' },

  // workers → data
  { id: 'e-sync-postgres',  source: 'syncWorkers',  target: 'postgres',    kind: 'sync',    label: 'write substrate' },
  { id: 'e-sync-pgvector',  source: 'syncWorkers',  target: 'pgvector',    kind: 'async',   label: 'upsertAndEmbed' },
  { id: 'e-brief-postgres', source: 'libBrief',     target: 'postgres',    kind: 'sync',    label: 'read + write brief' },
  { id: 'e-brief-hoa',      source: 'libBrief',     target: 'headOfAgents',kind: 'sync' },
  { id: 'e-hoa-pgvector',   source: 'headOfAgents', target: 'pgvector',    kind: 'sync',    label: 'get_memory' },
  { id: 'e-brief-writeback',source: 'libBrief',     target: 'qAgent',      kind: 'async',   label: 'enqueueCrmWriteback' },
  { id: 'e-ops-postgres',   source: 'opsWorkers',   target: 'postgres',    kind: 'sync' },
  { id: 'e-ops-pgvector',   source: 'opsWorkers',   target: 'pgvector',    kind: 'async',   label: 'OPENER_SUCCESS' },

  // data internal
  { id: 'e-pgvector-gemini',source: 'pgvector',     target: 'gemini',      kind: 'sync',    label: 'embed(text)' },
  { id: 'e-pgvector-sync',  source: 'pgvector',     target: 'syncWorkers', kind: 'response',label: 'top-K hits' },

  // webhook → data
  { id: 'e-whr-stripe',     source: 'webhookRtr',   target: 'stripeExt',   kind: 'sync' },
  { id: 'e-whr-hubspot',    source: 'webhookRtr',   target: 'hubspotCRM',  kind: 'sync' },
];

// ─── flows ───────────────────────────────────────────────────────────────────
const flows: Architecture['flows'] = [
  {
    id: 'ingest',
    label: 'Flow A — Lead Ingestion → Brief',
    color: '#6366f1',
    steps: [
      {
        id: 'A1', flowId: 'ingest',
        segments: [{ edgeId: 'e-browser-auth', from: 'browser', to: 'auth' }, { edgeId: 'e-auth-leads', from: 'auth', to: 'leadsAPI' }],
        title: 'User creates lead',
        explanation: 'SDR searches Google Places or pastes a URL. Browser hits POST /api/leads. requireUser() validates the Supabase session and resolves the workspaceId from the active-workspace cookie.',
        payload: '{ placeId, businessName, workspaceId }',
      },
      {
        id: 'A2', flowId: 'ingest',
        segments: [{ edgeId: 'e-leads-postgres', from: 'leadsAPI', to: 'postgres' }, { edgeId: 'e-leads-router', from: 'leadsAPI', to: 'router' }],
        title: 'Lead persisted → event emitted',
        explanation: 'prisma.lead.create() scoped by workspaceId writes the row. Immediately after, router.emit("lead_created", { workspaceId, leadId }) fires the in-process event bus — no HTTP round-trip needed.',
        payload: 'Lead { id, workspaceId, placeId, businessName }',
      },
      {
        id: 'A3', flowId: 'ingest',
        segments: [{ edgeId: 'e-router-planner', from: 'router', to: 'planner' }, { edgeId: 'e-planner-postgres', from: 'planner', to: 'postgres' }],
        title: 'Planner resolves DAG chain',
        explanation: 'planFromEvent("lead_created", payload) reads the workspace\'s WorkspaceLeadPipeline config (LITE/BALANCED/AGGRESSIVE/CUSTOM preset) and resolves the matching CHAINS entry. A PlannerSession row is created with status=EXECUTING and the full PersistedPlan JSON.',
        payload: 'PlannerSession { plan: PersistedPlan[], status: EXECUTING }',
      },
      {
        id: 'A4', flowId: 'ingest',
        segments: [{ edgeId: 'e-planner-qagent', from: 'planner', to: 'qAgent' }, { edgeId: 'e-qagent-orch', from: 'qAgent', to: 'orchestrator' }, { edgeId: 'e-orch-qagent', from: 'orchestrator', to: 'qAgent' }],
        title: 'Orchestrator fans out workers',
        explanation: 'enqueueAdvance(sessionId) adds an orchestrator_advance job to agent-runs. advance() loads the session, finds all PENDING steps with no unresolved dependencies, creates AgentRun rows, and fans out worker_execute jobs back onto agent-runs.',
        payload: 'job: { type: "worker_execute", workerKind, agentRunId }',
        parallelGroup: 1,
      },
      {
        id: 'A5', flowId: 'ingest',
        segments: [{ edgeId: 'e-qagent-sync', from: 'qAgent', to: 'syncWorkers' }, { edgeId: 'e-sync-gemini', from: 'syncWorkers', to: 'gemini' }],
        title: 'Sync workers run (parallel wave 1)',
        explanation: 'First wave: SUBVERTICAL_CLASSIFIER and GOOGLE_PLACES_REVIEWS have no dependencies. Both start in parallel. Each worker calls Gemini API (generateWithTimeout, 60s, key rotation). On success → AgentRun.status=SUCCEEDED → enqueueAdvance.',
        payload: '{ gemini-2.0-flash request, input tokens logged }',
        parallelGroup: 2,
      },
      {
        id: 'A6', flowId: 'ingest',
        segments: [{ edgeId: 'e-sync-postgres', from: 'syncWorkers', to: 'postgres' }, { edgeId: 'e-sync-pgvector', from: 'syncWorkers', to: 'pgvector' }, { edgeId: 'e-pgvector-gemini', from: 'pgvector', to: 'gemini' }],
        title: 'Substrate written → semantic memory embedded',
        explanation: 'Each completed worker writes its results (WebsiteAudit, ReviewAnalysis, SalesOpportunity, LeadTrigger) to PostgreSQL. resolveMemoryWrites() calls memory.upsertAndEmbed(text) which embeds via gemini-embedding-001 (768-dim) and writes to the HNSW index.',
        payload: 'SemanticMemory { embedding vector(768), kind, nicheScope }',
        parallelGroup: 2,
      },
      {
        id: 'A7', flowId: 'ingest',
        segments: [{ edgeId: 'e-qagent-brief', from: 'qAgent', to: 'libBrief' }, { edgeId: 'e-brief-postgres', from: 'libBrief', to: 'postgres' }],
        title: 'Intelligence Brief worker triggered',
        explanation: 'LEAD_INTELLIGENCE_BRIEF runs after all Group A workers succeed. It reads all substrate from DB, runs deriveFnbSignals() to extract F&B signals (QR menu, booking present, yavaş servis reviews), then computeFnbModuleFit() to produce a deterministic module-fit shortlist: { primary, secondary, excluded }.',
        payload: 'shortlist: { primary: ["ORDER_PAY"], excluded: ["RESERVATIONS"] }',
      },
      {
        id: 'A8', flowId: 'ingest',
        segments: [{ edgeId: 'e-brief-hoa', from: 'libBrief', to: 'headOfAgents' }, { edgeId: 'e-hoa-claude', from: 'headOfAgents', to: 'claudeAPI' }, { edgeId: 'e-hoa-pgvector', from: 'headOfAgents', to: 'pgvector' }],
        title: 'Head Of Agents — Claude decision loop',
        explanation: 'SI.AI.HeadOfAgents (head-agent.ts + claude.ts) sends the substrate summary + deterministic shortlist to Claude. It loops ≤5 rounds calling read-only tools: get_lead_basics, get_full_reviews, get_website_audit, get_dossier, get_packages, get_memory. Produces: { primaryAngle, talkTrack, packageId, confidence, conflicts }.',
        payload: 'decision: { primaryAngle: "peak-hour oturma akışı", talkTrack: "…", packageId: "ORDER_PAY" }',
      },
      {
        id: 'A9', flowId: 'ingest',
        segments: [{ edgeId: 'e-brief-writeback', from: 'libBrief', to: 'qAgent' }],
        title: 'Brief finalized → CRM writeback enqueued',
        explanation: 'validateDecision() QA gate checks for empty angles, hallucinated modules, and detectContradictions(). If it passes, the decision is attached to the brief and written to LeadNextAction. enqueueCrmWriteback() fires a crm_writeback job onto agent-runs (fire-and-forget).',
        payload: 'LeadNextAction { primaryAngle, talkTrack, noShowRisk, revint_* }',
      },
      {
        id: 'A10', flowId: 'ingest',
        segments: [{ edgeId: 'e-qagent-ops', from: 'qAgent', to: 'opsWorkers' }, { edgeId: 'e-ops-hubspot', from: 'opsWorkers', to: 'hubspotCRM' }],
        title: 'HubSpot — 11 revint_* properties synced',
        explanation: 'writeback.ts loads the CrmConnection (access token, portalId), patches the HubSpot contact/deal with all 11 revint_* properties (sales_confidence, lead_temperature, recommended_angle, next_best_action, evidence_summary…), and creates a CrmSyncLog { direction: OUTBOUND, status: SUCCESS } for idempotency.',
        payload: 'PATCH /contacts/{id} { revint_sales_confidence, revint_recommended_angle, … }',
      },
    ],
  },

  {
    id: 'hubspot',
    label: 'Flow B — HubSpot Inbound',
    color: '#f97316',
    steps: [
      {
        id: 'B1', flowId: 'hubspot',
        segments: [{ edgeId: 'e-hs-whr', from: 'hubspotWH', to: 'webhookRtr' }],
        title: 'HubSpot fires contact.creation event',
        explanation: 'HubSpot sends a webhook POST to /api/webhooks/hubspot when a contact is created or a deal stage changes. The payload includes eventId, subscriptionType, objectId, and propertyName.',
        payload: '{ eventId, subscriptionType: "contact.creation", objectId }',
      },
      {
        id: 'B2', flowId: 'hubspot',
        segments: [{ edgeId: 'e-whr-postgres', from: 'webhookRtr', to: 'postgres' }],
        title: 'v3 HMAC verified → CrmSyncLog dedup',
        explanation: 'verifyHubSpotV3Signature() checks the x-hubspot-signature-v3 header. A payloadHash is computed (eventId + subscriptionType + objectId). CrmSyncLog.create({ direction: INBOUND, payloadHash }) — unique constraint on (workspaceId, direction, hash) deduplicates retried deliveries.',
        payload: 'CrmSyncLog { direction: INBOUND, payloadHash, status: SUCCESS }',
      },
      {
        id: 'B3', flowId: 'hubspot',
        segments: [{ edgeId: 'e-whr-router', from: 'webhookRtr', to: 'router' }],
        title: 'Lead ingested → event emitted',
        explanation: 'For contact.creation: ingestHubspotLead(workspaceId, contactId) fetches the contact from HubSpot API, upserts a Lead row with the crmContactId, and emits router.emit("lead_created"). For deal.stage_change: maps HubSpot stage to WatchlistItem.stage.',
        payload: 'router.emit("lead_created", { workspaceId, leadId, source: "hubspot" })',
      },
      {
        id: 'B4', flowId: 'hubspot',
        segments: [{ edgeId: 'e-router-planner', from: 'router', to: 'planner' }, { edgeId: 'e-planner-qagent', from: 'planner', to: 'qAgent' }],
        title: 'Same analysis chain triggered',
        explanation: 'The lead_created event dispatches through the exact same Planner → Orchestrator → BullMQ path as Flow A. HubSpot-sourced leads get the same intelligence treatment as manually created ones.',
        payload: 'PlannerSession + CHAINS["lead_created"] fan-out',
      },
      {
        id: 'B5', flowId: 'hubspot',
        segments: [{ edgeId: 'e-qagent-sync', from: 'qAgent', to: 'syncWorkers' }, { edgeId: 'e-sync-postgres', from: 'syncWorkers', to: 'postgres' }],
        title: 'Workers analyze the HubSpot lead',
        explanation: 'All Group A workers run. enrichment data is written to substrate tables. salesConfidence is computed deterministically. HeadOfAgents produces the sales angle.',
        payload: 'WebsiteAudit, ReviewAnalysis, SalesOpportunity, LeadNextAction written',
      },
      {
        id: 'B6', flowId: 'hubspot',
        segments: [{ edgeId: 'e-qagent-ops', from: 'qAgent', to: 'opsWorkers' }, { edgeId: 'e-ops-hubspot', from: 'opsWorkers', to: 'hubspotCRM' }],
        title: 'Revint signals written back to HubSpot',
        explanation: 'writeback.ts patches the same contact that triggered the inbound event with all 11 revint_* properties. The SDR now sees the Revint App Card in HubSpot showing HOT/WARM/COLD temperature, recommended angle, and next best action — without ever leaving HubSpot.',
        payload: 'PATCH /contacts/{crmContactId} { revint_sales_confidence, revint_lead_temperature, … }',
      },
    ],
  },

  {
    id: 'memory',
    label: 'Flow D — Semantic Memory Read',
    color: '#10b981',
    steps: [
      {
        id: 'D1', flowId: 'memory',
        segments: [{ edgeId: 'e-sync-pgvector', from: 'syncWorkers', to: 'pgvector' }],
        title: 'Worker requests memory context',
        explanation: 'A worker (e.g. COMMERCIAL_INSIGHT_MATCHER) calls memory.queryWithNicheUnion({ text, kinds: [OPENER_SUCCESS, NBA_DECISION], nicheScope: "fnb-fast-casual", topK: 5 }). This is the only legal way to access semantic memory — direct prisma.semanticMemory.* is forbidden.',
        payload: 'MemoryQueryInput { text, kinds, nicheScope, topK: 5 }',
      },
      {
        id: 'D2', flowId: 'memory',
        segments: [{ edgeId: 'e-pgvector-gemini', from: 'pgvector', to: 'gemini' }],
        title: 'Query text embedded via Gemini',
        explanation: 'embed.ts calls Gemini embedding-001 with the query text. Returns a 768-dimensional float vector. On 429/403 error the call throws EmbeddingError and the worker status becomes SUCCEEDED_NO_MEMORY, scheduling a backfill job.',
        payload: 'embedContent({ content: text, model: "gemini-embedding-001" }) → vector(768)',
      },
      {
        id: 'D3', flowId: 'memory',
        segments: [{ edgeId: 'e-hoa-pgvector', from: 'headOfAgents', to: 'pgvector' }],
        title: 'HNSW cosine search executes',
        explanation: 'The pgvector HNSW index performs a cosine similarity search across all workspace-scoped rows matching the requested kinds and nicheScope(s). queryWithNicheUnion blends results from both child scope ("fnb-fast-casual") and parent scope ("fnb"), de-duplicates by refId, re-ranks by similarity.',
        payload: 'SELECT … ORDER BY embedding <=> $queryVec LIMIT 5 (HNSW, workspace-scoped)',
      },
      {
        id: 'D4', flowId: 'memory',
        segments: [{ edgeId: 'e-pgvector-sync', from: 'pgvector', to: 'syncWorkers' }],
        title: 'Top-K memory hits returned',
        explanation: 'The search returns MemoryHit[] { similarity, text, metadata, kind }. These hits are injected into the worker\'s Gemini prompt or into HeadOfAgents\' tool response as grounding evidence. Past OPENER_SUCCESS patterns directly influence the commercial insight ranking.',
        payload: 'MemoryHit[] { similarity: 0.94, kind: "OPENER_SUCCESS", text: "peak-hour akışı → ORDER_PAY" }',
      },
      {
        id: 'D5', flowId: 'memory',
        segments: [{ edgeId: 'e-hoa-claude', from: 'headOfAgents', to: 'claudeAPI' }],
        title: 'Head Agent uses memory in Claude loop',
        explanation: 'In the HeadOfAgents loop, the get_memory read-only tool retrieves LEAD_PROFILE and OPENER_SUCCESS memories to ground the final sales angle. Claude sees "in similar fast-casual leads, Order & Pay with peak-hour framing had 30% close rate" and weights this pattern in its decision.',
        payload: 'Claude sees: { priorOpenerSuccess: "…", leadProfile: "…" } → final decision anchored to evidence',
      },
    ],
  },
];

// ─── mermaid source (abbreviated) ────────────────────────────────────────────
const mermaid = `flowchart TD
  subgraph CLIENT["① Client & Ingestion"]
    Browser["Browser / Next.js SSR"]
    StripeWH["Stripe Webhook\\nPOST /api/billing/webhook"]
    HubSpotWH["HubSpot Webhook\\nPOST /api/webhooks/hubspot"]
    ApifyWH["Apify Webhook\\nPOST /api/webhooks/apify"]
    Cron["Cron Jobs"]
  end
  subgraph EDGE["② Edge / API Layer"]
    Auth["requireUser()\\nSupabase → AuthedSession"]
    LeadsAPI["POST /api/leads"]
    PlannerAPI["POST /api/planner/start"]
    WebhookRouter["Webhook Router\\nHMAC verify + dedup"]
  end
  subgraph ORCH["③ Queue & Orchestration"]
    Router["AI Core Router\\nrouter.ts"]
    Planner["Planner\\nplanner.ts → PersistedPlan DAG"]
    Orchestrator["DAG Orchestrator\\norchestrator.ts"]
    QAgent["BullMQ: agent-runs\\n(PRIMARY queue)"]
  end
  subgraph WORKERS["④ Worker Execution Fleet"]
    SyncA["Group A Sync Workers\\n(Gemini, 10+ workers)"]
    LIB["LEAD_INTELLIGENCE_BRIEF\\ncomputeFnbModuleFit()"]
    HOA["SI.AI.HeadOfAgents\\nClaude, read-only ≤5 rounds"]
    AsyncE["Async Apify Workers\\n(9 actors, webhook callback)"]
    OpsD["Ops Workers Group D\\n(OUTCOME_ATTRIBUTOR, etc.)"]
  end
  subgraph DATA["⑤ Data & Intelligence"]
    PG["PostgreSQL (Prisma)\\n50+ tables, workspaceId-scoped"]
    VEC["pgvector HNSW\\nsemantic_memory (768-dim)"]
    Redis["Redis\\nBullMQ job state"]
  end
  subgraph EXT["⑥ External Ecosystem"]
    Apify["Apify Cloud"]
    Gemini["Gemini APIs\\ngemini-2.0-flash + embedding-001"]
    Claude["Claude API\\nclaude-3-7-sonnet"]
    HubSpot["HubSpot CRM\\n11 revint_* properties"]
    Resend["Resend"]
    Stripe["Stripe v22"]
  end

  Browser -->|"S1: HTTP + cookie"| Auth
  Auth -->|"S2"| LeadsAPI
  LeadsAPI -->|"S3: lead.create"| PG
  LeadsAPI -->|"S4: emit lead_created"| Router
  Router -->|"S5"| Planner
  Planner -->|"S6: PlannerSession"| PG
  Planner -->|"S7: enqueueAdvance"| QAgent
  QAgent -->|"S8: orchestrator_advance"| Orchestrator
  Orchestrator -->|"S9: fan-out worker_execute"| QAgent
  QAgent -->|"S10"| SyncA
  SyncA -->|"S11: generateWithTimeout"| Gemini
  SyncA -->|"S12: write substrate"| PG
  SyncA -->|"S13: upsertAndEmbed"| VEC
  VEC -->|"S14: embed(text)"| Gemini
  QAgent -->|"S15"| LIB
  LIB -->|"S16: read substrate"| PG
  LIB -->|"S17: invoke"| HOA
  HOA -->|"S18: ≤5 rounds"| Claude
  HOA -->|"S19: get_memory"| VEC
  LIB -->|"S20: enqueueCrmWriteback"| QAgent
  QAgent -->|"S21"| OpsD
  OpsD -->|"S22: revint_* writeback"| HubSpot
  QAgent -->|"S23: async_dispatch"| AsyncE
  AsyncE -->|"S24: runAsync"| Apify
  Apify -->|"S25: dataset callback"| ApifyWH
  HubSpotWH -->|"S26: hs-signature-v3"| WebhookRouter
  WebhookRouter -->|"S27: dedup"| PG
  WebhookRouter -->|"S28: ingest event"| Router
  StripeWH -->|"S29: stripe-signature"| WebhookRouter
  WebhookRouter -->|"S30: plan sync"| Stripe`;

export const architecture: Architecture = { zones, nodes, edges, flows, mermaid };
