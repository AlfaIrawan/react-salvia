import { useMemo, useState } from 'react'
import {
  Activity,
  ArrowUpDown,
  BadgeCheck,
  Brain,
  ChartNoAxesCombined,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  FileSearch,
  Filter,
  FolderOpen,
  Lock,
  Mic,
  Search,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
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
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { PageHeader } from '@/components/layout/PageHeader'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type WorkspaceSection =
  | 'overview'
  | 'smart-search'
  | 'advanced-search'
  | 'insights-dashboard'
  | 'query-explorer'

type SortDirection = 'asc' | 'desc'

type ResultSortKey = 'title' | 'contentType' | 'domain' | 'status' | 'confidence' | 'updatedAt'
type QuerySortKey = 'phrase' | 'queryType' | 'executionCount' | 'resultCount' | 'ctr' | 'lastExecution'

interface NavItem {
  key: WorkspaceSection
  label: string
  description: string
  count?: number
  icon: React.ComponentType<{ className?: string }>
}

interface KpiCard {
  label: string
  metric: string
  description: string
  trend: string
  icon: React.ComponentType<{ className?: string }>
}

interface SearchResultItem {
  id: string
  title: string
  snippet: string
  contentType: 'Document' | 'Wiki Page' | 'Policy' | 'SOP' | 'PDF' | 'Image' | 'Video'
  domain: 'Customer' | 'Loan' | 'Collection' | 'Finance' | 'Risk' | 'Compliance' | 'Operations'
  owner: string
  language: 'English' | 'Indonesian' | 'Bilingual' | 'Other'
  status: 'Draft' | 'Approved' | 'Published' | 'Archived'
  searchType: 'Full-text' | 'Semantic' | 'Contextual'
  confidence: number
  relevanceReason: string
  updatedAt: string
  access: 'Accessible' | 'Restricted'
  topMatchedEntity: string
}

interface QueryExplorerItem {
  id: string
  phrase: string
  queryType: 'Keyword' | 'Semantic' | 'Contextual'
  executionCount: number
  resultCount: number
  topSelectedResult: string
  ctr: number
  semanticVsKeyword: string
  zeroResult: boolean
  relatedRefinement: string
  lastExecution: string
}

interface FilterOption<T extends string> {
  label: string
  value: T
}

const workspaceMenu: NavItem[] = [
  {
    key: 'overview',
    label: 'Overview',
    description: 'Discovery health, coverage, and usage posture',
    icon: Activity,
  },
  {
    key: 'smart-search',
    label: 'Smart Search Bar',
    description: 'Fast enterprise retrieval with semantic guidance',
    icon: FileSearch,
    count: 126,
  },
  {
    key: 'advanced-search',
    label: 'Advanced Search',
    description: 'Precision retrieval with faceted controls',
    icon: Filter,
    count: 42,
  },
  {
    key: 'insights-dashboard',
    label: 'Search Insights Dashboard',
    description: 'Behavior, performance, and optimization signals',
    icon: ChartNoAxesCombined,
    count: 12,
  },
  {
    key: 'query-explorer',
    label: 'Query Explorer',
    description: 'Traceable query diagnostics and retrieval evidence',
    icon: Target,
    count: 380,
  },
]

const kpiCards: KpiCard[] = [
  {
    label: 'Searches Performed Today',
    metric: '24,618',
    description: 'Total enterprise searches across all knowledge channels in the last 24 hours.',
    trend: '+8.4% vs yesterday',
    icon: Search,
  },
  {
    label: 'Search Success Rate',
    metric: '92.7%',
    description: 'Queries that produced at least one clicked and permission-valid result.',
    trend: '+1.9% in 7 days',
    icon: CheckCircle2,
  },
  {
    label: 'Zero-result Queries',
    metric: '216',
    description: 'Queries with no matching knowledge assets in current retrieval scope.',
    trend: '-13.2% this week',
    icon: ShieldAlert,
  },
  {
    label: 'Semantic Retrieval Usage',
    metric: '61.3%',
    description: 'Share of searches executed in semantic or hybrid retrieval mode.',
    trend: '+5.1% MoM',
    icon: Brain,
  },
  {
    label: 'Average Time to First Click',
    metric: '11.6s',
    description: 'Median time from query submit to first result click across user segments.',
    trend: '-1.1s improvement',
    icon: Clock3,
  },
  {
    label: 'Top Accessed Knowledge Assets',
    metric: '134',
    description: 'Number of assets with high retrieval and access frequency this week.',
    trend: 'Top domain: Compliance',
    icon: FolderOpen,
  },
]

const searchTypeOptions: FilterOption<string>[] = [
  { label: 'All Results', value: 'all-results' },
  { label: 'Full-text', value: 'full-text' },
  { label: 'Semantic', value: 'semantic' },
  { label: 'Contextual', value: 'contextual' },
]

const statusOptions: FilterOption<string>[] = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Approved', value: 'approved' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' },
]

const contentTypeOptions: FilterOption<string>[] = [
  { label: 'Document', value: 'document' },
  { label: 'Wiki Page', value: 'wiki-page' },
  { label: 'Policy', value: 'policy' },
  { label: 'SOP', value: 'sop' },
  { label: 'PDF', value: 'pdf' },
  { label: 'Image', value: 'image' },
  { label: 'Video', value: 'video' },
]

const domainOptions: FilterOption<string>[] = [
  { label: 'Customer', value: 'customer' },
  { label: 'Loan', value: 'loan' },
  { label: 'Collection', value: 'collection' },
  { label: 'Finance', value: 'finance' },
  { label: 'Risk', value: 'risk' },
  { label: 'Compliance', value: 'compliance' },
  { label: 'Operations', value: 'operations' },
]

