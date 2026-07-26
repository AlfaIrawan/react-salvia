import { cloneElement, isValidElement, useCallback, useMemo, useState } from 'react'
import {
  Activity,
  Archive,
  ArrowRightLeft,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Filter,
  FolderKanban,
  GitBranch,
  Globe2,
  History,
  Languages,
  LayoutGrid,
  ListTree,
  PencilLine,
  Search,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  RefreshCw,
  UserCheck,
  X,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { PageHeader } from '@/components/layout/PageHeader'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

type WorkspaceSection =
  | 'overview'
  | 'library'
  | 'explorer'
  | 'editor'
  | 'version'
  | 'lifecycle'

type StatusFilter = 'all' | 'draft' | 'in-review' | 'approved' | 'published' | 'archived'
type TypeFilter =
  | 'document'
  | 'wiki-page'
  | 'pdf'
  | 'image'
  | 'video'
  | 'policy'
  | 'sop'
  | 'knowledge-note'
type LanguageFilter = 'english' | 'indonesian' | 'bilingual' | 'other'
type DomainFilter = 'customer' | 'loan' | 'collection' | 'finance' | 'risk' | 'compliance' | 'operations'
type TimeFilter = 'today' | '7-days' | '30-days' | '90-days' | 'custom-range'

interface FilterChipOption<T extends string> {
  label: string
  value: T
}

interface WorkspaceMenuItem {
  key: WorkspaceSection
  label: string
  description: string
  count?: number
  icon: React.ComponentType<{ className?: string }>
}

interface KnowledgeAsset {
  id: string
  title: string
  type: string
  domain: string
  owner: string
  language: string
  status: 'Draft' | 'In Review' | 'Approved' | 'Published' | 'Archived'
  lastUpdated: string
  versions: number
  taxonomy: string[]
}

type KpiTone = 'registered' | 'domain-mapped' | 'tag-coverage' | 'dependency-index'
type KpiTrendPoint = { t: number; v: number }

function buildKpiTrend(base: number, pattern: number[]): KpiTrendPoint[] {
  return pattern.map((delta, idx) => ({
    t: idx,
    v: Math.max(0, Number((base + delta).toFixed(2))),
  }))
}

function KpiSparkline({ data, color }: { data: KpiTrendPoint[]; color: string }) {
  const gradientId = `salvia-kpi-${color.replace('#', '')}`

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.32} />
            <stop offset="100%" stopColor={color} stopOpacity={0.03} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.8}
          fill={`url(#${gradientId})`}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function kpiCardChrome(tone: KpiTone): string {
  const base =
    'glass-card rounded-2xl p-4 transition-all duration-200 relative overflow-hidden group border ' +
    'border-white/40 dark:border-white/10 ring-1 ring-black/[0.04] dark:ring-white/[0.06] shadow-[0_14px_40px_rgba(15,23,42,0.10)] dark:shadow-[0_18px_50px_rgba(0,0,0,0.35)] ' +
    'hover:-translate-y-0.5 hover:shadow-[0_18px_56px_rgba(15,23,42,0.14)]'

  if (tone === 'registered') {
    return cn(base, 'bg-gradient-to-br from-slate-50/80 via-background/80 to-sky-50/70 dark:from-slate-900/45 dark:via-background/40 dark:to-sky-950/20')
  }

  if (tone === 'domain-mapped') {
    return cn(base, 'bg-gradient-to-br from-indigo-50/70 via-background/80 to-violet-50/70 dark:from-indigo-950/20 dark:via-background/40 dark:to-violet-950/20')
  }

  if (tone === 'tag-coverage') {
    return cn(base, 'bg-gradient-to-br from-emerald-50/65 via-background/80 to-cyan-50/65 dark:from-emerald-950/20 dark:via-background/40 dark:to-cyan-950/15')
  }

  return cn(base, 'bg-gradient-to-br from-amber-50/70 via-background/80 to-orange-50/70 dark:from-amber-950/18 dark:via-background/40 dark:to-orange-950/18')
}

const statusBreakdown = [
  { name: 'Draft', value: 94, color: '#f97316' },
  { name: 'In Review', value: 48, color: '#fb923c' },
  { name: 'Approved', value: 126, color: '#22c55e' },
  { name: 'Published', value: 642, color: '#15803d' },
  { name: 'Archived', value: 57, color: '#b91c1c' },
]

const contentGrowth = [
  { month: 'Nov', published: 498, draft: 64 },
  { month: 'Dec', published: 526, draft: 71 },
  { month: 'Jan', published: 551, draft: 66 },
  { month: 'Feb', published: 578, draft: 74 },
  { month: 'Mar', published: 615, draft: 86 },
  { month: 'Apr', published: 642, draft: 94 },
]

const languageDistribution = [
  { language: 'English', count: 611 },
  { language: 'Indonesian', count: 214 },
  { language: 'Bilingual', count: 167 },
  { language: 'Other', count: 31 },
]

