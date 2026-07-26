import { useMemo, useState, type ReactNode } from 'react'
import {
  AlertTriangle,
  ArrowUpDown,
  BadgeCheck,
  Bot,
  ChevronDown,
  ChevronUp,
  Cpu,
  Download,
  Eye,
  Filter,
  Gauge,
  Layers3,
  Network,
  Search,
  ServerCog,
  Sparkles,
  TimerReset,
  Waypoints,
  Workflow,
  Zap,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  Position,
  type Edge,
  type Node,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { PageHeader } from '@/components/layout/PageHeader'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type WorkspaceSection =
  | 'overview'
  | 'api-manager'
  | 'context-injection'
  | 'ai-hub'
  | 'trigger-engine'

type SortDirection = 'asc' | 'desc'
type StatusFilter =
  | 'All'
  | 'Active'
  | 'Healthy'
  | 'Warning'
  | 'Paused'
  | 'Failed'
  | 'Deprecated'
  | 'Needs Review'
type ActivationType =
  | 'API Access'
  | 'AI Integration'
  | 'Context Injection'
  | 'Decision Linkage'
  | 'Event Trigger'
type ConsumerType =
  | 'AI Agent'
  | 'RAG Pipeline'
  | 'Decision Engine'
  | 'Workflow Service'
  | 'API Client'
  | 'Business App'
type Domain = 'Customer' | 'Loan' | 'Collection' | 'Finance' | 'Risk' | 'Compliance' | 'Operations'
type RuntimeTag = 'Real-time' | 'Batch' | 'On-demand' | 'Scheduled' | 'Event-driven'
type TimeTag = 'Today' | '7 Days' | '30 Days' | '90 Days' | 'Custom Range'
type Tone = 'healthy' | 'warning' | 'critical' | 'neutral'

interface WorkspaceItem {
  key: WorkspaceSection
  label: string
  description: string
  count: number
  icon: React.ComponentType<{ className?: string }>
}

interface KpiCard {
  label: string
  metric: string
  description: string
  trend: string
  icon: React.ComponentType<{ className?: string }>
  tone: Tone
  targetSection: WorkspaceSection
}

interface ApiRecord {
  id: string
  apiName: string
  endpoint: string
  consumerSystem: string
  domain: Domain
  authenticationType: 'OAuth 2.0' | 'mTLS' | 'Signed Token' | 'Service Account'
  version: string
  requestVolume: number
  successRate: number
  latencyMs: number
  status: Exclude<StatusFilter, 'All' | 'Deprecated'>
  consumerType: ConsumerType
  scope: string
  payloadPreview: string
  responseMapping: string
  owner: string
}

interface ContextConfigRecord {
  id: string
  configName: string
  linkedModel: string
  sourceCollection: string
  retrievalScope: string
  chunkingStrategy: string
  promptMapping: string
  freshnessPolicy: string
  confidenceThreshold: number
  lastUpdated: string
  status: Exclude<StatusFilter, 'All' | 'Deprecated'>
  domain: Domain
  consumerType: ConsumerType
  runtimeTag: RuntimeTag
  contextPreview: string
}

interface AiIntegrationRecord {
  id: string
  integrationName: string
  modelOrAgent: string
  knowledgeSource: string
  consumerPurpose: string
  domain: Domain
  integrationMode: 'Inference-sidecar' | 'Decision co-pilot' | 'Embedded retrieval' | 'Context broker'
  healthStatus: 'Healthy' | 'Warning' | 'Paused' | 'Failed'
  lastSync: string
  runtimeStatus: 'Ready' | 'Needs Review' | 'Dependent' | 'Paused'
  owner: string
  consumerType: ConsumerType
  runtimeTag: RuntimeTag
  dependencyNote: string
}

interface TriggerRecord {
  id: string
  triggerName: string
  sourceEvent: string
  condition: string
  targetAction: string
  destinationSystem: string
  executionCount: number
  lastTriggered: string
  failureCount: number
  owner: string
  status: Exclude<StatusFilter, 'All' | 'Deprecated'>
  domain: Domain
  runtimeTag: RuntimeTag
  consumerType: ConsumerType
  actionSummary: string
}

interface ActivityItem {
  id: string
  title: string
  detail: string
  timestamp: string
  tone: Tone
}

interface DetailDrawerState {
  title: string
  subtitle: string
  tone: Tone
  metrics: Array<{ label: string; value: string }>
  bullets: string[]
  actions: string[]
}

interface SortState {
  column: string
  direction: SortDirection
}

interface TableColumn<T> {
  key: string
  label: string
  sortable?: boolean
  sortValue?: (row: T) => string | number
  className?: string
  render: (row: T) => ReactNode
}

const statusOptions: StatusFilter[] = ['All', 'Active', 'Healthy', 'Warning', 'Paused', 'Failed', 'Deprecated', 'Needs Review']
const activationTypeOptions: ActivationType[] = ['API Access', 'AI Integration', 'Context Injection', 'Decision Linkage', 'Event Trigger']
const consumerTypeOptions: ConsumerType[] = ['AI Agent', 'RAG Pipeline', 'Decision Engine', 'Workflow Service', 'API Client', 'Business App']
const domainOptions: Domain[] = ['Customer', 'Loan', 'Collection', 'Finance', 'Risk', 'Compliance', 'Operations']
const runtimeOptions: RuntimeTag[] = ['Real-time', 'Batch', 'On-demand', 'Scheduled', 'Event-driven']
const timeOptions: TimeTag[] = ['Today', '7 Days', '30 Days', '90 Days', 'Custom Range']

const kpiCards: KpiCard[] = [
  {
    label: 'Active Knowledge APIs',
    metric: '28',
    description: 'Governed enterprise knowledge endpoints currently available for controlled runtime consumption.',
    trend: '+4 new runtime-ready APIs this quarter',
    icon: ServerCog,
    tone: 'healthy',
    targetSection: 'api-manager',
  },
  {
    label: 'AI Integrations Connected',
    metric: '17',
    description: 'Enterprise AI models, agents, and decision services linked to governed knowledge sources.',
    trend: '3 domain agents entered supervised production',
    icon: Bot,
    tone: 'neutral',
    targetSection: 'ai-hub',
  },
  {
    label: 'Context Injections Executed Today',
    metric: '124.8K',
    description: 'Runtime context deliveries executed across RAG, assisted decisioning, and conversational flows.',
    trend: '+11.6% vs yesterday',
    icon: Sparkles,
    tone: 'healthy',
    targetSection: 'context-injection',
  },
  {
    label: 'Knowledge-driven Decisions Triggered',
    metric: '8.3K',
    description: 'Operational decisions and recommendations that consumed governed enterprise knowledge context.',
    trend: 'Policy-aware decision volume remains stable',
    icon: Workflow,
    tone: 'neutral',
    targetSection: 'overview',
  },
  {
    label: 'Event Triggers Active',
    metric: '43',
    description: 'Live trigger rules capable of launching workflows, alerts, and downstream knowledge-driven actions.',
    trend: '5 triggers currently need supervised tuning',
    icon: Zap,
    tone: 'warning',
    targetSection: 'trigger-engine',
  },
  {
    label: 'API Success Rate',
    metric: '99.14%',
    description: 'Aggregate reliability across runtime knowledge APIs serving AI, workflow, and decision consumers.',
    trend: '+0.4 pts after gateway policy hardening',
    icon: Gauge,
    tone: 'healthy',
    targetSection: 'api-manager',
  },
]

const apiRecords: ApiRecord[] = [
  {
    id: 'API-201',
    apiName: 'Loan Policy Knowledge API',
    endpoint: '/knowledge/v2/loan-policy/runtime-context',
    consumerSystem: 'Retail Lending Decision Hub',
    domain: 'Loan',
    authenticationType: 'OAuth 2.0',
    version: 'v2.3',
    requestVolume: 48210,
    successRate: 99.6,
    latencyMs: 142,
    status: 'Healthy',
    consumerType: 'Decision Engine',
    scope: 'Read scoped to approved lending policy, procedural exceptions, and product clauses.',
    payloadPreview: `{
  "query_context": "loan_repricing_exception",
  "product_code": "AUTO_NEW",
  "policy_scope": ["pricing", "exception-handling", "compliance"]
}`,
    responseMapping: 'Maps policy clauses, confidence signals, and exception boundaries into downstream decision contracts.',
    owner: 'Knowledge Activation Office',
  },
  {
    id: 'API-202',
    apiName: 'Collections Playbook Delivery API',
    endpoint: '/knowledge/v1/collections/playbook-access',
    consumerSystem: 'Collections Workflow Service',
    domain: 'Collection',
    authenticationType: 'mTLS',
    version: 'v1.9',
    requestVolume: 36140,
    successRate: 98.8,
    latencyMs: 186,
    status: 'Active',
    consumerType: 'Workflow Service',
    scope: 'Guided outreach sequences, hardship branches, and approved negotiation paths.',
    payloadPreview: `{
  "segment": "bucket_3_plus",
  "event_type": "promise_to_pay_broken",
  "knowledge_scope": ["treatment-playbook", "compliance-guardrails"]
}`,
    responseMapping: 'Returns operational treatment fragments, escalation rules, and workflow-ready action labels.',
    owner: 'Collections Knowledge Operations',
  },
  {
    id: 'API-203',
    apiName: 'Customer Service Knowledge API',
    endpoint: '/knowledge/v2/customer-service/assist',
    consumerSystem: 'Customer Service GenAI Copilot',
    domain: 'Customer',
    authenticationType: 'Signed Token',
    version: 'v2.1',
    requestVolume: 58920,
    successRate: 97.9,
    latencyMs: 224,
    status: 'Warning',
    consumerType: 'AI Agent',
    scope: 'Approved response guidance, service policy interpretation, and complaint resolution guidance.',
    payloadPreview: `{
  "intent": "settlement_delay",
  "channel": "contact_center",
  "context_policy": "customer_service_safe_v4"
}`,
    responseMapping: 'Injects service guidance snippets, escalation conditions, and citeable knowledge passages.',
    owner: 'Customer Experience AI Office',
  },
  {
    id: 'API-204',
    apiName: 'Compliance Reference API',
    endpoint: '/knowledge/v1/compliance/reference-material',
    consumerSystem: 'Enterprise Compliance Assistant',
    domain: 'Compliance',
    authenticationType: 'Service Account',
    version: 'v1.4',
    requestVolume: 9260,
    successRate: 99.2,
    latencyMs: 118,
    status: 'Healthy',
    consumerType: 'API Client',
    scope: 'Curated compliance controls, policy interpretations, and audit evidence references.',
    payloadPreview: `{
  "control_family": "aml_monitoring",
  "jurisdiction": "ID",
  "reference_depth": "operational"
}`,
    responseMapping: 'Provides reference fragments, control citations, and linked governance evidence IDs.',
    owner: 'Compliance Knowledge Stewardship',
  },
  {
    id: 'API-205',
    apiName: 'Finance Narrative Knowledge API',
    endpoint: '/knowledge/v1/finance/narrative-runtime',
    consumerSystem: 'Executive Finance Narrative Assistant',
    domain: 'Finance',
    authenticationType: 'OAuth 2.0',
    version: 'v1.2',
    requestVolume: 4130,
    successRate: 95.4,
    latencyMs: 278,
    status: 'Needs Review',
    consumerType: 'Business App',
    scope: 'Management commentary guidance, treasury interpretation notes, and reporting narrative patterns.',
    payloadPreview: `{
  "reporting_period": "2026-Q2",
  "narrative_type": "liquidity_explainer",
  "sensitivity_level": "executive"
}`,
    responseMapping: 'Shapes approved narrative context into reporting assistants and CFO briefing surfaces.',
    owner: 'Finance Knowledge Council',
  },
]

const contextConfigs: ContextConfigRecord[] = [
  {
    id: 'CTX-111',
    configName: 'Retail Loan RAG Context Pack',
    linkedModel: 'Retail Lending Copilot',
    sourceCollection: 'Loan Policy, Product Rules, Exception Guidance',
    retrievalScope: 'Product + policy + procedural overlay',
    chunkingStrategy: 'Section-aware semantic chunks',
    promptMapping: 'Inject policy clauses and exception evidence into answer preamble and reviewer notes.',
    freshnessPolicy: 'Rebuild on approved policy release and nightly delta sync',
    confidenceThreshold: 0.88,
    lastUpdated: '2026-04-16 08:30 UTC',
    status: 'Healthy',
    domain: 'Loan',
    consumerType: 'RAG Pipeline',
    runtimeTag: 'Real-time',
    contextPreview: 'Approved policy clauses are ranked ahead of local procedures; stale clauses are blocked from injection.',
  },
  {
    id: 'CTX-112',
    configName: 'Collections Negotiation Guidance Injection',
    linkedModel: 'Collections Guidance Assistant',
    sourceCollection: 'Collections Playbooks, Hardship Paths, Compliance Controls',
    retrievalScope: 'Treatment guidance by customer segment and delinquency ladder',
    chunkingStrategy: 'Intent-linked action fragments',
    promptMapping: 'Inject next-best treatment guidance, prohibited language, and negotiation constraints.',
    freshnessPolicy: 'Event-driven refresh on playbook approval',
    confidenceThreshold: 0.84,
    lastUpdated: '2026-04-16 07:18 UTC',
    status: 'Active',
    domain: 'Collection',
    consumerType: 'AI Agent',
    runtimeTag: 'Event-driven',
    contextPreview: 'Context favors current hardship treatment rules and suppresses expired campaign language.',
  },
  {
    id: 'CTX-113',
    configName: 'Compliance Interpretation Context Router',
    linkedModel: 'Compliance Decision Companion',
    sourceCollection: 'Compliance Manuals, Control Libraries, Audit Notes',
    retrievalScope: 'Control interpretation with jurisdiction and business-line overlay',
    chunkingStrategy: 'Hierarchical clause chunks',
    promptMapping: 'Route primary control text plus linked audit note and issue remediation precedent.',
    freshnessPolicy: 'Scheduled hourly re-index with manual lock for hot controls',
    confidenceThreshold: 0.91,
    lastUpdated: '2026-04-16 06:40 UTC',
    status: 'Healthy',
    domain: 'Compliance',
    consumerType: 'Decision Engine',
    runtimeTag: 'Scheduled',
    contextPreview: 'Only approved control language is injected; under-review remediation notes are excluded from runtime.',
  },
  {
    id: 'CTX-114',
    configName: 'Customer Service Resolution Pack',
    linkedModel: 'Customer Service GenAI Copilot',
    sourceCollection: 'Service SOP, Complaint Guides, Product Resolution Notes',
    retrievalScope: 'Intent-driven service guidance with escalation notes',
    chunkingStrategy: 'Conversation-step and resolution-state chunks',
    promptMapping: 'Inject resolution steps, timing commitments, and escalation boundaries into response plan.',
    freshnessPolicy: 'On-demand refresh during service policy change windows',
    confidenceThreshold: 0.79,
    lastUpdated: '2026-04-15 17:12 UTC',
    status: 'Needs Review',
    domain: 'Customer',
    consumerType: 'AI Agent',
    runtimeTag: 'On-demand',
    contextPreview: 'Freshness guardrail currently flags two service articles awaiting approval replacement.',
  },
]

const aiIntegrations: AiIntegrationRecord[] = [
  {
    id: 'AIN-71',
    integrationName: 'Retail Lending Decision Support',
    modelOrAgent: 'Loan Decision Companion',
    knowledgeSource: 'Loan Policy Knowledge API + Retail Loan RAG Context Pack',
    consumerPurpose: 'Explain exceptions and policy-backed decision recommendations.',
    domain: 'Loan',
    integrationMode: 'Decision co-pilot',
    healthStatus: 'Healthy',
    lastSync: '2026-04-16 08:24 UTC',
    runtimeStatus: 'Ready',
    owner: 'AI Activation Engineering',
    consumerType: 'Decision Engine',
    runtimeTag: 'Real-time',
    dependencyNote: 'Depends on approved policy index and lending product taxonomy release.',
  },
  {
    id: 'AIN-72',
    integrationName: 'Collections Guidance Runtime',
    modelOrAgent: 'Collections Guidance Assistant',
    knowledgeSource: 'Collections Playbook Delivery API + Negotiation Guidance Injection',
    consumerPurpose: 'Guide treatment selection and safe negotiation narratives.',
    domain: 'Collection',
    integrationMode: 'Embedded retrieval',
    healthStatus: 'Warning',
    lastSync: '2026-04-16 07:12 UTC',
    runtimeStatus: 'Dependent',
    owner: 'Collections AI Operations',
    consumerType: 'AI Agent',
    runtimeTag: 'Event-driven',
    dependencyNote: 'Waiting for hardship taxonomy publication to remove fallback routing.',
  },
  {
    id: 'AIN-73',
    integrationName: 'Compliance Decision Context Broker',
    modelOrAgent: 'Compliance Decision Companion',
    knowledgeSource: 'Compliance Reference API + Compliance Interpretation Context Router',
    consumerPurpose: 'Inject policy context into control review and issue triage decisions.',
    domain: 'Compliance',
    integrationMode: 'Context broker',
    healthStatus: 'Healthy',
    lastSync: '2026-04-16 06:39 UTC',
    runtimeStatus: 'Ready',
    owner: 'Regulatory AI Enablement',
    consumerType: 'Decision Engine',
    runtimeTag: 'Scheduled',
    dependencyNote: 'Bound to approved audit-note visibility policy and control-library sync health.',
  },
  {
    id: 'AIN-74',
    integrationName: 'Customer Service Copilot Knowledge Link',
    modelOrAgent: 'Customer Service GenAI Copilot',
    knowledgeSource: 'Customer Service Knowledge API + Resolution Pack',
    consumerPurpose: 'Provide citeable service guidance and escalation-safe resolution context.',
    domain: 'Customer',
    integrationMode: 'Inference-sidecar',
    healthStatus: 'Paused',
    lastSync: '2026-04-15 18:02 UTC',
    runtimeStatus: 'Paused',
    owner: 'Customer Experience AI Office',
    consumerType: 'AI Agent',
    runtimeTag: 'On-demand',
    dependencyNote: 'Paused pending replacement of service articles marked stale by governance review.',
  },
]

const triggerRecords: TriggerRecord[] = [
  {
    id: 'TRG-401',
    triggerName: 'Policy Change Decision Sync',
    sourceEvent: 'Approved lending policy release',
    condition: 'New policy version changes an active decision rule or exception narrative.',
    targetAction: 'Refresh decision-support context and notify lending rule steward.',
    destinationSystem: 'Retail Lending Decision Hub',
    executionCount: 128,
    lastTriggered: '2026-04-16 08:11 UTC',
    failureCount: 0,
    owner: 'Knowledge Activation Office',
    status: 'Healthy',
    domain: 'Loan',
    runtimeTag: 'Event-driven',
    consumerType: 'Decision Engine',
    actionSummary: 'Re-indexes policy context, refreshes API version pointer, and triggers steward acknowledgment.',
  },
  {
    id: 'TRG-402',
    triggerName: 'Collections Playbook Drift Alert',
    sourceEvent: 'Playbook freshness breach',
    condition: 'Collections context pack drops below freshness threshold during live treatment routing.',
    targetAction: 'Pause affected context route and open remediation workflow.',
    destinationSystem: 'Collections Workflow Service',
    executionCount: 43,
    lastTriggered: '2026-04-16 07:03 UTC',
    failureCount: 2,
    owner: 'Collections Knowledge Operations',
    status: 'Warning',
    domain: 'Collection',
    runtimeTag: 'Real-time',
    consumerType: 'Workflow Service',
    actionSummary: 'Creates a workflow incident, marks route as degraded, and sends notifications to AI ops and content owners.',
  },
  {
    id: 'TRG-403',
    triggerName: 'Compliance Knowledge Escalation',
    sourceEvent: 'Control interpretation mismatch',
    condition: 'Decision engine requests context that conflicts with current approved compliance interpretation.',
    targetAction: 'Open governance review and route to compliance escalation lane.',
    destinationSystem: 'Enterprise Compliance Workflow',
    executionCount: 26,
    lastTriggered: '2026-04-15 16:44 UTC',
    failureCount: 0,
    owner: 'Regulatory AI Enablement',
    status: 'Active',
    domain: 'Compliance',
    runtimeTag: 'Event-driven',
    consumerType: 'Workflow Service',
    actionSummary: 'Captures conflicting context, stores trace evidence, and launches policy-review workflow.',
  },
  {
    id: 'TRG-404',
    triggerName: 'Customer Service Safe Route Interlock',
    sourceEvent: 'Unsafe context policy state',
    condition: 'Customer service context route references content marked stale or under review.',
    targetAction: 'Pause integration and switch copilot to approved fallback knowledge mode.',
    destinationSystem: 'Customer Service GenAI Runtime',
    executionCount: 11,
    lastTriggered: '2026-04-15 18:00 UTC',
    failureCount: 3,
    owner: 'Customer Experience AI Office',
    status: 'Failed',
    domain: 'Customer',
    runtimeTag: 'On-demand',
    consumerType: 'AI Agent',
    actionSummary: 'Attempts safe-mode transition, emits alert, and records unresolved route dependency.',
  },
]

const activationTrend = [
  { period: 'Week 1', apiCalls: 128000, contextExecutions: 198000, decisionActivations: 11800, triggerExecutions: 920 },
  { period: 'Week 2', apiCalls: 134000, contextExecutions: 206000, decisionActivations: 12140, triggerExecutions: 980 },
  { period: 'Week 3', apiCalls: 141000, contextExecutions: 214500, decisionActivations: 12760, triggerExecutions: 1034 },
  { period: 'Week 4', apiCalls: 148000, contextExecutions: 221200, decisionActivations: 13110, triggerExecutions: 1092 },
]

const contextHealthTrend = [
  { day: 'Mon', confidence: 88, freshness: 92, routedQueries: 18200 },
  { day: 'Tue', confidence: 89, freshness: 91, routedQueries: 19410 },
  { day: 'Wed', confidence: 90, freshness: 93, routedQueries: 20180 },
  { day: 'Thu', confidence: 87, freshness: 88, routedQueries: 21320 },
  { day: 'Fri', confidence: 91, freshness: 90, routedQueries: 22640 },
]

const triggerTrend = [
  { period: '09:00', success: 14, failed: 1 },
  { period: '11:00', success: 18, failed: 0 },
  { period: '13:00', success: 17, failed: 2 },
  { period: '15:00', success: 21, failed: 1 },
  { period: '17:00', success: 16, failed: 3 },
]

const recentActivity: ActivityItem[] = [
  {
    id: 'ACT-1',
    title: 'Loan Policy Knowledge API promoted to v2.3 runtime contract',
    detail: 'Retail lending decision services now receive updated exception evidence and pricing control clauses.',
    timestamp: '08:18 UTC',
    tone: 'healthy',
  },
  {
    id: 'ACT-2',
    title: 'Collections guidance context route flagged for freshness breach',
    detail: 'Negotiation guidance injection switched to supervised mode after two stale treatment fragments were detected.',
    timestamp: '07:05 UTC',
    tone: 'warning',
  },
  {
    id: 'ACT-3',
    title: 'Customer service copilot safe-route interlock failed fallback verification',
    detail: 'The runtime attempted a safe-mode transition but unresolved stale content references kept the route paused.',
    timestamp: '18:00 UTC',
    tone: 'critical',
  },
  {
    id: 'ACT-4',
    title: 'Compliance decision context broker completed scheduled re-index',
    detail: 'Jurisdiction-aware control interpretation contexts were refreshed without runtime interruption.',
    timestamp: '06:42 UTC',
    tone: 'neutral',
  },
]

const contextNodes: Node[] = [
  {
    id: 'query',
    position: { x: 0, y: 70 },
    data: { label: 'Runtime Query' },
    sourcePosition: Position.Right,
    style: flowNodeStyle('#ecfdf5', '#0f766e'),
  },
  {
    id: 'scope',
    position: { x: 180, y: 70 },
    data: { label: 'Scope Router' },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: flowNodeStyle('#f0fdfa', '#0d9488'),
  },
  {
    id: 'retrieve',
    position: { x: 370, y: 0 },
    data: { label: 'Retrieval' },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: flowNodeStyle('#eef2ff', '#2563eb'),
  },
  {
    id: 'policy',
    position: { x: 370, y: 135 },
    data: { label: 'Context Policy' },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: flowNodeStyle('#fff7ed', '#ea580c'),
  },
  {
    id: 'inject',
    position: { x: 575, y: 70 },
    data: { label: 'Context Injection' },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: flowNodeStyle('#f8fafc', '#475569'),
  },
  {
    id: 'answer',
    position: { x: 780, y: 70 },
    data: { label: 'Answer / Decision' },
    targetPosition: Position.Left,
    style: flowNodeStyle('#f1f5f9', '#334155'),
  },
]

const contextEdges: Edge[] = [
  flowEdge('q-s', 'query', 'scope', '#0f766e'),
  flowEdge('s-r', 'scope', 'retrieve', '#2563eb'),
  flowEdge('s-p', 'scope', 'policy', '#ea580c'),
  flowEdge('r-i', 'retrieve', 'inject', '#2563eb'),
  flowEdge('p-i', 'policy', 'inject', '#ea580c'),
  flowEdge('i-a', 'inject', 'answer', '#475569'),
]

function flowNodeStyle(background: string, borderColor: string) {
  return {
    width: 150,
    borderRadius: 18,
    border: `1px solid ${borderColor}`,
    background,
    color: '#0f172a',
    padding: 12,
    fontSize: 12,
    fontWeight: 600,
    boxShadow: '0 14px 36px rgba(15, 23, 42, 0.08)',
  }
}

function flowEdge(id: string, source: string, target: string, color: string): Edge {
  return {
    id,
    source,
    target,
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, color },
    style: { stroke: color, strokeWidth: 1.5 },
  }
}

