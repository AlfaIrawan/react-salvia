import { useMemo, useState, type ReactNode } from 'react'
import {
  ArrowUpDown,
  BadgeCheck,
  BookCheck,
  CalendarClock,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleDashed,
  Clock3,
  CopyCheck,
  Download,
  FileBadge2,
  Filter,
  Layers3,
  Search,
  Shield,
  ShieldCheck,
  Users,
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
import { PageHeader } from '@/components/layout/PageHeader'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type WorkspaceSection = 'overview' | 'quality' | 'validation' | 'duplicate' | 'health'
type SortDirection = 'asc' | 'desc' | null
type Domain = 'Customer' | 'Loan' | 'Collection' | 'Finance' | 'Risk' | 'Compliance' | 'Operations'
type QualityStatus =
  | 'Healthy'
  | 'Warning'
  | 'Critical'
  | 'Pending Validation'
  | 'In Review'
  | 'Approved'
  | 'Rejected'
  | 'Outdated'
type TrustLevel = 'Trusted' | 'Moderate Confidence' | 'Low Confidence' | 'Unverified'
type FreshnessStatus = 'Fresh' | 'Review Due' | 'Stale' | 'Outdated'
type ValidationStage = 'Submitted' | 'Evidence Review' | 'Steward Review' | 'Decision' | 'Published'
type ValidationStatus = 'Pending Validation' | 'In Review' | 'Approved' | 'Rejected' | 'Revision Requested'
type DuplicateType = 'Exact Duplicate' | 'Near Duplicate' | 'Concept Overlap'
type DuplicateStatus = 'Open' | 'In Review' | 'Confirmed Duplicate' | 'Cleared'
type LifecycleState = 'Active' | 'Review Pending' | 'Expiring' | 'Archived'

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
  trend?: string
  tone: 'trust' | 'warning' | 'critical' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
  targetSection: WorkspaceSection
}

interface QualityAsset {
  id: string
  title: string
  qualityScore: number
  qualityStatus: QualityStatus
  completeness: number
  metadataQuality: number
  freshnessStatus: FreshnessStatus
  trustScore: number
  trustLevel: TrustLevel
  owner: string
  validator: string
  lastUpdated: string
  domain: Domain
  trend: number[]
  standards: string
  relatedContent: string
  validationEvidence: string
}

interface ValidationAsset {
  id: string
  assetTitle: string
  validationStage: ValidationStage
  assignedValidator: string
  reviewOwner: string
  validationStatus: ValidationStatus
  submissionDate: string
  decisionDate: string
  evidenceStatus: 'Complete' | 'Partial' | 'Missing'
  commentsCount: number
  trustImpact: TrustLevel
  domain: Domain
  validationHistory: string[]
}

interface DuplicateAsset {
  id: string
  groupId: string
  primaryAsset: string
  similarAsset: string
  similarityScore: number
  duplicateType: DuplicateType
  owner: string
  status: DuplicateStatus
  resolutionRecommendation: string
  lastReviewed: string
  domain: Domain
  severity: 'High' | 'Medium' | 'Low'
}

interface HealthAsset {
  id: string
  assetTitle: string
  lastUpdated: string
  reviewDueDate: string
  freshnessStatus: FreshnessStatus
  outdatedRisk: 'High' | 'Medium' | 'Low'
  owner: string
  domain: Domain
  trustScore: number
  trustLevel: TrustLevel
  recommendedAction: string
  lifecycleState: LifecycleState
  trustTrend: number[]
}

interface DrawerState {
  title: string
  subtitle: string
  tone: 'trust' | 'warning' | 'critical' | 'neutral'
  metrics: Array<{ label: string; value: string }>
  bullets: string[]
  actions: string[]
}

interface SortState<T extends string> {
  key: T
  direction: SortDirection
}

const workspaceItems: WorkspaceItem[] = [
  {
    key: 'overview',
    label: 'Overview',
    description: 'Trust posture, quality maturity, and validation readiness at platform level.',
    icon: Layers3,
  },
  {
    key: 'quality',
    label: 'Knowledge Quality Dashboard',
    description: 'Score quality dimensions, freshness signals, metadata completeness, and trust posture.',
    icon: Shield,
    count: 128,
  },
  {
    key: 'validation',
    label: 'Validation Workflow',
    description: 'Control evidence-based validation, approvals, reviewer accountability, and history.',
    icon: BookCheck,
    count: 27,
  },
  {
    key: 'duplicate',
    label: 'Duplicate Detection Panel',
    description: 'Investigate exact duplicates, near matches, and controlled resolution decisions.',
    icon: CopyCheck,
    count: 19,
  },
  {
    key: 'health',
    label: 'Content Health Monitor',
    description: 'Monitor stale assets, review due windows, trust deterioration, and update urgency.',
    icon: CalendarClock,
    count: 34,
  },
]

const kpiCards: KpiCard[] = [
  {
    label: 'Average Knowledge Quality Score',
    metric: '84.7',
    description: 'Composite quality score across completeness, structure, metadata, freshness, and compliance.',
    trend: '+2.9 points versus last month',
    tone: 'trust',
    icon: ShieldCheck,
    targetSection: 'quality',
  },
  {
    label: 'Assets Pending Validation',
    metric: '27',
    description: 'Knowledge assets waiting for evidence review, steward review, or formal decision capture.',
    trend: '9 due within 24 hours',
    tone: 'warning',
    icon: FileBadge2,
    targetSection: 'validation',
  },
  {
    label: 'Duplicate Candidates Open',
    metric: '19',
    description: 'Open duplicate clusters requiring ownership confirmation, merge readiness, or retirement action.',
    trend: '6 high-severity duplicate clusters',
    tone: 'critical',
    icon: CopyCheck,
    targetSection: 'duplicate',
  },
  {
    label: 'Outdated Content Identified',
    metric: '34',
    description: 'Assets showing stale signals, overdue review, or trust deterioration risk.',
    trend: '11 assets escalated this week',
    tone: 'warning',
    icon: Clock3,
    targetSection: 'health',
  },
  {
    label: 'Human Reviews In Progress',
    metric: '16',
    description: 'Collaborative review cases actively worked by validators, editors, and subject matter owners.',
    trend: 'Median turnaround 1.8 business days',
    tone: 'neutral',
    icon: Users,
    targetSection: 'validation',
  },
  {
    label: 'Trusted Knowledge Coverage',
    metric: '71%',
    description: 'Share of enterprise knowledge currently approved and suitable for employee and AI consumption.',
    trend: '+5% quarter to date',
    tone: 'trust',
    icon: BadgeCheck,
    targetSection: 'overview',
  },
]

const qualityAssets: QualityAsset[] = [
  {
    id: 'KQ-1042',
    title: 'Retail Loan Eligibility Decision Playbook',
    qualityScore: 93,
    qualityStatus: 'Healthy',
    completeness: 96,
    metadataQuality: 94,
    freshnessStatus: 'Fresh',
    trustScore: 92,
    trustLevel: 'Trusted',
    owner: 'Retail Credit Governance',
    validator: 'Maya Pratama',
    lastUpdated: '2026-04-14',
    domain: 'Loan',
    trend: [84, 86, 88, 90, 91, 93],
    standards: 'Policy mapping complete; template format aligned.',
    relatedContent: 'Linked to 4 approval rules and 2 exception policies.',
    validationEvidence: 'Reviewer sign-off and regulatory cross-reference attached.',
  },
  {
    id: 'KQ-1043',
    title: 'Collections Hardship Restructuring FAQ',
    qualityScore: 74,
    qualityStatus: 'Warning',
    completeness: 78,
    metadataQuality: 71,
    freshnessStatus: 'Review Due',
    trustScore: 69,
    trustLevel: 'Moderate Confidence',
    owner: 'Collection Strategy Office',
    validator: 'Rian Gumelar',
    lastUpdated: '2026-02-19',
    domain: 'Collection',
    trend: [81, 80, 79, 77, 75, 74],
    standards: 'Formatting gaps in escalation examples.',
    relatedContent: 'Two linked hardship circulars pending refresh.',
    validationEvidence: 'Last validation evidence older than 90 days.',
  },
  {
    id: 'KQ-1044',
    title: 'Branch Cash Handling Incident Runbook',
    qualityScore: 61,
    qualityStatus: 'Critical',
    completeness: 58,
    metadataQuality: 67,
    freshnessStatus: 'Outdated',
    trustScore: 52,
    trustLevel: 'Low Confidence',
    owner: 'Branch Operations Control',
    validator: 'Dana Kusuma',
    lastUpdated: '2025-11-09',
    domain: 'Operations',
    trend: [79, 75, 71, 68, 64, 61],
    standards: 'Runbook references archived incident matrix.',
    relatedContent: 'Linked branch annex has duplicate update streams.',
    validationEvidence: 'Evidence package incomplete and approval expired.',
  },
  {
    id: 'KQ-1045',
    title: 'Customer Identity Verification Knowledge Pack',
    qualityScore: 88,
    qualityStatus: 'Pending Validation',
    completeness: 92,
    metadataQuality: 86,
    freshnessStatus: 'Fresh',
    trustScore: 78,
    trustLevel: 'Moderate Confidence',
    owner: 'Customer Due Diligence Office',
    validator: 'Ayu Mandiri',
    lastUpdated: '2026-04-12',
    domain: 'Customer',
    trend: [76, 80, 82, 84, 86, 88],
    standards: 'Policy references are complete; awaiting final validator decision.',
    relatedContent: 'Connected to onboarding checklist and fraud controls.',
    validationEvidence: 'Evidence uploaded; final approval not yet issued.',
  },
  {
    id: 'KQ-1046',
    title: 'Finance Closing Checklist and Reviewer Notes',
    qualityScore: 82,
    qualityStatus: 'In Review',
    completeness: 84,
    metadataQuality: 81,
    freshnessStatus: 'Review Due',
    trustScore: 77,
    trustLevel: 'Moderate Confidence',
    owner: 'Finance Governance',
    validator: 'Nina Anggraini',
    lastUpdated: '2026-03-28',
    domain: 'Finance',
    trend: [78, 79, 81, 81, 82, 82],
    standards: 'Narrative quality acceptable; checklist evidence under review.',
    relatedContent: 'Cross-links to month-end control library.',
    validationEvidence: 'Supporting files uploaded; reviewer comments open.',
  },
  {
    id: 'KQ-1047',
    title: 'AML Escalation Domain Decision Guide',
    qualityScore: 90,
    qualityStatus: 'Approved',
    completeness: 91,
    metadataQuality: 93,
    freshnessStatus: 'Fresh',
    trustScore: 94,
    trustLevel: 'Trusted',
    owner: 'Compliance Intelligence',
    validator: 'Laras Wijaya',
    lastUpdated: '2026-04-11',
    domain: 'Compliance',
    trend: [86, 87, 88, 89, 90, 90],
    standards: 'Formatting and control evidence aligned with AML handbook.',
    relatedContent: 'Referenced by 3 investigation procedures.',
    validationEvidence: 'Approval chain complete with evidence archive.',
  },
]

