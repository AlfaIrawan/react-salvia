import { useMemo, useState, type ReactNode } from 'react'
import {
  Activity,
  ArrowUpDown,
  Bot,
  BrainCircuit,
  Building2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Download,
  Eye,
  FileStack,
  Filter,
  Layers3,
  LockKeyhole,
  Orbit,
  Radar,
  Search,
  ShieldAlert,
  ShieldCheck,
  X,
} from 'lucide-react'
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType,
  type Edge,
  type Node,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { PageHeader } from '@/components/layout/PageHeader'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

type WorkspaceSection = 'overview' | 'executive' | 'map' | 'risk' | 'ai'
type SortDirection = 'asc' | 'desc'
type Tone = 'healthy' | 'warning' | 'critical' | 'neutral'
type StatusTag = 'Healthy' | 'Warning' | 'Critical' | 'Restricted' | 'Non-compliant' | 'Rising' | 'Declining'
type ScopeTag = 'Enterprise-wide' | 'Domain-level' | 'Platform-level' | 'AI-level' | 'Governance-level'
type AssetTag = 'Published' | 'Draft' | 'Archived' | 'Sensitive' | 'Trusted' | 'Outdated'
type IntegrationTag = 'Connected' | 'Active' | 'Degraded' | 'Failed' | 'Under Review'
type DomainTag = 'Customer' | 'Loan' | 'Collection' | 'Finance' | 'Risk' | 'Compliance' | 'Operations'
type TimeTag = 'Today' | '7 Days' | '30 Days' | '90 Days' | '12 Months'
type Priority = 'High' | 'Moderate' | 'Low'

