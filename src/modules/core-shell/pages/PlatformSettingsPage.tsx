import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Activity,
  ArrowUpDown,
  BrainCircuit,
  Building2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Database,
  Download,
  Filter,
  HardDrive,
  Layers3,
  LockKeyhole,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  TimerReset,
  Users,
  Wifi,
  Workflow,
  X,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  type Edge,
  type Node,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { PageHeader } from '@/components/layout/PageHeader'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

type WorkspaceSection =
  | 'overview'
  | 'system-settings'
  | 'user-role-management'
  | 'ai-model-configuration'
  | 'indexing-storage-settings'
  | 'system-health-monitor'

type RowStatus = 'Active' | 'Healthy' | 'Warning' | 'Critical' | 'Disabled' | 'Pending Review' | 'Degraded'
type ScopeFilter = 'Tenant' | 'User' | 'Role' | 'Model' | 'Index' | 'Storage' | 'System Service'
type EnvironmentFilter = 'Development' | 'UAT' | 'Production' | 'Shared'
type ModelTypeFilter = 'Embedding' | 'LLM' | 'Summarization' | 'Reasoning' | 'Retrieval'
type TimeFilter = 'Today' | '7 Days' | '30 Days' | '90 Days' | 'Custom Range'
type SortDirection = 'asc' | 'desc' | null
type DrawerTone = 'healthy' | 'warning' | 'critical' | 'neutral'

interface NavigatorItem {
  key: WorkspaceSection
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  count: number
}

interface KpiCardItem {
  label: string
  metric: string
  description: string
  trend: string
  icon: React.ComponentType<{ className?: string }>
  tone: DrawerTone
  targetSection: WorkspaceSection
}

interface TenantRow {
  id: string
  scopeType: 'Tenant'
  tenantName: string
  environment: EnvironmentFilter
  configurationScope: string
  storageAllocation: string
  policyProfile: string
  defaultModelSet: string
  indexingMode: string
  tenantStatus: RowStatus
  activityVisibility: string
  onboardingStatus: string
  lastUpdated: string
}

interface UserRow {
  id: string
  scopeType: 'User'
  userName: string
  email: string
  assignedRole: string
  domainScope: string
  status: RowStatus
  lastActive: string
  invitationState: string
  authenticationType: string
  permissionGroup: string
  environment: EnvironmentFilter
}

interface ModelRow {
  id: string
  scopeType: 'Model'
  modelName: string
  modelType: ModelTypeFilter
  assignedUseCase: string
  version: string
  provider: string
  status: RowStatus
  fallbackModel: string
  configurationScope: string
  lastUpdated: string
  latencyProfile: string
  owner: string
  environment: EnvironmentFilter
}

interface IndexRow {
  id: string
  scopeType: 'Index'
  indexName: string
  indexType: string
  storageTier: string
  refreshSchedule: string
  embeddingAssociation: string
  storageUsage: string
  healthScore: string
  lastReindexTime: string
  status: RowStatus
  environment: EnvironmentFilter
}

interface ServiceRow {
  id: string
  scopeType: 'System Service'
  serviceName: string
  componentType: string
  availability: string
  latency: string
  errorRate: string
  throughput: string
  queueDepth: string
  lastIncident: string
  status: RowStatus
  environment: EnvironmentFilter
}

interface ActivityItem {
  id: string
  title: string
  detail: string
  timestamp: string
  tone: DrawerTone
}

interface DrawerState {
  title: string
  subtitle: string
  tone: DrawerTone
  metrics: Array<{ label: string; value: string }>
  bullets: string[]
  actions: string[]
}

interface TableColumn<T> {
  key: string
  label: string
  getValue: (row: T) => string | number
  render: (row: T) => ReactNode
  className?: string
}

const statusOptions: RowStatus[] = ['Active', 'Healthy', 'Warning', 'Critical', 'Disabled', 'Pending Review', 'Degraded']
const scopeOptions: ScopeFilter[] = ['Tenant', 'User', 'Role', 'Model', 'Index', 'Storage', 'System Service']
const environmentOptions: EnvironmentFilter[] = ['Development', 'UAT', 'Production', 'Shared']
const modelTypeOptions: ModelTypeFilter[] = ['Embedding', 'LLM', 'Summarization', 'Reasoning', 'Retrieval']
const timeOptions: TimeFilter[] = ['Today', '7 Days', '30 Days', '90 Days', 'Custom Range']

const navigatorItems: NavigatorItem[] = [
  {
    key: 'overview',
    label: 'Overview',
    description: 'Enterprise operations command overview for SALVIA configuration, control, and runtime readiness.',
    icon: Layers3,
    count: 12,
  },
  {
    key: 'system-settings',
    label: 'System Settings',
    description: 'Tenant and environment configuration control across governed SALVIA operating scopes.',
    icon: Building2,
    count: 6,
  },
  {
    key: 'user-role-management',
    label: 'User & Role Management',
    description: 'Structured access administration, invitation governance, and permission scope visibility.',
    icon: Users,
    count: 8,
  },
  {
    key: 'ai-model-configuration',
    label: 'AI Model Configuration',
    description: 'Controlled assignment of embedding and LLM runtime models with fallback and audit posture.',
    icon: BrainCircuit,
    count: 5,
  },
  {
    key: 'indexing-storage-settings',
    label: 'Indexing & Storage Settings',
    description: 'Storage, vector index, retrieval readiness, and re-indexing discipline for enterprise knowledge.',
    icon: Database,
    count: 7,
  },
  {
    key: 'system-health-monitor',
    label: 'System Health Monitor',
    description: 'Availability, throughput, queue posture, and service dependency visibility for reliable operations.',
    icon: Activity,
    count: 9,
  },
]

const kpiCards: KpiCardItem[] = [
  {
    label: 'Active Tenants',
    metric: '18',
    description: 'Tenant scopes currently active across shared, production, and regulated environments.',
    trend: '+2 tenants onboarded this quarter',
    icon: Building2,
    tone: 'healthy',
    targetSection: 'system-settings',
  },
  {
    label: 'Registered Users',
    metric: '1,284',
    description: 'Governed administrators, stewards, operators, and audit viewers with tracked access posture.',
    trend: '94 pending reviews cleared in 30 days',
    icon: Users,
    tone: 'neutral',
    targetSection: 'user-role-management',
  },
  {
    label: 'Configured AI Models',
    metric: '14',
    description: 'Approved embedding and LLM configurations active across retrieval, reasoning, and summarization.',
    trend: '2 fallback chains updated this week',
    icon: BrainCircuit,
    tone: 'neutral',
    targetSection: 'ai-model-configuration',
  },
  {
    label: 'Index Health Score',
    metric: '97.2%',
    description: 'Composite health across vector, lexical, and embedding refresh pipelines for enterprise knowledge.',
    trend: 'One degraded vector cluster under review',
    icon: Database,
    tone: 'healthy',
    targetSection: 'indexing-storage-settings',
  },
  {
    label: 'Average Query Latency',
    metric: '184 ms',
    description: 'Median end-user retrieval and assistant grounding latency across monitored production services.',
    trend: '-18 ms over the last 7 days',
    icon: TimerReset,
    tone: 'healthy',
    targetSection: 'system-health-monitor',
  },
  {
    label: 'System Availability',
    metric: '99.98%',
    description: 'Rolling availability across SALVIA storage, indexing, model runtime, and orchestration services.',
    trend: 'No sev-1 outage in 90 days',
    icon: Wifi,
    tone: 'healthy',
    targetSection: 'system-health-monitor',
  },
]

const tenantRows: TenantRow[] = [
  {
    id: 'TEN-001',
    scopeType: 'Tenant',
    tenantName: 'Adira Multifinance Core',
    environment: 'Production',
    configurationScope: 'Enterprise credit and servicing knowledge',
    storageAllocation: '12.4 TB / 16 TB',
    policyProfile: 'Regulated Banking Gold',
    defaultModelSet: 'Enterprise Retrieval A',
    indexingMode: 'Hybrid semantic + lexical',
    tenantStatus: 'Active',
    activityVisibility: 'High operational traffic',
    onboardingStatus: 'Completed',
    lastUpdated: '2026-04-16 18:24',
  },
  {
    id: 'TEN-002',
    scopeType: 'Tenant',
    tenantName: 'Retail Lending Studio',
    environment: 'Production',
    configurationScope: 'Loan origination, adjudication, and policy knowledge',
    storageAllocation: '5.6 TB / 8 TB',
    policyProfile: 'Credit Control Standard',
    defaultModelSet: 'Loan Reasoning B',
    indexingMode: 'Vector-first assisted retrieval',
    tenantStatus: 'Healthy',
    activityVisibility: 'Peak daytime retrieval',
    onboardingStatus: 'Completed',
    lastUpdated: '2026-04-15 09:08',
  },
  {
    id: 'TEN-003',
    scopeType: 'Tenant',
    tenantName: 'Collections Governance Hub',
    environment: 'Production',
    configurationScope: 'Hardship playbooks and controlled collections knowledge',
    storageAllocation: '4.8 TB / 6 TB',
    policyProfile: 'Collections Supervised',
    defaultModelSet: 'Collections Guarded LLM',
    indexingMode: 'Hybrid with guarded refresh',
    tenantStatus: 'Warning',
    activityVisibility: 'Elevated review events',
    onboardingStatus: 'Completed',
    lastUpdated: '2026-04-16 07:42',
  },
  {
    id: 'TEN-004',
    scopeType: 'Tenant',
    tenantName: 'Shared Knowledge Sandbox',
    environment: 'UAT',
    configurationScope: 'Cross-domain validation and integration rehearsal',
    storageAllocation: '2.1 TB / 4 TB',
    policyProfile: 'Pre-production Evaluation',
    defaultModelSet: 'Validation Suite UAT',
    indexingMode: 'Scheduled lexical + vector',
    tenantStatus: 'Pending Review',
    activityVisibility: 'Controlled UAT windows',
    onboardingStatus: 'Security sign-off pending',
    lastUpdated: '2026-04-14 13:16',
  },
  {
    id: 'TEN-005',
    scopeType: 'Tenant',
    tenantName: 'Enterprise Operations Shared Services',
    environment: 'Shared',
    configurationScope: 'Cross-tenant navigation, shared admin services, and retention controls',
    storageAllocation: '1.6 TB / 3 TB',
    policyProfile: 'Shared Operations Baseline',
    defaultModelSet: 'Shared Retrieval Safe',
    indexingMode: 'Policy-aware lexical',
    tenantStatus: 'Healthy',
    activityVisibility: 'Steady administrative workload',
    onboardingStatus: 'Completed',
    lastUpdated: '2026-04-13 10:02',
  },
]

