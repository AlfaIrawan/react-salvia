import { useMemo, useState } from 'react'
import {
  Activity,
  ArrowUpDown,
  ArrowUpRight,
  BadgeAlert,
  BadgeCheck,
  BookCheck,
  ChevronRight,
  Download,
  EyeOff,
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type WorkspaceSection = 'overview' | 'access' | 'classification' | 'audit' | 'compliance'
type StatusFilter =
  | 'Active'
  | 'Warning'
  | 'Restricted'
  | 'Violated'
  | 'Under Review'
  | 'Compliant'
  | 'Non-compliant'
type ClassificationLevel = 'Public' | 'Internal' | 'Confidential' | 'Restricted'
type AccessPermission = 'View' | 'Edit' | 'Review' | 'Publish' | 'Export' | 'Admin'
type PolicyMode = 'Allow' | 'Deny' | 'Masked' | 'Restricted Download' | 'Restricted AI Use'
type Domain = 'Customer' | 'Loan' | 'Collection' | 'Finance' | 'Risk' | 'Compliance' | 'Operations'
type TimeFilter = 'Today' | '7 Days' | '30 Days' | '90 Days' | 'Custom Range'
type SortDirection = 'asc' | 'desc'
type Tone = 'secure' | 'warning' | 'critical' | 'neutral'

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
  tone: Tone
  icon: React.ComponentType<{ className?: string }>
  target: WorkspaceSection
}

interface RoleRecord {
  roleName: string
  assignedUsers: number
  accessScope: string
  permissionSet: AccessPermission[]
  restrictedActions: string[]
  knowledgeDomains: Domain[]
  lastUpdated: string
  status: Extract<StatusFilter, 'Active' | 'Warning' | 'Restricted' | 'Under Review'>
  accessExceptions: number
  effectiveness: string
  inheritance: string
  timeWindow: TimeFilter
}

interface ClassificationRecord {
  assetTitle: string
  classificationLevel: ClassificationLevel
  policyApplied: string
  maskingStatus: string
  downloadRestriction: string
  aiUsageRestriction: string
  owner: string
  lastReviewed: string
  complianceImpact: string
  status: Extract<StatusFilter, 'Active' | 'Warning' | 'Restricted' | 'Under Review' | 'Violated'>
  domain: Domain
  policyModes: PolicyMode[]
  reviewStatus: string
  timeWindow: TimeFilter
}

interface AuditRecord {
  eventId: string
  eventType: string
  user: string
  role: string
  knowledgeAsset: string
  actionPerformed: string
  policyImpact: string
  timestamp: string
  result: 'Allowed' | 'Denied' | 'Masked' | 'Flagged'
  sourceContext: string
  domain: Domain
  risk: 'High' | 'Medium' | 'Low'
  status: Extract<StatusFilter, 'Active' | 'Warning' | 'Restricted' | 'Violated'>
  timeWindow: TimeFilter
}