const recentActivity = [
  {
    time: '09:15',
    actor: 'Rina Pratama',
    action: 'published',
    target: 'KYC Exception Handling Guideline v4.2',
  },
  {
    time: '08:40',
    actor: 'David Hartono',
    action: 'submitted for review',
    target: 'Collection Call Compliance Script - EN Variant',
  },
  {
    time: 'Yesterday',
    actor: 'Elisa M.',
    action: 'archived',
    target: 'Legacy Branch SOP v2.0',
  },
  {
    time: 'Yesterday',
    actor: 'Nadya F.',
    action: 'linked taxonomy',
    target: 'Retail Loan Delinquency Resolution Playbook',
  },
]

const menuItems: WorkspaceMenuItem[] = [
  {
    key: 'overview',
    label: 'Overview',
    description: 'Repository health and maturity overview',
    icon: LayoutGrid,
  },
  {
    key: 'library',
    label: 'Knowledge Library',
    description: 'Governed enterprise knowledge assets',
    count: 967,
    icon: FolderKanban,
  },
  {
    key: 'explorer',
    label: 'Content Explorer',
    description: 'Hierarchy, taxonomy, and relationships',
    count: 134,
    icon: ListTree,
  },
  {
    key: 'editor',
    label: 'Knowledge Editor',
    description: 'Structured authoring workspace',
    count: 28,
    icon: PencilLine,
  },
  {
    key: 'version',
    label: 'Version History',
    description: 'Audit and rollback traceability',
    count: 412,
    icon: History,
  },
  {
    key: 'lifecycle',
    label: 'Content Lifecycle Manager',
    description: 'Governance and publication control',
    count: 73,
    icon: GitBranch,
  },
]

const statusOptions: FilterChipOption<StatusFilter>[] = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'In Review', value: 'in-review' },
  { label: 'Approved', value: 'approved' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' },
]

const typeOptions: FilterChipOption<TypeFilter>[] = [
  { label: 'Document', value: 'document' },
  { label: 'Wiki Page', value: 'wiki-page' },
  { label: 'PDF', value: 'pdf' },
  { label: 'Image', value: 'image' },
  { label: 'Video', value: 'video' },
  { label: 'Policy', value: 'policy' },
  { label: 'SOP', value: 'sop' },
  { label: 'Knowledge Note', value: 'knowledge-note' },
]

const languageOptions: FilterChipOption<LanguageFilter>[] = [
  { label: 'English', value: 'english' },
  { label: 'Indonesian', value: 'indonesian' },
  { label: 'Bilingual', value: 'bilingual' },
  { label: 'Other', value: 'other' },
]

const domainOptions: FilterChipOption<DomainFilter>[] = [
  { label: 'Customer', value: 'customer' },
  { label: 'Loan', value: 'loan' },
  { label: 'Collection', value: 'collection' },
  { label: 'Finance', value: 'finance' },
  { label: 'Risk', value: 'risk' },
  { label: 'Compliance', value: 'compliance' },
  { label: 'Operations', value: 'operations' },
]

const timeOptions: FilterChipOption<TimeFilter>[] = [
  { label: 'Today', value: 'today' },
  { label: '7 Days', value: '7-days' },
  { label: '30 Days', value: '30-days' },
  { label: '90 Days', value: '90-days' },
  { label: 'Custom Range', value: 'custom-range' },
]

const knowledgeAssets: KnowledgeAsset[] = [
  {
    id: 'KNW-1084',
    title: 'Retail Loan Restructuring Policy 2026',
    type: 'Policy',
    domain: 'Loan',
    owner: 'Risk Policy Office',
    language: 'English',
    status: 'Published',
    lastUpdated: '2026-04-10',
    versions: 14,
    taxonomy: ['Risk', 'Retail Lending', 'Policy'],
  },
  {
    id: 'KNW-1103',
    title: 'Customer Complaint Escalation SOP',
    type: 'SOP',
    domain: 'Customer',
    owner: 'Service Operations',
    language: 'Bilingual',
    status: 'In Review',
    lastUpdated: '2026-04-12',
    versions: 8,
    taxonomy: ['Customer Service', 'Operational Control'],
  },
  {
    id: 'KNW-1121',
    title: 'AML Trigger Investigation Playbook',
    type: 'Wiki Page',
    domain: 'Compliance',
    owner: 'Compliance Intelligence',
    language: 'English',
    status: 'Approved',
    lastUpdated: '2026-04-09',
    versions: 5,
    taxonomy: ['AML', 'Investigation', 'Playbook'],
  },
  {
    id: 'KNW-0917',
    title: 'Legacy Collection Script 2022',
    type: 'Document',
    domain: 'Collection',
    owner: 'Collection Governance',
    language: 'Indonesian',
    status: 'Archived',
    lastUpdated: '2026-03-18',
    versions: 11,
    taxonomy: ['Collection', 'Legacy'],
  },
]

