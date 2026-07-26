import { useMemo, useState, type ComponentType, type ReactNode } from 'react'
import {
  AlertTriangle,
  ArrowUpDown,
  BarChart3,
  BookOpen,
  Bot,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Download,
  Eye,
  Filter,
  LayoutDashboard,
  LineChart,
  Search,
  TrendingUp,
  X,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { PageHeader } from '@/components/layout/PageHeader'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type WorkspaceSection = 'overview' | 'dashboard' | 'usage' | 'gap' | 'ai'
type SortDirection = 'asc' | 'desc'
type StatusTag = 'Healthy' | 'Warning' | 'Critical' | 'Rising' | 'Declining' | 'Unanswered' | 'Needs Attention'
type AnalyticsType = 'Usage' | 'Search' | 'Gap' | 'Trend' | 'AI Interaction'
type ContentType = 'Document' | 'Wiki Page' | 'Policy' | 'SOP' | 'FAQ' | 'Summary' | 'AI Answer'
type Domain = 'Customer' | 'Loan' | 'Collection' | 'Finance' | 'Risk' | 'Compliance' | 'Operations'
type TimeTag = 'Today' | '7 Days' | '30 Days' | '90 Days' | '12 Months' | 'Custom Range'
type GapSeverity = 'Critical' | 'Warning' | 'Needs Attention'
type RecordStatus = 'Healthy' | 'Warning' | 'Critical' | 'Rising' | 'Declining' | 'Unanswered' | 'Needs Attention'

interface WorkspaceMenuItem {
  key: WorkspaceSection
  label: string
  description: string
  count: number
  icon: ComponentType<{ className?: string }>
}

interface KpiCard {
  label: string
  metric: string
  description: string
  trend: string
  icon: ComponentType<{ className?: string }>
  targetSection: WorkspaceSection
  tone: 'sage' | 'teal' | 'warning' | 'critical' | 'neutral'
}

interface InsightRecord {
  id: string
  knowledgeAsset: string
  analyticsType: AnalyticsType
  usageTrend: number
  searchPerformance: number
  gapIndicator: string
  trendScore: number
  aiReferenceCount: number
  domain: Domain
  owner: string
  contentType: ContentType
  lastAnalyzed: string
  status: RecordStatus
  timeTag: TimeTag
}

interface UsageRecord {
  id: string
  assetTitle: string
  contentType: ContentType
  domain: Domain
  totalViews: number
  uniqueUsers: number
  repeatViews: number
  averageTimeEngaged: number
  lastAccessedDate: string
  popularityStatus: 'Top Performing' | 'Stable' | 'Underused'
  owner: string
  status: RecordStatus
  timeTag: TimeTag
}

interface GapRecord {
  id: string
  gapTopic: string
  relatedFailedQueries: string[]
  gapSeverity: GapSeverity
  domain: Domain
  demandFrequency: number
  existingContentCoverage: number
  recommendedAction: string
  owner: string
  lastDetectedDate: string
  status: RecordStatus
  contentType: ContentType
  timeTag: TimeTag
}

interface AiInteractionRecord {
  id: string
  interactionTopic: string
  questionVolume: number
  answerSuccessRate: number
  citationCoverage: number
  summaryGenerationCount: number
  synthesisSessions: number
  topReferencedSources: string[]
  domain: Domain
  lastActiveDate: string
  status: RecordStatus
  contentType: ContentType
  timeTag: TimeTag
}

interface TrendTopic {
  id: string
  topic: string
  domain: Domain
  momentum: string
  searchDemand: number
  aiLift: string
  summary: string
  status: 'Rising' | 'Stable' | 'Watch'
  timeTag: TimeTag
}

interface ActivityItem {
  id: string
  title: string
  detail: string
  timestamp: string
  tone: 'positive' | 'warning' | 'critical' | 'neutral'
}

interface DetailDrawerState {
  title: string
  subtitle: string
  tone: 'positive' | 'warning' | 'critical' | 'neutral'
  metrics: Array<{ label: string; value: string }>
  bullets: string[]
  actions: string[]
}

interface SortState<T extends string> {
  key: T
  direction: SortDirection
}

const statusOptions: StatusTag[] = ['Healthy', 'Warning', 'Critical', 'Rising', 'Declining', 'Unanswered', 'Needs Attention']
const analyticsTypeOptions: AnalyticsType[] = ['Usage', 'Search', 'Gap', 'Trend', 'AI Interaction']
const contentTypeOptions: ContentType[] = ['Document', 'Wiki Page', 'Policy', 'SOP', 'FAQ', 'Summary', 'AI Answer']
const domainOptions: Domain[] = ['Customer', 'Loan', 'Collection', 'Finance', 'Risk', 'Compliance', 'Operations']
const timeOptions: TimeTag[] = ['Today', '7 Days', '30 Days', '90 Days', '12 Months', 'Custom Range']

const usageTrendSeries = [
  { period: 'Nov', views: 11200, uniqueUsers: 2240, repeatAccess: 38 },
  { period: 'Dec', views: 11840, uniqueUsers: 2385, repeatAccess: 40 },
  { period: 'Jan', views: 12620, uniqueUsers: 2510, repeatAccess: 43 },
  { period: 'Feb', views: 13190, uniqueUsers: 2625, repeatAccess: 45 },
  { period: 'Mar', views: 13980, uniqueUsers: 2790, repeatAccess: 48 },
  { period: 'Apr', views: 14860, uniqueUsers: 2965, repeatAccess: 51 },
]

const searchPerformanceSeries = [
  { period: 'Week 1', successRate: 86, zeroResults: 31, refinements: 112 },
  { period: 'Week 2', successRate: 88, zeroResults: 25, refinements: 103 },
  { period: 'Week 3', successRate: 89, zeroResults: 22, refinements: 96 },
  { period: 'Week 4', successRate: 91, zeroResults: 19, refinements: 88 },
]

const gapTrendSeries = [
  { month: 'Jan', critical: 14, warning: 22, resolved: 18 },
  { month: 'Feb', critical: 12, warning: 21, resolved: 23 },
  { month: 'Mar', critical: 10, warning: 18, resolved: 27 },
  { month: 'Apr', critical: 8, warning: 16, resolved: 31 },
]

const aiUsageTrendSeries = [
  { period: 'Nov', sessions: 1820, citationCoverage: 82, summaries: 410 },
  { period: 'Dec', sessions: 1960, citationCoverage: 84, summaries: 455 },
  { period: 'Jan', sessions: 2140, citationCoverage: 86, summaries: 482 },
  { period: 'Feb', sessions: 2285, citationCoverage: 88, summaries: 521 },
  { period: 'Mar', sessions: 2440, citationCoverage: 89, summaries: 566 },
  { period: 'Apr', sessions: 2610, citationCoverage: 91, summaries: 608 },
]

const domainUsageSeries = [
  { domain: 'Loan', views: 3620, underused: 4 },
  { domain: 'Collection', views: 2980, underused: 5 },
  { domain: 'Compliance', views: 2540, underused: 3 },
  { domain: 'Customer', views: 2210, underused: 6 },
  { domain: 'Risk', views: 2100, underused: 3 },
  { domain: 'Finance', views: 1940, underused: 2 },
  { domain: 'Operations', views: 1830, underused: 4 },
]

const insightRecords: InsightRecord[] = [
  {
    id: 'INS-1001',
    knowledgeAsset: 'Collections Hardship Resolution Playbook',
    analyticsType: 'Usage',
    usageTrend: 18,
    searchPerformance: 93,
    gapIndicator: 'Low coverage in branch-specific examples',
    trendScore: 92,
    aiReferenceCount: 284,
    domain: 'Collection',
    owner: 'Collections Knowledge Office',
    contentType: 'Document',
    lastAnalyzed: '2026-04-16',
    status: 'Rising',
    timeTag: '30 Days',
  },
  {
    id: 'INS-1002',
    knowledgeAsset: 'Retail Loan Restructuring Policy',
    analyticsType: 'Search',
    usageTrend: 12,
    searchPerformance: 91,
    gapIndicator: 'No critical gap detected',
    trendScore: 88,
    aiReferenceCount: 240,
    domain: 'Loan',
    owner: 'Credit Risk Governance',
    contentType: 'Policy',
    lastAnalyzed: '2026-04-16',
    status: 'Healthy',
    timeTag: '30 Days',
  },
  {
    id: 'INS-1003',
    knowledgeAsset: 'AML Escalation Triage Guide',
    analyticsType: 'Gap',
    usageTrend: 7,
    searchPerformance: 64,
    gapIndicator: 'Repeated failed searches on enhanced due diligence scenarios',
    trendScore: 73,
    aiReferenceCount: 116,
    domain: 'Compliance',
    owner: 'Financial Crime Office',
    contentType: 'SOP',
    lastAnalyzed: '2026-04-15',
    status: 'Needs Attention',
    timeTag: '7 Days',
  },
  {
    id: 'INS-1004',
    knowledgeAsset: 'Branch Complaint Response FAQ',
    analyticsType: 'Trend',
    usageTrend: 24,
    searchPerformance: 87,
    gapIndicator: 'Coverage healthy',
    trendScore: 90,
    aiReferenceCount: 172,
    domain: 'Customer',
    owner: 'Customer Experience Office',
    contentType: 'FAQ',
    lastAnalyzed: '2026-04-16',
    status: 'Rising',
    timeTag: '7 Days',
  },
  {
    id: 'INS-1005',
    knowledgeAsset: 'Liquidity Stress Summary Deck',
    analyticsType: 'AI Interaction',
    usageTrend: -4,
    searchPerformance: 79,
    gapIndicator: 'Summary demand rising faster than source updates',
    trendScore: 68,
    aiReferenceCount: 98,
    domain: 'Finance',
    owner: 'Treasury Analytics',
    contentType: 'Summary',
    lastAnalyzed: '2026-04-14',
    status: 'Warning',
    timeTag: '30 Days',
  },
  {
    id: 'INS-1006',
    knowledgeAsset: 'Operational Incident Recovery Guide',
    analyticsType: 'Usage',
    usageTrend: -8,
    searchPerformance: 72,
    gapIndicator: 'Discoverability weak for alternate recovery keywords',
    trendScore: 61,
    aiReferenceCount: 74,
    domain: 'Operations',
    owner: 'Service Readiness Office',
    contentType: 'Document',
    lastAnalyzed: '2026-04-13',
    status: 'Declining',
    timeTag: '90 Days',
  },
  {
    id: 'INS-1007',
    knowledgeAsset: 'Early Delinquency Playbook',
    analyticsType: 'Search',
    usageTrend: 15,
    searchPerformance: 0,
    gapIndicator: 'Zero-result query cluster for grace-period exceptions',
    trendScore: 65,
    aiReferenceCount: 104,
    domain: 'Collection',
    owner: 'Collections Strategy',
    contentType: 'Document',
    lastAnalyzed: '2026-04-16',
    status: 'Unanswered',
    timeTag: 'Today',
  },
  {
    id: 'INS-1008',
    knowledgeAsset: 'Fraud Investigation Decision Tree',
    analyticsType: 'AI Interaction',
    usageTrend: 19,
    searchPerformance: 90,
    gapIndicator: 'Citation coverage strong with minor workflow detail gap',
    trendScore: 94,
    aiReferenceCount: 336,
    domain: 'Risk',
    owner: 'Fraud Risk Intelligence',
    contentType: 'Wiki Page',
    lastAnalyzed: '2026-04-16',
    status: 'Healthy',
    timeTag: '30 Days',
  },
]

const usageRecords: UsageRecord[] = [
  {
    id: 'USA-201',
    assetTitle: 'Retail Loan Restructuring Policy',
    contentType: 'Policy',
    domain: 'Loan',
    totalViews: 1820,
    uniqueUsers: 642,
    repeatViews: 520,
    averageTimeEngaged: 8.4,
    lastAccessedDate: '2026-04-16',
    popularityStatus: 'Top Performing',
    owner: 'Credit Risk Governance',
    status: 'Healthy',
    timeTag: '30 Days',
  },
  {
    id: 'USA-202',
    assetTitle: 'Collections Hardship Resolution Playbook',
    contentType: 'Document',
    domain: 'Collection',
    totalViews: 1644,
    uniqueUsers: 570,
    repeatViews: 498,
    averageTimeEngaged: 9.1,
    lastAccessedDate: '2026-04-16',
    popularityStatus: 'Top Performing',
    owner: 'Collections Knowledge Office',
    status: 'Rising',
    timeTag: '30 Days',
  },
  {
    id: 'USA-203',
    assetTitle: 'Branch Complaint Response FAQ',
    contentType: 'FAQ',
    domain: 'Customer',
    totalViews: 1218,
    uniqueUsers: 486,
    repeatViews: 344,
    averageTimeEngaged: 5.8,
    lastAccessedDate: '2026-04-15',
    popularityStatus: 'Stable',
    owner: 'Customer Experience Office',
    status: 'Healthy',
    timeTag: '7 Days',
  },
  {
    id: 'USA-204',
    assetTitle: 'Operational Incident Recovery Guide',
    contentType: 'SOP',
    domain: 'Operations',
    totalViews: 388,
    uniqueUsers: 156,
    repeatViews: 72,
    averageTimeEngaged: 4.3,
    lastAccessedDate: '2026-04-11',
    popularityStatus: 'Underused',
    owner: 'Service Readiness Office',
    status: 'Declining',
    timeTag: '90 Days',
  },
  {
    id: 'USA-205',
    assetTitle: 'AML Escalation Triage Guide',
    contentType: 'Wiki Page',
    domain: 'Compliance',
    totalViews: 792,
    uniqueUsers: 264,
    repeatViews: 190,
    averageTimeEngaged: 6.7,
    lastAccessedDate: '2026-04-16',
    popularityStatus: 'Stable',
    owner: 'Financial Crime Office',
    status: 'Needs Attention',
    timeTag: '7 Days',
  },
  {
    id: 'USA-206',
    assetTitle: 'Treasury Liquidity Stress Summary',
    contentType: 'Summary',
    domain: 'Finance',
    totalViews: 674,
    uniqueUsers: 204,
    repeatViews: 168,
    averageTimeEngaged: 7.6,
    lastAccessedDate: '2026-04-14',
    popularityStatus: 'Stable',
    owner: 'Treasury Analytics',
    status: 'Warning',
    timeTag: '30 Days',
  },
]

const gapRecords: GapRecord[] = [
  {
    id: 'GAP-301',
    gapTopic: 'Grace-period exception handling for early delinquency',
    relatedFailedQueries: ['grace period exception', 'payment holiday delinquency treatment', 'early bucket hardship waiver'],
    gapSeverity: 'Critical',
    domain: 'Collection',
    demandFrequency: 68,
    existingContentCoverage: 24,
    recommendedAction: 'Create branch-ready decision guide with exception scenarios and role-based steps.',
    owner: 'Collections Strategy',
    lastDetectedDate: '2026-04-16',
    status: 'Unanswered',
    contentType: 'Document',
    timeTag: 'Today',
  },
  {
    id: 'GAP-302',
    gapTopic: 'Enhanced due diligence trigger examples for corporate onboarding',
    relatedFailedQueries: ['EDD corporate trigger', 'enhanced due diligence example', 'corporate onboarding red flag'],
    gapSeverity: 'Warning',
    domain: 'Compliance',
    demandFrequency: 54,
    existingContentCoverage: 46,
    recommendedAction: 'Expand AML guide with scenario matrix and reviewer escalation thresholds.',
    owner: 'Financial Crime Office',
    lastDetectedDate: '2026-04-15',
    status: 'Needs Attention',
    contentType: 'SOP',
    timeTag: '7 Days',
  },
  {
    id: 'GAP-303',
    gapTopic: 'Cross-sell complaint handling for digital sales journeys',
    relatedFailedQueries: ['digital complaint cross sell', 'complaint after bundled offer', 'digital sales complaint script'],
    gapSeverity: 'Needs Attention',
    domain: 'Customer',
    demandFrequency: 39,
    existingContentCoverage: 58,
    recommendedAction: 'Add FAQ entries and targeted AI answer grounding references.',
    owner: 'Customer Experience Office',
    lastDetectedDate: '2026-04-14',
    status: 'Warning',
    contentType: 'FAQ',
    timeTag: '30 Days',
  },
  {
    id: 'GAP-304',
    gapTopic: 'Intraday liquidity scenario summary for branch operations',
    relatedFailedQueries: ['intraday liquidity branch summary', 'branch liquidity notice', 'treasury same-day scenario'],
    gapSeverity: 'Warning',
    domain: 'Finance',
    demandFrequency: 28,
    existingContentCoverage: 41,
    recommendedAction: 'Publish controlled summary linked to treasury source pack.',
    owner: 'Treasury Analytics',
    lastDetectedDate: '2026-04-13',
    status: 'Warning',
    contentType: 'Summary',
    timeTag: '30 Days',
  },
]

const aiInteractionRecords: AiInteractionRecord[] = [
  {
    id: 'AI-401',
    interactionTopic: 'Collections hardship negotiation steps',
    questionVolume: 418,
    answerSuccessRate: 92,
    citationCoverage: 94,
    summaryGenerationCount: 86,
    synthesisSessions: 52,
    topReferencedSources: ['Collections Hardship Resolution Playbook', 'Retail Restructuring Policy'],
    domain: 'Collection',
    lastActiveDate: '2026-04-16',
    status: 'Healthy',
    contentType: 'AI Answer',
    timeTag: '30 Days',
  },
  {
    id: 'AI-402',
    interactionTopic: 'Fraud investigation decision support',
    questionVolume: 366,
    answerSuccessRate: 94,
    citationCoverage: 96,
    summaryGenerationCount: 64,
    synthesisSessions: 49,
    topReferencedSources: ['Fraud Investigation Decision Tree', 'Case Escalation Review Flow'],
    domain: 'Risk',
    lastActiveDate: '2026-04-16',
    status: 'Healthy',
    contentType: 'AI Answer',
    timeTag: '30 Days',
  },
  {
    id: 'AI-403',
    interactionTopic: 'Corporate onboarding EDD scenarios',
    questionVolume: 214,
    answerSuccessRate: 71,
    citationCoverage: 68,
    summaryGenerationCount: 42,
    synthesisSessions: 25,
    topReferencedSources: ['AML Escalation Triage Guide'],
    domain: 'Compliance',
    lastActiveDate: '2026-04-15',
    status: 'Needs Attention',
    contentType: 'AI Answer',
    timeTag: '7 Days',
  },
  {
    id: 'AI-404',
    interactionTopic: 'Branch complaint script retrieval',
    questionVolume: 248,
    answerSuccessRate: 84,
    citationCoverage: 88,
    summaryGenerationCount: 39,
    synthesisSessions: 30,
    topReferencedSources: ['Branch Complaint Response FAQ', 'Customer Complaint Root Cause Playbook'],
    domain: 'Customer',
    lastActiveDate: '2026-04-16',
    status: 'Rising',
    contentType: 'AI Answer',
    timeTag: '7 Days',
  },
]

const trendingTopics: TrendTopic[] = [
  {
    id: 'TR-501',
    topic: 'Collections hardship relief and restructuring',
    domain: 'Collection',
    momentum: '+23% week over week',
    searchDemand: 412,
    aiLift: '+18% AI-assisted answers',
    summary: 'Demand is accelerating across collections, branch recovery teams, and customer support handoff flows.',
    status: 'Rising',
    timeTag: '7 Days',
  },
  {
    id: 'TR-502',
    topic: 'Fraud investigation escalation',
    domain: 'Risk',
    momentum: '+17% month over month',
    searchDemand: 298,
    aiLift: '+21% citation-backed usage',
    summary: 'AI-assisted traceable answers are growing faster than manual document opens, indicating strong grounded assistant adoption.',
    status: 'Rising',
    timeTag: '30 Days',
  },
  {
    id: 'TR-503',
    topic: 'Digital complaint response patterns',
    domain: 'Customer',
    momentum: 'Recurring monthly spike',
    searchDemand: 214,
    aiLift: '+9% summary generation',
    summary: 'Seasonal demand is reappearing without proportional content expansion, suggesting targeted FAQ improvement is required.',
    status: 'Watch',
    timeTag: '30 Days',
  },
]

const recentActivities: ActivityItem[] = [
  {
    id: 'ACT-1',
    title: 'Zero-result cluster detected',
    detail: 'Grace-period exception searches crossed the critical threshold across collections and branch support teams.',
    timestamp: '16 Apr 2026, 16:20',
    tone: 'critical',
  },
  {
    id: 'ACT-2',
    title: 'AI citation coverage improved',
    detail: 'Fraud investigation topics reached 96% citation coverage after source refresh and answer grounding alignment.',
    timestamp: '16 Apr 2026, 14:05',
    tone: 'positive',
  },
  {
    id: 'ACT-3',
    title: 'Trending topic momentum increased',
    detail: 'Collections hardship workflows moved into the top demand band for three consecutive days.',
    timestamp: '16 Apr 2026, 11:40',
    tone: 'warning',
  },
  {
    id: 'ACT-4',
    title: 'Underused content review opened',
    detail: 'Operational incident recovery guide was flagged for low reuse and weak search capture across synonyms.',
    timestamp: '15 Apr 2026, 18:15',
    tone: 'neutral',
  },
]

const aiTopicHeatmap = [
  { domain: 'Collection', discovery: 92, guidance: 88, summarization: 74 },
  { domain: 'Loan', discovery: 84, guidance: 79, summarization: 66 },
  { domain: 'Compliance', discovery: 71, guidance: 64, summarization: 58 },
  { domain: 'Customer', discovery: 76, guidance: 72, summarization: 61 },
  { domain: 'Risk', discovery: 89, guidance: 91, summarization: 73 },
]

const numberFormatter = new Intl.NumberFormat('en-US')

function matchesSearch(query: string, ...fields: Array<string | number | string[]>) {
  if (!query.trim()) {
    return true
  }

  const normalizedQuery = query.trim().toLowerCase()
  return fields.some((field) => {
    if (Array.isArray(field)) {
      return field.join(' ').toLowerCase().includes(normalizedQuery)
    }
    return String(field).toLowerCase().includes(normalizedQuery)
  })
}

function matchesSelected<T extends string>(value: T, selected: T[]) {
  return selected.includes(value)
}

function toggleSelection<T extends string>(current: T[], value: T, all: readonly T[]) {
  const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
  return next.length === 0 ? [...all] : next
}

function nextSortState<T extends string>(current: SortState<T>, key: T): SortState<T> {
  if (current.key !== key) {
    return { key, direction: 'asc' }
  }

  return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
}

function formatPercent(value: number) {
  return `${value}%`
}

function formatNumber(value: number) {
  return numberFormatter.format(value)
}

function formatDuration(minutes: number) {
  return `${minutes.toFixed(1)} min`
}

function formatTooltipValue(value: number | string | undefined) {
  return formatNumber(Number(value ?? 0))
}

function sortByKey<T>(records: T[], state: SortState<string>, getter: (record: T, key: string) => string | number) {
  const sorted = [...records]
  sorted.sort((left, right) => {
    const leftValue = getter(left, state.key)
    const rightValue = getter(right, state.key)

    if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      return state.direction === 'asc' ? leftValue - rightValue : rightValue - leftValue
    }

    const comparison = String(leftValue).localeCompare(String(rightValue))
    return state.direction === 'asc' ? comparison : -comparison
  })
  return sorted
}

