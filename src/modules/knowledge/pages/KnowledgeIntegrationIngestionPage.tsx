import { useMemo, useState } from 'react'
import {
  Activity,
  ArrowUpDown,
  BadgeCheck,
  Cable,
  ChevronDown,
  ChevronUp,
  Clock3,
  Download,
  Eye,
  FileText,
  Filter,
  LayoutGrid,
  Link2,
  RefreshCw,
  ScanSearch,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
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
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { PageHeader } from '@/components/layout/PageHeader'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type WorkspaceSection =
  | 'overview'
  | 'connector'
  | 'pipeline'
  | 'parsing'
  | 'sync'

type SortDirection = 'asc' | 'desc'
type DrawerTone = 'success' | 'warning' | 'danger' | 'info'

type ConnectorStatus = 'Healthy' | 'Syncing' | 'Warning' | 'Failed' | 'Paused'
type SourceType = 'SharePoint' | 'Google Drive' | 'Email' | 'API' | 'Database' | 'File Upload' | 'ECM'
type IngestionMode = 'Batch' | 'Real-time' | 'OCR' | 'ICR' | 'Parsing' | 'Metadata Extraction'
type Domain = 'Customer' | 'Loan' | 'Collection' | 'Finance' | 'Risk' | 'Compliance' | 'Operations'
type PipelineStatus = 'Running' | 'Healthy' | 'Warning' | 'Failed' | 'Paused'
type ParserStatus = 'Healthy' | 'Needs Review' | 'Warning' | 'Failed' | 'Paused'
type SyncStatus = 'Healthy' | 'Syncing' | 'Warning' | 'Failed' | 'Paused'

type ConnectorSortKey =
  | 'name'
  | 'type'
  | 'owner'
  | 'authStatus'
  | 'syncMode'
  | 'lastSync'
  | 'health'
  | 'documentCount'
type PipelineSortKey =
  | 'name'
  | 'source'
  | 'mode'
  | 'jobId'
  | 'processed'
  | 'successCount'
  | 'failureCount'
  | 'owner'
  | 'lastExecution'
  | 'status'
type ParserSortKey =
  | 'name'
  | 'sourceType'
  | 'documentType'
  | 'chunkingMethod'
  | 'chunkSize'
  | 'successRate'
  | 'lastUpdated'
  | 'status'
type SyncSortKey =
  | 'source'
  | 'syncType'
  | 'eventCount'
  | 'lastEventTime'
  | 'latency'
  | 'syncStatus'
  | 'failureEvents'
  | 'retryState'
  | 'backlog'

interface SortState<K extends string> {
  key: K
  direction: SortDirection
}

interface WorkspaceItem {
  key: WorkspaceSection
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  count?: number
}

interface KpiCard {
  label: string
  metric: string
  description: string
  trend: string
  icon: React.ComponentType<{ className?: string }>
  tone: DrawerTone
}

interface ConnectorRow {
  id: string
  name: string
  type: SourceType
  owner: string
  authStatus: string
  syncMode: 'Scheduled' | 'Manual + Scheduled' | 'Event-based' | 'Hybrid'
  lastSync: string
  health: ConnectorStatus
  documentCount: number
  sourceVolume: string
  status: ConnectorStatus
  domain: Domain
  notes: string
}

interface PipelineRow {
  id: string
  name: string
  source: string
  mode: IngestionMode
  jobId: string
  processed: number
  successCount: number
  failureCount: number
  owner: string
  lastExecution: string
  status: PipelineStatus
  stage: string
  throughput: string
}

interface ParserRow {
  id: string
  name: string
  sourceType: SourceType
  documentType: string
  chunkingMethod: string
  chunkSize: number
  metadataMapping: string
  ocrDependency: string
  successRate: number
  lastUpdated: string
  status: ParserStatus
  previewTitle: string
  chunkPreview: string
}

interface SyncRow {
  id: string
  source: string
  syncType: 'Scheduled' | 'Event-based' | 'Hybrid'
  eventCount: number
  lastEventTime: string
  latency: string
  syncStatus: SyncStatus
  failureEvents: number
  retryState: string
  lastSuccessfulSync: string
  backlog: number
  domain: Domain
}

interface DrawerData {
  title: string
  subtitle: string
  tone: DrawerTone
  metrics: Array<{ label: string; value: string }>
  bullets: string[]
  actions: string[]
}

const workspaceItems: WorkspaceItem[] = [
  {
    key: 'overview',
    label: 'Overview',
    description: 'Executive posture for source intake, parsing readiness, and synchronization health.',
    icon: LayoutGrid,
  },
  {
    key: 'connector',
    label: 'Data Source Connector',
    description: 'Govern connected knowledge sources, credentials, ownership, and sync readiness.',
    icon: Link2,
    count: 18,
  },
  {
    key: 'pipeline',
    label: 'Ingestion Pipeline Manager',
    description: 'Track batch, OCR, metadata, and event-driven intake jobs with recoverability evidence.',
    icon: Workflow,
    count: 32,
  },
  {
    key: 'parsing',
    label: 'Parsing Configuration',
    description: 'Control chunk preparation, metadata extraction, OCR dependencies, and parser rules.',
    icon: ScanSearch,
    count: 14,
  },
  {
    key: 'sync',
    label: 'Sync Monitor',
    description: 'Monitor latency, backlog, retry state, and source-level event flow reliability.',
    icon: Activity,
    count: 9,
  },
]

const kpiCards: KpiCard[] = [
  {
    label: 'Connected Sources',
    metric: '18',
    description: 'Governed enterprise knowledge sources currently connected to SALVIA intake controls.',
    trend: '+3 sources activated in the last 30 days',
    icon: Cable,
    tone: 'info',
  },
  {
    label: 'Ingestion Jobs Completed Today',
    metric: '146',
    description: 'Batch, OCR, and metadata jobs finished with traceable processing evidence today.',
    trend: '92.4% completed without manual intervention',
    icon: BadgeCheck,
    tone: 'success',
  },
  {
    label: 'Real-time Sync Events Processed',
    metric: '38,240',
    description: 'New or updated enterprise content events processed from event-based integrations.',
    trend: 'Median event latency 42 seconds',
    icon: RefreshCw,
    tone: 'info',
  },
  {
    label: 'OCR / ICR Documents Processed',
    metric: '1,184',
    description: 'Scanned files converted into searchable text and structured field extractions this week.',
    trend: '61 documents awaiting manual confidence review',
    icon: FileText,
    tone: 'warning',
  },
  {
    label: 'Parsing Success Rate',
    metric: '96.2%',
    description: 'Documents successfully transformed into chunked, AI-ready knowledge assets.',
    trend: '+1.4 pts over the last 7 days',
    icon: ShieldCheck,
    tone: 'success',
  },
  {
    label: 'Metadata Extraction Accuracy',
    metric: '93.8%',
    description: 'Validated title, owner, language, document type, and domain tagging accuracy.',
    trend: 'Highest confidence in compliance and loan domains',
    icon: Sparkles,
    tone: 'success',
  },
]

const statusOptions = ['All', 'Healthy', 'Syncing', 'Running', 'Warning', 'Failed', 'Paused', 'Needs Review'] as const
const sourceTypeOptions = ['All', 'SharePoint', 'Google Drive', 'Email', 'API', 'Database', 'File Upload', 'ECM'] as const
const ingestionModeOptions = ['All', 'Batch', 'Real-time', 'OCR', 'ICR', 'Parsing', 'Metadata Extraction'] as const
const domainOptions = ['All', 'Customer', 'Loan', 'Collection', 'Finance', 'Risk', 'Compliance', 'Operations'] as const
const timeOptions = ['Today', '7 Days', '30 Days', '90 Days', 'Custom Range'] as const

const connectorRows: ConnectorRow[] = [
  {
    id: 'SRC-201',
    name: 'SharePoint Credit Policy Hub',
    type: 'SharePoint',
    owner: 'Credit Governance Office',
    authStatus: 'Token healthy',
    syncMode: 'Hybrid',
    lastSync: '2026-04-16 08:42',
    health: 'Healthy',
    documentCount: 18340,
    sourceVolume: '248 GB',
    status: 'Healthy',
    domain: 'Loan',
    notes: 'Primary source for credit policy, delegated authority matrices, and approval packs.',
  },
  {
    id: 'SRC-202',
    name: 'Collections Shared Drive',
    type: 'Google Drive',
    owner: 'Collection Operations',
    authStatus: 'Token refresh due in 4 days',
    syncMode: 'Scheduled',
    lastSync: '2026-04-16 07:55',
    health: 'Warning',
    documentCount: 6210,
    sourceVolume: '92 GB',
    status: 'Warning',
    domain: 'Collection',
    notes: 'Contains scripts, waiver templates, and exception handling playbooks.',
  },
  {
    id: 'SRC-203',
    name: 'Branch Operations Mailbox',
    type: 'Email',
    owner: 'Retail Operations Control',
    authStatus: 'Service account verified',
    syncMode: 'Event-based',
    lastSync: '2026-04-16 08:46',
    health: 'Syncing',
    documentCount: 2940,
    sourceVolume: '18 GB',
    status: 'Syncing',
    domain: 'Operations',
    notes: 'Captures branch notices, scanned exception forms, and operational circulars.',
  },
  {
    id: 'SRC-204',
    name: 'Customer Document Intake API',
    type: 'API',
    owner: 'Digital Platform Engineering',
    authStatus: 'mTLS active',
    syncMode: 'Event-based',
    lastSync: '2026-04-16 08:45',
    health: 'Healthy',
    documentCount: 98740,
    sourceVolume: '1.2 TB',
    status: 'Healthy',
    domain: 'Customer',
    notes: 'Streams uploaded customer identity and application support files into intake queues.',
  },
  {
    id: 'SRC-205',
    name: 'Loan Origination Case Store',
    type: 'Database',
    owner: 'LOS Platform Team',
    authStatus: 'Credential rotation failed',
    syncMode: 'Scheduled',
    lastSync: '2026-04-16 04:10',
    health: 'Failed',
    documentCount: 44200,
    sourceVolume: '384 GB',
    status: 'Failed',
    domain: 'Loan',
    notes: 'Operational database source for indexed case notes and structured decision artifacts.',
  },
  {
    id: 'SRC-206',
    name: 'Regulatory Circular Dropzone',
    type: 'File Upload',
    owner: 'Compliance Intelligence',
    authStatus: 'Manual upload only',
    syncMode: 'Manual + Scheduled',
    lastSync: '2026-04-16 06:22',
    health: 'Paused',
    documentCount: 1260,
    sourceVolume: '8.6 GB',
    status: 'Paused',
    domain: 'Compliance',
    notes: 'Staging intake for regulator memos, scanned circulars, and legal notices.',
  },
  {
    id: 'SRC-207',
    name: 'Enterprise Content Repository',
    type: 'ECM',
    owner: 'Records and Knowledge Administration',
    authStatus: 'SAML active',
    syncMode: 'Hybrid',
    lastSync: '2026-04-16 08:31',
    health: 'Healthy',
    documentCount: 310450,
    sourceVolume: '4.8 TB',
    status: 'Healthy',
    domain: 'Finance',
    notes: 'Controlled repository for board packs, financial operating manuals, and archival content.',
  },
]

const pipelineRows: PipelineRow[] = [
  {
    id: 'PIPE-401',
    name: 'Daily SharePoint Policy Bulk Ingestion',
    source: 'SharePoint Credit Policy Hub',
    mode: 'Batch',
    jobId: 'JOB-87012',
    processed: 12480,
    successCount: 12394,
    failureCount: 86,
    owner: 'Knowledge Operations',
    lastExecution: '2026-04-16 06:00',
    status: 'Healthy',
    stage: 'Metadata validation',
    throughput: '1,540 docs / min',
  },
  {
    id: 'PIPE-402',
    name: 'Customer Upload Event Intake',
    source: 'Customer Document Intake API',
    mode: 'Real-time',
    jobId: 'EVT-11482',
    processed: 5240,
    successCount: 5206,
    failureCount: 34,
    owner: 'Digital Intake Squad',
    lastExecution: '2026-04-16 08:45',
    status: 'Running',
    stage: 'Chunk preparation',
    throughput: '118 events / min',
  },
  {
    id: 'PIPE-403',
    name: 'Scanned LOS Form OCR Queue',
    source: 'Branch Operations Mailbox',
    mode: 'OCR',
    jobId: 'OCR-22918',
    processed: 820,
    successCount: 764,
    failureCount: 56,
    owner: 'Document Intelligence Team',
    lastExecution: '2026-04-16 08:18',
    status: 'Warning',
    stage: 'Confidence review',
    throughput: '74 pages / min',
  },
  {
    id: 'PIPE-404',
    name: 'Handwritten Form ICR Enrichment',
    source: 'Regulatory Circular Dropzone',
    mode: 'ICR',
    jobId: 'ICR-10842',
    processed: 196,
    successCount: 168,
    failureCount: 28,
    owner: 'Document Intelligence Team',
    lastExecution: '2026-04-16 05:42',
    status: 'Paused',
    stage: 'Manual checkpoint',
    throughput: '18 forms / min',
  },
  {
    id: 'PIPE-405',
    name: 'Operational Note Parsing and Chunking',
    source: 'Collections Shared Drive',
    mode: 'Parsing',
    jobId: 'PAR-50194',
    processed: 3380,
    successCount: 3305,
    failureCount: 75,
    owner: 'Knowledge Engineering',
    lastExecution: '2026-04-16 07:20',
    status: 'Healthy',
    stage: 'Completed',
    throughput: '420 docs / min',
  },
  {
    id: 'PIPE-406',
    name: 'Metadata Harmonization for ECM Imports',
    source: 'Enterprise Content Repository',
    mode: 'Metadata Extraction',
    jobId: 'META-66130',
    processed: 9800,
    successCount: 9426,
    failureCount: 374,
    owner: 'Metadata Governance Desk',
    lastExecution: '2026-04-16 03:55',
    status: 'Failed',
    stage: 'Domain tag mapping',
    throughput: '1,180 docs / min',
  },
]

const parserRows: ParserRow[] = [
  {
    id: 'PAR-101',
    name: 'Loan Policy Structured Parser',
    sourceType: 'SharePoint',
    documentType: 'Policy Document',
    chunkingMethod: 'Semantic sections',
    chunkSize: 850,
    metadataMapping: 'Title, author, effective date, policy family, domain',
    ocrDependency: 'Optional OCR fallback',
    successRate: 98.4,
    lastUpdated: '2026-04-15',
    status: 'Healthy',
    previewTitle: 'Delegated Authority Matrix 2026',
    chunkPreview: 'Section 4.1 defines approval authority thresholds, escalation boundaries, and supporting evidence requirements for restructuring cases.',
  },
  {
    id: 'PAR-102',
    name: 'Scanned Customer Document Parser',
    sourceType: 'File Upload',
    documentType: 'Scanned Application Pack',
    chunkingMethod: 'OCR page blocks',
    chunkSize: 420,
    metadataMapping: 'Customer ID, document class, branch, intake date, language',
    ocrDependency: 'Mandatory OCR / ICR',
    successRate: 91.6,
    lastUpdated: '2026-04-14',
    status: 'Needs Review',
    previewTitle: 'Retail Financing Application Bundle',
    chunkPreview: 'Recognized borrower details, application metadata, and supporting financial statements extracted from mixed printed and handwritten forms.',
  },
  {
    id: 'PAR-103',
    name: 'Operations Mail Semantic Chunker',
    sourceType: 'Email',
    documentType: 'Operations Circular',
    chunkingMethod: 'Intent-aware chunks',
    chunkSize: 620,
    metadataMapping: 'Sender, recipient group, topic, priority, branch impact',
    ocrDependency: 'No OCR dependency',
    successRate: 95.3,
    lastUpdated: '2026-04-13',
    status: 'Healthy',
    previewTitle: 'Branch Operations Service Memo',
    chunkPreview: 'Branch operational memo segmented into service interruption notice, approval instruction, and evidence handling block for downstream retrieval.',
  },
  {
    id: 'PAR-104',
    name: 'ECM Board Pack Metadata Mapper',
    sourceType: 'ECM',
    documentType: 'Board Pack',
    chunkingMethod: 'Hierarchical document outline',
    chunkSize: 1100,
    metadataMapping: 'Meeting date, owner, committee, confidentiality class, domain',
    ocrDependency: 'Optional OCR fallback',
    successRate: 89.8,
    lastUpdated: '2026-04-12',
    status: 'Warning',
    previewTitle: 'Board Risk Oversight Pack',
    chunkPreview: 'Agenda, executive summary, committee decision notes, and supporting appendix content separated for controlled enterprise retrieval.',
  },
]

const syncRows: SyncRow[] = [
  {
    id: 'SYNC-701',
    source: 'Customer Document Intake API',
    syncType: 'Event-based',
    eventCount: 18460,
    lastEventTime: '2026-04-16 08:45',
    latency: '42 sec',
    syncStatus: 'Healthy',
    failureEvents: 12,
    retryState: 'Auto retry enabled',
    lastSuccessfulSync: '2026-04-16 08:45',
    backlog: 18,
    domain: 'Customer',
  },
  {
    id: 'SYNC-702',
    source: 'SharePoint Credit Policy Hub',
    syncType: 'Hybrid',
    eventCount: 4230,
    lastEventTime: '2026-04-16 08:31',
    latency: '2 min 18 sec',
    syncStatus: 'Syncing',
    failureEvents: 4,
    retryState: 'Checkpoint replay active',
    lastSuccessfulSync: '2026-04-16 08:28',
    backlog: 66,
    domain: 'Loan',
  },
  {
    id: 'SYNC-703',
    source: 'Loan Origination Case Store',
    syncType: 'Scheduled',
    eventCount: 1280,
    lastEventTime: '2026-04-16 04:10',
    latency: '14 min 22 sec',
    syncStatus: 'Failed',
    failureEvents: 38,
    retryState: 'Credential revalidation required',
    lastSuccessfulSync: '2026-04-15 23:55',
    backlog: 1240,
    domain: 'Loan',
  },
  {
    id: 'SYNC-704',
    source: 'Branch Operations Mailbox',
    syncType: 'Event-based',
    eventCount: 6180,
    lastEventTime: '2026-04-16 08:46',
    latency: '58 sec',
    syncStatus: 'Healthy',
    failureEvents: 9,
    retryState: 'Auto retry enabled',
    lastSuccessfulSync: '2026-04-16 08:46',
    backlog: 22,
    domain: 'Operations',
  },
  {
    id: 'SYNC-705',
    source: 'Regulatory Circular Dropzone',
    syncType: 'Scheduled',
    eventCount: 142,
    lastEventTime: '2026-04-16 06:22',
    latency: '6 min 05 sec',
    syncStatus: 'Paused',
    failureEvents: 0,
    retryState: 'Manual approval hold',
    lastSuccessfulSync: '2026-04-15 18:20',
    backlog: 84,
    domain: 'Compliance',
  },
]

const ingestionTrend = [
  { label: 'Mon', imported: 14800, parsed: 14120, aiReady: 13640 },
  { label: 'Tue', imported: 15220, parsed: 14680, aiReady: 14210 },
  { label: 'Wed', imported: 16610, parsed: 16080, aiReady: 15510 },
  { label: 'Thu', imported: 17140, parsed: 16490, aiReady: 15960 },
  { label: 'Fri', imported: 18950, parsed: 18120, aiReady: 17680 },
  { label: 'Sat', imported: 10820, parsed: 10340, aiReady: 10060 },
  { label: 'Sun', imported: 9420, parsed: 8990, aiReady: 8720 },
]

const syncTrend = [
  { label: '00:00', events: 1880, latency: 84 },
  { label: '04:00', events: 2240, latency: 78 },
  { label: '08:00', events: 3360, latency: 42 },
  { label: '12:00', events: 2940, latency: 51 },
  { label: '16:00', events: 3110, latency: 56 },
  { label: '20:00', events: 2510, latency: 63 },
]

const metadataQuality = [
  { name: 'Title', value: 97, color: '#0f766e' },
  { name: 'Author', value: 93, color: '#10b981' },
  { name: 'Doc Type', value: 95, color: '#0f766e' },
  { name: 'Language', value: 96, color: '#2dd4bf' },
  { name: 'Domain', value: 88, color: '#f59e0b' },
  { name: 'Custom Map', value: 84, color: '#ea580c' },
]

const sourceHealthMix = [
  { name: 'Healthy', value: 11, color: '#15803d' },
  { name: 'Syncing', value: 3, color: '#0f766e' },
  { name: 'Warning', value: 2, color: '#f59e0b' },
  { name: 'Failed', value: 1, color: '#dc2626' },
  { name: 'Paused', value: 1, color: '#64748b' },
]

const ocrReviewQueue = [
  {
    title: 'Retail financing handwritten application bundle',
    stage: 'ICR review required',
    confidence: '84.2%',
    detail: 'Handwritten branch annotations and supporting income notes need manual validation before publishing chunks.',
  },
  {
    title: 'Vehicle repossession evidence archive',
    stage: 'OCR completed',
    confidence: '96.8%',
    detail: 'Evidence documents recognized successfully and routed to metadata harmonization.',
  },
  {
    title: 'Compliance circular scan set',
    stage: 'Needs review',
    confidence: '79.5%',
    detail: 'Low-confidence stamp and signature regions prevented final approval of extracted entities.',
  },
]

const recentActivity = [
  {
    time: '08:46',
    title: 'New customer-upload event flow checkpoint completed',
    detail: 'Event-based intake processed 144 new identity support files and published metadata plus semantic chunks.',
  },
  {
    time: '08:31',
    title: 'SharePoint policy source synchronized with hybrid delta scan',
    detail: 'Eight amended credit policy documents were parsed, chunked, and re-indexed for AI retrieval.',
  },
  {
    time: '08:18',
    title: 'OCR queue raised confidence exception on scanned LOS forms',
    detail: '56 pages moved to manual review because handwritten account annotations reduced extraction confidence below threshold.',
  },
  {
    time: '07:55',
    title: 'Collections shared drive metadata harmonization completed',
    detail: '3,305 operational notes validated for owner, domain, document type, and retention attributes.',
  },
]

const batchHistory = [
  { time: '06:00', label: 'Daily policy import', result: '12,394 success / 86 failed', owner: 'Knowledge Operations' },
  { time: '05:42', label: 'ICR enrichment hold', result: 'Manual approval checkpoint activated', owner: 'Document Intelligence Team' },
  { time: '03:55', label: 'ECM metadata harmonization', result: '374 failed mappings under investigation', owner: 'Metadata Governance Desk' },
]

const connectorHighlights = [
  {
    title: 'Regulated repositories',
    value: '7',
    detail: 'Sources under higher compliance, audit, or retention control with enforced ownership visibility.',
  },
  {
    title: 'Hybrid sync connectors',
    value: '5',
    detail: 'Sources using both scheduled reconciliation and event-driven delta intake for completeness assurance.',
  },
  {
    title: 'Sources with traceable ownership',
    value: '100%',
    detail: 'Every connector is assigned to an accountable business or engineering owner.',
  },
]

const pipelineStages = [
  { title: 'Source registration', value: '18', detail: 'Connected and governed source definitions active in SALVIA.' },
  { title: 'Ingestion execution', value: '32', detail: 'Batch and event-based pipelines currently controlled in the intake workspace.' },
  { title: 'OCR / ICR review', value: '61', detail: 'Documents requiring confidence validation before activation.' },
  { title: 'AI-ready publication', value: '27.4K', detail: 'Content chunks published to search and assistant retrieval layers today.' },
]

const syncAlerts = [
  {
    title: 'Loan Origination Case Store backlog elevated',
    severity: 'Failed',
    detail: '1,240 pending updates are waiting for credential rotation and replay confirmation.',
  },
  {
    title: 'Regulatory Circular Dropzone on manual approval hold',
    severity: 'Paused',
    detail: 'Compliance has deferred publication until reviewed circulars receive classification approval.',
  },
]

const intakeNodes: Node[] = [
  {
    id: 'source',
    position: { x: 10, y: 90 },
    data: { label: 'Governed Sources' },
    sourcePosition: Position.Right,
    style: intakeNodeStyle('#ecfdf5', '#10b981'),
  },
  {
    id: 'ingestion',
    position: { x: 220, y: 20 },
    data: { label: 'Batch + Event Intake' },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: intakeNodeStyle('#f0fdfa', '#14b8a6'),
  },
  {
    id: 'ocr',
    position: { x: 220, y: 170 },
    data: { label: 'OCR / ICR Review' },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: intakeNodeStyle('#fff7ed', '#f59e0b'),
  },
  {
    id: 'parsing',
    position: { x: 450, y: 20 },
    data: { label: 'Parsing + Chunking' },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: intakeNodeStyle('#f0fdf4', '#22c55e'),
  },
  {
    id: 'metadata',
    position: { x: 450, y: 170 },
    data: { label: 'Metadata Extraction' },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: intakeNodeStyle('#eff6ff', '#3b82f6'),
  },
  {
    id: 'publish',
    position: { x: 690, y: 90 },
    data: { label: 'AI-ready Knowledge Assets' },
    targetPosition: Position.Left,
    style: intakeNodeStyle('#f8fafc', '#0f172a'),
  },
]

const intakeEdges: Edge[] = [
  {
    id: 'e-source-ingestion',
    source: 'source',
    target: 'ingestion',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
    style: { stroke: '#10b981', strokeWidth: 1.8 },
    label: 'registered',
  },
  {
    id: 'e-source-ocr',
    source: 'source',
    target: 'ocr',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' },
    style: { stroke: '#f59e0b', strokeWidth: 1.8 },
    label: 'scanned input',
  },
  {
    id: 'e-ingestion-parsing',
    source: 'ingestion',
    target: 'parsing',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' },
    style: { stroke: '#22c55e', strokeWidth: 1.8 },
  },
  {
    id: 'e-ocr-metadata',
    source: 'ocr',
    target: 'metadata',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
    style: { stroke: '#3b82f6', strokeWidth: 1.8 },
  },
  {
    id: 'e-parsing-publish',
    source: 'parsing',
    target: 'publish',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#0f172a' },
    style: { stroke: '#0f172a', strokeWidth: 1.8 },
  },
  {
    id: 'e-metadata-publish',
    source: 'metadata',
    target: 'publish',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#0f172a' },
    style: { stroke: '#0f172a', strokeWidth: 1.8 },
  },
]

function intakeNodeStyle(background: string, borderColor: string) {
  return {
    borderRadius: 22,
    padding: 14,
    border: `1px solid ${borderColor}`,
    background,
    color: '#0f172a',
    fontWeight: 600,
    width: 180,
    textAlign: 'center' as const,
    boxShadow: '0 18px 45px -34px rgba(15, 23, 42, 0.45)',
  }
}

function matchesSearch(query: string, fields: Array<string | number>) {
  if (!query.trim()) {
    return true
  }

  const normalizedQuery = query.toLowerCase()

  return fields.some((field) => String(field).toLowerCase().includes(normalizedQuery))
}

function toggleFilterValue<T extends string>(current: T[], option: T, allValue: T) {
  if (option === allValue) {
    return [allValue]
  }

  const base = current.includes(allValue) ? [] : current
  const next = base.includes(option)
    ? base.filter((value) => value !== option)
    : [...base, option]

  return next.length === 0 ? [allValue] : next
}

function matchesMultiFilter<T extends string>(selected: T[], value: T, allValue: T) {
  return selected.includes(allValue) || selected.includes(value)
}

function nextSortState<K extends string>(current: SortState<K> | null, key: K): SortState<K> | null {
  if (!current || current.key !== key) {
    return { key, direction: 'asc' }
  }

  if (current.direction === 'asc') {
    return { key, direction: 'desc' }
  }

  return null
}

function sortRows<T, K extends string>(
  rows: T[],
  sortState: SortState<K> | null,
  accessor: (row: T, key: K) => string | number,
) {
  if (!sortState) {
    return rows
  }

  const multiplier = sortState.direction === 'asc' ? 1 : -1

  return [...rows].sort((left, right) => {
    const leftValue = accessor(left, sortState.key)
    const rightValue = accessor(right, sortState.key)

    if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      return (leftValue - rightValue) * multiplier
    }

    return String(leftValue).localeCompare(String(rightValue)) * multiplier
  })
}