const validationQueue: ValidationAsset[] = [
  {
    id: 'VAL-3101',
    assetTitle: 'Customer Identity Verification Knowledge Pack',
    validationStage: 'Evidence Review',
    assignedValidator: 'Ayu Mandiri',
    reviewOwner: 'Digital Onboarding Stewards',
    validationStatus: 'Pending Validation',
    submissionDate: '2026-04-12',
    decisionDate: 'Pending',
    evidenceStatus: 'Complete',
    commentsCount: 6,
    trustImpact: 'Moderate Confidence',
    domain: 'Customer',
    validationHistory: ['Submitted by owner', 'Evidence package uploaded', 'Validator review opened'],
  },
  {
    id: 'VAL-3102',
    assetTitle: 'Finance Closing Checklist and Reviewer Notes',
    validationStage: 'Steward Review',
    assignedValidator: 'Nina Anggraini',
    reviewOwner: 'Finance Governance',
    validationStatus: 'In Review',
    submissionDate: '2026-04-09',
    decisionDate: 'Pending',
    evidenceStatus: 'Partial',
    commentsCount: 11,
    trustImpact: 'Moderate Confidence',
    domain: 'Finance',
    validationHistory: ['Evidence checklist requested', 'Editor notes added', 'Turnaround watch applied'],
  },
  {
    id: 'VAL-3103',
    assetTitle: 'Branch Cash Handling Incident Runbook',
    validationStage: 'Decision',
    assignedValidator: 'Dana Kusuma',
    reviewOwner: 'Branch Operations Control',
    validationStatus: 'Rejected',
    submissionDate: '2026-04-02',
    decisionDate: '2026-04-15',
    evidenceStatus: 'Missing',
    commentsCount: 14,
    trustImpact: 'Low Confidence',
    domain: 'Operations',
    validationHistory: ['Owner submission accepted', 'Evidence gap identified', 'Rejected with revision mandate'],
  },
  {
    id: 'VAL-3104',
    assetTitle: 'Retail Loan Eligibility Decision Playbook',
    validationStage: 'Published',
    assignedValidator: 'Maya Pratama',
    reviewOwner: 'Retail Credit Governance',
    validationStatus: 'Approved',
    submissionDate: '2026-04-05',
    decisionDate: '2026-04-14',
    evidenceStatus: 'Complete',
    commentsCount: 4,
    trustImpact: 'Trusted',
    domain: 'Loan',
    validationHistory: ['Evidence confirmed', 'Reviewer notes closed', 'Approved and published'],
  },
  {
    id: 'VAL-3105',
    assetTitle: 'Collections Hardship Restructuring FAQ',
    validationStage: 'Submitted',
    assignedValidator: 'Rian Gumelar',
    reviewOwner: 'Collection Strategy Office',
    validationStatus: 'Revision Requested',
    submissionDate: '2026-04-13',
    decisionDate: 'Pending',
    evidenceStatus: 'Partial',
    commentsCount: 8,
    trustImpact: 'Moderate Confidence',
    domain: 'Collection',
    validationHistory: ['Revision requested for stale policy references', 'Validator reassignment prepared'],
  },
]

const duplicateAssets: DuplicateAsset[] = [
  {
    id: 'DUP-4401',
    groupId: 'DG-209',
    primaryAsset: 'Collections Hardship Restructuring FAQ',
    similarAsset: 'Collections Relief FAQ 2025',
    similarityScore: 96,
    duplicateType: 'Exact Duplicate',
    owner: 'Collection Strategy Office',
    status: 'Open',
    resolutionRecommendation: 'Retire older FAQ and redirect linked search results.',
    lastReviewed: '2026-04-15',
    domain: 'Collection',
    severity: 'High',
  },
  {
    id: 'DUP-4402',
    groupId: 'DG-214',
    primaryAsset: 'Retail Loan Eligibility Decision Playbook',
    similarAsset: 'Retail Lending Decision Guideline',
    similarityScore: 83,
    duplicateType: 'Near Duplicate',
    owner: 'Retail Credit Governance',
    status: 'In Review',
    resolutionRecommendation: 'Merge rule references and preserve the newest evidence trail.',
    lastReviewed: '2026-04-16',
    domain: 'Loan',
    severity: 'Medium',
  },
  {
    id: 'DUP-4403',
    groupId: 'DG-218',
    primaryAsset: 'AML Escalation Domain Decision Guide',
    similarAsset: 'AML Investigation Response Matrix',
    similarityScore: 71,
    duplicateType: 'Concept Overlap',
    owner: 'Compliance Intelligence',
    status: 'Cleared',
    resolutionRecommendation: 'Retain both assets and refine semantic tags to reduce collision.',
    lastReviewed: '2026-04-10',
    domain: 'Compliance',
    severity: 'Low',
  },
  {
    id: 'DUP-4404',
    groupId: 'DG-221',
    primaryAsset: 'Branch Cash Handling Incident Runbook',
    similarAsset: 'Branch Cash Escalation Guide',
    similarityScore: 89,
    duplicateType: 'Near Duplicate',
    owner: 'Branch Operations Control',
    status: 'Confirmed Duplicate',
    resolutionRecommendation: 'Archive redundant guide after steward approval.',
    lastReviewed: '2026-04-11',
    domain: 'Operations',
    severity: 'High',
  },
]

const healthAssets: HealthAsset[] = [
  {
    id: 'HLT-5501',
    assetTitle: 'Branch Cash Handling Incident Runbook',
    lastUpdated: '2025-11-09',
    reviewDueDate: '2026-03-15',
    freshnessStatus: 'Outdated',
    outdatedRisk: 'High',
    owner: 'Branch Operations Control',
    domain: 'Operations',
    trustScore: 52,
    trustLevel: 'Low Confidence',
    recommendedAction: 'Assign urgent reviewer and replace archived references before further use.',
    lifecycleState: 'Review Pending',
    trustTrend: [76, 70, 65, 60, 57, 52],
  },
  {
    id: 'HLT-5502',
    assetTitle: 'Collections Hardship Restructuring FAQ',
    lastUpdated: '2026-02-19',
    reviewDueDate: '2026-04-18',
    freshnessStatus: 'Review Due',
    outdatedRisk: 'Medium',
    owner: 'Collection Strategy Office',
    domain: 'Collection',
    trustScore: 69,
    trustLevel: 'Moderate Confidence',
    recommendedAction: 'Refresh policy references and extend review date after validator acceptance.',
    lifecycleState: 'Review Pending',
    trustTrend: [78, 77, 74, 73, 70, 69],
  },
  {
    id: 'HLT-5503',
    assetTitle: 'Customer Identity Verification Knowledge Pack',
    lastUpdated: '2026-04-12',
    reviewDueDate: '2026-06-30',
    freshnessStatus: 'Fresh',
    outdatedRisk: 'Low',
    owner: 'Customer Due Diligence Office',
    domain: 'Customer',
    trustScore: 78,
    trustLevel: 'Moderate Confidence',
    recommendedAction: 'Complete final approval to raise trust confidence for AI usage.',
    lifecycleState: 'Active',
    trustTrend: [70, 72, 74, 75, 77, 78],
  },
  {
    id: 'HLT-5504',
    assetTitle: 'AML Escalation Domain Decision Guide',
    lastUpdated: '2026-04-11',
    reviewDueDate: '2026-07-11',
    freshnessStatus: 'Fresh',
    outdatedRisk: 'Low',
    owner: 'Compliance Intelligence',
    domain: 'Compliance',
    trustScore: 94,
    trustLevel: 'Trusted',
    recommendedAction: 'Maintain current review cadence and preserve evidence lineage.',
    lifecycleState: 'Active',
    trustTrend: [87, 89, 90, 91, 93, 94],
  },
  {
    id: 'HLT-5505',
    assetTitle: 'Finance Closing Checklist and Reviewer Notes',
    lastUpdated: '2026-03-28',
    reviewDueDate: '2026-04-29',
    freshnessStatus: 'Stale',
    outdatedRisk: 'Medium',
    owner: 'Finance Governance',
    domain: 'Finance',
    trustScore: 77,
    trustLevel: 'Moderate Confidence',
    recommendedAction: 'Complete evidence attachment and close reviewer notes before month-end use.',
    lifecycleState: 'Expiring',
    trustTrend: [81, 80, 80, 79, 78, 77],
  },
]

const qualityTrendData = [
  { month: 'Nov', score: 77, coverage: 58 },
  { month: 'Dec', score: 79, coverage: 60 },
  { month: 'Jan', score: 80, coverage: 63 },
  { month: 'Feb', score: 82, coverage: 65 },
  { month: 'Mar', score: 83, coverage: 68 },
  { month: 'Apr', score: 85, coverage: 71 },
]

const outdatedTrendData = [
  { window: 'Week 1', outdated: 29, reviewDue: 18 },
  { window: 'Week 2', outdated: 31, reviewDue: 20 },
  { window: 'Week 3', outdated: 37, reviewDue: 23 },
  { window: 'Week 4', outdated: 34, reviewDue: 19 },
]