const userRows: UserRow[] = [
  {
    id: 'USR-001',
    scopeType: 'User',
    userName: 'Nadia Prasetyo',
    email: 'nadia.prasetyo@adira.co.id',
    assignedRole: 'Platform Administrator',
    domainScope: 'Enterprise-wide',
    status: 'Active',
    lastActive: '2026-04-17 08:22',
    invitationState: 'Accepted',
    authenticationType: 'Federated SSO',
    permissionGroup: 'Platform Admin Gold',
    environment: 'Production',
  },
  {
    id: 'USR-002',
    scopeType: 'User',
    userName: 'Riko Marpaung',
    email: 'riko.marpaung@adira.co.id',
    assignedRole: 'Tenant Operator',
    domainScope: 'Collections Governance Hub',
    status: 'Warning',
    lastActive: '2026-04-16 17:41',
    invitationState: 'Accepted',
    authenticationType: 'Federated SSO',
    permissionGroup: 'Collections Operations',
    environment: 'Production',
  },
  {
    id: 'USR-003',
    scopeType: 'User',
    userName: 'Melissa Handoko',
    email: 'melissa.handoko@adira.co.id',
    assignedRole: 'Model Steward',
    domainScope: 'Retail Lending Studio',
    status: 'Healthy',
    lastActive: '2026-04-17 06:04',
    invitationState: 'Accepted',
    authenticationType: 'Federated SSO',
    permissionGroup: 'AI Configuration Control',
    environment: 'Production',
  },
  {
    id: 'USR-004',
    scopeType: 'User',
    userName: 'Bagas Saputra',
    email: 'bagas.saputra@partner.example',
    assignedRole: 'Audit Viewer',
    domainScope: 'Shared Knowledge Sandbox',
    status: 'Pending Review',
    lastActive: '2026-04-14 09:30',
    invitationState: 'Invitation Sent',
    authenticationType: 'Partner Federation',
    permissionGroup: 'External Audit Read Only',
    environment: 'UAT',
  },
  {
    id: 'USR-005',
    scopeType: 'User',
    userName: 'Dewi Anjani',
    email: 'dewi.anjani@adira.co.id',
    assignedRole: 'Knowledge Steward',
    domainScope: 'Adira Multifinance Core',
    status: 'Active',
    lastActive: '2026-04-17 07:48',
    invitationState: 'Accepted',
    authenticationType: 'Federated SSO',
    permissionGroup: 'Stewardship Control',
    environment: 'Production',
  },
  {
    id: 'USR-006',
    scopeType: 'User',
    userName: 'Ferry Kurniawan',
    email: 'ferry.kurniawan@adira.co.id',
    assignedRole: 'Access Reviewer',
    domainScope: 'Enterprise-wide',
    status: 'Degraded',
    lastActive: '2026-04-15 15:12',
    invitationState: 'Accepted',
    authenticationType: 'Federated SSO',
    permissionGroup: 'RBAC Governance Review',
    environment: 'Shared',
  },
]

const modelRows: ModelRow[] = [
  {
    id: 'MOD-001',
    scopeType: 'Model',
    modelName: 'salvia-embed-fin-3-large',
    modelType: 'Embedding',
    assignedUseCase: 'Vector index generation',
    version: 'v3.4.1',
    provider: 'Azure OpenAI',
    status: 'Healthy',
    fallbackModel: 'salvia-embed-fin-2-safe',
    configurationScope: 'Enterprise production default',
    lastUpdated: '2026-04-16 11:08',
    latencyProfile: '42 ms median',
    owner: 'AI Platform Stewardship',
    environment: 'Production',
  },
  {
    id: 'MOD-002',
    scopeType: 'Model',
    modelName: 'reasoning-ops-governor-7',
    modelType: 'Reasoning',
    assignedUseCase: 'Operational assistant reasoning',
    version: 'v7.0.2',
    provider: 'Anthropic',
    status: 'Active',
    fallbackModel: 'reasoning-ops-safe-6',
    configurationScope: 'Enterprise command workflows',
    lastUpdated: '2026-04-14 18:40',
    latencyProfile: '186 ms median',
    owner: 'SALVIA Operations Office',
    environment: 'Production',
  },
  {
    id: 'MOD-003',
    scopeType: 'Model',
    modelName: 'summarizer-regulated-docs',
    modelType: 'Summarization',
    assignedUseCase: 'Steward review summaries',
    version: 'v2.2.0',
    provider: 'OpenAI Enterprise',
    status: 'Warning',
    fallbackModel: 'summarizer-safe-docs',
    configurationScope: 'Review workflow only',
    lastUpdated: '2026-04-15 07:12',
    latencyProfile: '241 ms median',
    owner: 'Knowledge Quality Office',
    environment: 'Production',
  },
  {
    id: 'MOD-004',
    scopeType: 'Model',
    modelName: 'retrieval-ranker-uat-1',
    modelType: 'Retrieval',
    assignedUseCase: 'UAT relevance evaluation',
    version: 'v1.8.6',
    provider: 'Internal Model Runtime',
    status: 'Pending Review',
    fallbackModel: 'retrieval-ranker-stable',
    configurationScope: 'UAT shared sandbox',
    lastUpdated: '2026-04-13 09:54',
    latencyProfile: '69 ms median',
    owner: 'Search Engineering Office',
    environment: 'UAT',
  },
  {
    id: 'MOD-005',
    scopeType: 'Model',
    modelName: 'llm-knowledge-copilot-core',
    modelType: 'LLM',
    assignedUseCase: 'Grounded answer generation',
    version: 'v5.1.0',
    provider: 'Azure OpenAI',
    status: 'Healthy',
    fallbackModel: 'llm-knowledge-copilot-safe',
    configurationScope: 'Production assistant runtime',
    lastUpdated: '2026-04-16 15:22',
    latencyProfile: '154 ms median',
    owner: 'AI Runtime Governance',
    environment: 'Production',
  },
]

const indexRows: IndexRow[] = [
  {
    id: 'IDX-001',
    scopeType: 'Index',
    indexName: 'knowledge-prod-vector-core',
    indexType: 'Vector',
    storageTier: 'Hot SSD',
    refreshSchedule: 'Every 15 minutes',
    embeddingAssociation: 'salvia-embed-fin-3-large',
    storageUsage: '7.8 TB / 10 TB',
    healthScore: '99.1%',
    lastReindexTime: '2026-04-17 07:30',
    status: 'Healthy',
    environment: 'Production',
  },
  {
    id: 'IDX-002',
    scopeType: 'Index',
    indexName: 'knowledge-prod-lexical-core',
    indexType: 'Lexical',
    storageTier: 'Hot SSD',
    refreshSchedule: 'Every 5 minutes',
    embeddingAssociation: 'Not required',
    storageUsage: '2.4 TB / 4 TB',
    healthScore: '98.4%',
    lastReindexTime: '2026-04-17 07:45',
    status: 'Active',
    environment: 'Production',
  },
  {
    id: 'IDX-003',
    scopeType: 'Index',
    indexName: 'collections-guarded-vector',
    indexType: 'Vector',
    storageTier: 'Warm NVMe',
    refreshSchedule: 'Hourly',
    embeddingAssociation: 'salvia-embed-fin-2-safe',
    storageUsage: '1.8 TB / 2.5 TB',
    healthScore: '92.3%',
    lastReindexTime: '2026-04-17 06:10',
    status: 'Warning',
    environment: 'Production',
  },
  {
    id: 'IDX-004',
    scopeType: 'Index',
    indexName: 'sandbox-evaluation-vector',
    indexType: 'Vector',
    storageTier: 'Warm Object Hybrid',
    refreshSchedule: 'Twice daily',
    embeddingAssociation: 'retrieval-ranker-uat-1',
    storageUsage: '0.9 TB / 2 TB',
    healthScore: '95.0%',
    lastReindexTime: '2026-04-16 18:15',
    status: 'Pending Review',
    environment: 'UAT',
  },
  {
    id: 'IDX-005',
    scopeType: 'Index',
    indexName: 'archive-governance-cold-search',
    indexType: 'Archive Search',
    storageTier: 'Cold Object Storage',
    refreshSchedule: 'Daily',
    embeddingAssociation: 'summarizer-safe-docs',
    storageUsage: '6.1 TB / 12 TB',
    healthScore: '89.7%',
    lastReindexTime: '2026-04-16 04:30',
    status: 'Degraded',
    environment: 'Shared',
  },
]

const serviceRows: ServiceRow[] = [
  {
    id: 'SRV-001',
    scopeType: 'System Service',
    serviceName: 'Tenant Configuration API',
    componentType: 'Configuration Control Plane',
    availability: '99.99%',
    latency: '72 ms',
    errorRate: '0.04%',
    throughput: '420 req/min',
    queueDepth: '0',
    lastIncident: 'No incident in 30 days',
    status: 'Healthy',
    environment: 'Production',
  },
  {
    id: 'SRV-002',
    scopeType: 'System Service',
    serviceName: 'User Access Administration Service',
    componentType: 'Access Governance',
    availability: '99.96%',
    latency: '96 ms',
    errorRate: '0.12%',
    throughput: '210 req/min',
    queueDepth: '2',
    lastIncident: '2026-04-12 invitation sync delay',
    status: 'Active',
    environment: 'Production',
  },
  {
    id: 'SRV-003',
    scopeType: 'System Service',
    serviceName: 'Model Runtime Configuration Gateway',
    componentType: 'AI Runtime Control',
    availability: '99.92%',
    latency: '143 ms',
    errorRate: '0.23%',
    throughput: '155 req/min',
    queueDepth: '3',
    lastIncident: '2026-04-15 fallback switch event',
    status: 'Warning',
    environment: 'Production',
  },
  {
    id: 'SRV-004',
    scopeType: 'System Service',
    serviceName: 'Indexing Scheduler and Queue',
    componentType: 'Index Operations',
    availability: '99.81%',
    latency: '188 ms',
    errorRate: '0.61%',
    throughput: '1.4k jobs/hour',
    queueDepth: '17',
    lastIncident: '2026-04-16 vector backlog spike',
    status: 'Degraded',
    environment: 'Production',
  },
  {
    id: 'SRV-005',
    scopeType: 'System Service',
    serviceName: 'Storage Lifecycle Manager',
    componentType: 'Storage Control',
    availability: '99.95%',
    latency: '111 ms',
    errorRate: '0.09%',
    throughput: '82 tasks/hour',
    queueDepth: '1',
    lastIncident: '2026-04-10 archive tier pause',
    status: 'Healthy',
    environment: 'Shared',
  },
  {
    id: 'SRV-006',
    scopeType: 'System Service',
    serviceName: 'Health Telemetry Aggregator',
    componentType: 'Observability Read Model',
    availability: '99.97%',
    latency: '54 ms',
    errorRate: '0.05%',
    throughput: '9.6k metrics/min',
    queueDepth: '0',
    lastIncident: 'No incident in 14 days',
    status: 'Healthy',
    environment: 'Production',
  },
]

