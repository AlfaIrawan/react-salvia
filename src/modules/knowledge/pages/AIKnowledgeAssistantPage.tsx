import { useMemo, useState } from 'react'
import {
  ArrowUpDown,
  Bot,
  ChevronDown,
  ChevronUp,
  Copy,
  FileSearch,
  Files,
  Filter,
  LayoutGrid,
  MessageSquareQuote,
  ScanSearch,
  ScrollText,
  Search,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
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
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { PageHeader } from '@/components/layout/PageHeader'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type WorkspaceKey =
  | 'overview'
  | 'assistant'
  | 'playground'
  | 'trace'
  | 'summary'

type SortDirection = 'asc' | 'desc'
type TraceSortKey =
  | 'answerSegment'
  | 'sourceTitle'
  | 'domain'
  | 'confidence'
  | 'retrievalRank'
  | 'status'

type InteractionType = 'Q&A' | 'Summary' | 'Synthesis' | 'FAQ' | 'Trace Review'
type AnswerStatus = 'Grounded' | 'Partial' | 'Needs Review' | 'Draft' | 'Approved' | 'Restricted'
type SourceScope = 'Single Source' | 'Multi-source' | 'Policy' | 'SOP' | 'Product' | 'Regulation' | 'Operations'
type Domain = 'Customer' | 'Loan' | 'Collection' | 'Finance' | 'Risk' | 'Compliance' | 'Operations'
type TimeRange = 'Today' | '7 Days' | '30 Days' | '90 Days' | 'Custom Range'

interface WorkspaceItem {
  key: WorkspaceKey
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  count?: number
}

interface KpiCard {
  label: string
  value: string
  description: string
  trend: string
  icon: React.ComponentType<{ className?: string }>
}

interface AssistantMessage {
  id: string
  role: 'user' | 'assistant'
  title?: string
  body: string
  confidence?: string
  groundedness?: string
  retrievalScope?: string[]
  citations?: string[]
  actions?: string[]
}

interface TraceRow {
  id: string
  answerSegment: string
  sourceTitle: string
  sourceSnippet: string
  domain: Domain
  confidence: number
  retrievalRank: number
  status: AnswerStatus
  sourceType: SourceScope
  metadata: string
}

interface PromptRun {
  id: string
  template: string
  version: string
  retrievalMode: string
  scope: string
  responseStyle: string
  resultSummary: string
  quality: string
  timestamp: string
}

interface SummaryDocument {
  id: string
  title: string
  type: SourceScope
  owner: string
  domain: Domain
  updatedAt: string
  coverage: string
}

const workspaceItems: WorkspaceItem[] = [
  {
    key: 'overview',
    label: 'Overview',
    description: 'Trust, activity, and knowledge interaction posture',
    icon: LayoutGrid,
  },
  {
    key: 'assistant',
    label: 'AI Assistant',
    description: 'Grounded conversational retrieval and explainable answering',
    icon: Bot,
    count: 18,
  },
  {
    key: 'playground',
    label: 'Prompt Playground',
    description: 'Controlled prompt testing with governed retrieval context',
    icon: WandSparkles,
    count: 6,
  },
  {
    key: 'trace',
    label: 'Answer Trace Panel',
    description: 'Answer-to-source mapping and citation verification',
    icon: ScanSearch,
    count: 42,
  },
  {
    key: 'summary',
    label: 'Knowledge Summary Generator',
    description: 'Summaries, synthesis, and FAQ generation workspace',
    icon: ScrollText,
    count: 12,
  },
]

const kpiCards: KpiCard[] = [
  {
    label: 'Questions Asked Today',
    value: '1,284',
    description: 'Enterprise knowledge questions handled across banking and multifinance teams today.',
    trend: '+12.4% vs yesterday',
    icon: MessageSquareQuote,
  },
  {
    label: 'Grounded Answer Rate',
    value: '94.8%',
    description: 'Answers backed by approved enterprise knowledge sources and valid retrieval evidence.',
    trend: '+1.6 pts over 7 days',
    icon: ShieldCheck,
  },
  {
    label: 'Average Citation Coverage',
    value: '3.7',
    description: 'Average number of usable source references attached to each trusted response.',
    trend: 'Top scope: Multi-source',
    icon: FileSearch,
  },
  {
    label: 'Summaries Generated',
    value: '216',
    description: 'Document and executive summaries generated from governed knowledge assets.',
    trend: '+28 this week',
    icon: ScrollText,
  },
  {
    label: 'Multi-doc Synthesis Sessions',
    value: '84',
    description: 'Sessions where SALVIA combined multiple controlled sources into one answer.',
    trend: '+9 active today',
    icon: Files,
  },
  {
    label: 'FAQ Drafts Created',
    value: '38',
    description: 'Review-ready FAQ drafts extracted from operational, policy, and product knowledge.',
    trend: '6 awaiting approval',
    icon: Sparkles,
  },
]

const interactionOptions: Array<'All' | InteractionType> = [
  'All',
  'Q&A',
  'Summary',
  'Synthesis',
  'FAQ',
  'Trace Review',
]
const answerStatusOptions: Array<'All' | AnswerStatus> = [
  'All',
  'Grounded',
  'Partial',
  'Needs Review',
  'Draft',
  'Approved',
  'Restricted',
]
const sourceScopeOptions: Array<'All' | SourceScope> = [
  'All',
  'Single Source',
  'Multi-source',
  'Policy',
  'SOP',
  'Product',
  'Regulation',
  'Operations',
]
const domainOptions: Domain[] = [
  'Customer',
  'Loan',
  'Collection',
  'Finance',
  'Risk',
  'Compliance',
  'Operations',
]
const timeOptions: TimeRange[] = ['Today', '7 Days', '30 Days', '90 Days', 'Custom Range']

const conversationTrend = [
  { label: 'Mon', questions: 188, grounded: 178, partial: 10 },
  { label: 'Tue', questions: 202, grounded: 191, partial: 11 },
  { label: 'Wed', questions: 226, grounded: 214, partial: 12 },
  { label: 'Thu', questions: 244, grounded: 232, partial: 12 },
  { label: 'Fri', questions: 258, grounded: 244, partial: 14 },
  { label: 'Sat', questions: 91, grounded: 86, partial: 5 },
  { label: 'Sun', questions: 75, grounded: 71, partial: 4 },
]

const citationCoverage = [
  { name: 'Strong', value: 68, color: '#0f766e' },
  { name: 'Moderate', value: 22, color: '#f59e0b' },
  { name: 'Review', value: 10, color: '#dc2626' },
]

const sourceMix = [
  { label: 'Policy', responses: 148 },
  { label: 'SOP', responses: 132 },
  { label: 'Product', responses: 96 },
  { label: 'Operations', responses: 110 },
  { label: 'Regulation', responses: 82 },
]

const recentActivity = [
  {
    time: '08:42',
    title: 'Multi-source answer approved for collateral valuation exception guidance',
    detail: 'Answer linked policy, credit SOP, and operations runbook evidence with full citation coverage.',
  },
  {
    time: '08:17',
    title: 'Executive summary generated for KYC remediation backlog control pack',
    detail: 'Summary grouped compliance, operations, and customer service materials into one board-ready view.',
  },
  {
    time: '07:58',
    title: 'FAQ draft created from dealer onboarding and pricing exception documents',
    detail: 'Draft remains in review with seven source-linked question-answer candidates.',
  },
  {
    time: '07:41',
    title: 'Partial grounding warning raised on collections hardship waiver question',
    detail: 'One legacy note conflicted with the approved 2026 policy addendum and was marked for trace review.',
  },
]

const assistantMessages: AssistantMessage[] = [
  {
    id: 'msg-01',
    role: 'user',
    body: 'What is the approved escalation flow when a loan restructuring request exceeds delegated authority and also requires compliance review?',
  },
  {
    id: 'msg-02',
    role: 'assistant',
    title: 'Grounded Response',
    body:
      'When a restructuring request exceeds delegated credit authority, SALVIA indicates a two-track escalation. First, the request must be routed to the second-line credit approval committee under the delegated authority matrix. Second, if the case triggers policy exceptions related to affordability, customer hardship classification, or restructuring frequency, compliance review is required before the case returns to the approval committee. The approved sequence is operations intake, credit exception packaging, compliance review, committee approval, and final customer communication.',
    confidence: 'High confidence',
    groundedness: 'Grounded in 4 approved sources',
    retrievalScope: ['Loan Policy', 'Credit SOP', 'Compliance', 'Operations'],
    citations: ['[1] Credit Approval Matrix', '[2] Restructuring Policy v4.2', '[3] Exception Review SOP', '[4] Hardship Case Playbook'],
    actions: [
      'Ask Follow-up Question',
      'View Source Evidence',
      'Expand Citation',
      'Copy Answer',
      'Save Conversation',
      'Export Answer',
    ],
  },
]

const conversationHistory = [
  { title: 'Restructuring exception flow', status: 'Grounded', scope: 'Loan Policy + SOP' },
  { title: 'KYC remediation executive summary', status: 'Approved', scope: 'Compliance + Operations' },
  { title: 'Collection waiver criteria comparison', status: 'Needs Review', scope: 'Policy conflict detected' },
  { title: 'Dealer pricing FAQ extraction', status: 'Draft', scope: 'Product + Sales SOP' },
]

const promptRuns: PromptRun[] = [
  {
    id: 'PR-801',
    template: 'Executive policy synthesis',
    version: 'v2.3',
    retrievalMode: 'Hybrid grounded retrieval',
    scope: 'Policy + Regulation + Operations',
    responseStyle: 'Executive narrative',
    resultSummary: 'Produced concise board-ready explanation with regulatory anchors and operational next steps.',
    quality: 'Approved for shared library',
    timestamp: '2026-04-16 08:12',
  },
  {
    id: 'PR-792',
    template: 'Customer complaint summary',
    version: 'v1.9',
    retrievalMode: 'Conversation-aware RAG',
    scope: 'Customer + Compliance + SOP',
    responseStyle: 'Bullet summary',
    resultSummary: 'Generated clear escalation summary with restricted-answer guardrail intact.',
    quality: 'Comparison requested',
    timestamp: '2026-04-16 07:38',
  },
  {
    id: 'PR-788',
    template: 'FAQ extraction from source bundle',
    version: 'v1.4',
    retrievalMode: 'Document batch synthesis',
    scope: 'Product + Operations',
    responseStyle: 'Q&A pairs',
    resultSummary: 'Created seven FAQ candidates grouped by onboarding, pricing, and exception handling.',
    quality: 'Ready for review',
    timestamp: '2026-04-16 07:05',
  },
]

const traceRows: TraceRow[] = [
  {
    id: 'TR-1201',
    answerSegment: 'Second-line committee approval is mandatory when delegated authority is exceeded.',
    sourceTitle: 'Credit Approval Matrix 2026',
    sourceSnippet: 'Requests beyond branch and regional authority thresholds must be submitted to the second-line approval committee.',
    domain: 'Loan',
    confidence: 97,
    retrievalRank: 1,
    status: 'Grounded',
    sourceType: 'Policy',
    metadata: 'Section 4.3 | Updated 2026-03-10',
  },
  {
    id: 'TR-1202',
    answerSegment: 'Compliance review is required when affordability or hardship exceptions are present.',
    sourceTitle: 'Restructuring Policy v4.2',
    sourceSnippet: 'Cases containing affordability exception markers or hardship classification overrides require compliance sign-off prior to final approval.',
    domain: 'Compliance',
    confidence: 95,
    retrievalRank: 2,
    status: 'Grounded',
    sourceType: 'Regulation',
    metadata: 'Section 7.2 | Updated 2026-04-04',
  },
  {
    id: 'TR-1203',
    answerSegment: 'Operations intake and exception packaging occurs before committee review.',
    sourceTitle: 'Exception Review SOP',
    sourceSnippet: 'Operations prepares the case file, exception rationale, and source attachments before routing to the committee queue.',
    domain: 'Operations',
    confidence: 91,
    retrievalRank: 3,
    status: 'Grounded',
    sourceType: 'SOP',
    metadata: 'Procedure 2.1 | Updated 2026-02-28',
  },
  {
    id: 'TR-1204',
    answerSegment: 'Final communication is released only after approval and compliance evidence is complete.',
    sourceTitle: 'Hardship Case Playbook',
    sourceSnippet: 'Customer-facing communication must wait until the approval memo and compliance evidence checklist are both complete.',
    domain: 'Customer',
    confidence: 88,
    retrievalRank: 4,
    status: 'Approved',
    sourceType: 'Operations',
    metadata: 'Playbook 6 | Updated 2026-01-22',
  },
]

const summaryDocuments: SummaryDocument[] = [
  {
    id: 'SD-11',
    title: 'Retail Loan Restructuring Policy v4.2',
    type: 'Policy',
    owner: 'Credit Policy Office',
    domain: 'Loan',
    updatedAt: '2026-04-04',
    coverage: 'Primary source',
  },
  {
    id: 'SD-12',
    title: 'KYC Exception Remediation SOP',
    type: 'SOP',
    owner: 'Customer Operations Governance',
    domain: 'Compliance',
    updatedAt: '2026-04-11',
    coverage: 'Supporting workflow source',
  },
  {
    id: 'SD-13',
    title: 'Collections Hardship Waiver Playbook',
    type: 'Operations',
    owner: 'Collections Strategy Team',
    domain: 'Collection',
    updatedAt: '2026-03-26',
    coverage: 'Cross-domain synthesis source',
  },
]

const faqDrafts = [
  {
    topic: 'Loan restructuring',
    question: 'When is compliance review mandatory in restructuring cases?',
    answer: 'Compliance review is mandatory when affordability, hardship, or policy-exception markers are triggered.',
    evidence: '4 sources linked',
    status: 'Draft',
  },
  {
    topic: 'KYC remediation',
    question: 'Who owns unresolved KYC artifact remediation after five working days?',
    answer: 'Ownership transfers to compliance operations escalation according to the remediation SOP.',
    evidence: '2 sources linked',
    status: 'Review-ready',
  },
  {
    topic: 'Dealer onboarding',
    question: 'What documents are mandatory before pricing exception approval?',
    answer: 'Pricing exception requests require dealer profile validation, approval rationale, and product policy references.',
    evidence: '3 sources linked',
    status: 'Approval-ready',
  },
]

const synthesisBlocks = [
  {
    theme: 'Policy alignment',
    detail: 'Current sources align on approval sequencing, but differ in language around hardship evidence packaging.',
  },
  {
    theme: 'Conflict awareness',
    detail: 'One archived 2024 memo conflicts with the current 2026 delegated authority thresholds and is excluded from grounded responses.',
  },
  {
    theme: 'Operational implication',
    detail: 'Most approved summaries emphasize packaging discipline before committee review to reduce repeat clarification cycles.',
  },
]

const traceNodes: Node[] = [
  makeNode('answer', 'Answer Segment', 20, 88, '#ecfdf5', '#0f766e'),
  makeNode('policy', 'Credit Approval Matrix', 280, 12, '#eff6ff', '#2563eb'),
  makeNode('regulation', 'Restructuring Policy v4.2', 280, 102, '#f0fdf4', '#166534'),
  makeNode('sop', 'Exception Review SOP', 280, 192, '#f8fafc', '#475569'),
  makeNode('playbook', 'Hardship Case Playbook', 280, 282, '#fff7ed', '#c2410c'),
]

const traceEdges: Edge[] = [
  makeEdge('edge-1', 'answer', 'policy'),
  makeEdge('edge-2', 'answer', 'regulation'),
  makeEdge('edge-3', 'answer', 'sop'),
  makeEdge('edge-4', 'answer', 'playbook'),
]

function makeNode(id: string, label: string, x: number, y: number, background: string, border: string): Node {
  return {
    id,
    position: { x, y },
    data: { label },
    style: {
      width: 190,
      borderRadius: 18,
      border: `1px solid ${border}`,
      background,
      color: '#0f172a',
      fontSize: 12,
      fontWeight: 600,
      padding: 12,
      boxShadow: '0 16px 36px -28px rgba(15,23,42,0.55)',
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    draggable: false,
    selectable: false,
  }
}

function makeEdge(id: string, source: string, target: string): Edge {
  return {
    id,
    source,
    target,
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#0f766e' },
    style: { stroke: '#0f766e', strokeWidth: 2 },
  }
}

function toggleMultiSelect<T extends string>(values: T[], value: T, allOptions: readonly T[]): T[] {
  if (value === (allOptions[0] as T)) {
    return [allOptions[0] as T]
  }

  const allValue = allOptions[0] as T
  const base = values.filter((entry) => entry !== allValue)
  const next = base.includes(value)
    ? base.filter((entry) => entry !== value)
    : [...base, value]

  return next.length === 0 ? [allValue] : next
}

function sortRows(rows: TraceRow[], sortKey: TraceSortKey, direction: SortDirection) {
  return [...rows].sort((left, right) => {
    const leftValue = left[sortKey]
    const rightValue = right[sortKey]
    const comparison =
      typeof leftValue === 'number' && typeof rightValue === 'number'
        ? leftValue - rightValue
        : String(leftValue).localeCompare(String(rightValue))
    return direction === 'asc' ? comparison : -comparison
  })
}

function statusTone(status: AnswerStatus) {
  if (status === 'Grounded' || status === 'Approved') return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  if (status === 'Partial' || status === 'Needs Review' || status === 'Draft') return 'border-orange-200 bg-orange-50 text-orange-700'
  return 'border-rose-200 bg-rose-50 text-rose-700'
}

function FilterChip<T extends string>({
  label,
  active,
  onClick,
}: {
  label: T
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
        active
          ? 'border-emerald-300 bg-emerald-50 text-emerald-800 shadow-sm'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
      )}
    >
      {label}
    </button>
  )
}