const lifecycleRows = [
  {
    title: 'Loan Disbursement Exception Guideline',
    status: 'In Review',
    owner: 'Loan Operations Office',
    approver: 'Head of Risk Governance',
    reviewDate: '2026-04-21',
    expiration: 'Needs review in 7 days',
    publication: 'Pending Publish',
    archiveEligible: 'No',
  },
  {
    title: 'Customer Data Rectification Procedure',
    status: 'Approved',
    owner: 'Data Governance Unit',
    approver: 'Chief Data Steward',
    reviewDate: '2026-05-02',
    expiration: 'Healthy',
    publication: 'Ready to Publish',
    archiveEligible: 'No',
  },
  {
    title: 'Credit Analyst Onboarding Handbook',
    status: 'Published',
    owner: 'Learning and Enablement',
    approver: 'HR Knowledge Owner',
    reviewDate: '2026-08-14',
    expiration: 'Healthy',
    publication: 'Published',
    archiveEligible: 'Yes',
  },
]

const versionRows = [
  {
    version: 'v4.2.1',
    title: 'KYC Exception Handling Guideline',
    modifiedBy: 'Rina Pratama',
    summary: 'Updated branch escalation matrix and mandatory evidence fields.',
    date: '2026-04-12 09:15',
    status: 'Published',
    rollback: 'Eligible',
    compare: 'Available',
  },
  {
    version: 'v4.1.0',
    title: 'KYC Exception Handling Guideline',
    modifiedBy: 'Ahmad Ridwan',
    summary: 'Added bilingual appendix and regional review notes.',
    date: '2026-03-29 14:20',
    status: 'Approved',
    rollback: 'Eligible',
    compare: 'Available',
  },
  {
    version: 'v4.0.0',
    title: 'KYC Exception Handling Guideline',
    modifiedBy: 'Sinta A.',
    summary: 'Major revision aligned with Risk Policy 2026 baseline.',
    date: '2026-02-11 10:42',
    status: 'Published',
    rollback: 'Eligible',
    compare: 'Available',
  },
]

function StatusPill({ status }: { status: KnowledgeAsset['status'] | string }) {
  const className =
    status === 'Published'
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : status === 'Approved'
        ? 'bg-green-100 text-green-700 border-green-200'
        : status === 'In Review'
          ? 'bg-orange-100 text-orange-700 border-orange-200'
          : status === 'Draft'
            ? 'bg-amber-100 text-amber-700 border-amber-200'
            : 'bg-rose-100 text-rose-700 border-rose-200'

  return <Badge className={cn('border text-[11px] font-medium', className)}>{status}</Badge>
}

function FilterChips<T extends string>({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string
  options: FilterChipOption<T>[]
  selected: Set<T>
  onToggle: (value: T) => void
}) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.has(option.value)
          return (
            <button
              type="button"
              key={option.value}
              onClick={() => onToggle(option.value)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                active
                  ? 'border-emerald-300 bg-emerald-100 text-emerald-800 shadow-sm'
                  : 'border-slate-200 bg-white/85 text-slate-600 hover:border-slate-300 hover:text-slate-800',
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SectionShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="glass-card rounded-2xl border border-emerald-100/70 p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-900">{title}</h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">{subtitle}</p>
      </div>
      {children}
    </section>
  )
}