interface WorkspaceMenuItem {
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

interface ExecutiveRow {
  id: string
  domain: DomainTag
  businessFunction: string
  assetVolume: number
  usageTrend: string
  usageTrendValue: number
  aiInteractionRate: number
  trustScore: number
  riskLevel: string
  complianceStatus: string
  integrationCoverage: number
  lastReviewed: string
  executiveStatus: string
  status: StatusTag
  scope: ScopeTag
  assetTags: AssetTag[]
  integrationState: IntegrationTag
  timeRange: TimeTag
  owner: string
}

interface RiskRecord {
  id: string
  riskArea: string
  affectedDomain: DomainTag
  sensitiveAssetCount: number
  policyViolations: number
  complianceStatus: string
  exceptionCount: number
  remediationProgress: number
  lastAuditEvent: string
  owner: string
  priority: Priority
  status: StatusTag
  scope: ScopeTag
  assetTags: AssetTag[]
  integrationState: IntegrationTag
  timeRange: TimeTag
}

interface AiPerformanceRecord {
  id: string
  assistant: string
  model: string
  knowledgeUsageVolume: number
  groundedAnswerRate: number
  citationCoverage: number
  topReferencedAssets: string[]
  summaryGenerationCount: number
  synthesisUsage: number
  trustIndicator: string
  domainCoverage: string
  status: StatusTag
  domain: DomainTag
  scope: ScopeTag
  assetTags: AssetTag[]
  integrationState: IntegrationTag
  timeRange: TimeTag
}

interface TimelineEvent {
  id: string
  title: string
  detail: string
  timestamp: string
  tone: Tone
}

interface DrawerState {
  title: string
  subtitle: string
  tone: Tone
  metrics: Array<{ label: string; value: string }>
  bullets: string[]
  actions: string[]
}

interface SortState {
  key: string | null
  direction: SortDirection
}

const statusOptions: StatusTag[] = ['Healthy', 'Warning', 'Critical', 'Restricted', 'Non-compliant', 'Rising', 'Declining']
const scopeOptions: ScopeTag[] = ['Enterprise-wide', 'Domain-level', 'Platform-level', 'AI-level', 'Governance-level']
const assetOptions: AssetTag[] = ['Published', 'Draft', 'Archived', 'Sensitive', 'Trusted', 'Outdated']
const integrationOptions: IntegrationTag[] = ['Connected', 'Active', 'Degraded', 'Failed', 'Under Review']
const domainOptions: DomainTag[] = ['Customer', 'Loan', 'Collection', 'Finance', 'Risk', 'Compliance', 'Operations']
const timeOptions: TimeTag[] = ['Today', '7 Days', '30 Days', '90 Days', '12 Months']

const workspaceItems: WorkspaceMenuItem[] = [
  { key: 'overview', label: 'Overview', description: 'Command summary for enterprise knowledge scale, health, and strategic readiness.', count: 12, icon: Layers3 },
  { key: 'executive', label: 'Executive Dashboard', description: 'Cross-domain monitoring for usage, trust, integration, and review posture.', count: 7, icon: Building2 },
  { key: 'map', label: 'Knowledge Map', description: 'Enterprise-wide repository, AI, workflow, and governance flow visibility.', count: 18, icon: Orbit },
  { key: 'risk', label: 'Risk & Compliance Overview', description: 'Executive control layer for protection, remediation, and audit readiness.', count: 9, icon: ShieldAlert },
  { key: 'ai', label: 'AI Knowledge Performance Panel', description: 'Groundedness, citation, synthesis, and trust signals across AI consumers.', count: 6, icon: BrainCircuit },
]

const kpiCards: KpiCard[] = [
  { label: 'Enterprise Knowledge Assets', metric: '128,460', description: 'Governed assets visible across policies, playbooks, SOPs, FAQs, and AI-ready summaries.', trend: '+6.2% vs prior quarter', icon: FileStack, tone: 'healthy', targetSection: 'overview' },
  { label: 'Published Knowledge Coverage', metric: '82.4%', description: 'Published assets with assigned stewardship, active classification, and current review evidence.', trend: '11 domains above target threshold', icon: ShieldCheck, tone: 'healthy', targetSection: 'executive' },
  { label: 'AI-grounded Answer Rate', metric: '91.8%', description: 'Enterprise assistant responses grounded in approved knowledge with traceable source coverage.', trend: '+2.9 pts over last 30 days', icon: Bot, tone: 'neutral', targetSection: 'ai' },
  { label: 'Restricted / Sensitive Assets', metric: '3,276', description: 'Assets under restricted handling, masking, or controlled retrieval policies.', trend: '97 items entered supervised remediation', icon: LockKeyhole, tone: 'warning', targetSection: 'risk' },
  { label: 'Compliance Controls Passing', metric: '96.1%', description: 'Policy and classification controls currently passing across monitored knowledge domains.', trend: '2 exception clusters remain open', icon: ShieldAlert, tone: 'healthy', targetSection: 'risk' },
  { label: 'Cross-platform Integrations Active', metric: '34', description: 'Live platform connections carrying enterprise knowledge into AI, workflow, and operational surfaces.', trend: '2 integrations in degraded review', icon: Radar, tone: 'neutral', targetSection: 'map' },
  { label: 'Knowledge Activation Events Today', metric: '18,240', description: 'Knowledge activation events delivered into assistants, workflows, and decision services today.', trend: '+14.1% daily activation lift', icon: Activity, tone: 'healthy', targetSection: 'ai' },
]

const executiveRows: ExecutiveRow[] = [
  { id: 'DOM-001', domain: 'Loan', businessFunction: 'Origination and decision support', assetVolume: 28420, usageTrend: 'Rising', usageTrendValue: 16, aiInteractionRate: 78, trustScore: 94, riskLevel: 'Moderate', complianceStatus: 'Controlled', integrationCoverage: 92, lastReviewed: '2026-04-12', executiveStatus: 'Stable growth', status: 'Rising', scope: 'Domain-level', assetTags: ['Published', 'Trusted'], integrationState: 'Active', timeRange: '30 Days', owner: 'Retail Lending Knowledge Office' },
  { id: 'DOM-002', domain: 'Collection', businessFunction: 'Recovery operations and hardship playbooks', assetVolume: 17380, usageTrend: 'Warning', usageTrendValue: -4, aiInteractionRate: 63, trustScore: 88, riskLevel: 'Elevated', complianceStatus: 'Review required', integrationCoverage: 84, lastReviewed: '2026-04-09', executiveStatus: 'Needs review', status: 'Warning', scope: 'Domain-level', assetTags: ['Published', 'Sensitive', 'Outdated'], integrationState: 'Degraded', timeRange: '30 Days', owner: 'Collections Strategy Office' },
  { id: 'DOM-003', domain: 'Customer', businessFunction: 'Relationship servicing and omnichannel support', assetVolume: 22190, usageTrend: 'Healthy', usageTrendValue: 9, aiInteractionRate: 81, trustScore: 96, riskLevel: 'Low', complianceStatus: 'Passing', integrationCoverage: 95, lastReviewed: '2026-04-15', executiveStatus: 'Strong', status: 'Healthy', scope: 'Enterprise-wide', assetTags: ['Published', 'Trusted'], integrationState: 'Connected', timeRange: '7 Days', owner: 'Customer Experience Knowledge Team' },
  { id: 'DOM-004', domain: 'Finance', businessFunction: 'Finance controls and reconciliation knowledge', assetVolume: 12980, usageTrend: 'Healthy', usageTrendValue: 6, aiInteractionRate: 58, trustScore: 92, riskLevel: 'Moderate', complianceStatus: 'Passing', integrationCoverage: 76, lastReviewed: '2026-04-07', executiveStatus: 'Controlled', status: 'Healthy', scope: 'Governance-level', assetTags: ['Published', 'Sensitive', 'Trusted'], integrationState: 'Active', timeRange: '90 Days', owner: 'Finance Control Knowledge Office' },
  { id: 'DOM-005', domain: 'Risk', businessFunction: 'Risk policy interpretation and adjudication support', assetVolume: 14810, usageTrend: 'Critical', usageTrendValue: -9, aiInteractionRate: 67, trustScore: 83, riskLevel: 'High', complianceStatus: 'Exception cluster', integrationCoverage: 88, lastReviewed: '2026-04-03', executiveStatus: 'Executive attention', status: 'Critical', scope: 'Governance-level', assetTags: ['Published', 'Sensitive', 'Outdated'], integrationState: 'Under Review', timeRange: '30 Days', owner: 'Enterprise Risk Knowledge Office' },
  { id: 'DOM-006', domain: 'Compliance', businessFunction: 'Regulatory obligations and supervisory response guidance', assetVolume: 16930, usageTrend: 'Rising', usageTrendValue: 12, aiInteractionRate: 74, trustScore: 95, riskLevel: 'Low', complianceStatus: 'Passing', integrationCoverage: 90, lastReviewed: '2026-04-14', executiveStatus: 'Trusted', status: 'Healthy', scope: 'Enterprise-wide', assetTags: ['Published', 'Sensitive', 'Trusted'], integrationState: 'Connected', timeRange: '7 Days', owner: 'Compliance Advisory Knowledge Office' },
  { id: 'DOM-007', domain: 'Operations', businessFunction: 'Branch operations, service workflow, and exception handling', assetVolume: 15750, usageTrend: 'Declining', usageTrendValue: -6, aiInteractionRate: 61, trustScore: 87, riskLevel: 'Moderate', complianceStatus: 'Monitoring', integrationCoverage: 79, lastReviewed: '2026-04-10', executiveStatus: 'Needs intervention', status: 'Declining', scope: 'Platform-level', assetTags: ['Published', 'Draft'], integrationState: 'Active', timeRange: '30 Days', owner: 'Operations Enablement Office' },
]

const riskRecords: RiskRecord[] = [
  { id: 'RISK-101', riskArea: 'Stale collections hardship guidance', affectedDomain: 'Collection', sensitiveAssetCount: 146, policyViolations: 12, complianceStatus: 'Non-compliant', exceptionCount: 4, remediationProgress: 58, lastAuditEvent: '2026-04-16 10:42', owner: 'Collections Governance Lead', priority: 'High', status: 'Non-compliant', scope: 'Governance-level', assetTags: ['Sensitive', 'Outdated'], integrationState: 'Under Review', timeRange: 'Today' },
  { id: 'RISK-102', riskArea: 'Restricted lending playbooks referenced by broad AI scope', affectedDomain: 'Loan', sensitiveAssetCount: 88, policyViolations: 3, complianceStatus: 'Controlled', exceptionCount: 1, remediationProgress: 84, lastAuditEvent: '2026-04-15 15:05', owner: 'Lending Trust and Controls', priority: 'Moderate', status: 'Restricted', scope: 'AI-level', assetTags: ['Sensitive', 'Trusted'], integrationState: 'Active', timeRange: '7 Days' },
  { id: 'RISK-103', riskArea: 'Customer servicing articles missing classification tags', affectedDomain: 'Customer', sensitiveAssetCount: 54, policyViolations: 7, complianceStatus: 'Review required', exceptionCount: 2, remediationProgress: 69, lastAuditEvent: '2026-04-14 09:15', owner: 'Customer Knowledge Steward', priority: 'Moderate', status: 'Warning', scope: 'Domain-level', assetTags: ['Published', 'Draft'], integrationState: 'Connected', timeRange: '30 Days' },
  { id: 'RISK-104', riskArea: 'Risk adjudication knowledge lacking evidence refresh', affectedDomain: 'Risk', sensitiveAssetCount: 127, policyViolations: 16, complianceStatus: 'Non-compliant', exceptionCount: 5, remediationProgress: 41, lastAuditEvent: '2026-04-16 08:20', owner: 'Enterprise Risk Governance', priority: 'High', status: 'Critical', scope: 'Governance-level', assetTags: ['Sensitive', 'Outdated'], integrationState: 'Degraded', timeRange: 'Today' },
  { id: 'RISK-105', riskArea: 'Finance controls archive still exposed to workflow summaries', affectedDomain: 'Finance', sensitiveAssetCount: 39, policyViolations: 2, complianceStatus: 'Controlled', exceptionCount: 1, remediationProgress: 92, lastAuditEvent: '2026-04-13 13:32', owner: 'Finance Controls Office', priority: 'Low', status: 'Restricted', scope: 'Platform-level', assetTags: ['Archived', 'Sensitive'], integrationState: 'Active', timeRange: '90 Days' },
  { id: 'RISK-106', riskArea: 'Operations policy exception backlog', affectedDomain: 'Operations', sensitiveAssetCount: 62, policyViolations: 9, complianceStatus: 'Monitoring', exceptionCount: 6, remediationProgress: 47, lastAuditEvent: '2026-04-12 16:55', owner: 'Operations Compliance Manager', priority: 'High', status: 'Warning', scope: 'Platform-level', assetTags: ['Draft', 'Sensitive'], integrationState: 'Under Review', timeRange: '30 Days' },
]

const aiPerformanceRecords: AiPerformanceRecord[] = [
  { id: 'AI-201', assistant: 'Salvia Knowledge Advisor', model: 'GPT-4.1 Enterprise', knowledgeUsageVolume: 48200, groundedAnswerRate: 94, citationCoverage: 97, topReferencedAssets: ['Retail loan exception handbook', 'Collections hardship matrix', 'Customer dispute SOP'], summaryGenerationCount: 8420, synthesisUsage: 3180, trustIndicator: 'High trust', domainCoverage: 'Loan, Collection, Customer', status: 'Healthy', domain: 'Loan', scope: 'AI-level', assetTags: ['Published', 'Trusted'], integrationState: 'Active', timeRange: '7 Days' },
  { id: 'AI-202', assistant: 'Branch Resolution Copilot', model: 'Azure OpenAI Governance Assist', knowledgeUsageVolume: 26540, groundedAnswerRate: 89, citationCoverage: 92, topReferencedAssets: ['Branch escalation playbook', 'Service recovery policy', 'Fee waiver guidance'], summaryGenerationCount: 5190, synthesisUsage: 2240, trustIndicator: 'Managed trust', domainCoverage: 'Customer, Operations', status: 'Warning', domain: 'Operations', scope: 'AI-level', assetTags: ['Published', 'Sensitive'], integrationState: 'Degraded', timeRange: '30 Days' },
  { id: 'AI-203', assistant: 'Compliance Obligation Navigator', model: 'Claude Compliance Enterprise', knowledgeUsageVolume: 18210, groundedAnswerRate: 96, citationCoverage: 99, topReferencedAssets: ['Regulatory obligation register', 'AML response guide', 'Supervisory remediation SOP'], summaryGenerationCount: 3660, synthesisUsage: 1705, trustIndicator: 'Very high trust', domainCoverage: 'Compliance, Risk', status: 'Healthy', domain: 'Compliance', scope: 'Governance-level', assetTags: ['Published', 'Sensitive', 'Trusted'], integrationState: 'Connected', timeRange: '7 Days' },
  { id: 'AI-204', assistant: 'Collections Outcome Recommender', model: 'Bank Internal Decision LLM', knowledgeUsageVolume: 21480, groundedAnswerRate: 84, citationCoverage: 88, topReferencedAssets: ['Hardship offer policy', 'Collections script library', 'Recovery treatment exceptions'], summaryGenerationCount: 4410, synthesisUsage: 1960, trustIndicator: 'Supervised trust', domainCoverage: 'Collection', status: 'Critical', domain: 'Collection', scope: 'AI-level', assetTags: ['Published', 'Outdated', 'Sensitive'], integrationState: 'Under Review', timeRange: 'Today' },
  { id: 'AI-205', assistant: 'Finance Controls Summarizer', model: 'Gemini Enterprise Workspace', knowledgeUsageVolume: 9700, groundedAnswerRate: 92, citationCoverage: 95, topReferencedAssets: ['Quarter close procedure', 'Approval matrix', 'Reconciliation exception guide'], summaryGenerationCount: 2810, synthesisUsage: 1225, trustIndicator: 'High trust', domainCoverage: 'Finance', status: 'Healthy', domain: 'Finance', scope: 'Platform-level', assetTags: ['Published', 'Trusted'], integrationState: 'Active', timeRange: '90 Days' },
]

const knowledgeTrendSeries = [
  { period: 'Nov', assets: 116400, publishedCoverage: 77, groundedRate: 87, activationEvents: 13200 },
  { period: 'Dec', assets: 118150, publishedCoverage: 78, groundedRate: 88, activationEvents: 13840 },
  { period: 'Jan', assets: 121200, publishedCoverage: 79, groundedRate: 89, activationEvents: 14590 },
  { period: 'Feb', assets: 123800, publishedCoverage: 80, groundedRate: 90, activationEvents: 15220 },
  { period: 'Mar', assets: 126240, publishedCoverage: 81, groundedRate: 91, activationEvents: 16410 },
  { period: 'Apr', assets: 128460, publishedCoverage: 82.4, groundedRate: 91.8, activationEvents: 18240 },
]

const complianceTrendSeries = [
  { period: 'Week 1', passing: 93, exceptions: 18, remediation: 52 },
  { period: 'Week 2', passing: 94, exceptions: 15, remediation: 59 },
  { period: 'Week 3', passing: 95, exceptions: 13, remediation: 67 },
  { period: 'Week 4', passing: 96.1, exceptions: 11, remediation: 74 },
]

const groundedTrendSeries = [
  { period: 'Week 1', grounded: 89, citations: 91, synthesis: 1320 },
  { period: 'Week 2', grounded: 90, citations: 92, synthesis: 1460 },
  { period: 'Week 3', grounded: 91, citations: 94, synthesis: 1580 },
  { period: 'Week 4', grounded: 91.8, citations: 95, synthesis: 1710 },
]

const domainLeaderboard = [
  { domain: 'Loan', value: 94, color: '#0f766e' },
  { domain: 'Compliance', value: 95, color: '#15803d' },
  { domain: 'Customer', value: 96, color: '#0f766e' },
  { domain: 'Collection', value: 88, color: '#d97706' },
  { domain: 'Risk', value: 83, color: '#b91c1c' },
  { domain: 'Operations', value: 87, color: '#f59e0b' },
]

const trustUsageMatrix = [
  { domain: 'Loan', trust: 94, usage: 78 },
  { domain: 'Collection', trust: 88, usage: 63 },
  { domain: 'Customer', trust: 96, usage: 81 },
  { domain: 'Finance', trust: 92, usage: 58 },
  { domain: 'Risk', trust: 83, usage: 67 },
  { domain: 'Compliance', trust: 95, usage: 74 },
  { domain: 'Operations', trust: 87, usage: 61 },
]

const integrationHealthCards = [
  { title: 'Connected platforms', value: '12', detail: 'Laurus, Ficus, Cedrus, Tilia, Vitis, Salix, Sequoia, and domain systems remain linked.' },
  { title: 'Knowledge flow to AI systems', value: '9 active paths', detail: 'Grounded knowledge is streaming into copilots, decision services, and retrieval brokers.' },
  { title: 'Workflow activation links', value: '14 live', detail: 'Knowledge activation continues to trigger review, remediation, and downstream service workflows.' },
  { title: 'API consumption posture', value: '2.8M / week', detail: 'Governed API usage remains within current service and control thresholds.' },
]

const executiveTimeline: TimelineEvent[] = [
  { id: 'EV-001', title: 'Collections remediation cluster escalated', detail: 'Four stale hardship assets remain exposed in supervised AI summaries and require executive follow-up.', timestamp: '17 Apr 2026, 09:30', tone: 'critical' },
  { id: 'EV-002', title: 'Compliance knowledge controls passed monthly evidence review', detail: 'Classification coverage, restricted retrieval rules, and citation control evidence remain within target.', timestamp: '16 Apr 2026, 16:10', tone: 'healthy' },
  { id: 'EV-003', title: 'New Laurus integration enabled knowledge policy synchronization', detail: 'API contract change notices now feed directly into Salvia review workflows for controlled activation.', timestamp: '16 Apr 2026, 13:05', tone: 'neutral' },
  { id: 'EV-004', title: 'Risk domain trust score fell below executive threshold', detail: 'Outdated adjudication playbooks increased low-trust answer exposure in supervisory response scenarios.', timestamp: '15 Apr 2026, 18:20', tone: 'warning' },
]

const strategicInsights = [
  { id: 'INS-1', title: 'Enterprise readiness signal', summary: 'Knowledge coverage is expanding faster than trust remediation in the Risk and Collection domains.', detail: 'Executive focus should remain on outdated controlled content, because AI usage is rising faster than review throughput in the most regulated domains.' },
  { id: 'INS-2', title: 'Cross-platform orchestration signal', summary: 'Integration health remains strong, but AI consumers are now more dependent on Tilia and Laurus contract synchronization.', detail: 'Governance leaders should keep change coordination tight across registry, API, and knowledge lifecycle motions to prevent downstream trust regression.' },
]

function nodeStyle(background: string, borderColor: string) {
  return {
    width: 220,
    borderRadius: 18,
    border: `1px solid ${borderColor}`,
    background,
    boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)',
    color: '#0f172a',
    fontSize: 12,
    padding: 16,
  }
}