const languageOptions: FilterOption<string>[] = [
  { label: 'English', value: 'english' },
  { label: 'Indonesian', value: 'indonesian' },
  { label: 'Bilingual', value: 'bilingual' },
  { label: 'Other', value: 'other' },
]

const timeOptions: FilterOption<string>[] = [
  { label: 'Today', value: 'today' },
  { label: '7 Days', value: '7-days' },
  { label: '30 Days', value: '30-days' },
  { label: '90 Days', value: '90-days' },
  { label: 'Custom Range', value: 'custom-range' },
]

const roleOptions = [
  'Relationship Manager',
  'Credit Analyst',
  'Collections Officer',
  'Compliance Reviewer',
  'Risk Governance Lead',
]

const suggestionPool = [
  'loan restructuring policy exception',
  'KYC remediation checklist for onboarding',
  'collection escalation SOP for day 30+',
  'semantic map for collateral risk classification',
  'customer complaint handling policy multilingual',
  'credit underwriting deviation approval matrix',
  'AML case investigation evidence package',
  'playbook for refinancing eligibility review',
]

const popularQueries = [
  'Loan restructuring policy',
  'Customer complaint SOP',
  'AML trigger investigation',
  'Collection script compliance',
]

const searchResults: SearchResultItem[] = [
  {
    id: 'SR-1023',
    title: 'Retail Loan Restructuring Policy v4.2',
    snippet:
      'Policy update introduces revised eligibility thresholds, approval matrix by risk band, and full audit trace for restructures approved beyond delegated authority.',
    contentType: 'Policy',
    domain: 'Loan',
    owner: 'Credit Policy Office',
    language: 'English',
    status: 'Published',
    searchType: 'Semantic',
    confidence: 0.94,
    relevanceReason: 'Concept match on restructuring exceptions and delegated approval policy.',
    updatedAt: '2026-04-14',
    access: 'Accessible',
    topMatchedEntity: 'LoanAgreement',
  },
  {
    id: 'SR-1178',
    title: 'Customer KYC Exception Remediation SOP',
    snippet:
      'Defines remediation path for missing KYC artifacts, role-based ownership, and escalation SLA when unresolved after 5 working days.',
    contentType: 'SOP',
    domain: 'Customer',
    owner: 'Customer Operations Governance',
    language: 'Bilingual',
    status: 'Approved',
    searchType: 'Contextual',
    confidence: 0.88,
    relevanceReason: 'Role-sensitive ranking for Compliance Reviewer and onboarding control context.',
    updatedAt: '2026-04-11',
    access: 'Accessible',
    topMatchedEntity: 'CustomerProfile',
  },
  {
    id: 'SR-0834',
    title: 'Collection Contact Strategy Playbook - Retail Segment',
    snippet:
      'Guidance for progressive contact treatment by delinquency bucket, including legally compliant script variants and callback policy windows.',
    contentType: 'Document',
    domain: 'Collection',
    owner: 'Collections Strategy Team',
    language: 'English',
    status: 'Published',
    searchType: 'Full-text',
    confidence: 0.81,
    relevanceReason: 'Exact keyword match on collection strategy and script guidance.',
    updatedAt: '2026-04-08',
    access: 'Accessible',
    topMatchedEntity: 'CollectionWorkflowStep',
  },
  {
    id: 'SR-1409',
    title: 'Regulatory Reporting Validation Checklist 2026',
    snippet:
      'Checklist for pre-submission validation controls, mandatory evidence references, and issue handling for late reporting scenarios.',
    contentType: 'PDF',
    domain: 'Compliance',
    owner: 'Regulatory Assurance Unit',
    language: 'English',
    status: 'Published',
    searchType: 'Semantic',
    confidence: 0.86,
    relevanceReason: 'Cross-document conceptual match to reporting control and compliance evidence terms.',
    updatedAt: '2026-04-13',
    access: 'Restricted',
    topMatchedEntity: 'RegulationReference',
  },
  {
    id: 'SR-1551',
    title: 'Credit Underwriting Deviation Matrix',
    snippet:
      'Matrix for threshold deviations by product tier, risk appetite alignment, and required second-line approvals.',
    contentType: 'Wiki Page',
    domain: 'Risk',
    owner: 'Enterprise Risk Architecture',
    language: 'English',
    status: 'Draft',
    searchType: 'Contextual',
    confidence: 0.77,
    relevanceReason: 'Function-specific retrieval context linked to risk governance decision flow.',
    updatedAt: '2026-04-09',
    access: 'Accessible',
    topMatchedEntity: 'RiskClass',
  },
]

const queryExplorerRows: QueryExplorerItem[] = [
  {
    id: 'QX-901',
    phrase: 'loan restructuring exception policy',
    queryType: 'Semantic',
    executionCount: 421,
    resultCount: 38,
    topSelectedResult: 'Retail Loan Restructuring Policy v4.2',
    ctr: 0.67,
    semanticVsKeyword: '74% semantic / 26% keyword',
    zeroResult: false,
    relatedRefinement: 'delegated approval threshold',
    lastExecution: '2026-04-15 09:44',
  },
  {
    id: 'QX-877',
    phrase: 'KYC missing document process',
    queryType: 'Contextual',
    executionCount: 268,
    resultCount: 24,
    topSelectedResult: 'Customer KYC Exception Remediation SOP',
    ctr: 0.61,
    semanticVsKeyword: '58% semantic / 42% keyword',
    zeroResult: false,
    relatedRefinement: 'onboarding SLA escalation',
    lastExecution: '2026-04-15 09:35',
  },
  {
    id: 'QX-852',
    phrase: 'legacy branch script archive',
    queryType: 'Keyword',
    executionCount: 73,
    resultCount: 0,
    topSelectedResult: '-',
    ctr: 0,
    semanticVsKeyword: '12% semantic / 88% keyword',
    zeroResult: true,
    relatedRefinement: 'collection script compliance latest',
    lastExecution: '2026-04-14 17:02',
  },
  {
    id: 'QX-834',
    phrase: 'AML investigation evidence package',
    queryType: 'Semantic',
    executionCount: 196,
    resultCount: 21,
    topSelectedResult: 'Regulatory Reporting Validation Checklist 2026',
    ctr: 0.55,
    semanticVsKeyword: '81% semantic / 19% keyword',
    zeroResult: false,
    relatedRefinement: 'regulatory evidence taxonomy',
    lastExecution: '2026-04-15 08:59',
  },
]

