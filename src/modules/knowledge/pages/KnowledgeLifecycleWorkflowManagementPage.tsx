import { useMemo, useState, type ComponentType } from 'react'
import {
  ArrowUpDown,
  ArrowUpRight,
  BadgeAlert,
  BadgeCheck,
  Bell,
  BookCheck,
  CalendarClock,
  CheckCheck,
  ChevronRight,
  CircleAlert,
  Clock3,
  FileBadge2,
  Filter,
  Layers3,
  Search,
  Users,
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type WorkspaceSection = 'overview' | 'workflow' | 'approval' | 'ownership' | 'expiration'
type SortDirection = 'asc' | 'desc'
type Domain = 'Customer' | 'Loan' | 'Collection' | 'Finance' | 'Risk' | 'Compliance' | 'Operations'
type LifecycleStatus =
  | 'Draft'
  | 'In Review'
  | 'Pending Approval'
  | 'Published'
  | 'Rejected'
  | 'Expired'
  | 'Archived'
  | 'Overdue'
type WorkflowTag = 'Approval Flow' | 'Review Flow' | 'Revision Needed' | 'Escalated'
type OwnershipTag = 'Assigned' | 'Unassigned' | 'Steward Assigned' | 'Reviewer Assigned' | 'Approver Assigned'
type SlaTag = 'On Track' | 'Due Soon' | 'Breached' | 'High Priority'
type TimeTag = 'Today' | '7 Days' | '30 Days' | '90 Days' | 'Custom Range'
type Priority = 'High' | 'Medium' | 'Low'
type RiskLevel = 'High' | 'Medium' | 'Low'
type Tone = 'positive' | 'warning' | 'critical' | 'neutral'

interface WorkspaceItem {
  key: WorkspaceSection
  label: string
  description: string
  icon: ComponentType<{ className?: string }>
  count?: number
}

interface KpiCard {
  label: string
  metric: string
  description: string
  trend?: string
  tone: Tone
  icon: ComponentType<{ className?: string }>
  targetSection: WorkspaceSection
}

interface WorkflowRecord {
  id: string
  workflowName: string
  status: Extract<LifecycleStatus, 'Draft' | 'In Review' | 'Pending Approval' | 'Published'>
  triggerCondition: string
  domain: Domain
  timeTag: TimeTag
  workflowTags: WorkflowTag[]
  assignedRoles: string[]
  stages: Array<{
    id: string
    label: string
    owner: string
    status: 'Complete' | 'Active' | 'Pending'
    dueDiscipline: string
  }>
  approvalPath: string
  revisionPath: string
  notificationRule: string
  lastUpdated: string
}

interface ApprovalRecord {
  id: string
  assetTitle: string
  workflowId: string
  workflowStage: string
  assignedReviewer: string
  assignedApprover: string
  submissionDate: string
  dueDate: string
  status: Extract<LifecycleStatus, 'In Review' | 'Pending Approval' | 'Rejected' | 'Overdue'>
  priority: Priority
  commentsCount: number
  lastAction: string
  domain: Domain
  timeTag: TimeTag
  workflowTags: WorkflowTag[]
  slaStatus: SlaTag
  evidenceNote: string
}

interface OwnershipRecord {
  id: string
  assetTitle: string
  owner: string
  steward: string
  reviewer: string
  approver: string
  domain: Domain
  ownershipStatus: 'Assigned' | 'Unassigned' | 'Partial Coverage'
  lastUpdatedDate: string
  slaStatus: SlaTag
  reviewDueDate: string
  handoverAwareness: string
  timeTag: TimeTag
}

interface ExpirationRecord {
  id: string
  assetTitle: string
  currentStatus: Extract<LifecycleStatus, 'Published' | 'Expired' | 'Archived' | 'Overdue'>
  expirationDate: string
  daysRemaining: number
  owner: string
  domain: Domain
  renewalRecommendation: string
  archiveRecommendation: string
  riskLevel: RiskLevel
  notificationStatus: string
  slaStatus: SlaTag
  timeTag: TimeTag
}

interface ActivityRecord {
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

interface SortState<T extends string> {
  key: T
  direction: SortDirection
}

const lifecyclePalette = ['#0f766e', '#2f855a', '#d97706', '#b45309', '#dc2626', '#64748b']

const statusOptions: LifecycleStatus[] = [
  'Draft',
  'In Review',
  'Pending Approval',
  'Published',
  'Rejected',
  'Expired',
  'Archived',
  'Overdue',
]

const workflowTagOptions: WorkflowTag[] = [
  'Approval Flow',
  'Review Flow',
  'Revision Needed',
  'Escalated',
]

const ownershipTagOptions: OwnershipTag[] = [
  'Assigned',
  'Unassigned',
  'Steward Assigned',
  'Reviewer Assigned',
  'Approver Assigned',
]

const slaTagOptions: SlaTag[] = ['On Track', 'Due Soon', 'Breached', 'High Priority']
const domainTagOptions: Domain[] = ['Customer', 'Loan', 'Collection', 'Finance', 'Risk', 'Compliance', 'Operations']
const timeTagOptions: TimeTag[] = ['Today', '7 Days', '30 Days', '90 Days', 'Custom Range']

const workflowRecords: WorkflowRecord[] = [
  {
    id: 'WLF-214',
    workflowName: 'Retail Lending Playbook Publication Control',
    status: 'Published',
    triggerCondition: 'New lending procedure or policy change request enters SALVIA governance lane.',
    domain: 'Loan',
    timeTag: '30 Days',
    workflowTags: ['Approval Flow', 'Review Flow'],
    assignedRoles: ['Content Owner', 'Knowledge Steward', 'Credit Risk Reviewer', 'Approval Committee'],
    stages: [
      { id: 'draft', label: 'Draft', owner: 'Content Owner', status: 'Complete', dueDiscipline: 'Initial authoring within 2 business days' },
      { id: 'review', label: 'Review', owner: 'Knowledge Steward', status: 'Complete', dueDiscipline: 'Steward review within 24 hours' },
      { id: 'risk', label: 'Domain Review', owner: 'Credit Risk Reviewer', status: 'Complete', dueDiscipline: 'Domain review within 48 hours' },
      { id: 'approve', label: 'Approval', owner: 'Approval Committee', status: 'Active', dueDiscipline: 'Formal decision within 24 hours' },
      { id: 'publish', label: 'Publish', owner: 'Knowledge Operations', status: 'Pending', dueDiscipline: 'Controlled release after approval lock' },
    ],
    approvalPath: 'Credit Risk Reviewer -> Approval Committee -> Knowledge Operations',
    revisionPath: 'Any rejection returns to Content Owner with tracked revision notes and reminder escalation.',
    notificationRule: 'Reminder at T-12 hours, escalation to governance lead at breach, publication notice on release.',
    lastUpdated: '2026-04-15',
  },
  {
    id: 'WLF-198',
    workflowName: 'Collections Script Review and Renewal Flow',
    status: 'In Review',
    triggerCondition: 'Quarterly collections guidance refresh or regulatory remediation request.',
    domain: 'Collection',
    timeTag: '7 Days',
    workflowTags: ['Approval Flow', 'Revision Needed', 'Escalated'],
    assignedRoles: ['Collections Owner', 'Knowledge Steward', 'Compliance Reviewer', 'Head of Operations'],
    stages: [
      { id: 'draft', label: 'Draft', owner: 'Collections Owner', status: 'Complete', dueDiscipline: 'Draft prepared before review window opens' },
      { id: 'review', label: 'Steward Review', owner: 'Knowledge Steward', status: 'Active', dueDiscipline: 'Content hygiene and metadata validation within 12 hours' },
      { id: 'compliance', label: 'Compliance Review', owner: 'Compliance Reviewer', status: 'Pending', dueDiscipline: 'Regulatory check within 24 hours' },
      { id: 'approve', label: 'Approval', owner: 'Head of Operations', status: 'Pending', dueDiscipline: 'Decision within 1 business day' },
      { id: 'publish', label: 'Controlled Publish', owner: 'Knowledge Operations', status: 'Pending', dueDiscipline: 'Release after notification confirmation' },
    ],
    approvalPath: 'Knowledge Steward -> Compliance Reviewer -> Head of Operations',
    revisionPath: 'Revision loops back to Collections Owner with escalation if turnaround exceeds SLA.',
    notificationRule: 'Reminder on submission, escalation notice at breach, renewal reminder at T-14 days before expiration.',
    lastUpdated: '2026-04-16',
  },
  {
    id: 'WLF-176',
    workflowName: 'Treasury Knowledge Bulletin Controlled Publish',
    status: 'Draft',
    triggerCondition: 'Treasury notice or market advisory created for controlled publication.',
    domain: 'Finance',
    timeTag: 'Today',
    workflowTags: ['Approval Flow'],
    assignedRoles: ['Treasury Editor', 'Treasury Steward', 'Finance Reviewer', 'Treasury Approver'],
    stages: [
      { id: 'draft', label: 'Draft', owner: 'Treasury Editor', status: 'Active', dueDiscipline: 'Authoring lock after market close' },
      { id: 'review', label: 'Steward Review', owner: 'Treasury Steward', status: 'Pending', dueDiscipline: 'Review within 4 hours' },
      { id: 'finance', label: 'Finance Review', owner: 'Finance Reviewer', status: 'Pending', dueDiscipline: 'Review within 8 hours' },
      { id: 'approve', label: 'Approval', owner: 'Treasury Approver', status: 'Pending', dueDiscipline: 'Decision within same day' },
      { id: 'publish', label: 'Publish', owner: 'Knowledge Operations', status: 'Pending', dueDiscipline: 'Notify branch users on release' },
    ],
    approvalPath: 'Treasury Steward -> Finance Reviewer -> Treasury Approver',
    revisionPath: 'Draft reopens with version lock if decision requires changes.',
    notificationRule: 'Market-hour reminder every 2 hours until approval checkpoint is reached.',
    lastUpdated: '2026-04-16',
  },
]

const approvalQueueRecords: ApprovalRecord[] = [
  {
    id: 'APR-901',
    assetTitle: 'Retail Loan Restructuring Exception Playbook',
    workflowId: 'WLF-214',
    workflowStage: 'Approval Committee Decision',
    assignedReviewer: 'Daniela Prasetyo',
    assignedApprover: 'Risk Governance Council',
    submissionDate: '2026-04-14',
    dueDate: '2026-04-16',
    status: 'Pending Approval',
    priority: 'High',
    commentsCount: 12,
    lastAction: 'Evidence pack refreshed after committee clarification.',
    domain: 'Loan',
    timeTag: 'Today',
    workflowTags: ['Approval Flow'],
    slaStatus: 'Due Soon',
    evidenceNote: 'Five evidence attachments, no missing attestation items.',
  },
  {
    id: 'APR-876',
    assetTitle: 'Collections Hardship Script Version 4.2',
    workflowId: 'WLF-198',
    workflowStage: 'Compliance Review',
    assignedReviewer: 'Lina Hermawan',
    assignedApprover: 'Rico Rahadian',
    submissionDate: '2026-04-12',
    dueDate: '2026-04-15',
    status: 'Overdue',
    priority: 'High',
    commentsCount: 18,
    lastAction: 'Escalation sent to compliance lead after SLA breach.',
    domain: 'Collection',
    timeTag: '7 Days',
    workflowTags: ['Approval Flow', 'Escalated'],
    slaStatus: 'Breached',
    evidenceNote: 'Regulatory evidence package missing one legal confirmation.',
  },
  {
    id: 'APR-854',
    assetTitle: 'KYC Escalation Decision Tree',
    workflowId: 'WLF-232',
    workflowStage: 'Steward Review',
    assignedReviewer: 'Nadia Suryono',
    assignedApprover: 'Bimo Setiawan',
    submissionDate: '2026-04-15',
    dueDate: '2026-04-18',
    status: 'In Review',
    priority: 'Medium',
    commentsCount: 5,
    lastAction: 'Steward requested tighter source citation alignment.',
    domain: 'Compliance',
    timeTag: '7 Days',
    workflowTags: ['Review Flow', 'Revision Needed'],
    slaStatus: 'On Track',
    evidenceNote: 'Citations complete, steward comments open.',
  },
  {
    id: 'APR-833',
    assetTitle: 'Treasury Intraday Liquidity Bulletin',
    workflowId: 'WLF-176',
    workflowStage: 'Draft QA Review',
    assignedReviewer: 'Yusuf Hartono',
    assignedApprover: 'Nita Wibowo',
    submissionDate: '2026-04-16',
    dueDate: '2026-04-16',
    status: 'In Review',
    priority: 'High',
    commentsCount: 3,
    lastAction: 'Draft entered same-day review lane for controlled release.',
    domain: 'Finance',
    timeTag: 'Today',
    workflowTags: ['Review Flow'],
    slaStatus: 'High Priority',
    evidenceNote: 'No missing artefacts, awaiting financial controller note.',
  },
  {
    id: 'APR-819',
    assetTitle: 'Customer Complaint Root Cause Playbook',
    workflowId: 'WLF-207',
    workflowStage: 'Revision Submission',
    assignedReviewer: 'Maya Kusuma',
    assignedApprover: 'Ari Nugraha',
    submissionDate: '2026-04-10',
    dueDate: '2026-04-13',
    status: 'Rejected',
    priority: 'Medium',
    commentsCount: 9,
    lastAction: 'Revision required after inconsistent guidance detected.',
    domain: 'Customer',
    timeTag: '30 Days',
    workflowTags: ['Revision Needed'],
    slaStatus: 'Breached',
    evidenceNote: 'Root cause examples need controlled revalidation.',
  },
]

const ownershipRecords: OwnershipRecord[] = [
  {
    id: 'OWN-301',
    assetTitle: 'Retail Collections Call Handling Guide',
    owner: 'Rina Mahardika',
    steward: 'Aldi Pranata',
    reviewer: 'Lina Hermawan',
    approver: 'Rico Rahadian',
    domain: 'Collection',
    ownershipStatus: 'Assigned',
    lastUpdatedDate: '2026-04-15',
    slaStatus: 'Due Soon',
    reviewDueDate: '2026-04-18',
    handoverAwareness: 'No handover risk detected.',
    timeTag: '7 Days',
  },
  {
    id: 'OWN-278',
    assetTitle: 'Credit Policy Exception Matrix',
    owner: 'Bimo Setiawan',
    steward: 'Santi Lestari',
    reviewer: 'Daniela Prasetyo',
    approver: 'Risk Governance Council',
    domain: 'Loan',
    ownershipStatus: 'Assigned',
    lastUpdatedDate: '2026-04-14',
    slaStatus: 'On Track',
    reviewDueDate: '2026-05-05',
    handoverAwareness: 'Coverage stable across current review cycle.',
    timeTag: '30 Days',
  },
  {
    id: 'OWN-247',
    assetTitle: 'AML Investigation Triage Notes',
    owner: 'Unassigned',
    steward: 'Nadia Suryono',
    reviewer: 'Unassigned',
    approver: 'Compliance Authority Board',
    domain: 'Compliance',
    ownershipStatus: 'Partial Coverage',
    lastUpdatedDate: '2026-04-11',
    slaStatus: 'Breached',
    reviewDueDate: '2026-04-12',
    handoverAwareness: 'Owner role vacated after team restructuring; gap requires escalation.',
    timeTag: '7 Days',
  },
  {
    id: 'OWN-229',
    assetTitle: 'Funding Desk Market Notice Archive',
    owner: 'Siska Dewanti',
    steward: 'Unassigned',
    reviewer: 'Yusuf Hartono',
    approver: 'Nita Wibowo',
    domain: 'Finance',
    ownershipStatus: 'Partial Coverage',
    lastUpdatedDate: '2026-04-09',
    slaStatus: 'Due Soon',
    reviewDueDate: '2026-04-17',
    handoverAwareness: 'Steward reassignment pending because former steward moved to treasury controls.',
    timeTag: 'Today',
  },
  {
    id: 'OWN-212',
    assetTitle: 'Branch Service Recovery Handbook',
    owner: 'Unassigned',
    steward: 'Unassigned',
    reviewer: 'Maya Kusuma',
    approver: 'Ari Nugraha',
    domain: 'Customer',
    ownershipStatus: 'Unassigned',
    lastUpdatedDate: '2026-03-28',
    slaStatus: 'Breached',
    reviewDueDate: '2026-04-02',
    handoverAwareness: 'Full ownership gap after branch service transformation.',
    timeTag: '30 Days',
  },
]

const expirationRecords: ExpirationRecord[] = [
  {
    id: 'EXP-511',
    assetTitle: 'Customer Complaint Escalation SOP',
    currentStatus: 'Published',
    expirationDate: '2026-04-24',
    daysRemaining: 8,
    owner: 'Maya Kusuma',
    domain: 'Customer',
    renewalRecommendation: 'Renew after steward review and service recovery metric update.',
    archiveRecommendation: 'Archive prior version after superseding branch rollout completes.',
    riskLevel: 'Medium',
    notificationStatus: 'Reminder sent to owner and reviewer 2 hours ago.',
    slaStatus: 'Due Soon',
    timeTag: '30 Days',
  },
  {
    id: 'EXP-507',
    assetTitle: 'Collections Hardship Waiver Matrix',
    currentStatus: 'Overdue',
    expirationDate: '2026-04-14',
    daysRemaining: -2,
    owner: 'Rina Mahardika',
    domain: 'Collection',
    renewalRecommendation: 'Immediate legal and collections review required before continued use.',
    archiveRecommendation: 'Archive if new waiver matrix is approved this week.',
    riskLevel: 'High',
    notificationStatus: 'Escalation active to collections governance lead and compliance.',
    slaStatus: 'Breached',
    timeTag: '7 Days',
  },
  {
    id: 'EXP-489',
    assetTitle: 'Retail Lending Exception Delegation Guide',
    currentStatus: 'Published',
    expirationDate: '2026-05-06',
    daysRemaining: 20,
    owner: 'Bimo Setiawan',
    domain: 'Loan',
    renewalRecommendation: 'Review delegation threshold changes before renewal.',
    archiveRecommendation: 'Retain archive copy for audit window regardless of renewal.',
    riskLevel: 'Low',
    notificationStatus: 'No reminder required yet; owner watchlist enabled.',
    slaStatus: 'On Track',
    timeTag: '30 Days',
  },
  {
    id: 'EXP-472',
    assetTitle: 'Treasury Overnight Position Bulletin',
    currentStatus: 'Expired',
    expirationDate: '2026-04-15',
    daysRemaining: -1,
    owner: 'Siska Dewanti',
    domain: 'Finance',
    renewalRecommendation: 'Replace with current bulletin after treasury controller review.',
    archiveRecommendation: 'Archive immediately after replacement is published.',
    riskLevel: 'High',
    notificationStatus: 'Expiration notice delivered; archive action waiting on owner confirmation.',
    slaStatus: 'Breached',
    timeTag: 'Today',
  },
  {
    id: 'EXP-460',
    assetTitle: 'AML Suspicious Activity Reporting Playbook',
    currentStatus: 'Archived',
    expirationDate: '2026-03-31',
    daysRemaining: -16,
    owner: 'Compliance Authority Board',
    domain: 'Compliance',
    renewalRecommendation: 'No renewal. Replace with revised regulatory policy package.',
    archiveRecommendation: 'Keep archive locked for seven-year evidence retention.',
    riskLevel: 'Low',
    notificationStatus: 'Archive notice complete; downstream links updated.',
    slaStatus: 'On Track',
    timeTag: '90 Days',
  },
]

const activityTimeline: ActivityRecord[] = [
  {
    id: 'ACT-1',
    title: 'Escalation triggered for Collections Hardship Script Version 4.2',
    detail: 'Compliance review SLA breached after 18 hours past due time; escalation routed to governance lead and operations head.',
    timestamp: '16 Apr 2026, 09:20',
    tone: 'critical',
  },
  {
    id: 'ACT-2',
    title: 'Ownership gap flagged on AML Investigation Triage Notes',
    detail: 'Primary content owner role is vacant; stewardship gap entered into lifecycle risk watchlist.',
    timestamp: '16 Apr 2026, 08:35',
    tone: 'warning',
  },
  {
    id: 'ACT-3',
    title: 'Retail Lending Playbook workflow moved into approval checkpoint',
    detail: 'Committee decision package locked and evidence set frozen for controlled publication readiness.',
    timestamp: '15 Apr 2026, 18:10',
    tone: 'positive',
  },
  {
    id: 'ACT-4',
    title: 'Reminder batch delivered for eight upcoming expirations',
    detail: 'Notifications sent to owners, stewards, and reviewers with action-specific due dates and archive fallback guidance.',
    timestamp: '15 Apr 2026, 15:00',
    tone: 'neutral',
  },
]

const slaTrendData = [
  { month: 'Nov', onTrack: 88, dueSoon: 22, breached: 6 },
  { month: 'Dec', onTrack: 91, dueSoon: 18, breached: 5 },
  { month: 'Jan', onTrack: 93, dueSoon: 17, breached: 4 },
  { month: 'Feb', onTrack: 89, dueSoon: 21, breached: 8 },
  { month: 'Mar', onTrack: 95, dueSoon: 15, breached: 3 },
  { month: 'Apr', onTrack: 92, dueSoon: 19, breached: 7 },
]

const ownershipLoadData = [
  { name: 'Rina', assigned: 18 },
  { name: 'Bimo', assigned: 15 },
  { name: 'Siska', assigned: 11 },
  { name: 'Nadia', assigned: 9 },
  { name: 'Maya', assigned: 8 },
]

const expirationTrendData = [
  { window: '0-7 Days', assets: 3 },
  { window: '8-14 Days', assets: 4 },
  { window: '15-30 Days', assets: 7 },
  { window: '31-60 Days', assets: 10 },
]

function toggleItem<T extends string>(value: T, current: T[], setter: (next: T[]) => void) {
  setter(current.includes(value) ? current.filter((item) => item !== value) : [...current, value])
}

function statusBadgeClass(status: string) {
  if (status === 'Published' || status === 'Assigned' || status === 'On Track') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }

  if (status === 'Due Soon' || status === 'Draft' || status === 'In Review' || status === 'Pending Approval') {
    return 'border-amber-200 bg-amber-50 text-amber-700'
  }

  if (status === 'Overdue' || status === 'Rejected' || status === 'Expired' || status === 'Breached' || status === 'Unassigned') {
    return 'border-rose-200 bg-rose-50 text-rose-700'
  }

  return 'border-slate-200 bg-slate-100 text-slate-700'
}

function toneClass(tone: Tone) {
  if (tone === 'positive') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }

  if (tone === 'warning') {
    return 'border-amber-200 bg-amber-50 text-amber-700'
  }

  if (tone === 'critical') {
    return 'border-rose-200 bg-rose-50 text-rose-700'
  }

  return 'border-slate-200 bg-slate-100 text-slate-700'
}