function toneBadgeClass(tone: DetailDrawerState['tone']) {
  if (tone === 'positive') return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  if (tone === 'warning') return 'border-amber-200 bg-amber-50 text-amber-700'
  if (tone === 'critical') return 'border-rose-200 bg-rose-50 text-rose-700'
  return 'border-slate-200 bg-slate-100 text-slate-700'
}

function statusBadgeClass(status: RecordStatus) {
  switch (status) {
    case 'Healthy':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    case 'Rising':
      return 'border-teal-200 bg-teal-50 text-teal-700'
    case 'Warning':
      return 'border-amber-200 bg-amber-50 text-amber-700'
    case 'Critical':
      return 'border-rose-200 bg-rose-50 text-rose-700'
    case 'Declining':
      return 'border-slate-200 bg-slate-100 text-slate-700'
    case 'Unanswered':
      return 'border-rose-200 bg-rose-50 text-rose-700'
    default:
      return 'border-orange-200 bg-orange-50 text-orange-700'
  }
}

function popularityBadgeClass(status: UsageRecord['popularityStatus']) {
  switch (status) {
    case 'Top Performing':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    case 'Stable':
      return 'border-slate-200 bg-slate-100 text-slate-700'
    default:
      return 'border-amber-200 bg-amber-50 text-amber-700'
  }
}

