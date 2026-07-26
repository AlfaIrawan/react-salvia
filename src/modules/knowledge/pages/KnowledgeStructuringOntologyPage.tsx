import { useMemo, useState } from 'react'
import {
  Activity,
  ArrowUpDown,
  BrainCircuit,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  FileSearch,
  Filter,
  FolderTree,
  Link2,
  Network,
  Search,
  Sparkles,
  Tags,
  Target,
  Waypoints,
} from 'lucide-react'
import {
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
  | 'taxonomy'
  | 'ontology'
  | 'graph'
  | 'tagging'

type SortDirection = 'asc' | 'desc'
type TaxonomySortKey =
  | 'name'
  | 'domain'
  | 'status'
  | 'categories'
  | 'linkedAssets'
  | 'version'
  | 'updatedAt'
type TaggingSortKey =
  | 'assetTitle'
  | 'confidence'
  | 'status'
  | 'reviewOwner'
  | 'lastReviewed'

type ConfidenceBand = 'high' | 'medium' | 'low'

interface NavItem {
  key: WorkspaceSection
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  count?: number
}

interface FilterChip<T extends string> {
  label: string
  value: T
}

interface KpiCard {
  label: string
  metric: string
  description: string
  trend: string
  icon: React.ComponentType<{ className?: string }>
}

interface TaxonomyRow {
  id: string
  name: string
  domain: string
  owner: string
  status: 'Draft' | 'Active' | 'Under Review' | 'Approved' | 'Deprecated' | 'Archived'
  categories: number
  linkedAssets: number
  updatedAt: string
  version: string
  hierarchy: string[]
}

interface OntologyEntity {
  id: string
  name: string
  entityType: string
  domain: string
  owner: string
  status: 'Draft' | 'Active' | 'Under Review' | 'Approved'
  version: string
  attributes: string[]
  relationships: string[]
  modifiedAt: string
}

interface TaggingRow {
  id: string
  assetTitle: string
  suggestedTags: string[]
  confidence: number
  source: string
  status: 'AI Suggested' | 'Approved' | 'Rejected' | 'Needs Review'
  reviewOwner: string
  linkedEntity: string
  detectedConcept: string
  lastReviewed: string
}

const sectionItems: NavItem[] = [
  {
    key: 'overview',
    label: 'Overview',
    description: 'Semantic readiness and ontology coverage command view',
    icon: Activity,
  },
  {
    key: 'taxonomy',
    label: 'Taxonomy Manager',
    description: 'Govern reusable classification and controlled vocabulary',
    icon: FolderTree,
    count: 19,
  },
  {
    key: 'ontology',
    label: 'Ontology Designer',
    description: 'Define entities, attributes, and formal relationships',
    icon: BrainCircuit,
    count: 164,
  },
  {
    key: 'graph',
    label: 'Knowledge Graph Explorer',
    description: 'Explore semantic graph connectivity and path lineage',
    icon: Waypoints,
    count: 2840,
  },
  {
    key: 'tagging',
    label: 'Semantic Tagging Panel',
    description: 'Review AI-assisted tags with traceable approval flow',
    icon: Tags,
    count: 63,
  },
]

const kpiCards: KpiCard[] = [
  {
    label: 'Active Taxonomies',
    metric: '19',
    description: 'Cross-domain taxonomy sets currently in production governance.',
    trend: '+2 this quarter',
    icon: FolderTree,
  },
  {
    label: 'Ontology Entities Defined',
    metric: '164',
    description: 'Formal entity definitions available for machine-readable reasoning.',
    trend: '+11.2% MoM',
    icon: BrainCircuit,
  },
  {
    label: 'Relationships Modeled',
    metric: '2,840',
    description: 'Mapped semantic and business relationships with source traceability.',
    trend: '+186 this month',
    icon: Link2,
  },
  {
    label: 'Semantic Tags Suggested Today',
    metric: '317',
    description: 'AI-generated candidate tags awaiting governance review.',
    trend: '81% auto-confidence > 0.80',
    icon: Sparkles,
  },
  {
    label: 'Approved Semantic Tags',
    metric: '1,924',
    description: 'Semantically approved tags available for enterprise search and AI.',
    trend: '+92 in 7 days',
    icon: Target,
  },
  {
    label: 'Knowledge Graph Nodes Connected',
    metric: '7,426',
    description: 'Connected nodes across policy, customer, product, and process knowledge.',
    trend: 'Connectivity score 91.4',
    icon: Network,
  },
]

const statusFilterOptions: FilterChip<string>[] = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Active', value: 'active' },
  { label: 'Under Review', value: 'under-review' },
  { label: 'Approved', value: 'approved' },
  { label: 'Deprecated', value: 'deprecated' },
  { label: 'Archived', value: 'archived' },
]

const objectFilterOptions: FilterChip<string>[] = [
  { label: 'Taxonomy', value: 'taxonomy' },
  { label: 'Category', value: 'category' },
  { label: 'Entity', value: 'entity' },
  { label: 'Relationship', value: 'relationship' },
  { label: 'Graph Node', value: 'graph-node' },
  { label: 'Semantic Tag', value: 'semantic-tag' },
]

const domainFilterOptions: FilterChip<string>[] = [
  { label: 'Customer', value: 'customer' },
  { label: 'Loan', value: 'loan' },
  { label: 'Collection', value: 'collection' },
  { label: 'Finance', value: 'finance' },
  { label: 'Risk', value: 'risk' },
  { label: 'Compliance', value: 'compliance' },
  { label: 'Operations', value: 'operations' },
]