function SectionCard({
  title,
  description,
  children,
  right,
}: {
  title: string
  description: string
  children: React.ReactNode
  right?: React.ReactNode
}) {
  return (
    <section className="rounded-[28px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_28px_80px_-62px_rgba(15,23,42,0.82)] backdrop-blur">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</h3>
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        </div>
        {right}
      </div>
      {children}
    </section>
  )
}

function SortHeader({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
}: {
  label: string
  sortKey: TraceSortKey
  activeKey: TraceSortKey
  direction: SortDirection
  onSort: (key: TraceSortKey) => void
}) {
  const isActive = activeKey === sortKey
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={cn(
        'inline-flex items-center gap-1 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 hover:text-slate-900',
        isActive && 'text-slate-900'
      )}
    >
      <span>{label}</span>
      <ArrowUpDown className={cn('h-3.5 w-3.5', isActive && 'text-emerald-700')} />
      {isActive ? direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" /> : null}
    </button>
  )
}

export function AIKnowledgeAssistantPage() {
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceKey>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(true)
  const [selectedInteractions, setSelectedInteractions] = useState<Array<'All' | InteractionType>>(['All'])
  const [selectedStatuses, setSelectedStatuses] = useState<Array<'All' | AnswerStatus>>(['All'])
  const [selectedScopes, setSelectedScopes] = useState<Array<'All' | SourceScope>>(['All'])
  const [selectedDomains, setSelectedDomains] = useState<Domain[]>(['Customer', 'Loan', 'Compliance'])
  const [selectedTime, setSelectedTime] = useState<TimeRange>('7 Days')
  const [traceSortKey, setTraceSortKey] = useState<TraceSortKey>('retrievalRank')
  const [traceSortDirection, setTraceSortDirection] = useState<SortDirection>('asc')

  const normalizedSearch = searchQuery.trim().toLowerCase()
  const selectedStatusValues = selectedStatuses.filter((item) => item !== 'All') as AnswerStatus[]
  const selectedScopeValues = selectedScopes.filter((item) => item !== 'All') as SourceScope[]

  const filteredTraceRows = useMemo(() => {
    const rows = traceRows.filter((row) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [row.answerSegment, row.sourceTitle, row.sourceSnippet, row.metadata, row.domain, row.status]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch)

      const matchesStatus = selectedStatusValues.length === 0 || selectedStatusValues.includes(row.status)
      const matchesScope = selectedScopeValues.length === 0 || selectedScopeValues.includes(row.sourceType)
      const matchesDomain = selectedDomains.length === 0 || selectedDomains.includes(row.domain)

      return matchesSearch && matchesStatus && matchesScope && matchesDomain
    })

    return sortRows(rows, traceSortKey, traceSortDirection)
  }, [normalizedSearch, selectedStatusValues, selectedScopeValues, selectedDomains, traceSortKey, traceSortDirection])

  const onSortTrace = (key: TraceSortKey) => {
    if (traceSortKey === key) {
      setTraceSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }
    setTraceSortKey(key)
    setTraceSortDirection('asc')
  }

  const renderOverview = () => (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <SectionCard
          title="Interaction Trend"
          description="Question volume, grounded coverage, and partial-answer drift across the selected control window."
          right={<Badge className="border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">{selectedTime} view</Badge>}
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={conversationTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip />
                <Bar dataKey="questions" fill="#0f766e" radius={[10, 10, 0, 0]} />
                <Line type="monotone" dataKey="grounded" stroke="#1d4ed8" strokeWidth={2.4} dot={false} />
                <Line type="monotone" dataKey="partial" stroke="#f59e0b" strokeWidth={2.2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Citation Coverage" description="Distribution of trace strength across inspected enterprise answers.">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={citationCoverage} dataKey="value" innerRadius={58} outerRadius={90} paddingAngle={3}>
                  {citationCoverage.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {citationCoverage.map((entry) => (
              <div key={entry.name} className="flex items-center justify-between rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700">
                <span>{entry.name}</span>
                <span className="font-semibold text-slate-900">{entry.value}%</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="Source Usage Mix" description="Approved source categories most frequently used in grounded answer generation.">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceMix}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip />
                <Bar dataKey="responses" fill="#0f766e" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Recent Assistant Activity" description="High-signal workflow events across conversational answers, summaries, and FAQ generation.">
          <div className="space-y-3">
            {recentActivity.map((item) => (
              <div key={item.time + item.title} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                    {item.time}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  )

  const renderAssistant = () => (
    <div className="grid gap-5 xl:grid-cols-[0.88fr_1.12fr]">
      <SectionCard title="Conversation History" description="Recent sessions, answer states, and scope posture for explainable conversational retrieval.">
        <div className="space-y-3">
          {conversationHistory.map((item) => (
            <button
              key={item.title}
              type="button"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.scope}</p>
                </div>
                <Badge className={cn('border px-2.5 py-1 text-[11px] font-semibold', statusTone(item.status as AnswerStatus))}>{item.status}</Badge>
              </div>
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="AI Assistant Workspace" description="Trustworthy answer generation grounded in governed enterprise knowledge with source evidence visibility.">
        <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
          <div className="space-y-4">
            {assistantMessages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'rounded-[24px] border p-4',
                  message.role === 'user'
                    ? 'border-slate-200 bg-slate-50/80'
                    : 'border-emerald-200 bg-emerald-50/50'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {message.role === 'user' ? 'User Query' : message.title}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-800">{message.body}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-2">
                    {message.role === 'user' ? <MessageSquareQuote className="h-4 w-4 text-slate-600" /> : <Bot className="h-4 w-4 text-emerald-700" />}
                  </div>
                </div>

                {message.role === 'assistant' ? (
                  <div className="mt-4 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge className="border border-emerald-200 bg-white text-emerald-700">{message.confidence}</Badge>
                      <Badge className="border border-blue-200 bg-white text-blue-700">{message.groundedness}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {message.retrievalScope?.map((item) => (
                        <Badge key={item} className="border border-slate-200 bg-white text-slate-700">{item}</Badge>
                      ))}
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white/90 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Inline Citations</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {message.citations?.map((citation) => (
                          <button
                            key={citation}
                            type="button"
                            className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-800"
                          >
                            {citation}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {message.actions?.map((action) => (
                        <button
                          key={action}
                          type="button"
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-700 hover:border-emerald-300 hover:text-emerald-800"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Conversation Context</p>
              <div className="mt-3 space-y-3 text-sm text-slate-700">
                <div className="rounded-2xl border border-slate-200 bg-white p-3">
                  <p className="font-semibold text-slate-900">Active role framing</p>
                  <p className="mt-1 text-sm text-slate-600">Credit operations manager with compliance visibility and approved loan-policy access.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-3">
                  <p className="font-semibold text-slate-900">Retrieval scope visibility</p>
                  <p className="mt-1 text-sm text-slate-600">Current response used 4 approved sources across policy, compliance, and operations domains.</p>
                </div>
                <div className="rounded-2xl border border-orange-200 bg-orange-50 p-3">
                  <p className="font-semibold text-orange-800">Personalization boundary</p>
                  <p className="mt-1 text-sm text-orange-700">Recommendations remain policy-grounded and do not override authority, approval, or access rules.</p>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Follow-up Suggestions</p>
              <div className="mt-3 space-y-2">
                {[
                  'Show the exact compliance exception triggers for restructuring cases.',
                  'Compare this flow with the hardship waiver process.',
                  'Generate an executive summary for the committee pack.',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-700 hover:border-emerald-300 hover:text-emerald-800"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  )

  const renderPlayground = () => (
    <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <SectionCard title="Prompt Library" description="Governed prompt templates for reusable enterprise knowledge interaction patterns.">
        <div className="space-y-3">
          {[
            {
              title: 'Executive policy synthesis',
              detail: 'Summarize multiple sources into a concise decision-ready response with citation anchors.',
            },
            {
              title: 'Operational exception walkthrough',
              detail: 'Return a controlled step sequence for process execution with source-backed evidence.',
            },
            {
              title: 'FAQ extraction from approved bundle',
              detail: 'Transform selected documents into review-ready FAQ drafts grouped by topic.',
            },
          ].map((template) => (
            <div key={template.title} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-sm font-semibold text-slate-900">{template.title}</p>
              <p className="mt-1 text-sm text-slate-600">{template.detail}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {['Run Prompt', 'Save Prompt', 'Duplicate Prompt', 'Promote to Shared Template'].map((action) => (
                  <button
                    key={action}
                    type="button"
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-700 hover:border-emerald-300 hover:text-emerald-800"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Prompt Testing Workspace" description="Prompt editor, retrieval mode control, governed source context, and response preview for controlled experimentation.">
        <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Prompt Input</p>
              <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                Generate an executive summary comparing restructuring policy exceptions, operational packaging requirements, and compliance decision gates across the selected documents.
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Controlled Context Source Selection</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {summaryDocuments.map((document) => (
                  <Badge key={document.id} className="border border-slate-200 bg-slate-50 text-slate-700">
                    {document.title}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Execution Controls</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  <span className="font-semibold text-slate-900">Retrieval mode:</span> Hybrid grounded retrieval
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  <span className="font-semibold text-slate-900">Response style:</span> Executive narrative
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Response Preview</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-800">
                The selected sources converge on a controlled workflow: operations prepares the exception pack, compliance verifies policy-sensitive conditions, and the delegated authority committee makes the final approval decision. Differences across documents are mostly presentational rather than directional, except for one archived memo that no longer reflects the current 2026 threshold model.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Test Execution History</p>
              <div className="mt-3 space-y-3">
                {promptRuns.map((run) => (
                  <div key={run.id} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{run.template}</p>
                        <p className="mt-1 text-xs text-slate-500">{run.version} • {run.timestamp}</p>
                      </div>
                      <Badge className="border border-slate-200 bg-white text-slate-700">{run.quality}</Badge>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-slate-700">
                      <p><span className="font-semibold text-slate-900">Retrieval mode:</span> {run.retrievalMode}</p>
                      <p><span className="font-semibold text-slate-900">Scope:</span> {run.scope}</p>
                      <p><span className="font-semibold text-slate-900">Preview:</span> {run.resultSummary}</p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {['Compare Output', 'Open Retrieval Evidence', 'Run Prompt'].map((action) => (
                        <button
                          key={action}
                          type="button"
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-700 hover:border-emerald-300 hover:text-emerald-800"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  )

  const renderTrace = () => (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard title="Answer-to-Source Mapping" description="Graph view of how one answer segment is grounded in multiple approved enterprise sources.">
          <div className="h-[380px] overflow-hidden rounded-[24px] border border-slate-200 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.10),_transparent_52%),linear-gradient(180deg,_rgba(248,250,252,0.95),_rgba(255,255,255,0.92))]">
            <ReactFlow nodes={traceNodes} edges={traceEdges} fitView nodesDraggable={false} nodesConnectable={false} elementsSelectable={false} proOptions={{ hideAttribution: true }}>
              <MiniMap pannable zoomable style={{ background: '#f8fafc' }} />
              <Controls />
              <Background gap={20} color="#d1fae5" />
            </ReactFlow>
          </div>
        </SectionCard>

        <SectionCard title="Trace Inspection" description="Selected answer evidence with retrieval rank, confidence, and document metadata.">
          <div className="space-y-3">
            {traceRows.slice(0, 3).map((row) => (
              <div key={row.id} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{row.sourceTitle}</p>
                    <p className="mt-1 text-sm text-slate-600">{row.sourceSnippet}</p>
                  </div>
                  <Badge className={cn('border px-2.5 py-1 text-[11px] font-semibold', statusTone(row.status))}>{row.status}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge className="border border-slate-200 bg-white text-slate-700">Rank {row.retrievalRank}</Badge>
                  <Badge className="border border-slate-200 bg-white text-slate-700">Confidence {row.confidence}%</Badge>
                  <Badge className="border border-slate-200 bg-white text-slate-700">{row.metadata}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {['Open Source Detail', 'Expand Citation Evidence', 'Compare Supporting Sources', 'Inspect Retrieval Rank'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-700 hover:border-emerald-300 hover:text-emerald-800"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Traceability Table"
        description="Segment-level citation evidence, ranking, confidence, and source metadata for explainability review."
        right={<Badge className="border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-700">{filteredTraceRows.length} mapped segments</Badge>}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead>
              <tr>
                <th className="pb-3 pr-4 text-left"><SortHeader label="Answer Segment" sortKey="answerSegment" activeKey={traceSortKey} direction={traceSortDirection} onSort={onSortTrace} /></th>
                <th className="pb-3 pr-4 text-left"><SortHeader label="Source" sortKey="sourceTitle" activeKey={traceSortKey} direction={traceSortDirection} onSort={onSortTrace} /></th>
                <th className="pb-3 pr-4 text-left"><SortHeader label="Domain" sortKey="domain" activeKey={traceSortKey} direction={traceSortDirection} onSort={onSortTrace} /></th>
                <th className="pb-3 pr-4 text-left"><SortHeader label="Confidence" sortKey="confidence" activeKey={traceSortKey} direction={traceSortDirection} onSort={onSortTrace} /></th>
                <th className="pb-3 pr-4 text-left"><SortHeader label="Rank" sortKey="retrievalRank" activeKey={traceSortKey} direction={traceSortDirection} onSort={onSortTrace} /></th>
                <th className="pb-3 pr-4 text-left"><SortHeader label="Status" sortKey="status" activeKey={traceSortKey} direction={traceSortDirection} onSort={onSortTrace} /></th>
                <th className="pb-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTraceRows.map((row) => (
                <tr key={row.id} className="align-top transition hover:bg-slate-50/70">
                  <td className="py-4 pr-4 text-slate-800">{row.answerSegment}</td>
                  <td className="py-4 pr-4">
                    <p className="font-semibold text-slate-900">{row.sourceTitle}</p>
                    <p className="mt-1 text-xs text-slate-500">{row.metadata}</p>
                  </td>
                  <td className="py-4 pr-4 text-slate-700">{row.domain}</td>
                  <td className="py-4 pr-4 font-semibold text-slate-900">{row.confidence}%</td>
                  <td className="py-4 pr-4 font-semibold text-slate-900">{row.retrievalRank}</td>
                  <td className="py-4 pr-4">
                    <Badge className={cn('border px-2.5 py-1 text-[11px] font-semibold', statusTone(row.status))}>{row.status}</Badge>
                  </td>
                  <td className="py-4">
                    <div className="flex max-w-[240px] flex-wrap gap-2">
                      {['Open Source Detail', 'Expand Citation Evidence', 'Export Trace Evidence', 'Mark Answer for Review'].map((action) => (
                        <button
                          key={action}
                          type="button"
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-700 hover:border-emerald-300 hover:text-emerald-800"
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
      </SectionCard>
    </div>
  )

  const renderSummary = () => (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
        <SectionCard title="Source Selection" description="Selected documents for summary generation, FAQ creation, and multi-document synthesis.">
          <div className="space-y-3">
            {summaryDocuments.map((document) => (
              <div key={document.id} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{document.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{document.owner} • Updated {document.updatedAt}</p>
                  </div>
                  <Badge className="border border-slate-200 bg-white text-slate-700">{document.type}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge className="border border-slate-200 bg-white text-slate-700">{document.domain}</Badge>
                  <Badge className="border border-slate-200 bg-white text-slate-700">{document.coverage}</Badge>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Summary Output Panel" description="Traceable summary generation with key-point extraction, synthesis, and export readiness.">
          <div className="space-y-4">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Executive Summary</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-800">
                Current approved sources indicate a disciplined restructuring control model: the business process begins with operations packaging, escalates through compliance when exceptions are present, and ends with documented approval authority plus customer communication. Cross-document synthesis shows strong alignment between the updated policy set and the supporting SOPs, with only one archived memo excluded because it conflicts with current thresholds.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {[
                'Generate Summary',
                'Generate Executive Summary',
                'Create FAQ Draft',
                'Compare Document Themes',
                'Open Supporting Sources',
                'Export Summary',
              ].map((action) => (
                <button
                  key={action}
                  type="button"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 hover:border-emerald-300 hover:text-emerald-800"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="Synthesis Comparison" description="Theme aggregation, conflict awareness, and combined reasoning across selected knowledge sources.">
          <div className="space-y-3">
            {synthesisBlocks.map((block) => (
              <div key={block.theme} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-sm font-semibold text-slate-900">{block.theme}</p>
                <p className="mt-1 text-sm text-slate-600">{block.detail}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="FAQ Candidates" description="Reusable FAQ drafts grouped by domain with evidence status and review readiness.">
          <div className="space-y-3">
            {faqDrafts.map((draft) => (
              <div key={draft.question} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{draft.question}</p>
                    <p className="mt-1 text-xs text-slate-500">{draft.topic}</p>
                  </div>
                  <Badge className="border border-slate-200 bg-white text-slate-700">{draft.status}</Badge>
                </div>
                <p className="mt-3 text-sm text-slate-700">{draft.answer}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>{draft.evidence}</span>
                  <span>Generated 2026-04-16 08:09</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 pb-8">
      <Breadcrumb
        items={[
          { label: 'Knowledge Repository & Content Management', href: '/knowledge' },
          { label: 'Knowledge Structuring & Ontology Management', href: '/knowledge-structuring-ontology' },
          { label: 'Search, Discovery & Retrieval', href: '/search-discovery-retrieval' },
          { label: 'AI Knowledge Assistant' },
        ]}
      />

      <PageHeader
        title="AI Knowledge Assistant"
        description="Central enterprise workspace for grounded conversational retrieval, context-aware answering, source traceability, multi-document synthesis, summary generation, and controlled AI knowledge interaction."
        right={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className={cn(
                'rounded-lg p-2.5 h-auto',
                showFilters && 'ring-1 ring-border/50 shadow-sm bg-emerald-50 text-emerald-800 border-emerald-300'
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
              <Copy className="h-5 w-5" />
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
              className="group relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),_transparent_32%),linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(248,250,252,0.94))] p-4 text-left shadow-[0_22px_70px_-58px_rgba(15,23,42,0.85)] transition-all hover:-translate-y-0.5 hover:border-emerald-300"
            >
              <div className="relative z-10">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-500">{card.label}</p>
                    <p className="mt-2 text-2xl font-bold text-slate-950">{card.value}</p>
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
        <div className="rounded-[28px] border border-slate-200/80 bg-white/92 p-4 shadow-[0_22px_70px_-60px_rgba(15,23,42,0.8)]">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by question text, document title, knowledge topic, prompt template, citation source, summary request, FAQ topic, or conversation session"
                className="h-10 w-full rounded-xl border-slate-200 bg-white/80 pl-9 text-sm"
              />
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Interaction Type</p>
                <div className="flex flex-wrap gap-2">
                  {interactionOptions.map((option) => (
                    <FilterChip
                      key={option}
                      label={option}
                      active={selectedInteractions.includes(option)}
                      onClick={() => setSelectedInteractions(toggleMultiSelect(selectedInteractions, option, interactionOptions))}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Answer Status</p>
                <div className="flex flex-wrap gap-2">
                  {answerStatusOptions.map((option) => (
                    <FilterChip
                      key={option}
                      label={option}
                      active={selectedStatuses.includes(option)}
                      onClick={() => setSelectedStatuses(toggleMultiSelect(selectedStatuses, option, answerStatusOptions))}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Source Scope</p>
                <div className="flex flex-wrap gap-2">
                  {sourceScopeOptions.map((option) => (
                    <FilterChip
                      key={option}
                      label={option}
                      active={selectedScopes.includes(option)}
                      onClick={() => setSelectedScopes(toggleMultiSelect(selectedScopes, option, sourceScopeOptions))}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Domain</p>
                <div className="flex flex-wrap gap-2">
                  {domainOptions.map((option) => (
                    <FilterChip
                      key={option}
                      label={option}
                      active={selectedDomains.includes(option)}
                      onClick={() => setSelectedDomains(toggleMultiSelect(selectedDomains, option, domainOptions))}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Time</p>
                <div className="flex flex-wrap gap-2">
                  {timeOptions.map((option) => (
                    <FilterChip
                      key={option}
                      label={option}
                      active={selectedTime === option}
                      onClick={() => setSelectedTime(option)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[290px_minmax(0,1fr)]">
        <aside className="sticky top-20 h-fit rounded-[28px] border border-slate-200/80 bg-white/92 p-3 shadow-[0_24px_80px_-62px_rgba(15,23,42,0.85)]">
          <div className="px-2 pb-3 pt-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Workspace Navigator</p>
            <p className="mt-1 text-sm text-slate-600">A dedicated AI knowledge interaction workspace, not a generic chatbot surface.</p>
          </div>
          <div className="space-y-2">
            {workspaceItems.map((item) => {
              const Icon = item.icon
              const isActive = item.key === activeWorkspace
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveWorkspace(item.key)}
                  className={cn(
                    'w-full rounded-2xl border p-3 text-left transition-all',
                    isActive
                      ? 'border-emerald-300 bg-gradient-to-r from-emerald-50 to-sky-50 shadow-sm'
                      : 'border-transparent bg-white/70 hover:border-slate-200 hover:bg-slate-50/70'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn('rounded-xl border p-2', isActive ? 'border-emerald-200 bg-white text-emerald-700' : 'border-slate-200 bg-white text-slate-600')}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn('text-sm font-semibold', isActive ? 'text-emerald-900' : 'text-slate-900')}>{item.label}</p>
                        {item.count ? <Badge className="border border-slate-200 bg-white text-slate-600">{item.count}</Badge> : null}
                      </div>
                      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{item.description}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </aside>

        <section className="min-w-0 space-y-6">
          {activeWorkspace === 'overview' ? renderOverview() : null}
          {activeWorkspace === 'assistant' ? renderAssistant() : null}
          {activeWorkspace === 'playground' ? renderPlayground() : null}
          {activeWorkspace === 'trace' ? renderTrace() : null}
          {activeWorkspace === 'summary' ? renderSummary() : null}
        </section>
      </div>
    </div>
  )
}