interface ComplianceRecord {
  controlName: string
  mappedPolicy: string
  complianceStatus: Extract<StatusFilter, 'Compliant' | 'Warning' | 'Non-compliant' | 'Under Review'>
  exceptionCount: number
  remediationOwner: string
  dueDate: string
  coveragePercentage: number
  relatedDomain: Domain
  lastReviewedDate: string
  regulation: string
  timeWindow: TimeFilter
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

const workspaceItems: WorkspaceItem[] = [
  {
    key: 'overview',
    label: 'Overview',
    description: 'Governance posture, protection coverage, and policy effectiveness across SALVIA.',
    icon: Layers3,
  },
  {
    key: 'access',
    label: 'Access Control Manager',
    description: 'Govern roles, permissions, scope boundaries, and exception visibility.',
    icon: Users,
    count: 18,
  },
  {
    key: 'classification',
    label: 'Classification & Policy Panel',
    description: 'Control classification, masking behavior, and policy-driven knowledge usage.',
    icon: Shield,
    count: 126,
  },
  {
    key: 'audit',
    label: 'Audit Logs',
    description: 'Trace access, policy actions, knowledge changes, and restricted activity.',
    icon: Activity,
    count: 428,
  },
  {
    key: 'compliance',
    label: 'Compliance Dashboard',
    description: 'Monitor control coverage, exceptions, remediation, and audit readiness.',
    icon: BookCheck,
    count: 32,
  },
]

const kpiCards: KpiCard[] = [
  {
    label: 'Protected Knowledge Assets',
    metric: '18,426',
    description: 'Knowledge assets covered by active classification, masking, or policy controls.',
    trend: '+4.8% from prior month',
    tone: 'secure',
    icon: ShieldCheck,
    target: 'overview',
  },
  {
    label: 'Active Governance Policies',
    metric: '146',
    description: 'Live rules governing access, export, AI usage, and restricted reveal behavior.',
    trend: '12 reviewed this week',
    tone: 'neutral',
    icon: FileBadge2,
    target: 'classification',
  },
  {
    label: 'Restricted Access Events Today',
    metric: '43',
    description: 'Access attempts blocked or escalated because role, policy, or scope did not align.',
    trend: '8 require formal review',
    tone: 'critical',
    icon: BadgeAlert,
    target: 'audit',
  },
  {
    label: 'Masked Content Views',
    metric: '1,274',
    description: 'Sensitive fields protected before display to employees, reviewers, or AI assistants.',
    trend: '+11.2% after new masking rules',
    tone: 'warning',
    icon: EyeOff,
    target: 'classification',
  },
  {
    label: 'Audit Events Logged',
    metric: '92,311',
    description: 'Traceable access, policy, export, approval, and classification events retained for review.',
    trend: '99.98% pipeline completeness',
    tone: 'neutral',
    icon: Activity,
    target: 'audit',
  },
  {
    label: 'Compliance Controls Passing',
    metric: '91%',
    description: 'Controls currently passing internal and regulatory knowledge governance requirements.',
    trend: '+6 controls recovered in 30 days',
    tone: 'secure',
    icon: BadgeCheck,
    target: 'compliance',
  },
]

const statusFilterOptions: StatusFilter[] = [
  'Active',
  'Warning',
  'Restricted',
  'Violated',
  'Under Review',
  'Compliant',
  'Non-compliant',
]

const classificationFilterOptions: ClassificationLevel[] = [
  'Public',
  'Internal',
  'Confidential',
  'Restricted',
]

const accessFilterOptions: AccessPermission[] = ['View', 'Edit', 'Review', 'Publish', 'Export', 'Admin']
const policyFilterOptions: PolicyMode[] = ['Allow', 'Deny', 'Masked', 'Restricted Download', 'Restricted AI Use']
const domainFilterOptions: Domain[] = ['Customer', 'Loan', 'Collection', 'Finance', 'Risk', 'Compliance', 'Operations']
const timeFilterOptions: TimeFilter[] = ['Today', '7 Days', '30 Days', '90 Days', 'Custom Range']

const roleRecords: RoleRecord[] = [
  {
    roleName: 'Knowledge Steward - Retail Lending',
    assignedUsers: 23,
    accessScope: 'Retail lending playbooks, policies, and controlled training references.',
    permissionSet: ['View', 'Edit', 'Review', 'Publish'],
    restrictedActions: ['Export restricted collections', 'Override masking'],
    knowledgeDomains: ['Loan', 'Risk', 'Compliance'],
    lastUpdated: '2026-04-15',
    status: 'Active',
    accessExceptions: 1,
    effectiveness: '99.1% permission alignment over the last 30 days.',
    inheritance: 'Inherits reviewer rights from Knowledge Reviewer base role.',
    timeWindow: '30 Days',
  },
  {
    roleName: 'Collections Reviewer',
    assignedUsers: 14,
    accessScope: 'Collections scripts, hardship procedures, and exception review knowledge packs.',
    permissionSet: ['View', 'Review'],
    restrictedActions: ['Publish', 'Export', 'Admin'],
    knowledgeDomains: ['Collection', 'Compliance', 'Operations'],
    lastUpdated: '2026-04-13',
    status: 'Warning',
    accessExceptions: 3,
    effectiveness: 'Two temporary access grants still pending expiration confirmation.',
    inheritance: 'Child of Collections Analyst with review-only extension.',
    timeWindow: '7 Days',
  },
  {
    roleName: 'Compliance Governance Admin',
    assignedUsers: 7,
    accessScope: 'Enterprise-wide compliance evidence, audit exports, policy library, and exception handling.',
    permissionSet: ['View', 'Edit', 'Review', 'Publish', 'Export', 'Admin'],
    restrictedActions: ['Direct restricted reveal without dual control'],
    knowledgeDomains: ['Compliance', 'Finance', 'Risk', 'Operations'],
    lastUpdated: '2026-04-16',
    status: 'Active',
    accessExceptions: 0,
    effectiveness: 'No unauthorized action attempts recorded in current quarter.',
    inheritance: 'Top-level administrative role with dual-control enforcement.',
    timeWindow: 'Today',
  },
  {
    roleName: 'External Audit Read-Only',
    assignedUsers: 5,
    accessScope: 'Evidence packs, audit history, and approved governance snapshots only.',
    permissionSet: ['View'],
    restrictedActions: ['Edit', 'Review', 'Publish', 'Export restricted content', 'Admin'],
    knowledgeDomains: ['Compliance', 'Finance'],
    lastUpdated: '2026-03-29',
    status: 'Restricted',
    accessExceptions: 0,
    effectiveness: 'Locked to reviewed evidence vault with no write privileges.',
    inheritance: 'Standalone role with no inherited publish rights.',
    timeWindow: '90 Days',
  },
  {
    roleName: 'Customer Service Knowledge Analyst',
    assignedUsers: 31,
    accessScope: 'Customer handling scripts, onboarding knowledge, and approved FAQ assets.',
    permissionSet: ['View', 'Edit'],
    restrictedActions: ['Publish restricted content', 'Bulk export'],
    knowledgeDomains: ['Customer', 'Operations', 'Compliance'],
    lastUpdated: '2026-04-11',
    status: 'Under Review',
    accessExceptions: 2,
    effectiveness: 'Role redesign in progress after revised onboarding masking baseline.',
    inheritance: 'Inherits internal access scope from Customer Operations base role.',
    timeWindow: '30 Days',
  },
]

const classificationRecords: ClassificationRecord[] = [
  {
    assetTitle: 'Priority Customer Complaint Resolution Playbook',
    classificationLevel: 'Confidential',
    policyApplied: 'Complaint investigation controlled access policy',
    maskingStatus: 'PII masking enforced for customer identifiers and case notes.',
    downloadRestriction: 'Restricted download with reviewer approval only.',
    aiUsageRestriction: 'Allowed for grounded answering with masked context only.',
    owner: 'Customer Advocacy Office',
    lastReviewed: '2026-04-15',
    complianceImpact: 'Supports consumer protection evidence and complaint SLA review.',
    status: 'Active',
    domain: 'Customer',
    policyModes: ['Allow', 'Masked', 'Restricted Download'],
    reviewStatus: 'Reviewed by governance and privacy stewards.',
    timeWindow: 'Today',
  },
  {
    assetTitle: 'Retail Loan Override Guidance - Senior Underwriter Edition',
    classificationLevel: 'Restricted',
    policyApplied: 'High-risk credit override restriction policy',
    maskingStatus: 'Sensitive threshold references masked for non-authorized reviewers.',
    downloadRestriction: 'Export denied outside dual-approval workflow.',
    aiUsageRestriction: 'Restricted AI use for summary only, no recommendation mode.',
    owner: 'Retail Credit Governance',
    lastReviewed: '2026-04-16',
    complianceImpact: 'Direct effect on lending policy exception governance.',
    status: 'Restricted',
    domain: 'Loan',
    policyModes: ['Deny', 'Masked', 'Restricted Download', 'Restricted AI Use'],
    reviewStatus: 'Restriction rules reconfirmed after quarterly control testing.',
    timeWindow: 'Today',
  },
  {
    assetTitle: 'Collections Hardship Waiver Decision Tree',
    classificationLevel: 'Internal',
    policyApplied: 'Collections reviewer access and exception escalation policy',
    maskingStatus: 'Masked notes preview for hardship applicant references.',
    downloadRestriction: 'Download allowed for assigned collections teams only.',
    aiUsageRestriction: 'Allowed with redaction of hardship identifiers.',
    owner: 'Collections Strategy Office',
    lastReviewed: '2026-04-10',
    complianceImpact: 'Monitored for fair treatment and hardship governance controls.',
    status: 'Under Review',
    domain: 'Collection',
    policyModes: ['Allow', 'Masked'],
    reviewStatus: 'Awaiting confirmation of refreshed hardship retention policy.',
    timeWindow: '7 Days',
  },
  {
    assetTitle: 'Month-End Closing Checklist with Reviewer Notes',
    classificationLevel: 'Confidential',
    policyApplied: 'Finance close evidence access policy',
    maskingStatus: 'Field-level masking applied to journal owner identifiers.',
    downloadRestriction: 'Controlled export to approved finance reviewers.',
    aiUsageRestriction: 'Restricted AI use pending evidence vault segregation.',
    owner: 'Finance Governance Office',
    lastReviewed: '2026-04-02',
    complianceImpact: 'Influences internal control certification readiness.',
    status: 'Warning',
    domain: 'Finance',
    policyModes: ['Masked', 'Restricted Download', 'Restricted AI Use'],
    reviewStatus: 'Masking exceptions require remediation before full compliance signoff.',
    timeWindow: '30 Days',
  },
  {
    assetTitle: 'AML Escalation Routing Reference',
    classificationLevel: 'Internal',
    policyApplied: 'Regulatory escalation and monitoring policy',
    maskingStatus: 'Minimal masking; sensitive alert identifiers hidden for analysts.',
    downloadRestriction: 'Download allowed to compliance and risk roles.',
    aiUsageRestriction: 'Allowed for grounded policy navigation.',
    owner: 'Compliance Intelligence Desk',
    lastReviewed: '2026-04-14',
    complianceImpact: 'Supports suspicious activity governance and audit readiness.',
    status: 'Active',
    domain: 'Compliance',
    policyModes: ['Allow'],
    reviewStatus: 'No exception recorded in last review cycle.',
    timeWindow: '7 Days',
  },
  {
    assetTitle: 'Branch Access Incident Root Cause Library',
    classificationLevel: 'Restricted',
    policyApplied: 'Incident evidence disclosure and audit handling policy',
    maskingStatus: 'Extensive masking for employee, branch, and investigation references.',
    downloadRestriction: 'Download denied except for incident command reviewers.',
    aiUsageRestriction: 'AI use denied for unresolved incident records.',
    owner: 'Operational Risk Control',
    lastReviewed: '2026-03-26',
    complianceImpact: 'High impact to incident traceability and remediation governance.',
    status: 'Violated',
    domain: 'Operations',
    policyModes: ['Deny', 'Masked', 'Restricted Download', 'Restricted AI Use'],
    reviewStatus: 'One restricted excerpt was shared outside approved scope.',
    timeWindow: '90 Days',
  },
]

const auditRecords: AuditRecord[] = [
  {
    eventId: 'AUD-90411',
    eventType: 'Restricted Access Attempt',
    user: 'Rizky Mahendra',
    role: 'Customer Service Knowledge Analyst',
    knowledgeAsset: 'Retail Loan Override Guidance - Senior Underwriter Edition',
    actionPerformed: 'Attempted export from restricted knowledge panel',
    policyImpact: 'Denied by export restriction and scope mismatch rule.',
    timestamp: '2026-04-16 09:24',
    result: 'Denied',
    sourceContext: 'Knowledge portal export drawer',
    domain: 'Loan',
    risk: 'High',
    status: 'Restricted',
    timeWindow: 'Today',
  },
  {
    eventId: 'AUD-90403',
    eventType: 'Masked Content Reveal Review',
    user: 'Nadia Prameswari',
    role: 'Compliance Governance Admin',
    knowledgeAsset: 'Month-End Closing Checklist with Reviewer Notes',
    actionPerformed: 'Opened reviewer preview with field-level masking trace',
    policyImpact: 'Masked reveal approved under dual-control review ticket GOV-771.',
    timestamp: '2026-04-16 08:51',
    result: 'Masked',
    sourceContext: 'Masked preview drawer',
    domain: 'Finance',
    risk: 'Medium',
    status: 'Active',
    timeWindow: 'Today',
  },
  {
    eventId: 'AUD-90384',
    eventType: 'Policy Update',
    user: 'Maya Kartika',
    role: 'Compliance Governance Admin',
    knowledgeAsset: 'Priority Customer Complaint Resolution Playbook',
    actionPerformed: 'Published revised AI usage restriction clause',
    policyImpact: 'Restricted AI use replaced with masked-answer only policy.',
    timestamp: '2026-04-15 17:18',
    result: 'Allowed',
    sourceContext: 'Classification policy panel',
    domain: 'Customer',
    risk: 'Low',
    status: 'Active',
    timeWindow: '7 Days',
  },
  {
    eventId: 'AUD-90321',
    eventType: 'Permission Change',
    user: 'Aldo Kurniawan',
    role: 'Knowledge Steward - Retail Lending',
    knowledgeAsset: 'Collections Hardship Waiver Decision Tree',
    actionPerformed: 'Requested temporary review access for cross-domain validation',
    policyImpact: 'Flagged for scope exception review after domain mismatch.',
    timestamp: '2026-04-12 11:40',
    result: 'Flagged',
    sourceContext: 'Access control manager',
    domain: 'Collection',
    risk: 'Medium',
    status: 'Warning',
    timeWindow: '30 Days',
  },
  {
    eventId: 'AUD-90274',
    eventType: 'Classification Change',
    user: 'Tania Lestari',
    role: 'Operational Risk Control',
    knowledgeAsset: 'Branch Access Incident Root Cause Library',
    actionPerformed: 'Changed classification from Confidential to Restricted',
    policyImpact: 'Triggered mandatory export block and AI use denial.',
    timestamp: '2026-03-30 14:06',
    result: 'Allowed',
    sourceContext: 'Governance change log',
    domain: 'Operations',
    risk: 'High',
    status: 'Active',
    timeWindow: '90 Days',
  },
  {
    eventId: 'AUD-90218',
    eventType: 'Compliance Breach Review',
    user: 'Internal Audit Desk',
    role: 'External Audit Read-Only',
    knowledgeAsset: 'Branch Access Incident Root Cause Library',
    actionPerformed: 'Flagged evidence package after off-scope excerpt circulation',
    policyImpact: 'Opened violation workflow and remediation requirement.',
    timestamp: '2026-03-26 15:33',
    result: 'Flagged',
    sourceContext: 'Audit evidence review workspace',
    domain: 'Operations',
    risk: 'High',
    status: 'Violated',
    timeWindow: '90 Days',
  },
]

const complianceRecords: ComplianceRecord[] = [
  {
    controlName: 'Knowledge Access Segregation Control',
    mappedPolicy: 'RBAC segregation and dual-approval export standard',
    complianceStatus: 'Compliant',
    exceptionCount: 1,
    remediationOwner: 'Governance Operations Lead',
    dueDate: '2026-04-29',
    coveragePercentage: 97,
    relatedDomain: 'Compliance',
    lastReviewedDate: '2026-04-15',
    regulation: 'Internal Control Standard ICS-12',
    timeWindow: '30 Days',
  },
  {
    controlName: 'Restricted Knowledge Export Control',
    mappedPolicy: 'Restricted download and evidence release policy',
    complianceStatus: 'Warning',
    exceptionCount: 4,
    remediationOwner: 'Retail Credit Governance',
    dueDate: '2026-04-24',
    coveragePercentage: 88,
    relatedDomain: 'Loan',
    lastReviewedDate: '2026-04-16',
    regulation: 'OJK Information Handling Control',
    timeWindow: 'Today',
  },
  {
    controlName: 'Masked Content Exposure Control',
    mappedPolicy: 'PII masking and restricted reveal review rule',
    complianceStatus: 'Compliant',
    exceptionCount: 0,
    remediationOwner: 'Privacy Controls Office',
    dueDate: '2026-05-05',
    coveragePercentage: 99,
    relatedDomain: 'Customer',
    lastReviewedDate: '2026-04-14',
    regulation: 'Privacy Standard PS-07',
    timeWindow: '7 Days',
  },
  {
    controlName: 'AI Knowledge Usage Restriction Control',
    mappedPolicy: 'Restricted AI use and safe-answer boundary policy',
    complianceStatus: 'Under Review',
    exceptionCount: 3,
    remediationOwner: 'AI Governance Liaison',
    dueDate: '2026-04-30',
    coveragePercentage: 84,
    relatedDomain: 'Risk',
    lastReviewedDate: '2026-04-12',
    regulation: 'Responsible AI Internal Guideline',
    timeWindow: '30 Days',
  },
  {
    controlName: 'Audit Evidence Completeness Control',
    mappedPolicy: 'Governance audit retention and evidence lineage policy',
    complianceStatus: 'Non-compliant',
    exceptionCount: 5,
    remediationOwner: 'Operational Risk Control',
    dueDate: '2026-04-22',
    coveragePercentage: 72,
    relatedDomain: 'Operations',
    lastReviewedDate: '2026-04-09',
    regulation: 'Internal Audit Retention Framework',
    timeWindow: '30 Days',
  },
]

const classificationDistribution = [
  { name: 'Public', value: 11, color: '#cbd5e1' },
  { name: 'Internal', value: 37, color: '#0f766e' },
  { name: 'Confidential', value: 31, color: '#166534' },
  { name: 'Restricted', value: 21, color: '#b45309' },
]

const restrictedAccessTrend = [
  { period: 'Nov', denied: 18, masked: 420 },
  { period: 'Dec', denied: 21, masked: 463 },
  { period: 'Jan', denied: 25, masked: 518 },
  { period: 'Feb', denied: 29, masked: 601 },
  { period: 'Mar', denied: 37, masked: 935 },
  { period: 'Apr', denied: 43, masked: 1274 },
]

const auditEventTrend = [
  { week: 'W1', access: 13240, policy: 1280, export: 182 },
  { week: 'W2', access: 13690, policy: 1424, export: 201 },
  { week: 'W3', access: 14921, policy: 1518, export: 214 },
  { week: 'W4', access: 15483, policy: 1627, export: 239 },
]

const complianceTrend = [
  { month: 'Jan', passing: 81, warning: 11, failed: 8 },
  { month: 'Feb', passing: 84, warning: 10, failed: 6 },
  { month: 'Mar', passing: 88, warning: 8, failed: 4 },
  { month: 'Apr', passing: 91, warning: 6, failed: 3 },
]

const maskingActivity = [
  { label: 'Customer identity fields', value: '486 fields masked', note: 'Applied to complaint packs and onboarding knowledge.' },
  { label: 'Financial exposure references', value: '137 preview restrictions', note: 'Controlled reveal enabled only for finance and compliance reviewers.' },
  { label: 'Incident evidence identifiers', value: '92 hard masking rules', note: 'No AI usage permitted while incident remains unresolved.' },
]

const policySummary = [
  {
    title: 'Access discipline',
    value: '96.8%',
    note: 'Role-to-action policy decisions executed without manual override.',
  },
  {
    title: 'Classification coverage',
    value: '94%',
    note: 'Knowledge assets under explicit confidentiality labeling and review cadence.',
  },
  {
    title: 'Masking policy adherence',
    value: '98.6%',
    note: 'Protected fields masked before human or AI consumption.',
  },
]

const governanceTimeline = [
  {
    time: '09:24',
    title: 'Restricted export blocked',
    description: 'Retail lending guidance export attempt denied because the user role lacked restricted export approval.',
    tone: 'critical' as Tone,
  },
  {
    time: '08:51',
    title: 'Masked preview approved',
    description: 'Finance checklist preview opened under dual-control review with field-level reveal trace captured.',
    tone: 'warning' as Tone,
  },
  {
    time: 'Yesterday',
    title: 'AI usage rule revised',
    description: 'Customer complaint playbook moved to masked-answer-only mode under the new governance baseline.',
    tone: 'secure' as Tone,
  },
  {
    time: 'Yesterday',
    title: 'Compliance breach remediation assigned',
    description: 'Operational risk team assigned corrective action after evidence excerpt moved outside approved boundary.',
    tone: 'critical' as Tone,
  },
]

const permissionBoundaryBlocks = [
  {
    title: 'Retail Lending controlled role inheritance',
    summary: 'Steward, reviewer, and audit roles share view permissions but diverge sharply on export and publish rights.',
    bullets: [
      'Knowledge Steward inherits review rights but not restricted reveal rights.',
      'External Audit is hard-limited to approved evidence vault snapshots.',
      'All restricted exports require dual approval and logged justification.',
    ],
  },
  {
    title: 'Customer knowledge masking boundary',
    summary: 'Customer service analysts can edit approved internal assets, but masked PII remains non-reversible outside reviewer flow.',
    bullets: [
      'Customer identifiers remain hidden in analyst preview mode.',
      'Masking exception requests route to privacy control review.',
      'AI-assisted summaries use masked context by policy default.',
    ],
  },
  {
    title: 'Compliance administration boundary',
    summary: 'Administrative roles are broad but still gated by policy evidence requirements and dual-control for restricted reveals.',
    bullets: [
      'Administrative edit rights do not bypass evidence retention rules.',
      'Restricted reveal always writes an audit event with ticket reference.',
      'Quarterly control tests verify inherited rights remain appropriate.',
    ],
  },
]

const policyRuleCards = [
  {
    title: 'Restricted AI Answer Boundary',
    scope: 'Restricted and confidential policy assets used by assistants and search copilots.',
    logic: 'Allow grounded retrieval only after masking; deny recommendation mode for restricted collections.',
    target: 'Classification & Policy Panel',
  },
  {
    title: 'Controlled Export Evidence Rule',
    scope: 'High-risk lending, incident, and finance close knowledge assets.',
    logic: 'Require reviewer approval, business justification, and evidence package binding before export release.',
    target: 'Access Control Manager',
  },
  {
    title: 'Masking Exception Workflow',
    scope: 'Customer complaint, onboarding, hardship, and incident evidence content.',
    logic: 'Partial reveal only for approved reviewers; always log reveal event and reason code.',
    target: 'Audit Logs',
  },
]

const complianceCalendar = [
  { date: 'Apr 18', title: 'Restricted export control retest', owner: 'Retail Credit Governance', status: 'Scheduled' },
  { date: 'Apr 21', title: 'Audit evidence completeness checkpoint', owner: 'Operational Risk Control', status: 'At Risk' },
  { date: 'Apr 24', title: 'Knowledge AI restriction policy review', owner: 'AI Governance Liaison', status: 'Scheduled' },
  { date: 'Apr 29', title: 'Segregation control signoff', owner: 'Governance Operations Lead', status: 'Ready' },
]

const meshNodes: Node[] = [
  {
    id: 'ficus',
    position: { x: 280, y: 10 },
    data: { label: 'Ficus Policy Source' },
    sourcePosition: Position.Bottom,
    style: flowNodeStyle('#0f766e', '#ecfdf5'),
  },
  {
    id: 'salvia',
    position: { x: 250, y: 120 },
    data: { label: 'SALVIA Governance Layer' },
    targetPosition: Position.Top,
    sourcePosition: Position.Bottom,
    style: flowNodeStyle('#14532d', '#f0fdf4'),
  },
  {
    id: 'rbac',
    position: { x: 20, y: 255 },
    data: { label: 'RBAC and Role Scope' },
    targetPosition: Position.Top,
    style: flowNodeStyle('#334155', '#f8fafc'),
  },
  {
    id: 'classification',
    position: { x: 220, y: 255 },
    data: { label: 'Classification and Masking' },
    targetPosition: Position.Top,
    style: flowNodeStyle('#0f766e', '#f0fdfa'),
  },
  {
    id: 'audit',
    position: { x: 455, y: 255 },
    data: { label: 'Audit and Compliance Evidence' },
    targetPosition: Position.Top,
    style: flowNodeStyle('#92400e', '#fffbeb'),
  },
]

const meshEdges: Edge[] = [
  {
    id: 'ficus-salvia',
    source: 'ficus',
    target: 'salvia',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#0f766e' },
    style: { stroke: '#0f766e', strokeWidth: 2.2 },
    label: 'Policy baseline',
  },
  {
    id: 'salvia-rbac',
    source: 'salvia',
    target: 'rbac',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#14532d' },
    style: { stroke: '#14532d', strokeWidth: 2 },
    label: 'Enforced access',
  },
  {
    id: 'salvia-classification',
    source: 'salvia',
    target: 'classification',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#14532d' },
    style: { stroke: '#14532d', strokeWidth: 2 },
    label: 'Protection rules',
  },
  {
    id: 'salvia-audit',
    source: 'salvia',
    target: 'audit',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#92400e' },
    style: { stroke: '#92400e', strokeWidth: 2 },
    label: 'Evidence trail',
  },
]

export function GovernanceSecurityAccessControlPage() {
  const [activeSection, setActiveSection] = useState<WorkspaceSection>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilters, setStatusFilters] = useState<StatusFilter[]>([])
  const [classificationFilters, setClassificationFilters] = useState<ClassificationLevel[]>([])
  const [accessFilters, setAccessFilters] = useState<AccessPermission[]>([])
  const [policyFilters, setPolicyFilters] = useState<PolicyMode[]>([])
  const [domainFilters, setDomainFilters] = useState<Domain[]>([])
  const [timeFilters, setTimeFilters] = useState<TimeFilter[]>(['30 Days'])
  const [drawerState, setDrawerState] = useState<DetailDrawerState | null>(null)
  const [expandedPolicyTitle, setExpandedPolicyTitle] = useState(policyRuleCards[0].title)
  const [expandedBoundaryTitle, setExpandedBoundaryTitle] = useState(permissionBoundaryBlocks[0].title)
  const [accessSort, setAccessSort] = useState<SortState<'roleName' | 'assignedUsers' | 'lastUpdated' | 'status'>>({
    key: 'roleName',
    direction: 'asc',
  })
  const [classificationSort, setClassificationSort] = useState<
    SortState<'assetTitle' | 'classificationLevel' | 'lastReviewed' | 'status'>
  >({
    key: 'assetTitle',
    direction: 'asc',
  })
  const [auditSort, setAuditSort] = useState<SortState<'timestamp' | 'eventType' | 'result' | 'risk'>>({
    key: 'timestamp',
    direction: 'desc',
  })
  const [complianceSort, setComplianceSort] = useState<
    SortState<'controlName' | 'coveragePercentage' | 'exceptionCount' | 'dueDate'>
  >({
    key: 'coveragePercentage',
    direction: 'desc',
  })