const searchTrend = [
  { date: 'Apr 09', volume: 18800, successRate: 89.8, zeroResult: 312 },
  { date: 'Apr 10', volume: 19340, successRate: 90.6, zeroResult: 295 },
  { date: 'Apr 11', volume: 20190, successRate: 91.2, zeroResult: 271 },
  { date: 'Apr 12', volume: 21470, successRate: 91.6, zeroResult: 254 },
  { date: 'Apr 13', volume: 22010, successRate: 92.1, zeroResult: 242 },
  { date: 'Apr 14', volume: 23190, successRate: 92.5, zeroResult: 228 },
  { date: 'Apr 15', volume: 24618, successRate: 92.7, zeroResult: 216 },
]

const retrievalUsageData = [
  { name: 'Full-text', value: 24, color: '#0f766e' },
  { name: 'Semantic', value: 46, color: '#0f9f8f' },
  { name: 'Contextual', value: 30, color: '#6b7b8f' },
]

const topQueryData = [
  { phrase: 'loan restructuring policy', searches: 1210, ctr: 0.69 },
  { phrase: 'KYC remediation SOP', searches: 968, ctr: 0.63 },
  { phrase: 'AML evidence checklist', searches: 844, ctr: 0.57 },
  { phrase: 'collection script compliance', searches: 739, ctr: 0.52 },
]

const retrievalComparison = [
  { month: 'Jan', fullText: 41, semantic: 37, contextual: 22 },
  { month: 'Feb', fullText: 36, semantic: 42, contextual: 22 },
  { month: 'Mar', fullText: 30, semantic: 46, contextual: 24 },
  { month: 'Apr', fullText: 24, semantic: 46, contextual: 30 },
]

const recentSearchTimeline = [
  {
    time: '09:42',
    actor: 'Risk Analyst - Team East',
    action: 'executed semantic query',
    detail: '"loan restructuring exception policy" returned 38 results with 94% confidence lead.',
  },
  {
    time: '09:18',
    actor: 'Collections Supervisor',
    action: 'refined zero-result query',
    detail: 'Replaced legacy phrase and recovered 12 relevant SOP assets.',
  },
  {
    time: '08:57',
    actor: 'Compliance Reviewer',
    action: 'opened restricted result metadata',
    detail: 'Permission marker displayed; access request routed to knowledge owner.',
  },
  {
    time: '08:14',
    actor: 'Relationship Manager',
    action: 'saved contextual search profile',
    detail: 'Pinned customer onboarding retrieval profile for recurring daily operations.',
  },
]

function toggleMultiValue(values: string[], selected: string): string[] {
  if (selected === 'all-results') {
    return ['all-results']
  }

  const next = values.includes(selected)
    ? values.filter((value) => value !== selected)
    : [...values.filter((value) => value !== 'all-results'), selected]

  return next.length > 0 ? next : ['all-results']
}

function toggleGeneric(values: string[], selected: string): string[] {
  const next = values.includes(selected)
    ? values.filter((value) => value !== selected)
    : [...values, selected]

  return next.length > 0 ? next : values
}

function sortRows<T extends object>(rows: T[], key: keyof T, direction: SortDirection): T[] {
  return [...rows].sort((left, right) => {
    const a = left[key]
    const b = right[key]

    if (typeof a === 'number' && typeof b === 'number') {
      return direction === 'asc' ? a - b : b - a
    }

    return direction === 'asc'
      ? String(a).localeCompare(String(b))
      : String(b).localeCompare(String(a))
  })
}

function getStatusTone(status: SearchResultItem['status']) {
  if (status === 'Published') {
    return 'text-emerald-700 bg-emerald-50 border-emerald-200'
  }
  if (status === 'Approved') {
    return 'text-teal-700 bg-teal-50 border-teal-200'
  }
  if (status === 'Draft') {
    return 'text-orange-700 bg-orange-50 border-orange-200'
  }
  return 'text-slate-600 bg-slate-100 border-slate-200'
}

function getAccessTone(access: SearchResultItem['access']) {
  return access === 'Accessible'
    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
    : 'text-rose-700 bg-rose-50 border-rose-200'
}

function HighlightedSnippet({ text, query }: { text: string; query: string }) {
  if (!query.trim()) {
    return <span>{text}</span>
  }

  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'ig')
  const parts = text.split(regex)

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.trim().toLowerCase() ? (
          <mark key={`${part}-${index}`} className="rounded bg-emerald-100 px-1 text-emerald-900">
            {part}
          </mark>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        )
      )}
    </>
  )
}