const recentActivities: ActivityItem[] = [
  {
    id: 'ACT-001',
    title: 'Collections Governance Hub policy profile updated',
    detail: 'Default model set switched to guarded fallback chain after supervised review.',
    timestamp: '08:42',
    tone: 'warning',
  },
  {
    id: 'ACT-002',
    title: 'Two external audit viewers invited to Shared Knowledge Sandbox',
    detail: 'Invitation scope limited to UAT evidence packages and review-only permissions.',
    timestamp: '07:28',
    tone: 'neutral',
  },
  {
    id: 'ACT-003',
    title: 'knowledge-prod-vector-core completed incremental refresh',
    detail: '97,420 embedding fragments refreshed with no failed batch segment.',
    timestamp: '07:30',
    tone: 'healthy',
  },
  {
    id: 'ACT-004',
    title: 'Model Runtime Configuration Gateway triggered fallback rehearsal',
    detail: 'Fallback latency improved after provider routing update in production.',
    timestamp: '06:55',
    tone: 'healthy',
  },
  {
    id: 'ACT-005',
    title: 'Indexing Scheduler backlog exceeded watch threshold',
    detail: 'Collections vector queue marked for review after ingestion surge.',
    timestamp: '05:48',
    tone: 'critical',
  },
]

const healthTrendData = [
  { label: 'Mon', availability: 99.94, latency: 214, throughput: 8.6 },
  { label: 'Tue', availability: 99.95, latency: 205, throughput: 8.9 },
  { label: 'Wed', availability: 99.96, latency: 196, throughput: 9.1 },
  { label: 'Thu', availability: 99.98, latency: 188, throughput: 9.4 },
  { label: 'Fri', availability: 99.98, latency: 184, throughput: 9.6 },
]

const tenantDistributionData = [
  { name: 'Production', value: 11, color: '#0f766e' },
  { name: 'UAT', value: 4, color: '#0f766e99' },
  { name: 'Shared', value: 3, color: '#334155' },
]

const userRoleSummaryData = [
  { name: 'Platform Admin', value: 84 },
  { name: 'Tenant Operator', value: 236 },
  { name: 'Knowledge Steward', value: 612 },
  { name: 'Audit Viewer', value: 352 },
]

const modelUsageData = [
  { label: 'Embedding', assigned: 4, readiness: 98 },
  { label: 'LLM', assigned: 3, readiness: 96 },
  { label: 'Summarization', assigned: 2, readiness: 91 },
  { label: 'Reasoning', assigned: 2, readiness: 95 },
  { label: 'Retrieval', assigned: 3, readiness: 93 },
]

const storageHealthData = [
  { label: 'Hot tier', usage: 78, headroom: 22 },
  { label: 'Warm tier', usage: 66, headroom: 34 },
  { label: 'Cold archive', usage: 51, headroom: 49 },
]

const providerMixData = [
  { name: 'Azure OpenAI', value: 6, color: '#0f766e' },
  { name: 'Anthropic', value: 2, color: '#134e4a' },
  { name: 'Internal Runtime', value: 4, color: '#1d4ed8' },
  { name: 'Other Enterprise', value: 2, color: '#64748b' },
]

const healthNodes: Node[] = [
  {
    id: 'config',
    position: { x: 20, y: 80 },
    data: { label: 'Tenant Config API' },
    style: flowNodeStyle('#0f766e', '#ecfdf5'),
  },
  {
    id: 'access',
    position: { x: 220, y: 10 },
    data: { label: 'Access Admin Service' },
    style: flowNodeStyle('#334155', '#f8fafc'),
  },
  {
    id: 'model',
    position: { x: 220, y: 150 },
    data: { label: 'Model Config Gateway' },
    style: flowNodeStyle('#0f766e', '#ecfeff'),
  },
  {
    id: 'index',
    position: { x: 430, y: 80 },
    data: { label: 'Indexing Scheduler' },
    style: flowNodeStyle('#c2410c', '#fff7ed'),
  },
  {
    id: 'storage',
    position: { x: 620, y: 10 },
    data: { label: 'Storage Lifecycle' },
    style: flowNodeStyle('#0f766e', '#ecfdf5'),
  },
  {
    id: 'telemetry',
    position: { x: 620, y: 150 },
    data: { label: 'Telemetry Aggregator' },
    style: flowNodeStyle('#1d4ed8', '#eff6ff'),
  },
]