function SectionCard({
  title,
  description,
  children,
  className,
}: {
  title: string
  description: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('rounded-[28px] border border-slate-200/80 bg-white/96 p-5 shadow-[0_22px_70px_-58px_rgba(15,23,42,0.8)]', className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors',
        active
          ? 'border-emerald-300 bg-emerald-100 text-emerald-900'
          : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50',
      )}
    >
      {label}
    </button>
  )
}

function StatusBadge({ status }: { status: string }) {
  const toneClassName =
    status === 'Healthy'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : status === 'Syncing' || status === 'Running'
        ? 'border-teal-200 bg-teal-50 text-teal-800'
        : status === 'Warning' || status === 'Needs Review'
          ? 'border-amber-200 bg-amber-50 text-amber-800'
          : status === 'Failed'
            ? 'border-rose-200 bg-rose-50 text-rose-800'
            : 'border-slate-200 bg-slate-100 text-slate-700'

  return <Badge className={cn('rounded-full border px-2.5 py-1 text-[11px] font-medium', toneClassName)}>{status}</Badge>
}

function SortableHeader<K extends string>({
  label,
  column,
  sortState,
  onClick,
  className,
}: {
  label: string
  column: K
  sortState: SortState<K> | null
  onClick: (column: K) => void
  className?: string
}) {
  const isActive = sortState?.key === column
  return (
    <button
      type="button"
      className={cn('inline-flex items-center gap-1 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 transition-colors hover:text-slate-800', className)}
      onClick={() => onClick(column)}
    >
      <span>{label}</span>
      {isActive ? (
        sortState?.direction === 'asc' ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )
      ) : (
        <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
      )}
    </button>
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-8 text-center">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  )
}