function priorityClass(priority: Priority) {
  if (priority === 'High') {
    return 'border-rose-200 bg-rose-50 text-rose-700'
  }

  if (priority === 'Medium') {
    return 'border-amber-200 bg-amber-50 text-amber-700'
  }

  return 'border-emerald-200 bg-emerald-50 text-emerald-700'
}

function riskClass(riskLevel: RiskLevel) {
  if (riskLevel === 'High') {
    return 'border-rose-200 bg-rose-50 text-rose-700'
  }

  if (riskLevel === 'Medium') {
    return 'border-amber-200 bg-amber-50 text-amber-700'
  }

  return 'border-slate-200 bg-slate-100 text-slate-700'
}

function sortRows<T>(rows: T[], sort: SortState<keyof T & string>) {
  return [...rows].sort((left, right) => {
    const leftValue = left[sort.key]
    const rightValue = right[sort.key]

    if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      return sort.direction === 'asc' ? leftValue - rightValue : rightValue - leftValue
    }

    const leftText = String(leftValue)
    const rightText = String(rightValue)
    return sort.direction === 'asc'
      ? leftText.localeCompare(rightText)
      : rightText.localeCompare(leftText)
  })
}

function WorkflowNodeLabel({ title, owner, status }: { title: string; owner: string; status: string }) {
  return (
    <div className="min-w-[150px] rounded-2xl border border-slate-200 bg-white/95 px-3 py-2 shadow-sm">
      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{status}</div>
      <div className="mt-1 text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-1 text-xs text-slate-500">{owner}</div>
    </div>
  )
}