function edge(source: string, target: string, color: string): Edge {
  return {
    id: `${source}-${target}`,
    source,
    target,
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed, color },
    style: { stroke: color, strokeWidth: 2.2 },
  }
}

const baseMapNodes: Node[] = [
  { id: 'salvia-core', position: { x: 420, y: 180 }, data: { label: 'SALVIA Enterprise Knowledge Core', domain: 'Enterprise', subtitle: 'Repository and command layer' }, style: nodeStyle('#ecfdf5', '#047857') },
  { id: 'loan-repo', position: { x: 90, y: 50 }, data: { label: 'Loan Repository Cluster', domain: 'Loan', subtitle: 'Policies, SOPs, playbooks' }, style: nodeStyle('#f0fdf4', '#166534') },
  { id: 'collection-repo', position: { x: 90, y: 180 }, data: { label: 'Collection Repository Cluster', domain: 'Collection', subtitle: 'Recovery scripts and hardship knowledge' }, style: nodeStyle('#fff7ed', '#c2410c') },
  { id: 'compliance-repo', position: { x: 90, y: 310 }, data: { label: 'Compliance Repository Cluster', domain: 'Compliance', subtitle: 'Regulatory obligations and evidence' }, style: nodeStyle('#eff6ff', '#1d4ed8') },
  { id: 'ai-broker', position: { x: 760, y: 80 }, data: { label: 'AI Consumer Mesh', domain: 'Enterprise', subtitle: 'Assistants, copilots, decision services' }, style: nodeStyle('#ecfeff', '#0f766e') },
  { id: 'workflow-fabric', position: { x: 760, y: 220 }, data: { label: 'Workflow Activation Fabric', domain: 'Enterprise', subtitle: 'Vitis-linked remediation and approvals' }, style: nodeStyle('#f8fafc', '#475569') },
  { id: 'governance', position: { x: 760, y: 360 }, data: { label: 'Governance and Controls Overlay', domain: 'Enterprise', subtitle: 'Ficus-aligned policy and audit controls' }, style: nodeStyle('#fef2f2', '#b91c1c') },
  { id: 'laurus', position: { x: 1120, y: 110 }, data: { label: 'Laurus API Control Plane', domain: 'Enterprise', subtitle: 'Governed API exposure' }, style: nodeStyle('#eff6ff', '#1d4ed8') },
  { id: 'tilia', position: { x: 1120, y: 250 }, data: { label: 'Tilia Topology Registry', domain: 'Enterprise', subtitle: 'Service and dependency awareness' }, style: nodeStyle('#eef2ff', '#4338ca') },
  { id: 'salix', position: { x: 1120, y: 390 }, data: { label: 'Salix Observability Stream', domain: 'Enterprise', subtitle: 'Usage and audit telemetry' }, style: nodeStyle('#f8fafc', '#334155') },
]

const baseMapEdges: Edge[] = [
  edge('loan-repo', 'salvia-core', '#16a34a'),
  edge('collection-repo', 'salvia-core', '#ea580c'),
  edge('compliance-repo', 'salvia-core', '#2563eb'),
  edge('salvia-core', 'ai-broker', '#0f766e'),
  edge('salvia-core', 'workflow-fabric', '#475569'),
  edge('salvia-core', 'governance', '#b91c1c'),
  edge('ai-broker', 'laurus', '#0f766e'),
  edge('workflow-fabric', 'tilia', '#475569'),
  edge('governance', 'salix', '#b91c1c'),
  edge('tilia', 'ai-broker', '#4338ca'),
]

function getToneClasses(tone: Tone) {
  switch (tone) {
    case 'healthy':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    case 'warning':
      return 'border-amber-200 bg-amber-50 text-amber-700'
    case 'critical':
      return 'border-rose-200 bg-rose-50 text-rose-700'
    default:
      return 'border-slate-200 bg-slate-50 text-slate-700'
  }
}

function getStatusClasses(status: StatusTag) {
  if (status === 'Healthy' || status === 'Rising') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (status === 'Warning' || status === 'Restricted' || status === 'Declining') return 'bg-amber-50 text-amber-700 border-amber-200'
  return 'bg-rose-50 text-rose-700 border-rose-200'
}

function toggleMultiSelect<T extends string>(current: T[], value: T, options: readonly T[]) {
  const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
  return next.length === 0 ? [...options] : next
}

function cycleSort(sortState: SortState, key: string): SortState {
  if (sortState.key !== key) return { key, direction: 'asc' }
  if (sortState.direction === 'asc') return { key, direction: 'desc' }
  return { key: null, direction: 'asc' }
}

function sortCollection<T>(rows: T[], sortState: SortState, accessors: Record<string, (row: T) => string | number>) {
  if (!sortState.key) return rows
  const accessor = accessors[sortState.key]
  if (!accessor) return rows
  return [...rows].sort((left, right) => {
    const leftValue = accessor(left)
    const rightValue = accessor(right)
    if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      return sortState.direction === 'asc' ? leftValue - rightValue : rightValue - leftValue
    }
    const result = String(leftValue).localeCompare(String(rightValue))
    return sortState.direction === 'asc' ? result : -result
  })
}

function matchesSearch(row: unknown, query: string) {
  if (!query.trim()) return true
  return JSON.stringify(row).toLowerCase().includes(query.trim().toLowerCase())
}

function SortIcon({ sortState, column }: { sortState: SortState; column: string }) {
  if (sortState.key !== column) return <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
  return sortState.direction === 'asc' ? <ChevronUp className="h-3.5 w-3.5 text-slate-600" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-600" />
}

function StatusBadge({ status }: { status: StatusTag }) {
  return <Badge variant="outline" className={cn('rounded-full text-[11px] font-semibold', getStatusClasses(status))}>{status}</Badge>
}

function SectionCard({ title, description, children, className }: { title: string; description?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn('glass-card rounded-[28px] border border-white/60 bg-white/85 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl', className)}>
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
        {description ? <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
        <Search className="h-5 w-5 text-slate-400" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">{description}</p>
    </div>
  )
}