const trustDistributionData = [
  { name: 'Trusted', value: 71, color: '#1f8f63' },
  { name: 'Moderate Confidence', value: 18, color: '#0f766e' },
  { name: 'Low Confidence', value: 8, color: '#d97706' },
  { name: 'Unverified', value: 3, color: '#c2410c' },
]

const validationSnapshot = [
  { label: 'Pending Validation', value: 12, tone: 'warning' },
  { label: 'In Review', value: 16, tone: 'neutral' },
  { label: 'Approved This Week', value: 9, tone: 'trust' },
  { label: 'Rejected or Revision', value: 5, tone: 'critical' },
]

const duplicateClusterCards = [
  {
    title: 'Collections policy clusters',
    detail: '4 open duplicate groups driven by overlapping hardship FAQ variants and inherited branch copies.',
    badge: 'High overlap',
  },
  {
    title: 'Loan decision guidance clusters',
    detail: '3 near-duplicate decision guides competing for top search placement and AI retrieval.',
    badge: 'Merge candidate',
  },
  {
    title: 'Operations stale copy clusters',
    detail: '2 archived runbooks still referenced by branch workspaces despite newer validated content.',
    badge: 'Retire redundant copy',
  },
]

const recentActivities = [
  {
    title: 'Retail Loan Eligibility Decision Playbook approved',
    description: 'Validation evidence closed and trust score raised to trusted for search and AI assistant use.',
    time: '35 minutes ago',
    tone: 'trust',
  },
  {
    title: 'Duplicate cluster DG-209 escalated',
    description: 'Collections hardship FAQ pair moved to steward review for retirement decision.',
    time: '2 hours ago',
    tone: 'warning',
  },
  {
    title: 'Branch Cash Handling Incident Runbook rejected',
    description: 'Evidence package incomplete and stale references triggered critical trust downgrade.',
    time: 'Yesterday',
    tone: 'critical',
  },
]

const validationNodes: Node[] = [
  {
    id: 'submitted',
    position: { x: 0, y: 40 },
    data: { label: 'Submission' },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: flowNodeStyle('#dbeafe', '#1d4ed8'),
  },
  {
    id: 'evidence',
    position: { x: 220, y: 0 },
    data: { label: 'Evidence Review' },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: flowNodeStyle('#ecfccb', '#4d7c0f'),
  },
  {
    id: 'human',
    position: { x: 220, y: 90 },
    data: { label: 'Human Steward Review' },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: flowNodeStyle('#fef3c7', '#b45309'),
  },
  {
    id: 'decision',
    position: { x: 470, y: 40 },
    data: { label: 'Approval Decision' },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: flowNodeStyle('#dcfce7', '#15803d'),
  },
  {
    id: 'publish',
    position: { x: 710, y: 40 },
    data: { label: 'Trusted Release' },
    targetPosition: Position.Left,
    style: flowNodeStyle('#e0f2fe', '#0369a1'),
  },
]

const validationEdges: Edge[] = [
  {
    id: 's-e',
    source: 'submitted',
    target: 'evidence',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#1d4ed8' },
    style: { stroke: '#1d4ed8', strokeWidth: 1.5 },
  },
  {
    id: 's-h',
    source: 'submitted',
    target: 'human',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#b45309' },
    style: { stroke: '#b45309', strokeWidth: 1.5 },
  },
  {
    id: 'e-d',
    source: 'evidence',
    target: 'decision',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#15803d' },
    style: { stroke: '#15803d', strokeWidth: 1.5 },
  },
  {
    id: 'h-d',
    source: 'human',
    target: 'decision',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#15803d' },
    style: { stroke: '#15803d', strokeWidth: 1.5 },
  },
  {
    id: 'd-p',
    source: 'decision',
    target: 'publish',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#0369a1' },
    style: { stroke: '#0369a1', strokeWidth: 1.5 },
  },
]

const statusOptions = ['All', 'Healthy', 'Warning', 'Critical', 'Pending Validation', 'In Review', 'Approved', 'Rejected', 'Outdated'] as const
const qualityOptions = ['High Quality', 'Medium Quality', 'Low Quality', 'Incomplete', 'Duplicate Risk', 'Stale'] as const
const trustOptions = ['Trusted', 'Moderate Confidence', 'Low Confidence', 'Unverified'] as const
const domainOptions = ['Customer', 'Loan', 'Collection', 'Finance', 'Risk', 'Compliance', 'Operations'] as const
const timeOptions = ['Today', '7 Days', '30 Days', '90 Days', 'Custom Range'] as const

const qualityColumns = [
  { key: 'title', label: 'Knowledge Asset Title' },
  { key: 'qualityScore', label: 'Quality Score' },
  { key: 'qualityStatus', label: 'Quality Status' },
  { key: 'completeness', label: 'Completeness' },
  { key: 'metadataQuality', label: 'Metadata Quality' },
  { key: 'freshnessStatus', label: 'Freshness Status' },
  { key: 'trustScore', label: 'Trust Score' },
  { key: 'owner', label: 'Owner' },
  { key: 'lastUpdated', label: 'Last Updated' },
  { key: 'domain', label: 'Domain' },
] as const

const validationColumns = [
  { key: 'assetTitle', label: 'Asset Title' },
  { key: 'validationStage', label: 'Validation Stage' },
  { key: 'assignedValidator', label: 'Assigned Validator' },
  { key: 'reviewOwner', label: 'Review Owner' },
  { key: 'validationStatus', label: 'Validation Status' },
  { key: 'submissionDate', label: 'Submission Date' },
  { key: 'decisionDate', label: 'Decision Date' },
  { key: 'evidenceStatus', label: 'Evidence Status' },
  { key: 'commentsCount', label: 'Comments' },
  { key: 'trustImpact', label: 'Trust Impact' },
] as const

const duplicateColumns = [
  { key: 'groupId', label: 'Duplicate Group ID' },
  { key: 'primaryAsset', label: 'Primary Asset' },
  { key: 'similarAsset', label: 'Similar Asset' },
  { key: 'similarityScore', label: 'Similarity Score' },
  { key: 'duplicateType', label: 'Duplicate Type' },
  { key: 'owner', label: 'Owner' },
  { key: 'status', label: 'Status' },
  { key: 'resolutionRecommendation', label: 'Resolution Recommendation' },
  { key: 'lastReviewed', label: 'Last Reviewed' },
  { key: 'domain', label: 'Domain' },
] as const

const healthColumns = [
  { key: 'assetTitle', label: 'Asset Title' },
  { key: 'lastUpdated', label: 'Last Updated' },
  { key: 'reviewDueDate', label: 'Review Due Date' },
  { key: 'freshnessStatus', label: 'Freshness Status' },
  { key: 'outdatedRisk', label: 'Outdated Risk' },
  { key: 'owner', label: 'Owner' },
  { key: 'domain', label: 'Domain' },
  { key: 'trustScore', label: 'Trust Score' },
  { key: 'recommendedAction', label: 'Recommended Action' },
  { key: 'lifecycleState', label: 'Current Lifecycle State' },
] as const

const baseDate = new Date('2026-04-16T00:00:00')