export function KnowledgeIntegrationIngestionPage() {
  const [activeSection, setActiveSection] = useState<WorkspaceSection>('overview')
  const [showFilters, setShowFilters] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatuses, setSelectedStatuses] = useState<Array<(typeof statusOptions)[number]>>(['All'])
  const [selectedSourceTypes, setSelectedSourceTypes] = useState<Array<(typeof sourceTypeOptions)[number]>>(['All'])
  const [selectedModes, setSelectedModes] = useState<Array<(typeof ingestionModeOptions)[number]>>(['All'])
  const [selectedDomains, setSelectedDomains] = useState<Array<(typeof domainOptions)[number]>>(['All'])
  const [selectedTimeRange, setSelectedTimeRange] = useState<(typeof timeOptions)[number]>('Today')
  const [drawerData, setDrawerData] = useState<DrawerData | null>(null)
  const [connectorSort, setConnectorSort] = useState<SortState<ConnectorSortKey> | null>({
    key: 'health',
    direction: 'asc',
  })
  const [pipelineSort, setPipelineSort] = useState<SortState<PipelineSortKey> | null>({
    key: 'lastExecution',
    direction: 'desc',
  })
  const [parserSort, setParserSort] = useState<SortState<ParserSortKey> | null>({
    key: 'successRate',
    direction: 'desc',
  })
  const [syncSort, setSyncSort] = useState<SortState<SyncSortKey> | null>({
    key: 'latency',
    direction: 'asc',
  })

  const filteredConnectors = useMemo(() => {
    const rows = connectorRows.filter((row) => {
      const statusMatch = matchesMultiFilter(selectedStatuses, row.status, 'All')
      const sourceMatch = matchesMultiFilter(selectedSourceTypes, row.type, 'All')
      const domainMatch = matchesMultiFilter(selectedDomains, row.domain, 'All')

      return (
        statusMatch &&
        sourceMatch &&
        domainMatch &&
        matchesSearch(searchQuery, [
          row.name,
          row.type,
          row.owner,
          row.authStatus,
          row.syncMode,
          row.lastSync,
          row.notes,
          row.status,
        ])
      )
    })

    return sortRows(rows, connectorSort, (row, key) => row[key])
  }, [connectorSort, searchQuery, selectedDomains, selectedSourceTypes, selectedStatuses])

  const filteredPipelines = useMemo(() => {
    const rows = pipelineRows.filter((row) => {
      const statusMatch = matchesMultiFilter(selectedStatuses, row.status, 'All')
      const sourceMatch = matchesMultiFilter(selectedSourceTypes, connectorRows.find((connector) => connector.name === row.source)?.type ?? 'API', 'All')
      const modeMatch = matchesMultiFilter(selectedModes, row.mode, 'All')
      const connectorDomain = connectorRows.find((connector) => connector.name === row.source)?.domain ?? 'Operations'
      const domainMatch = matchesMultiFilter(selectedDomains, connectorDomain, 'All')

      return (
        statusMatch &&
        sourceMatch &&
        modeMatch &&
        domainMatch &&
        matchesSearch(searchQuery, [
          row.name,
          row.source,
          row.mode,
          row.jobId,
          row.owner,
          row.status,
          row.stage,
          row.throughput,
        ])
      )
    })

    return sortRows(rows, pipelineSort, (row, key) => row[key])
  }, [pipelineSort, searchQuery, selectedDomains, selectedModes, selectedSourceTypes, selectedStatuses])

  const filteredParsers = useMemo(() => {
    const rows = parserRows.filter((row) => {
      const statusMatch = matchesMultiFilter(selectedStatuses, row.status, 'All')
      const sourceMatch = matchesMultiFilter(selectedSourceTypes, row.sourceType, 'All')
      const modeMatch = matchesMultiFilter(selectedModes, 'Parsing', 'All') || matchesMultiFilter(selectedModes, 'Metadata Extraction', 'All')

      return (
        statusMatch &&
        sourceMatch &&
        modeMatch &&
        matchesSearch(searchQuery, [
          row.name,
          row.sourceType,
          row.documentType,
          row.chunkingMethod,
          row.metadataMapping,
          row.ocrDependency,
          row.status,
          row.previewTitle,
        ])
      )
    })

    return sortRows(rows, parserSort, (row, key) => row[key])
  }, [parserSort, searchQuery, selectedModes, selectedSourceTypes, selectedStatuses])

  const filteredSyncs = useMemo(() => {
    const rows = syncRows.filter((row) => {
      const statusMatch = matchesMultiFilter(selectedStatuses, row.syncStatus, 'All')
      const sourceType = connectorRows.find((connector) => connector.name === row.source)?.type ?? 'API'
      const sourceMatch = matchesMultiFilter(selectedSourceTypes, sourceType, 'All')
      const modeValue: IngestionMode = row.syncType === 'Event-based' ? 'Real-time' : 'Batch'
      const modeMatch = matchesMultiFilter(selectedModes, modeValue, 'All')
      const domainMatch = matchesMultiFilter(selectedDomains, row.domain, 'All')

      return (
        statusMatch &&
        sourceMatch &&
        modeMatch &&
        domainMatch &&
        matchesSearch(searchQuery, [
          row.source,
          row.syncType,
          row.lastEventTime,
          row.latency,
          row.syncStatus,
          row.retryState,
          row.lastSuccessfulSync,
        ])
      )
    })

    return sortRows(rows, syncSort, (row, key) => row[key])
  }, [searchQuery, selectedDomains, selectedModes, selectedSourceTypes, selectedStatuses, syncSort])

  const totalFailures = filteredPipelines.reduce((sum, row) => sum + row.failureCount, 0)
  const totalBacklog = filteredSyncs.reduce((sum, row) => sum + row.backlog, 0)
  const sourcesNeedingReview = filteredConnectors.filter((row) => row.status === 'Warning' || row.status === 'Failed' || row.status === 'Paused').length

  const openDrawer = (data: DrawerData) => setDrawerData(data)

  const renderOverview = () => (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[1.3fr_0.9fr]">
        <SectionCard
          title="Ingestion Throughput Trend"
          description="Daily visibility into imported volume, parsing completion, and AI-ready publication throughput."
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ingestionTrend}>
                <defs>
                  <linearGradient id="ingestedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f766e" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="readyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.24} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="imported" stroke="#0f766e" fill="url(#ingestedGradient)" strokeWidth={2} />
                <Area type="monotone" dataKey="aiReady" stroke="#22c55e" fill="url(#readyGradient)" strokeWidth={2} />
                <Line type="monotone" dataKey="parsed" stroke="#0f172a" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard
          title="Source Health Distribution"
          description="Operational spread of connector health across intake sources and monitored synchronization states."
        >
          <div className="grid gap-4 md:grid-cols-[0.95fr_1.05fr] md:items-center">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceHealthMix}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={82}
                    paddingAngle={4}
                  >
                    {sourceHealthMix.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {sourceHealthMix.map((entry) => (
                <div key={entry.name} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-sm font-medium text-slate-900">{entry.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{entry.value}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {entry.name === 'Healthy' && 'Sources are connected, authenticated, and ingesting within expected latency thresholds.'}
                    {entry.name === 'Syncing' && 'Sources are actively processing incremental change sets and event checkpoints.'}
                    {entry.name === 'Warning' && 'Connector attention is required due to latency, retries, or validation drift.'}
                    {entry.name === 'Failed' && 'Source synchronization is interrupted and operational remediation is required.'}
                    {entry.name === 'Paused' && 'Source intake is intentionally held pending review or scheduling approval.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
        <SectionCard
          title="Knowledge Intake Activation Flow"
          description="Operational view of how SALVIA converts distributed content into structured, synchronized, AI-ready enterprise knowledge assets."
        >
          <div className="h-[340px] rounded-3xl border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.12),_transparent_34%),linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(248,250,252,0.96))]">
            <ReactFlow
              nodes={intakeNodes}
              edges={intakeEdges}
              fitView
              attributionPosition="bottom-left"
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
              panOnDrag={false}
              zoomOnScroll={false}
            >
              <MiniMap zoomable pannable nodeColor="#10b981" />
              <Controls showInteractive={false} />
              <Background color="#dbeafe" gap={16} />
            </ReactFlow>
          </div>
        </SectionCard>

        <SectionCard
          title="Recent Intake Activity"
          description="Traceable events showing how source connectivity, parsing, OCR review, and publication health changed across the latest cycles."
        >
          <div className="space-y-3">
            {recentActivity.map((item) => (
              <button
                key={`${item.time}-${item.title}`}
                type="button"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-left transition-colors hover:border-emerald-200 hover:bg-emerald-50/70"
                onClick={() =>
                  openDrawer({
                    title: item.title,
                    subtitle: `Intake event logged at ${item.time}`,
                    tone: 'info',
                    metrics: [
                      { label: 'Time', value: item.time },
                      { label: 'Scope', value: 'Enterprise knowledge intake' },
                    ],
                    bullets: [item.detail, 'Traceability evidence is retained for connector, pipeline, and synchronization review workflows.'],
                    actions: ['Open related source', 'Inspect event flow', 'View processing evidence'],
                  })
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
                  </div>
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600">
                    {item.time}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <SectionCard
          title="Real-time Sync Activity"
          description="Event volume and latency visibility across sources feeding knowledge into SALVIA."
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={syncTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis yAxisId="left" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip />
                <Bar yAxisId="left" dataKey="events" fill="#0f766e" radius={[8, 8, 0, 0]} barSize={26} />
                <Line yAxisId="right" type="monotone" dataKey="latency" stroke="#f59e0b" strokeWidth={2.5} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard
          title="OCR / ICR Readiness"
          description="Operational summary of scanned-document extraction, confidence posture, and review demand."
        >
          <div className="space-y-3">
            {ocrReviewQueue.map((item) => (
              <button
                key={item.title}
                type="button"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-left transition-colors hover:border-amber-200 hover:bg-amber-50/60"
                onClick={() =>
                  openDrawer({
                    title: item.title,
                    subtitle: item.stage,
                    tone: item.stage === 'OCR completed' ? 'success' : 'warning',
                    metrics: [
                      { label: 'Confidence', value: item.confidence },
                      { label: 'Review state', value: item.stage },
                    ],
                    bullets: [item.detail, 'Recognized text and extracted entities remain traceable back to the originating scanned asset.'],
                    actions: ['Preview recognized text', 'Inspect extracted fields', 'Route for manual review'],
                  })
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.stage}</p>
                  </div>
                  <StatusBadge status={item.stage === 'OCR completed' ? 'Healthy' : 'Needs Review'} />
                </div>
                <p className="mt-3 text-sm text-slate-600">{item.detail}</p>
                <p className="mt-3 text-[11px] font-medium text-slate-500">Confidence: {item.confidence}</p>
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Metadata Quality"
          description="Confidence across extracted metadata categories that determine discoverability and operational usefulness."
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metadataQuality} layout="vertical" margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} domain={[0, 100]} />
                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} fontSize={12} width={80} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 10, 10, 0]}>
                  {metadataQuality.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
    </div>
  )

  const renderConnectors = () => (
    <div className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-3">
        {connectorHighlights.map((item) => (
          <button
            key={item.title}
            type="button"
            className="rounded-[24px] border border-slate-200/80 bg-gradient-to-br from-white via-white to-slate-50 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
            onClick={() =>
              openDrawer({
                title: item.title,
                subtitle: 'Connector inventory insight',
                tone: 'info',
                metrics: [{ label: 'Current value', value: item.value }],
                bullets: [item.detail, 'Connector governance records keep ownership, authentication, and source health visible for each source.'],
                actions: ['Open connector detail', 'View source activity'],
              })
            }
          >
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-500">{item.title}</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{item.value}</p>
            <p className="mt-2 text-sm text-slate-600">{item.detail}</p>
          </button>
        ))}
      </div>

      <SectionCard
        title="Connector Inventory"
        description="Operational registry for enterprise knowledge source connectivity, ownership, health posture, and synchronization control."
      >
        {filteredConnectors.length === 0 ? (
          <EmptyState
            title="No connectors match the current intake filters"
            description="Adjust source, status, or domain chips to restore the connector inventory view."
          />
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50/90">
                  <tr>
                    <th className="px-4 py-3"><SortableHeader label="Source Name" column="name" sortState={connectorSort} onClick={(column) => setConnectorSort((current) => nextSortState(current, column))} /></th>
                    <th className="px-4 py-3"><SortableHeader label="Type" column="type" sortState={connectorSort} onClick={(column) => setConnectorSort((current) => nextSortState(current, column))} /></th>
                    <th className="px-4 py-3"><SortableHeader label="Owner" column="owner" sortState={connectorSort} onClick={(column) => setConnectorSort((current) => nextSortState(current, column))} /></th>
                    <th className="px-4 py-3"><SortableHeader label="Auth Status" column="authStatus" sortState={connectorSort} onClick={(column) => setConnectorSort((current) => nextSortState(current, column))} /></th>
                    <th className="px-4 py-3"><SortableHeader label="Sync Mode" column="syncMode" sortState={connectorSort} onClick={(column) => setConnectorSort((current) => nextSortState(current, column))} /></th>
                    <th className="px-4 py-3"><SortableHeader label="Last Sync" column="lastSync" sortState={connectorSort} onClick={(column) => setConnectorSort((current) => nextSortState(current, column))} /></th>
                    <th className="px-4 py-3"><SortableHeader label="Health" column="health" sortState={connectorSort} onClick={(column) => setConnectorSort((current) => nextSortState(current, column))} /></th>
                    <th className="px-4 py-3"><SortableHeader label="Documents" column="documentCount" sortState={connectorSort} onClick={(column) => setConnectorSort((current) => nextSortState(current, column))} /></th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredConnectors.map((row) => (
                    <tr key={row.id} className="transition-colors hover:bg-emerald-50/40">
                      <td className="px-4 py-4 align-top">
                        <div>
                          <p className="font-semibold text-slate-900">{row.name}</p>
                          <p className="mt-1 text-xs text-slate-500">{row.notes}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top"><Badge className="rounded-full border border-slate-200 bg-slate-100 text-slate-700">{row.type}</Badge></td>
                      <td className="px-4 py-4 align-top text-slate-700">{row.owner}</td>
                      <td className="px-4 py-4 align-top text-slate-700">{row.authStatus}</td>
                      <td className="px-4 py-4 align-top text-slate-700">{row.syncMode}</td>
                      <td className="px-4 py-4 align-top text-slate-700">{row.lastSync}</td>
                      <td className="px-4 py-4 align-top"><StatusBadge status={row.health} /></td>
                      <td className="px-4 py-4 align-top text-slate-700">
                        <div className="font-semibold text-slate-900">{row.documentCount.toLocaleString()}</div>
                        <div className="text-xs text-slate-500">{row.sourceVolume}</div>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-emerald-200 hover:bg-emerald-50"
                            onClick={() =>
                              openDrawer({
                                title: row.name,
                                subtitle: `${row.type} connector detail`,
                                tone: row.status === 'Healthy' ? 'success' : row.status === 'Failed' ? 'danger' : row.status === 'Warning' ? 'warning' : 'info',
                                metrics: [
                                  { label: 'Owner', value: row.owner },
                                  { label: 'Auth status', value: row.authStatus },
                                  { label: 'Sync mode', value: row.syncMode },
                                  { label: 'Documents', value: row.documentCount.toLocaleString() },
                                ],
                                bullets: [
                                  row.notes,
                                  `Last synchronized at ${row.lastSync} with ${row.health.toLowerCase()} operational posture.`,
                                ],
                                actions: ['Edit connection', 'Test connection', 'Run sync', 'View source activity'],
                              })
                            }
                          >
                            Open Connector Detail
                          </button>
                          <button type="button" className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-emerald-200 hover:bg-emerald-50">Edit Connection</button>
                          <button type="button" className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-emerald-200 hover:bg-emerald-50">Test Connection</button>
                        </div>
                      </td>
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

  const renderPipelineManager = () => (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {pipelineStages.map((stage) => (
          <div key={stage.title} className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">{stage.title}</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{stage.value}</p>
            <p className="mt-2 text-sm text-slate-600">{stage.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.18fr_0.82fr]">
        <SectionCard
          title="Pipeline Throughput"
          description="Visibility into processed records, successful publications, and ingestion recoverability across the latest job windows."
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredPipelines.length > 0 ? filteredPipelines.slice(0, 5) : pipelineRows.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="jobId" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip />
                <Bar dataKey="successCount" fill="#0f766e" radius={[8, 8, 0, 0]} />
                <Bar dataKey="failureCount" fill="#f97316" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard
          title="Batch History"
          description="Timeline of recent ingestion runs, checkpoints, and recoverability signals."
        >
          <div className="space-y-3">
            {batchHistory.map((item) => (
              <div key={`${item.time}-${item.label}`} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.owner}</p>
                  </div>
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600">{item.time}</span>
                </div>
                <p className="mt-3 text-sm text-slate-600">{item.result}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Pipeline Operations Table"
        description="Controlled workspace for running, retrying, pausing, and reviewing enterprise ingestion jobs."
      >
        {filteredPipelines.length === 0 ? (
          <EmptyState
            title="No ingestion jobs match the selected filters"
            description="Clear mode or status chips to restore pipeline visibility."
          />
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50/90">
                  <tr>
                    <th className="px-4 py-3"><SortableHeader label="Pipeline" column="name" sortState={pipelineSort} onClick={(column) => setPipelineSort((current) => nextSortState(current, column))} /></th>
                    <th className="px-4 py-3"><SortableHeader label="Source" column="source" sortState={pipelineSort} onClick={(column) => setPipelineSort((current) => nextSortState(current, column))} /></th>
                    <th className="px-4 py-3"><SortableHeader label="Mode" column="mode" sortState={pipelineSort} onClick={(column) => setPipelineSort((current) => nextSortState(current, column))} /></th>
                    <th className="px-4 py-3"><SortableHeader label="Job ID" column="jobId" sortState={pipelineSort} onClick={(column) => setPipelineSort((current) => nextSortState(current, column))} /></th>
                    <th className="px-4 py-3"><SortableHeader label="Processed" column="processed" sortState={pipelineSort} onClick={(column) => setPipelineSort((current) => nextSortState(current, column))} /></th>
                    <th className="px-4 py-3"><SortableHeader label="Success" column="successCount" sortState={pipelineSort} onClick={(column) => setPipelineSort((current) => nextSortState(current, column))} /></th>
                    <th className="px-4 py-3"><SortableHeader label="Failure" column="failureCount" sortState={pipelineSort} onClick={(column) => setPipelineSort((current) => nextSortState(current, column))} /></th>
                    <th className="px-4 py-3"><SortableHeader label="Owner" column="owner" sortState={pipelineSort} onClick={(column) => setPipelineSort((current) => nextSortState(current, column))} /></th>
                    <th className="px-4 py-3"><SortableHeader label="Last Execution" column="lastExecution" sortState={pipelineSort} onClick={(column) => setPipelineSort((current) => nextSortState(current, column))} /></th>
                    <th className="px-4 py-3"><SortableHeader label="Status" column="status" sortState={pipelineSort} onClick={(column) => setPipelineSort((current) => nextSortState(current, column))} /></th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Progress</th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredPipelines.map((row) => {
                    const progress = Math.round((row.successCount / Math.max(row.processed, 1)) * 100)
                    return (
                      <tr key={row.id} className="transition-colors hover:bg-emerald-50/40">
                        <td className="px-4 py-4 align-top">
                          <p className="font-semibold text-slate-900">{row.name}</p>
                          <p className="mt-1 text-xs text-slate-500">Current stage: {row.stage}</p>
                        </td>
                        <td className="px-4 py-4 align-top text-slate-700">{row.source}</td>
                        <td className="px-4 py-4 align-top"><Badge className="rounded-full border border-slate-200 bg-slate-100 text-slate-700">{row.mode}</Badge></td>
                        <td className="px-4 py-4 align-top text-slate-700">{row.jobId}</td>
                        <td className="px-4 py-4 align-top text-slate-700">{row.processed.toLocaleString()}</td>
                        <td className="px-4 py-4 align-top text-emerald-700">{row.successCount.toLocaleString()}</td>
                        <td className="px-4 py-4 align-top text-rose-700">{row.failureCount.toLocaleString()}</td>
                        <td className="px-4 py-4 align-top text-slate-700">{row.owner}</td>
                        <td className="px-4 py-4 align-top text-slate-700">{row.lastExecution}</td>
                        <td className="px-4 py-4 align-top"><StatusBadge status={row.status} /></td>
                        <td className="px-4 py-4 align-top">
                          <div className="w-32">
                            <div className="h-2 rounded-full bg-slate-200">
                              <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${progress}%` }} />
                            </div>
                            <p className="mt-1 text-[11px] text-slate-500">{progress}% success ratio</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-emerald-200 hover:bg-emerald-50"
                              onClick={() =>
                                openDrawer({
                                  title: row.name,
                                  subtitle: `${row.mode} pipeline detail`,
                                  tone: row.status === 'Failed' ? 'danger' : row.status === 'Warning' ? 'warning' : 'info',
                                  metrics: [
                                    { label: 'Job ID', value: row.jobId },
                                    { label: 'Processed', value: row.processed.toLocaleString() },
                                    { label: 'Success', value: row.successCount.toLocaleString() },
                                    { label: 'Failures', value: row.failureCount.toLocaleString() },
                                  ],
                                  bullets: [
                                    `Throughput is currently ${row.throughput} with the pipeline in ${row.stage.toLowerCase()} stage.`,
                                    `Operational owner: ${row.owner}. Last execution recorded at ${row.lastExecution}.`,
                                  ],
                                  actions: ['Run ingestion job', 'Retry failed job', 'Open failure log', 'View processed content'],
                                })
                              }
                            >
                              Open Pipeline Detail
                            </button>
                            <button type="button" className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-emerald-200 hover:bg-emerald-50">Retry Failed Job</button>
                            <button type="button" className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-emerald-200 hover:bg-emerald-50">Pause Pipeline</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  )

  const renderParsingConfiguration = () => (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[1.06fr_0.94fr]">
        <SectionCard
          title="Parsing Rule Inventory"
          description="Rule coverage across structured and unstructured sources with chunking and metadata strategy visibility."
        >
          <div className="grid gap-3 md:grid-cols-2">
            {filteredParsers.map((row) => (
              <button
                key={row.id}
                type="button"
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-left transition-colors hover:border-emerald-200 hover:bg-emerald-50/70"
                onClick={() =>
                  openDrawer({
                    title: row.name,
                    subtitle: `${row.documentType} parsing rule`,
                    tone: row.status === 'Healthy' ? 'success' : row.status === 'Failed' ? 'danger' : 'warning',
                    metrics: [
                      { label: 'Source type', value: row.sourceType },
                      { label: 'Chunking', value: row.chunkingMethod },
                      { label: 'Chunk size', value: `${row.chunkSize} tokens` },
                      { label: 'Success rate', value: `${row.successRate}%` },
                    ],
                    bullets: [
                      row.metadataMapping,
                      `OCR / ICR dependency: ${row.ocrDependency}. Latest sample output is ready for preview.`,
                    ],
                    actions: ['Open parsing rule', 'Preview parsed output', 'Test parser', 'View extraction mapping'],
                  })
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{row.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{row.documentType}</p>
                  </div>
                  <StatusBadge status={row.status} />
                </div>
                <div className="mt-3 space-y-2 text-xs text-slate-600">
                  <p>Chunking method: {row.chunkingMethod}</p>
                  <p>Chunk size: {row.chunkSize} tokens</p>
                  <p>Metadata mapping: {row.metadataMapping}</p>
                </div>
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Chunk and Metadata Preview"
          description="Inspect AI-readiness outputs before publication to search and assistant retrieval layers."
        >
          <div className="space-y-4">
            {filteredParsers.slice(0, 2).map((row) => (
              <div key={`${row.id}-preview`} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{row.previewTitle}</p>
                    <p className="mt-1 text-xs text-slate-500">{row.name}</p>
                  </div>
                  <Badge className="rounded-full border border-slate-200 bg-white text-slate-700">{row.chunkingMethod}</Badge>
                </div>
                <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm leading-relaxed text-slate-700">
                  {row.chunkPreview}
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                  <Badge className="rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800">Chunk Size {row.chunkSize}</Badge>
                  <Badge className="rounded-full border border-slate-200 bg-white text-slate-700">{row.ocrDependency}</Badge>
                  <Badge className="rounded-full border border-slate-200 bg-white text-slate-700">{row.successRate}% success</Badge>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Parsing Configuration Table"
        description="Structured view of parser rules, chunk settings, metadata mapping, OCR dependency, and operational success."
      >
        {filteredParsers.length === 0 ? (
          <EmptyState
            title="No parsing rules match the current selection"
            description="Expand the mode or status filters to inspect parsing and metadata configurations."
          />
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50/90">
                  <tr>
                    <th className="px-4 py-3"><SortableHeader label="Parser Rule" column="name" sortState={parserSort} onClick={(column) => setParserSort((current) => nextSortState(current, column))} /></th>
                    <th className="px-4 py-3"><SortableHeader label="Source Type" column="sourceType" sortState={parserSort} onClick={(column) => setParserSort((current) => nextSortState(current, column))} /></th>
                    <th className="px-4 py-3"><SortableHeader label="Document Type" column="documentType" sortState={parserSort} onClick={(column) => setParserSort((current) => nextSortState(current, column))} /></th>
                    <th className="px-4 py-3"><SortableHeader label="Chunking Method" column="chunkingMethod" sortState={parserSort} onClick={(column) => setParserSort((current) => nextSortState(current, column))} /></th>
                    <th className="px-4 py-3"><SortableHeader label="Chunk Size" column="chunkSize" sortState={parserSort} onClick={(column) => setParserSort((current) => nextSortState(current, column))} /></th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Metadata Mapping</th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">OCR / ICR Dependency</th>
                    <th className="px-4 py-3"><SortableHeader label="Success Rate" column="successRate" sortState={parserSort} onClick={(column) => setParserSort((current) => nextSortState(current, column))} /></th>
                    <th className="px-4 py-3"><SortableHeader label="Last Updated" column="lastUpdated" sortState={parserSort} onClick={(column) => setParserSort((current) => nextSortState(current, column))} /></th>
                    <th className="px-4 py-3"><SortableHeader label="Status" column="status" sortState={parserSort} onClick={(column) => setParserSort((current) => nextSortState(current, column))} /></th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredParsers.map((row) => (
                    <tr key={row.id} className="transition-colors hover:bg-emerald-50/40">
                      <td className="px-4 py-4 align-top font-semibold text-slate-900">{row.name}</td>
                      <td className="px-4 py-4 align-top text-slate-700">{row.sourceType}</td>
                      <td className="px-4 py-4 align-top text-slate-700">{row.documentType}</td>
                      <td className="px-4 py-4 align-top text-slate-700">{row.chunkingMethod}</td>
                      <td className="px-4 py-4 align-top text-slate-700">{row.chunkSize}</td>
                      <td className="px-4 py-4 align-top text-slate-700">{row.metadataMapping}</td>
                      <td className="px-4 py-4 align-top text-slate-700">{row.ocrDependency}</td>
                      <td className="px-4 py-4 align-top text-slate-700">{row.successRate}%</td>
                      <td className="px-4 py-4 align-top text-slate-700">{row.lastUpdated}</td>
                      <td className="px-4 py-4 align-top"><StatusBadge status={row.status} /></td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex flex-wrap gap-2">
                          <button type="button" className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-emerald-200 hover:bg-emerald-50">Open Parsing Rule</button>
                          <button
                            type="button"
                            className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-emerald-200 hover:bg-emerald-50"
                            onClick={() =>
                              openDrawer({
                                title: row.previewTitle,
                                subtitle: 'Parsed output preview',
                                tone: 'info',
                                metrics: [
                                  { label: 'Rule', value: row.name },
                                  { label: 'Chunk size', value: `${row.chunkSize}` },
                                ],
                                bullets: [row.chunkPreview, row.metadataMapping],
                                actions: ['Preview parsed output', 'Edit chunking configuration', 'Enable or disable rule'],
                              })
                            }
                          >
                            Preview Parsed Output
                          </button>
                        </div>
                      </td>
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

  const renderSyncMonitor = () => (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {syncAlerts.map((item) => (
          <button
            key={item.title}
            type="button"
            className="rounded-[24px] border border-slate-200 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md"
            onClick={() =>
              openDrawer({
                title: item.title,
                subtitle: `${item.severity} synchronization alert`,
                tone: item.severity === 'Failed' ? 'danger' : 'warning',
                metrics: [
                  { label: 'Severity', value: item.severity },
                  { label: 'Current backlog', value: `${totalBacklog.toLocaleString()} items` },
                ],
                bullets: [item.detail, 'Source-to-ingestion traceability remains available for replay, remediation, and audit workflows.'],
                actions: ['Inspect event flow', 'Retry sync', 'View failure events'],
              })
            }
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-2 text-sm text-slate-600">{item.detail}</p>
              </div>
              <StatusBadge status={item.severity} />
            </div>
          </button>
        ))}

        <div className="rounded-[24px] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-4 text-white shadow-lg">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-100/80">Current backlog</p>
          <p className="mt-2 text-3xl font-bold">{totalBacklog.toLocaleString()}</p>
          <p className="mt-2 text-sm text-slate-200">Pending events waiting for replay, checkpoint confirmation, or downstream parsing completion.</p>
        </div>
      </div>

      <SectionCard
        title="Synchronization Monitoring Table"
        description="Source-level timeline for scheduled and event-based synchronization, including latency, retry posture, and backlog traceability."
      >
        {filteredSyncs.length === 0 ? (
          <EmptyState
            title="No sync monitors match the selected criteria"
            description="Update the source type or status filters to restore live synchronization visibility."
          />
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50/90">
                  <tr>
                    <th className="px-4 py-3"><SortableHeader label="Source" column="source" sortState={syncSort} onClick={(column) => setSyncSort((current) => nextSortState(current, column))} /></th>
                    <th className="px-4 py-3"><SortableHeader label="Sync Type" column="syncType" sortState={syncSort} onClick={(column) => setSyncSort((current) => nextSortState(current, column))} /></th>
                    <th className="px-4 py-3"><SortableHeader label="Event Count" column="eventCount" sortState={syncSort} onClick={(column) => setSyncSort((current) => nextSortState(current, column))} /></th>
                    <th className="px-4 py-3"><SortableHeader label="Last Event" column="lastEventTime" sortState={syncSort} onClick={(column) => setSyncSort((current) => nextSortState(current, column))} /></th>
                    <th className="px-4 py-3"><SortableHeader label="Latency" column="latency" sortState={syncSort} onClick={(column) => setSyncSort((current) => nextSortState(current, column))} /></th>
                    <th className="px-4 py-3"><SortableHeader label="Status" column="syncStatus" sortState={syncSort} onClick={(column) => setSyncSort((current) => nextSortState(current, column))} /></th>
                    <th className="px-4 py-3"><SortableHeader label="Failures" column="failureEvents" sortState={syncSort} onClick={(column) => setSyncSort((current) => nextSortState(current, column))} /></th>
                    <th className="px-4 py-3"><SortableHeader label="Retry State" column="retryState" sortState={syncSort} onClick={(column) => setSyncSort((current) => nextSortState(current, column))} /></th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Last Success</th>
                    <th className="px-4 py-3"><SortableHeader label="Backlog" column="backlog" sortState={syncSort} onClick={(column) => setSyncSort((current) => nextSortState(current, column))} /></th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredSyncs.map((row) => (
                    <tr key={row.id} className="transition-colors hover:bg-emerald-50/40">
                      <td className="px-4 py-4 align-top font-semibold text-slate-900">{row.source}</td>
                      <td className="px-4 py-4 align-top text-slate-700">{row.syncType}</td>
                      <td className="px-4 py-4 align-top text-slate-700">{row.eventCount.toLocaleString()}</td>
                      <td className="px-4 py-4 align-top text-slate-700">{row.lastEventTime}</td>
                      <td className="px-4 py-4 align-top text-slate-700">{row.latency}</td>
                      <td className="px-4 py-4 align-top"><StatusBadge status={row.syncStatus} /></td>
                      <td className="px-4 py-4 align-top text-slate-700">{row.failureEvents}</td>
                      <td className="px-4 py-4 align-top text-slate-700">{row.retryState}</td>
                      <td className="px-4 py-4 align-top text-slate-700">{row.lastSuccessfulSync}</td>
                      <td className="px-4 py-4 align-top text-slate-700">{row.backlog.toLocaleString()}</td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-emerald-200 hover:bg-emerald-50"
                            onClick={() =>
                              openDrawer({
                                title: row.source,
                                subtitle: `${row.syncType} sync detail`,
                                tone: row.syncStatus === 'Healthy' ? 'success' : row.syncStatus === 'Failed' ? 'danger' : 'warning',
                                metrics: [
                                  { label: 'Latency', value: row.latency },
                                  { label: 'Backlog', value: row.backlog.toLocaleString() },
                                  { label: 'Failure events', value: row.failureEvents.toString() },
                                  { label: 'Last success', value: row.lastSuccessfulSync },
                                ],
                                bullets: [
                                  `Current retry posture: ${row.retryState}.`,
                                  `Last event recorded at ${row.lastEventTime} with ${row.eventCount.toLocaleString()} events observed in the selected window.`,
                                ],
                                actions: ['Open sync detail', 'Inspect event flow', 'Retry sync', 'Open related source'],
                              })
                            }
                          >
                            Open Sync Detail
                          </button>
                          <button type="button" className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-emerald-200 hover:bg-emerald-50">Retry Sync</button>
                          <button type="button" className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-emerald-200 hover:bg-emerald-50">View Failure Events</button>
                        </div>
                      </td>
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

  const renderWorkspace = () => {
    if (activeSection === 'connector') {
      return renderConnectors()
    }

    if (activeSection === 'pipeline') {
      return renderPipelineManager()
    }

    if (activeSection === 'parsing') {
      return renderParsingConfiguration()
    }

    if (activeSection === 'sync') {
      return renderSyncMonitor()
    }

    return renderOverview()
  }

  return (
    <div className="space-y-6 pb-8">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/' },
          { label: 'Knowledge Repository & Content Management', href: '/knowledge' },
          { label: 'Knowledge Structuring & Ontology Management', href: '/knowledge-structuring-ontology' },
          { label: 'Search, Discovery & Retrieval', href: '/search-discovery-retrieval' },
          { label: 'AI Knowledge Assistant', href: '/ai-knowledge-assistant' },
          { label: 'Knowledge Integration & Ingestion' },
        ]}
      />

      <PageHeader
        title="Knowledge Integration & Ingestion"
        description="Central enterprise workspace for connecting, ingesting, parsing, synchronizing, and operationally controlling knowledge intake from distributed enterprise sources into AI-ready SALVIA knowledge assets."
        right={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className={cn(
                'rounded-lg p-2.5 h-auto',
                showFilters && 'ring-1 ring-border/50 shadow-sm bg-emerald-50 text-emerald-800 border-emerald-300',
              )}
              aria-label="Hide filters"
              title="Hide filters"
              onClick={() => setShowFilters((current) => !current)}
            >
              <Filter className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              className="rounded-lg p-2.5 h-auto"
              aria-label="Export workspace"
              title="Export workspace"
            >
              <Download className="h-5 w-5" />
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {kpiCards.map((card) => {
          const Icon = card.icon
          return (
            <button
              key={card.label}
              type="button"
              className="group relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),_transparent_34%),linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(248,250,252,0.94))] p-4 text-left shadow-[0_22px_70px_-58px_rgba(15,23,42,0.82)] transition-all hover:-translate-y-0.5 hover:border-emerald-300"
              onClick={() =>
                openDrawer({
                  title: card.label,
                  subtitle: `Operational scope: ${selectedTimeRange}`,
                  tone: card.tone,
                  metrics: [
                    { label: 'Current metric', value: card.metric },
                    { label: 'Selected time range', value: selectedTimeRange },
                  ],
                  bullets: [card.description, card.trend],
                  actions: ['Open related source', 'Open pipeline detail', 'Inspect synchronization evidence'],
                })
              }
            >
              <div className="relative z-10">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-500">{card.label}</p>
                    <p className="mt-2 text-2xl font-bold text-slate-950">{card.metric}</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-200 bg-white p-2.5 text-emerald-700">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-slate-600">{card.description}</p>
                <p className="mt-2 text-[11px] font-medium text-emerald-700">{card.trend}</p>
              </div>
              <Icon className="absolute -bottom-4 right-2 h-16 w-16 text-emerald-100/80" />
            </button>
          )
        })}
      </div>

      {showFilters ? (
        <div className="rounded-[28px] border border-slate-200/80 bg-white/96 p-4 shadow-[0_22px_70px_-60px_rgba(15,23,42,0.8)]">
          <div className="space-y-4">
            <div className="grid gap-3 xl:grid-cols-[1.35fr_0.65fr] xl:items-start">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search source name, connector type, ingestion job ID, pipeline name, document title, OCR batch, sync event, metadata field, parsing rule, or source owner"
                  className="h-10 w-full rounded-xl border-slate-200 bg-white/80 pl-9 pr-20 text-sm"
                />
                <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-emerald-700"
                    aria-label="Preview search scope"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span>Filtered sources</span>
                    <span className="font-semibold text-slate-900">{filteredConnectors.length}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                    <ShieldAlert className="h-4 w-4 text-amber-500" />
                    {sourcesNeedingReview} connectors require review or remediation.
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span>Failure volume</span>
                    <span className="font-semibold text-slate-900">{totalFailures.toLocaleString()}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                    <Clock3 className="h-4 w-4 text-emerald-600" />
                    Backlog currently stands at {totalBacklog.toLocaleString()} events.
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 xl:grid-cols-4">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Status</p>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((option) => (
                    <FilterChip
                      key={option}
                      label={option}
                      active={selectedStatuses.includes(option)}
                      onClick={() => setSelectedStatuses((current) => toggleFilterValue(current, option, 'All'))}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Source Type</p>
                <div className="flex flex-wrap gap-2">
                  {sourceTypeOptions.map((option) => (
                    <FilterChip
                      key={option}
                      label={option}
                      active={selectedSourceTypes.includes(option)}
                      onClick={() => setSelectedSourceTypes((current) => toggleFilterValue(current, option, 'All'))}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Ingestion Mode</p>
                <div className="flex flex-wrap gap-2">
                  {ingestionModeOptions.map((option) => (
                    <FilterChip
                      key={option}
                      label={option}
                      active={selectedModes.includes(option)}
                      onClick={() => setSelectedModes((current) => toggleFilterValue(current, option, 'All'))}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Domain and Time</p>
                <div className="flex flex-wrap gap-2">
                  {domainOptions.map((option) => (
                    <FilterChip
                      key={option}
                      label={option}
                      active={selectedDomains.includes(option)}
                      onClick={() => setSelectedDomains((current) => toggleFilterValue(current, option, 'All'))}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {timeOptions.map((option) => (
                    <FilterChip
                      key={option}
                      label={option}
                      active={selectedTimeRange === option}
                      onClick={() => setSelectedTimeRange(option)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-4 py-3 text-xs text-slate-500">
              <span>
                Operational search scope is applied across connectors, pipeline jobs, parsing rules, and synchronization monitors.
              </span>
              <button
                type="button"
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 transition-colors hover:border-emerald-200 hover:bg-emerald-50"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedStatuses(['All'])
                  setSelectedSourceTypes(['All'])
                  setSelectedModes(['All'])
                  setSelectedDomains(['All'])
                  setSelectedTimeRange('Today')
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-20 xl:self-start">
          <div className="rounded-[30px] border border-slate-200/80 bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.16),_transparent_34%),linear-gradient(180deg,_rgba(248,250,252,0.98),_rgba(255,255,255,0.96))] p-4 shadow-[0_22px_70px_-58px_rgba(15,23,42,0.8)]">
            <div className="mb-4 rounded-[24px] border border-emerald-200 bg-white/90 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Workspace Navigator</p>
              <p className="mt-2 text-sm font-semibold text-slate-950">Enterprise intake control layer</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                SALVIA operationally connects, synchronizes, parses, enriches, and activates enterprise content for trusted search and AI usage.
              </p>
            </div>

            <div className="space-y-2">
              {workspaceItems.map((item) => {
                const Icon = item.icon
                const isActive = activeSection === item.key

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveSection(item.key)}
                    className={cn(
                      'w-full rounded-[22px] border p-4 text-left transition-all',
                      isActive
                        ? 'border-emerald-300 bg-emerald-50 shadow-sm'
                        : 'border-slate-200 bg-white/85 hover:border-emerald-200 hover:bg-emerald-50/60',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className={cn('rounded-2xl border p-2.5', isActive ? 'border-emerald-200 bg-white text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-600')}>
                        <Icon className="h-4 w-4" />
                      </div>
                      {item.count ? (
                        <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-medium', isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600')}>
                          {item.count}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-950">{item.label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.description}</p>
                  </button>
                )
              })}
            </div>

            <div className="mt-4 rounded-[24px] border border-slate-200 bg-slate-950 p-4 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100/85">Intake posture</p>
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Sync health</span>
                  <span className="font-semibold">91.6%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Parsing readiness</span>
                  <span className="font-semibold">96.2%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Review queue</span>
                  <span className="font-semibold">61 documents</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div>{renderWorkspace()}</div>
      </div>

      {drawerData ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/30 backdrop-blur-[2px]">
          <button type="button" className="flex-1 cursor-default" aria-label="Close detail drawer" onClick={() => setDrawerData(null)} />
          <div className="h-full w-full max-w-md border-l border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Detail drawer</p>
                <h2 className="mt-2 text-xl font-bold text-slate-950">{drawerData.title}</h2>
                <p className="mt-1 text-sm text-slate-500">{drawerData.subtitle}</p>
              </div>
              <button
                type="button"
                className="rounded-full border border-slate-200 p-2 text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-800"
                onClick={() => setDrawerData(null)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {drawerData.metrics.map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{metric.label}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{metric.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-sm font-semibold text-slate-900">Operational notes</p>
              <div className="mt-3 space-y-3">
                {drawerData.bullets.map((bullet) => (
                  <div key={bullet} className="flex items-start gap-3 text-sm text-slate-600">
                    <span className={cn(
                      'mt-1 h-2.5 w-2.5 rounded-full',
                      drawerData.tone === 'success'
                        ? 'bg-emerald-500'
                        : drawerData.tone === 'warning'
                          ? 'bg-amber-500'
                          : drawerData.tone === 'danger'
                            ? 'bg-rose-500'
                            : 'bg-sky-500',
                    )} />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">Available actions</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {drawerData.actions.map((action) => (
                  <button
                    key={action}
                    type="button"
                    className="rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-700 transition-colors hover:border-emerald-200 hover:bg-emerald-50"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}