function OverviewSection() {
  return (
    <div className="space-y-5">
      <SectionShell
        title="Repository Health Overview"
        subtitle="Executive summary of repository maturity, content governance, and multilingual readiness."
      >
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          <div className="xl:col-span-3 rounded-2xl border border-slate-200 bg-white/90 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">Published and Draft Growth</h3>
              <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200">+8.4% QoQ</Badge>
            </div>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={contentGrowth} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="publishedFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#166534" stopOpacity={0.32} />
                      <stop offset="95%" stopColor="#166534" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="draftFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="published" stroke="#166534" fill="url(#publishedFill)" strokeWidth={2.2} />
                  <Area type="monotone" dataKey="draft" stroke="#f97316" fill="url(#draftFill)" strokeWidth={2.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white/90 p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Lifecycle State Breakdown</h3>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusBreakdown}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={86}
                    stroke="#ffffff"
                    strokeWidth={2}
                  >
                    {statusBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </SectionShell>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <SectionShell
          title="Knowledge Type Summary"
          subtitle="Enterprise content mix by governed asset class."
        >
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { type: 'Policy', count: 212 },
                  { type: 'SOP', count: 186 },
                  { type: 'Wiki', count: 264 },
                  { type: 'PDF', count: 173 },
                  { type: 'Note', count: 132 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="type" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#334155" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionShell>

        <SectionShell
          title="Language Coverage"
          subtitle="Readiness status for multilingual enterprise adoption."
        >
          <div className="space-y-2.5">
            {languageDistribution.map((item) => (
              <div key={item.language} className="rounded-xl border border-slate-200 bg-white/90 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{item.language}</span>
                  <span className="font-semibold text-slate-900">{item.count}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                    style={{ width: `${Math.max(8, (item.count / 611) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionShell>

        <SectionShell
          title="Recent Repository Activity"
          subtitle="Latest governance events across content lifecycle and ownership."
        >
          <div className="space-y-3">
            {recentActivity.map((event) => (
              <div key={`${event.time}-${event.target}`} className="flex gap-3 rounded-xl border border-slate-200 bg-white/90 p-3">
                <div className="mt-0.5">
                  <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-slate-600" />
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">{event.time}</p>
                  <p className="text-sm text-slate-800">
                    <span className="font-semibold">{event.actor}</span> {event.action}
                  </p>
                  <p className="text-xs text-slate-600 truncate">{event.target}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionShell>
      </div>
    </div>
  )
}

function KnowledgeLibrarySection({ onOpenDetail }: { onOpenDetail: (label: string) => void }) {
  return (
    <SectionShell
      title="Knowledge Library"
      subtitle="Operational repository for governed enterprise knowledge assets and metadata visibility."
    >
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white/95">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50/95">
            <tr className="text-left text-xs uppercase tracking-[0.08em] text-slate-500">
              <th className="px-4 py-3">Content Title</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Domain</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Language</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3">Versions</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {knowledgeAssets.map((asset) => (
              <tr key={asset.id} className="border-t border-slate-200/80 hover:bg-emerald-50/35 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-900">{asset.title}</p>
                  <p className="text-xs text-slate-500">{asset.id}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {asset.taxonomy.map((tag) => (
                      <Badge key={tag} className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px]">{tag}</Badge>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge className="bg-blue-100 text-blue-700 border border-blue-200">{asset.type}</Badge>
                </td>
                <td className="px-4 py-3 text-slate-700">{asset.domain}</td>
                <td className="px-4 py-3 text-slate-700">{asset.owner}</td>
                <td className="px-4 py-3">
                  <Badge className="bg-violet-100 text-violet-700 border border-violet-200">{asset.language}</Badge>
                </td>
                <td className="px-4 py-3">
                  <StatusPill status={asset.status} />
                </td>
                <td className="px-4 py-3 text-slate-700">{asset.lastUpdated}</td>
                <td className="px-4 py-3 text-slate-700">{asset.versions}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {['Open', 'Metadata', 'Edit', 'Versions', 'Status', 'Archive'].map((action) => (
                      <button
                        key={action}
                        type="button"
                        onClick={() => onOpenDetail(`${action}: ${asset.title}`)}
                        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
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
    </SectionShell>
  )
}

function ContentExplorerSection({ onOpenDetail }: { onOpenDetail: (label: string) => void }) {
  const hierarchyData = [
    { name: 'Retail Banking', nodes: 64, links: 142 },
    { name: 'Loan Operations', nodes: 58, links: 121 },
    { name: 'Collection', nodes: 49, links: 98 },
    { name: 'Compliance', nodes: 37, links: 73 },
    { name: 'Finance', nodes: 31, links: 62 },
  ]

  const tagClusters = [
    { cluster: 'Operational SOP', count: 146 },
    { cluster: 'Policy Governance', count: 119 },
    { cluster: 'Customer Resolution', count: 104 },
    { cluster: 'Risk Controls', count: 97 },
    { cluster: 'Regulatory', count: 83 },
  ]

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <SectionShell
        title="Knowledge Hierarchy"
        subtitle="Folder and domain structure with governed ownership paths."
      >
        <div className="space-y-3">
          {hierarchyData.map((item) => (
            <div key={item.name} className="rounded-xl border border-slate-200 bg-white/95 p-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">{item.name}</p>
                <button
                  type="button"
                  onClick={() => onOpenDetail(`Open Content Group: ${item.name}`)}
                  className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
                >
                  Open Content Group
                </button>
              </div>
              <p className="text-xs text-slate-600 mt-1">{item.nodes} assets, {item.links} cross-links</p>
              <div className="mt-2 h-2 rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-slate-500 to-emerald-600" style={{ width: `${(item.nodes / 64) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        title="Taxonomy and Tag Clusters"
        subtitle="Structured categorization with practical domain tagging density."
      >
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={tagClusters} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="cluster" tick={{ fontSize: 10, fill: '#475569' }} />
              <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#0f766e" strokeWidth={2.2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {['Assign Taxonomy', 'Add Tag', 'Move Content', 'Open Structure Detail'].map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => onOpenDetail(action)}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:border-teal-300 hover:text-teal-700"
            >
              {action}
            </button>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        title="Related Knowledge Links"
        subtitle="Cross-linked content panels for contextual discovery and reuse."
      >
        <div className="space-y-3">
          {[
            {
              title: 'Loan Origination Policy Framework',
              links: ['Credit Scoring SOP', 'KYC Exception Handling', 'Collateral Valuation Rulebook'],
            },
            {
              title: 'Collection Resolution Runbook',
              links: ['Customer Hardship Matrix', 'Legal Escalation SOP', 'Dispute Handling Guideline'],
            },
          ].map((card) => (
            <div key={card.title} className="rounded-xl border border-slate-200 bg-white/95 p-3">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-slate-900 text-sm">{card.title}</p>
                <button
                  type="button"
                  onClick={() => onOpenDetail(`View Related Knowledge: ${card.title}`)}
                  className="text-xs font-medium text-emerald-700"
                >
                  View Related Knowledge
                </button>
              </div>
              <ul className="mt-2 space-y-1.5">
                {card.links.map((link) => (
                  <li key={link} className="text-xs text-slate-600 flex items-center gap-2">
                    <ArrowRightLeft className="h-3.5 w-3.5 text-slate-400" />
                    {link}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </SectionShell>
    </div>
  )
}

function EditorSection({ onOpenDetail }: { onOpenDetail: (label: string) => void }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
      <div className="xl:col-span-3">
        <SectionShell
          title="Knowledge Editor Workspace"
          subtitle="Wiki-style structured authoring with enterprise governance discipline."
        >
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 flex items-center gap-2 text-amber-800 text-sm">
            <TriangleAlert className="h-4 w-4" />
            Draft mode is active. Last autosave occurred at 10:24 AM.
          </div>

          <div className="mt-4 space-y-3">
            <Input className="h-10 bg-white" value="Customer Complaint Escalation SOP" readOnly />
            <div className="rounded-xl border border-slate-200 bg-white/95 p-4 min-h-[300px] space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-slate-100 text-slate-700 border border-slate-200">H1</Badge>
                <Badge className="bg-slate-100 text-slate-700 border border-slate-200">Table</Badge>
                <Badge className="bg-slate-100 text-slate-700 border border-slate-200">Callout</Badge>
                <Badge className="bg-slate-100 text-slate-700 border border-slate-200">Reference</Badge>
              </div>
              <div className="space-y-2 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">1. Scope and Purpose</p>
                <p>
                  This SOP defines controlled escalation procedures for customer complaints in branch and digital service channels.
                </p>
                <p className="font-semibold text-slate-900">2. Escalation Criteria</p>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                  Include severity level, service impact, and legal risk category before initiating level-2 escalation.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {['Save Draft', 'Submit for Review', 'Publish Content', 'Insert Reference', 'Attach File', 'Preview Content', 'Open Linked Knowledge'].map((action) => (
              <button
                key={action}
                type="button"
                onClick={() => onOpenDetail(action)}
                className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
              >
                {action}
              </button>
            ))}
          </div>
        </SectionShell>
      </div>

      <div className="space-y-4">
        <SectionShell
          title="Metadata"
          subtitle="Ownership, language, and version context."
        >
          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex justify-between"><span>Current Version</span><span className="font-semibold">v2.3 Draft</span></div>
            <div className="flex justify-between"><span>Author</span><span className="font-semibold">David Hartono</span></div>
            <div className="flex justify-between"><span>Language</span><span className="font-semibold">Bilingual</span></div>
            <div className="flex justify-between"><span>Last Saved</span><span className="font-semibold">10:24 AM</span></div>
          </div>
        </SectionShell>

        <SectionShell
          title="Attachments and References"
          subtitle="Embedded supporting artifacts and linked knowledge."
        >
          <div className="space-y-2">
            {[
              'Branch Escalation Matrix 2026.pdf',
              'Complaint Severity Rubric.xlsx',
              'Legal Case Reference Notes.docx',
            ].map((item) => (
              <div key={item} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-slate-500" />
                {item}
              </div>
            ))}
          </div>
        </SectionShell>
      </div>
    </div>
  )
}

function VersionSection({ onOpenDetail }: { onOpenDetail: (label: string) => void }) {
  return (
    <div className="space-y-4">
      <SectionShell
        title="Version History Timeline"
        subtitle="Auditable traceability of content evolution with compare and rollback awareness."
      >
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white/95">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50/95">
              <tr className="text-left text-xs uppercase tracking-[0.08em] text-slate-500">
                <th className="px-4 py-3">Version</th>
                <th className="px-4 py-3">Content Title</th>
                <th className="px-4 py-3">Modified By</th>
                <th className="px-4 py-3">Change Summary</th>
                <th className="px-4 py-3">Modified Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Rollback</th>
                <th className="px-4 py-3">Compare</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {versionRows.map((row) => (
                <tr key={row.version} className="border-t border-slate-200/80 hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-semibold text-slate-900">{row.version}</td>
                  <td className="px-4 py-3 text-slate-700">{row.title}</td>
                  <td className="px-4 py-3 text-slate-700">{row.modifiedBy}</td>
                  <td className="px-4 py-3 text-slate-700 max-w-[360px]">{row.summary}</td>
                  <td className="px-4 py-3 text-slate-700">{row.date}</td>
                  <td className="px-4 py-3"><StatusPill status={row.status} /></td>
                  <td className="px-4 py-3 text-slate-700">{row.rollback}</td>
                  <td className="px-4 py-3 text-slate-700">{row.compare}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {['View Version Detail', 'Compare Versions', 'Restore Version', 'Open Change Summary', 'View Editor Activity', 'Export Version Record'].map((action) => (
                        <button
                          key={action}
                          type="button"
                          onClick={() => onOpenDetail(`${action}: ${row.version}`)}
                          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 hover:border-blue-300 hover:text-blue-700"
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
      </SectionShell>
    </div>
  )
}

function LifecycleSection({ onOpenDetail }: { onOpenDetail: (label: string) => void }) {
  return (
    <SectionShell
      title="Content Lifecycle Manager"
      subtitle="Governance-focused control over draft, review, approval, publication, and archival progression."
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        <div className="rounded-xl border border-orange-200 bg-orange-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-orange-700">Review Queue</p>
          <p className="text-2xl font-bold text-orange-800 mt-1">37</p>
          <p className="text-xs text-orange-700 mt-1">Content requires reviewer decision within 5 business days.</p>
        </div>
        <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-rose-700">Expiration Alerts</p>
          <p className="text-2xl font-bold text-rose-800 mt-1">12</p>
          <p className="text-xs text-rose-700 mt-1">Published assets approaching mandatory review schedule.</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-emerald-700">Governance Compliance</p>
          <p className="text-2xl font-bold text-emerald-800 mt-1">96.8%</p>
          <p className="text-xs text-emerald-700 mt-1">Assets with owner, approver, and valid review schedule.</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white/95">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50/95">
            <tr className="text-left text-xs uppercase tracking-[0.08em] text-slate-500">
              <th className="px-4 py-3">Content Title</th>
              <th className="px-4 py-3">Lifecycle Status</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Approver</th>
              <th className="px-4 py-3">Review Date</th>
              <th className="px-4 py-3">Expiration</th>
              <th className="px-4 py-3">Publication State</th>
              <th className="px-4 py-3">Archive Eligibility</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {lifecycleRows.map((row) => (
              <tr key={row.title} className="border-t border-slate-200/80 hover:bg-emerald-50/35">
                <td className="px-4 py-3 font-semibold text-slate-900">{row.title}</td>
                <td className="px-4 py-3"><StatusPill status={row.status} /></td>
                <td className="px-4 py-3 text-slate-700">{row.owner}</td>
                <td className="px-4 py-3 text-slate-700">{row.approver}</td>
                <td className="px-4 py-3 text-slate-700">{row.reviewDate}</td>
                <td className="px-4 py-3 text-slate-700">{row.expiration}</td>
                <td className="px-4 py-3 text-slate-700">{row.publication}</td>
                <td className="px-4 py-3 text-slate-700">{row.archiveEligible}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {['Open Lifecycle Detail', 'Submit for Approval', 'Approve Content', 'Publish Content', 'Archive Content', 'Assign Reviewer', 'Set Review Date'].map((action) => (
                      <button
                        key={action}
                        type="button"
                        onClick={() => onOpenDetail(`${action}: ${row.title}`)}
                        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
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
    </SectionShell>
  )
}

export function KnowledgeRepositoryContentManagementPage() {
  const { addToast } = useToast()
  const [activeSection, setActiveSection] = useState<WorkspaceSection>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [filtersVisible, setFiltersVisible] = useState(true)
  const [drawerLabel, setDrawerLabel] = useState<string | null>(null)

  const [statusFilter, setStatusFilter] = useState<Set<StatusFilter>>(new Set(['all']))
  const [typeFilter, setTypeFilter] = useState<Set<TypeFilter>>(new Set(['document', 'wiki-page', 'pdf']))
  const [languageFilter, setLanguageFilter] = useState<Set<LanguageFilter>>(new Set(['english', 'bilingual']))
  const [domainFilter, setDomainFilter] = useState<Set<DomainFilter>>(new Set(['loan', 'customer', 'compliance']))
  const [timeFilter, setTimeFilter] = useState<Set<TimeFilter>>(new Set(['30-days']))

  const kpiWatermark = useCallback((icon: React.ReactNode, extraClassName?: string) => {
    if (!isValidElement(icon)) return icon
    const prev = String((icon.props as { className?: string })?.className ?? '')
    return cloneElement(icon, {
      className: cn(prev, extraClassName, 'h-20 w-20'),
      'aria-hidden': true,
      focusable: false,
    })
  }, [])

  const kpiCards = useMemo(
    () => [
      {
        label: 'Total Knowledge Assets',
        value: '967',
        description: 'Governed enterprise assets',
        trend: buildKpiTrend(920, [0, 8, 14, 19, 31, 47]),
        trendColor: '#0ea5e9',
        tone: 'registered' as KpiTone,
        icon: <FolderKanban className="h-4 w-4 text-primary" />,
        section: 'library' as WorkspaceSection,
      },
      {
        label: 'Published Content',
        value: '642',
        description: 'Approved production knowledge',
        trend: buildKpiTrend(598, [0, 7, 12, 18, 27, 44]),
        trendColor: '#10b981',
        tone: 'tag-coverage' as KpiTone,
        icon: <CheckCircle2 className="h-4 w-4 text-primary" />,
        section: 'lifecycle' as WorkspaceSection,
      },
      {
        label: 'Drafts Pending Review',
        value: '48',
        description: 'Awaiting governance signoff',
        trend: buildKpiTrend(32, [0, 2, 4, 9, 11, 16]),
        trendColor: '#14b8a6',
        tone: 'tag-coverage' as KpiTone,
        icon: <Clock3 className="h-4 w-4 text-primary" />,
        section: 'lifecycle' as WorkspaceSection,
      },
      {
        label: 'Archived Content',
        value: '57',
        description: 'Retained audit evidence',
        trend: buildKpiTrend(46, [0, 1, 2, 4, 7, 11]),
        trendColor: '#38bdf8',
        tone: 'registered' as KpiTone,
        icon: <Archive className="h-4 w-4 text-primary" />,
        section: 'library' as WorkspaceSection,
      },
      {
        label: 'Languages Supported',
        value: '4',
        description: 'Localized content variants',
        trend: buildKpiTrend(2.4, [0, 0.2, 0.35, 0.6, 0.95, 1.6]),
        trendColor: '#8b5cf6',
        tone: 'domain-mapped' as KpiTone,
        icon: <Languages className="h-4 w-4 text-primary" />,
        section: 'overview' as WorkspaceSection,
      },
      {
        label: 'Content Updated This Month',
        value: '183',
        description: 'Tracked monthly updates',
        trend: buildKpiTrend(132, [0, 6, 14, 19, 31, 51]),
        trendColor: '#f59e0b',
        tone: 'dependency-index' as KpiTone,
        icon: <Sparkles className="h-4 w-4 text-primary" />,
        section: 'version' as WorkspaceSection,
      },
    ],
    []
  )

  const toggleGenericFilter = <T extends string>(
    value: T,
    state: Set<T>,
    setState: React.Dispatch<React.SetStateAction<Set<T>>>
  ) => {
    setState((current) => {
      const next = new Set(current)
      if (next.has(value)) {
        next.delete(value)
      } else {
        next.add(value)
      }

      if (next.size === 0) {
        return new Set(state)
      }

      return next
    })
  }

  const toggleStatusFilter = (value: StatusFilter) => {
    if (value === 'all') {
      setStatusFilter(new Set(['all']))
      return
    }

    setStatusFilter((current) => {
      const next = new Set(current)
      next.delete('all')

      if (next.has(value)) {
        next.delete(value)
      } else {
        next.add(value)
      }

      if (next.size === 0) {
        next.add('all')
      }

      return next
    })
  }

  const renderSection = () => {
    if (activeSection === 'overview') {
      return <OverviewSection />
    }
    if (activeSection === 'library') {
      return <KnowledgeLibrarySection onOpenDetail={setDrawerLabel} />
    }
    if (activeSection === 'explorer') {
      return <ContentExplorerSection onOpenDetail={setDrawerLabel} />
    }
    if (activeSection === 'editor') {
      return <EditorSection onOpenDetail={setDrawerLabel} />
    }
    if (activeSection === 'version') {
      return <VersionSection onOpenDetail={setDrawerLabel} />
    }
    return <LifecycleSection onOpenDetail={setDrawerLabel} />
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Knowledge Repository & Content Management' }]} />

      <PageHeader
        title="Knowledge Repository & Content Management"
        description="Central enterprise workspace for governed knowledge repository control, structured authoring, traceable versioning, multilingual readiness, and lifecycle discipline."
        right={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-muted/30 p-1.5 shadow-sm">
              <button
                type="button"
                onClick={() =>
                  addToast({
                    title: 'Knowledge repository synced',
                    description: 'Latest repository overview and content workspace state have been refreshed.',
                    variant: 'success',
                  })
                }
                className="flex items-center justify-center rounded-lg p-2.5 text-muted-foreground transition-all duration-200 hover:bg-background hover:text-foreground hover:shadow-sm"
                aria-label="Sync"
                title="Sync"
              >
                <RefreshCw className="h-5 w-5" strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={() =>
                  addToast({
                    title: 'Repository export queued',
                    description: 'Knowledge repository export has been staged for the next delivery step.',
                    variant: 'success',
                  })
                }
                className="flex items-center justify-center rounded-lg p-2.5 text-muted-foreground transition-all duration-200 hover:bg-background hover:text-foreground hover:shadow-sm"
                aria-label="Export repository"
                title="Export repository"
              >
                <Download className="h-5 w-5" strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={() => setFiltersVisible((current) => !current)}
                className={cn(
                  'flex items-center justify-center rounded-lg p-2.5 text-muted-foreground transition-all duration-200 hover:bg-background hover:text-foreground hover:shadow-sm',
                  filtersVisible && 'bg-background text-foreground shadow-sm ring-1 ring-border/50'
                )}
                aria-label={filtersVisible ? 'Hide filter panel' : 'Show filter panel'}
                title={filtersVisible ? 'Hide filter panel' : 'Show filter panel'}
              >
                <Filter className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpiCards.map((card) => {
          return (
            <button
              type="button"
              key={card.label}
              onClick={() => setActiveSection(card.section)}
              className={cn(
                kpiCardChrome(card.tone),
                'h-[106px] cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
                activeSection === card.section && 'shadow-[0_18px_56px_rgba(15,23,42,0.14)]'
              )}
            >
              <div className="relative flex h-full flex-col">
                <div className="pointer-events-none absolute -right-3 -bottom-4 opacity-[0.08] transition-all duration-500 group-hover:scale-110 group-hover:opacity-[0.12]">
                  {kpiWatermark(card.icon)}
                </div>
                <div className="text-xs text-muted-foreground">{card.label}</div>
                <div className="mt-1 flex items-center gap-3">
                  <div className="shrink-0 text-2xl font-bold leading-none text-foreground">{card.value}</div>
                  <div className="h-9 min-w-0 flex-1">
                    <KpiSparkline data={card.trend} color={card.trendColor} />
                  </div>
                </div>
                <div className="mt-auto flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
                  {card.icon}
                  <span className="truncate leading-4">{card.description}</span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)] gap-5 items-start">
        <aside className="xl:sticky xl:top-20 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-md p-3 space-y-2">
          {menuItems.map((item) => {
            const isActive = item.key === activeSection
            const Icon = item.icon
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveSection(item.key)}
                className={cn(
                  'w-full rounded-xl border px-3 py-3 text-left transition-all',
                  isActive
                    ? 'border-emerald-300 bg-emerald-50 shadow-sm'
                    : 'border-transparent bg-transparent hover:border-slate-200 hover:bg-white/90'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'mt-0.5 rounded-lg border p-2',
                    isActive ? 'border-emerald-200 bg-emerald-100' : 'border-slate-200 bg-slate-100'
                  )}>
                    <Icon className={cn('h-4 w-4', isActive ? 'text-emerald-700' : 'text-slate-600')} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn('text-sm font-semibold', isActive ? 'text-emerald-800' : 'text-slate-900')}>
                        {item.label}
                      </p>
                      {typeof item.count === 'number' ? (
                        <Badge className={cn(
                          'text-[10px] border',
                          isActive
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        )}>
                          {item.count}
                        </Badge>
                      ) : null}
                    </div>
                    <p className={cn('text-xs mt-1', isActive ? 'text-emerald-700' : 'text-slate-600')}>
                      {item.description}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </aside>

        <div className="space-y-5">
          <section className="glass-card rounded-2xl border border-slate-200/90 p-4 sm:p-5 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-10 w-full pl-9 text-sm bg-white"
                placeholder="Search by title, article name, tag, taxonomy category, owner, language, type, status, or version ID"
              />
            </div>

            {filtersVisible ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <FilterChips label="Status" options={statusOptions} selected={statusFilter} onToggle={toggleStatusFilter} />
                <FilterChips
                  label="Content Type"
                  options={typeOptions}
                  selected={typeFilter}
                  onToggle={(value) => toggleGenericFilter(value, typeFilter, setTypeFilter)}
                />
                <FilterChips
                  label="Language"
                  options={languageOptions}
                  selected={languageFilter}
                  onToggle={(value) => toggleGenericFilter(value, languageFilter, setLanguageFilter)}
                />
                <FilterChips
                  label="Domain"
                  options={domainOptions}
                  selected={domainFilter}
                  onToggle={(value) => toggleGenericFilter(value, domainFilter, setDomainFilter)}
                />
                <FilterChips
                  label="Time"
                  options={timeOptions}
                  selected={timeFilter}
                  onToggle={(value) => toggleGenericFilter(value, timeFilter, setTimeFilter)}
                />
              </div>
            ) : null}
          </section>

          <div>{renderSection()}</div>
        </div>
      </div>

      {drawerLabel ? (
        <div className="fixed right-0 top-0 h-full w-full sm:w-[460px] bg-white shadow-2xl border-l border-slate-200 z-[1200]">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Detail Drawer</p>
              <p className="text-sm font-semibold text-slate-900">{drawerLabel}</p>
            </div>
            <button
              type="button"
              className="rounded-md border border-slate-200 p-1.5 hover:bg-slate-100"
              onClick={() => setDrawerLabel(null)}
              aria-label="Close detail drawer"
            >
              <X className="h-4 w-4 text-slate-600" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              This detail drawer simulates operational controls for metadata, lifecycle transitions, version comparison, and audit-level content context.
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2.5">
                <span className="flex items-center gap-2"><UserCheck className="h-3.5 w-3.5 text-slate-500" /> Owner</span>
                <span className="font-semibold">Service Operations</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2.5">
                <span className="flex items-center gap-2"><Globe2 className="h-3.5 w-3.5 text-slate-500" /> Language Variant</span>
                <span className="font-semibold">English + Indonesian</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2.5">
                <span className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-slate-500" /> Governance Level</span>
                <span className="font-semibold">Controlled</span>
              </div>
            </div>

            <Button className="h-10 w-full">
              Open Full Detail
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