export function SearchDiscoveryRetrievalPage() {
  const [activeSection, setActiveSection] = useState<WorkspaceSection>('overview')
  const [query, setQuery] = useState('loan restructuring policy')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedRole, setSelectedRole] = useState(roleOptions[0])
  const [personalizationEnabled, setPersonalizationEnabled] = useState(true)

  const [searchTypes, setSearchTypes] = useState<string[]>(['all-results'])
  const [statuses, setStatuses] = useState<string[]>(['all'])
  const [contentTypes, setContentTypes] = useState<string[]>(['policy', 'sop', 'document'])
  const [domains, setDomains] = useState<string[]>(['loan', 'risk', 'compliance'])
  const [languages, setLanguages] = useState<string[]>(['english', 'bilingual'])
  const [times, setTimes] = useState<string[]>(['7-days'])

  const [selectedResultId, setSelectedResultId] = useState<string>(searchResults[0]?.id ?? '')
  const [resultSort, setResultSort] = useState<{ key: ResultSortKey; direction: SortDirection }>({
    key: 'confidence',
    direction: 'desc',
  })
  const [querySort, setQuerySort] = useState<{ key: QuerySortKey; direction: SortDirection }>({
    key: 'executionCount',
    direction: 'desc',
  })

  const selectedResult = useMemo(
    () => searchResults.find((row) => row.id === selectedResultId) ?? null,
    [selectedResultId],
  )

  const filteredSuggestions = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) {
      return suggestionPool.slice(0, 5)
    }

    const matching = suggestionPool.filter((item) => item.toLowerCase().includes(normalized))
    return matching.length > 0 ? matching.slice(0, 5) : suggestionPool.slice(0, 5)
  }, [query])

  const filteredResults = useMemo(() => {
    const normalized = query.trim().toLowerCase()

    return searchResults.filter((item) => {
      const matchesQuery =
        normalized.length === 0 ||
        item.title.toLowerCase().includes(normalized) ||
        item.snippet.toLowerCase().includes(normalized) ||
        item.topMatchedEntity.toLowerCase().includes(normalized)

      const typeGuard =
        searchTypes.includes('all-results') ||
        searchTypes.includes(item.searchType.toLowerCase().replace('-', '')) ||
        searchTypes.includes(item.searchType.toLowerCase())

      const statusGuard =
        statuses.includes('all') || statuses.includes(item.status.toLowerCase().replace(' ', '-'))

      const contentGuard = contentTypes.includes(item.contentType.toLowerCase().replace(' ', '-'))

      const domainGuard = domains.includes(item.domain.toLowerCase())
      const languageGuard = languages.includes(item.language.toLowerCase())

      return matchesQuery && typeGuard && statusGuard && contentGuard && domainGuard && languageGuard
    })
  }, [query, searchTypes, statuses, contentTypes, domains, languages])

  const sortedAdvancedResults = useMemo(
    () => sortRows(filteredResults, resultSort.key, resultSort.direction),
    [filteredResults, resultSort],
  )

  const sortedQueryRows = useMemo(
    () => sortRows(queryExplorerRows, querySort.key, querySort.direction),
    [querySort],
  )

  const zeroResult = filteredResults.length === 0

  function handleSortResults(key: ResultSortKey) {
    setResultSort((previous) => {
      if (previous.key !== key) {
        return { key, direction: 'asc' }
      }

      return { key, direction: previous.direction === 'asc' ? 'desc' : 'asc' }
    })
  }

  function handleSortQuery(key: QuerySortKey) {
    setQuerySort((previous) => {
      if (previous.key !== key) {
        return { key, direction: 'asc' }
      }

      return { key, direction: previous.direction === 'asc' ? 'desc' : 'asc' }
    })
  }

  function renderSortIcon(active: boolean, direction: SortDirection) {
    if (!active) {
      return <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
    }

    return direction === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
  }

  function renderOverviewSection() {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="glass-card rounded-2xl border border-emerald-100 bg-gradient-to-br from-white via-white to-emerald-50/70 p-4 xl:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Search Volume and Retrieval Quality</h3>
                <p className="text-xs text-slate-500">Track usage trajectory, success ratio, and zero-result pressure.</p>
              </div>
              <Badge className="rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">Live telemetry</Badge>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={searchTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d8e6df" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="volume" stroke="#0f766e" strokeWidth={2.2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="successRate" stroke="#2563eb" strokeWidth={2} dot={false} />
                  <Line yAxisId="left" type="monotone" dataKey="zeroResult" stroke="#dc2626" strokeWidth={1.8} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card rounded-2xl border border-slate-200/80 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-900">Retrieval Mode Usage</h3>
            <p className="mb-2 text-xs text-slate-500">Adoption mix across full-text, semantic, and contextual retrieval.</p>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={retrievalUsageData} dataKey="value" nameKey="name" innerRadius={44} outerRadius={72} paddingAngle={3}>
                    {retrievalUsageData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {retrievalUsageData.map((entry) => (
                <div key={entry.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    {entry.name}
                  </div>
                  <span className="font-semibold text-slate-900">{entry.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="glass-card rounded-2xl border border-slate-200/80 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Top Searched Topics</h3>
              <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs">
                Open Query Detail
              </Button>
            </div>
            <div className="space-y-2">
              {topQueryData.map((topic, index) => (
                <div
                  key={topic.phrase}
                  className="rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-2 transition-colors hover:border-emerald-200 hover:bg-emerald-50/40"
                >
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="font-semibold text-slate-900">{index + 1}. {topic.phrase}</span>
                    <span>{topic.searches.toLocaleString()} searches</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Click-through visibility</span>
                    <span className="font-semibold text-emerald-700">{(topic.ctr * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl border border-slate-200/80 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Recent Search Activity</h3>
              <Badge className="rounded-full border border-blue-200 bg-blue-50 text-blue-700">Traceable logs</Badge>
            </div>
            <div className="space-y-3">
              {recentSearchTimeline.map((event) => (
                <div key={`${event.time}-${event.actor}`} className="rounded-xl border border-slate-200/80 bg-white px-3 py-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-900">{event.actor}</span>
                    <span className="text-slate-500">{event.time}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-700">{event.action}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">{event.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  function renderSmartSearchSection() {
    return (
      <div className="space-y-4">
        <section className="glass-card rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/20 p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Smart Search</h3>
              <p className="text-xs text-slate-600">Find trusted knowledge using full-text, semantic, and contextual retrieval in one workspace.</p>
            </div>
            <Badge className="rounded-full border border-teal-200 bg-teal-50 text-teal-700">Intelligent retrieval layer</Badge>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => {
                window.setTimeout(() => setShowSuggestions(false), 160)
              }}
              placeholder="Search document title, policy name, SOP, tag, taxonomy, owner, domain, or concept intent"
              className="h-12 rounded-xl border-slate-200 bg-white pl-9 pr-24 text-sm"
            />
            <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Clear query"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-teal-700"
                aria-label="Voice suggestion"
              >
                <Mic className="h-4 w-4" />
              </button>
              <button
                className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-teal-700"
                aria-label="AI suggestion"
              >
                <Sparkles className="h-4 w-4" />
              </button>
            </div>

            {showSuggestions && (
              <div className="absolute left-0 right-0 top-14 z-20 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Suggested Query</div>
                <div className="space-y-1.5">
                  {filteredSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onMouseDown={() => setQuery(suggestion)}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs text-slate-700 transition-colors hover:bg-emerald-50"
                    >
                      <span>{suggestion}</span>
                      <Badge className="rounded-full border border-slate-200 bg-slate-50 text-[10px] text-slate-600">intent-aware</Badge>
                    </button>
                  ))}
                </div>
                <div className="mt-3 border-t border-slate-200 pt-2 text-xs text-slate-500">
                  Recent queries: {popularQueries.slice(0, 3).join(' • ')}
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <Badge className="rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">Semantic hint: related meaning search is active</Badge>
            <Badge className="rounded-full border border-slate-200 bg-slate-50 text-slate-600">Role context: {selectedRole}</Badge>
            <Badge className="rounded-full border border-blue-200 bg-blue-50 text-blue-700">Search scope: Salvia Enterprise Knowledge</Badge>
          </div>
        </section>

        {zeroResult ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 text-rose-600" />
              <div>
                <h4 className="text-sm font-semibold text-rose-800">Zero-result query detected</h4>
                <p className="text-xs text-rose-700">No result matched your query and current filters. Try semantic suggestions or broaden domain and content type chips.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {popularQueries.map((item) => (
                    <button
                      key={item}
                      onClick={() => setQuery(item)}
                      className="rounded-full border border-rose-200 bg-white px-3 py-1 text-xs text-rose-700"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="space-y-3 xl:col-span-2">
              {filteredResults.map((result) => (
                <article
                  key={result.id}
                  className={cn(
                    'rounded-2xl border bg-white p-4 transition-all',
                    result.id === selectedResultId
                      ? 'border-emerald-300 shadow-[0_8px_24px_rgba(16,185,129,0.12)]'
                      : 'border-slate-200 hover:border-emerald-200 hover:shadow-sm',
                  )}
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px]">
                    <Badge className="rounded-full border border-slate-200 bg-slate-50 text-slate-700">{result.id}</Badge>
                    <Badge className={cn('rounded-full border', getStatusTone(result.status))}>{result.status}</Badge>
                    <Badge className="rounded-full border border-blue-200 bg-blue-50 text-blue-700">{result.searchType} Match</Badge>
                    <Badge className={cn('rounded-full border', getAccessTone(result.access))}>{result.access}</Badge>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">{result.title}</h4>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    <HighlightedSnippet text={result.snippet} query={query} />
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <div>Domain: <span className="font-medium text-slate-800">{result.domain}</span></div>
                    <div>Content Type: <span className="font-medium text-slate-800">{result.contentType}</span></div>
                    <div>Owner: <span className="font-medium text-slate-800">{result.owner}</span></div>
                    <div>Updated: <span className="font-medium text-slate-800">{result.updatedAt}</span></div>
                    <div>Top Matched Entity: <span className="font-medium text-slate-800">{result.topMatchedEntity}</span></div>
                    <div>Retrieval Confidence: <span className="font-semibold text-emerald-700">{Math.round(result.confidence * 100)}%</span></div>
                  </div>
                  <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50/70 p-2 text-[11px] text-slate-600">
                    Why this result is relevant: <span className="font-medium text-slate-800">{result.relevanceReason}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" className="h-8 rounded-lg text-xs" onClick={() => setSelectedResultId(result.id)}>
                      Open Result
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs">Preview Knowledge Asset</Button>
                    <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs">View Metadata</Button>
                    <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs">Refine Search</Button>
                    <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs">Save Query</Button>
                    <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs">Open Related Knowledge</Button>
                  </div>
                </article>
              ))}
            </div>

            <aside className="space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recent Queries</h4>
                <div className="mt-2 space-y-1.5">
                  {popularQueries.map((queryItem) => (
                    <button
                      key={queryItem}
                      onClick={() => setQuery(queryItem)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-left text-xs text-slate-700 transition-colors hover:border-emerald-200 hover:bg-emerald-50"
                    >
                      {queryItem}
                    </button>
                  ))}
                </div>
              </div>

              {selectedResult && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <h4 className="text-sm font-semibold text-slate-900">Result Detail Drawer</h4>
                  <p className="mt-1 text-xs text-slate-500">Traceable relevance evidence and permission visibility.</p>
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                      <div className="font-semibold text-slate-900">{selectedResult.title}</div>
                      <div className="mt-1 text-slate-600">{selectedResult.relevanceReason}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-slate-200 p-2">
                        <div className="text-[11px] text-slate-500">Relevance Confidence</div>
                        <div className="font-semibold text-emerald-700">{Math.round(selectedResult.confidence * 100)}%</div>
                      </div>
                      <div className="rounded-lg border border-slate-200 p-2">
                        <div className="text-[11px] text-slate-500">Access Marker</div>
                        <div className={cn('inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium', getAccessTone(selectedResult.access))}>
                          {selectedResult.access}
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="h-8 w-full rounded-lg text-xs">
                      Open Related Search Session
                    </Button>
                  </div>
                </div>
              )}
            </aside>
          </div>
        )}
      </div>
    )
  }

  function renderAdvancedSearchSection() {
    return (
      <div className="space-y-4">
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 xl:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Faceted Search Workspace</h3>
              <Badge className="rounded-full border border-teal-200 bg-teal-50 text-teal-700">Precision mode</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                <div className="text-[11px] text-slate-500">Query Text</div>
                <div className="font-medium text-slate-900">{query || 'Not specified'}</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                <div className="text-[11px] text-slate-500">Search Mode</div>
                <div className="font-medium text-slate-900">{searchTypes.join(', ')}</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                <div className="text-[11px] text-slate-500">Domain Scope</div>
                <div className="font-medium text-slate-900">{domains.join(', ')}</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                <div className="text-[11px] text-slate-500">Language</div>
                <div className="font-medium text-slate-900">{languages.join(', ')}</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                <div className="text-[11px] text-slate-500">Status</div>
                <div className="font-medium text-slate-900">{statuses.join(', ')}</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                <div className="text-[11px] text-slate-500">Updated Date Window</div>
                <div className="font-medium text-slate-900">{times.join(', ')}</div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" className="h-8 rounded-lg text-xs">Run Search</Button>
              <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs">Save Search Profile</Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 rounded-lg text-xs"
                onClick={() => {
                  setQuery('')
                  setSearchTypes(['all-results'])
                  setStatuses(['all'])
                  setContentTypes(['policy', 'sop', 'document'])
                  setDomains(['loan', 'risk', 'compliance'])
                  setLanguages(['english', 'bilingual'])
                  setTimes(['7-days'])
                }}
              >
                Reset Filters
              </Button>
              <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs">Export Search Results</Button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-900">Relevance Confidence Control</h3>
            <p className="text-xs text-slate-500">Tune ranking threshold and inspect precision vs recall profile.</p>
            <div className="mt-3 space-y-3 text-xs">
              {[96, 88, 75].map((value, index) => (
                <div key={value}>
                  <div className="mb-1 flex items-center justify-between text-slate-600">
                    <span>{index === 0 ? 'High confidence floor' : index === 1 ? 'Medium confidence floor' : 'Low confidence floor'}</span>
                    <span className="font-semibold text-slate-900">{value}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50 p-2 text-[11px] text-orange-700">
              Low-confidence matches are highlighted for manual refinement and governance review.
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Advanced Search Results</h3>
            <Badge className="rounded-full border border-slate-200 bg-slate-50 text-slate-700">{sortedAdvancedResults.length} rows</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600">
                <tr>
                  {[
                    { key: 'title', label: 'Knowledge Asset' },
                    { key: 'contentType', label: 'Content Type' },
                    { key: 'domain', label: 'Domain' },
                    { key: 'status', label: 'Status' },
                    { key: 'confidence', label: 'Confidence' },
                    { key: 'updatedAt', label: 'Updated Date' },
                  ].map((header) => (
                    <th key={header.key} className="px-3 py-2.5 font-semibold">
                      <button
                        className="inline-flex items-center gap-1"
                        onClick={() => handleSortResults(header.key as ResultSortKey)}
                      >
                        {header.label}
                        {renderSortIcon(resultSort.key === header.key, resultSort.direction)}
                      </button>
                    </th>
                  ))}
                  <th className="px-3 py-2.5 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedAdvancedResults.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100 transition-colors hover:bg-emerald-50/30">
                    <td className="px-3 py-2.5">
                      <div className="font-medium text-slate-900">{row.title}</div>
                      <div className="text-[11px] text-slate-500">{row.id}</div>
                    </td>
                    <td className="px-3 py-2.5 text-slate-700">{row.contentType}</td>
                    <td className="px-3 py-2.5 text-slate-700">{row.domain}</td>
                    <td className="px-3 py-2.5">
                      <Badge className={cn('rounded-full border text-[11px]', getStatusTone(row.status))}>{row.status}</Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={cn('font-semibold', row.confidence < 0.8 ? 'text-orange-700' : 'text-emerald-700')}>
                        {Math.round(row.confidence * 100)}%
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-slate-700">{row.updatedAt}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        <Button size="sm" variant="outline" className="h-7 rounded-lg px-2 text-[11px]">Preview Result</Button>
                        <Button size="sm" variant="outline" className="h-7 rounded-lg px-2 text-[11px]">Open Result Detail</Button>
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

  function renderInsightsSection() {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 xl:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Search Volume and Query Trend</h3>
              <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs">Compare Time Periods</Button>
            </div>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={searchTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#dbe5df" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="volume" stroke="#0f766e" fill="#0f766e" fillOpacity={0.16} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-900">Search Success Gauge</h3>
            <p className="text-xs text-slate-500">Success and click-through health for monitored period.</p>
            <div className="mt-4 space-y-3">
              {[
                { label: 'Success Rate', value: 92.7, tone: 'bg-emerald-500' },
                { label: 'CTR', value: 63.2, tone: 'bg-teal-500' },
                { label: 'Zero-result Ratio', value: 7.3, tone: 'bg-rose-500' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                    <span>{item.label}</span>
                    <span className="font-semibold text-slate-900">{item.value}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className={cn('h-full rounded-full', item.tone)} style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-2 text-[11px] text-rose-700">
              216 zero-result queries detected today. Inspect patterns for missing taxonomy or stale synonyms.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Retrieval Channel Comparison</h3>
              <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs">Inspect Search Trend</Button>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={retrievalComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#dbe5df" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="fullText" stackId="a" fill="#334155" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="semantic" stackId="a" fill="#0f766e" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="contextual" stackId="a" fill="#0369a1" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Popular Content Leaderboard</h3>
              <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs">Open Popular Content</Button>
            </div>
            <div className="space-y-2">
              {searchResults.slice(0, 4).map((result, index) => (
                <div key={result.id} className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-900">#{index + 1} {result.title}</span>
                    <span className="text-slate-500">{result.searchType}</span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-600">{result.domain} • {result.contentType} • Confidence {Math.round(result.confidence * 100)}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  function renderQueryExplorerSection() {
    return (
      <div className="space-y-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Query Exploration Table</h3>
              <p className="text-xs text-slate-500">Inspect query behavior, refinement path, and retrieval effectiveness in detail.</p>
            </div>
            <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs">Export Query Evidence</Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600">
                <tr>
                  {[
                    { key: 'phrase', label: 'Query Phrase' },
                    { key: 'queryType', label: 'Query Type' },
                    { key: 'executionCount', label: 'Execution Count' },
                    { key: 'resultCount', label: 'Result Count' },
                    { key: 'ctr', label: 'CTR' },
                    { key: 'lastExecution', label: 'Last Execution' },
                  ].map((header) => (
                    <th key={header.key} className="px-3 py-2.5 font-semibold">
                      <button
                        className="inline-flex items-center gap-1"
                        onClick={() => handleSortQuery(header.key as QuerySortKey)}
                      >
                        {header.label}
                        {renderSortIcon(querySort.key === header.key, querySort.direction)}
                      </button>
                    </th>
                  ))}
                  <th className="px-3 py-2.5 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedQueryRows.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100 transition-colors hover:bg-emerald-50/30">
                    <td className="px-3 py-2.5">
                      <div className="font-medium text-slate-900">{row.phrase}</div>
                      <div className="text-[11px] text-slate-500">Refinement: {row.relatedRefinement}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge className="rounded-full border border-blue-200 bg-blue-50 text-blue-700">{row.queryType}</Badge>
                    </td>
                    <td className="px-3 py-2.5 text-slate-700">{row.executionCount.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-slate-700">{row.resultCount}</td>
                    <td className="px-3 py-2.5">
                      <span className={cn('font-semibold', row.ctr < 0.3 ? 'text-orange-700' : 'text-emerald-700')}>
                        {(row.ctr * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-slate-700">{row.lastExecution}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        <Button size="sm" variant="outline" className="h-7 rounded-lg px-2 text-[11px]">Open Query Detail</Button>
                        <Button size="sm" variant="outline" className="h-7 rounded-lg px-2 text-[11px]">View Retrieved Results</Button>
                        <Button size="sm" variant="outline" className="h-7 rounded-lg px-2 text-[11px]">Inspect Query Path</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-900">Query Pattern Cards</h3>
            <div className="mt-3 space-y-2">
              {[
                {
                  title: 'Zero-result Cluster',
                  detail: 'Legacy and retired policy terms dominate zero-result group.',
                  tone: 'border-rose-200 bg-rose-50 text-rose-700',
                },
                {
                  title: 'High-CTR Semantic Cluster',
                  detail: 'Queries with intent phrasing outperform pure keyword forms by 18%.',
                  tone: 'border-emerald-200 bg-emerald-50 text-emerald-700',
                },
                {
                  title: 'Role Drift Cluster',
                  detail: 'Contextual ranking variance is highest for cross-domain relationship manager searches.',
                  tone: 'border-orange-200 bg-orange-50 text-orange-700',
                },
              ].map((card) => (
                <div key={card.title} className={cn('rounded-xl border px-3 py-2 text-xs', card.tone)}>
                  <div className="font-semibold">{card.title}</div>
                  <div className="mt-1">{card.detail}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-900">Query Performance Timeline</h3>
            <div className="mt-3 h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={topQueryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#dbe5df" />
                  <XAxis dataKey="phrase" tick={{ fontSize: 10 }} interval={0} angle={-12} textAnchor="end" height={48} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="searches" stroke="#0f766e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-xs text-slate-500">Use this timeline to identify query patterns for optimization and synonym expansion.</div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-6">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/' },
          { label: 'Knowledge Repository & Content Management', href: '/knowledge' },
          { label: 'Knowledge Structuring & Ontology Management', href: '/knowledge-structuring-ontology' },
          { label: 'Search, Discovery & Retrieval' },
        ]}
      />

      <PageHeader
        title="Search, Discovery & Retrieval"
        description="Enterprise knowledge discovery workspace for full-text, semantic, and contextual retrieval with traceable relevance and search analytics."
      />

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {kpiCards.map((card) => {
          const Icon = card.icon
          return (
            <button
              key={card.label}
              className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-white to-slate-50 px-4 py-3 text-left transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
            >
              <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{card.label}</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">{card.metric}</div>
              <div className="mt-1 text-xs text-slate-600">{card.description}</div>
              <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                <TrendingUp className="h-3 w-3" />
                {card.trend}
              </div>
              <Icon className="absolute -bottom-2 -right-2 h-16 w-16 text-slate-200 transition-colors group-hover:text-emerald-100" />
            </button>
          )
        })}
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-4">
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.6fr_1fr]">
          <div className="space-y-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search knowledge article, policy, SOP, taxonomy, entity, owner, domain, or query phrase"
                className="h-10 rounded-xl border-slate-200 pl-9 pr-20"
              />
              <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                {query && (
                  <button
                    className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    onClick={() => setQuery('')}
                    aria-label="Clear input"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <button className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-emerald-700" aria-label="AI suggestions">
                  <Sparkles className="h-4 w-4" />
                </button>
              </div>
            </div>

            {showSuggestions && (
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-2">
                <div className="text-[11px] text-slate-500">Auto-complete suggestions:</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {filteredSuggestions.slice(0, 4).map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        setQuery(item)
                        setShowSuggestions(false)
                      }}
                      className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-700 transition-colors hover:border-emerald-200 hover:bg-emerald-50"
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <div className="mt-1.5 text-[11px] text-slate-500">Recent queries: {popularQueries.slice(0, 2).join(' • ')}</div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Context profile</span>
              <span className="font-semibold text-slate-900">{selectedRole}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {roleOptions.map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={cn(
                    'rounded-full border px-2 py-0.5 text-[11px] transition-colors',
                    selectedRole === role
                      ? 'border-emerald-300 bg-emerald-100 text-emerald-800'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50',
                  )}
                >
                  {role}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPersonalizationEnabled((value) => !value)}
              className={cn(
                'inline-flex items-center justify-center rounded-lg border px-2 py-1 text-[11px] font-medium',
                personalizationEnabled
                  ? 'border-emerald-300 bg-emerald-100 text-emerald-800'
                  : 'border-slate-200 bg-white text-slate-600',
              )}
            >
              {personalizationEnabled ? 'Personalization Enabled' : 'Personalization Disabled'}
            </button>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="font-semibold text-slate-600">Search Type</span>
            {searchTypeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSearchTypes((values) => toggleMultiValue(values, option.value))}
                className={cn(
                  'rounded-full border px-2.5 py-1 transition-colors',
                  searchTypes.includes(option.value)
                    ? 'border-emerald-300 bg-emerald-100 text-emerald-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="font-semibold text-slate-600">Status</span>
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setStatuses([option.value])}
                className={cn(
                  'rounded-full border px-2.5 py-1 transition-colors',
                  statuses.includes(option.value)
                    ? 'border-blue-300 bg-blue-100 text-blue-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="font-semibold text-slate-600">Content Type</span>
            {contentTypeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setContentTypes((values) => toggleGeneric(values, option.value))}
                className={cn(
                  'rounded-full border px-2.5 py-1 transition-colors',
                  contentTypes.includes(option.value)
                    ? 'border-slate-300 bg-slate-200 text-slate-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-100',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="font-semibold text-slate-600">Domain</span>
            {domainOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setDomains((values) => toggleGeneric(values, option.value))}
                className={cn(
                  'rounded-full border px-2.5 py-1 transition-colors',
                  domains.includes(option.value)
                    ? 'border-teal-300 bg-teal-100 text-teal-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-teal-200 hover:bg-teal-50',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="font-semibold text-slate-600">Language</span>
            {languageOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setLanguages((values) => toggleGeneric(values, option.value))}
                className={cn(
                  'rounded-full border px-2.5 py-1 transition-colors',
                  languages.includes(option.value)
                    ? 'border-indigo-300 bg-indigo-100 text-indigo-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="font-semibold text-slate-600">Time</span>
            {timeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTimes([option.value])}
                className={cn(
                  'rounded-full border px-2.5 py-1 transition-colors',
                  times.includes(option.value)
                    ? 'border-cyan-300 bg-cyan-100 text-cyan-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-cyan-200 hover:bg-cyan-50',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[290px_1fr]">
        <aside className="sticky top-[84px] h-fit rounded-2xl border border-slate-200 bg-white p-3">
          <h2 className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Discovery Workspace</h2>
          <div className="space-y-1.5">
            {workspaceMenu.map((item) => {
              const Icon = item.icon
              const active = activeSection === item.key

              return (
                <button
                  key={item.key}
                  onClick={() => setActiveSection(item.key)}
                  className={cn(
                    'w-full rounded-xl border px-3 py-2 text-left transition-all',
                    active
                      ? 'border-emerald-300 bg-emerald-50 shadow-[0_6px_16px_rgba(16,185,129,0.12)]'
                      : 'border-transparent bg-white hover:border-slate-200 hover:bg-slate-50',
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={cn('rounded-lg border p-1.5', active ? 'border-emerald-300 bg-white' : 'border-slate-200 bg-slate-50')}>
                        <Icon className={cn('h-4 w-4', active ? 'text-emerald-700' : 'text-slate-600')} />
                      </div>
                      <div>
                        <div className={cn('text-xs font-semibold', active ? 'text-emerald-900' : 'text-slate-900')}>{item.label}</div>
                        <div className="text-[11px] text-slate-500">{item.description}</div>
                      </div>
                    </div>
                    {item.count !== undefined && (
                      <Badge className="rounded-full border border-slate-200 bg-white text-[10px] text-slate-600">{item.count}</Badge>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </aside>

        <div className="space-y-4">
          {activeSection === 'overview' && renderOverviewSection()}
          {activeSection === 'smart-search' && renderSmartSearchSection()}
          {activeSection === 'advanced-search' && renderAdvancedSearchSection()}
          {activeSection === 'insights-dashboard' && renderInsightsSection()}
          {activeSection === 'query-explorer' && renderQueryExplorerSection()}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900">Relevance and Trust Signals</h3>
          <div className="mt-3 space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <BadgeCheck className="mt-0.5 h-4 w-4 text-emerald-600" />
              <p className="text-slate-700">Results show explainable relevance reason with confidence and matched enterprise entity.</p>
            </div>
            <div className="flex items-start gap-2">
              <Lock className="mt-0.5 h-4 w-4 text-rose-600" />
              <p className="text-slate-700">Permission-aware visibility marks restricted assets while preserving result traceability.</p>
            </div>
            <div className="flex items-start gap-2">
              <UserRound className="mt-0.5 h-4 w-4 text-blue-600" />
              <p className="text-slate-700">Context profile influences ranking to align retrieval with business role and operational domain.</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 xl:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Search Analytics Snapshot</h3>
            <Badge className="rounded-full border border-slate-200 bg-slate-50 text-slate-700">Operational visibility</Badge>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topQueryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dbe5df" />
                <XAxis dataKey="phrase" tick={{ fontSize: 10 }} interval={0} angle={-10} textAnchor="end" height={44} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="searches" fill="#0f766e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  )
}