const healthEdges: Edge[] = [
  { id: 'e1', source: 'config', target: 'access', markerEnd: { type: MarkerType.ArrowClosed }, animated: true, style: { stroke: '#0f766e' } },
  { id: 'e2', source: 'config', target: 'model', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#0f766e' } },
  { id: 'e3', source: 'access', target: 'index', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#64748b' } },
  { id: 'e4', source: 'model', target: 'index', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#c2410c' } },
  { id: 'e5', source: 'index', target: 'storage', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#0f766e' } },
  { id: 'e6', source: 'index', target: 'telemetry', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#1d4ed8' } },
]

export function PlatformSettingsPage() {
  const { addToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeSection, setActiveSection] = useState<WorkspaceSection>('overview')
  const [searchValue, setSearchValue] = useState('')
  const [showFilters, setShowFilters] = useState(true)
  const [statusFilter, setStatusFilter] = useState<RowStatus[]>(statusOptions)
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter[]>(scopeOptions)
  const [environmentFilter, setEnvironmentFilter] = useState<EnvironmentFilter[]>(environmentOptions)
  const [modelTypeFilter, setModelTypeFilter] = useState<ModelTypeFilter[]>(modelTypeOptions)
  const [timeFilter, setTimeFilter] = useState<TimeFilter[]>(timeOptions)
  const [drawer, setDrawer] = useState<DrawerState | null>(null)

  useEffect(() => {
    const section = searchParams.get('section')
    if (section && navigatorItems.some((item) => item.key === section)) {
      setActiveSection(section as WorkspaceSection)
    }
  }, [searchParams])

  const filteredTenants = useMemo(() => {
    return tenantRows.filter((row) => {
      const haystack = [
        row.tenantName,
        row.configurationScope,
        row.policyProfile,
        row.defaultModelSet,
        row.indexingMode,
        row.environment,
      ]
        .join(' ')
        .toLowerCase()

      const searchMatch = !searchValue || haystack.includes(searchValue.toLowerCase())
      return (
        searchMatch &&
        statusFilter.includes(row.tenantStatus) &&
        scopeFilter.includes('Tenant') &&
        environmentFilter.includes(row.environment)
      )
    })
  }, [searchValue, statusFilter, scopeFilter, environmentFilter])

  const filteredUsers = useMemo(() => {
    return userRows.filter((row) => {
      const haystack = [
        row.userName,
        row.email,
        row.assignedRole,
        row.domainScope,
        row.permissionGroup,
        row.authenticationType,
      ]
        .join(' ')
        .toLowerCase()

      const searchMatch = !searchValue || haystack.includes(searchValue.toLowerCase())
      return (
        searchMatch &&
        statusFilter.includes(row.status) &&
        scopeFilter.includes('User') &&
        environmentFilter.includes(row.environment)
      )
    })
  }, [searchValue, statusFilter, scopeFilter, environmentFilter])

  const filteredModels = useMemo(() => {
    return modelRows.filter((row) => {
      const haystack = [
        row.modelName,
        row.assignedUseCase,
        row.provider,
        row.version,
        row.owner,
        row.configurationScope,
      ]
        .join(' ')
        .toLowerCase()

      const searchMatch = !searchValue || haystack.includes(searchValue.toLowerCase())
      const includeStatus = statusFilter.includes(row.status)
      const includeScope = scopeFilter.includes('Model')
      const includeEnvironment = environmentFilter.includes(row.environment)
      const includeType = modelTypeFilter.includes(row.modelType)
      const includeTime = timeFilter.includes(pickModelTimeBucket(row.lastUpdated))

      return searchMatch && includeStatus && includeScope && includeEnvironment && includeType && includeTime
    })
  }, [searchValue, statusFilter, scopeFilter, environmentFilter, modelTypeFilter, timeFilter])

  const filteredIndexes = useMemo(() => {
    return indexRows.filter((row) => {
      const haystack = [
        row.indexName,
        row.indexType,
        row.storageTier,
        row.refreshSchedule,
        row.embeddingAssociation,
      ]
        .join(' ')
        .toLowerCase()

      const searchMatch = !searchValue || haystack.includes(searchValue.toLowerCase())
      const includeStatus = statusFilter.includes(row.status)
      const includeScope = scopeFilter.includes('Index') || scopeFilter.includes('Storage')
      const includeEnvironment = environmentFilter.includes(row.environment)

      return searchMatch && includeStatus && includeScope && includeEnvironment
    })
  }, [searchValue, statusFilter, scopeFilter, environmentFilter])

  const filteredServices = useMemo(() => {
    return serviceRows.filter((row) => {
      const haystack = [
        row.serviceName,
        row.componentType,
        row.status,
        row.environment,
        row.lastIncident,
      ]
        .join(' ')
        .toLowerCase()

      const searchMatch = !searchValue || haystack.includes(searchValue.toLowerCase())
      return (
        searchMatch &&
        statusFilter.includes(row.status) &&
        scopeFilter.includes('System Service') &&
        environmentFilter.includes(row.environment)
      )
    })
  }, [searchValue, statusFilter, scopeFilter, environmentFilter])

  const summaryCounts = {
    activeTenants: tenantRows.filter((row) => row.tenantStatus === 'Active' || row.tenantStatus === 'Healthy').length,
    registeredUsers: userRows.length,
    configuredModels: modelRows.length,
    healthyIndexes: indexRows.filter((row) => row.status === 'Healthy' || row.status === 'Active').length,
    queryLatency: '184 ms',
    availability: '99.98%',
  }

  const activeLabel = navigatorItems.find((item) => item.key === activeSection)?.label ?? 'Overview'

  const handleSectionChange = (section: WorkspaceSection) => {
    setActiveSection(section)
    setSearchParams({ section })
  }

  const handleExport = () => {
    addToast({
      title: 'Export prepared',
      description: `Platform Settings & Administration export prepared for ${activeLabel}.`,
      variant: 'success',
    })
  }

  const openDrawer = (drawerState: DrawerState) => setDrawer(drawerState)
  const fireAction = handleActionToast(addToast)

  return (
    <div className="space-y-6 pb-8">
      <Breadcrumb items={[{ label: 'Platform Settings & Administration' }]} />

      <PageHeader
        title="Platform Settings & Administration"
        description="Strategic operations workspace for administering, governing, scaling, and monitoring SALVIA across tenants, users, AI runtime configuration, storage, indexing, and platform health."
        right={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className={cn('h-10 gap-2 rounded-xl px-3', showFilters && 'border-emerald-300 bg-emerald-50 text-emerald-900')}
              onClick={() => setShowFilters((value) => !value)}
              aria-label="Hide Search & Filters panel"
              title="Hide Search & Filters panel"
            >
              <Filter className="h-5 w-5" strokeWidth={2} />
              {showFilters ? 'Hide filters' : 'Show filters'}
            </Button>
            <Button
              variant="outline"
              className="h-10 gap-2 rounded-xl px-3"
              onClick={handleExport}
              aria-label="Export current administration view"
              title="Export current administration view"
            >
              <Download className="h-5 w-5" strokeWidth={2} />
              Export
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {kpiCards.map((card) => {
          const Icon = card.icon
          return (
            <button
              key={card.label}
              type="button"
              onClick={() => handleSectionChange(card.targetSection)}
              className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/85 p-4 text-left shadow-[0_20px_45px_-28px_rgba(15,23,42,0.55)] transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-[0_24px_52px_-24px_rgba(15,118,110,0.28)]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(15,118,110,0.14),transparent_46%)]" />
              <div className="relative space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-500">{card.label}</p>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{card.metric}</p>
                  </div>
                  <div className={cn('rounded-2xl border p-3', toneIconClass(card.tone))}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600">{card.description}</p>
                <div className="flex items-center justify-between text-[11px]">
                  <span className={toneTextClass(card.tone)}>{card.trend}</span>
                  <span className="text-slate-400 transition-transform group-hover:translate-x-0.5">View</span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {showFilters ? (
        <Card className="glass-card rounded-2xl border border-white/40 bg-white/80 p-0">
          <CardContent className="space-y-4 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                type="search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search tenant name, user name, role name, model name, index name, storage policy, environment, config key, health event, or system service"
                className="h-10 w-full rounded-xl border-slate-200 bg-white/90 pl-9 pr-3 text-sm"
              />
            </div>

            <FilterChipGroup label="Status" options={statusOptions} selected={statusFilter} onToggle={(value) => setStatusFilter(toggleFilterValue(value, statusFilter, statusOptions))} onReset={() => setStatusFilter(statusOptions)} />
            <FilterChipGroup label="Scope" options={scopeOptions} selected={scopeFilter} onToggle={(value) => setScopeFilter(toggleFilterValue(value, scopeFilter, scopeOptions))} onReset={() => setScopeFilter(scopeOptions)} />
            <FilterChipGroup label="Environment" options={environmentOptions} selected={environmentFilter} onToggle={(value) => setEnvironmentFilter(toggleFilterValue(value, environmentFilter, environmentOptions))} onReset={() => setEnvironmentFilter(environmentOptions)} />
            <FilterChipGroup label="Model Type" options={modelTypeOptions} selected={modelTypeFilter} onToggle={(value) => setModelTypeFilter(toggleFilterValue(value, modelTypeFilter, modelTypeOptions))} onReset={() => setModelTypeFilter(modelTypeOptions)} />
            <FilterChipGroup label="Time" options={timeOptions} selected={timeFilter} onToggle={(value) => setTimeFilter(toggleFilterValue(value, timeFilter, timeOptions))} onReset={() => setTimeFilter(timeOptions)} />
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <div className="xl:sticky xl:top-16 xl:self-start">
          <Card className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/85 shadow-[0_22px_48px_-28px_rgba(15,23,42,0.4)]">
            <CardHeader className="border-b border-slate-200/70 bg-[linear-gradient(135deg,rgba(15,118,110,0.12),rgba(255,255,255,0.8))] pb-4">
              <CardTitle className="text-sm font-semibold text-slate-900">Workspace Navigator</CardTitle>
              <CardDescription className="text-[11px] leading-relaxed text-slate-600">
                Move across tenant governance, user control, runtime configuration, indexing posture, and live health visibility.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-1">
                {navigatorItems.map((item) => {
                  const Icon = item.icon
                  const isActive = item.key === activeSection
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleSectionChange(item.key)}
                      className={cn(
                        'w-full rounded-2xl border px-3 py-3 text-left transition-all',
                        isActive
                          ? 'border-emerald-300 bg-emerald-50/90 shadow-sm'
                          : 'border-transparent hover:border-slate-200 hover:bg-slate-50/90'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn('mt-0.5 rounded-xl border p-2', isActive ? 'border-emerald-200 bg-white text-emerald-700' : 'border-slate-200 bg-white text-slate-600')}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className={cn('text-xs font-semibold', isActive ? 'text-slate-950' : 'text-slate-800')}>{item.label}</p>
                            <span className={cn('rounded-full px-2 py-0.5 text-[10px] tabular-nums', isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600')}>
                              {item.count}
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{item.description}</p>
                        </div>
                        <ChevronRight className={cn('mt-1 h-4 w-4 shrink-0', isActive ? 'text-emerald-700' : 'text-slate-300')} />
                      </div>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="min-w-0 space-y-6">
          {activeSection === 'overview' ? (
            <OverviewSection summaryCounts={summaryCounts} recentActivities={recentActivities} onOpenDrawer={openDrawer} />
          ) : null}

          {activeSection === 'system-settings' ? (
            <SystemSettingsSection rows={filteredTenants} onOpenDrawer={openDrawer} onAction={fireAction} />
          ) : null}

          {activeSection === 'user-role-management' ? (
            <UserRoleManagementSection rows={filteredUsers} onOpenDrawer={openDrawer} onAction={fireAction} />
          ) : null}

          {activeSection === 'ai-model-configuration' ? (
            <AiModelConfigurationSection rows={filteredModels} onOpenDrawer={openDrawer} onAction={fireAction} />
          ) : null}

          {activeSection === 'indexing-storage-settings' ? (
            <IndexingStorageSection rows={filteredIndexes} onOpenDrawer={openDrawer} onAction={fireAction} />
          ) : null}

          {activeSection === 'system-health-monitor' ? (
            <SystemHealthSection rows={filteredServices} onOpenDrawer={openDrawer} onAction={fireAction} />
          ) : null}
        </div>
      </div>

      <DetailDrawer drawer={drawer} onClose={() => setDrawer(null)} onAction={fireAction} />
    </div>
  )
}

function OverviewSection({
  summaryCounts,
  recentActivities,
  onOpenDrawer,
}: {
  summaryCounts: {
    activeTenants: number
    registeredUsers: number
    configuredModels: number
    healthyIndexes: number
    queryLatency: string
    availability: string
  }
  recentActivities: ActivityItem[]
  onOpenDrawer: (drawer: DrawerState) => void
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)]">
        <Card className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/85 shadow-[0_22px_48px_-28px_rgba(15,23,42,0.4)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-900">Platform health trend</CardTitle>
            <CardDescription className="text-[11px] text-slate-500">
              Rolling operational health across latency, throughput, and availability for tenant administration, storage, indexing, and AI runtime services.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <MiniStatCard label="Active tenants" value={String(summaryCounts.activeTenants)} hint="18 governed scopes live" tone="healthy" />
              <MiniStatCard label="Query latency" value={summaryCounts.queryLatency} hint="Median production latency" tone="neutral" />
              <MiniStatCard label="Availability" value={summaryCounts.availability} hint="Cross-service runtime availability" tone="healthy" />
            </div>
            <div className="h-72 rounded-2xl border border-slate-200/70 bg-[linear-gradient(180deg,rgba(248,250,252,0.88),rgba(255,255,255,0.96))] p-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={healthTrendData}>
                  <defs>
                    <linearGradient id="availabilityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0f766e" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#0f766e" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" domain={[99.8, 100]} tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" domain={[150, 240]} tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip contentStyle={{ borderRadius: 16, border: '1px solid #dbe5ef', boxShadow: '0 18px 45px -24px rgba(15,23,42,0.45)' }} />
                  <Area yAxisId="left" type="monotone" dataKey="availability" stroke="#0f766e" fill="url(#availabilityGradient)" strokeWidth={2.5} />
                  <Line yAxisId="right" type="monotone" dataKey="latency" stroke="#1d4ed8" strokeWidth={2.5} dot={{ r: 3, fill: '#1d4ed8' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-3xl border border-orange-200/80 bg-[linear-gradient(135deg,rgba(255,247,237,0.96),rgba(255,255,255,0.98))] shadow-[0_22px_48px_-32px_rgba(194,65,12,0.45)]">
            <CardHeader className="pb-2">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl border border-orange-200 bg-white p-3 text-orange-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold text-slate-900">Operational posture</CardTitle>
                  <CardDescription className="text-[11px] text-slate-600">
                    One indexing lane is degraded and one collections tenant policy profile remains in supervised review.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <WarningState
                title="Collections Governance Hub requires configuration follow-through"
                detail="Guarded fallback was applied, but policy scope and queue headroom should be reconciled before the next ingestion burst."
              />
              <button
                type="button"
                className="w-full rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 text-left text-[11px] text-slate-600 transition-colors hover:border-emerald-300 hover:text-slate-800"
                onClick={() =>
                  onOpenDrawer({
                    title: 'Overview control summary',
                    subtitle: 'Enterprise operating layer for configuration, access, runtime, and health governance.',
                    tone: 'warning',
                    metrics: [
                      { label: 'Tenant profile under review', value: '1' },
                      { label: 'Degraded services', value: '2' },
                      { label: 'Pending access reviews', value: '34' },
                    ],
                    bullets: [
                      'Collections configuration now uses guarded model fallback and requires final policy confirmation.',
                      'Indexing queue depth remains elevated but within operational guardrail.',
                      'No availability breach has been recorded across core production control plane services.',
                    ],
                    actions: ['Inspect degraded services', 'Review tenant policy scope', 'Export readiness snapshot'],
                  })
                }
              >
                Open readiness detail
              </button>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-slate-200/80 bg-white/85 shadow-[0_22px_48px_-28px_rgba(15,23,42,0.35)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-900">Recent administration activity</CardTitle>
              <CardDescription className="text-[11px] text-slate-500">
                Configuration, indexing, and runtime administration events captured for operational traceability.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivities.map((item) => (
                <div key={item.id} className="flex gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-3">
                  <div className={cn('mt-0.5 h-2.5 w-2.5 rounded-full', toneDotClass(item.tone))} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-900">{item.title}</p>
                      <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{item.detail}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="rounded-3xl border border-slate-200/80 bg-white/85 shadow-[0_22px_48px_-28px_rgba(15,23,42,0.35)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-900">Tenant distribution</CardTitle>
            <CardDescription className="text-[11px] text-slate-500">Production, UAT, and shared operating scopes under SALVIA platform governance.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={tenantDistributionData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={84} paddingAngle={3}>
                    {tenantDistributionData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: 16, border: '1px solid #dbe5ef' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid gap-2">
              {tenantDistributionData.map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50/70 px-3 py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600">{item.name}</span>
                  </div>
                  <span className="font-semibold text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200/80 bg-white/85 shadow-[0_22px_48px_-28px_rgba(15,23,42,0.35)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-900">User and role coverage</CardTitle>
            <CardDescription className="text-[11px] text-slate-500">Role allocation snapshot for operators, stewards, auditors, and platform administrators.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userRoleSummaryData} layout="vertical" margin={{ left: 16, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#dbe5ef" />
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#334155', fontSize: 11 }} axisLine={false} tickLine={false} width={96} />
                <RechartsTooltip contentStyle={{ borderRadius: 16, border: '1px solid #dbe5ef' }} />
                <Bar dataKey="value" radius={[0, 10, 10, 0]} fill="#0f766e" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200/80 bg-white/85 shadow-[0_22px_48px_-28px_rgba(15,23,42,0.35)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-900">Model usage overview</CardTitle>
            <CardDescription className="text-[11px] text-slate-500">Assigned model coverage and runtime readiness across core SALVIA AI operating lanes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {modelUsageData.map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900">{item.label}</span>
                  <span className="text-slate-500">{item.assigned} assigned</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-700 to-teal-500" style={{ width: `${item.readiness}%` }} />
                </div>
                <p className="mt-2 text-[11px] text-slate-500">{item.readiness}% runtime readiness within approved operating profile.</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <Card className="rounded-3xl border border-slate-200/80 bg-white/85 shadow-[0_22px_48px_-28px_rgba(15,23,42,0.35)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-900">Index and storage health</CardTitle>
            <CardDescription className="text-[11px] text-slate-500">Tier headroom and storage utilization supporting retrieval quality and indexing continuity.</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={storageHealthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dbe5ef" />
                <XAxis dataKey="label" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <RechartsTooltip contentStyle={{ borderRadius: 16, border: '1px solid #dbe5ef' }} />
                <Bar dataKey="usage" stackId="storage" fill="#0f766e" radius={[8, 8, 0, 0]} />
                <Bar dataKey="headroom" stackId="storage" fill="#cbd5e1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200/80 bg-white/85 shadow-[0_22px_48px_-28px_rgba(15,23,42,0.35)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-900">Recent platform administration activity</CardTitle>
            <CardDescription className="text-[11px] text-slate-500">Operational history visible for traceability and follow-up.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivities.slice(0, 4).map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200/70 bg-white/90 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-900">{item.title}</span>
                  <Badge className={cn('border-0', toneBadgeClass(item.tone))}>{item.timestamp}</Badge>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{item.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SystemSettingsSection({
  rows,
  onOpenDrawer,
  onAction,
}: {
  rows: TenantRow[]
  onOpenDrawer: (drawer: DrawerState) => void
  onAction: (action: string) => void
}) {
  const columns: TableColumn<TenantRow>[] = [
    {
      key: 'tenantName',
      label: 'Tenant Name',
      getValue: (row) => row.tenantName,
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.tenantName}</p>
          <p className="text-[11px] text-slate-500">{row.configurationScope}</p>
        </div>
      ),
    },
    {
      key: 'environment',
      label: 'Environment',
      getValue: (row) => row.environment,
      render: (row) => <EnvironmentBadge environment={row.environment} />,
    },
    {
      key: 'storageAllocation',
      label: 'Storage Allocation',
      getValue: (row) => row.storageAllocation,
      render: (row) => <span className="text-xs text-slate-700">{row.storageAllocation}</span>,
    },
    {
      key: 'policyProfile',
      label: 'Policy Profile',
      getValue: (row) => row.policyProfile,
      render: (row) => <span className="text-xs text-slate-700">{row.policyProfile}</span>,
    },
    {
      key: 'defaultModelSet',
      label: 'Default Model Set',
      getValue: (row) => row.defaultModelSet,
      render: (row) => <span className="text-xs text-slate-700">{row.defaultModelSet}</span>,
    },
    {
      key: 'indexingMode',
      label: 'Indexing Mode',
      getValue: (row) => row.indexingMode,
      render: (row) => <span className="text-xs text-slate-700">{row.indexingMode}</span>,
    },
    {
      key: 'tenantStatus',
      label: 'Status',
      getValue: (row) => row.tenantStatus,
      render: (row) => <StatusBadge status={row.tenantStatus} />,
    },
    {
      key: 'lastUpdated',
      label: 'Last Updated',
      getValue: (row) => row.lastUpdated,
      render: (row) => <span className="text-xs text-slate-700">{row.lastUpdated}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      getValue: () => '',
      render: (row) => (
        <ActionGroup
          actions={[
            { label: 'Open Tenant Detail', onClick: () => openTenantDrawer(row, onOpenDrawer) },
            { label: 'Edit Configuration', onClick: () => onAction(`Edit configuration requested for ${row.tenantName}.`) },
            { label: 'View Policy Scope', onClick: () => onAction(`Policy scope opened for ${row.tenantName}.`) },
          ]}
        />
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <SectionIntro
        eyebrow="System Settings"
        title="Tenant and environment control center"
        description="Govern tenant registry, environment-specific defaults, model baselines, policy scope, and storage allocations with operational history and controlled edit posture."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <MiniPanel title="Tenant registry visibility" value="18 live scopes" description="11 production, 4 UAT, and 3 shared enterprise operating scopes." icon={Building2} tone="healthy" />
        <MiniPanel title="Policy scope discipline" value="96.4% aligned" description="One collections tenant and one UAT profile still require remediation follow-through." icon={ShieldCheck} tone="warning" />
        <MiniPanel title="Storage allocation posture" value="82% utilized" description="Hot production tier remains within headroom, but collections vector growth is being tracked." icon={HardDrive} tone="neutral" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <EnterpriseTable
          title="Tenant configuration registry"
          description="Structured enterprise configuration table for tenant status, policy scope, storage, model default, and indexing mode visibility."
          rows={rows}
          columns={columns}
          onRowClick={(row) => openTenantDrawer(row, onOpenDrawer)}
          emptyTitle="No tenants match the active filter set"
          emptyDescription="Adjust the search terms or filter chips to recover tenant records."
        />

        <div className="space-y-6">
          <Card className="rounded-3xl border border-slate-200/80 bg-white/85">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-900">Policy and defaults panel</CardTitle>
              <CardDescription className="text-[11px] text-slate-500">Current production baselines used when new tenants are onboarded.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <DetailListItem label="Default environment profile" value="Regulated Banking Gold" />
              <DetailListItem label="Default retrieval stack" value="Hybrid semantic + lexical" />
              <DetailListItem label="Default embedding chain" value="salvia-embed-fin-3-large -> salvia-embed-fin-2-safe" />
              <DetailListItem label="Default retention posture" value="365-day hot, 2-year warm, 7-year archive" />
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-slate-200/80 bg-white/85">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-900">Configuration history</CardTitle>
              <CardDescription className="text-[11px] text-slate-500">Recent administrative changes across tenant scope and defaults.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <HistoryBlock title="Adira Multifinance Core" subtitle="Storage allocation extended to 16 TB" timestamp="2026-04-16 18:24" />
              <HistoryBlock title="Collections Governance Hub" subtitle="Guarded fallback and supervised policy scope applied" timestamp="2026-04-16 07:42" />
              <HistoryBlock title="Shared Knowledge Sandbox" subtitle="Awaiting security sign-off before tenant activation" timestamp="2026-04-14 13:16" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function UserRoleManagementSection({
  rows,
  onOpenDrawer,
  onAction,
}: {
  rows: UserRow[]
  onOpenDrawer: (drawer: DrawerState) => void
  onAction: (action: string) => void
}) {
  const columns: TableColumn<UserRow>[] = [
    {
      key: 'userName',
      label: 'User Name',
      getValue: (row) => row.userName,
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.userName}</p>
          <p className="text-[11px] text-slate-500">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'assignedRole',
      label: 'Assigned Role',
      getValue: (row) => row.assignedRole,
      render: (row) => <Badge className="border border-slate-200 bg-slate-50 text-slate-700">{row.assignedRole}</Badge>,
    },
    {
      key: 'domainScope',
      label: 'Domain Scope',
      getValue: (row) => row.domainScope,
      render: (row) => <span className="text-xs text-slate-700">{row.domainScope}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      getValue: (row) => row.status,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'lastActive',
      label: 'Last Active',
      getValue: (row) => row.lastActive,
      render: (row) => <span className="text-xs text-slate-700">{row.lastActive}</span>,
    },
    {
      key: 'invitationState',
      label: 'Invitation State',
      getValue: (row) => row.invitationState,
      render: (row) => <span className="text-xs text-slate-700">{row.invitationState}</span>,
    },
    {
      key: 'authenticationType',
      label: 'Authentication Type',
      getValue: (row) => row.authenticationType,
      render: (row) => <span className="text-xs text-slate-700">{row.authenticationType}</span>,
    },
    {
      key: 'permissionGroup',
      label: 'Permission Group',
      getValue: (row) => row.permissionGroup,
      render: (row) => <span className="text-xs text-slate-700">{row.permissionGroup}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      getValue: () => '',
      render: (row) => (
        <ActionGroup
          actions={[
            { label: 'Open User Detail', onClick: () => openUserDrawer(row, onOpenDrawer) },
            { label: 'Assign Role', onClick: () => onAction(`Role assignment initiated for ${row.userName}.`) },
            { label: 'Audit User Activity', onClick: () => onAction(`Audit timeline opened for ${row.userName}.`) },
          ]}
        />
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <SectionIntro
        eyebrow="User & Role Management"
        title="Secure user governance and scalable access administration"
        description="Control user registry, invitation state, role mapping, authentication mode, and permission grouping with operational traceability across tenant and enterprise scopes."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <MiniPanel title="Active administrators" value="184" description="Platform administrators, tenant operators, and access reviewers currently active." icon={Users} tone="healthy" />
        <MiniPanel title="Pending invitations" value="23" description="Awaiting federated acceptance or UAT onboarding verification." icon={LockKeyhole} tone="warning" />
        <MiniPanel title="Permission groups" value="12 curated" description="Grouped by enterprise administration, stewardship, audit visibility, and tenant operations." icon={ShieldCheck} tone="neutral" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
        <EnterpriseTable
          title="User registry table"
          description="Enterprise user administration table with role assignment, domain scope, invitation governance, and authentication visibility."
          rows={rows}
          columns={columns}
          onRowClick={(row) => openUserDrawer(row, onOpenDrawer)}
          emptyTitle="No users match the current search and filter state"
          emptyDescription="Reset filters or broaden the search criteria to recover the user registry list."
        />

        <div className="space-y-6">
          <Card className="rounded-3xl border border-slate-200/80 bg-white/85">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-900">Domain access summary</CardTitle>
              <CardDescription className="text-[11px] text-slate-500">Access posture across tenant and enterprise operating scopes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ProgressRow label="Enterprise-wide administrators" value="84" percent={82} />
              <ProgressRow label="Tenant operators" value="236" percent={71} />
              <ProgressRow label="Knowledge stewards" value="612" percent={93} />
              <ProgressRow label="Audit viewers" value="352" percent={68} />
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-slate-200/80 bg-white/85">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-900">User-to-role mapping panel</CardTitle>
              <CardDescription className="text-[11px] text-slate-500">Representative role coverage within SALVIA platform administration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <MappingCard title="Platform Administrator" description="Global configuration, tenant control, policy scope override, and health export authority." />
              <MappingCard title="Tenant Operator" description="Tenant configuration changes, onboarding follow-up, storage observation, and re-index scheduling." />
              <MappingCard title="Model Steward" description="Model assignment, fallback chain approval, and model runtime governance visibility." />
              <MappingCard title="Audit Viewer" description="Read-only access to configuration history, health evidence, and operational trace outputs." />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function AiModelConfigurationSection({
  rows,
  onOpenDrawer,
  onAction,
}: {
  rows: ModelRow[]
  onOpenDrawer: (drawer: DrawerState) => void
  onAction: (action: string) => void
}) {
  const columns: TableColumn<ModelRow>[] = [
    {
      key: 'modelName',
      label: 'Model Name',
      getValue: (row) => row.modelName,
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.modelName}</p>
          <p className="text-[11px] text-slate-500">{row.provider}</p>
        </div>
      ),
    },
    {
      key: 'modelType',
      label: 'Model Type',
      getValue: (row) => row.modelType,
      render: (row) => <Badge className="border border-emerald-200 bg-emerald-50 text-emerald-800">{row.modelType}</Badge>,
    },
    {
      key: 'assignedUseCase',
      label: 'Assigned Use Case',
      getValue: (row) => row.assignedUseCase,
      render: (row) => <span className="text-xs text-slate-700">{row.assignedUseCase}</span>,
    },
    {
      key: 'version',
      label: 'Version',
      getValue: (row) => row.version,
      render: (row) => <span className="text-xs text-slate-700">{row.version}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      getValue: (row) => row.status,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'fallbackModel',
      label: 'Fallback Model',
      getValue: (row) => row.fallbackModel,
      render: (row) => <span className="text-xs text-slate-700">{row.fallbackModel}</span>,
    },
    {
      key: 'lastUpdated',
      label: 'Last Updated',
      getValue: (row) => row.lastUpdated,
      render: (row) => <span className="text-xs text-slate-700">{row.lastUpdated}</span>,
    },
    {
      key: 'latencyProfile',
      label: 'Latency Profile',
      getValue: (row) => row.latencyProfile,
      render: (row) => <span className="text-xs text-slate-700">{row.latencyProfile}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      getValue: () => '',
      render: (row) => (
        <ActionGroup
          actions={[
            { label: 'Open Model Detail', onClick: () => openModelDrawer(row, onOpenDrawer) },
            { label: 'Assign Use Case', onClick: () => onAction(`Use case assignment opened for ${row.modelName}.`) },
            { label: 'Configure Fallback', onClick: () => onAction(`Fallback configuration opened for ${row.modelName}.`) },
          ]}
        />
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <SectionIntro
        eyebrow="AI Model Configuration"
        title="Controlled, explainable, and enterprise-operable AI model administration"
        description="Manage embedding, LLM, summarization, reasoning, and retrieval models with version awareness, assignment by use case, fallback mapping, and runtime readiness visibility."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]">
        <EnterpriseTable
          title="AI model inventory table"
          description="Approved runtime models across embedding generation, retrieval, summarization, reasoning, and assistant response orchestration."
          rows={rows}
          columns={columns}
          onRowClick={(row) => openModelDrawer(row, onOpenDrawer)}
          emptyTitle="No model configurations match the current filters"
          emptyDescription="Broaden the selected model type, status, or time chips to recover model inventory records."
        />

        <div className="space-y-6">
          <Card className="rounded-3xl border border-slate-200/80 bg-white/85">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-900">Provider mix</CardTitle>
              <CardDescription className="text-[11px] text-slate-500">Balanced provider strategy for control, resilience, and enterprise policy alignment.</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={providerMixData} dataKey="value" nameKey="name" innerRadius={54} outerRadius={84} paddingAngle={3}>
                    {providerMixData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: 16, border: '1px solid #dbe5ef' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-slate-200/80 bg-white/85">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-900">Fallback mapping panel</CardTitle>
              <CardDescription className="text-[11px] text-slate-500">Fallback chains used to preserve continuity under provider or latency degradation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <MappingCard title="Embedding default" description="salvia-embed-fin-3-large -> salvia-embed-fin-2-safe -> cached lexical rescue" />
              <MappingCard title="Assistant LLM" description="llm-knowledge-copilot-core -> llm-knowledge-copilot-safe -> supervised summary mode" />
              <MappingCard title="Collections reasoning" description="reasoning-ops-governor-7 -> reasoning-ops-safe-6 -> controlled FAQ retrieval" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function IndexingStorageSection({
  rows,
  onOpenDrawer,
  onAction,
}: {
  rows: IndexRow[]
  onOpenDrawer: (drawer: DrawerState) => void
  onAction: (action: string) => void
}) {
  const columns: TableColumn<IndexRow>[] = [
    {
      key: 'indexName',
      label: 'Index Name',
      getValue: (row) => row.indexName,
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.indexName}</p>
          <p className="text-[11px] text-slate-500">{row.indexType}</p>
        </div>
      ),
    },
    {
      key: 'storageTier',
      label: 'Storage Tier',
      getValue: (row) => row.storageTier,
      render: (row) => <span className="text-xs text-slate-700">{row.storageTier}</span>,
    },
    {
      key: 'refreshSchedule',
      label: 'Refresh Schedule',
      getValue: (row) => row.refreshSchedule,
      render: (row) => <Badge className="border border-slate-200 bg-slate-50 text-slate-700">{row.refreshSchedule}</Badge>,
    },
    {
      key: 'embeddingAssociation',
      label: 'Embedding Association',
      getValue: (row) => row.embeddingAssociation,
      render: (row) => <span className="text-xs text-slate-700">{row.embeddingAssociation}</span>,
    },
    {
      key: 'storageUsage',
      label: 'Storage Usage',
      getValue: (row) => row.storageUsage,
      render: (row) => <span className="text-xs text-slate-700">{row.storageUsage}</span>,
    },
    {
      key: 'healthScore',
      label: 'Health Score',
      getValue: (row) => row.healthScore,
      render: (row) => <span className="text-xs font-semibold text-slate-900">{row.healthScore}</span>,
    },
    {
      key: 'lastReindexTime',
      label: 'Last Re-index',
      getValue: (row) => row.lastReindexTime,
      render: (row) => <span className="text-xs text-slate-700">{row.lastReindexTime}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      getValue: (row) => row.status,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'environment',
      label: 'Environment',
      getValue: (row) => row.environment,
      render: (row) => <EnvironmentBadge environment={row.environment} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      getValue: () => '',
      render: (row) => (
        <ActionGroup
          actions={[
            { label: 'Open Index Detail', onClick: () => openIndexDrawer(row, onOpenDrawer) },
            { label: 'Run Re-index', onClick: () => onAction(`Re-index requested for ${row.indexName}.`) },
            { label: 'View Storage Usage', onClick: () => onAction(`Storage usage detail opened for ${row.indexName}.`) },
          ]}
        />
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <SectionIntro
        eyebrow="Indexing & Storage Settings"
        title="Operational support layer for retrieval, indexing, and knowledge persistence"
        description="Control vector and lexical index settings, storage tiers, refresh discipline, embedding linkage, and re-indexing history with enterprise-scale operational clarity."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <EnterpriseTable
          title="Index and storage settings table"
          description="Operational index registry with storage visibility, refresh schedule, embedding association, health score, and environment awareness."
          rows={rows}
          columns={columns}
          onRowClick={(row) => openIndexDrawer(row, onOpenDrawer)}
          emptyTitle="No index or storage records match the active filters"
          emptyDescription="Reset the search criteria or filter chips to recover index settings visibility."
        />

        <div className="space-y-6">
          <Card className="rounded-3xl border border-slate-200/80 bg-white/85">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-900">Storage utilization bars</CardTitle>
              <CardDescription className="text-[11px] text-slate-500">Utilization across hot, warm, and archive tiers that support SALVIA retrieval continuity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProgressRow label="Hot SSD" value="78%" percent={78} />
              <ProgressRow label="Warm NVMe" value="66%" percent={66} />
              <ProgressRow label="Cold archive" value="51%" percent={51} />
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-slate-200/80 bg-white/85">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-900">Re-index history timeline</CardTitle>
              <CardDescription className="text-[11px] text-slate-500">Recent re-indexing and refresh events relevant to knowledge availability and search quality.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <HistoryBlock title="knowledge-prod-vector-core" subtitle="Incremental refresh completed with zero failed batches" timestamp="2026-04-17 07:30" />
              <HistoryBlock title="collections-guarded-vector" subtitle="Backlog-induced partial refresh routed to guarded lane" timestamp="2026-04-17 06:10" />
              <HistoryBlock title="archive-governance-cold-search" subtitle="Cold index optimization completed after nightly archival sweep" timestamp="2026-04-16 04:30" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function SystemHealthSection({
  rows,
  onOpenDrawer,
  onAction,
}: {
  rows: ServiceRow[]
  onOpenDrawer: (drawer: DrawerState) => void
  onAction: (action: string) => void
}) {
  const columns: TableColumn<ServiceRow>[] = [
    {
      key: 'serviceName',
      label: 'Service Name',
      getValue: (row) => row.serviceName,
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.serviceName}</p>
          <p className="text-[11px] text-slate-500">{row.componentType}</p>
        </div>
      ),
    },
    {
      key: 'availability',
      label: 'Availability',
      getValue: (row) => row.availability,
      render: (row) => <span className="text-xs font-semibold text-slate-900">{row.availability}</span>,
    },
    {
      key: 'latency',
      label: 'Latency',
      getValue: (row) => row.latency,
      render: (row) => <span className="text-xs text-slate-700">{row.latency}</span>,
    },
    {
      key: 'errorRate',
      label: 'Error Rate',
      getValue: (row) => row.errorRate,
      render: (row) => <span className="text-xs text-slate-700">{row.errorRate}</span>,
    },
    {
      key: 'throughput',
      label: 'Throughput',
      getValue: (row) => row.throughput,
      render: (row) => <span className="text-xs text-slate-700">{row.throughput}</span>,
    },
    {
      key: 'queueDepth',
      label: 'Queue Depth',
      getValue: (row) => row.queueDepth,
      render: (row) => <span className="text-xs text-slate-700">{row.queueDepth}</span>,
    },
    {
      key: 'status',
      label: 'Current Status',
      getValue: (row) => row.status,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'environment',
      label: 'Environment',
      getValue: (row) => row.environment,
      render: (row) => <EnvironmentBadge environment={row.environment} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      getValue: () => '',
      render: (row) => (
        <ActionGroup
          actions={[
            { label: 'Open Service Detail', onClick: () => openServiceDrawer(row, onOpenDrawer) },
            { label: 'Inspect Incident', onClick: () => onAction(`Incident detail opened for ${row.serviceName}.`) },
            { label: 'Open Dependency Map', onClick: () => onAction(`Dependency map opened for ${row.serviceName}.`) },
          ]}
        />
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <SectionIntro
        eyebrow="System Health Monitor"
        title="Live, traceable, and operationally actionable platform health visibility"
        description="Monitor availability, latency, throughput, queue depth, incidents, and component dependency posture to keep SALVIA reliable at enterprise scale."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <MiniPanel title="Availability" value="99.98%" description="Rolling platform availability across all monitored control plane services." icon={Wifi} tone="healthy" />
        <MiniPanel title="Index queue posture" value="17 jobs" description="One queue is elevated but still inside watch-level guardrail." icon={Workflow} tone="warning" />
        <MiniPanel title="Error rate" value="0.17%" description="No error burst crossing the critical escalation threshold." icon={Server} tone="neutral" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <Card className="rounded-3xl border border-slate-200/80 bg-white/85">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-900">Latency and throughput trend</CardTitle>
            <CardDescription className="text-[11px] text-slate-500">Production performance over the last five operational checkpoints.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={healthTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dbe5ef" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <RechartsTooltip contentStyle={{ borderRadius: 16, border: '1px solid #dbe5ef' }} />
                <Line yAxisId="left" type="monotone" dataKey="latency" stroke="#1d4ed8" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line yAxisId="right" type="monotone" dataKey="throughput" stroke="#0f766e" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200/80 bg-white/85">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-900">Service dependency mini-map</CardTitle>
            <CardDescription className="text-[11px] text-slate-500">Dependency posture across configuration, indexing, storage, and telemetry services.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-50/70">
              <ReactFlow
                nodes={healthNodes}
                edges={healthEdges}
                fitView
                minZoom={0.8}
                maxZoom={1.2}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                panOnDrag={false}
                zoomOnScroll={false}
                proOptions={{ hideAttribution: true }}
              >
                <Background color="#e2e8f0" gap={18} />
                <Controls showInteractive={false} />
              </ReactFlow>
            </div>
          </CardContent>
        </Card>
      </div>

      <EnterpriseTable
        title="System health monitoring table"
        description="Current runtime health across monitored SALVIA system services, with operational drill-down and incident traceability."
        rows={rows}
        columns={columns}
        onRowClick={(row) => openServiceDrawer(row, onOpenDrawer)}
        emptyTitle="No services match the active health filters"
        emptyDescription="Reset the selected status, environment, or search terms to recover service visibility."
      />
    </div>
  )
}

function SectionIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <Card className="overflow-hidden rounded-3xl border border-slate-200/80 bg-[linear-gradient(135deg,rgba(15,118,110,0.13),rgba(255,255,255,0.96)_42%,rgba(241,245,249,0.92))] shadow-[0_22px_48px_-28px_rgba(15,23,42,0.35)]">
      <CardContent className="p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-700">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{title}</h2>
        <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-600">{description}</p>
      </CardContent>
    </Card>
  )
}

function MiniPanel({
  title,
  value,
  description,
  icon: Icon,
  tone,
}: {
  title: string
  value: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  tone: DrawerTone
}) {
  return (
    <Card className="rounded-3xl border border-slate-200/80 bg-white/85">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500">{title}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{value}</p>
          </div>
          <div className={cn('rounded-2xl border p-3', toneIconClass(tone))}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-slate-600">{description}</p>
      </CardContent>
    </Card>
  )
}

function MiniStatCard({ label, value, hint, tone }: { label: string; value: string; hint: string; tone: DrawerTone }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] text-slate-500">{label}</p>
        <span className={cn('h-2.5 w-2.5 rounded-full', toneDotClass(tone))} />
      </div>
      <p className="mt-2 text-xl font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-[11px] text-slate-500">{hint}</p>
    </div>
  )
}

function FilterChipGroup<T extends string>({
  label,
  options,
  selected,
  onToggle,
  onReset,
}: {
  label: string
  options: T[]
  selected: T[]
  onToggle: (value: T) => void
  onReset: () => void
}) {
  const allSelected = selected.length === options.length

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={chipClass(allSelected)}
          onClick={onReset}
        >
          All
        </button>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={chipClass(selected.includes(option))}
            onClick={() => onToggle(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

function EnterpriseTable<T extends { id: string }>({
  title,
  description,
  rows,
  columns,
  onRowClick,
  emptyTitle,
  emptyDescription,
}: {
  title: string
  description: string
  rows: T[]
  columns: TableColumn<T>[]
  onRowClick: (row: T) => void
  emptyTitle: string
  emptyDescription: string
}) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  const sortedRows = useMemo(() => {
    if (!sortKey || !sortDirection) {
      return rows
    }

    const activeColumn = columns.find((column) => column.key === sortKey)
    if (!activeColumn || sortKey === 'actions') {
      return rows
    }

    return [...rows].sort((left, right) => {
      const leftValue = activeColumn.getValue(left)
      const rightValue = activeColumn.getValue(right)
      const normalizedLeft = typeof leftValue === 'number' ? leftValue : String(leftValue).toLowerCase()
      const normalizedRight = typeof rightValue === 'number' ? rightValue : String(rightValue).toLowerCase()

      if (normalizedLeft < normalizedRight) {
        return sortDirection === 'asc' ? -1 : 1
      }
      if (normalizedLeft > normalizedRight) {
        return sortDirection === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [rows, columns, sortKey, sortDirection])

  const handleSort = (key: string) => {
    if (key === 'actions') {
      return
    }

    if (sortKey !== key) {
      setSortKey(key)
      setSortDirection('asc')
      return
    }

    if (sortDirection === 'asc') {
      setSortDirection('desc')
      return
    }

    if (sortDirection === 'desc') {
      setSortKey(null)
      setSortDirection(null)
      return
    }

    setSortDirection('asc')
  }

  return (
    <Card className="rounded-3xl border border-slate-200/80 bg-white/85 shadow-[0_22px_48px_-28px_rgba(15,23,42,0.35)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-900">{title}</CardTitle>
        <CardDescription className="text-[11px] text-slate-500">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {sortedRows.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 px-6 py-12 text-center">
            <p className="text-sm font-semibold text-slate-900">{emptyTitle}</p>
            <p className="mt-2 text-[11px] text-slate-500">{emptyDescription}</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-slate-200/80">
            <table className="min-w-full border-separate border-spacing-0 text-left">
              <thead className="sticky top-0 z-10 bg-white/90 backdrop-blur">
                <tr>
                  {columns.map((column) => (
                    <th key={column.key} className={cn('border-b border-slate-200 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500', column.className)}>
                      <button
                        type="button"
                        onClick={() => handleSort(column.key)}
                        className={cn('flex items-center gap-1.5', column.key === 'actions' && 'cursor-default')}
                      >
                        <span>{column.label}</span>
                        {column.key === 'actions' ? null : sortKey === column.key ? (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : sortDirection === 'desc' ? <ChevronDown className="h-4 w-4" /> : <ArrowUpDown className="h-4 w-4 opacity-30" />
                        ) : (
                          <ArrowUpDown className="h-4 w-4 opacity-30" />
                        )}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((row) => (
                  <tr key={row.id} className="cursor-pointer bg-white transition-colors hover:bg-emerald-50/45" onClick={() => onRowClick(row)}>
                    {columns.map((column) => (
                      <td key={column.key} className="border-b border-slate-200 px-4 py-3 align-top text-xs">
                        {column.render(row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ActionGroup({ actions }: { actions: Array<{ label: string; onClick: () => void }> }) {
  return (
    <div className="flex flex-wrap gap-2" onClick={(event) => event.stopPropagation()}>
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          onClick={action.onClick}
          className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-medium text-slate-700 transition-colors hover:border-emerald-300 hover:text-emerald-800"
        >
          {action.label}
        </button>
      ))}
    </div>
  )
}

function DetailDrawer({
  drawer,
  onClose,
  onAction,
}: {
  drawer: DrawerState | null
  onClose: () => void
  onAction: (action: string) => void
}) {
  if (!drawer) {
    return null
  }

  return (
    <div className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-[420px] items-stretch bg-slate-950/10 backdrop-blur-[2px]">
      <div className="ml-auto flex h-full w-full flex-col border-l border-slate-200/80 bg-white shadow-[0_25px_80px_-20px_rgba(15,23,42,0.45)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5">
          <div>
            <Badge className={cn('border-0', toneBadgeClass(drawer.tone))}>{drawerToneLabel(drawer.tone)}</Badge>
            <h3 className="mt-3 text-lg font-semibold text-slate-950">{drawer.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{drawer.subtitle}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-slate-200 p-2 text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-900">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {drawer.metrics.map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
                <p className="text-[11px] text-slate-500">{metric.label}</p>
                <p className="mt-1 text-sm font-semibold text-slate-950">{metric.value}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Operational notes</p>
            <div className="mt-3 space-y-3">
              {drawer.bullets.map((bullet) => (
                <div key={bullet} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-600">
                  {bullet}
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Available actions</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {drawer.actions.map((action) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => onAction(action)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-emerald-300 hover:text-emerald-800"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: RowStatus }) {
  return <Badge className={cn('border-0', statusBadgeClass(status))}>{status}</Badge>
}

function EnvironmentBadge({ environment }: { environment: EnvironmentFilter }) {
  return <Badge className={cn('border border-slate-200', environmentBadgeClass(environment))}>{environment}</Badge>
}

function WarningState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-orange-200 bg-white/90 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-orange-100 p-2 text-orange-700">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-900">{title}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{detail}</p>
        </div>
      </div>
    </div>
  )
}

function ProgressRow({ label, value, percent }: { label: string; value: string; percent: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-slate-900">{value}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-gradient-to-r from-emerald-700 via-teal-600 to-sky-600" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

function MappingCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-3">
      <p className="text-xs font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{description}</p>
    </div>
  )
}

function DetailListItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-3">
      <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 text-xs font-semibold text-slate-900">{value}</p>
    </div>
  )
}

function HistoryBlock({ title, subtitle, timestamp }: { title: string; subtitle: string; timestamp: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-slate-900">{title}</p>
        <span className="text-[10px] text-slate-400">{timestamp}</span>
      </div>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{subtitle}</p>
    </div>
  )
}

function toggleFilterValue<T extends string>(value: T, selected: T[], allValues: T[]): T[] {
  if (selected.length === allValues.length && value === allValues[0]) {
    return allValues
  }
  if (selected.length !== allValues.length && value === allValues[0]) {
    return allValues
  }

  const next = selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]
  return next.length === 0 ? allValues : next
}

function pickModelTimeBucket(timestamp: string): TimeFilter {
  if (timestamp.includes('2026-04-16') || timestamp.includes('2026-04-17')) {
    return 'Today'
  }
  if (timestamp.includes('2026-04-15') || timestamp.includes('2026-04-14') || timestamp.includes('2026-04-13')) {
    return '7 Days'
  }
  return '30 Days'
}

function toneIconClass(tone: DrawerTone) {
  if (tone === 'healthy') return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  if (tone === 'warning') return 'border-orange-200 bg-orange-50 text-orange-700'
  if (tone === 'critical') return 'border-rose-200 bg-rose-50 text-rose-700'
  return 'border-slate-200 bg-slate-50 text-slate-700'
}

function toneTextClass(tone: DrawerTone) {
  if (tone === 'healthy') return 'text-emerald-700'
  if (tone === 'warning') return 'text-orange-700'
  if (tone === 'critical') return 'text-rose-700'
  return 'text-slate-600'
}

function toneDotClass(tone: DrawerTone) {
  if (tone === 'healthy') return 'bg-emerald-500'
  if (tone === 'warning') return 'bg-orange-500'
  if (tone === 'critical') return 'bg-rose-500'
  return 'bg-slate-400'
}

function toneBadgeClass(tone: DrawerTone) {
  if (tone === 'healthy') return 'bg-emerald-100 text-emerald-800'
  if (tone === 'warning') return 'bg-orange-100 text-orange-800'
  if (tone === 'critical') return 'bg-rose-100 text-rose-800'
  return 'bg-slate-100 text-slate-700'
}

function drawerToneLabel(tone: DrawerTone) {
  if (tone === 'healthy') return 'Healthy posture'
  if (tone === 'warning') return 'Attention required'
  if (tone === 'critical') return 'Critical posture'
  return 'Operational detail'
}

function statusBadgeClass(status: RowStatus) {
  if (status === 'Active' || status === 'Healthy') return 'bg-emerald-100 text-emerald-800'
  if (status === 'Warning' || status === 'Pending Review') return 'bg-orange-100 text-orange-800'
  if (status === 'Critical' || status === 'Disabled') return 'bg-rose-100 text-rose-800'
  return 'bg-slate-100 text-slate-700'
}

function environmentBadgeClass(environment: EnvironmentFilter) {
  if (environment === 'Production') return 'bg-emerald-50 text-emerald-800'
  if (environment === 'UAT') return 'bg-amber-50 text-amber-800'
  if (environment === 'Development') return 'bg-sky-50 text-sky-800'
  return 'bg-slate-100 text-slate-700'
}

function chipClass(selected: boolean) {
  return cn(
    'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
    selected ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
  )
}

function flowNodeStyle(borderColor: string, backgroundColor: string) {
  return {
    width: 148,
    borderRadius: 18,
    border: `1px solid ${borderColor}`,
    background: backgroundColor,
    color: '#0f172a',
    fontSize: 11,
    fontWeight: 600,
    padding: '12px 14px',
    textAlign: 'center' as const,
    boxShadow: '0 16px 40px -28px rgba(15,23,42,0.35)',
  }
}

function handleActionToast(addToast: ReturnType<typeof useToast>['addToast']) {
  return (action: string) => {
    addToast({
      title: 'Action captured',
      description: action,
      variant: 'success',
    })
  }
}

function openTenantDrawer(row: TenantRow, onOpenDrawer: (drawer: DrawerState) => void) {
  onOpenDrawer({
    title: row.tenantName,
    subtitle: 'Tenant configuration detail covering environment scope, policy posture, storage allocation, model default, and indexing mode.',
    tone: row.tenantStatus === 'Warning' || row.tenantStatus === 'Pending Review' ? 'warning' : 'healthy',
    metrics: [
      { label: 'Environment', value: row.environment },
      { label: 'Storage allocation', value: row.storageAllocation },
      { label: 'Policy profile', value: row.policyProfile },
      { label: 'Indexing mode', value: row.indexingMode },
    ],
    bullets: [
      `Configuration scope: ${row.configurationScope}.`,
      `Default model set: ${row.defaultModelSet}.`,
      `Onboarding status: ${row.onboardingStatus}; activity visibility: ${row.activityVisibility}.`,
    ],
    actions: ['Open Tenant Detail', 'Edit Configuration', 'View Policy Scope', 'Change Default Setting', 'View History', 'Disable Tenant'],
  })
}

function openUserDrawer(row: UserRow, onOpenDrawer: (drawer: DrawerState) => void) {
  onOpenDrawer({
    title: row.userName,
    subtitle: 'User governance detail spanning identity state, assigned role, permission group, and recent activity visibility.',
    tone: row.status === 'Degraded' || row.status === 'Warning' || row.status === 'Pending Review' ? 'warning' : 'healthy',
    metrics: [
      { label: 'Assigned role', value: row.assignedRole },
      { label: 'Domain scope', value: row.domainScope },
      { label: 'Authentication', value: row.authenticationType },
      { label: 'Last active', value: row.lastActive },
    ],
    bullets: [
      `Invitation state: ${row.invitationState}.`,
      `Permission group: ${row.permissionGroup}.`,
      `Environment scope: ${row.environment}.`,
    ],
    actions: ['Open User Detail', 'Assign Role', 'Revoke Access', 'Reset Invitation', 'View Permission Scope', 'Audit User Activity'],
  })
}

function openModelDrawer(row: ModelRow, onOpenDrawer: (drawer: DrawerState) => void) {
  onOpenDrawer({
    title: row.modelName,
    subtitle: 'AI runtime detail for approved model version, provider, use-case assignment, fallback chain, and latency posture.',
    tone: row.status === 'Warning' || row.status === 'Pending Review' ? 'warning' : 'healthy',
    metrics: [
      { label: 'Model type', value: row.modelType },
      { label: 'Version', value: row.version },
      { label: 'Provider', value: row.provider },
      { label: 'Latency profile', value: row.latencyProfile },
    ],
    bullets: [
      `Assigned use case: ${row.assignedUseCase}.`,
      `Fallback model: ${row.fallbackModel}.`,
      `Configuration scope: ${row.configurationScope}; owner: ${row.owner}.`,
    ],
    actions: ['Open Model Detail', 'Assign Use Case', 'Change Model Version', 'Configure Fallback', 'View Usage Scope', 'Disable Model'],
  })
}

function openIndexDrawer(row: IndexRow, onOpenDrawer: (drawer: DrawerState) => void) {
  onOpenDrawer({
    title: row.indexName,
    subtitle: 'Index detail covering storage tier, refresh cadence, embedding linkage, health score, and re-index evidence.',
    tone: row.status === 'Warning' || row.status === 'Degraded' || row.status === 'Pending Review' ? 'warning' : 'healthy',
    metrics: [
      { label: 'Index type', value: row.indexType },
      { label: 'Storage tier', value: row.storageTier },
      { label: 'Health score', value: row.healthScore },
      { label: 'Last re-index', value: row.lastReindexTime },
    ],
    bullets: [
      `Refresh schedule: ${row.refreshSchedule}.`,
      `Embedding association: ${row.embeddingAssociation}.`,
      `Storage usage: ${row.storageUsage}; environment: ${row.environment}.`,
    ],
    actions: ['Open Index Detail', 'Run Re-index', 'Change Refresh Schedule', 'View Storage Usage', 'Inspect Health Score', 'Edit Storage Policy'],
  })
}

function openServiceDrawer(row: ServiceRow, onOpenDrawer: (drawer: DrawerState) => void) {
  onOpenDrawer({
    title: row.serviceName,
    subtitle: 'Runtime health detail for availability, latency, error rate, queue depth, and service incident posture.',
    tone: row.status === 'Warning' || row.status === 'Degraded' ? 'warning' : 'healthy',
    metrics: [
      { label: 'Component type', value: row.componentType },
      { label: 'Availability', value: row.availability },
      { label: 'Latency', value: row.latency },
      { label: 'Error rate', value: row.errorRate },
    ],
    bullets: [
      `Throughput: ${row.throughput}; queue depth: ${row.queueDepth}.`,
      `Environment: ${row.environment}.`,
      `Last incident summary: ${row.lastIncident}.`,
    ],
    actions: ['Open Service Detail', 'Inspect Incident', 'View Performance Trend', 'Open Dependency Map', 'Export Health Snapshot', 'Mark for Review'],
  })
}