function kpiToneClass(tone: KpiCard['tone']) {
  switch (tone) {
    case 'sage':
      return 'border-emerald-200/80 bg-[linear-gradient(135deg,rgba(236,253,245,0.96),rgba(255,255,255,0.96))]'
    case 'teal':
      return 'border-teal-200/80 bg-[linear-gradient(135deg,rgba(240,253,250,0.96),rgba(255,255,255,0.96))]'
    case 'warning':
      return 'border-amber-200/80 bg-[linear-gradient(135deg,rgba(255,251,235,0.96),rgba(255,255,255,0.96))]'
    case 'critical':
      return 'border-rose-200/80 bg-[linear-gradient(135deg,rgba(255,241,242,0.96),rgba(255,255,255,0.96))]'
    default:
      return 'border-slate-200/80 bg-[linear-gradient(135deg,rgba(248,250,252,0.96),rgba(255,255,255,0.96))]'
  }
}

function SortableHeader<T extends string>({
  label,
  sortKey,
  sortState,
  onSort,
  align = 'left',
}: {
  label: string
  sortKey: T
  sortState: SortState<T>
  onSort: (key: T) => void
  align?: 'left' | 'right'
}) {
  const isActive = sortState.key === sortKey
  return (
    <button
      type="button"
      className={cn(
        'flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 transition-colors hover:text-slate-700',
        align === 'right' && 'ml-auto',
      )}
      onClick={() => onSort(sortKey)}
    >
      <span>{label}</span>
      {isActive ? (
        sortState.direction === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
      ) : (
        <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
      )}
    </button>
  )
}

function SectionCard({
  title,
  description,
  children,
  action,
  className,
}: {
  title: string
  description?: string
  children: ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('rounded-[28px] border border-slate-200/80 bg-white/92 p-5 shadow-[0_20px_55px_rgba(15,23,42,0.06)]', className)}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
          {description ? <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-10 text-center text-sm text-slate-500">
      {label}
    </div>
  )
}