  const normalizedSearch = searchTerm.trim().toLowerCase()

  const filteredAccessRoles = useMemo(
    () =>
      sortItems(
        roleRecords.filter((record) => {
          return (
            matchesSearch(
              normalizedSearch,
              record.roleName,
              record.accessScope,
              record.permissionSet.join(' '),
              record.restrictedActions.join(' '),
              record.knowledgeDomains.join(' '),
              record.inheritance,
            ) &&
            matchesOne(statusFilters, record.status) &&
            matchesMany(domainFilters, record.knowledgeDomains) &&
            matchesMany(accessFilters, record.permissionSet) &&
            matchesOne(timeFilters, record.timeWindow)
          )
        }),
        accessSort,
        {
          roleName: (record) => record.roleName,
          assignedUsers: (record) => record.assignedUsers,
          lastUpdated: (record) => record.lastUpdated,
          status: (record) => record.status,
        },
      ),
    [normalizedSearch, statusFilters, domainFilters, accessFilters, timeFilters, accessSort],
  )

  const filteredClassificationRecords = useMemo(
    () =>
      sortItems(
        classificationRecords.filter((record) => {
          return (
            matchesSearch(
              normalizedSearch,
              record.assetTitle,
              record.policyApplied,
              record.owner,
              record.complianceImpact,
              record.maskingStatus,
              record.domain,
            ) &&
            matchesOne(statusFilters, record.status) &&
            matchesOne(classificationFilters, record.classificationLevel) &&
            matchesOne(domainFilters, record.domain) &&
            matchesMany(policyFilters, record.policyModes) &&
            matchesOne(timeFilters, record.timeWindow)
          )
        }),
        classificationSort,
        {
          assetTitle: (record) => record.assetTitle,
          classificationLevel: (record) => record.classificationLevel,
          lastReviewed: (record) => record.lastReviewed,
          status: (record) => record.status,
        },
      ),
    [
      normalizedSearch,
      statusFilters,
      classificationFilters,
      domainFilters,
      policyFilters,
      timeFilters,
      classificationSort,
    ],
  )

