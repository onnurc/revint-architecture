import type { LucideIcon } from 'lucide-react';

export type ZoneId = 'client' | 'edge' | 'orch' | 'workers' | 'data' | 'external';
export type FlowId = 'ingest' | 'hubspot' | 'memory';
export type EdgeKind = 'sync' | 'async' | 'webhook' | 'response';
export type Maturity = 'live' | 'partial' | 'planned' | 'vision';

export interface Zone {
  id: ZoneId;
  label: string;
  color: string;
  description: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface NodeMeta {
  id: string;
  zoneId: ZoneId;
  title: string;
  tech: string;
  icon: LucideIcon;
  description: string;
  responsibility: string;
  files: string[];
  x: number;
  y: number;
}

export interface EdgeMeta {
  id: string;
  source: string;
  target: string;
  kind: EdgeKind;
  label?: string;
}

export interface FlowSegment {
  edgeId: string;
  from: string;
  to: string;
}

export interface FlowStep {
  id: string;
  flowId: FlowId;
  segments: FlowSegment[];
  title: string;
  explanation: string;
  payload?: string;
  parallelGroup?: number;
}

export interface Flow {
  id: FlowId;
  label: string;
  color: string;
  steps: FlowStep[];
}

// ── Bounded Context Matrix ────────────────────────────────────────────────────

export type ContextId = 'SI' | 'CH' | 'OI' | 'AI';

export interface BcComponent {
  name: string;
  type: 'Module' | 'Agent' | 'Worker' | 'Integration' | 'UI' | 'Function' | 'LearningLayer' | 'EvidenceSystem';
  maturity: Maturity;
  files: string[];
  tables: string[];
  description: string;
}

export interface BoundedContext {
  id: ContextId;
  label: string;
  color: string;
  shortDesc: string;
  contract: string;
  components: BcComponent[];
}

// ── Gap Analysis ──────────────────────────────────────────────────────────────

export type GapStatus = 'live' | 'partial' | 'planned' | 'vision';

export interface GapItem {
  id: string;
  title: string;
  context: ContextId | 'Platform';
  status: GapStatus;
  notionRef: string;
  codeRef: string;
  description: string;
  fix?: string;
  phase?: string;
}

export interface Architecture {
  zones: Zone[];
  nodes: NodeMeta[];
  edges: EdgeMeta[];
  flows: Flow[];
  mermaid: string;
}