export function KnowledgeAnalyticsInsightsPage() {
  const [activeSection, setActiveSection] = useState<WorkspaceSection>('overview')
  const [showFilters, setShowFilters] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatuses, setSelectedStatuses] = useState<StatusTag[]>([...statusOptions])
  const [selectedAnalyticsTypes, setSelectedAnalyticsTypes] = useState<AnalyticsType[]>([...analyticsTypeOptions])
  const [selectedContentTypes, setSelectedContentTypes] = useState<ContentType[]>([...contentTypeOptions])
  const [selectedDomains, setSelectedDomains] = useState<Domain[]>([...domainOptions])
  const [selectedTimes, setSelectedTimes] = useState<TimeTag[]>([...timeOptions])
  const [exportMessage, setExportMessage] = useState<string | null>(null)
  const [detailDrawer, setDetailDrawer] = useState<DetailDrawerState | null>(null)
  const [insightSort, setInsightSort] = useState<SortState<keyof InsightRecord>>({ key: 'trendScore', direction: 'desc' })
  const [usageSort, setUsageSort] = useState<SortState<keyof UsageRecord>>({ key: 'totalViews', direction: 'desc' })
  const [gapSort, setGapSort] = useState<SortState<keyof GapRecord>>({ key: 'demandFrequency', direction: 'desc' })
  const [aiSort, setAiSort] = useState<SortState<keyof AiInteractionRecord>>({ key: 'questionVolume', direction: 'desc' })

  const filteredInsights = useMemo(() => {
    return insightRecords.filter((record) => {
      return (
        matchesSelected(record.status, selectedStatuses) &&
        matchesSelected(record.analyticsType, selectedAnalyticsTypes) &&
        matchesSelected(record.contentType, selectedContentTypes) &&
        matchesSelected(record.domain, selectedDomains) &&
        matchesSelected(record.timeTag, selectedTimes) &&
        matchesSearch(
          searchQuery,
          record.knowledgeAsset,
          record.domain,
          record.owner,
          record.gapIndicator,
          record.analyticsType,
          record.contentType,
        )
      )
    })
  }, [searchQuery, selectedAnalyticsTypes, selectedContentTypes, selectedDomains, selectedStatuses, selectedTimes])

  const filteredUsageRecords = useMemo(() => {
    return usageRecords.filter((record) => {
      return (
        matchesSelected(record.status, selectedStatuses) &&
        matchesSelected('Usage', selectedAnalyticsTypes) &&
        matchesSelected(record.contentType, selectedContentTypes) &&
        matchesSelected(record.domain, selectedDomains) &&
        matchesSelected(record.timeTag, selectedTimes) &&
        matchesSearch(searchQuery, record.assetTitle, record.domain, record.owner, record.contentType, record.popularityStatus)
      )
    })
  }, [searchQuery, selectedAnalyticsTypes, selectedContentTypes, selectedDomains, selectedStatuses, selectedTimes])

  const filteredGapRecords = useMemo(() => {
    return gapRecords.filter((record) => {
      return (
        matchesSelected(record.status, selectedStatuses) &&
        matchesSelected('Gap', selectedAnalyticsTypes) &&
        matchesSelected(record.contentType, selectedContentTypes) &&
        matchesSelected(record.domain, selectedDomains) &&
        matchesSelected(record.timeTag, selectedTimes) &&
        matchesSearch(searchQuery, record.gapTopic, record.domain, record.owner, record.recommendedAction, record.relatedFailedQueries)
      )
    })
  }, [searchQuery, selectedAnalyticsTypes, selectedContentTypes, selectedDomains, selectedStatuses, selectedTimes])

  const filteredAiRecords = useMemo(() => {
    return aiInteractionRecords.filter((record) => {
      return (
        matchesSelected(record.status, selectedStatuses) &&
        matchesSelected('AI Interaction', selectedAnalyticsTypes) &&
        matchesSelected(record.contentType, selectedContentTypes) &&
        matchesSelected(record.domain, selectedDomains) &&
        matchesSelected(record.timeTag, selectedTimes) &&
        matchesSearch(searchQuery, record.interactionTopic, record.domain, record.topReferencedSources, record.contentType)
      )
    })
  }, [searchQuery, selectedAnalyticsTypes, selectedContentTypes, selectedDomains, selectedStatuses, selectedTimes])

  const filteredTrendingTopics = useMemo(() => {
    return trendingTopics.filter((topic) => {
      return matchesSelected(topic.domain, selectedDomains) && matchesSelected(topic.timeTag, selectedTimes) && matchesSearch(searchQuery, topic.topic, topic.domain, topic.summary)
    })
  }, [searchQuery, selectedDomains, selectedTimes])

  const sortedInsights = useMemo(() => {
    return sortByKey(filteredInsights, insightSort as SortState<string>, (record, key) => record[key as keyof InsightRecord] as string | number)
  }, [filteredInsights, insightSort])

  const sortedUsageRecords = useMemo(() => {
    return sortByKey(filteredUsageRecords, usageSort as SortState<string>, (record, key) => record[key as keyof UsageRecord] as string | number)
  }, [filteredUsageRecords, usageSort])

  const sortedGapRecords = useMemo(() => {
    return sortByKey(filteredGapRecords, gapSort as SortState<string>, (record, key) => {
      if (key === 'relatedFailedQueries') {
        return record.relatedFailedQueries.length
      }
      return record[key as keyof GapRecord] as string | number
    })
  }, [filteredGapRecords, gapSort])

  const sortedAiRecords = useMemo(() => {
    return sortByKey(filteredAiRecords, aiSort as SortState<string>, (record, key) => {
      if (key === 'topReferencedSources') {
        return record.topReferencedSources.length
      }
      return record[key as keyof AiInteractionRecord] as string | number
    })
  }, [filteredAiRecords, aiSort])

  const totalKnowledgeViews = filteredUsageRecords.reduce((sum, record) => sum + record.totalViews, 0)
  const averageSearchSuccessRate = filteredInsights.length
    ? Math.round(filteredInsights.reduce((sum, record) => sum + record.searchPerformance, 0) / filteredInsights.length)
    : 0
  const openKnowledgeGaps = filteredGapRecords.filter((record) => record.gapSeverity === 'Critical' || record.status === 'Unanswered' || record.status === 'Needs Attention').length
  const risingTopicsCount = filteredTrendingTopics.filter((topic) => topic.status === 'Rising').length
  const aiAssistedSessions = filteredAiRecords.reduce((sum, record) => sum + record.questionVolume, 0)
  const mostReferencedKnowledgeAssets = [...filteredAiRecords]
    .sort((left, right) => right.questionVolume - left.questionVolume)
    .slice(0, 1)
    .map((record) => record.topReferencedSources[0] ?? 'No referenced source')
    .join('')

  const workspaceMenu: WorkspaceMenuItem[] = [
    {
      key: 'overview',
      label: 'Overview',
      description: 'Executive command view across knowledge demand, discoverability, and AI-assisted interaction.',
      count: filteredInsights.length + filteredGapRecords.length,
      icon: LayoutDashboard,
    },
    {
      key: 'dashboard',
      label: 'Knowledge Insights Dashboard',
      description: 'Cross-metric leaderboard for usage, search success, knowledge gaps, and AI references.',
      count: filteredInsights.length,
      icon: LineChart,
    },
    {
      key: 'usage',
      label: 'Usage Analytics',
      description: 'Content consumption, engagement patterns, and underused asset visibility.',
      count: filteredUsageRecords.length,
      icon: BarChart3,
    },
    {
      key: 'gap',
      label: 'Knowledge Gap Analyzer',
      description: 'Demand-supply gaps, unanswered searches, and content creation signals.',
      count: filteredGapRecords.length,
      icon: AlertTriangle,
    },
    {
      key: 'ai',
      label: 'AI Interaction Metrics',
      description: 'AI adoption, citation quality, and explainable knowledge interaction performance.',
      count: filteredAiRecords.length,
      icon: Bot,
    },
  ]

  const kpiCards: KpiCard[] = [
    {
      label: 'Knowledge Views This Month',
      metric: formatNumber(totalKnowledgeViews),
      description: 'Measured enterprise access volume across governed knowledge assets and operational content journeys.',
      trend: '+11.8% versus previous month',
      icon: Eye,
      targetSection: 'usage',
      tone: 'sage',
    },
    {
      label: 'Search Success Rate',
      metric: formatPercent(averageSearchSuccessRate),
      description: 'Discoverability effectiveness based on search-to-click behavior, refinements, and zero-result suppression.',
      trend: 'Zero-result cluster reduced by 21%',
      icon: Search,
      targetSection: 'overview',
      tone: 'teal',
    },
    {
      label: 'Knowledge Gaps Open',
      metric: formatNumber(openKnowledgeGaps),
      description: 'Open demand signals where enterprise knowledge coverage remains weak, missing, or operationally fragile.',
      trend: '3 critical gaps require steward action',
      icon: AlertTriangle,
      targetSection: 'gap',
      tone: 'critical',
    },
    {
      label: 'Trending Topics Detected',
      metric: formatNumber(risingTopicsCount),
      description: 'Rising and recurring topics that indicate where knowledge demand is accelerating and prioritization should shift.',
      trend: 'Collections and fraud topics leading',
      icon: TrendingUp,
      targetSection: 'dashboard',
      tone: 'warning',
    },
    {
      label: 'AI-assisted Sessions',
      metric: formatNumber(aiAssistedSessions),
      description: 'Grounded AI question activity, summary generation, and synthesis usage across enterprise knowledge journeys.',
      trend: '+14.3% month over month',
      icon: Bot,
      targetSection: 'ai',
      tone: 'teal',
    },
    {
      label: 'Most Referenced Knowledge Asset',
      metric: 'Top 1',
      description: mostReferencedKnowledgeAssets || 'Reference activity updates after AI session refresh.',
      trend: 'Dominant reference in explainable AI responses',
      icon: BookOpen,
      targetSection: 'dashboard',
      tone: 'neutral',
    },
  ]

  const openDrawer = (drawer: DetailDrawerState) => {
    setDetailDrawer(drawer)
  }

  const resetFilters = () => {
    setSearchQuery('')
    setSelectedStatuses([...statusOptions])
    setSelectedAnalyticsTypes([...analyticsTypeOptions])
    setSelectedContentTypes([...contentTypeOptions])
    setSelectedDomains([...domainOptions])
    setSelectedTimes([...timeOptions])
  }

  return (
    <div className="space-y-6 pb-10">
      <Breadcrumb
        items={[
          { label: 'Enterprise Knowledge Management', href: '/' },
          { label: 'Knowledge Analytics & Insights' },
        ]}
      />

      <section className="overflow-hidden rounded-[30px] border border-slate-200/80 bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.14),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(37,99,235,0.08),_transparent_26%),linear-gradient(145deg,rgba(248,250,252,0.98),rgba(255,255,255,0.94))] shadow-[0_26px_80px_rgba(15,23,42,0.08)]">
        <div className="border-b border-slate-200/70 px-6 py-6">
          <PageHeader
            title="Knowledge Analytics & Insights"
            description="Strategic enterprise knowledge intelligence workspace for measuring usage behavior, search effectiveness, knowledge demand, content usefulness, discoverability gaps, and AI-assisted knowledge interaction performance across SALVIA."
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
                  onClick={() => setExportMessage(`Knowledge analytics export prepared for ${workspaceMenu.find((item) => item.key === activeSection)?.label ?? 'Overview'} at 09:30 local time.`)}
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
              Enterprise knowledge intelligence layer
            </Badge>
            <Badge className="rounded-full border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700">
              Search success transparency
            </Badge>
            <Badge className="rounded-full border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700">
              Explainable AI usage observability
            </Badge>
          </div>

          {exportMessage ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 text-xs text-slate-600">
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
                    'group relative overflow-hidden rounded-[26px] border p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(15,23,42,0.08)]',
                    kpiToneClass(card.tone),
                  )}
                >
                  <div className="absolute right-4 top-4 rounded-2xl bg-white/80 p-3 shadow-sm">
                    <Icon className="h-5 w-5 text-slate-700" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{card.label}</p>
                  <p className="mt-4 text-3xl font-semibold text-slate-950">{card.metric}</p>
                  <p className="mt-2 max-w-[19rem] text-sm leading-6 text-slate-600">{card.description}</p>
                  <p className="mt-4 text-xs font-medium text-slate-500">{card.trend}</p>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {showFilters ? (
        <section className="glass-card rounded-[26px] border border-white/40 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search knowledge asset title, topic, domain, search query, AI conversation topic, owner, content type, gap category, trend keyword, or metric name"
                className="h-10 rounded-xl border-slate-200 bg-white pl-9 text-sm"
              />
            </div>
            <div className="flex items-start justify-end gap-2">
              <Button variant="outline" className="h-10 rounded-xl border-slate-200 bg-white px-3 text-slate-700" onClick={resetFilters}>
                Reset filters
              </Button>
            </div>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            <FilterChipGroup
              label="Status"
              options={statusOptions}
              selected={selectedStatuses}
              onSelectAll={() => setSelectedStatuses([...statusOptions])}
              onToggle={(value) => setSelectedStatuses(toggleSelection(selectedStatuses, value, statusOptions))}
            />
            <FilterChipGroup
              label="Analytics Type"
              options={analyticsTypeOptions}
              selected={selectedAnalyticsTypes}
              onSelectAll={() => setSelectedAnalyticsTypes([...analyticsTypeOptions])}
              onToggle={(value) => setSelectedAnalyticsTypes(toggleSelection(selectedAnalyticsTypes, value, analyticsTypeOptions))}
            />
            <FilterChipGroup
              label="Content Type"
              options={contentTypeOptions}
              selected={selectedContentTypes}
              onSelectAll={() => setSelectedContentTypes([...contentTypeOptions])}
              onToggle={(value) => setSelectedContentTypes(toggleSelection(selectedContentTypes, value, contentTypeOptions))}
            />
            <FilterChipGroup
              label="Domain"
              options={domainOptions}
              selected={selectedDomains}
              onSelectAll={() => setSelectedDomains([...domainOptions])}
              onToggle={(value) => setSelectedDomains(toggleSelection(selectedDomains, value, domainOptions))}
            />
            <div className="xl:col-span-2">
              <FilterChipGroup
                label="Time"
                options={timeOptions}
                selected={selectedTimes}
                onSelectAll={() => setSelectedTimes([...timeOptions])}
                onToggle={(value) => setSelectedTimes(toggleSelection(selectedTimes, value, timeOptions))}
              />
            </div>
          </div>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-24 xl:self-start">
          <section className="rounded-[28px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,250,252,0.94))] p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <div className="mb-4 px-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Workspace Navigator</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Move through strategic intelligence views without leaving the analytics workspace.</p>
            </div>

            <div className="space-y-2">
              {workspaceMenu.map((item) => {
                const Icon = item.icon
                const isActive = item.key === activeSection
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveSection(item.key)}
                    className={cn(
                      'w-full rounded-2xl border p-3 text-left transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50/60',
                      isActive ? 'border-emerald-300 bg-emerald-50/80 shadow-sm' : 'border-slate-200 bg-white/90',
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn('rounded-2xl p-2.5', isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600')}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                          <Badge className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', isActive ? 'border-emerald-200 bg-white text-emerald-700' : 'border-slate-200 bg-slate-100 text-slate-600')}>
                            {item.count}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs leading-5 text-slate-500">{item.description}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        </aside>

        <main className="space-y-6">
          <section className="rounded-[28px] border border-slate-200/80 bg-white/92 px-5 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Current Workspace</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">{workspaceMenu.find((item) => item.key === activeSection)?.label}</h2>
                <p className="mt-1 text-sm text-slate-600">{workspaceMenu.find((item) => item.key === activeSection)?.description}</p>
              </div>
              <div className="hidden rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right md:block">
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Insight Coverage</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{formatNumber(filteredInsights.length + filteredUsageRecords.length + filteredGapRecords.length + filteredAiRecords.length)}</p>
                <p className="text-xs text-slate-500">Filtered signals in current view</p>
              </div>
            </div>
          </section>

          {activeSection === 'overview' ? (
            <div className="space-y-6">
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]">
                <SectionCard title="Knowledge Usage Trend" description="Measured consumption momentum across enterprise knowledge assets, with repeat-access visibility for high-value operational knowledge.">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={usageTrendSeries}>
                        <defs>
                          <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0f766e" stopOpacity={0.28} />
                            <stop offset="95%" stopColor="#0f766e" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="period" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip formatter={(value) => formatTooltipValue(value)} />
                        <Area type="monotone" dataKey="views" stroke="#0f766e" strokeWidth={2.5} fill="url(#usageGradient)" />
                        <Line type="monotone" dataKey="repeatAccess" stroke="#2f6f93" strokeWidth={2} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </SectionCard>

                <SectionCard title="Search Success Snapshot" description="Operational view of discoverability quality, low-click patterns, and time-to-first-result friction.">
                  <div className="grid gap-3">
                    <MetricCallout label="Search success" value={`${averageSearchSuccessRate}%`} detail="Users are successfully reaching useful knowledge destinations in the current cycle." tone="positive" />
                    <MetricCallout label="Zero-result queries" value="19" detail="Most zero-result pressure is concentrated in collections exceptions and compliance scenario wording." tone="critical" />
                    <MetricCallout label="Refinement rate" value="28%" detail="Searchers still refine complex queries, indicating opportunities to improve metadata, synonyms, and result ranking." tone="warning" />
                  </div>
                </SectionCard>
              </div>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                <SectionCard title="Knowledge Gap Summary" description="Open discoverability gaps and low-coverage demand signals that need content investment or metadata intervention.">
                  <div className="grid gap-3 md:grid-cols-2">
                    {filteredGapRecords.slice(0, 4).map((record) => (
                      <button
                        key={record.id}
                        type="button"
                        onClick={() =>
                          openDrawer({
                            title: record.gapTopic,
                            subtitle: `${record.domain} gap analysis`,
                            tone: record.gapSeverity === 'Critical' ? 'critical' : 'warning',
                            metrics: [
                              { label: 'Demand frequency', value: `${record.demandFrequency}` },
                              { label: 'Coverage', value: `${record.existingContentCoverage}%` },
                              { label: 'Severity', value: record.gapSeverity },
                            ],
                            bullets: record.relatedFailedQueries,
                            actions: ['Open Gap Detail', 'View Failed Query Cluster', 'Assign Content Owner', 'Create Knowledge Request'],
                          })
                        }
                        className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-left transition-all hover:border-amber-200 hover:bg-amber-50/60"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <Badge className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-semibold', statusBadgeClass(record.status))}>{record.status}</Badge>
                          <span className="text-xs text-slate-500">{record.lastDetectedDate}</span>
                        </div>
                        <p className="mt-3 text-sm font-semibold text-slate-900">{record.gapTopic}</p>
                        <p className="mt-2 text-xs leading-5 text-slate-600">{record.recommendedAction}</p>
                      </button>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard title="Trending Topics" description="Demand visibility across domains, with momentum signals to guide content prioritization and optimization decisions.">
                  <div className="space-y-3">
                    {filteredTrendingTopics.length === 0 ? (
                      <EmptyState label="No trending topics match the current filter set." />
                    ) : (
                      filteredTrendingTopics.map((topic) => (
                        <button
                          key={topic.id}
                          type="button"
                          onClick={() =>
                            openDrawer({
                              title: topic.topic,
                              subtitle: `${topic.domain} trend analysis`,
                              tone: topic.status === 'Rising' ? 'positive' : 'warning',
                              metrics: [
                                { label: 'Momentum', value: topic.momentum },
                                { label: 'Search demand', value: `${topic.searchDemand}` },
                                { label: 'AI lift', value: topic.aiLift },
                              ],
                              bullets: [topic.summary],
                              actions: ['Open Trend Analysis', 'Inspect Search Behavior', 'View AI Reference Activity'],
                            })
                          }
                          className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-left transition-all hover:border-teal-200 hover:bg-teal-50/60"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-slate-900">{topic.topic}</p>
                            <Badge className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-semibold', topic.status === 'Rising' ? 'border-teal-200 bg-teal-50 text-teal-700' : 'border-amber-200 bg-amber-50 text-amber-700')}>{topic.status}</Badge>
                          </div>
                          <p className="mt-2 text-xs text-slate-500">{topic.domain}</p>
                          <p className="mt-2 text-xs leading-5 text-slate-600">{topic.summary}</p>
                        </button>
                      ))
                    )}
                  </div>
                </SectionCard>
              </div>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                <SectionCard title="AI Usage Activity" description="Conversation volume, citation-backed answers, and summary generation posture for the AI knowledge assistant.">
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={aiUsageTrendSeries}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="period" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip formatter={(value) => formatTooltipValue(value)} />
                        <Bar dataKey="sessions" radius={[8, 8, 0, 0]} fill="#0f766e" />
                        <Line type="monotone" dataKey="citationCoverage" stroke="#d97706" strokeWidth={2.5} dot={{ r: 3 }} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </SectionCard>

                <SectionCard title="Recent Insight Activity" description="Latest operational analytics events requiring review, follow-up, or prioritization.">
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex gap-3">
                        <div className={cn('mt-1 h-2.5 w-2.5 rounded-full', activity.tone === 'positive' ? 'bg-emerald-500' : activity.tone === 'warning' ? 'bg-amber-500' : activity.tone === 'critical' ? 'bg-rose-500' : 'bg-slate-400')} />
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{activity.title}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-600">{activity.detail}</p>
                          <p className="mt-1 text-[11px] text-slate-500">{activity.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </div>
            </div>
          ) : null}

          {activeSection === 'dashboard' ? (
            <div className="space-y-6">
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                <SectionCard title="Knowledge Performance Leaderboard" description="Cross-platform intelligence ranking combining usage lift, search effectiveness, gap exposure, and AI reference adoption.">
                  {sortedInsights.length === 0 ? (
                    <EmptyState label="No insight records match the current filter set." />
                  ) : (
                    <div className="overflow-hidden rounded-2xl border border-slate-200">
                      <div className="grid grid-cols-[2.2fr_repeat(5,minmax(0,1fr))_1.2fr] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
                        <SortableHeader label="Knowledge Asset or Topic" sortKey={'knowledgeAsset'} sortState={insightSort} onSort={(key) => setInsightSort(nextSortState(insightSort, key))} />
                        <SortableHeader label="Usage Trend" sortKey={'usageTrend'} sortState={insightSort} onSort={(key) => setInsightSort(nextSortState(insightSort, key))} />
                        <SortableHeader label="Search Performance" sortKey={'searchPerformance'} sortState={insightSort} onSort={(key) => setInsightSort(nextSortState(insightSort, key))} />
                        <SortableHeader label="Trend Score" sortKey={'trendScore'} sortState={insightSort} onSort={(key) => setInsightSort(nextSortState(insightSort, key))} />
                        <SortableHeader label="AI Ref Count" sortKey={'aiReferenceCount'} sortState={insightSort} onSort={(key) => setInsightSort(nextSortState(insightSort, key))} />
                        <SortableHeader label="Domain" sortKey={'domain'} sortState={insightSort} onSort={(key) => setInsightSort(nextSortState(insightSort, key))} />
                        <div className="text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Actions</div>
                      </div>

                      <div className="divide-y divide-slate-200 bg-white">
                        {sortedInsights.map((record) => (
                          <div key={record.id} className="grid grid-cols-[2.2fr_repeat(5,minmax(0,1fr))_1.2fr] gap-3 px-4 py-4 transition-colors hover:bg-slate-50/70">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{record.knowledgeAsset}</p>
                              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                <Badge className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-semibold', statusBadgeClass(record.status))}>{record.status}</Badge>
                                <span>{record.owner}</span>
                                <span>{record.lastAnalyzed}</span>
                              </div>
                            </div>
                            <div className="text-sm font-semibold text-slate-700">{record.usageTrend > 0 ? '+' : ''}{record.usageTrend}%</div>
                            <div className="text-sm font-semibold text-slate-700">{record.searchPerformance}%</div>
                            <div className="text-sm font-semibold text-slate-700">{record.trendScore}</div>
                            <div className="text-sm font-semibold text-slate-700">{formatNumber(record.aiReferenceCount)}</div>
                            <div className="text-sm text-slate-600">{record.domain}</div>
                            <div className="flex justify-end">
                              <Button
                                variant="ghost"
                                className="h-8 rounded-lg px-2 text-xs text-slate-700"
                                onClick={() =>
                                  openDrawer({
                                    title: record.knowledgeAsset,
                                    subtitle: `${record.analyticsType} insight detail`,
                                    tone: record.status === 'Critical' || record.status === 'Unanswered' ? 'critical' : record.status === 'Warning' || record.status === 'Needs Attention' ? 'warning' : 'positive',
                                    metrics: [
                                      { label: 'Usage trend', value: `${record.usageTrend > 0 ? '+' : ''}${record.usageTrend}%` },
                                      { label: 'Search performance', value: `${record.searchPerformance}%` },
                                      { label: 'Trend score', value: `${record.trendScore}` },
                                      { label: 'AI references', value: `${record.aiReferenceCount}` },
                                    ],
                                    bullets: [record.gapIndicator, `Owned by ${record.owner}`, `Last analyzed ${record.lastAnalyzed}`],
                                    actions: ['Open Insight Detail', 'View Knowledge Asset', 'Open Trend Analysis', 'Inspect Search Behavior', 'View AI Reference Activity', 'Export Insight Record'],
                                  })
                                }
                              >
                                Open detail
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </SectionCard>

                <div className="space-y-6">
                  <SectionCard title="Domain Summary" description="High-level directional view for the domains driving usage, search traction, and AI-backed knowledge relevance.">
                    <div className="grid gap-3">
                      {domainUsageSeries.filter((entry) => selectedDomains.includes(entry.domain as Domain)).map((entry) => (
                        <div key={entry.domain} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-slate-900">{entry.domain}</p>
                            <span className="text-xs text-slate-500">{formatNumber(entry.views)} views</span>
                          </div>
                          <div className="mt-3 h-2 rounded-full bg-slate-200">
                            <div className="h-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500" style={{ width: `${Math.min(entry.views / 40, 100)}%` }} />
                          </div>
                          <p className="mt-2 text-xs text-slate-500">{entry.underused} underused assets flagged for optimization review.</p>
                        </div>
                      ))}
                    </div>
                  </SectionCard>

                  <SectionCard title="Time-based Trend Comparison" description="Current-versus-prior directional comparison for demand, search quality, and AI-backed knowledge activation.">
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsLineChart data={searchPerformanceSeries}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                          <XAxis dataKey="period" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                          <Tooltip />
                          <Line type="monotone" dataKey="successRate" stroke="#0f766e" strokeWidth={2.5} dot={{ r: 3 }} />
                          <Line type="monotone" dataKey="zeroResults" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </div>
                  </SectionCard>
                </div>
              </div>
            </div>
          ) : null}

          {activeSection === 'usage' ? (
            <div className="space-y-6">
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                <SectionCard title="Usage Analytics Table" description="Consumption evidence across knowledge assets, with repeat-access visibility, engagement depth, and owner accountability.">
                  {sortedUsageRecords.length === 0 ? (
                    <EmptyState label="No usage records match the current filter set." />
                  ) : (
                    <div className="overflow-hidden rounded-2xl border border-slate-200">
                      <div className="grid grid-cols-[2fr_repeat(6,minmax(0,0.8fr))_1fr] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
                        <SortableHeader label="Asset Title" sortKey={'assetTitle'} sortState={usageSort} onSort={(key) => setUsageSort(nextSortState(usageSort, key))} />
                        <SortableHeader label="Views" sortKey={'totalViews'} sortState={usageSort} onSort={(key) => setUsageSort(nextSortState(usageSort, key))} />
                        <SortableHeader label="Unique Users" sortKey={'uniqueUsers'} sortState={usageSort} onSort={(key) => setUsageSort(nextSortState(usageSort, key))} />
                        <SortableHeader label="Repeat Views" sortKey={'repeatViews'} sortState={usageSort} onSort={(key) => setUsageSort(nextSortState(usageSort, key))} />
                        <SortableHeader label="Avg Time" sortKey={'averageTimeEngaged'} sortState={usageSort} onSort={(key) => setUsageSort(nextSortState(usageSort, key))} />
                        <SortableHeader label="Domain" sortKey={'domain'} sortState={usageSort} onSort={(key) => setUsageSort(nextSortState(usageSort, key))} />
                        <SortableHeader label="Last Accessed" sortKey={'lastAccessedDate'} sortState={usageSort} onSort={(key) => setUsageSort(nextSortState(usageSort, key))} />
                        <div className="text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Actions</div>
                      </div>

                      <div className="divide-y divide-slate-200 bg-white">
                        {sortedUsageRecords.map((record) => (
                          <div key={record.id} className="grid grid-cols-[2fr_repeat(6,minmax(0,0.8fr))_1fr] gap-3 px-4 py-4 transition-colors hover:bg-slate-50/70">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{record.assetTitle}</p>
                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <Badge className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-semibold', popularityBadgeClass(record.popularityStatus))}>{record.popularityStatus}</Badge>
                                <span className="text-xs text-slate-500">{record.owner}</span>
                              </div>
                            </div>
                            <div className="text-sm font-semibold text-slate-700">{formatNumber(record.totalViews)}</div>
                            <div className="text-sm font-semibold text-slate-700">{formatNumber(record.uniqueUsers)}</div>
                            <div className="text-sm font-semibold text-slate-700">{formatNumber(record.repeatViews)}</div>
                            <div className="text-sm text-slate-600">{formatDuration(record.averageTimeEngaged)}</div>
                            <div className="text-sm text-slate-600">{record.domain}</div>
                            <div className="text-sm text-slate-600">{record.lastAccessedDate}</div>
                            <div className="flex justify-end">
                              <Button
                                variant="ghost"
                                className="h-8 rounded-lg px-2 text-xs text-slate-700"
                                onClick={() =>
                                  openDrawer({
                                    title: record.assetTitle,
                                    subtitle: `${record.domain} usage detail`,
                                    tone: record.popularityStatus === 'Underused' ? 'warning' : 'positive',
                                    metrics: [
                                      { label: 'Total views', value: `${record.totalViews}` },
                                      { label: 'Unique users', value: `${record.uniqueUsers}` },
                                      { label: 'Repeat views', value: `${record.repeatViews}` },
                                      { label: 'Average engagement', value: formatDuration(record.averageTimeEngaged) },
                                    ],
                                    bullets: [`Owner: ${record.owner}`, `Content type: ${record.contentType}`, `Last accessed: ${record.lastAccessedDate}`],
                                    actions: ['Open Usage Detail', 'View Asset', 'Compare Usage Trend', 'Inspect Audience Pattern', 'Open Related Topic', 'Export Usage Data'],
                                  })
                                }
                              >
                                Open detail
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </SectionCard>

                <div className="space-y-6">
                  <SectionCard title="Most Accessed Content" description="Assets with the strongest sustained usage and repeat-access behavior across the knowledge estate.">
                    <div className="space-y-3">
                      {sortedUsageRecords.slice(0, 3).map((record) => (
                        <div key={record.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                          <p className="text-sm font-semibold text-slate-900">{record.assetTitle}</p>
                          <p className="mt-1 text-xs text-slate-500">{record.domain} • {record.contentType}</p>
                          <div className="mt-3 grid grid-cols-3 gap-3 text-xs text-slate-600">
                            <div>
                              <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Views</p>
                              <p className="mt-1 text-sm font-semibold text-slate-900">{formatNumber(record.totalViews)}</p>
                            </div>
                            <div>
                              <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Users</p>
                              <p className="mt-1 text-sm font-semibold text-slate-900">{formatNumber(record.uniqueUsers)}</p>
                            </div>
                            <div>
                              <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Repeat</p>
                              <p className="mt-1 text-sm font-semibold text-slate-900">{formatNumber(record.repeatViews)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </SectionCard>

                  <SectionCard title="Underused Content Panel" description="Assets with weak adoption, low repeat engagement, or declining demand that need optimization or retirement review.">
                    <div className="space-y-3">
                      {sortedUsageRecords.filter((record) => record.popularityStatus === 'Underused').length === 0 ? (
                        <EmptyState label="No underused assets match the current filter set." />
                      ) : (
                        sortedUsageRecords
                          .filter((record) => record.popularityStatus === 'Underused')
                          .map((record) => (
                            <div key={record.id} className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-semibold text-slate-900">{record.assetTitle}</p>
                                <Badge className="rounded-full border-amber-200 bg-white px-2.5 py-0.5 text-[10px] font-semibold text-amber-700">Needs attention</Badge>
                              </div>
                              <p className="mt-2 text-xs leading-5 text-slate-600">Low repeat-access and muted search capture indicate this asset may need repositioning, stronger metadata, or controlled deprecation review.</p>
                            </div>
                          ))
                      )}
                    </div>
                  </SectionCard>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                <SectionCard title="Engagement Trend" description="User attention and repeat-access movement over time for enterprise knowledge consumption.">
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={usageTrendSeries}>
                        <defs>
                          <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2f6f93" stopOpacity={0.28} />
                            <stop offset="95%" stopColor="#2f6f93" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="period" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip formatter={(value) => formatTooltipValue(value)} />
                        <Area type="monotone" dataKey="uniqueUsers" stroke="#2f6f93" strokeWidth={2.5} fill="url(#engagementGradient)" />
                        <Line type="monotone" dataKey="repeatAccess" stroke="#0f766e" strokeWidth={2} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </SectionCard>

                <SectionCard title="Domain Usage Comparison" description="Usage distribution by domain with visibility into where optimization pressure is strongest.">
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={domainUsageSeries.filter((entry) => selectedDomains.includes(entry.domain as Domain))} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                        <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="domain" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
                        <Tooltip formatter={(value) => formatTooltipValue(value)} />
                        <Bar dataKey="views" radius={[0, 8, 8, 0]} fill="#0f766e" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </SectionCard>
              </div>
            </div>
          ) : null}

          {activeSection === 'gap' ? (
            <div className="space-y-6">
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                <SectionCard title="Knowledge Gap Table" description="Demand themes with weak support, repeated failed queries, and recommended actions for knowledge investment.">
                  {sortedGapRecords.length === 0 ? (
                    <EmptyState label="No gap records match the current filter set." />
                  ) : (
                    <div className="overflow-hidden rounded-2xl border border-slate-200">
                      <div className="grid grid-cols-[2fr_repeat(5,minmax(0,0.9fr))_1.1fr] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
                        <SortableHeader label="Gap Topic" sortKey={'gapTopic'} sortState={gapSort} onSort={(key) => setGapSort(nextSortState(gapSort, key))} />
                        <SortableHeader label="Severity" sortKey={'gapSeverity'} sortState={gapSort} onSort={(key) => setGapSort(nextSortState(gapSort, key))} />
                        <SortableHeader label="Demand" sortKey={'demandFrequency'} sortState={gapSort} onSort={(key) => setGapSort(nextSortState(gapSort, key))} />
                        <SortableHeader label="Coverage" sortKey={'existingContentCoverage'} sortState={gapSort} onSort={(key) => setGapSort(nextSortState(gapSort, key))} />
                        <SortableHeader label="Domain" sortKey={'domain'} sortState={gapSort} onSort={(key) => setGapSort(nextSortState(gapSort, key))} />
                        <SortableHeader label="Last Detected" sortKey={'lastDetectedDate'} sortState={gapSort} onSort={(key) => setGapSort(nextSortState(gapSort, key))} />
                        <div className="text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Actions</div>
                      </div>
                      <div className="divide-y divide-slate-200 bg-white">
                        {sortedGapRecords.map((record) => (
                          <div key={record.id} className="grid grid-cols-[2fr_repeat(5,minmax(0,0.9fr))_1.1fr] gap-3 px-4 py-4 transition-colors hover:bg-slate-50/70">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{record.gapTopic}</p>
                              <p className="mt-2 text-xs leading-5 text-slate-500">{record.relatedFailedQueries.slice(0, 2).join(' • ')}</p>
                            </div>
                            <div>
                              <Badge className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-semibold', record.gapSeverity === 'Critical' ? 'border-rose-200 bg-rose-50 text-rose-700' : record.gapSeverity === 'Warning' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-orange-200 bg-orange-50 text-orange-700')}>
                                {record.gapSeverity}
                              </Badge>
                            </div>
                            <div className="text-sm font-semibold text-slate-700">{record.demandFrequency}</div>
                            <div className="text-sm font-semibold text-slate-700">{record.existingContentCoverage}%</div>
                            <div className="text-sm text-slate-600">{record.domain}</div>
                            <div className="text-sm text-slate-600">{record.lastDetectedDate}</div>
                            <div className="flex justify-end">
                              <Button
                                variant="ghost"
                                className="h-8 rounded-lg px-2 text-xs text-slate-700"
                                onClick={() =>
                                  openDrawer({
                                    title: record.gapTopic,
                                    subtitle: `${record.domain} knowledge gap detail`,
                                    tone: record.gapSeverity === 'Critical' ? 'critical' : 'warning',
                                    metrics: [
                                      { label: 'Demand frequency', value: `${record.demandFrequency}` },
                                      { label: 'Coverage', value: `${record.existingContentCoverage}%` },
                                      { label: 'Owner', value: record.owner },
                                    ],
                                    bullets: [...record.relatedFailedQueries, record.recommendedAction],
                                    actions: ['Open Gap Detail', 'View Failed Query Cluster', 'Assign Content Owner', 'Create Knowledge Request', 'Mark Gap as Reviewed', 'Export Gap Analysis'],
                                  })
                                }
                              >
                                Open detail
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </SectionCard>

                <div className="space-y-6">
                  <SectionCard title="Unanswered Search Clusters" description="High-friction demand themes where search is repeatedly failing to surface actionable knowledge.">
                    <div className="space-y-3">
                      {sortedGapRecords.slice(0, 3).map((record) => (
                        <div key={record.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-slate-900">{record.gapTopic}</p>
                            <span className="text-xs text-slate-500">{record.demandFrequency} searches</span>
                          </div>
                          <p className="mt-2 text-xs leading-5 text-slate-600">{record.relatedFailedQueries.join(', ')}</p>
                        </div>
                      ))}
                    </div>
                  </SectionCard>

                  <SectionCard title="Recommended Content Creation" description="Signals that convert unresolved demand into content backlog, steward assignments, or AI grounding improvements.">
                    <div className="space-y-3">
                      {sortedGapRecords.map((record) => (
                        <div key={record.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                          <p className="text-sm font-semibold text-slate-900">{record.domain}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-600">{record.recommendedAction}</p>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                <SectionCard title="Topic Deficiency Trend" description="Severity trajectory for open knowledge gaps, showing whether coverage is improving or still lagging behind demand.">
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={gapTrendSeries}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Bar dataKey="critical" stackId="gap" fill="#dc2626" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="warning" stackId="gap" fill="#d97706" radius={[6, 6, 0, 0]} />
                        <Line type="monotone" dataKey="resolved" stroke="#0f766e" strokeWidth={2.5} dot={{ r: 3 }} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </SectionCard>

                <SectionCard title="High-demand Low-coverage Matrix" description="Quadrant-style prioritization surface showing where content demand materially exceeds available knowledge support.">
                  <div className="grid grid-cols-2 gap-3">
                    {sortedGapRecords.map((record) => (
                      <div key={record.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{record.domain}</p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">{record.gapTopic}</p>
                        <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                          <span>Demand {record.demandFrequency}</span>
                          <span>Coverage {record.existingContentCoverage}%</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-slate-200">
                          <div className={cn('h-2 rounded-full', record.gapSeverity === 'Critical' ? 'bg-rose-500' : 'bg-amber-500')} style={{ width: `${Math.max(10, 100 - record.existingContentCoverage)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </div>
            </div>
          ) : null}

          {activeSection === 'ai' ? (
            <div className="space-y-6">
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                <SectionCard title="AI Interaction Metrics Table" description="Explainable operational view of AI question demand, answer success, citation grounding, and multi-document synthesis behavior.">
                  {sortedAiRecords.length === 0 ? (
                    <EmptyState label="No AI interaction records match the current filter set." />
                  ) : (
                    <div className="overflow-hidden rounded-2xl border border-slate-200">
                      <div className="grid grid-cols-[2fr_repeat(5,minmax(0,0.85fr))_1.1fr] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
                        <SortableHeader label="Interaction Topic" sortKey={'interactionTopic'} sortState={aiSort} onSort={(key) => setAiSort(nextSortState(aiSort, key))} />
                        <SortableHeader label="Question Volume" sortKey={'questionVolume'} sortState={aiSort} onSort={(key) => setAiSort(nextSortState(aiSort, key))} />
                        <SortableHeader label="Answer Success" sortKey={'answerSuccessRate'} sortState={aiSort} onSort={(key) => setAiSort(nextSortState(aiSort, key))} />
                        <SortableHeader label="Citation Coverage" sortKey={'citationCoverage'} sortState={aiSort} onSort={(key) => setAiSort(nextSortState(aiSort, key))} />
                        <SortableHeader label="Summaries" sortKey={'summaryGenerationCount'} sortState={aiSort} onSort={(key) => setAiSort(nextSortState(aiSort, key))} />
                        <SortableHeader label="Domain" sortKey={'domain'} sortState={aiSort} onSort={(key) => setAiSort(nextSortState(aiSort, key))} />
                        <div className="text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Actions</div>
                      </div>
                      <div className="divide-y divide-slate-200 bg-white">
                        {sortedAiRecords.map((record) => (
                          <div key={record.id} className="grid grid-cols-[2fr_repeat(5,minmax(0,0.85fr))_1.1fr] gap-3 px-4 py-4 transition-colors hover:bg-slate-50/70">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{record.interactionTopic}</p>
                              <p className="mt-2 text-xs leading-5 text-slate-500">{record.topReferencedSources.join(' • ')}</p>
                            </div>
                            <div className="text-sm font-semibold text-slate-700">{formatNumber(record.questionVolume)}</div>
                            <div className="text-sm font-semibold text-slate-700">{record.answerSuccessRate}%</div>
                            <div className="text-sm font-semibold text-slate-700">{record.citationCoverage}%</div>
                            <div className="text-sm font-semibold text-slate-700">{formatNumber(record.summaryGenerationCount)}</div>
                            <div className="text-sm text-slate-600">{record.domain}</div>
                            <div className="flex justify-end">
                              <Button
                                variant="ghost"
                                className="h-8 rounded-lg px-2 text-xs text-slate-700"
                                onClick={() =>
                                  openDrawer({
                                    title: record.interactionTopic,
                                    subtitle: `${record.domain} AI interaction detail`,
                                    tone: record.answerSuccessRate < 80 || record.citationCoverage < 75 ? 'warning' : 'positive',
                                    metrics: [
                                      { label: 'Question volume', value: `${record.questionVolume}` },
                                      { label: 'Answer success', value: `${record.answerSuccessRate}%` },
                                      { label: 'Citation coverage', value: `${record.citationCoverage}%` },
                                      { label: 'Synthesis sessions', value: `${record.synthesisSessions}` },
                                    ],
                                    bullets: record.topReferencedSources,
                                    actions: ['Open AI Interaction Detail', 'Inspect Citation Coverage', 'View Referenced Sources', 'Compare Topic Demand', 'Open Related Conversation Pattern', 'Export AI Metrics'],
                                  })
                                }
                              >
                                Open detail
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </SectionCard>

                <div className="space-y-6">
                  <SectionCard title="Citation Coverage Summary" description="Reference quality posture across AI-assisted knowledge interactions.">
                    <div className="grid gap-3">
                      <MetricCallout label="Average citation coverage" value={`${filteredAiRecords.length ? Math.round(filteredAiRecords.reduce((sum, record) => sum + record.citationCoverage, 0) / filteredAiRecords.length) : 0}%`} detail="Grounded answer traceability remains strong across the highest-demand interaction themes." tone="positive" />
                      <MetricCallout label="Summary generation activity" value={formatNumber(filteredAiRecords.reduce((sum, record) => sum + record.summaryGenerationCount, 0))} detail="Summary generation is increasingly used as a decision-support shortcut for frontline and governance teams." tone="neutral" />
                      <MetricCallout label="Low-confidence AI themes" value={`${filteredAiRecords.filter((record) => record.answerSuccessRate < 80).length}`} detail="These topics need source refresh, better chunking, or improved citation alignment." tone="warning" />
                    </div>
                  </SectionCard>

                  <SectionCard title="Top Referenced Sources" description="Knowledge assets most frequently grounding AI-generated answers and multi-document synthesis flows.">
                    <div className="space-y-3">
                      {filteredAiRecords.flatMap((record) => record.topReferencedSources).slice(0, 4).map((source, index) => (
                        <div key={`${source}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                          <p className="text-sm font-semibold text-slate-900">{source}</p>
                          <p className="mt-1 text-xs text-slate-500">Referenced by active AI interaction patterns in the current analysis window.</p>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                <SectionCard title="AI Usage Trend" description="Conversation and explainable answer adoption trend across the knowledge assistant workspace.">
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={aiUsageTrendSeries}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="period" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip formatter={(value) => formatTooltipValue(value)} />
                        <Line type="monotone" dataKey="sessions" stroke="#0f766e" strokeWidth={2.5} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="summaries" stroke="#2f6f93" strokeWidth={2.2} dot={false} />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </SectionCard>

                <SectionCard title="AI Topic Demand Heatmap" description="Relative intensity of AI-assisted discovery, guidance, and summarization demand across business domains.">
                  <div className="space-y-3">
                    <div className="grid grid-cols-[1fr_repeat(3,90px)] gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      <span>Domain</span>
                      <span>Discovery</span>
                      <span>Guidance</span>
                      <span>Summary</span>
                    </div>
                    {aiTopicHeatmap.filter((entry) => selectedDomains.includes(entry.domain as Domain)).map((entry) => (
                      <div key={entry.domain} className="grid grid-cols-[1fr_repeat(3,90px)] items-center gap-2">
                        <span className="text-sm font-medium text-slate-700">{entry.domain}</span>
                        {[entry.discovery, entry.guidance, entry.summarization].map((value, index) => (
                          <div key={`${entry.domain}-${index}`} className="rounded-2xl px-3 py-3 text-center text-sm font-semibold text-slate-900" style={{ backgroundColor: `rgba(15,118,110,${Math.max(0.16, value / 130)})` }}>
                            {value}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </div>
            </div>
          ) : null}
        </main>
      </div>

      <DetailDrawer drawer={detailDrawer} onClose={() => setDetailDrawer(null)} />
    </div>
  )
}

function FilterChipGroup<T extends string>({
  label,
  options,
  selected,
  onSelectAll,
  onToggle,
}: {
  label: string
  options: readonly T[]
  selected: T[]
  onSelectAll: () => void
  onToggle: (value: T) => void
}) {
  const allSelected = selected.length === options.length

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onSelectAll}
          className={cn(
            'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
            allSelected ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-800',
          )}
        >
          All
        </button>
        {options.map((option) => {
          const active = selected.includes(option)
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                active ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-800',
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

function MetricCallout({
  label,
  value,
  detail,
  tone,
}: {
  label: string
  value: string
  detail: string
  tone: 'positive' | 'warning' | 'critical' | 'neutral'
}) {
  return (
    <div className={cn('rounded-2xl border p-4', toneBadgeClass(tone))}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="mt-2 text-xs leading-5 opacity-90">{detail}</p>
    </div>
  )
}

function DetailDrawer({ drawer, onClose }: { drawer: DetailDrawerState | null; onClose: () => void }) {
  if (!drawer) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/25 backdrop-blur-[1px]">
      <button type="button" className="flex-1 cursor-default" aria-label="Close drawer backdrop" onClick={onClose} />
      <aside className="h-full w-full max-w-[430px] overflow-y-auto border-l border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5">
          <div>
            <Badge className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-semibold', toneBadgeClass(drawer.tone))}>{drawer.subtitle}</Badge>
            <h3 className="mt-3 text-xl font-semibold text-slate-950">{drawer.title}</h3>
          </div>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-600" onClick={onClose} aria-label="Close detail drawer">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-6 px-5 py-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {drawer.metrics.map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{metric.label}</p>
                <p className="mt-2 text-xl font-semibold text-slate-950">{metric.value}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Evidence</p>
            <div className="mt-3 space-y-3">
              {drawer.bullets.map((bullet, index) => (
                <div key={`${bullet}-${index}`} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <ChevronRight className="mt-0.5 h-4 w-4 text-slate-400" />
                  <p className="text-sm leading-6 text-slate-600">{bullet}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Available Actions</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {drawer.actions.map((action) => (
                <button key={action} type="button" className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100">
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}