function toneBadgeClass(tone: Tone) {
  if (tone === 'healthy') return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  if (tone === 'warning') return 'border-orange-200 bg-orange-50 text-orange-700'
  if (tone === 'critical') return 'border-rose-200 bg-rose-50 text-rose-700'
  return 'border-slate-200 bg-slate-100 text-slate-700'
}

function tonePanelClass(tone: Tone) {
  if (tone === 'healthy') return 'from-emerald-500/10 to-emerald-500/0 border-emerald-200/70'
  if (tone === 'warning') return 'from-orange-500/10 to-orange-500/0 border-orange-200/70'
  if (tone === 'critical') return 'from-rose-500/10 to-rose-500/0 border-rose-200/70'
  return 'from-slate-500/10 to-slate-500/0 border-slate-200/70'
}

function statusClass(value: string) {
  if (['Healthy', 'Ready', 'Active'].includes(value)) return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  if (['Warning', 'Dependent', 'Paused', 'Needs Review'].includes(value)) return 'border-orange-200 bg-orange-50 text-orange-700'
  if (['Failed'].includes(value)) return 'border-rose-200 bg-rose-50 text-rose-700'
  if (['Deprecated'].includes(value)) return 'border-slate-200 bg-slate-100 text-slate-700'
  return 'border-blue-200 bg-blue-50 text-blue-700'
}