  const filteredAuditRecords = useMemo(
    () =>
      sortItems(
        auditRecords.filter((record) => {
          return (
            matchesSearch(
              normalizedSearch,
              record.eventId,
              record.eventType,
              record.user,
              record.role,
              record.knowledgeAsset,
              record.sourceContext,
            ) &&
            matchesOne(statusFilters, record.status) &&
            matchesOne(domainFilters, record.domain) &&
            matchesOne(timeFilters, record.timeWindow) &&
            matchesPolicyFilter(policyFilters, record.policyImpact)
          )
        }),
        auditSort,
        {
          timestamp: (record) => record.timestamp,
          eventType: (record) => record.eventType,
          result: (record) => record.result,
          risk: (record) => record.risk,
        },
      ),
    [normalizedSearch, statusFilters, domainFilters, timeFilters, policyFilters, auditSort],
  )

  const filteredComplianceRecords = useMemo(
    () =>
      sortItems(
        complianceRecords.filter((record) => {
          return (
            matchesSearch(
              normalizedSearch,
              record.controlName,
              record.mappedPolicy,
              record.remediationOwner,
              record.regulation,
              record.relatedDomain,
            ) &&
            matchesOne(statusFilters, record.complianceStatus) &&
            matchesOne(domainFilters, record.relatedDomain) &&
            matchesOne(timeFilters, record.timeWindow)
          )
        }),
        complianceSort,
        {
          controlName: (record) => record.controlName,
          coveragePercentage: (record) => record.coveragePercentage,
          exceptionCount: (record) => record.exceptionCount,
          dueDate: (record) => record.dueDate,
        },
      ),
    [normalizedSearch, statusFilters, domainFilters, timeFilters, complianceSort],
  )

  const totalActiveFilters =
    statusFilters.length +
    classificationFilters.length +
    accessFilters.length +
    policyFilters.length +
    domainFilters.length +
    timeFilters.length