function FilterChipGroup<T extends string>({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string
  options: T[]
  selected: T[]
  onToggle: (value: T) => void
}) {
  return (
    <div className="space-y-2">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option)
          return (
            <button
              type="button"
              key={option}
              onClick={() => onToggle(option)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                active
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700 shadow-sm'
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

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 px-6 py-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
        <Search className="h-5 w-5 text-slate-500" />
      </div>
      <div className="mt-4 text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-1 text-sm text-slate-500">{description}</div>
    </div>
  )
}

function SortHeader<T extends string>({
  label,
  current,
  column,
  onSort,
}: {
  label: string
  current: SortState<T>
  column: T
  onSort: (column: T) => void
}) {
  const isActive = current.key === column
  return (
    <button
      type="button"
      onClick={() => onSort(column)}
      className={cn('inline-flex items-center gap-1 text-left font-semibold', isActive && 'text-slate-900')}
    >
      <span>{label}</span>
      <ArrowUpDown className={cn('h-3.5 w-3.5', isActive ? 'text-emerald-600' : 'text-slate-400')} />
    </button>
  )
}

export function KnowledgeLifecycleWorkflowManagementPage() {
  const [activeSection, setActiveSection] = useState<WorkspaceSection>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(true)
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(workflowRecords[0].id)
  const [statusFilters, setStatusFilters] = useState<LifecycleStatus[]>([])
  const [workflowFilters, setWorkflowFilters] = useState<WorkflowTag[]>([])
  const [ownershipFilters, setOwnershipFilters] = useState<OwnershipTag[]>([])
  const [slaFilters, setSlaFilters] = useState<SlaTag[]>([])
  const [domainFilters, setDomainFilters] = useState<Domain[]>([])
  const [timeFilters, setTimeFilters] = useState<TimeTag[]>([])
  const [detailDrawer, setDetailDrawer] = useState<DetailDrawerState | null>(null)
  const [approvalSort, setApprovalSort] = useState<SortState<keyof ApprovalRecord & string>>({ key: 'dueDate', direction: 'asc' })
  const [ownershipSort, setOwnershipSort] = useState<SortState<keyof OwnershipRecord & string>>({ key: 'reviewDueDate', direction: 'asc' })
  const [expirationSort, setExpirationSort] = useState<SortState<keyof ExpirationRecord & string>>({ key: 'daysRemaining', direction: 'asc' })

  const matchesSearch = (parts: Array<string | number>) =>
    parts.join(' ').toLowerCase().includes(searchQuery.trim().toLowerCase())

  const matchesTime = (timeTag: TimeTag) => timeFilters.length === 0 || timeFilters.includes(timeTag)
  const matchesDomain = (domain: Domain) => domainFilters.length === 0 || domainFilters.includes(domain)
  const matchesSla = (slaStatus: SlaTag) => slaFilters.length === 0 || slaFilters.includes(slaStatus)

  const filteredWorkflows = useMemo(
    () =>
      workflowRecords.filter((workflow) => {
        const matchesStatus = statusFilters.length === 0 || statusFilters.includes(workflow.status)
        const matchesWorkflow =
          workflowFilters.length === 0 || workflow.workflowTags.some((tag) => workflowFilters.includes(tag))
        return (
          matchesStatus &&
          matchesWorkflow &&
          matchesDomain(workflow.domain) &&
          matchesTime(workflow.timeTag) &&
          matchesSearch([
            workflow.workflowName,
            workflow.id,
            workflow.status,
            workflow.triggerCondition,
            workflow.domain,
            workflow.assignedRoles.join(' '),
            workflow.approvalPath,
          ])
        )
      }),
    [statusFilters, workflowFilters, domainFilters, timeFilters, searchQuery]
  )

  const filteredApprovals = useMemo(
    () =>
      approvalQueueRecords.filter((item) => {
        const matchesStatus = statusFilters.length === 0 || statusFilters.includes(item.status)
        const matchesWorkflow =
          workflowFilters.length === 0 || item.workflowTags.some((tag) => workflowFilters.includes(tag))
        const ownershipStates: OwnershipTag[] = [
          'Assigned',
          'Steward Assigned',
          'Reviewer Assigned',
          'Approver Assigned',
        ]
        const matchesOwnership =
          ownershipFilters.length === 0 || ownershipStates.some((tag) => ownershipFilters.includes(tag))

        return (
          matchesStatus &&
          matchesWorkflow &&
          matchesOwnership &&
          matchesSla(item.slaStatus) &&
          matchesDomain(item.domain) &&
          matchesTime(item.timeTag) &&
          matchesSearch([
            item.assetTitle,
            item.workflowId,
            item.workflowStage,
            item.assignedReviewer,
            item.assignedApprover,
            item.status,
            item.priority,
            item.domain,
            item.evidenceNote,
          ])
        )
      }),
    [statusFilters, workflowFilters, ownershipFilters, slaFilters, domainFilters, timeFilters, searchQuery]
  )

  const filteredOwnership = useMemo(
    () =>
      ownershipRecords.filter((item) => {
        const ownershipStates: OwnershipTag[] = []
        if (item.ownershipStatus === 'Assigned') {
          ownershipStates.push('Assigned')
        }
        if (item.ownershipStatus === 'Unassigned') {
          ownershipStates.push('Unassigned')
        }
        if (item.steward !== 'Unassigned') {
          ownershipStates.push('Steward Assigned')
        }
        if (item.reviewer !== 'Unassigned') {
          ownershipStates.push('Reviewer Assigned')
        }
        if (item.approver !== 'Unassigned') {
          ownershipStates.push('Approver Assigned')
        }
        const matchesOwnership =
          ownershipFilters.length === 0 || ownershipStates.some((tag) => ownershipFilters.includes(tag))
        const statusMatches =
          statusFilters.length === 0 ||
          (statusFilters.includes('Overdue') && item.slaStatus === 'Breached') ||
          (statusFilters.includes('Published') && item.ownershipStatus === 'Assigned')

        return (
          matchesOwnership &&
          statusMatches &&
          matchesSla(item.slaStatus) &&
          matchesDomain(item.domain) &&
          matchesTime(item.timeTag) &&
          matchesSearch([
            item.assetTitle,
            item.owner,
            item.steward,
            item.reviewer,
            item.approver,
            item.domain,
            item.ownershipStatus,
            item.reviewDueDate,
            item.handoverAwareness,
          ])
        )
      }),
    [ownershipFilters, statusFilters, slaFilters, domainFilters, timeFilters, searchQuery]
  )

  const filteredExpirations = useMemo(
    () =>
      expirationRecords.filter((item) => {
        const matchesStatus = statusFilters.length === 0 || statusFilters.includes(item.currentStatus)
        const ownershipStates: OwnershipTag[] = item.owner === 'Unassigned' ? ['Unassigned'] : ['Assigned']
        const matchesOwnership =
          ownershipFilters.length === 0 || ownershipStates.some((tag) => ownershipFilters.includes(tag))
        return (
          matchesStatus &&
          matchesOwnership &&
          matchesSla(item.slaStatus) &&
          matchesDomain(item.domain) &&
          matchesTime(item.timeTag) &&
          matchesSearch([
            item.assetTitle,
            item.currentStatus,
            item.expirationDate,
            item.owner,
            item.domain,
            item.renewalRecommendation,
            item.archiveRecommendation,
            item.notificationStatus,
          ])
        )
      }),
    [statusFilters, ownershipFilters, slaFilters, domainFilters, timeFilters, searchQuery]
  )

  const workflowStageDistribution = useMemo(() => {
    const baseCounts = new Map<string, number>()
    filteredApprovals.forEach((item) => {
      baseCounts.set(item.status, (baseCounts.get(item.status) ?? 0) + 1)
    })
    filteredExpirations.forEach((item) => {
      baseCounts.set(item.currentStatus, (baseCounts.get(item.currentStatus) ?? 0) + 1)
    })
    return Array.from(baseCounts.entries()).map(([name, value]) => ({ name, value }))
  }, [filteredApprovals, filteredExpirations])

  const ownershipCoverage = useMemo(() => {
    const total = ownershipRecords.length
    const fullyAssigned = ownershipRecords.filter((item) => item.ownershipStatus === 'Assigned').length
    const unassigned = ownershipRecords.filter((item) => item.ownershipStatus === 'Unassigned').length
    return {
      total,
      fullyAssigned,
      unassigned,
      stewardCoverage: ownershipRecords.filter((item) => item.steward !== 'Unassigned').length,
    }
  }, [])

  const kpiCards: KpiCard[] = useMemo(
    () => [
      {
        label: 'Assets Pending Approval',
        metric: String(approvalQueueRecords.filter((item) => item.status === 'Pending Approval').length),
        description: 'Knowledge assets waiting for formal approval decisions before controlled publication.',
        trend: '3 require action before end of day',
        tone: 'warning',
        icon: FileBadge2,
        targetSection: 'approval',
      },
      {
        label: 'Published Assets Under SLA',
        metric: '1,284',
        description: 'Published assets currently within update discipline and review timing expectations.',
        trend: '94.2% operational SLA attainment',
        tone: 'positive',
        icon: BadgeCheck,
        targetSection: 'overview',
      },
      {
        label: 'Overdue Content Updates',
        metric: String(ownershipRecords.filter((item) => item.slaStatus === 'Breached').length),
        description: 'Assets with breached review or update discipline requiring immediate stewardship follow-up.',
        trend: '2 escalated in current cycle',
        tone: 'critical',
        icon: BadgeAlert,
        targetSection: 'ownership',
      },
      {
        label: 'Upcoming Expirations',
        metric: String(expirationRecords.filter((item) => item.daysRemaining >= 0 && item.daysRemaining <= 30).length),
        description: 'Knowledge items approaching end-of-validity and requiring renewal readiness decisions.',
        trend: '4 assets due in the next 14 days',
        tone: 'warning',
        icon: CalendarClock,
        targetSection: 'expiration',
      },
      {
        label: 'Assigned Stewards Active',
        metric: String(ownershipRecords.filter((item) => item.steward !== 'Unassigned').length),
        description: 'Assets with active steward accountability visible in the current lifecycle watchlist.',
        trend: '2 stewardship gaps remain open',
        tone: 'neutral',
        icon: Users,
        targetSection: 'ownership',
      },
      {
        label: 'Reminder Actions Sent Today',
        metric: '26',
        description: 'Reminder, escalation, and follow-up messages issued to owners, reviewers, and approvers today.',
        trend: '11 were SLA-linked notifications',
        tone: 'neutral',
        icon: Bell,
        targetSection: 'overview',
      },
    ],
    []
  )

  const workspaceItems: WorkspaceItem[] = useMemo(
    () => [
      {
        key: 'overview',
        label: 'Overview',
        description: 'Command view of lifecycle maturity, stewardship coverage, and SLA readiness.',
        icon: Layers3,
      },
      {
        key: 'workflow',
        label: 'Workflow Designer',
        description: 'Design and inspect controlled approval and revision paths for knowledge assets.',
        icon: Workflow,
        count: filteredWorkflows.length,
      },
      {
        key: 'approval',
        label: 'Approval Queue',
        description: 'Process review, approval, rejection, and revision actions with evidence traceability.',
        icon: BookCheck,
        count: filteredApprovals.length,
      },
      {
        key: 'ownership',
        label: 'Ownership Dashboard',
        description: 'Track owner, steward, reviewer, and approver accountability by knowledge asset.',
        icon: Users,
        count: filteredOwnership.length,
      },
      {
        key: 'expiration',
        label: 'Expiration Tracker',
        description: 'Control validity windows, renewal readiness, and stale content prevention.',
        icon: Clock3,
        count: filteredExpirations.length,
      },
    ],
    [filteredApprovals.length, filteredExpirations.length, filteredOwnership.length, filteredWorkflows.length]
  )

  const activeWorkflow = useMemo(
    () => filteredWorkflows.find((workflow) => workflow.id === selectedWorkflowId) ?? filteredWorkflows[0] ?? workflowRecords[0],
    [filteredWorkflows, selectedWorkflowId]
  )

  const workflowNodes = useMemo<Node[]>(() => {
    return activeWorkflow.stages.map((stage, index) => ({
      id: stage.id,
      position: { x: index * 220, y: index % 2 === 0 ? 30 : 170 },
      data: {
        label: <WorkflowNodeLabel title={stage.label} owner={stage.owner} status={stage.status} />,
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      draggable: false,
      selectable: false,
      style: { background: 'transparent', border: 'none', width: 180 },
    }))
  }, [activeWorkflow])

  const workflowEdges = useMemo<Edge[]>(() => {
    const edges: Edge[] = activeWorkflow.stages.slice(0, -1).map((stage, index) => ({
      id: `${stage.id}-${activeWorkflow.stages[index + 1].id}`,
      source: stage.id,
      target: activeWorkflow.stages[index + 1].id,
      markerEnd: { type: MarkerType.ArrowClosed, color: '#1f2937' },
      style: { stroke: '#475569', strokeWidth: 1.6 },
      animated: activeWorkflow.stages[index + 1].status === 'Active',
    }))

    if (activeWorkflow.stages.length > 2) {
      edges.push({
        id: `${activeWorkflow.stages[3].id}-revision-loop`,
        source: activeWorkflow.stages[3].id,
        target: activeWorkflow.stages[0].id,
        markerEnd: { type: MarkerType.ArrowClosed, color: '#d97706' },
        style: { stroke: '#d97706', strokeWidth: 1.4 },
        label: 'Revision loop',
      })
    }

    return edges
  }, [activeWorkflow])

  const sortedApprovals = useMemo(() => sortRows(filteredApprovals, approvalSort), [filteredApprovals, approvalSort])
  const sortedOwnership = useMemo(() => sortRows(filteredOwnership, ownershipSort), [filteredOwnership, ownershipSort])
  const sortedExpirations = useMemo(() => sortRows(filteredExpirations, expirationSort), [filteredExpirations, expirationSort])

  const lifecycleHealthSummary = {
    approvalBacklog: approvalQueueRecords.filter((item) => item.status === 'Pending Approval' || item.status === 'Overdue').length,
    overdueUpdates: ownershipRecords.filter((item) => item.slaStatus === 'Breached').length,
    expiringSoon: expirationRecords.filter((item) => item.daysRemaining >= 0 && item.daysRemaining <= 14).length,
  }

  const resetFilters = () => {
    setStatusFilters([])
    setWorkflowFilters([])
    setOwnershipFilters([])
    setSlaFilters([])
    setDomainFilters([])
    setTimeFilters([])
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="glass-card rounded-[28px] border border-slate-200/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">Lifecycle Status Distribution</div>
              <div className="text-sm text-slate-500">Operational mix of review, approval, publication, and expiration states.</div>
            </div>
            <Badge className="border-slate-200 bg-white text-slate-600">Auditable distribution</Badge>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="h-72 rounded-3xl bg-[radial-gradient(circle_at_top,#ecfdf5,transparent_60%)]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={workflowStageDistribution} dataKey="value" nameKey="name" innerRadius={64} outerRadius={94} paddingAngle={3}>
                    {workflowStageDistribution.map((entry, index) => (
                      <Cell key={entry.name} fill={lifecyclePalette[index % lifecyclePalette.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {workflowStageDistribution.map((entry, index) => (
                <div key={entry.name} className="rounded-2xl border border-slate-200 bg-white/90 p-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: lifecyclePalette[index % lifecyclePalette.length] }} />
                    <span className="text-sm font-semibold text-slate-900">{entry.name}</span>
                  </div>
                  <div className="mt-3 text-3xl font-bold text-slate-900">{entry.value}</div>
                  <div className="mt-1 text-xs text-slate-500">Items currently visible in the filtered lifecycle watchlist.</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="glass-card rounded-[28px] border border-slate-200/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">Pending Approval Snapshot</div>
              <div className="text-sm text-slate-500">Immediate decision pressure and follow-up readiness.</div>
            </div>
            <Badge className="border-amber-200 bg-amber-50 text-amber-700">{lifecycleHealthSummary.approvalBacklog} backlog</Badge>
          </div>
          <div className="mt-5 space-y-3">
            {approvalQueueRecords.slice(0, 3).map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => {
                  setActiveSection('approval')
                  setDetailDrawer({
                    title: item.assetTitle,
                    subtitle: `${item.workflowStage} · ${item.workflowId}`,
                    tone: item.status === 'Overdue' ? 'critical' : 'warning',
                    metrics: [
                      { label: 'Assigned Reviewer', value: item.assignedReviewer },
                      { label: 'Assigned Approver', value: item.assignedApprover },
                      { label: 'Due Date', value: item.dueDate },
                    ],
                    bullets: [item.lastAction, item.evidenceNote, `Current SLA status: ${item.slaStatus}.`],
                    actions: ['Open Approval Detail', 'Approve Asset', 'Reject Asset', 'Request Revision'],
                  })
                }}
                className="w-full rounded-2xl border border-slate-200 bg-white/90 p-4 text-left transition-all hover:border-emerald-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{item.assetTitle}</div>
                    <div className="mt-1 text-xs text-slate-500">{item.workflowStage}</div>
                  </div>
                  <Badge className={cn('border', statusBadgeClass(item.status))}>{item.status}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span>Reviewer: {item.assignedReviewer}</span>
                  <span>Due: {item.dueDate}</span>
                  <span>Priority: {item.priority}</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="glass-card rounded-[28px] border border-slate-200/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">Ownership Coverage Summary</div>
              <div className="text-sm text-slate-500">Visibility into explicit accountability and stewardship readiness.</div>
            </div>
            <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">{Math.round((ownershipCoverage.fullyAssigned / ownershipCoverage.total) * 100)}% covered</Badge>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white/90 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Assigned Assets</div>
              <div className="mt-2 text-3xl font-bold text-slate-900">{ownershipCoverage.fullyAssigned}</div>
              <div className="mt-1 text-xs text-slate-500">Full owner, steward, reviewer, and approver visibility.</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/90 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Steward Coverage</div>
              <div className="mt-2 text-3xl font-bold text-slate-900">{ownershipCoverage.stewardCoverage}</div>
              <div className="mt-1 text-xs text-slate-500">Assets with active stewardship assigned in the current operating cycle.</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/90 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Ownership Gaps</div>
              <div className="mt-2 text-3xl font-bold text-slate-900">{ownershipCoverage.unassigned}</div>
              <div className="mt-1 text-xs text-slate-500">Assets requiring formal ownership or stewardship intervention.</div>
            </div>
          </div>
          <div className="mt-5 rounded-3xl border border-slate-200 bg-white/85 p-4">
            <div className="text-sm font-semibold text-slate-900">Recent Reminder and Escalation Activity</div>
            <div className="mt-4 space-y-3">
              {activityTimeline.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className={cn('mt-1 h-2.5 w-2.5 rounded-full', item.tone === 'positive' ? 'bg-emerald-500' : item.tone === 'warning' ? 'bg-amber-500' : item.tone === 'critical' ? 'bg-rose-500' : 'bg-slate-400')} />
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                    <div className="mt-1 text-sm text-slate-500">{item.detail}</div>
                    <div className="mt-1 text-xs text-slate-400">{item.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="glass-card rounded-[28px] border border-slate-200/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">SLA Compliance Trend</div>
              <div className="text-sm text-slate-500">Operational discipline across update timeliness and lifecycle follow-through.</div>
            </div>
            <Badge className="border-slate-200 bg-white text-slate-600">Last 6 months</Badge>
          </div>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={slaTrendData}>
                <defs>
                  <linearGradient id="salviaOnTrack" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f766e" stopOpacity={0.32} />
                    <stop offset="95%" stopColor="#0f766e" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="onTrack" stroke="#0f766e" fill="url(#salviaOnTrack)" strokeWidth={2.2} />
                <Line type="monotone" dataKey="dueSoon" stroke="#d97706" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="breached" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-emerald-600">On Track</div>
              <div className="mt-2 text-2xl font-bold text-emerald-900">92%</div>
              <div className="mt-1 text-xs text-emerald-700">Current month assets within review discipline.</div>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-amber-600">Due Soon</div>
              <div className="mt-2 text-2xl font-bold text-amber-900">19</div>
              <div className="mt-1 text-xs text-amber-700">Assets requiring intervention before SLA breach occurs.</div>
            </div>
            <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-rose-600">Breached</div>
              <div className="mt-2 text-2xl font-bold text-rose-900">7</div>
              <div className="mt-1 text-xs text-rose-700">Assets currently beyond agreed review or expiration governance windows.</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )

  const renderWorkflowDesigner = () => {
    const visibleWorkflow = activeWorkflow

    if (!visibleWorkflow) {
      return <EmptyState title="No workflows match the current filters" description="Adjust search or chip filters to inspect workflow stages, roles, and notification rules." />
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          {filteredWorkflows.map((workflow) => (
            <button
              type="button"
              key={workflow.id}
              onClick={() => setSelectedWorkflowId(workflow.id)}
              className={cn(
                'rounded-[24px] border p-4 text-left transition-all',
                workflow.id === selectedWorkflowId
                  ? 'border-emerald-300 bg-emerald-50/70 shadow-lg'
                  : 'border-slate-200 bg-white/90 hover:border-slate-300 hover:shadow-md'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{workflow.workflowName}</div>
                  <div className="mt-1 text-xs text-slate-500">{workflow.id} · {workflow.domain}</div>
                </div>
                <Badge className={cn('border', statusBadgeClass(workflow.status))}>{workflow.status}</Badge>
              </div>
              <div className="mt-3 text-sm text-slate-600">{workflow.triggerCondition}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {workflow.workflowTags.map((tag) => (
                  <Badge key={tag} className="border-slate-200 bg-slate-100 text-slate-700">{tag}</Badge>
                ))}
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="glass-card rounded-[28px] border border-slate-200/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">Workflow Design Canvas</div>
                <div className="text-sm text-slate-500">Controlled lifecycle path, revision loop, and role-based decision sequencing.</div>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Open Workflow Detail', 'Edit Workflow', 'Add Stage', 'Assign Role', 'Configure Notification', 'Publish Workflow'].map((action) => (
                  <Button
                    key={action}
                    variant="outline"
                    className="h-9 rounded-full border-slate-300 bg-white/90 text-xs text-slate-700"
                    onClick={() =>
                      setDetailDrawer({
                        title: visibleWorkflow.workflowName,
                        subtitle: `${action} · ${visibleWorkflow.id}`,
                        tone: action === 'Publish Workflow' ? 'positive' : 'neutral',
                        metrics: [
                          { label: 'Workflow Status', value: visibleWorkflow.status },
                          { label: 'Last Updated', value: visibleWorkflow.lastUpdated },
                          { label: 'Trigger', value: visibleWorkflow.triggerCondition },
                        ],
                        bullets: [
                          `Approval path: ${visibleWorkflow.approvalPath}`,
                          `Revision path: ${visibleWorkflow.revisionPath}`,
                          `Notification rule: ${visibleWorkflow.notificationRule}`,
                        ],
                        actions: [action, 'Review Stage Rules', 'View Workflow History'],
                      })
                    }
                  >
                    {action}
                  </Button>
                ))}
              </div>
            </div>
            <div className="mt-5 h-[420px] overflow-hidden rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,rgba(240,253,250,0.65),rgba(248,250,252,0.96))]">
              <ReactFlow
                nodes={workflowNodes}
                edges={workflowEdges}
                fitView
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                panOnDrag={false}
                zoomOnScroll={false}
                zoomOnPinch={false}
                proOptions={{ hideAttribution: true }}
              >
                <MiniMap zoomable pannable style={{ backgroundColor: '#f8fafc' }} />
                <Controls showInteractive={false} />
                <Background color="#cbd5e1" gap={20} size={1.2} />
              </ReactFlow>
            </div>
          </section>

          <section className="space-y-6">
            <div className="glass-card rounded-[28px] border border-slate-200/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <div className="text-sm font-semibold text-slate-900">Stage Progression</div>
              <div className="mt-4 space-y-3">
                {visibleWorkflow.stages.map((stage, index) => (
                  <div key={stage.id} className="rounded-2xl border border-slate-200 bg-white/90 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">{index + 1}</div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{stage.label}</div>
                          <div className="text-xs text-slate-500">{stage.owner}</div>
                        </div>
                      </div>
                      <Badge className={cn('border', statusBadgeClass(stage.status === 'Complete' ? 'Published' : stage.status === 'Active' ? 'In Review' : 'Draft'))}>{stage.status}</Badge>
                    </div>
                    <div className="mt-3 text-xs text-slate-500">{stage.dueDiscipline}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-[28px] border border-slate-200/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <div className="text-sm font-semibold text-slate-900">Workflow Control Summary</div>
              <div className="mt-4 space-y-4 text-sm text-slate-600">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Assigned Roles</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {visibleWorkflow.assignedRoles.map((role) => (
                      <Badge key={role} className="border-slate-200 bg-white text-slate-700">{role}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Approval Path</div>
                  <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">{visibleWorkflow.approvalPath}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Revision Path</div>
                  <div className="mt-2 rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-amber-800">{visibleWorkflow.revisionPath}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Notification Rule</div>
                  <div className="mt-2 rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-emerald-800">{visibleWorkflow.notificationRule}</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    )
  }

  const renderApprovalQueue = () => {
    if (sortedApprovals.length === 0) {
      return <EmptyState title="No approval items match the current filters" description="Clear filters or broaden the search to inspect pending review and approval work." />
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-[24px] border border-amber-200 bg-amber-50/80 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-amber-700">Pending Approval</div>
            <div className="mt-2 text-3xl font-bold text-amber-950">{approvalQueueRecords.filter((item) => item.status === 'Pending Approval').length}</div>
            <div className="mt-1 text-sm text-amber-800">Assets waiting on controlled approval decisions.</div>
          </div>
          <div className="rounded-[24px] border border-rose-200 bg-rose-50/80 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-rose-700">Breached Turnaround</div>
            <div className="mt-2 text-3xl font-bold text-rose-950">{approvalQueueRecords.filter((item) => item.status === 'Overdue').length}</div>
            <div className="mt-1 text-sm text-rose-800">Items requiring escalation and governance intervention.</div>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-white/90 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Evidence Ready</div>
            <div className="mt-2 text-3xl font-bold text-slate-900">{approvalQueueRecords.filter((item) => !item.evidenceNote.toLowerCase().includes('missing')).length}</div>
            <div className="mt-1 text-sm text-slate-600">Assets with materially complete decision evidence packs.</div>
          </div>
        </div>

        <section className="glass-card rounded-[28px] border border-slate-200/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">Approval Queue</div>
              <div className="text-sm text-slate-500">Decision-ready items with workflow history, due timing, and reviewer accountability.</div>
            </div>
            <Badge className="border-slate-200 bg-white text-slate-600">Sortable queue</Badge>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.16em] text-slate-500">
                  <th className="px-3 py-3"><SortHeader current={approvalSort} column="assetTitle" label="Asset Title" onSort={(column) => setApprovalSort({ key: column, direction: approvalSort.key === column && approvalSort.direction === 'asc' ? 'desc' : 'asc' })} /></th>
                  <th className="px-3 py-3"><SortHeader current={approvalSort} column="workflowStage" label="Workflow Stage" onSort={(column) => setApprovalSort({ key: column, direction: approvalSort.key === column && approvalSort.direction === 'asc' ? 'desc' : 'asc' })} /></th>
                  <th className="px-3 py-3">Reviewer / Approver</th>
                  <th className="px-3 py-3"><SortHeader current={approvalSort} column="dueDate" label="Due Date" onSort={(column) => setApprovalSort({ key: column, direction: approvalSort.key === column && approvalSort.direction === 'asc' ? 'desc' : 'asc' })} /></th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3"><SortHeader current={approvalSort} column="priority" label="Priority" onSort={(column) => setApprovalSort({ key: column, direction: approvalSort.key === column && approvalSort.direction === 'asc' ? 'desc' : 'asc' })} /></th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedApprovals.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/80">
                    <td className="px-3 py-4 align-top">
                      <div className="font-semibold text-slate-900">{item.assetTitle}</div>
                      <div className="mt-1 text-xs text-slate-500">{item.workflowId} · {item.domain}</div>
                      <div className="mt-2 text-xs text-slate-500">Comments: {item.commentsCount}</div>
                    </td>
                    <td className="px-3 py-4 align-top">
                      <div className="text-slate-800">{item.workflowStage}</div>
                      <div className="mt-1 text-xs text-slate-500">Submitted {item.submissionDate}</div>
                    </td>
                    <td className="px-3 py-4 align-top">
                      <div className="text-slate-800">{item.assignedReviewer}</div>
                      <div className="mt-1 text-xs text-slate-500">Approver: {item.assignedApprover}</div>
                    </td>
                    <td className="px-3 py-4 align-top">
                      <div className="font-medium text-slate-900">{item.dueDate}</div>
                      <div className="mt-1 text-xs text-slate-500">{item.slaStatus}</div>
                    </td>
                    <td className="px-3 py-4 align-top">
                      <Badge className={cn('border', statusBadgeClass(item.status))}>{item.status}</Badge>
                    </td>
                    <td className="px-3 py-4 align-top">
                      <Badge className={cn('border', priorityClass(item.priority))}>{item.priority}</Badge>
                    </td>
                    <td className="px-3 py-4 align-top">
                      <div className="flex flex-wrap gap-2">
                        {['Open Approval Detail', 'Approve Asset', 'Reject Asset', 'Request Revision', 'Reassign Reviewer', 'View Workflow History'].map((action) => (
                          <button
                            type="button"
                            key={action}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
                            onClick={() =>
                              setDetailDrawer({
                                title: item.assetTitle,
                                subtitle: `${action} · ${item.workflowStage}`,
                                tone: item.status === 'Overdue' ? 'critical' : item.priority === 'High' ? 'warning' : 'neutral',
                                metrics: [
                                  { label: 'Reviewer', value: item.assignedReviewer },
                                  { label: 'Approver', value: item.assignedApprover },
                                  { label: 'Due Date', value: item.dueDate },
                                ],
                                bullets: [item.lastAction, item.evidenceNote, `Workflow tags: ${item.workflowTags.join(', ')}.`],
                                actions: [action, 'Compare Approval Timeline', 'Open Evidence Preview'],
                              })
                            }
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    )
  }

  const renderOwnershipDashboard = () => {
    if (sortedOwnership.length === 0) {
      return <EmptyState title="No ownership records match the current filters" description="Adjust filters to inspect assignment coverage, reviewer load, and stewardship gaps." />
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <section className="glass-card rounded-[28px] border border-slate-200/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">Ownership Load</div>
                <div className="text-sm text-slate-500">Distribution of active stewardship and ownership accountability.</div>
              </div>
              <Badge className="border-slate-200 bg-white text-slate-600">Top stewards</Badge>
            </div>
            <div className="mt-5 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ownershipLoadData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="assigned" radius={[10, 10, 0, 0]} fill="#0f766e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="glass-card rounded-[28px] border border-slate-200/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">Responsibility Coverage Summary</div>
                <div className="text-sm text-slate-500">Visibility into full assignments, partial coverage, and operational handover risk.</div>
              </div>
              <Badge className="border-rose-200 bg-rose-50 text-rose-700">{ownershipRecords.filter((item) => item.ownershipStatus !== 'Assigned').length} gaps</Badge>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white/90 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Fully Assigned</div>
                <div className="mt-2 text-3xl font-bold text-slate-900">{ownershipRecords.filter((item) => item.ownershipStatus === 'Assigned').length}</div>
                <div className="mt-1 text-xs text-slate-500">Assets with explicit owner, steward, reviewer, and approver coverage.</div>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-amber-700">Partial Coverage</div>
                <div className="mt-2 text-3xl font-bold text-amber-950">{ownershipRecords.filter((item) => item.ownershipStatus === 'Partial Coverage').length}</div>
                <div className="mt-1 text-xs text-amber-800">Assets with at least one accountability handoff or assignment gap.</div>
              </div>
              <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-rose-700">Unassigned</div>
                <div className="mt-2 text-3xl font-bold text-rose-950">{ownershipRecords.filter((item) => item.ownershipStatus === 'Unassigned').length}</div>
                <div className="mt-1 text-xs text-rose-800">Assets without an accountable owner or stewardship assignment.</div>
              </div>
            </div>
          </section>
        </div>

        <section className="glass-card rounded-[28px] border border-slate-200/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">Ownership Accountability Table</div>
              <div className="text-sm text-slate-500">Operational responsibility visibility across owners, stewards, reviewers, and approvers.</div>
            </div>
            <Badge className="border-slate-200 bg-white text-slate-600">Sortable accountability register</Badge>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.16em] text-slate-500">
                  <th className="px-3 py-3"><SortHeader current={ownershipSort} column="assetTitle" label="Asset Title" onSort={(column) => setOwnershipSort({ key: column, direction: ownershipSort.key === column && ownershipSort.direction === 'asc' ? 'desc' : 'asc' })} /></th>
                  <th className="px-3 py-3">Assignments</th>
                  <th className="px-3 py-3"><SortHeader current={ownershipSort} column="domain" label="Domain" onSort={(column) => setOwnershipSort({ key: column, direction: ownershipSort.key === column && ownershipSort.direction === 'asc' ? 'desc' : 'asc' })} /></th>
                  <th className="px-3 py-3">Ownership Status</th>
                  <th className="px-3 py-3"><SortHeader current={ownershipSort} column="reviewDueDate" label="Review Due" onSort={(column) => setOwnershipSort({ key: column, direction: ownershipSort.key === column && ownershipSort.direction === 'asc' ? 'desc' : 'asc' })} /></th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedOwnership.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/80">
                    <td className="px-3 py-4 align-top">
                      <div className="font-semibold text-slate-900">{item.assetTitle}</div>
                      <div className="mt-1 text-xs text-slate-500">Last updated {item.lastUpdatedDate}</div>
                    </td>
                    <td className="px-3 py-4 align-top">
                      <div className="flex flex-wrap gap-2">
                        <Badge className="border-slate-200 bg-white text-slate-700">Owner: {item.owner}</Badge>
                        <Badge className="border-slate-200 bg-white text-slate-700">Steward: {item.steward}</Badge>
                        <Badge className="border-slate-200 bg-white text-slate-700">Reviewer: {item.reviewer}</Badge>
                        <Badge className="border-slate-200 bg-white text-slate-700">Approver: {item.approver}</Badge>
                      </div>
                    </td>
                    <td className="px-3 py-4 align-top text-slate-700">{item.domain}</td>
                    <td className="px-3 py-4 align-top">
                      <div className="flex flex-col gap-2">
                        <Badge className={cn('w-fit border', statusBadgeClass(item.ownershipStatus === 'Assigned' ? 'Published' : item.ownershipStatus === 'Unassigned' ? 'Overdue' : 'In Review'))}>{item.ownershipStatus}</Badge>
                        <Badge className={cn('w-fit border', statusBadgeClass(item.slaStatus))}>{item.slaStatus}</Badge>
                      </div>
                    </td>
                    <td className="px-3 py-4 align-top">
                      <div className="font-medium text-slate-900">{item.reviewDueDate}</div>
                      <div className="mt-1 text-xs text-slate-500">{item.handoverAwareness}</div>
                    </td>
                    <td className="px-3 py-4 align-top">
                      <div className="flex flex-wrap gap-2">
                        {['Open Ownership Detail', 'Assign Owner', 'Assign Steward', 'Reassign Reviewer', 'View Responsibility History', 'Mark Ownership Gap'].map((action) => (
                          <button
                            type="button"
                            key={action}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
                            onClick={() =>
                              setDetailDrawer({
                                title: item.assetTitle,
                                subtitle: `${action} · ${item.domain}`,
                                tone: item.ownershipStatus === 'Unassigned' ? 'critical' : item.ownershipStatus === 'Partial Coverage' ? 'warning' : 'neutral',
                                metrics: [
                                  { label: 'Owner', value: item.owner },
                                  { label: 'Steward', value: item.steward },
                                  { label: 'Review Due', value: item.reviewDueDate },
                                ],
                                bullets: [item.handoverAwareness, `SLA status: ${item.slaStatus}.`, `Ownership status: ${item.ownershipStatus}.`],
                                actions: [action, 'Open Assignment Detail Drawer', 'Compare Domain Coverage'],
                              })
                            }
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    )
  }

  const renderExpirationTracker = () => {
    if (sortedExpirations.length === 0) {
      return <EmptyState title="No expiration records match the current filters" description="Broaden the filters to inspect upcoming expirations, archival readiness, and reminder history." />
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="glass-card rounded-[28px] border border-slate-200/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">Upcoming Expiration Overview</div>
                <div className="text-sm text-slate-500">Renewal planning and stale-content prevention across current knowledge assets.</div>
              </div>
              <Badge className="border-slate-200 bg-white text-slate-600">Days remaining bands</Badge>
            </div>
            <div className="mt-5 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expirationTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="window" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="assets" radius={[10, 10, 0, 0]} fill="#0f766e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="glass-card rounded-[28px] border border-slate-200/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">Notification and Reminder History</div>
                <div className="text-sm text-slate-500">Operational continuity signals for expiration follow-up and escalation readiness.</div>
              </div>
              <Badge className="border-amber-200 bg-amber-50 text-amber-700">Active follow-up</Badge>
            </div>
            <div className="mt-5 space-y-3">
              {sortedExpirations.slice(0, 4).map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-white/90 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{item.assetTitle}</div>
                      <div className="mt-1 text-xs text-slate-500">{item.notificationStatus}</div>
                    </div>
                    <Badge className={cn('border', riskClass(item.riskLevel))}>{item.riskLevel} risk</Badge>
                  </div>
                  <div className="mt-3 text-xs text-slate-500">Expiration date: {item.expirationDate}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="glass-card rounded-[28px] border border-slate-200/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">Expiration Monitoring Table</div>
              <div className="text-sm text-slate-500">Track content validity, renewal recommendation, archive readiness, and reminder status.</div>
            </div>
            <Badge className="border-slate-200 bg-white text-slate-600">Sortable timeline</Badge>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.16em] text-slate-500">
                  <th className="px-3 py-3"><SortHeader current={expirationSort} column="assetTitle" label="Asset Title" onSort={(column) => setExpirationSort({ key: column, direction: expirationSort.key === column && expirationSort.direction === 'asc' ? 'desc' : 'asc' })} /></th>
                  <th className="px-3 py-3">Current Status</th>
                  <th className="px-3 py-3"><SortHeader current={expirationSort} column="expirationDate" label="Expiration Date" onSort={(column) => setExpirationSort({ key: column, direction: expirationSort.key === column && expirationSort.direction === 'asc' ? 'desc' : 'asc' })} /></th>
                  <th className="px-3 py-3"><SortHeader current={expirationSort} column="daysRemaining" label="Days Remaining" onSort={(column) => setExpirationSort({ key: column, direction: expirationSort.key === column && expirationSort.direction === 'asc' ? 'desc' : 'asc' })} /></th>
                  <th className="px-3 py-3">Recommendation</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedExpirations.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/80">
                    <td className="px-3 py-4 align-top">
                      <div className="font-semibold text-slate-900">{item.assetTitle}</div>
                      <div className="mt-1 text-xs text-slate-500">Owner: {item.owner} · {item.domain}</div>
                    </td>
                    <td className="px-3 py-4 align-top">
                      <div className="flex flex-col gap-2">
                        <Badge className={cn('w-fit border', statusBadgeClass(item.currentStatus))}>{item.currentStatus}</Badge>
                        <Badge className={cn('w-fit border', riskClass(item.riskLevel))}>{item.riskLevel} risk</Badge>
                      </div>
                    </td>
                    <td className="px-3 py-4 align-top">
                      <div className="font-medium text-slate-900">{item.expirationDate}</div>
                      <div className="mt-1 text-xs text-slate-500">{item.notificationStatus}</div>
                    </td>
                    <td className="px-3 py-4 align-top">
                      <div className="text-2xl font-bold text-slate-900">{item.daysRemaining}</div>
                      <div className="mt-1 text-xs text-slate-500">days</div>
                    </td>
                    <td className="px-3 py-4 align-top">
                      <div className="text-slate-800">{item.renewalRecommendation}</div>
                      <div className="mt-1 text-xs text-slate-500">Archive: {item.archiveRecommendation}</div>
                    </td>
                    <td className="px-3 py-4 align-top">
                      <div className="flex flex-wrap gap-2">
                        {['Open Expiration Detail', 'Extend Validity', 'Assign Reviewer', 'Archive Content', 'Send Reminder', 'View Related Workflow'].map((action) => (
                          <button
                            type="button"
                            key={action}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
                            onClick={() =>
                              setDetailDrawer({
                                title: item.assetTitle,
                                subtitle: `${action} · expires ${item.expirationDate}`,
                                tone: item.riskLevel === 'High' ? 'critical' : item.riskLevel === 'Medium' ? 'warning' : 'neutral',
                                metrics: [
                                  { label: 'Owner', value: item.owner },
                                  { label: 'Days Remaining', value: String(item.daysRemaining) },
                                  { label: 'Current Status', value: item.currentStatus },
                                ],
                                bullets: [item.renewalRecommendation, item.archiveRecommendation, item.notificationStatus],
                                actions: [action, 'Open Notification History', 'Compare Validity Timeline'],
                              })
                            }
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    )
  }

  const activeContent = (() => {
    if (activeSection === 'workflow') {
      return renderWorkflowDesigner()
    }

    if (activeSection === 'approval') {
      return renderApprovalQueue()
    }

    if (activeSection === 'ownership') {
      return renderOwnershipDashboard()
    }

    if (activeSection === 'expiration') {
      return renderExpirationTracker()
    }

    return renderOverview()
  })()

  return (
    <div className="relative min-h-full overflow-hidden bg-[linear-gradient(180deg,#f5f7f6_0%,#eef4f2_45%,#f8fafc_100%)] px-6 py-6 text-slate-900">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute right-0 top-28 h-80 w-80 rounded-full bg-teal-200/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-slate-200/40 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1680px] space-y-6">
        <Breadcrumb
          items={[
            { label: 'Workspace', href: '/' },
            { label: 'SALVIA', href: '/' },
            { label: 'Knowledge Lifecycle & Workflow Management' },
          ]}
        />

        <PageHeader
          title="Knowledge Lifecycle & Workflow Management"
          description="Central enterprise workspace for governing knowledge lifecycle progression, stewardship accountability, SLA-driven update discipline, expiration readiness, and reminder-based operational follow-through."
          right={
            <div className="flex items-center gap-2">
              <Button variant="outline" className="h-10 rounded-full border-slate-300 bg-white/90 text-slate-700">
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Export Workspace
              </Button>
              <Button
                variant="outline"
                className={cn(
                  'h-10 rounded-full border-slate-300 bg-white/90 text-slate-700',
                  showFilters && 'border-emerald-300 bg-emerald-50 text-emerald-700'
                )}
                onClick={() => setShowFilters((current) => !current)}
              >
                <Filter className="mr-2 h-4 w-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>
          }
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
          {kpiCards.map((card) => {
            const Icon = card.icon
            return (
              <button
                type="button"
                key={card.label}
                onClick={() => setActiveSection(card.targetSection)}
                className={cn(
                  'relative overflow-hidden rounded-[26px] border p-4 text-left transition-all',
                  'bg-white/88 shadow-[0_16px_40px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(15,23,42,0.12)]',
                  activeSection === card.targetSection ? 'border-emerald-300 bg-emerald-50/70' : 'border-slate-200'
                )}
              >
                <div className="absolute right-3 top-3 opacity-15">
                  <Icon className="h-9 w-9 text-emerald-800" />
                </div>
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{card.label}</div>
                <div className="mt-2 text-3xl font-bold text-slate-900">{card.metric}</div>
                <div className="mt-2 text-sm text-slate-600">{card.description}</div>
                {card.trend ? <div className="mt-3 text-xs font-semibold text-emerald-700">{card.trend}</div> : null}
              </button>
            )
          })}
        </div>

        <section className="glass-card rounded-[32px] border border-slate-200/85 bg-white/75 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search knowledge asset title, owner, steward, reviewer, approver, workflow ID, status, SLA item, expiration date, or domain"
              className="h-11 rounded-2xl border-slate-200 bg-white pl-9"
            />
          </div>

          {showFilters ? (
            <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-3">
              <FilterChipGroup label="Status" options={statusOptions} selected={statusFilters} onToggle={(value) => toggleItem(value, statusFilters, setStatusFilters)} />
              <FilterChipGroup label="Workflow" options={workflowTagOptions} selected={workflowFilters} onToggle={(value) => toggleItem(value, workflowFilters, setWorkflowFilters)} />
              <FilterChipGroup label="Ownership" options={ownershipTagOptions} selected={ownershipFilters} onToggle={(value) => toggleItem(value, ownershipFilters, setOwnershipFilters)} />
              <FilterChipGroup label="SLA" options={slaTagOptions} selected={slaFilters} onToggle={(value) => toggleItem(value, slaFilters, setSlaFilters)} />
              <FilterChipGroup label="Domain" options={domainTagOptions} selected={domainFilters} onToggle={(value) => toggleItem(value, domainFilters, setDomainFilters)} />
              <FilterChipGroup label="Time" options={timeTagOptions} selected={timeFilters} onToggle={(value) => toggleItem(value, timeFilters, setTimeFilters)} />
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">Approval backlog: {lifecycleHealthSummary.approvalBacklog}</span>
            <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-rose-700">Overdue updates: {lifecycleHealthSummary.overdueUpdates}</span>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-amber-700">Expiring soon: {lifecycleHealthSummary.expiringSoon}</span>
            <button type="button" onClick={resetFilters} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900">
              Clear All Filters
            </button>
          </div>
        </section>

        <div className={cn('grid gap-6', detailDrawer ? 'xl:grid-cols-[280px_minmax(0,1fr)_340px]' : 'xl:grid-cols-[280px_minmax(0,1fr)]')}>
          <aside className="sticky top-6 self-start">
            <div className="glass-card rounded-[30px] border border-slate-200/85 bg-white/78 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
              <div className="px-2 pb-3">
                <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Lifecycle Workspace</div>
                <div className="mt-2 text-lg font-semibold text-slate-900">SALVIA Navigator</div>
                <div className="mt-1 text-sm text-slate-500">Process-oriented exploration for lifecycle governance, ownership, and validity control.</div>
              </div>
              <div className="space-y-2">
                {workspaceItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeSection === item.key
                  return (
                    <button
                      type="button"
                      key={item.key}
                      onClick={() => setActiveSection(item.key)}
                      className={cn(
                        'w-full rounded-[24px] border p-4 text-left transition-all',
                        isActive
                          ? 'border-emerald-300 bg-emerald-50/80 shadow-md'
                          : 'border-transparent bg-white/75 hover:border-slate-200 hover:bg-white'
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={cn('mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl border', isActive ? 'border-emerald-200 bg-white text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-600')}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{item.label}</div>
                            <div className="mt-1 text-xs leading-relaxed text-slate-500">{item.description}</div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {typeof item.count === 'number' ? <Badge className="border-slate-200 bg-white text-slate-700">{item.count}</Badge> : null}
                          <ChevronRight className={cn('h-4 w-4', isActive ? 'text-emerald-700' : 'text-slate-400')} />
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </aside>

          <main className="space-y-6">{activeContent}</main>

          {detailDrawer ? (
            <aside className="sticky top-6 self-start">
              <div className="glass-card rounded-[30px] border border-slate-200/85 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge className={cn('border', toneClass(detailDrawer.tone))}>Detail Drawer</Badge>
                    <div className="mt-3 text-lg font-semibold text-slate-900">{detailDrawer.title}</div>
                    <div className="mt-1 text-sm text-slate-500">{detailDrawer.subtitle}</div>
                  </div>
                  <button type="button" onClick={() => setDetailDrawer(null)} className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-900">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3">
                  {detailDrawer.metrics.map((metric) => (
                    <div key={metric.label} className="rounded-2xl border border-slate-200 bg-white/90 p-4">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{metric.label}</div>
                      <div className="mt-2 text-sm font-semibold text-slate-900">{metric.value}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-5">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Operational Notes</div>
                  <div className="mt-3 space-y-3">
                    {detailDrawer.bullets.map((bullet) => (
                      <div key={bullet} className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-sm text-slate-600">
                        <CircleAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Available Actions</div>
                  <div className="mt-3 grid grid-cols-1 gap-2">
                    {detailDrawer.actions.map((action) => (
                      <Button key={action} variant="outline" className="justify-start rounded-2xl border-slate-300 bg-white/90 text-slate-700">
                        <CheckCheck className="mr-2 h-4 w-4" />
                        {action}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  )
}