function toggleMultiSelect<T extends string>(items: T[], value: T, allOptions: readonly T[]) {
  const next = items.includes(value) ? items.filter((item) => item !== value) : [...items, value]
  return next.length === 0 ? [...allOptions] : next
}

function matchesStatusSelection(selected: StatusFilter[], value: string) {
  if (selected.includes('All')) return true
  if (selected.includes('Healthy') && value === 'Healthy') return true
  return selected.includes(value as StatusFilter)
}

function sortRows<T>(rows: T[], columns: TableColumn<T>[], sortState: SortState | null) {
  if (!sortState) return rows
  const column = columns.find((entry) => entry.key === sortState.column)
  if (!column?.sortValue) return rows

  return [...rows].sort((left, right) => {
    const leftValue = column.sortValue?.(left)
    const rightValue = column.sortValue?.(right)
    if (leftValue === rightValue) return 0
    if (leftValue == null) return 1
    if (rightValue == null) return -1
    const comparison = leftValue > rightValue ? 1 : -1
    return sortState.direction === 'asc' ? comparison : -comparison
  })
}

function filterBySearch(values: Array<string | number>, search: string) {
  if (!search.trim()) return true
  const normalized = search.trim().toLowerCase()
  return values.some((value) => String(value).toLowerCase().includes(normalized))
}