  return (
    <div className="space-y-6 pb-8">
      <div className="space-y-3">
        <Breadcrumb
          items={[
            { label: 'Enterprise Knowledge Management', href: '/' },
            { label: 'Governance, Security & Access Control' },
          ]}
        />
        <PageHeader
          title="Governance, Security & Access Control"
          description="Central governance workspace for role-based access, knowledge classification, masking, policy enforcement, auditability, and compliance readiness across SALVIA."
          right={
            <div className="flex items-center gap-2">
              <Badge className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-50">
                Ficus-integrated protection layer
              </Badge>
              <Button
                className="gap-2 rounded-full bg-slate-900 px-4 text-white hover:bg-slate-800"
                onClick={() =>
                  setDrawerState({
                    title: 'Governance Evidence Export',
                    subtitle: 'Enterprise-ready evidence package prepared from SALVIA governance telemetry.',
                    tone: 'secure',
                    metrics: [
                      { label: 'Export scope', value: 'Policies, masking trace, audit trail, control status' },
                      { label: 'Prepared for', value: 'Internal audit and compliance assurance' },
                      { label: 'Snapshot time', value: '2026-04-16 09:30 WIB' },
                    ],
                    bullets: [
                      'Restricted access events include policy decision references and source context.',
                      'Classification and masking evidence are grouped by domain and owner.',
                      'Control exceptions are linked to remediation owners and due dates.',
                    ],
                    actions: ['Export Audit Evidence', 'Export Compliance Evidence', 'View Audit Logs'],
                  })
                }
              >
                <Download className="h-4 w-4" />
                Export Governance Evidence
              </Button>
            </div>
          }
        />
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {kpiCards.map((card) => {
          const Icon = card.icon
          return (
            <button
              key={card.label}
              type="button"
              onClick={() => setActiveSection(card.target)}
              className={cn(
                'rounded-[26px] border p-5 text-left shadow-[0_18px_45px_-28px_rgba(15,23,42,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_48px_-24px_rgba(15,23,42,0.45)]',
                cardToneClass(card.tone),
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{card.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-950">{card.metric}</p>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/80 p-2.5 shadow-sm">
                  <Icon className="h-5 w-5 text-slate-700" />
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{card.description}</p>
              <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-700">
                <ArrowUpRight className="h-3.5 w-3.5" />
                {card.trend}
              </div>
            </button>
          )
        })}
      </section>

      <section className="rounded-[28px] border border-slate-200/80 bg-white/75 p-5 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.4)] backdrop-blur-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search user name, role name, knowledge asset, policy, classification, audit event, control, masked field, domain, or owner"
                className="h-12 rounded-2xl border-slate-200 bg-slate-50/90 pl-11 pr-4 text-sm"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50">
                <Filter className="mr-1 h-3.5 w-3.5" />
                {totalActiveFilters} active filters
              </Badge>
              <Button
                variant="outline"
                className="rounded-full border-slate-200 bg-white"
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilters([])
                  setClassificationFilters([])
                  setAccessFilters([])
                  setPolicyFilters([])
                  setDomainFilters([])
                  setTimeFilters([])
                }}
              >
                Clear filters
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <FilterChipRow label="Status" options={statusFilterOptions} selected={statusFilters} onToggle={(value) => setStatusFilters(toggleValue(statusFilters, value))} />
            <FilterChipRow label="Classification" options={classificationFilterOptions} selected={classificationFilters} onToggle={(value) => setClassificationFilters(toggleValue(classificationFilters, value))} />
            <FilterChipRow label="Access" options={accessFilterOptions} selected={accessFilters} onToggle={(value) => setAccessFilters(toggleValue(accessFilters, value))} />
            <FilterChipRow label="Policy" options={policyFilterOptions} selected={policyFilters} onToggle={(value) => setPolicyFilters(toggleValue(policyFilters, value))} />
            <FilterChipRow label="Domain" options={domainFilterOptions} selected={domainFilters} onToggle={(value) => setDomainFilters(toggleValue(domainFilters, value))} />
            <FilterChipRow label="Time" options={timeFilterOptions} selected={timeFilters} onToggle={(value) => setTimeFilters(toggleValue(timeFilters, value))} />
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="xl:sticky xl:top-24">
            <div className="overflow-hidden rounded-[26px] border border-slate-200/80 bg-[linear-gradient(160deg,rgba(236,253,245,0.85),rgba(255,255,255,0.95))] p-3 shadow-[0_20px_40px_-36px_rgba(15,23,42,0.45)]">
              <div className="px-3 pb-3 pt-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700">Workspace Navigator</p>
                <h2 className="mt-2 text-lg font-semibold text-slate-950">Knowledge Governance Workspace</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Persistent navigation for protection, policy, traceability, and compliance assurance.
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
                        'w-full rounded-[22px] border px-4 py-3 text-left transition-all duration-200',
                        isActive
                          ? 'border-emerald-300 bg-emerald-950 text-white shadow-[0_20px_40px_-32px_rgba(6,78,59,0.9)]'
                          : 'border-transparent bg-white/80 hover:border-emerald-200 hover:bg-white',
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={cn('rounded-2xl p-2', isActive ? 'bg-white/10' : 'bg-emerald-50')}>
                            <Icon className={cn('h-4.5 w-4.5', isActive ? 'text-white' : 'text-emerald-700')} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={cn('text-sm font-semibold', isActive ? 'text-white' : 'text-slate-900')}>
                                {item.label}
                              </span>
                              {typeof item.count === 'number' ? (
                                <span
                                  className={cn(
                                    'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                                    isActive ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-600',
                                  )}
                                >
                                  {item.count}
                                </span>
                              ) : null}
                            </div>
                            <p className={cn('mt-1 text-xs leading-5', isActive ? 'text-emerald-50/90' : 'text-slate-500')}>
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className={cn('mt-0.5 h-4 w-4', isActive ? 'text-white' : 'text-slate-400')} />
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </aside>

          <main className="min-w-0">
            {activeSection === 'overview' && (
              <div className="space-y-5">
                <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
                  <WorkspacePanel
                    eyebrow="Governance posture"
                    title="Enterprise knowledge protection overview"
                    description="A consolidated command view for access discipline, classification strength, masking evidence, policy activity, and compliance readiness."
                  >
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {policySummary.map((item) => (
                        <div key={item.title} className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-emerald-700">{item.title}</p>
                          <p className="mt-2 text-3xl font-semibold text-slate-950">{item.value}</p>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{item.note}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 grid gap-5 xl:grid-cols-2">
                      <ChartPanel title="Classification distribution" description="Visibility into knowledge sensitivity and controlled exposure posture.">
                        <ResponsiveContainer width="100%" height={270}>
                          <PieChart>
                            <Pie data={classificationDistribution} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={3}>
                              {classificationDistribution.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {classificationDistribution.map((entry) => (
                            <LegendChip key={entry.name} label={entry.name} value={`${entry.value}%`} color={entry.color} />
                          ))}
                        </div>
                      </ChartPanel>

                      <ChartPanel title="Restricted access trend" description="Denied attempts and masked access growth over the current monitoring horizon.">
                        <ResponsiveContainer width="100%" height={270}>
                          <BarChart data={restrictedAccessTrend}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="period" tickLine={false} axisLine={false} />
                            <YAxis tickLine={false} axisLine={false} />
                            <Tooltip />
                            <Bar dataKey="denied" radius={[10, 10, 0, 0]} fill="#b45309" />
                            <Bar dataKey="masked" radius={[10, 10, 0, 0]} fill="#0f766e" />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartPanel>
                    </div>
                  </WorkspacePanel>

                  <WorkspacePanel
                    eyebrow="Ficus-aligned control mesh"
                    title="Policy-to-enforcement topology"
                    description="SALVIA consumes governance baselines from Ficus, then operationalizes them through access boundaries, classification, masking, and evidence generation."
                  >
                    <div className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-3">
                      <div className="h-[360px] overflow-hidden rounded-[22px] border border-slate-200 bg-white">
                        <ReactFlow nodes={meshNodes} edges={meshEdges} fitView nodesDraggable={false} nodesConnectable={false} elementsSelectable={false} proOptions={{ hideAttribution: true }}>
                          <MiniMap pannable zoomable nodeColor="#14532d" />
                          <Controls showInteractive={false} />
                          <Background color="#dbe4e7" gap={16} />
                        </ReactFlow>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3">
                      <InfoStrip title="Policy source" value="Ficus governance baseline and stewardship semantics are referenced for knowledge-specific enforcement." />
                      <InfoStrip title="Protection runtime" value="Role scope, masking, export restrictions, and AI usage boundaries are made operational inside SALVIA." />
                      <InfoStrip title="Trace outcome" value="Every reveal, deny, publish, and classification action is converted into audit evidence and compliance telemetry." />
                    </div>
                  </WorkspacePanel>
                </div>

                <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
                  <WorkspacePanel
                    eyebrow="Audit and compliance health"
                    title="Audit event and control readiness monitoring"
                    description="Operational transparency for governance activity, evidence quality, and compliance posture movement."
                  >
                    <div className="grid gap-5 xl:grid-cols-2">
                      <ChartPanel title="Audit event trend" description="Access, policy, and export events logged each week.">
                        <ResponsiveContainer width="100%" height={260}>
                          <AreaChart data={auditEventTrend}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="week" tickLine={false} axisLine={false} />
                            <YAxis tickLine={false} axisLine={false} />
                            <Tooltip />
                            <Area type="monotone" dataKey="access" stroke="#0f766e" fill="#99f6e4" fillOpacity={0.45} />
                            <Area type="monotone" dataKey="policy" stroke="#14532d" fill="#bbf7d0" fillOpacity={0.35} />
                            <Area type="monotone" dataKey="export" stroke="#b45309" fill="#fde68a" fillOpacity={0.35} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </ChartPanel>

                      <ChartPanel title="Compliance trend" description="Passing, warning, and failed controls over the review cycle.">
                        <ResponsiveContainer width="100%" height={260}>
                          <LineChart data={complianceTrend}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} />
                            <YAxis tickLine={false} axisLine={false} />
                            <Tooltip />
                            <Line type="monotone" dataKey="passing" stroke="#166534" strokeWidth={3} dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="warning" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="failed" stroke="#dc2626" strokeWidth={2.5} dot={{ r: 4 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartPanel>
                    </div>
                  </WorkspacePanel>

                  <WorkspacePanel
                    eyebrow="Recent governance activity"
                    title="Protection and policy timeline"
                    description="Traceable governance changes that influence how enterprise knowledge can be accessed and used."
                  >
                    <div className="space-y-4">
                      {governanceTimeline.map((event) => (
                        <div key={`${event.time}-${event.title}`} className="flex gap-4 rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4">
                          <div className={cn('mt-1 h-2.5 w-2.5 rounded-full', timelineDotClass(event.tone))} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                              <span className="text-xs font-medium text-slate-500">{event.time}</span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-slate-600">{event.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 grid gap-3">
                      {maskingActivity.map((item) => (
                        <div key={item.label} className="rounded-[22px] border border-slate-200 bg-white p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">{item.label}</p>
                          <p className="mt-2 text-lg font-semibold text-slate-950">{item.value}</p>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{item.note}</p>
                        </div>
                      ))}
                    </div>
                  </WorkspacePanel>
                </div>
              </div>
            )}

            {activeSection === 'access' && (
              <div className="space-y-5">
                <WorkspacePanel
                  eyebrow="Role governance"
                  title="Access Control Manager"
                  description="Operational control center for who can view, edit, review, publish, export, or administer governed enterprise knowledge."
                >
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryBlock title="Governed roles" value="18" note="Role definitions actively monitored for scope drift and exception volume." />
                    <SummaryBlock title="Users under governed scope" value="412" note="Users covered by intentional role assignments across SALVIA domains." />
                    <SummaryBlock title="Open access exceptions" value="6" note="Temporary or conditional grants awaiting review or expiry confirmation." />
                    <SummaryBlock title="Restricted action coverage" value="100%" note="High-risk actions mapped to approval logic and audit logging." />
                  </div>
                </WorkspacePanel>

                <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.18fr)_minmax(340px,0.82fr)]">
                  <WorkspacePanel
                    eyebrow="Role inventory"
                    title="Permission matrix and role scope visibility"
                    description="Sortable inventory of governed roles, action-level rights, domain scope, and monitored exceptions."
                  >
                    <div className="overflow-hidden rounded-[24px] border border-slate-200">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                          <thead className="bg-slate-50/90">
                            <tr>
                              <TableHeader label="Role name" active={accessSort.key === 'roleName'} direction={accessSort.direction} onClick={() => setAccessSort(toggleSort(accessSort, 'roleName'))} />
                              <TableHeader label="Assigned users" active={accessSort.key === 'assignedUsers'} direction={accessSort.direction} onClick={() => setAccessSort(toggleSort(accessSort, 'assignedUsers'))} align="right" />
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Access scope</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Permissions</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Restricted actions</th>
                              <TableHeader label="Last updated" active={accessSort.key === 'lastUpdated'} direction={accessSort.direction} onClick={() => setAccessSort(toggleSort(accessSort, 'lastUpdated'))} />
                              <TableHeader label="Status" active={accessSort.key === 'status'} direction={accessSort.direction} onClick={() => setAccessSort(toggleSort(accessSort, 'status'))} />
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 bg-white">
                            {filteredAccessRoles.length === 0 ? (
                              <EmptyTableRow colSpan={8} title="No governed roles match the current filter set." description="Adjust status, domain, access, or time filters to restore role inventory visibility." />
                            ) : (
                              filteredAccessRoles.map((record) => (
                                <tr key={record.roleName} className="hover:bg-slate-50/80">
                                  <td className="px-4 py-4 align-top">
                                    <div>
                                      <p className="font-semibold text-slate-900">{record.roleName}</p>
                                      <p className="mt-1 text-xs text-slate-500">{record.inheritance}</p>
                                      <div className="mt-2 flex flex-wrap gap-2">
                                        {record.knowledgeDomains.map((domain) => (
                                          <TagBadge key={domain}>{domain}</TagBadge>
                                        ))}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-right text-sm font-medium text-slate-700">{record.assignedUsers}</td>
                                  <td className="px-4 py-4 text-sm leading-6 text-slate-600">{record.accessScope}</td>
                                  <td className="px-4 py-4">
                                    <div className="flex flex-wrap gap-2">
                                      {record.permissionSet.map((permission) => (
                                        <PermissionChip key={permission} label={permission} />
                                      ))}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-sm leading-6 text-slate-600">{record.restrictedActions.join(', ')}</td>
                                  <td className="px-4 py-4 text-sm text-slate-600">{record.lastUpdated}</td>
                                  <td className="px-4 py-4">
                                    <StatusBadge value={record.status} />
                                  </td>
                                  <td className="px-4 py-4 align-top">
                                    <div className="flex flex-wrap gap-2">
                                      {['Open Role Detail', 'Edit Permissions', 'Assign User', 'Remove Access', 'View Access Scope', 'Audit Role Usage'].map((action) => (
                                        <ActionPill
                                          key={action}
                                          label={action}
                                          onClick={() =>
                                            setDrawerState({
                                              title: `${action} — ${record.roleName}`,
                                              subtitle: record.accessScope,
                                              tone: record.status === 'Restricted' ? 'critical' : record.status === 'Warning' || record.status === 'Under Review' ? 'warning' : 'secure',
                                              metrics: [
                                                { label: 'Assigned users', value: String(record.assignedUsers) },
                                                { label: 'Access exceptions', value: String(record.accessExceptions) },
                                                { label: 'Role effectiveness', value: record.effectiveness },
                                              ],
                                              bullets: [
                                                `Inherited rights: ${record.inheritance}`,
                                                `Restricted actions: ${record.restrictedActions.join(', ')}`,
                                                `Domain coverage: ${record.knowledgeDomains.join(', ')}`,
                                              ],
                                              actions: ['Edit Permissions', 'Assign User', 'Audit Role Usage'],
                                            })
                                          }
                                        />
                                      ))}
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </WorkspacePanel>

                  <div className="space-y-5">
                    <WorkspacePanel
                      eyebrow="Boundary comparison"
                      title="Role and scope discipline"
                      description="Compare how permissions diverge across controlled access boundaries."
                    >
                      <div className="space-y-3">
                        {permissionBoundaryBlocks.map((block) => {
                          const expanded = expandedBoundaryTitle === block.title
                          return (
                            <button
                              key={block.title}
                              type="button"
                              onClick={() => setExpandedBoundaryTitle(expanded ? '' : block.title)}
                              className="w-full rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 text-left"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">{block.title}</p>
                                  <p className="mt-2 text-sm leading-6 text-slate-600">{block.summary}</p>
                                </div>
                                <ChevronRight className={cn('h-4 w-4 text-slate-400 transition-transform', expanded && 'rotate-90')} />
                              </div>
                              {expanded ? (
                                <div className="mt-4 space-y-2 border-t border-slate-200 pt-4">
                                  {block.bullets.map((bullet) => (
                                    <p key={bullet} className="text-sm leading-6 text-slate-600">{bullet}</p>
                                  ))}
                                </div>
                              ) : null}
                            </button>
                          )
                        })}
                      </div>
                    </WorkspacePanel>

                    <WorkspacePanel
                      eyebrow="Role scope health"
                      title="Domain access blocks"
                      description="Operational visibility into which domains are broadly accessible and which remain tightly restricted."
                    >
                      <div className="space-y-3">
                        <DomainBlock title="Customer knowledge" subtitle="31 analysts, 4 reviewers, masked preview enforced" tone="secure" />
                        <DomainBlock title="Retail lending restricted guides" subtitle="7 approvers, 23 stewards, export denied without dual control" tone="critical" />
                        <DomainBlock title="Finance close evidence" subtitle="12 reviewers, 2 masking exceptions under review" tone="warning" />
                      </div>
                    </WorkspacePanel>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'classification' && (
              <div className="space-y-5">
                <WorkspacePanel
                  eyebrow="Classification governance"
                  title="Classification & Policy Panel"
                  description="Active control surface for sensitivity labeling, masking, export restriction, and AI usage enforcement across enterprise knowledge assets."
                >
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryBlock title="Restricted assets" value="3,904" note="Assets operating under the strictest access, export, and AI usage controls." />
                    <SummaryBlock title="Masking coverage" value="98.6%" note="Field-level protection active before display, export, or AI consumption." />
                    <SummaryBlock title="Policy exceptions" value="7" note="Exceptions logged and awaiting policy owner review or remediation closure." />
                    <SummaryBlock title="Classification reviews due" value="19" note="Assets approaching review deadline or change-triggered reassessment." />
                  </div>
                </WorkspacePanel>

                <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
                  <WorkspacePanel
                    eyebrow="Controlled asset inventory"
                    title="Classification control table"
                    description="Sortable view of asset sensitivity, policy alignment, masking posture, and usage restrictions."
                  >
                    <div className="overflow-hidden rounded-[24px] border border-slate-200">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                          <thead className="bg-slate-50/90">
                            <tr>
                              <TableHeader label="Knowledge asset" active={classificationSort.key === 'assetTitle'} direction={classificationSort.direction} onClick={() => setClassificationSort(toggleSort(classificationSort, 'assetTitle'))} />
                              <TableHeader label="Classification" active={classificationSort.key === 'classificationLevel'} direction={classificationSort.direction} onClick={() => setClassificationSort(toggleSort(classificationSort, 'classificationLevel'))} />
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Policy applied</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Masking and restrictions</th>
                              <TableHeader label="Last reviewed" active={classificationSort.key === 'lastReviewed'} direction={classificationSort.direction} onClick={() => setClassificationSort(toggleSort(classificationSort, 'lastReviewed'))} />
                              <TableHeader label="Status" active={classificationSort.key === 'status'} direction={classificationSort.direction} onClick={() => setClassificationSort(toggleSort(classificationSort, 'status'))} />
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 bg-white">
                            {filteredClassificationRecords.length === 0 ? (
                              <EmptyTableRow colSpan={7} title="No controlled assets match the current filters." description="Broaden classification, policy, or domain filters to inspect more governed assets." />
                            ) : (
                              filteredClassificationRecords.map((record) => (
                                <tr key={record.assetTitle} className="hover:bg-slate-50/80">
                                  <td className="px-4 py-4 align-top">
                                    <p className="font-semibold text-slate-900">{record.assetTitle}</p>
                                    <p className="mt-1 text-xs text-slate-500">Owner: {record.owner}</p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      <ClassificationBadge label={record.classificationLevel} />
                                      <TagBadge>{record.domain}</TagBadge>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 align-top text-sm text-slate-700">{record.classificationLevel}</td>
                                  <td className="px-4 py-4 align-top text-sm leading-6 text-slate-600">
                                    <p>{record.policyApplied}</p>
                                    <p className="mt-2 text-xs text-slate-500">{record.complianceImpact}</p>
                                  </td>
                                  <td className="px-4 py-4 align-top text-sm leading-6 text-slate-600">
                                    <p>{record.maskingStatus}</p>
                                    <p className="mt-2">{record.downloadRestriction}</p>
                                    <p className="mt-2 text-xs font-medium text-slate-500">{record.aiUsageRestriction}</p>
                                  </td>
                                  <td className="px-4 py-4 align-top text-sm text-slate-600">{record.lastReviewed}</td>
                                  <td className="px-4 py-4 align-top">
                                    <StatusBadge value={record.status} />
                                  </td>
                                  <td className="px-4 py-4 align-top">
                                    <div className="flex flex-wrap gap-2">
                                      {['Open Classification Detail', 'Change Classification', 'Apply Policy', 'Review Masking Rule', 'Restrict Export', 'View Related Asset'].map((action) => (
                                        <ActionPill
                                          key={action}
                                          label={action}
                                          onClick={() =>
                                            setDrawerState({
                                              title: `${action} — ${record.assetTitle}`,
                                              subtitle: `${record.classificationLevel} asset in ${record.domain}`,
                                              tone: record.status === 'Violated' || record.status === 'Restricted' ? 'critical' : record.status === 'Warning' || record.status === 'Under Review' ? 'warning' : 'secure',
                                              metrics: [
                                                { label: 'Classification level', value: record.classificationLevel },
                                                { label: 'Review status', value: record.reviewStatus },
                                                { label: 'Policy modes', value: record.policyModes.join(', ') },
                                              ],
                                              bullets: [
                                                record.maskingStatus,
                                                record.downloadRestriction,
                                                record.aiUsageRestriction,
                                              ],
                                              actions: ['Apply Policy', 'Review Masking Rule', 'View Audit Logs'],
                                            })
                                          }
                                        />
                                      ))}
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </WorkspacePanel>

                  <div className="space-y-5">
                    <WorkspacePanel
                      eyebrow="Policy rule visibility"
                      title="Policy rule cards"
                      description="Human-readable policy intent translated into enforceable knowledge protection behavior."
                    >
                      <div className="space-y-3">
                        {policyRuleCards.map((card) => {
                          const expanded = expandedPolicyTitle === card.title
                          return (
                            <button
                              key={card.title}
                              type="button"
                              onClick={() => setExpandedPolicyTitle(expanded ? '' : card.title)}
                              className="w-full rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 text-left"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">{card.title}</p>
                                  <p className="mt-2 text-sm leading-6 text-slate-600">{card.scope}</p>
                                </div>
                                <ChevronRight className={cn('h-4 w-4 text-slate-400 transition-transform', expanded && 'rotate-90')} />
                              </div>
                              {expanded ? (
                                <div className="mt-4 rounded-[20px] border border-emerald-100 bg-emerald-50/70 p-4">
                                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-emerald-700">Enforcement logic</p>
                                  <p className="mt-2 text-sm leading-6 text-slate-700">{card.logic}</p>
                                  <p className="mt-3 text-xs font-medium text-slate-500">Primary drill-down target: {card.target}</p>
                                </div>
                              ) : null}
                            </button>
                          )
                        })}
                      </div>
                    </WorkspacePanel>

                    <WorkspacePanel
                      eyebrow="Sensitivity summary"
                      title="Content protection markers"
                      description="Compact signals showing where knowledge sensitivity is concentrated and which restrictions are enforced."
                    >
                      <div className="space-y-3">
                        <ProtectionMarker title="Confidential finance knowledge" detail="Field-level masking active, restricted AI use pending evidence vault segregation." tone="warning" />
                        <ProtectionMarker title="Restricted incident evidence" detail="Export denied, AI use denied, audit event capture mandatory." tone="critical" />
                        <ProtectionMarker title="Internal customer knowledge" detail="Masked preview allowed, usage controlled by role-based access scope." tone="secure" />
                      </div>
                    </WorkspacePanel>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'audit' && (
              <div className="space-y-5">
                <WorkspacePanel
                  eyebrow="Governance traceability"
                  title="Audit Logs"
                  description="Forensic-ready access, policy, classification, review, and export evidence with high-risk event visibility."
                >
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryBlock title="Access events today" value="14,508" note="All view, review, deny, and reveal actions linked to source context and user role." />
                    <SummaryBlock title="Policy actions" value="1,627" note="Policy updates, review approvals, and enforcement changes recorded this month." />
                    <SummaryBlock title="High-risk events" value="12" note="Denied exports, off-scope access, and evidence handling incidents under investigation." />
                    <SummaryBlock title="Evidence export requests" value="39" note="All evidence exports traceable to reviewer, policy, and business justification." />
                  </div>
                </WorkspacePanel>

                <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
                  <WorkspacePanel
                    eyebrow="Event inventory"
                    title="Audit log table"
                    description="Sortable table of access, policy, masking, and compliance events with role and knowledge context."
                  >
                    <div className="overflow-hidden rounded-[24px] border border-slate-200">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                          <thead className="bg-slate-50/90">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Event</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">User and role</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Knowledge asset</th>
                              <TableHeader label="Event type" active={auditSort.key === 'eventType'} direction={auditSort.direction} onClick={() => setAuditSort(toggleSort(auditSort, 'eventType'))} />
                              <TableHeader label="Timestamp" active={auditSort.key === 'timestamp'} direction={auditSort.direction} onClick={() => setAuditSort(toggleSort(auditSort, 'timestamp'))} />
                              <TableHeader label="Result" active={auditSort.key === 'result'} direction={auditSort.direction} onClick={() => setAuditSort(toggleSort(auditSort, 'result'))} />
                              <TableHeader label="Risk" active={auditSort.key === 'risk'} direction={auditSort.direction} onClick={() => setAuditSort(toggleSort(auditSort, 'risk'))} />
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 bg-white">
                            {filteredAuditRecords.length === 0 ? (
                              <EmptyTableRow colSpan={8} title="No audit events match the active filters." description="Expand time or status filters to inspect broader traceability history." />
                            ) : (
                              filteredAuditRecords.map((record) => (
                                <tr key={record.eventId} className="hover:bg-slate-50/80">
                                  <td className="px-4 py-4 align-top">
                                    <p className="font-semibold text-slate-900">{record.eventId}</p>
                                    <p className="mt-1 text-xs text-slate-500">{record.sourceContext}</p>
                                  </td>
                                  <td className="px-4 py-4 align-top text-sm leading-6 text-slate-600">
                                    <p className="font-medium text-slate-800">{record.user}</p>
                                    <p>{record.role}</p>
                                  </td>
                                  <td className="px-4 py-4 align-top text-sm leading-6 text-slate-600">
                                    <p>{record.knowledgeAsset}</p>
                                    <p className="mt-2 text-xs text-slate-500">{record.actionPerformed}</p>
                                  </td>
                                  <td className="px-4 py-4 align-top text-sm text-slate-700">{record.eventType}</td>
                                  <td className="px-4 py-4 align-top text-sm text-slate-600">{record.timestamp}</td>
                                  <td className="px-4 py-4 align-top">
                                    <ResultBadge value={record.result} />
                                  </td>
                                  <td className="px-4 py-4 align-top">
                                    <RiskBadge value={record.risk} />
                                  </td>
                                  <td className="px-4 py-4 align-top">
                                    <div className="flex flex-wrap gap-2">
                                      {['Open Audit Detail', 'Inspect Policy Event', 'Filter by User', 'Open Related Asset', 'Export Audit Evidence', 'Flag for Review'].map((action) => (
                                        <ActionPill
                                          key={action}
                                          label={action}
                                          onClick={() =>
                                            setDrawerState({
                                              title: `${action} — ${record.eventId}`,
                                              subtitle: `${record.eventType} for ${record.knowledgeAsset}`,
                                              tone: record.risk === 'High' ? 'critical' : record.risk === 'Medium' ? 'warning' : 'neutral',
                                              metrics: [
                                                { label: 'Result', value: record.result },
                                                { label: 'Policy impact', value: record.policyImpact },
                                                { label: 'Source context', value: record.sourceContext },
                                              ],
                                              bullets: [
                                                `User: ${record.user} (${record.role})`,
                                                `Action: ${record.actionPerformed}`,
                                                `Domain: ${record.domain}`,
                                              ],
                                              actions: ['Open Related Asset', 'Export Audit Evidence', 'Flag for Review'],
                                            })
                                          }
                                        />
                                      ))}
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </WorkspacePanel>

                  <div className="space-y-5">
                    <WorkspacePanel
                      eyebrow="High-risk alerting"
                      title="High-risk event alert cards"
                      description="Priority signals for restricted access, policy violations, and evidence gaps."
                    >
                      <div className="space-y-3">
                        <AlertCard title="Restricted export attempt" detail="Loan guidance export blocked because role scope did not include restricted release rights." tone="critical" />
                        <AlertCard title="Masking exception pending" detail="Finance checklist reveal review remains open until evidence vault segregation is completed." tone="warning" />
                        <AlertCard title="Evidence gap remediation" detail="Incident evidence archive still below required completeness threshold for audit readiness." tone="critical" />
                      </div>
                    </WorkspacePanel>

                    <WorkspacePanel
                      eyebrow="User activity visibility"
                      title="Policy event markers"
                      description="Short-form evidence cards for policy-triggered audit outcomes."
                    >
                      <div className="space-y-3">
                        {filteredAuditRecords.slice(0, 4).map((record) => (
                          <div key={record.eventId} className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-semibold text-slate-900">{record.eventType}</p>
                              <ResultBadge value={record.result} />
                            </div>
                            <p className="mt-2 text-sm leading-6 text-slate-600">{record.policyImpact}</p>
                            <p className="mt-3 text-xs font-medium text-slate-500">{record.timestamp} • {record.user}</p>
                          </div>
                        ))}
                      </div>
                    </WorkspacePanel>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'compliance' && (
              <div className="space-y-5">
                <WorkspacePanel
                  eyebrow="Continuous assurance"
                  title="Compliance Dashboard"
                  description="Measured control coverage, exception management, remediation progress, and audit readiness for governed enterprise knowledge."
                >
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryBlock title="Controls monitored" value="32" note="Regulatory and internal controls mapped to active knowledge governance policies." />
                    <SummaryBlock title="Exceptions open" value="13" note="Known exceptions requiring remediation, review, or policy clarification." />
                    <SummaryBlock title="Remediation on track" value="76%" note="Corrective actions currently moving within planned review windows." />
                    <SummaryBlock title="Audit readiness" value="Green / Amber" note="Strong overall posture with one operational evidence control still below target." />
                  </div>
                </WorkspacePanel>

                <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.16fr)_minmax(340px,0.84fr)]">
                  <WorkspacePanel
                    eyebrow="Control coverage"
                    title="Control coverage table"
                    description="Sortable compliance control inventory with policy mapping, coverage, exceptions, and remediation accountability."
                  >
                    <div className="overflow-hidden rounded-[24px] border border-slate-200">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                          <thead className="bg-slate-50/90">
                            <tr>
                              <TableHeader label="Control name" active={complianceSort.key === 'controlName'} direction={complianceSort.direction} onClick={() => setComplianceSort(toggleSort(complianceSort, 'controlName'))} />
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Mapped policy</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Status</th>
                              <TableHeader label="Exceptions" active={complianceSort.key === 'exceptionCount'} direction={complianceSort.direction} onClick={() => setComplianceSort(toggleSort(complianceSort, 'exceptionCount'))} align="right" />
                              <TableHeader label="Coverage" active={complianceSort.key === 'coveragePercentage'} direction={complianceSort.direction} onClick={() => setComplianceSort(toggleSort(complianceSort, 'coveragePercentage'))} align="right" />
                              <TableHeader label="Due date" active={complianceSort.key === 'dueDate'} direction={complianceSort.direction} onClick={() => setComplianceSort(toggleSort(complianceSort, 'dueDate'))} />
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 bg-white">
                            {filteredComplianceRecords.length === 0 ? (
                              <EmptyTableRow colSpan={7} title="No compliance controls match the active filters." description="Widen status, domain, or time filters to inspect broader control coverage." />
                            ) : (
                              filteredComplianceRecords.map((record) => (
                                <tr key={record.controlName} className="hover:bg-slate-50/80">
                                  <td className="px-4 py-4 align-top">
                                    <p className="font-semibold text-slate-900">{record.controlName}</p>
                                    <p className="mt-1 text-xs text-slate-500">{record.regulation}</p>
                                  </td>
                                  <td className="px-4 py-4 align-top text-sm leading-6 text-slate-600">{record.mappedPolicy}</td>
                                  <td className="px-4 py-4 align-top">
                                    <StatusBadge value={record.complianceStatus} />
                                  </td>
                                  <td className="px-4 py-4 text-right text-sm font-medium text-slate-700">{record.exceptionCount}</td>
                                  <td className="px-4 py-4 text-right text-sm font-medium text-slate-700">{record.coveragePercentage}%</td>
                                  <td className="px-4 py-4 text-sm text-slate-600">{record.dueDate}</td>
                                  <td className="px-4 py-4 align-top">
                                    <div className="flex flex-wrap gap-2">
                                      {['Open Compliance Detail', 'View Control Mapping', 'Inspect Exception', 'Assign Remediation Owner', 'Update Control Status', 'Export Compliance Evidence'].map((action) => (
                                        <ActionPill
                                          key={action}
                                          label={action}
                                          onClick={() =>
                                            setDrawerState({
                                              title: `${action} — ${record.controlName}`,
                                              subtitle: `${record.relatedDomain} domain • ${record.regulation}`,
                                              tone: record.complianceStatus === 'Non-compliant' ? 'critical' : record.complianceStatus === 'Warning' || record.complianceStatus === 'Under Review' ? 'warning' : 'secure',
                                              metrics: [
                                                { label: 'Coverage', value: `${record.coveragePercentage}%` },
                                                { label: 'Exceptions', value: String(record.exceptionCount) },
                                                { label: 'Remediation owner', value: record.remediationOwner },
                                              ],
                                              bullets: [
                                                `Mapped policy: ${record.mappedPolicy}`,
                                                `Last reviewed: ${record.lastReviewedDate}`,
                                                `Due date: ${record.dueDate}`,
                                              ],
                                              actions: ['View Control Mapping', 'Assign Remediation Owner', 'Export Compliance Evidence'],
                                            })
                                          }
                                        />
                                      ))}
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </WorkspacePanel>

                  <div className="space-y-5">
                    <WorkspacePanel
                      eyebrow="Exception trend"
                      title="Remediation tracking and review calendar"
                      description="Progress visibility for exception closure, control recovery, and upcoming review commitments."
                    >
                      <ChartPanel title="Control status trend" description="Coverage movement between passing, warning, and failed controls.">
                        <ResponsiveContainer width="100%" height={240}>
                          <BarChart data={complianceTrend}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} />
                            <YAxis tickLine={false} axisLine={false} />
                            <Tooltip />
                            <Bar dataKey="passing" stackId="a" fill="#166534" radius={[10, 10, 0, 0]} />
                            <Bar dataKey="warning" stackId="a" fill="#f59e0b" radius={[10, 10, 0, 0]} />
                            <Bar dataKey="failed" stackId="a" fill="#dc2626" radius={[10, 10, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartPanel>

                      <div className="mt-4 space-y-3">
                        {complianceCalendar.map((item) => (
                          <div key={item.title} className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                                <p className="mt-2 text-sm text-slate-600">{item.owner}</p>
                              </div>
                              <Badge className={cn('rounded-full px-3 py-1 text-[11px] font-semibold', calendarBadgeClass(item.status))}>{item.status}</Badge>
                            </div>
                            <p className="mt-3 text-xs font-medium uppercase tracking-[0.08em] text-slate-500">{item.date}</p>
                          </div>
                        ))}
                      </div>
                    </WorkspacePanel>

                    <WorkspacePanel
                      eyebrow="Readiness summary"
                      title="Compliance readiness blocks"
                      description="Short-form view of where the governance program is strongest and where assurance still needs attention."
                    >
                      <div className="space-y-3">
                        <ProtectionMarker title="Strong masking control posture" detail="Customer knowledge masking controls are fully evidenced and currently compliant." tone="secure" />
                        <ProtectionMarker title="Export governance requires retest" detail="Restricted export control still carries four open exceptions tied to lending guidance assets." tone="warning" />
                        <ProtectionMarker title="Audit evidence completeness below target" detail="Operational incident knowledge remains the primary non-compliant control area." tone="critical" />
                      </div>
                    </WorkspacePanel>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </section>

      {drawerState ? (
        <div className="pointer-events-none fixed inset-0 z-50 flex justify-end bg-slate-950/10 p-4 backdrop-blur-[2px]">
          <div className="pointer-events-auto flex h-full w-full max-w-[430px] flex-col overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_30px_90px_-40px_rgba(15,23,42,0.5)]">
            <div className={cn('border-b px-6 py-5', drawerToneClass(drawerState.tone))}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Detail drawer</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-950">{drawerState.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{drawerState.subtitle}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerState(null)}
                  className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:text-slate-900"
                  aria-label="Close detail drawer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
              <div className="grid gap-3 sm:grid-cols-2">
                {drawerState.metrics.map((metric) => (
                  <div key={metric.label} className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{metric.label}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-900">{metric.value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Operational context</p>
                <div className="mt-3 space-y-3">
                  {drawerState.bullets.map((bullet) => (
                    <p key={bullet} className="text-sm leading-6 text-slate-600">{bullet}</p>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Suggested actions</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {drawerState.actions.map((action) => (
                    <ActionPill key={action} label={action} onClick={() => {}} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function matchesSearch(search: string, ...values: Array<string | number>) {
  if (!search) return true
  return values.some((value) => String(value).toLowerCase().includes(search))
}

function matchesOne<T extends string>(selected: T[], value: T) {
  return selected.length === 0 || selected.includes(value)
}

function matchesMany<T extends string>(selected: T[], values: T[]) {
  return selected.length === 0 || selected.some((value) => values.includes(value))
}

function matchesPolicyFilter(filters: PolicyMode[], policyImpact: string) {
  if (filters.length === 0) return true
  const normalizedImpact = policyImpact.toLowerCase()
  return filters.some((filter) => normalizedImpact.includes(filter.toLowerCase().replaceAll(' ', ' ')))
}

function toggleValue<T extends string>(current: T[], value: T) {
  return current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
}

function toggleSort<T extends string>(state: SortState<T>, key: T): SortState<T> {
  if (state.key !== key) {
    return { key, direction: 'asc' }
  }
  return { key, direction: state.direction === 'asc' ? 'desc' : 'asc' }
}

function sortItems<T, K extends string>(items: T[], sortState: SortState<K>, accessors: Record<K, (item: T) => string | number>) {
  return [...items].sort((left, right) => {
    const leftValue = accessors[sortState.key](left)
    const rightValue = accessors[sortState.key](right)

    if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      return sortState.direction === 'asc' ? leftValue - rightValue : rightValue - leftValue
    }

    const comparison = String(leftValue).localeCompare(String(rightValue))
    return sortState.direction === 'asc' ? comparison : -comparison
  })
}

function cardToneClass(tone: Tone) {
  if (tone === 'secure') return 'border-emerald-200 bg-[linear-gradient(180deg,rgba(236,253,245,0.95),rgba(255,255,255,0.98))]'
  if (tone === 'warning') return 'border-amber-200 bg-[linear-gradient(180deg,rgba(255,251,235,0.95),rgba(255,255,255,0.98))]'
  if (tone === 'critical') return 'border-rose-200 bg-[linear-gradient(180deg,rgba(255,241,242,0.95),rgba(255,255,255,0.98))]'
  return 'border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.95),rgba(255,255,255,0.98))]'
}

function drawerToneClass(tone: Tone) {
  if (tone === 'secure') return 'border-slate-200 bg-emerald-50/80'
  if (tone === 'warning') return 'border-slate-200 bg-amber-50/80'
  if (tone === 'critical') return 'border-slate-200 bg-rose-50/80'
  return 'border-slate-200 bg-slate-50/80'
}

function timelineDotClass(tone: Tone) {
  if (tone === 'secure') return 'bg-emerald-600'
  if (tone === 'warning') return 'bg-amber-500'
  if (tone === 'critical') return 'bg-rose-600'
  return 'bg-slate-500'
}

function calendarBadgeClass(status: string) {
  if (status === 'Ready') return 'border border-emerald-200 bg-emerald-50 text-emerald-700'
  if (status === 'At Risk') return 'border border-rose-200 bg-rose-50 text-rose-700'
  return 'border border-slate-200 bg-slate-50 text-slate-700'
}

function flowNodeStyle(border: string, background: string) {
  return {
    borderRadius: 18,
    border: `1px solid ${border}`,
    padding: 12,
    background,
    color: '#0f172a',
    fontWeight: 600,
    width: 170,
    textAlign: 'center' as const,
    boxShadow: '0 18px 40px -34px rgba(15,23,42,0.45)',
  }
}

function WorkspacePanel({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-[30px] border border-slate-200/80 bg-white p-5 shadow-[0_22px_48px_-36px_rgba(15,23,42,0.45)]">
      <div className="mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700">{eyebrow}</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      </div>
      {children}
    </section>
  )
}

function ChartPanel({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-[26px] border border-slate-200 bg-slate-50/70 p-4">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      <div className="mt-4">{children}</div>
    </div>
  )
}

function FilterChipRow<T extends string>({
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
    <div className="flex flex-col gap-2 xl:flex-row xl:items-start">
      <div className="w-28 pt-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</div>
      <div className="flex flex-1 flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option)
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={cn(
                'rounded-full border px-3 py-2 text-xs font-medium transition-colors',
                active
                  ? 'border-emerald-300 bg-emerald-950 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900',
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

function SummaryBlock({ title, value, note }: { title: string; value: string; note: string }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50/75 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{note}</p>
    </div>
  )
}

function InfoStrip({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{value}</p>
    </div>
  )
}

function LegendChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-sm text-slate-600">{label}</span>
      </div>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  )
}

function TableHeader({
  label,
  active,
  direction,
  onClick,
  align = 'left',
}: {
  label: string
  active: boolean
  direction: SortDirection
  onClick: () => void
  align?: 'left' | 'right'
}) {
  return (
    <th className={cn('px-4 py-3', align === 'right' && 'text-right')}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.08em]',
          active ? 'text-slate-900' : 'text-slate-500',
        )}
      >
        {label}
        <ArrowUpDown className="h-3.5 w-3.5" />
        {active ? <span className="text-[10px] lowercase">{direction}</span> : null}
      </button>
    </th>
  )
}

function EmptyTableRow({ title, description, colSpan }: { title: string; description: string; colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-12 text-center">
        <div className="mx-auto max-w-md space-y-2">
          <p className="text-base font-semibold text-slate-900">{title}</p>
          <p className="text-sm leading-6 text-slate-600">{description}</p>
        </div>
      </td>
    </tr>
  )
}

function TagBadge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">{children}</span>
}

function PermissionChip({ label }: { label: string }) {
  return <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">{label}</span>
}

function ClassificationBadge({ label }: { label: ClassificationLevel }) {
  const styles: Record<ClassificationLevel, string> = {
    Public: 'border-slate-200 bg-slate-50 text-slate-700',
    Internal: 'border-teal-200 bg-teal-50 text-teal-700',
    Confidential: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    Restricted: 'border-amber-200 bg-amber-50 text-amber-800',
  }
  return <span className={cn('rounded-full border px-2.5 py-1 text-[11px] font-semibold', styles[label])}>{label}</span>
}

function StatusBadge({ value }: { value: StatusFilter | ComplianceRecord['complianceStatus'] }) {
  const styles: Record<string, string> = {
    Active: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    Warning: 'border-amber-200 bg-amber-50 text-amber-800',
    Restricted: 'border-rose-200 bg-rose-50 text-rose-700',
    Violated: 'border-rose-200 bg-rose-50 text-rose-700',
    'Under Review': 'border-sky-200 bg-sky-50 text-sky-700',
    Compliant: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    'Non-compliant': 'border-rose-200 bg-rose-50 text-rose-700',
  }
  return <span className={cn('rounded-full border px-2.5 py-1 text-[11px] font-semibold', styles[value])}>{value}</span>
}

function ResultBadge({ value }: { value: AuditRecord['result'] }) {
  const styles: Record<AuditRecord['result'], string> = {
    Allowed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    Denied: 'border-rose-200 bg-rose-50 text-rose-700',
    Masked: 'border-amber-200 bg-amber-50 text-amber-800',
    Flagged: 'border-sky-200 bg-sky-50 text-sky-700',
  }
  return <span className={cn('rounded-full border px-2.5 py-1 text-[11px] font-semibold', styles[value])}>{value}</span>
}

function RiskBadge({ value }: { value: AuditRecord['risk'] }) {
  const styles: Record<AuditRecord['risk'], string> = {
    High: 'border-rose-200 bg-rose-50 text-rose-700',
    Medium: 'border-amber-200 bg-amber-50 text-amber-800',
    Low: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  }
  return <span className={cn('rounded-full border px-2.5 py-1 text-[11px] font-semibold', styles[value])}>{value}</span>
}

function ActionPill({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-900"
    >
      {label}
    </button>
  )
}

function DomainBlock({ title, subtitle, tone }: { title: string; subtitle: string; tone: Tone }) {
  return (
    <div className={cn('rounded-[22px] border p-4', cardToneClass(tone))}>
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
    </div>
  )
}

function ProtectionMarker({ title, detail, tone }: { title: string; detail: string; tone: Tone }) {
  return (
    <div className={cn('rounded-[22px] border p-4', cardToneClass(tone))}>
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
    </div>
  )
}

function AlertCard({ title, detail, tone }: { title: string; detail: string; tone: Tone }) {
  return (
    <div className={cn('rounded-[22px] border p-4', cardToneClass(tone))}>
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
    </div>
  )
}