function FilterChipGroup<T extends string>({ label, options, selected, onToggle }: { label: string; options: readonly T[]; selected: T[]; onToggle: (value: T) => void }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option)
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={cn('rounded-full border px-3 py-1.5 text-xs font-semibold transition-all', active ? 'border-emerald-300 bg-emerald-50 text-emerald-700 shadow-sm' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700')}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function KpiSummaryCard({ card, onSelect }: { card: KpiCard; onSelect: (card: KpiCard) => void }) {
  const Icon = card.icon
  return (
    <button type="button" onClick={() => onSelect(card)} className="group relative overflow-hidden rounded-[28px] border border-white/70 bg-white/90 p-5 text-left shadow-[0_24px_80px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-0.5 hover:shadow-[0_28px_90px_rgba(15,23,42,0.12)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{card.label}</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{card.metric}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{card.description}</p>
          <div className={cn('mt-4 inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold', getToneClasses(card.tone))}>{card.trend}</div>
        </div>
        <div className={cn('relative flex h-12 w-12 items-center justify-center rounded-2xl border', getToneClasses(card.tone))}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <Icon className="pointer-events-none absolute -bottom-4 -right-4 h-24 w-24 text-slate-100 transition-transform duration-300 group-hover:scale-110" />
    </button>
  )
}

export function KnowledgeCommandCenterPage() {
  const { addToast } = useToast()
  const [activeSection, setActiveSection] = useState<WorkspaceSection>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(true)
  const [selectedStatuses, setSelectedStatuses] = useState<StatusTag[]>([...statusOptions])
  const [selectedScopes, setSelectedScopes] = useState<ScopeTag[]>([...scopeOptions])
  const [selectedAssets, setSelectedAssets] = useState<AssetTag[]>([...assetOptions])
  const [selectedIntegrations, setSelectedIntegrations] = useState<IntegrationTag[]>([...integrationOptions])
  const [selectedDomains, setSelectedDomains] = useState<DomainTag[]>([...domainOptions])
  const [selectedTimes, setSelectedTimes] = useState<TimeTag[]>([...timeOptions])
  const [expandedInsightId, setExpandedInsightId] = useState<string | null>(strategicInsights[0]?.id ?? null)
  const [drawer, setDrawer] = useState<DrawerState | null>({
    title: 'Enterprise Readiness Brief',
    subtitle: 'SALVIA is operating as the executive visibility layer for enterprise knowledge, with strongest posture in Customer, Loan, and Compliance domains.',
    tone: 'neutral',
    metrics: [
      { label: 'Executive attention domains', value: '2' },
      { label: 'Low-trust exposure', value: '3.9%' },
      { label: 'Active integration dependencies', value: '34' },
    ],
    bullets: [
      'Collections and Risk require accelerated remediation on outdated or restricted content paths consumed by AI.',
      'Cross-platform orchestration is healthy, but Tilia and Laurus synchronization now materially affects knowledge confidence.',
      'Published coverage and grounded answer performance remain strong enough for executive rollout across additional business functions.',
    ],
    actions: ['Open executive dashboard', 'Inspect risk posture', 'Review AI groundedness trend'],
  })
  const [executiveSort, setExecutiveSort] = useState<SortState>({ key: null, direction: 'asc' })
  const [riskSort, setRiskSort] = useState<SortState>({ key: null, direction: 'asc' })
  const [aiSort, setAiSort] = useState<SortState>({ key: null, direction: 'asc' })

  const filteredExecutiveRows = useMemo(() => {
    const rows = executiveRows.filter((row) => selectedStatuses.includes(row.status) && selectedScopes.includes(row.scope) && row.assetTags.some((tag) => selectedAssets.includes(tag)) && selectedIntegrations.includes(row.integrationState) && selectedDomains.includes(row.domain) && selectedTimes.includes(row.timeRange) && matchesSearch(row, searchQuery))
    return sortCollection(rows, executiveSort, {
      domain: (row) => row.domain,
      assetVolume: (row) => row.assetVolume,
      usageTrend: (row) => row.usageTrendValue,
      aiInteractionRate: (row) => row.aiInteractionRate,
      trustScore: (row) => row.trustScore,
      riskLevel: (row) => row.riskLevel,
      complianceStatus: (row) => row.complianceStatus,
      integrationCoverage: (row) => row.integrationCoverage,
      lastReviewed: (row) => row.lastReviewed,
      executiveStatus: (row) => row.executiveStatus,
    })
  }, [executiveSort, searchQuery, selectedAssets, selectedDomains, selectedIntegrations, selectedScopes, selectedStatuses, selectedTimes])

  const filteredRiskRows = useMemo(() => {
    const rows = riskRecords.filter((row) => selectedStatuses.includes(row.status) && selectedScopes.includes(row.scope) && row.assetTags.some((tag) => selectedAssets.includes(tag)) && selectedIntegrations.includes(row.integrationState) && selectedDomains.includes(row.affectedDomain) && selectedTimes.includes(row.timeRange) && matchesSearch(row, searchQuery))
    return sortCollection(rows, riskSort, {
      riskArea: (row) => row.riskArea,
      affectedDomain: (row) => row.affectedDomain,
      sensitiveAssetCount: (row) => row.sensitiveAssetCount,
      policyViolations: (row) => row.policyViolations,
      complianceStatus: (row) => row.complianceStatus,
      exceptionCount: (row) => row.exceptionCount,
      remediationProgress: (row) => row.remediationProgress,
      lastAuditEvent: (row) => row.lastAuditEvent,
      owner: (row) => row.owner,
      priority: (row) => row.priority,
    })
  }, [riskSort, searchQuery, selectedAssets, selectedDomains, selectedIntegrations, selectedScopes, selectedStatuses, selectedTimes])

  const filteredAiRows = useMemo(() => {
    const rows = aiPerformanceRecords.filter((row) => selectedStatuses.includes(row.status) && selectedScopes.includes(row.scope) && row.assetTags.some((tag) => selectedAssets.includes(tag)) && selectedIntegrations.includes(row.integrationState) && selectedDomains.includes(row.domain) && selectedTimes.includes(row.timeRange) && matchesSearch(row, searchQuery))
    return sortCollection(rows, aiSort, {
      assistant: (row) => row.assistant,
      knowledgeUsageVolume: (row) => row.knowledgeUsageVolume,
      groundedAnswerRate: (row) => row.groundedAnswerRate,
      citationCoverage: (row) => row.citationCoverage,
      summaryGenerationCount: (row) => row.summaryGenerationCount,
      synthesisUsage: (row) => row.synthesisUsage,
      trustIndicator: (row) => row.trustIndicator,
      domainCoverage: (row) => row.domainCoverage,
      status: (row) => row.status,
    })
  }, [aiSort, searchQuery, selectedAssets, selectedDomains, selectedIntegrations, selectedScopes, selectedStatuses, selectedTimes])

  const visibleMapNodes = useMemo(() => baseMapNodes.map((node) => {
    const domain = String(node.data?.domain ?? 'Enterprise')
    const label = String(node.data?.label ?? '')
    const matchesDomain = domain === 'Enterprise' || selectedDomains.includes(domain as DomainTag)
    const matchesQuery = !searchQuery.trim() || label.toLowerCase().includes(searchQuery.toLowerCase())
    return { ...node, hidden: !(matchesDomain && matchesQuery) }
  }), [searchQuery, selectedDomains])

  const visibleMapEdges = useMemo(() => {
    const hiddenNodes = new Set(visibleMapNodes.filter((node) => node.hidden).map((node) => node.id))
    return baseMapEdges.map((edgeItem) => ({ ...edgeItem, hidden: hiddenNodes.has(edgeItem.source) || hiddenNodes.has(edgeItem.target) }))
  }, [visibleMapNodes])

  const summary = useMemo(() => executiveRows.reduce((accumulator, row) => {
    accumulator.assets += row.assetVolume
    accumulator.averageTrust += row.trustScore
    accumulator.averageAiRate += row.aiInteractionRate
    return accumulator
  }, { assets: 0, averageTrust: 0, averageAiRate: 0 }), [])

  const filteredExecutiveAverageTrust = filteredExecutiveRows.length ? Math.round(filteredExecutiveRows.reduce((total, row) => total + row.trustScore, 0) / filteredExecutiveRows.length) : 0
  const filteredExecutiveAverageCoverage = filteredExecutiveRows.length ? Math.round(filteredExecutiveRows.reduce((total, row) => total + row.integrationCoverage, 0) / filteredExecutiveRows.length) : 0

  const handleExport = () => {
    addToast({
      title: 'Knowledge Command Center export prepared',
      description: `An executive package has been staged for ${workspaceItems.find((item) => item.key === activeSection)?.label ?? 'Overview'}.`,
      variant: 'success',
    })
  }

  const openDrawer = (state: DrawerState) => setDrawer(state)

  const handleKpiSelect = (card: KpiCard) => {
    setActiveSection(card.targetSection)
    openDrawer({
      title: card.label,
      subtitle: card.description,
      tone: card.tone,
      metrics: [
        { label: 'Metric', value: card.metric },
        { label: 'Trend', value: card.trend },
        { label: 'Target workspace', value: workspaceItems.find((item) => item.key === card.targetSection)?.label ?? 'Overview' },
      ],
      bullets: [
        'This KPI is designed for executive drill-down rather than simple scorecard consumption.',
        'Use the related workspace to inspect domain, integration, trust, and governance drivers behind this signal.',
        'Current values are drawn from realistic sample data aligned with enterprise knowledge control tower scenarios.',
      ],
      actions: ['Open supporting workspace', 'Export executive summary', 'Trace contributing signals'],
    })
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <SectionCard title="Enterprise Knowledge Trend" description="Strategic visibility over enterprise asset growth, publication readiness, grounded AI performance, and activation intensity.">
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={knowledgeTrendSeries}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="period" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis yAxisId="left" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="assets" fill="#bbf7d0" stroke="#059669" fillOpacity={0.35} name="Knowledge assets" />
                <Line yAxisId="right" type="monotone" dataKey="publishedCoverage" stroke="#0f766e" strokeWidth={2.4} dot={false} name="Published coverage" />
                <Line yAxisId="right" type="monotone" dataKey="groundedRate" stroke="#1d4ed8" strokeWidth={2.4} dot={false} name="AI-grounded answer rate" />
                <Bar yAxisId="right" dataKey="activationEvents" fill="#f59e0b" radius={[8, 8, 0, 0]} name="Activation events" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Strategic Insight Blocks" description="Decision-ready narrative for executive and governance leaders.">
          <div className="space-y-3">
            {strategicInsights.map((insight) => {
              const expanded = expandedInsightId === insight.id
              return (
                <button key={insight.id} type="button" onClick={() => setExpandedInsightId(expanded ? null : insight.id)} className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-left transition-colors hover:border-slate-300 hover:bg-white">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{insight.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{insight.summary}</p>
                    </div>
                    <ChevronRight className={cn('mt-0.5 h-4 w-4 text-slate-400 transition-transform', expanded && 'rotate-90')} />
                  </div>
                  {expanded ? <p className="mt-3 border-t border-slate-200 pt-3 text-sm leading-6 text-slate-600">{insight.detail}</p> : null}
                </button>
              )
            })}
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Knowledge lifecycle health</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">88.6%</p>
                <p className="mt-2 text-sm text-slate-600">Lifecycle control is strongest where stewardship and review SLAs are fully assigned.</p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">Executive attention signal</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">2 domains</p>
                <p className="mt-2 text-sm text-slate-600">Risk and Collection are consuming the largest share of exception and stale-content remediation effort.</p>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <SectionCard title="Knowledge Status Distribution" description="Enterprise asset visibility from creation to operational usage.">
          <div className="grid gap-3">
            {[
              { label: 'Published', value: '82.4%', detail: 'Assets meeting publication and stewardship criteria.' },
              { label: 'Draft', value: '9.8%', detail: 'Knowledge currently under authoring or approval workflow.' },
              { label: 'Archived', value: '4.3%', detail: 'Assets retained for traceability and historical reference.' },
              { label: 'Sensitive', value: '3.5%', detail: 'Restricted assets governed by controlled retrieval policies.' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                  <p className="text-lg font-semibold text-slate-950">{item.value}</p>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">{item.detail}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="AI Performance Snapshot" description="Executive view of AI knowledge quality and scale.">
          <div className="space-y-3">
            {[
              { title: 'Grounded answers', value: '91.8%', detail: 'Answers backed by governed knowledge.' },
              { title: 'Citation coverage', value: '95.0%', detail: 'Responses with usable evidence links.' },
              { title: 'Multi-document synthesis', value: '1,710 / week', detail: 'High-value synthesis sessions.' },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-2xl font-semibold text-slate-950">{item.value}</p>
                <p className="mt-2 text-xs leading-5 text-slate-500">{item.detail}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Risk and Compliance" description="Control exposure summary for restricted, stale, and low-trust content.">
          <div className="space-y-3">
            <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-700">Open exceptions</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">11</p>
              <p className="mt-2 text-xs leading-5 text-slate-600">Two high-priority clusters are concentrated in Risk and Collection domains.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Audit readiness</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">96.1%</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">Monthly evidence packs are passing in most domains, with exception remediation underway.</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Integration Health" description="Cross-platform orchestration posture and dependency health.">
          <div className="space-y-3">
            {integrationHealthCards.slice(0, 2).map((card) => (
              <div key={card.title} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{card.title}</p>
                  <p className="text-lg font-semibold text-slate-950">{card.value}</p>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">{card.detail}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Recent Strategic Signals and Events" description="A curated executive timeline of meaningful shifts across the knowledge operating model.">
          <div className="space-y-4">
            {executiveTimeline.map((event) => (
              <button key={event.id} type="button" onClick={() => openDrawer({ title: event.title, subtitle: event.detail, tone: event.tone, metrics: [{ label: 'Timestamp', value: event.timestamp }, { label: 'Signal tone', value: event.tone }], bullets: [event.detail, 'This event is surfaced because it affects strategic knowledge trust, risk, or activation posture.'], actions: ['Inspect affected domain', 'Review control detail', 'Export event summary'] })} className="flex w-full items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-slate-300 hover:bg-slate-50">
                <div className={cn('mt-1 h-3 w-3 rounded-full', event.tone === 'healthy' ? 'bg-emerald-500' : event.tone === 'warning' ? 'bg-amber-500' : event.tone === 'critical' ? 'bg-rose-500' : 'bg-slate-400')} />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                    <span className="text-xs text-slate-400">{event.timestamp}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{event.detail}</p>
                </div>
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Integration Health Overview" description="Connected systems and orchestration readiness across the broader enterprise ecosystem.">
          <div className="grid gap-3 md:grid-cols-2">
            {integrationHealthCards.map((card) => (
              <div key={card.title} className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{card.title}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{card.value}</p>
                <p className="mt-2 text-xs leading-5 text-slate-500">{card.detail}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  )

  const renderExecutiveDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard title="Domain Performance Cards" description="High-level domain health, trust, and integration posture for executive monitoring.">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredExecutiveRows.slice(0, 6).map((row) => (
              <button key={row.id} type="button" onClick={() => openDrawer({ title: `${row.domain} domain insight`, subtitle: `${row.businessFunction} is currently showing ${row.executiveStatus.toLowerCase()} with ${row.trustScore}% trust and ${row.integrationCoverage}% integration coverage.`, tone: row.status === 'Critical' ? 'critical' : row.status === 'Warning' || row.status === 'Declining' ? 'warning' : 'healthy', metrics: [{ label: 'Asset volume', value: row.assetVolume.toLocaleString() }, { label: 'AI interaction rate', value: `${row.aiInteractionRate}%` }, { label: 'Trust score', value: `${row.trustScore}%` }, { label: 'Compliance status', value: row.complianceStatus }], bullets: [`${row.owner} is the current stewardship lead for this domain.`, `Usage trend is ${row.usageTrend.toLowerCase()} and should be interpreted with current risk level ${row.riskLevel.toLowerCase()}.`, 'Domain drill-down should be used to trace weak assets, rising AI demand, and integration constraints.'], actions: ['Open domain insight', 'View strategic trend', 'Inspect risk posture'] })} className="rounded-[24px] border border-slate-200 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{row.domain}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{row.businessFunction}</p>
                  </div>
                  <StatusBadge status={row.status} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Asset volume</p><p className="mt-1 font-semibold text-slate-950">{row.assetVolume.toLocaleString()}</p></div>
                  <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Trust score</p><p className="mt-1 font-semibold text-slate-950">{row.trustScore}%</p></div>
                  <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs text-slate-500">AI interaction</p><p className="mt-1 font-semibold text-slate-950">{row.aiInteractionRate}%</p></div>
                  <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Integrations</p><p className="mt-1 font-semibold text-slate-950">{row.integrationCoverage}%</p></div>
                </div>
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Cross-domain Leaderboard" description="Domains ranked by trust posture and executive readiness.">
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={domainLeaderboard} layout="vertical" margin={{ left: 0, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis type="category" dataKey="domain" tickLine={false} axisLine={false} tick={{ fill: '#0f172a', fontSize: 12 }} width={90} />
                <Tooltip />
                <Bar dataKey="value" radius={[10, 10, 10, 10]}>
                  {domainLeaderboard.map((entry) => <Cell key={entry.domain} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">Customer, Compliance, and Loan remain the strongest domains for executive rollout because they combine high trust, strong integration coverage, and current review evidence.</div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard title="Trust and Usage Matrix" description="Compare usage intensity against domain trust posture to focus executive attention.">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {trustUsageMatrix.map((cell) => {
              const background = cell.trust >= 94 ? 'bg-emerald-50' : cell.trust >= 88 ? 'bg-amber-50' : 'bg-rose-50'
              return (
                <button key={cell.domain} type="button" onClick={() => {
                  const row = executiveRows.find((item) => item.domain === cell.domain)
                  if (!row) return
                  openDrawer({ title: `${cell.domain} comparison matrix`, subtitle: `${cell.domain} is operating at ${cell.usage}% usage intensity with ${cell.trust}% trust.`, tone: cell.trust >= 94 ? 'healthy' : cell.trust >= 88 ? 'warning' : 'critical', metrics: [{ label: 'Usage intensity', value: `${cell.usage}%` }, { label: 'Trust score', value: `${cell.trust}%` }, { label: 'Integration coverage', value: `${row.integrationCoverage}%` }], bullets: [`${row.businessFunction} is the current dominant use case in this domain.`, 'Compare this domain against Risk and Collection when prioritizing remediation investment.'], actions: ['Open domain insight', 'Compare against peers', 'View AI usage summary'] })
                }} className={cn('rounded-3xl border border-slate-200 p-4 text-left transition-colors hover:border-slate-300', background)}>
                  <p className="text-sm font-semibold text-slate-900">{cell.domain}</p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div><p className="text-xs text-slate-500">Trust</p><p className="mt-1 text-2xl font-semibold text-slate-950">{cell.trust}%</p></div>
                    <div><p className="text-xs text-slate-500">Usage</p><p className="mt-1 text-2xl font-semibold text-slate-950">{cell.usage}%</p></div>
                  </div>
                </button>
              )
            })}
          </div>
        </SectionCard>

        <SectionCard title="Executive Insight Panel" description="Strategic interpretation of current filtered domain signals.">
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Filtered domain average trust</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{filteredExecutiveAverageTrust}%</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">The current filter context indicates how much of the knowledge estate remains executive-ready for AI and workflow activation.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Filtered integration coverage</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{filteredExecutiveAverageCoverage}%</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Low integration coverage usually means weak downstream knowledge activation visibility rather than low repository scale.</p>
            </div>
            <div className="rounded-3xl border border-amber-200 bg-amber-50/80 p-4 text-sm leading-6 text-slate-700">Executive attention remains most justified where declining trust and rising AI consumption intersect. In the current sample, that is concentrated in Collection and Risk.</div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Executive Summary Grid" description="Primary strategic monitoring table for enterprise knowledge leadership.">
        {filteredExecutiveRows.length === 0 ? <EmptyState title="No domains match the current executive filters" description="Adjust status, scope, domain, or asset filters to restore domain-level strategic visibility." /> : (
          <div className="overflow-hidden rounded-3xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-white/90 backdrop-blur">
                  <tr>
                    {[
                      ['domain', 'Knowledge domain'], ['assetVolume', 'Asset volume'], ['usageTrend', 'Usage trend'], ['aiInteractionRate', 'AI interaction rate'], ['trustScore', 'Trust score'], ['riskLevel', 'Risk level'], ['complianceStatus', 'Compliance status'], ['integrationCoverage', 'Integration coverage'], ['lastReviewed', 'Last reviewed'], ['executiveStatus', 'Executive status'],
                    ].map(([key, label]) => (
                      <th key={key} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        <button type="button" className="inline-flex items-center gap-1.5" onClick={() => setExecutiveSort((current) => cycleSort(current, key))}>{label}<SortIcon sortState={executiveSort} column={key} /></button>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredExecutiveRows.map((row) => (
                    <tr key={row.id} className="align-top transition-colors hover:bg-slate-50/80">
                      <td className="px-4 py-4"><div><p className="font-semibold text-slate-900">{row.domain}</p><p className="mt-1 text-xs text-slate-500">{row.businessFunction}</p></div></td>
                      <td className="px-4 py-4 font-medium text-slate-700">{row.assetVolume.toLocaleString()}</td>
                      <td className="px-4 py-4"><div className="flex items-center gap-2"><StatusBadge status={row.status} /><span className="text-xs text-slate-500">{row.usageTrendValue > 0 ? `+${row.usageTrendValue}%` : `${row.usageTrendValue}%`}</span></div></td>
                      <td className="px-4 py-4 font-medium text-slate-700">{row.aiInteractionRate}%</td>
                      <td className="px-4 py-4 font-medium text-slate-700">{row.trustScore}%</td>
                      <td className="px-4 py-4 text-slate-700">{row.riskLevel}</td>
                      <td className="px-4 py-4 text-slate-700">{row.complianceStatus}</td>
                      <td className="px-4 py-4 font-medium text-slate-700">{row.integrationCoverage}%</td>
                      <td className="px-4 py-4 text-slate-700">{row.lastReviewed}</td>
                      <td className="px-4 py-4"><Badge variant="outline" className="rounded-full border-slate-200 bg-slate-50 text-slate-700">{row.executiveStatus}</Badge></td>
                      <td className="px-4 py-4"><div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => openDrawer({ title: `${row.domain} domain insight`, subtitle: `${row.businessFunction} currently sits at ${row.trustScore}% trust with ${row.aiInteractionRate}% AI interaction rate.`, tone: row.status === 'Critical' ? 'critical' : row.status === 'Warning' || row.status === 'Declining' ? 'warning' : 'healthy', metrics: [{ label: 'Owner', value: row.owner }, { label: 'Risk level', value: row.riskLevel }, { label: 'Integration coverage', value: `${row.integrationCoverage}%` }], bullets: ['Use this view to investigate performance, trust, and governance drivers in one place.', 'This domain is part of the strategic enterprise monitoring layer, not a local operational dashboard.'], actions: ['Open domain insight', 'View strategic trend', 'Inspect risk posture'] })}>Open Domain Insight</Button><Button variant="ghost" size="sm" onClick={() => openDrawer({ title: `${row.domain} strategic trend`, subtitle: `${row.usageTrend} usage and ${row.executiveStatus.toLowerCase()} posture require contextual review.`, tone: 'neutral', metrics: [{ label: 'Usage delta', value: `${row.usageTrendValue > 0 ? '+' : ''}${row.usageTrendValue}%` }, { label: 'Last reviewed', value: row.lastReviewed }], bullets: ['Trend review should be paired with asset freshness and AI groundedness evidence.', 'Use comparison with peer domains to determine whether this signal is structural or isolated.'], actions: ['Compare domains', 'Open AI usage summary', 'Export executive summary'] })}>View Strategic Trend</Button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  )

  const renderKnowledgeMap = () => (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <SectionCard title="Enterprise-wide Knowledge Map" description="Connected visibility across repositories, AI consumers, workflow activations, and governance overlays.">
          <div className="h-[620px] overflow-hidden rounded-[24px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.10),_transparent_30%),linear-gradient(180deg,_rgba(248,250,252,0.96),_rgba(255,255,255,0.98))]">
            <ReactFlow nodes={visibleMapNodes} edges={visibleMapEdges} fitView minZoom={0.4} maxZoom={1.4} onNodeClick={(_, node) => openDrawer({ title: String(node.data?.label ?? 'Knowledge node'), subtitle: String(node.data?.subtitle ?? 'Enterprise knowledge orchestration node.'), tone: String(node.data?.domain ?? 'Enterprise') === 'Collection' ? 'warning' : 'neutral', metrics: [{ label: 'Node domain', value: String(node.data?.domain ?? 'Enterprise') }, { label: 'Connected edges', value: String(visibleMapEdges.filter((edgeItem) => edgeItem.source === node.id || edgeItem.target === node.id).length) }], bullets: ['Use this node to trace upstream repositories, downstream AI consumers, workflow connections, and governance overlays.', 'The map is intended to surface cross-platform dependency awareness, not just repository topology.'], actions: ['Open domain node', 'Trace knowledge flow', 'Inspect integration path'] })}>
              <MiniMap zoomable pannable nodeColor={(node) => String(node.data?.domain ?? '') === 'Collection' ? '#ea580c' : String(node.data?.domain ?? '') === 'Compliance' ? '#2563eb' : '#059669'} />
              <Controls />
              <Background gap={20} size={1.2} color="#dbeafe" />
            </ReactFlow>
          </div>
        </SectionCard>

        <SectionCard title="Map Intelligence" description="Cluster-level reading of the current enterprise flow topology.">
          <div className="space-y-4">
            {[
              { title: 'Ownership clusters', value: '24', detail: 'Knowledge stewardship remains concentrated across 24 active enterprise ownership clusters.' },
              { title: 'Activation nodes', value: '19', detail: 'AI systems, workflow controls, and business consumers currently draw from governed knowledge pathways.' },
              { title: 'Risk overlays', value: '6', detail: 'Restricted, stale, or low-trust overlays are being applied to the most exposed nodes and edges.' },
              { title: 'Upstream and downstream paths', value: '43', detail: 'Orchestrated knowledge movement is visible from source curation to operational consumption.' },
            ].map((item) => <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{item.title}</p><p className="mt-2 text-2xl font-semibold text-slate-950">{item.value}</p><p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p></div>)}
            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 text-sm leading-6 text-slate-600">The current topology makes it clear that SALVIA is operating as a command layer across repository health, AI usage, workflow activation, and governance enforcement rather than as a standalone repository application.</div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          { title: 'Platform connection graph', value: '12 linked systems', detail: 'Connected platforms carry source, contract, workflow, and telemetry context into SALVIA.' },
          { title: 'Knowledge flow path lines', value: '43 visible paths', detail: 'Pathways expose how knowledge moves from repository origin to operational usage.' },
          { title: 'Ownership overlays', value: '24 clusters', detail: 'Ownership coverage remains visible across domain, platform, and governance operating models.' },
          { title: 'Mini-map readiness', value: 'Enabled', detail: 'Leadership can reposition and inspect orchestration patterns without losing enterprise context.' },
        ].map((item) => <SectionCard key={item.title} title={item.title}><p className="text-2xl font-semibold text-slate-950">{item.value}</p><p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p></SectionCard>)}
      </div>
    </div>
  )

  const renderRiskCompliance = () => (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard title="Compliance Trend" description="Executive movement in control passing rates, open exceptions, and remediation throughput.">
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={complianceTrendSeries}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="period" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="exceptions" fill="#f97316" radius={[10, 10, 0, 0]} name="Exceptions" />
                <Line type="monotone" dataKey="passing" stroke="#15803d" strokeWidth={2.5} dot={false} name="Passing controls" />
                <Line type="monotone" dataKey="remediation" stroke="#2563eb" strokeWidth={2.5} dot={false} name="Remediation progress" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Policy Status Cards" description="Focused reading of risk severity, exception concentration, and audit readiness.">
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { title: 'Restricted exposure', value: '3,276 assets', detail: 'Restricted and sensitive assets under controlled retrieval.', tone: 'warning' },
              { title: 'High-risk alerts', value: '2 clusters', detail: 'Risk and Collection remain the main executive attention areas.', tone: 'critical' },
              { title: 'Classification coverage', value: '97.3%', detail: 'Enterprise classification is broadly in place, with targeted remediation required.', tone: 'healthy' },
              { title: 'Audit readiness', value: '96.1%', detail: 'Audit evidence remains strong with manageable open exceptions.', tone: 'healthy' },
            ].map((card) => <div key={card.title} className={cn('rounded-3xl border p-4', getToneClasses(card.tone as Tone))}><p className="text-xs font-semibold uppercase tracking-[0.14em]">{card.title}</p><p className="mt-2 text-2xl font-semibold text-slate-950">{card.value}</p><p className="mt-2 text-sm leading-6 text-slate-600">{card.detail}</p></div>)}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard title="Exception Summary and Remediation Progress" description="Readiness of current remediation streams against policy and audit expectations.">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredRiskRows.slice(0, 3).map((row) => (
              <button key={row.id} type="button" onClick={() => openDrawer({ title: row.riskArea, subtitle: `${row.affectedDomain} has ${row.exceptionCount} active exceptions and ${row.remediationProgress}% remediation progress.`, tone: row.priority === 'High' ? 'critical' : row.priority === 'Moderate' ? 'warning' : 'neutral', metrics: [{ label: 'Sensitive assets', value: row.sensitiveAssetCount.toLocaleString() }, { label: 'Policy violations', value: row.policyViolations.toLocaleString() }, { label: 'Owner', value: row.owner }], bullets: [`Current compliance posture: ${row.complianceStatus}.`, 'Open this record to inspect policy mapping, exception evidence, and remediation sequencing.'], actions: ['Open risk detail', 'Inspect policy exception', 'Review sensitive asset exposure'] })} className="rounded-3xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-slate-300 hover:bg-slate-50">
                <div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold text-slate-900">{row.riskArea}</p><StatusBadge status={row.status} /></div>
                <div className="mt-4 h-2 rounded-full bg-slate-100"><div className={cn('h-2 rounded-full', row.remediationProgress >= 80 ? 'bg-emerald-500' : row.remediationProgress >= 60 ? 'bg-amber-500' : 'bg-rose-500')} style={{ width: `${row.remediationProgress}%` }} /></div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500"><span>{row.affectedDomain}</span><span>{row.remediationProgress}% complete</span></div>
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="High-risk Alert Drawer" description="Focused alert summary for priority governance and protection concerns.">
          <div className="space-y-4">
            {filteredRiskRows.filter((row) => row.priority === 'High').slice(0, 3).map((row) => (
              <div key={row.id} className="rounded-3xl border border-rose-200 bg-rose-50/80 p-4"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-slate-900">{row.riskArea}</p><Badge variant="outline" className="rounded-full border-rose-200 bg-white text-rose-700">{row.priority}</Badge></div><p className="mt-2 text-sm leading-6 text-slate-600">{row.policyViolations} policy violations remain active with {row.exceptionCount} open exceptions.</p></div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Risk and Compliance Table" description="Executive monitoring of governance, protection, and compliance posture by risk area.">
        {filteredRiskRows.length === 0 ? <EmptyState title="No risk records match the current filters" description="Adjust status, governance scope, domain, or time filters to restore executive risk visibility." /> : (
          <div className="overflow-hidden rounded-3xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-white/90 backdrop-blur">
                  <tr>
                    {[
                      ['riskArea', 'Risk area'], ['affectedDomain', 'Affected domain'], ['sensitiveAssetCount', 'Sensitive assets'], ['policyViolations', 'Policy violations'], ['complianceStatus', 'Compliance status'], ['exceptionCount', 'Exception count'], ['remediationProgress', 'Remediation progress'], ['lastAuditEvent', 'Last audit event'], ['owner', 'Owner'], ['priority', 'Priority'],
                    ].map(([key, label]) => <th key={key} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"><button type="button" className="inline-flex items-center gap-1.5" onClick={() => setRiskSort((current) => cycleSort(current, key))}>{label}<SortIcon sortState={riskSort} column={key} /></button></th>)}
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredRiskRows.map((row) => (
                    <tr key={row.id} className="align-top transition-colors hover:bg-slate-50/80">
                      <td className="px-4 py-4 font-medium text-slate-900">{row.riskArea}</td>
                      <td className="px-4 py-4 text-slate-700">{row.affectedDomain}</td>
                      <td className="px-4 py-4 text-slate-700">{row.sensitiveAssetCount.toLocaleString()}</td>
                      <td className="px-4 py-4 text-slate-700">{row.policyViolations}</td>
                      <td className="px-4 py-4 text-slate-700">{row.complianceStatus}</td>
                      <td className="px-4 py-4 text-slate-700">{row.exceptionCount}</td>
                      <td className="px-4 py-4"><div className="min-w-[120px]"><div className="h-2 rounded-full bg-slate-100"><div className={cn('h-2 rounded-full', row.remediationProgress >= 80 ? 'bg-emerald-500' : row.remediationProgress >= 60 ? 'bg-amber-500' : 'bg-rose-500')} style={{ width: `${row.remediationProgress}%` }} /></div><p className="mt-1 text-xs text-slate-500">{row.remediationProgress}%</p></div></td>
                      <td className="px-4 py-4 text-slate-700">{row.lastAuditEvent}</td>
                      <td className="px-4 py-4 text-slate-700">{row.owner}</td>
                      <td className="px-4 py-4"><Badge variant="outline" className={cn('rounded-full', row.priority === 'High' ? 'border-rose-200 bg-rose-50 text-rose-700' : row.priority === 'Moderate' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-slate-200 bg-slate-50 text-slate-700')}>{row.priority}</Badge></td>
                      <td className="px-4 py-4"><div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => openDrawer({ title: row.riskArea, subtitle: `${row.affectedDomain} risk posture is currently ${row.complianceStatus.toLowerCase()}.`, tone: row.priority === 'High' ? 'critical' : row.priority === 'Moderate' ? 'warning' : 'neutral', metrics: [{ label: 'Sensitive assets', value: row.sensitiveAssetCount.toLocaleString() }, { label: 'Exception count', value: String(row.exceptionCount) }, { label: 'Last audit event', value: row.lastAuditEvent }], bullets: ['The remediation stream should be reviewed together with policy exceptions and AI exposure paths.', 'Use export for audit committees, governance leaders, and executive reviews.'], actions: ['Open risk detail', 'Open remediation progress', 'Export governance summary'] })}>Open Risk Detail</Button><Button variant="ghost" size="sm" onClick={() => openDrawer({ title: `${row.affectedDomain} compliance mapping`, subtitle: `${row.policyViolations} policy violations are contributing to this record.`, tone: 'warning', metrics: [{ label: 'Compliance status', value: row.complianceStatus }, { label: 'Policy violations', value: String(row.policyViolations) }], bullets: ['Inspect policy mapping to understand whether the issue is classification, access, staleness, or AI grounding related.'], actions: ['View compliance mapping', 'Inspect policy exception', 'Review sensitive asset exposure'] })}>View Compliance Mapping</Button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  )

  const renderAiPanel = () => (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Grounded-answer Trend" description="Strategic reading of groundedness, citation coverage, and multi-document synthesis use across AI consumers.">
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={groundedTrendSeries}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="period" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="grounded" stroke="#0f766e" strokeWidth={2.5} dot={false} name="Grounded answer rate" />
                <Line type="monotone" dataKey="citations" stroke="#2563eb" strokeWidth={2.5} dot={false} name="Citation coverage" />
                <Area type="monotone" dataKey="synthesis" stroke="#f59e0b" fill="#fde68a" fillOpacity={0.35} name="Synthesis usage" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Citation Coverage Cards" description="Executive summary of evidence quality and top AI usage patterns.">
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { title: 'Average citation coverage', value: '95.0%', detail: 'Most executive-grade answers include direct evidence support.' },
              { title: 'Trusted AI consumers', value: '4 of 5', detail: 'Four major AI consumers remain within managed trust thresholds.' },
              { title: 'Low-trust exposure', value: '3.9%', detail: 'Restricted or stale content is contributing to limited low-trust answer paths.' },
              { title: 'Summary generation', value: '24,490', detail: 'AI knowledge summarization remains an active operational capability.' },
            ].map((card) => <div key={card.title} className="rounded-3xl border border-slate-200 bg-white p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{card.title}</p><p className="mt-2 text-2xl font-semibold text-slate-950">{card.value}</p><p className="mt-2 text-sm leading-6 text-slate-600">{card.detail}</p></div>)}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard title="Top Referenced Asset Leaderboard" description="Knowledge assets most frequently cited in AI-driven business interactions.">
          <div className="space-y-3">
            {[
              { asset: 'Retail loan exception handbook', references: 8420, domain: 'Loan' },
              { asset: 'Collections hardship matrix', references: 7955, domain: 'Collection' },
              { asset: 'Regulatory obligation register', references: 7120, domain: 'Compliance' },
              { asset: 'Customer dispute resolution SOP', references: 6880, domain: 'Customer' },
            ].map((item, index) => (
              <div key={item.asset} className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-4"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 font-semibold text-slate-700">{index + 1}</div><div className="flex-1"><p className="text-sm font-semibold text-slate-900">{item.asset}</p><p className="mt-1 text-xs text-slate-500">{item.domain}</p></div><div className="text-right"><p className="text-lg font-semibold text-slate-950">{item.references.toLocaleString()}</p><p className="text-xs text-slate-500">references</p></div></div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Assistant Comparison View" description="Relative trust and usage across current AI consumers.">
          <div className="space-y-4">
            {filteredAiRows.slice(0, 4).map((row) => (
              <button key={row.id} type="button" onClick={() => openDrawer({ title: row.assistant, subtitle: `${row.model} is currently operating at ${row.groundedAnswerRate}% groundedness and ${row.citationCoverage}% citation coverage.`, tone: row.status === 'Critical' ? 'critical' : row.status === 'Warning' ? 'warning' : 'healthy', metrics: [{ label: 'Knowledge usage', value: row.knowledgeUsageVolume.toLocaleString() }, { label: 'Grounded answer rate', value: `${row.groundedAnswerRate}%` }, { label: 'Citation coverage', value: `${row.citationCoverage}%` }], bullets: [`Top referenced assets currently include ${row.topReferencedAssets.slice(0, 2).join(' and ')}.`, 'Use this view to compare groundedness, evidence posture, and multi-document synthesis quality across assistants.'], actions: ['Open AI performance detail', 'Inspect citation coverage', 'Compare AI consumers'] })} className="w-full rounded-3xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-slate-300 hover:bg-slate-50">
                <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold text-slate-900">{row.assistant}</p><p className="mt-1 text-xs text-slate-500">{row.model}</p></div><StatusBadge status={row.status} /></div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-sm"><div><p className="text-xs text-slate-500">Grounded</p><p className="mt-1 font-semibold text-slate-950">{row.groundedAnswerRate}%</p></div><div><p className="text-xs text-slate-500">Citations</p><p className="mt-1 font-semibold text-slate-950">{row.citationCoverage}%</p></div><div><p className="text-xs text-slate-500">Usage</p><p className="mt-1 font-semibold text-slate-950">{row.knowledgeUsageVolume.toLocaleString()}</p></div></div>
              </button>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="AI Performance Table" description="Strategic monitoring of knowledge performance when consumed by AI assistants, models, and decision services.">
        {filteredAiRows.length === 0 ? <EmptyState title="No AI performance records match the current filters" description="Adjust AI scope, domain, integration, or status filters to restore AI knowledge performance visibility." /> : (
          <div className="overflow-hidden rounded-3xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-white/90 backdrop-blur">
                  <tr>
                    {[
                      ['assistant', 'AI assistant or model'], ['knowledgeUsageVolume', 'Knowledge usage volume'], ['groundedAnswerRate', 'Grounded answer rate'], ['citationCoverage', 'Citation coverage'], ['summaryGenerationCount', 'Summary generation'], ['synthesisUsage', 'Synthesis usage'], ['trustIndicator', 'Trust indicator'], ['domainCoverage', 'Domain coverage'], ['status', 'Status'],
                    ].map(([key, label]) => <th key={key} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"><button type="button" className="inline-flex items-center gap-1.5" onClick={() => setAiSort((current) => cycleSort(current, key))}>{label}<SortIcon sortState={aiSort} column={key} /></button></th>)}
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredAiRows.map((row) => (
                    <tr key={row.id} className="align-top transition-colors hover:bg-slate-50/80">
                      <td className="px-4 py-4"><div><p className="font-semibold text-slate-900">{row.assistant}</p><p className="mt-1 text-xs text-slate-500">{row.model}</p></div></td>
                      <td className="px-4 py-4 text-slate-700">{row.knowledgeUsageVolume.toLocaleString()}</td>
                      <td className="px-4 py-4 text-slate-700">{row.groundedAnswerRate}%</td>
                      <td className="px-4 py-4 text-slate-700">{row.citationCoverage}%</td>
                      <td className="px-4 py-4 text-slate-700">{row.summaryGenerationCount.toLocaleString()}</td>
                      <td className="px-4 py-4 text-slate-700">{row.synthesisUsage.toLocaleString()}</td>
                      <td className="px-4 py-4 text-slate-700">{row.trustIndicator}</td>
                      <td className="px-4 py-4 text-slate-700">{row.domainCoverage}</td>
                      <td className="px-4 py-4"><StatusBadge status={row.status} /></td>
                      <td className="px-4 py-4"><div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => openDrawer({ title: row.assistant, subtitle: `${row.model} is producing ${row.groundedAnswerRate}% groundedness with ${row.citationCoverage}% citation coverage.`, tone: row.status === 'Critical' ? 'critical' : row.status === 'Warning' ? 'warning' : 'healthy', metrics: [{ label: 'Usage volume', value: row.knowledgeUsageVolume.toLocaleString() }, { label: 'Summary generation', value: row.summaryGenerationCount.toLocaleString() }, { label: 'Synthesis usage', value: row.synthesisUsage.toLocaleString() }], bullets: [`Key knowledge assets: ${row.topReferencedAssets.join(', ')}.`, 'This workspace is intended to explain not just performance level, but the trust and governance quality of AI knowledge consumption.'], actions: ['Open AI performance detail', 'View referenced knowledge', 'Open groundedness trend'] })}>Open AI Performance Detail</Button><Button variant="ghost" size="sm" onClick={() => openDrawer({ title: `${row.assistant} citation coverage`, subtitle: `${row.citationCoverage}% of monitored answers currently provide citation support.`, tone: 'neutral', metrics: [{ label: 'Citation coverage', value: `${row.citationCoverage}%` }, { label: 'Trust indicator', value: row.trustIndicator }], bullets: ['Citation inspection should focus on restricted assets, stale knowledge, and synthesis paths crossing multiple repositories.'], actions: ['Inspect citation coverage', 'Compare AI consumers', 'Export AI knowledge metrics'] })}>Inspect Citation Coverage</Button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'executive': return renderExecutiveDashboard()
      case 'map': return renderKnowledgeMap()
      case 'risk': return renderRiskCompliance()
      case 'ai': return renderAiPanel()
      default: return renderOverview()
    }
  }

  return (
    <div className="relative space-y-6 pb-10">
      <Breadcrumb items={[{ label: 'Knowledge Command Center' }]} />
      <PageHeader
        title="Knowledge Command Center"
        description="Executive enterprise control tower for end-to-end knowledge visibility, AI knowledge performance, governance posture, and cross-platform orchestration across SALVIA."
        right={<div className="flex items-center gap-2"><Button variant="ghost" size="icon" className={cn('h-10 w-10 rounded-xl border border-slate-200 bg-white', showFilters && 'border-emerald-300 bg-emerald-50 text-emerald-700')} aria-label="Hide Search & Filters panel" title="Hide Search & Filters panel" onClick={() => setShowFilters((current) => !current)}><Filter className="h-5 w-5" strokeWidth={2} /></Button><Button variant="outline" className="h-10 rounded-xl px-4" onClick={handleExport}><Download className="mr-2 h-4 w-4" />Export</Button></div>}
      />

      {showFilters ? (
        <section className="glass-card rounded-[28px] border border-white/70 bg-white/90 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="grid gap-4">
            <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search knowledge domain, platform, AI model, risk category, control, integration, asset type, business function, owner, or trend topic" className="h-10 w-full rounded-xl border-slate-200 bg-white pl-9 text-sm" /></div>
            <div className="grid gap-4 xl:grid-cols-2">
              <FilterChipGroup label="Status" options={statusOptions} selected={selectedStatuses} onToggle={(value) => setSelectedStatuses(toggleMultiSelect(selectedStatuses, value, statusOptions))} />
              <FilterChipGroup label="Scope" options={scopeOptions} selected={selectedScopes} onToggle={(value) => setSelectedScopes(toggleMultiSelect(selectedScopes, value, scopeOptions))} />
              <FilterChipGroup label="Asset" options={assetOptions} selected={selectedAssets} onToggle={(value) => setSelectedAssets(toggleMultiSelect(selectedAssets, value, assetOptions))} />
              <FilterChipGroup label="Integration" options={integrationOptions} selected={selectedIntegrations} onToggle={(value) => setSelectedIntegrations(toggleMultiSelect(selectedIntegrations, value, integrationOptions))} />
              <FilterChipGroup label="Domain" options={domainOptions} selected={selectedDomains} onToggle={(value) => setSelectedDomains(toggleMultiSelect(selectedDomains, value, domainOptions))} />
              <FilterChipGroup label="Time" options={timeOptions} selected={selectedTimes} onToggle={(value) => setSelectedTimes(toggleMultiSelect(selectedTimes, value, timeOptions))} />
            </div>
          </div>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-4 xl:self-start">
          <div className="space-y-4 rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(15,118,110,0.88))] p-4 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
            <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">Workspace Navigator</p><h2 className="mt-2 text-lg font-semibold">Executive Command Layer</h2><p className="mt-2 text-sm leading-6 text-emerald-50/80">Navigate strategic views for enterprise knowledge visibility, AI performance, risk posture, and cross-platform orchestration.</p></div>
            <div className="space-y-2">
              {workspaceItems.map((item) => {
                const Icon = item.icon
                const active = activeSection === item.key
                return (
                  <button key={item.key} type="button" onClick={() => setActiveSection(item.key)} className={cn('flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition-all', active ? 'border-emerald-200 bg-white text-slate-950 shadow-lg' : 'border-white/10 bg-white/5 text-white hover:border-white/20 hover:bg-white/10')}>
                    <div className={cn('mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl', active ? 'bg-emerald-50 text-emerald-700' : 'bg-white/10 text-white')}><Icon className="h-4 w-4" /></div>
                    <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold">{item.label}</p><span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', active ? 'bg-slate-100 text-slate-700' : 'bg-white/10 text-white')}>{item.count}</span></div><p className={cn('mt-1 text-xs leading-5', active ? 'text-slate-500' : 'text-white/70')}>{item.description}</p></div>
                  </button>
                )
              })}
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-200">Enterprise coverage summary</p><div className="mt-3 grid grid-cols-2 gap-3 text-sm"><div><p className="text-white/60">Assets</p><p className="mt-1 font-semibold">{summary.assets.toLocaleString()}</p></div><div><p className="text-white/60">Avg trust</p><p className="mt-1 font-semibold">{Math.round(summary.averageTrust / executiveRows.length)}%</p></div><div><p className="text-white/60">Avg AI rate</p><p className="mt-1 font-semibold">{Math.round(summary.averageAiRate / executiveRows.length)}%</p></div><div><p className="text-white/60">Integrations</p><p className="mt-1 font-semibold">34 active</p></div></div></div>
          </div>
        </aside>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">{kpiCards.map((card) => <KpiSummaryCard key={card.label} card={card} onSelect={handleKpiSelect} />)}</div>
          {renderContent()}
        </div>
      </div>

      {drawer ? (
        <div className="pointer-events-none fixed inset-y-0 right-0 z-50 flex w-full justify-end bg-slate-950/20 backdrop-blur-[1px]">
          <div className="pointer-events-auto h-full w-full max-w-[420px] border-l border-slate-200 bg-white p-6 shadow-[0_24px_90px_rgba(15,23,42,0.22)]">
            <div className="flex items-start justify-between gap-4"><div><p className={cn('inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold', getToneClasses(drawer.tone))}>Strategic Detail</p><h2 className="mt-3 text-xl font-semibold text-slate-950">{drawer.title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{drawer.subtitle}</p></div><Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl border border-slate-200" onClick={() => setDrawer(null)}><X className="h-4 w-4" /></Button></div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">{drawer.metrics.map((metric) => <div key={metric.label} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3"><p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{metric.label}</p><p className="mt-2 text-sm font-semibold text-slate-950">{metric.value}</p></div>)}</div>
            <div className="mt-6 space-y-3"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Strategic notes</p>{drawer.bullets.map((bullet) => <div key={bullet} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-3"><div className="mt-1 h-2 w-2 rounded-full bg-emerald-500" /><p className="text-sm leading-6 text-slate-600">{bullet}</p></div>)}</div>
            <div className="mt-6 space-y-3"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Available actions</p>{drawer.actions.map((action) => <Button key={action} variant="outline" className="h-10 w-full justify-start rounded-xl" onClick={() => addToast({ title: action, description: `${action} has been staged from Knowledge Command Center.`, variant: 'success' })}><Eye className="mr-2 h-4 w-4" />{action}</Button>)}</div>
          </div>
        </div>
      ) : null}
    </div>
  )
}