function ChipGroup<T extends string>({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string
  options: readonly T[]
  selected: T[]
  onToggle: (value: T) => void
}) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option)
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                active
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
              )}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SingleSelectChipGroup<T extends string>({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string
  options: readonly T[]
  selected: T
  onSelect: (value: T) => void
}) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
              selected === option
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

function SectionHeader({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  )
}

function InfoCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone,
}: {
  title: string
  value: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  tone: Tone
}) {
  return (
    <div className={cn('glass-card rounded-2xl border bg-gradient-to-br p-4', tonePanelClass(tone))}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-600">{subtitle}</p>
        </div>
        <div className={cn('rounded-2xl border p-2.5', toneBadgeClass(tone))}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  )
}

function EnterpriseTable<T>({
  rows,
  columns,
  sortState,
  onSort,
  emptyTitle,
  emptyDescription,
}: {
  rows: T[]
  columns: TableColumn<T>[]
  sortState: SortState | null
  onSort: (column: string) => void
  emptyTitle: string
  emptyDescription: string
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-xs text-slate-700">
          <thead className="border-b border-slate-200 bg-slate-50/90">
            <tr>
              {columns.map((column) => {
                const active = sortState?.column === column.key
                return (
                  <th key={column.key} className={cn('px-4 py-3 font-semibold text-slate-600', column.className)}>
                    {column.sortable ? (
                      <button type="button" onClick={() => onSort(column.key)} className="inline-flex items-center gap-1.5 hover:text-slate-900">
                        <span>{column.label}</span>
                        {!active ? (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                        ) : sortState?.direction === 'asc' ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row, index) => (
                <tr key={index} className="border-b border-slate-100 align-top last:border-b-0 hover:bg-emerald-50/35">
                  {columns.map((column) => (
                    <td key={column.key} className={cn('px-4 py-3', column.className)}>
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-14 text-center">
                  <p className="text-sm font-semibold text-slate-900">{emptyTitle}</p>
                  <p className="mt-2 text-sm text-slate-500">{emptyDescription}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function KnowledgeActivationPage() {
  const [activeSection, setActiveSection] = useState<WorkspaceSection>('overview')
  const [showFilters, setShowFilters] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatuses, setSelectedStatuses] = useState<StatusFilter[]>(['All'])
  const [selectedActivationTypes, setSelectedActivationTypes] = useState<ActivationType[]>([...activationTypeOptions])
  const [selectedConsumers, setSelectedConsumers] = useState<ConsumerType[]>([...consumerTypeOptions])
  const [selectedDomains, setSelectedDomains] = useState<Domain[]>([...domainOptions])
  const [selectedRuntimes, setSelectedRuntimes] = useState<RuntimeTag[]>([...runtimeOptions])
  const [selectedTime, setSelectedTime] = useState<TimeTag>('30 Days')
  const [sortMap, setSortMap] = useState<Record<'api' | 'context' | 'ai' | 'trigger', SortState | null>>({
    api: { column: 'successRate', direction: 'desc' },
    context: { column: 'lastUpdated', direction: 'desc' },
    ai: { column: 'lastSync', direction: 'desc' },
    trigger: { column: 'lastTriggered', direction: 'desc' },
  })
  const [detailDrawer, setDetailDrawer] = useState<DetailDrawerState>({
    title: 'Knowledge Activation Control Posture',
    subtitle: 'SALVIA is currently exposing governed knowledge as executable runtime context across APIs, AI integrations, decision services, and event-driven workflows.',
    tone: 'neutral',
    metrics: [
      { label: 'Primary focus', value: 'API reliability and context freshness remain the main control levers.' },
      { label: 'Current risk signal', value: 'Customer service safe-route dependencies require remediation before resuming full activation.' },
      { label: 'Operational readiness', value: 'Knowledge-to-decision activation remains strong in lending and compliance domains.' },
    ],
    bullets: [
      'Runtime knowledge delivery is governed through explicit scopes, consumer visibility, and version-aware API controls.',
      'Context injection pathways remain explainable through retrieval scope, confidence thresholds, and freshness policies.',
      'Event-triggered knowledge actions retain execution history and failure evidence for operational follow-up.',
    ],
    actions: ['Open API Detail', 'Preview Injected Context', 'View Runtime Health', 'Open Execution History'],
  })

  const filteredApiRecords = useMemo(() => {
    return apiRecords.filter((row) => {
      return (
        selectedActivationTypes.includes('API Access') &&
        selectedConsumers.includes(row.consumerType) &&
        selectedDomains.includes(row.domain) &&
        selectedRuntimes.includes('Real-time') &&
        matchesStatusSelection(selectedStatuses, row.status) &&
        filterBySearch([row.apiName, row.endpoint, row.consumerSystem, row.domain, row.owner], searchQuery)
      )
    })
  }, [searchQuery, selectedActivationTypes, selectedConsumers, selectedDomains, selectedRuntimes, selectedStatuses])

  const filteredContextConfigs = useMemo(() => {
    return contextConfigs.filter((row) => {
      return (
        selectedActivationTypes.includes('Context Injection') &&
        selectedConsumers.includes(row.consumerType) &&
        selectedDomains.includes(row.domain) &&
        selectedRuntimes.includes(row.runtimeTag) &&
        matchesStatusSelection(selectedStatuses, row.status) &&
        filterBySearch([row.configName, row.linkedModel, row.sourceCollection, row.promptMapping, row.domain], searchQuery)
      )
    })
  }, [searchQuery, selectedActivationTypes, selectedConsumers, selectedDomains, selectedRuntimes, selectedStatuses])

  const filteredAiIntegrations = useMemo(() => {
    return aiIntegrations.filter((row) => {
      return (
        selectedActivationTypes.includes('AI Integration') &&
        selectedConsumers.includes(row.consumerType) &&
        selectedDomains.includes(row.domain) &&
        selectedRuntimes.includes(row.runtimeTag) &&
        matchesStatusSelection(selectedStatuses, row.healthStatus) &&
        filterBySearch([row.integrationName, row.modelOrAgent, row.knowledgeSource, row.consumerPurpose, row.owner], searchQuery)
      )
    })
  }, [searchQuery, selectedActivationTypes, selectedConsumers, selectedDomains, selectedRuntimes, selectedStatuses])

  const filteredTriggers = useMemo(() => {
    return triggerRecords.filter((row) => {
      return (
        (selectedActivationTypes.includes('Event Trigger') || selectedActivationTypes.includes('Decision Linkage')) &&
        selectedConsumers.includes(row.consumerType) &&
        selectedDomains.includes(row.domain) &&
        selectedRuntimes.includes(row.runtimeTag) &&
        matchesStatusSelection(selectedStatuses, row.status) &&
        filterBySearch([row.triggerName, row.sourceEvent, row.condition, row.destinationSystem, row.owner], searchQuery)
      )
    })
  }, [searchQuery, selectedActivationTypes, selectedConsumers, selectedDomains, selectedRuntimes, selectedStatuses])

  const selectedApi = filteredApiRecords[0] ?? apiRecords[0]
  const selectedContext = filteredContextConfigs[0] ?? contextConfigs[0]
  const selectedIntegration = filteredAiIntegrations[0] ?? aiIntegrations[0]
  const selectedTrigger = filteredTriggers[0] ?? triggerRecords[0]

  const workspaceItems: WorkspaceItem[] = [
    {
      key: 'overview',
      label: 'Overview',
      description: 'Enterprise activation command overview across APIs, context, AI, and trigger execution.',
      count: recentActivity.length,
      icon: Layers3,
    },
    {
      key: 'api-manager',
      label: 'Knowledge API Manager',
      description: 'Govern controlled API access to enterprise knowledge for runtime consumers.',
      count: filteredApiRecords.length,
      icon: ServerCog,
    },
    {
      key: 'context-injection',
      label: 'Context Injection Config',
      description: 'Control retrieval scope, context routing, and RAG injection readiness.',
      count: filteredContextConfigs.length,
      icon: Sparkles,
    },
    {
      key: 'ai-hub',
      label: 'AI Integration Hub',
      description: 'Track structured knowledge integration into AI models, agents, and decision services.',
      count: filteredAiIntegrations.length,
      icon: Bot,
    },
    {
      key: 'trigger-engine',
      label: 'Knowledge Trigger Engine',
      description: 'Monitor event-driven knowledge triggers, downstream actions, and execution health.',
      count: filteredTriggers.length,
      icon: Zap,
    },
  ]

  const apiColumns: TableColumn<ApiRecord>[] = [
    {
      key: 'apiName',
      label: 'API Name',
      sortable: true,
      sortValue: (row) => row.apiName,
      render: (row) => (
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setDetailDrawer({
              title: row.apiName,
              subtitle: `${row.endpoint} serves governed knowledge to ${row.consumerSystem}.`,
              tone: row.status === 'Warning' || row.status === 'Needs Review' ? 'warning' : 'healthy',
              metrics: [
                { label: 'Consumer system', value: row.consumerSystem },
                { label: 'Authentication', value: row.authenticationType },
                { label: 'Version', value: row.version },
                { label: 'Success / latency', value: `${row.successRate.toFixed(1)}% / ${row.latencyMs} ms` },
              ],
              bullets: [row.scope, row.responseMapping, `Payload preview is available for ${row.consumerType} consumers.`],
              actions: ['Open API Detail', 'View Payload Schema', 'Test Endpoint', 'View Usage Metrics', 'Deprecate API', 'Open Consumer Mapping'],
            })}
            className="font-semibold text-emerald-700 hover:text-emerald-900"
          >
            {row.apiName}
          </button>
          <p className="text-[11px] text-slate-500">{row.endpoint}</p>
        </div>
      ),
    },
    {
      key: 'consumerSystem',
      label: 'Consumer / Domain',
      sortable: true,
      sortValue: (row) => `${row.consumerSystem}${row.domain}`,
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.consumerSystem}</p>
          <div className="mt-1 flex flex-wrap gap-2">
            <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">{row.consumerType}</Badge>
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">{row.domain}</Badge>
          </div>
        </div>
      ),
    },
    {
      key: 'authenticationType',
      label: 'Auth / Version',
      sortable: true,
      sortValue: (row) => `${row.authenticationType}${row.version}`,
      render: (row) => (
        <div className="space-y-1">
          <p>{row.authenticationType}</p>
          <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">{row.version}</Badge>
        </div>
      ),
    },
    {
      key: 'requestVolume',
      label: 'Usage',
      sortable: true,
      sortValue: (row) => row.requestVolume,
      render: (row) => (
        <div className="space-y-1 text-[11px]">
          <p className="font-semibold text-slate-900">{Intl.NumberFormat('en-US').format(row.requestVolume)}</p>
          <p className="text-slate-500">Requests / {selectedTime}</p>
        </div>
      ),
    },
    {
      key: 'successRate',
      label: 'Success / Latency',
      sortable: true,
      sortValue: (row) => row.successRate,
      render: (row) => (
        <div className="space-y-2">
          <Badge variant="outline" className={statusClass(row.status)}>{row.successRate.toFixed(1)}%</Badge>
          <div className="text-[11px] text-slate-500">{row.latencyMs} ms p95</div>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: () => (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline">Open API Detail</Button>
          <Button size="sm" variant="outline">View Payload Schema</Button>
        </div>
      ),
    },
  ]

  const contextColumns: TableColumn<ContextConfigRecord>[] = [
    {
      key: 'configName',
      label: 'Context Config',
      sortable: true,
      sortValue: (row) => row.configName,
      render: (row) => (
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setDetailDrawer({
              title: row.configName,
              subtitle: `${row.linkedModel} consumes governed runtime context from ${row.sourceCollection}.`,
              tone: row.status === 'Needs Review' ? 'warning' : 'healthy',
              metrics: [
                { label: 'Linked model', value: row.linkedModel },
                { label: 'Retrieval scope', value: row.retrievalScope },
                { label: 'Freshness policy', value: row.freshnessPolicy },
                { label: 'Confidence threshold', value: row.confidenceThreshold.toFixed(2) },
              ],
              bullets: [row.promptMapping, row.contextPreview, `Chunking strategy: ${row.chunkingStrategy}.`],
              actions: ['Open Context Config', 'Edit Retrieval Scope', 'Preview Injected Context', 'Test Query Flow', 'Adjust Freshness Rule', 'View Linked Model'],
            })}
            className="font-semibold text-emerald-700 hover:text-emerald-900"
          >
            {row.configName}
          </button>
          <p className="text-[11px] text-slate-500">{row.linkedModel}</p>
        </div>
      ),
    },
    {
      key: 'sourceCollection',
      label: 'Source / Scope',
      sortable: true,
      sortValue: (row) => `${row.sourceCollection}${row.retrievalScope}`,
      render: (row) => (
        <div className="space-y-1">
          <p className="font-medium text-slate-900">{row.sourceCollection}</p>
          <p className="text-[11px] text-slate-500">{row.retrievalScope}</p>
        </div>
      ),
    },
    {
      key: 'chunkingStrategy',
      label: 'Routing / Policy',
      sortable: true,
      sortValue: (row) => `${row.chunkingStrategy}${row.freshnessPolicy}`,
      render: (row) => (
        <div className="space-y-1 text-[11px] text-slate-600">
          <p>{row.chunkingStrategy}</p>
          <p>{row.freshnessPolicy}</p>
        </div>
      ),
    },
    {
      key: 'confidenceThreshold',
      label: 'Confidence',
      sortable: true,
      sortValue: (row) => row.confidenceThreshold,
      render: (row) => (
        <div className="space-y-1">
          <p className="font-semibold text-slate-900">{row.confidenceThreshold.toFixed(2)}</p>
          <Badge variant="outline" className={statusClass(row.status)}>{row.status}</Badge>
        </div>
      ),
    },
    {
      key: 'lastUpdated',
      label: 'Last Updated',
      sortable: true,
      sortValue: (row) => row.lastUpdated,
      render: (row) => <span className="text-[11px] text-slate-600">{row.lastUpdated}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: () => (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline">Preview Injected Context</Button>
          <Button size="sm" variant="outline">Test Query Flow</Button>
        </div>
      ),
    },
  ]

  const integrationColumns: TableColumn<AiIntegrationRecord>[] = [
    {
      key: 'integrationName',
      label: 'Integration',
      sortable: true,
      sortValue: (row) => row.integrationName,
      render: (row) => (
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setDetailDrawer({
              title: row.integrationName,
              subtitle: `${row.modelOrAgent} is consuming governed knowledge through ${row.integrationMode}.`,
              tone: row.healthStatus === 'Failed' ? 'critical' : row.healthStatus === 'Warning' || row.healthStatus === 'Paused' ? 'warning' : 'healthy',
              metrics: [
                { label: 'Model or agent', value: row.modelOrAgent },
                { label: 'Knowledge source', value: row.knowledgeSource },
                { label: 'Runtime status', value: row.runtimeStatus },
                { label: 'Owner', value: row.owner },
              ],
              bullets: [row.consumerPurpose, row.dependencyNote, `Consumer type: ${row.consumerType}.`],
              actions: ['Open Integration Detail', 'Link Knowledge Source', 'Test Integration', 'View Runtime Health', 'Pause Integration', 'Open Consumer Trace'],
            })}
            className="font-semibold text-emerald-700 hover:text-emerald-900"
          >
            {row.integrationName}
          </button>
          <p className="text-[11px] text-slate-500">{row.modelOrAgent}</p>
        </div>
      ),
    },
    {
      key: 'knowledgeSource',
      label: 'Knowledge Source',
      sortable: true,
      sortValue: (row) => row.knowledgeSource,
      render: (row) => <p className="max-w-[260px] text-[11px] leading-relaxed text-slate-600">{row.knowledgeSource}</p>,
    },
    {
      key: 'consumerPurpose',
      label: 'Purpose / Domain',
      sortable: true,
      sortValue: (row) => `${row.consumerPurpose}${row.domain}`,
      render: (row) => (
        <div className="space-y-1">
          <p className="text-[11px] leading-relaxed text-slate-600">{row.consumerPurpose}</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">{row.domain}</Badge>
            <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">{row.integrationMode}</Badge>
          </div>
        </div>
      ),
    },
    {
      key: 'healthStatus',
      label: 'Health / Runtime',
      sortable: true,
      sortValue: (row) => `${row.healthStatus}${row.runtimeStatus}`,
      render: (row) => (
        <div className="space-y-2">
          <Badge variant="outline" className={statusClass(row.healthStatus)}>{row.healthStatus}</Badge>
          <Badge variant="outline" className={statusClass(row.runtimeStatus)}>{row.runtimeStatus}</Badge>
        </div>
      ),
    },
    {
      key: 'lastSync',
      label: 'Last Sync',
      sortable: true,
      sortValue: (row) => row.lastSync,
      render: (row) => <span className="text-[11px] text-slate-600">{row.lastSync}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: () => (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline">Test Integration</Button>
          <Button size="sm" variant="outline">Open Consumer Trace</Button>
        </div>
      ),
    },
  ]

  const triggerColumns: TableColumn<TriggerRecord>[] = [
    {
      key: 'triggerName',
      label: 'Trigger',
      sortable: true,
      sortValue: (row) => row.triggerName,
      render: (row) => (
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setDetailDrawer({
              title: row.triggerName,
              subtitle: `${row.sourceEvent} can activate ${row.targetAction.toLowerCase()} in ${row.destinationSystem}.`,
              tone: row.status === 'Failed' ? 'critical' : row.status === 'Warning' ? 'warning' : 'healthy',
              metrics: [
                { label: 'Source event', value: row.sourceEvent },
                { label: 'Destination', value: row.destinationSystem },
                { label: 'Execution / failures', value: `${row.executionCount} / ${row.failureCount}` },
                { label: 'Owner', value: row.owner },
              ],
              bullets: [row.condition, row.actionSummary, `Runtime mode: ${row.runtimeTag}.`],
              actions: ['Open Trigger Detail', 'Edit Trigger Rule', 'Test Trigger', 'Pause Trigger', 'View Execution History', 'Open Destination Workflow'],
            })}
            className="font-semibold text-emerald-700 hover:text-emerald-900"
          >
            {row.triggerName}
          </button>
          <p className="text-[11px] text-slate-500">{row.sourceEvent}</p>
        </div>
      ),
    },
    {
      key: 'condition',
      label: 'Condition / Action',
      sortable: true,
      sortValue: (row) => `${row.condition}${row.targetAction}`,
      render: (row) => (
        <div className="space-y-1 text-[11px] leading-relaxed text-slate-600">
          <p>{row.condition}</p>
          <p className="font-medium text-slate-900">{row.targetAction}</p>
        </div>
      ),
    },
    {
      key: 'destinationSystem',
      label: 'Destination',
      sortable: true,
      sortValue: (row) => row.destinationSystem,
      render: (row) => (
        <div className="space-y-1">
          <p>{row.destinationSystem}</p>
          <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">{row.consumerType}</Badge>
        </div>
      ),
    },
    {
      key: 'executionCount',
      label: 'Executions',
      sortable: true,
      sortValue: (row) => row.executionCount,
      render: (row) => (
        <div className="space-y-1 text-[11px]">
          <p className="font-semibold text-slate-900">{Intl.NumberFormat('en-US').format(row.executionCount)}</p>
          <p className="text-slate-500">Failures: {row.failureCount}</p>
        </div>
      ),
    },
    {
      key: 'lastTriggered',
      label: 'Last Triggered',
      sortable: true,
      sortValue: (row) => row.lastTriggered,
      render: (row) => (
        <div className="space-y-2">
          <span className="text-[11px] text-slate-600">{row.lastTriggered}</span>
          <Badge variant="outline" className={statusClass(row.status)}>{row.status}</Badge>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: () => (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline">Test Trigger</Button>
          <Button size="sm" variant="outline">View Execution History</Button>
        </div>
      ),
    },
  ]

  const sortedApiRecords = sortRows(filteredApiRecords, apiColumns, sortMap.api)
  const sortedContextConfigs = sortRows(filteredContextConfigs, contextColumns, sortMap.context)
  const sortedAiIntegrations = sortRows(filteredAiIntegrations, integrationColumns, sortMap.ai)
  const sortedTriggers = sortRows(filteredTriggers, triggerColumns, sortMap.trigger)

  const handleSort = (table: 'api' | 'context' | 'ai' | 'trigger', column: string) => {
    setSortMap((current) => {
      const previous = current[table]
      return {
        ...current,
        [table]: {
          column,
          direction: previous?.column === column && previous.direction === 'asc' ? 'desc' : 'asc',
        },
      }
    })
  }

  const renderOverview = () => {
    return (
      <section className="space-y-5">
        <SectionHeader
          title="Knowledge Activation Overview"
          description="Command overview of how governed enterprise knowledge is being exposed, injected, consumed, and triggered across operational runtime layers."
        />

        <div className="grid gap-4 xl:grid-cols-[1.3fr,0.7fr]">
          <div className="glass-card rounded-2xl border border-slate-200/70 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Activation Volume Trend</p>
                <p className="text-[11px] text-slate-500">API delivery, context execution, decision linkage, and event-trigger activity across the current operating window.</p>
              </div>
              <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">Operational reach</Badge>
            </div>
            <div className="mt-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={activationTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="period" stroke="#64748b" tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="triggerExecutions" fill="#94a3b8" radius={[8, 8, 0, 0]} />
                  <Line type="monotone" dataKey="apiCalls" stroke="#0f766e" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="contextExecutions" stroke="#2563eb" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="decisionActivations" stroke="#ea580c" strokeWidth={2.5} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-4">
            <InfoCard title="Healthy APIs" value="24 / 28" subtitle="Knowledge delivery endpoints currently within reliability and latency policy." icon={BadgeCheck} tone="healthy" />
            <InfoCard title="AI Coverage" value="6 domains" subtitle="Knowledge activation is actively supporting AI and decisioning across six enterprise domains." icon={Cpu} tone="neutral" />
            <InfoCard title="Trigger Alerts" value="5 open" subtitle="Trigger execution issues requiring supervised remediation or routing review." icon={AlertTriangle} tone="warning" />
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <div className="glass-card rounded-2xl border border-slate-200/70 p-4">
            <p className="text-sm font-semibold text-slate-900">API Health Summary</p>
            <div className="mt-3 space-y-3">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3 text-sm text-emerald-900">24 APIs are fully healthy with governed payload and response mapping in service.</div>
              <div className="rounded-2xl border border-orange-200 bg-orange-50/70 p-3 text-sm text-orange-900">3 APIs are degraded by freshness or latency drift but remain controlled for supervised consumers.</div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 text-sm text-slate-700">1 API remains under review due to narrative payload quality concerns in finance reporting workflows.</div>
            </div>
          </div>

          <div className="glass-card rounded-2xl border border-slate-200/70 p-4">
            <p className="text-sm font-semibold text-slate-900">Context Injection Activity</p>
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={contextHealthTrend}>
                  <defs>
                    <linearGradient id="context-confidence" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#0f766e" stopOpacity={0.32} />
                      <stop offset="100%" stopColor="#0f766e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="day" stroke="#64748b" tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="confidence" stroke="#0f766e" fill="url(#context-confidence)" strokeWidth={2.5} />
                  <Line type="monotone" dataKey="freshness" stroke="#2563eb" strokeWidth={2.2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card rounded-2xl border border-slate-200/70 p-4">
            <p className="text-sm font-semibold text-slate-900">Recent Activation Events</p>
            <div className="mt-3 space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="rounded-2xl border border-slate-200/80 bg-white/80 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{activity.title}</p>
                      <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{activity.detail}</p>
                    </div>
                    <Badge variant="outline" className={toneBadgeClass(activity.tone)}>{activity.timestamp}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  const renderApiManager = () => (
    <section className="space-y-5">
      <SectionHeader
        title="Knowledge API Manager"
        description="Operational control center for governed API-based knowledge delivery, consumer visibility, payload readiness, and runtime health evidence."
        actions={<Button variant="outline">View Usage Metrics</Button>}
      />

      <div className="grid gap-4 xl:grid-cols-[1.05fr,0.95fr]">
        <div className="glass-card rounded-2xl border border-slate-200/70 p-4">
          <p className="text-sm font-semibold text-slate-900">Payload Preview</p>
          <p className="mt-1 text-[11px] text-slate-500">The selected API exposes knowledge in a runtime-consumable contract with scoped request and response governance.</p>
          <pre className="mt-4 max-h-[260px] overflow-auto rounded-2xl bg-slate-950 p-4 text-[11px] leading-relaxed text-slate-100">{selectedApi.payloadPreview}</pre>
        </div>

        <div className="space-y-4">
          <InfoCard title="Consumer Visibility" value={selectedApi.consumerSystem} subtitle={`Current consumer type: ${selectedApi.consumerType}.`} icon={Network} tone="neutral" />
          <div className="glass-card rounded-2xl border border-slate-200/70 p-4">
            <p className="text-sm font-semibold text-slate-900">Response Mapping</p>
            <p className="mt-3 text-sm leading-6 text-slate-700">{selectedApi.responseMapping}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">{selectedApi.authenticationType}</Badge>
              <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">{selectedApi.version}</Badge>
              <Badge variant="outline" className={statusClass(selectedApi.status)}>{selectedApi.status}</Badge>
            </div>
          </div>
        </div>
      </div>

      <EnterpriseTable
        rows={sortedApiRecords}
        columns={apiColumns}
        sortState={sortMap.api}
        onSort={(column) => handleSort('api', column)}
        emptyTitle="No knowledge APIs match the current activation filters"
        emptyDescription="Broaden the status, consumer, or domain filters to restore the API inventory view."
      />
    </section>
  )

  const renderContextInjection = () => (
    <section className="space-y-5">
      <SectionHeader
        title="Context Injection Config"
        description="Controlled RAG and runtime context workspace for query routing, retrieval scope visibility, policy-aware injection, and explainable context readiness."
      />

      <div className="grid gap-4 xl:grid-cols-[1.1fr,0.9fr]">
        <div className="glass-card rounded-2xl border border-slate-200/70 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Prompt-to-Context Flow</p>
              <p className="mt-1 text-[11px] text-slate-500">Query routing, retrieval, policy enforcement, and context injection remain fully traceable before answer or decision generation.</p>
            </div>
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">RAG ready</Badge>
          </div>
          <div className="mt-4 h-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/80">
            <ReactFlow
              nodes={contextNodes}
              edges={contextEdges}
              fitView
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
              panOnDrag={false}
              zoomOnScroll={false}
              zoomOnDoubleClick={false}
              preventScrolling
            >
              <MiniMap style={{ background: '#f8fafc' }} zoomable pannable />
              <Controls showInteractive={false} />
              <Background color="#dbe4ee" gap={18} />
            </ReactFlow>
          </div>
        </div>

        <div className="space-y-4">
          <InfoCard title="Selected Context Pack" value={selectedContext.configName} subtitle={selectedContext.contextPreview} icon={Sparkles} tone={selectedContext.status === 'Needs Review' ? 'warning' : 'healthy'} />
          <div className="glass-card rounded-2xl border border-slate-200/70 p-4">
            <p className="text-sm font-semibold text-slate-900">Context Preview</p>
            <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm leading-6 text-slate-700">
              {selectedContext.promptMapping}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">{selectedContext.chunkingStrategy}</Badge>
              <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">Freshness {selectedContext.freshnessPolicy}</Badge>
              <Badge variant="outline" className={statusClass(selectedContext.status)}>{selectedContext.status}</Badge>
            </div>
          </div>
        </div>
      </div>

      <EnterpriseTable
        rows={sortedContextConfigs}
        columns={contextColumns}
        sortState={sortMap.context}
        onSort={(column) => handleSort('context', column)}
        emptyTitle="No context configurations match the current filters"
        emptyDescription="Adjust activation, consumer, or runtime filters to restore context routing visibility."
      />
    </section>
  )

  const renderAiHub = () => (
    <section className="space-y-5">
      <SectionHeader
        title="AI Integration Hub"
        description="Structured integration workspace showing how SALVIA knowledge is linked into AI models, agents, assistants, and decision intelligence services."
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <InfoCard title="Runtime-ready Integrations" value={`${sortedAiIntegrations.filter((item) => item.runtimeStatus === 'Ready').length}`} subtitle="AI integrations fully aligned with governed knowledge runtime dependencies." icon={Bot} tone="healthy" />
        <InfoCard title="Dependent Integrations" value={`${sortedAiIntegrations.filter((item) => item.runtimeStatus === 'Dependent').length}`} subtitle="Integrations still waiting for source or policy dependencies to stabilize." icon={Waypoints} tone="warning" />
        <InfoCard title="Paused Routes" value={`${sortedAiIntegrations.filter((item) => item.runtimeStatus === 'Paused').length}`} subtitle="Integrations intentionally paused to preserve enterprise-safe runtime behavior." icon={TimerReset} tone="warning" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr,1.05fr]">
        <div className="glass-card rounded-2xl border border-slate-200/70 p-4">
          <p className="text-sm font-semibold text-slate-900">Knowledge Source Mapping</p>
          <div className="mt-4 space-y-3">
            {sortedAiIntegrations.slice(0, 3).map((integration) => (
              <button
                key={integration.id}
                type="button"
                onClick={() => setDetailDrawer({
                  title: integration.integrationName,
                  subtitle: integration.consumerPurpose,
                  tone: integration.healthStatus === 'Failed' ? 'critical' : integration.healthStatus === 'Warning' || integration.healthStatus === 'Paused' ? 'warning' : 'healthy',
                  metrics: [
                    { label: 'Model or agent', value: integration.modelOrAgent },
                    { label: 'Integration mode', value: integration.integrationMode },
                    { label: 'Runtime status', value: integration.runtimeStatus },
                    { label: 'Last sync', value: integration.lastSync },
                  ],
                  bullets: [integration.knowledgeSource, integration.dependencyNote, `Owner: ${integration.owner}.`],
                  actions: ['Open Integration Detail', 'Link Knowledge Source', 'Test Integration', 'View Runtime Health', 'Pause Integration', 'Open Consumer Trace'],
                })}
                className="w-full rounded-2xl border border-slate-200 bg-white/80 p-4 text-left hover:border-emerald-200 hover:bg-emerald-50/20"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{integration.integrationName}</p>
                    <p className="mt-1 text-[11px] text-slate-500">{integration.modelOrAgent}</p>
                  </div>
                  <Badge variant="outline" className={statusClass(integration.healthStatus)}>{integration.healthStatus}</Badge>
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-slate-600">{integration.knowledgeSource}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl border border-slate-200/70 p-4">
          <p className="text-sm font-semibold text-slate-900">Runtime Dependency Blocks</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Selected Integration</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{selectedIntegration.integrationName}</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{selectedIntegration.consumerPurpose}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Dependency Awareness</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{selectedIntegration.dependencyNote}</p>
            </div>
          </div>
        </div>
      </div>

      <EnterpriseTable
        rows={sortedAiIntegrations}
        columns={integrationColumns}
        sortState={sortMap.ai}
        onSort={(column) => handleSort('ai', column)}
        emptyTitle="No AI integrations match the current filters"
        emptyDescription="Adjust activation, consumer, domain, or runtime filters to restore AI integration visibility."
      />
    </section>
  )

  const renderTriggerEngine = () => (
    <section className="space-y-5">
      <SectionHeader
        title="Knowledge Trigger Engine"
        description="Controlled event-driven workspace for activating workflows, alerts, recommendations, and downstream business actions from governed knowledge conditions."
      />

      <div className="grid gap-4 xl:grid-cols-[1fr,1fr]">
        <div className="glass-card rounded-2xl border border-slate-200/70 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Trigger Execution Trend</p>
              <p className="mt-1 text-[11px] text-slate-500">Success and failure patterns across the current runtime observation window.</p>
            </div>
            <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">Traceable execution</Badge>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={triggerTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="period" stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="success" fill="#0f766e" radius={[8, 8, 0, 0]} />
                <Bar dataKey="failed" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card rounded-2xl border border-rose-200/70 p-4">
            <p className="text-sm font-semibold text-rose-900">Failed Trigger Visibility</p>
            <div className="mt-3 space-y-3">
              {sortedTriggers.filter((item) => item.failureCount > 0).slice(0, 3).map((item) => (
                <div key={item.id} className="rounded-2xl border border-rose-200 bg-rose-50/60 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-rose-900">{item.triggerName}</p>
                      <p className="mt-1 text-[11px] text-rose-800">{item.actionSummary}</p>
                    </div>
                    <Badge variant="outline" className="border-rose-200 bg-white text-rose-700">{item.failureCount} failed</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl border border-slate-200/70 p-4">
            <p className="text-sm font-semibold text-slate-900">Destination Mapping</p>
            <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-sm font-semibold text-slate-900">{selectedTrigger.triggerName}</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{selectedTrigger.actionSummary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="outline" className="border-slate-200 bg-white text-slate-700">{selectedTrigger.destinationSystem}</Badge>
                <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">{selectedTrigger.runtimeTag}</Badge>
                <Badge variant="outline" className={statusClass(selectedTrigger.status)}>{selectedTrigger.status}</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EnterpriseTable
        rows={sortedTriggers}
        columns={triggerColumns}
        sortState={sortMap.trigger}
        onSort={(column) => handleSort('trigger', column)}
        emptyTitle="No trigger rules match the current filters"
        emptyDescription="Adjust activation, consumer, or runtime filters to restore trigger-engine visibility."
      />
    </section>
  )

  return (
    <div className="space-y-6 pb-10">
      <Breadcrumb
        items={[
          { label: 'Enterprise Knowledge Management', href: '/' },
          { label: 'Knowledge Activation' },
        ]}
      />

      <section className="overflow-hidden rounded-[30px] border border-slate-200/80 bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.16),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(45,212,191,0.12),_transparent_24%),linear-gradient(145deg,rgba(248,250,252,0.98),rgba(255,255,255,0.94))] shadow-[0_26px_80px_rgba(15,23,42,0.08)]">
        <div className="border-b border-slate-200/70 px-6 py-6">
          <PageHeader
            title="Knowledge Activation"
            description="Premium enterprise workspace for turning governed knowledge into executable runtime intelligence across APIs, AI agents, RAG pipelines, decision services, and event-driven operational workflows."
            right={
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="h-10 rounded-xl border-slate-200 bg-white/85 px-3 text-slate-700 hover:bg-slate-50"
                  onClick={() => setShowFilters((current) => !current)}
                  aria-label={showFilters ? 'Hide filters' : 'Show filters'}
                  title={showFilters ? 'Hide filters' : 'Show filters'}
                >
                  <Filter className="h-5 w-5" strokeWidth={2} />
                  <span className="ml-2">{showFilters ? 'Hide filters' : 'Show filters'}</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-10 rounded-xl border-slate-200 bg-white/85 px-3 text-slate-700 hover:bg-slate-50"
                  onClick={() => setDetailDrawer({
                    title: 'Knowledge Activation Export',
                    subtitle: `An activation export package is prepared for ${workspaceItems.find((item) => item.key === activeSection)?.label ?? 'Overview'}.`,
                    tone: 'neutral',
                    metrics: [
                      { label: 'Scope', value: 'Runtime evidence, routing state, and selected filter context are ready for export.' },
                      { label: 'Prepared at', value: '2026-04-17 09:30 local time' },
                    ],
                    bullets: ['Export includes selected inventory, runtime summaries, and detail drawer evidence.', 'Use the workspace-specific actions to inspect records before finalizing export.'],
                    actions: ['View Usage Metrics', 'Preview Injected Context', 'Open Consumer Trace', 'View Execution History'],
                  })}
                  aria-label="Export"
                  title="Export"
                >
                  <Download className="h-5 w-5" strokeWidth={2} />
                  <span className="ml-2">Export</span>
                </Button>
              </div>
            }
          />

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge className="rounded-full border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
              Enterprise knowledge execution layer
            </Badge>
            <Badge className="rounded-full border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700">
              API-based knowledge delivery
            </Badge>
            <Badge className="rounded-full border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700">
              Context injection and trigger traceability
            </Badge>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            {kpiCards.map((card) => {
              const Icon = card.icon
              return (
                <button
                  key={card.label}
                  type="button"
                  onClick={() => setActiveSection(card.targetSection)}
                  className={cn(
                    'glass-card relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xl',
                    tonePanelClass(card.tone)
                  )}
                >
                  <div className="relative z-10 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-slate-500">{card.label}</p>
                        <p className="mt-2 text-2xl font-bold text-slate-950">{card.metric}</p>
                      </div>
                      <div className={cn('rounded-2xl border p-2.5', toneBadgeClass(card.tone))}>
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-600">{card.description}</p>
                    <p className="text-[11px] font-medium text-emerald-700">{card.trend}</p>
                  </div>
                  <Icon className="absolute -bottom-4 right-3 h-16 w-16 text-slate-200/60" />
                </button>
              )
            })}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[280px,minmax(0,1fr),340px]">
            <aside className="glass-card sticky top-20 rounded-2xl border border-slate-200/70 p-3 h-fit">
              <div className="px-2 pb-3 pt-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Workspace Navigator</p>
                <p className="mt-1 text-sm text-slate-600">Explore how SALVIA operationalizes enterprise knowledge into runtime action.</p>
              </div>
              <div className="space-y-2">
                {workspaceItems.map((item) => {
                  const Icon = item.icon
                  const active = item.key === activeSection
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setActiveSection(item.key)}
                      className={cn(
                        'w-full rounded-2xl border p-3 text-left transition-all duration-200',
                        active
                          ? 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-sm'
                          : 'border-transparent hover:border-slate-200 hover:bg-slate-50/70'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn('rounded-xl border p-2', active ? 'border-emerald-200 bg-white text-emerald-700' : 'border-slate-200 bg-white text-slate-600')}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className={cn('text-sm font-semibold', active ? 'text-emerald-900' : 'text-slate-900')}>{item.label}</p>
                            <Badge variant="outline" className="border-slate-200 bg-white text-slate-600">{item.count}</Badge>
                          </div>
                          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{item.description}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </aside>

            <div className="space-y-6 min-w-0">
              {showFilters ? (
                <div className="glass-card rounded-2xl border border-slate-200/70 p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="search"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search API name, endpoint, AI model, agent, integration ID, trigger name, context source, decision flow, consumer system, or domain"
                      className="h-10 w-full rounded-xl border-slate-200 bg-white/85 pl-9 text-sm"
                    />
                  </div>

                  <div className="mt-4 space-y-3">
                    <ChipGroup
                      label="Status"
                      options={statusOptions}
                      selected={selectedStatuses}
                      onToggle={(value) => {
                        if (value === 'All') {
                          setSelectedStatuses(['All'])
                          return
                        }
                        const base = selectedStatuses.includes('All') ? [] : selectedStatuses
                        const next = toggleMultiSelect(base, value, statusOptions.filter((item) => item !== 'All'))
                        setSelectedStatuses(next)
                      }}
                    />
                    <ChipGroup label="Activation Type" options={activationTypeOptions} selected={selectedActivationTypes} onToggle={(value) => setSelectedActivationTypes(toggleMultiSelect(selectedActivationTypes, value, activationTypeOptions))} />
                    <ChipGroup label="Consumer" options={consumerTypeOptions} selected={selectedConsumers} onToggle={(value) => setSelectedConsumers(toggleMultiSelect(selectedConsumers, value, consumerTypeOptions))} />
                    <ChipGroup label="Domain" options={domainOptions} selected={selectedDomains} onToggle={(value) => setSelectedDomains(toggleMultiSelect(selectedDomains, value, domainOptions))} />
                    <ChipGroup label="Runtime" options={runtimeOptions} selected={selectedRuntimes} onToggle={(value) => setSelectedRuntimes(toggleMultiSelect(selectedRuntimes, value, runtimeOptions))} />
                    <SingleSelectChipGroup label="Time" options={timeOptions} selected={selectedTime} onSelect={setSelectedTime} />
                  </div>
                </div>
              ) : null}

              {activeSection === 'overview' && renderOverview()}
              {activeSection === 'api-manager' && renderApiManager()}
              {activeSection === 'context-injection' && renderContextInjection()}
              {activeSection === 'ai-hub' && renderAiHub()}
              {activeSection === 'trigger-engine' && renderTriggerEngine()}
            </div>

            <aside className="space-y-4">
              <div className="glass-card sticky top-20 rounded-2xl border border-slate-200/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Runtime Evidence Drawer</p>
                    <p className="text-[11px] leading-relaxed text-slate-500">Selected runtime evidence, dependency notes, and traceable follow-up actions.</p>
                  </div>
                  <div className={cn('rounded-xl border p-2', toneBadgeClass(detailDrawer.tone))}>
                    <Eye className="h-4 w-4" />
                  </div>
                </div>

                <div className={cn('mt-4 rounded-2xl border bg-gradient-to-br p-4', tonePanelClass(detailDrawer.tone))}>
                  <p className="text-sm font-semibold text-slate-900">{detailDrawer.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{detailDrawer.subtitle}</p>
                </div>

                <div className="mt-4 space-y-3">
                  {detailDrawer.metrics.map((metric) => (
                    <div key={metric.label} className="rounded-2xl border border-slate-200/70 bg-white/85 p-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{metric.label}</p>
                      <p className="mt-1 text-sm text-slate-800">{metric.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Operational Notes</p>
                  <div className="mt-3 space-y-2">
                    {detailDrawer.bullets.map((bullet) => (
                      <div key={bullet} className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-3 text-sm leading-6 text-slate-700">
                        {bullet}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Available Actions</p>
                  <div className="mt-3 flex flex-col gap-2">
                    {detailDrawer.actions.map((action) => (
                      <button key={action} type="button" className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-left text-sm text-slate-700 hover:border-emerald-200 hover:text-emerald-700">
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}