const taggingModeOptions: FilterChip<string>[] = [
  { label: 'AI Suggested', value: 'ai-suggested' },
  { label: 'Manually Added', value: 'manual' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Needs Review', value: 'needs-review' },
]

const graphScopeOptions: FilterChip<string>[] = [
  { label: 'Full Graph', value: 'full-graph' },
  { label: 'Domain View', value: 'domain-view' },
  { label: 'Entity View', value: 'entity-view' },
  { label: 'Relationship View', value: 'relationship-view' },
  { label: 'Subgraph', value: 'subgraph' },
]

const timeFilterOptions: FilterChip<string>[] = [
  { label: 'Today', value: 'today' },
  { label: '7 Days', value: '7-days' },
  { label: '30 Days', value: '30-days' },
  { label: '90 Days', value: '90-days' },
  { label: 'Custom Range', value: 'custom-range' },
]

const taxonomyRows: TaxonomyRow[] = [
  {
    id: 'TX-101',
    name: 'Retail Banking Knowledge Taxonomy',
    domain: 'Customer',
    owner: 'Customer Knowledge Office',
    status: 'Active',
    categories: 34,
    linkedAssets: 428,
    updatedAt: '2026-04-13',
    version: 'v2.8',
    hierarchy: ['Customer Journey', 'Onboarding', 'KYC and Verification', 'Branch Service'],
  },
  {
    id: 'TX-214',
    name: 'Loan Policy and Product Classification',
    domain: 'Loan',
    owner: 'Credit Policy Governance',
    status: 'Approved',
    categories: 46,
    linkedAssets: 511,
    updatedAt: '2026-04-10',
    version: 'v3.1',
    hierarchy: ['Product Type', 'Collateral', 'Risk Class', 'Exception Policy'],
  },
  {
    id: 'TX-177',
    name: 'Collections and Remedial Operations Taxonomy',
    domain: 'Collection',
    owner: 'Collections Control Office',
    status: 'Under Review',
    categories: 29,
    linkedAssets: 302,
    updatedAt: '2026-04-09',
    version: 'v1.9',
    hierarchy: ['Delinquency Stage', 'Contact Strategy', 'Legal Action', 'Settlement'],
  },
  {
    id: 'TX-089',
    name: 'Regulatory and Compliance Vocabulary',
    domain: 'Compliance',
    owner: 'Compliance Assurance',
    status: 'Active',
    categories: 51,
    linkedAssets: 623,
    updatedAt: '2026-04-14',
    version: 'v4.0',
    hierarchy: ['Regulation', 'Policy Control', 'Reporting', 'Audit Evidence'],
  },
  {
    id: 'TX-047',
    name: 'Legacy Product Glossary 2019',
    domain: 'Finance',
    owner: 'Knowledge Migration Team',
    status: 'Deprecated',
    categories: 18,
    linkedAssets: 97,
    updatedAt: '2026-03-21',
    version: 'v1.3',
    hierarchy: ['Legacy Terms', 'Retired Product', 'Deprecated Rule'],
  },
]

const ontologyEntities: OntologyEntity[] = [
  {
    id: 'EN-001',
    name: 'CustomerProfile',
    entityType: 'Master Entity',
    domain: 'Customer',
    owner: 'Data Governance Office',
    status: 'Approved',
    version: 'v3.2',
    attributes: ['customerId', 'segment', 'riskRating', 'kycStatus'],
    relationships: ['owns LoanAccount', 'subjectTo PolicyRule', 'linkedTo ContactChannel'],
    modifiedAt: '2026-04-11',
  },
  {
    id: 'EN-032',
    name: 'LoanAgreement',
    entityType: 'Contract Entity',
    domain: 'Loan',
    owner: 'Credit Architecture Team',
    status: 'Active',
    version: 'v2.6',
    attributes: ['agreementNo', 'productType', 'tenor', 'effectiveDate'],
    relationships: ['governedBy PolicyRule', 'references CollateralAsset', 'mappedTo RiskClass'],
    modifiedAt: '2026-04-12',
  },
  {
    id: 'EN-077',
    name: 'RegulationReference',
    entityType: 'Reference Entity',
    domain: 'Compliance',
    owner: 'Regulatory Intelligence Unit',
    status: 'Under Review',
    version: 'v1.8',
    attributes: ['regulationCode', 'effectivePeriod', 'jurisdiction'],
    relationships: ['constrains PolicyRule', 'evidencedBy ComplianceDocument'],
    modifiedAt: '2026-04-13',
  },
  {
    id: 'EN-099',
    name: 'CollectionWorkflowStep',
    entityType: 'Process Entity',
    domain: 'Collection',
    owner: 'Collection Transformation Office',
    status: 'Draft',
    version: 'v0.9',
    attributes: ['stepName', 'triggerEvent', 'slaWindow', 'outcomeState'],
    relationships: ['ownedBy CollectionTeam', 'appliesTo DelinquencyBucket', 'tracedTo CustomerCommunication'],
    modifiedAt: '2026-04-14',
  },
]

const semanticTagRows: TaggingRow[] = [
  {
    id: 'ST-4412',
    assetTitle: 'Retail Loan Restructuring Policy v4.0',
    suggestedTags: ['Restructuring', 'PolicyControl', 'LoanRisk'],
    confidence: 0.92,
    source: 'AI semantic extraction model',
    status: 'Needs Review',
    reviewOwner: 'Risk Knowledge Steward',
    linkedEntity: 'LoanAgreement',
    detectedConcept: 'Policy to Product governance linkage',
    lastReviewed: '2026-04-14',
  },
  {
    id: 'ST-4406',
    assetTitle: 'Customer KYC Remediation SOP',
    suggestedTags: ['KYC', 'CustomerProfile', 'ComplianceControl'],
    confidence: 0.88,
    source: 'AI semantic extraction model',
    status: 'Approved',
    reviewOwner: 'Compliance Knowledge Owner',
    linkedEntity: 'CustomerProfile',
    detectedConcept: 'Customer due diligence workflow',
    lastReviewed: '2026-04-13',
  },
  {
    id: 'ST-4398',
    assetTitle: 'Collection Escalation Matrix',
    suggestedTags: ['CollectionFlow', 'EscalationRule', 'Delinquency'],
    confidence: 0.64,
    source: 'AI semantic extraction model',
    status: 'Rejected',
    reviewOwner: 'Collections Governance Lead',
    linkedEntity: 'CollectionWorkflowStep',
    detectedConcept: 'Escalation sequence for overdue account handling',
    lastReviewed: '2026-04-12',
  },
  {
    id: 'ST-4392',
    assetTitle: 'Regulatory Reporting Guideline',
    suggestedTags: ['RegulationReference', 'ReportingControl'],
    confidence: 0.79,
    source: 'Hybrid AI + manual reviewer',
    status: 'AI Suggested',
    reviewOwner: 'Regulatory Intelligence Officer',
    linkedEntity: 'RegulationReference',
    detectedConcept: 'Regulation-driven reporting obligation',
    lastReviewed: '2026-04-14',
  },
]

const taxonomyDistribution = [
  { domain: 'Customer', taxonomies: 4, categories: 89 },
  { domain: 'Loan', taxonomies: 5, categories: 124 },
  { domain: 'Collection', taxonomies: 3, categories: 77 },
  { domain: 'Finance', taxonomies: 2, categories: 44 },
  { domain: 'Risk', taxonomies: 2, categories: 61 },
  { domain: 'Compliance', taxonomies: 3, categories: 106 },
]

const growthTrend = [
  { month: 'Nov', entities: 118, relationships: 2080 },
  { month: 'Dec', entities: 126, relationships: 2194 },
  { month: 'Jan', entities: 137, relationships: 2338 },
  { month: 'Feb', entities: 149, relationships: 2511 },
  { month: 'Mar', entities: 157, relationships: 2669 },
  { month: 'Apr', entities: 164, relationships: 2840 },
]

const relationshipDensity = [
  { name: 'Customer Domain', value: 31, color: '#3f8f6b' },
  { name: 'Loan Domain', value: 29, color: '#59b08a' },
  { name: 'Compliance Domain', value: 21, color: '#6f8ea7' },
  { name: 'Collection Domain', value: 19, color: '#98adbf' },
]

const recentSemanticActivity = [
  {
    time: '09:41',
    actor: 'Dina Rahmah',
    action: 'published ontology update',
    detail: 'LoanAgreement v2.6 promoted to Approved with 4 new semantic rules.',
  },
  {
    time: '08:58',
    actor: 'Andre Wijaya',
    action: 'approved AI semantic tags',
    detail: '42 tags approved for KYC and loan policy collections.',
  },
  {
    time: 'Yesterday',
    actor: 'Nanda Putri',
    action: 'opened inconsistency warning',
    detail: 'CustomerProfile to RegulationReference relationship missing confidence source.',
  },
  {
    time: 'Yesterday',
    actor: 'Wira Santoso',
    action: 'added taxonomy category',
    detail: 'New sub-category: Delinquency Early Prevention Workflow.',
  },
]

const graphNodes: Node[] = [
  {
    id: 'customer-profile',
    position: { x: 80, y: 120 },
    data: { label: 'CustomerProfile' },
    style: { background: '#d8f0e4', border: '1px solid #7cb79a', color: '#0f3f2b', borderRadius: 12 },
  },
  {
    id: 'loan-agreement',
    position: { x: 330, y: 80 },
    data: { label: 'LoanAgreement' },
    style: { background: '#e2f3eb', border: '1px solid #65a688', color: '#0f3f2b', borderRadius: 12 },
  },
  {
    id: 'policy-rule',
    position: { x: 560, y: 175 },
    data: { label: 'PolicyRule' },
    style: { background: '#e7eef5', border: '1px solid #8ea7bd', color: '#1f3650', borderRadius: 12 },
  },
  {
    id: 'regulation-reference',
    position: { x: 345, y: 290 },
    data: { label: 'RegulationReference' },
    style: { background: '#fff2de', border: '1px solid #e0ad66', color: '#6a4a1d', borderRadius: 12 },
  },
  {
    id: 'collection-step',
    position: { x: 100, y: 310 },
    data: { label: 'CollectionWorkflowStep' },
    style: { background: '#fde5e5', border: '1px solid #d18f8f', color: '#6b2727', borderRadius: 12 },
  },
]

const graphEdges: Edge[] = [
  {
    id: 'edge-customer-loan',
    source: 'customer-profile',
    target: 'loan-agreement',
    label: 'owns',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#5d8c74' },
    style: { stroke: '#5d8c74' },
  },
  {
    id: 'edge-loan-policy',
    source: 'loan-agreement',
    target: 'policy-rule',
    label: 'governedBy',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#56758f' },
    style: { stroke: '#56758f' },
  },
  {
    id: 'edge-policy-regulation',
    source: 'policy-rule',
    target: 'regulation-reference',
    label: 'constrainedBy',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#b67f2f' },
    style: { stroke: '#b67f2f' },
  },
  {
    id: 'edge-collection-customer',
    source: 'collection-step',
    target: 'customer-profile',
    label: 'appliesTo',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#a15858' },
    style: { stroke: '#a15858' },
  },
]

function statusBadgeClass(status: string) {
  if (status === 'Approved' || status === 'Active') {
    return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  }
  if (status === 'Under Review' || status === 'Needs Review' || status === 'AI Suggested') {
    return 'bg-amber-100 text-amber-700 border-amber-200'
  }
  if (status === 'Deprecated' || status === 'Rejected' || status === 'Archived') {
    return 'bg-rose-100 text-rose-700 border-rose-200'
  }
  return 'bg-slate-100 text-slate-700 border-slate-200'
}

function confidenceBand(value: number): ConfidenceBand {
  if (value >= 0.85) {
    return 'high'
  }
  if (value >= 0.7) {
    return 'medium'
  }
  return 'low'
}

function compareValues(a: string | number, b: string | number, direction: SortDirection) {
  if (typeof a === 'number' && typeof b === 'number') {
    return direction === 'asc' ? a - b : b - a
  }
  return direction === 'asc'
    ? String(a).localeCompare(String(b))
    : String(b).localeCompare(String(a))
}

function SortableHeader({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
}: {
  label: string
  sortKey: string
  activeKey: string
  direction: SortDirection
  onSort: (key: string) => void
}) {
  const isActive = sortKey === activeKey

  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className="inline-flex items-center gap-1.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600 hover:text-slate-900"
    >
      <span>{label}</span>
      {isActive ? (
        direction === 'asc' ? (
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

function ChipFilterGroup({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string
  options: FilterChip<string>[]
  selected: string[]
  onToggle: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option.value)
          return (
            <button
              key={`${title}-${option.value}`}
              type="button"
              onClick={() => onToggle(option.value)}
              className={cn(
                'rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all',
                isSelected
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700 shadow-sm'
                  : 'border-slate-200 bg-white/80 text-slate-600 hover:border-slate-300 hover:text-slate-800',
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

function EmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center">
      <FileSearch className="mx-auto h-8 w-8 text-slate-400" />
      <p className="mt-3 text-sm font-semibold text-slate-700">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  )
}

export function KnowledgeStructuringOntologyManagementPage() {
  const [activeSection, setActiveSection] = useState<WorkspaceSection>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPanelVisible, setFilterPanelVisible] = useState(true)

  const [statusSelected, setStatusSelected] = useState<string[]>(['all'])
  const [objectSelected, setObjectSelected] = useState<string[]>(['taxonomy', 'entity'])
  const [domainSelected, setDomainSelected] = useState<string[]>(['loan', 'compliance', 'customer'])
  const [taggingModeSelected, setTaggingModeSelected] = useState<string[]>(['ai-suggested', 'needs-review'])
  const [graphScopeSelected, setGraphScopeSelected] = useState<string[]>(['full-graph'])
  const [timeSelected, setTimeSelected] = useState<string[]>(['30-days'])

  const [taxonomySortKey, setTaxonomySortKey] = useState<TaxonomySortKey>('updatedAt')
  const [taxonomySortDirection, setTaxonomySortDirection] = useState<SortDirection>('desc')
  const [taggingSortKey, setTaggingSortKey] = useState<TaggingSortKey>('confidence')
  const [taggingSortDirection, setTaggingSortDirection] = useState<SortDirection>('desc')

  const [selectedTaxonomyId, setSelectedTaxonomyId] = useState<string>(taxonomyRows[0].id)
  const [selectedEntityId, setSelectedEntityId] = useState<string>(ontologyEntities[0].id)
  const [selectedTaggingId, setSelectedTaggingId] = useState<string>(semanticTagRows[0].id)
  const [selectedDrawerTitle, setSelectedDrawerTitle] = useState('Ontology Coverage Health')

  const handleChipToggle = (
    current: string[],
    value: string,
    setState: (values: string[]) => void,
  ) => {
    if (value === 'all') {
      setState(['all'])
      return
    }

    const clearedAll = current.filter((item) => item !== 'all')
    const alreadySelected = clearedAll.includes(value)
    const next = alreadySelected ? clearedAll.filter((item) => item !== value) : [...clearedAll, value]

    setState(next.length ? next : ['all'])
  }

  const handleTaxonomySort = (key: string) => {
    const typedKey = key as TaxonomySortKey
    if (typedKey === taxonomySortKey) {
      setTaxonomySortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }
    setTaxonomySortKey(typedKey)
    setTaxonomySortDirection('asc')
  }

  const handleTaggingSort = (key: string) => {
    const typedKey = key as TaggingSortKey
    if (typedKey === taggingSortKey) {
      setTaggingSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }
    setTaggingSortKey(typedKey)
    setTaggingSortDirection('asc')
  }

  const taxonomyFiltered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const rows = taxonomyRows.filter((row) => {
      if (!query) {
        return true
      }
      const payload = [
        row.name,
        row.domain,
        row.owner,
        row.version,
        row.hierarchy.join(' '),
      ]
        .join(' ')
        .toLowerCase()
      return payload.includes(query)
    })

    return [...rows].sort((a, b) => {
      const mapper: Record<TaxonomySortKey, string | number> = {
        name: a.name,
        domain: a.domain,
        status: a.status,
        categories: a.categories,
        linkedAssets: a.linkedAssets,
        version: a.version,
        updatedAt: a.updatedAt,
      }
      const compareMap: Record<TaxonomySortKey, string | number> = {
        name: b.name,
        domain: b.domain,
        status: b.status,
        categories: b.categories,
        linkedAssets: b.linkedAssets,
        version: b.version,
        updatedAt: b.updatedAt,
      }

      return compareValues(mapper[taxonomySortKey], compareMap[taxonomySortKey], taxonomySortDirection)
    })
  }, [searchQuery, taxonomySortDirection, taxonomySortKey])

  const taggingFiltered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const rows = semanticTagRows.filter((row) => {
      if (!query) {
        return true
      }
      const payload = [
        row.assetTitle,
        row.suggestedTags.join(' '),
        row.linkedEntity,
        row.detectedConcept,
        row.source,
      ]
        .join(' ')
        .toLowerCase()

      return payload.includes(query)
    })

    return [...rows].sort((a, b) => {
      const mapper: Record<TaggingSortKey, string | number> = {
        assetTitle: a.assetTitle,
        confidence: a.confidence,
        status: a.status,
        reviewOwner: a.reviewOwner,
        lastReviewed: a.lastReviewed,
      }
      const compareMap: Record<TaggingSortKey, string | number> = {
        assetTitle: b.assetTitle,
        confidence: b.confidence,
        status: b.status,
        reviewOwner: b.reviewOwner,
        lastReviewed: b.lastReviewed,
      }

      return compareValues(mapper[taggingSortKey], compareMap[taggingSortKey], taggingSortDirection)
    })
  }, [searchQuery, taggingSortDirection, taggingSortKey])

  const selectedTaxonomy = taxonomyRows.find((row) => row.id === selectedTaxonomyId) ?? taxonomyRows[0]
  const selectedEntity = ontologyEntities.find((row) => row.id === selectedEntityId) ?? ontologyEntities[0]
  const selectedTagging = semanticTagRows.find((row) => row.id === selectedTaggingId) ?? semanticTagRows[0]

  const renderOverviewSection = () => {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Taxonomy Distribution by Domain</h3>
                <p className="text-xs text-slate-500">Coverage status for enterprise category governance and controlled vocabulary scope.</p>
              </div>
              <Badge className="bg-slate-100 text-slate-700 border-slate-200">Coverage 86%</Badge>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taxonomyDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="domain" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="taxonomies" radius={[6, 6, 0, 0]} fill="#3f8f6b" />
                  <Bar dataKey="categories" radius={[6, 6, 0, 0]} fill="#8ea7bd" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Entity and Relationship Growth</h3>
                <p className="text-xs text-slate-500">Ontology model growth trend and semantic expansion trajectory.</p>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Trending Up</Badge>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="entities" stroke="#3f8f6b" strokeWidth={2.2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="relationships" stroke="#5d748f" strokeWidth={2.2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Relationship Density Snapshot</h3>
            <p className="text-xs text-slate-500">How connected each domain is inside the enterprise knowledge graph.</p>
            <div className="h-56 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={relationshipDensity} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={2}>
                    {relationshipDensity.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">Semantic Tagging Activity</h3>
            <div className="grid grid-cols-1 gap-2.5 text-xs">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-slate-500">Review Queue</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">63 assets</p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-emerald-700">Approved in 24h</p>
                <p className="mt-1 text-lg font-semibold text-emerald-900">42 tags</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-amber-700">Low Confidence Suggestions</p>
                <p className="mt-1 text-lg font-semibold text-amber-900">17 items</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">Knowledge Structure Maturity</h3>
            <div className="space-y-2 text-xs">
              {[
                { label: 'Taxonomy Governance', value: 92 },
                { label: 'Ontology Completeness', value: 84 },
                { label: 'Relationship Traceability', value: 87 },
                { label: 'Semantic Consistency', value: 78 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex items-center justify-between text-slate-600">
                    <span>{item.label}</span>
                    <span className="font-medium text-slate-800">{item.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500" style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <div className="flex items-start gap-2">
                <CircleAlert className="h-4 w-4 mt-0.5" />
                <p>Semantic inconsistency warning: 2 relationship definitions are missing confidence source attribution.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Recent Semantic Modeling Timeline</h3>
          <p className="text-xs text-slate-500">Traceable activity feed for taxonomy, ontology, and semantic tagging governance.</p>
          <div className="mt-4 space-y-3">
            {recentSemanticActivity.map((item) => (
              <div key={`${item.time}-${item.actor}`} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900">{item.actor}</p>
                  <span className="text-slate-500">{item.time}</span>
                </div>
                <p className="mt-0.5 text-slate-700">{item.action}</p>
                <p className="mt-1 text-slate-500">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderTaxonomySection = () => {
    if (!taxonomyFiltered.length) {
      return (
        <EmptyState
          title="No taxonomy records match the current search and filter context"
          description="Refine your search term or adjust active chips to restore taxonomy visibility."
        />
      )
    }

    return (
      <div className="space-y-5">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-xs">
              <thead className="bg-slate-50/90 backdrop-blur sticky top-0 z-10">
                <tr className="border-b border-slate-200">
                  <th className="px-3 py-2 text-left"><SortableHeader label="Taxonomy Name" sortKey="name" activeKey={taxonomySortKey} direction={taxonomySortDirection} onSort={handleTaxonomySort} /></th>
                  <th className="px-3 py-2 text-left"><SortableHeader label="Domain" sortKey="domain" activeKey={taxonomySortKey} direction={taxonomySortDirection} onSort={handleTaxonomySort} /></th>
                  <th className="px-3 py-2 text-left"><SortableHeader label="Status" sortKey="status" activeKey={taxonomySortKey} direction={taxonomySortDirection} onSort={handleTaxonomySort} /></th>
                  <th className="px-3 py-2 text-right"><SortableHeader label="Categories" sortKey="categories" activeKey={taxonomySortKey} direction={taxonomySortDirection} onSort={handleTaxonomySort} /></th>
                  <th className="px-3 py-2 text-right"><SortableHeader label="Linked Assets" sortKey="linkedAssets" activeKey={taxonomySortKey} direction={taxonomySortDirection} onSort={handleTaxonomySort} /></th>
                  <th className="px-3 py-2 text-left"><SortableHeader label="Version" sortKey="version" activeKey={taxonomySortKey} direction={taxonomySortDirection} onSort={handleTaxonomySort} /></th>
                  <th className="px-3 py-2 text-left"><SortableHeader label="Last Updated" sortKey="updatedAt" activeKey={taxonomySortKey} direction={taxonomySortDirection} onSort={handleTaxonomySort} /></th>
                  <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {taxonomyFiltered.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      'border-b border-slate-100 hover:bg-emerald-50/40 transition-colors',
                      row.id === selectedTaxonomyId && 'bg-emerald-50/70',
                    )}
                  >
                    <td className="px-3 py-2.5">
                      <button
                        className="text-left"
                        onClick={() => {
                          setSelectedTaxonomyId(row.id)
                          setSelectedDrawerTitle(`Taxonomy Detail: ${row.name}`)
                        }}
                      >
                        <p className="font-semibold text-slate-900">{row.name}</p>
                        <p className="text-[11px] text-slate-500">{row.owner}</p>
                      </button>
                    </td>
                    <td className="px-3 py-2.5"><Badge className="bg-slate-100 text-slate-700 border-slate-200">{row.domain}</Badge></td>
                    <td className="px-3 py-2.5"><Badge className={cn('border', statusBadgeClass(row.status))}>{row.status}</Badge></td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-slate-700">{row.categories}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-slate-700">{row.linkedAssets}</td>
                    <td className="px-3 py-2.5 text-slate-700">{row.version}</td>
                    <td className="px-3 py-2.5 text-slate-700">{row.updatedAt}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap gap-1.5">
                        {['Open Taxonomy Detail', 'Edit Taxonomy', 'Add Category', 'Assign Domain', 'View Linked Content', 'Archive Taxonomy'].map((action) => (
                          <button
                            key={`${row.id}-${action}`}
                            type="button"
                            onClick={() => setSelectedDrawerTitle(`${action}: ${row.name}`)}
                            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-600 hover:border-slate-300 hover:text-slate-800"
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
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Hierarchical Category Tree</h3>
            <p className="text-xs text-slate-500">Structured taxonomy hierarchy with ownership and lifecycle awareness.</p>
            <div className="mt-3 space-y-2">
              {selectedTaxonomy.hierarchy.map((node, index) => (
                <div key={node} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700" style={{ marginLeft: `${index * 16}px` }}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{node}</span>
                    <Badge className="bg-white border-slate-200 text-slate-600">Level {index + 1}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Taxonomy Lifecycle Awareness</h3>
            <div className="mt-3 space-y-2 text-xs">
              {[
                { label: 'Draft', value: 3, color: 'bg-slate-500' },
                { label: 'Active', value: 9, color: 'bg-emerald-600' },
                { label: 'Under Review', value: 2, color: 'bg-amber-500' },
                { label: 'Approved', value: 3, color: 'bg-green-600' },
                { label: 'Deprecated', value: 1, color: 'bg-rose-600' },
                { label: 'Archived', value: 1, color: 'bg-slate-400' },
              ].map((status) => (
                <div key={status.label} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className={cn('h-2.5 w-2.5 rounded-full', status.color)} />
                    <span className="text-slate-700">{status.label}</span>
                  </div>
                  <span className="font-semibold text-slate-900 tabular-nums">{status.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderOntologySection = () => {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {ontologyEntities.map((entity) => (
            <button
              key={entity.id}
              onClick={() => {
                setSelectedEntityId(entity.id)
                setSelectedDrawerTitle(`Entity Detail: ${entity.name}`)
              }}
              className={cn(
                'rounded-2xl border p-4 text-left transition-all shadow-sm',
                entity.id === selectedEntityId
                  ? 'border-emerald-300 bg-emerald-50/70'
                  : 'border-slate-200 bg-white/80 hover:border-slate-300',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">{entity.name}</p>
                <Badge className={cn('border', statusBadgeClass(entity.status))}>{entity.status}</Badge>
              </div>
              <p className="mt-1 text-xs text-slate-500">{entity.entityType} • {entity.domain}</p>
              <p className="mt-3 text-[11px] text-slate-600">Owner: {entity.owner}</p>
              <p className="mt-1 text-[11px] text-slate-600">Version: {entity.version} • Modified: {entity.modifiedAt}</p>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-5">
          <div className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Ontology Modeling Canvas</h3>
                <p className="text-xs text-slate-500">Entity hierarchy and relationship mapping lines for machine-readable structure design.</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['Open Entity Detail', 'Create New Entity', 'Define Relationship', 'Edit Attributes', 'View Ontology Version', 'Publish Ontology Update'].map((action) => (
                  <button
                    key={action}
                    onClick={() => setSelectedDrawerTitle(action)}
                    className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-600 hover:border-slate-300"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[360px] overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <ReactFlow
                nodes={graphNodes}
                edges={graphEdges}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable
                proOptions={{ hideAttribution: true }}
                onNodeClick={(_, node) => {
                  const mappedEntity = ontologyEntities.find((entity) => entity.name === node.data.label)
                  if (mappedEntity) {
                    setSelectedEntityId(mappedEntity.id)
                    setSelectedDrawerTitle(`Entity Detail: ${mappedEntity.name}`)
                  }
                }}
              >
                <Background color="#d7e2ea" gap={20} />
                <MiniMap pannable zoomable className="!bg-white !border !border-slate-200" />
                <Controls showInteractive={false} />
              </ReactFlow>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Attribute and Semantic Rule Panel</h3>
            <p className="text-xs text-slate-500">Selected entity metadata, constraints, and version-aware semantic rule blocks.</p>
            <div className="mt-3 space-y-2 text-xs">
              <p className="font-semibold text-slate-800">Attributes</p>
              {selectedEntity.attributes.map((attribute) => (
                <div key={attribute} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-slate-700">
                  {attribute}
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 text-xs">
              <p className="font-semibold text-slate-800">Semantic Rule Blocks</p>
              {selectedEntity.relationships.map((relation) => (
                <div key={relation} className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-emerald-800">
                  {relation}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderGraphSection = () => {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-5">
          <div className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Interactive Knowledge Graph Explorer</h3>
                <p className="text-xs text-slate-500">Zoom, inspect node metadata, trace paths, and explore semantic subgraphs by domain scope.</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['Open Node Detail', 'Trace Relationship Path', 'Expand Connected Nodes', 'Filter by Domain', 'Open Related Knowledge Asset', 'Export Graph View'].map((action) => (
                  <button
                    key={action}
                    onClick={() => setSelectedDrawerTitle(action)}
                    className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-600 hover:border-slate-300"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[440px] overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <ReactFlow
                nodes={graphNodes}
                edges={graphEdges}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                nodesConnectable={false}
                proOptions={{ hideAttribution: true }}
                onNodeClick={(_, node) => setSelectedDrawerTitle(`Node Detail: ${String(node.data.label)}`)}
                onEdgeClick={(_, edge) => setSelectedDrawerTitle(`Relationship Detail: ${edge.label || edge.id}`)}
              >
                <Background color="#d7e2ea" gap={16} />
                <MiniMap pannable zoomable className="!bg-white !border !border-slate-200" />
                <Controls showInteractive />
              </ReactFlow>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">Path Tracing and Connectivity</h3>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
              <p className="text-slate-500">Connectivity Score</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">91.4</p>
              <p className="text-slate-500">Graph integrity and link completeness across active domains.</p>
            </div>

            <div className="space-y-2">
              {[
                {
                  title: 'Path: CustomerProfile → LoanAgreement → PolicyRule',
                  detail: 'Traceability source: policy-model-v3, evidence confidence 0.93',
                },
                {
                  title: 'Path: CollectionWorkflowStep → CustomerProfile',
                  detail: 'Traceability source: collection-procedure-v2, evidence confidence 0.77',
                },
                {
                  title: 'Subgraph: Compliance obligations linked to loan products',
                  detail: '34 nodes, 57 edges, stale mapping warning in 2 nodes',
                },
              ].map((pathCard) => (
                <div key={pathCard.title} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs">
                  <p className="font-semibold text-slate-800">{pathCard.title}</p>
                  <p className="mt-1 text-slate-500">{pathCard.detail}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <div className="flex items-start gap-2">
                <CircleAlert className="h-4 w-4 mt-0.5" />
                <p>Semantic inconsistency detected in 2 edges. Relationship confidence source needs verification before publication.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderTaggingSection = () => {
    if (!taggingFiltered.length) {
      return (
        <EmptyState
          title="No semantic tagging records match the current filters"
          description="Try broadening graph scope, tagging mode, or search keyword to recover suggestions."
        />
      )
    }

    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {[
            {
              title: 'AI Suggestion Queue',
              value: '63',
              subtitle: 'Pending semantic review',
              color: 'border-amber-200 bg-amber-50 text-amber-900',
            },
            {
              title: 'Approval Throughput (24h)',
              value: '42',
              subtitle: 'Approved and linked to entities',
              color: 'border-emerald-200 bg-emerald-50 text-emerald-900',
            },
            {
              title: 'Manual Override Ratio',
              value: '17%',
              subtitle: 'Manual adjustment from AI suggestion',
              color: 'border-slate-200 bg-slate-50 text-slate-900',
            },
          ].map((card) => (
            <div key={card.title} className={cn('rounded-2xl border p-4 shadow-sm', card.color)}>
              <p className="text-xs">{card.title}</p>
              <p className="mt-1 text-2xl font-semibold">{card.value}</p>
              <p className="mt-1 text-xs opacity-80">{card.subtitle}</p>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/85 shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-xs">
              <thead className="bg-slate-50/90">
                <tr className="border-b border-slate-200">
                  <th className="px-3 py-2 text-left"><SortableHeader label="Knowledge Asset" sortKey="assetTitle" activeKey={taggingSortKey} direction={taggingSortDirection} onSort={handleTaggingSort} /></th>
                  <th className="px-3 py-2 text-left">Suggested Tags</th>
                  <th className="px-3 py-2 text-left"><SortableHeader label="Confidence" sortKey="confidence" activeKey={taggingSortKey} direction={taggingSortDirection} onSort={handleTaggingSort} /></th>
                  <th className="px-3 py-2 text-left">Tag Source</th>
                  <th className="px-3 py-2 text-left"><SortableHeader label="Approval Status" sortKey="status" activeKey={taggingSortKey} direction={taggingSortDirection} onSort={handleTaggingSort} /></th>
                  <th className="px-3 py-2 text-left"><SortableHeader label="Review Owner" sortKey="reviewOwner" activeKey={taggingSortKey} direction={taggingSortDirection} onSort={handleTaggingSort} /></th>
                  <th className="px-3 py-2 text-left">Linked Entity</th>
                  <th className="px-3 py-2 text-left"><SortableHeader label="Last Reviewed" sortKey="lastReviewed" activeKey={taggingSortKey} direction={taggingSortDirection} onSort={handleTaggingSort} /></th>
                  <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {taggingFiltered.map((row) => {
                  const band = confidenceBand(row.confidence)
                  return (
                    <tr
                      key={row.id}
                      className={cn(
                        'border-b border-slate-100 hover:bg-emerald-50/40 transition-colors',
                        selectedTaggingId === row.id && 'bg-emerald-50/60',
                      )}
                    >
                      <td className="px-3 py-2.5">
                        <button
                          type="button"
                          className="text-left"
                          onClick={() => {
                            setSelectedTaggingId(row.id)
                            setSelectedDrawerTitle(`Tagging Detail: ${row.assetTitle}`)
                          }}
                        >
                          <p className="font-semibold text-slate-900">{row.assetTitle}</p>
                          <p className="text-[11px] text-slate-500">{row.detectedConcept}</p>
                        </button>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          {row.suggestedTags.map((tag) => (
                            <Badge key={`${row.id}-${tag}`} className="bg-slate-100 border-slate-200 text-slate-700">{tag}</Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 min-w-[140px]">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-600">
                            <span>{Math.round(row.confidence * 100)}%</span>
                            <span className={cn(
                              'font-semibold',
                              band === 'high' ? 'text-emerald-700' : band === 'medium' ? 'text-amber-700' : 'text-rose-700',
                            )}>
                              {band.toUpperCase()}
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-100">
                            <div
                              className={cn(
                                'h-1.5 rounded-full',
                                band === 'high' ? 'bg-emerald-600' : band === 'medium' ? 'bg-amber-500' : 'bg-rose-500',
                              )}
                              style={{ width: `${Math.round(row.confidence * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-slate-600">{row.source}</td>
                      <td className="px-3 py-2.5"><Badge className={cn('border', statusBadgeClass(row.status))}>{row.status}</Badge></td>
                      <td className="px-3 py-2.5 text-slate-700">{row.reviewOwner}</td>
                      <td className="px-3 py-2.5 text-slate-700">{row.linkedEntity}</td>
                      <td className="px-3 py-2.5 text-slate-700">{row.lastReviewed}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-wrap gap-1.5">
                          {['Approve Tag', 'Reject Tag', 'Edit Tag', 'Link to Entity', 'View Tagging Evidence', 'Open Related Knowledge Asset'].map((action) => (
                            <button
                              key={`${row.id}-${action}`}
                              type="button"
                              onClick={() => setSelectedDrawerTitle(`${action}: ${row.assetTitle}`)}
                              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-600 hover:border-slate-300"
                            >
                              {action}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">AI Suggestion Evidence Panel</h3>
            <p className="text-xs text-slate-500">Source traceability and confidence explanation for enterprise-safe semantic enrichment.</p>
            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 space-y-2">
              <p><span className="font-semibold">Selected Asset:</span> {selectedTagging.assetTitle}</p>
              <p><span className="font-semibold">Detected Concept:</span> {selectedTagging.detectedConcept}</p>
              <p><span className="font-semibold">Source:</span> {selectedTagging.source}</p>
              <p><span className="font-semibold">Evidence:</span> Mentioned in policy section 4.2 with direct entity reference and compliance context.</p>
              <p><span className="font-semibold">Tagging History:</span> 3 revisions, 1 manual override, latest reviewer decision trace available.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Tag History Drawer Preview</h3>
            <div className="mt-3 space-y-2 text-xs">
              {[
                '2026-04-14 09:12 • AI suggested tag PolicyControl (confidence 0.92)',
                '2026-04-14 09:18 • Reviewer adjusted tag scope to LoanRiskPolicy',
                '2026-04-14 09:25 • Pending approval in semantic review queue',
              ].map((item) => (
                <div key={item} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderSection = () => {
    if (activeSection === 'overview') {
      return renderOverviewSection()
    }
    if (activeSection === 'taxonomy') {
      return renderTaxonomySection()
    }
    if (activeSection === 'ontology') {
      return renderOntologySection()
    }
    if (activeSection === 'graph') {
      return renderGraphSection()
    }
    return renderTaggingSection()
  }

  return (
    <div className="space-y-6 pb-4">
      <Breadcrumb
        items={[
          { label: 'Knowledge Repository & Content Management', href: '/knowledge' },
          { label: 'Knowledge Structuring & Ontology Management' },
        ]}
      />

      <PageHeader
        title="Knowledge Structuring & Ontology Management"
        description="Enterprise semantic intelligence workspace to structure taxonomy, model ontology, govern semantic tags, and operationalize machine-readable knowledge at scale."
        right={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className={cn(
                'h-10 w-10 rounded-lg border',
                filterPanelVisible && 'ring-1 ring-emerald-200 bg-emerald-50',
              )}
              aria-label="Hide Search and Filters panel"
              title="Hide Search and Filters panel"
              onClick={() => setFilterPanelVisible((prev) => !prev)}
            >
              <Filter className="h-5 w-5" strokeWidth={2} />
            </Button>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-lg border" aria-label="Export" title="Export semantic workspace view">
              <ArrowUpDown className="h-5 w-5" strokeWidth={2} />
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon
          return (
            <button
              key={card.label}
              onClick={() => setSelectedDrawerTitle(`KPI Drill-down: ${card.label}`)}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-emerald-50/70 to-transparent" />
              <div className="relative">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">{card.label}</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{card.metric}</p>
                <p className="mt-1 text-xs text-slate-600 leading-snug">{card.description}</p>
                <p className="mt-2 text-[11px] font-medium text-emerald-700">{card.trend}</p>
              </div>
              <Icon className="absolute bottom-3 right-3 h-8 w-8 text-emerald-300/80 transition-all group-hover:text-emerald-400" />
            </button>
          )
        })}
      </div>

      {filterPanelVisible && (
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm space-y-4">
          <div className="relative max-w-[680px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-10 w-full pl-9 text-sm"
              placeholder="Search taxonomy name, category, entity, relationship type, graph node, semantic tag, domain, knowledge asset, or ontology version"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <ChipFilterGroup
              title="Status"
              options={statusFilterOptions}
              selected={statusSelected}
              onToggle={(value) => handleChipToggle(statusSelected, value, setStatusSelected)}
            />
            <ChipFilterGroup
              title="Object Type"
              options={objectFilterOptions}
              selected={objectSelected}
              onToggle={(value) => handleChipToggle(objectSelected, value, setObjectSelected)}
            />
            <ChipFilterGroup
              title="Domain"
              options={domainFilterOptions}
              selected={domainSelected}
              onToggle={(value) => handleChipToggle(domainSelected, value, setDomainSelected)}
            />
            <ChipFilterGroup
              title="Tagging Mode"
              options={taggingModeOptions}
              selected={taggingModeSelected}
              onToggle={(value) => handleChipToggle(taggingModeSelected, value, setTaggingModeSelected)}
            />
            <ChipFilterGroup
              title="Graph Scope"
              options={graphScopeOptions}
              selected={graphScopeSelected}
              onToggle={(value) => handleChipToggle(graphScopeSelected, value, setGraphScopeSelected)}
            />
            <ChipFilterGroup
              title="Time"
              options={timeFilterOptions}
              selected={timeSelected}
              onToggle={(value) => handleChipToggle(timeSelected, value, setTimeSelected)}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)_320px] gap-5 items-start">
        <aside className="xl:sticky xl:top-16 rounded-2xl border border-slate-200 bg-white/85 p-3 shadow-sm">
          <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Semantic Workspace Navigator</p>
          <div className="space-y-1.5">
            {sectionItems.map((item) => {
              const Icon = item.icon
              const active = item.key === activeSection
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveSection(item.key)}
                  className={cn(
                    'w-full rounded-xl border px-3 py-2.5 text-left transition-all',
                    active
                      ? 'border-emerald-300 bg-emerald-50/80 shadow-sm'
                      : 'border-transparent hover:border-slate-200 hover:bg-slate-50',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <span className={cn('mt-0.5 rounded-md p-1.5', active ? 'bg-white border border-emerald-200' : 'bg-white border border-slate-200')}>
                        <Icon className={cn('h-4 w-4', active ? 'text-emerald-700' : 'text-slate-600')} />
                      </span>
                      <div>
                        <p className={cn('text-xs font-semibold', active ? 'text-emerald-900' : 'text-slate-800')}>{item.label}</p>
                        <p className="mt-0.5 text-[11px] text-slate-500 leading-snug">{item.description}</p>
                      </div>
                    </div>
                    {typeof item.count === 'number' && (
                      <Badge className={cn('border px-2 py-0.5 text-[10px] tabular-nums', active ? 'border-emerald-200 bg-white text-emerald-700' : 'border-slate-200 bg-white text-slate-600')}>
                        {item.count}
                      </Badge>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </aside>

        <section className="min-w-0">{renderSection()}</section>

        <aside className="xl:sticky xl:top-16 rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-900">Detail Drawer</h3>
            <Badge className="bg-slate-100 border-slate-200 text-slate-600">Live</Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500">Operational context panel for selected semantic object, action, or KPI drill-down.</p>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold text-slate-800">{selectedDrawerTitle}</p>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              This drawer provides traceability, ownership, status, confidence source, and relationship evidence for the selected object.
            </p>
          </div>

          <div className="mt-4 space-y-2 text-xs">
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              <p className="font-semibold text-slate-800">Selected Taxonomy</p>
              <p className="mt-1 text-slate-600">{selectedTaxonomy.name}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              <p className="font-semibold text-slate-800">Selected Entity</p>
              <p className="mt-1 text-slate-600">{selectedEntity.name} ({selectedEntity.version})</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              <p className="font-semibold text-slate-800">Selected Tagging Item</p>
              <p className="mt-1 text-slate-600">{selectedTagging.assetTitle}</p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            <div className="flex items-start gap-2">
              <CircleAlert className="h-4 w-4 mt-0.5" />
              <p>Review queue contains low-confidence relationship mappings that require owner validation before ontology publication.</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {['Compare Ontology Versions', 'Open Relationship Source', 'Escalate for Governance Review'].map((action) => (
              <button
                key={action}
                type="button"
                className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-600 hover:border-slate-300"
              >
                {action}
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