export function KnowledgeQualityValidationPage() {
  const [activeSection, setActiveSection] = useState<WorkspaceSection>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['All'])
  const [selectedQualityTags, setSelectedQualityTags] = useState<string[]>([...qualityOptions])
  const [selectedTrustTags, setSelectedTrustTags] = useState<string[]>([...trustOptions])
  const [selectedDomains, setSelectedDomains] = useState<string[]>(['Customer', 'Loan', 'Collection', 'Finance', 'Risk', 'Compliance', 'Operations'])
  const [selectedTimeTags, setSelectedTimeTags] = useState<string[]>(['30 Days'])
  const [showFilters, setShowFilters] = useState(true)
  const [drawer, setDrawer] = useState<DrawerState | null>(null)
  const [qualitySort, setQualitySort] = useState<SortState<(typeof qualityColumns)[number]['key']>>({ key: 'qualityScore', direction: 'desc' })
  const [validationSort, setValidationSort] = useState<SortState<(typeof validationColumns)[number]['key']>>({ key: 'submissionDate', direction: 'desc' })
  const [duplicateSort, setDuplicateSort] = useState<SortState<(typeof duplicateColumns)[number]['key']>>({ key: 'similarityScore', direction: 'desc' })
  const [healthSort, setHealthSort] = useState<SortState<(typeof healthColumns)[number]['key']>>({ key: 'reviewDueDate', direction: 'asc' })
  const [exportMessage, setExportMessage] = useState<string | null>(null)

  const filteredQualityAssets = useMemo(() => {
    return applySort(
      qualityAssets.filter((asset) => {
        const matchesStatus = matchStatus(asset.qualityStatus, selectedStatuses)
        const matchesQuality = matchQualityBand(asset, selectedQualityTags)
        const matchesTrust = matchTrust(asset.trustLevel, selectedTrustTags)
        const matchesDomain = selectedDomains.includes(asset.domain)
        const matchesTime = matchDateWindow(asset.lastUpdated, selectedTimeTags)
        const matchesSearch = matchesText(
          searchQuery,
          asset.title,
          asset.owner,
          asset.validator,
          asset.domain,
          asset.qualityStatus,
          asset.trustLevel,
          asset.standards,
        )
        return matchesStatus && matchesQuality && matchesTrust && matchesDomain && matchesTime && matchesSearch
      }),
      qualitySort,
    )
  }, [qualitySort, searchQuery, selectedDomains, selectedQualityTags, selectedStatuses, selectedTimeTags, selectedTrustTags])

  const filteredValidationQueue = useMemo(() => {
    return applySort(
      validationQueue.filter((asset) => {
        const matchesStatus = matchStatus(asset.validationStatus, selectedStatuses)
        const matchesTrust = matchTrust(asset.trustImpact, selectedTrustTags)
        const matchesDomain = selectedDomains.includes(asset.domain)
        const matchesTime = matchDateWindow(asset.submissionDate, selectedTimeTags)
        const matchesSearch = matchesText(
          searchQuery,
          asset.assetTitle,
          asset.assignedValidator,
          asset.reviewOwner,
          asset.validationStatus,
          asset.validationStage,
          asset.domain,
          asset.id,
        )
        return matchesStatus && matchesTrust && matchesDomain && matchesTime && matchesSearch
      }),
      validationSort,
    )
  }, [validationSort, searchQuery, selectedDomains, selectedStatuses, selectedTimeTags, selectedTrustTags])

  const filteredDuplicateAssets = useMemo(() => {
    return applySort(
      duplicateAssets.filter((asset) => {
        const duplicateStatus = mapDuplicateStatus(asset.status)
        const matchesStatus = matchStatus(duplicateStatus, selectedStatuses)
        const matchesQuality = matchDuplicateQuality(selectedQualityTags)
        const matchesDomain = selectedDomains.includes(asset.domain)
        const matchesTime = matchDateWindow(asset.lastReviewed, selectedTimeTags)
        const matchesSearch = matchesText(
          searchQuery,
          asset.groupId,
          asset.primaryAsset,
          asset.similarAsset,
          asset.owner,
          asset.duplicateType,
          asset.status,
          asset.domain,
        )
        return matchesStatus && matchesQuality && matchesDomain && matchesTime && matchesSearch
      }),
      duplicateSort,
    )
  }, [duplicateSort, searchQuery, selectedDomains, selectedQualityTags, selectedStatuses, selectedTimeTags])

  const filteredHealthAssets = useMemo(() => {
    return applySort(
      healthAssets.filter((asset) => {
        const status = mapHealthStatus(asset.freshnessStatus)
        const matchesStatus = matchStatus(status, selectedStatuses)
        const matchesQuality = matchHealthQuality(asset, selectedQualityTags)
        const matchesTrust = matchTrust(asset.trustLevel, selectedTrustTags)
        const matchesDomain = selectedDomains.includes(asset.domain)
        const matchesTime = matchDateWindow(asset.reviewDueDate, selectedTimeTags)
        const matchesSearch = matchesText(
          searchQuery,
          asset.assetTitle,
          asset.owner,
          asset.domain,
          asset.recommendedAction,
          asset.lifecycleState,
          asset.trustLevel,
        )
        return matchesStatus && matchesQuality && matchesTrust && matchesDomain && matchesTime && matchesSearch
      }),
      healthSort,
    )
  }, [healthSort, searchQuery, selectedDomains, selectedQualityTags, selectedStatuses, selectedTimeTags, selectedTrustTags])

  const averageQualityScore = filteredQualityAssets.length
    ? Math.round(filteredQualityAssets.reduce((sum, asset) => sum + asset.qualityScore, 0) / filteredQualityAssets.length)
    : 0
  const trustedCoverage = filteredQualityAssets.length
    ? Math.round((filteredQualityAssets.filter((asset) => asset.trustLevel === 'Trusted').length / filteredQualityAssets.length) * 100)
    : 0
  const openDuplicates = filteredDuplicateAssets.filter((asset) => asset.status === 'Open' || asset.status === 'In Review').length
  const outdatedContent = filteredHealthAssets.filter((asset) => asset.freshnessStatus === 'Outdated' || asset.freshnessStatus === 'Stale').length

  return (
    <div className="space-y-6 pb-10">
      <Breadcrumb
        items={[
          { label: 'Enterprise Knowledge Management', href: '/' },
          { label: 'Knowledge Quality & Validation' },
        ]}
      />

      <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-[radial-gradient(circle_at_top_left,_rgba(22,101,52,0.12),_transparent_34%),linear-gradient(135deg,rgba(248,250,252,0.96),rgba(255,255,255,0.92))] shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <div className="border-b border-slate-200/70 px-6 py-6">
          <PageHeader
            title="Knowledge Quality & Validation"
            description="Strategic trust control workspace for measuring quality, validating readiness, controlling duplicates, and protecting knowledge reliability before employee or AI consumption."
            right={
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="h-10 rounded-xl border-slate-200 bg-white/80 px-3 text-slate-700 hover:bg-slate-50"
                  onClick={() => setShowFilters((current) => !current)}
                  aria-label={showFilters ? 'Hide filters' : 'Show filters'}
                  title={showFilters ? 'Hide filters' : 'Show filters'}
                >
                  <Filter className="h-5 w-5" strokeWidth={2} />
                  <span className="ml-2">{showFilters ? 'Hide filters' : 'Show filters'}</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-10 rounded-xl border-slate-200 bg-white/80 px-3 text-slate-700 hover:bg-slate-50"
                  onClick={() => setExportMessage(`Governance export prepared for ${workspaceLabel(activeSection)} at 09:30 WIB.`)}
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
              Buxus-integrated trust layer
            </Badge>
            <Badge className="rounded-full border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700">
              Controlled validation governance
            </Badge>
            <Badge className="rounded-full border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700">
              Confidence-aware AI readiness
            </Badge>
          </div>
          {exportMessage ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-xs text-slate-600">
              {exportMessage}
            </div>
          ) : null}
        </div>

        <div className="px-6 py-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {kpiCards.map((card) => {
              const Icon = card.icon
              return (
                <button
                  key={card.label}
                  type="button"
                  onClick={() => setActiveSection(card.targetSection)}
                  className={cn(
                    'group relative overflow-hidden rounded-3xl border bg-white/90 p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(15,23,42,0.08)]',
                    kpiToneClass(card.tone),
                  )}
                >
                  <div className="absolute right-4 top-4 rounded-2xl bg-white/70 p-3 shadow-sm">
                    <Icon className="h-5 w-5 text-slate-700" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{card.label}</p>
                  <p className="mt-4 text-3xl font-semibold text-slate-950">{card.metric}</p>
                  <p className="mt-2 max-w-[18rem] text-sm leading-6 text-slate-600">{card.description}</p>
                  {card.trend ? (
                    <p className="mt-4 text-xs font-medium text-slate-500">{card.trend}</p>
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {showFilters ? (
        <section className="glass-card rounded-[26px] border border-white/40 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
            <div>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search knowledge asset title, document name, owner, validator, reviewer, duplicate group ID, quality rule, status, trust score, or domain"
                  className="h-10 rounded-xl border-slate-200 bg-white pl-9 text-sm"
                />
              </div>
            </div>
            <div className="flex items-start justify-end gap-2 xl:justify-end">
              <Button
                variant="outline"
                className="h-10 rounded-xl border-slate-200 bg-white px-3 text-slate-700"
                onClick={() => resetFilters(setSelectedStatuses, setSelectedQualityTags, setSelectedTrustTags, setSelectedDomains, setSelectedTimeTags, setSearchQuery)}
              >
                Reset filters
              </Button>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <FilterChipRow
              label="Status"
              items={statusOptions}
              selected={selectedStatuses}
              onToggle={(value) => setSelectedStatuses((current) => toggleChipSet(current, value, true))}
            />
            <FilterChipRow
              label="Quality"
              items={qualityOptions}
              selected={selectedQualityTags}
              onToggle={(value) => setSelectedQualityTags((current) => toggleChipSet(current, value, false, [...qualityOptions]))}
            />
            <FilterChipRow
              label="Trust"
              items={trustOptions}
              selected={selectedTrustTags}
              onToggle={(value) => setSelectedTrustTags((current) => toggleChipSet(current, value, false, [...trustOptions]))}
            />
            <FilterChipRow
              label="Domain"
              items={domainOptions}
              selected={selectedDomains}
              onToggle={(value) => setSelectedDomains((current) => toggleChipSet(current, value, false, [...domainOptions]))}
            />
            <FilterChipRow
              label="Time"
              items={timeOptions}
              selected={selectedTimeTags}
              onToggle={(value) => setSelectedTimeTags((current) => toggleChipSet(current, value, false, ['30 Days']))}
            />
          </div>
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-24 xl:self-start">
          <div className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/90 p-3 shadow-[0_18px_50px_rgba(15,23,42,0.07)]">
            <div className="px-3 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Workspace Navigator</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Explore trust coverage, validation governance, duplicate intelligence, and content health with a persistent operational view.
              </p>
            </div>
            <div className="mt-2 space-y-2">
              {workspaceItems.map((item) => {
                const Icon = item.icon
                const isActive = activeSection === item.key
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveSection(item.key)}
                    className={cn(
                      'w-full rounded-2xl border px-4 py-4 text-left transition-all duration-200',
                      isActive
                        ? 'border-emerald-200 bg-[linear-gradient(135deg,rgba(22,101,52,0.12),rgba(255,255,255,0.92))] shadow-sm'
                        : 'border-transparent bg-slate-50/70 hover:border-slate-200 hover:bg-white',
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn('rounded-2xl p-2.5', isActive ? 'bg-white text-emerald-700' : 'bg-white text-slate-600')}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                          {item.count ? (
                            <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold tabular-nums text-slate-600">
                              {item.count}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-xs leading-5 text-slate-600">{item.description}</p>
                      </div>
                      <ChevronRight className={cn('mt-1 h-4 w-4', isActive ? 'text-emerald-700' : 'text-slate-400')} />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          {activeSection === 'overview' ? renderOverview(filteredQualityAssets, filteredValidationQueue, filteredDuplicateAssets, filteredHealthAssets) : null}
          {activeSection === 'quality'
            ? renderQualitySection(filteredQualityAssets, qualitySort, setQualitySort, setDrawer)
            : null}
          {activeSection === 'validation'
            ? renderValidationSection(filteredValidationQueue, validationSort, setValidationSort, setDrawer)
            : null}
          {activeSection === 'duplicate'
            ? renderDuplicateSection(filteredDuplicateAssets, duplicateSort, setDuplicateSort, setDrawer)
            : null}
          {activeSection === 'health'
            ? renderHealthSection(filteredHealthAssets, healthSort, setHealthSort, setDrawer)
            : null}

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Filtered Quality Score"
              value={`${averageQualityScore}`}
              supporting="Average quality score for current search and chip filters."
              accent="trust"
            />
            <SummaryCard
              title="Filtered Trusted Coverage"
              value={`${trustedCoverage}%`}
              supporting="Share of visible assets approved with trusted confidence."
              accent="trust"
            />
            <SummaryCard
              title="Open Duplicate Pressure"
              value={`${openDuplicates}`}
              supporting="Duplicate investigations still requiring traceable resolution action."
              accent="warning"
            />
            <SummaryCard
              title="Stale or Outdated Assets"
              value={`${outdatedContent}`}
              supporting="Visible assets already reducing trust due to freshness deterioration."
              accent="critical"
            />
          </section>
        </div>
      </section>

      {drawer ? <DetailDrawer drawer={drawer} onClose={() => setDrawer(null)} /> : null}
    </div>
  )
}

function renderOverview(
  qualityRows: QualityAsset[],
  validationRows: ValidationAsset[],
  duplicateRows: DuplicateAsset[],
  healthRows: HealthAsset[],
) {
  const trustedAssets = qualityRows.filter((asset) => asset.trustLevel === 'Trusted').length
  const lowConfidenceAssets = qualityRows.filter((asset) => asset.trustLevel === 'Low Confidence' || asset.trustLevel === 'Unverified').length

  return (
    <div className="space-y-6">
      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.2fr)_360px]">
        <div className="rounded-[26px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Knowledge Quality Command Overview</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">Quality posture and trust readiness</h2>
            </div>
            <Badge className="rounded-full border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
              Enterprise trust coverage
            </Badge>
          </div>
          <div className="mt-5 h-[270px] rounded-3xl border border-slate-100 bg-[linear-gradient(180deg,rgba(248,250,252,0.9),rgba(255,255,255,1))] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={qualityTrendData}>
                <defs>
                  <linearGradient id="qualityScoreFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#166534" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#166534" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="score" stroke="#166534" strokeWidth={2.5} fill="url(#qualityScoreFill)" />
                <Line type="monotone" dataKey="coverage" stroke="#0f766e" strokeWidth={2} dot={{ r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <MiniInsightCard title="Validated assets" value={`${trustedAssets}`} description="Assets currently approved for trusted enterprise and AI use." />
            <MiniInsightCard title="Low-confidence assets" value={`${lowConfidenceAssets}`} description="Assets with visible trust degradation or insufficient validation evidence." />
            <MiniInsightCard title="Review queue" value={`${validationRows.length}`} description="Assets being processed through governed validation and human review." />
          </div>
        </div>

        <div className="rounded-[26px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Trust score distribution</p>
          <div className="mt-4 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={trustDistributionData} innerRadius={58} outerRadius={86} paddingAngle={4} dataKey="value">
                  {trustDistributionData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {trustDistributionData.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-slate-700">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded-[26px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Validation command map</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-950">Governed release path</h3>
            </div>
            <Badge className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-700">
              Auditable flow
            </Badge>
          </div>
          <div className="mt-4 h-[270px] overflow-hidden rounded-3xl border border-slate-100 bg-[linear-gradient(180deg,rgba(248,250,252,0.95),rgba(255,255,255,1))]">
            <ReactFlow nodes={validationNodes} edges={validationEdges} fitView fitViewOptions={{ padding: 0.2 }} nodesDraggable={false} nodesConnectable={false} elementsSelectable={false} zoomOnScroll={false} panOnDrag={false} proOptions={{ hideAttribution: true }}>
              <MiniMap zoomable pannable style={{ backgroundColor: '#f8fafc' }} />
              <Controls showInteractive={false} />
              <Background color="#dbe4ef" gap={18} size={1} />
            </ReactFlow>
          </div>
        </div>

        <div className="rounded-[26px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Outdated content trend</p>
          <div className="mt-4 h-[270px] rounded-3xl border border-slate-100 bg-[linear-gradient(180deg,rgba(248,250,252,0.9),rgba(255,255,255,1))] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={outdatedTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="window" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="outdated" radius={[8, 8, 0, 0]} fill="#d97706" />
                <Bar dataKey="reviewDue" radius={[8, 8, 0, 0]} fill="#0f766e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="rounded-[26px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Validation status summary</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-950">Governance queue posture</h3>
            </div>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600">
              {validationRows.length} assets in scope
            </span>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {validationSnapshot.map((item) => (
              <SummaryCard
                key={item.label}
                title={item.label}
                value={`${item.value}`}
                supporting="Structured visibility for operational review and audit readiness."
                accent={item.tone as 'trust' | 'warning' | 'critical' | 'neutral'}
              />
            ))}
          </div>
          <div className="mt-5 space-y-3">
            {duplicateClusterCards.map((card) => (
              <div key={card.title} className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{card.title}</p>
                  <Badge className="rounded-full border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
                    {card.badge}
                  </Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{card.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[26px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Recent quality and validation activity</p>
          <div className="mt-5 space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.title} className="relative rounded-3xl border border-slate-100 bg-slate-50/70 p-4 pl-6">
                <div className={cn('absolute left-3 top-5 h-2.5 w-2.5 rounded-full', timelineTone(activity.tone))} />
                <p className="text-sm font-semibold text-slate-900">{activity.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{activity.description}</p>
                <p className="mt-3 text-xs font-medium text-slate-500">{activity.time}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <MiniInsightCard title="Duplicate candidates" value={`${duplicateRows.length}`} description="Traceable cluster handling across exact, near, and conceptual overlaps." />
            <MiniInsightCard title="Health risks" value={`${healthRows.length}`} description="Visible freshness deterioration signals and review due exposure." />
          </div>
        </div>
      </section>
    </div>
  )
}

function renderQualitySection(
  rows: QualityAsset[],
  sortState: SortState<(typeof qualityColumns)[number]['key']>,
  setSortState: (value: SortState<(typeof qualityColumns)[number]['key']>) => void,
  setDrawer: (value: DrawerState | null) => void,
) {
  return (
    <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.2fr)_360px]">
      <div className="rounded-[26px] border border-slate-200/80 bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <SectionHeading
          eyebrow="Knowledge Quality Dashboard"
          title="Operational quality scoring control center"
          description="Measure explainable quality dimensions, review freshness signals, and see trust posture at asset level."
        />
        <div className="overflow-x-auto px-5 pb-5">
          <table className="min-w-full border-separate border-spacing-0 text-sm">
            <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur">
              <tr>
                {qualityColumns.map((column) => (
                  <SortableHeader
                    key={column.key}
                    label={column.label}
                    active={sortState.key === column.key ? sortState.direction : null}
                    onClick={() => setSortState(nextSortState(sortState, column.key))}
                  />
                ))}
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((row) => (
                  <tr key={row.id} className="group cursor-pointer hover:bg-emerald-50/40" onClick={() => setDrawer(drawerFromQuality(row))}>
                    <td className="border-t border-slate-100 px-3 py-4 align-top">
                      <div>
                        <p className="font-semibold text-slate-900">{row.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{row.id}</p>
                      </div>
                    </td>
                    <td className="border-t border-slate-100 px-3 py-4 align-top">
                      <ScoreBadge score={row.qualityScore} />
                    </td>
                    <td className="border-t border-slate-100 px-3 py-4 align-top">
                      <StatusBadge label={row.qualityStatus} />
                    </td>
                    <td className="border-t border-slate-100 px-3 py-4 align-top">
                      <MetricBar value={row.completeness} tone="trust" />
                    </td>
                    <td className="border-t border-slate-100 px-3 py-4 align-top">
                      <MetricBar value={row.metadataQuality} tone="neutral" />
                    </td>
                    <td className="border-t border-slate-100 px-3 py-4 align-top">
                      <StatusBadge label={row.freshnessStatus} />
                    </td>
                    <td className="border-t border-slate-100 px-3 py-4 align-top">
                      <TrustChip trustScore={row.trustScore} trustLevel={row.trustLevel} />
                    </td>
                    <td className="border-t border-slate-100 px-3 py-4 align-top text-slate-700">{row.owner}</td>
                    <td className="border-t border-slate-100 px-3 py-4 align-top text-slate-700">{row.lastUpdated}</td>
                    <td className="border-t border-slate-100 px-3 py-4 align-top">
                      <Badge className="rounded-full border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-700">{row.domain}</Badge>
                    </td>
                    <td className="border-t border-slate-100 px-3 py-4 align-top">
                      <div className="flex flex-wrap gap-2" onClick={(event) => event.stopPropagation()}>
                        <RowAction label="Open Quality Detail" onClick={() => setDrawer(drawerFromQuality(row))} />
                        <RowAction label="View Score Breakdown" onClick={() => setDrawer(drawerFromQuality(row))} />
                        <RowAction label="Open Related Content" onClick={() => setDrawer(drawerFromQuality(row))} />
                        <RowAction label="Assign for Review" onClick={() => setDrawer(drawerFromQuality(row))} />
                        <RowAction label="Mark as Needs Update" onClick={() => setDrawer(drawerFromQuality(row))} />
                        <RowAction label="View Validation Evidence" onClick={() => setDrawer(drawerFromQuality(row))} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <EmptyTableState message="No knowledge assets match the current quality filters." />
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-6">
        <SidePanel title="Dimension breakdown focus" description="Quality dimensions remain explainable and reviewable for every asset selected in the dashboard.">
          {rows.slice(0, 4).map((row) => (
            <div key={row.id} className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">{row.title}</p>
                <ScoreBadge score={row.qualityScore} />
              </div>
              <div className="mt-4 space-y-3">
                <MetricLine label="Completeness" value={row.completeness} tone="trust" />
                <MetricLine label="Metadata completeness" value={row.metadataQuality} tone="neutral" />
                <MetricLine label="Trust readiness" value={row.trustScore} tone="warning" />
              </div>
            </div>
          ))}
        </SidePanel>

        <SidePanel title="Quality trend mini views" description="Recent asset score movement highlights where stewardship intervention is required.">
          {rows.slice(0, 3).map((row) => (
            <div key={row.id} className="rounded-3xl border border-slate-100 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">{row.title}</p>
                <StatusBadge label={row.trustLevel} />
              </div>
              <div className="mt-3 h-16">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={row.trend.map((value, index) => ({ name: index + 1, value }))}>
                    <Line type="monotone" dataKey="value" stroke="#166534" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </SidePanel>
      </div>
    </section>
  )
}

function renderValidationSection(
  rows: ValidationAsset[],
  sortState: SortState<(typeof validationColumns)[number]['key']>,
  setSortState: (value: SortState<(typeof validationColumns)[number]['key']>) => void,
  setDrawer: (value: DrawerState | null) => void,
) {
  return (
    <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.2fr)_360px]">
      <div className="rounded-[26px] border border-slate-200/80 bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <SectionHeading
          eyebrow="Validation Workflow"
          title="Governed validation queue"
          description="Maintain evidence discipline, validator accountability, and decision traceability before enterprise release."
        />
        <div className="overflow-x-auto px-5 pb-5">
          <table className="min-w-full border-separate border-spacing-0 text-sm">
            <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur">
              <tr>
                {validationColumns.map((column) => (
                  <SortableHeader
                    key={column.key}
                    label={column.label}
                    active={sortState.key === column.key ? sortState.direction : null}
                    onClick={() => setSortState(nextSortState(sortState, column.key))}
                  />
                ))}
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((row) => (
                  <tr key={row.id} className="group cursor-pointer hover:bg-blue-50/40" onClick={() => setDrawer(drawerFromValidation(row))}>
                    <td className="border-t border-slate-100 px-3 py-4 align-top">
                      <div>
                        <p className="font-semibold text-slate-900">{row.assetTitle}</p>
                        <p className="mt-1 text-xs text-slate-500">{row.id}</p>
                      </div>
                    </td>
                    <td className="border-t border-slate-100 px-3 py-4 align-top"><StatusBadge label={row.validationStage} /></td>
                    <td className="border-t border-slate-100 px-3 py-4 align-top text-slate-700">{row.assignedValidator}</td>
                    <td className="border-t border-slate-100 px-3 py-4 align-top text-slate-700">{row.reviewOwner}</td>
                    <td className="border-t border-slate-100 px-3 py-4 align-top"><StatusBadge label={row.validationStatus} /></td>
                    <td className="border-t border-slate-100 px-3 py-4 align-top text-slate-700">{row.submissionDate}</td>
                    <td className="border-t border-slate-100 px-3 py-4 align-top text-slate-700">{row.decisionDate}</td>
                    <td className="border-t border-slate-100 px-3 py-4 align-top"><StatusBadge label={row.evidenceStatus} /></td>
                    <td className="border-t border-slate-100 px-3 py-4 align-top text-slate-700">{row.commentsCount}</td>
                    <td className="border-t border-slate-100 px-3 py-4 align-top"><StatusBadge label={row.trustImpact} /></td>
                    <td className="border-t border-slate-100 px-3 py-4 align-top">
                      <div className="flex flex-wrap gap-2" onClick={(event) => event.stopPropagation()}>
                        <RowAction label="Open Validation Detail" onClick={() => setDrawer(drawerFromValidation(row))} />
                        <RowAction label="Approve Asset" onClick={() => setDrawer(drawerFromValidation(row))} />
                        <RowAction label="Reject Asset" onClick={() => setDrawer(drawerFromValidation(row))} />
                        <RowAction label="Request Revision" onClick={() => setDrawer(drawerFromValidation(row))} />
                        <RowAction label="Assign Validator" onClick={() => setDrawer(drawerFromValidation(row))} />
                        <RowAction label="View Validation History" onClick={() => setDrawer(drawerFromValidation(row))} />
                        <RowAction label="Open Supporting Evidence" onClick={() => setDrawer(drawerFromValidation(row))} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <EmptyTableState message="No validation cases match the current filters." />
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-6">
        <SidePanel title="Evidence completeness" description="Evidence-backed validation keeps trust scoring defensible and auditable.">
          <div className="space-y-3">
            <SummaryCard title="Complete evidence" value="18" supporting="Ready for validator decision with supporting material attached." accent="trust" />
            <SummaryCard title="Partial evidence" value="7" supporting="Needs additional files, policy mapping, or reviewer notes." accent="warning" />
            <SummaryCard title="Missing evidence" value="2" supporting="Cannot progress to trusted release until documentation is supplied." accent="critical" />
          </div>
        </SidePanel>

        <SidePanel title="Turnaround monitor" description="Track ownership, reviewer load, and time to close validation decisions.">
          {rows.slice(0, 4).map((row) => (
            <div key={row.id} className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">{row.assetTitle}</p>
                <StatusBadge label={row.validationStatus} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-slate-600">
                <div>
                  <p className="font-semibold text-slate-500">Validator</p>
                  <p className="mt-1 text-sm text-slate-800">{row.assignedValidator}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-500">Comments</p>
                  <p className="mt-1 text-sm text-slate-800">{row.commentsCount}</p>
                </div>
              </div>
            </div>
          ))}
        </SidePanel>
      </div>
    </section>
  )
}

function renderDuplicateSection(
  rows: DuplicateAsset[],
  sortState: SortState<(typeof duplicateColumns)[number]['key']>,
  setSortState: (value: SortState<(typeof duplicateColumns)[number]['key']>) => void,
  setDrawer: (value: DrawerState | null) => void,
) {
  return (
    <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.2fr)_360px]">
      <div className="rounded-[26px] border border-slate-200/80 bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <SectionHeading
          eyebrow="Duplicate Detection Panel"
          title="Controlled duplicate intelligence"
          description="Investigate duplicate severity, compare source traceability, and govern retire or merge decisions with confidence."
        />
        <div className="overflow-x-auto px-5 pb-5">
          <table className="min-w-full border-separate border-spacing-0 text-sm">
            <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur">
              <tr>
                {duplicateColumns.map((column) => (
                  <SortableHeader
                    key={column.key}
                    label={column.label}
                    active={sortState.key === column.key ? sortState.direction : null}
                    onClick={() => setSortState(nextSortState(sortState, column.key))}
                  />
                ))}
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((row) => (
                  <tr key={row.id} className="group cursor-pointer hover:bg-orange-50/40" onClick={() => setDrawer(drawerFromDuplicate(row))}>
                    <td className="border-t border-slate-100 px-3 py-4 align-top font-semibold text-slate-900">{row.groupId}</td>
                    <td className="border-t border-slate-100 px-3 py-4 align-top text-slate-700">{row.primaryAsset}</td>
                    <td className="border-t border-slate-100 px-3 py-4 align-top text-slate-700">{row.similarAsset}</td>
                    <td className="border-t border-slate-100 px-3 py-4 align-top"><ScoreBadge score={row.similarityScore} label="similarity" /></td>
                    <td className="border-t border-slate-100 px-3 py-4 align-top"><StatusBadge label={row.duplicateType} /></td>
                    <td className="border-t border-slate-100 px-3 py-4 align-top text-slate-700">{row.owner}</td>
                    <td className="border-t border-slate-100 px-3 py-4 align-top"><StatusBadge label={row.status} /></td>
                    <td className="border-t border-slate-100 px-3 py-4 align-top text-slate-700">{row.resolutionRecommendation}</td>
                    <td className="border-t border-slate-100 px-3 py-4 align-top text-slate-700">{row.lastReviewed}</td>
                    <td className="border-t border-slate-100 px-3 py-4 align-top"><Badge className="rounded-full border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-700">{row.domain}</Badge></td>
                    <td className="border-t border-slate-100 px-3 py-4 align-top">
                      <div className="flex flex-wrap gap-2" onClick={(event) => event.stopPropagation()}>
                        <RowAction label="Open Duplicate Detail" onClick={() => setDrawer(drawerFromDuplicate(row))} />
                        <RowAction label="Compare Assets" onClick={() => setDrawer(drawerFromDuplicate(row))} />
                        <RowAction label="Mark as Duplicate" onClick={() => setDrawer(drawerFromDuplicate(row))} />
                        <RowAction label="Mark as Not Duplicate" onClick={() => setDrawer(drawerFromDuplicate(row))} />
                        <RowAction label="Assign Resolution Owner" onClick={() => setDrawer(drawerFromDuplicate(row))} />
                        <RowAction label="Archive Redundant Asset" onClick={() => setDrawer(drawerFromDuplicate(row))} />
                        <RowAction label="View Related Validation Impact" onClick={() => setDrawer(drawerFromDuplicate(row))} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <EmptyTableState message="No duplicate candidates match the current filters." />
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-6">
        <SidePanel title="Duplicate cluster cards" description="Traceable clustering helps teams understand severity and resolution readiness before action.">
          {rows.slice(0, 3).map((row) => (
            <div key={row.id} className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">{row.groupId}</p>
                <StatusBadge label={row.severity} />
              </div>
              <p className="mt-2 text-sm text-slate-700">{row.primaryAsset}</p>
              <p className="mt-1 text-sm text-slate-500">vs {row.similarAsset}</p>
              <p className="mt-3 text-xs leading-5 text-slate-600">{row.resolutionRecommendation}</p>
            </div>
          ))}
        </SidePanel>

        <SidePanel title="Resolution readiness" description="Side-by-side comparison and severity routing protect search integrity and AI grounding quality.">
          <SummaryCard title="High severity duplicates" value="6" supporting="Immediate retire or merge decisions recommended." accent="critical" />
          <SummaryCard title="Near duplicate reviews" value="8" supporting="Waiting for controlled similarity confirmation and ownership decision." accent="warning" />
          <SummaryCard title="Cleared overlap groups" value="5" supporting="Semantic tagging refined to prevent future false positives." accent="trust" />
        </SidePanel>
      </div>
    </section>
  )
}

function renderHealthSection(
  rows: HealthAsset[],
  sortState: SortState<(typeof healthColumns)[number]['key']>,
  setSortState: (value: SortState<(typeof healthColumns)[number]['key']>) => void,
  setDrawer: (value: DrawerState | null) => void,
) {
  return (
    <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.2fr)_360px]">
      <div className="rounded-[26px] border border-slate-200/80 bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <SectionHeading
          eyebrow="Content Health Monitor"
          title="Freshness and trust deterioration control"
          description="Prevent knowledge decay by monitoring review due windows, stale signals, and trust decline before business use."
        />
        <div className="overflow-x-auto px-5 pb-5">
          <table className="min-w-full border-separate border-spacing-0 text-sm">
            <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur">
              <tr>
                {healthColumns.map((column) => (
                  <SortableHeader
                    key={column.key}
                    label={column.label}
                    active={sortState.key === column.key ? sortState.direction : null}
                    onClick={() => setSortState(nextSortState(sortState, column.key))}
                  />
                ))}
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((row) => (
                  <tr key={row.id} className="group cursor-pointer hover:bg-amber-50/40" onClick={() => setDrawer(drawerFromHealth(row))}>
                    <td className="border-t border-slate-100 px-3 py-4 align-top">
                      <div>
                        <p className="font-semibold text-slate-900">{row.assetTitle}</p>
                        <p className="mt-1 text-xs text-slate-500">{row.id}</p>
                      </div>
                    </td>
                    <td className="border-t border-slate-100 px-3 py-4 align-top text-slate-700">{row.lastUpdated}</td>
                    <td className="border-t border-slate-100 px-3 py-4 align-top text-slate-700">{row.reviewDueDate}</td>
                    <td className="border-t border-slate-100 px-3 py-4 align-top"><StatusBadge label={row.freshnessStatus} /></td>
                    <td className="border-t border-slate-100 px-3 py-4 align-top"><StatusBadge label={row.outdatedRisk} /></td>
                    <td className="border-t border-slate-100 px-3 py-4 align-top text-slate-700">{row.owner}</td>
                    <td className="border-t border-slate-100 px-3 py-4 align-top"><Badge className="rounded-full border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-700">{row.domain}</Badge></td>
                    <td className="border-t border-slate-100 px-3 py-4 align-top"><TrustChip trustScore={row.trustScore} trustLevel={row.trustLevel} /></td>
                    <td className="border-t border-slate-100 px-3 py-4 align-top text-slate-700">{row.recommendedAction}</td>
                    <td className="border-t border-slate-100 px-3 py-4 align-top"><StatusBadge label={row.lifecycleState} /></td>
                    <td className="border-t border-slate-100 px-3 py-4 align-top">
                      <div className="flex flex-wrap gap-2" onClick={(event) => event.stopPropagation()}>
                        <RowAction label="Open Health Detail" onClick={() => setDrawer(drawerFromHealth(row))} />
                        <RowAction label="Mark for Update" onClick={() => setDrawer(drawerFromHealth(row))} />
                        <RowAction label="Assign Reviewer" onClick={() => setDrawer(drawerFromHealth(row))} />
                        <RowAction label="Extend Review Date" onClick={() => setDrawer(drawerFromHealth(row))} />
                        <RowAction label="Archive Content" onClick={() => setDrawer(drawerFromHealth(row))} />
                        <RowAction label="Open Related Asset" onClick={() => setDrawer(drawerFromHealth(row))} />
                        <RowAction label="View Trust History" onClick={() => setDrawer(drawerFromHealth(row))} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <EmptyTableState message="No content health risks match the current filters." />
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-6">
        <SidePanel title="Freshness aging cards" description="Operational visibility into which assets are drifting toward low-trust use and renewal pressure.">
          {rows.slice(0, 4).map((row) => (
            <div key={row.id} className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">{row.assetTitle}</p>
                <StatusBadge label={row.freshnessStatus} />
              </div>
              <div className="mt-3 h-16">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={row.trustTrend.map((value, index) => ({ name: index + 1, value }))}>
                    <Line type="monotone" dataKey="value" stroke="#d97706" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-600">{row.recommendedAction}</p>
            </div>
          ))}
        </SidePanel>

        <SidePanel title="Review due timeline" description="Upcoming review due dates and trust risk levels help prioritize stewardship actions.">
          <SummaryCard title="Review due within 7 days" value="12" supporting="Assets requiring immediate review scheduling or extension decisions." accent="warning" />
          <SummaryCard title="Critical trust decline" value="4" supporting="Assets already unsuitable for trusted downstream use without remediation." accent="critical" />
          <SummaryCard title="Fresh assets" value="41" supporting="Content still current and stable under present governance cadence." accent="trust" />
        </SidePanel>
      </div>
    </section>
  )
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="px-5 pb-4 pt-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{eyebrow}</p>
      <h2 className="mt-2 text-xl font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
    </div>
  )
}

function SummaryCard({ title, value, supporting, accent }: { title: string; value: string; supporting: string; accent: 'trust' | 'warning' | 'critical' | 'neutral' }) {
  return (
    <div className={cn('rounded-3xl border p-4 shadow-sm', summaryAccent(accent))}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{title}</p>
      <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{supporting}</p>
    </div>
  )
}

function MiniInsightCard({ title, value, description }: { title: string; value: string; description: string }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{title}</p>
      <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  )
}

  function SidePanel({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="rounded-[26px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      <div className="mt-5 space-y-4">{children}</div>
    </div>
  )
}

function FilterChipRow({
  label,
  items,
  selected,
  onToggle,
}: {
  label: string
  items: readonly string[]
  selected: string[]
  onToggle: (value: string) => void
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const active = selected.includes(item)
          return (
            <button
              key={item}
              type="button"
              onClick={() => onToggle(item)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-semibold transition-all',
                active
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900',
              )}
            >
              {item}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SortableHeader({ label, active, onClick }: { label: string; active: SortDirection; onClick: () => void }) {
  return (
    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
      <button type="button" onClick={onClick} className="inline-flex items-center gap-1.5 hover:text-slate-800">
        <span>{label}</span>
        {active === 'asc' ? (
          <ChevronUp className="h-4 w-4" />
        ) : active === 'desc' ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ArrowUpDown className="h-4 w-4 opacity-50" />
        )}
      </button>
    </th>
  )
}

function ScoreBadge({ score, label = 'score' }: { score: number; label?: string }) {
  return (
    <div className={cn('inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold', scoreTone(score))}>
      {score} {label === 'score' ? '' : label}
    </div>
  )
}

function StatusBadge({ label }: { label: string }) {
  return <Badge className={cn('rounded-full px-2.5 py-1 text-[10px] font-semibold', statusTone(label))}>{label}</Badge>
}

function TrustChip({ trustScore, trustLevel }: { trustScore: number; trustLevel: TrustLevel }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/70 px-2.5 py-1 text-[10px] font-semibold text-emerald-800">
      <span>{trustScore}</span>
      <span className="h-1 w-1 rounded-full bg-emerald-500" />
      <span>{trustLevel}</span>
    </div>
  )
}

function MetricBar({ value, tone }: { value: number; tone: 'trust' | 'warning' | 'neutral' }) {
  return (
    <div className="min-w-[120px]">
      <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
        <span>{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div className={cn('h-2 rounded-full', metricTone(tone))} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function MetricLine({ label, value, tone }: { label: string; value: number; tone: 'trust' | 'warning' | 'neutral' }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-600">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div className={cn('h-2 rounded-full', metricTone(tone))} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function RowAction({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
    >
      {label}
    </button>
  )
}

function EmptyTableState({ message }: { message: string }) {
  return (
    <tr>
      <td colSpan={11} className="border-t border-slate-100 px-4 py-10 text-center">
        <div className="mx-auto max-w-md rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 p-6">
          <CircleDashed className="mx-auto h-6 w-6 text-slate-400" />
          <p className="mt-3 text-sm font-semibold text-slate-900">No matching records</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
        </div>
      </td>
    </tr>
  )
}

function DetailDrawer({ drawer, onClose }: { drawer: DrawerState; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/25 backdrop-blur-[2px]">
      <div className="h-full w-full max-w-[420px] overflow-y-auto border-l border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge className={cn('rounded-full px-3 py-1 text-[10px] font-semibold', summaryAccent(drawer.tone))}>
              Trust detail
            </Badge>
            <h3 className="mt-4 text-xl font-semibold text-slate-950">{drawer.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{drawer.subtitle}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {drawer.metrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{metric.label}</p>
              <p className="mt-3 text-lg font-semibold text-slate-950">{metric.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-3xl border border-slate-100 bg-slate-50/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Operational notes</p>
          <div className="mt-4 space-y-3">
            {drawer.bullets.map((bullet) => (
              <div key={bullet} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>{bullet}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-100 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Recommended next actions</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {drawer.actions.map((action) => (
              <span key={action} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
                {action}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function drawerFromQuality(row: QualityAsset): DrawerState {
  return {
    title: row.title,
    subtitle: 'Quality detail combines score explainability, metadata condition, freshness control, and evidence-backed trust interpretation.',
    tone: row.qualityScore >= 85 ? 'trust' : row.qualityScore >= 70 ? 'warning' : 'critical',
    metrics: [
      { label: 'Quality score', value: `${row.qualityScore}` },
      { label: 'Trust score', value: `${row.trustScore}` },
      { label: 'Owner', value: row.owner },
      { label: 'Last updated', value: row.lastUpdated },
    ],
    bullets: [row.standards, row.relatedContent, row.validationEvidence],
    actions: ['Open quality detail', 'Assign for review', 'Mark as needs update', 'View validation evidence'],
  }
}

function drawerFromValidation(row: ValidationAsset): DrawerState {
  return {
    title: row.assetTitle,
    subtitle: 'Validation detail provides evidence traceability, assignment accountability, and decision history for audited release readiness.',
    tone: row.validationStatus === 'Approved' ? 'trust' : row.validationStatus === 'Rejected' ? 'critical' : 'warning',
    metrics: [
      { label: 'Validation stage', value: row.validationStage },
      { label: 'Assigned validator', value: row.assignedValidator },
      { label: 'Evidence status', value: row.evidenceStatus },
      { label: 'Trust impact', value: row.trustImpact },
    ],
    bullets: row.validationHistory,
    actions: ['Approve asset', 'Reject asset', 'Request revision', 'Open supporting evidence'],
  }
}

function drawerFromDuplicate(row: DuplicateAsset): DrawerState {
  return {
    title: `${row.groupId} duplicate cluster`,
    subtitle: 'Duplicate analysis captures similarity confidence, source traceability, and the operational impact of merge or archive decisions.',
    tone: row.severity === 'High' ? 'critical' : row.severity === 'Medium' ? 'warning' : 'neutral',
    metrics: [
      { label: 'Similarity score', value: `${row.similarityScore}` },
      { label: 'Duplicate type', value: row.duplicateType },
      { label: 'Owner', value: row.owner },
      { label: 'Last reviewed', value: row.lastReviewed },
    ],
    bullets: [
      `Primary asset: ${row.primaryAsset}`,
      `Similar asset: ${row.similarAsset}`,
      row.resolutionRecommendation,
    ],
    actions: ['Compare assets', 'Mark as duplicate', 'Assign resolution owner', 'Archive redundant asset'],
  }
}

function drawerFromHealth(row: HealthAsset): DrawerState {
  return {
    title: row.assetTitle,
    subtitle: 'Health detail highlights freshness decline, review due pressure, and the operational action needed to prevent trust erosion.',
    tone: row.outdatedRisk === 'High' ? 'critical' : row.outdatedRisk === 'Medium' ? 'warning' : 'trust',
    metrics: [
      { label: 'Freshness status', value: row.freshnessStatus },
      { label: 'Review due', value: row.reviewDueDate },
      { label: 'Trust score', value: `${row.trustScore}` },
      { label: 'Lifecycle state', value: row.lifecycleState },
    ],
    bullets: [row.recommendedAction, `Owner: ${row.owner}`, `Last updated on ${row.lastUpdated}`],
    actions: ['Mark for update', 'Assign reviewer', 'Extend review date', 'View trust history'],
  }
}

function matchesText(query: string, ...values: Array<string | number>) {
  if (!query.trim()) {
    return true
  }

  const normalized = query.toLowerCase()
  return values.some((value) => `${value}`.toLowerCase().includes(normalized))
}

function matchStatus(value: string, selectedStatuses: string[]) {
  if (selectedStatuses.includes('All')) {
    return true
  }

  return selectedStatuses.includes(value)
}

function matchTrust(value: TrustLevel, selectedTrustTags: string[]) {
  return selectedTrustTags.includes(value)
}

function matchQualityBand(asset: QualityAsset, selectedQualityTags: string[]) {
  const tags: string[] = []

  if (asset.qualityScore >= 85) tags.push('High Quality')
  if (asset.qualityScore >= 70 && asset.qualityScore < 85) tags.push('Medium Quality')
  if (asset.qualityScore < 70) tags.push('Low Quality')
  if (asset.completeness < 80 || asset.metadataQuality < 80) tags.push('Incomplete')
  if (asset.freshnessStatus === 'Stale' || asset.freshnessStatus === 'Outdated' || asset.freshnessStatus === 'Review Due') tags.push('Stale')

  return tags.some((tag) => selectedQualityTags.includes(tag))
}

function matchDuplicateQuality(selectedQualityTags: string[]) {
  if (selectedQualityTags.includes('Duplicate Risk')) {
    return true
  }

  if (selectedQualityTags.includes('High Quality') || selectedQualityTags.includes('Medium Quality') || selectedQualityTags.includes('Low Quality')) {
    return true
  }

  return selectedQualityTags.length > 0
}

function matchHealthQuality(asset: HealthAsset, selectedQualityTags: string[]) {
  const tags: string[] = []

  if (asset.freshnessStatus === 'Stale' || asset.freshnessStatus === 'Outdated') tags.push('Stale')
  if (asset.trustScore >= 85) tags.push('High Quality')
  if (asset.trustScore >= 70 && asset.trustScore < 85) tags.push('Medium Quality')
  if (asset.trustScore < 70) tags.push('Low Quality')

  return tags.some((tag) => selectedQualityTags.includes(tag))
}

function matchDateWindow(value: string, selectedTimeTags: string[]) {
  const date = new Date(value)
  const diffInDays = Math.floor((baseDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  return selectedTimeTags.some((tag) => {
    if (tag === 'Today') return diffInDays <= 0
    if (tag === '7 Days') return diffInDays <= 7
    if (tag === '30 Days') return diffInDays <= 30
    if (tag === '90 Days') return diffInDays <= 90
    return true
  })
}

function mapDuplicateStatus(status: DuplicateStatus): QualityStatus {
  if (status === 'Open') return 'Warning'
  if (status === 'In Review') return 'In Review'
  if (status === 'Confirmed Duplicate') return 'Critical'
  return 'Approved'
}

function mapHealthStatus(status: FreshnessStatus): QualityStatus {
  if (status === 'Fresh') return 'Healthy'
  if (status === 'Review Due') return 'Warning'
  if (status === 'Stale') return 'Warning'
  return 'Outdated'
}

function toggleChipSet(current: string[], value: string, hasAllOption: boolean, fallback?: string[]) {
  if (hasAllOption && value === 'All') {
    return ['All']
  }

  let next = current.filter((item) => item !== 'All')

  if (next.includes(value)) {
    next = next.filter((item) => item !== value)
  } else {
    next = [...next, value]
  }

  if (next.length === 0) {
    return hasAllOption ? ['All'] : fallback ?? current
  }

  return next
}

function resetFilters(
  setStatuses: (value: string[]) => void,
  setQuality: (value: string[]) => void,
  setTrust: (value: string[]) => void,
  setDomains: (value: string[]) => void,
  setTime: (value: string[]) => void,
  setSearch: (value: string) => void,
) {
  setStatuses(['All'])
  setQuality([...qualityOptions])
  setTrust([...trustOptions])
  setDomains([...domainOptions])
  setTime(['30 Days'])
  setSearch('')
}

function nextSortState<T extends string>(current: SortState<T>, key: T): SortState<T> {
  if (current.key !== key) {
    return { key, direction: 'asc' }
  }

  if (current.direction === 'asc') {
    return { key, direction: 'desc' }
  }

  if (current.direction === 'desc') {
    return { key, direction: null }
  }

  return { key, direction: 'asc' }
}

function applySort<T>(rows: T[], sort: SortState<Extract<keyof T, string>>) {
  if (!sort.direction) {
    return rows
  }

  return [...rows].sort((left, right) => {
    const leftValue = left[sort.key as keyof T]
    const rightValue = right[sort.key as keyof T]

    if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      return sort.direction === 'asc' ? leftValue - rightValue : rightValue - leftValue
    }

    const normalizedLeft = Array.isArray(leftValue) ? leftValue.join(' ') : `${leftValue}`
    const normalizedRight = Array.isArray(rightValue) ? rightValue.join(' ') : `${rightValue}`
    const result = normalizedLeft.localeCompare(normalizedRight)
    return sort.direction === 'asc' ? result : -result
  })
}

function workspaceLabel(section: WorkspaceSection) {
  return workspaceItems.find((item) => item.key === section)?.label ?? 'Overview'
}

function flowNodeStyle(background: string, color: string) {
  return {
    background,
    color,
    border: `1px solid ${color}22`,
    borderRadius: 18,
    padding: 12,
    width: 170,
    fontSize: 12,
    fontWeight: 600,
    boxShadow: '0 12px 30px rgba(15,23,42,0.08)',
  }
}

function kpiToneClass(tone: KpiCard['tone']) {
  if (tone === 'trust') return 'border-emerald-200/70'
  if (tone === 'warning') return 'border-amber-200/70'
  if (tone === 'critical') return 'border-rose-200/70'
  return 'border-slate-200/70'
}

function summaryAccent(accent: 'trust' | 'warning' | 'critical' | 'neutral') {
  if (accent === 'trust') return 'border-emerald-200 bg-emerald-50/60'
  if (accent === 'warning') return 'border-amber-200 bg-amber-50/60'
  if (accent === 'critical') return 'border-rose-200 bg-rose-50/60'
  return 'border-slate-200 bg-slate-50/60'
}

function timelineTone(tone: string) {
  if (tone === 'trust') return 'bg-emerald-500'
  if (tone === 'warning') return 'bg-amber-500'
  if (tone === 'critical') return 'bg-rose-500'
  return 'bg-slate-400'
}

function scoreTone(score: number) {
  if (score >= 85) return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (score >= 70) return 'border-amber-200 bg-amber-50 text-amber-800'
  return 'border-rose-200 bg-rose-50 text-rose-800'
}

function statusTone(label: string) {
  if (['Healthy', 'Approved', 'Published', 'Trusted', 'Fresh', 'Complete', 'Low', 'Active'].includes(label)) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  }
  if (['Warning', 'Pending Validation', 'In Review', 'Review Due', 'Steward Review', 'Evidence Review', 'Submitted', 'Medium', 'Stale', 'Moderate Confidence', 'Partial', 'Expiring', 'Revision Requested'].includes(label)) {
    return 'border-amber-200 bg-amber-50 text-amber-800'
  }
  if (['Critical', 'Rejected', 'Outdated', 'Missing', 'High', 'Low Confidence', 'Unverified', 'Confirmed Duplicate', 'Review Pending'].includes(label)) {
    return 'border-rose-200 bg-rose-50 text-rose-800'
  }
  return 'border-slate-200 bg-slate-50 text-slate-700'
}

function metricTone(tone: 'trust' | 'warning' | 'neutral') {
  if (tone === 'trust') return 'bg-emerald-600'
  if (tone === 'warning') return 'bg-amber-500'
  return 'bg-slate-500'
}